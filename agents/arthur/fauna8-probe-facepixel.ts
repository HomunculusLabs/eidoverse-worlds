// fauna8-probe-facepixel.ts — decisive color probe: load the owl GLB in
// the render rig, project the facial-disc mesh center to screen, read the
// rendered pixel color there. Settles bytes-vs-render (normals? camera?
// occlusion?) without threshold guessing.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const owlBytes = readFileSync(process.argv[2] ?? "agents/arthur/assets/village_dress_barnowl1.glb");
const THREE_ROOT = resolve("node_modules/three");

const html = `<!doctype html><meta charset="utf-8"><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,300);
scene.add(new THREE.HemisphereLight(0xffffff,0x48505a,2.0));
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); scene.add(sun);
const loader=new GLTFLoader();
const owl=(await loader.loadAsync('/model-owl.glb')).scene;
owl.position.set(0,0,0); scene.add(owl); owl.updateMatrixWorld(true);
// center on the owl
{ const bb=new THREE.Box3().setFromObject(owl); const c=bb.getCenter(new THREE.Vector3());
  owl.position.x-=c.x; owl.position.z-=c.z; owl.position.y-=bb.min.y; owl.updateMatrixWorld(true); }
window.meshes=[];
owl.traverse(o=>{ if(o.isMesh){ o.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(o); const ctr=bb.getCenter(new THREE.Vector3());
  const front=ctr.clone(); // sample the +x-most point of the bbox (the face side)
  front.x=bb.max.x-0.005; front.y=ctr.y; front.z=ctr.z;
  window.meshes.push({name:o.name, color:o.material.color.getHexString(), center:ctr.toArray(), front:front.toArray()});
}});
// face the camera exactly +x, framed on THIS model's bbox center
{ const bb=new THREE.Box3().setFromObject(owl); const c=bb.getCenter(new THREE.Vector3());
  const sz=bb.getSize(new THREE.Vector3());
  camera.position.set(c.x+Math.max(1.2, sz.y*1.5), c.y, c.z);
  camera.lookAt(c.x, c.y, c.z); }
renderer.render(scene,camera);
window.readPx=(x,y)=>{ const c=document.createElement('canvas'); c.width=960; c.height=720;
  const ctx=c.getContext('2d'); ctx.drawImage(renderer.domElement,0,0);
  const d=ctx.getImageData(x,y,1,1).data; return [d[0],d[1],d[2]]; };
window.headMap=()=>{ renderer.render(scene,camera);
  const c=document.createElement('canvas'); c.width=960; c.height=720;
  const ctx=c.getContext('2d'); ctx.drawImage(renderer.domElement,0,0);
  const out=[];
  for(let y=320;y<420;y+=4){ const row=[];
    for(let x=400;x<560;x+=4){ const d=ctx.getImageData(x,y,1,1).data;
      row.push(d[0].toString(16).padStart(2,'0')+d[1].toString(16).padStart(2,'0')+d[2].toString(16).padStart(2,'0')); }
    out.push(row.join(' ')); }
  return out; };
window.proj=(p)=>{ const v=new THREE.Vector3(...p).project(camera);
  return [Math.round((v.x+1)/2*960), Math.round((1-(v.y+1)/2)*720)]; };
// scanline through the disc center y
window.albedo=(on)=>{ sun.intensity=on?0:3.2; ambient.intensity=on?3.0:0.45; renderer.render(scene,camera); };
window.scan=(y)=>{ const out=[]; const c=document.createElement('canvas'); c.width=960; c.height=720;
  const ctx=c.getContext('2d'); ctx.drawImage(renderer.domElement,0,0);
  for(let x=0;x<960;x+=2){ const d=ctx.getImageData(x,y,1,1).data; out.push(d[0]+','+d[1]+','+d[2]); }
  return out; };
window.discY=null;
window.ready=true;
</script>`;
const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  try {
    if (url === "/") { res.writeHead(200, { "content-type": "text/html" }); return res.end(html); }
    if (url === "/model-owl.glb") { res.writeHead(200, { "content-type": "model/gltf-binary" }); return res.end(owlBytes); }
    if (url === "/three.module.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.module.js"))); }
    if (url === "/three.core.js") { res.writeHead(200, { "content-type": "text/javascript" }); return res.end(readFileSync(resolve(THREE_ROOT, "build/three.core.js"))); }
    if (url.startsWith("/examples/jsm/")) {
      const p = resolve(THREE_ROOT, url.slice(1));
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
const meshes: any = await page.evaluate(() => (window as any).meshes);
const disc = meshes.find((m: any) => m.name === 'barnowl_head_2');
if (disc) {
  await page.evaluate(() => (window as any).albedo(true));
  const dy2: any = await page.evaluate((p2: any) => (window as any).proj(p2), disc.front);
  const scan2: string[] = await page.evaluate((y: any) => (window as any).scan(y), dy2[1]);
  const runs2: string[] = [];
  let prev2 = '';
  for (let i = 0; i < scan2.length; i++) { if (scan2[i] !== prev2) { runs2.push(`${i * 2}:${scan2[i]}`); prev2 = scan2[i]; } }
  console.log('ALBEDO disc row', dy2[1], 'runs:', runs2.join(' | '));
  await page.evaluate(() => (window as any).albedo(false));
  // 2D albedo map of the owl head region
  const map2: any = await page.evaluate(() => (window as any).headMap());
  console.log('ALBEDO 2D map (y320..420 x400..560, step 4):');
  for (const r of map2) console.log(r);
  const [dx, dy] = await page.evaluate((p2: any) => (window as any).proj(p2), disc.front);
  const scan: string[] = await page.evaluate((y: any) => (window as any).scan(y), dy);
  // compress: runs of identical colors
  const runs: string[] = [];
  let prev = '';
  for (let i = 0; i < scan.length; i++) {
    if (scan[i] !== prev) { runs.push(`${i * 2}:${scan[i]}`); prev = scan[i]; }
  }
  console.log('DISC front px', dx, dy, 'scanline runs:', runs.join(' | '));
}
for (const m of meshes) {
  if (!/head|barnowl/.test(m.name)) continue;
  const [cx, cy] = await page.evaluate((p: any) => (window as any).proj(p), m.front);
  if (cx < 0 || cx > 959 || cy < 0 || cy > 719) { console.log(m.name, "front point offscreen", cx, cy); continue; }
  const col = await page.evaluate(([x, y]: any) => (window as any).readPx(x, y), [cx, cy]);
  console.log(m.name.padEnd(20), "mat#", m.color, "front", m.front.map((n: number) => n.toFixed(2)).join(","), "-> px", `(${cx},${cy})`, "rgb", col.join(","));
}
await browser.close();
server.close();
