// color calibration: dump top colors in lone_near to find where spoil lands
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
const moleBytes = readFileSync("agents/arthur/assets/village_dress_mole1.glb");
const THREE_ROOT = resolve("node_modules/three");
const html = `<!doctype html><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(1); renderer.setSize(960,720);
renderer.outputColorSpace=THREE.SRGBColorSpace; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
scene.add(new THREE.HemisphereLight(0xffffff,0x48505a,2.0)); scene.add(new THREE.AmbientLight(0xffffff,0.45));
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(-10,12,6); sun.castShadow=true; scene.add(sun);
sun.target.position.set(0,0,0); scene.add(sun.target);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x4a5d33,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const loader=new GLTFLoader(); loader.setDRACOLoader(new DRACOLoader().setDecoderPath('/draco/'));
const lone=(await loader.loadAsync('/model-mole.glb')).scene; scene.add(lone);
lone.updateMatrixWorld(true);
{ const bb=new THREE.Box3().setFromObject(lone); const c=bb.getCenter(new THREE.Vector3());
  lone.position.x-=c.x; lone.position.z-=c.z; lone.position.y-=bb.min.y; }
lone.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); lone.updateMatrixWorld(true);
camera.position.set(0,0.30,1.3); camera.lookAt(-0.02,0.05,0); renderer.render(scene,camera);
const c=document.createElement('canvas'); c.width=960; c.height=720;
const x=c.getContext('2d'); x.drawImage(renderer.domElement,0,0);
const img=x.getImageData(0,0,960,720).data;
const counts={};
for(let i=0;i<img.length;i+=4){ const k=(img[i]<<16)|(img[i+1]<<8)|img[i+2]; counts[k]=(counts[k]||0)+1; }
const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,40);
window.out=top.map(([k,n])=>{const v=+k;return [((v>>16)&255),((v>>8)&255),(v&255),n];});
window.ready=true;
</script>`;
const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-mole.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(moleBytes); }
    if (url.startsWith("/draco/")) { const p = resolve(THREE_ROOT, "examples/jsm/libs/draco", url.slice("/draco/".length)); res.writeHead(200, { "content-type": "application/wasm" }); return res.end(readFileSync(p)); }
    if (url === "/three.module.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.module.js"))); }
    if (url === "/three.core.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.core.js"))); }
    if (url.startsWith("/examples/jsm/")) { const p = resolve(THREE_ROOT, url.slice(1)); if (!p.startsWith(THREE_ROOT)) throw new Error("escape"); const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"'); res.writeHead(200, { "content-type": "text/javascript" }); res.end(s); return; }
    res.writeHead(404); res.end();
  } catch (e: any) { res.statusCode = 500; res.end(String(e)); }
});
await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: "networkidle" });
await page.waitForFunction(() => (window as any).ready === true, undefined, { timeout: 60000 });
const out: any = await page.evaluate(() => (window as any).out);
for (const [r, g, b, n] of out) console.log(`rgb(${r},${g},${b}) x${n}`);
await browser.close(); server.close();
