// Campaign-local wrapper. Import-safe; the verified cabin core stays read-only.
import {ids} from './capture.ts';
import {foldEntry} from '../../../shared/fold.js';
import {stable,validatePlan} from '../cabin-overhaul/contracts.ts';
import {hostGate,buildHostVerbs,snapshotState,sendVerbs,protectionGate,verifyReadback,boundsGate} from '../cabin-overhaul/rollout.ts';
export const WORLD='commons-next';
const equal=(a:any,b:any)=>stable(a)===stable(b);
const vec=(a:any)=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
function assert(ok:any,message:string):asserts ok {if(!ok)throw Error(message);}
const sameIds=(a:any,b:string[])=>Array.isArray(a)&&a.length===b.length&&new Set(a).size===a.length&&equal([...a].sort(),[...b].sort());
function view(e:any){return {lib:e?.lib??null,kind:e?.kind??'thing',pos:e?.pos,yaw:e?.yaw??0,scale:e?.scale??1,parent:e?.parent??null,comp:e?.comp??{}};}
function poseEqual(a:any,b:any){return a&&b&&equal(a.pos,b.pos)&&a.yaw===b.yaw&&a.scale===b.scale;}
export function validateCampaign(c:any,a:any,only:string|null=null){
 assert(c&&sameIds(c.baseline?.map((e:any)=>e.id),ids)&&sameIds(Object.keys(c.foldedHosts??{}),ids),'baseline must be exact 17 hosts');
 assert(Array.isArray(c.protectedSet)&&c.protectedSet.length===279,'baseline must retain all 279 original protected entities');
 const all=[...c.baseline,...c.protectedSet.map((p:any)=>p.geom)],allIds=all.map((e:any)=>e?.id);
 assert(allIds.every((id:any)=>typeof id==='string'&&id)&&new Set(allIds).size===296,'duplicate/invalid baseline IDs');
 assert(c.census?.world===WORLD&&sameIds(c.census.entities?.map((e:any)=>e.id),allIds),'census partition mismatch');
 for(const e of all)assert(equal(e,c.census.entities.find((x:any)=>x.id===e.id)),`${e.id} census mismatch`);
 for(const p of [...c.protectedSet,...c.baseline.map((e:any)=>({geom:e,folded:c.foldedHosts[e.id]}))]){
  assert(p.folded&&equal(view(p.geom),view(p.folded)),`${p.geom.id} inconsistent capture geom/fold`);
  assert(vec(p.geom.pos)&&Number.isFinite(p.geom.yaw)&&Number.isFinite(p.geom.scale)&&p.geom.scale>0,`${p.geom.id} invalid transform`);
 }
 assert(c.complete?.world===WORLD&&c.complete.hosts===17&&c.complete.protected===279&&c.complete.worldVerbs===0,'incomplete capture marker');
 protectionGate(c.protectedSet,[],Object.fromEntries(all.map(e=>[e.id,e])),{entities:{...c.foldedHosts,...Object.fromEntries(c.protectedSet.map((p:any)=>[p.geom.id,p.folded]))},mounts:c.census.mounts??{}},ids);
 assert(a?.world===WORLD&&a.status==='reviewed'&&sameIds(a.scope,ids),'approval must declare the exact campaign scope');
 assert(a.migrations===undefined||(Array.isArray(a.migrations)&&a.migrations.length===0),'no migrations authorized');
 assert(Array.isArray(a.slots)&&a.slots.length>0&&new Set(a.slots.map((s:any)=>s.id)).size===a.slots.length,'empty or duplicate approval slots');
 for(const s of a.slots){
  const b=c.baseline.find((e:any)=>e.id===s.id);
  assert(b&&s.status==='READY'&&['walk-in','workstation','portal'].includes(s.kind),`unsupported or unready slot ${s.id}`);
  assert(poseEqual(b,s),'planned pose must remain exact');validatePlan(b,s);
  assert(vec(s.bounds?.min)&&vec(s.bounds?.max)&&s.bounds.min.every((v:number,k:number)=>v<s.bounds.max[k]),'invalid reviewed bounds');
 }
 const selected=a.slots.filter((s:any)=>!only||s.id===only);assert(selected.length,'target lacks READY approval');return selected;
}
import {readFileSync,realpathSync,existsSync,appendFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative,dirname,isAbsolute} from 'node:path';
import {pathToFileURL} from 'node:url';
export const sha=(b:any)=>createHash('sha256').update(b).digest('hex');
export type Pin={file:string,sha256:string};
const hashShape=(h:any)=>typeof h==='string'&&/^[a-f0-9]{64}$/.test(h);
function confined(root:string,file:string,container=root){
 assert(typeof file==='string'&&file.length&&!isAbsolute(file),'invalid relative pin path');
 const base=realpathSync(container),path=realpathSync(resolve(root,file)),rel=relative(base,path);
 assert(rel!==''&&rel!=='..'&&!rel.startsWith('../')&&!isAbsolute(rel),'pin path escape');return path;
}
function readPin(root:string,p:Pin,container=root){
 assert(p&&hashShape(p.sha256),'invalid full SHA pin');const bytes=readFileSync(confined(root,p.file,container));
 assert(sha(bytes)===p.sha256,`file pin changed: ${p.file}`);return bytes;
}
// Local transitive imports must appear in the reviewed manifest; never execute builders.
function sourcePins(root:string,pins:Pin[],required:string[],container=root){
 assert(Array.isArray(pins)&&pins.length>0,'nonempty source pins required');const paths=new Map<string,Buffer>();
 for(const p of pins){const path=confined(root,p.file,container);assert(!paths.has(path),'duplicate source pin');paths.set(path,readPin(root,p,container));}
 for(const f of required)assert(paths.has(confined(root,f,container)),`required source unpinned: ${f}`);
 for(const [path,bytes] of paths){
  if(!/\.[cm]?[jt]sx?$/.test(path))continue;
  const loader=/\.[cm]?jsx?$/.test(path)?'jsx':'tsx';
  for(const imp of new Bun.Transpiler({loader}).scanImports(bytes.toString())){
   if(!imp.path.startsWith('.'))continue;
   const base=resolve(dirname(path),imp.path),dep=[base,`${base}.ts`,`${base}.js`,resolve(base,'index.ts'),resolve(base,'index.js')].find(p=>existsSync(p));
   assert(dep&&paths.has(realpathSync(dep)),`transitive source unpinned: ${imp.path}`);
  }
 }
}
export function sourceGate(root:string,slot:any,container=root){
 assert(hashShape(slot.sha256)&&slot.lib===`store/${slot.sha256.slice(0,16)}.glb`,'invalid model hash/lib');
 assert(typeof slot.file==='string'&&slot.file.startsWith('build/'),'model must be campaign build output');
 const bytes=readPin(root,{file:slot.file,sha256:slot.sha256});
 assert(typeof slot.builder==='string'&&/^build-[^/]+\.ts$/.test(slot.builder),'campaign builder pin required');
 sourcePins(root,slot.sources,[slot.builder,'kit.ts',`before/${slot.id}.glb`],container);
 const review=JSON.parse(readPin(root,slot.review).toString());
 assert(Array.isArray(slot.routes)&&slot.routes.length>0&&equal(review.routes,slot.routes),'reviewed route pins required');
 for(const r of slot.routes){assert(['room','workstation'].includes(r.mode),'unsupported route mode');readPin(root,r);}
 assert(slot.kind!=='walk-in'||slot.routes.some((r:any)=>r.mode==='room'),'walk-in room route required');
 if(slot.collisionAmendment!==undefined){
  const a=slot.collisionAmendment;amendment(slot,{});const e=JSON.parse(readPin(root,a.evidence).toString());
  assert(e.schema==='village-collision-v1'&&e.id===slot.id&&e.modelSha256===slot.sha256&&e.from===null&&e.to==='exact'&&e.verdict==='passed','collision evidence binding/verdict mismatch');
  for(const k of ['publicRuntime','exactCollider','bidirectionalRoutes'])assert(e.checks?.[k]==='passed',`collision ${k} evidence missing`);
  assert(Array.isArray(e.evidence)&&e.evidence.length>0,'collision evidence files required');for(const p of e.evidence)readPin(root,p);
 }
 assert(review.schema==='village-review-v1'&&review.id===slot.id&&review.modelSha256===slot.sha256&&review.kind===slot.kind&&equal(review.sources,slot.sources),'review binding mismatch');
 assert(review.visual?.verdict==='accepted'&&typeof review.visual.reviewer==='string'&&review.visual.reviewer.trim()&&Array.isArray(review.visual.files)&&review.visual.files.length>0,'visual acceptance required');
 for(const p of review.visual.files)readPin(root,p);
 assert(review.geometry?.verdict==='passed','geometry acceptance required');readPin(root,review.geometry.evidence);
 assert(['walk-in','workstation','portal'].includes(slot.kind)&&review.functional?.verdict==='passed'&&review.functional.kind===slot.kind,'functional acceptance required — no waiver');readPin(root,review.functional.evidence);
 assert(equal(review.deterministic?.sha256,[slot.sha256,slot.sha256]),'deterministic double-build evidence required');readPin(root,review.deterministic.evidence);
 return bytes;
}
const collisionEligible=new Set(['nx-town-gate-n','nx-town-gate-s','nx-town-gate-e','nx-town-gate-w','nx-town-belltower','nx-town-woodyard','nx-town-dyehouse','nx-town-market']);
function amendment(slot:any,captured:any){
 assert(!Object.hasOwn(slot,'collide'),'use explicit collisionAmendment, never arbitrary collide');
 const a=slot.collisionAmendment;if(a===undefined)return false;
 assert(collisionEligible.has(slot.id)&&a.from===null&&a.to==='exact'&&(captured?.collide??null)===null,'collision amendment outside authorized null→exact scope');
 assert(typeof a.reason==='string'&&a.reason.trim()&&hashShape(a.evidence?.sha256)&&typeof a.evidence.file==='string','collision amendment needs reason and evidence pin');return true;
}
function expectedCapture(slot:any,captured:any){return amendment(slot,captured)?{...captured,collide:'exact'}:captured;}
export function campaignHostGate(live:any,before:any,slot:any,captured:any,folded:any){
 const amended=expectedCapture(slot,captured);
 assert(poseEqual(live,before)&&poseEqual(slot,before),`${before.id} pose must remain exact`);
 // For replacement, gate the OLD folded capture; only a completed no-op expects the amendment.
 return hostGate(live,before,slot,live.lib===slot.lib?amended:captured,folded);
}
export function campaignHostVerbs(live:any,slot:any,folded:any){return buildHostVerbs(live,slot,expectedCapture(slot,folded));}
export function regionalProtected(c:any,by:any,bounds?:any){
 if(bounds===undefined)return c.protectedSet;assert(validBounds(bounds),'invalid affected bounds');
 return c.protectedSet.filter((p:any)=>intersects(worldBounds(p.geom),bounds)||(by[p.geom.id]&&intersects(worldBounds(by[p.geom.id]),bounds)));
}
export function allGates(c:any,a:any,by:any,st:any,affectedBounds?:any){
 assert(st?.entities&&sameIds(Object.keys(by),Object.keys(st.entities)),'geom/snapshot entity census drift');
 for(const [id,e] of Object.entries(by))assert(equal(view(e),view(st.entities[id])),`${id} geom/snapshot drift`);
 protectionGate(regionalProtected(c,by,affectedBounds),[],by,st,ids);
 assert(!Object.values(st.behaviors??{}).some((b:any)=>ids.includes(b.attach)),'behavior attached to campaign host — explicit review required');
 const ops:any={};
 for(const b of c.baseline){
  const slot=a.slots.find((s:any)=>s.id===b.id),folded=st.entities[b.id];
  assert(folded&&!folded.parent&&!folded.comp?.lock,`${b.id} missing/locked/parented host`);
  if(slot)ops[b.id]=campaignHostGate(by[b.id],b,slot,c.foldedHosts[b.id],folded);
  else assert(equal(by[b.id],b)&&equal(folded,c.foldedHosts[b.id]),`${b.id} unapproved host drift`);
 }
 return ops;
}
// Decode the *served* bytes too: the server's Draco shadow need not hash to the upload.
let decoder:any;
export async function decodeModel(bytes:Buffer){
 assert(bytes.length>=20&&bytes.length<=20*1024*1024&&bytes.toString('ascii',0,4)==='glTF'&&bytes.readUInt32LE(4)===2&&bytes.readUInt32LE(8)===bytes.length,'invalid complete GLB');
 let json:any,chunks=0;
 for(let o=12;o<bytes.length;){
  assert(o+8<=bytes.length,'truncated GLB chunk');const n=bytes.readUInt32LE(o),type=bytes.readUInt32LE(o+4),end=o+8+n;
  assert(n%4===0&&end<=bytes.length,'invalid GLB chunk length');
  assert(type===(chunks===0?0x4e4f534a:0x004e4942)&&chunks<2,'unexpected/duplicate GLB chunk');
  if(chunks===0)json=JSON.parse(bytes.toString('utf8',o+8,end));chunks++;o=end;
 }
 assert(json?.asset?.version==='2.0','invalid GLB JSON');
 assert(![...(json.buffers??[]),...(json.images??[])].some((b:any)=>b.uri!==undefined),'external or URI GLB resources refused');
 assert(!(json.skins?.length||json.animations?.length),'unsupported embedded skin/animation');
 if(!decoder)decoder=(async()=>{const {NodeIO}=await import('@gltf-transform/core'),{ALL_EXTENSIONS}=await import('@gltf-transform/extensions'),draco=(await import('draco3dgltf')).default;return new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule()});})();
 const io=await decoder,doc=await io.readBinary(new Uint8Array(bytes)),scenes=doc.getRoot().listScenes(),scene=doc.getRoot().getDefaultScene()??(scenes.length===1?scenes[0]:null);
 assert(scene,'ambiguous or absent default scene');
 const bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]},nodes:string[]=[];let triangles=0;
 scene.traverse((n:any)=>{
  nodes.push(n.getName());const m=n.getWorldMatrix();assert(m.length===16&&m.every(Number.isFinite),'invalid node matrix');
  for(const p of n.getMesh()?.listPrimitives()??[]){
   assert(p.getMode()===4&&!p.listTargets().length,'unsupported primitive/morph');const pos=p.getAttribute('POSITION'),idx=p.getIndices();assert(pos?.getType()==='VEC3','missing POSITION');
   const count=idx?idx.getCount():pos.getCount();assert(count%3===0,'malformed triangle count');triangles+=count/3;
   for(let i=0;i<count;i++){
    const vi=idx?idx.getScalar(i):i;assert(Number.isInteger(vi)&&vi>=0&&vi<pos.getCount(),'index outside POSITION');
    const v=pos.getElement(vi,[]);assert(vec(v),'nonfinite decoded vertex');
    const w=m[3]*v[0]+m[7]*v[1]+m[11]*v[2]+m[15];assert(Number.isFinite(w)&&w!==0,'invalid homogeneous vertex');
    for(let k=0;k<3;k++){const x=(m[k]*v[0]+m[k+4]*v[1]+m[k+8]*v[2]+m[k+12])/w;assert(Number.isFinite(x)&&Math.abs(x)<10000,'invalid decoded coordinate');bounds.min[k]=Math.min(bounds.min[k],x);bounds.max[k]=Math.max(bounds.max[k],x);}
   }
  }
 });
 assert(triangles>0,'zero decoded triangles');return {bounds,nodes,triangles,sha256:sha(bytes),bytes:bytes.length};
}
function validBounds(b:any){return vec(b?.min)&&vec(b?.max)&&b.min.every((v:number,k:number)=>v<=b.max[k]);}
export function worldBounds(e:any,b=e.bbox){
 assert(!e.parent&&vec(e.pos)&&Number.isFinite(e.yaw??0)&&Number.isFinite(e.scale??1)&&(e.scale??1)>0,'unknown parented/invalid world transform');
 if(!e.lib&&e.kind==='light')return {min:[...e.pos],max:[...e.pos]};
 assert(validBounds(b),'missing finite geometry extent');const out={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]},c=Math.cos(e.yaw??0),s=Math.sin(e.yaw??0),scale=e.scale??1;
 for(const x of [b.min[0],b.max[0]])for(const y of [b.min[1],b.max[1]])for(const z of [b.min[2],b.max[2]]){
  const v=[e.pos[0]+scale*(c*x+s*z),e.pos[1]+scale*y,e.pos[2]+scale*(-s*x+c*z)];for(let k=0;k<3;k++){out.min[k]=Math.min(out.min[k],v[k]);out.max[k]=Math.max(out.max[k],v[k]);}
 }return out;
}
const intersects=(a:any,b:any)=>[0,1,2].every(k=>a.min[k]<=b.max[k]+.003&&a.max[k]>=b.min[k]-.003);
export function selectNeighbors(by:any,slot:any){
 assert(validBounds(slot.affectedBounds),'explicit reviewed world affectedBounds required');
 const host=worldBounds(slot,slot.bounds);assert([0,1,2].every(k=>slot.affectedBounds.min[k]<=host.min[k]&&slot.affectedBounds.max[k]>=host.max[k]),'affectedBounds omit host');
 if(by[slot.id]){const old=worldBounds(by[slot.id]);assert([0,1,2].every(k=>slot.affectedBounds.min[k]<=old.min[k]&&slot.affectedBounds.max[k]>=old.max[k]),'affectedBounds omit old host');}
 return Object.values(by).filter((e:any)=>e.id!==slot.id&&intersects(worldBounds(e),slot.affectedBounds)).sort((a:any,b:any)=>a.id.localeCompare(b.id));
}
export function campaignScope(c:any,by:any,affectedBounds:any){
 assert(validBounds(affectedBounds),'affected bounds missing');const sensitive=new Set([...ids,...regionalProtected(c,by,affectedBounds).map((p:any)=>p.geom.id),...Object.values(by).filter((e:any)=>intersects(worldBounds(e),affectedBounds)).map((e:any)=>e.id)]),libs=new Map<string,any>();
 const observe=(by:any)=>{for(const e of Object.values(by) as any[])if(e.lib&&validBounds(e.bbox)){
  const prev=libs.get(e.lib);assert(!prev||equal(prev,e.bbox),'same-lib geometry mismatch');libs.set(e.lib,e.bbox);
 }};observe(by);
 const relevant=(id:string,e:any)=>{
  if(sensitive.has(id)||sensitive.has(e.parent?.to))return true;
  try{return intersects(worldBounds(e,libs.get(e.lib)),affectedBounds);}catch{return true;} // Unknown extents never guessed safe.
 };
 const scope=(st:any)=>({entities:Object.fromEntries(Object.entries(st.entities??{}).filter(([id,e])=>relevant(id,e))),mounts:Object.fromEntries(Object.entries(st.mounts??{}).filter(([,m]:any)=>sensitive.has(m.to))),behaviors:Object.fromEntries(Object.entries(st.behaviors??{}).filter(([,b]:any)=>sensitive.has(b.attach))),terrain:st.terrain??null});
 return Object.assign(scope,{observe});
}
export const PREFLIGHT_CHECKS=['decodedGeometry','assemblyCoverage','routeSweeps','attachmentBacking','functional','publicRuntime','occupancy','sourceEquivalence','contextVisuals','envelope'];
export function validatePreflight(input:any,r:any){
 const s=input.slot;
 assert(r?.schema==='village-preflight-v1'&&r.id===s.id&&r.kind===s.kind&&r.stage===input.stage&&r.sourceSha256===s.sha256&&r.modelSha256===input.modelSha256&&r.contextSha256===input.contextSha256&&r.verdict==='passed','parent preflight binding/verdict mismatch');
 assert(typeof r.geometryScope==='string'&&r.geometryScope.trim()&&Array.isArray(r.limitations)&&r.limitations.length>0&&r.limitations.every((s:any)=>typeof s==='string'&&s.trim()),'explicit geometry scope/limitations required');
 for(const k of PREFLIGHT_CHECKS)assert(r.checks?.[k]==='passed',`parent preflight ${k} not passed`);
 assert(sameIds(r.neighbors?.map((n:any)=>n.id),input.neighbors.map((n:any)=>n.id)),'parent preflight neighbor coverage mismatch');
 for(const n of r.neighbors){
  const expected=input.neighbors.find((x:any)=>x.id===n.id);
  assert(n.verdict==='passed'&&n.sha256===expected.sha256&&(expected.lib?['route-tested','contact-tested'].includes(n.disposition):n.disposition==='point-light'),`${n.id} missing bounded neighbor disposition — no blanket exemptions`);
  assert(Array.isArray(n.evidence)&&n.evidence.length>0&&n.evidence.every((p:any)=>typeof p.file==='string'&&hashShape(p.sha256)),`${n.id} neighbor evidence required`);
 }
 assert(Array.isArray(r.evidence)&&r.evidence.length>0&&r.evidence.every((p:any)=>typeof p.file==='string'&&hashShape(p.sha256)),'parent preflight file evidence required');return r;
}
export type WorldRead={by:Record<string,any>,state:any};
export type RolloutIO={
 readWorld:()=>Promise<WorldRead>;readAsset:(lib:string)=>Promise<Buffer>;
 upload:(bytes:Buffer,slot:any)=>Promise<{status:number,path?:string}>;
 send:(verbs:Array<[string,any]>,slot:any,guard:(st:any)=>void,scope:(st:any)=>any,receipt:(e:any)=>void,beforeSend:()=>void)=>Promise<void>;
 inspect:(input:any)=>Promise<any>;receipt:(e:any)=>void;now:()=>number;sleep:(ms:number)=>Promise<void>;
};
// Explicit IO seam for OFFLINE tests. CLI always constructs the real transport below.
export async function executeRollout(opts:{root:string,container?:string,campaign:any,approval:any,only?:string|null,apply?:boolean,io:RolloutIO,pinGuard?:()=>void,lastUploadAt?:number}){
 const {root,campaign:c,approval:a,io}=opts,container=opts.container??root,apply=opts.apply===true,slots=validateCampaign(c,a,opts.only??null);
 let uploads=0,verbs=0,lastUpload=opts.lastUploadAt??-Infinity;assert(lastUpload===-Infinity||Number.isFinite(lastUpload),'invalid upload pacing timestamp');
 const emit=(r:any)=>io.receipt(r);
 for(const slot of slots){
  const before=c.baseline.find((e:any)=>e.id===slot.id),captured=c.foldedHosts[slot.id];
  const pins=()=>{opts.pinGuard?.();return sourceGate(root,slot,container);};
  const source=pins();const first=await io.readWorld();allGates(c,a,first.by,first.state,slot.affectedBounds);
  const scope=campaignScope(c,first.by,slot.affectedBounds),frozen=stable(scope(first.state));
  const noted=new Map<string,string>();
  const observe=(f:WorldRead)=>{scope.observe(f.by);const relevant=new Set(regionalProtected(c,f.by,slot.affectedBounds).map((p:any)=>p.geom.id));for(const p of c.protectedSet){const id=p.geom.id;if(relevant.has(id))continue;const current=sha(stable({geom:f.by[id]??null,folded:f.state.entities[id]??null}));if((!equal(p.geom,f.by[id])||!equal(p.folded,f.state.entities[id]))&&noted.get(id)!==current){emit({status:'OUTSIDE_SCOPE_DRIFT_OBSERVED',id,currentSha256:current,action:'preserved-unrelated-live-state'});noted.set(id,current);}}};observe(first);
  const fresh=async()=>{pins();const f=await io.readWorld();allGates(c,a,f.by,f.state,slot.affectedBounds);observe(f);assert(stable(scope(f.state))===frozen,'scope drift before mutation');return f;};
  async function inspect(bytes:Buffer,stage:'local'|'served',frame:WorldRead){
   const decoded=await decodeModel(bytes);boundsGate(decoded.bounds,slot.bounds);validatePlan(before,{...slot,bounds:decoded.bounds});
   for(const type of Object.keys(slot.comp??{}))if(type.startsWith('motion:'))assert(decoded.nodes.filter((n:string)=>n===type.slice(7)).length===1,`required motion node missing/ambiguous: ${type}`);
   const neighbors:any[]=[];
   for(const e of selectNeighbors(frame.by,slot) as any[]){
    const bytes=e.lib?await io.readAsset(e.lib):null;
    neighbors.push({...e,folded:frame.state.entities[e.id],bytes,sha256:bytes?sha(bytes):null});
   }
   const input={schema:'village-preflight-input-v1',world:WORLD,slot,before,capturedHost:captured,stage,sourceBytes:Buffer.from(source),modelBytes:Buffer.from(bytes),modelSha256:sha(bytes),decoded,neighbors,census:frame.by,state:frame.state,contextSha256:sha(stable({by:frame.by,scope:scope(frame.state)}))};
   const report=validatePreflight(input,await io.inspect(input));for(const p of [...report.evidence,...report.neighbors.flatMap((n:any)=>n.evidence)])readPin(root,p);pins();
   emit({status:'PARENT_PREFLIGHT_VERIFIED',id:slot.id,stage,modelSha256:input.modelSha256,contextSha256:input.contextSha256,evidence:report.evidence});return decoded;
  }
  const op=campaignHostGate(first.by[slot.id],before,slot,captured,first.state.entities[slot.id]);
  const planned=op==='replace'?campaignHostVerbs(first.by[slot.id],slot,first.state.entities[slot.id]):[];
  await inspect(source,'local',first);await fresh();
  if(op==='noop'){
   const served=await verifyReadback(first.by[slot.id],before,slot,expectedCapture(slot,captured),first.state.entities[slot.id],()=>io.readAsset(slot.lib));
   await inspect(served,'served',first);await fresh();
   emit({status:'ALREADY_LIVE_NO_VERBS',id:slot.id,servedSha256:sha(served),verbs:0});continue;
  }
  emit({status:'PREFLIGHT_PASS',id:slot.id,mode:apply?'apply':'dry-run',plannedVerbs:planned.length,protectedCaptured:279,protectedRelevant:regionalProtected(c,first.by,slot.affectedBounds).length});
  if(!apply)continue;
  let uploaded=false;
  for(let attempt=0;attempt<4;attempt++){
   await io.sleep(Math.max(0,22000-(io.now()-lastUpload)));await fresh();pins();lastUpload=io.now();emit({status:'UPLOAD_ATTEMPT',id:slot.id,at:lastUpload});
   const result=await io.upload(source,slot);
   if(result.status>=200&&result.status<300){assert(result.path===slot.lib,'upload identity mismatch');uploads++;uploaded=true;break;}
   assert(result.status===429&&attempt<3,`upload HTTP ${result.status}`);await io.sleep(30000);
  }
  assert(uploaded,'upload attempts exhausted');
  // Verify the entire optimized served asset BEFORE the first destructive verb.
  const served=await io.readAsset(slot.lib),preServe=await fresh();await inspect(served,'served',preServe);
  const immediately=await fresh(),currentPlan=campaignHostVerbs(immediately.by[slot.id],slot,immediately.state.entities[slot.id]);assert(equal(currentPlan,planned),'planned verbs drift');
  const guardedScope=(st:any)=>{pins();return scope(st);};
  const expected=structuredClone(immediately.state);let acknowledged=0;
  await io.send(planned,slot,(joined)=>{pins();assert(stable(scope(joined))===frozen,'scope drift at verb join');},guardedScope,(r:any)=>{if(r.status==='VERB_ACKNOWLEDGED'){const want=planned[acknowledged];assert(want&&r.entry?.verb===want[0]&&equal(r.entry.args,want[1]),'acknowledgement mismatch');foldEntry(expected,r.entry);acknowledged++;}emit(r);},()=>{pins();});
  assert(acknowledged===planned.length,'missing authoritative acknowledgements');verbs+=acknowledged;
  const after=await io.readWorld();allGates(c,a,after.by,after.state,slot.affectedBounds);observe(after);assert(equal(scope(after.state),scope(expected)),'acknowledged state/readback drift');
  const doneBytes=await verifyReadback(after.by[slot.id],before,slot,expectedCapture(slot,captured),after.state.entities[slot.id],()=>io.readAsset(slot.lib));
  await inspect(doneBytes,'served',after);
  const final=await io.readWorld();allGates(c,a,final.by,final.state,slot.affectedBounds);observe(final);pins();assert(equal(scope(final.state),scope(after.state)),'scope drift during readback');
  assert(campaignHostGate(final.by[slot.id],before,slot,captured,final.state.entities[slot.id])==='noop','post-place mismatch');
  emit({status:'PLACED_VERIFIED',id:slot.id,lib:slot.lib,servedSha256:sha(doneBytes),verbs:planned.length,protectedCaptured:279,protectedRelevant:regionalProtected(c,first.by,slot.affectedBounds).length});
 }
 const result={status:apply?'ROLLOUT_VERIFIED':'DRY_RUN_VERIFIED',uploads,verbs,selected:slots.map((s:any)=>s.id)};emit(result);return result;
}
export function loadFrozen(root:string){
 const get=(name:string)=>JSON.parse(readFileSync(confined(root,`before/${name}.json`),'utf8'));
 const c={baseline:get('contracts'),foldedHosts:get('folded-hosts'),protectedSet:get('protected'),census:get('full-census'),complete:get('capture-complete'),downloads:get('downloads')};
 assert(Array.isArray(c.downloads)&&c.downloads.length===c.complete.downloads&&new Set(c.downloads.map((d:any)=>d.id)).size===c.downloads.length,'download manifest incomplete/duplicate');
 for(const d of c.downloads){
  assert(typeof d.id==='string'&&/^[a-z0-9_-]+$/.test(d.id)&&c.census.entities.some((e:any)=>e.id===d.id&&e.lib===d.lib),'download scope/lib mismatch');
  const bytes=readPin(root,{file:`before/${d.id}.glb`,sha256:d.sha256});assert(bytes.length===d.bytes,'download byte count mismatch');
 }
 for(const id of ids)assert(c.downloads.some((d:any)=>d.id===id),'host baseline bytes missing');return c;
}
export function createLiveIO(cfg:any,inspect:RolloutIO['inspect'],receipt:RolloutIO['receipt'],net:{fetch:typeof fetch,connect:(url:string)=>any}={fetch,connect:url=>new WebSocket(url)}):RolloutIO{
 const url=new URL(cfg.url);assert(['ws:','wss:'].includes(url.protocol)&&url.pathname==='/ws'&&!url.username&&!url.password&&!url.search&&!url.hash,'invalid world endpoint');
 assert(typeof cfg.joinToken==='string'&&cfg.joinToken,'door credential required');const base=`${url.protocol==='wss:'?'https:':'http:'}//${url.host}`;
 async function request(url:URL|string,options:any={}){try{return await net.fetch(url,{redirect:'error',cache:'no-store',signal:AbortSignal.timeout(60000),...options});}catch{throw Error('network request failed (details withheld to protect credentials)');}}
 async function snapshot(){return await new Promise<any>((yes,no)=>{
  const ws=net.connect(cfg.url);let done=false;const timer=setTimeout(()=>end(Error('snapshot timeout')),30000);
  function end(e?:Error,st?:any){if(done)return;done=true;clearTimeout(timer);ws.close();e?no(e):yes(st);}
  ws.onopen=()=>{try{ws.send(JSON.stringify({type:'join',world:WORLD,id:'arthur-village-rollout-check',spectate:true,token:cfg.joinToken}));}catch{end(Error('snapshot join failed'));}};
  ws.onerror=()=>end(Error('snapshot socket error'));ws.onclose=()=>end(Error('snapshot socket closed'));
  ws.onmessage=(ev:any)=>{try{const m=JSON.parse(String(ev.data));if(m.type==='error')end(Error('snapshot refused'));if(m.type==='snapshot')end(undefined,snapshotState(m));}catch(e){end(e as Error);}};
 });}
 return {
  now:()=>Date.now(),sleep:ms=>new Promise(r=>setTimeout(r,ms)),inspect,receipt,
  readWorld:async()=>{const response=await request(`${base}/geom?world=${WORLD}`);assert(response.ok,`geom HTTP ${response.status}`);const d:any=await response.json();assert(d.world===WORLD&&Array.isArray(d.entities)&&d.entities.every((e:any)=>typeof e.id==='string')&&new Set(d.entities.map((e:any)=>e.id)).size===d.entities.length,'invalid/duplicate census');return {by:Object.fromEntries(d.entities.map((e:any)=>[e.id,e])),state:await snapshot()};},
  readAsset:async(lib:string)=>{assert(typeof lib==='string'&&/^[a-zA-Z0-9_./-]+\.glb$/.test(lib)&&!lib.startsWith('/')&&lib.split('/').every(p=>p&&p!=='.'&&p!=='..'),'invalid library path');const r=await request(`${base}/library/${lib}`);assert(r.ok,`asset HTTP ${r.status}`);return Buffer.from(await r.arrayBuffer());},
  upload:async(bytes,slot)=>{assert(typeof cfg.agentToken==='string'&&cfg.agentToken&&typeof cfg.id==='string'&&cfg.id,'upload credential/identity required');const u=new URL(`${base}/upload`);u.searchParams.set('token',cfg.agentToken);u.searchParams.set('name',`${WORLD} village overhaul ${slot.id}`);u.searchParams.set('by',cfg.id);const r=await request(u,{method:'POST',body:bytes});return {status:r.status,...(r.ok?{path:((await r.json()) as any).path}:{})};},
  send:(verbs,slot,guard,scope,receipt,beforeSend)=>sendVerbs(verbs,slot,cfg,guard,scope,receipt,url=>{
   const ws=net.connect(url),send=ws.send.bind(ws);
   ws.send=(data:any)=>{const m=JSON.parse(String(data));if(m.type==='verb')beforeSend();if(m.type==='join'){m.id='arthur-village-overhaul';m.spectate=false;}send(JSON.stringify(m));};return ws;
  }),
 };
}
export function parseArgs(argv:string[]){
 let apply=false,only:string|null=null;
 for(let i=0;i<argv.length;i++){
  if(argv[i]==='--apply'&&!apply)apply=true;
  else if(argv[i]==='--id'&&only===null&&ids.includes(argv[i+1]))only=argv[++i];
  else throw Error('unknown, duplicate or missing rollout option/target');
 }
 return {apply,only};
}
import {openSync,closeSync,unlinkSync} from 'node:fs';
export function readUploadClock(root:string){
 if(!existsSync(resolve(root,'rollout-receipts.jsonl')))return -Infinity;let at=-Infinity;
 for(const line of readFileSync(confined(root,'rollout-receipts.jsonl'),'utf8').split('\n').filter(Boolean)){const row=JSON.parse(line);if(row.status==='UPLOAD_ATTEMPT'){assert(Number.isFinite(row.at)&&row.at>=0,'invalid recorded upload clock');at=Math.max(at,row.at);}}return at;
}
export async function runRollout(argv=process.argv.slice(2)){
 const {apply,only}=parseArgs(argv),root=import.meta.dir,container=resolve(root,'../../..');
 const approvalPath=resolve(root,'approved.json');assert(existsSync(approvalPath),'missing parent approved.json; no network action taken');
 const approvalBytes=readFileSync(confined(root,'approved.json')),approval=JSON.parse(approvalBytes.toString()),campaign=loadFrozen(root),selected=validateCampaign(campaign,approval,only);
 const captureNames=['contracts','folded-hosts','protected','full-census','downloads','capture-complete'].map(n=>`before/${n}.json`);
 const capturePins=approval.capture;assert(sameIds(capturePins?.map((p:any)=>p.file),captureNames),'approval capture pin scope mismatch');
 const pinGuard=()=>{
  assert(sha(readFileSync(confined(root,'approved.json')))===sha(approvalBytes),'parent approval changed during rollout');
  for(const p of capturePins)readPin(root,p);
  sourcePins(root,approval.engineSources,['rollout.ts'],container);
  assert(approval.preflight?.file==='preflight.ts','parent preflight.ts module required');
  readPin(root,approval.preflight);sourcePins(root,approval.preflight.sources,['preflight.ts'],container);
 };
 pinGuard();for(const s of selected)sourceGate(root,s,container);
 // No builders imported, no credentials read until local authority/evidence gates pass.
 const module=await import(pathToFileURL(confined(root,approval.preflight.file)).href);assert(typeof module.inspect==='function','parent preflight inspect export missing');pinGuard();
 const cfg=JSON.parse(readFileSync(resolve(root,'../config.json'),'utf8'));
 const receipt=(e:any)=>{const row=JSON.stringify({time:new Date().toISOString(),...e});if(apply)appendFileSync(resolve(root,'rollout-receipts.jsonl'),row+'\n');console.log(row);};
 const io=createLiveIO(cfg,module.inspect,receipt);let lock:number|undefined;const lockPath=resolve(root,'rollout.lock');
 try{
  if(apply){lock=openSync(lockPath,'wx',0o600);writeFileSync(lock,JSON.stringify({pid:process.pid,started:new Date().toISOString()}));}
  return await executeRollout({root,container,campaign,approval,only,apply,io,pinGuard,lastUploadAt:readUploadClock(root)});
 }finally{if(lock!==undefined){closeSync(lock);unlinkSync(lockPath);}}
}
if(import.meta.main){
 try{await runRollout();}catch{
  // Never print transport/adapter errors or stacks: they can carry credential-bearing URLs.
  console.error('ROLLOUT_STOPPED: local authority, evidence, transport or readback gate failed. No automatic rollback; inspect current state before retry.');process.exitCode=1;
 }
}
