// review-core-full.ts — full village render: core town + dressing + districts visible from high aerial.
import{createServer}from"node:http";import{readFileSync,mkdirSync,readdirSync}from"node:fs";import{join,normalize}from"node:path";import{createHash}from"node:crypto";import{chromium}from"playwright";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",A=join(ROOT,"agents/arthur/assets"),D=join(ROOT,"agents/arthur/mason/glb-retex"),OUT=join(ROOT,"agents/arthur/reviews/village-full");mkdirSync(OUT,{recursive:true});
const cryptoHash=(b:Buffer)=>createHash("sha256").update(b).digest("hex");
// Just the core (town+dressing+plaza) at true poses; districts sit 100m out — aerial will show them as context.
const M=[
 ["nx-hearth","A/hearth.glb",0,0,0],
 ["nx-welcome","A/village_welcome3.glb",-3,0,-4.3,0],
 ["nx-carousel","A/village_carousel3.glb",-18,0,18,2.35619],
 ["nx-court","A/village_court3.glb",18.9,0,-14.8,-0.90756],
 ["nx-forge","A/village_forge3.glb",22.1,0,-8,0],
 ["nx-cistern","A/village_bcistern3.glb",15.7,0,-14.6,0],
 ["nx-tower","A/village_tower3.glb",14.1,0,16.9,0],
 ["nx-town-mapboard","A/village_mapboard3.glb",2.5,0,9.5,-2.9441970937399127],
 ["nx-town-market","A/village_market3.glb",-6.5,0,6.5,2.356194490192345],
 ["nx-town-monument","A/village_monument3.glb",-7,0,-7,0.7853981633974483],
 ["nx-town-hall","A/village_hall3.glb",9,0,-26,-0.31322457341772525],
 ["nx-town-longhouse","A/village_longhouse3.glb",9,0,26,-2.828368080172068],
 ["nx-town-tower-house","A/village_tower_house.glb",-9,0,26,2.828368080172068],
 ["nx-town-bunkhouse","A/village_bunkhouse.glb",-9,0,-26,0.31322457341772525],
 ["nx-town-row-cottage","A/village_row3.glb",-23,0,-17,0.9411511441487406],
 ["nx-town-garden-cottage","A/village_garden_cottage.glb",-26,0,19,2.2004415094410525],
 ["nx-town-inn","A/village_inn3.glb",36,0,0,-1.5707963267948966],
 ["nx-town-stable","A/village_stable3.glb",43,0,0,-1.5707963267948966],
 ["nx-town-windmill","A/village_windmill3.glb",-40,0,0,1.5707963267948966],
 ["nx-town-woodyard","A/village_woodyard3.glb",16,0,31,-2.669815142409043],
 ["nx-town-kiln","A/village_kiln3.glb",31,0,39,-2.4784945651581642],
 ["nx-town-potter","A/village_potter3.glb",26,0,40.5,-2.5834592128922376],
 ["nx-town-dyehouse","A/village_dyehouse3.glb",-23,0,-23,0.941],
 ["nx-town-shrine","A/village_shrine3.glb",-25,0,-4,1.4118119548622732],
 ["nx-town-belltower","A/village_belltower3.glb",6.5,0,6.5,-2.356194490192345],
 ["nx-town-gate-n","A/village_gate.glb",0,0,-19.5,0],
 ["nx-town-gate-s","A/village_gate.glb",0,0,19.5,Math.PI],
 ["nx-town-gate-e","A/village_gate.glb",19.5,0,0,Math.PI/2],
 ["nx-town-gate-w","A/village_gate.glb",-19.5,0,0,-Math.PI/2],
 ["nx-town-roads","A/village_roads3.glb",0,0,0,Math.PI],
 ["nx-town-streetlamps","A/village_streetlamps3.glb",0,0,0,Math.PI],
 ["nx-core-paths","A/village_next_core_paths.glb",0,0,0,0],
 ["nx-dress-banner","A/village_banner.glb",-4,0,9.5,2.356194490192345],
 ["nx-dress-giftshelf","A/village_giftshelf3.glb",-9,0,9,2.356194490192345],
 ["nx-dress-fountain","A/village_fountain.glb",12.5,0,4,-0.7853981633974483],
 ["nx-dress-bench-plaza","A/village_bench_arc.glb",-9.5,0,-9.5,0.7853981633974483],
 ["nx-dress-goats","A/village_goats3.glb",34,0,13,-1.2],
 ["nx-dress-coop","A/village_coop3.glb",37.5,0,-6.5,-1.8],
 ["nx-dress-harvestcart","A/village_harvestcart3.glb",12,0,36,-2.6],
 ["nx-dress-well","A/village_well.glb",30,0,-4.5,0],
 ["nx-dress-chess","A/village_chess.glb",-27.5,0,-9,1.2],
] as const;
const files=new Map<string,Buffer>();
for(const q of M){const[,fp,...rest]=q as any;const[src,f]=fp.split("/");const p=src==="A"?join(A,f):join(D,f);files.set(q[0] as string,readFileSync(p));}
const THREE_ROOT=join(ROOT,"node_modules/three"),threeModule=join(THREE_ROOT,"build/three.module.js");
const specs=M.map(([n,,x,y,z,yaw])=>({n,x,y,z,yaw}));
const html=`<!doctype html><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';import{GLTFLoader}from'/examples/jsm/loaders/GLTFLoader.js';
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1280,800);r.outputColorSpace=THREE.SRGBColorSpace;r.shadowMap.enabled=true;document.body.appendChild(r.domElement);
const s=new THREE.Scene();s.background=new THREE.Color(0xcbd6df);const cam=new THREE.PerspectiveCamera(50,1280/800,.1,800);const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2);s.add(hemi);const amb=new THREE.AmbientLight(0xffffff,.45);s.add(amb);const sun=new THREE.DirectionalLight(0xfff1d4,3.2);sun.position.set(80,120,50);sun.castShadow=true;s.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;s.add(ground);
const root=new THREE.Group();s.add(root);const specs=${JSON.stringify(specs)};
const loader=new GLTFLoader();for(const q of specs){const g=(await loader.loadAsync('/model/'+q.n+'.glb')).scene;g.position.set(q.x,q.y,q.z);g.rotation.y=q.yaw;g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});root.add(g)}
root.updateMatrixWorld(true);
window.setAerial=()=>{cam.position.set(0,170,110);cam.lookAt(0,0,0);r.render(s,cam)};
window.setOrbit=(deg,R,h)=>{const a=deg*Math.PI/180;cam.position.set(R*Math.cos(a),h,R*Math.sin(a));cam.lookAt(0,2,0);r.render(s,cam)};
window.ready=true;
</script>`;
const server=createServer((req,res)=>{const u=(req.url??'/').split('?')[0];try{if(u==='/'){res.setHeader('content-type','text/html');res.end(html);return}if(u==='/three.module.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(threeModule));return}if(u==='/three.core.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(join(THREE_ROOT,'build/three.core.js')));return}if(u.startsWith('/examples/jsm/')){const p=join(THREE_ROOT,normalize(u.slice(1)));let x=readFileSync(p,'utf8').replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');res.setHeader('content-type','text/javascript');res.end(x);return}const m=u.match(/^\/model\/(.+)\.glb$/);if(m&&files.has(m[1])){res.setHeader('content-type','model/gltf-binary');res.end(files.get(m[1]));return}res.statusCode=404;res.end('not found')}catch(e){res.statusCode=500;res.end(String(e))}});await new Promise<void>(q=>server.listen(0,'127.0.0.1',q));const addr=server.address();if(!addr||typeof addr==='string')throw Error('no addr');const b=await chromium.launch({headless:true});try{const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>console.error('PAGEERROR',e.message));await p.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:'networkidle'});await p.waitForFunction(()=>window.ready===true);await p.evaluate(()=>window.setAerial());await p.screenshot({path:join(OUT,'aerial.png')});for(const d of [0,90,180,270]){await p.evaluate((x)=>window.setOrbit(x,60,30),d);await p.screenshot({path:join(OUT,`orbit-${d}.png`)})}console.log('rendered',OUT);}finally{await b.close();server.close();}
