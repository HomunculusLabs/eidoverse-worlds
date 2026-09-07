// mkv3-meridiandial.ts — STRUCTURES LANE struct-67, Round 5 commission R5-3.
// THE MERIDIAN DIAL: the instrument family's missing figure. The Observatory
// mirrors the sky, the Orrery models its motion, the meridianstair draws its
// line — nothing READS it. One idea (Judd): the shadow is the instrument.
// A polar-pointed stone blade over a carved octagonal court; the hour fan is
// mathematically TRUE (horizontal-dial law θ(H) = atan(sin φ · tan 15°(H−12)),
// φ = 40°); you stand ON the face to read the shadow at your feet.
//   - octagonal pad, two steps (R 3.7 / 3.4), dark margin band where the
//     steps meet (grounded band, not a floating ring);
//   - hour grooves 6h..18h (noon EXCEPTED — the noon line IS the meridian,
//     one line, no z-fighting twin) on the true law, fanned over the N
//     semicircle, starting clear of the blade's N face;
//   - 11 pale hour stones at the groove ends (7h..17h), the noon stone
//     taller with a brass noon pin;
//   - THE MERIDIAN: one continuous dark line N-edge→blade→S-edge — N
//     segment from the blade's N face to the pad edge (doubles as the noon
//     ray), S segment from the blade's S foot to the S edge; the blade
//     covers the middle honestly (real dials wear their gnomon over the
//     noon line);
//   - the GNOMON: one ashlar blade, style edge O→apex at exactly φ=40°
//     toward the pole, apex y 2.353 (oct area 38.7m² ≥ 8, height ≥ 2.2 →
//     roomScale exact trimesh; the pad is genuinely standable, blade solid);
//   - brass pole pin at the style apex + noon pin at the noon stone
//     (glow2 dusk lineage: wavepergola crest beads / ellipsecourt foci
//     pins / beacon head. ZERO lamp draw, no comps, no motion — the SHADOW
//     moves).
// Local north = −z (village convention); yaw 0 puts the meridian on world
// N-S. Sited on the village meridian (x=0). Determinism: fixed trig, fixed
// counts, asserts below.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { C } from "./housekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const stoneTex = texMat("dialstone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const darkTex = texMat("dialdark", [0x44402e, 0x4a4632, 0x3e3a2a], { rough: 0.93, scale: 2, weights: [2, 1, 1], cell: 32 });
const boneTex = texMat("dialbone", [0xdcdcba, 0xd2d2ae, 0xe4e4c8], { rough: 0.9, scale: 0.8 });
const brass = mat(0xa0a248, 0.4, 0.8);
(brass as any).emissive = new THREE.Color(0x8a5a20);
(brass as any).emissiveIntensity = 0.55;

// ---- the dial geometry constants -------------------------------------------
const PHI = (40 * Math.PI) / 180;      // polar latitude of the fiction
const FACE_Y = 0.36;                   // upper pad top = dial face
const R_LOWER = 3.7, R_UPPER = 3.4;    // octagon steps
const BLADE_L = 3.1, BLADE_T = 0.20;   // style length / E-W thickness
const APEX_Y = FACE_Y + Math.sin(PHI) * BLADE_L;   // 2.353
const N_EXT = Math.cos(PHI) * BLADE_L;            // 2.375 N reach of wedge
const GROOVE_R0 = 2.60, GROOVE_R1 = 2.80, STONE_R = 2.95;
const MERIDIAN_END = 3.06;             // both meridian segment far ends

// TRUE octagon boundary (flats on the axes after the π/8 spin): apothem
// a = R·cos(22.5°); the boundary at polar angle θ is a/cos(θ mod 45°).
// The old assert used the circumradius and let markers float past the flats.
const octBoundary = (thetaDeg: number): number => {
    const a = R_UPPER * Math.cos(Math.PI / 8);
    const m = Math.abs(((thetaDeg % 45) + 45) % 45);
    const c = Math.cos((m * Math.PI) / 180);
    return c > 1e-6 ? a / c : Infinity;
};

// laws (asserted, not promised)
const octArea = 2 * Math.SQRT2 * R_LOWER * R_LOWER;
if (octArea < 8) throw Error(`pad area ${octArea} < room gate`);
if (APEX_Y < 2.2) throw Error(`apex ${APEX_Y} < room height gate`);
if (N_EXT >= R_UPPER) throw Error(`wedge N reach ${N_EXT} overhangs upper pad`);
const styleAng = Math.atan2(Math.sin(PHI) * BLADE_L, N_EXT);
if (Math.abs(styleAng - PHI) > 1e-12) throw Error("style not at φ");
if (GROOVE_R0 <= N_EXT) throw Error("hour fan starts under the blade");

// ---- pad: two octagon steps + grounded margin band --------------------------
{
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(R_LOWER, R_LOWER, 0.16, 8), stoneTex);
    lower.name = "pad_lower";
    lower.position.y = 0.08;
    lower.rotation.y = Math.PI / 8;
    g.add(lower);
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(R_UPPER, R_UPPER, 0.20, 8), stoneTex);
    upper.name = "pad_upper";
    upper.position.y = 0.26;
    upper.rotation.y = Math.PI / 8;
    g.add(upper);
    // dark margin band where the steps meet: r 3.4..3.52, seated ON the
    // lower step's top (0.16..0.21) — a carved course, never floating
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(3.52, 3.52, 0.05, 8), darkTex);
    rim.name = "pad_rim";
    rim.position.y = 0.185;
    rim.rotation.y = Math.PI / 8;
    g.add(rim);
}

// ---- the hour fan: TRUE horizontal-dial law --------------------------------
// hour-line angle from the meridian (noon = 0): θ(H) = atan(sin φ · tan(15°(H−12)))
const hourAngle = (H: number) => Math.atan(Math.sin(PHI) * Math.tan((15 * (H - 12) * Math.PI) / 180));
// N-fan direction: noon due N (−z), morning hours W (−x), afternoon E (+x)
const dirOf = (H: number): [number, number] => {
    const th = hourAngle(H);
    return [Math.sin(th), -Math.cos(th)];
};
let grooveCount = 0, stoneCount = 0;
for (let H = 6; H <= 18; H++) {
    if (H === 12) continue;            // the noon line IS the meridian (below)
    const [dx, dz] = dirOf(H);
    const rMid = (GROOVE_R0 + GROOVE_R1) / 2, len = GROOVE_R1 - GROOVE_R0;
    const gr = new THREE.Mesh(new THREE.BoxGeometry(len, 0.03, 0.07), darkTex);
    gr.name = `groove_h${H}`;
    gr.position.set(dx * rMid, FACE_Y + 0.015, dz * rMid);
    gr.rotation.y = -Math.atan2(dz, dx);
    g.add(gr);
    grooveCount++;
    // hour stone at the groove's outer end (7h..17h only; 6h/18h axis ends
    // stay bare markers of the day's edge)
    if (H > 6 && H < 18) {
        const hgt = 0.24, wid = 0.14;
        const st = new THREE.Mesh(new THREE.BoxGeometry(wid, hgt, wid), boneTex);
        st.name = `hourstone_h${H}`;
        st.position.set(dx * STONE_R, FACE_Y + hgt / 2, dz * STONE_R);
        st.rotation.y = -Math.atan2(dz, dx);
        g.add(st);
        stoneCount++;
    }
}
// the noon stone + brass pin stand on the meridian's N end
{
    const hgt = 0.34, wid = 0.17;
    const st = new THREE.Mesh(new THREE.BoxGeometry(wid, hgt, wid), boneTex);
    st.name = "hourstone_h12";
    st.position.set(0, FACE_Y + hgt / 2, -STONE_R);
    g.add(st);
    stoneCount++;
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), brass);
    pin.name = "noonpin_";
    pin.position.set(0, FACE_Y + hgt + 0.055, -STONE_R);
    g.add(pin);
}
if (grooveCount !== 12) throw Error(`grooves ${grooveCount} != 12 (noon = meridian)`);
if (stoneCount !== 11) throw Error(`stones ${stoneCount} != 11`);
// stones sit on the face: TRUE boundary law — every stone's outer corner
// (center + half-diagonal) stays inside the octagon boundary at its hour
// angle; grooves end 0.07 short of their stones' near faces.
for (let H = 6; H <= 18; H++) {
    const th = Math.abs((hourAngle(H) * 180) / Math.PI);
    const b = octBoundary(th);
    if (STONE_R + 0.085 > b) throw Error(`stone h${H} outer ${STONE_R + 0.085} past boundary ${b.toFixed(3)}`);
    if (GROOVE_R1 + 0.035 > STONE_R - 0.085) throw Error(`groove h${H} crowds its stone`);
}
if (MERIDIAN_END + 0.035 > octBoundary(0)) throw Error("meridian ends past the N/S flats");
// symmetric hour pairs share |θ| (the law is odd in H)
for (const H of [7, 8, 9, 10, 11]) {
    if (Math.abs(hourAngle(H) + hourAngle(24 - H)) > 1e-12) throw Error(`hour pair ${H} asymmetric`);
}
if (Math.abs(hourAngle(12)) > 1e-12) throw Error("noon not on the meridian");

// ---- THE MERIDIAN: continuous dark line S and N of the blade ---------------
{
    // S segment: from just S of the blade foot (z 0) to the S flat
    const southLen = MERIDIAN_END - 0.15;
    const south = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, southLen), darkTex);
    south.name = "meridian_s";
    south.position.set(0, FACE_Y + 0.015, 0.15 + southLen / 2);
    g.add(south);
    // N segment: the NOON RAY — from just N of the blade's N face to the N
    // flat (longest groove on the dial: the meridian itself)
    const n0 = N_EXT + 0.10, n1 = MERIDIAN_END;
    const northLen = n1 - n0;
    const north = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, northLen), darkTex);
    north.name = "meridian_n_noon";
    north.position.set(0, FACE_Y + 0.015, -(n0 + northLen / 2));
    g.add(north);
}

// ---- the gnomon blade: style edge O→apex at φ, vertical N face -------------
{
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);                       // O: dial center, on the face
    shape.lineTo(N_EXT, 0);                   // B: below apex, on the face
    shape.lineTo(N_EXT, APEX_Y - FACE_Y);     // A: apex above B
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: BLADE_T, bevelEnabled: false });
    const blade = new THREE.Mesh(geo, stoneTex);
    blade.name = "gnomon_";
    // shape-x is "north-ward"; rotate so shape-x → world −z, thickness on world x
    blade.rotation.y = Math.PI / 2;
    blade.position.set(-BLADE_T / 2, FACE_Y, 0);
    g.add(blade);
    // the pole pin: brass bead at the style apex (the star it points to)
    const pole = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), brass);
    pole.name = "polepin_";
    pole.position.set(0, APEX_Y + 0.08, -N_EXT);
    g.add(pole);
}

// ---- envelope proof ----------------------------------------------------------
const maxY = APEX_Y + 0.16;
console.log(`envelope: x/z ±${(R_LOWER + 0.01).toFixed(2)} y 0..${maxY.toFixed(2)} oct-area ${octArea.toFixed(1)}m²`);
console.log(`hour θ: 9h=${((hourAngle(9) * 180) / Math.PI).toFixed(1)}° 7h=${((hourAngle(7) * 180) / Math.PI).toFixed(1)}° noon=0 style=${((styleAng * 180) / Math.PI).toFixed(1)}° apex=${APEX_Y.toFixed(3)}`);

const merged = mergeByMaterial(g, "meridiandial");
writeFileSync("agents/arthur/assets/village_meridiandial3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_meridiandial3.glb (grooves ${grooveCount}+meridian S/N, stones ${stoneCount}+noonpin+polepin)`);
