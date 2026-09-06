// review-night-se.ts — night-N lane, wakeup 3: SE Wild district night pass.
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
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",RETEX=join(ROOT,"agents/arthur/mason/glb-retex"),ASSETS=join(ROOT,"agents/arthur/assets"),OUT=join(ROOT,"agents/arthur/reviews/night-se");mkdirSync(OUT,{recursive:true});
// [name, file, dir, sha256[:16], x, y, z, yaw] — generated from live census tuples
const specs=[
 ["nx-artwalk-b8-stable-harmonic-rein","village_artwalk_b8.glb",ASSETS,"cba8d0efb0518938",45.16,2.22,-1.3226185430791415e-16,-1.5707963267948966],
 ["nx-artwalk-h2","village_artwalk_h2.glb",ASSETS,"f14d70564a107879",27,-0.03516135170548859,-27,-0.7853981633974483],
 ["nx-artwalk-h3","village_artwalk_h3.glb",ASSETS,"f33e9839b5d95241",32.526911934581186,-0.0313912325769002,-32.526911934581186,-0.7853981633974483],
 ["nx-artwalk-h4","village_artwalk_h4.glb",ASSETS,"0b29c15ad1b8d04f",35.70889244992065,-0.041880605288849126,-23.68807716974934,-2.356194490192345],
 ["nx-artwalk-h6","village_artwalk_h6.glb",ASSETS,"a61457df15380006",38.53731957466684,-0.02768908298729972,-38.53731957466684,-0.7853981633974483],
 ["nx-artwalk-h7","village_artwalk_h7.glb",ASSETS,"7baac8fd9b45bc92",31.819805153394636,-0.037292896876929355,-43.13351365237939,-0.7853981633974483],
 ["nx-dress-coop","village_coop3.glb",ASSETS,"f5d4039489c1ce4b",37.5,0,-6.5,-1.8],
 ["nx-dress-hutch","village_hutch3.glb",ASSETS,"f5f47791dadb5abe",38.5,0,-9.5,-1.9],
 ["nx-dress-se-stones-001","village_dress_se_stones1.glb",ASSETS,"8dafb9e58f8354f1",52.61,-0.011,-47.8,0.7853981633974483],
 ["nx-struct-beacon","village_beacon3.glb",ASSETS,"f5076e0014ed73cf",40.8,-0.04397324965628428,-16.48,0],
 ["nx-struct-needlerest","village_wayfarershalt3.glb",ASSETS,"bb227fd67ca93385",41.1,-0.04670478202487889,-23.8,7.33],
 ["nx-struct-northneedle","village_northneedle3.glb",ASSETS,"39ed7070104ddc61",47.3,-0.033889555549561905,-31.9,0],
 ["nx-struct-observatory","village_observatory3.glb",ASSETS,"eb3c9b158195b268",16.48,-0.052440113834802064,-40.8,-0.3838824615170976],
 ["nx-struct-orrery","village_orrery3.glb",ASSETS,"d680b1cdb64ed9e9",9.19,-0.052098429044230066,-36.87,0],
 ["nx-struct-orreryring","village_orreryring3.glb",ASSETS,"f095519b61b3bf17",9.19,-0.052098429044230066,-36.87,0],
 ["nx-struct-skymirror","village_skymirror3.glb",ASSETS,"8331ba88ffcae0ff",24,-0.05395918022037476,-35.5,0],
 ["nx-wild-cairn-0022","work_1642_cairnfield.glb",RETEX,"a4450b4094f75297",28.73858,-0.07426829800275718,-88.448256,-2.35619449],
 ["nx-wild-cairn-0043","work_1668_cairnfield.glb",RETEX,"5d6c3edda71cc228",71.242133,0.007238005337997962,-59.779248,-2.35619449],
 ["nx-wild-cairn-0047","work_1681_cairnfield.glb",RETEX,"109e5bc57c5f7cb0",84.959728,-0.02598558885747508,-37.826508,-2.35619449],
 ["nx-wild-cairn-0048","work_1655_cairnfield.glb",RETEX,"09ed84ef059f3bc7",52.00494,-0.0345969160626097,-77.100494,-2.35619449],
 ["nx-wild-cairn-0050","work_1694_cairnfield.glb",RETEX,"efedd3614fe4ae88",92.09493,-0.028882407863270138,-12.943098,-2.35619449],
 ["nx-wild-forest-0010","work_1690_forest.glb",RETEX,"e7d130f7747d9e9a",10.577156,-0.05003665249372835,-75.260373,-2.35619449],
 ["nx-wild-forest-0018","work_1638_forest.glb",RETEX,"546718f819b5f702",30.911985,-0.05120935668377804,-69.429455,-2.35619449],
 ["nx-wild-forest-0031","work_1651_forest.glb",RETEX,"f61645b4aba14fc6",72.280295,-0.05215550130320002,-23.485292,-2.35619449],
 ["nx-wild-forest-0044","work_1664_forest.glb",RETEX,"43e4c8c3a843881d",48.851858,-0.020292638346832616,-58.219378,-2.35619449],
 ["nx-wild-forest-0057","work_1677_forest.glb",RETEX,"18ea1385cf64d504",63.006856,-0.019491742981888435,-42.498661,-2.35619449],
 ["nx-wild-wayside-0009","work_1637_wayside.glb",RETEX,"b46c543afae781a0",17.538466,-0.06309466104089798,-99.465583,-2.35619449],
 ["nx-wild-wayside-0030","work_1650_wayside.glb",RETEX,"d2a2b028b1ce9077",44.275486,-0.05134727600764112,-90.778199,-2.35619449],
 ["nx-wild-wayside-0045","work_1663_wayside.glb",RETEX,"b693c67eaedeb71b",67.582191,0.0104828796429387,-75.057627,-2.35619449],
 ["nx-wild-wayside-0056","work_1676_wayside.glb",RETEX,"21dd4ad5c0ad0b53",85.652858,-0.009906056426071697,-53.521846,-2.35619449],
 ["nx-wild-wayside-0058","work_1689_wayside.glb",RETEX,"91f2a1bf9b997abe",97.087431,-0.017884173579467824,-27.839373,-2.35619449],] as const;
const files=new Map<string,Buffer>();
for(const[n,f,d,h]of specs){const b=readFileSync(join(d as string,f as string));const got=createHash("sha256").update(b).digest("hex").slice(0,16);if(got!==(h as string))throw Error(`${n} hash drift: ${got} != ${h}`);files.set(n,b);}
// ALL 38 live light entities (census-exact, world-wide for rig-true horizon glow)
const LAMPS=[[0,1.2,0], [-3,2.2,-4.3], [10,0,0], [9.9,1.96,0], [0,0,10], [0,1.96,9.9], [-10,0,0], [-9.9,1.96,0], [0,0,-10], [0,1.96,-9.9], [0,0,0], [27,1.1448386482945114,-27], [36,2.35,0], [9,2.5,-26], [32.526911934581186,2.4486087674231,-32.526911934581186], [21.60565223135312,1.5,-7.557382793287093], [35.510902551188416,2.2981193947111507,-23.886067068481577], [8.815123251205957,2.2,25.42919303809839], [-6.217157287525381,1.75,6.217157287525381], [38.3605428793702,2.4223109170127004,-38.3605428793702], [25.682237707044493,1.4,39.991052924975826], [30.476302269140195,2.2827071031230703,-41.79001076812495], [-25.757529051131492,2.100949448840476,18.823342594395804], [-8.876748834137304,2.1,25.619462025398928], [40.8,7.3,-16.48], [16.48,1.5,-40.8], [-22.67670540150866,2.1,-16.764456792527735], [-8.876748834137304,2.1,-25.619462025398928], [47.959999999999994,12.9,-31.9], [43,1.9,1.8], [-23.625,1.62,-21.971], [30.5,1.1,40.4], [-39.09,1.96,30.26], [-47.96,1.96,46.71], [39.71,1.96,27], [32.89,1.96,50.15], [-25.2,1.96,-30.67], [-34.69,1.96,-43.14]] as const;
const THREE_ROOT=join(ROOT,"node_modules/three"),threeModule=join(THREE_ROOT,"build/three.module.js");
const MOON=process.env.NIGHT_MOON==="1";
const html=()=>`<!doctype html><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';import{GLTFLoader}from'/examples/jsm/loaders/GLTFLoader.js';import{DRACOLoader}from'/examples/jsm/loaders/DRACOLoader.js';
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1280,800);r.outputColorSpace=THREE.SRGBColorSpace;document.body.appendChild(r.domElement);
const s=new THREE.Scene();const SKY=(${MOON}?'#0e1626':'#0a0d18');s.background=new THREE.Color(SKY);s.fog=new THREE.Fog(SKY,60,260);
const cam=new THREE.PerspectiveCamera(50,1280/800,.1,700);
const hemi=new THREE.HemisphereLight(0x25304a,0x0c0e09,${MOON?0.9:0.5});s.add(hemi);
const moon=new THREE.DirectionalLight(0x8ea2c8,${MOON?1.1:0.55});moon.position.set(-80,120,60);s.add(moon);
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
const OUTDIR=process.env.NIGHT_OUT??OUT;mkdirSync(OUTDIR,{recursive:true});
await new Promise<void>(q=>server.listen(0,'127.0.0.1',q));const addr=server.address();if(!addr||typeof addr==='string')throw Error('no addr');
const b=await chromium.launch({headless:true});
try{const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>console.error('PAGEERROR',e.message));await p.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:'networkidle'});await p.waitForFunction(()=>window.ready===true,{timeout:120000});
 const V:(string|number)[][]=[
  // corridor inbound: on the az-315 visitor corridor at r~60 looking home toward the gate
  ["corridor-inbound",42.4,2.4,-42.4,0,2.5,0],
  // corridor outbound: at the dress-3 stones (r~71) looking deeper into the wild
  ["corridor-outbound-wild",48,2.4,-43,70,1.5,-62],
  // arrival: at the district inner edge looking into observatory/orrery/beacon cluster
  ["arrival-interior",22,2.6,-22,35,2,-35],
  // district center, looking outward to forest belt + cairns
  ["center-outward",28,3.0,-30,65,2,-70],
  // district center, homebound toward plaza glow
  ["center-homebound",30,3.2,-30,8,2,-4],
  // wide composition: high vantage over the district
  ["wide-aerial",35,80,-30,45,0,-55],
 ];
 for(const[name,...c]of V){await p.evaluate((cs)=>(window as any).view(...cs),c as any[]);await p.screenshot({path:join(OUTDIR,`${name}.png`)});console.log('shot',name)}
 console.log('rendered',OUTDIR);
}finally{await b.close();server.close()}
