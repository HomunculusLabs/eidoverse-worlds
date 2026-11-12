// OFFLINE regression suite. Synthetic fixtures are tests, never review/live evidence.
import {test,expect} from 'bun:test';
import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync,symlinkSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {ids} from './capture.ts';
import {stable} from '../cabin-overhaul/contracts.ts';
import {emptyState,foldEntry} from '../../../shared/fold.js';
const sha=(b:any)=>createHash('sha256').update(b).digest('hex');
const json=(f:string)=>JSON.parse(readFileSync(`${import.meta.dir}/before/${f}`,'utf8'));
const captured=()=>({baseline:json('contracts.json'),foldedHosts:json('folded-hosts.json'),protectedSet:json('protected.json'),census:json('full-census.json'),complete:json('capture-complete.json')});
const plan=(b:any):any=>({id:b.id,lib:`store/${'2'.repeat(16)}.glb`,sha256:'2'.repeat(64),pos:b.pos,yaw:b.yaw,scale:b.scale,comp:b.comp,bounds:b.bbox,kind:'walk-in',status:'READY'});
const approval=(c:any)=>({world:'commons-next',status:'reviewed',scope:ids,slots:[plan(c.baseline[0])]});
const rollout:any=await import('./rollout.ts');
test('exact frozen campaign allows a READY approval subset, never narrowed baselines or migrations',()=>{
 const c=captured(),a=approval(c);
 expect(rollout.validateCampaign?.(c,a,'nx-town-hall')).toEqual(a.slots);
 for(const mutate of [(d:any)=>d.baseline.pop(),(d:any)=>d.protectedSet.pop(),(d:any)=>d.protectedSet.push(d.protectedSet[0]),(d:any)=>d.foldedHosts.extra={},(d:any)=>d.protectedSet[0].folded.pos=[999,0,0],(d:any)=>d.census.entities.pop(),(d:any)=>d.complete.world='other']){
  const d=structuredClone(c);mutate(d);expect(()=>rollout.validateCampaign(d,a)).toThrow();
 }
 for(const b of [{...a,scope:ids.slice(1)},{...a,migrations:[{}]},{...a,migrations:{}},{...a,slots:[...a.slots,...a.slots]},{...a,slots:[{...a.slots[0],status:'DRAFT'}]},{...a,slots:[{...a.slots[0],pos:[9.0000001,0,-26]}]},{...a,slots:[{...a.slots[0],kind:'anything'}]}])expect(()=>rollout.validateCampaign(c,b)).toThrow();
 expect(()=>rollout.validateCampaign(c,a,'nx-forge')).toThrow();
});
// Each scratch directory is a labelled test fixture, removed in finally.
function sourceFixture(){
 const base=join(import.meta.dir,'test-fixtures');mkdirSync(base,{recursive:true});const root=mkdtempSync(join(base,'offline-'));
 const put=(f:string,data:string|Buffer)=>{const p=join(root,f);mkdirSync(join(p,'..'),{recursive:true});writeFileSync(p,data);return {file:f,sha256:sha(data)};};
 const bytes=Buffer.from('OFFLINE TEST MODEL — not a GLB or live evidence');
 const sources=[put('build-test.ts',"import './kit.ts';\n"),put('kit.ts','// OFFLINE test source\n'),put('before/nx-town-hall.glb','OFFLINE baseline input')];
 const slot:any={...plan(captured().baseline[0]),routes:[{...put('reviews/route.json','{"testOnly":true}'),mode:'room'}],file:'build/nx-town-hall.glb',builder:'build-test.ts',sha256:sha(bytes),sources};slot.lib=`store/${slot.sha256.slice(0,16)}.glb`;put(slot.file,bytes);
 const files=[put('reviews/pixels.txt','OFFLINE synthetic image evidence'),put('reviews/geometry.json','{"testOnly":true}'),put('reviews/functional.json','{"testOnly":true}'),put('reviews/deterministic.json','{"testOnly":true}')];
 const review:any={schema:'village-review-v1',id:slot.id,modelSha256:slot.sha256,kind:slot.kind,sources,routes:slot.routes,visual:{verdict:'accepted',reviewer:'OFFLINE TEST ONLY',files:[files[0]]},geometry:{verdict:'passed',evidence:files[1]},functional:{verdict:'passed',kind:slot.kind,evidence:files[2]},deterministic:{sha256:[slot.sha256,slot.sha256],evidence:files[3]}};
 const save=()=>slot.review=put('reviews/acceptance.json',JSON.stringify(review));save();return {root,slot,review,put,save,bytes,clean:()=>rmSync(root,{recursive:true,force:true})};
}
test('model, transitive sources and acceptance evidence are hash-pinned and confined',()=>{
 const f=sourceFixture();try{
  expect(rollout.sourceGate?.(f.root,f.slot)).toEqual(f.bytes);
  for(const mutate of [(s:any)=>s.sources=[],(s:any)=>s.routes=[],(s:any)=>s.sha256='A'.repeat(64),(s:any)=>s.review.sha256='0'.repeat(64),(s:any)=>s.file='../escape.glb']){
   const s=structuredClone(f.slot);mutate(s);expect(()=>rollout.sourceGate(f.root,s)).toThrow();
  }
  f.put('kit.ts',"import './missing-pin.ts';");f.put('missing-pin.ts','export {};');f.slot.sources[1].sha256=sha(readFileSync(join(f.root,'kit.ts')));f.review.sources=f.slot.sources;f.save();
  expect(()=>rollout.sourceGate(f.root,f.slot)).toThrow('unpinned');
  f.put('kit.ts','// OFFLINE test source\n');f.slot.sources[1].sha256=sha(readFileSync(join(f.root,'kit.ts')));f.save();
  f.slot.collisionAmendment={from:null,to:'exact',reason:'OFFLINE invalid amendment evidence',evidence:{file:'reviews/geometry.json',sha256:sha('{"testOnly":true}')}};expect(()=>rollout.sourceGate(f.root,f.slot)).toThrow('collision');delete f.slot.collisionAmendment;
  f.review.functional.kind='waived';f.save();expect(()=>rollout.sourceGate(f.root,f.slot)).toThrow('functional');
  f.review.functional.kind=f.slot.kind;f.save();f.put('reviews/pixels.txt','changed');expect(()=>rollout.sourceGate(f.root,f.slot)).toThrow('pin');
  symlinkSync('/etc/hosts',join(f.root,'build','escape.glb'));expect(()=>rollout.sourceGate(f.root,{...f.slot,file:'build/escape.glb'})).toThrow('escape');
 }finally{f.clean();}
});
const stateFor=(c:any)=>({...emptyState(),entities:{...structuredClone(c.foldedHosts),...Object.fromEntries(c.protectedSet.map((p:any)=>[p.geom.id,structuredClone(p.folded)]))}});
const byFor=(c:any)=>Object.fromEntries(c.census.entities.map((e:any)=>[e.id,structuredClone(e)]));
const entry=(verb:string,args:any,seq=1)=>({verb,args,seq,actor:'offline-builder',ts:seq});
test('focused live gate protects every unselected host and exact originals, but permits unrelated new arrivals',()=>{
 const c=captured(),a=approval(c),st=stateFor(c),by=byFor(c);
 by.newcomer={id:'newcomer',kind:'thing',lib:c.baseline[0].lib,pos:[500,0,500],yaw:0,scale:1,comp:{},parent:null,bbox:c.baseline[0].bbox};
 st.entities.newcomer={lib:by.newcomer.lib,pos:by.newcomer.pos,yaw:0,scale:1,actor:'new',ts:8};
 expect(rollout.allGates?.(c,a,by,st)).toEqual({[c.baseline[0].id]:'replace'});
 for(const mutate of [(s:any)=>s.entities['nx-town-inn'].actor='drift',(s:any)=>s.entities['nx-town-hall'].collide='box',(s:any)=>s.mounts={person:{to:'nx-town-hall'}},(s:any)=>s.entities.cargo={parent:{to:'nx-town-hall'}},(s:any)=>s.entities['nx-town-hall'].comp={lock:true}]){
  const s=structuredClone(st);mutate(s);expect(()=>rollout.allGates(c,a,by,s)).toThrow();
 }
 const bad=structuredClone(by);bad['nx-town-inn'].pos[0]+=.0000001;expect(()=>rollout.allGates(c,a,bad,st)).toThrow();
});
test('only explicitly evidenced eligible collision amendments alter spawn-only collide in the real fold',()=>{
 const c=captured(),id='nx-town-gate-n',b=c.baseline.find((e:any)=>e.id===id),f=c.foldedHosts[id],s:any=plan(b);
 s.kind='portal';s.collisionAmendment={from:null,to:'exact',reason:'OFFLINE fixture: verify narrow correction',evidence:{file:'reviews/collision.json',sha256:'a'.repeat(64)}};
 expect(rollout.campaignHostGate?.(b,b,s,f,f)).toBe('replace');
 const verbs=rollout.campaignHostVerbs(b,s,f),st:any=emptyState();st.entities[id]=structuredClone(f);
 for(const [verb,args] of verbs)foldEntry(st,entry(verb,args));
 const {actor,ts,...actual}=st.entities[id],{actor:oldActor,ts:oldTs,...old}=f;
 expect(actual).toEqual({...old,lib:s.lib,collide:'exact'});
 expect(rollout.campaignHostGate({...b,lib:s.lib,bbox:s.bounds},b,s,f,st.entities[id])).toBe('noop');
 for(const change of [{collisionAmendment:{...s.collisionAmendment,to:'box'}},{collide:'exact'},{collisionAmendment:{...s.collisionAmendment,from:'box'}}])expect(()=>rollout.campaignHostGate(b,b,{...s,...change},f,f)).toThrow();
 const hall=c.baseline[0];expect(()=>rollout.campaignHostGate(hall,hall,{...plan(hall),collisionAmendment:s.collisionAmendment},c.foldedHosts[hall.id],c.foldedHosts[hall.id])).toThrow();
 expect(()=>rollout.campaignHostVerbs(b,s,{...f,futureSpawnParam:true})).toThrow();
});
async function triangleGLB(){
 const {Document,NodeIO}=await import('@gltf-transform/core');const d=new Document(),buf=d.createBuffer();
 const p=d.createPrimitive().setAttribute('POSITION',d.createAccessor().setType('VEC3').setArray(new Float32Array([0,0,0,1,0,0,0,1,1])).setBuffer(buf));
 d.createScene().addChild(d.createNode('working-node').setMesh(d.createMesh().addPrimitive(p)));return Buffer.from(await new NodeIO().writeBinary(d));
}
test('full GLB decoding traverses real default-scene triangles and refuses malformed or external content',async()=>{
 const bytes=await triangleGLB();expect(typeof rollout.decodeModel).toBe('function');
 const decoded=await rollout.decodeModel(bytes);expect(decoded.bounds).toEqual({min:[0,0,0],max:[1,1,1]});expect(decoded.triangles).toBe(1);expect(decoded.nodes).toContain('working-node');
 const bad=Buffer.from(bytes);bad.writeUInt32LE(bytes.length+4,8);await expect(rollout.decodeModel(bad)).rejects.toThrow();
 const {Document,NodeIO}=await import('@gltf-transform/core');const d=new Document();d.createScene();await expect(rollout.decodeModel(Buffer.from(await new NodeIO().writeBinary(d)))).rejects.toThrow('zero');
 const served=readFileSync(`${import.meta.dir}/before/nx-town-hall.glb`);const real=await rollout.decodeModel(served);expect(real.triangles).toBeGreaterThan(0);expect(real.nodes.length).toBeGreaterThan(0);
});
import {VerbSequence} from '../cabin-overhaul/rollout.ts';
test('midflight shared-fold scope accepts distant new entities but stops intruders, riders and lost ACKs',()=>{
 const c=captured(),by=byFor(c),st=stateFor(c),s=plan(c.baseline[0]);s.affectedBounds={min:[0,-2,-40],max:[20,15,-15]};
 expect(typeof rollout.campaignScope).toBe('function');const scope=rollout.campaignScope(c,by,s.affectedBounds);
 const seq=new VerbSequence([['remove',{id:s.id}],['spawn',{id:s.id,lib:s.lib}]],()=>{},scope,()=>{});
 seq.receive({type:'snapshot',world:'commons-next',you:'offline-builder',throughSeq:0,entries:[],state:st});
 expect(seq.next(0)).toEqual(['remove',{id:s.id}]);expect(seq.next(700)).toBeNull();
 seq.receive({type:'log',entry:entry('spawn',{id:'new-far',lib:c.baseline[0].lib,pos:[500,0,500],yaw:0,scale:1},1)});
 seq.receive({type:'log',entry:entry('remove',{id:s.id},2)});expect(seq.next(700)?.[0]).toBe('spawn');
 expect(()=>seq.receive({type:'log',entry:entry('spawn',{id:'new-near',lib:c.baseline[0].lib,pos:[9,0,-26],yaw:0,scale:1},3)})).toThrow('drift');expect(()=>seq.next(1400)).toThrow();
 const road={id:'distant-origin-network',lib:'store/9999999999999999.glb',pos:[1000,0,0],yaw:0,scale:1,comp:{},parent:null,bbox:{min:[-1005,-1,-40],max:[-980,1,-15]}};
 const neighbors=rollout.selectNeighbors({...by,[road.id]:road},s);expect(neighbors.map((e:any)=>e.id)).toContain(road.id);
});
test('parent preflight must bind exact local/served bytes, fresh context and bounded geometry coverage without invented residuals',()=>{
 const s={...plan(captured().baseline[0]),affectedBounds:{min:[0,-2,-40],max:[20,15,-15]}};
 const input:any={slot:s,stage:'served',contextSha256:'c'.repeat(64),modelSha256:'d'.repeat(64),neighbors:[{id:'art',lib:'store/a.glb',sha256:'e'.repeat(64)}]};
 const r:any={schema:'village-preflight-v1',id:s.id,kind:s.kind,stage:input.stage,sourceSha256:s.sha256,modelSha256:input.modelSha256,contextSha256:input.contextSha256,verdict:'passed',geometryScope:'OFFLINE fixture exercises report contract only',limitations:['No real geometry verdict in this synthetic test'],checks:Object.fromEntries(['decodedGeometry','assemblyCoverage','routeSweeps','attachmentBacking','functional','publicRuntime','occupancy','sourceEquivalence','contextVisuals','envelope'].map(k=>[k,'passed'])),neighbors:[{id:'art',sha256:'e'.repeat(64),disposition:'route-tested',verdict:'passed',evidence:[{file:'reviews/offline.json',sha256:'f'.repeat(64)}]}],evidence:[{file:'reviews/offline.json',sha256:'f'.repeat(64)}]};
 expect(rollout.validatePreflight?.(input,r)).toEqual(r);
 for(const mutate of [(x:any)=>x.modelSha256='0'.repeat(64),(x:any)=>x.contextSha256='0'.repeat(64),(x:any)=>x.neighbors=[],(x:any)=>x.neighbors[0].evidence=[],(x:any)=>x.neighbors[0].disposition='bbox-waiver',(x:any)=>x.checks.functional='not-applicable',(x:any)=>x.checks.publicRuntime='repo-local']){
  const bad=structuredClone(r);mutate(bad);expect(()=>rollout.validatePreflight(input,bad)).toThrow();
 }
});
async function runnableFixture(){
 const f=sourceFixture(),bytes=await triangleGLB();f.put(f.slot.file,bytes);f.slot.sha256=sha(bytes);f.slot.lib=`store/${f.slot.sha256.slice(0,16)}.glb`;f.slot.bounds={min:[0,0,0],max:[1,1,1]};f.review.modelSha256=f.slot.sha256;f.review.deterministic.sha256=[f.slot.sha256,f.slot.sha256];f.save();
 const c=captured(),a=approval(c);a.slots=[f.slot,plan(c.baseline[1])];f.slot.affectedBounds={min:[0,-2,-40],max:[20,15,-15]};
 let state:any=stateFor(c),clock=100000,uploads=0,sends=0;const rows:any[]=[],steps:string[]=[];
 const io:any={now:()=>clock,sleep:async(ms:number)=>{clock+=ms;steps.push(`sleep:${ms}`);},receipt:(r:any)=>rows.push(r),readAsset:async(_lib:string)=>{steps.push('readAsset');return Buffer.from(bytes);}, // Isolated fake network returns the OFFLINE triangle for every asset, never live evidence.
 readWorld:async()=>{steps.push('readWorld');const by=byFor(c);if(state.entities[f.slot.id]?.lib===f.slot.lib)by[f.slot.id]={...by[f.slot.id],lib:f.slot.lib,bbox:f.slot.bounds};return {by,state:structuredClone(state)};},
 upload:async()=>{uploads++;steps.push('upload');return {status:200,path:f.slot.lib};},
 send:async(vs:any,slot:any,guard:any,scope:any,receipt:any)=>{sends++;guard(structuredClone(state));const seq=new VerbSequence(vs,guard,scope,(entry:any)=>receipt({status:'VERB_ACKNOWLEDGED',entry}));seq.receive({type:'snapshot',world:'commons-next',you:'offline-builder',throughSeq:0,entries:[],state:structuredClone(state)});let i=0;for(const [v,args] of vs){expect(seq.next(i*700)).toEqual([v,args]);const e=entry(v,args,++i);foldEntry(state,e);seq.receive({type:'log',entry:e});}expect(seq.complete).toBe(true);},
 inspect:async(input:any)=>({schema:'village-preflight-v1',id:input.slot.id,kind:input.slot.kind,stage:input.stage,sourceSha256:input.slot.sha256,modelSha256:input.modelSha256,contextSha256:input.contextSha256,verdict:'passed',geometryScope:'OFFLINE fixture exercises report contract only',limitations:['No real geometry verdict in this synthetic test'],checks:Object.fromEntries(rollout.PREFLIGHT_CHECKS.map((k:string)=>[k,'passed'])),neighbors:input.neighbors.map((n:any)=>({id:n.id,sha256:n.sha256,disposition:n.lib?'route-tested':'point-light',verdict:'passed',evidence:[f.review.geometry.evidence]})),evidence:[f.review.geometry.evidence]})};
 return {...f,c,a,io,rows,steps,bytes,get state(){return state;},get uploads(){return uploads;},get sends(){return sends;}};
}
test('OFFLINE injected network: complete dry-run writes nothing; focused apply/readback then rerun is no-op',async()=>{
 const f=await runnableFixture();try{
  expect(typeof rollout.executeRollout).toBe('function');const args={root:f.root,campaign:f.c,approval:f.a,only:f.slot.id,io:f.io};
  const dry=await rollout.executeRollout(args);expect(dry).toMatchObject({status:'DRY_RUN_VERIFIED',uploads:0,verbs:0});expect(f.uploads).toBe(0);expect(f.sends).toBe(0);
  const applied=await rollout.executeRollout({...args,apply:true});expect(applied).toMatchObject({status:'ROLLOUT_VERIFIED',uploads:1,verbs:2});expect(f.state.entities[f.slot.id].lib).toBe(f.slot.lib);
  const rerun=await rollout.executeRollout({...args,apply:true});expect(rerun).toMatchObject({uploads:0,verbs:0});expect(f.uploads).toBe(1);expect(f.sends).toBe(1);expect(f.rows.some((r:any)=>r.status==='ALREADY_LIVE_NO_VERBS')).toBe(true);
 }finally{f.clean();}
},20000);
test('OFFLINE retry/drift: 429 is paced and regated; changed sources or malformed served bytes never reach remove',async()=>{
 for(const failure of ['source','served','retry-drift']){
  const f=await runnableFixture();try{
   const upload=f.io.upload;f.io.upload=async()=>{const r=await upload();if(failure==='source')f.put(f.slot.file,'changed');if(failure==='retry-drift'){f.state.entities[f.slot.id].comp={lock:true};return {status:429};}return r;};
   const read=f.io.readAsset;f.io.readAsset=async(lib:string)=>failure==='served'&&lib===f.slot.lib?Buffer.from('glTF BROKEN'):read(lib);
   await expect(rollout.executeRollout({root:f.root,campaign:f.c,approval:f.a,only:f.slot.id,apply:true,io:f.io})).rejects.toThrow();expect(f.sends).toBe(0);
   if(failure==='retry-drift'){expect(f.steps).toContain('sleep:30000');expect(f.uploads).toBe(1);}
  }finally{f.clean();}
 }
});
test('successful send without authoritative receipt cannot claim completion',async()=>{
 const f=await runnableFixture();try{const send=f.io.send;f.io.send=(v:any,s:any,g:any,scope:any)=>send(v,s,g,scope,()=>{});await expect(rollout.executeRollout({root:f.root,campaign:f.c,approval:f.a,only:f.slot.id,apply:true,io:f.io})).rejects.toThrow('acknowledg');}finally{f.clean();}
});
test('CLI rejects invalid options before loading credentials, approval, or preflight',async()=>{
 expect(typeof rollout.runRollout).toBe('function');await expect(rollout.runRollout(['--id'])).rejects.toThrow('option');
});
class OfflineSocket {
 readyState=1;onopen:any;onmessage:any;onerror:any;onclose:any;sent:any[]=[];
 constructor(readonly respond:(m:any,s:OfflineSocket)=>void){queueMicrotask(()=>this.onopen?.());}
 send(data:any){const m=JSON.parse(String(data));this.sent.push(m);this.respond(m,this);}
 emit(m:any){this.onmessage?.({data:JSON.stringify(m)});}close(){this.readyState=3;this.onclose?.();}
}
test('OFFLINE network adapter uses read-only snapshots and actual cabin ACK transport, checking before each send',async()=>{
 expect(typeof rollout.createLiveIO).toBe('function');const sockets:OfflineSocket[]=[],c=captured(),state=stateFor(c),calls:any[]=[];let guardCalls=0;
 const net={fetch:async(url:any,opts:any)=>{calls.push({url:String(url),opts});return new Response(JSON.stringify(c.census),{status:200});},connect:()=>{const s=new OfflineSocket((m,s)=>{if(m.type==='join')s.emit({type:'snapshot',world:'commons-next',you:'offline-builder',throughSeq:0,entries:[],state});else if(m.type==='verb')s.emit({type:'log',entry:entry(m.verb,m.args)});});sockets.push(s);return s;}};
 const io=rollout.createLiveIO({url:'ws://offline.invalid/ws',joinToken:'OFFLINE_DOOR',agentToken:'OFFLINE_UPLOAD',id:'offline'},async()=>{},()=>{},net);
 const got=await io.readWorld();expect(Object.keys(got.by)).toHaveLength(296);expect(sockets[0].sent[0].spectate).toBe(true);
 await io.send([['remove',{id:'nx-town-hall'}]],{id:'nx-town-hall'},()=>{},(s:any)=>s.entities,()=>{},()=>guardCalls++);
 expect(guardCalls).toBe(1);expect(sockets[1].sent[0]).toMatchObject({id:'arthur-village-overhaul',spectate:false});expect(calls).toHaveLength(1);
 await expect(io.readAsset('../config.json')).rejects.toThrow();expect(calls).toHaveLength(1);
},10000);
test('loader audits every saved original byte without importing builders or touching credentials',()=>{
 expect(typeof rollout.loadFrozen).toBe('function');const c=rollout.loadFrozen(import.meta.dir);expect(c.baseline).toHaveLength(17);expect(c.protectedSet).toHaveLength(279);expect(c.downloads).toHaveLength(c.complete.downloads);
});
test('paced upload resumes from the previous process attempt timestamp',async()=>{
 const f=await runnableFixture();try{await rollout.executeRollout({root:f.root,campaign:f.c,approval:f.a,only:f.slot.id,apply:true,io:f.io,lastUploadAt:f.io.now()});expect(f.steps).toContain('sleep:22000');expect(f.rows.filter((r:any)=>r.status==='UPLOAD_ATTEMPT')).toHaveLength(1);}finally{f.clean();}
});
test('all 17 real captured host component bags roundtrip through unchanged core and actual shared fold',()=>{
 const c=captured();for(const b of c.baseline){const s=plan(b),f=c.foldedHosts[b.id],st:any=emptyState();st.entities[b.id]=structuredClone(f);for(const [v,a] of rollout.campaignHostVerbs(b,s,f))foldEntry(st,entry(v,a));expect(st.entities[b.id].comp??{}).toEqual(f.comp??{});expect(st.entities[b.id].collide).toBe(f.collide);expect(rollout.campaignHostGate({...b,lib:s.lib,bbox:s.bounds},b,s,f,st.entities[b.id])).toBe('noop');}
});
test('only a pinned passing collision evidence report admits an eligible functional type',()=>{
 const f=sourceFixture();try{
  f.slot.id='nx-town-market';f.slot.kind='workstation';f.slot.routes[0].mode='workstation';f.slot.sources[2]=f.put('before/nx-town-market.glb','OFFLINE baseline input');f.review.id=f.slot.id;f.review.kind=f.slot.kind;f.review.functional.kind=f.slot.kind;
  const e:any={schema:'village-collision-v1',id:f.slot.id,modelSha256:f.slot.sha256,from:null,to:'exact',verdict:'passed',checks:{publicRuntime:'passed',exactCollider:'passed',bidirectionalRoutes:'passed'},evidence:[f.review.functional.evidence]};
  f.slot.collisionAmendment={from:null,to:'exact',reason:'OFFLINE test correction',evidence:f.put('reviews/collision.json',JSON.stringify(e))};f.save();
  expect(rollout.sourceGate(f.root,f.slot)).toEqual(f.bytes);e.checks.publicRuntime='repo-local';f.slot.collisionAmendment.evidence=f.put('reviews/collision.json',JSON.stringify(e));expect(()=>rollout.sourceGate(f.root,f.slot)).toThrow('publicRuntime');
 }finally{f.clean();}
});
test('regional protection permits unrelated outside carousel drift but refuses neighbor movement into or out of scope',()=>{
 const c=captured(),a=approval(c),by=byFor(c),st=stateFor(c),bounds={min:[0,-2,-40],max:[20,15,-15]},id='nx-carousel';
 const scope=rollout.campaignScope(c,by,bounds),initial=scope(st);by[id].lib='store/aaaaaaaaaaaaaaaa.glb';st.entities[id].lib=by[id].lib;st.entities[id].actor='independent-carousel-commission';
 expect(()=>rollout.allGates(c,a,by,st,bounds)).not.toThrow();scope.observe(by);expect(scope(st)).toEqual(initial);
 by[id].pos=[9,0,-26];st.entities[id].pos=by[id].pos;expect(()=>rollout.allGates(c,a,by,st,bounds)).toThrow();
 const next=byFor(c),state=stateFor(c),neighbor='nx-artwalk-b1-hall-charter';next[neighbor].pos=[500,0,500];state.entities[neighbor].pos=next[neighbor].pos;expect(()=>rollout.allGates(c,a,next,state,bounds)).toThrow();
});
test('persistent upload clock reads only recorded attempts and refuses corrupt receipts',()=>{
 const f=sourceFixture();try{expect(rollout.readUploadClock?.(f.root)).toBe(-Infinity);f.put('rollout-receipts.jsonl','{"status":"UPLOAD_ATTEMPT","at":1234}\n{"status":"PLACED_VERIFIED"}\n');expect(rollout.readUploadClock(f.root)).toBe(1234);f.put('rollout-receipts.jsonl','partial');expect(()=>rollout.readUploadClock(f.root)).toThrow();}finally{f.clean();}
});
test('affected region must contain the removed original extent, not merely the smaller candidate',()=>{
 const c=captured(),by=byFor(c),b=c.baseline[0],s={...plan(b),bounds:{min:[0,0,0],max:[1,1,1]}};const small=rollout.worldBounds(s,s.bounds);expect(()=>rollout.selectNeighbors(by,{...s,affectedBounds:small})).toThrow('old host');
});
test('CLI is dry-run by default and has an exact focused target',()=>{
 expect(rollout.parseArgs?.([])).toEqual({apply:false,only:null});
 expect(rollout.parseArgs(['--id','nx-town-hall'])).toEqual({apply:false,only:'nx-town-hall'});
 for(const args of [['--id'],['--id','unknown'],['--apply','--apply'],['--id','nx-town-hall','--id','nx-forge'],['--upload']])expect(()=>rollout.parseArgs(args)).toThrow();
});
