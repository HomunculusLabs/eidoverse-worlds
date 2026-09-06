// review-waysign14-bakery.ts — waysign-14 R2-7 re-judgment + fix-gate rig
// for nx-sign-bakery on the nx-court WEST end wall (heritage blade sign,
// mirror of the smithy's east placement). Renders EXACT bytes, hash-gated:
// sign 599194ee (baseline) or candidate via argv[2]; host village_court3.glb
// (source hash-matches live lib 59534b10 this tick — positions TRUE).
// Sign census pose [14.022736,0,-18.768525] yaw 2.234033 decomposes to
// court-local (-6.130, 1.399), relative yaw = pi exactly (blade arm off
// the end wall, front face normal court-local -z). Station = glyph center
// court-local (-6.580, 2.07, 1.309). Vantage = the bakery court path from
// the south (next-walk-core-paths court-bakery leg) — camera from -z.
// 18m views reproduce improve-2's finding; iso views judge the piece
// (polish-282); alone view for isolated judgment; night for area-light read.
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { join, normalize } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", A = join(ROOT, "agents/arthur/assets");
const OUT = join(ROOT, "agents/arthur/reviews/waysign14-bakery/rejudge");
mkdirSync(OUT, { recursive: true });
let SIGN = "599194ee7f4efd810735f59b1e2d686797a2c29b65249fdc958913619f8ec85c";
const SIGN_FILE = process.argv[2] ?? "village_sign_bakery.glb";
const files = new Map<string, Buffer>();
for (const [n, f, h] of [
    ["host", "village_court3.glb", "59534b10122e6b476996f619476328d7dd8c0ea090f6107747020b1b646b4d89"],
    ["sign", SIGN_FILE, SIGN],
] as const) {
    const b = readFileSync(join(A, f));
    const got = createHash("sha256").update(b).digest("hex");
    if (!got.startsWith(h)) {
        if (n === "sign") { SIGN = got; } else { throw Error(`${n} hash drift ${got}`); }
    }
    files.set(n, b);
}
console.log("sign bytes sha:", SIGN.slice(0, 16));
const THREE_ROOT = join(ROOT, "node_modules/three");
const threeModule = join(THREE_ROOT, "build/three.module.js");
const html = `<!doctype html><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style><script type="module">
import * as THREE from '/three.module.js'; import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
r.setSize(960, 720); r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = true; document.body.appendChild(r.domElement);
const s = new THREE.Scene(); s.background = new THREE.Color(0xcbd6df);
const cam = new THREE.PerspectiveCamera(42, 960 / 720, .05, 200);
const hemi = new THREE.HemisphereLight(0xffffff, 0x48505a, 2); s.add(hemi);
const amb = new THREE.AmbientLight(0xffffff, .45); s.add(amb);
const sun = new THREE.DirectionalLight(0xfff1d4, 3.2); sun.position.set(8, 12, 6); sun.castShadow = true; s.add(sun);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: 0x7f8d70, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; s.add(ground);
const loader = new GLTFLoader(); const root = new THREE.Group(); s.add(root);
const host = (await loader.loadAsync('/model/host.glb')).scene; root.add(host);
const sign = (await loader.loadAsync('/model/sign.glb')).scene;
sign.position.set(-6.130, 0, 1.399); sign.rotation.y = Math.PI; root.add(sign);
root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
root.updateMatrixWorld(true);
// station = sign glyph face center court-local: board center sign-local
// (0.45, 2.05, 0.065) front, glyph plane z~0.09 -> rotated pi: (-0.45, ., -0.09)
const ST = [-6.580, 2.07, 1.309];
const V = {
    approach18: [-6.580, 1.87, 1.309 - 18],
    approach18l: [-14.6, 1.87, 1.309 - 17],
    approach18r: [1.4, 1.87, 1.309 - 17],
    approach10: [-6.580, 1.90, 1.309 - 10],
    iso3: [-6.580, 2.0, 1.309 - 3.2],
    iso3l: [-10.2, 2.0, 1.309 - 2.0],
    aerial: [-4.0, 8.5, 1.309 - 7],
    alone3: [-6.580, 2.0, 1.309 - 2.6],
};
window.setView = (n, alone) => {
    host.visible = !alone;
    cam.position.fromArray(V[n]); cam.lookAt(ST[0], ST[1], ST[2]); r.render(s, cam);
};
window.setNight = on => { s.background.set(on ? 0x111827 : 0xcbd6df); hemi.intensity = on ? .18 : 2; amb.intensity = on ? .04 : .45; sun.intensity = on ? .15 : 3.2; r.render(s, cam); };
window.setView('approach18'); window.ready = true;
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
    for (const v of ["approach18", "approach18l", "approach18r", "approach10", "iso3", "iso3l", "aerial"]) {
        await p.evaluate((x) => (window as any).setView(x, false), v);
        await p.screenshot({ path: join(OUT, `${v}.png`) });
    }
    await p.evaluate(() => (window as any).setView("alone3", true));
    await p.screenshot({ path: join(OUT, "alone3.png") });
    await p.evaluate(() => { (window as any).setView("approach10", false); (window as any).setNight(true); });
    await p.screenshot({ path: join(OUT, "night.png") });
    console.log("renders done ->", OUT);
} finally { await b.close(); server.close(); }
