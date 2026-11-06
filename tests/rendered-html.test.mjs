import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { after, before, test } from "node:test";

const origin = "https://mftravel.co.uk";
const routes = [
  ["hull-to-manchester-airport", "Manchester Airport", 150],
  ["hull-to-leeds-bradford-airport", "Leeds Bradford Airport", 110],
  ["hull-to-humberside-airport", "Humberside Airport", 45],
  ["hull-to-east-midlands-airport", "East Midlands Airport", 155],
  ["hull-to-liverpool-airport", "Liverpool John Lennon Airport", 170],
];
const pages = ["/", "/airport-transfers", ...routes.map(([slug]) => `/airport-transfers/${slug}`)];
const html = new Map();
let base = process.env.TEST_BASE_URL;
let server;

before(async () => {
  if (!base) {
    const socket = createServer();
    socket.listen(0, "127.0.0.1");
    await once(socket, "listening");
    const port = socket.address().port;
    await new Promise((resolve) => socket.close(resolve));
    base = `http://127.0.0.1:${port}`;
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port), "-H", "127.0.0.1"], { stdio: ["ignore", "pipe", "pipe"] });
    let log = "";
    server.stdout.on("data", (chunk) => { log += chunk; });
    server.stderr.on("data", (chunk) => { log += chunk; });
    const deadline = Date.now() + 30_000;
    while (true) {
      if (server.exitCode !== null) throw new Error(`Next server exited: ${log}`);
      try { if ((await fetch(base)).ok) break; } catch { /* waiting for readiness */ }
      if (Date.now() > deadline) throw new Error(`Next server did not start: ${log}`);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  await Promise.all(pages.map(async (path) => {
    const response = await fetch(`${base}${path}`, { redirect: "manual" });
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/);
    assert.doesNotMatch(response.headers.get("x-robots-tag") ?? "", /noindex/i);
    html.set(path, await response.text());
  }));
});

after(async () => {
  if (server && server.exitCode === null) {
    const exited = once(server, "exit");
    server.kill("SIGTERM");
    await exited;
  }
});

function schema(markup) {
  return [...markup.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
    .flatMap((match) => JSON.parse(match[1])["@graph"]);
}

function visibleText(markup) {
  return markup.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]*>/g, " ").replace(/<!--.*?-->/g, " ").replace(/\s+/g, " ");
}

test("all seven pages return indexable HTML with unique titles and canonicals", () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const [path, markup] of html) {
    const title = markup.match(/<title>(.*?)<\/title>/)?.[1];
    assert.ok(title, path);
    titles.add(title);
    descriptions.add(markup.match(/<meta name="description" content="([^"]+)"/)?.[1]);
    assert.equal((markup.match(/<h1\b/g) ?? []).length, 1, path);
    const canonical = markup.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(canonical, path === "/" ? origin : `${origin}${path}`, path);
    assert.doesNotMatch(markup, /mf-travel\.onrender\.com|chatgpt\.site|main--mf-travel\.netlify\.app/);
    assert.doesNotMatch(markup, /<meta name="robots" content="[^"]*noindex/i);
    assert.match(markup, /name="twitter:title"/);
    assert.match(markup, /property="og:url"/);
  }
  assert.equal(titles.size, pages.length);
  assert.equal(descriptions.size, pages.length);
  assert.ok(!descriptions.has(undefined));
});

test("the exact business-card logo has dimensions and a home link on every page", async () => {
  for (const [path, markup] of html) {
    assert.match(markup, /<a[^>]*aria-label="MF Travel home"[^>]*>/, path);
    assert.match(markup, /<img[^>]*alt="MF Travel"[^>]*width="572"[^>]*height="174"[^>]*src="\/brand\/mf-travel-business-card-logo\.webp"/, path);
  }
  const response = await fetch(`${base}/brand/mf-travel-business-card-logo.webp`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /image\/webp/);
});

test("home service heading, route links and section anchors are server-rendered", () => {
  const home = html.get("/");
  assert.match(visibleText(home), /Airport transfers from Hull\./);
  for (const id of ["home", "airport", "fares", "fleet", "distance", "service", "faq", "quote"]) {
    assert.ok(home.includes(`href="#${id}"`), id);
    assert.ok(home.includes(`id="${id}"`), id);
  }
  for (const [slug] of routes) assert.ok(home.includes(`href="/airport-transfers/${slug}"`), slug);
  assert.match(home, /Skip to main content/);
});

test("approved fares and inclusions match visible content and structured data", () => {
  const home = html.get("/");
  const offers = schema(home).find((item) => item["@type"] === "Service").hasOfferCatalog.itemListElement;
  assert.deepEqual(offers.map((item) => item.price), [45, 110, 150, 155, 170, 185, 190]);
  for (const price of [45, 110, 150, 155, 170, 185, 190]) assert.match(visibleText(home), new RegExp(`£\\s*${price}\\b`));
  for (const markup of html.values()) {
    const text = visibleText(markup);
    assert.match(text, /airport parking/);
    assert.match(text, /up to four passengers/);
    assert.match(text, /subject to luggage space/);
    assert.match(text, /fixed quote/);
    assert.doesNotMatch(text, /\b2017\b|\b2019\b|years? old|model year/i);
  }
  for (const [slug, airport, price] of routes) {
    const markup = html.get(`/airport-transfers/${slug}`);
    const service = schema(markup).find((item) => item["@type"] === "Service");
    assert.equal(service.offers.price, price, airport);
    assert.equal(service.offers.priceCurrency, "GBP");
    assert.match(visibleText(markup), new RegExp(`£\\s*${price}\\b`));
    assert.ok(markup.includes(`destination=${encodeURIComponent(airport)}#quote`));
  }
  assert.match(visibleText(html.get("/airport-transfers")), /Newcastle International Airport \(£185\)/);
  assert.match(visibleText(html.get("/airport-transfers")), /Birmingham Airport \(£190\)/);
});

test("structured data uses verified identity, valid service types and connected breadcrumbs", () => {
  for (const [path, markup] of html) {
    const graph = schema(markup);
    const business = graph.find((item) => item["@type"] === "Organization");
    assert.equal(business["@id"], `${origin}/#business`);
    assert.equal(business.url, origin);
    assert.equal(business.logo.url, `${origin}/brand/mf-travel-business-card-logo.webp`);
    assert.ok(!business.address && !business.openingHours && !business.aggregateRating);
    assert.ok(graph.every((item) => item["@type"] !== "TransportationService"));
    if (path !== "/") {
      const crumbs = graph.find((item) => item["@type"] === "BreadcrumbList").itemListElement;
      assert.equal(crumbs.at(-1).item, `${origin}${path}`);
      assert.deepEqual(crumbs.map((item) => item.position), crumbs.map((_, i) => i + 1));
    }
  }
});

test("call and WhatsApp links remain unchanged wherever configured", () => {
  const phone = html.get("/").match(/href="tel:([^"]+)"/)?.[1];
  if (!phone) return; // No contact number is invented in a local build.
  const whatsapp = phone.replace(/\D/g, "").replace(/^0/, "44");
  for (const markup of html.values()) {
    assert.ok(markup.includes(`href="tel:${phone}"`));
    assert.ok(markup.includes(`href="https://wa.me/${whatsapp}"`));
  }
});

test("sitemap and robots point only to the business domain; missing routes return 404", async () => {
  const sitemap = await fetch(`${base}/sitemap.xml`);
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  assert.equal((xml.match(/<loc>/g) ?? []).length, pages.length);
  for (const path of pages) assert.ok(xml.includes(`<loc>${path === "/" ? origin : origin + path}</loc>`));
  assert.doesNotMatch(xml, /onrender|netlify\.app|chatgpt\.site/);
  const robots = await fetch(`${base}/robots.txt`);
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Allow: \/\s+Sitemap: https:\/\/mftravel\.co\.uk\/sitemap\.xml/);
  const missing = await fetch(`${base}/airport-transfers/not-a-real-airport`);
  assert.equal(missing.status, 404);
});
