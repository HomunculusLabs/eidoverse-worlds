import { test, expect } from 'bun:test';
import { BUILDER_ID, placementPlan } from './placement-plan';
const id='nx-moonmoth-001';
test('rejects legacy root motion, size and parent shadows without touching the live target',()=>{
  for(const extra of [{motion:{type:'spin'}},{motion:null},{size:2},{size:[1,1,1]},
    {parent:{to:'foreign'}},{parent:false},{parent:null}]) {
    const state={entities:{[id]:{...structuredClone(desired.entity),...extra}},behaviors:{}};
    const before=structuredClone(state);
    expect(()=>placementPlan(state,desired)).toThrow(/root|mounted/);
    expect(state).toEqual(before);
  }
});
const desired={entity:{lib:'store/0123456789abcdef.glb',pos:[-65,0,-57],yaw:0,scale:1,collide:'exact',comp:{sockets:{seat:{pos:[0,2.47,.18],pose:'sitchair',yaw:0}},lock:true}},behavior:{id:id+'-flight',src:'store/scripts/0123456789abcdef.js',attach:id,caps:{verbs:['motion'],selfOnly:true},knobs:{perch:[-65,0,-57],groundY:0,yaw:0}}};
test('new-only placement emits spawn, exact comps and scoped behavior; exact state reruns with zero verbs',async()=>{
  const api=await import('./placement-plan.ts').catch(()=>null);
  expect(api?.placementPlan).toBeFunction();
  const plan=api!.placementPlan({entities:{},behaviors:{}},desired);
  expect(plan.map((p:any)=>p[0])).toEqual(['spawn','comp','comp','behavior']);
  expect(plan[0][1]).toEqual({id,...Object.fromEntries(Object.entries(desired.entity).filter(([k])=>k!=='comp'))});
  expect(api!.placementPlan({entities:{[id]:desired.entity},behaviors:{[desired.behavior.id]:{...desired.behavior,author:BUILDER_ID}}},desired)).toEqual([]);
});
test('rejects other attached behavior IDs and client-runtime shadows while preserving approved binding kv',()=>{
  const bound={...desired.behavior,author:BUILDER_ID,ts:42,state:{flights:7}};
  const state={entities:{[id]:structuredClone(desired.entity)},behaviors:{[bound.id]:bound}};
  const before=structuredClone(state);
  expect(placementPlan(state,desired)).toEqual([]);
  expect(state).toEqual(before);
  for(const extra of [{runtime:'client'},{runtime:null}]) {
    expect(()=>placementPlan({...state,behaviors:{[bound.id]:{...bound,...extra}}},desired)).toThrow(/behavior/);
  }
  for(const runtime of [undefined,'client']) {
    expect(()=>placementPlan({...state,behaviors:{...state.behaviors,foreign:{src:bound.src,attach:id,runtime}}},desired)).toThrow(/attached behavior/);
    expect(()=>placementPlan({entities:{},behaviors:{foreign:{src:bound.src,attach:id,runtime}}},desired)).toThrow(/attached behavior/);
  }
  expect(placementPlan({...state,behaviors:{...state.behaviors,neighbor:{attach:'other'}}},desired)).toEqual([]);
});
test('fails closed on extra components, in-flight state, foreign identity and widened behavior permissions',async()=>{
  const {placementPlan}=await import('./placement-plan.ts');
  for(const extra of [{motion:{type:'path'}},{unexpected:true}]) {
    expect(()=>placementPlan({entities:{[id]:{...desired.entity,comp:{...desired.entity.comp,...extra}}},behaviors:{}},desired)).toThrow();
  }
  for(const field of ['pos','yaw','lib','scale']) {
    expect(()=>placementPlan({entities:{[id]:{...desired.entity,[field]:null}},behaviors:{}},desired)).toThrow();
  }
  expect(()=>placementPlan({},desired)).toThrow();
  expect(()=>placementPlan({entities:{},behaviors:{}},{...desired,behavior:{...desired.behavior,attach:'foreign'}})).toThrow();
  expect(()=>placementPlan({entities:{},behaviors:{}},{...desired,behavior:{...desired.behavior,caps:{verbs:['spawn'],selfOnly:false}}})).toThrow();
});
test('binding author must match the approved installer identity, including on an otherwise exact target',()=>{
  for(const author of [undefined,null,'','different-builder']) {
    const bound={...desired.behavior,...(author===undefined?{}:{author})};
    const state={entities:{[id]:structuredClone(desired.entity)},behaviors:{[bound.id]:bound}};
    const before=structuredClone(state);
    expect(()=>placementPlan(state,desired)).toThrow(/author/);
    expect(state).toEqual(before);
  }
  const owned={...desired.behavior,author:'arthur-moonmoth-builder',ts:42,state:{flights:7}};
  expect(placementPlan({entities:{[id]:desired.entity},behaviors:{[owned.id]:owned}},desired)).toEqual([]);
});
