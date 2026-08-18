// verify-tex66.ts — PERSISTENT lane verifier for tex-66 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-66 changed path live:
//   1. mkv3-kiln38.ts — rebuild determinism ×2 + live pin identity +
//      stone/timber byte decode + fire anchor + chains + sizes.
//   2. place-tex66-stone18.ts — rollout effect live (kiln on the
//      ring-stone build at preserved pose, fire + smoke comps
//      recovered, anchors current, woodyard untouched).
//   3. verify-repairs.ts — full gate: tex-66 pin, refreshed tex-9
//      pin, ledger law, HEAD gate.
// Run: bun agents/arthur/verify-tex66.ts
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

// 1) mkv3-kiln38.ts: rebuild deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-kiln38.ts", { cwd: W, stdio: "pipe" });
const p1 = sha(`${A}/village_kiln3.glb`);
execSync("bun agents/arthur/assets/mkv3-kiln38.ts", { cwd: W, stdio: "pipe" });
ok("kiln rebuild deterministic + == live build (69c0e48a917d4ed2)", p1 === sha(`${A}/village_kiln3.glb`) && p1.startsWith("69c0e48a917d4ed2"), p1.slice(0, 16));

// 2) decode: stone + timber byte-family + fire anchor + chains + sizes
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
const buf = readFileSync(`${A}/village_kiln3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const sIdx = j.materials.findIndex((m: any) => m.name === "stone");
const tIdx = j.materials.findIndex((m: any) => m.name === "timber");
ok("decode: stone + timber materials", sIdx >= 0 && tIdx >= 0, j.materials.map((m: any) => m.name).join(","));
ok("2 deduped images", j.images.length === 2, "images " + j.images.length);
const tile = (mi: number): Buffer => {
    const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
    return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
};
// stone ≡ itself is trivially true (this IS the family source); assert stone
// params unchanged by comparing to the quarry's stone (another ashlar user)
ok("stone ≡ quarry's ashlar (family unchanged, byte-compared)", Buffer.compare(tile(sIdx), tileOf("village_quarry3.glb", "stone")!) === 0);
ok("timber ≡ house wallSpan's (byte-family law)", Buffer.compare(tile(tIdx), tileOf("village_house3.glb", "timber")!) === 0);
const isGrp = (n: any) => n.children !== undefined && n.mesh === undefined;
const fk = j.nodes.find((n: any) => n.name === "fire_kiln");
ok("fire_kiln GROUP anchor survives (fire comp target)", !!fk && isGrp(fk));
const named = j.nodes.filter((n: any) => n.name !== undefined).map((n: any) => n.name);
ok("no duplicate NAMED node names", new Set(named).size === named.length, "clean");
let chainOk = true, texBuckets = 0;
for (const mesh of j.meshes) for (const prim of mesh.primitives) {
    if (prim.material === sIdx || prim.material === tIdx) {
        texBuckets++;
        const t = prim.attributes.TEXCOORD_0;
        if (t === undefined || j.accessors[t].count !== j.accessors[prim.attributes.POSITION].count) chainOk = false;
    }
}
ok("texMat buckets carry TEXCOORD_0 == POSITION (cobbles/putty/fire flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex66-stone18.ts: rollout effect live (incl. fire + smoke comps)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const kl = ents["av-kiln"];
const klComps = Object.keys(kl?.comp ?? {});
ok("place-tex66-stone18.ts effect: kiln live, pose (28.9,37), fire + smoke comps recovered",
    kl?.lib === "store/69c0e48a917d4ed2.glb" && Math.abs(kl.pos[0] - 28.9) < 0.01 && Math.abs(kl.pos[2] - 37) < 0.01
    && klComps.includes("particles") && klComps.includes("motion:fire_kiln"), kl?.lib ?? "missing");
ok("census anchors: potter + waystone current, woodyard untouched",
    ents["av-potter"]?.lib === "store/66836b01897cfebc.glb"
    && ents["av-waystone"]?.lib === "store/c418d713c69d23ae.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-66 pin + refreshed tex-9 pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-9 pin)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-66 pin green", /^\s*PASS \[tex-66\]/m.test(vr.out));
ok("tex-9 pin refreshed (no FAIL)", !/FAIL \[tex-9\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green (polish-inclusive)",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)?(\/plaza)?(\/lift)?(\/align)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
