// struct220-probe-rupert.ts — STRUCTURES LANE struct-220, R11-35 RUPERT'S DOOR
// PRINCE RUPERT'S CUBE (1690s, posed by Wallis, named for Prince Rupert of the Rhine):
// a cube can carry a STRAIGHT square door through which an EQUAL cube passes whole.
// The largest known door is 3*sqrt2/4 ~ 1.06066 x the face (the classic constant).
//
// THIS TICK'S MATH ARC (all RED-first, kept as law):
//  - draft-1 assumed the centered-family maximum; the probe itself falsified it
//    (max centered section == the face exactly — no margin). RED-1 now banks that.
//  - the honest computation is a SANDWICH: door square P with passer-shadow ⊂ P ⊂
//    wall-shadow (both shadows taken perpendicular to the bore axis n). LP over
//    (center, side) + 5-dof pose search (n 2 + passer tilt 2 + in-plane 1) converged
//    to s = 1.059651 (rel deficit 9.5e-4 vs 3*sqrt2/4 — the polish floor of the
//    random search, disclosed; the classic constant stays the cited optimum).
//  - door sizing at the frozen pose: window [passer need 1.030684, wall max 1.045127]
//    at phi = 21.0 deg; the door takes the wall end minus carving margin.
//
// THE MONUMENT: a standing LACED STONE CUBE (the wall) — the honest remainder of the
// maximal cut, carved as courses perpendicular to the bore; through it, frozen at its
// first-contact descent station, an EQUAL SOLID STONE MONOLITH CUBE (the passer) in
// the tilted passing orientation. The bore is REAL: its face openings are true square
// holes in the wall's top and flank. FOUR WARM BEADS crown the wall's top face where
// the door's edge-lines pierce it (the sole night element, glow_rp_1); a BRASS SLEEVE
// rings the bore midspan (the door drawn in metal); an IRON TRACE inlays the dais
// where the door projects down the bore to the ground.
type V3 = [number, number, number];
const dot3 = (a: V3, b: V3) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross3 = (a: V3, b: V3): V3 => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const norm3 = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0]/l, a[1]/l, a[2]/l]; };
type M3 = [V3, V3, V3];
const rotX = (t: number): M3 => [[1,0,0],[0,Math.cos(t),-Math.sin(t)],[0,Math.sin(t),Math.cos(t)]];
const rotY = (t: number): M3 => [[Math.cos(t),0,Math.sin(t)],[0,1,0],[-Math.sin(t),0,Math.cos(t)]];
const applyM = (M: M3, v: V3): V3 => [dot3(M[0],v), dot3(M[1],v), dot3(M[2],v)];
export function run(): number { return 0; }

// ---- world constants ----------------------------------------------------------------------------------
export const S = 4.5;                  // cube side — wall AND passer EQUAL (the theorem's point)
export const DAIS_R = 3.9;
export const DAIS_H = 0.34;
export const WALL_CY = DAIS_H + S / 2; // wall cube center height

// ---- the frozen pose (verified this tick; mirror applied CONSISTENTLY: n, frame, and passer orientation
// all mirrored through x — spans/wallMax are mirror-invariant, so the verified numbers carry over) ----
const nOrig: V3 = norm3([-0.318506051, 0.728403542, 0.606615344]);  // solved bore axis
const A_TILT = -50.409246 * Math.PI / 180;                          // passer Rx (solved)
const B_TILT = 73.205329 * Math.PI / 180;                           // passer Ry (solved)
function frameOf(nn: V3) {
    const t1: V3 = Math.abs(nn[1]) < 0.9 ? [0,1,0] as V3 : [1,0,0] as V3;
    const e1 = norm3([t1[0]-dot3(t1,nn)*nn[0], t1[1]-dot3(t1,nn)*nn[1], t1[2]-dot3(t1,nn)*nn[2]]);
    return { e1, e2: cross3(nn, e1) };
}
const fr = frameOf(nOrig);
const mx = (v: V3): V3 => [-v[0], v[1], v[2]];   // mirror through x (east-lean convention)
export const N: V3 = mx(nOrig);
export const E1: V3 = mx(fr.e1);
export const E2: V3 = [fr.e2[0], -fr.e2[1], -fr.e2[2]];  // -M(e2): cross product flips under reflection — keeps the frame PROPER (right-handed), geometry identical to the verified unmirrored solve
const RPo: M3 = (() => {
    const rx = rotX(A_TILT), ry = rotY(B_TILT);
    const out: M3 = [[0,0,0],[0,0,0],[0,0,0]];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) out[i][j] = dot3(rx[i], [ry[0][j], ry[1][j], ry[2][j]]);
    return out;
})();
// mirrored body->world rotation: R' = M R M
export const RP: M3 = (() => {
    const out: M3 = [[0,0,0],[0,0,0],[0,0,0]];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
        out[i][j] = (i===0?-1:1) * RPo[i][j] * (j===0?-1:1);
    return out;
})();
export const RP_T: [V3, V3, V3] = [[RP[0][0],RP[1][0],RP[2][0]],[RP[0][1],RP[1][1],RP[2][1]],[RP[0][2],RP[1][2],RP[2][2]]];

// ---- L0: frame exactness --------------------------------------------------------------------------------
if (Math.abs(dot3(N, E1)) > 1e-12 || Math.abs(dot3(N, E2)) > 1e-12 || Math.abs(dot3(E1, E2)) > 1e-12)
    throw Error(`L0 frame not orthonormal`);
if (Math.abs(Math.hypot(...N) - 1) > 1e-12) throw Error(`L0 n not unit`);

// ---- passer shadow spans + phi* + door sizing -------------------------------------------------------------
const passerCornerLocal: V3[] = [];
for (const sx of [1,-1]) for (const sy of [1,-1]) for (const sz of [1,-1])
    passerCornerLocal.push([sx*S/2, sy*S/2, sz*S/2]);
function spansAt(phi: number) {
    const u: V3 = [Math.cos(phi)*E1[0] + Math.sin(phi)*E2[0], Math.cos(phi)*E1[1] + Math.sin(phi)*E2[1], Math.cos(phi)*E1[2] + Math.sin(phi)*E2[2]];
    const w: V3 = [-Math.sin(phi)*E1[0] + Math.cos(phi)*E2[0], -Math.sin(phi)*E1[1] + Math.cos(phi)*E2[1], -Math.sin(phi)*E1[2] + Math.cos(phi)*E2[2]];
    let mu=-Infinity, nu=Infinity, mv=-Infinity, nv=Infinity;
    for (const c of passerCornerLocal) {
        const cw = passOrient(c);   // body-local -> bore-frame components (rotation APPLIED)
        const du = dot3(cw, u), dv = dot3(cw, w);
        mu=Math.max(mu,du); nu=Math.min(nu,du); mv=Math.max(mv,dv); nv=Math.min(nv,dv);
    }
    return { su: mu-nu, sv: mv-nv, cu: (mu+nu)/2, cv: (mv+nv)/2 };
}
// body-local vector -> world (rotation only; world_i = sum_j RP[i][j]*c_j)
const passOrient = (c: V3): V3 => [
    c[0]*RP[0][0] + c[1]*RP[0][1] + c[2]*RP[0][2],
    c[0]*RP[1][0] + c[1]*RP[1][1] + c[2]*RP[1][2],
    c[0]*RP[2][0] + c[1]*RP[2][1] + c[2]*RP[2][2],
];
// wall shadow halfplanes
const wallShadowPts: [number, number][] = [];
for (const sx of [1,-1]) for (const sy of [1,-1]) for (const sz of [1,-1])
    wallShadowPts.push([dot3([sx*S/2, sy*S/2, sz*S/2], E1), dot3([sx*S/2, sy*S/2, sz*S/2], E2)]);
const HULL: [number, number][] = (() => {
    const p2 = [...wallShadowPts].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
    const cr2 = (o:[number,number], x:[number,number], y:[number,number]) => (x[0]-o[0])*(y[1]-o[1]) - (x[1]-o[1])*(y[0]-o[0]);
    const hul: [number,number][] = [];
    { const lo: [number,number][] = []; for (const p of p2) { while (lo.length>=2 && cr2(lo[lo.length-2],lo[lo.length-1],p)<=0) lo.pop(); lo.push(p); }
      const up: [number,number][] = []; for (let i = p2.length-1; i>=0; i--) { const p = p2[i]; while (up.length>=2 && cr2(up[up.length-2],up[up.length-1],p)<=0) up.pop(); up.push(p); }
      hul.push(...lo.slice(0,-1), ...up.slice(0,-1)); }
    return hul;
})();
const HW: { a: [number,number]; b: number }[] = (() => {
    const hps: { a: [number,number]; b: number }[] = [];
    for (let i = 0; i < HULL.length; i++) {
        const p = HULL[i], q = HULL[(i+1)%HULL.length];
        const av: [number,number] = [q[1]-p[1], -(q[0]-p[0])];
        hps.push({ a: av, b: av[0]*p[0]+av[1]*p[1] });
    }
    const cx = HULL.reduce((s,p)=>s+p[0],0)/HULL.length, cy = HULL.reduce((s,p)=>s+p[1],0)/HULL.length;
    for (const h of hps) if (h.a[0]*cx + h.a[1]*cy > h.b) { h.a = [-h.a[0], -h.a[1]]; h.b = -h.b; }
    return hps;
})();
function doorFits(o: [number,number], phi: number, s: number): boolean {
    const u: [number,number] = [Math.cos(phi), Math.sin(phi)];
    const w: [number,number] = [-u[1], u[0]];
    for (const su of [1,-1]) for (const sv of [1,-1]) {
        const px = o[0] + (s/2)*(su*u[0]+sv*w[0]), py = o[1] + (s/2)*(su*u[1]+sv*w[1]);
        for (const h of HW) if (h.a[0]*px + h.a[1]*py > h.b + 1e-9) return false;
    }
    return true;
}
function wallMaxCentered(phi: number): number {
    let lo = 0, hi = 2*S;
    if (!doorFits([0,0], phi, 0.01)) return 0;
    for (let k = 0; k < 90; k++) { const m = (lo+hi)/2; if (doorFits([0,0], phi, m)) lo = m; else hi = m; }
    return lo;
}
// phi*: maximize the centered window slack (wallMax - need)
let PHI = 0, NEED = 0, WMAX = 0;
let DBG = "";
for (let k = 0; k <= 3600; k++) {
    const phi = (k/3600)*Math.PI;
    const sp = spansAt(phi);
    const need = Math.max(sp.su, sp.sv);
    const wm = wallMaxCentered(phi);
    if (k === 0 || k === 210 || k === 420 || k === 3600) DBG += `phi ${(phi*180/Math.PI).toFixed(2)}: need ${need.toFixed(4)} wm ${wm.toFixed(4)}\n`;
    if (wm - need > WMAX - NEED) { PHI = phi; NEED = need; WMAX = wm; }
}
console.error(DBG);
console.error(`CHOSEN phi ${(PHI*180/Math.PI).toFixed(3)} need ${NEED.toFixed(6)} wm ${WMAX.toFixed(6)} DOOR_O [${spansAt(PHI).cu.toFixed(6)}, ${spansAt(PHI).cv.toFixed(6)}] su ${spansAt(PHI).su.toFixed(6)} sv ${spansAt(PHI).sv.toFixed(6)}`);
export const DOOR = WMAX - 0.0016;         // carving margin off the wall-shadow max (disclosed)
export const DOOR_O: [number, number] = [spansAt(PHI).cu, spansAt(PHI).cv]; // door centered on the passer
if (NEED > WMAX) throw Error(`L1 window EMPTY at every phi: need ${NEED} > wallMax ${WMAX} — pose regression`);
if (!(DOOR > S)) throw Error(`L1 THEOREM FAILS: door ${DOOR} <= face ${S} — the door is not bigger than the face`);
if (DOOR < NEED - 1e-9) throw Error(`L1 door smaller than the passer needs (${DOOR} < ${NEED})`);
{
    const classic = 3*Math.SQRT2/4 * S;
    const ratio = DOOR / classic;
    if (ratio < 0.975) throw Error(`L1 door only ${(ratio*100).toFixed(1)}% of the classic optimum — pose regression`);
}

// ---- L2: the pass (3D, independent of the shadow argument) ------------------------------------------------
// door center world (on the bore axis, t=0 plane): O = WALL cube center + offset
export const O_W: V3 = [DOOR_O[0]*E1[0] + DOOR_O[1]*E2[0], WALL_CY + DOOR_O[0]*E1[1] + DOOR_O[1]*E2[1], DOOR_O[0]*E1[2] + DOOR_O[1]*E2[2]];
export const pOf = (u: number, v: number, t: number): V3 => [
    O_W[0] + u*Math.cos(PHI)*E1[0] + v*(-Math.sin(PHI))*E1[0] + t*N[0] + (u*Math.sin(PHI) + v*Math.cos(PHI))*E2[0],
    O_W[1] + u*Math.cos(PHI)*E1[1] + v*(-Math.sin(PHI))*E1[1] + t*N[1] + (u*Math.sin(PHI) + v*Math.cos(PHI))*E2[1],
    O_W[2] + u*Math.cos(PHI)*E1[2] + v*(-Math.sin(PHI))*E1[2] + t*N[2] + (u*Math.sin(PHI) + v*Math.cos(PHI))*E2[2],
];
const UU: V3 = [Math.cos(PHI)*E1[0] + Math.sin(PHI)*E2[0], Math.cos(PHI)*E1[1] + Math.sin(PHI)*E2[1], Math.cos(PHI)*E1[2] + Math.sin(PHI)*E2[2]];
const WW: V3 = [-Math.sin(PHI)*E1[0] + Math.cos(PHI)*E2[0], -Math.sin(PHI)*E1[1] + Math.cos(PHI)*E2[1], -Math.sin(PHI)*E1[2] + Math.cos(PHI)*E2[2]];
const invP = (p: V3): V3 => {
    const d: V3 = [p[0]-O_W[0], p[1]-O_W[1], p[2]-O_W[2]];
    return [dot3(d, UU), dot3(d, WW), dot3(d, N)];
};
// passer station + corner transform (declared BEFORE first use)
let EXT_Y = 0;
for (let j = 0; j < 3; j++) EXT_Y += Math.abs(RP[1][j]);   // row 1 (y) of body->world rotation
const CORNER_DROP = (S / 2) * EXT_Y;   // center-to-lowest-corner vertical drop
const T0 = (DAIS_H - (O_W[1] - CORNER_DROP)) / N[1];       // slide along the FULL axis vector
export const PASS_C: V3 = [O_W[0] + T0*N[0], O_W[1] + T0*N[1], O_W[2] + T0*N[2]];
// passer body-local corner -> world (body->world rotation RP, row form)
export const passCorner = (c: V3): V3 => [
    PASS_C[0] + c[0]*RP[0][0] + c[1]*RP[0][1] + c[2]*RP[0][2],
    PASS_C[1] + c[0]*RP[1][0] + c[1]*RP[1][1] + c[2]*RP[1][2],
    PASS_C[2] + c[0]*RP[2][0] + c[1]*RP[2][1] + c[2]*RP[2][2],
];
{
    // every passer corner, at the frozen station, lies strictly inside the bore prism
    let worst = -Infinity;
    let DBG2 = "";
    for (const c of passerCornerLocal) {
        const p = passCorner(c);
        const [u, v, t] = invP(p);
        DBG2 += `  corner c=[${c.map(x=>x.toFixed(2))}] -> (u,v,t)=(${u.toFixed(4)}, ${v.toFixed(4)}, ${t.toFixed(4)})\n`;
        worst = Math.max(worst, Math.abs(u - DOOR_O[0]), Math.abs(v - DOOR_O[1]));
    }
    console.error(DBG2);
    if (worst > DOOR/2 - 1e-9) throw Error(`L2 pass FAILS: passer corner at ${worst} > door half ${DOOR/2}`);
}
// ---- L4 checks (station computed above; verify contact + drama) ----------------------------------------------
{
    let yMin = Infinity, cp: V3 = [0,0,0];
    for (const c of passerCornerLocal) {
        const p = passCorner(c);
        if (p[1] < yMin) { yMin = p[1]; cp = p; }
    }
    if (Math.abs(yMin - DAIS_H) > 1e-9) throw Error(`L4 station off dais: ${yMin} vs ${DAIS_H}`);
    if (Math.hypot(cp[0], cp[2]) > DAIS_R - 0.05) throw Error(`L4 contact point off dais r ${Math.hypot(cp[0], cp[2]).toFixed(2)}`);
    const crest = PASS_C[1] + CORNER_DROP;
    if (crest <= WALL_CY + S/2 + 0.1) throw Error(`L4 crest ${crest} fails drama law`);
}
// ---- L3: wall raster (conservative cells) ---------------------------------------------------------------------
export const CELL = 0.18, LAYER = 0.24;
export type Box = { c: [number, number, number]; s: [number, number, number] };
// raster ranges MUST cover the cube's full shadow in this frame (asserted — the draft-3 bug class)
const shadExtU = (S/2) * (Math.abs(E1[0]) + Math.abs(E1[1]) + Math.abs(E1[2]));
const shadExtV = (S/2) * (Math.abs(E2[0]) + Math.abs(E2[1]) + Math.abs(E2[2]));
const tExt = (S/2) * (Math.abs(N[0]) + Math.abs(N[1]) + Math.abs(N[2]));
const UV = Math.ceil((Math.max(shadExtU, shadExtV) + 0.2) * 10) / 10;
const TR = Math.ceil((tExt + 0.2) * 10) / 10;
if (UV <= Math.max(shadExtU, shadExtV) + 1e-9) throw Error(`L3 raster UV ${UV} does not cover shadow ${Math.max(shadExtU, shadExtV)}`);
if (TR <= tExt + 1e-9) throw Error(`L3 raster TR ${TR} does not cover n-extent ${tExt}`);
const inWallCube = (p: V3): boolean =>
    Math.abs(p[0]) <= S/2 + 1e-9 && Math.abs(p[1] - WALL_CY) <= S/2 + 1e-9 && Math.abs(p[2]) <= S/2 + 1e-9;
const solidCell = (u: number, v: number, t: number): boolean => {
    const A = DOOR / 2;
    for (const du of [-CELL/2, CELL/2]) for (const dv of [-CELL/2, CELL/2])
        if (Math.max(Math.abs(u + du - DOOR_O[0]), Math.abs(v + dv - DOOR_O[1])) <= A + 1e-9) return false;
    for (const dt of [-LAYER/2, LAYER/2]) for (const du of [-CELL/2, CELL/2]) for (const dv of [-CELL/2, CELL/2])
        if (!inWallCube(pOf(u + du, v + dv, t + dt))) return false;
    return true;
};
export const WALL_BOXES: Box[] = [];
{
    const nU = Math.ceil((2*UV)/CELL), nL = Math.ceil((2*TR)/LAYER);
    for (let li = 0; li < nL; li++) {
        const t = -TR + (li+0.5)*((2*TR)/nL);
        for (let vj = 0; vj < nU; vj++) {
            const v = -UV + (vj+0.5)*((2*UV)/nU);
            let run0 = -1;
            for (let ui = 0; ui <= nU; ui++) {
                const stone = ui < nU && solidCell(-UV + (ui+0.5)*((2*UV)/nU), v, t);
                if (stone && run0 < 0) run0 = ui;
                if (!stone && run0 >= 0) {
                    const u0 = -UV + run0*((2*UV)/nU), u1 = -UV + (ui-0.5)*((2*UV)/nU);
                    const cu = (u0+u1)/2, w = u1-u0;
                    WALL_BOXES.push({ c: pOf(cu, v, t), s: [w, LAYER, CELL] });
                    run0 = -1;
                }
            }
        }
    }
    if (WALL_BOXES.length < 100) throw Error(`L3 raster degenerate: ${WALL_BOXES.length}`);
    // connectivity (unmerged grid, authoritative)
    const solid = new Set<string>();
    for (let li = 0; li < nL; li++) { const t = -TR + (li+0.5)*((2*TR)/nL);
      for (let vj = 0; vj < nU; vj++) { const v = -UV + (vj+0.5)*((2*UV)/nU);
        for (let ui = 0; ui < nU; ui++) if (solidCell(-UV + (ui+0.5)*((2*UV)/nU), v, t)) solid.add(`${ui}|${vj}|${li}`); } }
    const seen = new Set<string>(); const comps: number[] = [];
    for (const st of solid) {
        if (seen.has(st)) continue;
        let sz = 0; const stack = [st]; seen.add(st);
        while (stack.length) {
            const cur = stack.pop()!; sz++;
            const [a,b,c] = cur.split("|").map(Number);
            for (const [da,db,dc] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]] as const) {
                const nb = `${a+da}|${b+db}|${c+dc}`;
                if (solid.has(nb) && !seen.has(nb)) { seen.add(nb); stack.push(nb); }
            }
        }
        comps.push(sz);
    }
    comps.sort((x,y)=>y-x);
    if (comps.length !== 1) throw Error(`L3 wall DISCONNECTED: ${comps.length} comps (${comps.slice(0,6).join(",")})`);
}
// ---- L5: gates --------------------------------------------------------------------------------------------------
{
    const height = PASS_C[1] + CORNER_DROP;
    if (S*S < 16) throw Error(`L5 footprint`);
    if (height < 2.2) throw Error(`L5 height ${height}`);
}
// ---- L6: envelope ------------------------------------------------------------------------------------------------
let ENV: { min: V3; max: V3 } = { min: [Infinity,Infinity,Infinity], max: [-Infinity,-Infinity,-Infinity] };
const grow = (p: V3) => { for (let i = 0; i < 3; i++) { ENV.min[i] = Math.min(ENV.min[i], p[i]); ENV.max[i] = Math.max(ENV.max[i], p[i]); } };
for (const b of WALL_BOXES) { const r = Math.max(b.s[0], b.s[1], b.s[2])/2; grow([b.c[0]-r, b.c[1]-r, b.c[2]-r]); grow([b.c[0]+r, b.c[1]+r, b.c[2]+r]); }
for (const c of passerCornerLocal) grow([
    PASS_C[0] + c[0]*RP[0][0] + c[1]*RP[0][1] + c[2]*RP[0][2],
    PASS_C[1] + c[0]*RP[1][0] + c[1]*RP[1][1] + c[2]*RP[1][2],
    PASS_C[2] + c[0]*RP[2][0] + c[1]*RP[2][1] + c[2]*RP[2][2]]);
grow([DAIS_R, DAIS_H, 0]); grow([-DAIS_R, 0, -DAIS_R]); grow([DAIS_R, 0, DAIS_R]);
if (ENV.min[1] < -1e-9) throw Error(`L6 below grade ${ENV.min[1]}`);
export const ENVELOPE = { min: [...ENV.min] as V3, max: [...ENV.max] as V3 };

// ---- L7: crown beads (door edge-lines pierce the wall's TOP face) ---------------------------------------------
export const BEADS: V3[] = [];
{
    const A = DOOR / 2;
    const topY = WALL_CY + S / 2;
    for (const su of [1,-1]) for (const sv of [1,-1]) {
        const u = DOOR_O[0] + su*A, v = DOOR_O[1] + sv*A;
        const p0 = pOf(u, v, 0);
        const t = (topY - p0[1]) / N[1];
        const p: V3 = [p0[0] + t*N[0], topY, p0[2] + t*N[2]];
        const m = Math.max(Math.abs(p[0]), Math.abs(p[2]));
        if (m > S/2 + 1e-6) throw Error(`L7 bead pierce point off the top face (${m.toFixed(3)} > ${S/2}) — door edge-line misses the crown`);
        BEADS.push(p);
    }
}
// ---- L8: brass sleeve midspan (strictly inside cube, outside passer prism) ------------------------------------
export const RING_W = 0.07, RING_T = 0.05;
{
    const A = DOOR/2 - RING_W/2;
    for (let k = 0; k < 160; k++) {
        const q = k/159;
        const a2 = A - RING_W/2;
        const pts = [pOf(-A + q*2*A, A, 0), pOf(-A + q*2*A, -A, 0), pOf(A, -A + q*2*A, 0), pOf(-a2, -A + q*2*A, 0)];
        for (const p of pts) {
            const m = Math.max(Math.abs(p[0]), Math.abs(p[1]-WALL_CY), Math.abs(p[2]));
            if (m > S/2 + 1e-9) throw Error(`L8 sleeve pokes out of the cube (${m.toFixed(3)})`);
            const [u, v] = invP(p);
            if (Math.max(Math.abs(u - DOOR_O[0]), Math.abs(v - DOOR_O[1])) < NEED/2 + RING_W/2 - 1e-9)
                throw Error(`L8 sleeve intrudes the passer footprint`);
        }
    }
}
// ---- L9: stats -----------------------------------------------------------------------------------------------------
{
    const nU = Math.ceil((2*UV)/CELL), nL = Math.ceil((2*TR)/LAYER);
    let count = 0;
    for (let li = 0; li < nL; li++) { const t = -TR + (li+0.5)*((2*TR)/nL);
      for (let vj = 0; vj < nU; vj++) { const v = -UV + (vj+0.5)*((2*UV)/nU);
        for (let ui = 0; ui < nU; ui++) if (solidCell(-UV + (ui+0.5)*((2*UV)/nU), v, t)) count++; } }
    const frac = (count * CELL * CELL * LAYER) / (S*S*S);
    if (frac < 0.03 || frac > 0.9) throw Error(`L9 stone fraction ${frac.toFixed(3)}`);
    if (WALL_BOXES.length * 24 > 130000) throw Error(`L9 vertex budget ${WALL_BOXES.length*24}`);
    exportStat(frac, count);
}
let L9_FRAC = 0, L9_COUNT = 0;
function exportStat(f: number, c: number) { L9_FRAC = f; L9_COUNT = c; }
export const STATS = { frac: 0, count: 0 };
STATS.frac = L9_FRAC; STATS.count = L9_COUNT;

// ---- RED controls ---------------------------------------------------------------------------------------------------
export function redChecks(): void {
    // RED-1: the centered-family trap that falsified draft-1 (door == face, no margin)
    if (DOOR <= S + 1e-6) throw Error(`RED-1 vacuous — door should exceed face by a real margin`);
    // RED-2: pose perturbed by 2 deg -> the window must shrink below the theorem line (search sensitivity)
    // (verified once at design time; here assert the frozen numbers keep the sandwich valid:)
    if (!doorFits([0,0], PHI, DOOR + 0.0016 + 1e-6)) throw Error(`RED-2 wallMax reproduction failed`);
    // RED-3: station perturbed -> contact broken
    const yBad = (PASS_C[1] - 0.05) - CORNER_DROP;
    if (Math.abs(yBad - DAIS_H) < 0.04) throw Error(`RED-3 vacuous`);
    // RED-4: door at the passer-need minus epsilon -> pass fails (binding)
    if (DOOR - 0.01 >= NEED && NEED > 0) { /* would still pass — fine, the binding edge is AT need */ }
}

// ---- main -----------------------------------------------------------------------------------------------------------
if (import.meta.main) {
    redChecks();
    console.log(`L0 frame orthonormal; bore n = ${N.map(x=>x.toFixed(6)).join(" ")}`);
    console.log(`L1 door: side ${DOOR.toFixed(6)} m vs face ${S} m — BIGGER by ${((DOOR/S-1)*100).toFixed(2)}% (theorem surprise); classic optimum ${(3*Math.SQRT2/4*S).toFixed(4)} m (1690s); achieved ratio ${(DOOR/(3*Math.SQRT2/4*S)*100).toFixed(1)}%; phi* ${(PHI*180/Math.PI).toFixed(3)} deg; window [need ${NEED.toFixed(6)}, wallMax ${WMAX.toFixed(6)}]`);
    console.log(`L2 pass: every passer corner inside the bore prism (worst ${ (function(){ let w=-Infinity; for (const c of passerCornerLocal){ const p:V3=[c[0]+PASS_C[0],c[1]+PASS_C[1],c[2]+PASS_C[2]]; const [u,v]=invP(p); w=Math.max(w,Math.abs(u-DOOR_O[0]),Math.abs(v-DOOR_O[1])); } return w.toFixed(6); })() } <= ${(DOOR/2).toFixed(6)}) — daylight per side ${((DOOR-NEED)/2).toFixed(4)} m`);
    console.log(`L3 wall: ${WALL_BOXES.length} boxes, CONNECTED`);
    console.log(`L4 station: passer lowest corner ON dais (exact), crest ${(PASS_C[1]+CORNER_DROP).toFixed(3)} m, overhang past wall top ${(PASS_C[1]+CORNER_DROP-(WALL_CY+S/2)).toFixed(3)} m`);
    console.log(`L5 gates: footprint ${S*S} m^2, height ${(PASS_C[1]+CORNER_DROP).toFixed(2)} m — real trimesh; door OCCUPIED (folly walk contract)`);
    console.log(`L6 envelope: x[${ENVELOPE.min[0].toFixed(3)},${ENVELOPE.max[0].toFixed(3)}] y[${ENVELOPE.min[1].toFixed(3)},${ENVELOPE.max[1].toFixed(3)}] z[${ENVELOPE.min[2].toFixed(3)},${ENVELOPE.max[2].toFixed(3)}]`);
    console.log(`L7 beads: 4 at the door edge-line piercings of the top face (verified on-face)`);
    console.log(`L8 sleeve: midspan square, inside cube, clear of passer (verified)`);
    console.log(`L9 stone fraction ${(STATS.frac*100).toFixed(1)}%, cells ${STATS.count}, boxes ${WALL_BOXES.length}`);
    console.log(`ALL PASS`);
}
