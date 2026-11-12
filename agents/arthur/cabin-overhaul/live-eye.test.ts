import {test,expect} from 'bun:test';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('all five targets receive explicit unavailable evidence on a 503, without joining',async()=>{
  const path='./live-eye.ts';const m:any=await import(path);
  expect(typeof m.captureLiveEyes).toBe('function');
  const ids=['nx-town-row-cottage','nx-town-garden-cottage','nx-town-longhouse','nx-town-bunkhouse','nx-town-tower-house'];
  const expected=ids.map(id=>({id,kind:'thing',pos:[0,0,0],yaw:0,scale:1,lib:'store/1111111111111111.glb',comp:{}}));
  const server=Bun.serve({port:0,hostname:'127.0.0.1',fetch(req){return new URL(req.url).pathname==='/geom'?Response.json({world:'commons-next',entities:expected,mounts:{}}):new Response('no renderer',{status:503});}});
  const out=mkdtempSync(join(tmpdir(),'cabin-eye-unit-'));
  try {
    const r=await m.captureLiveEyes({cfg:{url:`ws://127.0.0.1:${server.port}/ws`},expected,outDir:out});
    expect(r.status).toBe('RENDERER_UNAVAILABLE');expect(r.targets.length).toBe(5);
    expect(r.frames.length).toBe(10);expect(r.frames.every((x:any)=>x.status==='NOT_CAPTURED_RENDERER_UNAVAILABLE')).toBe(true);
    expect(r.wireCounts.join).toBe(0);expect(r.wireCounts.verb).toBe(0);
    expect(JSON.parse(readFileSync(join(out,'manifest.json'),'utf8')).status).toBe(r.status);
  }finally{server.stop(true);rmSync(out,{recursive:true,force:true})}
});

test('a serving snapshot path captures actual HTTP PNG bytes via pose-only WS',async()=>{
  const path='./live-eye.ts';const m:any=await import(path);
  const ids=['nx-town-row-cottage','nx-town-garden-cottage','nx-town-longhouse','nx-town-bunkhouse','nx-town-tower-house'];
  const expected=ids.map(id=>({id,kind:'thing',pos:[0,0,0],yaw:0,scale:1,lib:'store/1111111111111111.glb',comp:{}}));
  const views=ids.flatMap(id=>['approach','interior'].map(name=>({id,name,bodyLocal:[0,0,3],lookLocal:[0,0,0]})));
  const sharp=(await import('sharp')).default;
  const png=await sharp({create:{width:32,height:32,channels:3,background:'#389259'}}).png().toBuffer();
  let joined=false;const wire:any[]=[];
  const server=Bun.serve({port:0,hostname:'127.0.0.1',fetch(req,s){const p=new URL(req.url).pathname;if(p==='/ws'&&s.upgrade(req))return;
    if(p==='/geom')return Response.json({world:'commons-next',entities:expected,mounts:{}});
    return joined?new Response(png,{headers:{'content-type':'image/png','cache-control':'no-store'}}):new Response('body missing',{status:404});
  },websocket:{message(ws,data){const v=JSON.parse(String(data));wire.push(v);if(v.type==='join'){joined=true;ws.send(JSON.stringify({type:'snapshot',world:'commons-next',you:v.id,throughSeq:1,state:{entities:Object.fromEntries(expected.map(e=>[e.id,e])),mounts:{}},entries:[]}))}},close(){joined=false}}});
  const out=mkdtempSync(join(tmpdir(),'cabin-eye-success-unit-'));
  try{
    const r=await m.captureLiveEyes({cfg:{url:`ws://127.0.0.1:${server.port}/ws`,avatar:'fixture.vrm'},expected,views,outDir:out,settleMs:1});
    expect(r.status).toBe('CAPTURED');expect(r.captured).toBe(10);
    expect(wire.every(x=>['join','pose'].includes(x.type))).toBe(true);
    expect(wire.some(x=>x.type==='join')).toBe(true);expect(wire.some(x=>x.type==='pose')).toBe(true);
    for(const f of r.frames)expect(readFileSync(join(out,f.file)).equals(png)).toBe(true);
  }finally{server.stop(true);rmSync(out,{recursive:true,force:true})}
});

test('the no-verbs encoder refuses any authored world message',async()=>{
  const path='./live-eye.ts';const m:any=await import(path);
  expect(typeof m.readOnlyWire).toBe('function');
  expect(()=>m.readOnlyWire({type:'verb',verb:'spawn',args:{id:'test'}})).toThrow();
  expect(()=>m.readOnlyWire({type:'lease',op:'claim',id:'test'})).toThrow();
  expect(()=>m.readOnlyWire({type:'pose',pose:{p:[0,0,0],yaw:0,speed:0,clip:'idle'}})).not.toThrow();
});

test('an absent real snapshot renderer is recorded, never promoted to an image',async()=>{
  const modulePath='./live-eye.ts';
  const mod:any=await import(modulePath).catch(()=>({}));
  expect(typeof mod.requestImage).toBe('function');
  const server=Bun.serve({port:0,hostname:'127.0.0.1',fetch:()=>new Response('no renderer is currently serving world "fixture"',{status:503})});
  try {
    const r=await mod.requestImage(`http://127.0.0.1:${server.port}`,'fixture-body');
    expect(r.status).toBe('RENDERER_UNAVAILABLE');
    expect(r.httpStatus).toBe(503);
    expect(r.png).toBeUndefined();
    expect(r.request.world).toBe('commons-next');
  }finally{server.stop(true)}
});
