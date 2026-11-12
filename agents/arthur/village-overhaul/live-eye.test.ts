import {test,expect} from 'bun:test';

import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const baseline=JSON.parse(readFileSync(join(import.meta.dir,'before/contracts.json'),'utf8'));
const load=()=>import('./live-eye.ts').catch(()=>({} as any));
test('explicit subset contracts fail closed on cross-scope IDs and immutable tuple drift',async()=>{
 const m:any=await load();expect(typeof m.validateContracts).toBe('function');
 const id='nx-town-hall';
 expect(m.validateContracts(baseline,[id],'before').map((x:any)=>x.id)).toEqual([id]);
 for(const targets of [[],[id,id],['nx-town-row-cottage'],['nx-town-hall ']])expect(()=>m.validateContracts(baseline,targets,'before')).toThrow();
 for(const field of ['pos','yaw','scale','comp','parent','kind','name']){
  const changed=structuredClone(baseline);changed[0][field]=field==='pos'?[1,0,0]:field==='comp'?{unexpected:true}:field==='scale'?2:field==='yaw'?1:'different';
  expect(()=>m.validateContracts(changed,[id],'after')).toThrow();
 }
 const changed=structuredClone(baseline);changed[0].lib='store/1234567890abcdef.glb';
 expect(()=>m.validateContracts(changed,[id],'before')).toThrow();
 expect(()=>m.validateContracts(changed,[id],'after')).not.toThrow();
 expect(()=>m.validateContracts([...baseline,baseline[0]],[id],'before')).toThrow();
 expect(()=>m.validateContracts([{...baseline[0],id:'other'}],[id],'before')).toThrow();
 expect(()=>m.validateContracts(baseline,[id],'anything')).toThrow();
 expect(typeof m.validateViews).toBe('function');
 const approach={id,name:'approach',bodyLocal:[0,0,15],lookLocal:[0,0,0]};
 const interior={id,name:'interior',bodyLocal:[0,.2,1],lookLocal:[0,.2,-2]};
 expect(()=>m.validateViews([approach,interior],[id])).not.toThrow();
 expect(()=>m.validateViews([approach],[id])).toThrow();
 expect(()=>m.validateViews([approach,interior,interior],[id])).toThrow();
 expect(()=>m.validateViews([{...approach,id:'nx-forge'},{...interior,id:'nx-forge'}],['nx-forge'])).toThrow();
 expect(()=>m.validateViews([{...approach,lookLocal:[0,0,15]},interior],[id])).toThrow();
 expect(typeof m.assertCensus).toBe('function');
 expect(()=>m.assertCensus({world:'foreign',entities:baseline},[baseline[0]])).toThrow();
 expect(()=>m.assertCensus({world:'commons-next',entities:[...baseline,baseline[0]]},[baseline[0]])).toThrow();
 expect(()=>m.assertCensus({world:'commons-next',entities:changed},[baseline[0]])).toThrow();
 expect(()=>m.assertCensus({world:'commons-next',entities:baseline},[baseline[0]])).not.toThrow();
});
test('immutable unavailable manifest contains all requested views and no join',async()=>{
 const m:any=await load();expect(typeof m.captureLiveEyes).toBe('function');
 const expected=[baseline[0]],targets=[expected[0].id],views=[{id:targets[0],name:'approach',bodyLocal:[0,0,15],lookLocal:[0,0,0]},{id:targets[0],name:'interior',bodyLocal:[0,.2,1],lookLocal:[0,.2,-2]}];
 const server=Bun.serve({port:0,hostname:'127.0.0.1',fetch(req){return new URL(req.url).pathname==='/geom'?Response.json({world:'commons-next',entities:baseline}):new Response('absent',{status:503});}});
 const outDir=mkdtempSync(join(tmpdir(),'village-eye-test-'));
 try{
  const opts={cfg:{url:`ws://127.0.0.1:${server.port}/ws`},expected,targets,views,outDir,phase:'before',testEndpoint:true,protectedExpected:[]};
  const r=await m.captureLiveEyes(opts);
  expect(r.status).toBe('RENDERER_UNAVAILABLE');expect(r.frames).toHaveLength(2);expect(r.captured).toBe(0);expect(r.wireCounts).toEqual({join:0,pose:0,verb:0});
  expect(r.post.targets).toEqual(r.pre.targets);
  const bytes=readFileSync(join(outDir,'manifest.json'),'utf8');
  await expect(m.captureLiveEyes(opts)).rejects.toThrow();
  expect(readFileSync(join(outDir,'manifest.json'),'utf8')).toBe(bytes);
 }finally{server.stop(true);rmSync(outDir,{recursive:true,force:true});}
});

test('actual HTTP PNG bytes and exact per-frame tuples survive a pose-only capture',async()=>{
 const m:any=await load();
 const expected=[baseline[0]],targets=[expected[0].id],views=[{id:targets[0],name:'approach',bodyLocal:[0,0,15],lookLocal:[0,0,0]},{id:targets[0],name:'interior',bodyLocal:[0,.2,1],lookLocal:[0,.2,-2]}];
 const sharp=(await import('sharp')).default;
 const png=await sharp({create:{width:32,height:32,channels:3,background:'#4a6f94'}}).png().toBuffer();
 let joined=false;const wire:any[]=[];const protectedEntity={...baseline[0],id:'protected-fixture',pos:[-1000,0,-1000]};
 const server=Bun.serve({port:0,hostname:'127.0.0.1',fetch(req,s){const p=new URL(req.url).pathname;if(p==='/ws'&&s.upgrade(req))return;
  if(p==='/geom')return Response.json({world:'commons-next',entities:[...baseline,{...protectedEntity,lib:joined?'store/1111111111111111.glb':protectedEntity.lib}]});
  return joined?new Response(png,{headers:{'content-type':'image/png','cache-control':'no-store'}}):new Response('absent body',{status:404});
 },websocket:{message(ws,data){const v=JSON.parse(String(data));wire.push(v);if(v.type==='join'){joined=true;ws.send(JSON.stringify({type:'snapshot',world:'commons-next',you:v.id,throughSeq:7,state:{entities:Object.fromEntries(expected.map(e=>[e.id,e])),mounts:{}}}));}},close(){joined=false;}}});
 const outDir=mkdtempSync(join(tmpdir(),'village-eye-network-test-'));
 try{
  const r=await m.captureLiveEyes({cfg:{url:`ws://127.0.0.1:${server.port}/ws`,avatar:'fixture.vrm'},expected,targets,views,outDir,phase:'before',testEndpoint:true,protectedExpected:[protectedEntity],settleMs:1});
  expect(r.status).toBe('CAPTURED');expect(r.captured).toBe(2);expect(r.bodyClosed).toBe(true);expect(r.protectedChangesDuringCapture.length).toBeGreaterThan(0);
  expect(wire.every(x=>['join','pose'].includes(x.type))).toBe(true);expect(r.wireCounts.verb).toBe(0);
  for(const f of r.frames){expect(readFileSync(join(outDir,f.file)).equals(png)).toBe(true);expect(f.targetBefore).toEqual(f.targetAfter);expect(f.httpStatus).toBe(200);}
 }finally{server.stop(true);rmSync(outDir,{recursive:true,force:true});}
});

test('renderer endpoint and health require connected exact world and identity, never just HUD',async()=>{
 const m:any=await load();expect(typeof m.rendererURL).toBe('function');
 const id='renderer-arthur-village-eye-test';
 const u=new URL(m.rendererURL('https://eidoverse.billding.dev',id));
 expect(u.searchParams.get('world')).toBe('commons-next');expect(u.searchParams.has('renderer')).toBe(true);expect(u.searchParams.has('key')).toBe(false);
 expect(()=>m.rendererURL('https://other.example',id)).toThrow();
 expect(()=>m.endpoint('wss://eidoverse.billding.dev/ws?token=secret')).toThrow();
 expect(()=>m.endpoint('wss://other.example/ws')).toThrow();
 expect(typeof m.assertRendererHealth).toBe('function');
 const h={joined:true,myId:id,status:'live',wsReady:1,snapshot:{world:'commons-next',you:id},sent:{join:1},refused:{}};
 expect(()=>m.assertRendererHealth(h,id)).not.toThrow();
 for(const x of [{...h,joined:false},{...h,myId:'other'},{...h,wsReady:3},{...h,snapshot:{world:'foreign',you:id}},{...h,snapshot:null}])expect(()=>m.assertRendererHealth(x,id)).toThrow();
});

test('public-client guard enforces whitelist on a real browser WebSocket and correlates snap replies',async()=>{
 const m:any=await load();expect(typeof m.installRendererGuard).toBe('function');
 const {chromium}=await import('playwright');const wire:any[]=[];
 const id='renderer-arthur-village-eye-browsertest';
 const server=Bun.serve({port:0,hostname:'127.0.0.1',fetch(req,s){if(new URL(req.url).pathname==='/ws'&&s.upgrade(req))return;return new Response('<!doctype html><title>synthetic local guard test</title>',{headers:{'content-type':'text/html'}});},websocket:{message(ws,data){const v=JSON.parse(String(data));wire.push(v);if(v.type==='join'){ws.send(JSON.stringify({type:'snapshot',world:'commons-next',you:id}));ws.send(JSON.stringify({type:'snap',id:'request-1',follow:'fixture'}));}}}});
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.port}`);
  await page.evaluate(m.installRendererGuard,{id,wsURL:`ws://127.0.0.1:${server.port}/ws`,token:'fixture-only',wireSource:m.readOnlyWire.toString()});
  await page.evaluate(({id,url}:any)=>{const w:any=window;w.socket=new WebSocket(url);w.socket.onopen=()=>w.socket.send(JSON.stringify({type:'join',world:'commons-next',id,avatar:'fixture.vrm',spectate:true,renderer:true,token:'fixture-only'}));},{id,url:`ws://127.0.0.1:${server.port}/ws`});
  await page.waitForFunction(()=>!!(window as any).__villageEyeGuard.snapshot);
  const r=await page.evaluate(()=>{const w:any=window;
   for(const data of [JSON.stringify({type:'verb',verb:'spawn',args:{}}),JSON.stringify({type:'lease',op:'claim',id:'thing'}),new Uint8Array([1]),JSON.stringify({type:'snap-result',id:'unsolicited',error:'no'})])w.socket.send(data);
   w.socket.send(JSON.stringify({type:'snap-result',id:'request-1',error:'synthetic fixture'}));
   let blocked=false;try{new WebSocket('wss://foreign.example/ws');}catch{blocked=true;}
   return {guard:w.__villageEyeGuard,blocked};
  });
  await page.waitForTimeout(50);
  expect(wire.map(x=>x.type)).toEqual(['join','snap-result']);expect(r.blocked).toBe(true);expect(r.guard.sent.verb??0).toBe(0);expect(Object.values(r.guard.refused).reduce((a:any,b:any)=>a+b,0)).toBe(5);
 }finally{await browser.close();server.stop(true);}
},15000);

test('temporary renderer is scoped and always closed on completed or failed work',async()=>{
 const m:any=await load();expect(typeof m.withOwnedRenderer).toBe('function');expect(typeof m.startTemporaryRenderer).toBe('function');
 let closed=0;const start=async()=>({close:async()=>{closed++;}});
 expect(await m.withOwnedRenderer(start,async()=>42)).toBe(42);expect(closed).toBe(1);
 await expect(m.withOwnedRenderer(start,async()=>{throw Error('fixture failure');})).rejects.toThrow('fixture failure');expect(closed).toBe(2);
 await expect(m.startTemporaryRenderer({url:'wss://wrong.example/ws'},'renderer-arthur-village-eye-test')).rejects.toThrow();
});

test('CLI requires explicit target subset, expected contract, phase, and campaign output',async()=>{
 const m:any=await load();expect(typeof m.parseArgs).toBe('function');
 const args=['--targets','nx-town-hall','--expected','before/contracts.json','--phase','before','--out','reviews/live-test'];
 const a=m.parseArgs(args);expect(a.targets).toEqual(['nx-town-hall']);expect(a.phase).toBe('before');
 expect(()=>m.parseArgs([])).toThrow();expect(()=>m.parseArgs([...args,'--world','foreign'])).toThrow();
 expect(()=>m.parseArgs(args.map(x=>x==='reviews/live-test'?'../outside':x))).toThrow();
 expect(()=>m.parseArgs(args.map(x=>x==='nx-town-hall'?'nx-town-row-cottage':x))).toThrow();
});

test('frozen protected records use their geom contract, not wrapper IDs',async()=>{
 const m:any=await load();expect(typeof m.protectedContracts).toBe('function');
 const records=JSON.parse(readFileSync(join(import.meta.dir,'before/protected.json'),'utf8'));
 const protectedEntities=m.protectedContracts(records);expect(protectedEntities.length).toBe(279);expect(protectedEntities.every((x:any)=>typeof x.id==='string')).toBe(true);
 expect(()=>m.protectedContracts([{geom:null}])).toThrow();expect(()=>m.protectedContracts([records[0],records[0]])).toThrow();
});

test('pre-existing protected drift is reported while capture-start tuples are frozen for read-only evidence',async()=>{
 const m:any=await load();expect(typeof m.pinProtected).toBe('function');
 const want={...baseline[0],id:'protected-fixture'},got={...want,lib:'store/1111111111111111.glb'};
 const r=m.pinProtected({world:'commons-next',entities:[got]},[want]);expect(r.drift).toHaveLength(1);expect(r.drift[0].before.lib).toBe(want.lib);expect(r.drift[0].observed.lib).toBe(got.lib);expect(r.expected).toEqual([got]);
 expect(()=>m.assertCensus({world:'commons-next',entities:[want]},r.expected)).toThrow();
 expect(()=>m.pinProtected({world:'commons-next',entities:[]},[want])).toThrow();
});

test('nearby companions are selected in the host world frame, excluding unrelated carousel',async()=>{
 const m:any=await load();expect(typeof m.nearbyCompanions).toBe('function');
 const host={id:'host',pos:[10,0,20],yaw:Math.PI/2,scale:1,bbox:{min:[-2,0,-4],max:[2,5,4]}};
 const near={id:'sign',pos:[14.4,1,20],yaw:0,scale:1,bbox:{min:[-.2,0,-.2],max:[.2,1,.2]}};
 const far={...near,id:'nx-carousel',pos:[-18,0,18]};
 expect(m.nearbyCompanions(host,[near,far]).map((e:any)=>e.id)).toEqual(['sign']);
 const protectedEntities=m.protectedContracts(JSON.parse(readFileSync(join(import.meta.dir,'before/protected.json'),'utf8')));
 const stable=m.nearbyCompanions(baseline.find((e:any)=>e.id==='nx-town-stable'),protectedEntities);
 expect(stable.some((e:any)=>e.id==='nx-sign-stable-001')).toBe(true);expect(stable.some((e:any)=>e.id==='nx-carousel')).toBe(false);
});

test('renderer preparation waits for real models instead of capturing streaming placeholder boxes',async()=>{
 const m:any=await load();expect(typeof m.prepareRendererView).toBe('function');
 const {chromium}=await import('playwright');const browser=await chromium.launch({headless:true});
 try{const page=await browser.newPage();await page.evaluate(()=>{const w:any=window;w.EW={camera:{position:{set:(...p:any[])=>w.cameraP=p}},entities:new Map([['host',{userData:{placeholder:true}}]])};setTimeout(()=>w.EW.entities.set('host',{userData:{placeholder:false}}),100);});
  const r=await m.prepareRendererView(page,{p:[1,2,3]},['host']);expect(r.every((x:any)=>x.loaded)).toBe(true);expect(await page.evaluate(()=>(window as any).cameraP)).toEqual([1,2,3]);
 }finally{await browser.close();}
},15000);

test('wire whitelist admits only owned stationary presence or renderer protocol',async()=>{
 const m:any=await load();expect(typeof m.readOnlyWire).toBe('function');
 const id='arthur-village-eye-test', rendererId='renderer-arthur-village-eye-test';
 const pose={type:'pose',pose:{p:[0,0,0],yaw:0,speed:0,clip:'idle'}};
 expect(()=>m.readOnlyWire(pose,'body',id)).not.toThrow();
 expect(()=>m.readOnlyWire({type:'join',world:'commons-next',id,avatar:'fixture.vrm',agent:true,spectate:false,token:'fixture',agentToken:'fixture'},'body',id)).not.toThrow();
 expect(()=>m.readOnlyWire({type:'join',world:'commons-next',id:rendererId,avatar:'fixture.vrm',renderer:true,spectate:true,token:'fixture'},'renderer',rendererId)).not.toThrow();
 expect(()=>m.readOnlyWire({type:'snap-result',id:'request-1',dataUrl:'data:image/png;base64,AAAA'},'renderer',rendererId)).not.toThrow();
 for(const type of ['verb','lease','drag','bodydrag','puppet','world-reset','world-fork','rtc','anim','whisper','unknown'])for(const mode of ['body','renderer'])expect(()=>m.readOnlyWire({type,verb:'spawn',args:{}},mode,mode==='body'?id:rendererId)).toThrow();
 expect(()=>m.readOnlyWire({...pose,extra:'no'},'body',id)).toThrow();
 expect(()=>m.readOnlyWire({...pose,pose:{...pose.pose,speed:1}},'body',id)).toThrow();
 expect(()=>m.readOnlyWire(pose,'renderer',rendererId)).toThrow();
 expect(()=>m.readOnlyWire({type:'join',world:'foreign',id,agent:true,spectate:false},'body',id)).toThrow();
 expect(()=>m.readOnlyWire({type:'join',world:'commons-next',id:'arthur',agent:true,spectate:false},'body',id)).toThrow();
});
