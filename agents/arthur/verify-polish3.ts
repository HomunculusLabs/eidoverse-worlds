// verify-polish3.ts — persistent verifier for polish-3 (spectator-distance
// paint separation). Decodes the staged carousel GLB's paint tiles and
// asserts pairwise luminance gaps wide enough to read under fog at
// gameplay distance. Run: bun agents/arthur/verify-polish3.ts
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const GLB = `${ROOT}/agents/arthur/assets/village_carousel3.glb`;
let pass = 0, fail = 0;
const ck = (n: string, c: boolean, d = "") => { if (c) pass++; else { fail++; console.log("FAIL:", n, d); } };

// 1. deterministic rebuild at the staged pin
const build = spawnSync("bun", [`${ROOT}/agents/arthur/assets/mkcarousel.ts`], { cwd: ROOT, encoding: "utf8" });
if (build.status !== 0) { console.log("FAIL: rebuild", build.stderr); process.exit(1); }
const h = createHash("sha256").update(readFileSync(GLB)).digest("hex").slice(0, 16);
ck("deterministic staged build 7ac6d8a63a290cae", h === "7ac6d8a63a290cae", h);

// 2. decode paint tile luminances (RGBA PNG, filter-aware)
const b = readFileSync(GLB);
const lum = (s: number): number => {
    let pos = s + 8, idat: Buffer[] = [], w = 0, hgt = 0;
    while (pos < b.length - 8) {
        const len = b.readUInt32BE(pos), typ = b.toString("ascii", pos + 4, pos + 8);
        if (typ === "IEND") break;
        if (typ === "IHDR") { w = b.readUInt32BE(pos + 8); hgt = b.readUInt32BE(pos + 12); }
        if (typ === "IDAT") idat.push(b.subarray(pos + 8, pos + 8 + len));
        pos += 12 + len;
    }
    const zlib = require("node:zlib");
    const raw = zlib.inflateSync(Buffer.concat(idat));
    const bpp = 4, stride = w * bpp;
    let R = 0, G = 0, B = 0, n = 0;
    const prev = new Uint8Array(stride), row = new Uint8Array(stride);
    for (let y = 0; y < hgt; y++) {
        const f = raw[y * (stride + 1)];
        row.set(raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride));
        for (let x = 0; x < stride; x++) {
            const a = x >= bpp ? row[x - bpp] : 0, bb = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
            let v = row[x];
            if (f === 1) v = (v + a) & 255; else if (f === 2) v = (v + bb) & 255; else if (f === 3) v = (v + ((a + bb) >> 1)) & 255;
            else if (f === 4) { const p = a + bb - c, pa = Math.abs(p - a), pb = Math.abs(p - bb), pc = Math.abs(p - c); v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? bb : c)) & 255; }
            row[x] = v;
        }
        for (let x = 0; x < stride; x += bpp) { R += row[x]; G += row[x + 1]; B += row[x + 2]; n++; }
        prev.set(row);
    }
    return (0.2126 * R + 0.7152 * G + 0.0722 * B) / n / 255;
};
// images are stored in texMat-declaration order
const sigs: number[] = [];
for (let i = 0; i < b.length - 8; i++) if (b[i] === 0x89 && b[i + 1] === 0x50 && b[i + 2] === 0x4e && b[i + 3] === 0x47) sigs.push(i);
const names = ["carousel_wood", "carousel_bone_paint", "carousel_blanket", "carousel_gold_paint", "carousel_blue_paint", "carousel_fabric"];
ck("6 image tiles present", sigs.length === 6, String(sigs.length));
const L: Record<string, number> = {};
names.forEach((nm, i) => { L[nm] = lum(sigs[i]); });
console.log("tile lums:", Object.entries(L).map(([k, v]) => `${k}=${v.toFixed(2)}`).join(" "));

// 3. the polish-3 law: pairwise paint gaps >= 0.20 luminance, warm/cool split
const gap = (a: string, b2: string) => Math.abs(L[a] - L[b2]);
ck("gold-bone gap >= 0.20", gap("carousel_gold_paint", "carousel_bone_paint") >= 0.20, String(gap("carousel_gold_paint", "carousel_bone_paint")));
ck("gold-blue gap >= 0.20", gap("carousel_gold_paint", "carousel_blue_paint") >= 0.20, String(gap("carousel_gold_paint", "carousel_blue_paint")));
ck("bone-blue gap >= 0.20", gap("carousel_bone_paint", "carousel_blue_paint") >= 0.20, String(gap("carousel_bone_paint", "carousel_blue_paint")));
ck("bone is the lightest family", L["carousel_bone_paint"] > L["carousel_gold_paint"] && L["carousel_bone_paint"] > L["carousel_blue_paint"]);
ck("blue is the darkest paint family", L["carousel_blue_paint"] < L["carousel_gold_paint"] && L["carousel_blue_paint"] < L["carousel_bone_paint"]);
ck("untouched families stable (wood/fabric within muted band)", L["carousel_wood"] < 0.40 && L["carousel_fabric"] < 0.40);

// 4. node count unchanged (paint-only change: 177)
const jlen = b.readUInt32LE(12);
const j = JSON.parse(b.slice(20, 20 + jlen).toString());
ck("node count still 177 (paint-only)", j.nodes.length === 177, String(j.nodes.length));

// 5. the polish-1 lift still holds end-to-end
const v1 = spawnSync("bun", [`${ROOT}/agents/arthur/verify-polish1.ts`], { cwd: ROOT, encoding: "utf8" });
ck("verify-polish1 (roof lift) still green", v1.status === 0, v1.stdout.trim().split("\n").pop() ?? "");

console.log(`polish-3 paint separation: ${pass} PASS ${fail} FAIL`);
process.exit(fail ? 1 : 0);
