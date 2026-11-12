// Conservative broadphase only. Does NOT label bbox overlaps as geometry collisions.
export function worldBounds(e:any){
 if(!Array.isArray(e.pos)||e.pos.length!==3||!e.pos.every(Number.isFinite)||!Number.isFinite(e.yaw)||!Number.isFinite(e.scale)||!(e.scale>0))throw Error('invalid entity transform');
 if(!['min','max'].every(k=>Array.isArray(e.bbox?.[k])&&e.bbox[k].length===3&&e.bbox[k].every(Number.isFinite)))throw Error('invalid entity bounds');
 if(e.bbox.min.some((v:number,a:number)=>v>e.bbox.max[a]))throw Error('inverted entity bounds');
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const x of [e.bbox.min[0],e.bbox.max[0]])for(const y of [e.bbox.min[1],e.bbox.max[1]])for(const z of [e.bbox.min[2],e.bbox.max[2]]){
  const p=[e.pos[0]+e.scale*(x*Math.cos(e.yaw)+z*Math.sin(e.yaw)),e.pos[1]+e.scale*y,e.pos[2]+e.scale*(-x*Math.sin(e.yaw)+z*Math.cos(e.yaw))];
  for(let a=0;a<3;a++){min[a]=Math.min(min[a],p[a]);max[a]=Math.max(max[a],p[a]);}
 }return {min,max};
}
export function neighborCandidates(host:any,entities:any[],margin=3){
 if(!Number.isFinite(margin)||margin<0)throw Error('invalid neighbor margin');const h=worldBounds(host);
 return entities.filter(e=>{if(e.id===host.id||!e.bbox)return false;const b=worldBounds(e);return [0,2].every(a=>b.min[a]<=h.max[a]+margin&&b.max[a]>=h.min[a]-margin);});
}
