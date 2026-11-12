import {test,expect} from 'bun:test';
import {Transpiler} from 'bun';
import {readFileSync} from 'node:fs';
import {protectUnchanged} from './contracts.ts';
import {snapshotState} from './rollout.ts';
import {emptyState,foldEntry} from '../../../shared/fold.js';

// Exercise the real capture CLI source with in-memory I/O only. No credentials,
// sockets, live GETs, or baseline-file writes are possible through this fixture.
async function captureFixture(ambiguous=false) {
 const ids=['bunkhouse','garden-cottage','longhouse','row-cottage','tower-house'].map(n=>`nx-town-${n}`);
 const hosts=ids.map((id,i)=>({id,kind:'thing',lib:`store/${'1'.repeat(16)}.glb`,pos:[i*3,0,0],yaw:0,scale:1,comp:{}}));
 const riders=['b17-garden-seed-lattice','b18-row-warp-count','b19-longhouse-feast-count','b20-bunkhouse-four-rooms','b21-tower-ascension-count'].map(n=>`nx-artwalk-${n}`);
 const protectedEntities=[...ids.map(id=>`${id}-l`),...riders].map(id=>({...hosts[0],id}));
 const entities=[...hosts,...protectedEntities];const state:any=emptyState();
 for(const {id,...e} of entities)state.entities[id]=structuredClone(e);
 const entry=ambiguous
  ?{verb:'comp',args:{id:ids[0],type:'extra',data:true},actor:'builder',ts:1,seq:1}
  :{verb:'say',args:{text:'already applied once'},actor:'builder',ts:1,seq:1};
 if(!ambiguous)foldEntry(state,entry);
 const message={type:'snapshot',world:'commons-next',throughSeq:0,entries:[entry],state};
 const writes:any[]=[];
 class Socket {
  onopen:any;onmessage:any;onerror:any;
  constructor(){queueMicrotask(()=>this.onopen?.());}
  send(raw:string){if(JSON.parse(raw).type!=='join')throw Error('unexpected wire message');queueMicrotask(()=>this.onmessage({data:JSON.stringify(message)}));}
  close(){}
 }
 const source=readFileSync(new URL('./capture.ts',import.meta.url),'utf8')
  .replace(/^import .*$/gm,'').replaceAll('import.meta.dir',JSON.stringify('/fixture/cabin-overhaul'));
 const js=new Transpiler({loader:'ts'}).transformSync(source)+'\nreturn snap.state.chatTotal;';
 const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
 const run=new AsyncFunction('readFileSync','writeFileSync','protectUnchanged','foldEntry','snapshotState','fetch','WebSocket','console',js);
 const result=await run((p:string)=>{if(p.endsWith('/config.json'))return JSON.stringify({url:'ws://capture.invalid/ws',joinToken:'fixture-only'});if(p.endsWith('/before/contracts.json'))return JSON.stringify(hosts);throw Error('unexpected fixture read');},
  (p:string,text:string)=>writes.push({path:p,data:JSON.parse(text)}),protectUnchanged,foldEntry,snapshotState,
  async()=>({ok:true,json:async()=>({world:'commons-next',entities})}),Socket,{log(){}});
 return {result,writes,entities,state};
}

test('capture does not replay an already-folded join tail or corrupt its input snapshot',async()=>{
 const r=await captureFixture();expect(r.result).toBe(1);expect(r.writes).toHaveLength(3);
 expect(r.writes.find(x=>x.path.endsWith('/protected.json')).data).toHaveLength(10);
});
test('capture refuses an ambiguous entity fold before persisting any baseline',async()=>{
 await expect(captureFixture(true)).rejects.toThrow('stale/ambiguous');
});
