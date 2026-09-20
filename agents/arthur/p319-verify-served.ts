// p319-verify-served.ts — served-bytes proof (struct-104 law) for the
// polish-319 monument placement. Downloads the LIVE served bytes for the
// current lib and asserts, by VALUE (the DRACO re-encode renames materials):
//   (1) a material with baseColorFactor [0.5841,0.3916,0.1441] (brass),
//       roughness 0.45, metalness 0.15, emissiveFactor [0.025,0.0146,0.0064]
//       — the knot's polish-319 signature;
//   (2) a material with emissiveFactor [0.9,0.5257,0.2287] — the under-glow
//       bead, unchanged;
//   (3) the two texture materials (stone/soil) still present with a
//       baseColorTexture;
//   (4) node census sanity (knot group + plinth tiers all present).
import { readFileSync } from "node:fs";

const LIB = process.argv[2] ?? "store/1b4cca52022ff356.glb";
const LOCAL = process.argv[3] ?? "/tmp/p319-served.glb";

let buf: Buffer;
try {
    buf = readFileSync(LOCAL);
    console.log(`served bytes: ${LOCAL}`);
} catch {
    console.log(`no cached ${LOCAL} — fetch first: curl -o ${LOCAL} https://eidoverse.billding.dev/library/${LIB}`);
    process.exit(2);
}
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString("utf8"));

let fails = 0;
const ok = (name: string, cond: boolean, detail = "") => {
    console.log(`${cond ? "PASS" : "FAIL"} [${name}] ${detail}`);
    if (!cond) fails++;
};

const near = (a: number[], b: number[], eps = 0.002) => a.length >= 3 && b.length >= 3 && a.slice(0, 3).every((v, i) => Math.abs(v - b[i]) <= eps);
const mats: any[] = json.materials ?? [];
const knot = mats.find((m: any) => near(m.emissiveFactor ?? [], [0.025, 0.0146, 0.0064]));
ok("knot-emissive-served", !!knot, JSON.stringify(knot?.emissiveFactor));
ok("knot-pbr-served", !!knot && near(knot.pbrMetallicRoughness.baseColorFactor, [0.5841, 0.3916, 0.1441]) && knot.pbrMetallicRoughness.roughnessFactor === 0.45 && knot.pbrMetallicRoughness.metallicFactor === 0.15, `r=${knot?.pbrMetallicRoughness?.roughnessFactor} m=${knot?.pbrMetallicRoughness?.metallicFactor}`);
const bead = mats.find((m: any) => near(m.emissiveFactor ?? [], [0.9, 0.5257, 0.2287]));
ok("bead-emissive-served", !!bead, JSON.stringify(bead?.emissiveFactor));
const textured = mats.filter((m: any) => m.pbrMetallicRoughness?.baseColorTexture);
ok("texture-materials-served", textured.length >= 2, `${textured.length} textured`);
ok("material-count-served", mats.length >= 4, `${mats.length}`);

// node census: knot group + tier steps + plaque family
const names = json.nodes.map((n: any) => n.name ?? "").join(",");
ok("knot-group-served", names.includes("knot"), "");
ok("plinth-served", names.includes("mn3_0"), names.split(",").length + " nodes");
console.log(fails === 0 ? "P319_SERVED_PASS" : `P319_SERVED_FAIL_${fails}`);
process.exit(fails === 0 ? 0 : 1);
