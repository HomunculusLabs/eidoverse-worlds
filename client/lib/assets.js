// assets — every byte the client pulls, and the host shims that let Skye's
// toolkit modules run unmodified in a browser.
//
// Three caches, all keyed by library path and all "download+parse once":
//   byteCache  raw bytes (with progress reporting into the loading tray)
//   glbCache   parsed GLB prototypes — every use gets a skeleton clone
//   vrmaCache  animation bytes, retargeted per-VRM at use

import { THREE, renderer, camera, scene, report, bus } from './core.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { MToonMaterialLoaderPlugin } from '@pixiv/three-vrm-materials-mtoon';
import { MToonNodeMaterial } from '@pixiv/three-vrm-materials-mtoon/nodes';
import { VRMAnimationLoaderPlugin, createVRMAnimationClip } from '@pixiv/three-vrm-animation';
import { clone as skeletonClone } from 'three/addons/utils/SkeletonUtils.js';

// ---- loading tray -----------------------------------------------------------
// Every in-flight asset (downloads with byte progress, builds as spinners) is
// listed so "nothing is happening" never looks like nothing is happening.
// ui.js renders it; this module only owns the data.

const loads = new Map(); // key -> { label, done, total }
// Cumulative byte counters for the boot progress bar. Per-asset entries vanish
// when they finish, so a bar built from `loads` alone would leap backwards
// every time a download completed.
const bytes = { done: 0, total: 0 };
export const bootBytes = () => ({ ...bytes });
export const loadingItems = () => [...loads.values()];
function announce() { bus.emit('loading', loadingItems()); }
export function loadTrack(key, label) { loads.set(key, { label, done: 0, total: 0 }); announce(); }
export function loadProgress(key, done, total) {
  const l = loads.get(key);
  if (!l) return;
  if (total && !l.total) bytes.total += total;       // count each asset once
  bytes.done += Math.max(0, done - l.done);
  l.done = done; l.total = total;
  announce();
}
export function loadDone(key) { loads.delete(key); announce(); }

// ---- demand activity ----------------------------------------------------------
// The background prefetcher (prefetch.js) streams the library into the HTTP
// cache during idle time, and it must never cost a real load a millisecond.
// Every demand fetch marks itself here: the 'demand' event aborts prefetch's
// in-flight stream immediately, and demandState() keeps it parked until the
// network has been quiet for a while.

let demandActive = 0;
let lastDemandAt = 0;
export const demandState = () => ({ active: demandActive, last: lastDemandAt });
function demandStart() { demandActive++; lastDemandAt = performance.now(); bus.emit('demand'); }
function demandEnd() { demandActive = Math.max(0, demandActive - 1); lastDemandAt = performance.now(); }

// ---- raw bytes --------------------------------------------------------------

const byteCache = new Map();
export function forgetBytes(match) {
  for (const key of [...byteCache.keys()]) if (key.includes(match)) byteCache.delete(key);
}

export async function fetchBytes(path) {
  if (!byteCache.has(path)) {
    byteCache.set(path, (async () => {
      loadTrack(path, path.split('/').pop().split('?')[0]);
      demandStart();
      try {
        const r = await fetch(path);
        if (!r.ok) { byteCache.delete(path); throw new Error(`fetch ${path}: ${r.status}`); }
        const total = Number(r.headers.get('content-length') ?? 0);
        if (r.body && total > 200_000) { // stream big bodies for byte progress
          const reader = r.body.getReader();
          const chunks = [];
          let got = 0;
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            chunks.push(value);
            got += value.length;
            lastDemandAt = performance.now(); // long downloads keep prefetch parked
            loadProgress(path, got, total);
          }
          const buf = new Uint8Array(got);
          let o = 0;
          for (const c of chunks) { buf.set(c, o); o += c.length; }
          return buf.buffer;
        }
        return await r.arrayBuffer();
      } finally { loadDone(path); demandEnd(); }
    })());
  }
  return byteCache.get(path);
}

// ---- loaders ----------------------------------------------------------------

const draco = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
function makeLoader(vrm = false) {
  const l = new GLTFLoader();
  l.setDRACOLoader(draco);
  if (vrm) {
    l.register((p) => new VRMLoaderPlugin(p, {
      mtoonMaterialPlugin: new MToonMaterialLoaderPlugin(p, { materialType: MToonNodeMaterial }),
    }));
  }
  return l;
}

export async function loadVRM(libPath) {
  const buf = await fetchBytes(`/library/${libPath}`);
  const gltf = await new Promise((res, rej) => makeLoader(true).parse(buf, '', res, rej));
  const vrm = gltf.userData.vrm;
  VRMUtils.combineSkeletons?.(vrm.scene) ?? VRMUtils.removeUnnecessaryJoints?.(vrm.scene);
  VRMUtils.rotateVRM0(vrm); // VRM0 → faces +Z
  return vrm;
}

// Friendly names for library paths — store hashes are unreadable, and the
// loading tray should say "deco desk", not "4fee4b7c4794a2be".
export const libLabels = new Map();

const glbCache = new Map();
export async function loadGLB(libPath) {
  if (!glbCache.has(libPath)) {
    const short = (libLabels.get(libPath) ?? libPath.split('/').pop()).slice(0, 28);
    const key = `glb:${short}`;
    loadTrack(key, short);
    glbCache.set(libPath, (async () => {
      try {
        const buf = await fetchBytes(`/library/${libPath}`);
        const gltf = await new Promise((res, rej) => makeLoader(false).parse(buf, '', res, rej));
        return gltf.scene;
      } finally { loadDone(key); }
    })());
  }
  const proto = await glbCache.get(libPath);
  const obj = skeletonClone(proto); // safe for rigged + static alike
  // Precompile pipelines OFF the render path — otherwise the first frame that
  // sees a new material stalls the main thread (the ~1.5s spawn freeze).
  await renderer.compileAsync(obj, camera, scene).catch(() => {});
  return obj;
}

// ---- VRMA clips -------------------------------------------------------------

export const CLIP_SLOTS = ['idle', 'walk', 'run', 'sit', 'lie', 'jump', 'climb'];
// Slot names are the wire vocabulary (pose.clip); files are whatever the
// library calls them.
export const CLIP_FILES = { sit: 'sitting_on_ground', lie: 'sit_laying_on_ground', climb: 'climbLedge' };
// Approximate natural speeds of the library clips (m/s), for timeScale sync.
export const CLIP_SPEED = { idle: 0, walk: 1.55, run: 4.0, sit: 0, lie: 0, jump: 0, climb: 0 };

const vrmaCache = new Map();
export function vrmaBytes(slot) {
  if (!vrmaCache.has(slot)) {
    vrmaCache.set(slot, fetchBytes(`/library/eidoverse/assets/animations/${CLIP_FILES[slot] ?? slot}.vrma`));
  }
  return vrmaCache.get(slot);
}
export async function clipFor(vrm, slot) {
  const buf = await vrmaBytes(slot);
  const l = new GLTFLoader();
  l.register((p) => new VRMAnimationLoaderPlugin(p));
  const gltf = await new Promise((res, rej) => l.parse(buf.slice(0), '', res, rej));
  const anim = gltf.userData.vrmAnimations?.[0];
  if (!anim) throw new Error(`no animation in ${slot}.vrma`);
  return createVRMAnimationClip(anim, vrm);
}

// ---- procedural textures ----------------------------------------------------

/** Small tinted-noise CanvasTexture — lets log verbs specify terrain layers as
 *  colors (serializable) while clients bake the actual maps locally. */
export function noiseTexture(hex, scale = 0.22) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const base = new THREE.Color(hex);
  const img = ctx.createImageData(64, 64);
  for (let i = 0; i < 64 * 64; i++) {
    const n = 1 - scale + Math.random() * scale * 2;
    img.data[i * 4] = Math.min(255, base.r * 255 * n);
    img.data[i * 4 + 1] = Math.min(255, base.g * 255 * n);
    img.data[i * 4 + 2] = Math.min(255, base.b * 255 * n);
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ============================================================================
// The eidoverse module host
// ============================================================================
// Skye's modules are written for a Deno host: they read their own dependencies
// and assets with SYNCHRONOUS file reads (`eval(Deno.readTextFileSync(...))`,
// `Deno.readFileSync(tex)`). A browser cannot do a synchronous network read, so
// the contract is honoured the only way it can be: prime an in-memory file
// system first, then let the synchronous reads hit it.
//
// This is what lets `sky_worlds.js` — 2000+ lines of world packaging that
// assumes a filesystem — run in a browser tab with ZERO edits to Skye's source.
// Every future toolkit module gets the same deal for free.

const denoFiles = new Map(); // library-relative path -> Uint8Array
const textDecoder = new TextDecoder();

/** Warm the virtual filesystem. Call before anything that eval-loads toolkit
 *  modules or reads toolkit assets. Paths are library-relative
 *  ("eidoverse/sky_system.js"). Missing files are reported, not fatal —
 *  a world package that references an asset we failed to fetch should degrade,
 *  not abort the whole sky. */
export async function primeFiles(paths, { concurrency = 6 } = {}) {
  const missing = [];
  const q = paths.filter((p) => !denoFiles.has(p));
  await Promise.all(Array.from({ length: Math.min(concurrency, q.length) }, async () => {
    while (q.length) {
      const p = q.shift();
      try {
        const buf = await fetchBytes(`/library/${p}`);
        denoFiles.set(p, new Uint8Array(buf));
      } catch (e) { missing.push(p); }
    }
  }));
  if (missing.length) console.warn('[host] not primed:', missing.join(', '));
  return missing;
}

/** Directory listing from the sequencer, so prefetch lists are discovered
 *  rather than hardcoded (the no-manifest rule applies to us too). */
export async function listLibrary(dir) {
  try {
    const r = await fetch(`/library-list?dir=${encodeURIComponent(dir)}`);
    // null, NOT [] — an empty directory and a sequencer that has never heard of
    // this endpoint are different facts, and treating them the same made an
    // old server look like a world with no sky assets in it.
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

const normDeno = (p) => String(p).replace(/^\.?\//, '');

globalThis.Deno = {
  readFileSync(p) {
    const f = denoFiles.get(normDeno(p));
    if (!f) throw new Error(`[host] not primed: ${p}`);
    return f;
  },
  readTextFileSync(p) {
    return textDecoder.decode(globalThis.Deno.readFileSync(p));
  },
  async readFile(p) { return globalThis.Deno.readFileSync(p); },
  async readTextFile(p) { return globalThis.Deno.readTextFileSync(p); },
  // Bake/export paths in the toolkit write intermediates to disk. In a browser
  // there is nowhere to put them and nothing that reads them back in the same
  // session — swallowing the write is correct, and louder than it looks
  // because anything that then READS the file gets a clear "not primed".
  writeFileSync() {}, writeTextFileSync() {},
  async writeFile() {}, async writeTextFile() {},
  mkdirSync() {}, statSync() { throw new Error('[host] statSync unsupported'); },
  // Engine-side look-dev gates. Skye's modules read these deliberately as
  // ENGINE knobs rather than parameters (a scene tuning cloud pass counts is a
  // scene doing look development it doesn't own). We honour that: the client
  // doesn't invent options, it just supplies the tier the hardware can hold.
  env: {
    get: (k) => globalThis.__ewEnv?.[k],
    set: (k, v) => { (globalThis.__ewEnv ??= {})[k] = v; },
    has: (k) => globalThis.__ewEnv?.[k] !== undefined,
  },
  // Subprocess (ffmpeg for the asteroid bake) — declaring it absent is more
  // honest than a stub that pretends to succeed.
  Command: class { constructor() { throw new Error('[host] no subprocesses in a browser'); } },
  build: { os: 'browser' },
};

/** Decode image bytes into a three texture — the browser implementation of the
 *  engine's loadImageTexture contract (render_scene.mjs). createImageBitmap is
 *  native here, so this is the short version of the Deno one. */
globalThis.loadImageTexture = async (bytes, opts = {}) => {
  const u8 = bytes instanceof Uint8Array ? bytes
    : bytes instanceof ArrayBuffer ? new Uint8Array(bytes)
      : new Uint8Array(bytes);
  const bitmap = await createImageBitmap(new Blob([u8]), { colorSpaceConversion: 'none' });
  const tex = new THREE.Texture(bitmap);
  tex.colorSpace = opts.srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.flipY = false;         // matches the engine's bitmap orientation
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
};

// Toolkit modules construct their own loader for celestial meshes. The Deno
// host has it as a global, so ours must too — without it the sky died on
// `globalThis.GLTFLoader is not a constructor` and fell back to the basic sky.
globalThis.GLTFLoader = GLTFLoader;
globalThis.DRACOLoader = DRACOLoader;

/** GLB bytes → scene, for toolkit modules that load their own meshes. */
globalThis.loadGLBBytes = async (bytes) => {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const gltf = await new Promise((res, rej) =>
    makeLoader(false).parse(u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength), '', res, rej));
  return gltf.scene;
};

// ---- module loading ---------------------------------------------------------

const eidoModules = new Map();
/** Eval-load a toolkit module by name ("terrain.js"). Idempotent; concurrent
 *  callers share one fetch. */
export function loadEidoModule(name) {
  if (!eidoModules.has(name)) {
    eidoModules.set(name, (async () => {
      const r = await fetch(`/library/eidoverse/${name}`);
      if (!r.ok) throw new Error(`module ${name}: ${r.status}`);
      const src = await r.text();
      denoFiles.set(`eidoverse/${name}`, new TextEncoder().encode(src)); // self-prime
      (0, eval)(src); // same indirect-eval hosting as the engine
    })());
  }
  return eidoModules.get(name);
}

export { VRMUtils, skeletonClone };
