// Read-only baseline; never overwrite an existing capture. No authored world verbs.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {snapshotState} from '../cabin-overhaul/rollout.ts';
import {stable} from '../cabin-overhaul/contracts.ts';
const ROOT=import.meta.dir;
export const ids=['nx-town-hall','nx-town-inn','nx-town-stable','nx-town-woodyard','nx-court','nx-forge','nx-town-market','nx-town-dyehouse','nx-town-potter','nx-town-kiln','nx-town-belltower','nx-tower','nx-town-shrine','nx-town-gate-n','nx-town-gate-s','nx-town-gate-e','nx-town-gate-w'];
if(import.meta.main){
 const dest=`${ROOT}/before`;if(existsSync(dest))throw Error('baseline exists — never overwrite');
 const cfg=JSON.parse(readFileSync(`${ROOT}/../config.json`,'utf8'));
 const base=cfg.url.replace(/^wss:/,'https:').replace(/^ws:/,'http:').replace(/\/ws$/,'');
 const r=await fetch(`${base}/geom?world=commons-next`,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`geom HTTP ${r.status}`);
 const census:any=await r.json();if(census.world!=='commons-next'||!Array.isArray(census.entities))throw Error('wrong census');
 const by=Object.fromEntries(census.entities.map((e:any)=>[e.id,e]));
 const state:any=await new Promise((yes,no)=>{
  const ws=new WebSocket(cfg.url);let done=false;const timer=setTimeout(()=>end(Error('snapshot timeout')),30000);
  function end(e?:Error,d?:any){if(done)return;done=true;clearTimeout(timer);ws.close();e?no(e):yes(d);}
  ws.onopen=()=>ws.send(JSON.stringify({type:'join',world:'commons-next',id:'arthur-village-capture',spectate:true,token:cfg.joinToken}));
  ws.onerror=()=>end(Error('snapshot socket error'));ws.onclose=()=>end(Error('snapshot closed'));
  ws.onmessage=ev=>{try{const m=JSON.parse(String(ev.data));if(m.type==='error')end(Error('snapshot refused'));if(m.type==='snapshot')end(undefined,snapshotState(m));}catch(e){end(e as Error);}};
 });
 const hosts=ids.map(id=>{const e=by[id],f=state.entities[id];if(!e||!f||f.parent||f.comp?.lock)throw Error(`missing/locked/parented ${id}`);for(const k of ['lib','pos','yaw','scale','comp'])if(stable(e[k])!==stable(f[k]??(k==='yaw'?0:k==='scale'?1:k==='comp'?{}:undefined)))throw Error(`${id} capture drift ${k}`);return e;});
 if(Object.values(state.mounts??{}).some((m:any)=>ids.includes(m.to)))throw Error('occupied target');
 // Full exact companions retained; builders receive nearby subsets, rollout protects all non-hosts.
 const protectedSet=census.entities.filter((e:any)=>!ids.includes(e.id)).map((e:any)=>({geom:e,folded:state.entities[e.id]}));
 if(protectedSet.some((e:any)=>!e.folded))throw Error('inconsistent companion capture');
 mkdirSync(dest,{recursive:true});
 const save=(name:string,data:any)=>writeFileSync(`${dest}/${name}`,JSON.stringify(data,null,2),{flag:'wx'});
 save('contracts.json',hosts);save('full-census.json',census);save('protected.json',protectedSet);save('folded-hosts.json',Object.fromEntries(ids.map(id=>[id,state.entities[id]])));
 const downloads=[];
 for(const e of [...hosts,...protectedSet.filter((p:any)=>p.geom.lib&&hosts.some((h:any)=>Math.hypot(h.pos[0]-p.geom.pos[0],h.pos[2]-p.geom.pos[2])<12)).map((p:any)=>p.geom)]){
  if(!e.lib)continue;
  const asset=await fetch(`${base}/library/${e.lib}`,{signal:AbortSignal.timeout(45000)});if(!asset.ok)throw Error(`${e.id} asset HTTP ${asset.status}`);
  const bytes=Buffer.from(await asset.arrayBuffer());if(bytes.toString('ascii',0,4)!=='glTF')throw Error(`${e.id} not GLB`);
  writeFileSync(`${dest}/${e.id}.glb`,bytes,{flag:'wx'});downloads.push({id:e.id,lib:e.lib,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});
 }
 save('downloads.json',downloads);save('capture-complete.json',{time:new Date().toISOString(),world:'commons-next',hosts:ids.length,protected:protectedSet.length,downloads:downloads.length,worldVerbs:0});
 console.log(JSON.stringify({status:'CAPTURE_COMPLETE',hosts:ids.length,protected:protectedSet.length,downloads:downloads.length,worldVerbs:0}));
}
