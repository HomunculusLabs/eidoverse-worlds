import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as installer from './place';
import { foldEntry, emptyState } from '../../../shared/fold.js';
import { BUILDER_ID, placementPlan } from './placement-plan';
const api:any=installer;
const delay=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
// Synthetic protocol fixtures over real loopback sockets. Never contacts a world.
async function wireFixture(onMessage:(ws:any,m:any,fixture:any)=>void, initial=emptyState(), tail:any[]=[]) {
  const fixture:any={messages:[],state:structuredClone(initial),seq:tail.at(-1)?.seq??0};
  fixture.log=(ws:any,verb:string,args:any,actor='arthur-moonmoth-builder')=>{
    const entry={seq:++fixture.seq,ts:Date.now(),actor,verb,args};
    foldEntry(fixture.state,entry);ws.send(JSON.stringify({type:'log',entry}));return entry;
  };
  const server=Bun.serve({hostname:'127.0.0.1',port:0,
    fetch(req,server){if(server.upgrade(req))return;return new Response('fixture only',{status:404});},
    websocket:{
      open(ws){fixture.peer=ws;},
      message(ws,raw){
        const m=JSON.parse(String(raw));fixture.messages.push(m);
        if(m.type==='join') ws.send(JSON.stringify({type:'snapshot',world:'commons-next',you:m.id,state:fixture.state,entries:tail,throughSeq:0}));
        else onMessage(ws,m,fixture);
      },
      close(){fixture.closed=true;},
    },
  });
  fixture.url=`ws://127.0.0.1:${server.port}/ws`;
  fixture.stop=()=>server.stop(true);
  return fixture;
}
async function connectFixture(f:any, options:any={}) {
  expect(api.openWorldConnection).toBeFunction();
  return api.openWorldConnection({}, {url:f.url,snapshotTimeoutMs:200,echoTimeoutMs:200,debugTimeoutMs:200,...options});
}
test('wire installer folds authoritative log echoes before the next verb',async()=>{
  const f=await wireFixture((ws,m,f)=>{if(m.type==='verb')f.log(ws,m.verb,m.args);});
  let c:any;
  try {
    c=await connectFixture(f);
    const desired=api.desiredContract(contract,model);
    for(const [verb,args] of placementPlan(c.state,desired)) {
      await c.send(verb,args);
      expect(placementPlan(c.state,desired).some(([v,a])=>v===verb && JSON.stringify(a)===JSON.stringify(args))).toBe(false);
    }
    expect(placementPlan(c.state,desired)).toEqual([]);
  } finally {await c?.close();await f.stop();}
});
test('join preserves current snapshot without replaying its already-applied mount/remove tail',async()=>{
  const current=emptyState();
  current.entities.carrier={lib:'fixture',pos:[10,0,0],yaw:0,scale:1,actor:'fixture',ts:0};
  current.entities.cargo={lib:'fixture',pos:[0,0,0],yaw:0,scale:1,actor:'fixture',ts:0};
  const tail=[
    {seq:10,ts:10,actor:'fixture',verb:'mount',args:{id:'cargo',to:'carrier',offset:[1,0,0]}},
    {seq:11,ts:11,actor:'fixture',verb:'remove',args:{id:'carrier'}},
  ];
  for(const entry of tail)foldEntry(current,entry);
  expect(current.entities.cargo.parent).toBeUndefined();
  const f=await wireFixture((ws,m,f)=>f.log(ws,m.verb,m.args),current,tail);
  let c:any;
  try {
    c=await connectFixture(f);
    expect(c.state).toEqual(current);
    await c.send('spawn',{id:'later',lib:'fixture'});
    expect(c.state).toEqual(f.state);
    expect(f.seq).toBe(12);
  } finally {await c?.close();await f.stop();}
});
test('send requires a bounded exact echo, never an unrelated log or legacy entry',async()=>{
  for(const mismatch of ['silence','actor','args','verb','entry']) {
    const f=await wireFixture((ws,m,f)=>{
      if(m.type!=='verb'||mismatch==='silence')return;
      const entry={seq:++f.seq,ts:Date.now(),actor:mismatch==='actor'?'someone-else':'arthur-moonmoth-builder',
        verb:mismatch==='verb'?'place':m.verb,args:mismatch==='args'?{...m.args,lib:'wrong'}:m.args};
      ws.send(JSON.stringify({type:mismatch==='entry'?'entry':'log',entry}));
    });
    let c:any;
    try {
      c=await connectFixture(f,{echoTimeoutMs:40});
      await expect(c.send('spawn',{id:'nx-moonmoth-001',lib:'test'})).rejects.toThrow(/echo timeout/);
      await delay(15);expect(f.closed).toBe(true);
      await expect(c.send('comp',{})).rejects.toThrow();
      expect(f.messages.filter((m:any)=>m.type==='verb')).toHaveLength(1);
    } finally {await c?.close();await f.stop();}
  }
});
test('send waits past the old fixed sleep for the exact authoritative echo',async()=>{
  let timer:any;
  const f=await wireFixture((ws,m,f)=>{timer=setTimeout(()=>f.log(ws,m.verb,m.args),850);});
  let c:any;
  try {
    c=await connectFixture(f,{echoTimeoutMs:1400});
    await c.send('spawn',{id:'nx-moonmoth-001',lib:'test'});
    expect(c.state.entities['nx-moonmoth-001']?.lib).toBe('test');
  } finally {clearTimeout(timer);await c?.close();await f.stop();}
});
test('server refusal rejects outstanding work and closes the connection',async()=>{
  const f=await wireFixture((ws)=>ws.send(JSON.stringify({type:'error',error:'denied fixture'})));
  let c:any;
  try {
    c=await connectFixture(f);
    await expect(c.send('comp',{id:'nx-moonmoth-001',type:'lock',data:true})).rejects.toThrow(/denied fixture/);
    await delay(15);expect(f.closed).toBe(true);
  } finally {await c?.close();await f.stop();}
});
test('full remaining-plan guard refuses loss of a previously accepted comp before another verb',async()=>{
  const desired=api.desiredContract(contract,model);
  const initial=emptyState();
  for(const [verb,args] of placementPlan(initial,desired))foldEntry(initial,{verb,args,seq:1,ts:1,actor:BUILDER_ID});
  delete initial.entities[contract.id].comp.sockets;
  delete initial.entities[contract.id].comp['motion:moon_wing_left'];
  delete initial.behaviors[desired.behavior.id];
  const f=await wireFixture((ws,m,f)=>{
    f.log(ws,m.verb,m.args);
    if(m.args.type==='sockets')f.log(ws,'comp',{id:contract.id,type:'lock',data:null},'other-builder');
  },initial);
  let c:any;
  try {
    c=await connectFixture(f);expect(api.applyPlan).toBeFunction();
    await expect(api.applyPlan(c,desired,placementPlan(c.state,desired),{paceMs:10})).rejects.toThrow(/Concurrent target drift/);
    expect(f.messages.filter((m:any)=>m.type==='verb').map((m:any)=>m.args.type)).toEqual(['sockets']);
  } finally {await c?.close();await f.stop();}
});
test('served review pin is required, source-bound, exact and backed by the local served bytes',()=>{
  expect(api.reviewedServedSite).toBeFunction();
  const bytes=new TextEncoder().encode('offline optimized fixture');
  const servedSha256=createHash('sha256').update(bytes).digest('hex');
  const pin={sourceSha256:contract.sha256,servedSha256,lib:`store/${contract.sha256.slice(0,16)}.glb`,review:{offline:true}};
  expect(api.reviewedServedSite(contract,pin,bytes)).toEqual({...contract,glb:'agents/arthur/moon-moth/served.glb',sha256:servedSha256});
  for(const bad of [undefined,{}, {...pin,sourceSha256:'0'.repeat(64)}, {...pin,servedSha256:'A'.repeat(64)},
    {...pin,lib:'store/'+servedSha256.slice(0,16)+'.glb'}, {...pin,servedSha256:'0'.repeat(64)}]) {
    expect(()=>api.reviewedServedSite(contract,bad,bytes)).toThrow(/served/i);
  }
  expect(()=>api.reviewedServedSite(contract,pin,new Uint8Array())).toThrow(/served/i);
});
function storeFixture(existing=false, wrongAddress=false) {
  const source=new TextEncoder().encode('synthetic source GLB'),served=new TextEncoder().encode('synthetic optimized GLB');
  const sourceSHA=createHash('sha256').update(source).digest('hex'),servedSHA=createHash('sha256').update(served).digest('hex');
  const path=`store/${sourceSHA.slice(0,16)}.glb`, requests:any[]=[];
  let stored=existing;
  const server=Bun.serve({hostname:'127.0.0.1',port:0,async fetch(req){
    const url=new URL(req.url);requests.push({method:req.method,path:url.pathname});
    if(req.method==='POST') {
      requests.at(-1).bytes=new Uint8Array(await req.arrayBuffer());stored=true;
      return Response.json({path:wrongAddress?`store/${servedSHA.slice(0,16)}.glb`:path});
    }
    return stored?new Response(served):new Response('not stored',{status:404});
  }});
  return {source,served,sourceSHA,servedSHA,path,requests,base:`http://127.0.0.1:${server.port}`,stop:()=>server.stop(true)};
}
test('source uploads keep the source address while public GET must match the separately pinned served digest',async()=>{
  const f=storeFixture();
  try {
    expect(api.ensureStored).toBeFunction();
    const counts={uploads:0,uploadAttempts:0,lastUpload:0};
    await api.ensureStored(f.source,f.sourceSHA,f.path,{agentToken:'offline'},false,counts,{base:f.base,mode:'apply',servedSHA:f.servedSHA});
    expect(counts.uploads).toBe(1);
    expect(f.requests.map(r=>r.method)).toEqual(['GET','POST','GET']);
    expect(f.requests[1].bytes).toEqual(f.source);
  } finally {await f.stop();}
});
test('stage tolerates unreviewed optimized bytes without blessing a digest; apply refuses absent pins before HTTP',async()=>{
  for(const existing of [false,true]) {
    const f=storeFixture(existing);
    try {
      const counts={uploads:0,uploadAttempts:0,lastUpload:0};
      await api.ensureStored(f.source,f.sourceSHA,f.path,{agentToken:'offline'},false,counts,{base:f.base,mode:'stage'});
      expect(counts.uploads).toBe(existing?0:1);
      const requests=f.requests.length;
      await expect(api.ensureStored(f.source,f.sourceSHA,f.path,{},false,counts,{base:f.base,mode:'apply'})).rejects.toThrow(/served.*required/i);
      expect(f.requests.length).toBe(requests);
    } finally {await f.stop();}
  }
});
test('store refuses wrong upload addresses, source bytes, and unreviewed public digests',async()=>{
  for(const scenario of ['address','source','served']) {
    const f=storeFixture(scenario!=='address',scenario==='address');
    try {
      const counts={uploads:0,uploadAttempts:0,lastUpload:0};
      await expect(api.ensureStored(scenario==='source'?new Uint8Array():f.source,f.sourceSHA,f.path,{},false,counts,
        {base:f.base,mode:'apply',servedSHA:scenario==='served'?'0'.repeat(64):f.servedSHA})).rejects.toThrow(/mismatch|drift/);
      if(scenario==='source')expect(f.requests).toEqual([]);
    } finally {await f.stop();}
  }
});
async function installationFixture(mode:'stage'|'apply',missingPin=false) {
  const reports:any[]=[],records:any[]=[],spatial:any[]=[],reads:string[]=[];
  const glb=new Uint8Array(readFileSync(new URL('./moon-moth.glb',import.meta.url)));
  const script=new Uint8Array(readFileSync(new URL('./flight.js',import.meta.url)));
  const served=new TextEncoder().encode('synthetic served model; geometry preflight is a test seam');
  const pin={sourceSha256:contract.sha256,servedSha256:createHash('sha256').update(served).digest('hex'),lib:`store/${contract.sha256.slice(0,16)}.glb`};
  const json=(value:any)=>new TextEncoder().encode(JSON.stringify(value));
  const files:any={'./site-contract.json':json(contract),'./model-contract.json':json(model),'./moon-moth.glb':glb,'./flight.js':script,
    './served-contract.json':missingPin?undefined:json(pin),'./served.glb':served,'../config.json':json({url:api.BASE.replace('https:','wss:')+'/ws'})};
  const f=await wireFixture((ws,m,f)=>{
    if(m.type==='verb')f.log(ws,m.verb,m.args);
    if(m.type==='debug')ws.send(JSON.stringify({type:'debug',reqId:m.reqId,status:'running'}));
  });
  const requests:any[]=[];
  const http=Bun.serve({hostname:'127.0.0.1',port:0,fetch(req){
    requests.push({method:req.method,url:req.url});
    return new Response(new URL(req.url).pathname.includes('/scripts/')?script:served);
  }});
  const io={
    read(name:string){reads.push(name);if(!files[name])throw Error('missing offline fixture '+name);return files[name];},
    connect:()=>connectFixture(f),
    async spatial(site:any){spatial.push(structuredClone(site));return {verdict:'OFFLINE_FIXTURE_ONLY'};},
    store:(...args:any[])=>api.ensureStored(...args.slice(0,6),{...args[6],base:`http://127.0.0.1:${http.port}`}),
    report:(value:any)=>reports.push(value),record:(value:any)=>records.push(value),paceMs:0,
  };
  return {f,io,reports,records,requests,spatial,reads,pin,files,stop:async()=>{await f.stop();await http.stop(true);}};
}
test('apply refuses a missing served-contract before any connection, upload, or receipt',async()=>{
  const t=await installationFixture('apply',true);
  try {
    expect(api.runWithIO).toBeFunction();
    await expect(api.runWithIO('apply',t.io)).rejects.toThrow(/served/);
    expect(t.f.messages).toEqual([]);expect(t.requests).toEqual([]);expect(t.records).toEqual([]);
  } finally {await t.stop();}
});
test('apply uses pinned served geometry for final preflight, exact echoes, and an independent snapshot',async()=>{
  const t=await installationFixture('apply');
  try {
    expect(api.runWithIO).toBeFunction();
    await api.runWithIO('apply',t.io);
    expect(t.spatial.length).toBeGreaterThan(0);
    for(const site of t.spatial)expect(site).toEqual({...contract,glb:'agents/arthur/moon-moth/served.glb',sha256:t.pin.servedSha256});
    expect(t.f.messages.filter((m:any)=>m.type==='verb')).toHaveLength(6);
    expect(t.f.messages.filter((m:any)=>m.type==='join').length).toBeGreaterThanOrEqual(2);
    expect(t.records).toHaveLength(1);expect(t.records[0].verdict).toBe('PLACED_VERIFIED');
    expect(t.records[0].counts).toMatchObject({verbs:6,uploads:0});
    await api.runWithIO('apply',t.io);
    expect(t.records[1].counts.verbs).toBe(0);
  } finally {await t.stop();}
});
test('stage never emits verbs, requests debug, or records a placement even when target already exists',async()=>{
  for(const placed of [false,true]) {
    const t=await installationFixture('stage',true);
    try {
      expect(api.runWithIO).toBeFunction();
      if(placed)for(const [verb,args] of placementPlan(t.f.state,api.desiredContract(contract,model)))t.f.log({send(){}},verb,args);
      await api.runWithIO('stage',t.io);
      expect(t.f.messages.every((m:any)=>m.type==='join')).toBe(true);
      expect(t.records).toEqual([]);expect(t.reports.at(-1).mode).toBe('STAGED_ONLY');
      expect(t.reads).not.toContain('./served-contract.json');
    } finally {await t.stop();}
  }
});
const contract=JSON.parse(readFileSync(new URL('./site-contract.json',import.meta.url),'utf8'));
const model=JSON.parse(readFileSync(new URL('./model-contract.json',import.meta.url),'utf8'));
test('installer binds reviewed bytes, real seat and full wing bag and folds to an idempotent target',async()=>{
  const api=await import('./place.ts').catch(()=>null);
  expect(api?.desiredContract).toBeFunction();
  const desired=api!.desiredContract(contract,model);
  expect(desired.entity.lib).toBe('store/'+model.sha256.slice(0,16)+'.glb');
  expect(desired.entity.comp.sockets.seat).toEqual({pos:model.seat.socket,pose:'sitchair',yaw:0});
  expect(Object.keys(desired.entity.comp).sort()).toEqual(['lock','motion:moon_wing_left','motion:moon_wing_right','sockets']);
  expect(desired.behavior.caps).toEqual({verbs:['motion'],selfOnly:true});
  const st=emptyState();
  const plan=placementPlan(st,desired);
  expect(plan.length).toBe(6);
  plan.forEach(([verb,args],i)=>foldEntry(st,{verb,args,actor:BUILDER_ID,ts:i,seq:i}));
  expect(placementPlan(st,desired)).toEqual([]);
  expect(()=>api!.desiredContract({...contract,sha256:'0'.repeat(64)},model)).toThrow();
});
test('staging uploads without allowing world mutation and rejects ambiguous execution modes',async()=>{
  const api=await import('./place.ts');
  expect(api.parseMode).toBeFunction();
  expect(api.parseMode([])).toBe('dry');
  expect(api.parseMode(['--stage'])).toBe('stage');
  expect(api.parseMode(['--apply'])).toBe('apply');
  expect(()=>api.parseMode(['--apply','--stage'])).toThrow();
});
