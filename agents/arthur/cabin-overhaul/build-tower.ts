// Tower-owned standalone builder. Local artifacts only; no world connection.
import * as THREE from 'three';
import assert from 'node:assert/strict';
import { M, box, beam, window as frameWindow, transfer, finish } from './kit.ts';

const TAU = Math.PI*2, DEG = Math.PI/180;
const R=2.6, RI=2.36, UPPER=2.625, DECK=3.05;
const polar=(r:number,theta:number,y:number):[number,number,number]=>[r*Math.sin(theta),y,r*Math.cos(theta)];

// Closed convex annular/truncated-conical wedge. Every face is wound away
// from its centroid, so undersides and internal wall faces are real surfaces.
function wedge(g:THREE.Group,n:string,a:number,b:number,ri0:number,ro0:number,
  y0:number,ri1:number,ro1:number,y1:number,m:THREE.Material) {
  const p=[polar(ri0,a,y0),polar(ro0,a,y0),polar(ro0,b,y0),polar(ri0,b,y0),
    polar(ri1,a,y1),polar(ro1,a,y1),polar(ro1,b,y1),polar(ri1,b,y1)].map(p=>new THREE.Vector3(...p));
  const center=p.reduce((v,p)=>v.add(p),new THREE.Vector3()).multiplyScalar(1/8);
  const faces=[[0,1,2,3],[4,7,6,5],[1,5,6,2],[0,3,7,4],[0,4,5,1],[3,2,6,7]];
  const pos:number[]=[],uv:number[]=[];
  for(const f0 of faces) {
    const f=[...f0],normal=new THREE.Vector3().crossVectors(p[f[1]].clone().sub(p[f[0]]),p[f[2]].clone().sub(p[f[0]]));
    const fc=f.reduce((v,i)=>v.add(p[i]),new THREE.Vector3()).multiplyScalar(.25);
    if(normal.dot(fc.sub(center))<0) f.reverse();
    for(const k of [0,1,2,0,2,3]) {pos.push(...p[f[k]].toArray());uv.push(...[[0,0],[1,0],[1,1],[0,1]][k]);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
  const o=new THREE.Mesh(geo,m);o.name=n;g.add(o);return o;
}
function ring(g:THREE.Group,n:string,ri:number,ro:number,y0:number,y1:number,m:THREE.Material,a=0,b=TAU) {
  const count=Math.ceil((b-a)/(Math.PI/24));
  for(let i=0;i<count;i++)wedge(g,`${n}_${i}`,a+(b-a)*i/count,a+(b-a)*(i+1)/count,ri,ro,y0,ri,ro,y1,m);
}
function buildTower(): THREE.Group {
  const g=new THREE.Group();
  // Preserve the unraised ground room; a 2cm finish gives the full 2.20m
  // clearance under the rider's original y=2.22 lintel.
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(RI,RI,.02,64),M.wood);floor.position.y=.01;floor.name='tower_floor1';g.add(floor);
  // Angular cuts are source-true apertures, not windows pasted over a tube.
  const cuts=[...Array.from({length:49},(_,i)=>-Math.PI+i*TAU/48),-22*DEG,22*DEG,
    ...[-90,90,180,-180].flatMap(a=>[a*DEG-12*DEG,a*DEG+12*DEG]).filter(a=>a>-Math.PI&&a<Math.PI)].sort((a,b)=>a-b);
  const as=[...new Set(cuts)],ys=[.02,.47,1.04,2.02,2.22,2.72,2.94,3.05,3.63,4.91,5.28,5.6];
  for(let i=0;i<as.length-1;i++)for(let j=0;j<ys.length-1;j++) {
    const a=(as[i]+as[i+1])/2,y=(ys[j]+ys[j+1])/2;
    const portal=Math.abs(a)<22*DEG;
    const win=[-Math.PI/2,Math.PI/2,Math.PI,-Math.PI].some(w=>Math.abs(a-w)<12*DEG);
    if(portal&&(y<2.72||(y>2.94&&y<5.28)))continue;
    if(win&&((y>1.04&&y<2.02)||(y>3.63&&y<4.91)))continue;
    wedge(g,`tower_panel_${i}_${j}`,as[i],as[i+1],RI,R,ys[j],RI,R,ys[j+1],y<.47?M.stone:M.lime);
  }
  // Eleven substantial wall posts, on a calm 30-degree rhythm.
  for(let i=1;i<12;i++) {
    const a=i*TAU/12,p=polar(2.585,a,3.025);
    const post=box(g,`tower_post_${i}`,.145,5.19,.17,...p,M.timber);post.rotation.y=a;
  }
  ring(g,'tower_base_sill',2.57,2.67,.46,.59,M.timber,22*DEG,TAU-22*DEG);
  ring(g,'tower_floor_belt',2.57,2.69,2.54,2.75,M.timber);
  ring(g,'tower_eave_plate',2.48,2.73,5.40,5.62,M.timber);
  // Three visible staggered stone courses retain a low, grounded plinth.
  for(let course=0;course<3;course++)for(let i=0;i<32;i++) {
    const a=-Math.PI+(i+(course%2)*.5)*TAU/32,b=a+TAU/32-.012;
    if(a<22*DEG&&b>-22*DEG)continue;
    wedge(g,`tower_plinth_${course}_${i}`,a,b,2.59,2.68,.025+course*.14,2.59,2.68,.152+course*.14,M.stone);
  }
  for(const side of [-1,1]) {
    box(g,`tower_entry_jamb_${side}`,.18,2.70,.46,side*.91,1.37,2.56,M.timber);
    box(g,`tower_entry_foot_${side}`,.25,.33,.49,side*.945,.185,2.56,M.stone);
  }
  // b21 back plane: local z=2.8225-.0325=2.79, y=2.22..2.68.
  // Leave its x±.81 / y2.22..2.68 art face undecorated.
  box(g,'tower_rider_lintel',2.03,.49,.46,0,2.465,2.56,M.wood);
  box(g,'tower_lintel_cap',2.17,.11,.49,0,2.765,2.56,M.timber);
  for(const a of [-Math.PI/2,Math.PI/2,Math.PI]) {
    const p=polar(2.605,a,1.53);frameWindow(g,`tower_study_window_${a}`,...p,.94,.98,a,true);
    const q=polar(2.605,a,4.27);frameWindow(g,`tower_upper_window_${a}`,...q,.94,1.28,a,a!==Math.PI);
  }
  // Top doorway is now a full-height real opening, with an inward-open leaf.
  for(const s of [-1,1])box(g,`tower_balcony_door_jamb_${s}`,.15,2.28,.30,s*.9,4.16,2.52,M.timber);
  box(g,'tower_balcony_door_header',1.95,.16,.30,0,5.36,2.52,M.timber);
  box(g,'tower_balcony_open_leaf',.10,2.10,.76,-.88,4.10,2.0,M.wood);
  for(const z of [1.72,2.24])box(g,`tower_bdoor_strap_${z}`,.115,.07,.3,-.88,4.68,z,M.iron);
  box(g,'tower_bdoor_handle',.14,.13,.055,-.79,4.08,1.71,M.iron);
  // Front-and-east balcony keeps the inherited [-60,+120] degree sweep.
  for(let i=0;i<36;i++) {
    const a=-Math.PI/3+i*Math.PI/36,b=a+Math.PI/36-.002;
    wedge(g,`tower_balcony_plank_${i}`,a,b,2.39,3.24,2.94,2.39,3.24,DECK,M.wood);
  }
  ring(g,'tower_balcony_fascia',3.13,3.245,2.80,2.97,M.timber,-Math.PI/3,Math.PI*2/3);
  for(const d of [-48,-30,30,60,90,112]) {
    const a=d*DEG;
    beam(g,`tower_balcony_joist_${d}`,polar(2.42,a,2.865),polar(3.23,a,2.865),.13,.15,M.timber);
    beam(g,`tower_balcony_knee_${d}`,polar(2.50,a,2.32),polar(3.17,a,2.855),.14,.14,M.timber);
  }
  for(let i=0;i<=12;i++) {
    const a=-Math.PI/3+i*Math.PI/12;
    const o=box(g,`tower_balcony_newel_${i}`,.10,.98,.10,...polar(3.195,a,3.53),M.timber);o.rotation.y=a;
    box(g,`tower_balcony_newel_cap_${i}`,.13,.06,.13,...polar(3.195,a,4.05),M.wood).rotation.y=a;
    if(i<12) {
      const b=a+Math.PI/12;
      for(const y of [3.24,3.99])beam(g,`tower_balcony_rail_${i}_${y}`,polar(3.195,a,y),polar(3.195,b,y),.095,.095,M.timber);
      for(let j=1;j<3;j++)box(g,`tower_balcony_baluster_${i}_${j}`,.045,.74,.045,...polar(3.195,a+j*Math.PI/36,3.61),M.wood);
    }
  }
  // Rear/east end capped; west end is the inherited ladder landing.
  for(const y of [3.23,3.99])beam(g,`tower_balcony_endrail_${y}`,polar(2.61,Math.PI*2/3,y),polar(3.195,Math.PI*2/3,y),.09,.09,M.timber);
  const ladder=new THREE.Group();
  for(const s of [-1,1])box(ladder,`tower_exterior_ladder_side_${s}`,.08,3.85,.09,s*.31,1.945,0,M.timber);
  for(let i=0;i<11;i++)box(ladder,`tower_exterior_ladder_rung_${i}`,.61,.065,.10,0,.35+i*.33,.01,M.wood);
  transfer(ladder,g,...polar(3.04,-Math.PI/3,0),-Math.PI/3);
  // Load path: wall plate → twelve radial rafters → compact king post.
  // The 36-faced closed underdeck is only waterproof backing; its cone is
  // completely clad in individually modelled staggered slate shingles.
  for(let i=0;i<12;i++) {
    const a=i*TAU/12;
    beam(g,`tower_rafter_${i}`,polar(3.02,a,5.475),polar(.075,a,7.48),.13,.15,M.timber);
    beam(g,`tower_eave_knee_${i}`,polar(2.59,a,i===0?5.32:5.13),polar(2.96,a,5.49),.10,.10,M.timber);
  }
  for(let i=0;i<4;i++)beam(g,`tower_roof_tie_${i}`,polar(2.51,i*Math.PI/4,5.49),polar(2.51,i*Math.PI/4+Math.PI,5.49),.13,.17,M.timber);
  box(g,'tower_roof_kingpost',.16,2.28,.16,0,6.59,0,M.timber);
  for(let i=0;i<36;i++)wedge(g,`tower_roof_underdeck_${i}`,i*TAU/36,(i+1)*TAU/36,2.96,3.045,5.565,.001,.075,7.58,M.roof);
  ring(g,'tower_eave_fascia',2.995,3.065,5.52,5.64,M.timber);
  for(let course=0;course<11;course++) {
    const ro=3.10-course*.28,ri=Math.max(.01,ro-.355);
    const count=Math.max(10,Math.ceil(TAU*ro/.39));
    const low=7.72-.69*ro+.060,high=7.72-.69*ri+.015;
    for(let i=0;i<count;i++) {
      const start=(i+(course%2)*.5)*TAU/count+.004/ro,end=(i+1+(course%2)*.5)*TAU/count-.004/ro;
      wedge(g,`tower_slate_${course}_${i}`,start,end,ro-.065,ro,low,Math.max(.008,ri-.050),ri,high,
        (i+course*2)%7===1?M.roofAlt:M.roof);
    }
  }
  const cap=new THREE.Mesh(new THREE.ConeGeometry(.225,.39,12),M.iron);cap.position.y=7.80;cap.name='tower_roof_cap';g.add(cap);
  box(g,'tower_finial',.075,.32,.075,0,8.125,0,M.iron);
  box(g,'tower_finial_collar',.15,.055,.15,0,8.06,0,M.wood);
  // Circular plank floor, not the legacy square slab poking through the drum.
  // A rectangular hatch is cut into the actual boards beside the east ladder.
  const edges=[-RI,RI,1.13,1.99,...Array.from({length:31},(_,i)=>-RI+(i+1)*2*RI/32)].sort((a,b)=>a-b);
  let board=0;
  for(let i=0;i<edges.length-1;i++) {
    const x0=edges[i],x1=edges[i+1],x=(x0+x1)/2;
    const reach=Math.sqrt(Math.max(0,RI*RI-Math.max(x0*x0,x1*x1)));
    if(reach<.05)continue;
    const segments=x>1.13&&x<1.99?[[-reach,.70],[1.70,reach]]:[[-reach,reach]];
    segments.forEach(([z0,z1])=>{if(z1>z0)box(g,`tower_floor2_${board++}`,x1-x0,.15,z1-z0,x,2.55,(z0+z1)/2,M.wood);});
  }

  for(const x of [-1.45,-.45,.65]) {
    const reach=Math.sqrt(RI*RI-x*x);
    beam(g,`tower_floor_joist_${x}`,[x,2.40,-reach],[x,2.40,reach],.12,.15,M.timber);
  }
  box(g,'tower_hatch_trimmer',.12,.15,1.10,1.065,2.46,1.20,M.timber);
  // Three shallow joinery steps bridge 2.625 → 3.05 without altering either.
  for(let i=0;i<3;i++) {
    const h=(DECK-UPPER)*(i+1)/3;
    box(g,`tower_balcony_step_${i}`,1.54,h,.31,0,UPPER+h/2,1.74+i*.29,M.wood);
  }
  // Study: preserve desk coordinates and book/quill/meridian identity, but
  // replace under-supported blocks with four legs, aprons and an honest chair.
  box(g,'tw_desk',1.5,.08,.74,-.70,.95,-1.3,M.wood);
  for(const x of [-1.34,-.06])for(const z of [-1.59,-1.01])box(g,`tw_deskleg_${x}_${z}`,.09,.89,.09,x,.465,z,M.timber);
  for(const z of [-1.6,-1.0])box(g,`tw_deskapron_${z}`,1.4,.16,.055,-.7,.84,z,M.timber);
  box(g,'tw_chair',.48,.07,.47,-.70,.495,-.55,M.wood);
  for(const x of [-.89,-.51])for(const z of [-.73,-.37])box(g,`tw_chairleg_${x}_${z}`,.065,.44,.065,x,.24,z,M.timber);
  for(const x of [-.89,-.51])box(g,`tw_chairback_${x}`,.06,.66,.06,x,.72,-.34,M.timber);
  box(g,'tw_chairback_rail',.46,.14,.055,-.7,.985,-.34,M.wood);
  box(g,'tw_book_cover',.36,.027,.27,-.75,1.006,-1.3,M.roof);
  const pageL=box(g,'tw_book_left',.17,.02,.245,-.835,1.029,-1.3,M.lime);pageL.rotation.z=-.095;
  const pageR=box(g,'tw_book_right',.17,.02,.245,-.665,1.029,-1.3,M.lime);pageR.rotation.z=.095;
  box(g,'tw_inkwell',.065,.065,.065,-.43,1.022,-1.2,M.iron);
  beam(g,'tw_quill',[-.43,1.055,-1.2],[-.49,1.28,-1.2],.015,.022,M.lime);
  const meridian=new THREE.Mesh(new THREE.TorusGeometry(.15,.018,8,32),M.wood);meridian.name='tw_meridian';meridian.rotation.x=Math.PI/2;meridian.position.set(-1.15,1.025,-1.3);g.add(meridian);
  box(g,'tw_meridian_rule_x',.31,.016,.021,-1.15,1.025,-1.3,M.wood);
  box(g,'tw_meridian_rule_z',.021,.016,.31,-1.15,1.025,-1.3,M.wood);
  // Open-sided bookshelf: the old solid carcass hid its own books.
  box(g,'tw_shelf_back',.055,1.98,1.30,-2.245,1.01,.25,M.wood);
  for(const z of [-.44,.94])box(g,`tw_shelf_cheek_${z}`,.35,1.98,.065,-2.08,1.01,z,M.timber);
  for(let shelf=0;shelf<3;shelf++) {
    const y=.13+shelf*.61;
    box(g,`tw_shelf_${shelf}`,.37,.065,1.45,-2.08,y,.25,M.wood);
    for(let i=0;i<7;i++)box(g,`tw_shelf_book_${shelf}_${i}`,.22,.34+(i%3)*.035,.10,-2.02,y+.205+(i%3)*.0175,-.31+i*.18,(i+shelf)%3===0?M.roof:M.wood);
  }
  const rug=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,.015,48),M.roofAlt);rug.position.y=.0325;rug.name='tw_rug';g.add(rug);
  ring(g,'tw_rug_border',1.03,1.095,.0401,.0415,M.wood);
  // Interior ladder is geometry only. The host has no ladder comp: no claim
  // of player climbing is made by this local build/review packet.
  for(const [x,n] of [[1.23,'a'],[1.89,'b']] as const)beam(g,`tw_ladderside_${n}`,[x,.02,1.51],[x,3.30,.96],.075,.075,M.timber);
  for(let i=0;i<9;i++) {
    const y=.30+i*.29,z=1.51-(y-.02)/3.28*.55;
    box(g,`tw_ladder_rung_${i}`,.66,.06,.12,1.56,y,z,M.wood);
  }
  // Bedchamber: retain bed, pillow, blanket, chest, candle stand positions.
  box(g,'tw_bedframe',1.02,.18,1.93,-1.3,UPPER+.13,-.6,M.timber);
  for(const x of [-1.72,-.88])for(const z of [-1.43,.23])box(g,`tw_bedleg_${x}_${z}`,.11,.24,.11,x,UPPER+.12,z,M.timber);
  box(g,'tw_mattress',.91,.15,1.77,-1.3,UPPER+.295,-.6,M.lime);
  box(g,'tw_pillow',.58,.10,.32,-1.3,UPPER+.42,.10,M.lime);
  box(g,'tw_blanket',.94,.05,1.05,-1.3,UPPER+.395,-.99,M.roofAlt);
  box(g,'tw_blanket_hem',.945,.055,.095,-1.3,UPPER+.40,-.50,M.wood);
  box(g,'tw_headboard',1.03,.63,.075,-1.3,UPPER+.36,.375,M.wood);
  box(g,'tw_chest',.80,.45,.50,-1.35,UPPER+.23,1.35,M.wood);
  box(g,'tw_chestlid',.84,.08,.54,-1.35,UPPER+.50,1.35,M.timber);
  for(const x of [-1.61,-1.09])box(g,`tw_cheststrap_${x}`,.045,.475,.515,x,UPPER+.255,1.35,M.iron);
  box(g,'tw_chestlatch',.08,.13,.06,-1.35,UPPER+.34,1.075,M.iron);
  box(g,'tw_cstand',.32,.055,.32,-.35,UPPER+.62,-1.5,M.wood);
  for(const x of [-.46,-.24])for(const z of [-1.61,-1.39])box(g,`tw_cstandleg_${x}_${z}`,.045,.59,.045,x,UPPER+.295,z,M.timber);
  for(const [n,x,y,z] of [['study',-.15,1.13,-1.3],['bed',-.35,3.43,-1.5]] as const) {
    box(g,`tw_candle_${n}`,.045,.13,.045,x,y-.08,z,M.lime);
    const flame=new THREE.Mesh(new THREE.IcosahedronGeometry(.033,1),M.amber);flame.name=`flame_tower_${n}`;flame.position.set(x,y,z);g.add(flame);
  }
  // One small real swallowtail, retained above and clear of the rider zone.
  const cloth=new THREE.Shape();cloth.moveTo(-.17,0);cloth.lineTo(-.17,.74);cloth.lineTo(.17,.68);cloth.lineTo(.045,.38);cloth.lineTo(.17,.08);cloth.closePath();
  const pennant=new THREE.Mesh(new THREE.ExtrudeGeometry(cloth,{depth:.015,bevelEnabled:false}),M.roofAlt);pennant.name='tw_pennant';pennant.position.set(0,3.21,3.285);g.add(pennant);
  box(g,'tw_pennant_bar',.42,.06,.045,0,3.97,3.2825,M.wood);
  return g;
}

// Keep the circulation test next to the owned builder. This inspects triangles,
// not vertex-in-volume counts (which miss long boxes crossing a clear lane).
function verifyShell(g: THREE.Group) {
  g.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(g);
  assert(!bounds.isEmpty(), 'round scholar-home shell must exist');
  assert(bounds.min.x >= -3.25 - 1e-5 && bounds.max.x <= 3.329 + 1e-5, 'X envelope');
  assert(bounds.min.z >= -3.25 - 1e-5 && bounds.max.z <= 3.33 + 1e-5, 'Z envelope');
  assert(bounds.max.y <= 8.3 + 1e-5, 'height envelope');
  for(const [label,y0,y1,z0,z1] of [['ground',.0201,2.2199,1.85,3.33],['balcony',3.0501,5.2499,2.48,2.73]] as const) {
  const lane = new THREE.Box3(new THREE.Vector3(-.7,y0,z0),new THREE.Vector3(.7,y1,z1));
  const hits: string[] = [];
  g.traverse(o=>{
    if (!(o instanceof THREE.Mesh)) return;
    const p=o.geometry.getAttribute('position'),idx=o.geometry.index;
    for(let i=0;i<(idx?.count??p.count);i+=3) {
      const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j).applyMatrix4(o.matrixWorld));
      if(lane.intersectsTriangle(new THREE.Triangle(v[0],v[1],v[2]))) {hits.push(o.name);break;}
    }
  });
  assert.deepEqual(hits,[], `1.4m × 2.2m ${label}-entry lane must contain zero triangles`);
  }
  assert(g.getObjectByName('tower_rider_lintel'), 'retain b21 mounting lintel');
  console.log('SHELL PASS: exact-envelope and triangle-box entry clearance');
}
function verifyRoof(g:THREE.Group) {
  const tiles:THREE.Mesh[]=[];g.traverse(o=>{if(o instanceof THREE.Mesh&&/^tower_slate_\d+_\d+$/.test(o.name))tiles.push(o);});
  assert(tiles.length>=200,'overlapping discrete conical slate roof must exist');
  assert(g.getObjectByName('tower_rafter_0'),'readable radial rafters must support the roof');
  const levels=new Set(tiles.map(o=>o.name.split('_')[2]));assert(levels.size>=8,'roof has at least eight real courses');
  for(const tile of tiles) {const bb=new THREE.Box3().setFromObject(tile);assert(bb.max.y>bb.min.y+.15,'slates follow roof pitch, not flat decorative hoops');}
  // Falsify rafters showing through the finished slate skin from above.
  const roofObjects:THREE.Object3D[]=[];g.traverse(o=>{if(/^tower_(slate_|rafter_|roof_)/.test(o.name))roofObjects.push(o);});
  for(let i=0;i<12;i++)for(const r of [.5,1,1.5,2,2.5]) {
    const ray=new THREE.Raycaster(new THREE.Vector3(...polar(r,i*TAU/12,9)),new THREE.Vector3(0,-1,0));
    const hit=ray.intersectObjects(roofObjects)[0];
    assert(hit&&!hit.object.name.startsWith('tower_rafter_'),`rafter exposed through slate: ${i}/${r}`);
  }
  console.log(`ROOF PASS: ${tiles.length} solid slates across ${levels.size} overlapping courses; 60 crown/rafter occlusion rays`);
}
function verifyInterior(g:THREE.Group) {
  for(const name of ['tw_desk','tw_chair','tw_book_left','tw_quill','tw_meridian','tw_shelf_0','tw_rug','tw_ladderside_a','tw_bedframe','tw_mattress','tw_pillow','tw_blanket','tw_chest','tw_cstand','flame_tower_study','flame_tower_bed','tower_floor2_0','tower_balcony_step_2'])
    assert(g.getObjectByName(name),`full scholar-home identity missing ${name}`);
  const floors:THREE.Object3D[]=[];g.traverse(o=>{if(/^tower_floor2_/.test(o.name))floors.push(o);});
  // Sample inside a plank, not on the Float32 shared seam at x=0.
  const ray=new THREE.Raycaster(new THREE.Vector3(.05,2.8,0),new THREE.Vector3(0,-1,0));
  const hits=ray.intersectObjects(floors);assert(hits.length&&Math.abs(hits[0].point.y-UPPER)<1e-5,'upper floor remains y=2.625');
  ray.set(new THREE.Vector3(1.56,2.8,1.2),new THREE.Vector3(0,-1,0));assert.equal(ray.intersectObjects(floors).length,0,'ladder has a real upper-floor hatch');
  console.log('INTERIOR PASS: study/bedchamber identity, original upper floor level, real ladder hatch');
}
const g=buildTower();
verifyShell(g);
verifyRoof(g);
verifyInterior(g);
if (!process.argv.includes('--test')) finish(g,'nx-town-tower-house');
