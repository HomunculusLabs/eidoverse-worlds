import { test, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

test('CLI --check validates but never loads a config or creates a live output', async()=>{
  const p=Bun.spawn(['bun',join(import.meta.dir,'live-review.ts'),'--ride','--check','--all-slots','--expect-lib','store/07c7feba5157336b.glb','--door-config','/nonexistent/never-read.json'],{stdout:'pipe',stderr:'pipe'});
  const [out,err,code]=await Promise.all([new Response(p.stdout).text(),new Response(p.stderr).text(),p.exited]);
  expect(code).toBe(0); expect(err).toBe('');
  expect(JSON.parse(out)).toMatchObject({outcome:'OPTIONS_VALIDATED_OFFLINE',network:false,credentialsRead:false,slots:['horse_0','horse_2','horse_4','horse_6']});
});
test('live chassis retains public renderer, own seat/dismount, pin checks, and two wire boundaries',()=>{
  const path=join(import.meta.dir,'live-review.runtime.ts');
  expect(existsSync(path)).toBe(true);
  const text=readFileSync(path,'utf8');
  for(const required of ['headless: true','routeWebSocket','installWireGuard.toString()','gate.accept(m)','assertPreflight(',
    'trySitOn(',"keys.add('KeyW')","keys.delete('KeyW')",'page.screenshot','r.body()',"visualVerdict: 'NOT_JUDGED'",'attachmentMetrics(','readSample', 'isWebGPUBackend']) expect(text).toContain(required);
  for(const forbidden of ['connectOverCDP','launchPersistentContext','storageState:',"sendVerb('use'","sendVerb('comp'",'setAnimationLoop(','avatarMounts.set(','avatarMounts.delete(']) expect(text).not.toContain(forbidden);
});
test('offline Chrome smoke: fresh guest context serializes both wire functions with all network blocked',async()=>{
  const api:any=await import('./live-review.ts');
  expect(api.contextOptions).toBeFunction();
  const {chromium}=await import('playwright');
  const browser=await chromium.launch({headless:true,channel:'chrome',args:['--enable-unsafe-webgpu','--ignore-gpu-blocklist']});
  try {
    const options=api.contextOptions(false,'/unused');
    expect(options.serviceWorkers).toBe('block'); expect(options.permissions).toEqual([]); expect(options.recordVideo).toBeUndefined();
    expect(api.contextOptions(true,'/unused').recordVideo.dir).toBe('/unused');
    const ctx=await browser.newContext(options);
    let network=0;
    await ctx.route('**/*',(route:any)=>{network++;return route.abort();});
    await ctx.routeWebSocket('**/*',(ws:any)=>{network++;ws.close();});
    const page=await ctx.newPage();
    await page.goto('data:text/html,<title>OFFLINE ONLY - no world</title>');
    const result=await page.evaluate(({cfg,allowed,factory}:any)=>{
      const gate=(0,eval)(`(${factory})`)(cfg,(0,eval)(`(${allowed})`));
      const joined=gate.accept({type:'join',id:cfg.name,world:cfg.world});
      gate.arm();
      return {joined,mounted:gate.accept({type:'verb',verb:'mount',args:{id:cfg.name,to:cfg.target,slot:cfg.slot}})};
    },{cfg,allowed:api.wireAllowed.toString(),factory:api.createWireGate.toString()});
    const guarded=await page.evaluate(({cfg,allowed,factory,install}:any)=>{
      const sent:string[]=[];
      // In-memory transport fixture, not a WebSocket connection and not a world join.
      (window as any).WebSocket=class {send(data:string){sent.push(data);}};
      (0,eval)(`(${install})`)(cfg,(0,eval)(`(${allowed})`),(0,eval)(`(${factory})`));
      const socket=new WebSocket('ws://unused.invalid');
      socket.send(JSON.stringify({type:'join',id:cfg.name,world:cfg.world}));
      (window as any).__carouselGuard.arm();
      const m={type:'verb',verb:'mount',args:{id:cfg.name,to:cfg.target,slot:cfg.slot}};
      socket.send(JSON.stringify(m));socket.send(JSON.stringify(m));
      socket.send(JSON.stringify({type:'verb',verb:'comp',args:{id:cfg.target}}));
      return {sent:sent.map(s=>JSON.parse(s).type),blocked:(window as any).__carouselGuard.audit.blocked};
    },{cfg,allowed:api.wireAllowed.toString(),factory:api.createWireGate.toString(),install:api.installWireGuard.toString()});
    expect(guarded.sent).toEqual(['join','verb']);expect(guarded.blocked).toEqual(['verb:mount','verb:comp']);
    expect(result.joined).toBe(true);expect(result.mounted).toBe(true);expect(await ctx.cookies()).toEqual([]);expect(network).toBe(0);
    console.log(JSON.stringify({offlineChrome:browser.version(),networkRequests:network,worldJoined:false,scope:'in-memory guard only, NOT ride evidence'}));
  } finally {await browser.close();}
},60_000);

const modulePath = './live-review.ts';
test('runtime sampler reads actual Three node/raycast transforms without altering socket metadata (offline fixture)',async()=>{
  const T: any=await import('three'),{readSample,readPreflight}=await import('./live-review.runtime.ts');
  const carrier=new T.Group(),carousel=new T.Group(),horse=new T.Group(),rider=new T.Group(),hips=new T.Group();
  carousel.name='carousel';horse.name='horse_2';carrier.add(carousel);carousel.add(horse);horse.position.set(2,1,0);
  horse.userData.mbase={};carousel.userData.mbase={};
  const saddle=new T.Mesh(new T.BoxGeometry(.4,.1,.5),new T.MeshBasicMaterial());saddle.name='horse_2_3';saddle.material.name='prototype_saddle_leather';saddle.position.y=1;horse.add(saddle);
  rider.position.set(2,2,0);hips.position.y=.1;rider.add(hips);carrier.updateMatrixWorld(true);rider.updateMatrixWorld(true);
  const sockets={horse_2:{pos:[2,2,0],part:'horse_2'}},bag={sockets,'motion:horse_2':{type:'bob'},'motion:carousel':{type:'spin'}};
  const relation={to:cfg.target,slot:cfg.slot},entities=new Map([[cfg.target,carrier]]),avatarMounts=new Map([[cfg.name,relation]]);
  const state={lastSeq:7,st:{entities:{[cfg.target]:{lib:'store/07c7feba5157336b.glb'}},mounts:{[cfg.name]:relation}}};
  const camera=new T.PerspectiveCamera(45,1,0.1,100);camera.position.set(5,5,5);camera.lookAt(2,2,0);camera.updateMatrixWorld(true);
  const world={comps:new Map([[cfg.target,bag]]),avatarMounts,findPart:(o:any,n:string)=>o.getObjectByName(n),
    mountTransform:(_:string,p:any)=>{p.copy(rider.position);return {to:cfg.target,pose:'sitchair',yaw:0};},socketWorldPos:(_:string,__:string,p:any)=>p.set(2,2,0)};
  const previous=Object.fromEntries(['window','document','innerWidth','innerHeight'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  try{
    Object.assign(globalThis,{window:{EW:{THREE:T,entities,me:()=>({root:rider,vrm:{scene:{visible:true},humanoid:{getRawBoneNode:()=>hips}}}),
      myState:{pos:rider.position.clone(),clip:'sitchair'},camera,renderer:{info:{frame:42}}},__carouselReview:{cfg,world,state,localbody:{trySitOn(){}},controller:{keys:new Set()}}},document:{body:{innerText:'WASD hop off'}},innerWidth:1280,innerHeight:900});
    const before=JSON.stringify(sockets),s=readSample(),p=readPreflight();
    expect(s.horseWorld).toEqual([2,1,0]);expect(s.riderInHorseLocal).toEqual([0,1,0]);expect(s.rootErrorM).toBe(0);
    expect(s.saddleContactWorld[1]).toBeCloseTo(2.05,5);expect(s.hipsAboveSaddleM).toBeCloseTo(.05,5);expect(s.rendererFrame).toBe(42);
    expect(p.horse).toMatchObject({name:'horse_2',parent:'carousel',motionBase:true});expect(p.occupied).toBe(true);
    expect(JSON.stringify(sockets)).toBe(before);expect(avatarMounts.size).toBe(1);
    expect(s.saddleRayOriginWorld).toEqual([2.075,2.12,0]);
    expect(s.riderHorseHeadingDeltaRad).toBe(0);
    rider.rotation.y=Math.PI/2;rider.updateMatrixWorld(true);
    expect(readSample().riderHorseHeadingDeltaRad).toBeCloseTo(Math.PI/2,10);
    horse.rotation.y=Math.PI/2;carrier.updateMatrixWorld(true);
    expect(readSample().riderHorseHeadingDeltaRad).toBeCloseTo(0,10);
    horse.rotation.y=0;rider.rotation.y=0;carrier.updateMatrixWorld(true);rider.updateMatrixWorld(true);
    saddle.material.name='horse_2_saddle_leather';expect(readSample().saddleContactWorld).not.toBeNull();
    saddle.position.x=3;carrier.updateMatrixWorld(true);expect(readSample().saddleContactWorld).toBeNull();
  }finally{for(const[k,d]of Object.entries(previous)){if(d)Object.defineProperty(globalThis,k,d);else delete (globalThis as any)[k];}}
});
test('carousel metrics detect nested rotation and bob, not stationary entity-origin travel', async () => {
  const api: any = await import(modulePath);
  expect(api.attachmentMetrics).toBeFunction();
  const c = { target:'nx-carousel', slot:'horse_2' };
  const base = { at:1000, authoritativeMount:{to:c.target,slot:c.slot}, localMount:{to:c.target,slot:c.slot},
    rootErrorM:0, stateErrorM:0, riderVisible:true, seatHud:true, riderClip:'sitchair', mountInfo:{pose:'sitchair'},
    carrierWorld:[0,0,0], horseWorld:[2,1,0], riderRoot:[2,2,0], riderInHorseLocal:[0,1,0], carouselYaw:0, rendererFrame:1 };
  const next = { ...base, at:2000, horseWorld:[0,1.2,2], riderRoot:[0,2.2,2], carouselYaw:1, rendererFrame:2 };
  expect(api.attachmentMetrics([base,next],c).movingAttachment).toBe(true);
  expect(api.attachmentMetrics([base,next],c).carrierXZTravelM).toBe(0);
  expect(api.attachmentMetrics([base,base],c).movingAttachment).toBe(false);
  for (const change of [{ horseWorld:[0,1,2] }, { carouselYaw:0 }, { riderRoot:base.riderRoot },
    { rootErrorM:0.1 }, { riderInHorseLocal:[0.2,1,0] }, { riderInHorseLocal:null }, { stateErrorM:null }, { riderVisible:false }, { seatHud:false }, { rendererFrame:1 },
    { authoritativeMount:null }, { localMount:{to:c.target,slot:'horse_0'} }, { horseWorld:[NaN,0,0] }]) {
    expect(api.attachmentMetrics([base,{...next,...change}],c).movingAttachment).toBe(false);
  }
  expect(api.attachmentMetrics([],c).attachment).toBe(false);
  expect(api.attachmentMetrics([base,next],c).visualVerdict).toBe('NOT_JUDGED');
});
test('preflight fails closed on stale bytes, occupied ride, missing hierarchy or socket/motion support',async()=>{
  const api: any = await import(modulePath);
  expect(api.assertPreflight).toBeFunction();
  const lib='store/07c7feba5157336b.glb';
  const p={ targetState:{lib}, slot:{pos:[0,1.97,2],part:'horse_2'}, occupied:false,
    horse:{name:'horse_2',parent:'carousel',motionBase:true}, carousel:{name:'carousel',motionBase:true},
    motion:{type:'bob'}, spin:{type:'spin'}, publicSit:true, nativeKeys:true };
  expect(()=>api.assertPreflight(p,lib,'horse_2')).not.toThrow();
  for(const q of [ {...p,targetState:{lib:'store/ce3633992d07055e.glb'}}, {...p,occupied:true}, {...p,slot:null},
    {...p,horse:{...p.horse,parent:'wrong'}}, {...p,horse:{...p.horse,motionBase:false}},
    {...p,slot:{...p.slot,part:'horse_0'}}, {...p,spin:null}, {...p,publicSit:false} ]) expect(()=>api.assertPreflight(q,lib,'horse_2')).toThrow();
});
const cfg = { mode: 'ride', name: 'carousel-probe-12345678', world: 'commons-next', target: 'nx-carousel', slot: 'horse_2' };
const mount = { type: 'verb', verb: 'mount', args: { id: cfg.name, to: cfg.target, slot: cfg.slot } };
const dismount = { type: 'verb', verb: 'dismount', args: { id: cfg.name, pos: [1, 0, 2], yaw: 0 } };
const guestJoin = { type: 'join', id: cfg.name, world: cfg.world, avatar: 'claude', token: '', spectate: false, renderer: false };
test('wire gate requires a validated own guest and explicit arm, then only one mount/dismount', async () => {
  const api: any = await import(modulePath);
  expect(api.createWireGate).toBeFunction();
  const gate = api.createWireGate(cfg, api.wireAllowed);
  expect(gate.accept(mount)).toBe(false);
  expect(gate.accept(guestJoin)).toBe(true);
  expect(gate.accept(guestJoin)).toBe(false);
  expect(gate.accept(mount)).toBe(false);
  gate.arm();
  expect(gate.accept(mount)).toBe(true);
  expect(gate.accept(mount)).toBe(false);
  expect(gate.accept(dismount)).toBe(true);
  expect(gate.accept(dismount)).toBe(false);
  expect(gate.audit.sentVerbs.map((v: any) => v.verb)).toEqual(['mount','dismount']);
});
test('wire allowlist blocks every foreign identity, carousel action, and mutation channel', async () => {
  const { wireAllowed }: any = await import(modulePath);
  expect(wireAllowed).toBeFunction();
  expect(wireAllowed(guestJoin, cfg)).toBe(true);
  expect(wireAllowed({ type: 'pose', pose: { p: [1, 2, 3], yaw: 0 } }, cfg)).toBe(true);
  for (const type of ['ping','history','debug']) expect(wireAllowed({ type }, cfg)).toBe(true);
  for (const m of [
    { ...guestJoin, id: 'bill ding' }, { ...guestJoin, token: 'secret' }, { ...guestJoin, agentToken: 'secret' },
    { ...guestJoin, world: 'commons' }, { ...guestJoin, renderer: true }, { ...guestJoin, spectate: true },
    { type: 'pose', id: 'bill ding', pose: { p: [0,0,0] } },
    ...['lease','puppet','drag','bodydrag','world-fork','avatar'].map(type => ({ type, id: cfg.target })),
    ...['use','spawn','place','comp','motion','remove','say'].map(verb => ({ type: 'verb', verb, args: { id: cfg.target } })),
    { ...mount, args: { ...mount.args, id: 'arthur' } }, { ...mount, args: { ...mount.args, slot: 'horse_0' } },
    { ...mount, args: { ...mount.args, offset: [0,0,0] } }, { ...mount, token: 'x' },
    { ...dismount, args: { ...dismount.args, id: 'bill ding' } },
    { ...dismount, args: { ...dismount.args, pos: [NaN,0,0] } },
  ]) expect(wireAllowed(m,cfg)).toBe(false);
  for (const m of [mount,dismount]) expect(wireAllowed(m,{...cfg,mode:'inspect'})).toBe(false);
  expect(wireAllowed(guestJoin,{...cfg,name:'arthur'})).toBe(false);
});
test('offline parser fixes the world/target, defaults horse_2, and supports four isolated slot runs', async () => {
  const api: any = await import(modulePath).catch(() => ({}));
  expect(api.parseOptions).toBeFunction();
  const defaults = api.parseOptions(['--check']);
  expect(defaults).toMatchObject({ mode: 'inspect', check: true, slots: ['horse_2'], channel: 'chrome' });
  const ride = api.parseOptions(['--ride', '--all-slots', '--expect-lib', 'store/07c7feba5157336b.glb']);
  expect(ride.slots).toEqual(['horse_0', 'horse_2', 'horse_4', 'horse_6']);
  expect(ride.times).toEqual([2, 5, 9, 14, 20]);
  for (const args of [
    ['--ride'], ['--ride','--inspect'], ['--slot','horse_1'], ['--slot','HORSE_2'],
    ['--all-slots','--slot','horse_2'], ['--slot','horse_2','--slot','horse_4'],
    ['--expect-lib','store/07C7FEBA5157336B.glb'], ['--expect-lib',' store/07c7feba5157336b.glb'],
    ['--times','2,2'], ['--times','2,'], ['--times','NaN,8'], ['--times','2,181'],
    ['--channel','safari'], ['--name','arthur'], ['--action','start'], ['--world','commons'], ['--target','av-carousel'],
  ]) expect(() => api.parseOptions(args)).toThrow();
});
