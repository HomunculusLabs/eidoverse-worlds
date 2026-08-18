// verify-tex64.ts — PERSISTENT lane verifier for tex-64 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-64 changed path live:
//   1. mkv3-waystone41.ts — rebuild determinism ×2 + live pin identity +
//      3-family byte decode + float anchors + chains + sizes.
//   2. place-tex64-timber31.ts — rollout effect live (waystone on the
//      bench-timber build at preserved pose, all three comps recovered,
//      anchors current, woodyard untouched).
//   3. verify-repairs.ts — full gate: tex-64 pin, refreshed tex-28
//      pin, ledger law, HEAD gate.
// Run: bun agents/arthur/verify-tex64.ts
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

// 1) mkv3-waystone41.ts: rebuild deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-waystone41.ts", { cwd: W, stdio: "pipe" });
const p1 = sha(`${A}/village_waystone3.glb`);
execSync("bun agents/arthur/assets/mkv3-waystone41.ts", { cwd: W, stdio: "pipe" });
ok("waystone rebuild deterministic + == live build (5fcaa644f4ba290b)", p1 === sha(`${A}/village_waystone3.glb`) && p1.startsWith("5fcaa644f4ba290b"), p1.slice(0, 16));

// 2) decode: 3-family byte-family + float anchors + chains + sizes
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
const buf = readFileSync(`${A}/village_waystone3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const sIdx = j.materials.findIndex((m: any) => m.name === "stone");
const tIdx = j.materials.findIndex((m: any) => m.name === "timber");
const iIdx = j.materials.findIndex((m: any) => m.name === "iron");
ok("decode: stone + timber + iron materials", sIdx >= 0 && tIdx >= 0 && iIdx >= 0, j.materials.map((m: any) => m.name).join(","));
ok("3 deduped images", j.images.length === 3, "images " + j.images.length);
const tile = (mi: number): Buffer => {
    const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
    return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
};
ok("stone ≡ kiln's + timber ≡ house's + iron ≡ forge family's (byte-family, buffer-compared)",
    Buffer.compare(tile(sIdx), tileOf("village_kiln3.glb", "stone")!) === 0
    && Buffer.compare(tile(tIdx), tileOf("village_house3.glb", "timber")!) === 0
    && Buffer.compare(tile(iIdx), tileOf("village_bellbase3.glb", "iron")!) === 0);
const isGrp = (n: any) => n.children !== undefined && n.mesh === undefined;
const wf = j.nodes.find((n: any) => n.name === "ws_float");
const wfs = j.nodes.find((n: any) => n.name === "ws_float_spin");
ok("ws_float + ws_float_spin GROUP anchors survive (motion comp targets)", !!wf && isGrp(wf) && !!wfs && isGrp(wfs));
// STRANGER'S-STONE law: the floater + offering prims are material-less
// flat statics (vertex COLOR_0 only) — they take NO tile, unlike the 3
// textured families. Verify by node walk: ws_float_stone's mesh carries
// no material reference.
const fstoneNode = (() => { for (let ni = 0; ni < j.nodes.length; ni++) { const n = j.nodes[ni]; if (n.name === "ws_float_stone") return n; } return undefined; })();
const fstoneMesh = fstoneNode?.mesh !== undefined ? j.meshes[fstoneNode.mesh] : undefined;
ok("the FLOATING stone stays flat (STRANGER'S-STONE law — material-less prim, no tile, unexplained)",
    !!fstoneMesh && fstoneMesh.primitives.every((p: any) => p.material === undefined));
const named = j.nodes.filter((n: any) => n.name !== undefined).map((n: any) => n.name);
ok("no duplicate NAMED node names", new Set(named).size === named.length, "clean");
let chainOk = true, texBuckets = 0;
for (const mesh of j.meshes) for (const prim of mesh.primitives) {
    if (prim.material === sIdx || prim.material === tIdx || prim.material === iIdx) {
        texBuckets++;
        const t = prim.attributes.TEXCOORD_0;
        if (t === undefined || j.accessors[t].count !== j.accessors[prim.attributes.POSITION].count) chainOk = false;
    }
}
ok("texMat buckets carry TEXCOORD_0 == POSITION (floater/offering/lamp core flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex64-timber31.ts: rollout effect live (incl. all three comps)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const wsx = ents["av-waystone"];
const wsComps = Object.keys(wsx?.comp ?? {});
ok("place-tex64-timber31.ts effect: waystone live, pose (-38.9,-38.9), all three comps recovered",
    wsx?.lib === "store/5fcaa644f4ba290b.glb" && Math.abs(wsx.pos[0] + 38.9) < 0.01 && Math.abs(wsx.pos[2] + 38.9) < 0.01
    && ["motion:ws_float", "motion:ws_float_spin", "particles:ffw"].every((c) => wsComps.includes(c)), wsx?.lib ?? "missing");
ok("census anchors: milestone-n + wayside current, woodyard untouched",
    ents["av-milestone-n"]?.lib === "store/a2b6bfab613f0e84.glb"
    && ents["av-wayside"]?.lib === "store/5db486a79ff5cc6e.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-64 pin + refreshed tex-28 pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-28 pin)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-64 pin green", /^\s*PASS \[tex-64\]/m.test(vr.out));
ok("tex-28 pin refreshed (no FAIL)", !/FAIL \[tex-28\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green (polish-inclusive)",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)?(\/plaza)?(\/lift)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
