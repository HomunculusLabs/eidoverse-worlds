// verify-tex61.ts — PERSISTENT lane verifier for tex-61 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-61 changed path live:
//   1. mkv3-mapboard.ts — rebuild determinism ×2 + live pin identity +
//      timber byte decode + chains.
//   2. place-tex61-timber29.ts — rollout effect live (mapboard on the
//      timber-post build at preserved pose, anchors current, woodyard
//      untouched).
//   3. verify-repairs.ts — full gate: tex-61 pin, refreshed tex-17
//      pin, ledger law, HEAD gate.
// Run: bun agents/arthur/verify-tex61.ts
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

// 1) mkv3-mapboard.ts: rebuild deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-mapboard.ts", { cwd: W, stdio: "pipe" });
const p1 = sha(`${A}/village_mapboard3.glb`);
execSync("bun agents/arthur/assets/mkv3-mapboard.ts", { cwd: W, stdio: "pipe" });
ok("mapboard rebuild deterministic + == live build (d555acbd0b0ab516)", p1 === sha(`${A}/village_mapboard3.glb`) && p1.startsWith("d555acbd0b0ab516"), p1.slice(0, 16));

// 2) decode: timber byte-family + chains
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
const buf = readFileSync(`${A}/village_mapboard3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const tIdx = j.materials.findIndex((m: any) => m.name === "timber");
ok("decode: timber material", tIdx >= 0, j.materials.map((m: any) => m.name).join(","));
ok("1 deduped image", j.images.length === 1, "images " + j.images.length);
const tile = (mi: number): Buffer => {
    const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
    return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
};
ok("timber ≡ house wallSpan's (byte-family law)", Buffer.compare(tile(tIdx), tileOf("village_house3.glb", "timber")!) === 0);
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
ok("timber buckets carry TEXCOORD_0 == POSITION (frame/chips/pin flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex61-timber29.ts: rollout effect live
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const mb = ents["av-mapboard"];
ok("place-tex61-timber29.ts effect: mapboard live, pose (1.7,8.5)",
    mb?.lib === "store/d555acbd0b0ab516.glb" && Math.abs(mb.pos[0] - 1.7) < 0.01 && Math.abs(mb.pos[2] - 8.5) < 0.01, mb?.lib ?? "missing");
ok("census anchors: laundry + monument current, woodyard untouched",
    ents["av-dyelaundry"]?.lib === "store/c5f85611ffefc522.glb"
    && ents["av-monument"]?.lib === "store/9520e61fc8e9d887.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-61 pin + refreshed tex-17 pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-17 pin)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-61 pin green", /^\s*PASS \[tex-61\]/m.test(vr.out));
ok("tex-17 pin refreshed (no FAIL)", !/FAIL \[tex-17\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
