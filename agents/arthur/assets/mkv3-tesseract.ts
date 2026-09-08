// mkv3-tesseract.ts — STRUCTURES LANE struct-110, Round 10 commission R10-11.
// THE TESSERACT: the form ledger's missing family — 4D PROJECTION (ledger
// grep fresh this tick: zero tesseract/hypercube/"fourth dimension"
// presence across the 59 nx-struct works and all sibling plans; "4D" hits
// are coordinate-axis mentions, not this family).
//
// ONE IDEA: THE SHADOW OF THE FOURTH DIMENSION. A hypercube projected to 3D
// is two nested cubes joined corner-to-corner — the outer ashlar frame open
// on all faces, a half-size iron cube floating at the heart, and EIGHT
// raking iron struts joining every outer corner to its inner twin. Those 8
// struts are the w-axis edges — the only part of a tesseract no 3D object
// has. The read at distance: a cube within a cube, welded by eight
// diagonals. Folly class (open frame — deliberately below room gates; a
// shadow admits no rooms). No entry advertised, no walk owed. Static by
// honest design. One brass dusk bead at the inner cube's crown (struct-82
// lineage): at dusk, the fourth dimension glows.
//
// Geometry laws honored:
// - inner cube is a HALF-scale copy, same center, axes parallel (the
//   canonical perspective projection of a 4-cube).
// - 8 struts join exact corner pairs — asserted by construction.
// - sill seats the frame on grade (terrain PY = lowest sample + sill depth,
//   seat-first law; sill is the only ground contact — frame floats above it
//   by design as the projection's "outer cell", sills lift nothing).
// - no two layer planes coplanar (z-fight law): frame ashlar, sill stone,
//   inner cube + struts iron, bead brass, socket stone.
// - sightline law: the crown bead must be visible from approach vantages
//   (occlusion-beats-emissive) — raycast-asserted.
// Determinism: fixed texMat seeds.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// ---- constants ----------------------------------------------------------------
const S = 2.4;                 // outer cube half-size (4.8m cube — reads at 18m)
const K = 0.5;                 // inner scale: canonical tesseract projection
const BEAM = 0.22;             // outer frame member thickness
const IB = 0.16;               // inner cube member thickness
const STRUT = 0.13;            // w-axis strut thickness (square section; v2 +2cm — back-bottom pair legibility)
const BR = 0.10;               // brass bead radius (dusk lineage)
const SILL = 0.24;             // sill slab thickness
const SILLW = 1.9;             // sill scale vs frame footprint (extends 0.9 beyond)
const LIFT = 0.06;             // sill top above local y=0 (reveal above grade)
const PAD = 0.30;              // corner pad height (v2: frame raised on 4 pads —
                               // the base plane opens, bottom edges + back-bottom
                               // struts get light/sky instead of sill-crush)
const PADSZ = 0.55;            // corner pad plan size
const FRAME_LIFT = LIFT + PAD; // frame base plane y (pad tops)

// corner signs
const SIG: Array<[number, number, number]> = [
    [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1],
];

// ---- materials -------------------------------------------------------------------
const ashlarTex = texMat("ts_ashlar", [0x847c6d, 0x8c8475, 0x746c5f], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 6311 }); // v2 one tone darker — separates monument from sill/ground
const sillTex = texMat("ts_sill", [0x6b665c, 0x736e63, 0x615c53], { rough: 0.96, scale: 2, weights: [3, 1, 1], seed: 6312 });
const ironTex = texMat("ts_iron", [0x5a626c, 0x4d545e, 0x666e78], { rough: 0.6, scale: 1, weights: [1, 1, 1], cell: 16, seed: 6313 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

// ---- outer cube frame (12 edges as beams) --------------------------------------
// Frame occupies y in [0 .. 2S]; sill sits under it. Local origin = frame base
// center at y=0 (the group's y=0 is the frame base, sill hangs below).
function edgeBetween(a: THREE.Vector3, b: THREE.Vector3, t: number, mat: THREE.Material): THREE.Mesh {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(t, len, t), mat);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return mesh;
}

const corners = SIG.map(([x, y, z]) => new THREE.Vector3(x * S, y * S + S + FRAME_LIFT, z * S)); // base on pad tops
// 12 outer edges: pairs differing in exactly one sign coordinate
for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
        const [ax, ay, az] = SIG[i], [bx, by, bz] = SIG[j];
        const diff = (ax !== bx ? 1 : 0) + (ay !== by ? 1 : 0) + (az !== bz ? 1 : 0);
        if (diff === 1) g.add(edgeBetween(corners[i], corners[j], BEAM, ashlarTex));
    }
}

// ---- inner cube (12 edges, half scale, centered at frame center) -----------------
const C = new THREE.Vector3(0, S + FRAME_LIFT, 0); // frame center
const icorners = SIG.map(([x, y, z]) => new THREE.Vector3(x * S * K + C.x, y * S * K + C.y, z * S * K + C.z));
for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
        const [ax, ay, az] = SIG[i], [bx, by, bz] = SIG[j];
        const diff = (ax !== bx ? 1 : 0) + (ay !== by ? 1 : 0) + (az !== bz ? 1 : 0);
        if (diff === 1) g.add(edgeBetween(icorners[i], icorners[j], IB, ironTex));
    }
}

// ---- 8 w-axis struts (outer corner -> corresponding inner corner) -----------------
for (let i = 0; i < 8; i++) {
    g.add(edgeBetween(corners[i], icorners[i], STRUT, ironTex));
}

// ---- crown pin + bead (w-axis riser through the open top face) --------------------
// The bead first sat directly on the inner crown (y~3.8); the sightline assert
// caught the inner cube's own top-front edge grazing it from 18m dead-ahead.
// Fix by design: a thin iron pin rises from the inner crown through the open
// top face — the w-axis expressed vertically — carrying the ember at y~4.47,
// clear of both the inner top edge (3.68) and under the outer crown beam.
{
    const topY = C.y + S * K;              // inner cube top face y = 3.6
    const PIN_H = 0.75, PIN_W = 0.15; // v2: square stanchion — 0.09 cyl read hairline/artifact at 18m
    const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.10, 0.09, 8), sillTex);
    socket.name = "glow_ts_socket";
    socket.position.set(0, topY + 0.045, 0);
    g.add(socket);
    const pin = new THREE.Mesh(new THREE.BoxGeometry(PIN_W, PIN_H, PIN_W), ironTex);
    pin.name = "ts_pin";
    pin.position.set(0, topY + 0.09 + PIN_H / 2, 0);
    g.add(pin);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BR, 12, 10), brassGlow);
    bead.name = "glow_ts_1";
    bead.position.set(0, topY + 0.09 + PIN_H + 0.02 + BR, 0);
    g.add(bead);
}

// ---- sill (single slab grounding the whole projection) ----------------------------
{
    const sill = new THREE.Mesh(new THREE.BoxGeometry(2 * S * SILLW, SILL, 2 * S * SILLW), sillTex);
    sill.position.set(0, -SILL / 2 + LIFT, 0); // top at +LIFT, base at LIFT - SILL
    g.add(sill);
    // v2: four ashlar pads under the vertical posts — the raised-cube idiom.
    // Pad tops exactly at the frame base plane (asserted below).
    for (const [x, y, z] of SIG) {
        if (y !== -1) continue;                 // bottom 4 corners
        const pad = new THREE.Mesh(new THREE.BoxGeometry(PADSZ, PAD, PADSZ), ashlarTex);
        pad.position.set(x * S, LIFT + PAD / 2, z * S);
        g.add(pad);
    }
}

// ---- construction asserts ---------------------------------------------------------
{
    // corner-pair law: strut endpoints are exact outer/inner corners
    const strutMeshes: THREE.Mesh[] = [];
    g.traverse((o: any) => {
        const m = o as THREE.Mesh;
        if (!(m as any).isMesh || m.material !== ironTex) return;
        strutMeshes.push(m);
    });
    // 8 struts + 12 inner edges = 20 iron meshes (inner cube + struts share iron)
    if (strutMeshes.length !== 21) throw Error(`iron mesh count ${strutMeshes.length} != 21 (12 inner edges + 8 struts + 1 pin)`);
    const ashlarCount = g.children.filter((c: any) => (c as THREE.Mesh).material === ashlarTex).length;
    if (ashlarCount !== 16) throw Error(`ashlar mesh count ${ashlarCount} != 16 (12 edges + 4 pads)`);
    // inner cube containment: every inner corner strictly inside outer cube
    for (const ic of icorners) {
        if (Math.abs(ic.x) >= S - 1e-9 || Math.abs(ic.z) >= S - 1e-9 || ic.y <= 1e-9 || ic.y >= 2 * S - 1e-9)
            throw Error(`inner corner not strictly inside: ${JSON.stringify(ic)}`);
    }
    // pad law: every pad top plane == frame base plane, pad footprint covers its post
    const pads = g.children.filter((c: any) => {
        const m = c as THREE.Mesh;
        return m.material === ashlarTex && m.position.y < 1 && Math.abs(Math.abs(m.position.x) - S) < 1e-9 && Math.abs(Math.abs(m.position.z) - S) < 1e-9;
    });
    if (pads.length !== 4) throw Error(`pad count ${pads.length} != 4`);
    for (const pad of pads as THREE.Mesh[]) {
        const top = pad.position.y + PAD / 2;
        if (Math.abs(top - FRAME_LIFT) > 1e-9) throw Error(`pad top ${top.toFixed(3)} != frame base ${FRAME_LIFT}`);
        const postOn = corners.some(cw => Math.abs(cw.x - pad.position.x) < 1e-6 && Math.abs(cw.z - pad.position.z) < 1e-6 && cw.y === FRAME_LIFT);
        if (!postOn) throw Error(`pad at (${pad.position.x},${pad.position.z}) carries no post corner`);
    }
    console.log(`tesseract law OK: 12 outer edges + 4 pads (ashlar), 12 inner edges + 8 struts (iron), pads carry posts, inner cube strictly inside at scale ${K}`);
}

// ---- bead sightline assertion (Raycaster; occlusion-beats-emissive law) ------------
{
    g.updateMatrixWorld(true);
    const bead = g.getObjectByName("glow_ts_1") as THREE.Mesh;
    const target = new THREE.Vector3();
    bead.getWorldPosition(target);
    const targets: THREE.Object3D[] = [];
    g.traverse((o: any) => { if ((o as any).isMesh && o !== bead && o.name !== "glow_ts_socket") targets.push(o); });
    const ray = new THREE.Raycaster();
    ray.firstHitOnly = true as any;
    let worst = "none";
    for (const [deg, dist] of [[0, 18], [30, 18], [-30, 18], [60, 18], [-60, 18], [0, 6], [25, 6]] as Array<[number, number]>) {
        const a = deg * Math.PI / 180;
        const eye = new THREE.Vector3(Math.sin(a) * dist, 1.65, Math.cos(a) * dist);
        const dir = target.clone().sub(eye).normalize();
        ray.set(eye, dir);
        const hits = ray.intersectObjects(targets, false);
        const beadDist = eye.distanceTo(target);
        if (hits.length && hits[0].distance < beadDist - BR - 0.02) {
            worst = `blocked from ${deg}°@${dist}m by ${hits[0].object.name || hits[0].object.type} at ${hits[0].distance.toFixed(2)} (bead ${beadDist.toFixed(2)})`;
            break;
        }
    }
    if (worst !== "none") throw Error(`bead sightline fail: ${worst}`);
    console.log(`bead sightline OK: clear from 5×18m + 2×6m vantages (bead world y ${target.y.toFixed(3)})`);
}

// ---- envelope + NaN assertions ------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    const expW = 2 * S * SILLW; // sill governs footprint
    if (Math.abs(sz.x - expW) > 0.01 || Math.abs(sz.z - expW) > 0.01) throw Error(`footprint ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} != sill ${expW.toFixed(2)}`);
    if (env.min.y < LIFT - SILL - 1e-6) throw Error(`below grade ${env.min.y}`);
    // v2: bottom frame edges visibly clear the sill top (D2 fix law)
    const bottomEdgeClear = FRAME_LIFT - LIFT; // air gap under bottom beams
    if (bottomEdgeClear < 0.25) throw Error(`bottom-edge air gap ${bottomEdgeClear} < 0.25 — sill-crush risk`);
    // crest law: the governing top is the OUTER frame's top beams (2S + BEAM/2),
    // not the bead — the pin riser deliberately ends 0.25 below the crown plane.
    const frameTop = 2 * S + FRAME_LIFT + BEAM / 2;
    const beadTop = C.y + S * K + 0.09 + 0.75 + 0.02 + 2 * BR;
    if (beadTop > frameTop) throw Error(`bead ${beadTop.toFixed(3)} pokes past crown ${frameTop.toFixed(3)}`);
    if (Math.abs(env.max.y - frameTop) > 0.01) throw Error(`crest ${env.max.y.toFixed(3)} != frame top ${frameTop.toFixed(3)}`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!(mesh as any).isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}]`);
}

const merged = mergeByMaterial(g, "tesseract");
writeFileSync("agents/arthur/assets/village_tesseract3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_tesseract3.glb`);
