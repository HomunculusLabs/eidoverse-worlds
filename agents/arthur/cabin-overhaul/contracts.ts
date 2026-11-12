// Pure fail-closed decisions used by both dry-run and actual rollout.
export const stable=(v:any):string=>JSON.stringify(canonical(v));
function canonical(v:any):any {return Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;}
const near=(a:number,b:number)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-6;
function pose(a:any,b:any){return a?.id===b?.id&&Array.isArray(a.pos)&&a.pos.length===3&&a.pos.every((v:number,i:number)=>near(v,b.pos[i]))&&near(a.yaw,b.yaw)&&near(a.scale,b.scale);}
export function validatePlan(before:any,next:any):true {
 if(!pose(before,next))throw Error(`${before.id} planned pose drift`);
 if(!/^[a-f0-9]{64}$/.test(next.sha256)||next.lib!==`store/${next.sha256.slice(0,16)}.glb`)throw Error(`${before.id} hash mismatch`);
 if(stable(before.comp??{})!==stable(next.comp??{}))throw Error(`${before.id} planned component drift`);
 for(const k of [0,2])if(!Number.isFinite(next.bounds.min[k])||!Number.isFinite(next.bounds.max[k])||next.bounds.min[k]<before.bbox.min[k]-.003||next.bounds.max[k]>before.bbox.max[k]+.003)throw Error(`${before.id} footprint extension axis ${k}`);
 if(!next.bounds.min.every(Number.isFinite)||!next.bounds.max.every(Number.isFinite))throw Error('nonfinite bounds');
 return true;
}
export function chooseOperation(live:any,before:any,next:any):'noop'|'replace' {
 validatePlan(before,next);
 if(!live)throw Error(`${before.id} missing target`);
 if(!pose(live,before))throw Error(`${before.id} live pose drift`);
 if(stable(live.comp??{})!==stable(before.comp??{}))throw Error(`${before.id} component drift`);
 if(live.lib===next.lib)return 'noop';
 if(live.lib!==before.lib)throw Error(`${before.id} live lib drift`);
 for(const k of [0,1,2])for(const side of ['min','max'])if(Math.abs(live.bbox?.[side]?.[k]-before.bbox[side][k])>.003||!Number.isFinite(live.bbox?.[side]?.[k]))throw Error(`${before.id} live bbox drift`);
 return 'replace';
}
export function buildVerbs(live:any,next:any):Array<[string,any]> {
 if(live.comp?.lock)throw Error(`${live.id} locked — no automatic unlock`);
 const spawn={id:live.id,lib:next.lib,pos:live.pos,yaw:live.yaw,scale:live.scale};
 const verbs:Array<[string,any]>=[['remove',{id:live.id}],['spawn',spawn]];
 for(const [type,data] of Object.entries(live.comp??{}))verbs.push(['comp',{id:live.id,type,data}]);
 return verbs;
}
export function protectUnchanged(before:any,live:any):true {
 if(!live||!pose(live,before)||live.lib!==before.lib||live.kind!==before.kind||stable(live.comp??{})!==stable(before.comp??{}))throw Error(`${before.id} protected contract drift`);
 return true;
}
