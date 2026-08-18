// verify-tex58.ts — PERSISTENT lane verifier for tex-58 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-58 changed path live:
//   1. mkv3-shrine.ts — rebuild determinism ×2 + live pin identity +
//      stone/soil byte decode + votive anchors + chains.
//   2. place-tex58-stone13.ts — rollout effect live (shrine on
//      full-ashlar altar/bench build at preserved pose, votive flame
//      comps recovered, anchors current, woodyard untouched).
//   3. verify-repairs.ts — full gate: tex-58 pin, refreshed tex-13
//      pin, ledger law, HEAD gate.
// Run: bun agents/arthur/verify-tex58.ts
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

// 1) mkv3-shrine.ts: rebuild deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-shrine.ts", { cwd: W, stdio: "pipe" });
const p1 = sha(`${A}/village_shrine3.glb`);
execSync("bun agents/arthur/assets/mkv3-shrine.ts", { cwd: W, stdio: "pipe" });
ok("shrine rebuild deterministic + == live build (78611c7dc9a3cb6e)", p1 === sha(`${A}/village_shrine3.glb`) && p1.startsWith("78611c7dc9a3cb6e"), p1.slice(0, 16));

// 2) decode: stone + soil byte-family + votive anchors + chains
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
const buf = readFileSync(`${A}/village_shrine3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const sIdx = j.materials.findIndex((m: any) => m.name === "stone");
ok("decode: stone material (soil standing from tex-13)", sIdx >= 0, j.materials.map((m: any) => m.name).join(","));
const tile = (mi: number): Buffer => {
    const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
    return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
};
ok("stone ≡ kiln's ashlar (byte-family law)", Buffer.compare(tile(sIdx), tileOf("village_kiln3.glb", "stone")!) === 0);
const isGrp = (n: any) => n.children !== undefined && n.mesh === undefined;
const v0 = j.nodes.find((n: any) => n.name === "flame_v0");
const v1 = j.nodes.find((n: any) => n.name === "flame_v1");
const v2 = j.nodes.find((n: any) => n.name === "flame_v2");
ok("flame_v0 + flame_v1 + flame_v2 GROUP anchors survive (votive comp targets)", !!v0 && isGrp(v0) && !!v1 && isGrp(v1) && !!v2 && isGrp(v2));
const named = j.nodes.filter((n: any) => n.name !== undefined).map((n: any) => n.name);
ok("no duplicate NAMED node names", new Set(named).size === named.length, "clean");
let chainOk = true, texBuckets = 0;
for (const mesh of j.meshes) for (const prim of mesh.primitives) {
    if (prim.material === sIdx) {
        texBuckets++;
        const t = prim.attributes.TEXCOORD_0;
        if (t === undefined || j.accessors[t].count !== j.accessors[prim.attributes.POSITION].count) chainOk = false;
    }
}
ok("stone buckets carry TEXCOORD_0 == POSITION (bowl/candles/runes flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex58-stone13.ts: rollout effect live (incl. votive comps)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const sh = ents["av-shrine"];
const shComps = Object.keys(sh?.comp ?? {});
ok("place-tex58-stone13.ts effect: shrine live, pose (-23.7,-3.8), votive comps recovered",
    sh?.lib === "store/78611c7dc9a3cb6e.glb" && Math.abs(sh.pos[0] + 23.7) < 0.01 && Math.abs(sh.pos[2] + 3.8) < 0.01
    && ["motion:flame_v0", "motion:flame_v1", "motion:flame_v2"].every((c) => shComps.includes(c)), sh?.lib ?? "missing");
ok("census anchors: market + forge current, woodyard untouched",
    ents["av-market"]?.lib === "store/b7167aad118e47c5.glb"
    && ents["av-forge"]?.lib === "store/7fe0ce6607ed2d1b.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-58 pin + refreshed tex-13 pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-13 pin)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-58 pin green", /^\s*PASS \[tex-58\]/m.test(vr.out));
ok("tex-13 pin refreshed (no FAIL)", !/FAIL \[tex-13\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)?(\/plaza)?(\/lift)?(\/align)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
