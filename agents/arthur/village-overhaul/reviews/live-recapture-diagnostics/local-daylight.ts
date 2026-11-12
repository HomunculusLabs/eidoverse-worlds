// Offline exact served-byte daylight/fill supplement. Never connects to the world.
import {createServer} from 'node:http';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join,normalize} from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const base=resolve(import.meta.dir,'../..'),out=join(base,'reviews/live-recapture-local-daylight');
if(existsSync(join(out,'manifest.json')))throw Error('immutable output');mkdirSync(out,{recursive:true});
const sha=(b:any)=>createHash('sha256').update(b).digest('hex');
const live=JSON.parse(readFileSync(join(base,'reviews/live-recapture-01-renderer/manifest.json'),'utf8'));
const telemetry=JSON.parse(readFileSync(join(base,'reviews/live-recapture-01-renderer/supplement-telemetry.json'),'utf8'));
const discovery=JSON.parse(readFileSync(join(import.meta.dir,'discovery.json'),'utf8'));
const ids=['nx-town-hall','nx-town-inn'],bytes=Object.fromEntries(ids.map(id=>[id,readFileSync(join(import.meta.dir,`${id}-served.glb`))]));
for(const h of discovery.hosts)if(sha(bytes[h.tuple.id])!==h.servedSha256)throw Error('served byte drift');
const live2=JSON.parse(readFileSync(join(base,'reviews/live-recapture-02-renderer/manifest.json'),'utf8'));
const tele2=JSON.parse(readFileSync(join(base,'reviews/live-recapture-02-renderer/supplement-telemetry.json'),'utf8'));
const frames=[...live.frames.map((f:any,i:number)=>({...f,camera:telemetry.frames[i].camera,sourceRun:'live-recapture-01-renderer'})).filter((f:any)=>(f.id==='nx-town-hall'&&f.view==='interior')||(f.id==='nx-town-inn'&&f.view==='detail')),...live2.frames.map((f:any,i:number)=>({...f,camera:tele2.frames[i].camera,sourceRun:'live-recapture-02-renderer'}))];
const data={hosts:discovery.hosts,frames};
const html=`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#17232d}#label{height:44px;box-sizing:border-box;padding:7px 12px;color:white;font:14px monospace;line-height:16px}canvas{display:block}</style><div id="label"></div><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script><script type="module">
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
const data=${JSON.stringify(data)};
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1280,960);r.setPixelRatio(1);r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1;document.body.appendChild(r.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0xc5d5e1);
scene.add(new THREE.AmbientLight(0xffffff,1.2));scene.add(new THREE.HemisphereLight(0xffffff,0x626775,2));const sun=new THREE.DirectionalLight(0xfff0d5,2.4);sun.position.set(8,12,6);scene.add(sun);
const loader=new GLTFLoader(),draco=new DRACOLoader();draco.setDecoderPath('/three/examples/jsm/libs/draco/gltf/');loader.setDRACOLoader(draco);
const models=new Map(),hashes={};
for(const h of data.hosts){const ab=await (await fetch('/'+h.tuple.id+'.glb')).arrayBuffer();const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ab)),x=>x.toString(16).padStart(2,'0')).join('');if(digest!==h.servedSha256)throw Error('browser SHA drift');hashes[h.tuple.id]=digest;const g=await loader.parseAsync(ab,'/');g.scene.position.fromArray(h.tuple.pos);g.scene.rotation.y=h.tuple.yaw;g.scene.scale.setScalar(h.tuple.scale);models.set(h.tuple.id,g.scene);scene.add(g.scene);}
const camera=new THREE.PerspectiveCamera();
window.draw=(i)=>{const f=data.frames[i];for(const [id,m] of models)m.visible=id===f.id;camera.position.fromArray(f.camera.pos);camera.quaternion.fromArray(f.camera.quaternion);camera.fov=f.camera.fov;camera.aspect=f.camera.aspect;camera.near=f.camera.near;camera.far=100;camera.updateProjectionMatrix();r.render(scene,camera);document.querySelector('#label').textContent='LOCAL EXACT SERVED-BYTE DAYLIGHT/FILL REVIEW — NOT LIVE / NOT A LIGHT FIX | '+f.id+' '+f.view+'\\nSame camera as supplemental live capture; host only, no terrain/neighbors; synthetic neutral fill lighting';return {hashes,camera:f.camera};};
window.raw=()=>r.domElement.toDataURL('image/png');window.ready=true;
</script>`;
let localReads=0,refused=0,errors:string[]=[];
const threeRoot=resolve('node_modules/three');
const server=createServer((req,res)=>{
 try{if(!['GET','HEAD'].includes(req.method??'')){refused++;res.writeHead(405);res.end();return;}localReads++;
 let b:any,type='text/javascript';const path=new URL(req.url!,'http://localhost').pathname;
 if(path==='/'){b=Buffer.from(html);type='text/html';}
 else if(ids.some(id=>path===`/${id}.glb`)){b=bytes[path.slice(1,-4)];type='model/gltf-binary';}
 else if(path.startsWith('/three/')){const p=resolve(threeRoot,path.slice('/three/'.length));if(!p.startsWith(threeRoot+'/'))throw Error('path refused');b=readFileSync(p);type=p.endsWith('.wasm')?'application/wasm':'text/javascript';}
 else{res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':type,'Content-Length':b.length});res.end(req.method==='HEAD'?undefined:b);
 }catch(e){res.writeHead(500);res.end(String(e));}
});
await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const port=(server.address() as any).port;
const browser=await chromium.launch({headless:true});const outputs:any[]=[];let status='FAILED';
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:1004},deviceScaleFactor:1,serviceWorkers:'block'});
 await ctx.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===`http://127.0.0.1:${port}`&&['GET','HEAD'].includes(route.request().method()))return route.continue();refused++;return route.abort();});
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${port}`,{waitUntil:'networkidle'});await page.waitForFunction(()=>!!(window as any).ready,undefined,{timeout:60000});
 for(let i=0;i<frames.length;i++){
 const frame=frames[i],receipt=await page.evaluate(i=>(window as any).draw(i),i);const first=await page.evaluate(()=>(window as any).raw());await page.evaluate(i=>(window as any).draw(i),i);const second=await page.evaluate(()=>(window as any).raw());if(first!==second)throw Error('identical frame control failed');
 const file=`${frame.id}-${frame.view}-LOCAL-DAYLIGHT.png`;await page.screenshot({path:join(out,file)});outputs.push({file,sha256:sha(readFileSync(join(out,file))),width:1280,height:1004,sourceLiveFile:frame.sourceRun+'/'+frame.file,sourceLiveSha256:frame.pngSha256,sourceLib:frame.targetBefore.lib,sourceServedSha256:discovery.hosts.find((h:any)=>h.tuple.id===frame.id).servedSha256,receipt,identicalRawPixelControl:true});
 }
 if(errors.length)throw Error('browser errors');status='RENDERED';
}finally{
 await browser.close();await new Promise<void>(r=>server.close(()=>r()));
 writeFileSync(join(out,'manifest.json'),JSON.stringify({status,evidenceKind:'LOCAL_EXACT_SERVED_BYTE_DAYLIGHT_FILL_NOT_LIVE',at:new Date().toISOString(),rendererSourceSha256:sha(readFileSync(import.meta.path)),lighting:{ambient:{color:'ffffff',intensity:1.2},hemisphere:{sky:'ffffff',ground:'626775',intensity:2},directional:{color:'fff0d5',intensity:2.4,pos:[8,12,6]},shadows:false,toneMapping:'ACESFilmic',exposure:1},limitations:['Not a live world image or lighting fix.','Uses exact downloaded served host bytes; no remodel or recolor.','No terrain, neighbors, avatar, authored point-light gizmos, weather, public-runtime postprocessing or physics.','Same observed live camera positions/quaternions/fov; additional 44px labeling outside canvas.'],frames:outputs,errors,localReads,refused,worldRequests:0,uploads:0,verbs:0,browserClosed:!browser.isConnected(),serverClosed:!server.listening},null,2)+'\n',{flag:'wx'});
}
console.log(JSON.stringify({status,frames:outputs.length,errors,localReads,manifest:join(out,'manifest.json')}));
