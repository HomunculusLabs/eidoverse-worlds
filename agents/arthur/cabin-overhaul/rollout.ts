// Explicitly gated five-home rollout; default is read-only dry-run.
// Usage: bun agents/arthur/cabin-overhaul/rollout.ts [--apply] [--id nx-town-...]
import {readFileSync,writeFileSync,appendFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
import {foldEntry} from '../../../shared/fold.js';
import {stable,chooseOperation,protectUnchanged,buildVerbs} from './contracts.ts';
const ROOT=import.meta.dir,WORLD='commons-next';
export function buildHostVerbs(live:any,next:any,folded:any):Array<[string,any]>{
 if(!folded||folded.parent||folded.comp?.lock)throw Error('missing/locked/parented folded host');
 for(const [type,data] of Object.entries(folded.comp??{}))if(type.length>32||JSON.stringify(data)?.length>8192)throw Error('component cannot roundtrip through server validator');
 const verbs=buildVerbs(live,next);
 // /geom omits this spawn-only preference; place/comp cannot restore it.
 if(folded.collide!=null)verbs.find(([verb])=>verb==='spawn')![1].collide=folded.collide;
 const sim:any={entities:{[live.id]:structuredClone(folded)}};
 for(const [verb,args] of verbs)foldEntry(sim,{verb,args,actor:folded.actor,ts:folded.ts,seq:0});
 if(stable(hostParams(sim.entities[live.id]))!==stable(hostParams({...folded,lib:next.lib})))throw Error('host parameters cannot roundtrip replacement');
 return verbs;
}
// /geom deliberately omits spawn-only fields and provenance. Require both views.
function geomView(id:string,e:any){return {id,lib:e.lib??null,kind:e.kind??'thing',pos:e.pos,yaw:e.yaw??0,scale:e.scale??1,comp:e.comp??{},parent:e.parent??null};}
function hostParams(e:any){const {actor,ts,...params}=e;return {...params,yaw:e.yaw??0,scale:e.scale??1,comp:e.comp??{}};}
export function hostGate(live:any,before:any,next:any,captured:any,folded:any):'noop'|'replace'{
 const op=chooseOperation(live,before,next);
 if(!captured||!folded)throw Error(`${before.id} missing folded host`);
 if(captured.parent||captured.comp?.lock||folded.parent||folded.comp?.lock)throw Error(`${before.id} locked/parented host — no automatic unlock`);
 if(stable(geomView(before.id,captured))!==stable(geomView(before.id,before)))throw Error(`${before.id} inconsistent captured host`);
 if(stable(geomView(before.id,folded))!==stable(geomView(before.id,live)))throw Error(`${before.id} geom/snapshot host drift`);
 const expected={...captured,lib:op==='noop'?next.lib:before.lib};
 if(op==='replace'?stable(folded)!==stable(expected):stable(hostParams(folded))!==stable(hostParams(expected)))throw Error(`${before.id} folded host drift`);
 return op;
}
export function boundsGate(actual:any,expected:any){
 for(const side of ['min','max']){
  if(!Array.isArray(actual?.[side])||actual[side].length!==3||!Array.isArray(expected?.[side])||expected[side].length!==3)throw Error('missing reviewed bounds');
  for(const k of [0,1,2])if(!Number.isFinite(actual[side][k])||!Number.isFinite(expected[side][k])||Math.abs(actual[side][k]-expected[side][k])>.025)throw Error('bounds do not match reviewed geometry');
 }
}
export async function verifyReadback(live:any,before:any,slot:any,captured:any,folded:any,readAsset:()=>Promise<Buffer>){
 if(hostGate(live,before,slot,captured,folded)!=='noop')throw Error('post-place mismatch');
 boundsGate(live.bbox,slot.bounds);
 const served=await readAsset();
 if(served.length<20||served.toString('ascii',0,4)!=='glTF'||served.readUInt32LE(4)!==2||served.readUInt32LE(8)!==served.length)throw Error('served asset not a complete GLB');
 for(let offset=12;offset<served.length;){
  if(offset+8>served.length)throw Error('truncated GLB chunk');
  const length=served.readUInt32LE(offset),type=served.readUInt32LE(offset+4),end=offset+8+length;
  if(length%4||end>served.length)throw Error('invalid GLB chunk length');
  if(offset===12){
   if(type!==0x4e4f534a||JSON.parse(served.toString('utf8',offset+8,end))?.asset?.version!=='2.0')throw Error('invalid GLB JSON');
  }else if(type!==0x004e4942)throw Error('unexpected GLB chunk');
  offset=end;
 }
 return served;
}
export function snapshotState(m:any){
 if(m.type!=='snapshot'||m.world!==WORLD||!m.state?.entities||Array.isArray(m.state.entities)||!Number.isInteger(m.throughSeq)||!Array.isArray(m.entries))throw Error('invalid snapshot');
 let covered=m.throughSeq;
 for(const e of m.entries){if(!Number.isInteger(e.seq)||e.seq!==covered+1)throw Error('snapshot sequence gap');covered=e.seq;}
 // server/world.ts joinPayload sends LIVE-folded state, not the disk boundary.
 // throughSeq is the disk checkpoint; entries overlap state. See client/lib/net.js.
 // Audit a second interpretation but never adopt it: a boundary/stale snapshot
 // whose tail changes entity or mount state is ambiguous and cannot authorize ink.
 // Chat totals DO change on replay, so replayed chat/sky are never returned.
 const state=structuredClone(m.state),audit=structuredClone(m.state);
 for(const e of m.entries)foldEntry(audit,e);
 const entityState=(st:any)=>({entities:st.entities,mounts:st.mounts??{}});
 if(stable(entityState(state))!==stable(entityState(audit)))throw Error('stale/ambiguous snapshot entity fold — refusing mutation');
 return state;
}
// Deterministic protocol core; tests exercise this without opening any socket.
export class VerbSequence {
 state:any;expected:any;failed=false;who='';lastSeq=-1;index=0;pending:Array<any>|null=null;lastSent=-Infinity;
 constructor(readonly verbs:Array<[string,any]>,readonly guard:(s:any)=>void,readonly scope:(s:any)=>any,readonly acknowledged:(e:any)=>void){}
 get complete(){return !!this.state&&this.index===this.verbs.length&&!this.pending;}
 receive(m:any){
  if(this.failed)throw Error('sequence already failed');
  try{this.consume(m);}catch(e){this.failed=true;throw e;}
 }
 private consume(m:any){
  if(m.type==='error')throw Error('server refused cabin verb; read live state before retry');
  if(m.type==='snapshot'){
   if(this.state||typeof m.you!=='string'||!m.you)throw Error('unexpected verb snapshot');
   this.state=snapshotState(m);this.guard(this.state);this.expected=structuredClone(this.state);this.who=m.you;
   this.lastSeq=Math.max(m.throughSeq,...m.entries.map((e:any)=>e.seq));return;
  }
  if(m.type!=='log'||!this.state)return;
  const e=m.entry;if(!Number.isInteger(e?.seq))throw Error('invalid log acknowledgement');
  if(e.seq<=this.lastSeq)return;
  if(e.seq!==this.lastSeq+1)throw Error('live sequence gap; read state before retry');
  this.lastSeq=e.seq;
  foldEntry(this.state,e);
  if(this.pending&&e.actor===this.who&&e.verb===this.pending[0]&&stable(e.args)===stable(this.pending[1])){
   foldEntry(this.expected,e);this.pending=null;this.index++;this.acknowledged(e);
  }
  if(stable(this.scope(this.state))!==stable(this.scope(this.expected)))throw Error('live sequence scope drift; no further verbs');
 }
 next(now:number):[string,any]|null{
  if(this.failed)throw Error('sequence already failed');
  if(!this.state||this.pending||this.complete||now-this.lastSent<700)return null;
  this.lastSent=now;this.pending=this.verbs[this.index];return this.pending as [string,any];
 }
}
const RIDER='nx-artwalk-b17-garden-seed-lattice',GARDEN='nx-town-garden-cottage';
export function validateMigrations(raw:any,protectedSet:any[]):any[]{
 if(raw===undefined)return [];
 if(!Array.isArray(raw)||raw.length>1)throw Error('migration scope must be empty or exactly b17');
 for(const m of raw){
  const p=protectedSet.find(p=>p.geom.id===RIDER);
  if(!p||m.id!==RIDER||stable(m.from)!==stable(p.geom))throw Error('migration source is not exact captured b17');
  const expected={...p.geom,pos:[p.geom.pos[0],p.geom.pos[1]+.54,p.geom.pos[2]]};
  if(!expected.pos.every(Number.isFinite)||stable(m.to)!==stable(expected))throw Error('migration permits only b17 +0.54m Y');
 }
 return raw;
}
export function migrationStatus(m:any,p:any,live:any,folded:any):'source'|'destination'{
 if(!live||!folded||folded.parent||folded.comp?.lock)throw Error('missing/locked/parented migration rider');
 const status=stable(live)===stable(m.from)?'source':stable(live)===stable(m.to)?'destination':null;
 if(!status)throw Error('migration rider outside known source/destination');
 const pos=status==='source'?m.from.pos:m.to.pos;
 // place changes only pose in shared/fold.js: even actor/ts MUST stay intact.
 if(stable(folded)!==stable({...p.folded,pos}))throw Error('folded migration rider drift');
 return status;
}
export function migrationVerb(m:any,p:any,live:any,folded:any,direction:'forward'|'rollback'='forward'):[string,any]|null{
 const status=migrationStatus(m,p,live,folded);
 if(status===(direction==='forward'?'destination':'source'))return null;
 return ['place',{id:m.id,pos:direction==='forward'?m.to.pos:m.from.pos}];
}
export function buildSlotVerbs(live:any,before:any,slot:any,captured:any,st:any,by:any,protectedSet:any[],migrations:any[]):Array<[string,any]>{
 const op=hostGate(live,before,slot,captured,st.entities[slot.id]);
 const verbs=op==='replace'?buildHostVerbs(live,slot,st.entities[slot.id]):[];
 if(slot.id===GARDEN)for(const m of migrations){
  const p=protectedSet.find(p=>p.geom.id===m.id);
  const v=migrationVerb(m,p,by[m.id],st.entities[m.id]);if(v)verbs.push(v);
 }
 return verbs;
}
export function protectionGate(protectedSet:any[],migrations:any[],by:any,st:any,hostIds:string[]){
 for(const p of protectedSet){
  const id=p.geom.id,m=migrations.find(m=>m.id===id);
  if(m){migrationStatus(m,p,by[id],st.entities[id]);continue;}
  protectUnchanged(p.geom,by[id]);
  if(stable(p.geom)!==stable(by[id])||stable(p.folded)!==stable(st.entities[id]))throw Error(`${id} exact companion state drift`);
 }
 const affected=new Set([...hostIds,...migrations.map(m=>m.id)]);
 if(Object.values(st.mounts??{}).some((m:any)=>affected.has(m.to)))throw Error('cabin/rider occupied by mounted body');
 for(const [id,e] of Object.entries(st.entities) as any[])if(e.parent&&affected.has(e.parent.to))throw Error(`${id} is mounted on a cabin/rider`);
}
export async function sendVerbs(verbs:Array<[string,any]>,slot:any,cfg:any,guard:(st:any)=>void,scope:(st:any)=>any,receipt:(e:any)=>void,connect:(url:string)=>any=(url)=>new WebSocket(url)){
 await new Promise<void>((yes,no)=>{
  const ws=connect(cfg.url);let done=false;let interval:any;
  const timer=setTimeout(()=>end(Error('verb timeout; read live state before retry')),Math.max(45000,verbs.length*2000));
  function end(e?:Error){if(done)return;done=true;clearTimeout(timer);clearInterval(interval);ws.close();e?no(e):yes();}
  const seq=new VerbSequence(verbs,guard,scope,(entry)=>receipt({status:'VERB_ACKNOWLEDGED',id:slot.id,entry}));
  ws.onopen=()=>{try{ws.send(JSON.stringify({type:'join',world:WORLD,id:'arthur-cabin-overhaul',avatar:cfg.avatar,token:cfg.joinToken}));}catch{end(Error('verb join send failed'));}};
  ws.onerror=()=>end(Error('verb websocket error'));
  ws.onclose=()=>end(Error('verb websocket closed; read live state before retry'));
  ws.onmessage=(ev:any)=>{if(done)return;try{seq.receive(JSON.parse(String(ev.data)));if(seq.complete)end();}catch(e){end(e as Error);}};
  interval=setInterval(()=>{
   if(done)return;
   try{
    if(ws.readyState===0&&!seq.state)return;
    if(ws.readyState!==1)throw Error('verb websocket not open');
    const next=seq.next(Date.now());if(!next)return;const [verb,args]=next;
    ws.send(JSON.stringify({type:'verb',verb,args}));
    receipt({status:'VERB_SENT_NOT_YET_VERIFIED',id:slot.id,verb,args});
   }catch(e){end(e as Error);}
  },700);
 });
}
export async function runRollout(){

const cfg=JSON.parse(readFileSync(`${ROOT}/../config.json`,'utf8'));
const base=cfg.url.replace(/^wss:/,'https:').replace(/^ws:/,'http:').replace(/\/ws$/,'');
const sha=(b:any)=>createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(readFileSync(`${ROOT}/before/contracts.json`,'utf8'));
const protectedSet=JSON.parse(readFileSync(`${ROOT}/before/protected.json`,'utf8'));
const foldedHosts=JSON.parse(readFileSync(`${ROOT}/before/folded-hosts.json`,'utf8'));
const approval=JSON.parse(readFileSync(`${ROOT}/approved.json`,'utf8'));
const migrations=validateMigrations(approval.migrations,protectedSet);
const argv=process.argv.slice(2),apply=argv.includes('--apply'),idIndex=argv.indexOf('--id'),only=idIndex<0?null:argv[idIndex+1];
for(let i=0;i<argv.length;i++){if(argv[i]==='--id'){if(!argv[++i])throw Error('missing --id');}else if(argv[i]!=='--apply')throw Error('unknown option');}
if(approval.world!==WORLD||approval.status!=='reviewed' || approval.slots.length!==5||stable(approval.slots.map((e:any)=>e.id).sort())!==stable(baseline.map((e:any)=>e.id).sort()))throw Error('approval scope is not exactly five commissioned homes');
if(only&&!approval.slots.some((e:any)=>e.id===only))throw Error('unknown target ID');
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const receiptFile=`${ROOT}/rollout-receipts.jsonl`;
async function readAsset(slot:any){const r=await fetch(`${base}/library/${slot.lib}`,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`served asset HTTP ${r.status}`);return Buffer.from(await r.arrayBuffer());}
const receipt=(e:any)=>{const row={time:new Date().toISOString(),...e};appendFileSync(receiptFile,JSON.stringify(row)+'\n');console.log(JSON.stringify(row));};
async function geom(){const r=await fetch(`${base}/geom?world=${WORLD}`,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(`geom HTTP ${r.status}`);const d:any=await r.json();if(d.world!==WORLD||!Array.isArray(d.entities)||d.entities.length<5)throw Error('bad geom scope');return {data:d,by:Object.fromEntries(d.entities.map((e:any)=>[e.id,e]))};}
async function snapshot(){return await new Promise<any>((yes,no)=>{const ws=new WebSocket(cfg.url);let done=false;const timer=setTimeout(()=>end(Error('snapshot timeout')),30000);function end(e?:Error,d?:any){if(done)return;done=true;clearTimeout(timer);ws.close();e?no(e):yes(d);}ws.onopen=()=>ws.send(JSON.stringify({type:'join',world:WORLD,id:'arthur-cabin-rollout-check',spectate:true,token:cfg.joinToken}));ws.onerror=()=>end(Error('snapshot websocket error'));ws.onmessage=ev=>{try{const m=JSON.parse(String(ev.data));if(m.type==='error')end(Error('snapshot server error'));if(m.type==='snapshot'){end(undefined,snapshotState(m));}}catch(e){end(e as Error);}};});}
function sourceGate(slot:any){
 const path=resolve(ROOT,slot.file);if(relative(ROOT,path).startsWith('..'))throw Error('asset path escape');const bytes=readFileSync(path);if(sha(bytes)!==slot.sha256)throw Error(`${slot.id} reviewed bytes changed`);
 if(slot.visualVerdict!=='accepted'||slot.playerVerdict!=='passed')throw Error(`${slot.id} review/player gate not accepted`);
 for(const s of slot.sources){const path=resolve(ROOT,s.file);if(relative(ROOT,path).startsWith('..')||sha(readFileSync(path))!==s.sha256)throw Error(`${slot.id} reviewed source changed`);}
 return bytes;
}
const hostIds=baseline.map((e:any)=>e.id);
const sensitive=new Set([...hostIds,...protectedSet.map((p:any)=>p.geom.id)]);
const affected=new Set([...hostIds,...migrations.map((m:any)=>m.id)]);
const scope=(st:any)=>({
 entities:Object.fromEntries(Object.entries(st.entities).filter(([id,e]:any)=>sensitive.has(id)||affected.has(e.parent?.to))),
 mounts:Object.fromEntries(Object.entries(st.mounts??{}).filter(([,m]:any)=>affected.has(m.to))),
});
function protectedGate(by:any,st:any){protectionGate(protectedSet,migrations,by,st,hostIds);}
function allGates(by:any,st:any){
 protectedGate(by,st);
 for(const b of baseline)hostGate(by[b.id],b,approval.slots.find((s:any)=>s.id===b.id),foldedHosts[b.id],st.entities[b.id]);
}
let uploads=0,verbs=0;let lastUpload=0;
for(const slot of approval.slots.filter((e:any)=>!only||e.id===only)){
 const bytes=sourceGate(slot),before=baseline.find((e:any)=>e.id===slot.id);
 const current=await geom(),state=await snapshot();allGates(current.by,state);
 const op=hostGate(current.by[slot.id],before,slot,foldedHosts[slot.id],state.entities[slot.id]);
 const planned=buildSlotVerbs(current.by[slot.id],before,slot,foldedHosts[slot.id],state,current.by,protectedSet,migrations);
 if(op==='noop'){
  const served=await verifyReadback(current.by[slot.id],before,slot,foldedHosts[slot.id],state.entities[slot.id],()=>readAsset(slot));
  if(!planned.length){receipt({status:'ALREADY_LIVE_NO_VERBS',id:slot.id,lib:slot.lib,servedSha256:sha(served),verbs:0});continue;}
 }
 console.log(JSON.stringify({status:'PREFLIGHT_PASS',id:slot.id,mode:apply?'apply':'dry-run',old:before.lib,next:slot.lib,footprint:'same pose and bounded old X/Z envelope',protected:protectedSet.length}));
 if(!apply)continue;
 if(op==='replace'){
 if(lastUpload)await sleep(Math.max(0,22000-(Date.now()-lastUpload)));
 // Pacing may itself be slow: recheck every host and companion BEFORE uploading.
 const preUpload=await geom(),preUploadState=await snapshot();allGates(preUpload.by,preUploadState);sourceGate(slot);
 if(stable(scope(preUploadState))!==stable(scope(state)))throw Error('scope changed before upload');
 const u=new URL(`${base}/upload`);u.searchParams.set('token',cfg.agentToken);u.searchParams.set('name',`${WORLD} cabin overhaul ${slot.id}`);u.searchParams.set('by',cfg.id);
 let uploaded=false;
 for(let attempt=0;attempt<4;attempt++){lastUpload=Date.now();const r=await fetch(u,{method:'POST',body:bytes,signal:AbortSignal.timeout(60000)});if(r.ok){const result:any=await r.json();if(result.path!==slot.lib)throw Error('upload identity mismatch');uploaded=true;uploads++;break;}if(r.status===429&&attempt<3){await sleep(30000);continue;}throw Error(`upload HTTP ${r.status}`);}
 if(!uploaded)throw Error('upload attempts exhausted');
 }
 // Fresh gate AFTER potentially slow upload/readback. Never use a cached census.
 const immediately=await geom(),fresh=await snapshot();allGates(immediately.by,fresh);sourceGate(slot);
 const vs=buildSlotVerbs(immediately.by[slot.id],before,slot,foldedHosts[slot.id],fresh,immediately.by,protectedSet,migrations);
 if(stable(vs)!==stable(planned)||stable(scope(fresh))!==stable(scope(state)))throw Error('scope changed before apply');
 await sendVerbs(vs,slot,cfg,(joined)=>{
  sourceGate(slot);allGates(immediately.by,joined);
  if(stable(scope(joined))!==stable(scope(fresh)))throw Error('scope drift at verb join');
 },scope,receipt);verbs+=vs.length;
 const after=await geom(),afterState=await snapshot();allGates(after.by,afterState);
 if(buildSlotVerbs(after.by[slot.id],before,slot,foldedHosts[slot.id],afterState,after.by,protectedSet,migrations).length)throw Error('post-place host/migration incomplete');
 if(slot.id===GARDEN)for(const m of migrations)receipt({status:'MIGRATION_DESTINATION_VERIFIED',id:m.id,pos:m.to.pos,rollback:{verb:'place',args:{id:m.id,pos:m.from.pos}},automaticRollback:false});
 const served=await verifyReadback(after.by[slot.id],before,slot,foldedHosts[slot.id],afterState.entities[slot.id],()=>readAsset(slot));
 mkdirSync(`${ROOT}/served`,{recursive:true});writeFileSync(`${ROOT}/served/${slot.id}.glb`,served);
 receipt({status:'PLACED_VERIFIED',id:slot.id,lib:slot.lib,servedSha256:sha(served),pos:slot.pos,yaw:slot.yaw,comp:after.by[slot.id].comp,verbs:vs.length,protected:protectedSet.length});
}
console.log(JSON.stringify({status:apply?'ROLLOUT_VERIFIED':'DRY_RUN_VERIFIED',uploads,verbs,selected:only??'all-five'}));
}
if(import.meta.main)await runRollout();
