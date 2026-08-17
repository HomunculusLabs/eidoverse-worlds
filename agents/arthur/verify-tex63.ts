// verify-tex63.ts — PERSISTENT lane verifier for tex-63 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-63 changed path live:
//   1. mkv3-miles14.ts — rebuild determinism ×2 + live pin identity +
//      stone/iron byte decode + chains + sizes (both GLBs).
//   2. place-tex63-multi7.ts — rollout effect live (both milestones on
//      the textured build at preserved poses, anchors current, woodyard
//      untouched).
//   3. verify-repairs.ts — full gate: tex-63 pin, refreshed tex-27
//      pin, ledger law, HEAD gate.
// Run: bun agents/arthur/verify-tex63.ts
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

// 1) mkv3-miles14.ts: rebuild deterministic + == live pins
execSync("bun agents/arthur/assets/mkv3-miles14.ts", { cwd: W, stdio: "pipe" });
const n1 = sha(`${A}/village_milestone_n.glb`);
const s1 = sha(`${A}/village_milestone_s.glb`);
execSync("bun agents/arthur/assets/mkv3-miles14.ts", { cwd: W, stdio: "pipe" });
ok("milestones rebuild deterministic + == live builds (n a2b6bfab…, s 3d423bc3…)",
    n1 === sha(`${A}/village_milestone_n.glb`) && n1.startsWith("a2b6bfab613f0e84")
    && s1 === sha(`${A}/village_milestone_s.glb`) && s1.startsWith("3d423bc3590b5068"), n1.slice(0, 12) + "/" + s1.slice(0, 12));

// 2) decode: stone + iron byte-family + chains + sizes (both GLBs)
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
const refStone = tileOf("village_kiln3.glb", "stone")!;
const refIron = tileOf("village_bellbase3.glb", "iron")!;
for (const [nm, pin] of [["n", "a2b6bfab613f0e84"], ["s", "3d423bc3590b5068"]] as const) {
    const buf = readFileSync(`${A}/village_milestone_${nm}.glb`);
    const jl = buf.readUInt32LE(12);
    const binStart = 28 + jl;
    const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
    const sIdx = j.materials.findIndex((m: any) => m.name === "stone");
    const iIdx = j.materials.findIndex((m: any) => m.name === "iron");
    ok(`milestone-${nm}: stone + iron materials, 2 deduped images`, sIdx >= 0 && iIdx >= 0 && j.images.length === 2, j.materials.map((m: any) => m.name).join(","));
    const tile = (mi: number): Buffer => {
        const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
        const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
        return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
    };
    ok(`milestone-${nm}: stone ≡ kiln's + iron ≡ forge family's (byte-family)`,
        Buffer.compare(tile(sIdx), refStone) === 0 && Buffer.compare(tile(iIdx), refIron) === 0);
    const lamp = j.materials.some((m: any) => /^glow/.test(m.name ?? ""));
    ok(`milestone-${nm}: emissive lantern survives (glow material bucket; mlantern merged into statics — no comps, MERGED-STATICS law)`, lamp, j.materials.map((m: any) => m.name).join(","));
    let chainOk = true, texBuckets = 0;
    for (const mesh of j.meshes) for (const prim of mesh.primitives) {
        if (prim.material === sIdx || prim.material === iIdx) {
            texBuckets++;
            const t = prim.attributes.TEXCOORD_0;
            if (t === undefined || j.accessors[t].count !== j.accessors[prim.attributes.POSITION].count) chainOk = false;
        }
    }
    ok(`milestone-${nm}: texMat buckets carry TEXCOORD_0 == POSITION (lantern emissive flat)`, chainOk, "buckets " + texBuckets);
    let texBytes = 0;
    for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
    ok(`milestone-${nm}: texture bytes < 400KB + GLB < 20MB`, texBytes < 400 * 1024 && buf.length < 20 * 1024 * 1024, texBytes + "B / " + (buf.length / 1024).toFixed(1) + "KB");
}

// 3) place-tex63-multi7.ts: rollout effect live
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const mn = ents["av-milestone-n"];
const ms = ents["av-milestone-s"];
ok("place-tex63-multi7.ts effect: both milestones live on textured builds, poses preserved",
    mn?.lib === "store/a2b6bfab613f0e84.glb" && Math.abs(mn.pos[0] - 0) < 0.01 && Math.abs(mn.pos[2] - 30.6) < 0.01
    && ms?.lib === "store/3d423bc3590b5068.glb" && Math.abs(ms.pos[0] - 0) < 0.01 && Math.abs(ms.pos[2] + 30.6) < 0.01,
    `${mn?.lib ?? "missing"} / ${ms?.lib ?? "missing"}`);
ok("census anchors: wayside + mapboard current, woodyard untouched",
    ents["av-wayside"]?.lib === "store/5db486a79ff5cc6e.glb"
    && ents["av-mapboard"]?.lib === "store/d555acbd0b0ab516.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-63 pin + refreshed tex-27 pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-27 pin)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-63 pin green", /^\s*PASS \[tex-63\]/m.test(vr.out));
ok("tex-27 pin refreshed (no FAIL)", !/FAIL \[tex-27\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green (polish-inclusive)",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
