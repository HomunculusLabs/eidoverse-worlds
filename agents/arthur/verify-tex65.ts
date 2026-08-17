// verify-tex65.ts — PERSISTENT lane verifier for tex-65 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-65 changed path live:
//   1. mkv3-potter41.ts — rebuild determinism ×2 + live pin identity +
//      timber byte decode + pwheel anchor + chains + sizes.
//   2. place-tex65-timber32.ts — rollout effect live (potter on the
//      timber-woodwork build at preserved pose, wheel comp recovered,
//      anchors current, woodyard untouched).
//   3. verify-repairs.ts — full gate: tex-65 pin, refreshed tex-29
//      pin, ledger law, HEAD gate.
// Run: bun agents/arthur/verify-tex65.ts
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

// 1) mkv3-potter41.ts: rebuild deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-potter41.ts", { cwd: W, stdio: "pipe" });
const p1 = sha(`${A}/village_potter3.glb`);
execSync("bun agents/arthur/assets/mkv3-potter41.ts", { cwd: W, stdio: "pipe" });
ok("potter rebuild deterministic + == live build (cea5c582bf05d72f)", p1 === sha(`${A}/village_potter3.glb`) && p1.startsWith("cea5c582bf05d72f"), p1.slice(0, 16));

// 2) decode: timber byte-family + pwheel anchor + chains + sizes
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
const buf = readFileSync(`${A}/village_potter3.glb`);
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
const isGrp = (n: any) => n.children !== undefined && n.mesh === undefined;
const pw = j.nodes.find((n: any) => n.name === "pwheel");
ok("pwheel GROUP anchor survives (wheel comp target)", !!pw && isGrp(pw));
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
ok("timber buckets carry TEXCOORD_0 == POSITION (clay/ware/cloth flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex65-timber32.ts: rollout effect live (incl. wheel comp)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const pt = ents["av-potter"];
const ptComps = Object.keys(pt?.comp ?? {});
ok("place-tex65-timber32.ts effect: potter live, pose (24.1,38.6), wheel comp recovered",
    pt?.lib === "store/cea5c582bf05d72f.glb" && Math.abs(pt.pos[0] - 24.1) < 0.01 && Math.abs(pt.pos[2] - 38.6) < 0.01
    && ptComps.includes("motion:pwheel"), pt?.lib ?? "missing");
ok("census anchors: waystone + milestone-n current, woodyard untouched",
    ents["av-waystone"]?.lib === "store/5fcaa644f4ba290b.glb"
    && ents["av-milestone-n"]?.lib === "store/a2b6bfab613f0e84.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-65 pin + refreshed tex-29 pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-29 pin)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-65 pin green", /^\s*PASS \[tex-65\]/m.test(vr.out));
ok("tex-29 pin refreshed (no FAIL)", !/FAIL \[tex-29\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green (polish-inclusive)",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
