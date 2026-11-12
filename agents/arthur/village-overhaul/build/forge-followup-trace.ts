// LOCAL read-only diagnostic: resolve image pixels against actual default-scene triangles.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {loadPlayerMesh,placeNeighborInHostFrame,THREE} from '../../cabin-overhaul/verify-player.ts';
const base=resolve(import.meta.dir,'..'),hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const n=JSON.parse(readFileSync(`${base}/neighbors/nx-forge.json`,'utf8'));
const cameraPath=`${base}/reviews/forge-assembly-detail-after/camera.json`,rig=JSON.parse(readFileSync(cameraPath,'utf8')),v=rig.views.back;
const camera=new THREE.PerspectiveCamera(v.fov,rig.width/rig.height,rig.near,rig.far);camera.position.fromArray(v.eye);camera.lookAt(new THREE.Vector3(...v.target));camera.updateMatrixWorld(true);
const pins=JSON.parse(readFileSync(`${base}/build/forge-assembly-after.json`,'utf8')).inputs;
const out:any={cameraPath,cameraSha256:hash(cameraPath),pixelConvention:'960x720 pixel-center; image top-left',phases:{}};
for(const phase of ['before','after']){
 const roots:any[]=[];
 for(const pin of pins){const e=pin.id===n.host.id?n.host:n.neighbors.find((x:any)=>x.id===pin.id);const file=['nx-court','nx-forge'].includes(e.id)?`${base}/${phase==='after'?'build/'+e.id.slice(3):'before/'+e.id}.glb`:e.file;
  const m=await loadPlayerMesh(file);placeNeighborInHostFrame(m.root,n.host,e);m.root.traverse((o:any)=>{if(o.isMesh){o.userData.owner=e.id;o.userData.file=file;o.material.side=THREE.DoubleSide;}});roots.push(m.root);
 }
 const cast=new THREE.Raycaster(),pixels=[];
 for(const [label,x,y] of [['upper-block',628,281],['lower-bar',740,544],['sign-board',544,414]] as const){cast.setFromCamera(new THREE.Vector2((x+.5)/rig.width*2-1,1-(y+.5)/rig.height*2),camera);const hits=cast.intersectObjects(roots,true).slice(0,4).map(h=>({owner:h.object.userData.owner,file:h.object.userData.file,node:h.object.name,triangleIndex:h.faceIndex,vertices:[h.face.a,h.face.b,h.face.c].map((i:number)=>new THREE.Vector3().fromBufferAttribute(h.object.geometry.attributes.position,i).applyMatrix4(h.object.matrixWorld).toArray()),point:h.point.toArray(),distance:h.distance}));pixels.push({label,pixel:[x,y],hits});}
 out.phases[phase]=pixels;
}
writeFileSync(`${base}/build/forge-followup-pixel-trace.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));
