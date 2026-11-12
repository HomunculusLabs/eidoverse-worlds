import { test, expect } from "bun:test";
const { verifyPlayerMesh, THREE } = await import("./verify-player.ts");

function fixture(gap=1.8, headroom=2.4, hiddenWall=false) {
  const root = new THREE.Group();
  const b=(w:number,h:number,d:number,x:number,y:number,z:number)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d));m.position.set(x,y,z);root.add(m)};
  b(4,.2,4,0,-.1,0); b(4,3,.2,0,1.5,-1.9);
  b(.2,3,4,-1.9,1.5,0); b(.2,3,4,1.9,1.5,0);
  const wing=(4-gap)/2;
  b(wing,3,.2,-(gap/2+wing/2),1.5,1.9);b(wing,3,.2,gap/2+wing/2,1.5,1.9);
  b(gap,3-headroom,.2,0,headroom+(3-headroom)/2,1.9);
  if(hiddenWall)b(4,3,.01,0,1.5,1.65); // all its vertices are outside the narrow prism
  return root;
}
const contract={id:"test-room",scale:1,terrainY:0,
 doors:[{name:"front",x:0,z:[1.5,2.3],floorY:0,width:1.4,headroom:2.2}],
 waypoints:[{name:"outside",pos:[0,0,3]},{name:"inside",pos:[0,0,.7]}], protectedVolumes:[]};

test("actual browser collider and triangle corridor agree on an open door",()=>{
  const result=verifyPlayerMesh(fixture(),contract);
  expect(result.status,JSON.stringify(result)).toBe("PASS");
  expect(result.collider.exact).toBe(true);
  expect(result.walks.length).toBe(2);
  expect(result.walks.every((w:any)=>w.maxPush<1e-6)).toBe(true);
});

test("sub-1.4m width is refused even when the avatar fits",()=>{
  const r=verifyPlayerMesh(fixture(1.1),contract);
  expect(r.status).toBe("FAIL");expect(r.doors[0].hits).toBeGreaterThan(0);
});
test("sub-2.2m headroom is refused even above the browser hip probe",()=>{
  const r=verifyPlayerMesh(fixture(1.8,2.05),contract);
  expect(r.status).toBe("FAIL");expect(r.doors[0].hits).toBeGreaterThan(0);
});
test("a triangle crossing the corridor is caught with all its corners outside",()=>{
  const r=verifyPlayerMesh(fixture(1.8,2.4,true),contract);
  expect(r.status).toBe("FAIL");expect(r.doors[0].hits).toBeGreaterThan(0);
});
test("explicit host backing allowance protects rider space without exempting a whole host",()=>{
  const volume={id:"rider",min:[-2,0,-2],max:[2,3,-1.7]};
  const r=verifyPlayerMesh(fixture(),{...contract,protectedVolumes:[volume]});
  expect(r.status).toBe("FAIL");
  const ok=verifyPlayerMesh(fixture(),{...contract,protectedVolumes:[{...volume,allowance:{min:[-2,0,-2],max:[2,3,-1.7],reason:"fixture backing wall only"}}]});
  expect(ok.status).toBe("PASS");
});
test("a high side beam inside the body's radius blocks the whole sweep",()=>{
  const root=fixture();
  const beam=new THREE.Mesh(new THREE.BoxGeometry(.18,.15,.10));
  beam.position.set(.2,1.825,.95);root.add(beam);
  const k={...contract,waypoints:[{name:"west",pos:[-.8,0,.7]},{name:"east",pos:[.8,0,.7]}]};
  const r=verifyPlayerMesh(root,k);
  expect(r.status).toBe("FAIL");
  expect(r.walks.every((w:any)=>w.geometryHits>0)).toBe(true);
});

test("non-finite required door width is a schema error, not a geometry verdict",()=>{
  expect(()=>verifyPlayerMesh(fixture(),{...contract,doors:[{...contract.doors[0],width:Infinity}]})).toThrow();
});

test("a separately fitted neighboring side beam participates in the player's sweep",()=>{
  const neighbor=new THREE.Group();const beam=new THREE.Mesh(new THREE.BoxGeometry(.18,.15,.10));beam.position.set(.2,1.825,.95);neighbor.add(beam);
  const r=verifyPlayerMesh(fixture(),{...contract,waypoints:[{name:"west",pos:[-.8,0,.7]},{name:"east",pos:[.8,0,.7]}]},[{id:'neighbor',root:neighbor,collide:'exact'}]);
  expect(r.status).toBe('FAIL');expect(r.walks.every((w:any)=>w.geometryHits>0)).toBe(true);
});

test('world-space neighbor transforms are composed into the host frame',async()=>{
  const path='./verify-player.ts';const m:any=await import(path);
  expect(typeof m.placeNeighborInHostFrame).toBe('function');
  const root=new THREE.Group(),host={pos:[10,1,20],yaw:Math.PI/2,scale:2},entity={pos:[14,3,14],yaw:Math.PI,scale:1};
  m.placeNeighborInHostFrame(root,host,entity);
  const h=new THREE.Object3D();h.position.fromArray(host.pos);h.rotation.y=host.yaw;h.scale.setScalar(host.scale);h.add(root);h.updateMatrixWorld(true);
  const found=root.getWorldPosition(new THREE.Vector3());
  expect(found.distanceTo(new THREE.Vector3(...entity.pos))).toBeLessThan(1e-8);
  expect(root.getWorldScale(new THREE.Vector3()).x).toBeCloseTo(entity.scale,8);
});

test('an explicit public runtime reports the exact pinned module bytes',async()=>{
  const dir=new URL('./runtime',import.meta.url).pathname;
  const code=`const m=await import('./agents/arthur/cabin-overhaul/verify-player.ts'); console.log(JSON.stringify(m.runtimeEvidence));`;
  const p=Bun.spawnSync(['bun','-e',code],{cwd:new URL('../../../',import.meta.url).pathname,env:{...process.env,CABIN_PLAYER_RUNTIME_DIR:dir}});
  expect(p.exitCode).toBe(0);
  expect(new TextDecoder().decode(p.stdout)).not.toBe('undefined\n');
  const v=JSON.parse(new TextDecoder().decode(p.stdout));
  expect(v.mode).toBe('served-override');expect(v.files['colliders.js'].sha256).toBe('b251bf7d894fb7be25d477bffab781d8a192e9f076d201aa9bdd342f32f34826');
  expect(v.files['supportclass.js'].sha256).toBe('b19727b1e13e02dd4adcba3459705dcc9a5356d7352342d2d1b6a3efe3c5672e');
});

test("a documented threshold step is stepped onto and off without invented lateral motion",()=>{
  const root=fixture();const threshold=new THREE.Mesh(new THREE.BoxGeometry(1.8,.2,.8));threshold.position.set(0,.1,1.95);root.add(threshold);
  const k={...contract,doors:[{...contract.doors[0],floorY:.2}],waypoints:[contract.waypoints[0],{name:"threshold",pos:[0,.2,1.95]},contract.waypoints[1]]};
  const r=verifyPlayerMesh(root,k);
  expect(r.status,JSON.stringify(r)).toBe("PASS");expect(r.walks.length).toBe(4);
});
