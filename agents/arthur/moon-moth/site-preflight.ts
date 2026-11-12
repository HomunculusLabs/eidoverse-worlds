/** Read-only Moon Moth siting. No upload, verb, placement, or commit code. */
import assert from 'node:assert/strict';
type V3 = [number, number, number];
type Bounds = { min: V3; max: V3 };
type Entity = { id: string; kind: string; pos: V3; yaw: number; scale: number; bbox?: Bounds; lib?: string; parent?: unknown; comp?: Record<string, any> };
export function circleGap(x: number, z: number, radius: number, e: Entity): number {
  const b = e.bbox!; const s = e.scale; const c = Math.cos(e.yaw), t = Math.sin(e.yaw);
  const cx = (b.min[0] + b.max[0])*s/2, cz = (b.min[2] + b.max[2])*s/2;
  const dx = x - (e.pos[0]+cx*c+cz*t), dz = z - (e.pos[2]-cx*t+cz*c);
  const qx = Math.abs(dx*c-dz*t) - (b.max[0]-b.min[0])*s/2;
  const qz = Math.abs(dx*t+dz*c) - (b.max[2]-b.min[2])*s/2;
  return Math.hypot(Math.max(qx,0), Math.max(qz,0)) + Math.min(Math.max(qx,qz),0) - radius;
}
type Matrix = number[];
const IDENTITY = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
function requireThat(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(message); }
function finite(v: unknown): v is number { return typeof v === 'number' && Number.isFinite(v); }
function vector(v: any): asserts v is V3 { requireThat(Array.isArray(v) && v.length === 3 && v.every(finite), 'invalid finite vec3'); }
function bounds(b: any): asserts b is Bounds { requireThat(b && typeof b === 'object', 'missing bbox'); vector(b.min); vector(b.max); requireThat(b.min.every((v:number,i:number) => v<=b.max[i]), 'reversed bbox'); }
function cloudBounds(points: V3[]): Bounds {
  requireThat(points.length > 0, 'empty vertex cloud');
  const out: Bounds = {min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
  for (const p of points) { vector(p); for(let i=0;i<3;i++) {out.min[i]=Math.min(out.min[i],p[i]);out.max[i]=Math.max(out.max[i],p[i]);} }
  return out;
}
function corners(b: Bounds): V3[] { return b.min.flatMap((_,i)=>i===0 ? [b.min[0],b.max[0]].flatMap(x=>[b.min[1],b.max[1]].flatMap(y=>[b.min[2],b.max[2]].map(z=>[x,y,z] as V3))) : []); }
function transform(p: V3, m: Matrix): V3 { return [0,1,2].map(i=>m[i]*p[0]+m[i+4]*p[1]+m[i+8]*p[2]+m[i+12]) as V3; }
export function sweptSpin(points: V3[], matrix: Matrix, axis: V3, pivot: V3, angleLimit=Math.PI): Bounds {
  vector(axis); vector(pivot); const n=Math.hypot(...axis); requireThat(n>0,'zero motion axis');
  const a=axis.map(v=>v/n); const out:V3[]=[];
  for(const p of points) {
    const d=p.map((v,i)=>v-pivot[i]), dot=d.reduce((v,x,i)=>v+x*a[i],0);
    const center=transform(pivot.map((v,i)=>v+dot*a[i]) as V3,matrix);
    if(angleLimit<Math.PI) {
      requireThat(finite(angleLimit)&&angleLimit>=0,'invalid angle bound');
      const perp=d.map((v,i)=>v-dot*a[i]),cross=[a[1]*d[2]-a[2]*d[1],a[2]*d[0]-a[0]*d[2],a[0]*d[1]-a[1]*d[0]];
      const lo:V3=[0,0,0],hi:V3=[0,0,0];
      for(let i=0;i<3;i++) {
        const row=[matrix[i],matrix[i+4],matrix[i+8]], A=row.reduce((v,x,j)=>v+x*perp[j],0),B=row.reduce((v,x,j)=>v+x*cross[j],0);
        const ts=[-angleLimit,angleLimit];
        for(let k=-2;k<=2;k++){const t=Math.atan2(B,A)+k*Math.PI;if(Math.abs(t)<=angleLimit)ts.push(t);}
        const vals=ts.map(t=>center[i]+A*Math.cos(t)+B*Math.sin(t));lo[i]=Math.min(...vals);hi[i]=Math.max(...vals);
      }
      out.push(lo,hi);continue;
    }
    const radius=Math.hypot(...d.map((v,i)=>v-dot*a[i]));
    const ext=[0,1,2].map(i=>{
      const row=[matrix[i],matrix[i+4],matrix[i+8]], along=row.reduce((v,x,j)=>v+x*a[j],0);
      return radius*Math.sqrt(Math.max(0,row.reduce((v,x)=>v+x*x,0)-along*along));
    });
    out.push(center.map((v,i)=>v-ext[i]) as V3,center.map((v,i)=>v+ext[i]) as V3);
  }
  return cloudBounds(out);
}
function axisOf(m: any, fallback: V3): V3 {
  const a=m.axis ?? fallback;
  if(typeof a === 'string') { requireThat(['x','y','z'].includes(a),'unknown axis'); return [a==='x'?1:0,a==='y'?1:0,a==='z'?1:0]; }
  vector(a); requireThat(Math.hypot(...a)>0,'zero axis'); return a;
}
function motions(comp:Record<string,any>) { return Object.entries(comp).filter(([k,v])=>(k==='motion'||k.startsWith('motion:')) && v?.type!=null); }
export async function decode(bytes: Uint8Array, comp: Record<string,any> = {}, stats?: {radius: number}): Promise<Bounds> {
  const { NodeIO } = await import('@gltf-transform/core');
  const { ALL_EXTENSIONS } = await import('@gltf-transform/extensions');
  const draco = (await import('draco3dgltf')).default;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule()});
  const doc = await io.readBinary(bytes), root=doc.getRoot();
  requireThat(root.listScenes().length===1,'multiple/absent GLB scenes');
  requireThat(root.listAnimations().length===0 && root.listSkins().length===0,'native animation/skin requires separate swept proof');
  const ms=new Map<string,any>();
  for(const [key,m] of motions(comp)) {
    const name=key==='motion'?m.part:key.slice(7);
    requireThat(typeof name==='string' && name.length>0,'whole-entity motion unsupported in mesh decoder');
    requireThat(!ms.has(name),'duplicate part motion'); ms.set(name,m);
  }
  const hits=new Set<string>();
  function walk(node:any):V3[] {
    let points:V3[]=[];
    for(const prim of node.getMesh()?.listPrimitives() ?? []) {
      requireThat(prim.listTargets().length===0,'morph geometry unsupported');
      const p=prim.getAttribute('POSITION'); requireThat(p && p.getElementSize()===3,'missing vec3 POSITION');
      for(let i=0;i<p.getCount();i++) points.push(p.getElement(i,[]) as V3);
    }
    for(const child of node.listChildren()) points=points.concat(walk(child));
    if(!points.length) return [];
    const matrix=Array.from(node.getMatrix()) as number[], m=ms.get(node.getName());
    if(!m) return points.map(p=>transform(p,matrix));
    requireThat(!hits.has(node.getName()),'duplicate named motion target'); hits.add(node.getName());
    requireThat(node.getScale().every((s:number)=>Math.abs(s-1)<1e-9),'scaled motion node requires engine-specific pivot proof');
    if(m.type==='spin'||m.type==='pendulum') {
      const limit=m.type==='pendulum' && m.damp===0 && finite(m.amp) ? Math.abs(m.amp) : Math.PI;
      return points.flatMap(p=>corners(sweptSpin([p],matrix,axisOf(m,m.type==='spin'?[0,1,0]:[1,0,0]),m.pivot??[0,0,0],limit)));
    }
    if(m.type==='bob') {
      const a=axisOf(m,[0,1,0]), n=Math.hypot(...a), amp=m.amp??m.amplitude??0.3;
      requireThat(finite(amp),'invalid bob amplitude');
      const b=cloudBounds(points.map(p=>transform(p,matrix)));
      for(let i=0;i<3;i++){const v=Math.abs(amp*a[i]/n);b.min[i]-=v;b.max[i]+=v;} return corners(b);
    }
    if(m.type==='path') {
      requireThat(m.face===false && Array.isArray(m.points) && m.points.length>=2,'path must explicitly disable face and have points');
      const pb=cloudBounds(m.points); matrix[12]=matrix[13]=matrix[14]=0;
      const b=cloudBounds(points.map(p=>transform(p,matrix)));
      for(let i=0;i<3;i++){b.min[i]+=pb.min[i];b.max[i]+=pb.max[i];} return corners(b);
    }
    throw new Error(`unsupported motion ${m.type}`);
  }
  let all:V3[]=[];
  for(const node of root.listScenes()[0].listChildren()) all=all.concat(walk(node));
  requireThat(hits.size===ms.size,'missing/unreachable named motion target');
  if(stats) stats.radius=all.reduce((r,p)=>Math.max(r,Math.hypot(p[0],p[2])),0);
  return cloudBounds(all);
}
const WORLD='commons-next', BASE='https://eidoverse.billding.dev', TARGET='nx-moonmoth-001';
const GAP=1.4, PAD=0.002, RING=[70,100], AXIS_RESERVE=3;
export function validateCensus(data:any): Entity[] {
  requireThat(data?.world===WORLD && Array.isArray(data.entities) && data.entities.length>=294,'census incomplete/wrong world (<294 baseline)');
  if(data.count!==undefined) requireThat(data.count===data.entities.length,'census count mismatch');
  const seen=new Set<string>();
  for(const e of data.entities) {
    requireThat(typeof e.id==='string' && !seen.has(e.id),'duplicate/malformed entity id'); seen.add(e.id);
    requireThat(e.id!==TARGET,'target already exists: NEW-only preflight refuses');
    vector(e.pos); requireThat(finite(e.yaw)&&finite(e.scale)&&e.scale>0,'invalid entity transform');
    requireThat(e.parent==null,'mounted entity requires exact parent-chain proof');
    requireThat(e.comp && typeof e.comp==='object'&&!Array.isArray(e.comp),'missing component bag');
    if(e.kind==='light') { requireThat(!e.lib&&!e.bbox,'light has unexplained geometry'); continue; }
    requireThat(e.kind==='thing' && typeof e.lib==='string' && /^store\/[0-9a-f]{16}\.glb$/.test(e.lib),'unsupported/missing geometry library');
    bounds(e.bbox); requireThat(e.bbox.max.some((v:number,i:number)=>v>e.bbox.min[i]),'zero geometry bounds');
  }
  requireThat(data.entities.filter((e:Entity)=>e.kind==='thing').length>=256,'census bbox coverage below baseline');
  return data.entities;
}
export function siteReport(entities:Entity[],x:number,z:number,radius:number):any {
  requireThat([x,z,radius].every(finite)&&radius>0,'invalid site coordinates/radius');
  const r=Math.hypot(x,z), rim=[r-radius,r+radius], axisGap=Math.min(Math.abs(x),Math.abs(z))-radius;
  const near=entities.filter(e=>e.kind!=='light').map(e=>({id:e.id,gap:circleGap(x,z,radius,e)})).sort((a,b)=>a.gap-b.gap);
  const high=entities.filter(e=>e.bbox&&e.bbox.max[1]*e.scale+e.pos[1]>=7).map(e=>({id:e.id,height:e.bbox!.max[1]*e.scale+e.pos[1],gap:circleGap(x,z,radius,e)})).sort((a,b)=>a.gap-b.gap);
  const failures:string[]=[];
  if(rim[0]<RING[0] || rim[1]>RING[1]) failures.push('CITY-PLAN district ring: full envelope must lie within r70..100');
  if(axisGap<AXIS_RESERVE) failures.push('cardinal walking-axis reserve <3m');
  if(near.some(n=>!finite(n.gap)||n.gap<GAP)) failures.push('solid/ground/network clearance <1.4m');
  return {ok:!failures.length,x,z,radius,plazaDistance:r,mathAzimuthDegrees:Math.atan2(z,x)*180/Math.PI,rim,axisGap,nearest:near.slice(0,8),nearestHigh:high.slice(0,5),failures};
}
export function checkContract(c:any) {
  requireThat(c?.id===TARGET && c.world===WORLD && typeof c.glb==='string','invalid final contract id/world/glb');
  requireThat(typeof c.sha256==='string' && /^[0-9a-f]{64}$/.test(c.sha256),'sha256 must be full lowercase hex, never repaired');
  vector(c.pos); requireThat(c.scale===1 && finite(c.yaw) && Math.abs(c.yaw)<=Math.PI*2 && c.yawUnit==='radians','contract requires unit scale and radians');
  requireThat(finite(c.radius)&&c.radius>=6.5,'contract radius must be >=6.5m');
  requireThat(finite(c.groundY),'finite groundY required for actual flight contract');
  requireThat(c.partMotions && typeof c.partMotions==='object'&&!Array.isArray(c.partMotions),'partMotions required (explicit empty bag allowed)');
  requireThat(Object.keys(c.partMotions).every(k=>k.startsWith('motion:')),'partMotions contains non-part/whole motion');
  bounds(c.riderEnvelope);
  requireThat(corners(c.riderEnvelope).every(p=>Math.hypot(p[0],p[2])<=c.radius),'rider exceeds launch cylinder');
  return c;
}
async function selftest() {
  const limited=sweptSpin([[2,0,0]],IDENTITY,[0,0,1],[0,0,0],0.22);
  assert.ok(Math.abs(limited.min[0]-2*Math.cos(.22))<1e-9 && Math.abs(limited.max[1]-2*Math.sin(.22))<1e-9,'finite pendulum interval, not invented full spin');
  assert.throws(()=>checkContract({}),/contract/,'incomplete final contract must not pass');
  const valid={id:TARGET,world:WORLD,glb:'/test.glb',sha256:'a'.repeat(64),pos:[-91,0.04,13.4],yaw:0,yawUnit:'radians',scale:1,radius:6.6,partMotions:{},groundY:0,riderEnvelope:{min:[-1,0,-1],max:[1,4,1]}};
  assert.deepEqual(checkContract(valid),valid);
  assert.throws(()=>checkContract({...valid,sha256:'bad'}),/sha256/);
  assert.throws(()=>checkContract({...valid,groundY:NaN}),/groundY/);
  assert.throws(()=>validateCensus({world:'commons-next',entities:[]}),/census/, 'empty scene fails closed');
  assert.equal(siteReport([],45,0,6.6).ok,false,'CITY-PLAN processional band is closed');
  assert.equal(siteReport([],113,0,6.6).ok,false,'no invented outer-ring exception');
  assert.equal(siteReport([],80,0,6.6).ok,false,'reserve cardinal walking axes');
  assert.equal(siteReport([],80,20,6.6).ok,true,'lawful empty district control');
  const { Document, NodeIO } = await import('@gltf-transform/core');
  const doc = new Document(), buffer=doc.createBuffer();
  const pos=doc.createAccessor().setType('VEC3').setArray(new Float32Array([2,3,0, 1,3,0, 1,4,0])).setBuffer(buffer);
  const mesh=doc.createMesh().addPrimitive(doc.createPrimitive().setAttribute('POSITION',pos));
  const part=doc.createNode('screw').setMesh(mesh).setTranslation([10,0,0]);
  doc.createScene().addChild(part);
  const bytes=await new NodeIO().writeBinary(doc);
  const stats={radius:NaN};
  await decode(bytes,{},stats);
  assert.ok(Math.abs(stats.radius-12)<1e-9,'decoded vertex radius does not use invented bbox corners');
  const decoded=await decode(bytes, {'motion:screw':{type:'spin',axis:'y'}});
  assert.deepEqual(decoded, {min:[8,3,-2],max:[12,4,2]}, 'decode motion target in part local frame through parent transform');
  const spin = sweptSpin([[2,3,0]], IDENTITY, [0,1,0], [0,0,0]);
  assert.deepEqual(spin, {min:[-2,3,-2],max:[2,3,2]}, 'all-angle sweep, not rest bbox');
  const e: Entity = { id: 'offset', kind: 'thing', pos: [10,0,20], yaw: Math.PI/2, scale: 2, bbox: { min:[1,0,3],max:[3,2,5] } };
  // Local center (2,4), scaled and rotated, becomes world (18,16), not (14,28).
  assert.ok(Math.abs(circleGap(18,10,1,e) - 3) < 1e-9, 'rotate local bbox center, scale, and use world z');
  assert.equal(circleGap(18,13,1,e), 0, 'touching');
  assert.ok(circleGap(18,16,1,e) < 0, 'overlap');
  console.log('SELFTEST PASS');
}
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
const sha=(b:Uint8Array|string)=>createHash('sha256').update(b).digest('hex');
function canonical(v:any):any { if(Array.isArray(v)) return v.map(canonical); if(v&&typeof v==='object') return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])); return v; }
async function getJSON(url:string) {
  const res=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(20_000)}), text=await res.text();
  requireThat(res.ok,`GET failed HTTP ${res.status} ${res.headers.get('content-type')}`);
  try { return JSON.parse(text); } catch { throw new Error(`invalid JSON from ${new URL(url).pathname}; HTTP ${res.status}`); }
}
async function census() {
  const raw=await getJSON(`${BASE}/geom?world=${WORLD}`), es=validateCensus(raw);
  return {entities:es,digest:sha(JSON.stringify(canonical([...es].sort((a,b)=>a.id.localeCompare(b.id))))),at:Date.now()};
}
async function liveScene() {
  const snap=await census(), es:Entity[]=structuredClone(snap.entities), dynamic:any[]=[];
  for(const e of es) {
    if(!e.bbox) continue;
    if(motions(e.comp!).length) {
      const res=await fetch(`${BASE}/library/${e.lib}`,{signal:AbortSignal.timeout(20_000)});
      requireThat(res.ok,`motion GLB read failed ${e.id}: HTTP ${res.status}`);
      const bytes=new Uint8Array(await res.arrayBuffer());
      // routes.ts:601..607 serves optimized store-min shadows at original lib URLs.
      // Bind the ACTUAL served bytes separately; never equate their SHA to original lib.
      requireThat(new TextDecoder().decode(bytes.slice(0,4))==='glTF',`non-GLB motion response ${e.id}`);
      const bb=await decode(bytes,e.comp), old=e.bbox;
      e.bbox={min:old.min.map((v,i)=>Math.min(v,bb.min[i])) as V3,max:old.max.map((v,i)=>Math.max(v,bb.max[i])) as V3};
      dynamic.push({id:e.id,lib:e.lib,servedSha256:sha(bytes),keys:motions(e.comp!).map(([k])=>k),bbox:e.bbox});
    }
    // /geom rounds to mm. Inflate each local face by 2mm; no entity gets exempted.
    e.bbox={min:e.bbox.min.map(v=>v-PAD) as V3,max:e.bbox.max.map(v=>v+PAD) as V3};
  }
  return {...snap,entities:es,dynamic};
}
async function terrain(x:number,z:number,radius:number) {
  // The physics module logs one startup banner; preserve machine-readable stdout.
  const originalLog=console.log;console.log=(...args:any[])=>console.error(...args);
  try {
  const { WorldAgent }=await import('../../../mcpl/agent.ts');
  const cfg=JSON.parse(readFileSync(new URL('../config.json',import.meta.url),'utf8'));
  const oldToken=process.env.WORLD_TOKEN; process.env.WORLD_TOKEN=cfg.joinToken;
  const agent=new WorldAgent({url:'wss://eidoverse.billding.dev/ws',name:'arthur-moonmoth-terrain',world:WORLD,avatar:cfg.avatar,agentToken:cfg.agentToken});
  try {
    await agent.connect();
    const deadline=Date.now()+12_000;
    while(!(agent as any).terrain && Date.now()<deadline) await sleep(50);
    requireThat((agent as any).terrain && agent.joined,'terrain never loaded (heightAt fallback zero is forbidden)');
    const samples:{x:number,z:number,h:number}[]=[];
    const add=(dx:number,dz:number)=>{const h=agent.heightAt(x+dx,z+dz);requireThat(finite(h),'nonfinite terrain');samples.push({x:x+dx,z:z+dz,h});};
    add(0,0);
    for(let dx=-Math.ceil(radius);dx<=Math.ceil(radius);dx++) for(let dz=-Math.ceil(radius);dz<=Math.ceil(radius);dz++) if(Math.hypot(dx,dz)<=radius) add(dx,dz);
    for(let i=0;i<32;i++){const a=i*2*Math.PI/32;add(radius*Math.cos(a),radius*Math.sin(a));}
    const low=samples.reduce((a,b)=>a.h<b.h?a:b),high=samples.reduce((a,b)=>a.h>b.h?a:b);
    return {source:'WorldAgent.heightAt; terrain readiness explicitly checked',center:samples[0],low,high,spread:high.h-low.h,sampleCount:samples.length,gridStep:1,perimeterSamples:32};
  } finally {agent.close();if(oldToken===undefined)delete process.env.WORLD_TOKEN;else process.env.WORLD_TOKEN=oldToken;}
  } finally {console.log=originalLog;}
}
async function stable(snap:{digest:string,at:number,dynamic?:any[]}) {
  await Promise.all((snap.dynamic??[]).map(async d=>{
    const res=await fetch(`${BASE}/library/${d.lib}`,{cache:'no-store',signal:AbortSignal.timeout(20_000)});
    requireThat(res.ok && sha(new Uint8Array(await res.arrayBuffer()))===d.servedSha256,`served motion bytes changed ${d.id}`);
  }));
  const after=await census();
  requireThat(after.digest===snap.digest,'scene changed during preflight; rerun fresh (no cached certificate)');
  requireThat(Date.now()-snap.at<120_000,'preflight snapshot older than120s; rerun');
  return {sceneSha256:after.digest,censusCount:after.entities.length,verifiedAt:new Date(after.at).toISOString()};
}
export async function preflight(contract:any) {
  const c=checkContract(contract), path=resolve(c.glb), bytes=readFileSync(path);
  requireThat(sha(bytes)===c.sha256,'target GLB sha256 drift');
  const restStats={radius:0},sweepStats={radius:0};
  const rest=await decode(bytes,{},restStats), swept=await decode(bytes,c.partMotions,sweepStats);
  requireThat(Math.max(restStats.radius,sweepStats.radius)+PAD<=c.radius,'decoded full-sweep radius exceeds declared cylinder');
  const snap=await liveScene(), report=siteReport(snap.entities,c.pos[0],c.pos[2],c.radius);
  requireThat(report.ok,JSON.stringify(report));
  const land=await terrain(c.pos[0],c.pos[2],c.radius);
  requireThat(Math.abs(c.groundY-land.center.h)<0.001,'flight groundY differs from fresh terrain');
  requireThat(land.spread<=0.08,'terrain spread over80mm; bespoke dock fit required');
  requireThat(c.pos[1]+Math.min(rest.min[1],swept.min[1])>=land.high.h-0.005,'articulated geometry may bury into sampled terrain');
  requireThat(c.pos[1]+rest.min[1]<=land.low.h+0.10,'rest geometry may float >100mm above terrain');
  const flightSource=new URL('./flight-contract.ts',import.meta.url),flightSHA=sha(readFileSync(flightSource));
  const {rootFlightBounds,FLIGHT_POLICY}=await import('./flight-contract.ts');
  requireThat(FLIGHT_POLICY.radius===6&&FLIGHT_POLICY.altitudeAGL===22,'flight policy changed; re-audit path envelope');
  const rootBounds=rootFlightBounds({perch:c.pos,groundY:c.groundY,yaw:c.yaw});
  const closestX=Math.max(rootBounds.min[0],Math.min(0,rootBounds.max[0])),closestZ=Math.max(rootBounds.min[2],Math.min(0,rootBounds.max[2]));
  const flightRim=[Math.hypot(closestX,closestZ)-c.radius,Math.max(...[rootBounds.min[0],rootBounds.max[0]].flatMap(x=>[rootBounds.min[2],rootBounds.max[2]].map(z=>Math.hypot(x,z))))+c.radius];
  requireThat(flightRim[0]>=70&&flightRim[1]<=100,'actual flight swept footprint breaches district band');
  const highest=snap.entities.filter(e=>e.bbox).map(e=>({id:e.id,y:e.pos[1]+e.bbox!.max[1]*e.scale})).sort((a,b)=>b.y-a.y)[0];
  const cruiseBottom=c.groundY+22+Math.min(swept.min[1],c.riderEnvelope.min[1]);
  requireThat(cruiseBottom-highest.y>=GAP,'cruise not globally above all geometry by1.4m; exact path narrow phase required');
  const cruise={rootBounds,flightRim,cruiseBottom,highest,minimumVerticalGap:cruiseBottom-highest.y,flightContractSha256:flightSHA};
  const epoch=await stable(snap);requireThat(sha(readFileSync(path))===c.sha256,'target bytes changed during preflight');
  requireThat(sha(readFileSync(flightSource))===flightSHA,'flight contract changed during preflight');
  return {verdict:'SPATIAL_PASS',scope:'DOCK_VERTICAL_LIFT_AND_ACTUAL_ELEVATED_CIRCUIT',spatialOnly:true,id:TARGET,world:WORLD,pos:c.pos,yaw:c.yaw,scale:c.scale,sha256:c.sha256,contractSha256:sha(JSON.stringify(canonical(c))),...epoch,rest,swept,restRadius:restStats.radius,sweptRadius:sweepStats.radius,site:report,terrain:land,cruise,clearColumn:'all elevations',dynamicGeometry:snap.dynamic,pending:['flight.js path parity with pinned flight-contract.ts','rider/socket and dismount fit','visual/approach review; no walk or visibility PASS implied']};
}
async function main() {
  const a=process.argv.slice(2);
  if(a[0]==='--self-test'&&a.length===1){await selftest();return;}
  if(a[0]==='--check'&&a.length===2){console.log(JSON.stringify(await preflight(JSON.parse(readFileSync(a[1],'utf8'))),null,2));return;}
  if(a[0]==='--search'&&a.length<=2) {
    const radius=a[1]===undefined?6.6:Number(a[1]);requireThat(finite(radius)&&radius>=6.5,'search radius >=6.5');
    const snap=await liveScene(), rows:any[]=[];
    for(let x=-94;x<=94;x++)for(let z=-94;z<=94;z++) {
      const r=Math.hypot(x,z);if(r-radius<70||r+radius>100||Math.min(Math.abs(x),Math.abs(z))-radius<3)continue;
      const row=siteReport(snap.entities,x,z,radius);if(row.ok)rows.push(row);
    }
    rows.sort((a,b)=>a.plazaDistance-b.plazaDistance);
    console.log(JSON.stringify({verdict:'SEARCH_ONLY_NOT_A_PLACEMENT_PASS',...(await stable(snap)),radius,passingGridSites:rows.length,gridStep:1,closest:rows.slice(0,8),widest:[...rows].sort((a,b)=>b.nearest[0].gap-a.nearest[0].gap).slice(0,3),dynamicGeometry:snap.dynamic},null,2));return;
  }
  if(a[0]==='--site'&&a.length===4) {
    const [x,z,radius]=a.slice(1).map(Number);const snap=await liveScene(),site=siteReport(snap.entities,x,z,radius);
    requireThat(radius>=6.5 && site.ok,JSON.stringify(site));const land=await terrain(x,z,radius);
    requireThat(land.spread<=0.08,'terrain spread over80mm');
    console.log(JSON.stringify({verdict:'PROVISIONAL_SITE_ONLY_FINAL_GLB_REQUIRED',...(await stable(snap)),site,terrain:land,dynamicGeometry:snap.dynamic},null,2));process.exitCode=2;return;
  }
  throw new Error('Usage: --self-test | --search [radius>=6.5] | --site X Z RADIUS (exit2: provisional) | --check final-contract.json');
}
if(import.meta.main) main().catch(err=>{console.error(JSON.stringify({verdict:'FAIL_CLOSED',error:String(err.message??err)}));process.exitCode=1;});
