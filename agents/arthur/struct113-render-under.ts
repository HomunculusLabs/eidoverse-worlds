// struct113-render-under.ts — dedicated UNDER-view rig for the Voronoi
// Bower (struct-13 law: judge at the interaction distance the concept
// promises). Camera inside the bower (offset from the eye so the lens
// itself doesn't dominate), looking up at the coffered ceiling at the
// four diagonal post sightlines. review-model chassis, read-only.
// Usage: bun agents/arthur/struct113-render-under.ts <model.glb> <outdir>
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "");
const outDir = resolve(process.argv[3] ?? "agents/arthur/reviews/struct113-bower");
if (!modelPath.endsWith(".glb")) throw new Error("first argument must be a .glb path");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
const threeModule = join(THREE_ROOT, "build/three.module.js");
const modelBytes = readFileSync(modelPath);
const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#cbd6df}canvas{display:block}
</style><script type="module">
import * as THREE from '/three.module.js';
import { GLTFLoader } from '/examples/jsm/loaders/GLTFLoader.js';
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(960,720); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xcbd6df);
const camera=new THREE.PerspectiveCamera(42,960/720,0.05,100);
const hemi=new THREE.HemisphereLight(0xffffff,0x48505a,2.0); scene.add(hemi);
const ambient=new THREE.AmbientLight(0xffffff,0.45); scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff1d4,3.2); sun.position.set(8,12,6); sun.castShadow=true; scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x7f8d70,roughness:1}));
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const gltf=await new GLTFLoader().loadAsync('/model.glb'); const root=gltf.scene; scene.add(root);
root.updateMatrixWorld(true); const original=new THREE.Box3().setFromObject(root); const size=original.getSize(new THREE.Vector3());
const center=original.getCenter(new THREE.Vector3());
root.position.x-=center.x; root.position.z-=center.z; root.position.y-=original.min.y;
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true);
// UNDER views: camera at head height inside the bower, looking up at the
// ceiling. Model origin-anchored at (0,0): eye-cell center is directly
// overhead at (0, ~2.2). Vantage A: 1.2m out on a diagonal, tilt up.
// Vantage B: 1.8m out opposite diagonal. FOV 62 for the enveloping ceiling.
const up=new THREE.Vector3(0,1,0);
const mk=(px,pz)=>{const cam=new THREE.Vector3(px,1.65,pz);const look=new THREE.Vector3(px*0.25,2.6,pz*0.25);return {pos:cam.toArray(),look:look.toArray()}};
const views={underA:mk(1.6,0.0),underB:mk(-0.9,1.5)};
window.setView=(name)=>{camera.position.fromArray(views[name].pos);camera.up.copy(up);camera.lookAt(new THREE.Vector3().fromArray(views[name].look));camera.fov=62;camera.updateProjectionMatrix();renderer.render(scene,camera)};
window.setView('underA'); window.reviewReady=true;
</script>`;
const server = createServer((req, res) => {
    const url = (req.url ?? "/").split("?")[0];
    try {
        if (url === "/") { res.setHeader("content-type", "text/html"); res.end(html); return; }
        if (url === "/model.glb") { res.setHeader("content-type", "model/gltf-binary"); res.end(modelBytes); return; }
        if (url === "/three.module.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(threeModule)); return; }
        if (url === "/three.core.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(join(THREE_ROOT, "build/three.core.js"))); return; }
        if (url.startsWith("/examples/jsm/")) {
            const rel = url.slice(1);
            const p = join(THREE_ROOT, rel);
            if (!p.startsWith(THREE_ROOT)) throw new Error("path escape");
            let s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
            res.setHeader("content-type", "text/javascript"); res.end(s); return;
        }
        res.statusCode = 404; res.end("nf");
    } catch { res.statusCode = 404; res.end("nf"); }
});
server.listen(0, "127.0.0.1", async () => {
    const port = (server.address() as any).port;
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
    page.on("console", m => console.error("BROWSER", m.type(), m.text()));
    page.on("pageerror", e => console.error("PAGEERROR", e.message));
    page.on("requestfailed", r => console.error("REQUESTFAILED", r.url(), r.failure()?.errorText));
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.waitForFunction("window.reviewReady === true");
    await page.evaluate(() => (window as any).setView("underA"));
    await page.screenshot({ path: join(outDir, "under-a.png") });
    await page.evaluate(() => (window as any).setView("underB"));
    await page.screenshot({ path: join(outDir, "under-b.png") });
    await browser.close(); server.close();
    console.log(`wrote ${outDir}/under-a.png + under-b.png`);
});
