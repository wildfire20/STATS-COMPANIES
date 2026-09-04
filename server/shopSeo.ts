const shopUrl = "https://www.statscompanies.co.za/shop";
const shopTitle = "Shop Printing Products in Pretoria | STATS Companies";
const shopDescription =
  "Shop high-quality digital printing products from STATS Companies in Pretoria, including custom print, apparel, and corporate gift options.";
const leftAngle = String.fromCharCode(60);
const rightAngle = String.fromCharCode(62);

function element(name: string, attributes: Record<string, string>, content?: string) {
  const serialized = Object.entries(attributes)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(" ");
  const opening = `${leftAngle}${name}${serialized ? ` ${serialized}` : ""}${rightAngle}`;
  return content === undefined
    ? opening
    : `${opening}${content}${leftAngle}/${name}${rightAngle}`;
}

export function addShopSeo(html: string, pathname: string): string {
  if (pathname !== "/shop" && pathname !== "/shop/") return html;

  const fallback = element(
    "main",
    { "aria-label": "STATS Companies shop" },
    [
      element("h1", {}, "Shop"),
      element("p", {}, "Browse high-quality digital printing products from STATS Companies in Pretoria, South Africa."),
      element("p", {}, "Explore custom printing, apparel, and corporate gifts while our current product catalogue loads."),
    ].join(""),
  );

  let page = html.replace(
    new RegExp(`${"\\x3c"}title>[\\s\\S]*?${"\\x3c"}\\/title>`),
    element("title", {}, shopTitle),
  );
  page = page.replace(
    new RegExp(`${"\\x3c"}meta name="title"[^>]*>`),
    element("meta", { name: "title", content: shopTitle }),
  );
  page = page.replace(
    new RegExp(`${"\\x3c"}meta name="description"[^>]*>`),
    element("meta", { name: "description", content: shopDescription }),
  );
  page = page.replace(
    new RegExp(`${"\\x3c"}meta name="robots"[^>]*>`),
    element("meta", { name: "robots", content: "index, follow" }),
  );
  page = page.replace(
    new RegExp(`${"\\x3c"}link rel="canonical"[^>]*>`),
    element("link", { rel: "canonical", href: shopUrl }),
  );
  for (const [attribute, value] of [
    ["og:url", shopUrl],
    ["og:title", shopTitle],
    ["og:description", shopDescription],
  ]) {
    page = page.replace(
      new RegExp(`${"\\x3c"}meta property="${attribute}"[^>]*>`),
      element("meta", { property: attribute, content: value }),
    );
  }
  for (const [attribute, value] of [
    ["twitter:url", shopUrl],
    ["twitter:title", shopTitle],
    ["twitter:description", shopDescription],
  ]) {
    page = page.replace(
      new RegExp(`${"\\x3c"}meta name="${attribute}"[^>]*>`),
      element("meta", { name: attribute, content: value }),
    );
  }
  return page.replace(
    `${leftAngle}div id="root"${rightAngle}${leftAngle}/div${rightAngle}`,
    element("div", { id: "root" }, fallback),
  );
}