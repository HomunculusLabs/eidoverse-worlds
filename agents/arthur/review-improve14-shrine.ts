// review-improve14-shrine.ts — improve-14 identical-camera before/after
// renders of nx-town-shrine at gameplay distance. Before = live bytes
// 53709062 (captured to reviews/improve14-shrine/before/), after = local
// candidate bb45c9ff. Same rig/cameras/sun as improve-13 reviews.
import{createServer}from"node:http";import{readFileSync,mkdirSync}from"node:fs";import{join}from"node:path";import{chromium}from"playwright";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",REV=join(ROOT,"agents/arthur/reviews/improve14-shrine");
const X=-25,Y=0,Z=-4,YAW=1.4118119548622732;
const M={before:{f:join(REV,"before/village_shrine3.glb")},after:{f:join(ROOT,"agents/arthur/assets/village_shrine3.glb")}}as const;
const files=new Map<string,Buffer>();
const THREE_ROOT=join(ROOT,"node_modules/three"),threeModule=join(THREE_ROOT,"build/three.module.js");
const html=`<!doctype html><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';import{GLTFLoader}from'/examples/jsm/loaders/GLTFLoader.js';
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1280,800);r.outputColorSpace=THREE.SRGBColorSpace;r.shadowMap.enabled=true;r.toneMapping=THREE.NoToneMapping;document.body.appendChild(r.domElement);
const s=new THREE.Scene();s.background=new THREE.Color(0xcbd6df);const cam=new THREE.PerspectiveCamera(50,1280/800,.1,600);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2);s.add(hemi);const amb=new THREE.AmbientLight(0xffffff,.45);s.add(amb);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2);sun.position.set(60,90,40);sun.castShadow=true;s.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;s.add(ground);
const loader=new GLTFLoader();const g=(await loader.loadAsync('/model/x.glb')).scene;g.position.set(${X},${Y},${Z});g.rotation.y=${YAW};g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});s.add(g);
window.shot=(px,py,pz,tx,ty,tz)=>{cam.position.set(px,py,pz);cam.lookAt(tx,ty,tz);r.render(s,cam)};
window.night=()=>{hemi.intensity=0.06;amb.intensity=0.05;sun.intensity=0.05;s.background=new THREE.Color(0x0b1016);r.render(s,cam)};
window.ready=true;
</script>`;
const server=createServer((req,res)=>{const u=(req.url??"//").split("?")[0];try{if(u==="/"){res.setHeader("content-type","text/html");res.end(html);return}
if(u==="/three.module.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(threeModule));return}
if(u==="/three.core.js"){res.setHeader("content-type","text/javascript");res.end(readFileSync(join(THREE_ROOT,"build/three.core.js")));return}
if(u.startsWith("/examples/jsm/")){const p=join(THREE_ROOT,u.slice(1));let x=readFileSync(p,"utf8").replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');res.setHeader("content-type","text/javascript");res.end(x);return}
const m=u.match(/^\/model\/(.+)\.glb$/);if(m&&files.has(m[1])){res.setHeader("content-type","model/gltf-binary");res.end(files.get(m[1]));return}res.statusCode=404;res.end("not found")}catch(e){res.statusCode=500;res.end(String(e))}});
await new Promise<void>(q=>server.listen(0,"127.0.0.1",q));const addr=server.address();if(!addr||typeof addr==="string")throw Error("no addr");
const SHOTS=[
["gameplay",[X+18*Math.sin(YAW),1.65,Z+18*Math.cos(YAW)],[X,1.0,Z]],
["front",[X+11*Math.sin(YAW),1.65,Z+11*Math.cos(YAW)],[X,1.0,Z]],
["back",[X-12*Math.sin(YAW),1.65,Z-12*Math.cos(YAW)],[X,1.0,Z]],
["top",[X,40,Z],[X,0,Z]],
]as const;
const b=await chromium.launch({headless:true});
try{
 for(const which of ["before","after"] as const){
  files.clear();files.set("x",readFileSync((M as any)[which].f));
  const p=await b.newPage({viewport:{width:1280,height:800}});p.on("pageerror",e=>console.error("PAGEERROR",e.message));
  await p.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:"networkidle"});await p.waitForFunction(()=>window.ready===true);
  const OUT=join(REV,which);mkdirSync(OUT,{recursive:true});
  for(const [nm,c,t] of SHOTS){await p.evaluate((a)=>window.shot(a.c[0],a.c[1],a.c[2],a.t[0],a.t[1],a.t[2]),{c:[...c],t:[...t]});await p.screenshot({path:join(OUT,nm+".png")});}
  await p.evaluate(()=>window.night());await p.evaluate((a)=>window.shot(a.c[0],a.c[1],a.c[2],a.t[0],a.t[1],a.t[2]),{c:[...SHOTS[1][1]],t:[...SHOTS[1][2]]});
  await p.screenshot({path:join(OUT,"night-front.png")});
  await p.close();console.log("rendered",which);
 }
}finally{await b.close();server.close();}
