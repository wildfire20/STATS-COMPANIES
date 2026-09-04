import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { addShopSeo } from "./shopSeo";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  const indexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

  app.use("*", (req, res) => {
    const pathname = new URL(req.originalUrl, "http://localhost").pathname;
    res
      .status(200)
      .type("html")
      .send(addShopSeo(indexHtml, pathname));
  });
}
