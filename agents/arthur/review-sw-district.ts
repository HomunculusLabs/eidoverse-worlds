// review-sw-district.ts — render the LIVE SW Contemplative district exactly as seated.
import{createServer}from"node:http";import{readFileSync,mkdirSync}from"node:fs";import{join,normalize}from"node:path";import{createHash}from"node:crypto";import{chromium}from"playwright";
const ROOT="/Users/t3rpz/projects/eidoverse-worlds",DIR=join(ROOT,"agents/arthur/mason/glb-retex"),OUT=join(ROOT,"agents/arthur/reviews/sw-district-live");mkdirSync(OUT,{recursive:true});
const T="e8417696ee8ab62bac5655ccbabc94c5fd792cc2e8958a7ea0304c8fd2db0651",SD="710ec3e5c66a0378c08eea518a597c43445ae3f15dd6249dfd5c26b41a534425";
const specs=[
 ["terrace-0035","work_1641_terrace.glb",T,-75.710797,-0.00464027797587903,-6.623836],
 ["terrace-0037","work_1654_terrace.glb",T,-69.958369,0.0018601911619803956,-29.695566],
 ["terrace-0040","work_1667_terrace.glb",T,-57.357928,-0.02292796769374645,-49.860486],
 ["terrace-0049","work_1680_terrace.glb",T,-39.142894,-0.036608129304793915,-65.144715],
 ["terrace-0039","work_1693_terrace.glb",T,-17.09628,-0.03480033700286841,-74.052125],
 ["labyrinth-0004","work_1684_labyrinth.glb","6ecff24946390a7d367a485dbbe9ea48fc82892c0ee5347a507d015728014864",-95.088981,0.0025339289569975775,-23.708346],
 ["labyrinth-0025","work_1645_labyrinth.glb","3273205286ab16bb55c537b05713001c6fc9d0c0ef4da48f9f0175f1ad606820",-79.283665,-0.016928827472115132,-57.602955],
 ["labyrinth-0038","work_1658_labyrinth.glb","2d3d2032d3e806f8ff57b8c907730227c798809c321388171435947051cd7b70",-51.932088,-0.019688843285594615,-83.108713],
 ["labyrinth-0051","work_1671_labyrinth.glb","d93deb842f9998da905a9d8f21ea4715f2c48e1b4460fd4e73b38321bb7a2973",-17.017521,-0.01475532431470361,-96.51116],
 ["seed-0003","work_1644_seed.glb",SD,-68.890997,-0.006158492639495652,-17.176455],
 ["seed-0013","work_1657_seed.glb",SD,-60.211415,-0.016528677980768906,-37.624268],
 ["seed-0021","work_1670_seed.glb",SD,-45.63792,-0.05444576041354715,-54.389155],
 ["seed-0034","work_1683_seed.glb",SD,-26.597068,-0.04801350921268022,-65.830054],
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
window.setOrbit=(deg)=>{const a=deg*Math.PI/180,R=95;const px=-55+R*Math.cos(a),pz=-55+R*Math.sin(a);cam.position.set(px,26,pz);cam.lookAt(-55,0,-55);r.render(s,cam)};
window.setAerial=()=>{cam.position.set(-55,150,-55);cam.lookAt(-55,0,-55);r.render(s,cam)};
window.ready=true;
</script>`;
const server=createServer((req,res)=>{const u=(req.url??'/').split('?')[0];try{if(u==='/'){res.setHeader('content-type','text/html');res.end(html);return}if(u==='/three.module.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(threeModule));return}if(u==='/three.core.js'){res.setHeader('content-type','text/javascript');res.end(readFileSync(join(THREE_ROOT,'build/three.core.js')));return}if(u.startsWith('/examples/jsm/')){const p=join(THREE_ROOT,normalize(u.slice(1)));let x=readFileSync(p,'utf8').replaceAll("from 'three'","from '/three.module.js'").replaceAll('from "three"','from "/three.module.js"');res.setHeader('content-type','text/javascript');res.end(x);return}const m=u.match(/^\/model\/(.+)\.glb$/);if(m&&files.has(m[1])){res.setHeader('content-type','model/gltf-binary');res.end(files.get(m[1]));return}res.statusCode=404;res.end('not found')}catch(e){res.statusCode=500;res.end(String(e))}});await new Promise<void>(q=>server.listen(0,'127.0.0.1',q));const addr=server.address();if(!addr||typeof addr==='string')throw Error('no addr');const b=await chromium.launch({headless:true});try{const p=await b.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>console.error('PAGEERROR',e.message));await p.goto(`http://127.0.0.1:${addr.port}/`,{waitUntil:'networkidle'});await p.waitForFunction(()=>window.ready===true);await p.evaluate(()=>window.setAerial());await p.screenshot({path:join(OUT,'aerial.png')});for(const d of [0,60,120,180,240,300]){await p.evaluate(x=>window.setOrbit(x),d);await p.screenshot({path:join(OUT,`orbit-${d}.png`)})}console.log('rendered',OUT);}finally{await b.close();server.close();}
