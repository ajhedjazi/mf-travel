import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  };
  const ctx = {
    waitUntil() {},
    passThroughOnException() {},
  };

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    env,
    ctx,
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /Manchester Airport/i);
  assert.match(html, /Newcastle International Airport/i);
  assert.match(html, /Birmingham Airport/i);
  assert.match(html, /"price":145/);
  assert.match(html, /"price":195/);

  const airportHubResponse = await worker.fetch(
    new Request("http://localhost/airport-transfers"),
    env,
    ctx,
  );
  assert.equal(airportHubResponse.status, 200);
  const airportHubHtml = await airportHubResponse.text();
  assert.match(airportHubHtml, /Airport transfers/i);
  assert.match(airportHubHtml, /hull-to-manchester-airport/i);
  assert.match(airportHubHtml, /hull-to-leeds-bradford-airport/i);

  const manchesterResponse = await worker.fetch(
    new Request("http://localhost/airport-transfers/hull-to-manchester-airport"),
    env,
    ctx,
  );
  assert.equal(manchesterResponse.status, 200);
  const manchesterHtml = await manchesterResponse.text();
  assert.match(manchesterHtml, /Hull to Manchester Airport Transfer/i);
  assert.match(manchesterHtml, /Guide fare from Hull/i);
  assert.match(manchesterHtml, /£145/);

  const humbersideResponse = await worker.fetch(
    new Request("http://localhost/airport-transfers/hull-to-humberside-airport"),
    env,
    ctx,
  );
  assert.equal(humbersideResponse.status, 200);
  const humbersideHtml = await humbersideResponse.text();
  assert.match(humbersideHtml, /closest commercial airport to Hull/i);
  assert.match(humbersideHtml, /£50/);

  const sitemapResponse = await worker.fetch(
    new Request("http://localhost/sitemap.xml"),
    env,
    ctx,
  );
  assert.equal(sitemapResponse.status, 200);
  const sitemapXml = await sitemapResponse.text();
  assert.match(sitemapXml, /mf-travel\.onrender\.com/i);
  assert.match(sitemapXml, /airport-transfers\/hull-to-manchester-airport/i);
  assert.match(sitemapXml, /airport-transfers\/hull-to-liverpool-airport/i);

  const robotsResponse = await worker.fetch(
    new Request("http://localhost/robots.txt"),
    env,
    ctx,
  );
  assert.equal(robotsResponse.status, 200);
  assert.match(await robotsResponse.text(), /sitemap\.xml/i);
});
