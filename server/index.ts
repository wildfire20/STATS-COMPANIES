import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { CLERK_PROXY_PATH, clerkProxyMiddleware, getClerkProxyHost } from "./middlewares/clerkProxyMiddleware";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

function requestHost(req: Request): string | undefined {
  const forwardedHost = req.header("x-forwarded-host")?.split(",")[0]?.trim();
  return forwardedHost || req.header("host")?.trim();
}

function requestProtocol(req: Request): string {
  return req.header("x-forwarded-proto")?.split(",")[0]?.trim() || req.protocol;
}

function developmentOrigins(): Set<string> {
  const domains = [process.env.REPLIT_DEV_DOMAIN, process.env.REPLIT_DOMAINS]
    .flatMap((value) => value?.split(",") ?? [])
    .map((value) => value.trim())
    .filter(Boolean);
  const origins = new Set<string>();
  for (const domain of domains) {
    try {
      const url = new URL(domain.includes("://") ? domain : `https://${domain}`);
      if (url.pathname === "/" && !url.search && !url.hash) origins.add(url.origin);
    } catch {
      // Ignore malformed environment configuration rather than widening CORS.
    }
  }
  return origins;
}

const allowedDevelopmentOrigins = developmentOrigins();

function isAllowedCorsOrigin(req: Request, origin: string | undefined): boolean {
  if (!origin) return true;
  try {
    const parsedOrigin = new URL(origin);
    if (parsedOrigin.origin !== origin) return false;
    const host = requestHost(req);
    if (host && origin === `${requestProtocol(req)}://${host}`) return true;
    return allowedDevelopmentOrigins.has(origin);
  } catch {
    return false;
  }
}

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
app.use(cors((req, callback) => callback(null, {
  credentials: true,
  origin: isAllowedCorsOrigin(req, req.header("origin")),
})));
app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
