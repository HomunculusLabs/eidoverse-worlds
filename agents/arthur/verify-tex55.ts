// verify-tex55.ts — PERSISTENT lane verifier for tex-55 (does NOT
// self-delete: the T-dir one-shots remove themselves per the loop's
// hygiene law, which leaves no visible evidence artifact for
// post-deletion sampling — this file is the durable, runnable record).
// Verifies every tex-55 changed path live:
//   1. mkv3-bakery-cistern97.ts — rebuild determinism ×2 + live pin
//      identity + 3-family byte decode + chains.
//   2. place-tex55-timber25.ts — rollout effect live (cistern on
//      3-family build at preserved pose, anchors current, woodyard
//      untouched).
//   3. verify-tex55-live.ts — census assertions re-run (the one-shot
//      itself self-deleted by design after its single passing pass).
//   4. verify-repairs.ts — full gate: tex-55 pin, refreshed tex-10 pin,
//      ledger law, HEAD gate.
// Run: bun agents/arthur/verify-tex55.ts
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const W = "/Users/t3rpz/projects/eidoverse-worlds";
const A = `${W}/agents/arthur/assets`;
const T = "/private/var/folders/vk/ynsnb3x92sv16bj7wz5xtnm80000gn/T";
const fails: string[] = [];
const ok = (n: string, c: boolean, d = "") => {
    console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`);
    if (!c) fails.push(n);
};
const run = (c: string) => { try { return { code: 0, out: execSync(c, { cwd: W, encoding: "utf8", timeout: 90000 }) }; } catch (e: any) { return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") }; } };
const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");

// 1) mkv3-bakery-cistern97.ts: rebuild deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-bakery-cistern97.ts", { cwd: W, stdio: "pipe" });
const p1 = sha(`${A}/village_bcistern3.glb`);
execSync("bun agents/arthur/assets/mkv3-bakery-cistern97.ts", { cwd: W, stdio: "pipe" });
ok("mkv3-bakery-cistern97.ts: rebuild deterministic + == live build (e132952021178a89)",
    p1 === sha(`${A}/village_bcistern3.glb`) && p1.startsWith("e132952021178a89"), p1.slice(0, 16));

// 2) decode: 3-family byte-family + chains
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
const buf = readFileSync(`${A}/village_bcistern3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const sIdx = j.materials.findIndex((m: any) => m.name === "stone");
const tIdx = j.materials.findIndex((m: any) => m.name === "timber");
const iIdx = j.materials.findIndex((m: any) => m.name === "iron");
ok("decode: stone + timber + iron materials, 3 deduped images", sIdx >= 0 && tIdx >= 0 && iIdx >= 0 && j.images.length === 3);
const tile = (mi: number): Buffer => {
    const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
    return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
};
ok("stone ≡ kiln's + timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)",
    Buffer.compare(tile(sIdx), tileOf("village_kiln3.glb", "stone")!) === 0
    && Buffer.compare(tile(tIdx), tileOf("village_house3.glb", "timber")!) === 0
    && Buffer.compare(tile(iIdx), tileOf("village_forge3.glb", "iron")!) === 0);
let chainOk = true, texBuckets = 0;
for (const mesh of j.meshes) for (const prim of mesh.primitives) {
    if (prim.material === sIdx || prim.material === tIdx || prim.material === iIdx) {
        texBuckets++;
        const t = prim.attributes.TEXCOORD_0;
        if (t === undefined || j.accessors[t].count !== j.accessors[prim.attributes.POSITION].count) chainOk = false;
    }
}
ok("texMat buckets carry TEXCOORD_0 == POSITION (water flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex55-timber25.ts: rollout effect live
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const bc = ents["av-bcistern"];
ok("place-tex55-timber25.ts effect: cistern live, pose (18.2,-16.5)",
    bc?.lib === "store/e132952021178a89.glb" && Math.abs(bc.pos[0] - 18.2) < 0.01 && Math.abs(bc.pos[2] + 16.5) < 0.01, bc?.lib ?? "missing");
ok("census (verify-tex55-live.ts assertions): hutch + house current, woodyard untouched",
    ents["av-hutch"]?.lib === "store/f5f47791dadb5abe.glb"
    && ents["arthur-house"]?.lib === "store/db08a24143ee5443.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-55 pin + refreshed tex-10 pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-55 pin green", /^\s*PASS \[tex-55\]/m.test(vr.out));
ok("tex-10 pin refreshed (no FAIL)", !/FAIL \[tex-10\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)?(\/plaza)?(\/lift)?(\/align)? commit/m.test(vr.out));

// 5) hygiene: all T-dir one-shots consumed (self-deleting law)
ok("all tex-55 T-dir one-shots consumed (self-deleting law)",
    ["hermes-verify-tex55.ts", "hermes-verify-tex55-final.ts", "hermes-verify-tex55-r2.ts", "hermes-verify-tex55-r3.ts", "hermes-verify-tex55-r4.ts", "hermes-verify-tex55-r5.ts"].every((f) => !existsSync(`${T}/${f}`))
    && !existsSync(`${A}/verify-tex55-live.ts`));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
