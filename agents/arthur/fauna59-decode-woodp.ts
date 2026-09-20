// fauna59-decode-woodp.ts — decode audit for the fauna-59 great spotted
// woodpecker. GREEN contract (village_dress_woodp1.glb, v8 trunk-parallel
// frame): 4 motion anchors (woodp, woodp_body, woodp_head, woodp_tail);
// buckets root 1 (LEG) / body 4 (BLACK/SCAP/WHITE/RED) / tail 2 (BLACK/
// WHITE) / head 3 (BLACK/BUFF/EYE) = the 7-material pied set. Boxes via
// THREE.Box3.setFromObject; CONTACTS via per-vertex radial about the
// leaning axis x=0.1048·y against bark r(y)=rAt(y)+0.020 (the
// corner-radial gate measured synthetic bbox corners — deleted).
// Whole envelope (seated at snag-local (0.4239,1.726,-0.2382) ry 0.7752):
// W/D [0.13,0.17] H [0.29,0.36] min.y [1.46,1.56] (tail tip ABOVE the
// collar-C rim y≤1.5) max.y [1.79,0.87]. CONTACT LAWS: body min vertex
// radial within 20mm inside the bark (belly graze), tail min vertex
// radial within 25mm inside (prop graze), head min vertex radial ≥0.40
// (head off the trunk), body max vertex radial ≥0.45 (the back dome
// arcs OUT — the reader-facing pied mantle). RED control: magpi bytes
// must FAIL — zero woodp anchors.
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

const GREEN = async (path: string) => {
    const { sha16, gltf } = await load(path);
    const root = gltf.scene;
    const names: string[] = [];
    root.traverse((o) => names.push(o.name));
    console.log(`woodp decode ${path.split("/").pop()} sha16 ${sha16}`);
    // PIED law via mergekit bucket naming (glbwrite carries materials in
    // its own table; mergeByMaterial names per-material meshes
    // `<group>_<i>`): root buckets take a DIGIT suffix only.
    const buckets = (p: string) => names.filter((n) => new RegExp(`^${p}_\\d+$`).test(n)).length;
    const bRoot = buckets("woodp"), bBody = buckets("woodp_body"), bTail = buckets("woodp_tail"), bHead = buckets("woodp_head");
    console.log(`buckets root ${bRoot} body ${bBody} tail ${bTail} head ${bHead} (= 7-material pied set)`);
    if (bRoot !== 1 || bBody !== 4 || bTail !== 2 || bHead !== 3) die(`bucket counts ${bRoot}/${bBody}/${bTail}/${bHead} != 1/4/2/3 (pied set)`);
    const whole = box(root, "woodp_a");
    if (!whole) die("no woodp_a top-level");
    const [wW, wH, wD] = span(whole);
    console.log(`whole  W ${wW.toFixed(4)} H ${wH.toFixed(4)} D ${wD.toFixed(4)} lo [${whole.min.toArray().map((v) => v.toFixed(3))}] hi [${whole.max.toArray().map((v) => v.toFixed(3))}]`);
    if (!(wW > 0.13 && wW < 0.17)) die(`whole W ${wW}`);
    if (!(wD > 0.13 && wD < 0.17)) die(`whole D ${wD}`);
    if (!(wH > 0.29 && wH < 0.36)) die(`whole H ${wH}`);
    if (!(whole.min.y > 1.46 && whole.min.y < 1.56)) die(`whole min.y ${whole.min.y} (tail tip above the collar-C rim)`);
    if (!(whole.max.y > 1.79 && whole.max.y < 1.87)) die(`whole max.y ${whole.max.y}`);
    const wp = box(root, "woodp");
    if (!wp) die("no woodp anchor");
    const [dW, dH, dD] = span(wp);
    console.log(`woodp  W ${dW.toFixed(4)} H ${dH.toFixed(4)} D ${dD.toFixed(4)}`);
    if (!(dD > 0.13 && dD < 0.17)) die(`bird D ${dD}`);
    if (!(dW > 0.13 && dW < 0.17)) die(`bird W ${dW}`);
    if (!(dH > 0.29 && dH < 0.36)) die(`bird H ${dH}`);
    for (const a of ["woodp_body", "woodp_head", "woodp_tail"]) {
        if (!box(root, a)) die(`anchor ${a} absent (KEEP law)`);
    }
    // ---- CONTACT LAWS (per-vertex radial about the leaning axis) ----
    const barkAt = (y: number) => 0.40 - (0.40 - 0.16) * y / 5.2 + 0.020;
    const vrad = (name: string) => {
        const p = root.getObjectByName(name)!;
        let min = Infinity, max = -Infinity, minY = 0, maxY = 0;
        const v = new THREE.Vector3();
        p.traverse((o: any) => {
            if (!o.isMesh) return;
            const pos = o.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
                const r = Math.hypot(v.x - 0.1048 * v.y, v.z);
                if (r < min) { min = r; minY = v.y; }
                if (r > max) { max = r; maxY = v.y; }
            }
        });
        return { min, max, minY, maxY };
    };
    const tail = vrad("woodp_tail");
    const tailH = span(box(root, "woodp_tail")!)[1];
    console.log(`tail   vrad min ${tail.min.toFixed(4)} (bark ${barkAt(tail.minY).toFixed(4)}) at y ${tail.minY.toFixed(3)} | box H ${tailH.toFixed(4)}`);
    if (!(tailH >= 0.135)) die(`tail prop length ${tailH}`);
    if (!(tail.min > barkAt(tail.minY) - 0.025 && tail.min < barkAt(tail.minY) + 0.006)) die(`TAIL CONTACT vrad ${tail.min} vs bark ${barkAt(tail.minY)} — float or deep bury`);
    const bodv = vrad("woodp_body");
    console.log(`body   vrad min ${bodv.min.toFixed(4)} (bark ${barkAt(bodv.minY).toFixed(4)}) at y ${bodv.minY.toFixed(3)} | max ${bodv.max.toFixed(4)} at y ${bodv.maxY.toFixed(3)}`);
    if (!(bodv.min > barkAt(bodv.minY) - 0.020 && bodv.min < barkAt(bodv.minY) + 0.006)) die(`BELLY GRAZE vrad ${bodv.min} vs bark ${barkAt(bodv.minY)}`);
    if (!(bodv.max >= 0.45)) die(`BACK DOME OUT vrad ${bodv.max} — the pied mantle must arc off the trunk`);
    const headv = vrad("woodp_head");
    console.log(`head   vrad min ${headv.min.toFixed(4)} at y ${headv.minY.toFixed(3)} (off the trunk)`);
    if (!(headv.min >= 0.40)) die(`HEAD OFF TRUNK vrad ${headv.min}`);
    let tris = 0, meshNodes = 0;
    root.traverse((o: any) => { if (o.isMesh) { meshNodes++; tris += (o.geometry.index?.count ?? 0) / 3; } });
    console.log(`census ${meshNodes} mesh nodes ~${tris | 0} tris`);
    console.log(`GREEN ${sha16} — 4 anchors, vertex-true contacts (tail ${tail.min.toFixed(4)}/bark ${barkAt(tail.minY).toFixed(4)}, belly ${bodv.min.toFixed(4)}/bark ${barkAt(bodv.minY).toFixed(4)}), back dome ${bodv.max.toFixed(4)}, head ${headv.min.toFixed(4)}, pied 7 buckets`);
    return sha16;
};

const RED = async (path: string) => {
    const { gltf } = await load(path);
    const root = gltf.scene;
    for (const a of ["woodp", "woodp_body", "woodp_head", "woodp_tail", "woodp_a"]) {
        if (root.getObjectByName(a)) die(`RED control FAILED: ${a} found in ${path}`);
    }
    console.log(`RED control ${path.split("/").pop()} — zero woodp anchors (correctly fails)`);
};

const sha16 = await GREEN("agents/arthur/assets/village_dress_woodp1.glb");
if (sha16 !== "5b7e177e282446f9") die(`unexpected sha16 ${sha16} — decode gates are version-pinned; re-derive bands with the next build`);
RED("agents/arthur/assets/village_dress_magpi1.glb");
console.log("DECODE AUDIT PASS");
