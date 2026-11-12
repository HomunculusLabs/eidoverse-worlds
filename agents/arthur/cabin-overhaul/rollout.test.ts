import {test,expect} from 'bun:test';
import * as rollout from './rollout.ts';
import {buildVerbs,chooseOperation} from './contracts.ts';
import {emptyState,foldEntry} from '../../../shared/fold.js';
const before={id:'cabin',kind:'thing',lib:'store/1111111111111111.glb',pos:[1,0,2],yaw:.3,scale:1,comp:{particles:{preset:'smoke'}},bbox:{min:[-3,0,-3],max:[3,4,3]}};
const next={...before,lib:'store/2222222222222222.glb',sha256:'2'.repeat(64),bounds:{min:[-2.9,0,-2.9],max:[2.9,5,2.9]}};
const host={lib:before.lib,pos:before.pos,yaw:before.yaw,scale:1,comp:before.comp,collide:'exact',actor:'builder',ts:100};
const entry=(verb:string,args:any,seq=1)=>({verb,args,seq,actor:'builder',ts:100+seq});
test('fresh folded-host drift blocks the preapply gate even when /geom is unchanged',()=>{
 const gate=rollout.hostGate??((live:any,b:any,n:any)=>chooseOperation(live,b,n));
 for(const drift of [{collide:'box'},{parent:{to:'cart'}},{comp:{lock:true}},{pos:[8,0,2]},{lib:'unknown'},{actor:'other'}, {futureSpawnParam:true}]){
  expect(()=>gate(before,before,next,host,{...host,...drift})).toThrow();
 }
 expect(gate(before,before,next,host,host)).toBe('replace');
});


test('a no-op rejects missing/nonfinite/wrong reviewed bounds instead of claiming success',async()=>{
 const folded={...host,lib:next.lib},live={...before,lib:next.lib,bbox:next.bounds};
 const check=rollout.verifyReadback??(async(l:any,b:any,n:any)=>chooseOperation(l,b,n));
 for(const bbox of [undefined,{min:[NaN,0,-2.9],max:[2.9,5,2.9]},{min:[-2.9,0,-2.9],max:[2.9,99,2.9]}]){
  await expect(check({...live,bbox},before,next,host,folded,async()=>Buffer.from('bad'))).rejects.toThrow();
 }
});
test('live-folded join snapshots do not replay their overlapping tail twice',()=>{
 const state:any=emptyState();const say=entry('say',{text:'one'},12);foldEntry(state,say);
 const msg={type:'snapshot',world:'commons-next',throughSeq:11,entries:[say],state};
 const decode=rollout.snapshotState??((m:any)=>{const st=structuredClone(m.state);for(const e of m.entries)if(e.seq>m.throughSeq)foldEntry(st,e);return st;});
 expect(decode(msg).chatTotal).toBe(1);
 expect(decode(msg).recentChat).toHaveLength(1);
});
const snap=(state:any)=>({type:'snapshot',world:'commons-next',you:'builder',throughSeq:0,entries:[],state});
test('paced sequences wait for the matching authoritative echo before sending the next verb',()=>{
 const state:any=emptyState();state.entities.cabin=structuredClone(host);
 const seq=new rollout.VerbSequence([['remove',{id:'cabin'}],['spawn',{id:'cabin',lib:next.lib}]],()=>{},(st:any)=>st.entities,()=>{});
 seq.receive(snap(state));
 expect(seq.next(0)).toEqual(['remove',{id:'cabin'}]);
 expect(seq.next(700)).toBeNull();
 seq.receive({type:'log',entry:entry('remove',{id:'unrelated'},1)});
 expect(seq.next(1400)).toBeNull();
 seq.receive({type:'log',entry:entry('remove',{id:'cabin'},2)});
 expect(seq.next(1400)).toEqual(['spawn',{id:'cabin',lib:next.lib}]);
 expect(seq.complete).toBe(false);
 seq.receive({type:'log',entry:entry('spawn',{id:'cabin',lib:next.lib},3)});
 expect(seq.complete).toBe(true);
});
test('observed scope drift aborts before the next write and cannot be retried in-session',()=>{
 const state:any=emptyState();state.entities.cabin=structuredClone(host);
 const seq=new rollout.VerbSequence([['remove',{id:'cabin'}]],()=>{},(st:any)=>st.entities,()=>{});
 seq.receive(snap(state));
 expect(()=>seq.receive({type:'log',entry:entry('comp',{id:'cabin',type:'lock',data:true})})).toThrow('drift');
 expect(()=>seq.next(700)).toThrow();
});
const riderId='nx-artwalk-b17-garden-seed-lattice';
const rider={geom:{...before,id:riderId},folded:{...host,collide:undefined}};
const migration={id:riderId,from:rider.geom,to:{...rider.geom,pos:[rider.geom.pos[0],rider.geom.pos[1]+.54,rider.geom.pos[2]]}};
test('optional migration is limited to the exact b17 source and +0.54m destination',()=>{
 expect(rollout.validateMigrations(undefined,[rider])).toEqual([]);
 expect(rollout.validateMigrations([migration],[rider])).toEqual([migration]);
 for(const m of [{...migration,id:'other'}, {...migration,from:{...migration.from,yaw:2}}, {...migration,to:{...migration.to,lib:'other'}}, {...migration,to:{...migration.to,pos:[2,.54,2]}}, {...migration,to:{...migration.to,pos:[1,.55,2]}}]){
  expect(()=>rollout.validateMigrations([m],[rider])).toThrow();
 }
 expect(()=>rollout.validateMigrations([migration,migration],[rider])).toThrow();
});
test('migration uses only place, preserves folded provenance and bags, and recognizes rollback endpoints',()=>{
 const state:any=emptyState();state.entities[riderId]=structuredClone(rider.folded);
 expect(rollout.migrationStatus(migration,rider,rider.geom,state.entities[riderId])).toBe('source');
 const verb=rollout.migrationVerb(migration,rider,rider.geom,state.entities[riderId]);
 expect(verb).toEqual(['place',{id:riderId,pos:migration.to.pos}]);
 foldEntry(state,entry(...verb));
 expect(state.entities[riderId]).toEqual({...rider.folded,pos:migration.to.pos});
 expect(rollout.migrationStatus(migration,rider,migration.to,state.entities[riderId])).toBe('destination');
 expect(rollout.migrationVerb(migration,rider,migration.to,state.entities[riderId])).toBeNull();
 expect(rollout.migrationVerb(migration,rider,migration.to,state.entities[riderId],'rollback')).toEqual(['place',{id:riderId,pos:migration.from.pos}]);
 for(const drift of [{pos:[1,.3,2]},{comp:{extra:true}},{actor:'other'},{ts:999},{parent:{to:'cabin'}}])expect(()=>rollout.migrationStatus(migration,rider,migration.to,{...state.entities[riderId],...drift})).toThrow();
});
test('host sequence finishes respawn/comps before its optional rider-only place and resumes migration-only',()=>{
 const gardenBefore={...before,id:'nx-town-garden-cottage'},gardenNext={...next,id:gardenBefore.id};
 const state:any=emptyState();state.entities[gardenBefore.id]=structuredClone(host);state.entities[riderId]=structuredClone(rider.folded);
 const by={[gardenBefore.id]:gardenBefore,[riderId]:rider.geom};
 const vs=rollout.buildSlotVerbs(gardenBefore,gardenBefore,gardenNext,host,state,by,[rider],[migration]);
 expect(vs.map(([v]:any)=>v)).toEqual(['remove','spawn','comp','place']);
 expect(vs.at(-1)).toEqual(['place',{id:riderId,pos:migration.to.pos}]);
 state.entities[gardenBefore.id].lib=next.lib;
 const live={...gardenBefore,lib:next.lib,bbox:next.bounds};
 expect(rollout.buildSlotVerbs(live,gardenBefore,gardenNext,host,state,{...by,[gardenBefore.id]:live},[rider],[migration])).toEqual([vs.at(-1)]);
 state.entities[riderId].pos=migration.to.pos;
 expect(rollout.buildSlotVerbs(live,gardenBefore,gardenNext,host,state,{...by,[gardenBefore.id]:live,[riderId]:migration.to},[rider],[migration])).toEqual([]);
});
test('protection allows only approved b17 endpoints, keeps every other companion exact, and rejects riders',()=>{
 const other={geom:{...rider.geom,id:'other-light'},folded:structuredClone(rider.folded)};
 const state:any=emptyState();state.entities[riderId]={...rider.folded,pos:migration.to.pos};state.entities['other-light']=other.folded;
 const by={[riderId]:migration.to,'other-light':other.geom};
 expect(()=>rollout.protectionGate([rider,other],[migration],by,state,['cabin'])).not.toThrow();
 expect(()=>rollout.protectionGate([rider,other],[],by,state,['cabin'])).toThrow();
 for(const drift of [{...other.geom,pos:[1,2,3]},{...other.geom,comp:{new:1}},{...other.geom,bbox:{min:[0,0,0],max:[1,1,1]}}])expect(()=>rollout.protectionGate([rider,other],[migration],{...by,'other-light':drift},state,['cabin'])).toThrow();
 state.mounts={visitor:{to:'cabin'}};expect(()=>rollout.protectionGate([rider,other],[migration],by,state,['cabin'])).toThrow('occupied');
 delete state.mounts;state.entities.cargo={parent:{to:riderId}};expect(()=>rollout.protectionGate([rider,other],[migration],by,state,['cabin'])).toThrow('mounted');
});
class OfflineSocket {
 readyState=1;onopen:any;onmessage:any;onerror:any;onclose:any;sent:any[]=[];
 constructor(readonly respond:(m:any,s:OfflineSocket)=>void,delay=0){if(delay){this.readyState=0;setTimeout(()=>{this.readyState=1;this.onopen?.();},delay);}else queueMicrotask(()=>this.onopen?.());}
 send(text:string){const m=JSON.parse(text);this.sent.push(m);this.respond(m,this);}
 emit(m:any){this.onmessage?.({data:JSON.stringify(m)});}
 close(){this.readyState=3;this.onclose?.();}
}
test('transport aborts on disconnect after remove instead of sending spawn blindly',async()=>{
 const state:any=emptyState();state.entities.cabin=structuredClone(host);let socket:OfflineSocket;
 const connect=()=>socket=new OfflineSocket((m,s)=>{if(m.type==='join')queueMicrotask(()=>s.emit(snap(state)));else if(m.type==='verb')s.close();});
 await expect(rollout.sendVerbs([['remove',{id:'cabin'}],['spawn',{id:'cabin',lib:next.lib}]],{id:'cabin'},{url:'offline'},()=>{},(s:any)=>s.entities,()=>{},connect)).rejects.toThrow('closed');
 expect(socket!.sent.filter(m=>m.type==='verb').map(m=>m.verb)).toEqual(['remove']);
});
test('unrestorable spawn parameters and server-truncated component payloads fail before remove',()=>{
 expect(()=>rollout.buildHostVerbs(before,next,{...host,futureSpawnParam:1})).toThrow();
 for(const comp of [{['x'.repeat(33)]:{a:1}},{data:'x'.repeat(8193)}])expect(()=>rollout.buildHostVerbs({...before,comp},{...next,comp},{...host,comp})).toThrow();
});
function testGlb(){
 const json=Buffer.from('{"asset":{"version":"2.0"}}'.padEnd(32,' ')),b=Buffer.alloc(20+json.length);
 b.write('glTF');b.writeUInt32LE(2,4);b.writeUInt32LE(b.length,8);b.writeUInt32LE(json.length,12);b.writeUInt32LE(0x4e4f534a,16);json.copy(b,20);return b;
}
test('complete no-op readback fetches actual served bytes and rejects malformed chunk framing',async()=>{
 const live={...before,lib:next.lib,bbox:next.bounds},folded={...host,lib:next.lib},good=testGlb();let reads=0;
 expect(await rollout.verifyReadback(live,before,next,host,folded,async()=>{reads++;return good;})).toEqual(good);
 expect(reads).toBe(1); // Served/Draco bytes need not hash to the preoptimization source SHA.
 const corrupt=Buffer.from(good);corrupt.writeUInt32LE(99999,12);
 await expect(rollout.verifyReadback(live,before,next,host,folded,async()=>corrupt)).rejects.toThrow();
 await expect(rollout.verifyReadback(live,before,next,host,folded,async()=>{throw Error('asset 404');})).rejects.toThrow('404');
});
test('missing log entries and malformed snapshot sequence metadata fail closed',()=>{
 const state:any=emptyState();state.entities.cabin=structuredClone(host);
 const seq=new rollout.VerbSequence([['remove',{id:'cabin'}]],()=>{},(s:any)=>s.entities,()=>{});seq.receive(snap(state));
 expect(()=>seq.receive({type:'log',entry:entry('say',{text:'missed prior log'},2)})).toThrow('sequence gap');
 expect(()=>seq.next(900)).toThrow();
 expect(()=>rollout.snapshotState({...snap(state),entries:[{seq:'bad'}]})).toThrow();
});
test('a stale/boundary snapshot whose tail changes folded host params cannot authorize a write',()=>{
 const state:any=emptyState();state.entities.cabin=structuredClone(host);
 const newer=entry('spawn',{id:'cabin',...host,collide:'box'},1);
 expect(()=>rollout.snapshotState({...snap(state),entries:[newer]})).toThrow('stale');
});
test('transport waits through a slow handshake instead of treating CONNECTING as failure',async()=>{
 const state:any=emptyState();state.entities.cabin=structuredClone(host);let socket:OfflineSocket;
 const connect=()=>socket=new OfflineSocket((m,s)=>{if(m.type==='join')queueMicrotask(()=>s.emit(snap(state)));else if(m.type==='verb')queueMicrotask(()=>s.emit({type:'log',entry:entry(m.verb,m.args)}));},850);
 await rollout.sendVerbs([['remove',{id:'cabin'}]],{id:'cabin'},{url:'offline'},()=>{},(s:any)=>s.entities,()=>{},connect);
 expect(socket!.sent.filter(m=>m.type==='verb')).toHaveLength(1);
});
// Importing the rollout for offline tests must never read credentials or run it.
test('rollout is import-safe without approval or a live connection',async()=>{
 const module=await import('./rollout.ts');
 expect(typeof module.runRollout).toBe('function');
});
test('replacement roundtrips the folded collision override and complete comp bag',()=>{
 const state:any=emptyState();state.entities.cabin=structuredClone(host);
 const verbs=(rollout.buildHostVerbs??buildVerbs)(before,next,host);
 for(const [verb,args] of verbs)foldEntry(state,entry(verb,args));
 expect(state.entities.cabin.collide).toBe('exact');
 expect(state.entities.cabin.comp).toEqual(host.comp);
 expect(state.entities.cabin.pos).toEqual(host.pos);
 expect(verbs.some(([v,a]:any)=>v==='comp'&&a.type==='lock')).toBe(false);
});
