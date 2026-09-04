import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, writeFile } from "fs/promises";

const productionUrl = "https://www.statscompanies.co.za/";
const socialImageUrl = `${productionUrl}social-preview.png`;
const logoUrl = `${productionUrl}logo.png`;
const title = "STATS Companies | Digital Printing, Photography & Videography in Pretoria";
const description = "Transform your brand with professional digital printing, photography, videography, and digital marketing services in Pretoria, South Africa.";
const leftAngle = String.fromCharCode(60);
const rightAngle = String.fromCharCode(62);

function element(name: string, attributes: Record<string, string>) {
  const serialized = Object.entries(attributes)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(" ");
  return `${leftAngle}${name} ${serialized} /${rightAngle}`;
}

function getProductionHead() {
  const tags = [
    element("meta", { property: "og:type", content: "website" }),
    element("meta", { property: "og:url", content: productionUrl }),
    element("meta", { property: "og:title", content: title }),
    element("meta", { property: "og:description", content: description }),
    element("meta", { property: "og:image", content: socialImageUrl }),
    element("meta", { property: "og:image:secure_url", content: socialImageUrl }),
    element("meta", { property: "og:image:type", content: "image/png" }),
    element("meta", { property: "og:image:width", content: "1200" }),
    element("meta", { property: "og:image:height", content: "630" }),
    element("meta", { property: "og:locale", content: "en_ZA" }),
    element("meta", { property: "og:site_name", content: "STATS Companies" }),
    element("meta", { name: "twitter:card", content: "summary_large_image" }),
    element("meta", { name: "twitter:url", content: productionUrl }),
    element("meta", { name: "twitter:title", content: title }),
    element("meta", { name: "twitter:description", content: description }),
    element("meta", { name: "twitter:image", content: socialImageUrl }),
    element("link", { rel: "canonical", href: productionUrl }),
    element("link", { rel: "icon", href: "/favicon.ico", sizes: "any" }),
    element("link", { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" }),
    element("link", { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192x192.png" }),
    element("link", { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" }),
    element("link", { rel: "manifest", href: "/site.webmanifest" }),
  ];
  const organization = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${productionUrl}#organization`,
    name: "STATS Companies",
    url: productionUrl,
    logo: { "@type": "ImageObject", url: logoUrl, width: 512, height: 512 },
    image: socialImageUrl,
  });
  tags.push(`${leftAngle}script type="application/ld+json"${rightAngle}${organization}${leftAngle}/script${rightAngle}`);
  return tags.map((tag) => `    ${tag}`).join("\n");
}

async function applyProductionMetadata() {
  const indexPath = "dist/public/index.html";
  let html = await readFile(indexPath, "utf-8");
  const marker = "\\x3c";
  html = html
    .replace(new RegExp(`\\s*${marker}meta property="og:[^"]+"[^>]*\\/>`, "g"), "")
    .replace(new RegExp(`\\s*${marker}meta (?:property|name)="twitter:[^"]+"[^>]*\\/>`, "g"), "")
    .replace(new RegExp(`\\s*${marker}link rel="canonical"[^>]*\\/>`, "g"), "")
    .replace(new RegExp(`\\s*${marker}link rel="(?:shortcut )?icon"[^>]*\\/>`, "g"), "")
    .replace(new RegExp(`\\s*${marker}link rel="apple-touch-icon"[^>]*\\/>`, "g"), "")
    .replace(new RegExp(`\\s*${marker}link rel="manifest"[^>]*\\/>`, "g"), "")
    .replace(new RegExp(`\\s*${marker}script type="application/ld\\+json">[\\s\\S]*?${marker}\\/script>`, "g"), "")
    .replace(`${leftAngle}/head${rightAngle}`, `${getProductionHead()}\n  ${leftAngle}/head${rightAngle}`);
  await writeFile(indexPath, html);
}

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();
  await applyProductionMetadata();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    target: "node20",
    outfile: "dist/index.cjs",
    sourcemap: true,
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: false,
    external: allDeps,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
