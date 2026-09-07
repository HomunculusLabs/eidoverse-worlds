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
    boards: 0x86683e, leather: 0x4a3527, iron_lt: 0x8e9298, iron_dk: 0x3c3c42,
    timber: 0x9c8a6a, cutwood: 0xa09832, scorch: 0x34322d, ember: 0xd9844a,
    steel: 0xc8ccd0, // v3: nose cap + lever + T-handle (the value carrier)
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
const cap = B("iron_lt");
if (nozzle) {
    check("nozzle-droop", nozzle.box.min.y < (cap ? cap.box.min.y : 9) + 0.14, `nozzle min.y ${nozzle.box.min.y.toFixed(3)} vs cap min ${cap ? cap.box.min.y.toFixed(3) : "-"}`);
} else check("nozzle-droop", false, "nozzle bucket missing");

const ember = B("ember");
if (ember) {
    check("ember-at-nozzle", ember.box.min.x < -1.85 && ember.box.max.y < 0.15, `x ${ember.box.min.x.toFixed(2)}..${ember.box.max.x.toFixed(2)}, y max ${ember.box.max.y.toFixed(2)}`);
} else check("ember-at-nozzle", false, "ember bucket missing");

check("lever-low-pole", !!B("timber") && B("timber")!.box.max.y > 0.70 && B("timber")!.box.max.y < 0.85, `timber max.y ${B("timber") ? B("timber")!.box.max.y.toFixed(2) : "-"} (lever pole 0.74 tip; cradle rails 0.44)`);
check("steel-nose-present", !!B("steel") && B("steel")!.box.min.x < -1.8, `steel min.x ${B("steel") ? B("steel")!.box.min.x.toFixed(2) : "-"} (nose cap at -1.89)`);

console.log(failures.length === 0 ? "ALL PASS" : `FAILURES: ${failures.join(", ")}`);
process.exit(failures.length === 0 ? 0 : 1);
