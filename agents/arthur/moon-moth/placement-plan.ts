// Pure, fail-closed NEW-only Moon Moth integration. Never replaces a live entity.
import { isDeepStrictEqual as eq } from 'node:util';
const ID='nx-moonmoth-001';
export const BUILDER_ID='arthur-moonmoth-builder';
export function placementPlan(state:any, desired:any):Array<[string,any]> {
  if(!state || !state.entities || typeof state.entities!=='object' || Array.isArray(state.entities)) throw new Error('Missing snapshot entity map');
  if(desired.behavior?.id!==ID+'-flight'||desired.behavior?.attach!==ID||!eq(desired.behavior?.caps,{verbs:['motion'],selfOnly:true})) throw new Error('Out-of-scope behavior authority');
  const verbs:Array<[string,any]>=[];
  const {comp,...base}=desired.entity;
  const live=state.entities[ID];
  // These legacy root fields can override client realization despite an exact
  // modern base/comp bag. The approved folded target has none, even null ones.
  for(const key of ['motion','size','parent']) if(live && key in live) throw new Error(`Unexpected Moon Moth root field: ${key}`);
  for(const key of Object.keys(live?.comp??{})) if(!(key in comp)) throw new Error(`Unexpected Moon Moth comp: ${key}`);
  if(!live) verbs.push(['spawn',{id:ID,...base}]);
  else for(const [key,value] of Object.entries(base)) if(!eq(live[key],value)) throw new Error(`Moon Moth live base drift: ${key}`);
  for(const [key,value] of Object.entries(comp)) {
    if(!live?.comp || !(key in live.comp)) verbs.push(['comp',{id:ID,type:key,data:value}]);
    else if(!eq(live.comp[key],value)) throw new Error(`Moon Moth component drift: ${key}`);
  }
  for(const [id,binding] of Object.entries(state.behaviors??{}) as [string,any][]) {
    if(id!==desired.behavior.id && binding?.attach===ID) throw new Error(`Unexpected attached behavior: ${id}`);
  }
  const bound=state.behaviors?.[desired.behavior.id];
  if(bound && 'runtime' in bound) throw new Error('Moon Moth behavior runtime drift');
  if(bound && bound.author!==BUILDER_ID) throw new Error('Moon Moth behavior author drift');
  if(!bound) verbs.push(['behavior',desired.behavior]);
  else for(const [key,value] of Object.entries(desired.behavior)) if(key!=='id'&&!eq(bound[key],value)) throw new Error(`Moon Moth behavior drift: ${key}`);
  return verbs;
}
