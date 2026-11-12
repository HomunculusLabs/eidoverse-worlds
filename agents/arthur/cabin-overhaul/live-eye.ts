// Read-only live scene snapshots. No renderer startup, GUI, upload or world verbs.
import {createHash,randomUUID} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
const WORLD='commons-next';
const sha=(b:Uint8Array|string)=>createHash('sha256').update(b).digest('hex');
const IDS=['nx-town-row-cottage','nx-town-garden-cottage','nx-town-longhouse','nx-town-bunkhouse','nx-town-tower-house'];
const canonical=(v:any):any=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const stable=(v:any)=>JSON.stringify(canonical(v));
const tuple=(e:any)=>({id:e.id,kind:e.kind,pos:e.pos,yaw:e.yaw,scale:e.scale,lib:e.lib,parent:e.parent??null,comp:e.comp??{}});
const sameIds=(a:any[])=>a.length===5&&new Set(a.map(x=>x.id)).size===5&&IDS.every(id=>a.some(x=>x.id===id));

export async function captureLiveEyes({cfg,expected,outDir,views=null,phase='before',settleMs=2200}:any) {
  if(!Array.isArray(expected)||!sameIds(expected))throw Error('exact five-host contract required');
  if(!['before','after'].includes(phase))throw Error('explicit before or after phase required');
  if(existsSync(join(outDir,'manifest.json')))throw Error('refusing to overwrite an evidence manifest');
  const baseURL=new URL(cfg.url);baseURL.protocol=baseURL.protocol==='wss:'?'https:':'http:';baseURL.pathname='/';baseURL.search='';baseURL.hash='';baseURL.username='';baseURL.password='';
  const base=baseURL.origin;
  const readTargets=async()=>{
    const r=await fetch(`${base}/geom?world=${WORLD}`,{method:'GET',redirect:'error',signal:AbortSignal.timeout(20000)});
    if(!r.ok)throw Error(`census HTTP ${r.status}`);
    const d:any=await r.json();if(d.world!==WORLD||!Array.isArray(d.entities))throw Error('malformed/wrong-world census');
    const selected=d.entities.filter((e:any)=>IDS.includes(e.id));
    if(!sameIds(selected))throw Error('missing/duplicate live target');
    for(const want of expected){const got=selected.find((e:any)=>e.id===want.id);if(stable(tuple(got))!==stable(tuple(want)))throw Error(`target drift ${want.id}`);}
    return {observedAt:new Date().toISOString(),httpStatus:r.status,targets:selected};
  };
  const report:any={status:'STARTED',world:WORLD,phase,evidenceKind:'actual-live-snap-api',startedAt:new Date().toISOString(),bodyId:`arthur-cabin-eye-${randomUUID().slice(0,12)}`,contractsSha256:sha(stable(expected)),sourceSha256:sha(readFileSync(import.meta.path)),wireCounts:{join:0,pose:0,verb:0},frames:[],targets:[],limitations:['Native visual judgment is not performed by this capture tool.','Stationary viewpoint presence is not a collision-tested live walk.']};
  const finish=()=>{report.completedAt=new Date().toISOString();report.captured=report.frames.filter((x:any)=>x.status==='CAPTURED').length;mkdirSync(outDir,{recursive:true});writeFileSync(join(outDir,'manifest.json'),JSON.stringify(report,null,2)+'\n');return report;};
  try {
    const pre=await readTargets();report.pre=pre;report.targets=pre.targets;
    report.rendererCheck=await requestImage(base,report.bodyId);
    if(report.rendererCheck.status==='RENDERER_UNAVAILABLE'){
      report.status='RENDERER_UNAVAILABLE';
      report.frames=IDS.flatMap(id=>['approach','interior'].map(view=>({id,view,status:'NOT_CAPTURED_RENDERER_UNAVAILABLE',attempted:false,rendererCheckStartedAt:report.rendererCheck.request.startedAt})));
      report.post=await readTargets();return finish();
    }
    if(report.rendererCheck.status!=='WORLD_OR_BODY_MISSING')throw Error('renderer readiness unresolved');
    if(!views){report.status='VIEW_CONTRACT_REQUIRED';report.post=await readTargets();return finish();}
    const vector=(v:any)=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
    if(!Array.isArray(views)||views.length!==10||new Set(views.map(v=>`${v.id}/${v.name}`)).size!==10||!IDS.every(id=>['approach','interior'].every(name=>views.some(v=>v.id===id&&v.name===name)))||views.some(v=>!vector(v.bodyLocal)||!vector(v.lookLocal)||Math.hypot(v.bodyLocal[0]-v.lookLocal[0],v.bodyLocal[2]-v.lookLocal[2])<.01))throw Error('invalid exact ten-view contract');
    report.viewsSha256=sha(stable(views));
    let ws:WebSocket|null=null,ticker:ReturnType<typeof setInterval>|null=null,fatal:string|null=null;
    const send=(message:any)=>{const payload=readOnlyWire(message);if(ws?.readyState!==WebSocket.OPEN)throw Error('presence websocket closed');ws.send(payload);report.wireCounts[message.type]++;};
    try {
      const snap:any=await new Promise((yes,no)=>{
        ws=new WebSocket(cfg.url);const timer=setTimeout(()=>no(Error('join timeout')),8000);
        ws.onopen=()=>send({type:'join',world:WORLD,id:report.bodyId,avatar:cfg.avatar,agent:true,spectate:false,token:cfg.joinToken??'',agentToken:cfg.agentToken??''});
        ws.onerror=()=>{clearTimeout(timer);no(Error('presence websocket error'));};
        ws.onmessage=(ev:any)=>{try{const m=JSON.parse(String(ev.data));if(m.type==='error'){fatal='server refusal';clearTimeout(timer);no(Error(fatal));}
          if(m.type==='snapshot'){clearTimeout(timer);yes(m);}
          if(m.type==='log'&&[...IDS,...IDS.map(id=>`${id}-l`),'nx-artwalk-b17-garden-seed-lattice','nx-artwalk-b18-row-warp-count','nx-artwalk-b19-longhouse-feast-count','nx-artwalk-b20-bunkhouse-four-rooms','nx-artwalk-b21-tower-ascension-count'].includes(m.entry?.args?.id))fatal='protected entity changed during capture';
        }catch{fatal='malformed websocket message';no(Error(fatal));}};
        ws.onclose=()=>{clearTimeout(timer);fatal='presence websocket closed';no(Error(fatal));};
      });
      if(snap.world!==WORLD||snap.you!==report.bodyId||snap.state?.mounts?.[report.bodyId]||snap.restore)throw Error('ephemeral identity mismatch/restore/mount');
      report.join={you:snap.you,world:snap.world,throughSeq:snap.throughSeq,observedAt:new Date().toISOString()};
      for(const v of views){
        if(fatal)throw Error(fatal);
        const before=await readTargets(),entity=before.targets.find((e:any)=>e.id===v.id);
        const world=(p:number[])=>[entity.pos[0]+entity.scale*(p[0]*Math.cos(entity.yaw)+p[2]*Math.sin(entity.yaw)),entity.pos[1]+entity.scale*p[1],entity.pos[2]+entity.scale*(-p[0]*Math.sin(entity.yaw)+p[2]*Math.cos(entity.yaw))];
        const body=world(v.bodyLocal),look=world(v.lookLocal),pose={p:body,yaw:Math.atan2(look[0]-body[0],look[2]-body[2]),speed:0,clip:'idle'};
        send({type:'pose',pose});ticker=setInterval(()=>{try{send({type:'pose',pose})}catch{fatal='presence send failed';}},70);
        await Bun.sleep(settleMs);if(fatal)throw Error(fatal);
        const receipt:any=await requestImage(base,report.bodyId);clearInterval(ticker);ticker=null;
        const after=await readTargets();if(fatal)throw Error(fatal);
        const {png,...meta}=receipt;const frame:any={...meta,id:v.id,view:v.name,bodyPose:pose,requestedBodyLocal:v.bodyLocal,requestedLookLocal:v.lookLocal,targetBefore:entity,targetAfter:after.targets.find((e:any)=>e.id===v.id),beforeObservedAt:before.observedAt,afterObservedAt:after.observedAt};
        if(png){mkdirSync(outDir,{recursive:true});frame.file=`${v.id}-${v.name}.png`;writeFileSync(join(outDir,frame.file),png);}
        report.frames.push(frame);if(receipt.status!=='CAPTURED'){report.status=receipt.status;report.post=after;return finish();}
      }
      report.post=await readTargets();report.status='CAPTURED';return finish();
    }finally{if(ticker)clearInterval(ticker);if(ws)ws.close();}
  }catch(e){report.status='FAILED';report.error=String(e).replaceAll(cfg.joinToken??'\0','[redacted]').replaceAll(cfg.agentToken??'\0','[redacted]').slice(0,240);return finish();}
}

if(import.meta.main){
  const out=resolve(process.argv[2]??join(import.meta.dir,'reviews',`live-before-${Date.now()}`));
  try {
    const cfg=JSON.parse(readFileSync(join(import.meta.dir,'../config.json'),'utf8'));
    const expected=JSON.parse(readFileSync(process.argv[4]??join(import.meta.dir,'before/contracts.json'),'utf8'));
    const views=process.argv[3]?JSON.parse(readFileSync(process.argv[3],'utf8')):null;
    const r=await captureLiveEyes({cfg,expected,outDir:out,views,phase:process.argv[5]??'before'});
    console.log(JSON.stringify({status:r.status,world:r.world,targets:r.targets.length,captured:r.captured,wireCounts:r.wireCounts,manifest:join(out,'manifest.json')}));
    process.exitCode=r.status==='CAPTURED'?0:2;
  }catch{console.error(JSON.stringify({status:'CONFIG_OR_INPUT_ERROR'}));process.exitCode=2;}
}

export function readOnlyWire(message:any):string {
  const allowed=message?.type==='join'?['type','world','id','avatar','token','agentToken','agent','spectate']:message?.type==='pose'?['type','pose']:[];
  if(!allowed.length||Object.keys(message).some(k=>!allowed.includes(k)))throw Error('authored or unknown wire message refused');
  if(message.type==='join'&&(message.world!==WORLD||message.spectate!==false||typeof message.id!=='string'||message.agent!==true))throw Error('invalid explicit ephemeral join');
  if(message.type==='pose') {
    const p=message.pose;
    if(!p||Object.keys(p).some(k=>!['p','yaw','speed','clip'].includes(k))||!Array.isArray(p.p)||p.p.length!==3||!p.p.every(Number.isFinite)||!Number.isFinite(p.yaw)||p.speed!==0||p.clip!=='idle')throw Error('invalid stationary presence');
  }
  return JSON.stringify(message);
}
export async function requestImage(base:string,follow:string,view='first') {
  if(!['first','third','selfie'].includes(view))throw Error('invalid view');
  const url=new URL('/snap',base);url.searchParams.set('world',WORLD);url.searchParams.set('follow',follow);url.searchParams.set('view',view);
  const request={world:WORLD,follow,view,endpoint:url.origin+url.pathname,startedAt:new Date().toISOString()};
  try {
    const response=await fetch(url,{method:'GET',redirect:'error',signal:AbortSignal.timeout(18000),headers:{accept:'image/png'}});
    const meta={request,completedAt:new Date().toISOString(),httpStatus:response.status,contentType:response.headers.get('content-type'),cacheControl:response.headers.get('cache-control')};
    if(!response.ok)return {...meta,status:response.status===503?'RENDERER_UNAVAILABLE':response.status===404?'WORLD_OR_BODY_MISSING':response.status===504?'RENDERER_TIMEOUT':'HTTP_ERROR'};
    const png=Buffer.from(await response.arrayBuffer());
    if(png.length>20_000_000||!meta.contentType?.startsWith('image/png')||!png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {...meta,status:'INVALID_PNG'};
    const sharp=(await import('sharp')).default;
    const image=await sharp(png).metadata();await sharp(png).stats();
    if(!image.width||!image.height)return {...meta,status:'INVALID_PNG'};
    return {...meta,status:'CAPTURED',png,pngSha256:sha(png),bytes:png.length,width:image.width,height:image.height};
  }catch{return {request,completedAt:new Date().toISOString(),status:'NETWORK_OR_DECODE_ERROR',httpStatus:null};}
}
