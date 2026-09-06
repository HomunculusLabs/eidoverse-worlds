// waysign-place-potter-1.ts — waysign-4: POTTER SIGN beside nx-town-potter.
// Waysign lane owns nx-sign-<trade>-NNN only; nx-town-potter is read-only
// host truth (artwalk-39: anchor derived from CURRENT host tuple; host lib
// verified dad7c82e… = local village_potter3.glb sha this tick). Host is an
// OPEN WORK STAND (max h 1.015, no wall/eave) → PLANTED-POST idiom: iron
// post at host-local [1.9, 0, 0.55] — the +x edge of the +z work apron,
// clear of every decoded solid (nearest pw_jug x1.6 z−0.7), opposite side
// from the kiln sign (host-local x ≈ −4.9). Glyph faces the plaza (host
// yaw; board plane normal = host-local +z).
// EXEMPTION LADDER (artwalk-34/36/37 law):
//  - host-pair exemption: nx-town-potter excluded from the collision set
//    (intentional adjacency — the sign's fat bbox overlaps the host's
//    compound envelope only in the EMPTY apron corner x 1.64..1.71 /
//    z 0.42..0.706; decoded solids nearest: jug x1.6 z−0.7, clay x0.95
//    z+0.4; true post surface sits 0.19m proud of the envelope on x).
//  - GROUND-LAYER EXEMPTION (nvp-109..132; dyer precedent): paver path
//    meshes + streetlamp row excluded (thin/ground layers).
// nx-town-potter-l carries no bbox (light) — filtered by the bbox gate.
// RESITE (SAT refusal → sibling reconciliation): nx-artwalk-b3-ruled-porch
// is a pavilion OVER the stand (posts b3-local ±2/±1.8 = potter-local
// (−0.45,−1.45)/(3.55,−1.45)/(3.55,2.15)/(−0.45,2.15), canopy y 2.35..2.9,
// envelope potter-local z ≤ 2.424). First siting [1.9,0,0.55] stood INSIDE
// the pavilion with the 2.42m post top into the canopy (2D measured −2.005).
// New anchor [1.5, 0, 3.1]: between the two +z porch posts, OUTSIDE the
// envelope on the plaza-approach side (2D gap ≈ +0.28m to b3, 2.1m clear
// to nearest post pad), clear of host solids by 2.4m. Planted post stays
// domain-independent (no pin on the sibling b3 entity).
import{readFileSync}from"node:fs";import{createHash}from"node:crypto";const ROOT="/Users/t3rpz/projects/eidoverse-worlds",WORLD="commons-next",ID="nx-sign-potter-001",HOST="nx-town-potter",SHA="bc05a4f316d9655810176c22c0c3998db831a90c09de2f19141df693cd88d679",HOST_LIB="store/dad7c82efbf3202b.glb",LOCAL:[number,number,number]=[1.5,0,3.1];const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8")),base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");const bytes=new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_sign_potter3.glb`)),die=(m:string):never=>{throw Error(m)},near=(a:number,b:number)=>Math.abs(a-b)<1e-6;if(createHash("sha256").update(bytes).digest("hex")!==SHA)die("reviewed GLB hash drift");
async function geom(){const r=await fetch(`${base}/geom?world=${WORLD}`);if(!r.ok)die(`geom ${r.status}`);const d:any=await r.json();return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e]))as Record<string,any>}
type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};function O(x:number,z:number,y:number,w:number,d:number):O{const c=Math.cos(y),s=Math.sin(y);return{c:[x,z],u:[c,-s],v:[s,c],hu:w/2,hv:d/2}}function EO(e:any){const b=e.bbox,y=e.yaw??0,c=Math.cos(y),s=Math.sin(y),x=(b.min[0]+b.max[0])/2,z=(b.min[2]+b.max[2])/2;return O(e.pos[0]+x*c+z*s,e.pos[2]-x*s+z*c,y,b.max[0]-b.min[0],b.max[2]-b.min[2])}function gap(A:O,B:O){let best=-Infinity;for(const x of[A.u,A.v,B.u,B.v]){const dd=Math.abs((B.c[0]-A.c[0])*x[0]+(B.c[1]-A.c[1])*x[1]),ra=A.hu*Math.abs(A.u[0]*x[0]+A.u[1]*x[1])+A.hv*Math.abs(A.v[0]*x[0]+A.v[1]*x[1]),rb=B.hu*Math.abs(B.u[0]*x[0]+B.u[1]*x[1])+B.hv*Math.abs(B.v[0]*x[0]+B.v[1]*x[1]);best=Math.max(best,dd-ra-rb)}return best}
const before=await geom(),host=before[HOST];if(!host||host.lib!==HOST_LIB||host.scale!==1)die("potter host drift");const YAW=host.yaw??0,c=Math.cos(YAW),s=Math.sin(YAW),POS:[number,number,number]=[host.pos[0]+LOCAL[0]*c+LOCAL[2]*s,host.pos[1]+LOCAL[1],host.pos[2]-LOCAL[0]*s+LOCAL[2]*c],want={lib:`store/${SHA.slice(0,16)}.glb`,pos:POS,yaw:YAW,scale:1};const tupleOK=(e:any)=>!!e&&e.lib===want.lib&&e.pos.every((n:number,i:number)=>near(n,want.pos[i]))&&near(e.yaw??0,YAW)&&e.scale===1&&Object.keys(e.comp??{}).length===0,existing=before[ID];if(existing&&!tupleOK(existing))die(`${ID} id collision/drift`);
// Decoded rider bbox (sign-local, translation-corrected):
// x[−0.26,0.26] z[−0.13,0.671] → center (0, 0.2705), halves (0.26, 0.4005)
const CX=0,CZ=0.2705,HW=0.52,HD=0.801,target=O(POS[0]+CX*c+CZ*s,POS[2]-CX*s+CZ*c,YAW,HW,HD),groundIds=new Set(["nx-core-paths","nx-town-roads","nx-town-streetlamps","nx-approach-nw-lane-001","nx-approach-ne-lane-002","nx-approach-sw-lane-003"]);let minGap=Infinity,minAgainst="";for(const e of Object.values(before).filter((e:any)=>e.bbox&&e.id!==ID&&e.id!==HOST)){const h=e.bbox.max[1]-e.bbox.min[1];if(groundIds.has(e.id)||h<=.5)continue;const g=gap(target,EO(e));if(g<minGap){minGap=g;minAgainst=e.id}if(g<-.001)die(`sign overlaps ${e.id}: ${g}`)}
console.log(JSON.stringify({stage:"preflight",host:HOST,hostLib:host.lib,hostLocal:LOCAL,pos:POS.map(n=>+n.toFixed(3)),yaw:YAW,minGap:+minGap.toFixed(6),minAgainst,classification:"intentional open-stand planted-post adjacency; host exemption explicit",visual:"zai-vision v6 ACCEPT + 8m gate PASS (native vision provider down 4th consecutive tick, error 1210)"}));
if(!existing){const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name","potter trade sign — waysign-4");u.searchParams.set("by",cfg.id);let lib="";for(let a=1;a<=5;a++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a<5){await new Promise(q=>setTimeout(q,25_000));continue}die(`upload ${r.status}`)}if(lib!==want.lib)die(`upload path ${lib}`);await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url),timer=setTimeout(()=>reject(Error("verb timeout")),45_000);let sent=false;ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-waysign-4-builder",avatar:cfg.avatar,token:cfg.joinToken,agent:true,agentToken:cfg.agentToken}));ws.onerror=()=>reject(Error("websocket"));ws.onmessage=(ev:any)=>{const m=JSON.parse(ev.data);if(m.type==="error")reject(Error(`server ${m.error}`));else if(m.type==="snapshot"&&!sent){sent=true;ws.send(JSON.stringify({type:"verb",verb:"spawn",args:{id:ID,lib:want.lib,pos:POS,yaw:YAW,scale:1}}));setTimeout(()=>{clearTimeout(timer);ws.close();resolve()},1800)}}})}else console.log("waysign-4 already live — zero verbs");
const after=await geom(),e=after[ID];if(!tupleOK(e))die("post-place tuple failed");const dx=e.pos[0]-host.pos[0],dz=e.pos[2]-host.pos[2],lx=dx*c-dz*s,lz=dx*s+dz*c;if(!near(lx,LOCAL[0])||!near(lz,LOCAL[2])||!near(e.pos[1]-host.pos[1],LOCAL[1]))die("host-relative anchor failed");console.log(JSON.stringify({status:"PLACED_VERIFIED",id:ID,lib:e.lib,pos:e.pos.map(n=>+n.toFixed(3)),yaw:+(e.yaw??0).toFixed(4),hostLocal:[+lx.toFixed(3),+(e.pos[1]-host.pos[1]).toFixed(3),+lz.toFixed(3)],bboxSize:e.bbox.size,verbs:existing?0:1}));
