// mkv3-amphi.ts — STRUCTURES LANE struct-10: U-1 THE HILLSIDE THEATER.
// struct-43 REBUILD (improve round-1 row 24, native-confirmed survey-5):
// the original five STRAIGHT slab rows fragmented by 0.7m through-aisles
// read disconnected (20 floating boxes), the bbox-lift mast read as a
// telephone pole dead-center (shaft + T-crossarms + finial), the "bowl"
// was flat (all rows at one 0.42m height), and the wrap was <180deg.
// One cause-family: the form was a list, not a bowl.
// THE TRUE FORM: a stepped stone bowl — five concentric tier walls
// rising 0.44m each on a 1.04m radial pitch, wrapping 204deg of arc
// around the orchestra (mouth 156deg south, framing the skene), a
// single crown stair (0.22-rise half-steps) cutting the uphill axis,
// full-circle orchestra kerb + performance disc + brass pin, low crown
// parapet. The tier step IS the ornament; the parapet carries the 2.2m
// collider lift honestly (mast deleted). All materials texMat lanes
// (struct-38 family law). 3 nodes after merge; no comps, no motion.
// GLB origin stays at the OLD entity origin (row-0 line); bowl center
// is local (0, +5.24) — the old stage position — so the entity tuple is
// unchanged. Deterministic.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const brass = texMat("amphi_brass", [0xa0a248, 0x8a8c3c], { rough: 0.55, scale: 1, weights: [2, 1] });

const CZ = 5.24;            // bowl center in GLB-local z (old stage pos)
const R0 = 3.3;             // tier-1 inner radius
const PITCH = 1.04;         // radial tier pitch
const T = 0.55;             // wall thickness (radial)
const RISE = 0.44;          // height step per tier
const H1 = 0.88;            // tier-1 top height
const TIERS = 5;
const WRAP0 = 78, WRAP1 = 282;   // wrap arc, deg, about bowl center (180 = uphill)
const STAIR_HALF = 12.5;         // crown stair channel half-angle, deg (1.44m clear at r 3.3)
const D2R = Math.PI / 180;
const pt = (r: number, th: number): [number, number, number] => [r * Math.sin(th * D2R), 0, CZ + r * Math.cos(th * D2R)];

// ---- arc-wall emitter: quad strip between (rA..rB) x (y0..y1) over an
// angular span, with end caps; full-circle spans weld closed (last ring
// reuses the first ring's vertices; caps skipped). UVs from arc length
// and height so the texMat courses read as laid stone.
function arcWall(mat: THREE.Material, name: string, rA: number, rB: number, y0: number, y1: number, th0: number, th1: number, segs = 36) {
    const closed = (th1 - th0) >= 360;
    if (closed) th1 = th0 + 360;
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    const rings = closed ? segs : segs + 1;
    const ringIdx: number[][] = [];
    for (let i = 0; i < rings; i++) {
        const th = th0 + (th1 - th0) * (i / segs);
        const pA = pt(rA, th), pB = pt(rB, th);
        const b = pos.length / 3;
        pos.push(pA[0], y0, pA[2], pB[0], y0, pB[2], pB[0], y1, pB[2], pA[0], y1, pA[2]);
        const u = (th * D2R) * ((rA + rB) / 2) * 0.5;
        uv.push(u, y0, u, y0, u, y1, u, y1);
        ringIdx.push([b, b + 1, b + 2, b + 3]);
    }
    if (closed) ringIdx.push(ringIdx[0]); // weld seam
    for (let i = 0; i < segs; i++) {
        const a = ringIdx[i], b2 = ringIdx[i + 1];
        idx.push(a[0], b2[0], b2[1], a[0], b2[1], a[1], a[1], b2[1], b2[2], a[1], b2[2], a[2], a[2], b2[2], b2[3], a[2], b2[3], a[3], a[3], b2[3], b2[0], a[3], b2[0], a[0]);
    }
    if (!closed) {
        const cap = (th: number, flip: boolean) => {
            const pA = pt(rA, th), pB = pt(rB, th);
            const b = pos.length / 3;
            pos.push(pA[0], y0, pA[2], pB[0], y0, pB[2], pB[0], y1, pB[2], pA[0], y1, pA[2]);
            uv.push(0, y0, rB - rA, y0, rB - rA, y1, 0, y1);
            if (flip) idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
            else idx.push(b, b + 2, b + 1, b, b + 3, b + 2);
        };
        cap(th0, true); cap(th1, false);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = name;
    g.add(mesh);
}

// tier wall spans: the wrap [WRAP0, WRAP1] split by the stair channel at 180deg
const SPANS: ReadonlyArray<readonly [number, number]> = [[WRAP0, 180 - STAIR_HALF], [180 + STAIR_HALF, WRAP1]];

// ---- the bowl: five nested tier walls + timber seat caps
for (let i = 1; i <= TIERS; i++) {
    const r = R0 + (i - 1) * PITCH;         // inner radius of tier i
    const h = H1 + (i - 1) * RISE;          // tier-i top height
    for (const [a0, a1] of SPANS) {
        arcWall(stoneTex, `tier${i}_w`, r, r + T, 0, h, a0, a1);
        arcWall(timberTex, `tier${i}_c`, r + 0.03, r + T - 0.03, h, h + 0.06, a0 + 0.7, a1 - 0.7, 30); // seat cap rail
    }
}
// ---- crown parapet (carries the collider lift honestly; mast deleted),
// broken by the stair channel
{
    const r = R0 + (TIERS - 1) * PITCH;
    const y = H1 + (TIERS - 1) * RISE;
    for (const [a0, a1] of SPANS) arcWall(stoneTex, "parapet", r, r + T, y, y + 0.24, a0, a1, 40);
}

// ---- crown stair, two flights (walkability law: rises ≤0.18 — the
// water-stair proven class; engine has NO auto-step, only ground-snap):
// EXTERIOR flight — 16 treads of 0.165 rise / 0.26 run cascading from
// grade up the north face to the crown (the plaza-facing grand stair,
// flanked by solid cheek walls); INTERIOR channel — 4 quarter-treads of
// 0.11 rise per band descending each tier band, tread tops landing on
// tier tops at each band's inner edge, so the channel walks from crown
// down to tier-1 and sideways onto every tier cap en route.
{
    const CH_W = 2 * (R0 + (TIERS - 1) * PITCH + T) * Math.sin(STAIR_HALF * D2R) - 0.12; // channel chord at kerb
    // exterior flight: solid boxes from grade to tread top
    const FLIGHT = 16, FRISE = 0.165, FRUN = 0.26;
    const zKerbOuter = -(R0 + (TIERS - 1) * PITCH + T); // local z of bowl's north face (rel. center)
    for (let i = 0; i < FLIGHT; i++) {
        const hTop = (i + 1) * FRISE;
        const zMid = CZ + zKerbOuter - (FRUN * (FLIGHT - 1 - i)) - FRUN / 2 - 0.02;
        const tread = new THREE.Mesh(new THREE.BoxGeometry(CH_W, hTop, FRUN), stoneTex);
        tread.name = `flight_${i}`;
        tread.position.set(0, hTop / 2, zMid);
        g.add(tread);
    }
    // cheek walls flanking the flight (solid balustrades, full height)
    const zTop = CZ + zKerbOuter - FRUN / 2 - 0.02, zToe = zTop - FRUN * FLIGHT;
    for (const s of [-1, 1] as const) {
        const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.9, zTop - zToe + 0.3), stoneTex);
        cheek.name = `cheek_${s < 0 ? "w" : "e"}`;
        cheek.position.set(s * (CH_W / 2 + 0.15), 1.45, (zTop + zToe) / 2);
        g.add(cheek);
    }
    // interior channel quarter-treads per band
    for (let i = 1; i <= TIERS; i++) {
        const r = R0 + (i - 1) * PITCH;
        const h = H1 + (i - 1) * RISE;
        for (let q = 0; q < 4; q++) {
            const rOut = r + PITCH - q * (PITCH / 4);
            const hTop = h - q * (RISE / 4);
            const rm = rOut - PITCH / 8;
            const w = 2 * rm * Math.sin(STAIR_HALF * D2R) - 0.12;
            const tread = new THREE.Mesh(new THREE.BoxGeometry(w, hTop, PITCH / 4), stoneTex);
            tread.name = `stair_${i}_${q}`;
            tread.position.set(0, hTop / 2, CZ - rm);
            g.add(tread);
        }
    }
}

// ---- orchestra: kerb ring with a 30deg flush opening at the south
// mouth (bearing 0 — grade-level processional entry to the disc),
// full-circle performance disc + brass pin. Kerb outer face 3.28 keeps
// 0.02 clearance from tier-1 inner face 3.3 (no coincident faces).
arcWall(stoneTex, "kerb", R0 - 0.26, R0 - 0.02, 0, 0.22, 15, 345, 48);
{
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(R0 - 0.26, R0 - 0.26, 0.12, 40), stoneTex);
    disc.name = "stage";
    disc.position.set(0, 0.06, CZ);
    g.add(disc);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.34, 10), brass);
    pin.name = "spin_pin";
    pin.position.set(0, 0.24, CZ);
    g.add(pin);
}

const merged = mergeByMaterial(g, "amphi");
writeFileSync("agents/arthur/assets/village_amphi3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_amphi3.glb");
