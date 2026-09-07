// mkv3-screwwell.ts — STRUCTURES LANE struct-78, Round 7 commission R7-1.
// THE SCREW WELL: the ruled-surface ledger's third member — the HELICOID —
// as a building-scale Archimedes screw. One idea: WATER THAT CLIMBS. The
// curve ledger is complete (conics/hypar/sine/catenary/ring/ogee); the
// ruled surfaces had hypar (meridianstair, hypar) and hyperboloid
// (ruledtower) — the helicoid is the one left, and its machine reading
// (the water screw) joins the village water family (waterstair, millrace,
// reedpool) as the LIFTING member: the sump feeds it, the screw climbs,
// the bowl receives, the cascade returns it to the ground.
//
// GEOMETRY (entity local, yaw 0; incline 40deg rising toward +x):
//   axis A0 = (1.4, 0.42, 0) — over the sump center — along
//   u = (cos40, sin40, 0); the CISTERN BOWL is the head: a stone bowl on a
//   slim pedestal at (5.05, 0) whose water (top 2.90) the blade tips dip
//   into (sampled blade min 2.61) — the screw spans WATER-TO-WATER (tail
//   submerged in the sump, head submerged in the bowl; Vitruvius 10.4
//   read). The bowl wall is a 240deg arc with a 120deg opening on the
//   near side (az 120..240) where the screw enters — wall, rim, and floor
//   all share the opening; the floor is an arc annulus so the blade sweep
//   passes UNDER the opening in free air.
//   e1 = local +x = (0.643, -0.766, 0)  (world transverse-down)
//   rotation.z = -50deg maps local +y -> u.
//   - sump: stone kerb ring r 1.35..1.55 h 0.35 at (1.4, 0), rim torus,
//     water disc r 1.28 (surface 0.22).
//   - screw group `well_screw` (KEEP; motion target) at A0, rz=-50deg:
//     blades = helicoid r 0.10..0.72, pitch 0.97, turns 4.52 (local y
//     0.16..4.554), 60 cells/turn; shaft r 0.10 local -0.20..4.60 (free
//     end over the bowl, through the wall opening); lower gudgeon pin.
//     FIVE water pockets (turns 0..4, 12deg seams): films r 0.30..0.62,
//     +0.045 above the surface — the lowest emerges from the sump water,
//     the topmost rides submerged into the bowl (the dump).
//   - trough group `well_trough` (KEEP-named; static), same transform:
//     170deg stone half-pipe r 0.745..0.815 centered e1, local y
//     0.55..2.75 (ends clear of the pedestal: tube x max 3.51 vs
//     pedestal face 4.77); end collars r 0.90 at local 0.6 / 2.7; three
//     iron strap rings. The water rides the trough's lower half — the
//     machine physics of an open-top screw.
//   - A-frame trestles under the tube at t=1.4 / t=2.6.
//   - bowl: pedestal r 0.28 (h 2.50) + foot + capital; floor arc annulus
//     r 0.30..0.92 at y 2.50..2.55 + center disc; wall arc r 0.88..0.95
//     h 2.55..2.95 (240deg, opening az 120..240); rim torus arc r 0.91
//     tube 0.08 at y 2.95 (same opening); water disc r 0.84 y 2.57..2.90.
//   - return cascade (south face): spout through the wall at az -90,
//     four steps with films, timber stringer, catch basin + film.
//
// MOTION (engine-verified: motion.js spin post-multiplies the rest
// transform — windmill-sails class; axisOf maps "y" -> [0,1,0]):
// `motion:well_screw` spin axis y (LOCAL frame) degPerSec -12. Apparent-
// climb law: right-handed helicoid rotating +w about +y shows its pattern
// translating -y; the water must read CLIMBING toward the bowl, so the
// sign is NEGATIVE. 2 rpm: pocket crosses any fixed angle every 5s, full
// turn 30s — SLOW and CALM, single-frequency.
//
// Water material: millrace lane exactly (canon 0x506a78 rough 0.25 metal
// 0.5 + faint same-hue emissive 0x2e4a58 @ 0.45 — polish-271/281). Timber/
// stone/iron: ninesbridge texMat lanes. The night accent is the water
// itself (teal pockets + bowl + cascade).
// Room gates honest: footprint ~31m2 >= 8, height ~3.9 >= 2.2 -> exact
// trimesh (open machine; circuit walk, no door lane).
// Deterministic: fixed trig, no RNG. helicoid stays in-script (housekit
// promotion on the second consumer, twistBand precedent).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

const stoneTex = texMat("sw_stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const timberTex = texMat("sw_timber", [0x6a5a3e, 0x74624a, 0x5c4e34], { rough: 0.9, scale: 2, weights: [2, 1, 1], cell: 24 });
const ironTex = texMat("sw_iron", [0x44402e, 0x4c4836, 0x3c3828], { rough: 0.7, scale: 2, weights: [2, 1, 1], cell: 24 });
const water = mat(0x506a78, 0.25, 0.5);
(water as any).emissive = new THREE.Color(0x2e4a58);
(water as any).emissiveIntensity = 0.45;

const D2R = Math.PI / 180;
const INC = 40 * D2R;                     // incline above horizon
const RZ = -(90 - 40) * D2R;              // rotation.z mapping local +y -> u
const A0 = new THREE.Vector3(1.4, 0.42, 0);
const U = new THREE.Vector3(Math.cos(INC), Math.sin(INC), 0); // local +y in world
const E1 = new THREE.Vector3(Math.cos(INC - 90 * D2R), Math.sin(INC - 90 * D2R), 0); // local +x
const BOWL = new THREE.Vector3(5.05, 0, 0); // bowl center (entity local)

// ---- the screw group (spinning) ----------------------------------------------
const screw = new THREE.Group();
screw.name = "well_screw";
screw.position.copy(A0);
screw.rotation.z = RZ;

const P = 0.97;                            // pitch (m per 2pi)
const R_BLADE = 0.72, R_SHAFT = 0.10;
const Y0 = 0.16;                           // blade lower station (local)
const TURNS = 4.52;
const yOf = (a: number) => Y0 + (P * a) / (2 * Math.PI);
const hp = (r: number, a: number) => new THREE.Vector3(r * Math.sin(a), yOf(a), r * Math.cos(a));

const cellBox = (
    p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, p4: THREE.Vector3,
    thick: number, matl: THREE.Material, name: string, parent: THREE.Object3D,
) => {
    const u = p2.clone().sub(p1).normalize();          // radial (the ruling)
    const v0 = p4.clone().sub(p1).normalize();
    const n = u.clone().cross(v0).normalize();
    const v = n.clone().cross(u).normalize();
    const lenR = p2.distanceTo(p1) + 0.02;
    const lenT = p4.distanceTo(p1) + 0.02;
    const m = new THREE.Mesh(new THREE.BoxGeometry(lenR, thick, lenT), matl);
    m.name = name;
    m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, n, v));
    m.position.copy(p1).add(p3).multiplyScalar(0.5);
    parent.add(m);
};

// blades: radial band r R_SHAFT..R_BLADE, 60 cells/turn, equal-angle
const STATIONS = Math.round(60 * TURNS);
for (let i = 0; i < STATIONS; i++) {
    const a0 = (i / 60) * 2 * Math.PI, a1 = ((i + 1) / 60) * 2 * Math.PI;
    cellBox(hp(R_SHAFT, a0), hp(R_BLADE, a0), hp(R_BLADE, a1), hp(R_SHAFT, a1),
        0.05, timberTex, "sw_blade", screw);
}

// shaft (free head end over the bowl) + lower gudgeon pin
{
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(R_SHAFT, R_SHAFT, 4.80, 12), timberTex);
    shaft.name = "sw_shaft";
    shaft.position.y = (-0.20 + 4.60) / 2;
    screw.add(shaft);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.30, 8), ironTex);
    pin.name = "sw_pin";
    pin.position.y = -0.35;
    screw.add(pin);
}

// water pockets: turns 0..4 (five), 12deg seams, r 0.30..0.62 in two
// bands, +0.045 above the helicoid, 40 tangential cells per band
for (let j = 0; j <= 4; j++) {
    const A0a = j * 2 * Math.PI + 0.21, A1a = (j + 1) * 2 * Math.PI - 0.21;
    const rb = [0.30, 0.46, 0.62];
    for (let rr = 0; rr < 2; rr++) {
        for (let i = 0; i < 40; i++) {
            const t0 = A0a + ((A1a - A0a) * i) / 40, t1 = A0a + ((A1a - A0a) * (i + 1)) / 40;
            const lift = (r: number, t: number) => hp(r, t).add(new THREE.Vector3(0, 0.045, 0));
            cellBox(lift(rb[rr], t0), lift(rb[rr + 1], t0), lift(rb[rr + 1], t1), lift(rb[rr], t1),
                0.035, water, "sw_water", screw);
        }
    }
}
g.add(screw);

// ---- the trough group (static, same transform) --------------------------------
const trough = new THREE.Group();
trough.name = "well_trough";
trough.position.copy(A0);
trough.rotation.z = RZ;
{
    // 170deg stone half-pipe centered local +x (theta 5..175 in cylinder frame)
    const T_Y0 = 0.55, T_Y1 = 2.75, segs = 22, th0 = 5 * D2R, th1 = 175 * D2R;
    for (let i = 0; i < segs; i++) {
        const t = th0 + ((th1 - th0) * (i + 0.5)) / segs;
        const w = 0.78 * (th1 - th0) / segs + 0.02;
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, T_Y1 - T_Y0, w), stoneTex);
        m.name = "sw_trough";
        m.rotation.y = t - 90 * D2R;
        m.position.set(0.78 * Math.sin(t), (T_Y0 + T_Y1) / 2, 0.78 * Math.cos(t));
        trough.add(m);
    }
    for (const yc of [0.6, 2.7]) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.90, 0.90, 0.16, 24), stoneTex);
        c.name = "sw_collar";
        c.position.y = yc;
        trough.add(c);
    }
    const yAxis = new THREE.Vector3(0, 1, 0), xAxis = new THREE.Vector3(1, 0, 0);
    for (const yc of [0.8, 1.7, 2.6]) {
        const s = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.035, 8, 36, 190 * D2R), ironTex);
        s.name = "sw_strap";
        s.quaternion.setFromAxisAngle(yAxis, -95 * D2R)
            .multiply(new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI / 2));
        s.position.y = yc;
        trough.add(s);
    }
}
g.add(trough);

// ---- sump pool -----------------------------------------------------------------
{
    const kerb = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.35, 40, 1, true), stoneTex);
    kerb.name = "sw_kerb";
    kerb.position.set(1.4, 0.175, 0);
    g.add(kerb);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.10, 8, 44), stoneTex);
    rim.name = "sw_kerbrim";
    rim.rotation.x = Math.PI / 2;
    rim.position.set(1.4, 0.35, 0);
    g.add(rim);
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 0.16, 36), water);
    pool.name = "sw_pool";
    pool.position.set(1.4, 0.14, 0);
    g.add(pool);
}

// ---- A-frame trestles under the trough tube ------------------------------------
// tube underside at station t: (1.924 + 0.766t, -0.204 + 0.643t)
const trestle = (t: number) => {
    const px = 1.924 + 0.766 * t, py = -0.204 + 0.643 * t;
    for (const s of [-1, 1]) {
        const top = new THREE.Vector3(px, py - 0.07, s * 0.95);
        const foot = new THREE.Vector3(px, 0, s * 1.10);
        const len = top.distanceTo(foot);
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, len, 0.16), timberTex);
        leg.name = "sw_post";
        leg.position.copy(top).add(foot).multiplyScalar(0.5);
        leg.lookAt(foot.clone().multiplyScalar(2).sub(top));
        leg.rotateX(-Math.PI / 2);
        g.add(leg);
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.34), stoneTex);
        shoe.name = "sw_postfoot";
        shoe.position.set(foot.x, 0.09, foot.z);
        g.add(shoe);
    }
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 1.90), timberTex);
    cap.name = "sw_postcap";
    cap.position.set(px, py, 0);
    g.add(cap);
};
trestle(1.4);   // (2.996, 0.697)
trestle(2.6);   // (3.916, 1.469)

// ---- the bowl (head cistern) ----------------------------------------------------
// arc-box chassis: box at azimuth az on circle radius R about BOWL, long
// axis tangential. Opening sector az 120..240 (near side, toward sump).
const arcBoxes = (
    R: number, yC: number, h: number, radialW: number, matl: THREE.Material,
    name: string, segs = 20,
) => {
    for (let i = 0; i < segs; i++) {
        const az = -120 * D2R + (240 * D2R * (i + 0.5)) / segs;
        const chord = 2 * R * Math.sin((120 * D2R) / segs) + 0.02;
        const m = new THREE.Mesh(new THREE.BoxGeometry(radialW, h, chord), matl);
        m.name = name;
        m.rotation.y = -az;
        m.position.set(BOWL.x + R * Math.cos(az), yC, BOWL.z + R * Math.sin(az));
        g.add(m);
    }
};
{
    // pedestal + foot + capital
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.50, 18), stoneTex);
    ped.name = "sw_pedestal";
    ped.position.set(BOWL.x, 1.25, BOWL.z);
    g.add(ped);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.14, 20), stoneTex);
    foot.name = "sw_pedfoot";
    foot.position.set(BOWL.x, 0.07, BOWL.z);
    g.add(foot);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.08, 20), stoneTex);
    cap.name = "sw_pedcap";
    cap.position.set(BOWL.x, 2.46, BOWL.z);
    g.add(cap);
    // floor: arc annulus r 0.30..0.92 at 2.50..2.55 + center disc.
    // Floor opening is WIDER than the wall's (az 90..270 absent): the blade
    // passes through the floor plane just outside the wall opening while
    // still rising — 26-point sweep interference caught by the probe.
    for (let i = 0; i < 16; i++) {
        const az = -90 * D2R + (180 * D2R * (i + 0.5)) / 16;
        const chord = 2 * 0.61 * Math.sin((90 * D2R) / 16) + 0.02;
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, chord), stoneTex);
        m.name = "sw_bowlfloor";
        m.rotation.y = -az;
        m.position.set(BOWL.x + 0.61 * Math.cos(az), 2.525, BOWL.z + 0.61 * Math.sin(az));
        g.add(m);
    }
    const cdisc = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.05, 20), stoneTex);
    cdisc.name = "sw_bowlfloorc";
    cdisc.position.set(BOWL.x, 2.525, BOWL.z);
    g.add(cdisc);
    // wall arc r 0.88..0.95 h 2.55..2.95
    arcBoxes(0.915, 2.75, 0.40, 0.14, stoneTex, "sw_bowlwall");
    // rim torus arc (same 240deg, opening az 120..240)
    const rimGeo = new THREE.TorusGeometry(0.91, 0.08, 8, 40, 240 * D2R);
    rimGeo.rotateZ(-120 * D2R);
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, stoneTex);
    rim.name = "sw_bowlrim";
    rim.position.set(BOWL.x, 2.95, BOWL.z);
    g.add(rim);
    // water disc (top 2.90)
    const bowlWater = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.84, 0.33, 30), water);
    bowlWater.name = "sw_bowlwater";
    bowlWater.position.set(BOWL.x, 2.735, BOWL.z);
    g.add(bowlWater);
}
// return cascade (south face, az -90 — wall present there)
{
    const spout = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.10, 0.35), stoneTex);
    spout.name = "sw_spout";
    spout.position.set(5.05, 2.86, -1.02);
    g.add(spout);
    const steps = [[-1.45, 2.30], [-1.90, 1.75], [-2.35, 1.20], [-2.80, 0.65]] as const;
    for (const [z, y] of steps) {
        const st = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.10, 0.55), stoneTex);
        st.name = "sw_step";
        st.position.set(5.05, y, z);
        g.add(st);
        const fl = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.03, 0.45), water);
        fl.name = "sw_stepfilm";
        fl.position.set(5.05, y + 0.07, z);
        g.add(fl);
    }
    const stringer = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.20, 2.30), timberTex);
    stringer.name = "sw_stringer";
    stringer.rotation.x = -Math.atan2(1.65, 1.35);
    stringer.position.set(5.05, 1.475, -2.125);
    g.add(stringer);
    const catchB = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.65), stoneTex);
    catchB.name = "sw_catch";
    catchB.position.set(5.05, 0.07, -3.25);
    g.add(catchB);
    const catchW = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.03, 0.50), water);
    catchW.name = "sw_catchfilm";
    catchW.position.set(5.05, 0.16, -3.25);
    g.add(catchW);
}

// ---- assertions ------------------------------------------------------------------
{
    // helicoid world transform (local (x,y,z) -> world)
    const w = (x: number, y: number, z: number) => new THREE.Vector3(
        A0.x + x * E1.x + y * U.x, A0.y + x * E1.y + y * U.y, z);
    const az_180_dist = (p: THREE.Vector3) => {
        const az = Math.atan2(p.z - BOWL.z, p.x - BOWL.x) / D2R;
        let dd = az - 180;                      // opening centered on az 180
        return ((dd + 540) % 360) - 180;        // wrap-safe angular distance
    };
    const inOpening = (p: THREE.Vector3) => Math.abs(az_180_dist(p)) < 60;
    // sweep the ACTUAL rotating surfaces (blades + pockets + shaft) against
    // the bowl solids: wall zone, floor zone, pedestal, and grade
    let wallBad = 0, floorBad = 0, pedBad = 0, minDip = Infinity, dipP = new THREE.Vector3();
    const floorHits: THREE.Vector3[] = [];
    const check = (p: THREE.Vector3) => {
        if (p.y < -0.02) throw Error(`below grade ${p.y.toFixed(3)}`);
        const ring = Math.hypot(p.x - BOWL.x, p.z - BOWL.z);
        if (p.y > 2.50 && p.y < 2.98 && ring > 0.84 && ring < 0.99 && !inOpening(p)) wallBad++;
        {
            let fd = az_180_dist(p);
            // true slab y 2.50..2.55 (+margins); points above 2.57 clear it
            if (p.y > 2.48 && p.y < 2.57 && ring < 0.94 && Math.abs(fd) > 93) { floorBad++; floorHits.push(p); }
        }
        if (p.y < 2.50 && ring < 0.30) pedBad++;
        if (p.x > 4.55 && p.y < minDip) { minDip = p.y; dipP = p; }  // lowest point INSIDE the bowl reach
    };
    for (let i = 0; i <= 2400; i++) {          // blades: whole span, both faces
        const a = (i / 2400) * TURNS * 2 * Math.PI;
        for (const r of [R_BLADE, 0.42, R_SHAFT]) {
            for (const off of [-0.025, 0.025]) {
                check(w((r + off) * Math.sin(a), yOf(a), (r + off) * Math.cos(a)));
            }
        }
    }
    for (let j = 0; j <= 4; j++) {              // pockets: outer surface
        const A0a = j * 2 * Math.PI + 0.21, A1a = (j + 1) * 2 * Math.PI - 0.21;
        for (let i = 0; i <= 200; i++) {
            const t = A0a + ((A1a - A0a) * i) / 200;
            for (const r of [0.30, 0.62]) {
                check(w(r * Math.sin(t), yOf(t) + 0.045 + 0.02, r * Math.cos(t)));
            }
        }
    }
    for (let i = 0; i <= 80; i++) {             // shaft cylinder
        const t = -0.20 + (4.80 * i) / 80;
        for (let k = 0; k < 12; k++) {
            const phi = (k / 12) * 2 * Math.PI;
            check(w(0.10 * Math.sin(phi), t, 0.10 * Math.cos(phi)));
        }
    }
    if (wallBad) throw Error(`${wallBad} sweep points inside the bowl wall arc`);
    if (floorHits.length) {
        for (const p of floorHits.slice(0, 6))
            console.log(`floorHit x ${p.x.toFixed(2)} y ${p.y.toFixed(2)} z ${p.z.toFixed(2)} az ${az_180_dist(p).toFixed(1)} ring ${Math.hypot(p.x - BOWL.x, p.z - BOWL.z).toFixed(2)}`);
        throw Error(`${floorHits.length} sweep points inside the bowl floor arc`);
    }
    if (pedBad) throw Error(`${pedBad} sweep points inside the pedestal`);
    // head dips into the bowl water band (2.57..2.90); floor top is 2.55
    if (minDip > 2.75 || minDip < 2.56) throw Error(`head dip ${minDip.toFixed(3)} outside [2.56, 2.75]`);
    if (Math.hypot(dipP.x - BOWL.x, dipP.z - BOWL.z) > 0.84) throw Error("head dip outside bowl water");
    // sump dip (turn 0 sample)
    let low = Infinity, lowP = new THREE.Vector3();
    for (let i = 0; i <= 2000; i++) {
        const a = (i / 2000) * 2 * Math.PI;
        const p = w(R_BLADE * Math.sin(a), yOf(a), R_BLADE * Math.cos(a));
        if (p.y < low) { low = p.y; lowP = p; }
    }
    if (low > 0.16 || low < 0.02) throw Error(`blade dip ${low.toFixed(3)} outside [0.02, 0.16]`);
    if (Math.hypot(lowP.x - 1.4, lowP.z) > 1.28) throw Error("dip point outside pool");
    // blade clears the trough inner wall
    if (R_BLADE + 0.025 > 0.745) throw Error("blade/trough clearance < 25mm");
    // KEEP group present for motion targeting
    let screwNode = false;
    screw.traverse((o: THREE.Object3D) => { if (o.name === "well_screw") screwNode = true; });
    if (!screwNode) throw Error("KEEP group missing");
    // room gates honest
    const env = new THREE.Box3().setFromObject(g);
    if (env.min.y < -0.02) throw Error(`below grade: ${env.min.y.toFixed(3)}`);
    const sz = env.getSize(new THREE.Vector3());
    if (sz.x * sz.z < 8) throw Error(`footprint ${(sz.x * sz.sz).toFixed(2)}`);
    if (sz.y < 2.2) throw Error(`height ${sz.y.toFixed(2)}`);
    console.log(`assertions OK: sump dip ${low.toFixed(3)}, head dip ${minDip.toFixed(3)} @ring ${Math.hypot(dipP.x - BOWL.x, dipP.z - BOWL.z).toFixed(2)}, bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)}`);
}
const merged = mergeByMaterial(g, "screwwell");
writeFileSync("agents/arthur/assets/village_screwwell3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_screwwell3.glb");
