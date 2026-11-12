// Campaign-only live /snap evidence. No authored verbs, uploads or shared-client changes.
import {createHash,randomUUID} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,resolve,basename} from 'node:path';

const WORLD='commons-next', ORIGIN='https://eidoverse.billding.dev';
const BASELINE=JSON.parse(readFileSync(join(import.meta.dir,'before/contracts.json'),'utf8'));
const IDS=BASELINE.map((e:any)=>e.id);
const INTERIORS=['nx-town-hall','nx-town-inn','nx-town-stable','nx-court','nx-tower'];
const canonical=(v:any):any=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const stable=(v:any)=>JSON.stringify(canonical(v));
const sha=(b:Uint8Array|string)=>createHash('sha256').update(b).digest('hex');
export const tuple=(e:any)=>Object.fromEntries(['id','kind','pos','yaw','scale','lib','parent','comp','name'].filter(k=>k in e).map(k=>[k,e[k]]));
const normalizedTuple=(e:any)=>({...tuple(e),parent:e.parent??null,comp:e.comp??{}});
const withoutLib=(e:any)=>{const t=normalizedTuple(e);delete t.lib;return t;};
export function validateContracts(expected:any[],targets:string[],phase:string){
 if(!['before','after'].includes(phase))throw Error('explicit before/after phase required');
 if(!Array.isArray(targets)||!targets.length||new Set(targets).size!==targets.length||targets.some(id=>!IDS.includes(id)))throw Error('explicit unique campaign target subset required');
 if(!Array.isArray(expected)||new Set(expected.map(e=>e.id)).size!==expected.length||expected.some(e=>!IDS.includes(e.id)))throw Error('invalid expected contract IDs');
 return targets.map(id=>{
  const want=expected.find(e=>e.id===id),base=BASELINE.find((e:any)=>e.id===id);
  if(!want||stable(withoutLib(want))!==stable(withoutLib(base))||typeof want.lib!=='string'||!/^store\/[0-9a-f]{16}\.glb$/.test(want.lib)||(phase==='before'&&want.lib!==base.lib))throw Error(`campaign contract drift ${id}`);
  return want;
 });
}
export function validateViews(views:any[],targets:string[]){
 const vector=(v:any)=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
 if(!Array.isArray(views)||new Set(views.map(v=>`${v.id}/${v.name}`)).size!==views.length)throw Error('duplicate/malformed views');
 for(const v of views)if(!targets.includes(v.id)||!['approach','interior','workstation','detail'].includes(v.name)||!vector(v.bodyLocal)||!vector(v.lookLocal)||Math.hypot(v.bodyLocal[0]-v.lookLocal[0],v.bodyLocal[2]-v.lookLocal[2])<.01||(v.name==='interior'&&!INTERIORS.includes(v.id)))throw Error('invalid/cross-scope view');
 for(const id of targets){if(!views.some(v=>v.id===id&&v.name==='approach')||(INTERIORS.includes(id)&&!views.some(v=>v.id===id&&v.name==='interior')))throw Error(`missing required view ${id}`);}
 return views;
}
export function assertCensus(census:any,expected:any[]){
 if(census?.world!==WORLD||!Array.isArray(census.entities))throw Error('wrong-world/malformed census');
 for(const want of expected){const found=census.entities.filter((e:any)=>e.id===want.id);if(found.length!==1||stable(normalizedTuple(found[0]))!==stable(normalizedTuple(want)))throw Error(`live tuple drift ${want.id}`);}
 return expected.map(want=>census.entities.find((e:any)=>e.id===want.id));
}

export function nearbyCompanions(host:any,entities:any[]){
 const bounds=(e:any)=>{const b=e.bbox??{min:[0,0,0],max:[0,0,0]},c=Math.cos(e.yaw??0),s=Math.sin(e.yaw??0),k=e.scale??1;const p=[[b.min[0],b.min[2]],[b.min[0],b.max[2]],[b.max[0],b.min[2]],[b.max[0],b.max[2]]].map(([x,z])=>[e.pos[0]+k*(x*c+z*s),e.pos[2]+k*(-x*s+z*c)]);return {min:[Math.min(...p.map(x=>x[0])),Math.min(...p.map(x=>x[1]))],max:[Math.max(...p.map(x=>x[0])),Math.max(...p.map(x=>x[1]))]};};
 const h=bounds(host),margin=1.5;
 return entities.filter(e=>{if(e.id===host.id||!Array.isArray(e.pos))return false;const b=bounds(e);return b.min[0]<=h.max[0]+margin&&b.max[0]>=h.min[0]-margin&&b.min[1]<=h.max[1]+margin&&b.max[1]>=h.min[1]-margin;});
}
export function pinProtected(census:any,baseline:any[]){
 if(census?.world!==WORLD||!Array.isArray(census.entities))throw Error('malformed/wrong-world protection census');
 const drift:any[]=[];const expected=baseline.map(want=>{const found=census.entities.filter((e:any)=>e.id===want.id);if(found.length!==1)throw Error('missing/duplicate protected entity');const observed=found[0];if(stable(normalizedTuple(want))!==stable(normalizedTuple(observed)))drift.push({id:want.id,before:normalizedTuple(want),observed:normalizedTuple(observed)});return observed;});
 return {expected,drift};
}
export function protectedContracts(records:any[]){
 if(!Array.isArray(records)||records.some(r=>!r?.geom||typeof r.geom.id!=='string')||new Set(records.map(r=>r.geom.id)).size!==records.length)throw Error('malformed protected wrappers');
 return records.map(r=>r.geom);
}
export function endpoint(url:string,testEndpoint=false){
 const u=new URL(url);
 if(u.username||u.password||u.search||u.hash||u.pathname!=='/ws'||(u.href!==`${ORIGIN.replace('https:','wss:')}/ws`&&!(testEndpoint&&u.protocol==='ws:'&&u.hostname==='127.0.0.1')))throw Error('unapproved endpoint');
 u.protocol=u.protocol==='wss:'?'https:':'http:';return u.origin;
}
export async function requestImage(base:string,follow:string){
 const u=new URL('/snap',base);u.search=new URLSearchParams({world:WORLD,follow,view:'first'}).toString();
 const request={endpoint:u.origin+u.pathname,world:WORLD,follow,view:'first',startedAt:new Date().toISOString()};
 try{
  const r=await fetch(u,{method:'GET',redirect:'error',signal:AbortSignal.timeout(20000),headers:{accept:'image/png'}});
  const meta={request,completedAt:new Date().toISOString(),httpStatus:r.status,contentType:r.headers.get('content-type'),cacheControl:r.headers.get('cache-control')};
  if(!r.ok)return {...meta,status:r.status===503?'RENDERER_UNAVAILABLE':r.status===404?'WORLD_OR_BODY_MISSING':r.status===504?'RENDERER_TIMEOUT':'HTTP_ERROR'};
  const png=Buffer.from(await r.arrayBuffer());
  if(png.length>20000000||!meta.contentType?.startsWith('image/png')||!png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {...meta,status:'INVALID_PNG'};
  const sharp=(await import('sharp')).default;const image=await sharp(png).metadata();await sharp(png).stats();
  if(!image.width||!image.height)return {...meta,status:'INVALID_PNG'};
  return {...meta,status:'CAPTURED',png,pngSha256:sha(png),bytes:png.length,width:image.width,height:image.height};
 }catch{return {request,completedAt:new Date().toISOString(),status:'NETWORK_OR_DECODE_ERROR',httpStatus:null};}
}
export async function captureLiveEyes(opts:any){
 const {cfg,outDir,phase,targets,testEndpoint=false}=opts;
 const expected=validateContracts(opts.expected,targets,phase),views=validateViews(opts.views,targets),base=endpoint(cfg.url,testEndpoint);
 if(existsSync(join(outDir,'manifest.json'))||existsSync(join(outDir,'started.json')))throw Error('refusing to overwrite immutable evidence');
 const frozenProtected=protectedContracts(JSON.parse(readFileSync(join(import.meta.dir,'before/protected.json'),'utf8')));
 const protectedExpected=opts.protectedExpected??frozenProtected;
 if(!testEndpoint&&stable(protectedExpected)!==stable(frozenProtected))throw Error('protected contract override refused');
 mkdirSync(outDir,{recursive:true});
 const report:any={status:'STARTED',world:WORLD,phase,evidenceKind:testEndpoint?'SYNTHETIC_LOCAL_NETWORK_TEST_ONLY':'actual-live-snap-api',startedAt:new Date().toISOString(),bodyId:`arthur-village-eye-${randomUUID().slice(0,12)}`,sourceSha256:sha(readFileSync(import.meta.path)),contractsSha256:sha(stable(expected)),viewsSha256:sha(stable(views)),protectedSha256:sha(stable(protectedExpected)),expected,views,wireCounts:{join:0,pose:0,verb:0},uploads:0,frames:views.map((v:any)=>({id:v.id,view:v.name,status:'NOT_ATTEMPTED'})),limitations:['Actual live /snap imagery, not a local GLB review rig.','Observer positions are assigned; this is not collision-tested walking.','First-person pitch/eye height are public-runtime and avatar controlled; lookLocal determines yaw only.','Weather and other participants are live and not frozen. Native image review is a separate gate.']};
 writeFileSync(join(outDir,'started.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 const localCompanions=Object.fromEntries(expected.map((e:any)=>[e.id,nearbyCompanions(BASELINE.find((b:any)=>b.id===e.id),protectedExpected).map((p:any)=>p.id)]));
 report.nearbyCompanionSelection={method:'baseline host world-XZ envelope plus 1.5m; bounding-box intersection, point fallback for lights',byHost:localCompanions};
 let captureProtected:any[]|null=null;report.protectedChangesDuringCapture=[];report.observedProtectedEvents=[];
 const readTargets=async()=>{
  const r=await fetch(`${base}/geom?world=${WORLD}`,{method:'GET',redirect:'error',signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(`census HTTP ${r.status}`);
  const data=await r.json();if(phase==='before')assertCensus(data,BASELINE);const selected=assertCensus(data,expected);
  if(!captureProtected){const pin=pinProtected(data,protectedExpected);captureProtected=pin.expected;report.preExistingProtectedDrift=pin.drift;report.captureStartProtected=pin.expected.map(normalizedTuple);}
  const localIds=new Set(Object.values(localCompanions).flat());const companions=assertCensus(data,captureProtected.filter((e:any)=>localIds.has(e.id)));
  const current=pinProtected(data,captureProtected);const observedAt=new Date().toISOString();
  if(current.drift.length)report.protectedChangesDuringCapture.push({observedAt,changes:current.drift});
  return {observedAt,httpStatus:r.status,targets:selected,companions:companions.map(normalizedTuple),all17BaselineTargetsGuarded:phase==='before',protectedCount:protectedExpected.length,protectedTuplesSha256:sha(stable(current.expected.map(normalizedTuple)))};
 };
 try{
  report.pre=await readTargets();if(opts.renderer)report.rendererPre=await opts.renderer.health();report.rendererCheck=await requestImage(base,report.bodyId);
  if(report.rendererCheck.status==='RENDERER_UNAVAILABLE'){
   report.status='RENDERER_UNAVAILABLE';report.frames=report.frames.map((f:any)=>({...f,status:'NOT_CAPTURED_RENDERER_UNAVAILABLE'}));
  }else{
   if(report.rendererCheck.status!=='WORLD_OR_BODY_MISSING')throw Error('renderer readiness unresolved');
   let ws:WebSocket|null=null,ticker:ReturnType<typeof setInterval>|null=null,fatal:string|null=null;
   const send=(m:any)=>{const payload=readOnlyWire(m,'body',report.bodyId);if(ws?.readyState!==WebSocket.OPEN)throw Error('presence websocket closed');ws.send(payload);report.wireCounts[m.type]++;};
   try{
    const snapshot:any=await new Promise((yes,no)=>{
     ws=new WebSocket(cfg.url);const timer=setTimeout(()=>no(Error('presence join timeout')),12000);
     ws.onopen=()=>{try{send({type:'join',world:WORLD,id:report.bodyId,avatar:cfg.avatar,agent:true,spectate:false,token:cfg.joinToken??'',agentToken:cfg.agentToken??''});}catch(e){clearTimeout(timer);no(e);}};
     ws.onerror=()=>{clearTimeout(timer);no(Error('presence websocket error'));};
     ws.onclose=()=>{clearTimeout(timer);fatal='presence websocket closed';no(Error(fatal));};
     ws.onmessage=(ev:any)=>{try{const m=JSON.parse(String(ev.data));if(m.type==='error'){fatal='presence server refusal';clearTimeout(timer);no(Error(fatal));}
      if(m.type==='snapshot'){clearTimeout(timer);yes(m);}
      if(m.type==='log'&&targets.includes(m.entry?.args?.id))fatal=`target event during capture ${m.entry.args.id}`;
      if(m.type==='log'&&protectedExpected.some((x:any)=>x.id===m.entry?.args?.id))report.observedProtectedEvents.push({id:m.entry.args.id,verb:m.entry.verb,seq:m.entry.seq,actor:m.entry.actor});
     }catch{fatal='malformed presence message';no(Error(fatal));}};
    });
    if(snapshot.world!==WORLD||snapshot.you!==report.bodyId||snapshot.restore||snapshot.state?.mounts?.[report.bodyId])throw Error('ephemeral identity mismatch/restore/mount');
    report.join={you:snapshot.you,world:snapshot.world,throughSeq:snapshot.throughSeq,observedAt:new Date().toISOString()};
    for(let i=0;i<views.length;i++){
     if(fatal)throw Error(fatal);
     const v=views[i],before=await readTargets(),entity=before.targets.find((e:any)=>e.id===v.id);
     const world=(p:number[])=>[entity.pos[0]+entity.scale*(p[0]*Math.cos(entity.yaw)+p[2]*Math.sin(entity.yaw)),entity.pos[1]+entity.scale*p[1],entity.pos[2]+entity.scale*(-p[0]*Math.sin(entity.yaw)+p[2]*Math.cos(entity.yaw))];
     const body=world(v.bodyLocal),look=world(v.lookLocal),pose={p:body,yaw:Math.atan2(look[0]-body[0],look[2]-body[2]),speed:0,clip:'idle'};
     send({type:'pose',pose});ticker=setInterval(()=>{try{send({type:'pose',pose});}catch{fatal='presence send failed';}},70);
     const rendererModels=opts.renderer?await prepareRendererView(opts.renderer.page,pose,[v.id,...before.companions.filter((e:any)=>localCompanions[v.id].includes(e.id)&&e.lib).map((e:any)=>e.id)]):null;
     await Bun.sleep(opts.settleMs??3000);if(fatal)throw Error(fatal);
     const receipt:any=await requestImage(base,report.bodyId);clearInterval(ticker);ticker=null;
     const after=await readTargets();if(fatal)throw Error(fatal);
     const {png,...meta}=receipt;
     const frame:any={...meta,id:v.id,view:v.name,rendererModels,companionsBefore:before.companions.filter((e:any)=>localCompanions[v.id].includes(e.id)),companionsAfter:after.companions.filter((e:any)=>localCompanions[v.id].includes(e.id)),bodyPose:pose,requestedBodyLocal:v.bodyLocal,requestedLookLocal:v.lookLocal,targetBefore:entity,targetAfter:after.targets.find((e:any)=>e.id===v.id),beforeObservedAt:before.observedAt,afterObservedAt:after.observedAt,protectedBeforeSha256:before.protectedTuplesSha256,protectedAfterSha256:after.protectedTuplesSha256};
     if(png){frame.file=`${v.id}-${v.name}.png`;writeFileSync(join(outDir,frame.file),png,{flag:'wx'});}
     report.frames[i]=frame;writeFileSync(join(outDir,`frame-${String(i).padStart(2,'0')}.json`),JSON.stringify(frame,null,2)+'\n',{flag:'wx'});
     if(receipt.status!=='CAPTURED'){report.status=receipt.status;break;}
     report.status='CAPTURED';
    }
   }finally{
    if(ticker)clearInterval(ticker);
    if(ws){const socket:WebSocket=ws;await new Promise<void>(yes=>{if(socket.readyState===WebSocket.CLOSED)return yes();const timer=setTimeout(yes,2000);socket.addEventListener('close',()=>{clearTimeout(timer);yes();},{once:true});socket.close();});report.bodyClosed=socket.readyState===WebSocket.CLOSED;}
   }
  }
  report.post=await readTargets();if(opts.renderer)report.rendererPost=await opts.renderer.health();
 }catch(e){report.status='FAILED';report.error=String(e).replaceAll(cfg.joinToken||'\0','[redacted]').replaceAll(cfg.agentToken||'\0','[redacted]').slice(0,240);}
 report.completedAt=new Date().toISOString();report.captured=report.frames.filter((f:any)=>f.status==='CAPTURED').length;
 writeFileSync(join(outDir,'manifest.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});return report;
}

export function rendererURL(base:string,id:string){
 if(base!==ORIGIN||!/^renderer-arthur-village-eye-[a-z0-9-]+$/.test(id))throw Error('unapproved renderer URL');
 const u=new URL('/',base);u.search=new URLSearchParams({world:WORLD,renderer:'',name:id.replace(/^renderer-/, '')}).toString();return u.href;
}
export function assertRendererHealth(h:any,id:string){
 if(!h?.joined||h.myId!==id||h.status!=='live'||h.wsReady!==1||h.snapshot?.world!==WORLD||h.snapshot?.you!==id)throw Error('renderer not connected with exact commissioned identity');
 return h;
}

export async function prepareRendererView(page:any,pose:any,ids:string[]){
 // Ephemeral camera placement only promotes the PUBLIC client's normal stream. /snap still renders the live body eyes.
 await page.evaluate((p:number[])=>{(window as any).EW.camera.position.set(...p);},pose.p);
 await page.waitForFunction((ids:string[])=>ids.every(id=>{const e=(window as any).EW?.entities?.get(id);return !!e&&!e.userData?.placeholder;}),ids,{timeout:60000});
 return page.evaluate((ids:string[])=>ids.map(id=>{const e=(window as any).EW.entities.get(id);return {id,loaded:!!e&&!e.userData?.placeholder};}),ids);
}
export async function withOwnedRenderer(start:()=>Promise<any>,work:(renderer:any)=>Promise<any>){
 const renderer=await start();try{return await work(renderer);}finally{await renderer.close();}
}
export async function startTemporaryRenderer(cfg:any,id:string){
 const base=endpoint(cfg.url),url=rendererURL(base,id);
 const {chromium}=await import('playwright');
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-webgpu','--enable-gpu','--disable-background-timer-throttling','--disable-renderer-backgrounding'],timeout:60000});
 const ctx=await browser.newContext({viewport:{width:1280,height:960},serviceWorkers:'block'});
 const httpCounts={read:0,writeRefused:0};let pageErrors=0;
 let closed=false;
 const close=async()=>{if(closed)return;clearTimeout(deadline);process.off('SIGINT',stop);process.off('SIGTERM',stop);await browser.close();closed=!browser.isConnected();};
 const stop=()=>{void close();};
 const deadline=setTimeout(stop,12*60*1000);process.on('SIGINT',stop);process.on('SIGTERM',stop);
 try{
  await ctx.route('**/*',route=>{if(['GET','HEAD'].includes(route.request().method())){httpCounts.read++;return route.continue();}httpCounts.writeRefused++;return route.abort('blockedbyclient');});
  await ctx.addInitScript(installRendererGuard,{id,wsURL:cfg.url,token:cfg.joinToken??'',wireSource:readOnlyWire.toString()});
  const page=await ctx.newPage();page.on('pageerror',()=>{pageErrors++;});
  const r=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});if(!r?.ok())throw Error(`public client HTTP ${r?.status()}`);
  await page.waitForFunction(()=>!!(window as any).EW?.net?.joined,undefined,{timeout:120000});
  const health=async()=>{
   const h=await page.evaluate(()=>{const w:any=window,n=w.EW?.net;return {joined:!!n?.joined,myId:n?.myId,status:n?.status,wsReady:n?.ws?.readyState,...w.__villageEyeGuard};});
   return {...assertRendererHealth(h,id),observedAt:new Date().toISOString(),httpCounts:{...httpCounts},pageErrors,viewport:{width:1280,height:960}};
  };
  const ready=await health();
  return {id,page,ready,health,close,get closed(){return closed;},get connected(){return browser.isConnected();}};
 }catch(e){await close();throw e;}
}

// Runs before any public-client code in a fresh browser context. No global profile writes.
export function installRendererGuard({id,wsURL,token,wireSource}:any){
 const w:any=window,check=eval(`(${wireSource})`),Native=WebSocket;
 const audit:any={sent:{},refused:{},snapshot:null,snapRequests:0,snapReplies:0};
 w.__villageEyeGuard=audit;
 if(location.origin==='https://eidoverse.billding.dev')localStorage.setItem('ew-key',token);
 const refuse=(type:string)=>{audit.refused[type]=(audit.refused[type]??0)+1;};
 class Guarded extends Native{
  pending=new Set<string>();
  constructor(url:string|URL,protocols?:string|string[]){
   if(String(url)!==wsURL){refuse('endpoint');throw Error('READ_ONLY_ENDPOINT_REFUSED');}
   super(url,protocols);
   this.addEventListener('message',(event:any)=>{try{const m=JSON.parse(String(event.data));if(m.type==='snapshot')audit.snapshot={world:m.world,you:m.you,throughSeq:m.throughSeq};if(m.type==='snap'&&typeof m.id==='string'){this.pending.add(m.id);audit.snapRequests++;}}catch{}});
  }
  send(data:any){
   let m:any;try{if(typeof data!=='string')throw Error();m=JSON.parse(data);const payload=check(m,'renderer',id);
    if(m.type==='snap-result'&&!this.pending.delete(m.id))throw Error();
    super.send(payload);audit.sent[m.type]=(audit.sent[m.type]??0)+1;if(m.type==='snap-result')audit.snapReplies++;
   }catch{refuse(['verb','lease','pose','snap-result'].includes(m?.type)?m.type:'unknown');}
  }
 }
 Object.defineProperty(w,'WebSocket',{value:Guarded,writable:false,configurable:false});
}

export function parseArgs(args:string[]){
 const a:any={};
 for(let i=0;i<args.length;i++){
  const k=args[i];if(k==='--allow-renderer'){if(a.allowRenderer)throw Error('duplicate flag');a.allowRenderer=true;continue;}
  if(!['--targets','--expected','--phase','--out','--views'].includes(k)||a[k]!==undefined||!args[i+1]||args[i+1].startsWith('--'))throw Error('unknown/duplicate/missing argument');a[k]=args[++i];
 }
 if(!a['--targets']||!a['--expected']||!['before','after'].includes(a['--phase'])||!a['--out'])throw Error('required --targets --expected --phase --out');
 const targets=a['--targets'].split(',');if(new Set(targets).size!==targets.length||targets.some((id:string)=>!IDS.includes(id)))throw Error('explicit campaign subset required');
 const outDir=resolve(import.meta.dir,a['--out']);if(!outDir.startsWith(join(import.meta.dir,'reviews','live-'))||outDir.slice(join(import.meta.dir,'reviews').length+1).includes('/'))throw Error('output must be campaign reviews/live-* directory');
 return {targets,phase:a['--phase'],outDir,expectedPath:resolve(import.meta.dir,a['--expected']),viewsPath:resolve(import.meta.dir,a['--views']??'live-views.json'),allowRenderer:!!a.allowRenderer};
}
if(import.meta.main){
 let cfg:any=null,output:string|undefined;
 try{
  const args=parseArgs(process.argv.slice(2));output=args.outDir;
  cfg=JSON.parse(readFileSync(join(import.meta.dir,'../config.json'),'utf8'));
  const expected=JSON.parse(readFileSync(args.expectedPath,'utf8'));
  const allViews=JSON.parse(readFileSync(args.viewsPath,'utf8'));
  const opts={...args,cfg,expected,views:allViews.filter((v:any)=>args.targets.includes(v.id))};
  let r=await captureLiveEyes(opts);
  if(r.status==='RENDERER_UNAVAILABLE'&&args.allowRenderer){
   await Bun.sleep(6000);output=args.outDir+'-renderer';
   let owned:any=null;
   try{
    r=await withOwnedRenderer(async()=>owned=await startTemporaryRenderer(cfg,`renderer-arthur-village-eye-${randomUUID().slice(0,12)}`),async renderer=>{
     await Bun.sleep(6000);return captureLiveEyes({...opts,outDir:output,renderer});
    });
   }finally{
    mkdirSync(output,{recursive:true});
    writeFileSync(join(output,'renderer-close.json'),JSON.stringify({at:new Date().toISOString(),rendererId:owned?.id??null,closed:owned?.closed??null,browserConnected:owned?.connected??null,started:!!owned},null,2)+'\n',{flag:'wx'});
   }
  }
  console.log(JSON.stringify({status:r.status,world:r.world,targets:r.expected.length,captured:r.captured,wireCounts:r.wireCounts,rendererSent:r.rendererPost?.sent??null,manifest:join(output,'manifest.json')}));
  process.exitCode=r.status==='CAPTURED'?0:2;
 }catch(e){
  const message=String(e).replaceAll(cfg?.joinToken||'\0','[redacted]').replaceAll(cfg?.agentToken||'\0','[redacted]').slice(0,240);
  if(output&&existsSync(output)&&!existsSync(join(output,'failure.json')))writeFileSync(join(output,'failure.json'),JSON.stringify({status:'CONFIG_INPUT_OR_RENDERER_ERROR',at:new Date().toISOString(),error:message},null,2)+'\n',{flag:'wx'});
  console.error(JSON.stringify({status:'CONFIG_INPUT_OR_RENDERER_ERROR',error:message}));process.exitCode=2;
 }
}

// Self-contained because this exact tested function is injected into the public client.
export function readOnlyWire(message:any,mode:'body'|'renderer',expectedId:string):string {
 const fail=()=>{throw Error('READ_ONLY_WIRE_REFUSED');};
 if(!message||typeof message!=='object'||Array.isArray(message)||!['body','renderer'].includes(mode)||!/^arthur-village-eye-[a-z0-9-]+$/.test(expectedId.replace(/^renderer-/,'')))return fail();
 const fields=message.type==='join'?(mode==='body'?['type','world','id','avatar','token','agentToken','agent','spectate']:['type','world','id','avatar','token','renderer','spectate']):message.type==='pose'&&mode==='body'?['type','pose']:message.type==='snap-result'&&mode==='renderer'?['type','id','dataUrl','error']:message.type==='ping'&&mode==='renderer'?['type','t']:[];
 if(!fields.length||Object.keys(message).some(k=>!fields.includes(k)))return fail();
 if(message.type==='join'){
  if(message.world!=='commons-next'||message.id!==expectedId||typeof message.avatar!=='string'||typeof message.token!=='string')return fail();
  if(mode==='body'&&(message.agent!==true||message.spectate!==false||expectedId.startsWith('renderer-')))return fail();
  if(mode==='renderer'&&(message.renderer!==true||message.spectate!==true||!expectedId.startsWith('renderer-')))return fail();
 }
 if(message.type==='pose'){
  const p=message.pose;
  if(!p||Object.keys(p).some(k=>!['p','yaw','speed','clip'].includes(k))||!Array.isArray(p.p)||p.p.length!==3||!p.p.every(Number.isFinite)||!Number.isFinite(p.yaw)||p.speed!==0||p.clip!=='idle')return fail();
 }
 if(message.type==='snap-result'&&(typeof message.id!=='string'||!message.id||((typeof message.dataUrl==='string'&&message.dataUrl.startsWith('data:image/png;base64,')&&message.error===undefined)?false:!(typeof message.error==='string'&&message.dataUrl===undefined))))return fail();
 if(message.type==='ping'&&!Number.isFinite(message.t))return fail();
 return JSON.stringify(message);
}
