// city16-wave1-packet.ts — CITY loop law 9 wave eye-gate packet (city-16).
// Renders BEFORE (register "From" tuples) vs AFTER (live 2026-09-07 census tuples)
// overhead maps of the r33-55 processional band + destination districts.
// Zero world mutation: local bytes only, hash-gated, read-only census input.
// GLB list = the 13 EXECUTED relocation works + amphi (HOLD) + mile template (HOLD).
// Mosaics + farm-prop riders (HOLD-for-Bill, never moved) render as labeled bbox
// ghosts so Bill sees exactly what still occupies the band.
import{createServer}from"node:http";import{readFileSync,mkdirSync}from"node:fs";import{join}from"node:path";import{createHash}from"node:crypto";import{chromium}from"playwright";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",A=join(ROOT,"agents/arthur/assets"),OUT=join(ROOT,"agents/arthur/reviews/city16-wave1");mkdirSync(OUT,{recursive:true});
const SHA=(p:string)=>createHash("sha256").update(readFileSync(p)).digest("hex");
// pose tuples: before = CITY-PLAN register "From" (pre-relocation seats, from register rows);
// after = live census 2026-09-07 (this tick, /tmp/city16-census.json, all hash-verified below).
type Spec={f:string;h:string;before:[number,number,number,number];after:[number,number,number,number];ghost?:boolean;label:string;lx?:number;lz?:number};
const specs:Spec[]=[
 {f:"village_soundmirror3.glb",h:"f313e59a69bff540",before:[28.7,0,-18,0],after:[35.46,-0.0331,-55.66,0],label:"soundmirror"},
 {f:"village_pendulum3.glb",h:"c32a35a8cc1a433d",before:[25.01,-0.041,25.9,0],after:[13.16,-0.0479,-60.59,-0.2138],label:"pendulum"},
 {f:"village_millrace3.glb",h:"6e82dd2e1eb8403e",before:[-37.59,-0.0453,-13.68,-Math.PI/2],after:[-76.707,-0.0256,6.711,1.75162],label:"millrace"},
 {f:"village_reedpool3.glb",h:"d3a81b79cb6fe58c",before:[-17.08,0,-38.37,-Math.PI/2],after:[9.723,-0.0591,-90.982,0],label:"reedpool"},
 {f:"village_skymirror3.glb",h:"782eb8643e03780d",before:[24,-0.054,-35.5,0],after:[-59.89,-0.0289,-66.51,0],label:"skymirror"},
 {f:"village_amphi3.glb",h:"95a98c748df77020",before:[-23.32,0.04,37.31,0],after:[-23.32,0.0398,37.31,0],label:"AMPHI (HOLD: no lawful NE seat)"},
 {f:"village_beacon3.glb",h:"03d278be72677877",before:[40.8,-0.044,-16.48,0],after:[60.911,0.0068,-66.7645,-0.5236],label:"beacon"},
 {f:"village_observatory3.glb",h:"07d18163d1ecd27d",before:[16.48,-0.0524,-40.8,-0.3839],after:[-39.811,-0.0309,-87.356,0.42761],label:"observatory"},
 {f:"village_angler3.glb",h:"6ee5b4b06bc07d5e",before:[-23.6,0,-38.37,-Math.PI/2],after:[3.203,-0.0347,-90.982,0],label:"angler"},
 {f:"village_wayfarershalt3.glb",h:"bb227fd67ca93385",before:[41.1,-0.0467,-23.8,0.1278],after:[10.273,0.0029,68.737,2.99324],label:"needlerest"},
 {f:"village_skene3.glb",h:"df7f7c434c0b87b2",before:[-23.32,0.0447,48.05,Math.PI],after:[8.258,-0.0026,78.567,3.24631],label:"skene"},
 {f:"village_potter3.glb",h:"2062c4468996b2bb",before:[26,0,40.5,-2.5835],after:[23.7764,-0.004,7.7254,-1.89754],label:"potter"},
 {f:"village_kiln3.glb",h:"4d8ef8fc0b0955de",before:[31,0,39,-2.4785],after:[19.1587,-0.0207,22.432,-2.44324],label:"kiln"},
 {f:"village_charcoal3.glb",h:"1d9a1c2d95f785b6",before:[34.5,0,34,-2.4785],after:[22.724,-0.0416,27.274,-2.47849],label:"charcoal"},
 {f:"village_mile_nw.glb",h:"9459eaa30382fb3c",before:[-26.618,-0.0472,-38.8043,5.36252],after:[-26.618,-0.0472,-38.8043,5.36252],label:"mile-sw-005 (HOLD)"},
 {f:"village_mile_nw.glb",h:"9459eaa30382fb3c",before:[-30.2796,-0.0527,-36.0199,5.36252],after:[-30.2796,-0.0527,-36.0199,5.36252],label:"mile-sw-006 (HOLD)"},
 {f:"village_mile_nw.glb",h:"9459eaa30382fb3c",before:[36.8751,-0.0328,29.4233,0.55257],after:[36.8751,-0.0328,29.4233,0.55257],lx:36,lz:38,label:"mile-ne-003 (HOLD)"},
 {f:"village_mile_nw.glb",h:"9459eaa30382fb3c",before:[40.7905,-0.0255,27.0089,0.55257],after:[40.7905,-0.0255,27.0089,0.55257],lx:45.5,lz:32,label:"mile-ne-004 (HOLD)"},
];
// bbox ghosts: entities that NEVER moved (register HOLD rows) — labeled orange rects.
type Ghost={id:string;x:number;z:number;yaw:number;w:number;d:number;cx:number;cz:number;lx?:number;lz?:number;label:string};
const ghosts:Ghost[]=[
 {id:"mosaic-0036",x:38.9711,z:22.5,yaw:-2.35619,w:20.9,d:20.9,cx:0,cz:0,lx:29.5,lz:13.5,label:"mosaic-0036 (HOLD: wave-2)"},
 {id:"mosaic-0052",x:-38.9711,z:22.5,yaw:-2.35619,w:20.9,d:20.9,cx:0,cz:0,label:"mosaic-0052 (HOLD: wave-2)"},
 {id:"mosaic-0059",x:-38.9711,z:-22.5,yaw:-2.35619,w:20.9,d:20.9,cx:0,cz:0,label:"mosaic-0059 (HOLD: wave-2)"},
 {id:"harvestcart",x:12,z:36,yaw:-2.6,w:2.6,d:1.5,cx:0,cz:0,lx:6,lz:44.5,label:"harvestcart+rider (HOLD: eye-gate)"},
 {id:"milkstand",x:22.5,z:33,yaw:-2.4,w:1.8,d:1.2,cx:0,cz:0,lx:24,lz:26,label:"milkstand+rider (HOLD)"},
 {id:"churn",x:20,z:35,yaw:-2.2,w:1.2,d:1.2,cx:0,cz:0,lx:17,lz:41,label:"churn+rider (HOLD)"},
];
// hash-gate every file (artwalk-34 law: exact bytes before binding review material)
const files=new Map<string,Buffer>();
for(const s of specs){const p=join(A,s.f);const h=SHA(p);if(!h.startsWith(s.h))throw Error(`hash drift ${s.f}: ${h.slice(0,16)} != ${s.h}`);files.set(s.label,readFileSync(p));}
const THREE_ROOT=join(ROOT,"node_modules/three"),threeModule=join(THREE_ROOT,"build/three.module.js");
const html=`<!doctype html><html><head><meta charset="utf-8"></head><style>html,body{margin:0;overflow:hidden}canvas{display:block;transform:scaleX(-1)}#labels{position:absolute;inset:0;pointer-events:none;font:11px/1.25 ui-monospace,monospace;color:#0d1b26}#labels div{position:absolute;transform:translate(-50%,-50%);background:rgba(255,255,255,.82);border:1px solid #5b7286;border-radius:3px;padding:1px 4px;white-space:nowrap}#titles{position:absolute;left:12px;top:10px;font:700 15px/1.4 ui-monospace,monospace;color:#0d1b26;background:rgba(255,255,255,.75);padding:4px 8px;border-radius:4px}</style><script type="module">
import * as THREE from '/three.module.js';import{GLTFLoader}from'/examples/jsm/loaders/GLTFLoader.js';
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1400,1100);r.outputColorSpace=THREE.SRGBColorSpace;document.body.appendChild(r.domElement);
const s=new THREE.Scene();s.background=new THREE.Color(0xdfe8ee);const cam=new THREE.PerspectiveCamera(50,1400/1100,.1,1000);
// north-up AND east-right: bird's-eye from due SOUTH looking north
// (view from the map's south edge: north = up-screen, east = right-screen;
// no CSS mirror, no chirality flip — an honest perspective view).
const world=new THREE.Group();s.add(world);world.updateMatrixWorld(true);
const hemi=new THREE.HemisphereLight(0xffffff,0x55606a,2.2);s.add(hemi);const sun=new THREE.DirectionalLight(0xfff1d4,2.6);sun.position.set(80,120,50);s.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(460,460),new THREE.MeshStandardMaterial({color:0x87977f,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;s.add(ground);
// band guides: r20 village-ring inner edge, r33, r55 (processional band), r100 district outer
for(const [rad,col] of [[20.7,0x2e5d3f],[33,0x33608a],[55,0x33608a],[100,0x8a6d33]]){
 const pts=[];for(let i=0;i<=128;i++){const a=i/128*Math.PI*2;pts.push(Math.cos(a)*rad,0.09,Math.sin(a)*rad)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
 world.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:col})));}
const root=new THREE.Group();world.add(root);
const ghosts=${JSON.stringify(ghosts)};
const specs=${JSON.stringify(specs.map(x=>({label:x.label,before:x.before,after:x.after})))};
const loader=new GLTFLoader();
const loaded={};
for(const q of specs){if(loaded[q.label])continue;const g=(await loader.loadAsync('/model/'+encodeURIComponent(q.label)+'.glb')).scene;g.traverse((o)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});root.add(g);loaded[q.label]=g;}
for(const gh of ghosts){
 const wx=gh.x+gh.cx*Math.cos(gh.yaw)+gh.cz*Math.sin(gh.yaw),wz=gh.z-gh.cx*Math.sin(gh.yaw)+gh.cz*Math.cos(gh.yaw);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(gh.w,gh.d),new THREE.MeshBasicMaterial({color:0xe07820,transparent:true,opacity:.4,side:THREE.DoubleSide}));
 m.rotation.x=-Math.PI/2;m.rotation.z=-gh.yaw;m.position.set(wx,0.12,wz);root.add(m);
 const e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:0xa04d10}));e.rotation.copy(m.rotation);e.position.copy(m.position);root.add(e);}
window.setView=(mode)=>{
 for(const q of specs){const g=loaded[q.label];const p=(mode==='before'?q.before:q.after);
  g.position.set(p[0],p[1],p[2]);g.rotation.set(0,p[3],0);g.visible=true;}
 // ghost HOLD items never move (except amphi shown as real GLB at its held seat)
 cam.position.set(0,213,78);cam.up.set(0,1,0);cam.lookAt(0,0,0);r.render(s,cam);
 // project labels for HOLD occupants + districts + moved works (after-frame only labels HOLD + districts)
 const L=document.getElementById('labels');L.innerHTML='';
 const tag=(x,z,txt,strong=false)=>{const v=new THREE.Vector3(x,2,z).applyMatrix4(world.matrixWorld).project(cam);
  const d=document.createElement('div');d.textContent=txt;d.style.left=(1400-(v.x+1)/2*1400)+'px';d.style.top=((-v.y+1)/2*1100)+'px';
  if(strong){d.style.background='rgba(255,214,140,.9)';d.style.fontWeight='700'}L.appendChild(d);};
 for(const gh of ghosts)tag(gh.lx??gh.x,gh.lz??gh.z,gh.label,true);
 for(const q of specs){if(q.label.includes('HOLD')){const p=(mode==='before'?q.before:q.after);tag(q.lx??p[0],q.lz??p[2],q.label,true)}}
 tag(0,-84,'SE WILD',false);tag(0,84,'NE CRAFT',false);tag(-84,0,'NW CULTIVATION',false);tag(84,0,'SW CONTEMPLATIVE',false);
 tag(0,55,'N SPOKE',false);tag(44,0,'E SPOKE',false);tag(0,-44,'S SPOKE',false);tag(-44,0,'W SPOKE',false); const t=document.getElementById('titles');t.textContent=(mode==='before'?'BEFORE — pre-relocation seats (register From, r33-55 off-spoke) | compass: in-frame SPOKE labels are authoritative':'AFTER — live census 2026-09-07: 13 works seated (orange = HOLD-for-Bill) | compass: in-frame SPOKE labels are authoritative');
 window.ready=mode;};
window.ready='init';
</script><div id="titles"></div><div id="labels"></div>`;
const server=createServer((req,res)=>{const u=(req.url??'/').split('?')[0];try{
 if(u==='/'){res.setHeader('content-type','text/html');res.end(html);return}
 if(u==='/three.module.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(threeModule));return}
 if(u==='/three.core.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(join(THREE_ROOT,'build/three.core.js')));return}
 if(u.startsWith('/examples/jsm/')){const p=join(THREE_ROOT,u.slice(1));let x=readFileSync(p,'utf8').replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');res.setHeader('content-type','text/javascript');res.end(x);return}
 const m=u.match(/^\/model\/(.+)\.glb$/);if(m){const k=decodeURIComponent(m[1]);if(files.has(k)){res.setHeader('content-type','model/gltf-binary');res.end(files.get(k));return}}
 res.statusCode=404;res.end('not found')}catch(e){res.statusCode=500;res.end(String(e))}});
await new Promise<void>(q=>server.listen(0,'127.0.0.1',q));const addr=server.address();if(!addr||typeof addr==='string')throw Error('no addr');
const b=await chromium.launch({headless:true});
try{const p=await b.newPage({viewport:{width:1400,height:1100}});p.on('pageerror',e=>console.error('PAGEERROR',e.message));
 await p.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:'networkidle'});
 await p.waitForFunction(()=>window.ready==='init');
 const diag=async(tag)=>{const d=await p.evaluate(()=>({labels:document.querySelectorAll('#labels div').length,title:(document.getElementById('titles')?.textContent??'NULL').slice(0,36),firstLabel:(document.querySelector('#labels div')?.textContent??'NONE').slice(0,24),firstBox:(()=>{const el=document.querySelector('#labels div');if(!el)return'NONE';const b=el.getBoundingClientRect();return[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)].join(',')})(),tf:getComputedStyle(document.querySelector('canvas')).transform}));console.log('DIAG',tag,JSON.stringify(d));};
 await p.evaluate(()=>window.setView('before'));await p.waitForTimeout(150);await diag('before');await p.screenshot({path:join(OUT,'before.png')});
 await p.evaluate(()=>window.setView('after'));await p.waitForTimeout(150);await diag('after');await p.screenshot({path:join(OUT,'after.png')});
 console.log('rendered',OUT);}finally{await b.close();server.close();}
