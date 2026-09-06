// review-night-sw.ts — night-N lane, wakeup 4: SW Contemplative district night pass.
// Generated from /tmp/night4-census.json (241 entities, 2026-09-06) — zero hand-transcription.
// All 21 SW subjects hash-matched to LOCAL bytes (assets/ + mason/glb-retex/) — no store-scope
// caveat needed this district. Hash gate: sha256[:16]==census lib token.
// Hash-bound local render evidence (NOT an in-world camera frame): every subject
// GLB's sha256[:16] checked before rendering; poses = exact live census tuples
// (2026-09-06, /tmp/night3-census.json, 239 entities). Lights = live client
// contract (makeLight: 0xffd9a0, intensity 16, range 10) at ALL 38 live world
// light positions so horizon glow is rig-true. Subject table generated
// programmatically from census + local hash map (zero hand-transcription).
// Light-anchor entities (lib='') render as lamps only.
// Sky study facet 3 (render-only, NEVER applied): NIGHT_MOON=1 lifts hemi+moon
// ambient — tests whether a moonlight lift rescues depth material identity
// (the recurring night-1/night-2 "material truth PARTIAL" observation).
import{createServer}from"node:http";import{readFileSync,mkdirSync}from"node:fs";import{join,normalize}from"node:path";import{createHash}from"node:crypto";import{chromium}from"playwright";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",RETEX=join(ROOT,"agents/arthur/mason/glb-retex"),ASSETS=join(ROOT,"agents/arthur/assets"),STORE="/tmp/night4-store",OUT=join(ROOT,"agents/arthur/reviews/night-sw");mkdirSync(OUT,{recursive:true});
// [name, file, dir, sha256[:16], x, y, z, yaw] — generated from live census tuples
const specs=[
 ["nx-dress-sw-gravel-001","village_dress_sw_gravel1.glb",ASSETS,"fd21de9ff797e249",-45.22,-0.05,-59.46,2.220931473],
 ["nx-gallery-mosaic-0059","work_1682_mosaic.glb",RETEX,"505bec0b589f786f",-38.971143,-0.04073522899,-22.5,-2.35619449],
 ["nx-mile-sw-005","village_mile_nw.glb",ASSETS,"9459eaa30382fb3c",-26.61799539,-0.0472,-38.80427617,5.362524127],
 ["nx-mile-sw-006","village_mile_nw.glb",ASSETS,"9459eaa30382fb3c",-30.27960461,-0.0527,-36.01992383,5.362524127],
 ["nx-struct-angler","village_angler3.glb",ASSETS,"b3dfb28ac98169fa",-23.6,-0.04798150019,-38.37,-1.570796327],
 ["nx-struct-millrace","village_millrace3.glb",ASSETS,"d2f46768af7dd0ae",-37.59,-0.04525692432,-13.68,-1.570796327],
 ["nx-struct-reedpool","village_reedpool3.glb",ASSETS,"d3a81b79cb6fe58c",-17.08,-0.04429882913,-38.37,-1.570796327],
 ["nx-struct-shelltower","village_shelltower3.glb",ASSETS,"bfdb1792374586e6",-2.65,-0.05202600129,-37.91,0.0697888773],
 ["nx-temple-labyrinth-0004","work_1684_labyrinth.glb",RETEX,"6ecff24946390a7d",-95.088981,0.002533928957,-23.708346,-2.35619449],
 ["nx-temple-labyrinth-0025","work_1645_labyrinth.glb",RETEX,"3273205286ab16bb",-79.283665,-0.01692882747,-57.602955,-2.35619449],
 ["nx-temple-labyrinth-0038","work_1658_labyrinth.glb",RETEX,"2d3d2032d3e806f8",-51.932088,-0.01968884329,-83.108713,-2.35619449],
 ["nx-temple-labyrinth-0051","work_1671_labyrinth.glb",RETEX,"d93deb842f9998da",-17.017521,-0.01475532431,-96.51116,-2.35619449],
 ["nx-temple-seed-0003","work_1657_seed.glb",RETEX,"710ec3e5c66a0378",-68.890997,-0.006158492639,-17.176455,-2.35619449],
 ["nx-temple-seed-0013","work_1657_seed.glb",RETEX,"710ec3e5c66a0378",-60.211415,-0.01652867798,-37.624268,-2.35619449],
 ["nx-temple-seed-0021","work_1657_seed.glb",RETEX,"710ec3e5c66a0378",-45.63792,-0.05444576041,-54.389155,-2.35619449],
 ["nx-temple-seed-0034","work_1657_seed.glb",RETEX,"710ec3e5c66a0378",-26.597068,-0.04801350921,-65.830054,-2.35619449],
 ["nx-temple-terrace-0035","work_1680_terrace.glb",RETEX,"e8417696ee8ab62b",-75.710797,-0.004640277976,-6.623836,-2.35619449],
 ["nx-temple-terrace-0037","work_1680_terrace.glb",RETEX,"e8417696ee8ab62b",-69.958369,0.001860191162,-29.695566,-2.35619449],
 ["nx-temple-terrace-0039","work_1680_terrace.glb",RETEX,"e8417696ee8ab62b",-17.09628,-0.034800337,-74.052125,-2.35619449],
 ["nx-temple-terrace-0040","work_1680_terrace.glb",RETEX,"e8417696ee8ab62b",-57.357928,-0.02292796769,-49.860486,-2.35619449],
 ["nx-temple-terrace-0049","work_1680_terrace.glb",RETEX,"e8417696ee8ab62b",-39.142894,-0.0366081293,-65.144715,-2.35619449],] as const;
const files=new Map<string,Buffer>();
for(const[n,f,d,h]of specs){const b=readFileSync(join(d as string,f as string));const got=createHash("sha256").update(b).digest("hex").slice(0,16);if(got!==(h as string))throw Error(`${n} hash drift: ${got} != ${h}`);files.set(n,b);}
// ALL 38 live light entities (census-exact, world-wide for rig-true horizon glow)
const LAMPS=[[-47.96,1.96,46.71],[-39.09,1.96,30.26],[-34.69,1.96,-43.14],[-25.758,2.101,18.823],[-25.2,1.96,-30.67],[-23.625,1.62,-21.971],[-22.677,2.1,-16.764],[-10,0,0],[-9.9,1.96,0],[-8.877,2.1,-25.619],[-8.877,2.1,25.619],[-6.217,1.75,6.217],[-3,2.2,-4.3],[0,0,-10],[0,0,0],[0,0,10],[0,1.2,0],[0,1.96,-9.9],[0,1.96,9.9],[8.815,2.2,25.429],[9,2.5,-26],[9.9,1.96,0],[10,0,0],[16.48,1.5,-40.8],[17.883,0.604,-25.449],[21.206,0.604,-22.125],[21.606,1.5,-7.557],[25.682,1.4,39.991],[27,1.145,-27],[30.476,2.283,-41.79],[30.5,1.1,40.4],[32.527,2.449,-32.527],[32.89,1.96,50.15],[35.511,2.298,-23.886],[36,2.35,0],[38.361,2.422,-38.361],[39.71,1.96,27],[40.8,7.3,-16.48],[43,1.9,1.8],[47.96,12.9,-31.9]] as const;
const THREE_ROOT=join(ROOT,"node_modules/three"),threeModule=join(THREE_ROOT,"build/three.module.js");
const MOON=process.env.NIGHT_MOON==="1";const STARS=process.env.NIGHT_STARS==="1";
const html=()=>`<!doctype html><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';import{GLTFLoader}from'/examples/jsm/loaders/GLTFLoader.js';import{DRACOLoader}from'/examples/jsm/loaders/DRACOLoader.js';
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1280,800);r.outputColorSpace=THREE.SRGBColorSpace;document.body.appendChild(r.domElement);
const s=new THREE.Scene();const SKY=(${MOON}?'#0e1626':'#0a0d18');s.background=new THREE.Color(SKY);s.fog=new THREE.Fog(SKY,60,260);
const cam=new THREE.PerspectiveCamera(50,1280/800,.1,700);
const hemi=new THREE.HemisphereLight(0x25304a,0x0c0e09,${MOON?0.9:0.5});s.add(hemi);
const moon=new THREE.DirectionalLight(0x8ea2c8,${MOON?1.1:0.55});moon.position.set(-80,120,60);s.add(moon);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshStandardMaterial({color:0x39442c,roughness:1}));ground.rotation.x=-Math.PI/2;s.add(ground);
if(${STARS}){for(let i=0;i<420;i++){const u=Math.random()*2-1,th=Math.random()*Math.PI*2,rr=Math.sqrt(1-u*u);
 const p=new THREE.Vector3(rr*Math.cos(th)*500,Math.abs(u)*500+15,rr*Math.sin(th)*500);
 const m=new THREE.MeshBasicMaterial({color:0xcfd8ec,fog:false});const st=new THREE.Mesh(new THREE.SphereGeometry(0.9,4,4),m);
 st.position.copy(p);s.add(st);if(i<63){m.color.set(0xffffff);st.scale.setScalar(2.4)}}}
const loader=new GLTFLoader();
const draco=new DRACOLoader();draco.setDecoderPath('/draco/');loader.setDRACOLoader(draco);
const specs=${JSON.stringify(specs.map(([n,_f,_d,_h,x,y,z,yaw])=>({n,x,y,z,yaw})))};
for(const q of specs){const g=(await loader.loadAsync('/model/'+q.n+'.glb')).scene;g.position.set(q.x,q.y,q.z);g.rotation.y=q.yaw;s.add(g)}
const LAMPS=${JSON.stringify(LAMPS)};
for(const[px,py,pz]of LAMPS){const l=new THREE.PointLight(0xffd9a0,16,10,2);l.position.set(px,py,pz);s.add(l);
 const b=new THREE.Mesh(new THREE.SphereGeometry(0.14,8,8),new THREE.MeshBasicMaterial({color:0xffd9a0}));b.position.set(px,py,pz);s.add(b)}
window.view=(px,py,pz,tx,ty,tz)=>{cam.position.set(px,py,pz);cam.lookAt(tx,ty,tz);r.render(s,cam)};
window.ready=true;
</script>`;
const server=createServer((req,res)=>{const u=(req.url??'/').split('?')[0];try{
 if(u==='/'){res.setHeader('content-type','text/html');res.end(html());return}
 if(u==='/three.module.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(threeModule));return}
 if(u==='/three.core.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(join(THREE_ROOT,"build/three.core.js")));return}
 if(u.startsWith('/examples/jsm/')){const p=join(THREE_ROOT,normalize(u.slice(1)));let x=readFileSync(p,'utf8').replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');res.setHeader('content-type','text/javascript');res.end(x);return}
 if(u.startsWith('/draco/')){const p=join(THREE_ROOT,normalize('examples/jsm/libs'+u));res.setHeader('content-type','application/wasm');res.end(readFileSync(p));return}
 const m=u.match(/^\/model\/(.+)\.glb$/);if(m&&files.has(m[1])){res.setHeader('content-type','model/gltf-binary');res.end(files.get(m[1]));return}
 res.statusCode=404;res.end('not found')}catch(e){res.statusCode=500;res.end(String(e))}});
const OUTDIR=process.env.NIGHT_OUT??OUT;mkdirSync(OUTDIR,{recursive:true});
await new Promise<void>(q=>server.listen(0,'127.0.0.1',q));const addr=server.address();if(!addr||typeof addr==='string')throw Error('no addr');
const b=await chromium.launch({headless:true});
try{const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>console.error('PAGEERROR',e.message));await p.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:'networkidle'});await p.waitForFunction(()=>window.ready===true,{timeout:120000});
 const V:(string|number)[][]=[
  // corridor inbound: on the SW leg az~321 at r~60 looking home toward the plaza
  ["corridor-inbound",-37.8,2.4,-46.6,0,2.5,0],
  // corridor outbound: near lamp-001 looking outward to temple grounds + gravel gate
  ["corridor-outbound-temple",-25.5,2.4,-31.5,-75,3,-70],
  // arrival: on the gravel path (dress-4) looking into the seed ring + terraces
  ["arrival-grounds",-45.5,2.5,-59.0,-62,2,-55],
  // district center, looking outward to the labyrinth belt (r98)
  ["center-outward",-50,3.0,-55,-80,2,-88],
  // district center, homebound toward plaza glow
  ["center-homebound",-50,3.2,-55,0,2,0],
  // wide composition: high vantage over the district
  ["wide-aerial",-48,80,-52,-58,0,-66],
 ];
 for(const[name,...c]of V){await p.evaluate((cs)=>(window as any).view(...cs),c as any[]);await p.screenshot({path:join(OUTDIR,`${name}.png`)});console.log('shot',name)}
 console.log('rendered',OUTDIR);
}finally{await b.close();server.close()}
