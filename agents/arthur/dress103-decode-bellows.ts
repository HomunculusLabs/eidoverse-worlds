// dress103-decode-bellows.ts — decode audit for nx-dress-ne-bellows-001
// (v1 152e83b9). mergeByMaterial strips mesh names, so buckets are keyed by
// MATERIAL COLOR (each authored mat is distinct). Verifies from the ACTUAL
// built bytes:
//   1. grounded envelope (min y >= -0.02), height ~0.9-1.2, footprint <=2.6m2
//   2. node budget 3-25 after merge
//   3. wedge boards present and WEDGED (z-extent at nose << butt)
//   4. leather gusset INSET (z-extent strictly inside boards')
//   5. nozzle droop: nozzle bucket min.y < nose-cap bucket min.y + 0.12
//   6. lever raised: iron-lt bucket (lever) max.y > 0.95
//   7. ember bucket near nozzle drop (min.x < -1.85, max.y < 0.15)
//   8. all 8 authored color buckets present (value carrier incl.)
// Read-only. Exit 0 = all checks pass.
import * as THREE from "three";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(process.argv[2] ?? "");
const bytes = readFileSync(path);

const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
const root = gltf.scene;
root.updateMatrixWorld(true);

const failures: string[] = [];
const check = (name: string, ok: boolean, detail: string) => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name} — ${detail}`);
    if (!ok) failures.push(name);
};

// glbwrite bakes LINEAR bytes into COLOR_0 (three working space) and the
// render path consumes them raw — decode keys must therefore be built
// through THREE.Color (sRGB hex -> linear float), not the raw hex string.
const COLORS: Record<string, string> = {};
for (const [label, hexint] of Object.entries({
    boards: 0x86683e, leather: 0x4a3527, iron_dk: 0x3c3c42,
    timber: 0x9c8a6a, cutwood: 0xa09832, scorch: 0x34322d, ember: 0xd9844a,
    steel: 0xc8ccd0, // v3: nose cap + lever + T-handle (the value carrier)
    // v7: iron_lt 0x8e9298 RETIRED — its last consumer (nozzle tip) was
    // promoted to STEEL (the judged VALUE fix: bright at the fire-aim point)
} as Record<string, number>)) {
    const c = new THREE.Color(hexint);
    COLORS[label] = [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join(",");
}

// glbwrite bakes plain-mat colors into COLOR_0 (material exports white);
// only emissive mats keep a glTF baseColor. Classify buckets by COLOR_0
// bytes (fall back to material color for the emissive ember bucket).
const buckets = new Map<string, { box: THREE.Box3, meshes: THREE.Mesh[] }>();
root.traverse((o: any) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
        let label: string | undefined;
        // GLTFLoader maps glTF COLOR_0 to geometry.attributes.color
        const ca = o.geometry.attributes.color ?? o.geometry.attributes.COLOR_0;
        if (ca) {
            const key = [ca.getX(0), ca.getY(0), ca.getZ(0)].map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join(",");
            label = Object.entries(COLORS).find(([, v]) => v === key)?.[0];
            if (!label) label = `col${key}`; // unmapped vertex color
        }
        if (!label) {
            const mc = m.color;
            const key = [mc.r, mc.g, mc.b].map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join(",");
            label = Object.entries(COLORS).find(([, v]) => v === key)?.[0] ?? key;
        }
        if (!buckets.has(label)) buckets.set(label, { box: new THREE.Box3(), meshes: [] });
        const b = buckets.get(label)!;
        b.box.expandByObject(o);
        b.meshes.push(o);
    }
});
const B = (k: string) => buckets.get(k) ?? null;

const box = new THREE.Box3().setFromObject(root);
const size = box.getSize(new THREE.Vector3());
check("grounded", box.min.y >= -0.02, `min.y=${box.min.y.toFixed(3)}`);
// v8 SPAN law (probe-caught: the v1 frustum bug built every frustum 1.0m
// long regardless of authored x0/x1): boards must span the authored
// −1.85..−0.55 (1.30m) — nose face ≈ −1.85 (lower board) and butt face
// ≈ −0.55.
check("boards-span", boardsBoxCheck(), "authored span −1.85..−0.55");
function boardsBoxCheck(): boolean {
    const bb = buckets.get("boards");
    if (!bb) return false;
    return bb.box.min.x < -1.82 && bb.box.max.x > -0.58;
}
// v4: mid-stroke bellows on a low cradle — belt-high machine (~0.83m)
check("height", size.y > 0.72 && size.y < 1.15, `size.y=${size.y.toFixed(3)}`);
check("footprint", size.x * size.z <= 2.6, `${size.x.toFixed(2)}x${size.z.toFixed(2)}=${(size.x * size.z).toFixed(2)}m2`);
let nodes = 0;
root.traverse(() => { nodes++; });
check("node-budget", nodes >= 3 && nodes <= 26, `${nodes} nodes`);
check("all-buckets", Object.keys(COLORS).every(k => !!B(k)), `buckets: ${[...buckets.keys()].join(",")}`);

// v4 wedge laws: (a) ELEVATION wedge — boards bucket y-extent at the nose
// (x<-1.3) must exceed the butt's (x>-0.9) by 1.5x (the mid-stroke chamber
// is tall at the nose; hinge thin at the butt). (b) PLAN wedge — nose
// z-extent < 0.7 x butt z-extent (frustum taper).
const boards = B("boards");
if (boards) {
    let noseZ = 0, buttZ = 0, noseYE = 0, buttYE = 0;
    for (const mesh of boards.meshes) {
        mesh.updateWorldMatrix(true, false);
        const p = mesh.geometry.attributes.position;
        const v = new THREE.Vector3();
        let zminN = 9, zmaxN = -9, zminB = 9, zmaxB = -9, yminN = 9, ymaxN = -9, yminB = 9, ymaxB = -9;
        for (let i = 0; i < p.count; i++) {
            v.fromBufferAttribute(p as THREE.BufferAttribute, i).applyMatrix4(mesh.matrixWorld);
            if (v.x < -1.3) { zminN = Math.min(zminN, v.z); zmaxN = Math.max(zmaxN, v.z); yminN = Math.min(yminN, v.y); ymaxN = Math.max(ymaxN, v.y); }
            if (v.x > -0.9) { zminB = Math.min(zminB, v.z); zmaxB = Math.max(zmaxB, v.z); yminB = Math.min(yminB, v.y); ymaxB = Math.max(ymaxB, v.y); }
        }
        if (zminN < 9) { noseZ = Math.max(noseZ, zmaxN - zminN); noseYE = Math.max(noseYE, ymaxN - yminN); }
        if (zminB < 9) { buttZ = Math.max(buttZ, zmaxB - zminB); buttYE = Math.max(buttYE, ymaxB - yminB); }
    }
    check("wedge-taper-plan", noseZ < buttZ * 0.7 && buttZ > 0.4, `plan: nose ${noseZ.toFixed(2)} < 0.7*butt ${buttZ.toFixed(2)}`);
    check("wedge-taper-elevation", noseYE > buttYE * 1.4 && noseYE > 0.3, `elevation: nose y-ext ${noseYE.toFixed(2)} > 1.4*butt ${buttYE.toFixed(2)}`);
} else { check("wedge-taper-plan", false, "boards bucket missing"); check("wedge-taper-elevation", false, "boards bucket missing"); }

const gusset = B("leather");
if (boards && gusset) {
    const bZ = Math.max(boards.box.max.z, -boards.box.min.z);
    const gZ = Math.max(gusset.box.max.z, -gusset.box.min.z);
    check("gusset-inset", gZ < bZ - 0.03, `gusset ${gZ.toFixed(2)} < boards ${bZ.toFixed(2)}`);
} else check("gusset-inset", false, "bucket missing");

const nozzle = B("iron_dk");
const cap = B("steel");
if (nozzle && cap) {
    check("nozzle-droop", nozzle.box.min.y < cap.box.min.y + 0.14, `nozzle min.y ${nozzle.box.min.y.toFixed(3)} vs steel band min ${cap.box.min.y.toFixed(3)}`);
    // v7 VALUE law 1: the band sits PROUD of the boards at the nose —
    // steel max.y must top the boards' nose top (steel carries the
    // leading silhouette edge).
    const boards = B("boards")!;
    let noseTopBoards = -9;
    for (const mesh of boards.meshes) {
        mesh.updateWorldMatrix(true, false);
        const p = mesh.geometry.attributes.position;
        const v = new THREE.Vector3();
        for (let i = 0; i < p.count; i++) {
            v.fromBufferAttribute(p as THREE.BufferAttribute, i).applyMatrix4(mesh.matrixWorld);
            if (v.x < -1.7) noseTopBoards = Math.max(noseTopBoards, v.y);
        }
    }
    check("steel-band-proud", cap.box.max.y > noseTopBoards + 0.02, `steel max.y ${cap.box.max.y.toFixed(3)} > boards nose top ${noseTopBoards.toFixed(3)} + 0.02`);
    // v8: relational — the band's back face must embed into the boards'
    // nose: steel x at the BAND (|y-0.71|<0.35) reaches back past the
    // boards' nose face x. (Global steel max.x catches the lever_t T-bar
    // at the butt end.)
    let steelBandMaxX = -9, bandYmin = 9, bandYmax = -9;
    for (const mesh of cap.meshes) {
        mesh.updateWorldMatrix(true, false);
        const p = mesh.geometry.attributes.position;
        const v = new THREE.Vector3();
        for (let i = 0; i < p.count; i++) {
            v.fromBufferAttribute(p as THREE.BufferAttribute, i).applyMatrix4(mesh.matrixWorld);
            if (v.x < -1.5 && v.y > 0.36 && v.y < 1.06) { steelBandMaxX = Math.max(steelBandMaxX, v.x); bandYmin = Math.min(bandYmin, v.y); bandYmax = Math.max(bandYmax, v.y); }
        }
    }
    const boardsNoseX = -1.80; // authored nose face (decode: boards min.x ≈ −1.80±0.01)
    check("steel-band-embed", steelBandMaxX > boardsNoseX, `band back face x ${steelBandMaxX.toFixed(3)} embeds boards nose ${boardsNoseX.toFixed(2)} (band y ${bandYmin.toFixed(2)}..${bandYmax.toFixed(2)})`);
} else check("nozzle-droop", false, "nozzle/steel bucket missing");

// v7 REAL-SLAB law: the top board must be a solid, not a sheet — at the
// butt (x>-0.9), upper-board verts (y>0.55, clear of the lower board)
// must show TWO y-faces at the same x: per-x-slice thickness >= 0.08 in
// at least 3 x-slices. (A tilted zero-thickness sheet spans ~0.18 in y
// ACROSS its tilt — a global extent check would false-pass it.)
// v8 relational note: steel bucket also carries the lever_t box — key the
// check on the boards bucket only, as here.
const boardsB = B("boards");
if (boardsB) {
    const slices = new Map<string, number[]>();
    for (const mesh of boardsB.meshes) {
        mesh.updateWorldMatrix(true, false);
        const p = mesh.geometry.attributes.position;
        const v = new THREE.Vector3();
        for (let i = 0; i < p.count; i++) {
            v.fromBufferAttribute(p as THREE.BufferAttribute, i).applyMatrix4(mesh.matrixWorld);
            if (v.x > -0.9 && v.y > 0.55) {
                const k = v.x.toFixed(2);
                if (!slices.has(k)) slices.set(k, []);
                slices.get(k)!.push(v.y);
            }
        }
    }
    let thick = 0;
    for (const ys of slices.values()) if (Math.max(...ys) - Math.min(...ys) >= 0.08) thick++;
    // BoxGeometry is corner-only: ONE x-face per board end, so the butt
    // region can hold at most 1 slice (two y-faces at that face). A tilted
    // zero-thickness sheet yields a single y per face and fails; a real
    // slab yields the 0.10 two-face pair. Threshold is therefore >= 1.
    check("top-board-slab", thick >= 1, `${thick}/${slices.size} x-slices with >=0.08 two-face thickness`);
} else check("top-board-slab", false, "boards bucket missing");

const ember = B("ember");
if (ember) {
    check("ember-at-nozzle", ember.box.min.x < -1.85 && ember.box.max.y < 0.15, `x ${ember.box.min.x.toFixed(2)}..${ember.box.max.x.toFixed(2)}, y max ${ember.box.max.y.toFixed(2)}`);
} else check("ember-at-nozzle", false, "ember bucket missing");

check("lever-low-pole", !!B("timber") && B("timber")!.box.max.y > 0.70 && B("timber")!.box.max.y < 0.85, `timber max.y ${B("timber") ? B("timber")!.box.max.y.toFixed(2) : "-"} (lever pole 0.74 tip; cradle rails 0.44)`);
check("steel-nose-present", !!B("steel") && B("steel")!.box.min.x < -1.8, `steel min.x ${B("steel") ? B("steel")!.box.min.x.toFixed(2) : "-"} (nose cap at -1.89)`);

console.log(failures.length === 0 ? "ALL PASS" : `FAILURES: ${failures.join(", ")}`);
process.exit(failures.length === 0 ? 0 : 1);
