// verify-tex59.ts — PERSISTENT lane verifier for tex-59 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-59 changed path live:
//   1. mkv3-monument.ts — rebuild determinism ×2 + live pin identity +
//      stone/soil byte decode + knot anchor + chains.
//   2. place-tex59-stone14.ts — rollout effect live (monument on the
//      full-ashlar plinth build at preserved pose, knot spin comp
//      recovered, anchors current, woodyard untouched).
//   3. verify-repairs.ts — full gate: tex-59 pin, refreshed tex-18
//      pin, ledger law, HEAD gate.
// Run: bun agents/arthur/verify-tex59.ts
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

// 1) mkv3-monument.ts: rebuild deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-monument.ts", { cwd: W, stdio: "pipe" });
const p1 = sha(`${A}/village_monument3.glb`);
execSync("bun agents/arthur/assets/mkv3-monument.ts", { cwd: W, stdio: "pipe" });
ok("monument rebuild deterministic + == live build (9520e61fc8e9d887)", p1 === sha(`${A}/village_monument3.glb`) && p1.startsWith("9520e61fc8e9d887"), p1.slice(0, 16));

// 2) decode: stone byte-family + knot anchor + chains
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
const buf = readFileSync(`${A}/village_monument3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const sIdx = j.materials.findIndex((m: any) => m.name === "stone");
ok("decode: stone material (soil standing from tex-18)", sIdx >= 0, j.materials.map((m: any) => m.name).join(","));
const tile = (mi: number): Buffer => {
    const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
    return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
};
ok("stone ≡ kiln's ashlar (byte-family law)", Buffer.compare(tile(sIdx), tileOf("village_kiln3.glb", "stone")!) === 0);
const isGrp = (n: any) => n.children !== undefined && n.mesh === undefined;
const knot = j.nodes.find((n: any) => n.name === "knot");
ok("knot GROUP anchor survives (spin comp target)", !!knot && isGrp(knot));
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
ok("stone buckets carry TEXCOORD_0 == POSITION (knot/bowls/plaque/lamp flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex59-stone14.ts: rollout effect live (incl. knot comp)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const mn = ents["av-monument"];
ok("place-tex59-stone14.ts effect: monument live, pose (-6.4,-6.4), knot comp recovered",
    mn?.lib === "store/9520e61fc8e9d887.glb" && Math.abs(mn.pos[0] + 6.4) < 0.01 && Math.abs(mn.pos[2] + 6.4) < 0.01
    && Object.keys(mn?.comp ?? {}).includes("motion:knot"), mn?.lib ?? "missing");
ok("census anchors: shrine + market current, woodyard untouched",
    ents["av-shrine"]?.lib === "store/d0d3743a60802625.glb"
    && ents["av-market"]?.lib === "store/2bb51287d4e1a2a2.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-59 pin + refreshed tex-18 pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-18 pin)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-59 pin green", /^\s*PASS \[tex-59\]/m.test(vr.out));
ok("tex-18 pin refreshed (no FAIL)", !/FAIL \[tex-18\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
