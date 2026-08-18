// verify-tex56.ts — PERSISTENT lane verifier for tex-56 (does NOT
// self-delete: T-dir one-shots remove themselves per the loop's
// hygiene law, which leaves no visible evidence artifact for
// post-deletion sampling — this file is the durable, runnable record).
// Verifies every tex-56 changed path live:
//   1. mkv3-forge98.ts — rebuild determinism ×2 + live pin identity +
//      3-family byte decode + fire anchor + chains.
//   2. place-tex56-timber26.ts — rollout effect live (forge on
//      woodwork-timber build at preserved pose, fire comps recovered,
//      anchors current, woodyard untouched).
//   3. verify-tex56-live.ts — census assertions re-run (the one-shot
//      itself self-deletes by design after its single passing pass).
//   4. verify-repairs.ts — full gate: tex-56 pin, refreshed tex-6 pin,
//      ledger law, HEAD gate.
// Run: bun agents/arthur/verify-tex56.ts
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

// 1) mkv3-forge98.ts: rebuild deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-forge98.ts", { cwd: W, stdio: "pipe" });
const p1 = sha(`${A}/village_forge3.glb`);
execSync("bun agents/arthur/assets/mkv3-forge98.ts", { cwd: W, stdio: "pipe" });
ok("forge rebuild deterministic + == live build (6715b0f885deaed7)", p1 === sha(`${A}/village_forge3.glb`) && p1.startsWith("6715b0f885deaed7"), p1.slice(0, 16));

// 2) decode: 3-family byte-family + fire anchor + chains
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
const buf = readFileSync(`${A}/village_forge3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const tIdx = j.materials.findIndex((m: any) => m.name === "timber");
const iIdx = j.materials.findIndex((m: any) => m.name === "iron");
const sIdx = j.materials.findIndex((m: any) => m.name === "stone");
ok("decode: timber + iron + stone materials (3 families, 3 deduped images)", tIdx >= 0 && iIdx >= 0 && sIdx >= 0 && j.images.length === 3);
const tile = (mi: number): Buffer => {
    const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
    return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
};
ok("timber ≡ house's + iron ≡ standing forge family + stone ≡ kiln's (byte-family, buffer-compared)",
    Buffer.compare(tile(tIdx), tileOf("village_house3.glb", "timber")!) === 0
    && Buffer.compare(tile(sIdx), tileOf("village_kiln3.glb", "stone")!) === 0
    && Buffer.compare(tile(iIdx), tileOf("village_bellbase3.glb", "iron")!) === 0);
const isGrp = (n: any) => n.children !== undefined && n.mesh === undefined;
const fire = j.nodes.find((n: any) => n.name === "fire_fg_coals");
ok("fire_fg_coals GROUP anchor survives (forge-fire comp target)", !!fire && isGrp(fire));
let chainOk = true, texBuckets = 0;
for (const mesh of j.meshes) for (const prim of mesh.primitives) {
    if (prim.material === tIdx) {
        texBuckets++;
        const t = prim.attributes.TEXCOORD_0;
        if (t === undefined || j.accessors[t].count !== j.accessors[prim.attributes.POSITION].count) chainOk = false;
    }
}
ok("timber buckets carry TEXCOORD_0 == POSITION (coals/water/trim flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex56-timber26.ts: rollout effect live (incl. fire comps)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const fg = ents["av-forge"];
const fgComps = Object.keys(fg?.comp ?? {});
ok("place-tex56-timber26.ts effect: forge live on woodwork build, fire comps recovered",
    fg?.lib === "store/6715b0f885deaed7.glb" && fgComps.some((c) => c.startsWith("particles")) && fgComps.some((c) => c.startsWith("motion:fire")), fg?.lib ?? "missing");
ok("census anchors: cistern + hutch current, woodyard untouched",
    ents["av-bcistern"]?.lib === "store/a96ee31d29c2085f.glb"
    && ents["av-hutch"]?.lib === "store/6263e8a20eb17cc9.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-56 pin + refreshed tex-6 pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-6 pin)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-56 pin green", /^\s*PASS \[tex-56\]/m.test(vr.out));
ok("tex-6 pin refreshed (no FAIL)", !/FAIL \[tex-6\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)?(\/plaza)?(\/lift)? commit/m.test(vr.out));

// 5) hygiene: T-dir one-shots consumed (self-deleting law)
ok("tex-56 T-dir one-shots consumed (self-deleting law)",
    !existsSync(`${T}/hermes-verify-tex56.ts`) && !existsSync(`${A}/verify-tex56-live.ts`));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
