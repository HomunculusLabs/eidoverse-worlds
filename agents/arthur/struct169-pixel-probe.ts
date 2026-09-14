// struct169-pixel-probe.ts — deterministic pixel measurement of the review
// renders via playwright canvas readback. Vision (fallback) claimed the disk
// interior is see-through stipple; pixels outrank that claim.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const targets: Array<[string, string, number, number, number]> = [
    // [label, png path, cx, cy, rMax]
    ["TOP disk interior", "agents/arthur/reviews/struct169-monkeysaddle/top.png", 481, 357, 160],
];
const control = process.argv[2] ?? "";

const browser = await chromium.launch();
const page = await browser.newPage();

async function probe(label: string, png: string, cx: number, cy: number, rMax: number) {
    const b64 = readFileSync(png).toString("base64");
    const res = await page.evaluate(async ({ b64, cx, cy, rMax }) => {
        const img = new Image();
        img.src = "data:image/png;base64," + b64;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const bgSky = [203, 214, 223], bgGround = [127, 141, 112];
        let n = 0, sky = 0, ground = 0, timber = 0, dark = 0, other = 0;
        for (let dy = -rMax; dy <= rMax; dy += 4) {
            for (let dx = -rMax; dx <= rMax; dx += 4) {
                if (dx * dx + dy * dy > rMax * rMax) continue;
                const x = Math.round(cx + dx), y = Math.round(cy + dy);
                if (x < 0 || y < 0 || x >= img.width || y >= img.height) continue;
                const [R, G, B] = [0, 1, 2].map(i => ctx.getImageData(x, y, 1, 1).data[i]);
                n++;
                const d = (a: number[]) => Math.hypot(R - a[0], G - a[1], B - a[2]);
                if (d(bgSky) < 25) sky++;
                else if (d(bgGround) < 30) ground++;
                else if (R > 100 && R > B + 12 && G > 80) timber++;
                else if (R + G + B < 210) dark++;
                else other++;
            }
        }
        return { n, sky, ground, timber, dark, other };
    }, { b64, cx, cy, rMax });
    const pct = (v: number) => ((100 * v) / res.n).toFixed(1) + "%";
    console.log(`${label}: ${res.n} px — timber ${pct(res.timber)}, ground ${pct(res.ground)}, sky ${pct(res.sky)}, dark ${pct(res.dark)}, other ${pct(res.other)}`);
}

for (const [label, png, cx, cy, r] of targets) await probe(label, png, cx, cy, r);
if (control) {
    // control frame: same rig, an ACCEPTED film sibling (enneper) — if it reads
    // see-through too, the class is rig/presentation, not this build.
    await probe("CONTROL (accepted sibling, same rig)", control, 480, 330, 120);
}
await browser.close();
console.log("PROBE DONE");
