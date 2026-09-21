// fauna87-xcheck-woodp.ts — discriminant control (skill law 5): render
// the ACCEPTED fauna-59 woodpecker bytes in THIS tick's exact rig shape.
// If they render warm/correct → my rig differs from chassis somewhere;
// if they render near-black → the rig's prior color reads were
// silhouette-only and the metalness-1 default is systemic to review
// renders of COLOR_0-only GLBs.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const bytes = readFileSync("agents/arthur/assets/village_dress_woodp1.glb");
const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,400);
scene.add(new THREE.HemisphereLight(0xffffff,0x48505a,2.0));
scene.add(new THREE.AmbientLight(0xffffff,0.45));
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(9,13,-13); sun.castShadow=true; scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); loader.setDRACOLoader(new DRACOLoader().setDecoderPath('/draco/'));
const m=(await loader.loadAsync('/m.glb')).scene; scene.add(m);
m.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(m); const c=bb.getCenter(new THREE.Vector3());
  m.position.x-=c.x; m.position.z-=c.z; m.position.y-=bb.min.y; }
m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
m.updateMatrixWorld(true);
camera.position.set(0.55,0.42,0.28); camera.lookAt(0,0.29,0);
renderer.render(scene,camera);
const mats=new Set(); m.traverse(o=>{if(o.isMesh){mats.add(o.material.metalness+':'+o.material.roughness);}});
const c=document.createElement('canvas'); c.width=960; c.height=720;
const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
const img=x.getImageData(0,0,960,720).data; const cnt=new Map();
for(let i=0;i<img.length;i+=4){ const k=(img[i]<<16)|(img[i+1]<<8)|img[i+2]; cnt.set(k,(cnt.get(k)??0)+1); }
const top=[]; for(const [k,n] of [...cnt.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12))
  top.push((((k>>16)&255))+','+(((k>>8)&255))+','+(k&255)+':'+n);
// count WHITE cheek/scapular (0xf2ede0-ish: >220 all)
let white=0; for(let i=0;i<img.length;i+=4){ if(img[i]>215&&img[i+1]>210&&img[i+2]>195) white++; }
console.log(JSON.stringify({mats:[...mats], top, white}));
</script>`;
const THREE_ROOT = resolve("node_modules/three");
const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/m.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(bytes); }
    if (url.startsWith("/draco/")) {
      const p = resolve(THREE_ROOT, "examples/jsm/libs/draco", url.slice("/draco/".length));
      if (!p.startsWith(resolve(THREE_ROOT, "examples/jsm/libs/draco"))) throw new Error("escape");
      res.writeHead(200, { "content-type": "application/wasm" }); return res.end(readFileSync(p));
    }
    if (url === "/three.module.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.module.js"))); }
    if (url === "/three.core.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.core.js"))); }
    if (url.startsWith("/examples/jsm/")) {
      const p = resolve(THREE_ROOT, url.slice(1));
      if (!p.startsWith(THREE_ROOT)) throw new Error("escape");
      const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
      res.writeHead(200, { "content-type": "text/javascript" }); res.end(s); return;
    }
    res.writeHead(404); res.end();
  } catch (e: any) { res.statusCode = 500; res.end(String(e?.message ?? e)); }
});
await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
const port = (server.address() as any).port;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
page.on("console", m => { if (m.type() === "log") console.log("PAGE:", m.text()); });
page.on("pageerror", e => console.error("PAGEERROR", e.message));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await browser.close(); server.close();
