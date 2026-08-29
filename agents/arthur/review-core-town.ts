// review-core-town.ts — render the LIVE village core exactly as seated (all nx-town-* + original core).
import{createServer}from"node:http";import{readFileSync,mkdirSync}from"node:fs";import{join,normalize}from"node:path";import{createHash}from"node:crypto";import{chromium}from"playwright";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",A=join(ROOT,"agents/arthur/assets"),OUT=join(ROOT,"agents/arthur/reviews/core-town-live");mkdirSync(OUT,{recursive:true});
// live tuples (from placer slots + placed output)
const M=[
 ["nx-hearth","hearth.glb",0,0,0],
 ["nx-welcome","village_welcome3.glb",-3,0,-4.3,0],
 ["nx-carousel","village_carousel3.glb",-18,0,18,2.35619],
 ["nx-court","village_court3.glb",18.9,0,-14.8,-0.90756],
 ["nx-forge","village_forge3.glb",22.1,0,-8,0],
 ["nx-cistern","village_bcistern3.glb",15.7,0,-14.6,0],
 ["nx-tower","village_tower3.glb",14.1,0,16.9,0],
 ["nx-town-mapboard","village_mapboard3.glb",2.5,0,9.5,-2.9441970937399127],
 ["nx-town-market","village_market3.glb",-6.5,0,6.5,2.356194490192345],
 ["nx-town-monument","village_monument3.glb",-7,0,-7,0.7853981633974483],
 ["nx-town-hall","village_hall3.glb",9,0,-26,-0.31322457341772525],
 ["nx-town-longhouse","village_longhouse3.glb",9,0,26,-2.828368080172068],
 ["nx-town-tower-house","village_tower_house.glb",-9,0,26,2.828368080172068],
 ["nx-town-bunkhouse","village_bunkhouse.glb",-9,0,-26,0.31322457341772525],
 ["nx-town-row-cottage","village_row3.glb",-23,0,-17,0.9411511441487406],
 ["nx-town-garden-cottage","village_garden_cottage.glb",-26,0,19,2.2004415094410525],
 ["nx-town-inn","village_inn3.glb",36,0,0,-1.5707963267948966],
 ["nx-town-stable","village_stable3.glb",43,0,0,-1.5707963267948966],
 ["nx-town-windmill","village_windmill3.glb",-40,0,0,1.5707963267948966],
 ["nx-town-woodyard","village_woodyard3.glb",16,0,31,-2.669815142409043],
 ["nx-town-kiln","village_kiln3.glb",31,0,39,-2.4784945651581642],
 ["nx-town-potter","village_potter3.glb",26,0,40.5,-2.5834592128922376],
 ["nx-town-dyehouse","village_dyehouse3.glb",-23,0,-23,0.941],
 ["nx-town-shrine","village_shrine3.glb",-25,0,-4,1.4118119548622732],
 ["nx-town-belltower","village_belltower3.glb",6.5,0,6.5,-2.356194490192345],
 ["nx-town-gate-n","village_gate.glb",0,0,-19.5,0],
 ["nx-town-gate-s","village_gate.glb",0,0,19.5,Math.PI],
 ["nx-town-gate-e","village_gate.glb",19.5,0,0,Math.PI/2],
 ["nx-town-gate-w","village_gate.glb",-19.5,0,0,-Math.PI/2],
 ["nx-town-roads","village_roads3.glb",0,0,0,Math.PI],
 ["nx-town-streetlamps","village_streetlamps3.glb",0,0,0,Math.PI],
 ["nx-core-paths","village_next_core_paths.glb",0,0,0,0],
] as const;
const files=new Map<string,Buffer>();
const byName=new Map<string,{f:string,h:string}>();
for(const q of M){const[n,f,...rest]=q as any;const key=`${n}`;const b=readFileSync(join(A,f));const h=createHash("sha256").update(b).digest("hex");files.set(n,b);byName.set(n,{f,h});}
const THREE_ROOT=join(ROOT,"node_modules/three"),threeModule=join(THREE_ROOT,"build/three.module.js");
const specs=M.map(([n,,x,y,z,yaw])=>({n,x,y,z,yaw}));
const html=`<!doctype html><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';import{GLTFLoader}from'/examples/jsm/loaders/GLTFLoader.js';
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1280,800);r.outputColorSpace=THREE.SRGBColorSpace;r.shadowMap.enabled=true;document.body.appendChild(r.domElement);
const s=new THREE.Scene();s.background=new THREE.Color(0xcbd6df);const cam=new THREE.PerspectiveCamera(50,1280/800,.1,600);const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2);s.add(hemi);const amb=new THREE.AmbientLight(0xffffff,.45);s.add(amb);const sun=new THREE.DirectionalLight(0xfff1d4,3.2);sun.position.set(60,90,40);sun.castShadow=true;s.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;s.add(ground);
const root=new THREE.Group();s.add(root);const specs=${JSON.stringify(specs)};
const loader=new GLTFLoader();for(const q of specs){const g=(await loader.loadAsync('/model/'+q.n+'.glb')).scene;g.position.set(q.x,q.y,q.z);g.rotation.y=q.yaw;g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});root.add(g)}
root.updateMatrixWorld(true);
window.setAerial=()=>{cam.position.set(0,120,70);cam.lookAt(0,0,0);r.render(s,cam)};
window.setOrbit=(deg,R,h)=>{const a=deg*Math.PI/180;cam.position.set(R*Math.cos(a),h,R*Math.sin(a));cam.lookAt(0,2,0);r.render(s,cam)};
window.setStreet=()=>{cam.position.set(0,1.65,-40);cam.lookAt(0,1.65,0);r.render(s,cam)};
window.ready=true;
</script>`;
const server=createServer((req,res)=>{const u=(req.url??'/').split('?')[0];try{if(u==='/'){res.setHeader('content-type','text/html');res.end(html);return}if(u==='/three.module.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(threeModule));return}if(u==='/three.core.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(join(THREE_ROOT,'build/three.core.js')));return}if(u.startsWith('/examples/jsm/')){const p=join(THREE_ROOT,normalize(u.slice(1)));let x=readFileSync(p,'utf8').replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');res.setHeader('content-type','text/javascript');res.end(x);return}const m=u.match(/^\/model\/(.+)\.glb$/);if(m&&files.has(m[1])){res.setHeader('content-type','model/gltf-binary');res.end(files.get(m[1]));return}res.statusCode=404;res.end('not found')}catch(e){res.statusCode=500;res.end(String(e))}});await new Promise<void>(q=>server.listen(0,'127.0.0.1',q));const addr=server.address();if(!addr||typeof addr==='string')throw Error('no addr');const b=await chromium.launch({headless:true});try{const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>console.error('PAGEERROR',e.message));await p.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:'networkidle'});await p.waitForFunction(()=>window.ready===true);await p.evaluate(()=>window.setAerial());await p.screenshot({path:join(OUT,'aerial.png')});for(const d of [0,90,180,270]){await p.evaluate((x)=>window.setOrbit(x,55,28),d);await p.screenshot({path:join(OUT,`orbit-${d}.png`)})}await p.evaluate(()=>window.setStreet());await p.screenshot({path:join(OUT,'street.png')});console.log('rendered',OUT);}finally{await b.close();server.close();}
