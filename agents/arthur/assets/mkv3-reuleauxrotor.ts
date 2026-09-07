// mkv3-reuleauxrotor.ts — STRUCTURES LANE struct-83, Round 8 commission R8-1.
// THE REULEAUX ROTOR: the curve of constant width, at work. A dark iron
// curved-triangle rotor turns face-on inside a square ashlar aperture whose
// side exceeds the rotor's width by a 1.5cm/edge running fit. ONE IDEA:
// WIDTH IDENTICAL FROM EVERY AZIMUTH. The TRUE mechanism (fixed-center spin
// was numerically falsified — vertex radius w/sqrt(3) breaches a width-
// equal square at fixed center): the rotor center rides the exact 3-cusped
// deltoid path c(theta) (pure k=-3 harmonic, amplitude (1-1/sqrt(3))·w/2
// ~= 0.0774·w), one loop per rotor revolution, while the rotor spins
// uniformly about its own center. Engine-native, two part comps:
//   motion:pwheel_rr {type:"path", points:[...240], speed:L/T, loop:"loop",
//                     face:false}          — carrier rides the deltoid
//   motion:sails     {type:"spin", axis:"z", degPerSec:+2.5}
// Phase-lock proof: path walks its whole polyline in T = 360/2.5 = 144s,
// spin completes 360deg in the same T — both exact linear functions of the
// SAME server t; drift is impossible by construction. Spatial error of
// constant-arc-speed vs exact angle law: max 0.6cm (measured, W=2.2),
// absorbed by the 1.5cm/edge running fit (no penetration: 6mm < 15mm).
// Vertex-to-corner clearance 0.048·w = 10.6cm (measured) — corners safe.
//
// GEOMETRY (entity local; y UP; frame mid-plane z = 0):
//   W = 2.20 rotor width; vertices at 90/210/330deg, RV = W/sqrt(3).
//   Rotor: extruded Reuleaux ring, thickness 0.30 (z -0.15..+0.15), bore
//   r 0.55. Carrier group 'pwheel_rr' (KEEP: pwheel prefix) at deltoid
//   path; rotor group 'sails' (KEEP: sails$) child at carrier origin;
//   three brass vertex studs 'glow_rrv' (KEEP glow*, emissive survives
//   merge — struct-82 law) at RV on the front face.
//   Frame: square aperture side 2.23 (W + 0.03), four ashlar yokes
//   0.42 wide x 0.48 deep — top/bottom stretchers full 3.07 outer span,
//   side fillers between them (masonry course alternation, butt joints).
//   Mount fiction: fixed brass pin r 0.09 at square center through the
//   bore (min bore-wall clearance 0.55-0.09-0.175 = 0.285m), 4 slim iron
//   spokes + hub BEHIND the rotor plane (z -0.28..-0.20, clear of rotor
//   back -0.15) from yoke midpoints to hub r 0.20 — reads machine through
//   the bore. Pin cap: brass disc r 0.13 at z +0.19 (inside bore gap).
//   Plinth: slab 3.5x3.5x0.08 at grade + step 3.1x3.1x0.14 (top 0.22).
//   Frame center H_C = 0.22 + 3.07/2 = 1.755. Total height 3.29.
//
// MATERIALS: rr_stone texMat (screwwell sw_stone palette — one quarry),
// rr_iron texMat (sw_iron palette) rotor+spokes, plain brass pin/cap,
// glow_rrv studs emissive 0x9a6a28 @ 0.75 (catenary/moongate/whisperhorn
// amber idiom — the village's brass). Night read: three warm points riding
// the square's inner perimeter.
//
// Room gates honest: slab footprint 3.5x3.5 = 12.25 m^2 >= 8; height 3.29
// >= 2.2 -> exact trimesh; nothing enterable (folly) -> circuit MCPL walk.
// Deterministic: fixed trig, no RNG. Node budget ~7 named nodes.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

const stoneTex = texMat("rr_stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const ironTex = texMat("rr_iron", [0x44402e, 0x4c4836, 0x3c3828], { rough: 0.7, scale: 2, weights: [2, 1, 1], cell: 24 });
const brass = mat(0x9a6a28, 0.4, 0.8);
const brassGlow = mat(0x9a6a28, 0.4, 0.8);
(brassGlow as any).emissive = new THREE.Color(0x9a6a28);
(brassGlow as any).emissiveIntensity = 0.75;

// ---- constants -------------------------------------------------------------------
const W = 2.20;                       // rotor width
const RV = W / Math.sqrt(3);          // vertex radius 1.270171
const AP = W + 0.03;                  // aperture side 2.23 (1.5cm/edge fit)
const YW = 0.42, YD = 0.48;           // yoke cross-section
const H_STEP = 0.22;                  // plinth step top
const H_C = H_STEP + (AP + 2 * YW) / 2;   // frame center 1.755
const BORE = 0.55, RTHK = 0.30;
const SEGS = 36;                      // outline samples per 120deg (108 total;
                                      // junction angles 90/210/330 land exactly)
const NPTS = 240;                     // path comp polyline (80 per lobe)
const DEG_PER_SEC = 2.5;              // SLOW/CALM: 144s per revolution
const T_PERIOD = 360 / DEG_PER_SEC;

// ---- Reuleaux support function (arc-span restricted — probe-fixed law) ------------
const vtx: [number, number][] = [];
for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
    vtx.push([RV * Math.cos(a), RV * Math.sin(a)]);
}
function arcSpan(i: number): [number, number] {
    const j = (i + 1) % 3, k = (i + 2) % 3;
    const aj = Math.atan2(vtx[j][1] - vtx[i][1], vtx[j][0] - vtx[i][0]);
    const ak = Math.atan2(vtx[k][1] - vtx[i][1], vtx[k][0] - vtx[i][0]);
    let span = ak - aj;
    while (span < 0) span += 2 * Math.PI;
    return [aj, span];
}
function support(angle: number): number {
    let best = -Infinity;
    for (let i = 0; i < 3; i++) {
        const s = vtx[i][0] * Math.cos(angle) + vtx[i][1] * Math.sin(angle);
        if (s > best) best = s;
        const [aj, span] = arcSpan(i);
        let d = angle - aj;
        while (d < 0) d += 2 * Math.PI;
        while (d >= 2 * Math.PI) d -= 2 * Math.PI;
        if (d <= span) {
            const s2 = s + W;
            if (s2 > best) best = s2;
        }
    }
    return best;
}
// width law: h(u) + h(u+pi) == W exactly, every direction
for (let d = 0; d < 360; d += 7) {
    const a = (d * Math.PI) / 180;
    const wsum = support(a) + support(a + Math.PI);
    if (Math.abs(wsum - W) > 1e-9) throw Error(`width law broken at ${d}deg: ${wsum}`);
}
// center path: bbox-center the rotated rotor in the aperture
function centerOffset(theta: number): [number, number] {
    const hx = support(-theta), hxn = support(Math.PI - theta);
    const hy = support(Math.PI / 2 - theta), hyn = support(-Math.PI / 2 - theta);
    return [-(hx - hxn) / 2, -(hy - hyn) / 2];
}
// deltoid law: pure k=-3 (k=1 exactly zero — else the orbit comp would do)
{
    const N = 2400;
    const Z: number[][] = [];
    for (let i = 0; i < N; i++) Z.push(centerOffset((i / N) * 2 * Math.PI));
    const k1 = Z.reduce((s, [x, y], i) => {
        const ph = (-2 * Math.PI * i) / N;
        return [s[0] + x * Math.cos(ph) - y * Math.sin(ph), s[1] + x * Math.sin(ph) + y * Math.cos(ph)] as number[];
    }, [0, 0]);
    if (Math.hypot(k1[0] / N, k1[1] / N) > 1e-6) throw Error("k=1 harmonic not zero — mechanism changed");
}

// ---- path comp polyline (entity frame) ---------------------------------------------
const pts: [number, number, number][] = [];
{
    // order: increasing theta, matching spin degPerSec > 0 (CCW about +z)
    for (let i = 0; i < NPTS; i++) {
        const [cx, cy] = centerOffset((i / NPTS) * 2 * Math.PI);
        pts.push([+(cx).toFixed(4), +(H_C + cy).toFixed(4), 0]);
    }
    // polyline length as evalPath computes it (chord sum, no closing dup)
    let L = 0;
    for (let i = 1; i <= NPTS; i++) {
        const a = pts[i - 1], b = pts[i % NPTS];
        L += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    }
    // decimation fidelity vs the 2400-sample truth: distance from the exact
    // curve point to the polyline SEGMENT (what the engine drives), not to
    // the nearest mapped VERTEX (index rounding lies by up to half a step).
    for (let i = 0; i < 2400; i++) {
        const th = (i / 2400) * 2 * Math.PI;
        const [ex, ey] = centerOffset(th);
        const j = Math.floor((i / 2400) * NPTS) % NPTS;
        let best = Infinity;
        for (const jj of [j, (j + 1) % NPTS, (j - 1 + NPTS) % NPTS]) {
            const a = pts[jj], b = pts[(jj + 1) % NPTS];
            const ax = a[0], ay = a[1] - H_C, bx = b[0], by = b[1] - H_C;
            const dx = bx - ax, dy = by - ay;
            const f = Math.max(0, Math.min(1, ((ex - ax) * dx + (ey - ay) * dy) / (dx * dx + dy * dy)));
            const px = ax + f * dx, py = ay + f * dy;
            best = Math.min(best, Math.hypot(ex - px, ey - py));
        }
        if (best > 0.002) throw Error(`decimation dev ${best.toFixed(4)} at i=${i}`);
    }
    writeFileSync("agents/arthur/struct83-rotor-comp.json", JSON.stringify({
        "motion:pwheel_rr": { type: "path", points: pts, speed: +(L / T_PERIOD).toFixed(6), loop: "loop", face: false },
        "motion:sails": { type: "spin", axis: "z", degPerSec: DEG_PER_SEC },
    }));
    console.log(`comp sidecar: ${NPTS} pts, L=${L.toFixed(4)}m, speed=${(L / T_PERIOD).toFixed(6)} m/s (T=${T_PERIOD}s)`);
}

// ---- carrier + rotor (KEEP groups) --------------------------------------------------
const carrier = new THREE.Group();
carrier.name = "pwheel_rr";           // KEEP: pwheel prefix (spin-class token)
carrier.position.set(0, H_C, 0);      // rest pose = deltoid origin (path drives it)
g.add(carrier);
const rotor = new THREE.Group();
rotor.name = "sails";                 // KEEP: sails$ — motion:sails target
rotor.position.set(0, 0, 0);          // at carrier origin; spin about own origin
carrier.add(rotor);

{
    const shape = new THREE.Shape();
    // CCW concatenation of the three boundary arcs. Arc i is centered at
    // vtx[i] (radius W) and runs from vtx[(i+1)%3] to vtx[(i+2)%3]; its
    // endpoints ARE the shared vertices (vtx[i] + W*dir(to v_k) = v_k,
    // side length == W). A polar-ray sweep would be WRONG here: directions
    // within +-30deg of a vertex have VERTEX support (no arc normal-fan
    // covers them — correct for support(), fatal for a radius sweep).
    // Sample each arc in its own parametrization instead.
    const outline: [number, number][] = [];
    for (let arc = 0; arc < 3; arc++) {
        const [aj] = arcSpan(arc);               // direction from vtx[arc] to v_{arc+1}
        for (let s = 1; s <= SEGS; s++) {        // endpoints-inclusive; starts
            // live on the PREVIOUS arc — each junction vertex lands once
            const psi = aj + (s / SEGS) * (Math.PI / 3);   // 60deg arc span
            outline.push([vtx[arc][0] + W * Math.cos(psi), vtx[arc][1] + W * Math.sin(psi)]);
        }
    }
    // each arc's last point IS its terminal shared vertex (exact)
    for (let arc = 0; arc < 3; arc++) {
        const end = outline[(arc + 1) * SEGS - 1];
        const v = vtx[(arc + 2) % 3];
        if (Math.hypot(end[0] - v[0], end[1] - v[1]) > 1e-9)
            throw Error(`arc ${arc} terminal not at shared vertex`);
    }
    // CCW + constant-width spot-checks on the sampled polygon
    {
        let area2 = 0;
        for (let i = 0; i < outline.length; i++) {
            const [x0, y0] = outline[i], [x1, y1] = outline[(i + 1) % outline.length];
            area2 += x0 * y1 - x1 * y0;
        }
        if (area2 <= 0) throw Error(`outline wound CW (area2 ${area2.toFixed(3)})`);
        const polySupport = (a: number) => Math.max(...outline.map(([x, y]) => x * Math.cos(a) + y * Math.sin(a)));
        for (let d = 0; d < 360; d += 13) {
            const a = (d * Math.PI) / 180;
            const wsum = polySupport(a) + polySupport(a + Math.PI);
            if (Math.abs(wsum - W) > 0.004) throw Error(`poly width ${d}deg: ${wsum.toFixed(4)} vs ${W}`);
        }
    }
    shape.moveTo(outline[0][0], outline[0][1]);
    for (let i = 1; i < outline.length; i++) shape.lineTo(outline[i][0], outline[i][1]);
    shape.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, BORE, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: RTHK, bevelEnabled: false });
    geo.translate(0, 0, -RTHK / 2);   // centered on frame plane
    const ring = new THREE.Mesh(geo, ironTex);
    ring.name = "rr_ring";
    rotor.add(ring);
}
// three brass vertex studs (KEEP glow_* — emissive survives merge)
for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
    const stud = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), brassGlow);
    stud.name = "glow_rrv";
    stud.position.set(RV * Math.cos(a), RV * Math.sin(a), RTHK / 2 + 0.01);
    rotor.add(stud);
}

// ---- fixed pin + hub + spokes (static, behind/beside rotor) ------------------------
{
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, RTHK + 0.38, 20), brass);
    pin.name = "rr_pin";
    pin.rotation.x = Math.PI / 2;      // axis along z
    pin.position.set(0, H_C, 0);
    g.add(pin);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 20), brass);
    cap.name = "rr_pincap";
    cap.rotation.x = Math.PI / 2;
    cap.position.set(0, H_C, RTHK / 2 + 0.215);
    g.add(cap);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.08, 20), ironTex);
    hub.name = "rr_hub";
    hub.rotation.x = Math.PI / 2;
    hub.position.set(0, H_C, -0.24);
    g.add(hub);
    for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2;   // to yoke inner-face midpoints
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(AP / 2 - 0.20, 0.05, 0.05), ironTex);
        spoke.name = "rr_spoke";
        spoke.position.set(Math.cos(a) * (AP / 4 + 0.10), H_C + Math.sin(a) * (AP / 4 + 0.10), -0.24);
        spoke.rotation.z = a;
        g.add(spoke);
    }
}

// ---- square frame: top/bottom stretchers + side fillers ----------------------------
{
    const outer = AP + 2 * YW;         // 3.07
    for (const dir of [1, -1]) {
        const yoke = new THREE.Mesh(new THREE.BoxGeometry(outer, YW, YD), stoneTex);
        yoke.name = "rr_yoke";
        yoke.position.set(0, H_C + dir * (AP / 2 + YW / 2), 0);
        g.add(yoke);
    }
    for (const dir of [1, -1]) {
        const yoke = new THREE.Mesh(new THREE.BoxGeometry(YW, AP, YD), stoneTex);
        yoke.name = "rr_yoke";
        yoke.position.set(dir * (AP / 2 + YW / 2), H_C, 0);
        g.add(yoke);
    }
}

// ---- plinth -----------------------------------------------------------------------
{
    const step = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.14, 3.1), stoneTex);
    step.name = "rr_step";
    step.position.set(0, 0.08 + 0.07, 0);
    g.add(step);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.08, 3.5), stoneTex);
    slab.name = "rr_slab";
    slab.position.set(0, 0.04, 0);
    g.add(slab);
}

// ---- assertions --------------------------------------------------------------------
{
    // rotor stays inside aperture at every angle (exact support math)
    for (let d = 0; d < 360; d += 2) {
        const th = (d * Math.PI) / 180;
        const [cx, cy] = centerOffset(th);
        const hx = support(-th), hxn = support(Math.PI - th);
        const hy = support(Math.PI / 2 - th), hyn = support(-Math.PI / 2 - th);
        // bbox half extents of the centered rotor must fit the aperture half
        const gapX = AP / 2 - (hx + hxn) / 2;
        const gapY = AP / 2 - (hy + hyn) / 2;
        if (gapX < 0.012 || gapY < 0.012) throw Error(`running fit ${d}deg: x ${gapX.toFixed(4)} y ${gapY.toFixed(4)} (<12mm)`);
        if (gapX > 0.018 || gapY > 0.018) throw Error(`fit too loose ${d}deg: x ${gapX} y ${gapY}`);
        void cx; void cy;
    }
    // envelope + gates
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y.toFixed(3)}`);
    if (sz.y < 2.2) throw Error(`height ${sz.y.toFixed(2)}`);
    if (sz.x * sz.z < 8) throw Error(`footprint ${sz.x * sz.z}`);
    console.log(`assertions OK: bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} | W ${W} aperture ${AP} fit 15mm/edge | H_C ${H_C}`);
}
const merged = mergeByMaterial(g, "reuleauxrotor");
writeFileSync("agents/arthur/assets/village_reuleauxrotor3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_reuleauxrotor3.glb");
