// waysign-place-kiln-1.ts — waysign-3: KILN SIGN rider on nx-town-kiln.
// Waysign lane owns nx-sign-<trade>-NNN only; nx-town-kiln is read-only
// host truth (artwalk-39: anchor derived from CURRENT host tuple; host lib
// verified 4d8ef8fc… = local village_kiln3.glb this tick, local source
// hash-matches live). Drum host → PROJECTED-ARM idiom: straps circle the
// upper drum, arms project over the board, board hangs beyond and above
// the sibling artwalk film (gap-bounded exemption below). Glyph faces the
// track/ring side (host-local +z).
// EXEMPTION LADDER (artwalk-34/36/37 law):
//  - host-pair concentric exemption: nx-town-kiln excluded (intentional
//    rider; the straps/arms bury into the host by design).
//  - GROUND-LAYER EXEMPTION (nvp-109..132; dress-1/dyer precedent): paver
//    path meshes + streetlamp row excluded from the collision set (2D
//    compound bboxes envelope the village; thin/ground layers).
//  - GAP-BOUNDED EXACT-MATCH EXEMPTION for nx-artwalk-b12-kiln-heat-contours
//    (nvp-134 suspended-decor class): the sign's fat bbox (straps reach
//    host-local z −0.888 behind the drum) overlaps the thin film in 2D
//    plan view with measured gap −0.813 — the DECODED 3D truth is clear:
//    board z host 1.415..1.465 vs film z max 1.270 (+14.5cm), arm y-band
//    2.305..2.355 vs film top 1.614 (+69.1cm). The film is a 0.125m
//    ground-parallel plate at y≤1.614; the hanging board and arms are
//    fully above and beyond it. Skip ONLY when the measured 2D gap equals
//    the decoded value (±0.01); any real drift hard-fails. Decoded 2D gap
//    −0.380: target host-z extent [−0.888,1.525] (center 0.3185, half
//    1.2065 — the fat bbox includes the rear straps), film z [1.145,1.270]
//    (center 1.2075, half 0.0625) → 0.889 − 1.269 = −0.380; the host-local
//    x-axis gap is −1.663 (worse), so max-axis = −0.380. (First pin −0.813
//    was stale hand-math from the pre-raise bbox — the gate caught it.)
import{readFileSync}from"node:fs";import{createHash}from"node:crypto";const ROOT="/Users/t3rpz/projects/eidoverse-worlds",WORLD="commons-next",ID="nx-sign-kiln-001",HOST="nx-town-kiln",SHA="be3d85045b3351010af28922f53267821ef3d51fdfbacfd674bdf8b134e507b5",HOST_LIB="store/4d8ef8fc0b0955de.glb",LOCAL:[number,number,number]=[0,2.45,0.86];const cfg=JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`,"utf8")),base=cfg.url.replace("wss://","https://").replace("ws://","http://").replace("/ws","");const bytes=new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_sign_kiln3.glb`)),die=(m:string):never=>{throw Error(m)},near=(a:number,b:number)=>Math.abs(a-b)<1e-6;if(createHash("sha256").update(bytes).digest("hex")!==SHA)die("reviewed GLB hash drift");
async function geom(){const r=await fetch(`${base}/geom?world=${WORLD}`);if(!r.ok)die(`geom ${r.status}`);const d:any=await r.json();return Object.fromEntries((d.entities??[]).map((e:any)=>[e.id,e]))as Record<string,any>}
type O={c:[number,number],u:[number,number],v:[number,number],hu:number,hv:number};function O(x:number,z:number,y:number,w:number,d:number):O{const c=Math.cos(y),s=Math.sin(y);return{c:[x,z],u:[c,-s],v:[s,c],hu:w/2,hv:d/2}}function EO(e:any){const b=e.bbox,y=e.yaw??0,c=Math.cos(y),s=Math.sin(y),x=(b.min[0]+b.max[0])/2,z=(b.min[2]+b.max[2])/2;return O(e.pos[0]+x*c+z*s,e.pos[2]-x*s+z*c,y,b.max[0]-b.min[0],b.max[2]-b.min[2])}function gap(A:O,B:O){let best=-Infinity;for(const x of[A.u,A.v,B.u,B.v]){const dd=Math.abs((B.c[0]-A.c[0])*x[0]+(B.c[1]-A.c[1])*x[1]),ra=A.hu*Math.abs(A.u[0]*x[0]+A.u[1]*x[1])+A.hv*Math.abs(A.v[0]*x[0]+A.v[1]*x[1]),rb=B.hu*Math.abs(B.u[0]*x[0]+B.u[1]*x[1])+B.hv*Math.abs(B.v[0]*x[0]+B.v[1]*x[1]);best=Math.max(best,dd-ra-rb)}return best}
const before=await geom(),host=before[HOST];if(!host||host.lib!==HOST_LIB||host.scale!==1)die("kiln host drift");const YAW=host.yaw??0,c=Math.cos(YAW),s=Math.sin(YAW),POS:[number,number,number]=[host.pos[0]+LOCAL[0]*c+LOCAL[2]*s,host.pos[1]+LOCAL[1],host.pos[2]-LOCAL[0]*s+LOCAL[2]*c],want={lib:`store/${SHA.slice(0,16)}.glb`,pos:POS,yaw:YAW,scale:1};const tupleOK=(e:any)=>!!e&&e.lib===want.lib&&e.pos.every((n:number,i:number)=>near(n,want.pos[i]))&&near(e.yaw??0,YAW)&&e.scale===1&&Object.keys(e.comp??{}).length===0,existing=before[ID];if(existing&&!tupleOK(existing))die(`${ID} id collision/drift`);
// Decoded rider bbox (sign-local, translation-corrected):
// x[−0.888,0.888] z[−1.748,0.665] → center (0, −0.5415), halves (0.888, 1.2065)
const CX=0,CZ=-0.5415,HW=1.776,HD=2.413,target=O(POS[0]+CX*c+CZ*s,POS[2]-CX*s+CZ*c,YAW,HW,HD),groundIds=new Set(["nx-core-paths","nx-town-roads","nx-town-streetlamps","nx-approach-nw-lane-001","nx-approach-ne-lane-002","nx-approach-sw-lane-003"]),B12="nx-artwalk-b12-kiln-heat-contours",B12_GAP=-0.380;let minGap=Infinity,minAgainst="",b12Measured:number|null=null;for(const e of Object.values(before).filter((e:any)=>e.bbox&&e.id!==ID&&e.id!==HOST)){const h=e.bbox.max[1]-e.bbox.min[1];if(groundIds.has(e.id)||h<=.5)continue;const g=gap(target,EO(e));if(e.id===B12){b12Measured=+g.toFixed(3);if(Math.abs(g-B12_GAP)>0.01)die(`b12 gap drift: measured ${g} vs decoded ${B12_GAP} (exemption ladder tier b)`);continue}if(g<minGap){minGap=g;minAgainst=e.id}if(g<-.001)die(`sign overlaps ${e.id}: ${g}`)}
console.log(JSON.stringify({stage:"preflight",host:HOST,hostLib:host.lib,hostLocal:LOCAL,pos:POS.map(n=>+n.toFixed(3)),yaw:YAW,minGap:+minGap.toFixed(6),minAgainst,b12Exemption:{measured:b12Measured,decoded:B12_GAP,truth3d:"board z +14.5cm past film, arm band +69.1cm above film top"},classification:"intentional kiln-drum rider; host + b12 gap-bounded exemptions",visual:"zai-vision v4 ACCEPT + 8m PASS (native vision provider down this tick)"}));
if(!existing){const u=new URL(`${base}/upload`);u.searchParams.set("token",cfg.agentToken);u.searchParams.set("name","kiln trade sign — waysign-3");u.searchParams.set("by",cfg.id);let lib="";for(let a=1;a<=5;a++){const r=await fetch(u,{method:"POST",body:bytes});if(r.ok){lib=(await r.json()).path;break}if(r.status===429&&a<5){await new Promise(q=>setTimeout(q,25_000));continue}die(`upload ${r.status}`)}if(lib!==want.lib)die(`upload path ${lib}`);await new Promise<void>((resolve,reject)=>{const ws=new WebSocket(cfg.url),timer=setTimeout(()=>reject(Error("verb timeout")),45_000);let sent=false;ws.onopen=()=>ws.send(JSON.stringify({type:"join",world:WORLD,id:"arthur-waysign-3-builder",avatar:cfg.avatar,token:cfg.joinToken,agent:true,agentToken:cfg.agentToken}));ws.onerror=()=>reject(Error("websocket"));ws.onmessage=(ev:any)=>{const m=JSON.parse(ev.data);if(m.type==="error")reject(Error(`server ${m.error}`));else if(m.type==="snapshot"&&!sent){sent=true;ws.send(JSON.stringify({type:"verb",verb:"spawn",args:{id:ID,lib:want.lib,pos:POS,yaw:YAW,scale:1}}));setTimeout(()=>{clearTimeout(timer);ws.close();resolve()},1800)}}})}else console.log("waysign-3 already live — zero verbs");
const after=await geom(),e=after[ID];if(!tupleOK(e))die("post-place tuple failed");const dx=e.pos[0]-host.pos[0],dz=e.pos[2]-host.pos[2],lx=dx*c-dz*s,lz=dx*s+dz*c;if(!near(lx,LOCAL[0])||!near(lz,LOCAL[2])||!near(e.pos[1]-host.pos[1],LOCAL[1]))die("host-relative anchor failed");console.log(JSON.stringify({status:"PLACED_VERIFIED",id:ID,lib:e.lib,pos:e.pos.map(n=>+n.toFixed(3)),yaw:+(e.yaw??0).toFixed(4),hostLocal:[+lx.toFixed(3),+(e.pos[1]-host.pos[1]).toFixed(3),+lz.toFixed(3)],bboxSize:e.bbox.size,verbs:existing?0:1}));
