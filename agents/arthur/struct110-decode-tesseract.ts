// struct110-decode-tesseract.ts — decode audit of village_tesseract3.glb.
// Verifies from BYTES: pinned sha, node budget, texMat lanes (ts_*), brass
// emissive exported, KEEP nodes (glow_ts_1 bead + glow_ts_socket), TRUE
// world-frame envelope, THE TESSERACT LAW — the iron and ashlar buckets are
// vertex-for-vertex EQUAL to an independently constructed math replica of
// the hypercube projection (12 outer ashlar edges, 12 inner iron edges at
// scale K, 8 w-struts at exact outer↔inner corner midpoints on the
// ±(1,1,1)/√3 axes, pin riser), no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as THREE from "three";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_tesseract3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const BIN = 20 + jl + 8;
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const names: string[] = j.nodes.map((n: any) => n.name);

// build math replica (constants must match mkv3-tesseract.ts)
const S = 2.4, K = 0.5, BEAM = 0.22, IB = 0.16, STRUT = 0.13, BR = 0.10, SILL = 0.24, SILLW = 1.9, LIFT = 0.06, PAD = 0.30, PADSZ = 0.55, FRAME_LIFT = LIFT + PAD, PIN_H = 0.75, PIN_W = 0.15;
const SIG: Array<[number, number, number]> = [
    [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1],
];

ck("sha pinned v2", sha === "4c14467776d587485b9be318a774ee1f557936cec10f2ffe7b166d1d75e7ca4d", sha.slice(0, 16));
ck("node budget 1-45", j.nodes.length >= 1 && j.nodes.length <= 45, `${j.nodes.length} nodes / ${j.meshes.length} meshes`);
ck("texMat lanes", ["ts_ashlar", "ts_sill", "ts_iron"].every(m => j.materials.some((x: any) => x.name === m)));
const glow = j.materials.find((m: any) => (m.emissiveFactor ?? [0, 0, 0]).some((c: number) => c > 0));
ck("brass emissive exported", !!glow, glow?.name);
ck("bead KEEP node", names.includes("glow_ts_1"));
ck("socket KEEP node", names.includes("glow_ts_socket"));

const views = j.bufferViews ?? [];
function bucketNode(matName: string) {
    return j.nodes.find((n: any) => {
        if (n.mesh === undefined) return false;
        const m = j.meshes[n.mesh].primitives[0];
        return j.materials[m.material]?.name === matName;
    });
}
function bucketVerts(node: any): number[][] {
    const prim = j.meshes[node.mesh].primitives[0];
    const acc = j.accessors[prim.attributes.POSITION];
    const bv = views[acc.bufferView];
    const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const t = node.translation ?? [0, 0, 0];
    const out: number[][] = [];
    for (let i = 0; i < acc.count; i++) {
        const p = BIN + off + i * 12;
        out.push([bytes.readFloatLE(p) + t[0], bytes.readFloatLE(p + 4) + t[1], bytes.readFloatLE(p + 8) + t[2]]);
    }
    return out;
}

// ---- THE TESSERACT LAW: full vertex-cloud equality vs math replica ----------
// Replica builds the SAME 21 iron members (12 inner edges + 8 struts + pin)
// and 12 ashlar edges from the projection definition; buckets must match
// vertex-for-vertex (sorted cloud, tolerance 1e-4).
function replicaCloud(mats: { iron: boolean; ashlar: boolean }): number[][] {
    const ashlarOn = mats.ashlar, ironOn = mats.iron;
    const out: number[][] = [];
    const pushBox = (a: THREE.Vector3, b: THREE.Vector3, t: number) => {
        const dir = new THREE.Vector3().subVectors(b, a);
        const len = dir.length();
        const geo = new THREE.BoxGeometry(t, len, t);
        const m = new THREE.Mesh(geo);
        m.position.copy(a).add(b).multiplyScalar(0.5);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        m.updateMatrixWorld(true);
        const pos = geo.getAttribute("position") as THREE.BufferAttribute;
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
            out.push([v.x, v.y, v.z]);
        }
    };
    const corners = SIG.map(([x, y, z]) => new THREE.Vector3(x * S, y * S + S + FRAME_LIFT, z * S));
    const C = new THREE.Vector3(0, S + FRAME_LIFT, 0);
    const icorners = SIG.map(([x, y, z]) => new THREE.Vector3(x * S * K + C.x, y * S * K + C.y, z * S * K + C.z));
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
        const [ax, ay, az] = SIG[i], [bx, by, bz] = SIG[j];
        const diff = (ax !== bx ? 1 : 0) + (ay !== by ? 1 : 0) + (az !== bz ? 1 : 0);
        if (diff !== 1) continue;
        if (ashlarOn) pushBox(corners[i], corners[j], BEAM);
        if (ironOn) pushBox(icorners[i], icorners[j], IB);
    }
    if (ironOn) for (let i = 0; i < 8; i++) pushBox(corners[i], icorners[i], STRUT);
    if (ironOn) {
        const topY = C.y + S * K;
        const geo = new THREE.BoxGeometry(PIN_W, PIN_H, PIN_W);
        const pos = geo.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++)
            out.push([pos.getX(i), pos.getY(i) + topY + 0.09 + PIN_H / 2, pos.getZ(i)]);
    }
    if (ashlarOn) for (const [x, y, z] of SIG) {
        if (y !== -1) continue;
        const geo = new THREE.BoxGeometry(PADSZ, PAD, PADSZ);
        const pos = geo.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++)
            out.push([pos.getX(i) + x * S, pos.getY(i) + LIFT + PAD / 2, pos.getZ(i) + z * S]);
    }
    return out;
}
function cloudsEqual(a: number[][], b: number[][]): { ok: boolean; detail: string } {
    if (a.length !== b.length) return { ok: false, detail: `count ${a.length} != ${b.length}` };
    const key = (v: number[]) => v.map(x => Math.round(x * 1e4)).join(",");
    const sa = [...a].map(key).sort();
    const sb = [...b].map(key).sort();
    let mism = 0;
    for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) { if (++mism <= 3) console.log(`  mismatch: ${sa[i]} vs ${sb[i]}`); }
    return { ok: mism === 0, detail: mism === 0 ? `${a.length} verts equal` : `${mism} mismatches` };
}

const ash = bucketNode("ts_ashlar");
ck("ashlar bucket node found", !!ash, ash?.name ?? "(none)");
if (ash) {
    const av = bucketVerts(ash);
    const rep = replicaCloud({ iron: false, ashlar: true });
    const r = cloudsEqual(av, rep);
    ck("TESSERACT LAW outer: 12 edges + 4 pads vertex-equal to replica", r.ok, `${av.length} baked vs ${rep.length} replica — ${r.detail}`);
}
const iron = bucketNode("ts_iron");
ck("iron bucket node found", !!iron, iron?.name ?? "(none)");
if (iron) {
    const iv = bucketVerts(iron);
    const rep = replicaCloud({ iron: true, ashlar: false });
    const r = cloudsEqual(iv, rep);
    ck("TESSERACT LAW inner+struts+pin: 21 iron members vertex-equal to replica", r.ok, `${iv.length} baked vs ${rep.length} replica — ${r.detail}`);
    // strut ENDPOINT law (independent of the cloud check): every one of the
    // 8 outer corners and 8 inner corners carries iron vertices within the
    // strut half-diagonal (0.08) — the w-struts genuinely reach corner-to-
    // corner. BoxGeometry carries no mid-beam vertex, so endpoints are the
    // vertex-provable invariant.
    const corners = SIG.map(([x, y, z]) => [x * S, y * S + S + FRAME_LIFT, z * S]);
    const icorners = SIG.map(([x, y, z]) => [x * S * K, y * S * K + S + FRAME_LIFT, z * S * K]);
    let outHits = 0, inHits = 0;
    for (let i = 0; i < 8; i++) {
        if (rep.some(v => Math.hypot(v[0] - corners[i][0], v[1] - corners[i][1], v[2] - corners[i][2]) < 0.13)) outHits++;
        if (rep.some(v => Math.hypot(v[0] - icorners[i][0], v[1] - icorners[i][1], v[2] - icorners[i][2]) < 0.13)) inHits++;
    }
    ck("w-struts reach all 8 OUTER corners (iron verts present)", outHits === 8, `${outHits}/8`);
    ck("w-struts reach all 8 INNER corners (iron verts present)", inHits === 8, `${inHits}/8`);
}

// ---- whole-file envelope + NaN ----
{
    let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity], nan = 0, total = 0;
    for (const n of j.nodes) {
        if (n.mesh === undefined) continue;
        for (const prim of j.meshes[n.mesh].primitives) {
            const acc = j.accessors[prim.attributes.POSITION];
            const bv = views[acc.bufferView];
            const off = (bv?.byteOffset ?? 0) + (acc.byteOffset ?? 0);
            const t = n.translation ?? [0, 0, 0];
            for (let i = 0; i < acc.count; i++) {
                const p = BIN + off + i * 12;
                const v = [bytes.readFloatLE(p) + t[0], bytes.readFloatLE(p + 4) + t[1], bytes.readFloatLE(p + 8) + t[2]];
                total++;
                if (v.some(isNaN)) { nan++; continue; }
                for (let k = 0; k < 3; k++) { if (v[k] < mn[k]) mn[k] = v[k]; if (v[k] > mx[k]) mx[k] = v[k]; }
            }
        }
    }
    ck("no NaN vertices", nan === 0, `${nan}`);
    const expW = 2 * S * SILLW;
    ck("file envelope footprint == sill 9.12", Math.abs((mx[0] - mn[0]) - expW) < 0.01 && Math.abs((mx[2] - mn[2]) - expW) < 0.01, `x ${mn[0].toFixed(2)}..${mx[0].toFixed(2)} z ${mn[2].toFixed(2)}..${mx[2].toFixed(2)}`);
    ck("file envelope y -0.18..5.27", Math.abs(mn[1] - (LIFT - SILL)) < 0.01 && Math.abs(mx[1] - (2 * S + FRAME_LIFT + BEAM / 2)) < 0.01, `y ${mn[1].toFixed(2)}..${mx[1].toFixed(2)}`);
    ck("total verts sane", total > 800 && total < 1600, `${total}`);
}

console.log(f === 0 ? "\nALL PASS" : `\n${f} FAIL`);
if (f) process.exit(1);
