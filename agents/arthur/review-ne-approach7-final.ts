// review-ne-approach7.ts — approach-7 D2 re-judge rig. review-night-ne.ts
// chassis (the rig that flagged D2): same vantages, same 33-live-light
// contract, hash-bound context models — updated to the 2026-09-06 259-entity
// census epoch (inn/stable evolved by siblings; milkstand re-owned by dress,
// same lib/pose). The subject line carries the NEW lane bytes (dc52264c…).
// BEFORE evidence of record: reviews/night-ne/ (night-2, a27bc9a2).
import{createServer}from"node:http";import{readFileSync,mkdirSync}from"node:fs";import{join,normalize}from"node:path";import{createHash}from"node:crypto";import{chromium}from"playwright";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",RETEX=join(ROOT,"agents/arthur/mason/glb-retex"),ASSETS=join(ROOT,"agents/arthur/assets"),OUT=join(ROOT,"agents/arthur/reviews/ne-approach7");mkdirSync(OUT,{recursive:true});
// [name, file, dir, sha256[:16], x, y, z, yaw] — census-exact tuples, hashes re-verified vs live libs
const specs=[
 ["gate-e","village_gate.glb",ASSETS,"d1b90d6fc66b2db8",19.50,0.00,0.00,1.5707963267948966],
 ["waystone-e","village_waystone3.glb",ASSETS,"2f006e218ffbe97e",22.10,0.00,0.00,3.141592653589793],
 ["b14-east-gate-dawn-fan","village_artwalk_b14.glb",ASSETS,"c67c0402bbfb7fd8",19.73,2.72,0.00,1.5707963267948966],
 ["inn","village_inn3.glb",ASSETS,"6e6ff2d08df9b3fb",36.00,0.00,0.00,-1.5707963267948966],
 ["b2-inn-lintel","village_artwalk_b2_lintel.glb",ASSETS,"875942618767052c",32.97,2.78,0.00,-1.5707963267948966],
 ["b2-inn-threshold","village_artwalk_b2_threshold.glb",ASSETS,"cc80fa377494a76c",33.05,0.20,0.00,-1.5707963267948966],
 ["stable","village_stable3.glb",ASSETS,"98f2d5b6e1b6c429",43.00,0.00,0.00,-1.5707963267948966],
 ["b8-stable-harmonic-rein","village_artwalk_b8.glb",ASSETS,"cba8d0efb0518938",45.16,2.22,-0.00,-1.5707963267948966],
 ["sign-stable-001","village_sign_stable3.glb",ASSETS,"afee37dd9a5b5d67",40.90,0.00,0.00,-1.5707963267948966],
 ["stablebench","village_stablebench3.glb",ASSETS,"c24b7628da5f74ae",42.00,0.00,6.00,-1.5707963267948966],
 ["cellardoor","village_cellardoor3.glb",ASSETS,"5608e9f8ccdeac75",36.00,-0.05,5.55,0],
 ["woodyard","night7-woodyard-live.glb","/tmp","80c2e14291308533",16.00,0.00,31.00,-2.669815142409043],
 ["b11-woodyard-heartwood-measure","village_artwalk_b11.glb",ASSETS,"aa5f2550365c1f7f",16.36,0.75,31.71,-2.669815142409043],
 ["goats","village_goats3.glb",ASSETS,"c47861e473e6f088",34.00,0.00,13.00,-1.2],
 ["pendulum","village_pendulum3.glb",ASSETS,"0a3120b294d669ed",25.01,-0.04,25.90,0],
 // spiralfolly: LIVE store bytes pinned (struct lane's uncommitted local
 // rebuild has drifted the assets/ copy; census lib stays 20c515a0 — the
 // store serves its DRACO store-min shadow, hashed here as fetched)
 ["spiralfolly","appr7-spiralfolly-live.glb","/tmp","8e7ce41d8d37d21e",46.11,-0.04,33.50,0],
 ["harvestcart","village_harvestcart3.glb",ASSETS,"ee30d6709625bf2f",12.00,0.00,36.00,-2.6],
 ["b31-sheaf-tally","village_artwalk_b31.glb",ASSETS,"9e6d3d13f1e8d380",12.00,0.00,36.00,-2.6],
 ["milkstand","village_milkstand3.glb",ASSETS,"bd2e613a10b9762e",22.50,0.00,33.00,-2.4],
 ["b33-milking-order","village_artwalk_b33.glb",ASSETS,"ee2af59a36ee41ca",22.50,0.00,33.00,-2.4],
 ["churn","village_churn3.glb",ASSETS,"a509c3d2c1f3026e",20.00,0.00,35.00,-2.2],
 ["b32-morning-measure","village_artwalk_b32.glb",ASSETS,"adb5459562eb21b2",20.00,0.00,35.00,-2.2],
 ["potter","village_potter3.glb",ASSETS,"dad7c82efbf3202b",26.00,0.00,40.50,-2.5834592128922376],
 ["b3-ruled-porch","village_artwalk_b3.glb",ASSETS,"e1b66075d8e911e7",24.50,0.00,41.02,-2.5834592128922376],
 ["kiln","village_kiln3.glb",ASSETS,"4d8ef8fc0b0955de",31.00,0.00,39.00,-2.4784945651581642],
 ["b12-kiln-heat-contours","village_artwalk_b12.glb",ASSETS,"1ad2a6139373b973",30.29,0.00,38.09,-2.4784945651581642],
 ["charcoal","village_charcoal3.glb",ASSETS,"1d9a1c2d95f785b6",34.50,0.00,34.00,-2.4784945651581642],
 ["mosaic-0036","work_1643_mosaic.glb",RETEX,"1655ae806c3b8fe3",38.97,-0.02,22.50,-2.35619449],
 ["statuary-0005","work_1685_statuary.glb",RETEX,"dd0985508d0157c2",70.38,-0.03,22.87,-2.35619449],
 ["statuary-0026","work_1646_statuary.glb",RETEX,"ba69e7158262698a",62.06,-0.03,40.30,-2.35619449],
 ["statuary-0039","work_1659_statuary.glb",RETEX,"61d7a70c8b530b83",49.52,-0.03,54.99,-2.35619449],
 ["statuary-0052","work_1672_statuary.glb",RETEX,"8c560202486fa0cd",33.60,-0.02,65.93,-2.35619449],
 ["hamlet-0007","work_1687_hamlet.glb",RETEX,"e2f134cfba7f9e86",86.67,-0.02,15.48,-2.35619449],
 ["hamlet-0015","work_1635_hamlet.glb",RETEX,"353dd6fbcf5215c3",79.29,-0.02,38.52,-2.35619449],
 ["hamlet-0028","work_1648_hamlet.glb",RETEX,"032b6e24f4c4a142",65.40,0.00,58.88,-2.35619449],
 ["hamlet-0041","work_1661_hamlet.glb",RETEX,"473f671c274ef653",46.63,-0.02,74.63,-2.35619449],
 ["hamlet-0054","work_1674_hamlet.glb",RETEX,"766992061b3a8e5f",24.26,0.01,84.59,-2.35619449],
 ["cloister-0008","work_1688_cloister.glb",RETEX,"c6014616c233ac01",94.15,-0.03,30.59,-0.785398163],
 ["cloister-0016","work_1636_cloister.glb",RETEX,"4efdd4602c62966b",82.07,-0.02,55.36,-0.785398163],
 ["cloister-0029","work_1649_cloister.glb",RETEX,"afa06673d4f1831f",63.64,-0.01,75.84,-0.785398163],
 ["cloister-0042","work_1662_cloister.glb",RETEX,"255739e0c2a5d391",40.27,-0.03,90.44,-0.785398163],
 ["cloister-0055","work_1675_cloister.glb",RETEX,"2cc686bfee6a1c17",13.78,-0.02,98.04,-0.785398163],
 // subject: the approach-7 D2 rebuild
 ["ne-lane-002","village_ne_approach2.glb",ASSETS,"dc52264c04cfe5bb",0.00,0.00,0.00,0],
] as const;
const files=new Map<string,Buffer>();
for(const[n,f,d,h]of specs){const b=readFileSync(join(d as string,f as string));const got=createHash("sha256").update(b).digest("hex").slice(0,16);if(got!==(h as string))throw Error(`${n} hash drift: ${got} != ${h}`);files.set(n,b);}
// ALL 33 live -l light entities (census-exact, 2026-09-06 epoch — same set as night-2; verified steady)
const LAMPS=[[9.9,1.96,0],[0,1.96,9.9],[0,1.96,-9.9],[-9.9,1.96,0],[39.71,1.96,27],[32.89,1.96,50.15],[-39.09,1.96,30.26],[-47.96,1.96,46.71],[-25.2,1.96,-30.67],[-34.69,1.96,-43.14],[27,1.145,-27],[32.53,2.45,-32.53],[35.51,2.30,-23.89],[38.36,2.42,-38.36],[30.48,2.28,-41.79],[21.61,1.50,-7.56],[0,1.20,0],[40.8,7.30,-16.48],[47.96,12.90,-31.90],[16.48,1.50,-40.80],[-8.88,2.10,-25.62],[-23.63,1.62,-21.97],[-25.76,2.10,18.82],[9,2.50,-26],[36,2.35,0],[30.5,1.10,40.40],[8.82,2.20,25.43],[-6.22,1.75,6.22],[25.68,1.40,39.99],[-22.68,2.10,-16.76],[43,1.90,1.80],[-8.88,2.10,25.62],[-3,2.20,-4.30]] as const;
const THREE_ROOT=join(ROOT,"node_modules/three"),threeModule=join(THREE_ROOT,"build/three.module.js");
const html=()=>`<!doctype html><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';import{GLTFLoader}from'/examples/jsm/loaders/GLTFLoader.js';import{DRACOLoader}from'/examples/jsm/loaders/DRACOLoader.js';
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1280,800);r.outputColorSpace=THREE.SRGBColorSpace;document.body.appendChild(r.domElement);
const s=new THREE.Scene();const SKY='#0a0d18';s.background=new THREE.Color(SKY);s.fog=new THREE.Fog(SKY,60,260);
const cam=new THREE.PerspectiveCamera(50,1280/800,.1,700);
const hemi=new THREE.HemisphereLight(0x25304a,0x0c0e09,0.5);s.add(hemi);
const moon=new THREE.DirectionalLight(0x8ea2c8,0.55);moon.position.set(-80,120,60);s.add(moon);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshStandardMaterial({color:0x39442c,roughness:1}));ground.rotation.x=-Math.PI/2;s.add(ground);
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
await new Promise<void>(q=>server.listen(0,"127.0.0.1",q));const addr=server.address();if(!addr||typeof addr==='string')throw Error('no addr');
const b=await chromium.launch({headless:true});
try{const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>console.error('PAGEERROR',e.message));p.on('console',m=>{if(m.type()==='error')console.error('CONSOLE',m.text())});
 await p.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:'networkidle'});await p.waitForFunction(()=>window.ready===true,{timeout:120000});
 const V:(string|number)[][]=[
  // on-lane at bead 7 looking toward the lane end (walker's eye, outbound)
  ["final-outbound",28.78,1.7,56.29,18.63,1.6,69.67],
  // at the lane end looking home toward lamp-002 (arrival reading the way back)
  ["final-homebound",18.63,1.7,69.67,32.89,1.9,50.15],
  // mid home-straight, looking outbound along the last half of the stretch
  ["final-mid-outbound",26.0,1.7,61.0,18.63,1.6,69.67],
 ];
 for(const[name,...c]of V){await p.evaluate((cs)=>(window as any).view(...cs),c as any[]);await p.screenshot({path:join(OUT,`${name}.png`)});console.log('shot',name)}
 console.log('rendered',OUT);
}finally{await b.close();server.close()}
