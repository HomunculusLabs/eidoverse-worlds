// fauna23-pixel-probe.ts — settle the left-view "near-black" dispute with
// real pixel values (fauna-11 law e: A/B isolation probe for shading
// reads). Loads each review PNG into a headless page and samples the
// donkey body band rows, printing luminance populations.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const files = ["new-left.png", "new-right.png", "new-gameplay.png"].map(f =>
  resolve("agents/arthur/reviews/fauna23-donkey", f));

const server = createServer((req, res) => {
  const url = (req.url ?? "/").split("?")[0];
  if (url === "/") { res.writeHead(200, { "content-type": "text/html" }); return res.end("<canvas id=c width=960 height=720></canvas>"); }
  const idx = parseInt(url.slice(1), 10);
  if (!isNaN(idx) && files[idx]) { res.writeHead(200, { "content-type": "image/png" }); return res.end(readFileSync(files[idx])); }
  res.writeHead(404); res.end();
});
await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
const port = (server.address() as any).port;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
for (let i = 0; i < files.length; i++) {
  const out = await page.evaluate(async (idx: number) => {
    const img = new Image();
    img.src = `/${idx}`;
    await img.decode();
    const c = document.getElementById("c") as HTMLCanvasElement;
    const x = c.getContext("2d")!;
    x.drawImage(img, 0, 0);
    // body band rows: sample the animal band (rows 380-560) center columns
    const stats: any = {};
    for (const [label, y0, y1] of [["band-upper", 300, 430], ["band-body", 430, 560], ["band-lower", 560, 650]] as const) {
      const d = x.getImageData(200, y0, 560, y1 - y0).data;
      let n = 0, dark = 0, mid = 0, light = 0, lsum = 0;
      const lums: number[] = [];
      for (let p = 0; p < d.length; p += 4) {
        const r = d[p], g = d[p + 1], b = d[p + 2];
        const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        // skip sky background (light blue-gray > 190) and ground green
        if (l > 200) continue;
        if (g > r + 18 && g > b + 18) continue; // green meadow
        if (b > r + 12) continue; // sky/gray
        n++; lsum += l; lums.push(l);
        if (l < 60) dark++; else if (l < 130) mid++; else light++;
      }
      lums.sort((a, b) => a - b);
      stats[label] = {
        subjectPx: n, meanLum: n ? +(lsum / n).toFixed(1) : null,
        p10: lums.length ? lums[Math.floor(lums.length * 0.1)].toFixed(0) : null,
        median: lums.length ? lums[Math.floor(lums.length / 2)].toFixed(0) : null,
        p90: lums.length ? lums[Math.floor(lums.length * 0.9)].toFixed(0) : null,
        dark: dark, mid: mid, light: light,
      };
    }
    return stats;
  }, i);
  console.log(files[i].split("/").pop(), JSON.stringify(out));
}
await browser.close();
server.close();
