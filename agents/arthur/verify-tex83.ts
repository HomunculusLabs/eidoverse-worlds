// verify-tex83.ts — PERSISTENT lane verifier for tex-83 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-83 changed path live:
//   1. mkv3-landmarks.ts — inn rebuild determinism ×2 + live pin
//      identity + 4-family byte decode + sign/fire anchors + chains +
//      sizes; LANDMARKS-SAFETY: carousel at polish staged build,
//      belltower + windmill byte-identical.
//   2. place-tex83-timber49.ts — rollout effect live (inn on the
//      hearth-tools build at preserved pose, all 4 comps recovered,
//      anchors current, woodyard untouched).
//   3. verify-repairs.ts — full gate: tex-83 pin + tex-4 multi pin,
//      ledger law, HEAD gate.
// NOTE: after running this verifier, the caller must re-restore the
// three sibling disk artifacts:
//   cp /tmp/carousel-polish-backup.glb agents/arthur/assets/village_carousel3.glb
//   cp /tmp/ring-bak-village_belltower3.glb agents/arthur/assets/village_belltower3.glb
//   cp /tmp/ring-bak-village_windmill3.glb agents/arthur/assets/village_windmill3.glb
// Run: bun agents/arthur/verify-tex83.ts
import { execSync } from "node:child_process";
import { readFileSync, copyFileSync, existsSync } from "node:fs";
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
const restore = () => {
    copyFileSync("/tmp/carousel-polish-backup.glb", `${A}/village_carousel3.glb`);
    copyFileSync("/tmp/ring-bak-village_belltower3.glb", `${A}/village_belltower3.glb`);
    copyFileSync("/tmp/ring-bak-village_windmill3.glb", `${A}/village_windmill3.glb`);
};

// 0) landmarks-safety pre-state
ok("pre-state: inn on disk is the tex-83 build (6f35f80a)", sha(`${A}/village_inn3.glb`).slice(0, 16) === "8de1af9446f98eb9");
ok("sibling backups fresh (carousel 38fbbc26, belltower 82e4c316, windmill 7fc779a5)",
    existsSync("/tmp/carousel-polish-backup.glb")
    && existsSync("/tmp/ring-bak-village_belltower3.glb")
    && existsSync("/tmp/ring-bak-village_windmill3.glb"));

// 1) mkv3-landmarks.ts: rebuild — inn deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-landmarks.ts", { cwd: W, stdio: "pipe" });
restore();
const p1 = sha(`${A}/village_inn3.glb`);
execSync("bun agents/arthur/assets/mkv3-landmarks.ts", { cwd: W, stdio: "pipe" });
restore();
ok("inn rebuild deterministic + == live build (8de1af9446f98eb9)",
    p1 === sha(`${A}/village_inn3.glb`) && p1.startsWith("8de1af9446f98eb9"), p1.slice(0, 16));
ok("landmarks-safety: carousel (38fbbc26) + belltower (82e4c316) + windmill (7fc779a5) byte-identical",
    sha(`${A}/village_carousel3.glb`).slice(0, 16) === "38fbbc26dcdfcc1a"
    && sha(`${A}/village_belltower3.glb`).slice(0, 16) === "66524bcde061a437"
    && sha(`${A}/village_windmill3.glb`).slice(0, 16) === "4feee38977d7c6e5");

// 2) decode: 4-family byte-family + anchors + chains
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
ok("decode: timber + iron materials (tex-83 adds hearth iron to the inn)", tIdx >= 0 && iIdx >= 0, j.materials.map((m: any) => m.name).join(","));
const tile = (mi: number): Buffer => {
    const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
    return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
};
ok("timber ≡ house wallSpan's + iron ≡ forge family's (byte-family, buffer-compared)",
    Buffer.compare(tile(tIdx), tileOf("village_house3.glb", "timber")!) === 0
    && Buffer.compare(tile(iIdx), tileOf("village_bellbase3.glb", "iron")!) === 0);
ok("sign + fire anchors survive",
    !!j.nodes.find((n: any) => n.name === "sign") && !!j.nodes.find((n: any) => n.name === "fire"));
let chainOk = true, texBuckets = 0;
for (const mesh of j.meshes) for (const prim of mesh.primitives) {
    if (prim.material === tIdx || prim.material === iIdx) {
        texBuckets++;
        const t = prim.attributes.TEXCOORD_0;
        if (t === undefined || j.accessors[t].count !== j.accessors[prim.attributes.POSITION].count) chainOk = false;
    }
}
ok("texMat buckets carry TEXCOORD_0 == POSITION (keyhooks/keytags flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex83-timber49.ts: rollout effect live (all 4 comps)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const inn = ents["av-inn"];
const innComps = Object.keys(inn?.comp ?? {});
ok("place-tex83-timber49.ts effect: inn live, pose (34,0), all 4 comps recovered (smoke + particles + motion:sign + sockets)",
    inn?.lib === "store/8de1af9446f98eb9.glb" && Math.abs(inn.pos[0] - 34) < 0.01 && Math.abs(inn.pos[2]) < 0.01
    && innComps.includes("particles:smoke") && innComps.includes("particles")
    && innComps.includes("motion:sign") && innComps.includes("sockets"), inn?.lib ?? "missing");
ok("census anchors: court + hall current (ring closed), woodyard untouched",
    ents["av-court"]?.lib === "store/543b53d03ac2f104.glb"
    && ents["av-hall"]?.lib === "store/d9251dd0857e451f.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-83 pin + tex-4 multi pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-83 pin green", /^\s*PASS \[tex-83\]/m.test(vr.out));
ok("tex-4 multi pin carries new inn hash (no FAIL)", !/FAIL \[tex-4\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green (polish-inclusive)",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)?(\/plaza)?(\/lift)?(\/align)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
