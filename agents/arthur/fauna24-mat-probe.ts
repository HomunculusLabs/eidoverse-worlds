// fauna24-mat-probe.ts — decisive material probe for the dead TIP band.
// polish-289 class check: does the fan_1 (TIP) bucket carry a real glTF
// material, or the legacy COLOR_0-only convention that renders dark
// without an envmap? Loads the exact GLB in the same rig and prints the
// material table (color, roughness, metalness, vertexColors) + a two-box
// A/B isolation (BRONZE_D box vs TIP box through toGLB+mergekit) if
// needed.
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import * as THREE from "three";
import { toGLB, mat } from "./assets/glbwrite.ts";
import { mergeByMaterial } from "./assets/mergekit.ts";

// two-box A/B: one BRONZE_D, one TIP, side by side, same pipeline
const ab = new THREE.Group();
const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.02), mat(0x4a3826, 0.92, 0));
b1.position.set(-0.25, 0.4, 0);
ab.add(b1);
const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.02), mat(0xd9c9a6, 0.92, 0));
b2.position.set(0.25, 0.4, 0);
ab.add(b2);
mergeByMaterial(ab, "abtest");
writeFileSync("agents/arthur/assets/abtest_tip.glb", toGLB(ab));

const GLB = readFileSync("agents/arthur/assets/village_dress_turkeys.glb");
const AB = readFileSync("agents/arthur/assets/abtest_tip.glb");
const outDir = resolve("agents/arthur/reviews/fauna24-turkey");
mkdirSync(outDir, { recursive: true });

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
const gmat=new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:0.95,metalness:0});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),gmat); ground.rotation.x=-Math.PI/2; scene.add(ground);
const loader=new GLTFLoader();
const inspect=async(url)=>{
  const gltf=await loader.loadAsync(url); const root=gltf.scene; scene.add(root);
  const out=[];
  root.traverse(o=>{ if(o.isMesh){
    const m=o.material;
    let c0=null;
    const attr=o.geometry.getAttribute('color');
    if(attr && attr.array){ c0=attr.array.slice(0,3).map(v=>+v.toFixed(2)).join(','); }
    out.push({name:o.name, matName:m.name, color:'#'+m.color.getHexString(),
      rough:m.roughness, metal:m.metalness, vcolors:m.vertexColors, c0});
  }});
  return out;
};
const TURKEY=await inspect('/model-new.glb');
window.stats={turkey:TURKEY};
window.snapAB=()=>{ camera.position.set(0,0.8,2.2); camera.lookAt(0,0.4,0);
  renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png'); };
window.reviewReady=true;
</script>`;

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/" || url === "/index.html") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-new.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(GLB); }
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
await page.waitForFunction(() => (window as any).reviewReady === true, undefined, { timeout: 60_000 });
const stats = await page.evaluate(() => (window as any).stats);
for (const m of stats.turkey) console.log(`${m.name.padEnd(22)} mat=${String(m.matName).padEnd(14)} col=${m.color} rough=${m.rough} metal=${m.metal} vcolors=${m.vcolors} c0=${m.c0}`);
const dataUrl: string = await page.evaluate(() => (window as any).snapAB());
writeFileSync(resolve(outDir, "ab-tip.png"), Buffer.from(dataUrl.split(",")[1], "base64"));
await browser.close();
server.close();
console.log("wrote ab-tip.png");
