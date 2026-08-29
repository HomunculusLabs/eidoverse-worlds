// review-se-district.ts — render the LIVE SE Wild district exactly as seated in commons-next
// (same poses/hashes as the live census), so Bill's "I don't see anything" gets a real answer.
import{createServer}from"node:http";import{readFileSync,mkdirSync}from"node:fs";import{join,normalize}from"node:path";import{createHash}from"node:crypto";import{chromium}from"playwright";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",DIR=join(ROOT,"agents/arthur/mason/glb-retex"),OUT=join(ROOT,"agents/arthur/reviews/se-district-live");mkdirSync(OUT,{recursive:true});
// exact seated tuples (from the live geom census + placer slots)
const specs=[
 ["forest-0010","work_1690_forest.glb","e7d130f7747d9e9a2fa58e9e7e0b27a3217511e6142b076b3c828a36385fe2cb",10.577156,-0.05003665249372835,-75.260373],
 ["forest-0018","work_1638_forest.glb","546718f819b5f70227fdbaaf962edc067748e0fb4ea0d05a86b7706dae711e45",30.911985,-0.05120935668377804,-69.429455],
 ["forest-0044","work_1664_forest.glb","43e4c8c3a843881d69c7e2a32f0b0c89bf5ac463b872e6d8db50dc6dabc5929d",48.851858,-0.020292638346832616,-58.219378],
 ["forest-0057","work_1677_forest.glb","18ea1385cf64d504d32ea72f5a0d9aa285b98dbb1c63ff2ab193970848e28017",63.006856,-0.019491742981888435,-42.498661],
 ["forest-0031","work_1651_forest.glb","f61645b4aba14fc6a8c562d1e467dc6be9369b432c3006b75b0720ce2e81592d",72.280295,-0.05215550130320002,-23.485292],
 ["cairn-0022","work_1642_cairnfield.glb","a4450b4094f75297fcb5fe00b83197bfa030ff792429b1eab2a070cd8bf78539",28.73858,-0.07426829800275718,-88.448256],
 ["cairn-0048","work_1655_cairnfield.glb","09ed84ef059f3bc7d5f1608485bdbd1794f483711a28ab45cb0006aee9ce4420",52.00494,-0.0345969160626097,-77.100494],
 ["cairn-0043","work_1668_cairnfield.glb","5d6c3edda71cc22809ffaeb3cc6f450401b7179fc7754b1e7db589d5d7368fc6",71.242133,0.007238005337997962,-59.779248],
 ["cairn-0047","work_1681_cairnfield.glb","109e5bc57c5f7cb00e985f4fa94907e68d8522814f1181548ce14cd384059a45",84.959728,-0.02598558885747508,-37.826508],
 ["cairn-0050","work_1694_cairnfield.glb","efedd3614fe4ae8814f79cb358d406003b6e99bc1e58840010f68a9db03433a7",92.09493,-0.028882407863270138,-12.943098],
 ["wayside-0009","work_1637_wayside.glb","b46c543afae781a01c36126229ea6399c7ab608e6896039e1eea142280fe3f58",17.538466,-0.06309466104089798,-99.465583],
 ["wayside-0030","work_1650_wayside.glb","d2a2b028b1ce9077005c7081acf298d630d9fc7622cfde9565d6cd77856030ca",44.275486,-0.05134727600764112,-90.778199],
 ["wayside-0045","work_1663_wayside.glb","b693c67eaedeb71b8d31fd50e422ed7ca173ff2cd497562462c3fcc49bd55013",67.582191,0.0104828796429387,-75.057627],
 ["wayside-0056","work_1676_wayside.glb","21dd4ad5c0ad0b5397322c799c51e2e1d571076ec9960f8814101336de9773f1",85.652858,-0.009906056426071697,-53.521846],
 ["wayside-0058","work_1689_wayside.glb","91f2a1bf9b997abe0e8481208927c00a67be5aa64fbbed97e42d32477de7bded",97.087431,-0.017884173579467824,-27.839373],
] as const;
const files=new Map<string,Buffer>();for(const[n,f,h]of specs){const b=readFileSync(join(DIR,f));if(createHash("sha256").update(b).digest("hex")!==h)throw Error(`${n} hash drift`);files.set(n,b);}
const THREE_ROOT=join(ROOT,"node_modules/three"),threeModule=join(THREE_ROOT,"build/three.module.js");
const YAW=-2.35619449;
const html=`<!doctype html><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';import{GLTFLoader}from'/examples/jsm/loaders/GLTFLoader.js';
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1280,800);r.outputColorSpace=THREE.SRGBColorSpace;r.shadowMap.enabled=true;document.body.appendChild(r.domElement);
const s=new THREE.Scene();s.background=new THREE.Color(0xcbd6df);const cam=new THREE.PerspectiveCamera(50,1280/800,.1,500);const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2);s.add(hemi);const amb=new THREE.AmbientLight(0xffffff,.45);s.add(amb);const sun=new THREE.DirectionalLight(0xfff1d4,3.2);sun.position.set(60,90,40);sun.castShadow=true;s.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;s.add(ground);
const root=new THREE.Group();s.add(root);const specs=${JSON.stringify(specs.map(([n,_f,_h,x,y,z])=>({n,x,y,z,yaw:YAW})))};
const loader=new GLTFLoader();for(const q of specs){const g=(await loader.loadAsync('/model/'+q.n+'.glb')).scene;g.position.set(q.x,q.y,q.z);g.rotation.y=q.yaw;g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});root.add(g)}
root.updateMatrixWorld(true);
window.setView=(name,px,pz)=>{let tx,tz;cam.position.set(px,1.65,pz);
  // look toward district centroid (~55,-55) from the given point
  const cx=55,cz=-55;const dx=cx-px,dz=cz-pz;const L=Math.hypot(dx,dz);cam.lookAt(px+dx/L*10,1.4,pz+dz/L*10);r.render(s,cam)};
window.setOrbit=(deg)=>{const a=deg*Math.PI/180,R=95;const px=55+R*Math.cos(a),pz=-55+R*Math.sin(a);cam.position.set(px,26,pz);cam.lookAt(55,0,-55);r.render(s,cam)};
window.setAerial=()=>{cam.position.set(55,150,-55);cam.lookAt(55,0,-55);r.render(s,cam)};
window.ready=true;
</script>`;
const server=createServer((req,res)=>{const u=(req.url??'/').split('?')[0];try{if(u==='/'){res.setHeader('content-type','text/html');res.end(html);return}if(u==='/three.module.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(threeModule));return}if(u==='/three.core.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(join(THREE_ROOT,'build/three.core.js')));return}if(u.startsWith('/examples/jsm/')){const p=join(THREE_ROOT,normalize(u.slice(1)));let x=readFileSync(p,'utf8').replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');res.setHeader('content-type','text/javascript');res.end(x);return}const m=u.match(/^\/model\/(.+)\.glb$/);if(m&&files.has(m[1])){res.setHeader('content-type','model/gltf-binary');res.end(files.get(m[1]));return}res.statusCode=404;res.end('not found')}catch(e){res.statusCode=500;res.end(String(e))}});await new Promise<void>(q=>server.listen(0,'127.0.0.1',q));const addr=server.address();if(!addr||typeof addr==='string')throw Error('no addr');const b=await chromium.launch({headless:true});try{const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>console.error('PAGEERROR',e.message));await p.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:'networkidle'});await p.waitForFunction(()=>window.ready===true);await p.evaluate(()=>window.setAerial());await p.screenshot({path:join(OUT,'aerial.png')});for(const d of [0,60,120,180,240,300]){await p.evaluate(x=>window.setOrbit(x),d);await p.screenshot({path:join(OUT,`orbit-${d}.png`)})}console.log('rendered',OUT);}finally{await b.close();server.close();}
