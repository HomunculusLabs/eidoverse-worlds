// review-night-nw.ts — night-N lane, wakeup 1: NW Cultivation district night pass.
// Hash-bound local render evidence (NOT an in-world camera frame): every subject
// GLB's sha256[:16] is checked against the LIVE /geom census libs (captured
// 2026-09-05, /tmp/night1-census.json, 227 entities) before rendering. Poses are
// the exact live tuples. Lights use the live client contract (makeLight:
// color 0xffd9a0 warm, intensity 16, range 10) at the exact live -l positions.
import{createServer}from"node:http";import{readFileSync,mkdirSync}from"node:fs";import{join,normalize}from"node:path";import{createHash}from"node:crypto";import{chromium}from"playwright";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",RETEX=join(ROOT,"agents/arthur/mason/glb-retex"),ASSETS=join(ROOT,"agents/arthur/assets"),OUT=join(ROOT,"agents/arthur/reviews/night-nw");mkdirSync(OUT,{recursive:true});
// [name, file, dir, sha256[:16], x, y, z, yaw] — from live census tuples
const specs=[
 ["garden-0011","work_1691_garden.glb",RETEX,"01a4e80c02f03de7",-86.10,0.05,52.70,2.35619449],
 ["garden-0019","work_1639_garden.glb",RETEX,"d916f37355701255",-79.35,0.04,63.55,2.35619449],
 ["garden-0032","work_1652_garden.glb",RETEX,"38e4718c5efd1374",-70.89,0.03,72.47,2.35619449],
 ["garden-0045","work_1665_garden.glb",RETEX,"856d56746e3a42a3",-61.50,0.03,80.92,2.35619449],
 ["garden-0058","work_1678_garden.glb",RETEX,"e54ee386f08a7c21",-53.22,0.03,72.69,2.35619449],
 ["lavender-0006","work_1686_lavender.glb",RETEX,"26f0eed96a94e0d2",-74.31,-0.01,24.71,2.35619449],
 ["lavender-0027","work_1647_lavender.glb",RETEX,"d4ab74d0d530b4a8",-53.91,0.03,48.17,2.35619449],
 ["lavender-0040","work_1660_lavender.glb",RETEX,"56b752abf7f5eba4",-39.58,0.04,62.89,2.35619449],
 ["lavender-0053","work_1673_lavender.glb",RETEX,"d8fac6d1e0279f07",-24.83,0.04,77.24,2.35619449],
 ["orchard-0012","work_1692_orchard.glb",RETEX,"dc4d7059985e47a8",-88.73,0.02,35.80,2.35619449],
 ["orchard-0020","work_1640_orchard.glb",RETEX,"24bcfc6a15d55613",-75.07,0.04,43.89,2.35619449],
 ["orchard-0033","village_cultivation_orchard_0033.glb",ASSETS,"a3bb3487b355bf2d",-61.87,0.03,61.87,2.35619449],
 ["orchard-0046","work_1666_orchard.glb",RETEX,"ec93dc09acc0ddfa",-43.21,0.04,82.19,2.35619449],
 ["orchard-0059","work_1679_orchard.glb",RETEX,"8d3959f01e32c335",-30.84,-0.00,91.62,2.35619449],
 ["mosaic-0052","work_1669_mosaic.glb",RETEX,"83c4817f73507493",-38.97,0.01,22.50,-2.35619449],
 ["amphi","village_amphi3.glb",ASSETS,"0904c5da232cea1b",-23.32,0.04,37.31,0],
 ["skene","village_skene3.glb",ASSETS,"3a62ee83d559b3fa",-23.32,0.04,48.05,3.141592653589793],
 ["echoarch","village_echoarch3.glb",ASSETS,"f38d01bb0ce1e9bf",-18.50,0.05,57.10,5.027],
 ["mobius","village_mobius3.glb",ASSETS,"04d088e12a009993",-4.18,0.00,39.78,0],
 ["windmill","village_windmill3.glb",ASSETS,"0993836012d1b17d",-40.00,0.00,0.00,1.5707963267948966],
 ["nw-lane","village_nw_approach1.glb",ASSETS,"d46a60fb3ad301e3",0,0,0,0],
] as const;
const files=new Map<string,Buffer>();
for(const[n,f,dir,h]of specs){const b=readFileSync(join(dir as string,f as string));const got=createHash("sha256").update(b).digest("hex").slice(0,16);if(got!==(h as string))throw Error(`${n} hash drift: ${got} != ${h}`);files.set(n,b);}
// live -l light entities on the NW leg (exact census positions)
const LAMPS=[[-39.09,1.96,30.26],[-47.96,1.96,46.71]] as const;
const THREE_ROOT=join(ROOT,"node_modules/three"),threeModule=join(THREE_ROOT,"build/three.module.js");
const html=(sky:string,fogc:string,fogn:number,fogf:number)=>`<!doctype html><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';import{GLTFLoader}from'/examples/jsm/loaders/GLTFLoader.js';
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1280,800);r.outputColorSpace=THREE.SRGBColorSpace;document.body.appendChild(r.domElement);
const s=new THREE.Scene();s.background=new THREE.Color('${sky}');s.fog=new THREE.Fog('${fogc}',${fogn},${fogf});
const cam=new THREE.PerspectiveCamera(50,1280/800,.1,600);
const hemi=new THREE.HemisphereLight(0x25304a,0x0c0e09,0.5);s.add(hemi);
const moon=new THREE.DirectionalLight(0x8ea2c8,0.55);moon.position.set(-80,120,60);s.add(moon);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshStandardMaterial({color:0x39442c,roughness:1}));ground.rotation.x=-Math.PI/2;s.add(ground);
const loader=new GLTFLoader();
const specs=${JSON.stringify(specs.map(([n,_f,_d,_h,x,y,z,yaw])=>({n,x,y,z,yaw})))};
for(const q of specs){const g=(await loader.loadAsync('/model/'+q.n+'.glb')).scene;g.position.set(q.x,q.y,q.z);g.rotation.y=q.yaw;s.add(g)}
const LAMPS=${JSON.stringify(LAMPS)};
for(const[px,py,pz]of LAMPS){const l=new THREE.PointLight(0xffd9a0,16,10,2);l.position.set(px,py,pz);s.add(l);
 const b=new THREE.Mesh(new THREE.SphereGeometry(0.14,8,8),new THREE.MeshBasicMaterial({color:0xffd9a0}));b.position.set(px,py,pz);s.add(b)}
window.view=(px,py,pz,tx,ty,tz)=>{cam.position.set(px,py,pz);cam.lookAt(tx,ty,tz);r.render(s,cam)};
window.ready=true;
</script>`;
const server=createServer((req,res)=>{const u=(req.url??'/').split('?')[0];try{
 if(u==='/'){res.setHeader('content-type','text/html');res.end(html(PALETTE.sky,PALETTE.fog,60,240));return}
 if(u==='/three.module.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(threeModule));return}
 if(u==='/three.core.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(join(THREE_ROOT,'build/three.core.js')));return}
 if(u.startsWith('/examples/jsm/')){const p=join(THREE_ROOT,normalize(u.slice(1)));let x=readFileSync(p,'utf8').replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');res.setHeader('content-type','text/javascript');res.end(x);return}
 const m=u.match(/^\/model\/(.+)\.glb$/);if(m&&files.has(m[1])){res.setHeader('content-type','model/gltf-binary');res.end(files.get(m[1]));return}
 res.statusCode=404;res.end('not found')}catch(e){res.statusCode=500;res.end(String(e))}});
const PALETTE={sky:process.env.NIGHT_SKY??"#0a0d18",fog:process.env.NIGHT_SKY??"#0a0d18"}; // standing cool moonlit; NIGHT_SKY env = palette-study variant (render-only, never applied)
const OUTDIR=process.env.NIGHT_OUT??OUT;mkdirSync(OUTDIR,{recursive:true});
await new Promise<void>(q=>server.listen(0,'127.0.0.1',q));const addr=server.address();if(!addr||typeof addr==='string')throw Error('no addr');
const b=await chromium.launch({headless:true});
try{const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>console.error('PAGEERROR',e.message));
 await p.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:'networkidle'});await p.waitForFunction(()=>window.ready===true);
 const V:(string|number)[][]=[
  // approach vantage: on the leg at lamp-002, eye height, looking outbound to the lavender arrival
  ["approach-outbound",-45.5,2.4,44.0,-62,1.5,60],
  // arrival: just past lamp-002 looking into the district interior
  ["arrival-interior",-52,2.6,50,-68,1.5,66],
  // district center view, looking home down the leg toward the lit core
  ["center-homebound",-62,3.2,63,-20,2,20],
  // district center, looking deeper into the fields
  ["center-deep",-60,3.2,60,-85,1,70],
  // wide composition: high vantage over the district with the plaza glow behind
  ["wide-aerial",-30,55,30,-62,0,62],
 ];
 for(const[name,...c]of V){await p.evaluate((cs)=>(window as any).view(...cs),c as any[]);await p.screenshot({path:join(OUTDIR,`${name}.png`)});console.log('shot',name)}
 console.log('rendered',OUTDIR);
}finally{await b.close();server.close()}
