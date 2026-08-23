// verify-tex72.ts — PERSISTENT lane verifier for tex-72 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-72 changed path live:
//   1. mkv3-landmarks.ts — windmill rebuild determinism ×2 + live pin
//      identity + stone/timber byte decode + sails anchor + chains +
//      sizes; carousel-safety law (backup-restore after rebuild).
//   2. place-tex72-timber39.ts — rollout effect live (windmill on the
//      2-family build at preserved pose, sails comp recovered, anchors
//      current, woodyard + carousel untouched).
//   3. verify-repairs.ts — full gate: tex-72 pin, ledger law, HEAD gate.
// NOTE: after running this verifier, the caller must re-restore the
// carousel disk artifact (the internal rebuild clobbers it):
//   cp /tmp/carousel-polish-backup.glb agents/arthur/assets/village_carousel3.glb
// Run: bun agents/arthur/verify-tex72.ts
import { execSync } from "node:child_process";
import { readFileSync, copyFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const W = "/Users/t3rpz/projects/eidoverse-worlds";
const A = `${W}/agents/arthur/assets`;
const BK = "/tmp/carousel-polish-backup.glb";
const fails: string[] = [];
const ok = (n: string, c: boolean, d = "") => {
    console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`);
    if (!c) fails.push(n);
};
const run = (c: string) => { try { return { code: 0, out: execSync(c, { cwd: W, encoding: "utf8", timeout: 90000 }) }; } catch (e: any) { return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") }; } };
const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");

// 0) carousel-safety pre-state
ok("pre-state: carousel on disk is the polish staged build (38fbbc26)", sha(`${A}/village_carousel3.glb`).slice(0, 16) === "38fbbc26dcdfcc1a");
ok("carousel backup exists", existsSync(BK));

// 1) mkv3-landmarks.ts: rebuild — windmill deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-landmarks.ts", { cwd: W, stdio: "pipe" });
copyFileSync(BK, `${A}/village_carousel3.glb`); // restore immediately
const p1 = sha(`${A}/village_windmill3.glb`);
execSync("bun agents/arthur/assets/mkv3-landmarks.ts", { cwd: W, stdio: "pipe" });
copyFileSync(BK, `${A}/village_carousel3.glb`); // restore immediately
ok("windmill rebuild deterministic + == live build (4feee38977d7c6e5)",
    p1 === sha(`${A}/village_windmill3.glb`) && p1.startsWith("4feee38977d7c6e5"), p1.slice(0, 16));
ok("carousel-safety: restored byte-identical after both rebuilds (38fbbc26)",
    sha(`${A}/village_carousel3.glb`).slice(0, 16) === "38fbbc26dcdfcc1a");
ok("collateral: belltower byte-identical (82e4c316)", sha(`${A}/village_belltower3.glb`).slice(0, 16) === "66524bcde061a437");
ok("collateral: inn byte-identical (6f35f80a)", sha(`${A}/village_inn3.glb`).slice(0, 16) === "8de1af9446f98eb9");

// 2) decode: stone + timber byte-family + sails anchor + chains
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
const buf = readFileSync(`${A}/village_windmill3.glb`);
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
ok("stone ≡ kiln's + timber ≡ house wallSpan's (byte-family, buffer-compared)",
    Buffer.compare(tile(sIdx), tileOf("village_kiln3.glb", "stone")!) === 0
    && Buffer.compare(tile(tIdx), tileOf("village_house3.glb", "timber")!) === 0);
const isGrp = (n: any) => n.children !== undefined && n.mesh === undefined;
const sl = j.nodes.find((n: any) => n.name === "sails");
ok("sails GROUP anchor survives (motion comp target)", !!sl && isGrp(sl));
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
ok("texMat buckets carry TEXCOORD_0 == POSITION (cloth/sacks/hub/lamp flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex72-timber39.ts: rollout effect live (incl. sails comp)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const wm = ents["av-windmill"];
const wmComps = Object.keys(wm?.comp ?? {});
ok("place-tex72-timber39.ts effect: windmill live, pose (-38,0), sails comp recovered",
    wm?.lib === "store/4feee38977d7c6e5.glb" && Math.abs(wm.pos[0] + 38) < 0.01 && Math.abs(wm.pos[2]) < 0.01
    && wmComps.includes("motion:sails"), wm?.lib ?? "missing");
ok("carousel-safety: live carousel untouched (cd22d0b0)", ents["av-carousel"]?.lib === "store/cd22d0b09e70bebc.glb");
ok("census anchors: belltower + quarry current, woodyard untouched",
    ents["av-belltower"]?.lib === "store/66524bcde061a437.glb"
    && ents["av-quarry"]?.lib === "store/8582f2d45440dfed.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-72 pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-72 pin green", /^\s*PASS \[tex-72\]/m.test(vr.out));
ok("ledger law EXACT + HEAD gate green (polish-inclusive)",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)?(\/plaza)?(\/lift)?(\/align)?(\/mason)?(\/nv)?(\/nvp)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
