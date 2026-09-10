// struct135-texprobe-enneper.ts — decode-side verification of the struct-135
// bone texture cure (not geometry): extract the ep_bone PNG from the accepted
// GLB and assert (a) exactly the 3 calm tones, (b) cell-64 block quantization
// (2x2 downsampled picks are constant per 64-block), (c) tone spread <= 10
// per channel. The fix's whole claim is "the skin reads as ONE continuous
// sheet" — this proves the bytes carry that law.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import zlib from "node:zlib";

const bytes = readFileSync("agents/arthur/assets/village_enneper3.glb");
const sha = createHash("sha256").update(bytes).digest("hex");
if (sha !== "18b3613901eeba4753f6167be9b4dffc98122d4b57960970a15b334f52fa3c8e") throw Error("sha drift");

// parse GLB, find the image with the ep_bone-sized... simplest: find material
// named ep_bone -> its texture's image view; but images are unnamed — use the
// sampler/source index order. Robust approach: decode EVERY image, and the
// one whose tone set == {0xd8d2c4, 0xd5cfc0, 0xd2ccbb} is ep_bone; assert
// exactly one image matches and it obeys the cell law.
const jsonLen = bytes.readUInt32LE(12);
const json = JSON.parse(bytes.subarray(20, 20 + jsonLen).toString("utf8"));
const binStart = 20 + jsonLen + 8;
const views: any[] = json.bufferViews ? json.images.map((im: any) => {
    const bv = json.bufferViews[im.bufferView];
    return bytes.subarray(binStart + bv.byteOffset, binStart + bv.byteOffset + bv.byteLength);
}) : [];

function decodePNG(buf: Buffer): { w: number; h: number; rgba: Uint8Array } {
    let off = 8, w = 0, h = 0, idat: Buffer[] = [], ctype = -1;
    while (off < buf.length) {
        const len = buf.readUInt32BE(off), type = buf.subarray(off + 4, off + 8).toString("ascii");
        const data = buf.subarray(off + 8, off + 8 + len);
        if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ctype = data[9]; }
        if (type === "IDAT") idat.push(data);
        off += 12 + len;
    }
    if (ctype !== 6) throw Error(`unexpected color type ${ctype}`);
    const raw = zlib.inflateSync(Buffer.concat(idat));
    const rgba = new Uint8Array(w * h * 4);
    let p = 0;
    for (let y = 0; y < h; y++) {
        const filter = raw[p++];
        const row = raw.subarray(p, p + w * 4); p += w * 4;
        const prev = y > 0 ? rgba.subarray((y - 1) * w * 4, y * w * 4) : new Uint8Array(w * 4);
        for (let x = 0; x < w * 4; x++) {
            const a = x >= 4 ? rgba[y * w * 4 + x - 4] : 0;
            const b = prev[x];
            const c = x >= 4 ? prev[x - 4] : 0;
            let v = row[x];
            if (filter === 1) v += a;
            else if (filter === 2) v += b;
            else if (filter === 3) v += (a + b) >> 1;
            else if (filter === 4) {
                const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
                v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
            }
            rgba[y * w * 4 + x] = v & 255;
        }
    }
    return { w, h, rgba };
}

const wantTones = new Set([0xd8d2c4, 0xd5cfc0, 0xd2ccbb]);
let found = 0, fails = 0;
const ck = (name: string, ok: boolean, detail = "") => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`); };

for (const [i, v] of views.entries()) {
    const { w, h, rgba } = decodePNG(v);
    const tones = new Set<number>();
    for (let p = 0; p < rgba.length; p += 4) tones.add((rgba[p] << 16) | (rgba[p + 1] << 8) | rgba[p + 2]);
    const match = tones.size === 3 && [...tones].every(t => wantTones.has(t));
    if (!match) continue;
    found++;
    ck(`image ${i} is ep_bone with the 3 calm tones`, true, [...tones].map(t => t.toString(16)).join(","));
    // tone spread law
    const arr = [...tones];
    const ch = (k: number) => Math.max(...arr.map(t => (t >> k) & 255)) - Math.min(...arr.map(t => (t >> k) & 255));
    ck("tone spread <= 10 per channel", ch(16) <= 10 && ch(8) <= 10 && ch(0) <= 10, `Δr${ch(16)} Δg${ch(8)} Δb${ch(0)}`);
    // cell-64 law: within any 64x64 block, picks are constant (block-quantized)
    let constBlocks = 0, totBlocks = 0;
    for (let by = 0; by < h; by += 64) for (let bx = 0; bx < w; bx += 64) {
        const s = new Set<number>();
        for (let y = by; y < Math.min(by + 64, h); y++) for (let x = bx; x < Math.min(bx + 64, w); x++)
            s.add((rgba[(y * w + x) * 4] << 16) | (rgba[(y * w + x) * 4 + 1] << 8) | rgba[(y * w + x) * 4 + 2]);
        totBlocks++; if (s.size === 1) constBlocks++;
    }
    ck("cell-64 block quantization (>=98% constant blocks)", constBlocks / totBlocks >= 0.98, `${constBlocks}/${totBlocks}`);
    // distinct-block tone distribution across the tile (the mottle exists)
    const blockTones = new Set<number>();
    for (let by = 0; by < h; by += 64) for (let bx = 0; bx < w; bx += 64)
        blockTones.add((rgba[(by * w + bx) * 4] << 16) | (rgba[(by * w + bx) * 4 + 1] << 8) | rgba[(by * w + bx) * 4 + 2]);
    ck("mottle present (all 3 tones used across blocks)", blockTones.size === 3, `${blockTones.size} tones`);
}
ck("exactly one ep_bone image", found === 1, `${found} matches of ${views.length} images`);
console.log(fails === 0 ? "ALL PASS" : `${fails} FAILS`);
process.exit(fails === 0 ? 0 : 1);
