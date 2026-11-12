// Read-only exact target and companion capture, preserving light params omitted by /geom.
import {readFileSync,writeFileSync} from 'node:fs';
import {protectUnchanged} from './contracts.ts';
import {snapshotState} from './rollout.ts';
const ROOT=import.meta.dir, cfg=JSON.parse(readFileSync(`${ROOT}/../config.json`,'utf8'));
const hosts=JSON.parse(readFileSync(`${ROOT}/before/contracts.json`,'utf8'));
const protectedIds=[...hosts.map((e:any)=>`${e.id}-l`),'nx-artwalk-b17-garden-seed-lattice','nx-artwalk-b18-row-warp-count','nx-artwalk-b19-longhouse-feast-count','nx-artwalk-b20-bunkhouse-four-rooms','nx-artwalk-b21-tower-ascension-count'];
const base=cfg.url.replace(/^wss:/,'https:').replace(/^ws:/,'http:').replace(/\/ws$/,'');
const response=await fetch(`${base}/geom?world=commons-next`,{signal:AbortSignal.timeout(20000)});
if(!response.ok)throw Error(`geom HTTP ${response.status}`);
const census:any=await response.json();
const by=Object.fromEntries(census.entities.map((e:any)=>[e.id,e]));
for(const e of hosts)protectUnchanged(e,by[e.id]);
const snap:any=await new Promise((resolve,reject)=>{
 const ws=new WebSocket(cfg.url);let ended=false;
 const timer=setTimeout(()=>end(Error('snapshot timeout')),30000);
 function end(error?:Error,data?:any){if(ended)return;ended=true;clearTimeout(timer);ws.close();error?reject(error):resolve(data);}
 ws.onopen=()=>ws.send(JSON.stringify({type:'join',world:'commons-next',id:'arthur-cabin-capture',spectate:true,token:cfg.joinToken}));
 ws.onerror=()=>end(Error('snapshot websocket error'));
 ws.onmessage=ev=>{try{const m=JSON.parse(String(ev.data));if(m.type==='error')end(Error(`server ${m.error??m.message}`));if(m.type==='snapshot')end(undefined,m);}catch(e){end(e as Error);}};
});
// Join payloads are already live-folded. Reuse the rollout's non-mutating
// decoder and ambiguity gate instead of applying overlapping entries again.
const capturedState=snapshotState(snap);
snap.entities=capturedState.entities;snap.mounts=capturedState.mounts;
const protectedEntities=protectedIds.map(id=>{if(!by[id]||!snap.entities[id])throw Error(`missing protected ${id}`);return {geom:by[id],folded:snap.entities[id]};});
const selected=Object.fromEntries(hosts.map((e:any)=>[e.id,snap.entities[e.id]]));
for(const h of Object.values(selected) as any[])if(h.parent||h.collide==='box')throw Error('host carries parent/box collider override');
if(Object.values(snap.mounts??{}).some((m:any)=>hosts.some((h:any)=>h.id===m.to)))throw Error('occupied cabin: postpone replacement');
writeFileSync(`${ROOT}/before/protected.json`,JSON.stringify(protectedEntities,null,2));
writeFileSync(`${ROOT}/before/folded-hosts.json`,JSON.stringify(selected,null,2));
writeFileSync(`${ROOT}/before/full-census.json`,JSON.stringify(census,null,2));
console.log(JSON.stringify({status:'BASELINE_CAPTURED',world:'commons-next',hosts:hosts.length,protected:protectedEntities.length,lights:protectedEntities.filter(e=>e.geom.kind==='light').map(e=>({id:e.geom.id,color:e.folded.color,intensity:e.folded.intensity,range:e.folded.range})),verbs:0}));
