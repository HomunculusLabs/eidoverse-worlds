// verify-tex67.ts — PERSISTENT lane verifier for tex-67 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-67 changed path live:
//   1. mkv3-plaza.ts — rebuild determinism ×2 + live pin identity +
//      3-family byte decode (iron now in the bowl) + anchors + chains.
//   2. place-tex67-iron23.ts — rollout effect live (plaza on the
//      iron-bowl build at preserved pose, all 4 comps recovered,
//      anchors current, woodyard untouched).
//   3. verify-repairs.ts — full gate: tex-67 pin, refreshed tex-52
//      pin, ledger law, HEAD gate.
// Run: bun agents/arthur/verify-tex67.ts
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

// 1) mkv3-plaza.ts: rebuild deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-plaza.ts", { cwd: W, stdio: "pipe" });
const p1 = sha(`${A}/village_plaza3.glb`);
execSync("bun agents/arthur/assets/mkv3-plaza.ts", { cwd: W, stdio: "pipe" });
ok("plaza rebuild deterministic + == live build (933ab1f9 → 0f9553f6 plaza-1 → 1a656f00 plaza-4 ring stones)", p1 === sha(`${A}/village_plaza3.glb`) && p1.startsWith("1a656f00ab66db91"), p1.slice(0, 16));

// 2) decode: 3-family byte-family + anchors + chains
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
const buf = readFileSync(`${A}/village_plaza3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const sIdx = j.materials.findIndex((m: any) => m.name === "stone");
const tIdx = j.materials.findIndex((m: any) => m.name === "timber");
const iIdx = j.materials.findIndex((m: any) => m.name === "iron");
ok("decode: stone + timber + iron materials", sIdx >= 0 && tIdx >= 0 && iIdx >= 0, j.materials.map((m: any) => m.name).join(","));
ok("3 deduped images (tex-67 families; the 6 tex-11 soil variants retired by plaza-1 — paving now ashlar)", j.images.length === 3, "images " + j.images.length);
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
const kt = j.nodes.find((n: any) => n.name === "pz_kettle");
ok("pz_kettle GROUP anchor survives (kettle comp target)", !!kt && isGrp(kt));
const bowlMerged = j.materials.some((m: any) => m.name === "iron");
ok("bowl carried by the iron material (merged into pz3_* statics — not a KEEP node; MERGED-STATICS law)", bowlMerged);
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
ok("texMat buckets carry TEXCOORD_0 == POSITION (logs/grain/rope/ladle/water flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex67-iron23.ts: rollout effect live (incl. all 4 comps)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const pz = ents["av-plaza-hearth"];
const pzComps = Object.keys(pz?.comp ?? {});
ok("place-tex67-iron23.ts effect: plaza live, pose (0,0), all 4 comps recovered",
    pz?.lib === "store/1a656f00ab66db91.glb" && Math.abs(pz.pos[0]) < 0.01 && Math.abs(pz.pos[2]) < 0.01
    && ["particles", "motion:well_", "sockets", "motion:pz_kettle"].every((c) => pzComps.includes(c)), pz?.lib ?? "missing");
ok("census anchors: kiln + potter current, woodyard untouched",
    ents["av-kiln"]?.lib === "store/0bdc0d18dddacf9b.glb"
    && ents["av-potter"]?.lib === "store/cea5c582bf05d72f.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-67 pin + refreshed tex-52 pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-52 pin)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-67 pin green", /^\s*PASS \[tex-67\]/m.test(vr.out));
ok("tex-52 pin refreshed (no FAIL)", !/FAIL \[tex-52\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green (polish-inclusive)",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)?(\/plaza)?(\/lift)?(\/align)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
