import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
const bytes = readFileSync("/tmp/probe-white.glb");
const THREE_ROOT = resolve("/Users/t3rpz/projects/eidoverse-worlds/node_modules/three");
const html = `<!doctype html><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(400,300); renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,400/300,0.05,300); camera.position.set(0,0.5,2.4); camera.lookAt(0,0.25,0);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); scene.add(sun);
const loader=new GLTFLoader(); const gltf=await loader.loadAsync('/m.glb'); scene.add(gltf.scene);
gltf.scene.updateMatrixWorld(true);
renderer.render(scene,camera);
const c=document.createElement('canvas'); c.width=400;c.height=300;
c.getContext('2d').drawImage(renderer.domElement,0,0);
const d=c.getContext('2d').getImageData(0,0,400,300).data;
// sample box centers: left box x~-0.35 → screen x ~130; right ~0.35 → ~270; y ~120
const px=(x,y)=>{const i=(y*400+x)*4; return [d[i],d[i+1],d[i+2]];};
window.result={leftFront:px(105,110), leftTop:px(130,70), rightFront:px(250,110), rightTop:px(270,75)};
window.ready=true;
</script>`;
const server = createServer((req,res)=>{
  if(req.url==='/'){res.writeHead(200,{'content-type':'text/html'});return res.end(html);}
  if(req.url==='/m.glb'){res.writeHead(200,{'content-type':'model/gltf-binary'});return res.end(bytes);}
  if(req.url==='/three.module.js'){res.writeHead(200,{'content-type':'text/javascript'});return res.end(readFileSync(resolve(THREE_ROOT,'build/three.module.js')));}
  if(req.url==='/three.core.js'){res.writeHead(200,{'content-type':'text/javascript'});return res.end(readFileSync(resolve(THREE_ROOT,'build/three.core.js')));}
  if(req.url.startsWith('/examples/jsm/')){const p=resolve(THREE_ROOT,req.url.slice(1));const s=readFileSync(p,'utf8').replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');res.writeHead(200,{'content-type':'text/javascript'});return res.end(s);}
  res.writeHead(404);res.end();
});
await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
const port=(server.address() as any).port;
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:400,height:300}});
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(()=>(window as any).ready===true,undefined,{timeout:30000});
console.log('LEFT (plain):',JSON.stringify(await page.evaluate(()=>(window as any).result)));
console.log('RIGHT (baked):',JSON.stringify(await page.evaluate(()=>(window as any).result)));
await browser.close(); server.close();
