// fauna14-probe-rig.ts — minimal diagnostic for the GLTFLoader import chain.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const THREE_ROOT = resolve("node_modules/three");
const html = `<!doctype html><meta charset="utf-8"><script type="module">
try {
  const THREE = await import('/three.module.js');
  console.log('THREE keys:', Object.keys(THREE).length, 'has Scene:', !!THREE.Scene, 'ver:', THREE.REVISION);
} catch (e) { console.log('IMPORT three FAILED:', e.message); }
try {
  const L = await import('/examples/jsm/loaders/GLTFLoader.js');
  console.log('GLTFLoader module keys:', Object.keys(L).join(','), 'ctor:', typeof L.GLTFLoader);
} catch (e) { console.log('IMPORT loader FAILED:', e.message); }
</script>`;
const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/three.module.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.module.js"))); }
    if (url === "/three.core.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.core.js"))); }
    if (url.startsWith("/examples/jsm/")) {
      const p = resolve(THREE_ROOT, url.slice(1));
      if (!p.startsWith(THREE_ROOT)) throw new Error("escape");
      const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
      res.writeHead(200, { "content-type": "text/javascript" }); res.end(s); return;
    }
    res.writeHead(404); res.end("not found");
  } catch (e: any) { res.statusCode = 500; res.end(String(e?.message ?? e)); }
});
await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
const port = (server.address() as any).port;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on("console", m => console.log("CONSOLE:", m.text()));
page.on("pageerror", e => console.log("PAGEERROR:", e.message));
page.on("requestfailed", r => console.log("REQFAIL:", r.url(), r.failure()?.errorText));
page.on("response", r => { if (r.status() >= 400) console.log("HTTP", r.status(), r.url()); });
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await browser.close();
server.close();
