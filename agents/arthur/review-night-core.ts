// review-night-core.ts — night-N lane, wakeup 5: CORE district night pass (r<35).
// Generated from /tmp/night5-census.json (246 entities, fresh 2026-09-06) — zero hand-transcription.
// 90 core GLB subjects: 89 hash-matched to LOCAL bytes (assets/ + mason/glb-retex/) +
// nx-town-woodyard rendered from the LIVE at-rest store copy (intentional tex-85 freeze;
// at-rest generation is draco+webp-optimized so its sha differs from the lib token —
// scope note, night-2 precedent). Hash gate binds the bytes actually rendered. Poses =
// exact live census tuples; lights = live client contract (makeLight: 0xffd9a0,
// intensity 16, range 10) at ALL 36 live world light positions (fresh census truth;
// night-4 rig's 40-row table had stale rows). 16 core light-anchor entities (lib='')
// render as lamp beads. Sky facet 5 (render-only, NEVER applied): NIGHT_STARS=2 =
// facet-4 star field + zenith concentration (~20% of stars pulled toward zenith) +
// cleared low-altitude band near the four approach corridors — tests both recorded
// facet-4 costs directly. Variant dir via NIGHT_OUT.
import{createServer}from"node:http";import{readFileSync,mkdirSync}from"node:fs";import{join,normalize}from"node:path";import{createHash}from"node:crypto";import{chromium}from"playwright";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",RETEX=join(ROOT,"agents/arthur/mason/glb-retex"),ASSETS=join(ROOT,"agents/arthur/assets"),STORE="/tmp/night5-store",OUT=join(ROOT,"agents/arthur/reviews/night-core");mkdirSync(OUT,{recursive:true});
// [name, file, dir, sha256[:16], x, y, z, yaw] — generated from live census tuples
const specs=[
 ["nx-hearth","village_plaza3.glb",ASSETS,"027f6f019f9981bf",0.0,0.0,0.0,0.0],
 ["nx-welcome","village_welcome3.glb",ASSETS,"362c5be14cb9a245",-3.0,0.0,-4.3,0.6092],
 ["nx-carousel","village_carousel3.glb",ASSETS,"ce3633992d07055e",-18.0,0.00015,18.0,2.35619],
 ["nx-approach-lamp-e","village_approach_lamp.glb",ASSETS,"18b69a6bb2f5862f",10.0,0.0,0.0,3.141593],
 ["nx-approach-lamp-n","village_approach_lamp.glb",ASSETS,"18b69a6bb2f5862f",0.0,0.0,10.0,-1.570796],
 ["nx-approach-lamp-w","village_approach_lamp.glb",ASSETS,"18b69a6bb2f5862f",-10.0,0.0,0.0,0.0],
 ["nx-approach-lamp-s","village_approach_lamp.glb",ASSETS,"18b69a6bb2f5862f",0.0,0.0,-10.0,1.570796],
 ["nx-court","village_court3.glb",ASSETS,"59534b10122e6b47",18.9,-0.0,-14.8,-0.90756],
 ["nx-forge","village_forge3.glb",ASSETS,"620120c4d6f0b4a0",22.117855,0.0,-7.957568,-0.90756],
 ["nx-cistern","village_bcistern3.glb",ASSETS,"d3d3ad75932cb3da",15.703583,0.0,-14.586881,-0.90756],
 ["nx-sign-bakery","village_sign_bakery.glb",ASSETS,"599194ee7f4efd81",14.022736,0.0,-18.768525,2.234033],
 ["nx-sign-smithy","village_sign_smithy.glb",ASSETS,"d8df94003084af39",23.777264,-0.0,-10.831475,-0.90756],
 ["nx-tower","village_tower3.glb",ASSETS,"a989bdc3cad37b39",14.1,0.0,16.9,-2.44347],
 ["nx-shutters","village_shutters3.glb",ASSETS,"26259f89feb92736",14.1,0.0,16.9,-2.44347],
 ["nx-core-paths","village_next_core_paths.glb",ASSETS,"9ce1378d47fd8a22",0.0,0.0,0.0,0.0],
 ["nx-town-mapboard","village_mapboard3.glb",ASSETS,"1f1a10f4dce71a0e",2.5,0.0,9.5,-2.944197],
 ["nx-town-market","village_market3.glb",ASSETS,"8c16ea9a756a95ad",-6.5,0.0,6.5,2.356194],
 ["nx-town-monument","village_monument3.glb",ASSETS,"d7d3b15c6391aa7e",-7.0,0.0,-7.0,0.785398],
 ["nx-town-hall","village_hall3.glb",ASSETS,"1306527acac5784b",9.0,0.0,-26.0,-0.313225],
 ["nx-town-longhouse","village_longhouse3.glb",ASSETS,"f2344409ac67fd77",9.0,0.0,26.0,-2.828368],
 ["nx-town-tower-house","village_tower_house.glb",ASSETS,"bd1badd218fdbebd",-9.0,0.0,26.0,2.828368],
 ["nx-town-bunkhouse","village_bunkhouse.glb",ASSETS,"49f5acc4d91c4d45",-9.0,0.0,-26.0,0.313225],
 ["nx-town-row-cottage","village_row3.glb",ASSETS,"bd88cd386aec2a89",-23.0,0.0,-17.0,0.941151],
 ["nx-town-garden-cottage","village_garden_cottage.glb",ASSETS,"872aec35e3aa43b3",-26.0,0.000949,19.0,2.200442],
 ["nx-town-woodyard","woodyard.glb",STORE,"80c2e14291308533",16.0,0.0,31.0,-2.669815],
 ["nx-town-dyehouse","village_dyehouse3.glb",ASSETS,"888be3597d2f772f",-23.0,0.0,-23.0,0.941],
 ["nx-town-shrine","village_shrine3.glb",ASSETS,"53709062d3095dcc",-25.0,-0.001261,-4.0,1.411812],
 ["nx-town-belltower","village_belltower3.glb",ASSETS,"30407b959aa14962",6.5,0.0,6.5,-2.356194],
 ["nx-town-gate-n","village_gate.glb",ASSETS,"d1b90d6fc66b2db8",0.0,0.0,-19.5,0.0],
 ["nx-town-gate-s","village_gate.glb",ASSETS,"d1b90d6fc66b2db8",0.0,0.0,19.5,3.141593],
 ["nx-town-gate-e","village_gate.glb",ASSETS,"d1b90d6fc66b2db8",19.5,0.0,0.0,1.570796],
 ["nx-town-gate-w","village_gate.glb",ASSETS,"d1b90d6fc66b2db8",-19.5,0.0,0.0,-1.570796],
 ["nx-town-roads","village_roads3.glb",ASSETS,"3b76b621559fa1a1",0.0,0.0,0.0,3.141593],
 ["nx-town-streetlamps","village_streetlamps3.glb",ASSETS,"e815a897c7d73373",0.0,0.0,0.0,3.141593],
 ["nx-dress-banner","village_banner.glb",ASSETS,"d32e7bcb8b007d21",-4.0,0.0,9.5,2.356194],
 ["nx-dress-stringlights","village_stringlights.glb",ASSETS,"0c0dee37b07aa7df",-6.0,2.6,7.5,0.785398],
 ["nx-dress-giftshelf","village_giftshelf3.glb",ASSETS,"c623cfa6fbdeb48e",-9.0,0.0,9.0,2.356194],
 ["nx-dress-fountain","village_fountain.glb",ASSETS,"72f07c2a466feae3",12.5,0.0,4.0,-0.785398],
 ["nx-dress-bench-plaza","village_bench_arc.glb",ASSETS,"09f4d1741fdb24a6",-9.5,0.0,-9.5,0.785398],
 ["nx-dress-hens","village_hen_a.glb",ASSETS,"edc1a4c7ca62d56f",33.5,0.0,-6.0,-1.8],
 ["nx-dress-well","village_well.glb",ASSETS,"35f17cf4f6a6db9f",30.0,0.0,-4.5,0.0],
 ["nx-dress-chess","village_chess.glb",ASSETS,"cb215e8c13c8ac79",-27.5,0.0,-9.0,1.2],
 ["nx-artwalk-h5","village_artwalk_h5.glb",ASSETS,"3c48f921d262907a",19.79899,-0.015837,-24.041631,-0.785398],
 ["nx-struct-hypar","village_hypar3.glb",ASSETS,"ce246defccc75bff",-27.57,-0.005252,4.86,1.570796],
 ["nx-artwalk-b1-hall-charter","village_artwalk_b1.glb",ASSETS,"100eb5e9e89694a9",4.928244,1.1,-27.318787,-0.313225],
 ["nx-artwalk-b2-inn-lintel","village_artwalk_b2_lintel.glb",ASSETS,"875942618767052c",32.97,2.78,0.0,-1.570796],
 ["nx-artwalk-b2-inn-threshold","village_artwalk_b2_threshold.glb",ASSETS,"cc80fa377494a76c",33.05,0.198,0.0,-1.570796],
 ["nx-artwalk-b4-golden-top","village_artwalk_b4_top.glb",ASSETS,"98fabb814c668f29",0.0,2.524133,-19.24,0.0],
 ["nx-artwalk-b4-golden-threshold","village_artwalk_b4_threshold.glb",ASSETS,"db99bae44aa6ebcc",0.0,0.0,-19.5,0.0],
 ["nx-artwalk-b4-golden-hinges","village_artwalk_b4_hinges.glb",ASSETS,"78a457a5bab6874d",1.5,0.7,-19.24,0.0],
 ["nx-struct-waterstair","village_waterstair3.glb",ASSETS,"3ffa182cd6ea76d9",0.0,-0.032226,-32.0,0.0],
 ["nx-artwalk-b5-belltower-rings","village_artwalk_b5.glb",ASSETS,"48aed5dabcb16a45",5.269634,0.65,6.330294,-2.356194],
 ["nx-artwalk-b6-market-lissa-left","village_artwalk_b6.glb",ASSETS,"5fcdd1ef922f7794",-5.481766,0.38,6.89598,2.356194],
 ["nx-artwalk-b6-market-lissa-right","village_artwalk_b6.glb",ASSETS,"5fcdd1ef922f7794",-6.89598,0.38,5.481766,2.356194],
 ["nx-artwalk-b7-shrine-stars","village_artwalk_b7.glb",ASSETS,"a7ef8541e9561833",-26.29577,0.25,-3.245627,1.411812],
 ["nx-artwalk-b9-dyehouse-crossing-loom","village_artwalk_b9.glb",ASSETS,"6c3c85dee69191cf",-23.622274,0.48,-23.453515,0.941],
 ["nx-artwalk-b13-south-tide-west","village_artwalk_b13.glb",ASSETS,"8a6b49f61bcf138e",1.5,0.5,19.68,0.0],
 ["nx-artwalk-b13-south-tide-east","village_artwalk_b13.glb",ASSETS,"8a6b49f61bcf138e",-1.5,0.5,19.68,0.0],
 ["nx-artwalk-b14-east-gate-dawn-fan","village_artwalk_b14.glb",ASSETS,"c67c0402bbfb7fd8",19.7325,2.72,0.0,1.570796],
 ["nx-artwalk-b15-west-gate-dusk-arcs","village_artwalk_b15.glb",ASSETS,"f1efad77be904a59",-19.7325,2.72,0.0,-1.570796],
 ["nx-artwalk-b16-forge-seven-strikes","village_artwalk_b16.glb",ASSETS,"54555b39274bc00c",21.810533,1.02,-7.717457,-0.90756],
 ["nx-artwalk-b17-garden-seed-lattice","village_artwalk_b17.glb",ASSETS,"241db6453224af9f",-24.518907,2.080949,17.920918,2.200442],
 ["nx-artwalk-b18-row-warp-count","village_artwalk_b18.glb",ASSETS,"d6d10de199f6fb03",-21.1552,2.22,-15.655932,0.941151],
 ["nx-artwalk-b19-longhouse-feast-count","village_artwalk_b19.glb",ASSETS,"98a4c17e73e4bac4",7.668887,2.22,21.89019,-2.828368],
 ["nx-artwalk-b20-bunkhouse-four-rooms","village_artwalk_b20.glb",ASSETS,"152684b8dd6ba535",-10.466689,1.05,-23.38851,0.313225],
 ["nx-artwalk-b21-tower-ascension-count","village_artwalk_b21.glb",ASSETS,"ba8f63884184b13e",-8.130309,2.22,23.314829,2.828368],
 ["nx-artwalk-b22-mapboard-eight-ways","village_artwalk_b22.glb",ASSETS,"09c800d062057db2",2.505883,0.0,9.529417,-2.944197],
 ["nx-artwalk-b23-cistern-rain-count","village_artwalk_b23.glb",ASSETS,"8d9419e5c2d9e3e7",15.443542,0.31,-14.383709,-0.90756],
 ["nx-artwalk-b24-well-depth","village_artwalk_b24.glb",ASSETS,"1935752ba39b674e",3.4,0.375,0.7,0.0],
 ["nx-artwalk-b25-welcome-village-mark","village_artwalk_b25.glb",ASSETS,"173352aa2df4450f",-3.030327,1.35,-4.343466,0.6092],
 ["nx-artwalk-b26-wayband","village_artwalk_b26.glb",ASSETS,"7594436a996e8ded",0.0,1.5,10.0,3.141593],
 ["nx-artwalk-b27-waterline","village_artwalk_b27.glb",ASSETS,"580706ad8e46212c",30.0,0.0,-4.5,0.0],
 ["nx-artwalk-b28-bake-count","village_artwalk_b28.glb",ASSETS,"18c1bb5da4328ae7",18.593537,-0.0,-18.367647,-0.90756],
 ["nx-artwalk-b29-strike-count","village_artwalk_b29.glb",ASSETS,"a7df548e06d1412d",22.347652,-0.0,-13.43277,-0.90756],
 ["nx-artwalk-b30-market-tally","village_artwalk_b30.glb",ASSETS,"a2326039fcb4e080",-6.5,0.0,6.5,2.356194],
 ["nx-artwalk-b34-wayband-e","village_artwalk_b26.glb",ASSETS,"7594436a996e8ded",10.0,1.5,0.0,3.141593],
 ["nx-artwalk-b34-wayband-s","village_artwalk_b26.glb",ASSETS,"7594436a996e8ded",0.0,1.5,-10.0,1.570796],
 ["nx-artwalk-b34-wayband-w","village_artwalk_b26.glb",ASSETS,"7594436a996e8ded",-10.0,1.5,0.0,0.0],
 ["nx-struct-waystone-n","village_waystone3.glb",ASSETS,"2f006e218ffbe97e",0.0,0.0,-22.1,1.570796],
 ["nx-struct-waystone-e","village_waystone3.glb",ASSETS,"2f006e218ffbe97e",22.1,0.0,0.0,3.141593],
 ["nx-struct-waystone-s","village_waystone3.glb",ASSETS,"2f006e218ffbe97e",0.0,0.0,22.1,-1.570796],
 ["nx-struct-waystone-w","village_waystone3.glb",ASSETS,"2f006e218ffbe97e",-20.0,0.0,4.3,0.785398],
 ["nx-struct-halt","village_wayfarershalt3.glb",ASSETS,"bb227fd67ca93385",-2.0,-0.002973,30.0,0.0],
 ["nx-struct-soundmirror","village_soundmirror3.glb",ASSETS,"5216db0a22ea8b21",28.7,-0.026087,-18.0,0.0],
 ["nx-struct-crossing","village_crossing3.glb",ASSETS,"a5da939d54351eee",3.6,-0.005,-3.6,0.0],
 ["nx-approach-nw-lane-001","village_nw_approach1.glb",ASSETS,"d46a60fb3ad301e3",0.0,0.0,0.0,0.0],
 ["nx-approach-ne-lane-002","village_ne_approach2.glb",ASSETS,"a27bc9a252272b12",0.0,0.0,0.0,0.0],
 ["nx-approach-sw-lane-003","village_sw_approach3.glb",ASSETS,"56b35877ecda923d",0.0,0.0,0.0,0.0],
 ["nx-sign-dyer-001","village_sign_dyer3.glb",ASSETS,"38416baede850b77",-22.086793,2.05,-22.334452,0.941],
 ["nx-sign-woodyard-001","village_sign_woodyard3.glb",ASSETS,"58f5cbe3272aa7a8",15.431912,2.05,29.886548,-2.669815]
] as const;
const files=new Map<string,Buffer>();
for(const[n,f,d,h]of specs){const b=readFileSync(join(d as string,f as string));const got=createHash("sha256").update(b).digest("hex").slice(0,16);if(got!==(h as string))throw Error(`${n} hash drift: ${got} != ${h}`);files.set(n,b);}
// ALL 38 live light entities (census-exact, world-wide for rig-true horizon glow)
const LAMPS=[[0,1.2,0],[-3,2.2,-4.3],[9.9,1.96,0],[0,1.96,9.9],[-9.9,1.96,0],[0,1.96,-9.9],[27,1.145,-27],[36,2.35,0],[9,2.5,-26],[32.527,2.449,-32.527],[21.606,1.5,-7.557],[35.511,2.298,-23.886],[8.815,2.2,25.429],[17.883,0.604,-25.449],[21.206,0.604,-22.125],[-6.217,1.75,6.217],[38.361,2.422,-38.361],[25.682,1.4,39.991],[30.476,2.283,-41.79],[-25.758,2.101,18.823],[-8.877,2.1,25.619],[40.8,7.3,-16.48],[16.48,1.5,-40.8],[-22.677,2.1,-16.764],[-8.877,2.1,-25.619],[47.96,12.9,-31.9],[43,1.9,1.8],[-23.625,1.62,-21.971],[30.5,1.1,40.4],[-39.09,1.96,30.26],[-47.96,1.96,46.71],[39.71,1.96,27],[32.89,1.96,50.15],[-25.2,1.96,-30.67],[-34.69,1.96,-43.14],[-47.68,0.678,50.608]] as const;
const THREE_ROOT=join(ROOT,"node_modules/three"),threeModule=join(THREE_ROOT,"build/three.module.js");
const MOON=process.env.NIGHT_MOON==="1";const STARS=process.env.NIGHT_STARS==="1"?1:(process.env.NIGHT_STARS==="2"?2:0);
const html=()=>`<!doctype html><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';import{GLTFLoader}from'/examples/jsm/loaders/GLTFLoader.js';import{DRACOLoader}from'/examples/jsm/loaders/DRACOLoader.js';
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1280,800);r.outputColorSpace=THREE.SRGBColorSpace;document.body.appendChild(r.domElement);
const s=new THREE.Scene();const SKY=(${MOON}?'#0e1626':'#0a0d18');s.background=new THREE.Color(SKY);s.fog=new THREE.Fog(SKY,60,260);
const cam=new THREE.PerspectiveCamera(50,1280/800,.1,700);
const hemi=new THREE.HemisphereLight(0x25304a,0x0c0e09,${MOON?0.9:0.5});s.add(hemi);
const moon=new THREE.DirectionalLight(0x8ea2c8,${MOON?1.1:0.55});moon.position.set(-80,120,60);s.add(moon);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshStandardMaterial({color:0x39442c,roughness:1}));ground.rotation.x=-Math.PI/2;s.add(ground);
if(${STARS}){const F5=${STARS}===2;for(let i=0;i<420;i++){let u=Math.random()*2-1,th=Math.random()*Math.PI*2;
 if(F5&&i%5===0){u=0.75+Math.random()*0.24} // ~20% pulled toward zenith
 if(F5){ // clear low-altitude band along the four approach corridors (az 45/135/225/315)
  const az=Math.atan2(Math.cos(th)*Math.sqrt(1-u*u),Math.sin(th)*Math.sqrt(1-u*u));
  const nearCorr=[Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4].some(a=>Math.abs(Math.atan2(Math.sin(az-a),Math.cos(az-a)))<0.22);
  if(u<0.18&&nearCorr)continue;}
 const rr=Math.sqrt(1-u*u);
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
  // N gate inbound: on the N spoke just inside the gate, looking home to plaza
  ["gate-inbound-n",0,2.4,-14,0,2.5,6],
  // E gate inbound: on the E spoke looking past lamp-e into the civic ring
  ["gate-inbound-e",14,2.4,0,-4,2.5,6],
  // S gate inbound
  ["gate-inbound-s",0,2.4,14,0,2.5,-6],
  // W gate inbound: past wayband-w into plaza + hearth
  ["gate-inbound-w",-14,2.4,0,4,2.5,-6],
  // E road long view: outside the gate at r30 looking home the full wayfinding run
  ["road-e-long",30,2.6,0,6,3,4],
  // plaza eye: standing height at civic-ring edge, whole lit composition
  ["plaza-eye",7,1.7,7,-6,2.5,-6],
  // wide aerial composition over the core
  ["wide-aerial",10,85,10,0,0,0],
 ];
 for(const[name,...c]of V){await p.evaluate((cs)=>(window as any).view(...cs),c as any[]);await p.screenshot({path:join(OUTDIR,`${name}.png`)});console.log('shot',name)}
 console.log('rendered',OUTDIR);
}finally{await b.close();server.close()}
