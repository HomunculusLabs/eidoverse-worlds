// verify-tex60.ts — PERSISTENT lane verifier for tex-60 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-60 changed path live:
//   1. mkv3-dyelaundry94.ts — rebuild determinism ×2 + live pin
//      identity + timber byte decode + cloth anchors + chains.
//   2. place-tex60-timber28.ts — rollout effect live (laundry on the
//      timber-woodwork build at preserved pose, all six wind comps
//      recovered, anchors current, woodyard untouched).
//   3. verify-repairs.ts — full gate: tex-60 pin, refreshed tex-5 pin,
//      ledger law, HEAD gate.
// Run: bun agents/arthur/verify-tex60.ts
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const W = "/Users/t3rpz/projects/eidoverse-worlds";
const A = `${W}/agents/arthur/assets`;
const fails: string[] = [];
const ok = (n: string, c: boolean, d = "") => {
    console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`);
    if (!c) fails.push(n);
};
const run = (c: string) => { try { return { code: 0, out: execSync(c, { cwd: W, encoding: "utf8", timeout: 90000 }) }; } catch (e: any) { return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") }; } };
const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");

// 1) mkv3-dyelaundry94.ts: rebuild deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-dyelaundry94.ts", { cwd: W, stdio: "pipe" });
const p1 = sha(`${A}/village_dyelaundry3.glb`);
execSync("bun agents/arthur/assets/mkv3-dyelaundry94.ts", { cwd: W, stdio: "pipe" });
ok("laundry rebuild deterministic + == live build (c5f85611ffefc522)", p1 === sha(`${A}/village_dyelaundry3.glb`) && p1.startsWith("c5f85611ffefc522"), p1.slice(0, 16));

// 2) decode: timber byte-family + cloth anchors + chains
const tileOf = (glbName: string, matName: string): Buffer | null => {
    const b = readFileSync(`${A}/${glbName}`);
    const l = b.readUInt32LE(12);
    const js = JSON.parse(b.subarray(20, 20 + l).toString("utf8"));
    const mi = js.materials.findIndex((m: any) => m.name === matName);
    if (mi < 0) return null;
    const tex = js.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = js.bufferViews[js.images[js.textures[tex].source].bufferView];
    return Buffer.from(b.subarray(28 + l + bv.byteOffset, 28 + l + bv.byteOffset + bv.byteLength));
};
const buf = readFileSync(`${A}/village_dyelaundry3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const tIdx = j.materials.findIndex((m: any) => m.name === "timber");
ok("decode: timber material (+ 4 standing weaves from tex-5)", tIdx >= 0, j.materials.map((m: any) => m.name).join(","));
ok("5 deduped images (timber + 4 weaves)", j.images.length === 5, "images " + j.images.length);
const tile = (mi: number): Buffer => {
    const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
    return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
};
ok("timber ≡ house wallSpan's (byte-family law)", Buffer.compare(tile(tIdx), tileOf("village_house3.glb", "timber")!) === 0);
const isGrp = (n: any) => n.children !== undefined && n.mesh === undefined;
const cloths = [0, 1, 2, 3, 4, 5].map((i) => j.nodes.find((n: any) => n.name === `dl_cloth_${i}`));
ok("all six dl_cloth GROUP anchors survive (wind comp targets)", cloths.every((n) => !!n && isGrp(n)));
const named = j.nodes.filter((n: any) => n.name !== undefined).map((n: any) => n.name);
ok("no duplicate NAMED node names", new Set(named).size === named.length, "clean");
let chainOk = true, texBuckets = 0;
for (const mesh of j.meshes) for (const prim of mesh.primitives) {
    if (prim.material === tIdx) {
        texBuckets++;
        const t = prim.attributes.TEXCOORD_0;
        if (t === undefined || j.accessors[t].count !== j.accessors[prim.attributes.POSITION].count) chainOk = false;
    }
}
ok("timber buckets carry TEXCOORD_0 == POSITION (rope line flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex60-timber28.ts: rollout effect live (incl. wind comps)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const dl = ents["av-dyelaundry"];
const dlComps = Object.keys(dl?.comp ?? {});
ok("place-tex60-timber28.ts effect: laundry live, pose (-26.7,-13), all six wind comps recovered",
    dl?.lib === "store/c5f85611ffefc522.glb" && Math.abs(dl.pos[0] + 26.7) < 0.01 && Math.abs(dl.pos[2] + 13) < 0.01
    && [0, 1, 2, 3, 4, 5].every((i) => dlComps.includes(`motion:dl_cloth_${i}`)), dl?.lib ?? "missing");
ok("census anchors: monument + shrine current, woodyard untouched",
    ents["av-monument"]?.lib === "store/9520e61fc8e9d887.glb"
    && ents["av-shrine"]?.lib === "store/d0d3743a60802625.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-60 pin + refreshed tex-5 pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-5 pin)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-60 pin green", /^\s*PASS \[tex-60\]/m.test(vr.out));
ok("tex-5 pin refreshed (no FAIL)", !/FAIL \[tex-5\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)?(\/plaza)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
