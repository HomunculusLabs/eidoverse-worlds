// verify-tex57.ts — PERSISTENT lane verifier for tex-57 (does NOT
// self-delete; committed as durable, runnable evidence — T-dir
// one-shots remove themselves per the loop's hygiene law, leaving no
// visible artifact for post-deletion sampling).
// Verifies every tex-57 changed path live:
//   1. mkv3-market.ts — rebuild determinism ×2 + live pin identity +
//      timber byte decode + awning anchors + chains.
//   2. place-tex57-timber27.ts — rollout effect live (market on
//      woodwork-timber build at preserved pose, wind comps recovered,
//      anchors current, woodyard untouched).
//   3. verify-repairs.ts — full gate: tex-57 pin, refreshed tex-8 pin,
//      ledger law, HEAD gate.
// Run: bun agents/arthur/verify-tex57.ts
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

// 1) mkv3-market.ts: rebuild deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-market.ts", { cwd: W, stdio: "pipe" });
const p1 = sha(`${A}/village_market3.glb`);
execSync("bun agents/arthur/assets/mkv3-market.ts", { cwd: W, stdio: "pipe" });
ok("market rebuild deterministic + == live build (2bb51287d4e1a2a2)", p1 === sha(`${A}/village_market3.glb`) && p1.startsWith("2bb51287d4e1a2a2"), p1.slice(0, 16));

// 2) decode: timber byte-family + awning anchors + chains
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
const buf = readFileSync(`${A}/village_market3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const tIdx = j.materials.findIndex((m: any) => m.name === "timber");
ok("decode: timber material (+ 2 standing weaves from tex-8)", tIdx >= 0, j.materials.map((m: any) => m.name).join(","));
ok("3 deduped images (timber + rust + slate weaves)", j.images.length === 3, "images " + j.images.length);
const tile = (mi: number): Buffer => {
    const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
    return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
};
ok("timber ≡ house wallSpan's (byte-family law)", Buffer.compare(tile(tIdx), tileOf("village_house3.glb", "timber")!) === 0);
const isGrp = (n: any) => n.children !== undefined && n.mesh === undefined;
const a0 = j.nodes.find((n: any) => n.name === "mk_awn_0");
const a1 = j.nodes.find((n: any) => n.name === "mk_awn_1");
ok("mk_awn_0 + mk_awn_1 GROUP anchors survive (wind comp targets)", !!a0 && isGrp(a0) && !!a1 && isGrp(a1));
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
ok("timber buckets carry TEXCOORD_0 == POSITION (loaves/jugs flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex57-timber27.ts: rollout effect live (incl. wind comps)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const mk = ents["av-market"];
const mkComps = Object.keys(mk?.comp ?? {});
ok("place-tex57-timber27.ts effect: market live, pose (-5.7,5.7), wind comps recovered",
    mk?.lib === "store/2bb51287d4e1a2a2.glb" && Math.abs(mk.pos[0] + 5.7) < 0.01 && Math.abs(mk.pos[2] - 5.7) < 0.01
    && mkComps.includes("motion:mk_awn_0") && mkComps.includes("motion:mk_awn_1"), mk?.lib ?? "missing");
ok("census anchors: forge + cistern current, woodyard untouched",
    ents["av-forge"]?.lib === "store/6715b0f885deaed7.glb"
    && ents["av-bcistern"]?.lib === "store/a96ee31d29c2085f.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-57 pin + refreshed tex-8 pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-8 pin)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-57 pin green", /^\s*PASS \[tex-57\]/m.test(vr.out));
ok("tex-8 pin refreshed (no FAIL)", !/FAIL \[tex-8\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)?(\/plaza)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
