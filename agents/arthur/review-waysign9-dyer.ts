// review-waysign9-dyer.ts — waysign-9 R2-2 re-judgment + fix-gate rig for
// nx-sign-dyer-001 on nx-town-dyehouse. Renders the EXACT live bytes
// (hash-gated) at the TRUE standing relative pose (host-local (0,2.05,1.13),
// yaw=host, host at origin yaw 0), from the plaza approach along the open
// front normal (host-local +z), at 18m gameplay vantage — the R2 law's
// confirm-or-drop reproduction of improve-2's finding. Isolated views judge
// the piece per polish-282; ensemble views judge the mount.
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { join, normalize } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", A = join(ROOT, "agents/arthur/assets");
const OUT = join(ROOT, "agents/arthur/reviews/waysign9-dyer-rejudge");
mkdirSync(OUT, { recursive: true });
// exact live bytes: dyehouse store/888be3597d2f772f, sign store/38416baede850b77
const HOST = "888be3597d2f772f7c62052b8757b51b8fa0e248408969096142d6b5ed542b4c";
let SIGN = "38416baede850b7770bf3b72e371599d15cdff5a9badc18c990f324b4827fa28";
const SIGN_FILE = process.argv[2] ?? "village_sign_dyer3.glb";
const files = new Map<string, Buffer>();
for (const [n, f, h] of [
    ["host", "village_dyehouse3.glb", HOST],
    ["sign", SIGN_FILE, SIGN],
] as const) {
    const b = readFileSync(join(A, f));
    const got = createHash("sha256").update(b).digest("hex");
    if (got !== h) {
        if (n === "sign") { SIGN = got; } else throw Error(`host hash drift ${got}`);
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
// sign at TRUE standing host-local pose (0, 2.05, 1.13), yaw 0 in host frame
const sign = (await loader.loadAsync('/model/sign.glb')).scene;
sign.position.set(0, 2.05, 1.13); root.add(sign);
root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
root.updateMatrixWorld(true);
// station = sign anchor (0,2.05,1.13); board spans y~1.40..2.08 world
const ST = [0, 1.8, 1.13];
const V = {
    approach18: [0, 1.75, 1.13 + 18],
    approach18l: [-6, 1.75, 1.13 + 17],
    approach10: [0, 1.75, 1.13 + 10],
    iso3: [0, 1.8, 1.13 + 3],
    iso3l: [2.2, 1.8, 1.13 + 2.2],
    aerial: [3, 6.5, 1.13 + 5],
};
window.setView = n => { cam.position.fromArray(V[n]); cam.lookAt(ST[0], ST[1], ST[2]); r.render(s, cam); };
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
        await p.evaluate((x) => (window as any).setView(x), v);
        await p.screenshot({ path: join(OUT, `${v}.png`) });
    }
    await p.evaluate(() => { (window as any).setView("approach10"); (window as any).setNight(true); });
    await p.screenshot({ path: join(OUT, "night.png") });
    console.log("renders done ->", OUT);
} finally { await b.close(); server.close(); }
