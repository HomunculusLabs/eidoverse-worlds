// struct93-review-night-approach.ts — lane-owned review variant: renders the
// APPROACH-side (-z) night view of the halt, where the brass road-stud
// actually faces the camera. The committed rig's night frame is +z (rear),
// which the post occludes — this closes the one-quiet-point judgment from
// the side a walker approaches at night. Same lighting/night constants as
// review-model.ts setNight; camera mirrored to -z.
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "playwright";

const modelPath = resolve(process.argv[2] ?? "");
const outDir = resolve(process.argv[3] ?? "agents/arthur/reviews/struct93-halt");
if (!modelPath.endsWith(".glb")) throw new Error("first argument must be a .glb path");
mkdirSync(outDir, { recursive: true });

const THREE_ROOT = resolve("node_modules/three");
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
const center=original.getCenter(new THREE.Vector3()); root.position.x-=center.x; root.position.z-=center.z; root.position.y-=original.min.y;
root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); root.updateMatrixWorld(true);
const r=Math.max(size.x,size.z,4); const target=new THREE.Vector3(0,Math.max(0.7,size.y*0.38),0);
// APPROACH view: mirrored to -z (same 18m gameplay distance / 1.65m eye height)
camera.position.set(0,1.65,-18); camera.lookAt(target); renderer.render(scene,camera);
scene.background.set(0x111827); hemi.intensity=.18; ambient.intensity=.04; sun.intensity=.15;
renderer.render(scene,camera);
window.reviewReady=true;
</script>`;
const server = createServer((req, res) => {
    if (req.url === "/model.glb") { res.setHeader("content-type", "model/gltf-binary"); res.end(modelBytes); return; }
    if (req.url === "/three.module.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(join(THREE_ROOT, "build/three.module.js"))); return; }
    if (req.url === "/three.core.js") { res.setHeader("content-type", "text/javascript"); res.end(readFileSync(join(THREE_ROOT, "build/three.core.js"))); return; }
    if (req.url?.startsWith("/examples/jsm/")) {
        const rel = req.url.slice(1); const p = join(THREE_ROOT, rel);
        const s = readFileSync(p, "utf8").replaceAll("from 'three'", "from '/three.module.js'").replaceAll('from "three"', 'from "/three.module.js"');
        res.setHeader("content-type", "text/javascript"); res.end(s); return;
    }
    res.setHeader("content-type", "text/html"); res.end(html);
});
await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch();
try {
    const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
    await page.goto(`http://127.0.0.1:${(server.address() as any).port}/`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => (window as any).reviewReady === true, undefined, { timeout: 30_000 });
    await page.screenshot({ path: join(outDir, "night-approach.png") });
    console.log("wrote", join(outDir, "night-approach.png"));
} finally { await browser.close(); server.close(); }
