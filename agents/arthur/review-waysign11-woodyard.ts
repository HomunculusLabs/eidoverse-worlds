// review-waysign11-woodyard.ts — waysign-11 R2-4 re-judgment + fix-gate rig
// for nx-sign-woodyard-001 on nx-town-woodyard (3-sided open shed, TRUE
// HANGING idiom under the front eave). Renders the EXACT live bytes
// (hash-gated): sign 58f5cbe3 (or candidate via argv[2]); host geometry =
// local rebuild 5ad78870 — the live host lib 1f2c6f59 is an intentional
// old-gen tex-85 freeze (interior-19); local rebuild DECODES IDENTICAL to
// the live census bbox on all axes (verified this tick), so positions are
// TRUE; only the host texture differs (disclosed in every judgment).
// Relative poses (census-derived): sign host-local (0,2.05,1.25) yaw=host;
// b11 rider back wall host-local z −0.80 (rendered but behind the shed's
// back wall — out of view). Vantage = the plaza working-edge approach
// along host-local +z (open front). 18m views reproduce improve-2's
// finding; iso views judge the piece (polish-282); alone view for
// isolated judgment.
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { join, normalize } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", A = join(ROOT, "agents/arthur/assets");
const OUT = join(ROOT, "agents/arthur/reviews/waysign11-woodyard-rejudge");
mkdirSync(OUT, { recursive: true });
let SIGN = "58f5cbe3272aa7a87a6fe8ae0d6e825d2e42b3809592a94b5e923710aff25f11";
const SIGN_FILE = process.argv[2] ?? "village_sign_woodyard3.glb";
const files = new Map<string, Buffer>();
for (const [n, f, h] of [
    ["host", "village_woodyard3.glb", "5ad78870d4e978b7d8486315879e18c9247972cde599126540708c6534fc2731"],
    ["sign", SIGN_FILE, SIGN],
] as const) {
    const b = readFileSync(join(A, f));
    const got = createHash("sha256").update(b).digest("hex");
    if (!got.startsWith(h)) {
        if (n === "sign") { SIGN = got; } else throw Error(`${n} hash drift ${got}`);
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
sign.position.set(0, 2.05, 1.25); root.add(sign);
root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
root.updateMatrixWorld(true);
// station = board center host-local (0, 1.60, 1.435); board spans y 1.4..1.8, z 1.415..1.465
const ST = [0, 1.60, 1.435];
const V = {
    approach18: [0, 1.6, 1.44 + 18],
    approach18l: [-6, 1.6, 1.44 + 17],
    approach10: [0, 1.6, 1.44 + 10],
    iso3: [0, 1.7, 1.44 + 3],
    iso3l: [2.2, 1.7, 1.44 + 2.2],
    aerial: [3, 6.5, 1.44 + 5],
    alone3: [0, 1.6, 1.44 + 2.6],
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
    for (const v of ["approach18", "approach18l", "approach10", "iso3", "iso3l", "aerial"]) {
        await p.evaluate((x) => (window as any).setView(x, false), v);
        await p.screenshot({ path: join(OUT, `${v}.png`) });
    }
    await p.evaluate(() => (window as any).setView("alone3", true));
    await p.screenshot({ path: join(OUT, "alone3.png") });
    await p.evaluate(() => { (window as any).setView("approach10", false); (window as any).setNight(true); });
    await p.screenshot({ path: join(OUT, "night.png") });
    console.log("renders done ->", OUT);
} finally { await b.close(); server.close(); }
