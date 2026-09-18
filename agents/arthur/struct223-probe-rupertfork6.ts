// struct223-probe-rupertfork6.ts — STRUCTURES LANE struct-223, R11-37 RUPERT'S FORK v6
// (the struct-222 commission executed: THE DEEP PRISM).
//
// THE ARC (standing record, struct-220..222): five judge rounds rejected the CUBE wall —
//   v1 sliver fins, v2 tilted-passer occlusion, v3 nose-out stance law (corner crest
//   towers: L1 ≥ L2), v4 face-stance same-texture flush, v5 iron+flank law but bore
//   occlusion (passer angularly covers the waist-local fin corners). Converged root
//   cause: at CUBE proportions the fins are corner wedges — waist-local (t ∈ [−0.59,
//   0.59]) because the cube's diagonal faces pinch them to the corner — so the fork has
//   no depth mass and the mouth has no throat.
//
// V6 — THE DEEP PRISM: the wall is the SQUARE FACE SWEPT ALONG ITS DIAGONAL — the
//   world-xz square [±S/2]², height S, extruded along NN=(1,0,1)/√2 for total length
//   L = 2.0·S. The same 1.03·S door now carves a THROUGH-PORTAL: two fins, each
//   0.864m thick (true) × S tall × L long — FULL-LENGTH walls, not corner wedges —
//   flanking a 4.5m-clear × 9m-deep throat. The passer (IRON, 1.0291·S, face stance)
//   rides the bore at the throat's outer third, nose 1.335m proud of the +mouth:
//   from the approach a long portal with the bigger cube caught sliding through it;
//   from the bore axis the fins' mouth corners now stand ANGULARLY OUTSIDE the passer
//   at every walkable distance ≥ 4m (law L7 — the exact v5 rejection, fixed by depth:
//   the fins reach the mouth, so their outer corners are NEAR, not 1.4m-deep wedges).
//
// COMMISSION-NOTE DEVIATION (recorded, arithmetic): the struct-222 note's "target fin
//   width ≥ 1.2m" is UNREACHABLE with a square face and a bigger-than-face passer:
//   finWidth = S·√½ − doorHalf = 3.182 − 2.3175 = 0.864, and ≥ 1.2 needs door ≤ 3.964
//   < S (the passer stops being bigger than the wall — the v5 root-cause tension
//   again; rotating the sweep square only trades v-mass for u-mass). The mass target
//   is met by DEPTH instead: 9m full-length fins, ~13× the v5 fin volume. Rasterized
//   thickness 0.714m (conservative inward rounding), disclosed.
//
// THE CLAIM (honest): a cube 2.91% BIGGER than the wall's FACE (the S×S square the
//   wall sweeps) passes through the wall — machine-verified by the interval law
//   (passer shadow ⊆ door; every kept-stone corner |v| > doorHalf) at every station
//   of the slide. The wall rides 7.75cm plinths so the bigger cube clears the floor;
//   the passer's crest rides 6.6cm ABOVE the wall's crown line and its floor 6.6cm
//   BELOW the wall's base line — taller than the very mouth it fills.
//
// All solve+verify in ONE process. RED-first. Laws: L1 frame; L2 wall region; L3 the
// fork (2 grounded equal full-length fins); L4 the through-throat; L5 the passer
// (identity fit, floor ride, station, flank); L6 emergence band; L7 the bore-vantage
// occlusion law; S6 envelope/gates; RED 1–6.
type V3 = [number, number, number];
type P2 = [number, number];
const dot3 = (a: V3, b: V3) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross3 = (a: V3, b: V3): V3 => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const norm3 = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0]/l, a[1]/l, a[2]/l]; };
type M3 = [V3, V3, V3];
const rotAxis = (ax: V3, t: number): M3 => { const c = Math.cos(t), s = Math.sin(t), C = 1-c;
    return [[c+ax[0]*ax[0]*C, ax[0]*ax[1]*C-ax[2]*s, ax[0]*ax[2]*C+ax[1]*s],
            [ax[1]*ax[0]*C+ax[2]*s, c+ax[1]*ax[1]*C, ax[1]*ax[2]*C-ax[0]*s],
            [ax[2]*ax[0]*C-ax[1]*s, ax[2]*ax[1]*C+ax[0]*s, c+ax[2]*ax[2]*C]]; };
const applyM = (M: M3, v: V3): V3 => [dot3(M[0],v), dot3(M[1],v), dot3(M[2],v)];
const hull2 = (pts: P2[]): P2[] => {
    const p2 = [...pts].sort((x,y)=>x[0]-y[0]||x[1]-y[1]);
    const cr = (o:P2, x:P2, y:P2) => (x[0]-o[0])*(y[1]-o[1]) - (x[1]-o[1])*(y[0]-o[0]);
    const lo: P2[] = []; for (const p of p2) { while (lo.length>=2 && cr(lo[lo.length-2],lo[lo.length-1],p)<=0) lo.pop(); lo.push(p); }
    const up: P2[] = []; for (let i = p2.length-1; i>=0; i--) { const p = p2[i]; while (up.length>=2 && cr(up[up.length-2],up[up.length-1],p)<=0) up.pop(); up.push(p); }
    return [...lo.slice(0,-1), ...up.slice(0,-1)];
};

// ---- constants ----------------------------------------------------------------------------------------------
export const S = 4.5;                        // the wall FACE side (the swept square — the monument's reference face)
export const L = 2.0 * S;                    // the bore length: 2.0×S, the deep end of the commission band 1.6–2.0×S
export const DOOR = 1.03 * S;                // the fork-band door (v5 constant, proven)
if (DOOR <= S) throw Error(`door ${DOOR} not bigger than the face — theorem surprise lost`);
export const NN: V3 = norm3([1, 0, 1]);      // the bore: horizontal diagonal; +mouth (nose end) at the (+x,+z) corner
export const UU: V3 = [0, 1, 0];             // door frame: vertical
export const VV: V3 = [-Math.SQRT1_2, 0, Math.SQRT1_2]; // door frame: horizontal diagonal
if (Math.abs(dot3(UU,VV)) > 1e-12 || Math.abs(dot3(UU,NN)) > 1e-12 || Math.abs(dot3(VV,NN)) > 1e-12) throw Error(`frame not orthonormal`);
export const V_HALF = S / Math.SQRT2;        // the wall's v half-extent: the swept square's diagonal reach = 3.18198
export const T_HI = L / 2;                   // the mouth plane (±t ends of the extrusion)
export const PASS_S = DOOR - 0.004;          // face-stance identity fit through the square door
export const PASS_YHALF = PASS_S / 2;
export const REVEAL = 0.012;                 // passer bottom rides 12mm above grade
export const WALL_CY = PASS_YHALF + REVEAL;  // passer center rides the bore line at WALL_CY
export const PAD_H = WALL_CY - S/2;          // the plinth raise: the bigger cube clears the floor (0.0775)
if (PAD_H < 0 || PAD_H > 1.2) throw Error(`pad height ${PAD_H.toFixed(3)} outside the plinth band`);
export const O_W: V3 = [0, WALL_CY, 0];
export const pOf = (u: number, v: number, t: number): V3 => [
    O_W[0] + u*UU[0] + v*VV[0] + t*NN[0],
    O_W[1] + u*UU[1] + v*VV[1] + t*NN[1],
    O_W[2] + u*UU[2] + v*VV[2] + t*NN[2]];
const invP = (p: V3): V3 => { const d: V3 = [p[0]-O_W[0], p[1]-O_W[1], p[2]-O_W[2]]; return [dot3(d,UU), dot3(d,VV), dot3(d,NN)]; };
// RP = the door-frame basis as columns (local x→NN, y→UU, z→VV): FACE STANCE (v4 pivot,
// standing) — proper rotation, det asserted.
export const RP: M3 = [[NN[0], UU[0], VV[0]], [NN[1], UU[1], VV[1]], [NN[2], UU[2], VV[2]]];
{
    const det = dot3(NN, cross3(UU, VV));
    if (Math.abs(det - 1) > 1e-12) throw Error(`L1 frame basis improper (det ${det})`);
}
if (PASS_S <= S) throw Error(`L5 the passer is NOT bigger than the wall face (${PASS_S.toFixed(4)} vs ${S}) — the monument's claim fails`);
export const PASS_RATIO = PASS_S / S;

// ---- the station: THE PLUG (v7 re-seat, judge-directed — v6's nose-out REJECTED at the
// 45-degree gameplay vantage: the protruding plug fills the door from off-axis, hiding the
// throat and far fin — "two abutting boxes". Both panels' converged fix: the passer DEEP
// IN THE THROAT, nose just shy of breakthrough — the near mouth reads as a doorway with an
// iron door set in it, the far mouth stays OPEN sky through the remaining throat, and every
// oblique vantage shows receding walls + depth. The axial framing (BORE PASS) only strengthens:
// the plug's angular size shrinks with depth at every vantage.) ----
export const NOSE_IN = 0.55;                 // v8: the reveal deepened (v7 judge: 0.35m showed no visible reveal/shadow line)
export const T_ST = T_HI - NOSE_IN - PASS_S/2;
export const PASS_C: V3 = [O_W[0] + T_ST*NN[0], O_W[1] + T_ST*NN[1], O_W[2] + T_ST*NN[2]];
const passerCornerLocal: V3[] = [];
for (const sx of [1,-1]) for (const sy of [1,-1]) for (const sz of [1,-1]) passerCornerLocal.push([sx*PASS_S/2, sy*PASS_S/2, sz*PASS_S/2]);
export const passCorner = (c: V3): V3 => [
    PASS_C[0] + c[0]*RP[0][0] + c[1]*RP[0][1] + c[2]*RP[0][2],
    PASS_C[1] + c[0]*RP[1][0] + c[1]*RP[1][1] + c[2]*RP[1][2],
    PASS_C[2] + c[0]*RP[2][0] + c[1]*RP[2][1] + c[2]*RP[2][2]];

// ---- the carve (generic over the wall REGION predicate; door-frame raster) ----------------------------------
export const CELL = 0.18, LAYER = 0.24;
export type Box = { c: V3; s: [number, number, number] };
const deepRegion = (u: number, v: number, t: number): boolean =>
    Math.abs(u) <= S/2 + 1e-9 && Math.abs(v) <= V_HALF + 1e-9 && Math.abs(t) <= T_HI + 1e-9;
const cubeRegion = (u: number, v: number, t: number): boolean => {
    // the v5 CUBE at the same door constants (world-axis box, center O_W) — the RED-3 contrast
    const p = pOf(u, v, t);
    return Math.abs(p[0]) <= S/2 + 1e-9 && Math.abs(p[1] - WALL_CY) <= S/2 + 1e-9 && Math.abs(p[2]) <= S/2 + 1e-9;
};
function carve(door: number, inRegion: (u: number, v: number, t: number) => boolean, UVr: number, TRr: number) {
    const doorHalf = door / 2;
    const nU = Math.ceil((2*UVr)/CELL), nL = Math.ceil((2*TRr)/LAYER);
    const solid = new Set<string>();
    const cellMinY = new Map<string, number>();
    for (let li = 0; li < nL; li++) { const t = -TRr + (li+0.5)*((2*TRr)/nL);
      for (let vj = 0; vj < nU; vj++) { const v = -UVr + (vj+0.5)*((2*UVr)/nU);
        for (let ui = 0; ui < nU; ui++) {
            const u = -UVr + (ui+0.5)*((2*UVr)/nU);
            let cut = false;
            for (const du of [-CELL/2, CELL/2]) for (const dv of [-CELL/2, CELL/2])
                if (Math.max(Math.abs(u+du), Math.abs(v+dv)) <= doorHalf + 1e-9) cut = true;
            let inWall = true, minY = Infinity;
            for (const dt of [-LAYER/2, LAYER/2]) for (const du of [-CELL/2, CELL/2]) for (const dv of [-CELL/2, CELL/2]) {
                if (!inRegion(u+du, v+dv, t+dt)) inWall = false;
                const p = pOf(u+du, v+dv, t+dt);
                if (p[1] < minY) minY = p[1];
            }
            if (!cut && inWall) { solid.add(`${ui}|${vj}|${li}`); cellMinY.set(`${ui}|${vj}|${li}`, minY); }
        } } }
    const seen = new Set<string>(); const comps: { cells: string[] }[] = [];
    for (const st of solid) {
        if (seen.has(st)) continue;
        const cells: string[] = []; const stack = [st]; seen.add(st);
        while (stack.length) { const cur = stack.pop()!; cells.push(cur);
            const [a,b,c] = cur.split("|").map(Number);
            for (const [da,db,dc] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]] as const) {
                const nb = `${a+da}|${b+db}|${c+dc}`;
                if (solid.has(nb) && !seen.has(nb)) { seen.add(nb); stack.push(nb); } } }
        comps.push({ cells });
    }
    comps.sort((x,y)=>y.cells.length-x.cells.length);
    if (comps.reduce((s,c)=>s+c.cells.length,0) !== solid.size) throw Error(`flood sizes != total (flood bug class)`);
    return { solid, comps, cellMinY, nU, nL, UV: UVr, TR: TRr };
}
const CARVE = carve(DOOR, deepRegion, Math.ceil((V_HALF+0.2)*10)/10, Math.ceil((T_HI+0.2)*10)/10);
if (CARVE.comps.length !== 2) throw Error(`L3 the fork FAILED: ${CARVE.comps.length} comps (${CARVE.comps.map(c=>c.cells.length).join(",")})`);
if (Math.abs(CARVE.comps[0].cells.length - CARVE.comps[1].cells.length) / CARVE.comps[0].cells.length > 0.05)
    throw Error(`L3 fins unequal: ${CARVE.comps.map(c=>c.cells.length).join(" / ")}`);

// ---- the fin boxes (u-run merged: one box per (v-column, t-layer)) --------------------------------------------
export const WALL_BOXES: Box[] = [];
{
    const { solid, nU, nL, UV, TR } = CARVE;
    for (let li = 0; li < nL; li++) { const t = -TR + (li+0.5)*((2*TR)/nL);
      for (let vj = 0; vj < nU; vj++) { const v = -UV + (vj+0.5)*((2*UV)/nU);
        let run0 = -1;
        for (let ui = 0; ui <= nU; ui++) {
            const stone = ui < nU && solid.has(`${ui}|${vj}|${li}`);
            if (stone && run0 < 0) run0 = ui;
            if (!stone && run0 >= 0) {
                const u0 = -UV + run0*((2*UV)/nU), u1 = -UV + ui*((2*UV)/nU);
                WALL_BOXES.push({ c: pOf((u0+u1)/2, v, t), s: [u1-u0, LAYER, CELL] });
                run0 = -1;
            }
        } } }
    if (WALL_BOXES.length < 6) throw Error(`L3 raster degenerate: ${WALL_BOXES.length}`);
    if (WALL_BOXES.length * 24 > 130000) throw Error(`vertex budget ${WALL_BOXES.length*24}`);
}
export const STATS = { boxes: WALL_BOXES.length, cells: CARVE.solid.size, comps: CARVE.comps.map(c => c.cells.length) };

// ---- fin anatomy (uniform u-run by construction: the u-kept range is (v,t)-independent) ------------------------
let FIN = { vBand: [0,0] as [number,number], tBand: [0,0] as [number,number], uRun: [0,0] as [number,number], finBot: 0, finTop: 0 };
{
    // per-fin anatomy: the POSITIVE fin (v > doorHalf). The negative fin mirrors by
    // symmetry (the comps-equality law above guards it) — a union band over both fins
    // reads the WRONG inner edge (RED-caught: min/max over all boxes spans ±3.04).
    let vLo = Infinity, vHi = -Infinity, tLo = Infinity, tHi = -Infinity, uLo = Infinity, uHi = -Infinity;
    let nPos = 0, nNeg = 0;
    for (const b of WALL_BOXES) {
        const [u, v, t] = invP(b.c);
        if (v > 0) nPos++; else nNeg++;
        if (v <= 0) continue;                       // positive fin only
        vLo = Math.min(vLo, v - b.s[2]/2); vHi = Math.max(vHi, v + b.s[2]/2);
        tLo = Math.min(tLo, t - b.s[1]/2); tHi = Math.max(tHi, t + b.s[1]/2);
        uLo = Math.min(uLo, u - b.s[0]/2); uHi = Math.max(uHi, u + b.s[0]/2);
    }
    if (nPos === 0 || Math.abs(nPos - nNeg) / Math.max(nPos, nNeg) > 0.05) throw Error(`L3 fin split asymmetric: ${nPos} vs ${nNeg} boxes`);
    // the two fins share the same |v| band by symmetry; the anatomy records the POSITIVE fin
    FIN = { vBand: [vLo, vHi], tBand: [tLo, tHi], uRun: [uLo, uHi], finBot: WALL_CY + uLo, finTop: WALL_CY + uHi };
    // L2 wall region honored: fins live strictly inside the swept region's v-extent, never past it
    if (vHi > V_HALF + 1e-6 || tHi > T_HI + 1e-6) throw Error(`L2 fin exceeds the swept region: v ${vHi.toFixed(3)}/${V_HALF.toFixed(3)} t ${tHi.toFixed(3)}/${T_HI.toFixed(3)}`);
    // kept-cell law (the pass's machine heart): EVERY fin box clears the door half-plane in v
    if (vLo <= DOOR/2) throw Error(`L2 kept-cell law violated: fin inner |v| ${vLo.toFixed(4)} <= doorHalf ${(DOOR/2).toFixed(4)}`);
    // L4 the through-throat: fins span (nearly) the FULL bore length — the portal is a portal
    if ((tHi - tLo) < 0.95 * L) throw Error(`L4 fins not full-length: t-extent ${(tHi-tLo).toFixed(3)} < 0.95·L ${L}`);
    // readable mass: the rasterized fin is a wall, not a sliver
    const width = vHi - vLo;
    if (width < 0.6 || width > (V_HALF - DOOR/2) + CELL + 1e-9) throw Error(`L3 fin raster width ${width.toFixed(3)} outside [0.6, true+cell]`);
    // grounded: the u-run reaches the region's bottom face (within one conservative cell)
    if (uLo < -S/2 - 1e-9 || uLo > -S/2 + CELL + 1e-9) throw Error(`L3 fin bottom erosion ${uLo.toFixed(3)} outside the conservative band`);
}
export const FIN_ANATOMY = FIN;

// ---- the plinths (two long door-frame strips under the fins; |v| law carries) ---------------------------------
export const PADS: { c: V3; s: [number, number, number] }[] = [];
{
    const M = 0.12;
    for (const sgn of [1, -1]) {
        const vIn = sgn > 0 ? FIN.vBand[0] : -FIN.vBand[0];     // inner edge == the fin's own (nearest the bore)
        const vOut = sgn > 0 ? FIN.vBand[1] + M : -(FIN.vBand[1] + M);
        const padV0 = Math.min(vIn, vOut), padV1 = Math.max(vIn, vOut);
        const padT0 = FIN.tBand[0] - M, padT1 = FIN.tBand[1] + M;
        PADS.push({
            c: pOf(FIN.finBot / 2 - WALL_CY, (padV0 + padV1) / 2, (padT0 + padT1) / 2),
            s: [FIN.finBot, padT1 - padT0, padV1 - padV0],      // [u: height grade→finBot, t: along NN, v: along VV]
        });
    }
    // interval law (both boxes are door-frame axis-aligned): pads clear the passer at EVERY
    // station of the slide — disjoint in v because pad inner |v| == fin inner > doorHalf ≥ passer |v|.
    const pV = PASS_S / 2;
    for (const pad of PADS) {
        const [, vC, ] = invP(pad.c);
        const vHalf = pad.s[2] / 2;
        if (Math.min(Math.abs(vC - vHalf), Math.abs(vC + vHalf)) <= pV) throw Error(`plinth intrudes the passer's |v| band (inner ${Math.min(Math.abs(vC-vHalf), Math.abs(vC+vHalf)).toFixed(3)} <= ${pV.toFixed(3)})`);
    }
}

// ---- the crown-restoration caps (v8, judge-directed): each fin's raster shave (uRun top →
// the region's true top) is filled by ONE cap course per fin — the walls read as finished
// full-height S walls, and the plug's 6.6cm proud crest reads as "taller than the wall it's
// in" instead of "mismatched slab heights". The cap is NOT added height: it restores the
// swept square's own top face (cap top == WALL_CY + S/2 exactly). Outward v-overhang 9cm
// gives the cornice read; the inner v edge stays AT the fin's own inner edge (|v| law). ----
export const CAPS: Box[] = [];
export const CAP_H = (WALL_CY + S/2) - (WALL_CY + FIN.uRun[1]);   // the raster shave, restored
{
    if (CAP_H <= 0.005 || CAP_H > CELL + 1e-9) throw Error(`cap height ${CAP_H.toFixed(4)} outside the shave band`);
    const M = 0.09;                          // outward cornice overhang
    const SEG = 0.45;                        // cap course rhythm (verts mid-length + joint read)
    const nSeg = Math.max(2, Math.round((FIN.tBand[1] - FIN.tBand[0]) / SEG));
    for (const sgn of [1, -1]) {
        const vIn = sgn > 0 ? FIN.vBand[0] : -FIN.vBand[0];
        const vOut = sgn > 0 ? FIN.vBand[1] + M : -(FIN.vBand[1] + M);
        const padV0 = Math.min(vIn, vOut), padV1 = Math.max(vIn, vOut);
        for (let k = 0; k < nSeg; k++) {
            const t0 = FIN.tBand[0] + k * (FIN.tBand[1] - FIN.tBand[0]) / nSeg;
            const t1 = FIN.tBand[0] + (k + 1) * (FIN.tBand[1] - FIN.tBand[0]) / nSeg;
            CAPS.push({ c: pOf(FIN.uRun[1] + CAP_H / 2, (padV0 + padV1) / 2, (t0 + t1) / 2), s: [CAP_H, t1 - t0, padV1 - padV0] });
        }
    }
    // cap law: top face == the region's true top (restoration, not addition); |v| law intact;
    // the course covers the full tBand with no gaps (segmented for mid-length verts + joints)
    if (CAPS.length < 10) throw Error(`cap segmentation degenerate: ${CAPS.length}`);
    for (const cap of CAPS) {
        const top = WALL_CY + invP(cap.c)[0] + cap.s[0] / 2;
        if (Math.abs(top - (WALL_CY + S / 2)) > 1e-9) throw Error(`cap top ${top.toFixed(4)} != region top ${(WALL_CY + S/2).toFixed(4)}`);
        const [, vC, ] = invP(cap.c);
        if (Math.min(Math.abs(vC - cap.s[2]/2), Math.abs(vC + cap.s[2]/2)) <= DOOR/2) throw Error(`cap intrudes the bore |v| band`);
    }
}

// ---- the gate heads (v9, judge-directed composition closure): ONE gate per mouth — two
// shoulder blocks seated on the crown-restoration caps (rising S/2 → doorHalf+0.40 over
// each fin's own v-band, OUTSIDE the door prism) + one beam whose UNDERSIDE IS the
// channel ceiling (u bottom == doorHalf exactly): the plug's crest (u 2.3155) clears the
// beam by the same 2mm margin it clears the door — the pass stays machine-TRUE with the
// gate built. At dead-flank both gate heads close the silhouette (wall-head-wall reads as
// one built gate pair); from the approach the beams frame both mouths; the plug stands
// sealed between the gates. Beads move onto the beams — one lamp per gate. ----
export const GATES: { side: Box[]; beam: Box }[] = [];
{
    const uBeamLo = DOOR / 2;                       // the channel ceiling
    const uBeamHi = uBeamLo + 0.40;
    const uSideLo = S / 2;                          // seated on the cap tops (no float)
    const vCornice = FIN.vBand[1] + 0.09;           // cap outer edge
    for (const tSide of [1, -1] as const) {
        const tHi = tSide * T_HI;
        const tLo = tSide * (T_HI - 0.45);
        const tC = (tHi + tLo) / 2, tH = 0.45;
        const side: Box[] = [];
        for (const sgn of [1, -1]) {
            const v0 = sgn > 0 ? FIN.vBand[0] : -vCornice;
            const v1 = sgn > 0 ? vCornice : -FIN.vBand[0];
            side.push({ c: pOf((uSideLo + uBeamHi) / 2, (v0 + v1) / 2, tC), s: [uBeamHi - uSideLo, tH, v1 - v0] });
        }
        const beam: Box = { c: pOf((uBeamLo + uBeamHi) / 2, 0, tC), s: [uBeamHi - uBeamLo, tH, 2 * vCornice] };
        GATES.push({ side, beam });
    }
    // LAWS: no gate box may enter the live door prism — clash iff its u-band dips below the
    // channel ceiling (doorHalf) AND its v-interval crosses the open channel (−doorHalf, doorHalf).
    for (const gate of GATES) for (const b of [...gate.side, gate.beam]) {
        const [uC, vC] = invP(b.c);
        const uLo = uC - b.s[0] / 2;
        const vLo = vC - b.s[2] / 2, vHi = vC + b.s[2] / 2;
        const crossesDoorV = vLo < DOOR / 2 - 1e-9 && vHi > -(DOOR / 2) + 1e-9;
        if (uLo < DOOR / 2 - 1e-9 && crossesDoorV)
            throw Error(`gate box enters the live door prism (uLo ${uLo.toFixed(3)} < ${(DOOR/2).toFixed(3)}, v [${vLo.toFixed(3)},${vHi.toFixed(3)}]) — the pass claim dies`);
    }
    // pass headroom: the beam underside == doorHalf; the plug crest (PASS_YHALF) clears by ≥ 1mm
    if ((DOOR/2) - PASS_YHALF < 0.001) throw Error(`beam headroom ${(DOOR/2 - PASS_YHALF).toFixed(4)} < 1mm`);
    // shoulders seat ON the caps: uSideLo == cap top
    if (Math.abs(uSideLo - (FIN.uRun[1] + CAP_H)) > 1e-9) throw Error(`gate shoulder base ${uSideLo} != cap top ${(FIN.uRun[1] + CAP_H)}`);
}

// ---- the beads (v10: FOUR lamps, one per gate-beam corner — the night judge caught the
// 2-lamp scheme's blind vantage: the far gate's mid-span bead hides behind the near gate
// head. One per corner (v = ±(vCornice−0.25) on each beam crown): from any azimuth at
// least two read, the town-gates' four-crown idiom (struct-26/272 lineage). ----
export const BEADS: V3[] = [];
export const BEAD_R = 0.07;
{
    const uBeamHi = DOOR / 2 + 0.40;
    const vCorner = (FIN.vBand[1] + 0.09) - 0.25;
    if (vCorner <= DOOR / 2) throw Error(`bead corner inside the door band`);
    for (const gate of GATES) {
        const tC = invP(gate.beam.c)[2];
        for (const sgn of [1, -1]) BEADS.push(pOf(uBeamHi + BEAD_R * 0.4, sgn * vCorner, tC));
    }
    if (BEADS.length !== 4) throw Error(`bead law: ${BEADS.length} != 4`);
}

// ---- L5/L6: station laws --------------------------------------------------------------------------------------
let S56 = { frac: 0, insideBy: 0, openFar: 0 };
{
    let yMin = Infinity, yMax = -Infinity, tMin = Infinity, tMax = -Infinity;
    for (const c of passerCornerLocal) {
        const p = passCorner(c);
        yMin = Math.min(yMin, p[1]); yMax = Math.max(yMax, p[1]);
        const t = dot3([p[0]-O_W[0], p[1]-O_W[1], p[2]-O_W[2]], NN);
        tMin = Math.min(tMin, t); tMax = Math.max(tMax, t);
    }
    const frac = (tMax - T_HI) / (tMax - tMin);
    void frac;                                   // emergence band retired with the nose-out station (v7 plug)
    if (yMax < 2.2) throw Error(`L5 crest ${yMax.toFixed(2)} under room gate`);
    if (Math.abs(yMin - REVEAL) > 1e-9) throw Error(`L5 passer bottom ${yMin.toFixed(4)} != reveal ${REVEAL} — floor-ride regression`);
    const tailT = T_ST - PASS_S/2;
    const noseIn = T_HI - tMax;
    const openFar = T_HI + tailT;
    if (noseIn < 0.25 || noseIn > 0.8) throw Error(`L5 plug law: nose-in ${noseIn.toFixed(3)} outside the recessed-door band [0.25, 0.8]`);
    if (tailT < -T_HI + 0.25) throw Error(`L5 flank law: tail t ${tailT.toFixed(3)} escapes the throat (whole-passer-inside violated)`);
    // station-solid honesty: every passer point inside the wall region lies in the door prism
    let worst = -Infinity;
    const test = (c: V3) => {
        const p = passCorner(c);
        const [u, v] = invP(p);
        if (deepRegion(u, v, 0) || (Math.abs(u) <= S/2 + 1e-9 && Math.abs(v) <= V_HALF + 1e-9)) {
            // inside the wall's cross-section at SOME t? only meaningful if also within t-extent:
            const t = dot3([p[0]-O_W[0], p[1]-O_W[1], p[2]-O_W[2]], NN);
            if (Math.abs(t) <= T_HI + 1e-9) worst = Math.max(worst, Math.abs(u), Math.abs(v));
        }
    };
    for (const c of passerCornerLocal) test(c);
    for (let i = 0; i < passerCornerLocal.length; i++) {
        const A = passerCornerLocal[i], B = passerCornerLocal[(i+1)%passerCornerLocal.length];
        for (let k = 1; k < 24; k++) { const q = k/24; test([A[0]+q*(B[0]-A[0]), A[1]+q*(B[1]-A[1]), A[2]+q*(B[2]-A[2])]); }
    }
    if (worst > DOOR/2 - 1e-6) throw Error(`L5 station-solid clash: passer point in wall outside the bore (${worst.toFixed(4)} > ${(DOOR/2-0.001).toFixed(4)})`);
    S56 = { frac, insideBy: PASS_S, openFar };
}
export const OPEN_FAR = S56.openFar;
export const EMERGED_FRAC = S56.frac;

// ---- L7: the bore-vantage occlusion law (THE v5 rejection, fixed by depth) ------------------------------------
let L7_MIN = Infinity;
{
    // Walker on the bore axis at distance Dm from the NEAR MOUTH plane (the nose face sits
    // NOSE_IN behind it). The fins' outer mouth corners (t = T_HI, |v| = V_HALF) subtend
    // V_HALF/Dm; the plug's nose face subtends (PASS_S/2)/(Dm + NOSE_IN). The fork frames
    // the plug in ANGULAR WIDTH at every walkable distance in [4, 20] — v5's waist-local
    // fins lost this ratio at ~10m; v7's deeper seat only strengthens it.
    for (let Dm = 4; Dm <= 20; Dm += 0.25) {
        const ratio = (V_HALF * Dm) / ((PASS_S/2) * (Dm + NOSE_IN));
        L7_MIN = Math.min(L7_MIN, ratio);
    }
    if (L7_MIN <= 1.0) throw Error(`L7 bore occlusion: fins/passer angular ratio min ${L7_MIN.toFixed(4)} <= 1 — the v5 rejection returns`);
}

// ---- S6: envelope, gates ---------------------------------------------------------------------------------------
let ENV: { min: V3; max: V3 } = { min: [Infinity,Infinity,Infinity], max: [-Infinity,-Infinity,-Infinity] };
const grow = (p: V3) => { for (let i = 0; i < 3; i++) { ENV.min[i] = Math.min(ENV.min[i], p[i]); ENV.max[i] = Math.max(ENV.max[i], p[i]); } };
{
    const cornersOf = (b: Box): V3[] => {
        const out: V3[] = [];
        for (const su of [-b.s[0]/2, b.s[0]/2]) for (const st of [-b.s[1]/2, b.s[1]/2]) for (const sv of [-b.s[2]/2, b.s[2]/2]) {
            out.push([b.c[0] + su*UU[0] + st*NN[0] + sv*VV[0], b.c[1] + su*UU[1] + st*NN[1] + sv*VV[1], b.c[2] + su*UU[2] + st*NN[2] + sv*VV[2]] as V3);
        }
        return out;
    };
    for (const b of WALL_BOXES) for (const p of cornersOf(b)) grow(p);
    for (const c of passerCornerLocal) grow(passCorner(c));
    for (const pad of PADS) for (const su of [-pad.s[0]/2, pad.s[0]/2]) for (const st of [-pad.s[1]/2, pad.s[1]/2]) for (const sv of [-pad.s[2]/2, pad.s[2]/2])
        grow([pad.c[0] + su*UU[0] + st*NN[0] + sv*VV[0], pad.c[1] + su*UU[1] + st*NN[1] + sv*VV[1], pad.c[2] + su*UU[2] + st*NN[2] + sv*VV[2]]);
    for (const cap of CAPS) for (const su of [-cap.s[0]/2, cap.s[0]/2]) for (const st of [-cap.s[1]/2, cap.s[1]/2]) for (const sv of [-cap.s[2]/2, cap.s[2]/2])
        grow([cap.c[0] + su*UU[0] + st*NN[0] + sv*VV[0], cap.c[1] + su*UU[1] + st*NN[1] + sv*VV[1], cap.c[2] + su*UU[2] + st*NN[2] + sv*VV[2]]);
    for (const gate of GATES) for (const b of [...gate.side, gate.beam]) for (const su of [-b.s[0]/2, b.s[0]/2]) for (const st of [-b.s[1]/2, b.s[1]/2]) for (const sv of [-b.s[2]/2, b.s[2]/2])
        grow([b.c[0] + su*UU[0] + st*NN[0] + sv*VV[0], b.c[1] + su*UU[1] + st*NN[1] + sv*VV[1], b.c[2] + su*UU[2] + st*NN[2] + sv*VV[2]]);
    // beads: EXACT sphere AABBs (center ± r per axis — equals the rendered bbox exactly;
    // v8 law: the bead crests now define the envelope top, disclosed — the crown markers
    // stand 3cm proud of the plug's own crest)
    for (const b of BEADS) grow([b[0] - BEAD_R, b[1] - BEAD_R, b[2] - BEAD_R]), grow([b[0] + BEAD_R, b[1] + BEAD_R, b[2] + BEAD_R]);
}
if (ENV.min[1] < -1e-9) throw Error(`S6 below grade ${ENV.min[1]}`);
export const ENVELOPE = { min: [...ENV.min] as V3, max: [...ENV.max] as V3 };
{
    let yTop = -Infinity; for (const c of passerCornerLocal) yTop = Math.max(yTop, passCorner(c)[1]);
    const foot = (ENV.max[0]-ENV.min[0]) * (ENV.max[2]-ENV.min[2]);
    if (foot < 16 || yTop < 2.2) throw Error(`S6 gates: foot ${foot.toFixed(1)} h ${yTop.toFixed(2)}`);
}

// ---- RED controls ---------------------------------------------------------------------------------------------
export function redChecks(): void {
    // RED-1: the classic max-section spine — perturb the axis 1 deg, the max square section shrinks
    // (fresh derivation kept from struct-221: cube max square section == 3√2/4)
    const sectionPolyN = (n: V3): P2[] => {
        const t1: V3 = Math.abs(n[1]) < 0.9 ? [0,1,0] : [1,0,0];
        const e1 = norm3([t1[0]-dot3(t1,n)*n[0], t1[1]-dot3(t1,n)*n[1], t1[2]-dot3(t1,n)*n[2]]);
        const e2 = cross3(n, e1);
        const pts: P2[] = [];
        for (const ax of [0,1,2] as const) for (const a of [-0.5,0.5]) for (const b of [-0.5,0.5]) {
            const fixed: V3 = [0,0,0]; const others = [0,1,2].filter(x => x !== ax) as [number, number];
            fixed[others[0]] = a; fixed[others[1]] = b;
            const free = -(n[others[0]]*a + n[others[1]]*b) / n[ax];
            if (Math.abs(free) <= 0.5 + 1e-9) { const p: V3 = [...fixed]; p[ax] = free; pts.push([dot3(p,e1), dot3(p,e2)]); }
        }
        return hull2(pts);
    };
    const radial = (poly: P2[], dx: number, dy: number): number => {
        let best = Infinity;
        for (let i = 0, j = poly.length-1; i < poly.length; j = i++) {
            const [xi, yi] = poly[i], [xj, yj] = poly[j];
            const ex = xj-xi, ey = yj-yi;
            const den = dx*ey - dy*ex;
            if (Math.abs(den) < 1e-14) continue;
            const t = (xi*dy - yi*dx) / den;
            const r = (xi*ey - yi*ex) / den;
            if (t >= -1e-12 && t <= 1+1e-12 && r > 1e-12 && r < best) best = r;
        }
        return best;
    };
    const centeredSquareSide = (n: V3): number => {
        const poly = sectionPolyN(n);
        let best = 0;
        const ev = (th: number) => { const c = Math.cos(th), s = Math.sin(th); return Math.min(radial(poly, (c - s) / Math.SQRT2, (s + c) / Math.SQRT2), radial(poly, (c + s) / Math.SQRT2, (s - c) / Math.SQRT2)); };
        for (let k = 0; k < 360; k++) { const side = Math.SQRT2 * ev((k/360)*Math.PI/2); if (side > best) best = side; }
        let step = Math.PI/720, bth = 0;
        for (let it = 0; it < 40; it++) { let improved = false;
            for (const d of [1,-1]) { const th = bth + d*step; const side = Math.SQRT2 * ev(th); if (side > best + 1e-15) { best = side; bth = th; improved = true; } }
            if (!improved) step /= 2; if (step < 1e-7) break; }
        return best;
    };
    // find the max-section axis (coarse scan + refine) — the spine cross-check
    let mn: V3 = [0,0,1], ms = 0;
    { const deg = Math.PI/180;
      for (let pi = 0; pi <= 30; pi++) for (let ti = 1; ti <= 29; ti++) {
        const pol = ti*3*deg, az = pi*3*deg;
        const n: V3 = [Math.sin(pol)*Math.cos(az), Math.sin(pol)*Math.sin(az), Math.cos(pol)];
        const cs = centeredSquareSide(n); if (cs > ms) { ms = cs; mn = n; } }
      let step = 1.5*deg;
      for (let it = 0; it < 300; it++) { let improved = false;
        for (const ax of [[1,0,0],[0,1,0]] as V3[]) for (const d of [1,-1]) {
            const n2 = norm3(applyM(rotAxis(ax, d*step), mn)); const cs = centeredSquareSide(n2);
            if (cs > ms + 1e-14) { ms = cs; mn = n2; improved = true; } }
        if (!improved) step /= 2; if (step < 1e-7) break; } }
    if (Math.abs(ms - 3*Math.SQRT2/4) > 5e-4) throw Error(`RED-1 spine: fresh cube max-section ${ms.toFixed(9)} != classic`);
    const nP = norm3(applyM(rotAxis([1,0,0], Math.PI/180), mn));
    if (!(centeredSquareSide(nP) < ms - 1e-6)) throw Error(`RED-1 vacuous`);
    // RED-2 (non-vacuous at raster scale): the door-fit law is exact (PASS_S = DOOR−4mm,
    // separate throw below); the BUILT clearance is grid-phase-dependent (this grid's
    // first kept face sits at |v| 2.3264 → gap ≈ 11mm). The law: fins NEVER intrude the
    // passer's |v| band (gap > 0), and a +10cm v-offset passer MUST clash the raster fins.
    {
        const off = 0.10;
        let clash = false;
        for (const b of WALL_BOXES) {
            const [, bv, ] = invP(b.c);
            const bLo = bv - b.s[2]/2, bHi = bv + b.s[2]/2;
            // the PASSER shifts +off in v; the fins stay put (offsetting both = translating
            // the world — vacuous; RED-caught)
            if (Math.min(bHi, PASS_S/2 + off) - Math.max(bLo, -PASS_S/2 + off) > 1e-9) clash = true; // v-interval overlap (u,t overlap holds: full-height, tail inside)
        }
        if (!clash) throw Error(`RED-2 vacuous: +10cm-offset passer still clears every fin box`);
        const gap = Math.min(...WALL_BOXES.map(b => Math.abs(invP(b.c)[1]) - b.s[2]/2 - PASS_S/2));
        if (gap < -1e-9) throw Error(`RED-2 base: fin intrudes the passer's |v| band (gap ${gap.toFixed(4)}) — carve regression`);
        if (PASS_S/2 >= DOOR/2 - 0.001) throw Error(`RED-2 door-fit law: passer half ${(PASS_S/2).toFixed(4)} not ≥2mm under doorHalf ${(DOOR/2).toFixed(4)}`);
        console.log(`RED-2 built gap: min fin-inner-|v| − passer-half = ${gap.toFixed(4)}m (grid-phase honest, door-fit exactness separate)`);
    }
    // RED-3 (the depth law): the SAME door through the v5 CUBE leaves WAIST-LOCAL fins; the deep
    // prism's fins are full-length. Depth is what buys the portal.
    {
        const cc = carve(DOOR, cubeRegion, Math.ceil((V_HALF+0.2)*10)/10, Math.ceil((2.25*Math.SQRT2+0.2)*10)/10);
        if (cc.comps.length !== 2) throw Error(`RED-3 unexpected: cube carve comps ${cc.comps.length}`);
        let tLo = Infinity, tHi = -Infinity;
        for (const st of cc.solid) { const [,,liStr] = st.split("|"); const li = Number(liStr);
            const t = -cc.TR + (li+0.5)*((2*cc.TR)/cc.nL); tLo = Math.min(tLo, t); tHi = Math.max(tHi, t); }
        if (tHi - tLo > 1.4) throw Error(`RED-3 contrast failed: cube fins t-extent ${tHi-tLo} not waist-local`);
        if (FIN.tBand[1] - FIN.tBand[0] < 0.95*L) throw Error(`RED-3 contrast failed: deep fins not full-length`);
    }
    // RED-4: the door exceeds EVERY square section of the wall ⊥ the bore (the section is the
    // 4.5 × 6.36 rectangle; its max square side is S — a planar cut could never make this door)
    if (DOOR <= S) throw Error(`RED-4 vacuous: door ${DOOR} not above the ⊥-bore max square section ${S}`);
    if (DOOR >= 2 * Math.min(S/2, V_HALF) * Math.SQRT2 + 1e-9) throw Error(`RED-4 impossible: door exceeds the whole section rect`);
    // RED-5: non-vacuous carve
    if (CARVE.solid.size >= CARVE.nU*CARVE.nU*CARVE.nL) throw Error(`RED-5 vacuous: nothing carved`);
    // RED-6: the passer is BIGGER than the wall's face (the headline claim)
    if (PASS_S <= S) throw Error(`RED-6 vacuous`);
}

// ---- main ------------------------------------------------------------------------------------------------------
if (import.meta.main) {
    redChecks();
    const ride = (REVEAL + PASS_S) - (PAD_H + S);
    console.log(`L1-L2 frame + region: bore NN=(1,0,1)/√2, face S=${S} swept L=${L}m (2.0×S); v-extent ±${V_HALF.toFixed(4)}; door ${DOOR.toFixed(4)} = 1.03×S — no planar cut ⊥ the bore reaches it (max square section there = S)`);
    console.log(`L3 the fork: TWO full-length fins — raster v-band |v| ∈ [${FIN.vBand[0].toFixed(3)}, ${FIN.vBand[1].toFixed(3)}] (true ${V_HALF - DOOR/2 > (FIN.vBand[1]-FIN.vBand[0]) ? (V_HALF - DOOR/2).toFixed(3) : "?"}m thick before conservative rounding), t-extent ${(FIN.tBand[1]-FIN.tBand[0]).toFixed(3)}m of ${L}m, u-run y ∈ [${FIN.finBot.toFixed(3)}, ${FIN.finTop.toFixed(3)}]; ${STATS.boxes} merged boxes = ${STATS.boxes*24} verts`);
    console.log(`L4 the throat: ${DOOR.toFixed(3)}m door × ${L}m deep, clear through both mouths; kept-cell law: fin inner |v| ${FIN.vBand[0].toFixed(4)} > doorHalf ${(DOOR/2).toFixed(4)} — the passer touches no stone at ANY station (interval law)`);
    console.log(`L5-L6 the passer: ${PASS_S.toFixed(4)}m IRON cube = ${PASS_RATIO.toFixed(5)}×S (BIGGER than the wall's face), FACE STANCE, THE PLUG — wholly inside the throat, nose ${NOSE_IN}m shy of the +mouth, ${S56.openFar.toFixed(2)}m of OPEN throat beyond the tail (far mouth OPEN), floor ride ${REVEAL*1000}mm; crest rides ${ride.toFixed(4)}m ABOVE the wall crown and floor ${(PAD_H - REVEAL).toFixed(4)}m BELOW the wall base — taller than the mouth it fills`);
    console.log(`L7 bore-vantage law: fins/passer angular-width ratio min ${L7_MIN.toFixed(4)} over Dm ∈ [4,20]m (at 18m: ${(V_HALF*18/((PASS_S/2)*(18+NOSE_IN))).toFixed(3)}) — the plug's deeper seat only strengthens the framing`);
    console.log(`plinths: 2 door-frame strips h ${FIN.finBot.toFixed(3)} (grade→fin raster bottom), |v| inner edge == fin inner — clear of the passer at every station by the |v| law; beads: 2 at the nose mouth (t ${(T_HI-0.35).toFixed(2)})`);
    console.log(`S6 envelope x[${ENVELOPE.min[0].toFixed(2)},${ENVELOPE.max[0].toFixed(2)}] y[${ENVELOPE.min[1].toFixed(2)},${ENVELOPE.max[1].toFixed(2)}] z[${ENVELOPE.min[2].toFixed(2)},${ENVELOPE.max[2].toFixed(2)}] — the plug sits wholly within: symmetric fins-dominated bbox (seat with the TRUE bbox)`);
    console.log(`RED 1-6 PASS`);
    console.log(`ALL PASS`);
}
