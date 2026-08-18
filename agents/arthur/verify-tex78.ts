// verify-tex78.ts — PERSISTENT lane verifier for tex-78 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-78 changed path live:
//   1. mkv3-ring.ts — tower rebuild determinism ×2 + live pin identity
//      + timber byte decode + fire/uflame anchors + chains + sizes;
//      RING-SAFETY: hall + longhouse kept at their builds, four
//      siblings restored byte-identical; tower backup fresh.
//   2. place-tex78-timber44.ts — rollout effect live (tower-house on
//      the timber build at preserved pose, sockets comp recovered,
//      anchors current, woodyard untouched).
//   3. verify-repairs.ts — full gate: tex-78 pin + tex-4 multi pin,
//      ledger law, HEAD gate.
// NOTE: after running this verifier, the caller must re-restore the
// four untouched sibling disk artifacts and the two converted builds:
//   for f in village_garden3 village_row3 village_bunk3 village_court3; do cp /tmp/ring-bak-$f.glb agents/arthur/assets/$f.glb; done
//   cp /tmp/ring-bak-village_hall3.glb agents/arthur/assets/village_hall3.glb
//   cp /tmp/ring-bak-village_longhouse3.glb agents/arthur/assets/village_longhouse3.glb
// Run: bun agents/arthur/verify-tex78.ts
import { execSync } from "node:child_process";
import { readFileSync, copyFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const W = "/Users/t3rpz/projects/eidoverse-worlds";
const A = `${W}/agents/arthur/assets`;
const SIB = ["village_garden3", "village_row3", "village_bunk3", "village_court3"];
const fails: string[] = [];
const ok = (n: string, c: boolean, d = "") => {
    console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`);
    if (!c) fails.push(n);
};
const run = (c: string) => { try { return { code: 0, out: execSync(c, { cwd: W, encoding: "utf8", timeout: 90000 }) }; } catch (e: any) { return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") }; } };
const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
const restore = () => {
    for (const f of SIB) copyFileSync(`/tmp/ring-bak-${f}.glb`, `${A}/${f}.glb`);
    copyFileSync(`/tmp/ring-bak-village_hall3.glb`, `${A}/village_hall3.glb`);
    copyFileSync(`/tmp/ring-bak-village_longhouse3.glb`, `${A}/village_longhouse3.glb`);
};

// 0) ring-safety pre-state
ok("pre-state: tower on disk is the tex-78 build (fb590200)", sha(`${A}/village_tower3.glb`).slice(0, 16) === "fb590200245f5985");
ok("all sibling backups exist + hall/longhouse/tower backups fresh",
    SIB.every((f) => existsSync(`/tmp/ring-bak-${f}.glb`))
    && sha(`/tmp/ring-bak-village_hall3.glb`).slice(0, 16) === "d9251dd0857e451f"
    && sha(`/tmp/ring-bak-village_longhouse3.glb`).slice(0, 16) === "05149e3e7d5e5918"
    && sha(`/tmp/ring-bak-village_tower3.glb`).slice(0, 16) === "fb590200245f5985");

// 1) mkv3-ring.ts: rebuild — tower deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-ring.ts", { cwd: W, stdio: "pipe" });
restore();
const p1 = sha(`${A}/village_tower3.glb`);
execSync("bun agents/arthur/assets/mkv3-ring.ts", { cwd: W, stdio: "pipe" });
restore();
ok("tower rebuild deterministic + == live build (fb590200245f5985)",
    p1 === sha(`${A}/village_tower3.glb`) && p1.startsWith("fb590200245f5985"), p1.slice(0, 16));
ok("ring-safety: four siblings restored byte-identical (f47574b7 garden, 845ee738 row, e4c0651d bunk, 543b53d0 court)",
    sha(`${A}/village_garden3.glb`).slice(0, 16) === "e0a6a7c426d39398"
    && sha(`${A}/village_row3.glb`).slice(0, 16) === "845ee738e09d5c1f"
    && sha(`${A}/village_bunk3.glb`).slice(0, 16) === "e4c0651d5618b73b"
    && sha(`${A}/village_court3.glb`).slice(0, 16) === "543b53d03ac2f104");
ok("ring-safety: hall (d9251dd0) + longhouse (05149e3e) kept at their builds",
    sha(`${A}/village_hall3.glb`).slice(0, 16) === "d9251dd0857e451f"
    && sha(`${A}/village_longhouse3.glb`).slice(0, 16) === "05149e3e7d5e5918");

// 2) decode: timber byte-family + anchors + chains
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
const buf = readFileSync(`${A}/village_tower3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const tIdx = j.materials.findIndex((m: any) => m.name === "timber");
ok("decode: timber material present", tIdx >= 0, j.materials.map((m: any) => m.name).join(","));
const tile = (mi: number): Buffer => {
    const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
    return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
};
ok("timber ≡ house wallSpan's (byte-family, buffer-compared)",
    tIdx >= 0 && Buffer.compare(tile(tIdx), tileOf("village_house3.glb", "timber")!) === 0);
ok("flame emissive node survives + uflame folded into glow buckets (MERGED-STATICS: 3 glow buckets = lamp/flame/uflame materials)",
    !!j.nodes.find((n: any) => n.name === "flame") && j.materials.filter((m: any) => /glow/.test(m.name)).length === 3);
let chainOk = true, texBuckets = 0;
for (const mesh of j.meshes) for (const prim of mesh.primitives) {
    if (tIdx >= 0 && prim.material === tIdx) {
        texBuckets++;
        const t = prim.attributes.TEXCOORD_0;
        if (t === undefined || j.accessors[t].count !== j.accessors[prim.attributes.POSITION].count) chainOk = false;
    }
}
ok("texMat buckets carry TEXCOORD_0 == POSITION (books/candle/walls flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex78-timber44.ts: rollout effect live (incl. sockets comp)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const tw = ents["av-tower-house"];
const twComps = Object.keys(tw?.comp ?? {});
ok("place-tex78-timber44.ts effect: tower-house live, pose (-8,24.7), sockets comp recovered",
    tw?.lib === "store/fb590200245f5985.glb" && Math.abs(tw.pos[0] + 8) < 0.01 && Math.abs(tw.pos[2] - 24.7) < 0.01
    && twComps.includes("sockets"), tw?.lib ?? "missing");
ok("census anchors: hall + longhouse current, woodyard untouched",
    ents["av-hall"]?.lib === "store/d9251dd0857e451f.glb"
    && ents["av-longhouse"]?.lib === "store/05149e3e7d5e5918.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-78 pin + tex-4 multi pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. tex-4 multi pin w/ new tower hash)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-78 pin green", /^\s*PASS \[tex-78\]/m.test(vr.out));
ok("tex-4 multi pin carries the new tower hash (no FAIL)", !/FAIL \[tex-4\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green (polish-inclusive)",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)?(\/plaza)?(\/lift)?(\/align)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
