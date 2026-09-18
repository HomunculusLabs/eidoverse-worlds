// fauna24-ab-tip.ts — the two-box A/B isolation, CLEAN (boxes only, no
// turkey in scene). fauna-11 law e: identical pipeline, one variable —
// the material. BRONZE_D box left, TIP box right.
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const AB = readFileSync("agents/arthur/assets/abtest_tip.glb");
const outDir = resolve("agents/arthur/reviews/fauna24-turkey");
const THREE_ROOT = resolve("node_modules/three");
const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); scene.add(sun);
const fill=new THREE.DirectionalLight(0xffffff,0.85); fill.position.set(0,4,10); scene.add(fill);
const loader=new GLTFLoader();
const ab=await loader.loadAsync('/ab.glb'); scene.add(ab.scene);
camera.position.set(0,0.8,2.2); camera.lookAt(0,0.4,0);
renderer.render(scene,camera);
window.ready=true;
</script>`;
const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/ab.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(AB); }
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
const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
page.on("pageerror", e => console.error("PAGEERROR", e.message));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForFunction(() => (window as any).ready === true, undefined, { timeout: 60_000 });
await page.waitForTimeout(300);
const dataUrl: string = await page.evaluate(() => {
  const c = document.createElement("canvas");
  c.width = 960; c.height = 720;
  const x = c.getContext("2d")!;
  x.drawImage((document.querySelector("canvas") as HTMLCanvasElement), 0, 0);
  return c.toDataURL("image/png");
});
writeFileSync(resolve(outDir, "ab-clean.png"), Buffer.from(dataUrl.split(",")[1], "base64"));
await browser.close();
server.close();
console.log("wrote ab-clean.png");
