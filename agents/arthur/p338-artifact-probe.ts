// polish-338 artifact probe: identify what the deck-day pixel (194,341)
// ray hits, in the candidate vs the baseline — classify the "dark tick in
// the sky gap" the A/B judge flagged (rig: only carousel + ground exist).
// three.js Raycaster against the full loaded scene, deck camera replicated.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2]);
const PX = Number(process.argv[3] ?? 194), PY = Number(process.argv[4] ?? 341);
const THREE_ROOT = resolve("node_modules/three");
const DRACO_DIR = resolve("node_modules/three/examples/jsm/libs/draco/gltf/");
const threeModule = join(THREE_ROOT, "build/three.module.js");
const modelBytes = readFileSync(modelPath);
const html = `<!doctype html><meta charset="utf-8"><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/examples/jsm/loaders/DRACOLoader.js';
const PX=${PX}, PY=${PY};
const draco=new DRACOLoader(); draco.setDecoderPath('/draco/');
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(960,720);
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,200);
camera.position.set(4.6,3.4,4.6); camera.lookAt(0,3.1,0);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); scene.add(sun);
const loader=new GLTFLoader(); loader.setDRACOLoader(draco);
const gltf=await loader.loadAsync('/model.glb'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true);
camera.updateMatrixWorld(true);
renderer.render(scene,camera);
// NDC from pixel
const ndc=new THREE.Vector2((PX/960)*2-1, -(PY/720)*2+1);
const rc=new THREE.Raycaster(); rc.setFromCamera(ndc,camera);
const hits=rc.intersectObjects(scene.children,true);
window.RESULT=hits.slice(0,4).map(h=>{
  let n=h.object, chain=[];
  while(n){ if(n.name) chain.push(n.name); n=n.parent; }
  return {dist:h.dist!=null?+h.dist.toFixed(3):null, point:h.point?h.point.toArray().map(v=>+v.toFixed(3)):null,
          node:h.object.name||'(unnamed)', chain:chain.join('/')||'(scene)', face:h.face?h.face.a+'-'+h.face.b+'-'+h.face.c:null};
});
window.RESULT.push({note:'total hits', n:hits.length});
window.rigReady=true;
</script>`;
const server=createServer((req,res)=>{
  const url=(req.url??"").split("?")[0];
  if(url==="/"){res.setHeader("content-type","text/html");res.end(html);return;}
  if(url==="/model.glb"){res.setHeader("content-type","model/gltf-binary");res.end(modelBytes);return;}
  if(url==="/three.module.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(threeModule));return;}
  if(url==="/three.core.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.core.js")));return;}
  if(url.startsWith("/examples/jsm/")){const p=resolve(THREE_ROOT,url.slice(1));let s=readFileSync(p,"utf8").replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');res.setHeader("content-type","text/javascript");res.end(s);return;}
  if(url.startsWith("/draco/")){
    const f=url.slice("/draco/".length); const p=resolve(DRACO_DIR,f);
    if(!p.startsWith(DRACO_DIR)){res.statusCode=403;res.end("escape");return;}
    res.setHeader("content-type",f.endsWith(".wasm")?"application/wasm":"text/javascript");
    res.end(readFileSync(p));return;
  }
  res.statusCode=404;res.end();
});
await new Promise<void>(r=>server.listen(0,"127.0.0.1",r));
const port=(server.address() as any).port;
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:960,height:720}});
page.on("pageerror",(e:any)=>console.error("PAGEERROR:",String(e)));
page.on("console",(m:any)=>{if(m.type()==="error")console.error("CONSOLE:",m.text());});
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction("window.rigReady===true", null, {timeout:60000});
const result=await page.evaluate("window.RESULT");
console.log(JSON.stringify({model:modelPath, px:PX, py:PY, result}, null, 1));
await browser.close(); server.close();
