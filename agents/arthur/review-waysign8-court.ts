// review-waysign8-court.ts — waysign-8 ensemble gate: smithy sign v2 (62a8c7fc)
// mounted on the LIVE court bytes (59534b10) at the TRUE standing relative
// pose (court-local (6.131, -1.399), yaw 0 in court frame), viewed from the
// plaza approach (+z court side). Falsifies: plate flush-mount, board clear
// of wall clutter, glyph readable in context.
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { join, normalize } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", A = join(ROOT, "agents/arthur/assets");
const OUT = join(ROOT, "agents/arthur/reviews/waysign8-smithy-rejudge");
mkdirSync(OUT, { recursive: true });
const COURT = "59534b10122e6b476996f619476328d7dd8c0ea090f6107747020b1b646b4d89"; // live nx-court
const SIGN = "62a8c7fc94ff77ff9a443b51efe7f04cbf68016037498e556cb0b45c4a07822d"; // waysign-8 v2
const files = new Map<string, Buffer>();
for (const [n, f, h] of [
    ["court", "village_court3.glb", COURT],
    ["sign", "village_sign_smithy.glb", SIGN],
] as const) {
    const b = readFileSync(join(A, f));
    if (createHash("sha256").update(b).digest("hex") !== h) throw Error(`${n} hash drift`);
    files.set(n, b);
}
const THREE_ROOT = join(ROOT, "node_modules/three");
const threeModule = join(THREE_ROOT, "build/three.module.js");
const html = `<!doctype html><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
r.setSize(960, 720); r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = true; document.body.appendChild(r.domElement);
const s = new THREE.Scene(); s.background = new THREE.Color(0xcbd6df);
const cam = new THREE.PerspectiveCamera(42, 960 / 720, .05, 200);
const hemi = new THREE.HemisphereLight(0xffffff, 0x48505a, 2); s.add(hemi);
const amb = new THREE.AmbientLight(0xffffff, .45); s.add(amb);
const sun = new THREE.DirectionalLight(0xfff1d4, 3.2); sun.position.set(8, 12, 6); sun.castShadow = true; s.add(sun);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: 0x7f8d70, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; s.add(ground);
const root = new THREE.Group(); s.add(root);
const loader = new GLTFLoader();
// court at origin yaw 0; sign at TRUE court-local pose (6.131, -1.399), yaw 0
const specs = [
    { n: 'court', x: 0, z: 0, yaw: 0 },
    { n: 'sign', x: 6.131, z: -1.399, yaw: 0 },
];
for (const q of specs) {
    const g = (await loader.loadAsync('/model/' + q.n + '.glb')).scene;
    g.position.set(q.x, 0, q.z); g.rotation.y = q.yaw;
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    root.add(g);
}
root.updateMatrixWorld(true);
// views from the plaza (+z) side, sign station (6.131, ~2.2, -1.399)
const V = {
    approach10: [6.131, 1.75, -1.399 + 10],
    approach18: [6.131, 1.75, -1.399 + 18],
    "approach10-angled": [6.131 + 4, 1.75, -1.399 + 9],
    broad: [6.131 + 14, 3.2, -1.399 + 14],
};
window.setView = n => { cam.position.fromArray(V[n]); cam.lookAt(6.131, 2.1, -1.399); r.render(s, cam); };
window.setNight = on => { s.background.set(on ? 0x111827 : 0xcbd6df); hemi.intensity = on ? .18 : 2; amb.intensity = on ? .04 : .45; sun.intensity = on ? .15 : 3.2; r.render(s, cam); };
window.setView('approach10'); window.ready = true;
</script>`;
const server = createServer((req, res) => {
    const u = (req.url ?? "/").split("?")[0];
    try {
        if (u === "/" || u === "/index.html") { res.setHeader("content-type", "text/html"); res.end(html); return; }
        if (u === "/three.module.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(threeModule)); return; }
        if (u === "/three.core.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(join(THREE_ROOT, "build/three.core.js"))); return; }
        if (u.startsWith("/examples/jsm/")) {
            const p = join(THREE_ROOT, normalize(u.slice(1)));
            let x = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
            res.setHeader("content-type", "text/javascript"); res.end(x); return;
        }
        const m = u.match(/^\/model\/(.+)\.glb$/);
        if (m && files.has(m[1])) { res.setHeader("content-type", "model/gltf-binary"); res.end(files.get(m[1])); return; }
        res.statusCode = 404; res.end("not found");
    } catch (e) { res.statusCode = 500; res.end(String(e)); }
});
await new Promise<void>(q => server.listen(0, "127.0.0.1", q));
const addr: any = server.address();
const b = await chromium.launch({ headless: true });
try {
    const p = await b.newPage({ viewport: { width: 960, height: 720 } });
    p.on("pageerror", e => console.error("PAGEERROR", e.message));
    await p.goto(`http://127.0.0.1:${addr.port}/`, { waitUntil: "networkidle" });
    await p.waitForFunction(() => (window as any).ready === true);
    for (const v of ["approach10", "approach10-angled", "approach18", "broad"]) {
        await p.evaluate((x) => (window as any).setView(x), v);
        await p.screenshot({ path: join(OUT, `ensemble-${v.replace(/ /g, "-")}.png`) });
    }
    await p.evaluate(() => { (window as any).setView("approach10"); (window as any).setNight(true); });
    await p.screenshot({ path: join(OUT, "ensemble-night.png") });
    console.log("ensemble renders done");
} finally { await b.close(); server.close(); }
