// verify-tex74.ts — PERSISTENT lane verifier for tex-74 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-74 changed path live:
//   1. mkv3-landmarks.ts — inn rebuild determinism ×2 + live pin
//      identity + timber/iron byte decode + fire/sign anchors + chains
//      + sizes; carousel-safety law (restore after rebuild).
//   2. place-tex74-timber41.ts — rollout effect live (inn on the
//      interior-timber build at preserved pose, all 4 comps recovered,
//      anchors current, woodyard + carousel untouched).
//   3. verify-repairs.ts — full gate: tex-74 pin + tex-4 multi pin,
//      ledger law, HEAD gate.
// NOTE: after running this verifier, the caller must re-restore the
// carousel disk artifact:
//   cp /tmp/carousel-polish-backup.glb agents/arthur/assets/village_carousel3.glb
// Run: bun agents/arthur/verify-tex74.ts
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
ok("carousel mk source exists (deterministic restore path)", existsSync(`${A}/mkcarousel.ts`));

// 1) mkv3-landmarks.ts: rebuild — inn deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-landmarks.ts", { cwd: W, stdio: "pipe" });
run("bun agents/arthur/assets/mkcarousel.ts"); // plaza-1: /tmp is volatile; restore by rebuild (hash-asserted below)
const p1 = sha(`${A}/village_inn3.glb`);
execSync("bun agents/arthur/assets/mkv3-landmarks.ts", { cwd: W, stdio: "pipe" });
run("bun agents/arthur/assets/mkcarousel.ts"); // plaza-1: /tmp is volatile; restore by rebuild (hash-asserted below)
ok("inn rebuild deterministic + == live build (6f35f80a336889cd)",
    p1 === sha(`${A}/village_inn3.glb`) && p1.startsWith("6f35f80a336889cd"), p1.slice(0, 16));
ok("carousel-safety: restored byte-identical after both rebuilds (38fbbc26)",
    sha(`${A}/village_carousel3.glb`).slice(0, 16) === "38fbbc26dcdfcc1a");
ok("collateral: belltower (82e4c316) + windmill (7fc779a5) byte-identical",
    sha(`${A}/village_belltower3.glb`).slice(0, 16) === "82e4c316b62e5006"
    && sha(`${A}/village_windmill3.glb`).slice(0, 16) === "7fc779a5c7dd5dc5");

// 2) decode: timber + iron byte-family + fire/sign anchors + chains
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
const buf = readFileSync(`${A}/village_inn3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const tIdx = j.materials.findIndex((m: any) => m.name === "timber");
const iIdx = j.materials.findIndex((m: any) => m.name === "iron");
ok("decode: timber + iron materials", tIdx >= 0 && iIdx >= 0, j.materials.map((m: any) => m.name).join(","));
ok("4 deduped images (timber + stone + plaster shell + iron — multi-family building, PROBE-EXPECTATION)", j.images.length === 4, "images " + j.images.length);
const tile = (mi: number): Buffer => {
    const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
    return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
};
ok("timber ≡ house wallSpan's + iron ≡ forge family's (byte-family, buffer-compared)",
    Buffer.compare(tile(tIdx), tileOf("village_house3.glb", "timber")!) === 0
    && Buffer.compare(tile(iIdx), tileOf("village_bellbase3.glb", "iron")!) === 0);
const isGrp = (n: any) => n.children !== undefined && n.mesh === undefined;
const sgn = j.nodes.find((n: any) => n.name === "sign");
ok("sign GROUP anchor survives (pendulum comp target)", !!sgn && isGrp(sgn));
const fireGrp = j.nodes.find((n: any) => n.name === "fire");
ok("fire emissive node survives", !!fireGrp);
const named = j.nodes.filter((n: any) => n.name !== undefined).map((n: any) => n.name);
ok("no duplicate NAMED node names", new Set(named).size === named.length, "clean");
let chainOk = true, texBuckets = 0;
for (const mesh of j.meshes) for (const prim of mesh.primitives) {
    if (prim.material === tIdx || prim.material === iIdx) {
        texBuckets++;
        const t = prim.attributes.TEXCOORD_0;
        if (t === undefined || j.accessors[t].count !== j.accessors[prim.attributes.POSITION].count) chainOk = false;
    }
}
ok("texMat buckets carry TEXCOORD_0 == POSITION (goods/cloth/sign flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex74-timber41.ts: rollout effect live (incl. 4 comps)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const inn = ents["av-inn"];
const innComps = Object.keys(inn?.comp ?? {});
ok("place-tex74-timber41.ts effect: inn live, pose (34,0), all 4 comps recovered",
    inn?.lib === "store/6f35f80a336889cd.glb" && Math.abs(inn.pos[0] - 34) < 0.01 && Math.abs(inn.pos[2]) < 0.01
    && innComps.includes("particles:smoke") && innComps.includes("particles")
    && innComps.includes("motion:sign") && innComps.includes("sockets"), inn?.lib ?? "missing");
ok("carousel-safety: live carousel untouched (cd22d0b0)", ents["av-carousel"]?.lib === "store/cd22d0b09e70bebc.glb");
ok("census anchors: windmill + belltower current, woodyard untouched",
    ents["av-windmill"]?.lib === "store/7fc779a5c7dd5dc5.glb"
    && ents["av-belltower"]?.lib === "store/82e4c316b62e5006.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-74 pin + tex-4 multi pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. tex-4 multi pin w/ new inn hash)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-74 pin green", /^\s*PASS \[tex-74\]/m.test(vr.out));
ok("tex-4 multi pin carries the new inn hash (no FAIL)", !/FAIL \[tex-4\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green (polish-inclusive)",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)?(\/plaza)?(\/lift)?(\/align)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
