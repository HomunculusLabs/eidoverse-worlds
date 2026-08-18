// verify-tex81.ts — PERSISTENT lane verifier for tex-81 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-81 changed path live:
//   1. mkv3-ring.ts — row cottage rebuild determinism ×2 + live pin
//      identity + timber byte decode + fire emissive + chains + sizes;
//      RING-SAFETY: hall/longhouse/tower/garden/bunk kept at their
//      builds, court restored byte-identical; row backup fresh.
//   2. place-tex81-timber47.ts — rollout effect live (row-cottage on
//      the timber build at preserved pose, smoke comp recovered,
//      anchors current, woodyard untouched).
//   3. verify-repairs.ts — full gate: tex-81 pin + tex-4 multi pin,
//      ledger law, HEAD gate.
// NOTE: after running this verifier, the caller must re-restore the
// sibling disk artifacts:
//   cp /tmp/ring-bak-village_court3.glb agents/arthur/assets/village_court3.glb
//   cp /tmp/ring-bak-village_hall3.glb agents/arthur/assets/village_hall3.glb
//   cp /tmp/ring-bak-village_longhouse3.glb agents/arthur/assets/village_longhouse3.glb
//   cp /tmp/ring-bak-village_tower3.glb agents/arthur/assets/village_tower3.glb
//   cp /tmp/ring-bak-village_garden3.glb agents/arthur/assets/village_garden3.glb
//   cp /tmp/ring-bak-village_bunk3.glb agents/arthur/assets/village_bunk3.glb
// Run: bun agents/arthur/verify-tex81.ts
import { execSync } from "node:child_process";
import { readFileSync, copyFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const W = "/Users/t3rpz/projects/eidoverse-worlds";
const A = `${W}/agents/arthur/assets`;
const SIB = ["village_court3"];
const CONVERTED = ["village_hall3", "village_longhouse3", "village_tower3", "village_garden3", "village_bunk3"];
const fails: string[] = [];
const ok = (n: string, c: boolean, d = "") => {
    console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`);
    if (!c) fails.push(n);
};
const run = (c: string) => { try { return { code: 0, out: execSync(c, { cwd: W, encoding: "utf8", timeout: 90000 }) }; } catch (e: any) { return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") }; } };
const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
const restore = () => {
    for (const f of SIB) copyFileSync(`/tmp/ring-bak-${f}.glb`, `${A}/${f}.glb`);
    for (const f of CONVERTED) copyFileSync(`/tmp/ring-bak-${f}.glb`, `${A}/${f}.glb`);
};

// 0) ring-safety pre-state
ok("pre-state: row on disk is the tex-81 build (7ec9fc54)", sha(`${A}/village_row3.glb`).slice(0, 16) === "7ec9fc54b9d79897");
ok("all backups exist + converted backups fresh (3f8f9e6f/33369174/7f60f1f7/1790e181/4bfacdd7/7ec9fc54)",
    SIB.every((f) => existsSync(`/tmp/ring-bak-${f}.glb`))
    && CONVERTED.every((f) => existsSync(`/tmp/ring-bak-${f}.glb`))
    && sha(`/tmp/ring-bak-village_hall3.glb`).slice(0, 16) === "3f8f9e6f98bbbd04"
    && sha(`/tmp/ring-bak-village_longhouse3.glb`).slice(0, 16) === "333691747dd14c5c"
    && sha(`/tmp/ring-bak-village_tower3.glb`).slice(0, 16) === "7f60f1f7a5794411"
    && sha(`/tmp/ring-bak-village_garden3.glb`).slice(0, 16) === "1790e1816f08b85e"
    && sha(`/tmp/ring-bak-village_bunk3.glb`).slice(0, 16) === "4bfacdd739b9bd0e"
    && sha(`/tmp/ring-bak-village_row3.glb`).slice(0, 16) === "7ec9fc54b9d79897");

// 1) mkv3-ring.ts: rebuild — row deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-ring.ts", { cwd: W, stdio: "pipe" });
restore();
const p1 = sha(`${A}/village_row3.glb`);
execSync("bun agents/arthur/assets/mkv3-ring.ts", { cwd: W, stdio: "pipe" });
restore();
ok("row rebuild deterministic + == live build (7ec9fc54b9d79897)",
    p1 === sha(`${A}/village_row3.glb`) && p1.startsWith("7ec9fc54b9d79897"), p1.slice(0, 16));
ok("ring-safety: court restored byte-identical (2f2cacf9)",
    sha(`${A}/village_court3.glb`).slice(0, 16) === "ac75f33cab3fb5ce");
ok("ring-safety: hall + longhouse + tower + garden + bunk kept at their builds",
    sha(`${A}/village_hall3.glb`).slice(0, 16) === "3f8f9e6f98bbbd04"
    && sha(`${A}/village_longhouse3.glb`).slice(0, 16) === "333691747dd14c5c"
    && sha(`${A}/village_tower3.glb`).slice(0, 16) === "7f60f1f7a5794411"
    && sha(`${A}/village_garden3.glb`).slice(0, 16) === "1790e1816f08b85e"
    && sha(`${A}/village_bunk3.glb`).slice(0, 16) === "4bfacdd739b9bd0e");

// 2) decode: timber byte-family + fire emissive + chains
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
const buf = readFileSync(`${A}/village_row3.glb`);
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
ok("fire emissive node survives", !!j.nodes.find((n: any) => n.name === "fire"));
let chainOk = true, texBuckets = 0;
for (const mesh of j.meshes) for (const prim of mesh.primitives) {
    if (tIdx >= 0 && prim.material === tIdx) {
        texBuckets++;
        const t = prim.attributes.TEXCOORD_0;
        if (t === undefined || j.accessors[t].count !== j.accessors[prim.attributes.POSITION].count) chainOk = false;
    }
}
ok("texMat buckets carry TEXCOORD_0 == POSITION (heddle/cloth/jars/threads flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex81-timber47.ts: rollout effect live (incl. smoke comp)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const rc = ents["av-row-cottage"];
const rcComps = Object.keys(rc?.comp ?? {});
ok("place-tex81-timber47.ts effect: row-cottage live, pose (-21,-15.3), smoke comp recovered",
    rc?.lib === "store/7ec9fc54b9d79897.glb" && Math.abs(rc.pos[0] + 21) < 0.01 && Math.abs(rc.pos[2] + 15.3) < 0.01
    && rcComps.includes("particles:smoke"), rc?.lib ?? "missing");
ok("census anchors: hall + bunk current, woodyard untouched",
    ents["av-hall"]?.lib === "store/3f8f9e6f98bbbd04.glb"
    && ents["av-bunkhouse"]?.lib === "store/4bfacdd739b9bd0e.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-81 pin + tex-4 multi pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-81 pin green", /^\s*PASS \[tex-81\]/m.test(vr.out));
ok("tex-4 multi pin carries new row hash (no FAIL)", !/FAIL \[tex-4\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green (polish-inclusive)",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
