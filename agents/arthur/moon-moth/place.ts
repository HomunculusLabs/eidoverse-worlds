// Explicit, bounded new-only installer. Run from repository root; default is read-only.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual as eq } from 'node:util';
import { WebSocket } from 'ws';
import { foldEntry } from '../../../shared/fold.js';
import { BUILDER_ID, placementPlan } from './placement-plan';
import { makeFlightBinding } from './flight-contract';
import { preflight } from './site-preflight';
export const BASE='https://eidoverse.billding.dev', WORLD='commons-next';
export const SCRIPT_SHA='4adcd4929578e6501b7a96bcd6a4b7fa267b53a260afe0b31bbbf52514cd7389';
const sha=(b:any)=>createHash('sha256').update(b).digest('hex');
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const demand=(ok:any,msg:string)=>{if(!ok)throw Error(msg);};
export function desiredContract(site:any,model:any) {
  demand(site.id==='nx-moonmoth-001' && site.world===WORLD && site.sha256===model.sha256,'Model/site identity drift');
  return {entity:{lib:`store/${site.sha256.slice(0,16)}.glb`,pos:site.pos,yaw:site.yaw,scale:1,collide:'exact',
    comp:{sockets:{seat:{pos:model.seat.socket,pose:'sitchair',yaw:0}},...site.partMotions,lock:true}},
    behavior:makeFlightBinding(`store/scripts/${SCRIPT_SHA.slice(0,16)}.js`,{perch:site.pos,groundY:site.groundY,yaw:site.yaw})};
}
// Bounded wire chassis, not a resident: accept current snapshot, then fold live echoes.
// Read-back uses a separate new connection, so no locally assumed success can pass.
export function connection(cfg:any) {
  return openWorldConnection(cfg,{url:BASE.replace('https:','wss:')+'/ws'});
}
export async function openWorldConnection(cfg:any, options:{url:string,snapshotTimeoutMs?:number,echoTimeoutMs?:number,debugTimeoutMs?:number}) {
  const ws=new WebSocket(options.url);
  let state:any, joined=false, fatal:Error|undefined, actor='', lastSeq=0, request=0;
  type Waiter={match:(m:any)=>boolean,resolve:(m:any)=>void,reject:(e:Error)=>void,timer:ReturnType<typeof setTimeout>};
  const pending=new Map<string,Waiter>();
  let closing:Promise<void>|undefined;
  function shutdown() {
    return closing??=new Promise<void>(resolve=>{
      if(ws.readyState===WebSocket.CLOSED){resolve();return;}
      // Graceful first, but a silent peer may not hold this installer open.
      const timer=setTimeout(()=>{ws.terminate();resolve();},1000);
      ws.once('close',()=>{clearTimeout(timer);resolve();});
      if(ws.readyState===WebSocket.CONNECTING)ws.terminate();else ws.close();
    });
  }
  function fail(error:Error) {
    fatal??=error;
    for(const p of pending.values()){clearTimeout(p.timer);p.reject(fatal);}
    pending.clear();void shutdown();
  }
  function healthy() {
    if(fatal)throw fatal;
    demand(ws.readyState===WebSocket.OPEN,'world socket is not open');
  }
  function wait(key:string,ms:number,match:Waiter['match']) {
    return new Promise<any>((resolve,reject)=>{
      pending.set(key,{match,resolve,reject,timer:setTimeout(()=>fail(Error(`${key} timeout`)),ms)});
    });
  }
  function write(message:any) {
    try {healthy();ws.send(JSON.stringify(message),error=>{if(error)fail(Error('world socket send failed'));});}
    catch(error){fail(error as Error);}
  }
  function validEntry(e:any) {
    demand(e && Number.isSafeInteger(e.seq) && e.seq>=0 && Number.isFinite(e.ts)
      && typeof e.actor==='string' && typeof e.verb==='string' && e.args && typeof e.args==='object'
      && !Array.isArray(e.args),'malformed world log entry');
  }
  const ready=wait('snapshot',options.snapshotTimeoutMs??20000,m=>m.type==='snapshot');
  ws.on('open',()=>write({type:'join',world:WORLD,id:BUILDER_ID,avatar:cfg.avatar??'claude',token:cfg.joinToken,agentToken:cfg.agentToken}));
  ws.on('error',()=>fail(Error('world socket error')));
  ws.on('close',()=>fail(Error('world socket closed')));
  ws.on('message',(raw:any)=>{
    if(fatal)return;
    try {
      const m=JSON.parse(String(raw));
      if(m.type==='error')throw Error('World refused: '+String(m.error));
      if(m.type==='snapshot') {
        demand(!joined && m.world===WORLD && typeof m.you==='string' && m.you.length>0
          && m.state?.entities && typeof m.state.entities==='object' && !Array.isArray(m.state.entities)
          && Array.isArray(m.entries) && Number.isSafeInteger(m.throughSeq) && m.throughSeq>=0,'malformed world snapshot');
        state=m.state;actor=m.you;lastSeq=m.throughSeq;
        // World.append already folds every tail entry into joinPayload().state.
        // throughSeq is the checkpoint, NOT the current-state watermark. The tail
        // advances the watermark only; replay can resurrect removed-host mounts.
        for(const e of m.entries){validEntry(e);lastSeq=Math.max(lastSeq,e.seq);}
        joined=true;
      }
      if(m.type==='log') {
        demand(joined,'log before snapshot');validEntry(m.entry);
        demand(m.entry.seq>lastSeq,'non-monotonic world log');
        lastSeq=m.entry.seq;foldEntry(state,m.entry);
      }
      for(const [key,p] of pending) if(p.match(m)) {
        clearTimeout(p.timer);pending.delete(key);p.resolve(m);
      }
    } catch(error){fail(error as Error);}
  });
  try {await ready;healthy();}catch(error){await shutdown();throw error;}
  return {get state(){healthy();return state;},async close(){fail(Error('connection closed'));await shutdown();},
    async send(verb:string,args:any) {
      healthy();demand(!pending.has('echo'),'another verb is awaiting its echo');
      const expected=structuredClone(args), afterSeq=lastSeq;
      const echo=wait('echo',options.echoTimeoutMs??10000,m=>m.type==='log' && m.entry.seq>afterSeq
        && m.entry.actor===actor && m.entry.verb===verb && eq(m.entry.args,expected));
      write({type:'verb',verb,args:expected});
      await echo;healthy();
    },
    async debug() {
      healthy();const reqId=`moon-debug-${++request}`;
      const response=wait(reqId,options.debugTimeoutMs??10000,m=>m.type==='debug' && m.reqId===reqId);
      write({type:'debug',reqId,behavior:'nx-moonmoth-001-flight',limit:30});
      const result=await response;healthy();return result;
    }};
}
export async function ensureStored(bytes:Uint8Array,expectedSHA:string,path:string,cfg:any,asScript:boolean,counts:any,
  options:{base?:string,mode?:'stage'|'apply',servedSHA?:string}={}) {
  const base=options.base??BASE;
  demand(/^[a-f0-9]{64}$/.test(expectedSHA) && sha(bytes)===expectedSHA,'Source byte drift');
  demand(path===(asScript?`store/scripts/${expectedSHA.slice(0,16)}.js`:`store/${expectedSHA.slice(0,16)}.glb`),'Source address mismatch');
  const publicSHA=asScript?expectedSHA:options.servedSHA;
  if(options.mode!=='stage'||publicSHA!==undefined) demand(typeof publicSHA==='string' && /^[a-f0-9]{64}$/.test(publicSHA),'Reviewed served digest required');
  async function verifyPublic(response:Response) {
    demand(response.ok,`Store read failed HTTP ${response.status}`);
    // Staging makes bytes available FOR review; it cannot author the review pin.
    if(publicSHA===undefined){await response.body?.cancel();return;}
    demand(sha(new Uint8Array(await response.arrayBuffer()))===publicSHA,'Stored byte mismatch');
  }
  const existing=await fetch(`${base}/library/${path}`,{cache:'no-store',signal:AbortSignal.timeout(20000)});
  if(existing.ok) {await verifyPublic(existing);return;}
  await existing.body?.cancel();
  demand(existing.status===404,`Store read failed HTTP ${existing.status}`);
  // Shared fleet budget: at least 21s between our uploads, longer on 429.
  if(counts.lastUpload) await sleep(Math.max(0,21000-(Date.now()-counts.lastUpload)));
  const url=new URL(base+'/upload');
  url.searchParams.set('token',cfg.agentToken);url.searchParams.set('name','Moon Moth');
  if(asScript)url.searchParams.set('as','script');
  for(let attempt=0;attempt<3;attempt++) {
    counts.lastUpload=Date.now();
    const r=await fetch(url,{method:'POST',body:bytes,signal:AbortSignal.timeout(30000)});
    counts.uploadAttempts++;
    if(r.status===429 && attempt<2){await sleep((attempt+1)*30000);continue;}
    demand(r.ok,`Upload failed HTTP ${r.status}`);
    const receipt:any=await r.json();demand(receipt.path===path,'Upload address mismatch');counts.uploads++;
    const back=await fetch(`${base}/library/${path}`,{cache:'no-store',signal:AbortSignal.timeout(20000)});
    await verifyPublic(back);
    return;
  }
  throw Error('Upload retries exhausted');
}
export async function applyPlan(c:{state:any,send:(verb:string,args:any)=>Promise<void>},desired:any,
  plan:Array<[string,any]>,options:{paceMs?:number,onAccepted?:()=>void}={}) {
  const remaining=structuredClone(plan);
  const guard=()=>demand(eq(placementPlan(c.state,desired),remaining),'Concurrent target drift — refusing remaining verbs');
  guard();
  while(remaining.length) {
    // Pace BEFORE the final guard; never yield between checking and writing.
    if(remaining.length!==plan.length)await sleep(options.paceMs??700);
    guard();
    const [verb,args]=remaining[0];
    await c.send(verb,args);options.onAccepted?.();
    remaining.shift();guard();
  }
}
export function reviewedServedSite(site:any,pin:any,bytes:Uint8Array) {
  demand(pin && /^[a-f0-9]{64}$/.test(pin.sourceSha256) && /^[a-f0-9]{64}$/.test(pin.servedSha256)
    && pin.sourceSha256===site.sha256 && pin.lib===`store/${site.sha256.slice(0,16)}.glb`,
    'Missing or invalid served-contract.json — reviewed sourceSha256, servedSha256 and lib required');
  demand(bytes && sha(bytes)===pin.servedSha256,'Local served.glb does not match reviewed served digest');
  return {...site,glb:'agents/arthur/moon-moth/served.glb',sha256:pin.servedSha256};
}
export function parseMode(args:string[]):'dry'|'stage'|'apply' {
  if(args.length===0)return 'dry';
  if(args.length===1 && args[0]==='--stage')return 'stage';
  if(args.length===1 && args[0]==='--apply')return 'apply';
  throw Error('Usage: place.ts [--stage | --apply]');
}
type InstallerIO={
  read:(name:string)=>Uint8Array;connect:typeof connection;spatial:typeof preflight;store:typeof ensureStored;
  report:(value:any)=>void;record:(value:any)=>void;paceMs?:number;
};
export async function runWithIO(mode:'dry'|'stage'|'apply',io:InstallerIO) {
  demand(['dry','stage','apply'].includes(mode),'Invalid installer mode');
  const json=(name:string)=>JSON.parse(new TextDecoder().decode(io.read(name)));
  const site=json('./site-contract.json'), model=json('./model-contract.json');
  const glb=io.read('./moon-moth.glb'), script=io.read('./flight.js');
  demand(sha(glb)===site.sha256 && sha(script)===SCRIPT_SHA,'Reviewed source byte drift');
  const desired=desiredContract(site,model);
  let servedContract:any, spatialSite=site;
  if(mode==='apply') {
    // Load only the operator-reviewed pin. Never synthesize it from a GET.
    servedContract=json('./served-contract.json');
    spatialSite=reviewedServedSite(site,servedContract,io.read('./served.glb'));
  }
  const cfg=json('../config.json');
  demand(cfg.url===BASE.replace('https:','wss:')+'/ws','Configured host mismatch');
  const counts={uploads:0,uploadAttempts:0,lastUpload:0,verbs:0};
  const store=async()=>{
    await io.store(glb,site.sha256,desired.entity.lib,cfg,false,counts,{mode:mode==='stage'?'stage':'apply',servedSHA:servedContract?.servedSha256});
    await io.store(script,SCRIPT_SHA,desired.behavior.src,cfg,true,counts,{mode:mode==='stage'?'stage':'apply'});
  };
  // Staging has no world connection or verb path, even on an idempotent target.
  if(mode==='stage') {
    await store();io.report({mode:'STAGED_ONLY',counts,lib:desired.entity.lib,script:desired.behavior.src,servedVerified:false});return;
  }
  let c=await io.connect(cfg), spatial:any=null;
  try {
    const plan=placementPlan(c.state,desired);
    const guard=()=>demand(eq(placementPlan(c.state,desired),plan),'Concurrent target drift — refusing remaining verbs');
    const needsSpawn=plan.some(([v])=>v==='spawn');
    const capacity=()=>{
      if(plan.some(([v])=>v==='behavior'))demand(Object.keys(c.state.behaviors??{}).length<12,'World behavior capacity full');
    };
    capacity();
    if(needsSpawn) {
      await c.close();spatial=await io.spatial(spatialSite);c=await io.connect(cfg);guard();
    }
    if(mode==='dry') {io.report({mode:'DRY_RUN',planned:plan.map(([verb,args])=>({verb,id:args.id})),spatial,counts});return;}
    await store();guard();
    // Upload pacing can outlive the spatial epoch. Use the independently reviewed
    // SERVED articulated model, but keep the source/site identity above unchanged.
    if(needsSpawn)spatial=await io.spatial(spatialSite);
    guard();capacity();
    await applyPlan(c,desired,plan,{paceMs:io.paceMs,onAccepted:()=>counts.verbs++});
    demand(placementPlan(c.state,desired).length===0,'Echo contract incomplete');
    await c.close();c=await io.connect(cfg);
    demand(placementPlan(c.state,desired).length===0,'Independent snapshot mismatch');
    const debug=await c.debug();demand(debug.status==='running','Behavior not running: '+debug.status);
    demand(placementPlan(c.state,desired).length===0,'Target drift during debug read-back');
    const receipt={verdict:'PLACED_VERIFIED',at:new Date().toISOString(),world:WORLD,target:site.id,counts,spatial,servedContract,
      entity:c.state.entities[site.id],behavior:c.state.behaviors[desired.behavior.id],debug,
      scope:'exact target and scoped behavior; no seating/visual PASS implied'};
    io.record(receipt);io.report(receipt);
  } finally {await c.close();}
}
export async function run(mode:'dry'|'stage'|'apply'='dry') {
  return runWithIO(mode,{
    read:name=>new Uint8Array(readFileSync(new URL(name,import.meta.url))),
    connect:connection,spatial:preflight,store:ensureStored,
    record:receipt=>writeFileSync(new URL(`./placement-${Date.now()}.json`,import.meta.url),JSON.stringify(receipt,null,2)+'\n'),
    report:value=>console.log(JSON.stringify(value,null,2)),
  });
}
if(import.meta.main) {
  run(parseMode(process.argv.slice(2))).catch(e=>{console.error('MOON_MOTH_BLOCKED',String(e.message).replace(/([?&]token=)[^&\s]+/g,'$1[REDACTED]'));process.exitCode=1;});
}
