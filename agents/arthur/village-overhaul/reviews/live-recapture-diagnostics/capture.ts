// Supplementary read-only runner; shared live-eye.ts and public runtime remain untouched.
import {captureLiveEyes,startTemporaryRenderer,withOwnedRenderer} from '../../live-eye.ts';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {randomUUID} from 'node:crypto';
const base=resolve(import.meta.dir,'../..'),name=process.argv[2]??'live-recapture-01';
if(!/^live-recapture-[a-z0-9-]+$/.test(name))throw Error('output scope');
const cfg=JSON.parse(readFileSync(resolve(base,'../config.json'),'utf8'));
const expected=JSON.parse(readFileSync(join(base,'reviews/live-hall-inn-expected.json'),'utf8'));
const viewsPath=process.argv[3]?resolve(base,process.argv[3]):join(base,'reviews/live-views-recapture.json');
if(!viewsPath.startsWith(join(base,'reviews/')))throw Error('views scope');
const views=JSON.parse(readFileSync(viewsPath,'utf8'));
const requests:any[]=[],telemetry:any[]=[];let owned:any=null;
const nativeFetch=globalThis.fetch;
globalThis.fetch=(async(input:any,init:any)=>{
 const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);
 if(url.origin!=='https://eidoverse.billding.dev'||!['GET','HEAD'].includes(init?.method??'GET')||!['/geom','/snap'].includes(url.pathname))throw Error('READ_ONLY_RUNNER_HTTP_REFUSED');
 const at=new Date().toISOString();const r=await nativeFetch(input,init);requests.push({at,url:url.href,method:init?.method??'GET',status:r.status});
 if(url.pathname==='/snap'&&r.ok&&owned){
  telemetry.push(await owned.page.evaluate(()=>{const w:any=(window as any).EW;const point:any[]=[];w.scene.traverse((o:any)=>{if(o.isPointLight)point.push({name:o.name,pos:o.position.toArray(),intensity:o.intensity,distance:o.distance,decay:o.decay,visible:o.visible});});
  const lightEntities=[...w.entities].filter(([id,e]:any)=>e.userData?.isLight).map(([id,e]:any)=>({id,pos:e.position.toArray(),params:e.userData.lightParams,rigKey:e.userData.rigKey,bounds:(()=>{const b=new w.THREE.Box3().setFromObject(e);return {min:b.min.toArray(),max:b.max.toArray()};})()}));
  return {at:new Date().toISOString(),camera:{pos:w.camera.position.toArray(),quaternion:w.camera.quaternion.toArray(),fov:w.camera.fov,aspect:w.camera.aspect,near:w.camera.near},sky:typeof w.skyArgs==='function'?w.skyArgs():w.skyArgs,rig:w.lightrig(),pointLights:point,lightEntities,exposure:w.renderer.toneMappingExposure};
 }));
 }
 return r;
}) as typeof fetch;
const opts={cfg,expected,views,targets:[...new Set(views.map((v:any)=>v.id))],phase:'after',outDir:join(base,'reviews',name)};
let report:any;
try{
 report=await captureLiveEyes(opts);
 if(report.status==='RENDERER_UNAVAILABLE'){
  await Bun.sleep(6000);
  const out=opts.outDir+'-renderer';
  try {report=await withOwnedRenderer(async()=>owned=await startTemporaryRenderer(cfg,`renderer-arthur-village-eye-${randomUUID().slice(0,12)}`),async renderer=>{await Bun.sleep(6000);return captureLiveEyes({...opts,outDir:out,renderer});});}
  finally{mkdirSync(out,{recursive:true});writeFileSync(join(out,'renderer-close.json'),JSON.stringify({at:new Date().toISOString(),rendererId:owned?.id??null,closed:owned?.closed??null,browserConnected:owned?.connected??null,started:!!owned},null,2)+'\n',{flag:'wx'});}
 }
}finally{
 const out=owned?opts.outDir+'-renderer':opts.outDir;mkdirSync(out,{recursive:true});
 writeFileSync(join(out,'supplement-telemetry.json'),JSON.stringify({evidenceKind:'read-only-live-runtime-observation',requests,frames:telemetry,exposureWrites:0,lightWrites:0,skyWrites:0},null,2)+'\n',{flag:'wx'});
 globalThis.fetch=nativeFetch;
}
console.log(JSON.stringify({status:report?.status,captured:report?.captured,wireCounts:report?.wireCounts,renderer:report?.rendererPost?.sent,rendererHTTP:report?.rendererPost?.httpCounts,manifest:join(owned?opts.outDir+'-renderer':opts.outDir,'manifest.json')}));
process.exitCode=report?.status==='CAPTURED'?0:2;
