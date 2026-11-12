import {test,expect} from 'bun:test';
import {THREE} from '../cabin-overhaul/verify-player.ts';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
test('cloned high-yaw road neighbors preserve the actual public scalar-yaw support path',async()=>{
 const {loadPlayerMesh,loadPlayerAssembly}=await import('../cabin-overhaul/verify-player.ts'),{probeApproach}=await import('./verify-approach.ts');
 const base=resolve(import.meta.dir),k=JSON.parse(readFileSync(resolve(base,'build/nx-tower.route.json'),'utf8')),m=await loadPlayerMesh(resolve(base,'build/nx-tower.glb'));const ns=await loadPlayerAssembly(k,k.assembly);
 const r=probeApproach(m.root,k,ns);expect(r.physicalSupport.pass,JSON.stringify(r.physicalSupport.samples.filter((p:any)=>!p.pass).slice(0,3))).toBe(true);
});
const load=()=>import('./verify-approach.ts').catch(()=>({} as any));
function box(){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(2,1,1));b.position.y=.5;g.add(b);return g;}
test('external workstation approach executes real box collider without pretending it is a room',async()=>{
 const m:any=await load();expect(typeof m.probeApproach).toBe('function');
 const result=m.probeApproach(box(),{id:'workstation',scale:1,terrainY:0,waypoints:[{name:'street',pos:[0,0,3]},{name:'counter',pos:[0,0,1]}]});
 expect(result.status).toBe('PASS');expect(result.collider.exact).toBe(false);expect(result.walks.length).toBe(2);
});
test('external access rejects a high neighbor beam missed by the hip collider',async()=>{
 const m:any=await load(),g=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(.15,.15,.1));b.position.set(.2,1.825,1.7);g.add(b);
 const result=m.probeApproach(box(),{id:'workstation',scale:1,terrainY:0,waypoints:[{name:'street',pos:[0,0,3]},{name:'counter',pos:[0,0,1]}]},[{id:'beam',root:g,collide:'exact'}]);
 expect(result.status).toBe('FAIL');expect(result.walks.every((w:any)=>w.geometryHits>0)).toBe(true);
});
test('vacuous one-point routes are refused, not reported as passing access',async()=>{
 const m:any=await load();expect(()=>m.probeApproach(box(),{id:'workstation',scale:1,terrainY:0,waypoints:[{name:'street',pos:[0,0,3]}]})).toThrow('route');
});
test('declared floating approach elevations do not become physical ground',async()=>{
 const {physicalSupport}=await load();expect(typeof physicalSupport).toBe('function');
 const k={id:'probe',scale:1,terrainY:0,waypoints:[{name:'floating',pos:[0,.058276,2]},{name:'terrain',pos:[0,0,3]}]};
 const result=physicalSupport(box(),k,[]);expect(result.pass).toBe(false);expect(result.samples[0].gap).toBeGreaterThan(.035);
 const platform=new THREE.Group(),m=new THREE.Mesh(new THREE.BoxGeometry(2,.058276,2),new THREE.MeshBasicMaterial());m.position.set(0,.058276/2,2);platform.add(m);
 expect(physicalSupport(box(),{...k,waypoints:[k.waypoints[0]]},[{id:'real platform',root:platform}]).pass).toBe(true);
});
