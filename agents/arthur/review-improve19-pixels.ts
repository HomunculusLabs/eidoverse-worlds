// improve-19 pixel ground truth: render the after GLB through the SAME rig
// path and dump the distinct panel-pixel palette + projected positions of
// known map points (spoke mid, hearth, torus E, slab control).
import{createServer}from"node:http";import{readFileSync,mkdirSync}from"node:fs";import{join}from"node:path";import{chromium}from"playwright";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds";
const X=2.5,Y=0,Z=9.5,YAW=-2.9441970937399127;
const files=new Map<string,Buffer>();
files.set("x",readFileSync(join(ROOT,"agents/arthur/assets/village_mapboard3.glb")));
const THREE_ROOT=join(ROOT,"node_modules/three");
const html=`<!doctype html><style>html,body{margin:0}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';import{GLTFLoader}from'/examples/jsm/loaders/GLTFLoader.js';
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1280,800);r.outputColorSpace=THREE.SRGBColorSpace;r.shadowMap.enabled=true;r.toneMapping=THREE.NoToneMapping;document.body.appendChild(r.domElement);
const s=new THREE.Scene();s.background=new THREE.Color(0xcbd6df);const cam=new THREE.PerspectiveCamera(50,1280/800,.1,600);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2);s.add(hemi);const amb=new THREE.AmbientLight(0xffffff,.45);s.add(amb);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2);sun.position.set(60,90,40);sun.castShadow=true;s.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;s.add(ground);
const loader=new GLTFLoader();const g=(await loader.loadAsync('/model/x.glb')).scene;g.position.set(${X},${Y},${Z});g.rotation.y=${YAW};g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});s.add(g);
window.shot=(px,py,pz,tx,ty,tz)=>{cam.position.set(px,py,pz);cam.lookAt(tx,ty,tz);r.render(s,cam)};
// project a g-local point to screen px
const gl=r.getContext();window.proj=(lx,ly,lz)=>{const v=new THREE.Vector3(lx,ly,lz).applyMatrix4(g.matrixWorld);const p=v.clone().project(cam);return [Math.round((p.x+1)/2*1280),Math.round((1-(p.y+1)/2)*800)]};
window.sample=(x,y)=>{const d=new Uint8Array(4);gl.readPixels(x,y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,d);return [d[0],d[1],d[2]]};
window.palette=(x0,y0,x1,y1)=>{const w=x1-x0,h=y1-y0;const d=new Uint8Array(w*h*4);gl.readPixels(x0,y0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,d);const m=new Map();for(let i=0;i<w*h;i++){const k=(d[i*4]>>4)+","+(d[i*4+1]>>4)+","+(d[i*4+2]>>4);m.set(k,(m.get(k)||0)+1)}return [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,14)};
window.ready=true;
</script>`;
const server=createServer((req,res)=>{const u=(req.url??"//").split("?")[0];try{if(u==="/"){res.setHeader("content-type","text/html");res.end(html);return}
if(u==="/three.module.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.module.js")));return}
if(u==="/three.core.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.core.js")));return}
if(u.startsWith("/examples/jsm/")){const p=join(THREE_ROOT,u.slice(1));let x=readFileSync(p,"utf8").replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');res.setHeader("content-type","text/javascript");res.end(x);return}
const m=u.match(/^\/model\/(.+)\.glb$/);if(m&&files.has(m[1])){res.setHeader("content-type","model/gltf-binary");res.end(files.get(m[1]));return}res.statusCode=404;res.end("not found")}catch(e){res.statusCode=500;res.end(String(e))}});
await new Promise<void>(q=>server.listen(0,"127.0.0.1",q));
const addr:any=server.address();
const b=await chromium.launch({headless:true});
const p=await b.newPage({viewport:{width:1280,height:800}});
p.on("pageerror",e=>console.error("PAGEERROR",e.message));
await p.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});
await p.waitForFunction(()=>window.ready===true);
// back camera (map face) — same as rig
await p.evaluate(([a,b2,c,d,e,f])=>window.shot(a,b2,c,d,e,f),[X-8*Math.sin(YAW),1.65,Z-8*Math.cos(YAW),X,1.55,Z]);
const pts=await p.evaluate(()=>{const P=[[0.2375,1.544,-0.088,"spokeE-mid"],[0,1.549,-0.089,"hearth"],[0.415,1.5,-0.09,"torusE-low"],[0.415,1.6,-0.069,"torusE-up"],[0,1.15,-0.098,"slab-ctl-below"],[0.9,1.2,-0.095,"frame-None-R"]];return P.map(([x,y,z,n])=>{const pr=window.proj(x,y,z);const col=window.sample(pr[0],pr[1]);return `${n}: px(${pr[0]},${pr[1]}) rgb(${col})`})});
for(const t of pts)console.log(t);
const pal=await p.evaluate(([a,b2,c,d])=>window.palette(a,b2,c,d),[420,280,860,520]);
console.log("panel palette (quantized/16):");
for(const [k,n]of pal)console.log(`  ${k} x${n}`);
await b.close();server.close();
