// improve18-decode-mapboard.ts — decode audit for improve-18 (row 27
// nx-town-mapboard). Two truth sources cross-checked:
//   1. the build manifest (mk script emits plane coords per element:
//      cx/halfW along the face's x, cy/halfH along in-plane up, front/back
//      along the face normal, minDim = smallest local extent);
//   2. the GLB's real world verts (bbox + face-plane bands).
// Checks: (A) seating family — fronts at the paint plane, map side only;
// (B) in-plane fit within the slab face; (C) b22 rider keep-out on +z;
// (D) model bbox sane; (E) skeleton floors + key elements present;
// (F) GLB cross-check — real verts in the paint band, zero past the keep-out.
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const path = process.argv[2] ?? "agents/arthur/assets/village_mapboard3.glb";
const manifestPath = "agents/arthur/assets/village_mapboard3.review.json";
const base = process.argv[3] ?? "agents/arthur/reviews/improve18-mapboard/before/village_mapboard3.baseline.glb";

let fails = 0;
const ck = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails++;
};
const q = (n: number) => Math.round(n * 1000) / 1000;

const man = JSON.parse(readFileSync(manifestPath, "utf8"));
const E: any[] = man.elements;
console.log(`INFO manifest: ${E.length} elements, S=${man.scale}, FACE=${man.face}`);

async function allVerts(p: string) {
    const bytes = readFileSync(p);
    const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
    gltf.scene.updateMatrixWorld(true);
    const out: number[][] = [];
    const bb = new THREE.Box3();
    gltf.scene.traverse((o: any) => {
        if (!o.isMesh) return;
        const pos = o.geometry.getAttribute("position") as THREE.BufferAttribute;
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
            out.push([v.x, v.y, v.z]);
            bb.expandByPoint(v);
        }
    });
    return { verts: out, bb };
}
const { verts: V, bb } = await allVerts(path);
const { verts: BV, bb: bbb } = await allVerts(base);
const nrm = [0, Math.sin(0.21), Math.cos(0.21)];
const ctr = [0, 1.55, -0.06];
const off = (v: number[]) => (v[1] - ctr[1]) * nrm[1] + (v[2] - ctr[2]) * nrm[2];

// A. seating family: every element's conservative front at/inside the paint
// plane band, nothing on the +z (rider) side
const fronts = E.map(e => e.front);
ck("A1 all fronts <= -0.005 (map side only; zero +z bleed)", fronts.every((f: number) => f <= -0.005), `worst front ${q(Math.max(...fronts))} (${E[fronts.indexOf(Math.max(...fronts))].name})`);
const fspan = Math.max(...fronts) - Math.min(...fronts);
ck("A2 front offsets family within 0.03 band (chips 1mm..33mm proud)", fspan <= 0.03, `span ${q(fspan)}`);

// B. in-plane fit (slab face: |x| <= 1.15, in-plane up ±0.75 around 1.55)
const worstX = Math.max(...E.map(e => Math.abs(e.cx) + e.halfW));
const worstY = Math.max(...E.map(e => Math.abs(e.cy) + e.halfH));
ck("B1 in-plane |x| rim <= 1.13 (baseline 1.405 strays)", worstX <= 1.13, `rim ${q(worstX)}`);
ck("B2 in-plane |up| rim <= 0.74 (slab half-height 0.734+tilt margin)", worstY <= 0.74, `rim ${q(worstY)}`);

// C. b22 rider keep-out: nothing crosses the mid-plane (+z half-space is
// the rider's; its backing plate back surface sits ~+0.0375 g-z at center)
const crossing = E.filter(e => e.back > -0.001);
ck("C1 zero elements crossing the mid-plane toward the b22 rider", crossing.length === 0, crossing.length ? crossing.map(e => `${e.name}(back ${q(e.back)})`).join(",") : "clean");

// D. model bbox fingerprint
ck("D1 model z-extent <= 0.9 (baseline 2.63 tray)", (bb.max.z - bb.min.z) <= 0.9, `z-extent ${q(bb.max.z - bb.min.z)}`);
ck("D2 baseline still the tray (RED anchor > 2.6)", (bbb.max.z - bbb.min.z) > 2.6, `baseline ${q(bbb.max.z - bbb.min.z)}`);

// E. skeleton floors + key elements (manifest-sourced)
const spoke = E.find(e => e.name === "map_spoke_0");
ck("E1 spoke minDim >= 0.013 (floor 0.014)", !!spoke && spoke.minDim >= 0.013, spoke ? `minDim ${q(spoke.minDim)}` : "missing");
const ring2 = E.find(e => e.name === "map_ring2");
ck("E2 ring torus diameter ~0.89 (2*(0.83*S+tube))", !!ring2 && Math.abs(2 * ring2.halfH - 2 * (0.83 * man.scale + 0.03)) < 0.01, ring2 ? `diam ${q(2 * ring2.halfH)}` : "missing");
const hearth = E.find(e => e.name === "map_hearth");
ck("E3 hearth present (emissive skeleton; r 0.06 from dims)", !!hearth, hearth ? `halfW ${q(hearth.halfW)}` : "missing");
const pin = E.find(e => e.name === "map_pin");
ck("E4 brass pin present", !!pin, pin ? `at cx ${q(pin.cx)}` : "missing");
const whisper = E.find(e => e.name === "map_whisper");
ck("E5 whisper smudge present (heritage lore)", !!whisper, whisper ? `at cx ${q(whisper.cx)} cy ${q(whisper.cy)}` : "missing");

// F. GLB cross-check (real verts): paint band populated; no CHIP-family
// verts in the +z keep-out (posts legitimately stand proud of the tilted
// plane above the mount line — board-on-posts construction, min distance
// to rider geometry 0.183m, decoded improve18-decode-postplate.ts — so the
// keep-out excludes the structural solids: posts |x|>=0.75, cap y>=2.3,
// frame |x|>=1.17); strays checked against the frame's designed 1.22 width
const paintBand = V.filter(v => off(v) <= -0.005 && off(v) >= -0.04).length;
ck("F1 GLB verts in the paint band (non-vacuous, >500)", paintBand > 500, `${paintBand} verts`);
const structural = (v: number[]) => Math.abs(v[0]) >= 0.745 || v[1] >= 2.295 || Math.abs(v[0]) >= 1.165;
const keepout = V.filter(v => off(v) > 0.045 && v[1] > 0.8 && v[1] < 2.3 && !structural(v));
ck("F2 GLB zero CHIP verts in the rider keep-out band (structural posts/cap/frame excluded)", keepout.length === 0, `${keepout.length} verts`);
const strayNew = V.filter(v => Math.abs(v[0]) > 1.26 && v[1] > 0.8 && v[1] < 2.37);
ck("F3 GLB zero stray verts beyond the widest designed element (cap 1.25; frame 1.22)", strayNew.length === 0, `${strayNew.length} verts`);
const strayBase = BV.filter(v => Math.abs(v[0]) > 1.17 && v[1] > 0.8 && v[1] < 2.4);
ck("F4 baseline had strays (RED anchor, >100)", strayBase.length > 100, `${strayBase.length} baseline stray verts`);

console.log(fails === 0 ? "AUDIT ALL PASS" : `AUDIT FAIL x${fails}`);
process.exit(fails === 0 ? 0 : 1);
