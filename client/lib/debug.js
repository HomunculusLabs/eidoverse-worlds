// debug — draw what the physics actually thinks the world is.
//
// This exists because of a day spent proving by measurement that
// resolveColliders treated every box as an infinite column reaching down to
// the world floor: it never read box.min.y, so a mezzanine slab modelled at
// y 2.4-2.7 shoved a walking body 2.3m sideways at GROUND level. Finding that
// took a headless harness and a lot of printf. One wireframe would have shown
// it in a glance — the box on screen simply would not have been where the box
// on screen was.
//
// So: the collider volumes as the solver reads them, and the ragdoll as the
// solver reads it. Not the meshes — the COLLIDERS. Where the two disagree is
// the whole point, and a debug view that redraws the visible geometry would
// have shown nothing wrong on the day it mattered most.

import { THREE, scene } from './core.js';
import { MeshBVHHelper } from 'three-mesh-bvh';
import { colliders } from './colliders.js';
import { makeFrame } from './frames.js';

// box = an OBB, walkable on top, solid on the sides between min.y and max.y
// pillar = anything over 2.4m tall, collapsed to a slim centre column so you
//          can walk under a canopy
// exact  = collides against its actual triangles; a box would be a lie, so the
//          BVH is drawn instead
const KIND_COLOR = { box: 0x4fd8ff, pillar: 0xffb347, exact: 0x8fe8c8 };
const RAG_COLOR = { joint: 0xff8fb0, bone: 0xffd166 };

const _c = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _up = new THREE.Vector3(0, 1, 0);

let frame = null, providers = {}, statsEl = null, statsAt = 0, lastRun = null;
const on = { colliders: false, ragdoll: false };

// ---- shared geometry/material, so N colliders cost N transforms ------------
let unitBox = null, unitBall = null;
const lineMats = new Map();
const lineMat = (color) => {
  if (!lineMats.has(color)) {
    lineMats.set(color, new THREE.LineBasicMaterial({
      color, transparent: true, opacity: 0.85, depthWrite: false,
    }));
  }
  return lineMats.get(color);
};

let collGroup = null, ragGroup = null;
const collViews = new Map();   // entity id -> { kind, node }
let ragJoints = null, ragBones = null;

function ensureGroups() {
  if (!unitBox) unitBox = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
  if (!unitBall) unitBall = new THREE.WireframeGeometry(new THREE.SphereGeometry(1, 8, 5));
  if (!collGroup) {
    collGroup = new THREE.Group();
    collGroup.name = 'debug:colliders';
    collGroup.userData.isDebug = true;   // the sky's scene-diff must not adopt it
    scene.add(collGroup);
  }
  if (!ragGroup) {
    ragGroup = new THREE.Group();
    ragGroup.name = 'debug:ragdoll';
    ragGroup.userData.isDebug = true;
    scene.add(ragGroup);
  }
}

// ---- collider volumes ------------------------------------------------------

function kindOf(e) { return e.exact ? 'exact' : e.pillar ? 'pillar' : 'box'; }

/** The BVH, not a box: an exact entity collides against its triangles, and
 *  drawing a box around it would misrepresent the one case where the box is
 *  explicitly NOT the collider. Falls back to a box if the helper can't build,
 *  because a debug view that throws is worse than one that approximates. */
function exactView(entry) {
  try {
    const geo = entry.exact.bvh.geometry;
    const mesh = new THREE.Mesh(geo);
    mesh.geometry.boundsTree = entry.exact.bvh;
    const helper = new MeshBVHHelper(mesh, 8);
    helper.color.set(KIND_COLOR.exact);
    helper.opacity = 0.5;
    helper.depth = 8;
    helper.update?.();
    return helper;
  } catch {
    return new THREE.LineSegments(unitBox, lineMat(KIND_COLOR.exact));
  }
}

function syncColliders() {
  const seen = new Set();
  for (const [id, e] of colliders) {
    const kind = kindOf(e);
    seen.add(id);
    let view = collViews.get(id);
    if (!view || view.kind !== kind) {
      if (view) collGroup.remove(view.node);
      const node = kind === 'exact'
        ? exactView(e)
        : new THREE.LineSegments(unitBox, lineMat(KIND_COLOR[kind]));
      collGroup.add(node);
      view = { kind, node };
      collViews.set(id, view);
    }
    const { obj, box } = e;
    const s = obj.scale?.x || 1;
    view.node.quaternion.setFromAxisAngle(_up, obj.rotation.y);
    if (kind === 'exact') {
      view.node.position.copy(obj.position);
      view.node.scale.setScalar(s);
      continue;
    }
    // A pillar keeps its full height but only a slim centre footprint — the
    // clamp lives in LOCAL units, so it scales with the entity like the box.
    const half = kind === 'pillar' ? 0.25 : null;
    const cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2;
    _c.set(half ? cx : cx, (box.min.y + box.max.y) / 2, half ? cz : cz)
      .multiplyScalar(s).applyAxisAngle(_up, obj.rotation.y).add(obj.position);
    view.node.position.copy(_c);
    view.node.scale.set(
      (half ? half * 2 : box.max.x - box.min.x) * s,
      (box.max.y - box.min.y) * s,
      (half ? half * 2 : box.max.z - box.min.z) * s,
    );
  }
  for (const [id, view] of collViews) {
    if (seen.has(id)) continue;
    collGroup.remove(view.node);
    collViews.delete(id);
  }
}

// ---- the ragdoll's own idea of the body ------------------------------------
//
// Joint spheres at their MEASURED radii and the bone capsules between them —
// which is the model the solver actually integrates, and for a long time was
// not the model anyone believed it had (bones were beads, and limbs passed
// clean through the torso on all 14 rigs).

function syncRagdoll(rd) {
  const joints = Object.keys(rd.p);
  if (!ragJoints || ragJoints.count !== joints.length) {
    if (ragJoints) ragGroup.remove(ragJoints.mesh);
    const mesh = new THREE.InstancedMesh(
      unitBall, lineMat(RAG_COLOR.joint), joints.length);
    mesh.frustumCulled = false;
    ragGroup.add(mesh);
    ragJoints = { mesh, count: joints.length };
  }
  const m = new THREE.Matrix4();
  joints.forEach((j, i) => {
    const r = rd.radius?.[j] ?? 0.04;
    m.compose(rd.p[j], _q.identity(), _c.set(r, r, r));
    ragJoints.mesh.setMatrixAt(i, m);
  });
  ragJoints.mesh.instanceMatrix.needsUpdate = true;

  const caps = rd.caps ?? [];
  if (!ragBones || ragBones.count !== caps.length) {
    if (ragBones) ragGroup.remove(ragBones.line);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(caps.length * 6), 3));
    const line = new THREE.LineSegments(g, lineMat(RAG_COLOR.bone));
    line.frustumCulled = false;
    ragGroup.add(line);
    ragBones = { line, count: caps.length };
  }
  const pos = ragBones.line.geometry.getAttribute('position');
  caps.forEach((c, i) => {
    pos.setXYZ(i * 2, rd.p[c.a].x, rd.p[c.a].y, rd.p[c.a].z);
    pos.setXYZ(i * 2 + 1, rd.p[c.b].x, rd.p[c.b].y, rd.p[c.b].z);
  });
  pos.needsUpdate = true;
}

// ---- panel -----------------------------------------------------------------

function row(label, key, onChange) {
  const wrap = document.createElement('label');
  wrap.className = 'row dbg-row';
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = on[key];
  cb.onchange = () => { on[key] = cb.checked; onChange?.(cb.checked); };
  const nm = document.createElement('span');
  nm.textContent = label;
  wrap.append(cb, nm);
  return wrap;
}

/** @param p { ragdoll(), fps(), world() } — passed in rather than imported, so
 *  this module stays a leaf and never draws main.js into a cycle. */
export function initDebug(p = {}) {
  providers = p;
  frame = makeFrame('debug', {
    title: 'debug', x: -10, y: 320, w: 236, h: 226, minW: 200, hidden: true,
  });
  const stack = document.createElement('div');
  stack.className = 'stack';
  stack.append(
    row('collider volumes', 'colliders', (v) => { if (!v) clearColliders(); }),
    row('ragdoll skeleton', 'ragdoll', (v) => { if (!v) clearRagdoll(); }),
  );
  statsEl = document.createElement('pre');
  statsEl.className = 'dbg-stats';
  stack.appendChild(statsEl);
  frame.body.appendChild(stack);
  return frame;
}

export function toggleDebug() { frame?.toggle(); }
export const debugVisible = () => !!frame?.visible;

function clearColliders() {
  for (const [, v] of collViews) collGroup?.remove(v.node);
  collViews.clear();
}
function clearRagdoll() {
  if (ragJoints) { ragGroup?.remove(ragJoints.mesh); ragJoints = null; }
  if (ragBones) { ragGroup?.remove(ragBones.line); ragBones = null; }
}

const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '--');

export function updateDebug(now = performance.now()) {
  if (!frame) return;
  // F1 hides the UI for screenshots; debug lines are UI, whatever layer they
  // happen to live on
  const hidden = !frame.visible || document.body.classList.contains('photo');
  ensureGroups();
  collGroup.visible = !hidden && on.colliders;
  ragGroup.visible = !hidden && on.ragdoll;
  if (hidden) return;

  if (on.colliders) syncColliders();

  const rd = providers.ragdoll?.();
  if (on.ragdoll && rd?.p) syncRagdoll(rd); else if (!rd) clearRagdoll();

  if (now - statsAt < 200) return;      // the panel is for reading, not for fps
  statsAt = now;
  let box = 0, pillar = 0, exact = 0;
  for (const [, e] of colliders) {
    const k = kindOf(e);
    if (k === 'box') box++; else if (k === 'pillar') pillar++; else exact++;
  }
  const lines = [
    `fps      ${String(providers.fps?.() ?? 0).padStart(5)}`,
    `things   ${String(colliders.size).padStart(5)}`,
    `  box    ${String(box).padStart(5)}   walk on top, solid between`,
    `  pillar ${String(pillar).padStart(5)}   slim column, pass under`,
    `  exact  ${String(exact).padStart(5)}   trimesh (BVH)`,
  ];
  // A tumble's numbers are most worth reading the moment it STOPS, which is
  // exactly when main.js drops its reference and they would vanish. Keep the
  // last set and say plainly that it is the last one.
  if (rd?.p) {
    lastRun = [
      `  speed  ${fmt(rd.maxV, 3).padStart(5)} m/s`,
      `  still  ${fmt(rd.settledFor, 2).padStart(5)} s`,
      `  age    ${fmt(rd.elapsed, 2).padStart(5)} s`,
      `  joints ${String(Object.keys(rd.p).length).padStart(5)}`,
      `  pairs  ${String(rd.pairs?.length ?? 0).padStart(5)}   capsule tests`,
    ];
  }
  if (lastRun) lines.push('', `ragdoll  ${rd?.p ? 'active' : 'settled (last)'}`, ...lastRun);
  statsEl.textContent = lines.join('\n');
}
