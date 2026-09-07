// mkv3-observatory.ts — STRUCTURES LANE struct-2: S-1 THE OBSERVATORY.
// Era-1 heritage reborn: a stone drum with an oculus-slit dome, harmonic
// ring courses, a brass meridian band arcing over the slit, and a circular
// sky-view bench inside under the oculus. Silhouette first: dome + brass
// meridian arc + open eye reads "observatory" at gameplay distance.
// Room gates (honest): bbox footprint 6.4 x 6.4 = 41m2 >= 16m2, height
// ~4.6m >= 2.2m -> real trimesh; door arc clear ~1.53m >= 1.4m between
// jambs; threshold 0.22 <= 0.25m. No comps, no motion (empty comp bag,
// statuary-family contract).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// Materials — standing families only.
const ashlar = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const brass = mat(C.BRASS, 0.55, 0);
const bone = mat(C.BONE, 0.9, 0);
const dark = mat(C.DARK, 0.95, 0);

const R = 3.2;            // drum radius
const WALL_H = 3.4;       // drum wall height
const GAP_ARC = 0.62;     // door gap angle (rad) centered on +Z (south)
const T0 = 0.30;          // dome theta at oculus rim
const T1 = 0.98;          // dome theta at base rim
const DOME_SY = 0.8;      // dome vertical squash
const domeRimY = WALL_H;
const apexY = domeRimY + DOME_SY * R * (Math.cos(T0) - Math.cos(T1));

// ---- floor slab (cylinder, threshold rise 0.22 <= 0.25) ----
{
    const f = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.22, 24), ashlar);
    f.name = "floor";
    f.position.y = 0.11;
    g.add(f);
}

// ---- drum wall: door gap only up to the lintel head; above it the drum
// closes full-ring so the ring courses always cross WALL, never sky.
// (struct-44 / improve row 25: the full-height gap left the front-center
// bay open above the lintel — the y3.15 course crossed the bay with sky
// behind it, reading as floating trim fragments between two exact-sky
// slits: dome-underside↔trim and trim↔lintel-top. Closing 2.62→3.4 kills
// both slits at the root; door lane below 2.2 is untouched.)
{
    const headY = 2.62; // lintel top: center 2.41 + half 0.21
    const lower = new THREE.Mesh(
        new THREE.CylinderGeometry(R, R, headY, 28, 1, true, GAP_ARC / 2, Math.PI * 2 - GAP_ARC),
        ashlar,
    );
    lower.name = "drum";
    lower.position.y = headY / 2;
    (lower.material as THREE.Material).side = THREE.DoubleSide;
    g.add(lower);
    const upper = new THREE.Mesh(
        new THREE.CylinderGeometry(R, R, WALL_H - headY, 28, 1, true),
        ashlar,
    );
    upper.name = "drum_head";
    upper.position.y = headY + (WALL_H - headY) / 2;
    (upper.material as THREE.Material).side = THREE.DoubleSide;
    g.add(upper);
}

// ---- plinth ring (same gap, so the door run stays clear) ----
{
    const p = new THREE.Mesh(
        new THREE.CylinderGeometry(R + 0.09, R + 0.12, 0.26, 28, 1, true, GAP_ARC / 2, Math.PI * 2 - GAP_ARC),
        ashlar,
    );
    p.name = "plinth";
    p.position.y = 0.13;
    g.add(p);
}

// ---- harmonic ring courses: tori at shrinking spacing toward the dome ----
// 3.4 (dome base) -> 3.15 -> 2.6: spacings 0.25 / 0.55 (halving rhythm);
// alternated stone tones so the coursing reads as bands, not one surface.
{
    const courses: Array<[number, number]> = [[WALL_H - 0.25, 0x5c5a44], [WALL_H - 0.8, 0x4c4836]];
    for (const [i, [y, tone]] of courses.entries()) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(R + 0.045, 0.055, 5, 40), mat(tone, 0.95, 0));
        t.name = `course_${i}`;
        t.rotation.x = Math.PI / 2;
        t.position.y = y;
        g.add(t);
    }
}

// ---- door: bone jambs + lintel, threshold, stoop (CLEAR-law two rises) ----
{
    const gapChord = 2 * R * Math.sin(GAP_ARC / 2); // ~1.97m at wall surface
    const jambW = 0.12;
    // clear span between jambs ~= 1.97 - 2*0.12/... jambs sit at the gap edges
    const halfSpan = R * Math.sin(GAP_ARC / 2);
    for (const s of [-1, 1]) {
        box(g, `jamb_${s < 0 ? "w" : "e"}`, jambW, 2.2, 0.24, s * (halfSpan + 0.02), 1.1, R - 0.02, C.BONE);
    }
    box(g, "lintel", gapChord + 0.5, 0.42, 0.26, 0, 2.2 + 0.21, R - 0.02, C.BONE);
    box(g, "threshold", gapChord, 0.22, 0.5, 0, 0.11, R + 0.1, C.MID);
    const stoopH = 0.22 / 2 + 0.03;
    box(g, "stoop", gapChord + 0.3, stoopH, 0.7, 0, stoopH / 2, R + 0.45, C.STONE);
}

// ---- two slit windows (E/W) — struct-54 REFINE: struct-52's class-catch.
// v1 (struct-12) seated an emissive pane BEHIND a solid dark frame box on
// both faces — the frame fully occluded the pane from every angle (struct-52
// law: a lit pane recessed behind a solid frame can NEVER render; occlusion
// beats emissive). v2 deletes the frames entirely and seats each pane in the
// drum wall itself, outer face +0.04 proud of the wall so the ashlar IS the
// frame (same idiom as the accepted beacon fix). Band center moved
// 2.55 -> 1.95: the old band (y 2.05-3.05) was crossed at exactly the E/W
// azimuths by BOTH ring-course tori (y3.15 outer 3.30, y2.6 outer 3.30) —
// even with frames gone the course bands would have chopped the panes into
// a detached three-piece read (survey-3's original finding class). New band
// y1.45-2.45 clears both courses; door-lane head 2.62 and drum lintel
// geometry untouched.
for (const s of [-1, 1]) {
    const pane = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 1.0, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xfeec78, emissiveIntensity: 0.9, roughness: 0.4 }),
    );
    pane.name = `lamp_slit_${s < 0 ? "w" : "e"}`;
    // seat in the wall: wall surface at radius R; pane depth 0.06 centered
    // at R+0.01 -> outer face R+0.04 proud, inner face R-0.02 embedded.
    pane.position.set(s * (R + 0.01), 1.95, 0);
    pane.rotation.y = s * Math.PI / 2;
    g.add(pane);
}

// ---- dome: sphere segment with oculus (theta cut) + meridian slit (phi cut) ----
// phiStart/phiLength leave a 0.18-rad wedge centered on the x-axis: the slit.
{
    const dome = new THREE.Mesh(
        new THREE.SphereGeometry(R, 28, 10, 0.09, Math.PI * 2 - 0.18, T0, T1 - T0),
        ashlar,
    );
    dome.name = "dome";
    dome.scale.y = DOME_SY;
    // base ring local y = DOME_SY * R * cos(T1), so to seat it AT domeRimY
    // the mesh origin must sit BELOW the rim by exactly that amount.
    dome.position.y = domeRimY - DOME_SY * R * Math.cos(T1);
    (dome.material as THREE.Material).side = THREE.DoubleSide;
    g.add(dome);
}

// ---- oculus ring: brass rim naming the eye ----
{
    const or = new THREE.Mesh(new THREE.TorusGeometry(R * Math.sin(T0) * 1.02, 0.05, 6, 24), brass);
    or.name = "oculus";
    or.rotation.x = Math.PI / 2;
    or.position.y = apexY;
    g.add(or);
}

// ---- brass meridian band: tube over the dome profile (x-plane), feet at rim ----
{
    const pts: THREE.Vector3[] = [];
    const N = 24;
    for (let i = 0; i <= N; i++) {
        const u = i / N * 2 - 1;                 // -1 .. 1
        const th = T0 + (1 - Math.abs(u)) * (T1 - T0);
        const x = Math.sign(u || 1) * R * 1.045 * Math.sin(th);
        const y = domeRimY + DOME_SY * R * (Math.cos(th) - Math.cos(T1));
        pts.push(new THREE.Vector3(x, y, 0));
    }
    const tube = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.055, 6, false),
        brass,
    );
    tube.name = "meridian";
    g.add(tube);
    // meridian feet: brass pads at the +-X rim of the drum
    for (const s of [-1, 1]) {
        box(g, `mfoot_${s < 0 ? "w" : "e"}`, 0.3, 0.5, 0.3, s * (R + 0.02), 0.25, 0, C.BRASS);
    }
}

// ---- interior: circular sky-view bench ring + central brass gnomon ----
{
    const SEGS = 10;
    for (let i = 0; i < SEGS; i++) {
        const a = (i / SEGS) * Math.PI * 2;
        const bx = Math.cos(a) * 2.35, bz = Math.sin(a) * 2.35;
        const seg = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.09, 0.42), timberTex);
        seg.name = `bench_${i}`;
        seg.position.set(bx, 0.45, bz);
        seg.rotation.y = -a + Math.PI / 2;
        g.add(seg);
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.36, 0.36), timberTex);
        leg.name = `bleg_${i}`;
        leg.position.set(bx, 0.25, bz);
        leg.rotation.y = seg.rotation.y;
        g.add(leg);
    }
    const gnomon = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.15, 8), brass);
    gnomon.name = "gnomon";
    gnomon.position.y = 0.22 + 1.15 / 2;
    g.add(gnomon);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), brass);
    tip.name = "gtip";
    tip.position.y = 0.22 + 1.15 + 0.05;
    g.add(tip);
}

const merged = mergeByMaterial(g, "observatory");
writeFileSync("agents/arthur/assets/village_observatory3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_observatory3.glb");
