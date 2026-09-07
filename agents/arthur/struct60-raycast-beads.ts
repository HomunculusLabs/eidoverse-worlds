// struct60-raycast-beads.ts — read-only occlusion probe: does the gameplay/
// night camera ray to bead N hit wall geometry first? Uses the SAME chassis
// recentering as review-model.ts so camera geometry matches the renders.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { chromium } from "playwright";

const modelPath = "agents/arthur/assets/village_stillwind3.glb";
const THREE_ROOT = resolve("node_modules/three");
const modelBytes = readFileSync(modelPath);
const html = `<!doctype html><meta charset="utf-8"><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:false});
renderer.setSize(64,48);
const scene=new THREE.Scene();
const gltf=await new GLTFLoader().loadAsync('/model.glb'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true); const original=new THREE.Box3().setFromObject(root);
const center=original.getCenter(new THREE.Vector3()); root.position.x-=center.x; root.position.z-=center.z; root.position.y-=original.min.y;
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true);
const offX=-center.x, offZ=-center.z;  // model->chassis frame offset
// bead centers in MODEL frame (decode pins)
const beads={ S:[0.5659,1.55,-0.6437], N:[-0.3834,1.55,0.7665] };
// chassis-frame cameras used by the renders (front/gameplay/night all sit at these)
const cams={ gameplay:[0,1.65,18], front:[0,1.6765,33.28], east18:[18,1.65,0] };
const out={};
for(const [cn,cp] of Object.entries(cams)){
  const cam=new THREE.Vector3(...cp);
  for(const [bn,bp] of Object.entries(beads)){
    const b=new THREE.Vector3(bp[0]+offX,bp[1],bp[2]+offZ);
    const dir=b.clone().sub(cam); const dist=dir.length(); dir.normalize();
    const rc=new THREE.Raycaster(cam,dir,0.05,dist-0.10); // stop just short of the bead itself
    const hits=rc.intersectObjects(scene.children,true);
    out[cn+'_'+bn]={ beadDist:+dist.toFixed(3), firstHit: hits.length? {name:hits[0].object.name||'(mesh)', dist:+hits[0].distance.toFixed(3), point:hits[0].point.toArray().map(v=>+v.toFixed(2))} : null, hitCount:hits.length };
  }
}
window.rayOut=out; window.rayReady=true;
</script>`;
const server=createServer((req,res)=>{
  const url=(req.url??"").split("?")[0];
  try {
    if(url==="/"){res.setHeader("content-type","text/html");res.end(html);return;}
    if(url==="/model.glb"){res.setHeader("content-type","model/gltf-binary");res.end(modelBytes);return;}
    if(url==="/three.module.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.module.js")));return;}
    if(url==="/three.core.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.core.js")));return;}
    if(url.startsWith("/examples/jsm/")){
      const rel=normalize(url.slice(1)); const p=join(THREE_ROOT,rel);
      if(!p.startsWith(THREE_ROOT)) throw new Error("path escape");
      const s=readFileSync(p,"utf8").replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');
      res.setHeader("content-type","text/javascript");res.end(s);return;
    }
    res.statusCode=404;res.end("not found");
  } catch(e:any){res.statusCode=500;res.end(String(e?.message??e));}
});
await new Promise<void>(r=>server.listen(0,"127.0.0.1",r));
const addr=server.address(); if(!addr||typeof addr==="string") throw new Error("no server address");
const browser=await chromium.launch({ headless: true });
try{
  const page=await browser.newPage({viewport:{width:64,height:48}});
  page.on("pageerror", e => console.error("PAGEERROR", e.message));
  await page.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
  await page.waitForFunction(()=> (window as any).rayReady===true, undefined, { timeout: 30_000 });
  const out=await page.evaluate(()=> (window as any).rayOut);
  console.log(JSON.stringify(out,null,1));
} finally {await browser.close();server.close();}
