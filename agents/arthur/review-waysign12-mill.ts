// review-waysign12-mill.ts — waysign-12 R2-5 re-judgment + fix-gate rig
// for nx-sign-mill-001 on nx-town-windmill (TRUE HANGING idiom under the
// mill-room ceiling slab rceil, north of the b10 crown). Renders EXACT
// bytes, hash-gated: sign 5b6a55bd (or candidate via argv[2]); host
// village_windmill3.glb (source hash-matches live lib 09938360 this tick
// — positions TRUE); sibling artwalk b10 four-wind-crown village_artwalk_b10.glb
// at host-local [0,2.22,2.62] (census-derived, artwalk-39 law). Relative
// poses (census): sign host-local (−1.6,2.78,2.5) yaw=host; millrace
// (struct lane) is world −z/south of the host — out of the rendered field.
// Vantage = the W road approach (world +x, host-local +z front face).
// 18m views reproduce improve-2's finding; iso views judge the piece
// (polish-282); alone view for isolated judgment.
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { join, normalize } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", A = join(ROOT, "agents/arthur/assets");
const OUT = join(ROOT, "agents/arthur/reviews/waysign12-mill/rejudge");
mkdirSync(OUT, { recursive: true });
let SIGN = "5b6a55bdea1c2316b5e21ab13c01b7723f6aff2af035da82f745f61c16feeb54";
const SIGN_FILE = process.argv[2] ?? "village_sign_mill3.glb";
const files = new Map<string, Buffer>();
for (const [n, f, h] of [
    ["host", "village_windmill3.glb", "0993836012d1b17d787178b7d58d68078218d90b17eda5822cb090a9a974f7eb"],
    ["b10", "village_artwalk_b10.glb", "8e55e366b5a289877ef7386fe04be3bef9e797b94b417a276fe06a94ba3a37d8"],
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
const b10 = (await loader.loadAsync('/model/b10.glb')).scene; b10.position.set(0, 2.22, 2.62); root.add(b10);
const sign = (await loader.loadAsync('/model/sign.glb')).scene;
sign.position.set(-1.6, 2.78, 2.5); root.add(sign);
root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
root.updateMatrixWorld(true);
// station = sign board center host-local (−1.6, 2.33, 2.6); board spans y 2.13..2.53, z 2.415..2.465
const ST = [-1.6, 2.33, 2.44];
const V = {
    approach18: [-1.6, 2.3, 2.44 + 18],
    approach18l: [-7.5, 2.3, 2.44 + 17],
    approach10: [-1.6, 2.3, 2.44 + 10],
    iso3: [-1.6, 2.4, 2.44 + 3],
    iso3l: [-3.8, 2.4, 2.44 + 2.2],
    aerial: [-3, 6.5, 2.44 + 5],
    alone3: [-1.6, 2.3, 2.44 + 2.6],
};
window.setView = (n, alone) => {
    host.visible = !alone; b10.visible = !alone;
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
