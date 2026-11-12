// LOCAL ONLY: no world connection, uploads, verbs, live placement or GUI.
// Optional read-only GETs: --before-url URL --candidate-url URL verify byte identity.
// --ensemble [--census FILE] [--library-base https://eidoverse.billding.dev/library/]
// downloads only the census-pinned crown and sign, preserving host-relative poses.
// bun agents/arthur/review-windmill-overhaul.ts MODEL.glb OUTDIR [--before BASELINE.glb]
// All camera/lighting/motion settings are fixed in host-local metres, never bbox-fit.
// Identical inputs are explicitly labeled a renderer control, NOT an improvement.
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, realpathSync, statSync } from "node:fs";
import { resolve, join, extname, sep } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import sharp from "sharp";

const REPO = resolve(import.meta.dir, "../..");
const REVIEW = join(import.meta.dir, "reviews/windmill-overhaul");
const WIDTH = 960, HEIGHT = 720, LABEL = 100;
const VIEWS = {
  front: { position: [0, 5.8, 23], target: [0, 5.3, 0] },
  right: { position: [23, 5.8, 0], target: [0, 5.3, 0] },
  left: { position: [-23, 5.8, 0], target: [0, 5.3, 0] },
  back: { position: [0, 5.8, -23], target: [0, 5.3, 0] },
  gameplay: { position: [0, 1.65, 18], target: [0, 5.3, 0] },
  aerial: { position: [15, 17, 16], target: [0, 4.8, 0] },
  top: { position: [0, 25, 0.001], target: [0, 0, 0] },
  night: { position: [0, 1.65, 18], target: [0, 5.3, 0] },
  interior: { position: [0, 1.65, 1.85], target: [0, 1.55, -2.7] },
  "motion-a": { position: [0, 5.8, 23], target: [0, 5.3, 0] },
  "motion-b": { position: [0, 5.8, 23], target: [0, 5.3, 0] },
};
const hash = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
const json = (x: unknown) => JSON.stringify(x, null, 2);

async function download(url: string) {
  const parsed = new URL(url);
  if (parsed.username || parsed.password || !((parsed.protocol === 'https:') || (parsed.protocol === 'http:' && parsed.hostname === '127.0.0.1')))
    throw new Error('Only credential-free HTTPS or loopback HTTP GETs are permitted');
  const fetchedAt = new Date().toISOString();
  const response = await fetch(url, { method: 'GET', redirect: 'error', signal: AbortSignal.timeout(30_000) });
  if (!response.ok || !response.body) throw new Error(`GET ${url}: HTTP ${response.status}`);
  const chunks: Uint8Array[] = []; let total = 0;
  for await (const chunk of response.body) {
    total += chunk.length;
    if (total > 32 * 1024 * 1024) throw new Error('GET exceeded 32 MiB bound');
    chunks.push(chunk);
  }
  const bytes = Buffer.concat(chunks);
  return { bytes, meta: { url, method: 'GET', fetchedAt, status: response.status,
    contentType: response.headers.get('content-type'), etag: response.headers.get('etag'),
    sha256: hash(bytes), byteLength: bytes.length } };
}

function glb(path: string) {
  const bytes = readFileSync(path);
  if (bytes.length < 20 || bytes.toString("ascii", 0, 4) !== "glTF" || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length || bytes.readUInt32LE(16) !== 0x4e4f534a)
    throw new Error(`Invalid GLB 2.0: ${path}`);
  const length = bytes.readUInt32LE(12);
  if (20 + length > bytes.length) throw new Error(`Truncated GLB JSON: ${path}`);
  const doc = JSON.parse(bytes.toString("utf8", 20, 20 + length));
  for (const entry of [...(doc.buffers ?? []), ...(doc.images ?? [])])
    if (entry.uri && !entry.uri.startsWith("data:")) throw new Error(`External GLB resources forbidden: ${entry.uri}`);
  return { bytes, meta: { path, sha256: hash(bytes), byteLength: bytes.length,
    extensionsUsed: doc.extensionsUsed ?? [], extensionsRequired: doc.extensionsRequired ?? [],
    gltfNodes: doc.nodes?.length ?? 0, gltfMeshes: doc.meshes?.length ?? 0,
    gltfNodeNames: (doc.nodes ?? []).map((n: any) => n.name ?? null) } };
}

// Serialized into an isolated headless page; engine tickMotion is served UNMODIFIED.
async function browserMain(cfg: any) {
  const THREE: any = await import("/three/build/three.module.js");
  const { GLTFLoader }: any = await import("/three/examples/jsm/loaders/GLTFLoader.js");
  const { DRACOLoader }: any = await import("/three/examples/jsm/loaders/DRACOLoader.js");
  const harness: any = await import("/harness.js");
  const { tickMotion }: any = await import("/engine/motion.js");
  const { camera, entities, comps, setNow }: any = harness;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(cfg.width, cfg.height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  // Three's default opaque sort uses allocation-time material IDs. Async GLTF
  // image/material creation can reorder coplanar faces across identical loads.
  // Fix only opaque tie order to source traversal; transparent depth sorting stays native.
  renderer.setOpaqueSort((a: any, b: any) => a.groupOrder - b.groupOrder || a.renderOrder - b.renderOrder || (a.object.userData.reviewOrder ?? 0) - (b.object.userData.reviewOrder ?? 0));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  document.body.appendChild(renderer.domElement);
  // Read complete buffers directly. Three FileLoader's streamed Response/abort
  // path can emit Chromium ERR_ABORTED after delivering usable GLB bytes.
  // Direct fetch + browser SHA binds the ACTUAL parse input and fails on any loss.
  const fetchBytes = async (url: string) => {
    const response = await fetch(url); if (!response.ok) throw new Error('GET failed: ' + url);
    return await response.arrayBuffer();
  };
  const sha = async (bytes: ArrayBuffer) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(v => v.toString(16).padStart(2, '0')).join('');
  THREE.Cache.enabled = true;
  for (const file of ['draco_wasm_wrapper.js', 'draco_decoder.wasm']) {
    const url = '/three/examples/jsm/libs/draco/gltf/' + file;
    const bytes = await fetchBytes(url);
    THREE.Cache.add('file:' + url, file.endsWith('.js') ? new TextDecoder().decode(bytes) : bytes);
  }
  const draco = new DRACOLoader().setDecoderPath('/three/examples/jsm/libs/draco/gltf/').setWorkerLimit(1);
  draco.setDecoderConfig({ type: 'wasm' });
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const loadModel = async (url: string, expectedSha: string) => {
    const bytes = await fetchBytes(url), actualSha = await sha(bytes);
    if (actualSha !== expectedSha) throw new Error('Browser input hash mismatch: ' + url);
    return (await loader.parseAsync(bytes, '/')).scene;
  };
  const scenes: any = {}, models: any = {}, states: any = {}, motionChecks: any = {};
  const box = (root: any) => {
    const b = new THREE.Box3().setFromObject(root, true);
    return { min: b.min.toArray(), max: b.max.toArray(), size: b.getSize(new THREE.Vector3()).toArray() };
  };
  const transform = (obj: any) => ({ position: obj.position.toArray(), quaternion: obj.quaternion.toArray(), scale: obj.scale.toArray(), matrixWorld: obj.matrixWorld.toArray() });
  for (const side of ['before', 'candidate']) {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0xcbd6df);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x48505a, 2);
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    const sun = new THREE.DirectionalLight(0xfff1d4, 3.2);
    sun.position.set(8, 15, 9); sun.target.position.set(0, 4, 0); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 16, bottom: -12, near: 0.1, far: 60 });
    sun.shadow.bias = -0.00015; sun.shadow.normalBias = 0.02;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x7f8d70, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.21; ground.receiveShadow = true;
    scene.add(hemi, ambient, sun, sun.target, ground);
    const root = await loadModel('/input-' + side + '.glb', cfg.inputHashes[side]);
    scene.add(root); root.updateMatrixWorld(true); entities.set(side, root);
    const nodes: any[] = [], meshes: any[] = [], materials = new Map();
    root.traverse((obj: any) => {
      nodes.push({ name: obj.name || null, type: obj.type, transform: transform(obj) });
      if (!obj.isMesh) return;
      obj.castShadow = true; obj.receiveShadow = true; meshes.push(obj); obj.userData.reviewOrder = meshes.length;
      for (const m of Array.isArray(obj.material) ? obj.material : [obj.material]) materials.set(m.uuid, {
        name: m.name || null, type: m.type, color: m.color?.getHexString(), roughness: m.roughness,
        metalness: m.metalness, emissive: m.emissive?.getHexString(), emissiveIntensity: m.emissiveIntensity,
        opacity: m.opacity, transparent: m.transparent, doubleSided: m.side === THREE.DoubleSide,
        texture: !!m.map, normalMap: !!m.normalMap,
      });
    });
    const matches: any[] = []; root.traverse((obj: any) => { if (obj !== root && obj.name === 'sails') matches.push(obj); });
    if (matches.length !== 1) throw new Error(side + ': expected exactly one sails node, got ' + matches.length);
    const sails = matches[0];
    const millstoneMatches: any[] = []; root.traverse((obj: any) => { if (obj !== root && obj.name === 'well_millstone') millstoneMatches.push(obj); });
    if (millstoneMatches.length > 1) throw new Error(side + ': duplicate well_millstone');
    const millstone = millstoneMatches[0] ?? null;
    const moving = new Set(); sails.traverse((obj: any) => moving.add(obj));
    millstone?.traverse((obj: any) => moving.add(obj));
    const staticMeshes = meshes.filter((obj: any) => !moving.has(obj));
    const staticMatrices = staticMeshes.map((obj: any) => obj.matrixWorld.toArray());
    const pivot = new THREE.Vector3(...cfg.motion.pivot).applyMatrix4(sails.matrixWorld).toArray();
    const rest = transform(sails);
    comps.set(side, { 'motion:sails': cfg.motion, ...(millstone ? { 'motion:well_millstone': cfg.millstoneMotion } : {}) });
    const companions: any[] = [], companionDetails: any[] = [];
    for (const member of cfg.ensemble ?? []) {
      const companion = await loadModel(member.url, member.sha256);
      const wrapper = new THREE.Group(); wrapper.position.fromArray(member.hostLocal.position);
      wrapper.rotation.y = member.hostLocal.yaw; wrapper.scale.setScalar(member.hostLocal.scale);
      wrapper.add(companion); scene.add(wrapper); wrapper.updateMatrixWorld(true);
      let order = 10000 + companions.length * 1000, meshCount = 0;
      companion.traverse((obj: any) => { if (obj.isMesh) { obj.castShadow = obj.receiveShadow = true; obj.userData.reviewOrder = ++order; meshCount++; } });
      companions.push(wrapper);
      companionDetails.push({ id: member.id, sha256: member.sha256, bounds: box(wrapper), transform: transform(wrapper), drawMeshes: meshCount });
    }
    states[side] = { root, sails, millstone, millstonePivot: millstone?.getWorldPosition(new THREE.Vector3()).toArray(),
      meshes, staticMeshes, staticMatrices, pivot, rest, phases: {}, companions,
      companionMatrices: companions.map(c => c.matrixWorld.toArray()) };
    models[side] = { browserInputSha256: cfg.inputHashes[side], bounds: box(root), rootTransform: transform(root), nodes: nodes.length, nodeDetails: nodes,
      namedNodes: nodes.map(n => n.name).filter(Boolean), drawMeshes: meshes.length,
      triangles: meshes.reduce((sum: number, m: any) => sum + (m.geometry.index?.count ?? m.geometry.attributes.position.count) / 3, 0),
      materials: [...materials.values()], sailsRest: rest, ensembleMembers: companionDetails };
    scenes[side] = { scene, hemi, ambient, sun };
  }
  const renderView = (view: string, side: string) => {
    const fixture = cfg.views[view];
    if (!fixture || !scenes[side]) throw new Error('Unknown render target');
    const elapsedSeconds = view === 'motion-b' ? cfg.phaseBSeconds : 0;
    camera.position.fromArray(fixture.position); camera.up.set(0, 1, 0);
    camera.lookAt(new THREE.Vector3(...fixture.target)); camera.updateMatrixWorld(true);
    setNow(cfg.motion.t0 + elapsedSeconds * 1000); tickMotion();
    const s = scenes[side], night = view === 'night';
    s.scene.background.set(night ? 0x111827 : 0xcbd6df);
    s.hemi.intensity = night ? 0.18 : 2; s.ambient.intensity = night ? 0.04 : 0.45; s.sun.intensity = night ? 0.15 : 3.2;
    s.scene.updateMatrixWorld(true); renderer.render(s.scene, camera);
    const state = states[side];
    const motion = { elapsedSeconds, nowMs: cfg.motion.t0 + elapsedSeconds * 1000,
      angleRadians: elapsedSeconds * cfg.motion.rpm * 6 * Math.PI / 180,
      sails: transform(state.sails), pivot: new THREE.Vector3(...cfg.motion.pivot).applyMatrix4(state.sails.matrixWorld).toArray(),
      millstone: state.millstone ? { transform: transform(state.millstone), pivot: state.millstone.getWorldPosition(new THREE.Vector3()).toArray(),
        angleRadians: elapsedSeconds * cfg.millstoneMotion.rpm * 6 * Math.PI / 180 } : null,
      bounds: box(state.root) };
    if (view.startsWith('motion-')) state.phases[view] = motion;
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    let vertices = 0, outsideVertices = 0;
    const vertex = new THREE.Vector3(), meshes = [...state.meshes];
    for (const companion of state.companions) companion.traverse((obj: any) => { if (obj.isMesh) meshes.push(obj); });
    for (const mesh of meshes) {
      const position = mesh.geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld).project(camera);
        const xyz = vertex.toArray(); vertices++;
        if (xyz.some((v: number) => !Number.isFinite(v) || Math.abs(v) > 1)) outsideVertices++;
        for (let j = 0; j < 3; j++) { min[j] = Math.min(min[j], xyz[j]); max[j] = Math.max(max[j], xyz[j]); }
      }
    }
    const framing = { min, max, vertices, outsideVertices, allVerticesInside: vertices > 0 && outsideVertices === 0,
      claim: 'decoded-mesh-vertex-frustum-check-not-occlusion-or-walkability-proof', interiorExempt: view === 'interior' };
    if (view !== 'interior' && !framing.allVerticesInside) throw new Error(side + '/' + view + ': camera crops ' + outsideVertices + ' decoded vertices; fixed rig must cover both versions');
    return { camera: { ...fixture, up: [0, 1, 0], fov: camera.fov, near: camera.near, far: camera.far,
      aspect: camera.aspect, matrixWorld: camera.matrixWorld.toArray(), projectionMatrix: camera.projectionMatrix.toArray() },
      lighting: night ? 'synthetic-night' : 'synthetic-day', motion, framing, drawCalls: renderer.info.render.calls,
      trianglesDrawn: renderer.info.render.triangles };
  };
  const finish = () => {
    for (const side of ['before', 'candidate']) {
      const s = states[side], a = s.phases['motion-a'], b = s.phases['motion-b'];
      const delta = (x: number[], y: number[]) => Math.max(...x.map((n, i) => Math.abs(n - y[i])));
      motionChecks[side] = {
        rotationChanged: delta(a.sails.quaternion, b.sails.quaternion) > 0.01,
        pivotFixed: delta(s.pivot, a.pivot) < 1e-7 && delta(s.pivot, b.pivot) < 1e-7,
        staticMeshesUnchanged: s.staticMeshes.every((obj: any, i: number) => delta(obj.matrixWorld.toArray(), s.staticMatrices[i]) < 1e-7),
        ensembleUnchanged: s.companions.every((obj: any, i: number) => delta(obj.matrixWorld.toArray(), s.companionMatrices[i]) < 1e-7),
        staticMeshCount: s.staticMeshes.length, phases: s.phases,
        millstone: s.millstone ? { rotationChanged: delta(a.millstone.transform.quaternion, b.millstone.transform.quaternion) > 0.01,
          pivotFixed: delta(s.millstonePivot, a.millstone.pivot) < 1e-7 && delta(s.millstonePivot, b.millstone.pivot) < 1e-7 } : { absent: true },
      };
      if (!motionChecks[side].rotationChanged || !motionChecks[side].pivotFixed || !motionChecks[side].staticMeshesUnchanged || !motionChecks[side].ensembleUnchanged)
        throw new Error(side + ': motion invariant failed');
      if (s.millstone && (!motionChecks[side].millstone.rotationChanged || !motionChecks[side].millstone.pivotFixed)) throw new Error(side + ': millstone invariant failed');
    }
    const gl = renderer.getContext(), debug = gl.getExtension('WEBGL_debug_renderer_info');
    return { models, motionChecks, renderer: { threeRevision: THREE.REVISION, webglVersion: gl.getParameter(gl.VERSION),
      renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      toneMapping: 'ACESFilmicToneMapping', exposure: 1, pixelRatio: 1, shadowMap: 'PCFShadowMap', opaqueSort: 'stable-source-traversal' } };
  };
  Object.assign(window, { review: { renderView, finish }, reviewReady: true });
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--help')) { console.log('Usage: bun agents/arthur/review-windmill-overhaul.ts MODEL.glb OUTDIR [--before BASELINE.glb] [--ensemble] [--census FILE] [--before-url URL] [--candidate-url URL] [--library-base URL]\nLocal exact-byte comparison only. Optional read-only asset GETs; no world connection. Default baseline: ' + join(REVIEW, 'before/model.glb')); return; }
  const [modelArg, outArg, ...flags] = argv;
  if (!modelArg || !outArg || !modelArg.endsWith('.glb')) throw new Error('Usage: MODEL.glb OUTDIR [--before BASELINE.glb]');
  let beforePath = join(REVIEW, 'before/model.glb');
  let ensemble = false, censusPath = '/tmp/windmill-overhaul-census.json', libraryBase = 'https://eidoverse.billding.dev/library/';
  const liveURLs: Record<string, string> = {};
  for (let i = 0; i < flags.length; i++) {
    if (flags[i] === '--before' && flags[i + 1]) beforePath = resolve(flags[++i]);
    else if (flags[i] === '--ensemble') ensemble = true;
    else if (flags[i] === '--census' && flags[i + 1]) censusPath = resolve(flags[++i]);
    else if (flags[i] === '--library-base' && flags[i + 1]) libraryBase = flags[++i];
    else if (flags[i] === '--before-url' && flags[i + 1]) liveURLs.before = flags[++i];
    else if (flags[i] === '--candidate-url' && flags[i + 1]) liveURLs.candidate = flags[++i];
    else throw new Error('Unknown/incomplete option: ' + flags[i]);
  }
  const outDir = resolve(outArg), candidatePath = resolve(modelArg);
  const input = { before: glb(beforePath), candidate: glb(candidatePath) };
  const motionSource = readFileSync(join(REPO, 'client/lib/motion.js'));
  const evalSource = readFileSync(join(REPO, 'client/lib/motioneval.js'));
  const worldSource = readFileSync(join(REPO, 'client/lib/world.js'), 'utf8');
  const findPart = worldSource.match(/const _partCache = new WeakMap\(\);[\s\S]*?\n}\n/);
  if (!findPart || !findPart[0].includes('export function findPart(')) throw new Error('Cannot isolate engine findPart source; inspect engine before adapting harness');
  const t0 = Date.parse('2026-09-08T00:26:01Z');
  const motion = { type: 'spin', axis: [0, 0, 1], pivot: [0, 0, 0], rpm: 1.25, phase: 0, t0 };
  const millstoneMotion = { type: 'spin', axis: [0, 1, 0], pivot: [0, 0, 0], rpm: 5, phase: 0, t0 };
  const cfg: any = { width: WIDTH, height: HEIGHT, views: VIEWS, motion, millstoneMotion, phaseBSeconds: 45 / (motion.rpm * 6), ensemble: [],
    inputHashes: { before: input.before.meta.sha256, candidate: input.candidate.meta.sha256 } };
  const harness = `import * as THREE from '/three/build/three.module.js';\nexport {THREE};
export const camera=new THREE.PerspectiveCamera(48,${WIDTH}/${HEIGHT},0.05,120);
export const entities=new Map(),comps=new Map(); let now=1000000;
export const setNow=(v)=>{now=v}; export const serverNow=()=>now;
export const reindexCollider=()=>{};\n${findPart[0]}`;

  const stats: any = {
    status: 'running', startedAt: new Date().toISOString(),
    evidence: { kind: 'LOCAL_EXACT_BYTE_RENDER_NOT_IN_WORLD',
      note: 'Exact input bytes in a synthetic local rig; NOT in-world screenshots, a current census, placement proof, collision proof, or live component proof.',
      worldMutations: 0, liveReads: [], terrain: 'synthetic plane at y=-0.21; original model transform preserved',
      lights: 'synthetic day/night only; no fabricated live point lights; authored GLB emissive retained',
      interior: 'fixed eye at [0,1.65,1.85], no cutaway, clipping, wall hiding, or added fill lights' },
    comparison: { kind: input.before.meta.sha256 === input.candidate.meta.sha256 ? 'identical-byte-control' : 'before-vs-candidate',
      cameras: 'fixed-host-local-origin; identical cameras, no recenter, resize, or bbox autofit' },
    inputs: { before: input.before.meta, candidate: input.candidate.meta },
    rig: { width: WIDTH, height: HEIGHT, labelHeight: LABEL, views: VIEWS, scriptSha256: hash(readFileSync(import.meta.path)) },
    motion: { componentOrigin: 'synthetic-review-contract-not-live-component-proof', key: 'motion:sails', component: motion,
      millstoneKey: 'motion:well_millstone', millstoneComponent: millstoneMotion,
      note: 'Supplied intended component payloads evaluated by the real engine at deterministic t0 and t0+6s. Missing baseline millstone is reported, never invented. Baked sail rest orientation is preserved.',
      phases: { a: { elapsedSeconds: 0, angleRadians: 0 }, b: { elapsedSeconds: cfg.phaseBSeconds, angleRadians: Math.PI / 4 } },
      source: { mode: 'actual-engine-tickMotion-with-local-harness',
        motion: { path: 'client/lib/motion.js', sha256: hash(motionSource) },
        motioneval: { path: 'client/lib/motioneval.js', sha256: hash(evalSource) },
        findPart: { path: 'client/lib/world.js', wholeFileSha256: hash(worldSource), extractedSha256: hash(findPart[0]) },
        harnessSha256: hash(harness), adaptations: ['in-memory entity/component maps', 'deterministic serverNow', 'review camera', 'no-op collider reindex; no collision claim'] } },
    frames: {}, errors: [], warnings: [], requests: [],
  };
  mkdirSync(outDir, { recursive: true });
  for (const side of ['before', 'candidate'] as const) {
    mkdirSync(join(outDir, side), { recursive: true });
    const snapshot = join(outDir, 'input-' + side + '.glb');
    if (Object.values(input).some(v => resolve(v.meta.path) === snapshot)) throw new Error('Output snapshot would overwrite input');
    writeFileSync(snapshot, input[side].bytes); stats.inputs[side].snapshot = snapshot;
  }
  const threeRoot = realpathSync(join(REPO, 'node_modules/three'));
  stats.dependencies = { three: JSON.parse(readFileSync(join(threeRoot, 'package.json'), 'utf8')).version,
    dracoWasmSha256: hash(readFileSync(join(threeRoot, 'examples/jsm/libs/draco/gltf/draco_decoder.wasm'))) };
  const routes = new Map<string, { bytes: string | Buffer; type: string }>([
    ['/harness.js', { bytes: harness, type: 'text/javascript' }],
    ['/engine/motion.js', { bytes: motionSource, type: 'text/javascript' }],
    ['/engine/motioneval.js', { bytes: evalSource, type: 'text/javascript' }],
    ...['core', 'world', 'colliders', 'remotes'].map((n): [string, { bytes: string; type: string }] => ['/engine/' + n + '.js', { bytes: "export * from '/harness.js';", type: 'text/javascript' }]),
    ...(['before', 'candidate'] as const).map((side): [string, { bytes: Buffer; type: string }] => ['/input-' + side + '.glb', { bytes: input[side].bytes, type: 'model/gltf-binary' }]),
  ]);
  const server = createServer((req, res) => {
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
      const path = new URL(req.url ?? '/', 'http://127.0.0.1').pathname;
      let route = routes.get(path);
      if (!route && path.startsWith('/three/')) {
        const file = realpathSync(resolve(threeRoot, decodeURIComponent(path.slice('/three/'.length))));
        if (!file.startsWith(threeRoot + sep) || !['.js', '.wasm'].includes(extname(file))) throw new Error('Forbidden dependency path');
        route = { bytes: readFileSync(file), type: extname(file) === '.wasm' ? 'application/wasm' : 'text/javascript' };
        routes.set(path, route); // Freeze dependency bytes for both panels.
      }
      if (!route) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'content-type': route.type, 'content-length': Buffer.byteLength(route.bytes), 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : route.bytes);
    } catch (error: any) { stats.errors.push({ kind: 'http', message: error.message }); res.writeHead(400); res.end('request rejected'); }
  });
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  const deadline = setTimeout(() => { stats.errors.push({ kind: 'timeout', message: '180 second hard deadline' }); browser?.close(); server.closeAllConnections(); server.close(); }, 180_000);
  try {
    for (const side of ['before', 'candidate'] as const) {
      if (!liveURLs[side]) continue;
      const result = await download(liveURLs[side]);
      stats.evidence.liveReads.push(result.meta);
      stats.inputs[side].liveByteVerification = { ...result.meta, matches: result.meta.sha256 === input[side].meta.sha256,
        claim: 'GET-byte-equality-only-not-live-entity-placement' };
      if (!stats.inputs[side].liveByteVerification.matches) throw new Error(side + ': server bytes differ from local input');
    }
    if (ensemble) {
      const censusBytes = readFileSync(censusPath), census = JSON.parse(censusBytes.toString('utf8'));
      const ids = ['nx-town-windmill', 'nx-artwalk-b10-windmill-four-wind-crown', 'nx-sign-mill-001'];
      const selected = ids.map(id => {
        const matches = census.entities?.filter((e: any) => e.id === id);
        if (matches?.length !== 1) throw new Error('Census must contain exactly one ' + id);
        const e = matches[0];
        if (!/^store\/[0-9a-f]{16}\.glb$/.test(e.lib) || !Array.isArray(e.pos) || e.pos.length !== 3 || !e.pos.every(Number.isFinite) || !Number.isFinite(e.yaw) || !Number.isFinite(e.scale) || e.scale <= 0 || e.parent)
          throw new Error('Malformed or mounted census entity: ' + id);
        return e;
      });
      const host = selected[0], members: any[] = [];
      const extracted = json({ world: census.world, entities: selected });
      const snapshot = join(outDir, 'ensemble-census.json'); writeFileSync(snapshot, extracted + '\n');
      stats.ensemble = { kind: 'LOCAL_COMPOSITE_FROM_SUPPLIED_CENSUS_NOT_LIVE_WORLD_SCREENSHOT', host, members,
        census: { path: censusPath, sha256: hash(censusBytes), fileModifiedAt: statSync(censusPath).mtime.toISOString(), world: census.world, snapshot },
        note: 'Snapshot poses are not a fresh entity census. Companions remain at those host-local transforms for BOTH host versions. Their component bags are archived but not simulated.' };
      mkdirSync(join(outDir, 'ensemble'), { recursive: true });
      for (const entity of selected.slice(1)) {
        const url = new URL(entity.lib, libraryBase).href;
        const result = await download(url); stats.evidence.liveReads.push(result.meta);
        const path = join(outDir, 'ensemble', entity.id + '.glb'); writeFileSync(path, result.bytes);
        const memberInput = glb(path), dx = entity.pos[0] - host.pos[0], dz = entity.pos[2] - host.pos[2];
        const c = Math.cos(host.yaw), s = Math.sin(host.yaw);
        const hostLocal = { position: [(dx * c - dz * s) / host.scale, (entity.pos[1] - host.pos[1]) / host.scale, (dx * s + dz * c) / host.scale],
          yaw: entity.yaw - host.yaw, scale: entity.scale / host.scale };
        const route = '/ensemble/' + entity.id + '.glb';
        routes.set(route, { bytes: memberInput.bytes, type: 'model/gltf-binary' });
        cfg.ensemble.push({ id: entity.id, sha256: memberInput.meta.sha256, url: route, hostLocal });
        members.push({ entity, hostLocal, input: memberInput.meta, download: result.meta });
      }
    }
    const html = `<!doctype html><meta charset="utf-8"><link rel="icon" href="data:,"><style>html,body{margin:0;background:#cbd6df;overflow:hidden}canvas{display:block}</style>
<script type="importmap">{"imports":{"three":"/three/build/three.module.js"}}</script>
<script type="module">(${browserMain.toString()})(${JSON.stringify(cfg)}).catch(e=>{window.reviewFailure=e.stack||String(e);console.error(window.reviewFailure)});</script>`;
    routes.set('/', { bytes: html, type: 'text/html' });
    await new Promise<void>((ok, fail) => { server.once('error', fail); server.listen(0, '127.0.0.1', ok); });
    const addr = server.address(); if (!addr || typeof addr === 'string') throw new Error('No loopback address');
    const origin = `http://127.0.0.1:${addr.port}`;
    stats.server = { address: addr.address, port: addr.port, exposure: 'loopback-only', methods: ['GET', 'HEAD'] };
    browser = await chromium.launch({ headless: true }); stats.dependencies.chromium = browser.version();
    const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1, serviceWorkers: 'block' });
    await context.route('**/*', route => {
      const url = route.request().url();
      if (url.startsWith(origin + '/') || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
      stats.errors.push({ kind: 'blocked-external-request', url }); return route.abort();
    });
    const page = await context.newPage();
    page.on('console', m => { if (m.type() === 'error') stats.errors.push({ kind: 'console', message: m.text() }); else if (m.type() === 'warning') stats.warnings.push(m.text()); });
    page.on('pageerror', e => stats.errors.push({ kind: 'pageerror', message: e.message }));
    page.on('requestfailed', r => stats.errors.push({ kind: 'requestfailed', url: r.url(), message: r.failure()?.errorText }));
    page.on('response', r => { stats.requests.push({ path: new URL(r.url()).pathname, status: r.status() }); if (r.status() >= 400) stats.errors.push({ kind: 'http-response', url: r.url(), status: r.status() }); });
    await page.goto(origin + '/', { waitUntil: 'networkidle', timeout: 45_000 });
    await page.waitForFunction(() => (window as any).reviewReady || (window as any).reviewFailure, undefined, { timeout: 45_000 });
    const failure = await page.evaluate(() => (window as any).reviewFailure); if (failure) throw new Error(failure);
    const pairs: Buffer[] = [];
    for (const view of Object.keys(VIEWS)) {
      const frame: any = {}, panels: Buffer[] = [];
      for (const side of ['before', 'candidate'] as const) {
        const metadata = await page.evaluate(({ view, side }) => (window as any).review.renderView(view, side), { view, side });
        const pixels = await page.screenshot({ type: 'png', animations: 'disabled' });
        const title = side === 'before' ? 'BEFORE' : stats.comparison.kind === 'identical-byte-control' ? 'CANDIDATE = BASELINE CONTROL (NO CHANGE)' : 'CANDIDATE (NOT PLACEMENT PROOF)';
        const lines = ['LOCAL EXACT-BYTE ' + (ensemble ? 'COMPOSITE' : 'REVIEW') + ' / NOT IN-WORLD', title + ' / ' + view,
          'SHA256 ' + input[side].meta.sha256,
          `${metadata.lighting} | sail t=${metadata.motion.elapsedSeconds}s | fixed host-local camera`];
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${LABEL}"><rect width="100%" height="100%" fill="#111827"/>${lines.map((line, i) => `<text x="18" y="${21 + i * 23}" fill="${i === 0 ? '#f2c983' : '#e5e7eb'}" font-family="monospace" font-size="${i === 2 ? 12 : 14}">${line}</text>`).join('')}</svg>`;
        const panel = await sharp({ create: { width: WIDTH, height: HEIGHT + LABEL, channels: 4, background: '#111827' } })
          .composite([{ input: Buffer.from(svg), top: 0, left: 0 }, { input: pixels, top: LABEL, left: 0 }]).png().toBuffer();
        const file = join(outDir, side, `${view}.png`); writeFileSync(file, panel); panels.push(panel);
        frame[side] = { ...metadata, file, sha256: hash(panel), pixelSha256: hash(pixels) };
      }
      if (JSON.stringify(frame.before.camera) !== JSON.stringify(frame.candidate.camera)) throw new Error('Camera mismatch: ' + view);
      if (stats.comparison.kind === 'identical-byte-control' && frame.before.pixelSha256 !== frame.candidate.pixelSha256) throw new Error('Identical-byte control pixels disagree: ' + view);
      const pair = await sharp({ create: { width: WIDTH * 2, height: HEIGHT + LABEL, channels: 4, background: '#111827' } })
        .composite(panels.map((input, i) => ({ input, left: i * WIDTH, top: 0 }))).png().toBuffer();
      const file = join(outDir, `${view}.png`); writeFileSync(file, pair);
      frame.pair = { file, sha256: hash(pair) }; stats.frames[view] = frame; pairs.push(pair);
    }
    stats.render = await page.evaluate(() => (window as any).review.finish());
    for (const side of ['before', 'candidate'] as const) {
      if (stats.frames['motion-a'][side].pixelSha256 === stats.frames['motion-b'][side].pixelSha256) throw new Error('Sail motion produced identical pixels: ' + side);
      stats.inputs[side].sourceUnchangedAtEnd = hash(readFileSync(input[side].meta.path)) === input[side].meta.sha256;
      if (!stats.inputs[side].sourceUnchangedAtEnd) throw new Error('Source changed while rendering: ' + side);
    }
    const thumbs = await Promise.all(pairs.map(input => sharp(input).resize(WIDTH, (HEIGHT + LABEL) / 2).toBuffer()));
    const sheet = await sharp({ create: { width: WIDTH * 2, height: Math.ceil(thumbs.length / 2) * (HEIGHT + LABEL) / 2, channels: 4, background: '#111827' } })
      .composite(thumbs.map((input, i) => ({ input, left: i % 2 * WIDTH, top: Math.floor(i / 2) * (HEIGHT + LABEL) / 2 }))).png().toBuffer();
    writeFileSync(join(outDir, 'contact-sheet.png'), sheet); stats.contactSheet = { file: join(outDir, 'contact-sheet.png'), sha256: hash(sheet) };
    stats.dependencies.served = [...routes.entries()].filter(([path]) => path.startsWith('/three/')).map(([path, r]) => ({ path, sha256: hash(r.bytes) }));
    if (stats.errors.length) throw new Error('Browser/server errors: ' + stats.errors.length);
    stats.status = 'complete';
  } catch (e: any) { stats.status = 'failed'; stats.errors.push({ kind: 'runner', message: e.stack ?? e.message }); throw e; }
  finally {
    clearTimeout(deadline);
    try { await browser?.close(); } finally {
      server.closeAllConnections(); await new Promise<void>(done => server.close(() => done()));
      stats.finishedAt = new Date().toISOString(); writeFileSync(join(outDir, 'stats.json'), json(stats) + '\n');
    }
  }
  console.log(json({ verdict: 'LOCAL_REVIEW_COMPLETE', comparison: stats.comparison.kind,
    beforeSha256: stats.inputs.before.sha256, candidateSha256: stats.inputs.candidate.sha256,
    views: Object.keys(stats.frames).length, pairImages: Object.keys(stats.frames).map(v => join(outDir, v + '.png')),
    stats: join(outDir, 'stats.json'), contactSheet: stats.contactSheet.file,
    motionChecks: Object.fromEntries(Object.entries(stats.render.motionChecks).map(([k, v]: [string, any]) => [k, { rotationChanged: v.rotationChanged, pivotFixed: v.pivotFixed, staticMeshesUnchanged: v.staticMeshesUnchanged }])),
    errors: stats.errors.length, warnings: stats.warnings.length }));
}
await main().catch(error => { console.error(error.stack ?? String(error)); process.exitCode = 1; });
