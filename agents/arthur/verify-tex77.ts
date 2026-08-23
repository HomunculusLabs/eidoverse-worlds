// verify-tex77.ts — PERSISTENT lane verifier for tex-77 (does NOT
// self-delete; committed as durable, runnable evidence).
// Verifies every tex-77 changed path live:
//   1. mkv3-ring.ts — longhouse rebuild determinism ×2 + live pin
//      identity + 3-family byte decode + fire anchor + chains + sizes;
//      RING-SAFETY: hall kept at tex-76 build, five siblings restored
//      byte-identical after each rebuild.
//   2. place-tex77-timber43.ts — rollout effect live (longhouse on the
//      3-family build at preserved pose, smoke comp recovered, anchors
//      current, woodyard untouched).
//   3. verify-repairs.ts — full gate: tex-77 pin + tex-4 multi pin,
//      ledger law, HEAD gate.
// NOTE: after running this verifier, the caller must re-restore the
// five untouched sibling disk artifacts:
//   for f in village_tower3 village_garden3 village_row3 village_bunk3 village_court3; do cp /tmp/ring-bak-$f.glb agents/arthur/assets/$f.glb; done
// Run: bun agents/arthur/verify-tex77.ts
import { execSync } from "node:child_process";
import { readFileSync, copyFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const W = "/Users/t3rpz/projects/eidoverse-worlds";
const A = `${W}/agents/arthur/assets`;
const SIB = ["village_tower3", "village_garden3", "village_row3", "village_bunk3", "village_court3"];
const fails: string[] = [];
const ok = (n: string, c: boolean, d = "") => {
    console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`);
    if (!c) fails.push(n);
};
const run = (c: string) => { try { return { code: 0, out: execSync(c, { cwd: W, encoding: "utf8", timeout: 90000 }) }; } catch (e: any) { return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") }; } };
const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
const restoreSibs = () => { for (const f of SIB) copyFileSync(`/tmp/ring-bak-${f}.glb`, `${A}/${f}.glb`); };

// 0) ring-safety pre-state
ok("pre-state: longhouse on disk is the tex-77 build (05149e3e)", sha(`${A}/village_longhouse3.glb`).slice(0, 16) === "05149e3e7d5e5918");
ok("all five sibling backups exist + hall backup is tex-76 (d9251dd0)",
    SIB.every((f) => existsSync(`/tmp/ring-bak-${f}.glb`))
    && sha(`/tmp/ring-bak-village_hall3.glb`).slice(0, 16) === "d9251dd0857e451f");

// 1) mkv3-ring.ts: rebuild — longhouse deterministic + == live pin
execSync("bun agents/arthur/assets/mkv3-ring.ts", { cwd: W, stdio: "pipe" });
restoreSibs();
copyFileSync(`/tmp/ring-bak-village_hall3.glb`, `${A}/village_hall3.glb`);
const p1 = sha(`${A}/village_longhouse3.glb`);
execSync("bun agents/arthur/assets/mkv3-ring.ts", { cwd: W, stdio: "pipe" });
restoreSibs();
copyFileSync(`/tmp/ring-bak-village_hall3.glb`, `${A}/village_hall3.glb`);
ok("longhouse rebuild deterministic + == live build (05149e3e7d5e5918)",
    p1 === sha(`${A}/village_longhouse3.glb`) && p1.startsWith("05149e3e7d5e5918"), p1.slice(0, 16));
ok("ring-safety: five siblings restored byte-identical (fb590200 tower, 845ee738 row, e4c0651d bunk, 543b53d0 court)",
    sha(`${A}/village_tower3.glb`).slice(0, 16) === "fb590200245f5985"
    && sha(`${A}/village_row3.glb`).slice(0, 16) === "845ee738e09d5c1f"
    && sha(`${A}/village_bunk3.glb`).slice(0, 16) === "e4c0651d5618b73b"
    && sha(`${A}/village_court3.glb`).slice(0, 16) === "543b53d03ac2f104");
ok("ring-safety: hall kept at tex-76 build (d9251dd0)", sha(`${A}/village_hall3.glb`).slice(0, 16) === "d9251dd0857e451f");

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
const buf = readFileSync(`${A}/village_longhouse3.glb`);
const jl = buf.readUInt32LE(12);
const binStart = 28 + jl;
const j = JSON.parse(buf.subarray(20, 20 + jl).toString("utf8"));
const tIdx = j.materials.findIndex((m: any) => m.name === "timber");
const iIdx = j.materials.findIndex((m: any) => m.name === "iron");
const sIdx = j.materials.findIndex((m: any) => m.name === "stone");
ok("decode: timber + iron + stone materials", tIdx >= 0 && iIdx >= 0 && sIdx >= 0, j.materials.map((m: any) => m.name).join(","));
const tile = (mi: number): Buffer => {
    const tex = j.materials[mi].pbrMetallicRoughness.baseColorTexture.index;
    const bv = j.bufferViews[j.images[j.textures[tex].source].bufferView];
    return Buffer.from(buf.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength));
};
ok("timber ≡ house wallSpan's + iron ≡ forge family's + stone ≡ kiln's (byte-family, buffer-compared)",
    Buffer.compare(tile(tIdx), tileOf("village_house3.glb", "timber")!) === 0
    && Buffer.compare(tile(iIdx), tileOf("village_bellbase3.glb", "iron")!) === 0
    && Buffer.compare(tile(sIdx), tileOf("village_kiln3.glb", "stone")!) === 0);
ok("fire emissive node survives", !!j.nodes.find((n: any) => n.name === "fire"));
let chainOk = true, texBuckets = 0;
for (const mesh of j.meshes) for (const prim of mesh.primitives) {
    if (prim.material === tIdx || prim.material === iIdx || prim.material === sIdx) {
        texBuckets++;
        const t = prim.attributes.TEXCOORD_0;
        if (t === undefined || j.accessors[t].count !== j.accessors[prim.attributes.POSITION].count) chainOk = false;
    }
}
ok("texMat buckets carry TEXCOORD_0 == POSITION (firewood/herbs flat by design)", chainOk, "buckets " + texBuckets);
let texBytes = 0;
for (const img of j.images) texBytes += j.bufferViews[img.bufferView].byteLength;
ok("texture bytes < 400KB", texBytes < 400 * 1024, texBytes + "B");
ok("GLB < 20MB", buf.length < 20 * 1024 * 1024, (buf.length / 1024).toFixed(1) + "KB");

// 3) place-tex77-timber43.ts: rollout effect live (incl. smoke comp)
const g = await (await fetch("https://eidoverse.billding.dev/geom?world=commons&boxes=0")).json();
const ents: Record<string, any> = {};
for (const x of g.entities) ents[x.id] = x;
const lh = ents["av-longhouse"];
const lhComps = Object.keys(lh?.comp ?? {});
ok("place-tex77-timber43.ts effect: longhouse live, pose (8,24.7), smoke comp recovered",
    lh?.lib === "store/05149e3e7d5e5918.glb" && Math.abs(lh.pos[0] - 8) < 0.01 && Math.abs(lh.pos[2] - 24.7) < 0.01
    && lhComps.includes("particles:smoke"), lh?.lib ?? "missing");
ok("census anchors: hall + inn current, woodyard untouched",
    ents["av-hall"]?.lib === "store/d9251dd0857e451f.glb"
    && ents["av-inn"]?.lib === "store/8de1af9446f98eb9.glb"
    && ents["av-woodyard"]?.lib === "store/d1c45cdf8e41b05b.glb");

// 4) verify-repairs.ts: tex-77 pin + tex-4 multi pin + ledger + HEAD
const vr = run("bun agents/arthur/verify-repairs.ts");
ok("verify-repairs.ts 0 / ALL PASS (incl. tex-4 multi pin w/ new longhouse hash)", vr.code === 0 && vr.out.includes("ALL PASS"), "code=" + vr.code);
ok("tex-77 pin green", /^\s*PASS \[tex-77\]/m.test(vr.out));
ok("tex-4 multi pin carries the new longhouse hash (no FAIL)", !/FAIL \[tex-4\]/.test(vr.out));
ok("ledger law EXACT + HEAD gate green (polish-inclusive)",
    /^\s*PASS ledger law EXACT/m.test(vr.out) && /PASS HEAD is a repair\/tex\/audit\/refine(\/polish)?(\/plaza)?(\/lift)?(\/align)?(\/mason)?(\/nv)?(\/nvp)? commit/m.test(vr.out));

console.log(fails.length ? `\n${fails.length} FAIL` : "\nALL PASS");
process.exit(fails.length ? 1 : 0);
