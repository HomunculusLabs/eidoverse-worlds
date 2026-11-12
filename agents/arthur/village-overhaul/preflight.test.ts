import {test,expect} from 'bun:test';
import {createHash} from 'node:crypto';
import {THREE as ThreeRuntime} from '../cabin-overhaul/verify-player.ts';
test('terrain binding tolerates only negligible captured pose roundoff, not raised phantom floors',async()=>{
 const {terrainMatches}=await import('./preflight.ts');expect(typeof terrainMatches).toBe('function');
 expect(terrainMatches(0,{pos:[18.9,-1.5946487083102603e-8,-14.8],scale:1})).toBe(true);
 expect(terrainMatches(.058276,{pos:[0,0,0],scale:1})).toBe(false);
 expect(terrainMatches(Infinity,{pos:[0,0,0],scale:1})).toBe(false);
});
const THREE:any=ThreeRuntime;
test('world-zero terrain datum converts to a lowered host frame without lifting waypoints',async()=>{
 const {bindTerrain}=await load();expect(typeof bindTerrain).toBe('function');const s={pos:[20,-.02065,24],scale:1};
 expect(bindTerrain(0,s)).toBe(.02065);expect(bindTerrain(.02065,s)).toBe(.02065);expect(()=>bindTerrain(.058,{pos:[0,0,0],scale:1})).toThrow();expect(()=>bindTerrain(2.64,{pos:[0,0,0],scale:1})).toThrow();
});
test('explicit quarter-turn proof frames rotate the whole assembly and route, without changing world placement or mutating inputs',async()=>{
 const {applyProofFrame}=await import('./preflight.ts');expect(typeof applyProofFrame).toBe('function');
 const root=new THREE.Group(),neighbor=new THREE.Group();root.position.set(2,0,0);neighbor.position.set(3,0,0);
 const k={pos:[14,0,17],yaw:-2.4,proofFrameY:-Math.PI/2,coordinateFrames:{doors:'proof-frame',waypoints:'host-local',protectedVolumes:'host-local',assembly:'world-tuples'},doors:[{id:'east',x:0,z:2}],waypoints:[{name:'station',pos:[2,0,0]}],protectedVolumes:[{id:'art',min:[1,0,0],max:[2,1,1]}]};
 const framed=applyProofFrame(root,[{id:'neighbor',root:neighbor}],k);expect(framed.contract.pos).toEqual(k.pos);expect(framed.contract.doors).toEqual(k.doors);expect(framed.contract.waypoints[0].pos[2]).toBeCloseTo(2);expect(framed.neighbors[0].root.position.z).toBeCloseTo(3);expect(root.position.x).toBe(2);expect(neighbor.position.x).toBe(3);
 expect(()=>applyProofFrame(root,[],{...k,coordinateFrames:undefined})).toThrow('frame');
});
const h=(v:any)=>createHash('sha256').update(v).digest('hex');
const source=Buffer.from('source bytes'),model=Buffer.from('served bytes');
const input=()=>({schema:'village-preflight-input-v1',world:'commons-next',slot:{id:'nx-town-hall',sha256:h(source),routes:[{file:'build/route.json',sha256:h('route'),mode:'room'}]},sourceBytes:source,modelBytes:model,modelSha256:h(model),stage:'served',contextSha256:h('context'),neighbors:[]});
const load=()=>import('./preflight.ts').catch(()=>({} as any));
test('preflight refuses content/source/route binding drift before decoding',async()=>{
 const {verifyBinding}=await load();expect(typeof verifyBinding).toBe('function');expect(verifyBinding(input())).toBe(true);
 for(const mutate of [(i:any)=>i.sourceBytes=Buffer.from('changed'),(i:any)=>i.modelBytes=source,(i:any)=>i.slot.routes=[],(i:any)=>i.slot.routes[0].sha256='1234',(i:any)=>i.stage='maybe',(i:any)=>i.world='commons']){const i=input();mutate(i);expect(()=>verifyBinding(i)).toThrow();}
});
test('bidirectional surface proof rejects hidden displacement despite equal outer bounds',async()=>{
 const {compareSurfaces}=await load();expect(typeof compareSurfaces).toBe('function');
 const make=(x:number)=>{const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.BoxGeometry(4,.2,4)));const part=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.3));part.position.set(x,1,0);g.add(part);g.updateMatrixWorld(true);return g;};
 expect(compareSurfaces(make(0),make(0)).pass).toBe(true);
 expect(compareSurfaces(make(0),make(.1)).pass).toBe(false);
 expect(compareSurfaces(make(0),make(.001)).pass).toBe(true);
});
test('full inspection refuses unbound source before any runtime network or file operation',async()=>{
 const {inspect}=await load();expect(typeof inspect).toBe('function');const i=input();i.sourceBytes=Buffer.from('changed');await expect(inspect(i)).rejects.toThrow('source bytes drift');
});
test('live neighbor adapter keeps loaded wrapper and composes neighbor into host, never reversed',async()=>{
 const {prepareNeighbor}=await load();expect(typeof prepareNeighbor).toBe('function');
 const loaded={root:new THREE.Group(),sha256:h('n'),meshes:1,bytes:16},host={pos:[10,0,0],yaw:Math.PI/2,scale:1,parent:null},n={id:'neighbor',pos:[10,0,2],yaw:Math.PI/2,scale:1,parent:null,lib:'store/fixture.glb',folded:{collide:'exact'}};
 const got=prepareNeighbor(loaded,host,n);expect(got.id).toBe('neighbor');expect(got.root).toBe(loaded.root);expect(got.collide).toBe('exact');
 const expected=new THREE.Vector3(...n.pos).sub(new THREE.Vector3(...host.pos)).applyAxisAngle(new THREE.Vector3(0,1,0),-host.yaw);expect(got.root.position.distanceTo(expected)).toBeLessThan(1e-8);expect(got.sourceTuple.lib).toBe(n.lib);
});
