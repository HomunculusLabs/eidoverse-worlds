// struct206-shadow-falsify.ts — pitfall-11 falsification of the gameplay
// judge's "orphaned dash squiggle at (333–360, 417–422)" finding.
// Control: identical rig, sun.castShadow=false (both render+receive), same
// gameplay view. If the dash band VANISHES in the shadow-off control, it is
// the monument's TRUE CAST SHADOW (sun at (8,12,6) projects ironwork at
// h≈2.5–3.35m onto ground ≈120–180px left of center) — a designed-adjacent
// physical artifact, not floating geometry. Pixel probe counts dark pixels
// in the band for BOTH renders + the warm-pixel census of the night frames.
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve("agents/arthur/assets/village_viviani3.glb");
const outDir = resolve("agents/arthur/reviews/struct206-viviani");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const DRACO_DIR = resolve("node_modules/three/examples/jsm/libs/draco/gltf/");
const threeModule = resolve(THREE_ROOT, "build/three.module.js");
const modelBytes = readFileSync(modelPath);

const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
const draco=new DRACOLoader(); draco.setDecoderPath('/draco/');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x3d3a29,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const gltf=await loader.loadAsync('/model.glb'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true); const bb=new THREE.Box3().setFromObject(root);
const size=bb.getSize(new THREE.Vector3());
root.position.x-=bb.getCenter(new THREE.Vector3()).x; root.position.z-=bb.getCenter(new THREE.Vector3()).z; root.position.y-=bb.min.y;
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
root.updateMatrixWorld(true);
const target=new THREE.Vector3(0,Math.max(0.7,size.y*0.38),0);
camera.position.set(0,1.65,18); camera.lookAt(target); renderer.render(scene,camera);
window.setShadows=(on)=>{sun.castShadow=on;ground.receiveShadow=on;root.traverse(o=>{if(o.isMesh){o.castShadow=on;o.receiveShadow=on;}});renderer.render(scene,camera);};
window.setNight=(on)=>{scene.background.set(on?0x111827:0xcbd6df);hemi.intensity=on?.18:2;ambient.intensity=on?.04:.45;sun.intensity=on?.15:3.2;renderer.render(scene,camera);};
window.probe=(x0,y0,x1,y1)=>{const g=renderer.getContext();const px=new Uint8Array(g.drawingBufferWidth*g.drawingBufferHeight*4);g.readPixels(0,0,g.drawingBufferWidth,g.drawingBufferHeight,g.RGBA,g.UNSIGNED_BYTE,px);let dark=0,warm=0,tot=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=((g.drawingBufferHeight-1-y)*g.drawingBufferWidth+x)*4;const r=px[i],gg=px[i+1],b=px[i+2];tot++;if(r<70&&gg<70&&b<70)dark++;if(r>110&&r>gg+30&&gg<b+10)warm++;}return{dark,warm,tot};};
window.capture=()=>{const g=renderer.getContext();const px=new Uint8Array(g.drawingBufferWidth*g.drawingBufferHeight*4);g.readPixels(0,0,g.drawingBufferWidth,g.drawingBufferHeight,g.RGBA,g.UNSIGNED_BYTE,px);return Array.from(px);};
window.ready=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(modelBytes); }
    if (url === "/three.module.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(threeModule)); }
    if (url === "/three.core.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.core.js"))); }
    if (url.startsWith("/examples/jsm/")) {
      const p = resolve(THREE_ROOT, url.slice(1));
      if (!p.startsWith(THREE_ROOT)) throw new Error("path escape");
      const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
      res.writeHead(200, { "content-type": "text/javascript" }); return res.end(s);
    }
    if (url.startsWith("/draco/")) {
      const p = resolve(DRACO_DIR, url.slice("/draco/".length));
      if (!p.startsWith(DRACO_DIR)) throw new Error("escape");
      res.writeHead(200, { "content-type": p.endsWith(".wasm") ? "application/wasm" : "text/javascript" }); return res.end(readFileSync(p));
    }
    res.writeHead(404); res.end("not found");
  } catch (e: any) { res.statusCode = 500; res.end(String(e?.message ?? e)); }
});
await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
const port = (server.address() as any).port;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 960, height: 720 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.error("PAGEERROR", e.message));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForFunction(() => (window as any).ready === true, undefined, { timeout: 60_000 });

// BAND A = the judge's dash band (333-360, 417-422); BAND B = clean ground control right of plinth (600-640, 417-422)
const withShadow = await page.evaluate(() => ({
    A: (window as any).probe(333, 417, 361, 423),
    B: (window as any).probe(600, 417, 641, 423),
}));
await page.screenshot({ path: resolve(outDir, "shadow-control-on.png") });
await page.evaluate(() => (window as any).setShadows(false));
const noShadow = await page.evaluate(() => ({
    A: (window as any).probe(333, 417, 361, 423),
    B: (window as any).probe(600, 417, 641, 423),
}));
await page.screenshot({ path: resolve(outDir, "shadow-control-off.png") });

// night census: gameplay + face-on, warm pixels full-frame (sole-bead law)
await page.evaluate(() => (window as any).setShadows(true));
await page.evaluate(() => (window as any).setNight(true));
const nightGameplay = await page.evaluate(() => (window as any).probe(0, 0, 960, 720));
// face-on at 8m-ish for the bead close read
await page.evaluate(() => { (window as any).ready = false; });
await page.evaluate(() => {
    const cam = (window as any);
});
// reuse probe on the same gameplay night frame is enough; face night uses the static render
await browser.close();
server.close();

console.log(JSON.stringify({
    bandA_dash: { on: withShadow.A, off: noShadow.A },
    bandB_control: { on: withShadow.B, off: noShadow.B },
    nightGameplayWarm: nightGameplay,
}, null, 2));
const aOn = withShadow.A.dark, aOff = noShadow.A.dark;
console.log(aOn > 20 && aOff <= 2
    ? `FALSIFIED-AS-SHADOW: dash band ${aOn} dark px with shadows -> ${aOff} without — the squiggle IS the cast shadow (physical, designed-adjacent), NOT floating geometry`
    : `NOT-RESOLVED: dash band ${aOn} dark px with shadows -> ${aOff} without — investigate further`);
console.log(`night gameplay warm px: ${nightGameplay.warm} (sole-bead law expects one small cluster)`);
