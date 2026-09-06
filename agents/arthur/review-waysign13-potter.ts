// review-waysign13-potter.ts — waysign-13 R2-6 re-judgment + fix-gate rig
// for nx-sign-potter-001 on nx-town-potter (PLANTED-POST open-yard idiom,
// between the b3 ruled-porch's two +z posts). Renders EXACT bytes,
// hash-gated: sign bc05a4f3 (or candidate via argv[2]); host
// village_potter3.glb (source hash-matches live lib dad7c82e this tick —
// positions TRUE); sibling artwalk b3 ruled-porch village_artwalk_b3.glb
// at host-local [1.55,0,0.351] (census-derived this tick, artwalk-39 law;
// b3 yaw = host yaw so no relative rotation). Sign census pose decomposes
// to host-local [1.498,0,3.100] (yaw = host). Vantage = the plaza-to-
// craft-edge walk: host-local +z is the plaza-facing front; camera from +z.
// 18m views reproduce improve-2's finding; iso views judge the piece
// (polish-282); alone view for isolated judgment; night for area-light read.
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { join, normalize } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", A = join(ROOT, "agents/arthur/assets");
const OUT = join(ROOT, "agents/arthur/reviews/waysign13-potter/rejudge");
mkdirSync(OUT, { recursive: true });
let SIGN = "bc05a4f316d9655810176c22c0c3998db831a90c09de2f19141df693cd88d679";
const SIGN_FILE = process.argv[2] ?? "village_sign_potter3.glb";
const files = new Map<string, Buffer>();
for (const [n, f, h] of [
    ["host", "village_potter3.glb", "dad7c82efbf3202b72371d83c8432e1a2e3f06d8b7eda0af25aa61d818a3c742"],
    ["b3", "village_artwalk_b3.glb", "e1b66075d8e911e7e5c557c48d7e267253c15291d9299d62ce2db9b5a63773fb"],
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
const b3 = (await loader.loadAsync('/model/b3.glb')).scene; b3.position.set(1.550, 0, 0.351); root.add(b3);
const sign = (await loader.loadAsync('/model/sign.glb')).scene;
sign.position.set(1.498, 0, 3.100); root.add(sign);
root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
root.updateMatrixWorld(true);
// station = sign board glyph face center host-local: board center (1.498,1.89,3.655), glyph plane z≈3.735
const ST = [1.498, 1.89, 3.735];
const V = {
    approach18: [1.498, 1.85, 3.735 + 18],
    approach18l: [-4.5, 1.85, 3.735 + 17],
    approach18r: [7.5, 1.85, 3.735 + 17],
    approach10: [1.498, 1.85, 3.735 + 10],
    iso3: [1.498, 1.95, 3.735 + 3],
    iso3l: [-0.7, 1.95, 3.735 + 2.2],
    aerial: [0.5, 6.5, 3.735 + 5],
    alone3: [1.498, 1.9, 3.735 + 2.6],
};
window.setView = (n, alone) => {
    host.visible = !alone; b3.visible = !alone;
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
