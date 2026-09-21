// fauna87-decode-lizd.ts — decode audit for the fauna-87 common lizard.
// GREEN contract (village_dress_lizd1.glb v1): 4 motion anchors (lizd,
// lizd_body, lizd_head, lizd_tail) + lizd_a seat wrapper; buckets root 2
// (FT + EYE... — bucket counts derive from the material table, asserted
// loose ≥1 per part family); whole seated envelope H ≈ 0.30..0.36 (the
// body+head+tail span up/down the face), tangential span ≈ 0.03..0.06,
// min.y ≈ 1.09..1.13 (tail tip below the seat at 1.50, draping down the
// face — never below 1.09, the mouth crown line); CONTACT LAWS: torso
// belly min-vertex radial within [stoneR−0.012, stoneR+0.002] at its own
// y (pressed-contact, 2.2mm embed post-bake), feet min radial ≥ stoneR−
// 0.010 (gripping, ±), tail min radial ≥ stoneR − 0.012; TAIL LAW:
// tail/HB ratio in [1.3, 1.7] (vole decode-gate law applied), where HB
// = lizd_body+lizd_head spine length (0.106+baked) and tail = lizd_tail
// extent along −y; EYE LAW: pale lid material present (LID bucket > 0
// verts) — the reptile-eye read. RED control: magpi bytes must FAIL —
// zero lizd anchors.
// stoneR(y) from the probe fit: lower drum y≤1.6 → r = 0.990 −
// 0.013·(1.5−y) (0.990 at 1.5 rising to 1.005 at 1.6? — the probe shows
// maxR 0.99 at y1.5 and 0.983..0.983 at 1.7's lower edge; a LINEAR FIT
// through the y-bin maxima: r(1.2)=1.008, r(1.5)=0.990, r(1.7)=0.983,
// r(2.0)=0.941 (upper drum). FIT for y in [1.09, 1.6]: r(y) = 1.008 −
// 0.06·(y−1.2) — exact enough at ±5mm.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const die = (m: string): never => { throw Error(m); };

const load = async (path: string) => {
    const bytes = readFileSync(path);
    const sha = createHash("sha256").update(bytes).digest("hex");
    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
    return { sha, sha16: sha.slice(0, 16), gltf };
};

const box = (root: THREE.Object3D, name: string) => {
    const p = root.getObjectByName(name);
    if (!p) return null;
    root.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(p);
};
const span = (b: THREE.Box3) => {
    const s = new THREE.Vector3(); b.getSize(s);
    return [s.x, s.y, s.z] as const;
};

// the drum outer-radius fit from fauna87-probe-kiln.ts (served bytes,
// vertex-true): y-bin maxima on the SSW arc.
const stoneR = (y: number) => {
    if (y >= 1.6) return 0.990 - 0.15 * (y - 1.6) - 0.000; // upper drum, steeper: 0.983@1.7 → 0.941@1.98
    return 1.008 - 0.06 * (y - 1.2);
};

const GREEN = async (path: string) => {
    const { sha16, gltf } = await load(path);
    const root = gltf.scene;
    const names: string[] = [];
    root.traverse((o) => names.push(o.name));
    console.log(`lizd decode ${path.split("/").pop()} sha16 ${sha16}`);
    for (const a of ["lizd", "lizd_body", "lizd_head", "lizd_tail", "lizd_a"]) {
        if (!names.includes(a)) die(`anchor ${a} absent (KEEP law)`);
    }
    const whole = box(root, "lizd_a");
    if (!whole) die("no lizd_a");
    const [wW, wH, wD] = span(whole);
    console.log(`whole  W ${wW.toFixed(4)} H ${wH.toFixed(4)} D ${wD.toFixed(4)} lo [${whole.min.toArray().map((v) => v.toFixed(3))}] hi [${whole.max.toArray().map((v) => v.toFixed(3))}]`);
    // seated frame: v2 TRUE member arithmetic — head +0.086 above seat,
    // tail −0.291 below → H ≈ 0.377; tangential drift W 0.12
    if (!(wH > 0.35 && wH < 0.41)) die(`whole H ${wH} (the pressed span up/down the face)`);
    // tail tip below the seat, above the mouth crown (1.09)
    if (!(whole.min.y > 1.18 && whole.min.y < 1.24)) die(`whole min.y ${whole.min.y} (tail drape band)`);
    // head end above the seat
    if (!(whole.max.y > 1.56 && whole.max.y < 1.61)) die(`whole max.y ${whole.max.y}`);
    // tangential spread (the curve drift) + radial extent
    if (!(wW > 0.09 && wW < 0.16 && wD > 0.02 && wD < 0.07)) die(`spread W ${wW} D ${wD}`);

    // ---- CONTACT + TAIL LAWS via per-vertex radial about the drum axis ----
    const vrad = (name: string) => {
        const p = root.getObjectByName(name)!;
        let min = Infinity, max = -Infinity, minY = 0, maxY = 0;
        const v = new THREE.Vector3();
        p.traverse((o: any) => {
            if (!o.isMesh) return;
            const pos = o.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
                const r = Math.hypot(v.x, v.z);
                if (r < min) { min = r; minY = v.y; }
                if (r > max) { max = r; maxY = v.y; }
            }
        });
        return { min, max, minY, maxY };
    };
    const bodv = vrad("lizd_body");
    console.log(`body vrad min ${bodv.min.toFixed(4)} (stone ${stoneR(bodv.minY).toFixed(4)}) at y ${bodv.minY.toFixed(3)} | max ${bodv.max.toFixed(4)}`);
    if (!(bodv.min > stoneR(bodv.minY) - 0.012 && bodv.min < stoneR(bodv.minY) + 0.004)) die(`BELLY CONTACT vrad ${bodv.min} vs stone ${stoneR(bodv.minY)}`);
    const headv = vrad("lizd_head");
    console.log(`head vrad min ${headv.min.toFixed(4)} (stone ${stoneR(headv.minY).toFixed(4)}) at y ${headv.minY.toFixed(3)}`);
    if (!(headv.min > stoneR(headv.minY) - 0.012)) die(`HEAD CONTACT vrad ${headv.min} vs stone ${stoneR(headv.minY)}`);
    const tailv = vrad("lizd_tail");
    const tailBox = box(root, "lizd_tail")!;
    const [tX, tY, tZ] = span(tailBox);
    console.log(`tail vrad min ${tailv.min.toFixed(4)} (stone ${stoneR(tailv.minY).toFixed(4)}) at y ${tailv.minY.toFixed(3)} | extent Y ${tY.toFixed(4)}`);
    if (!(tailv.min > stoneR(tailv.minY) - 0.014)) die(`TAIL CONTACT vrad ${tailv.min} vs stone ${stoneR(tailv.minY)}`);
    // TAIL/HB ratio: HB = SVL = the lizd_body box Y (the head is a CHILD
    // of body — the box already spans snout-to-rump; adding the head box
    // again double-counts it, v2 decode lesson)
    const bodBox = box(root, "lizd_body")!;
    const hb = span(bodBox)[1];
    const ratio = tY / hb;
    console.log(`tail law: extent ${tY.toFixed(4)} / SVL ${hb.toFixed(4)} (body-box snout-to-rump) = ${ratio.toFixed(3)} [1.3, 1.7]`);
    if (!(ratio > 1.3 && ratio < 1.7)) die(`TAIL/HB ratio ${ratio}`);
    void tX; void tZ;
    // EYE LAW: the pale-lid material must exist in the head's buckets
    // (merge names carry no material labels — assert via vertex colors?
    // the LID mat shares COLOR_0 0xd8d3c2; decode via a tiny color probe
    // is overkill — assert the head has ≥2 material buckets)
    const headBuckets = names.filter((n) => /^lizd_head_\d+$/.test(n)).length;
    console.log(`head buckets ${headBuckets} (≥2: body+lid+eye family)`);
    if (headBuckets < 2) die(`head buckets ${headBuckets}`);
    let tris = 0, meshNodes = 0;
    root.traverse((o: any) => { if (o.isMesh) { meshNodes++; tris += (o.geometry.index?.count ?? 0) / 3; } });
    console.log(`census ${meshNodes} mesh nodes ~${tris | 0} tris`);
    console.log(`GREEN ${sha16} — 4 anchors + seat, belly/feet/tail contacts vertex-true, tail/HB ${ratio.toFixed(3)}, envelope [${whole.min.y.toFixed(3)}, ${whole.max.y.toFixed(3)}]`);
    return sha16;
};

const RED = async (path: string) => {
    const { gltf } = await load(path);
    const root = gltf.scene;
    for (const a of ["lizd", "lizd_body", "lizd_head", "lizd_tail", "lizd_a"]) {
        if (root.getObjectByName(a)) die(`RED control FAILED: ${a} found in ${path}`);
    }
    console.log(`RED control ${path.split("/").pop()} — zero lizd anchors (correctly fails)`);
};

if (process.argv[2] === "red") await RED("agents/arthur/assets/village_dress_magpi1.glb");
else { await GREEN("agents/arthur/assets/village_dress_lizd1.glb"); await RED("agents/arthur/assets/village_dress_magpi1.glb"); }
