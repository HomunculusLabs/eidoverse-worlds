// build — the human's authoring surface.
//
// Before this, a person could ADD to a world and never move, correct, or
// unmake anything in it: `place` and `remove` were server-allowed and agent-
// reachable, but there was no UI for either, so every misplacement was
// permanent and there was no undo. Agents had a richer verb surface than
// people. That is what this module fixes.
//
// Placement helpers are the drag semantics, per DESIGN.md: the ghost lands ON
// the table rather than beside it, because the collider tops that already
// compute walkable ground are the same data as "what can I put things on".

import { THREE, scene, camera, canvas, CONFIG, report, bus } from './core.js';
import { loadGLB, libLabels, listLibrary } from './assets.js';
import { makeLightGizmo } from './lights.js';
import { entities, entityMeta } from './world.js';
import { surfaceUnder, reindexCollider } from './colliders.js';
import { heightAt } from './terrain.js';
import { sendVerb, sendDrag } from './net.js';
import { myState, mouse, setPointerClaim, setEditingProbe } from './controller.js';
import { makeSection, toast, flashHint, collapseAll, panelFrame } from './ui.js';
import { previewSky, skyArgs, WEATHERS, CLOUDS, SKY_WORLDS,
  CLOUD_QUALITY, getCloudQuality, setCloudQuality } from './sky.js';

const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _hit = new THREE.Vector3();

// The starter vocabulary. Everything else arrives through the catalog or an
// `asset` verb, so this list is a doorway, not a limit.
const STARTER = [
  ['crate (red)', 'eidoverse/assets/models/crate_large_red.glb'],
  ['crate (blue)', 'eidoverse/assets/models/crate_large_blue.glb'],
  ['palm tree', 'eidoverse/assets/models/palm_date_tree_tropical_deseert_oasis_plant.glb'],
  ['joshua tree', 'eidoverse/assets/models/stylized_yucca_joshua_tree_desert_cactus_plant.glb'],
  ['streetlight', 'eidoverse/assets/models/streetlight_lamp_light_street_blade_runner_cyberpunk.glb'],
  ['deco desk', 'eidoverse/assets/models/scifi_art_deco_office_desk.glb'],
  ['retro computer', 'eidoverse/assets/models/scif_cyberpunk_crt_retro_computer_monitor_screen_keyboard_tower.glb'],
  ['barrels', 'eidoverse/assets/models/scifi_barrels_group_of_four.glb'],
];

// ============================================================ state

let ghost = null;         // { obj, lib, yaw, scale } — a thing not yet placed
let selected = null;      // { id, obj, box } — a placed thing under edit
let dragging = null;      // { id, offset, plane } while moving a selection
const undoStack = [];     // inverse entries, newest last

// Editing is a MODE.
//
// It was always-live, on the theory that "select anything, any time" is closer
// to the one-verb-surface ideal. In a world you look around by dragging, that
// theory is wrong: every camera drag that happens to start on an object picks
// it up and moves it, and the world quietly rearranges itself while you are
// just trying to see. Looking is the default; editing is something you say you
// are doing.
let editMode = false;
export const isEditing = () => editMode;

export function setEditMode(on, { quiet = false } = {}) {
  if (editMode === on) return editMode;
  editMode = on;
  document.body.classList.toggle('edit-mode', on);
  if (!on) { cancelGhost(); deselect(); }
  // Saying you are building should put the tools in front of you — B is now
  // the mode, so the catalog needs to arrive with it rather than behind a
  // separate keystroke nobody will guess.
  if (on) panelFrame().show();
  if (!quiet) {
    flashHint(on
      ? 'edit mode — click to select · drag to move · <b>build</b> for the catalog · <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo · <kbd>Esc</kbd> to leave'
      : 'looking again');
  }
  bus.emit('edit-mode', on);
  return editMode;
}
export const toggleEditMode = () => setEditMode(!editMode);

export const hasGhost = () => ghost !== null;
export const hasSelection = () => selected !== null;
setPointerClaim(() => ghost !== null || !!dragging?.armed);
setEditingProbe(() => editMode);

// ============================================================ selection

const outline = new THREE.Box3Helper(new THREE.Box3(), 0x8fe8c8);
outline.visible = false;
outline.userData.noCamCollide = true;
scene.add(outline);

let inspector = null;
function showInspector(id) {
  const meta = entityMeta.get(id) ?? {};
  if (!inspector) {
    inspector = document.createElement('div');
    inspector.className = 'panel';
    inspector.style.cssText = `position:fixed; left:50%; bottom:64px; transform:translateX(-50%);
      z-index:7; padding:9px 13px; font-size:var(--fs-sm); display:flex; gap:14px; align-items:center;`;
    document.body.appendChild(inspector);
  }
  const label = libLabels.get(meta.lib) ?? meta.lib?.split('/').pop()?.replace(/\.glb$/, '') ?? id;
  inspector.innerHTML =
    `<span><b>${label.slice(0, 34)}</b></span>` +
    `<span style="color:var(--dim)">by ${meta.actor ?? '?'}</span>` +
    `<span style="color:var(--dim)">drag move · <kbd>Shift</kbd>+drag or <kbd>R</kbd><kbd>F</kbd> up/down · ` +
    `<kbd>Q</kbd><kbd>E</kbd> turn · <kbd>,</kbd><kbd>.</kbd> size · <kbd>Del</kbd> remove · <kbd>Esc</kbd> done</span>`;
  inspector.style.display = 'flex';
}
function hideInspector() { if (inspector) inspector.style.display = 'none'; }

export function select(id) {
  const obj = entities.get(id);
  if (!obj) return;
  selected = { id, obj };
  outline.box.setFromObject(obj);
  outline.visible = true;
  showInspector(id);
}
export function deselect() {
  selected = null;
  dragging = null;
  outline.visible = false;
  hideInspector();
}
function refreshOutline() {
  if (selected) outline.box.setFromObject(selected.obj);
}

// ============================================================ ghost placement

function ghostify(obj) {
  obj.traverse((o) => {
    if (!o.isMesh) return;
    o.material = o.material.clone();
    o.material.transparent = true;
    o.material.opacity = 0.55;
    o.material.depthWrite = false;
    o.castShadow = false;
  });
  obj.userData.noCamCollide = true;
}

export async function holdGhost(lib, label) {
  setEditMode(true, { quiet: true });   // choosing a thing to place is intent enough
  cancelGhost();
  deselect();
  try {
    let obj;
    if (lib === '@light') {
      obj = makeLightGizmo(0xffd9a0);
      obj.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.7; } });
    } else {
      obj = await loadGLB(lib);
      ghostify(obj);
    }
    ghost = { obj, lib, yaw: 0, scale: 1 };
    scene.add(obj);
    collapseAll();
    flashHint(lib === '@light'
      ? 'placing a <b>light</b> — click to place · <kbd>Esc</kbd> cancel'
      : `placing <b>${label ?? ''}</b> — click to place · <kbd>Q</kbd><kbd>E</kbd> turn · <kbd>,</kbd><kbd>.</kbd> size · <kbd>Esc</kbd> cancel`, 6000);
  } catch (e) { report('ghost', e); }
}

export function cancelGhost() {
  if (ghost) { scene.remove(ghost.obj); ghost = null; }
}

/** Where the pointer is aiming, snapped onto whatever surface is under it.
 *  Raycasting real entities first is what turns "drops at y=0 beside the
 *  table" into "lands on the table". */
function aimPoint(skipId = null) {
  raycaster.setFromCamera(mouse, camera);
  const targets = [];
  for (const [id, o] of entities) if (o && id !== skipId) targets.push(o);
  const hits = raycaster.intersectObjects(targets, true);
  if (hits.length) {
    const h = hits[0];
    // only treat near-horizontal faces as placement surfaces — a wall should
    // not catch a chair
    const n = h.face?.normal ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : null;
    if (!n || n.y > 0.6) return { point: h.point.clone(), onto: h.object.userData.entityId ?? null };
  }
  if (raycaster.ray.intersectPlane(groundPlane, _hit)) {
    // clamp to placeable range — a ray toward the horizon meets the ground
    // plane hundreds of metres out
    const d = _hit.clone().sub(myState.pos); d.y = 0;
    const MAX = 20;
    if (d.length() > MAX) _hit.copy(myState.pos).addScaledVector(d.normalize(), MAX);
    return { point: new THREE.Vector3(_hit.x, heightAt(_hit.x, _hit.z), _hit.z), onto: null };
  }
  return null;
}

export function updateBuild() {
  if (ghost) {
    const aim = aimPoint();
    if (aim) {
      ghost.obj.position.copy(aim.point);
      ghost.obj.rotation.y = ghost.yaw;
      ghost.obj.scale.setScalar(ghost.scale);
    }
  }
  if (dragging?.armed && selected) {
    if (dragging.vertical) {
      // map screen-vertical pixels to world metres at the object's depth, so a
      // drag feels the same whether the thing is near or far
      const fov = camera.fov * Math.PI / 180;
      const pxToWorld = (2 * dragging.depth * Math.tan(fov / 2)) / innerHeight;
      const dy = (dragging.startY - dragging.clientY) * pxToWorld;   // up = raise
      const floor = heightAt(dragging.startPos.x, dragging.startPos.z);
      const y = Math.max(floor, dragging.startPos.y + dy);
      selected.obj.position.set(dragging.startPos.x, y, dragging.startPos.z);
      reindexCollider(selected.id);
      refreshOutline();
      relayDrag();
    } else {
      const aim = aimPoint(selected.id);
      if (aim) {
        // Keep the grab offset. Without it the object teleports so that its
        // ORIGIN sits under the cursor, which is both a jump and usually wrong —
        // you grabbed a crate by its corner, not by its pivot.
        selected.obj.position.copy(aim.point).add(dragging.grab);
        // dropping onto a surface should still rest ON it, not float by the
        // offset you happened to grab at
        if (aim.onto) selected.obj.position.y = aim.point.y;
        reindexCollider(selected.id);
        refreshOutline();
        relayDrag();
      }
    }
  }
}

// relay at pose cadence so others see it move, not teleport
function relayDrag() {
  const now = performance.now();
  if (now - (dragging.lastSent ?? 0) < 66) return;
  dragging.lastSent = now;
  const p = selected.obj.position;
  sendDrag(selected.id, [p.x, p.y, p.z], selected.obj.rotation.y);
}

// remote drags: apply transiently, no log involvement
bus.on('drag', ({ id, pos, yaw }) => {
  const obj = entities.get(id);
  if (!obj) return;
  obj.position.set(...pos);
  if (yaw != null) obj.rotation.y = yaw;
  reindexCollider(id);
});

// ============================================================ commits + undo

function pushUndo(inverse, describe) {
  undoStack.push({ inverse, describe });
  while (undoStack.length > 40) undoStack.shift();
}

function commitSpawn() {
  const p = ghost.obj.position;
  const id = crypto.randomUUID().slice(0, 8);
  if (ghost.lib === '@light') {
    // lift a placed light off the floor a touch so it reads as a hanging bulb
    sendVerb('light', { id, pos: [p.x, p.y + 0.9, p.z], color: 0xffd9a0, intensity: 16, range: 10 });
    pushUndo({ verb: 'remove', args: { id } }, 'light');
    cancelGhost();
    return;
  }
  sendVerb('spawn', {
    id, lib: ghost.lib,
    pos: [p.x, p.y, p.z], yaw: ghost.yaw,
    ...(ghost.scale !== 1 ? { scale: ghost.scale } : {}),
  });
  pushUndo({ verb: 'remove', args: { id } }, 'spawn');
  cancelGhost();
}

function commitPlace(before) {
  if (!selected) return;
  const o = selected.obj;
  sendVerb('place', {
    id: selected.id,
    pos: [o.position.x, o.position.y, o.position.z],
    yaw: o.rotation.y,
    scale: o.scale.x,
  });
  pushUndo({ verb: 'place', args: { id: selected.id, ...before } }, 'move');
}

function snapshotOf(obj) {
  return { pos: [obj.position.x, obj.position.y, obj.position.z], yaw: obj.rotation.y, scale: obj.scale.x };
}

export function undo() {
  const step = undoStack.pop();
  if (!step) { flashHint('nothing to undo'); return; }
  // Undo is inverse ENTRIES — history stays append-only, which is what keeps
  // the log replayable and the world forkable.
  sendVerb(step.inverse.verb, step.inverse.args);
  flashHint(`undid ${step.describe}`);
  deselect();
}

function removeSelected() {
  if (!selected) return;
  const meta = entityMeta.get(selected.id) ?? {};
  const snap = snapshotOf(selected.obj);
  sendVerb('remove', { id: selected.id });
  pushUndo({ verb: 'spawn', args: { id: selected.id, lib: meta.lib, ...snap } }, 'removal');
  deselect();
}

// ============================================================ pointer

canvas.addEventListener('mousedown', (e) => {
  if (e.button !== 0 || !editMode) return;  // outside edit mode the canvas is for looking
  if (ghost) return;                        // click-to-place handled on click
  // Pick from THIS event's coordinates. Relying on the last mousemove to have
  // left `mouse` in the right place works for a real pointer and fails for
  // anything that presses without moving first — a touch, a synthetic click,
  // a tab that regained focus under the cursor.
  mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  const targets = [];
  for (const o of entities.values()) if (o) targets.push(o);
  const hit = raycaster.intersectObjects(targets, true)[0];
  if (!hit) { if (selected) deselect(); return; }
  let root = hit.object;
  while (root && !root.userData.entityId) root = root.parent;
  if (!root) return;
  const id = root.userData.entityId;
  select(id);
  // A press is a SELECT. It only becomes a drag once the pointer actually
  // travels — otherwise clicking a thing to look at its label moved it.
  const aim = aimPoint(id);
  dragging = {
    id,
    before: snapshotOf(root),
    lastSent: 0,
    armed: false,
    startX: e.clientX,
    startY: e.clientY,
    clientY: e.clientY,
    // Shift held at grab = a VERTICAL drag: the ground-plane raycast can't
    // express height, so hold Shift and the pointer's up/down maps to world Y
    // with the horizontal position pinned. The standard editor gesture.
    vertical: e.shiftKey,
    startPos: entities.get(id).position.clone(),
    depth: camera.position.distanceTo(entities.get(id).position),
    grab: aim ? entities.get(id).position.clone().sub(aim.point) : new THREE.Vector3(),
  };
  e.preventDefault();
});

// Arm the drag only after a few pixels of travel — the same threshold every
// desktop UI uses to tell a click from a drag.
const DRAG_SLOP = 4;
addEventListener('mousemove', (e) => {
  if (!dragging) return;
  dragging.clientY = e.clientY;                 // vertical drag reads this each frame
  if (!dragging.armed
      && Math.hypot(e.clientX - dragging.startX, e.clientY - dragging.startY) > DRAG_SLOP) {
    dragging.armed = true;
  }
});

addEventListener('mouseup', () => {
  if (dragging?.armed && selected) {
    const moved = dragging.before;
    const o = selected.obj;
    const same = Math.abs(o.position.x - moved.pos[0]) < 0.005
      && Math.abs(o.position.y - moved.pos[1]) < 0.005
      && Math.abs(o.position.z - moved.pos[2]) < 0.005;
    if (!same) commitPlace(moved);          // release commits ONE clean entry
  }
  dragging = null;
});

canvas.addEventListener('click', (e) => {
  if (!ghost || !editMode) return;
  commitSpawn();
  e.preventDefault();
});

// ============================================================ keys

bus.on('key', (e) => {
  if (e.code === 'Escape') {
    if (ghost) cancelGhost();
    else if (selected) deselect();
    else if (editMode) setEditMode(false);
    return;
  }
  // Undo stays available outside edit mode — you may only notice the mistake
  // after you have gone back to looking.
  if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') { e.preventDefault(); undo(); return; }
  if (!editMode) return;

  const turn = (d) => {
    if (ghost) ghost.yaw += d;
    else if (selected) {
      const before = snapshotOf(selected.obj);
      selected.obj.rotation.y += d;
      reindexCollider(selected.id); refreshOutline();
      commitPlace(before);
    }
  };
  const size = (f) => {
    if (ghost) ghost.scale = THREE.MathUtils.clamp(ghost.scale * f, 0.1, 12);
    else if (selected) {
      const before = snapshotOf(selected.obj);
      selected.obj.scale.multiplyScalar(f);
      selected.obj.scale.clampScalar(0.1, 12);
      reindexCollider(selected.id); refreshOutline();
      commitPlace(before);
    }
  };
  // R/F raise/lower — the keyboard counterpart to Shift+drag, for precise
  // heights. Never underground. (R is ragdoll globally, but that is gated to
  // NOT fire while editing, so it is free here.)
  const raise = (dy) => {
    if (ghost) { ghost.obj.position.y = Math.max(0, ghost.obj.position.y + dy); return; }
    if (!selected) return;
    const before = snapshotOf(selected.obj);
    const floor = heightAt(selected.obj.position.x, selected.obj.position.z);
    selected.obj.position.y = Math.max(floor, selected.obj.position.y + dy);
    reindexCollider(selected.id); refreshOutline();
    commitPlace(before);
  };
  // Q/E only steer objects when something is being edited — otherwise they're
  // photo-mode fly keys and must stay free.
  if (ghost || selected) {
    if (e.code === 'KeyQ') turn(e.shiftKey ? 0.02 : Math.PI / 12);
    if (e.code === 'KeyE') turn(e.shiftKey ? -0.02 : -Math.PI / 12);
    if (e.code === 'Comma') size(0.92);
    if (e.code === 'Period') size(1.087);
    if (e.code === 'KeyR') raise(e.shiftKey ? 0.05 : 0.25);
    if (e.code === 'KeyF') raise(e.shiftKey ? -0.05 : -0.25);
  }
  if ((e.code === 'Delete' || e.code === 'Backspace') && selected) removeSelected();
});

// ============================================================ palette UI

let buildSec = null;

export function initPalette() {
  buildSec = makeSection('🧱 build', async (body) => { if (!body.dataset.init) await paintBuild(body); },
    { id: 'build' });
  makeSection('🧍 avatar', paintAvatars, { id: 'avatar' });
  makeSection('☀ sky', paintSky, { id: 'sky' });
  return { buildSec };
}

export function toggleBuildMenu() { buildSec?.toggle(); }

// ---- models ----------------------------------------------------------------

async function paintBuild(body) {
  body.dataset.init = '1';
  body.innerHTML = '';

  // primitives that aren't library models — a light is the first
  const prim = document.createElement('button');
  prim.textContent = '💡 add light';
  prim.title = 'place a light source';
  prim.onclick = () => holdGhost('@light', 'light');
  body.appendChild(prim);

  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'search the library…';
  search.addEventListener('keydown', (e) => e.stopPropagation()); // typing ≠ walking
  body.appendChild(search);

  const grid = document.createElement('div');
  grid.className = 'grid';
  body.appendChild(grid);

  const paint = (items) => {
    grid.innerHTML = '';
    for (const it of items) {
      libLabels.set(it.path, it.name);
      const card = document.createElement('button');
      card.className = 'card panel';
      const img = it.preview
        ? `<img alt="" loading="lazy" src="/library/${it.preview}" onerror="this.style.visibility='hidden'">`
        : '<div style="width:100%;aspect-ratio:1"></div>';
      card.innerHTML = `${img}<span>${it.name}</span>`;
      card.onclick = () => holdGhost(it.path, it.name);
      grid.appendChild(card);
    }
    if (!items.length) grid.innerHTML = '<div style="color:var(--dim);font-size:11px">nothing matched</div>';
  };

  // The catalog agents already had (mcpl list_library), now served to people —
  // with the _preview.jpg Skye ships beside every model, so it's a real
  // catalog instead of a list of filenames.
  const starter = () => STARTER.map(([name, path]) =>
    ({ name, path, preview: path.replace(/\.glb$/, '_preview.jpg') }));

  let timer = null;
  const run = async (q) => {
    // An empty box shows the curated starters, not an alphabetical dump of the
    // whole library — otherwise opening the panel greets you with four
    // varieties of apocalyptic rubble.
    if (!q) { paint(starter()); return; }
    try {
      const r = await fetch(`/library-models?q=${encodeURIComponent(q)}`);
      paint(await r.json());
    } catch (e) { report('catalog', e); }
  };
  search.oninput = () => { clearTimeout(timer); timer = setTimeout(() => run(search.value.trim()), 160); };

  paint(starter());
}

// Assets uploaded into the world join the palette live, for everyone.
bus.on('asset', ({ name, path }) => {
  libLabels.set(path, name);
  toast(`${name} joined the world's palette`, 'info');
});

// ---- avatars ---------------------------------------------------------------

let onSwitchAvatar = null;
export function wireAvatarSwitch(fn) { onSwitchAvatar = fn; }
let myAvatarPath = '';
export function setMyAvatarPath(p) { myAvatarPath = p; }

async function paintAvatars(body) {
  const list = await fetch('/avatars').then((r) => r.json()).catch(() => []);
  body.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'grid';
  for (const { name, path } of list) {
    const card = document.createElement('button');
    card.className = `card panel ${path === myAvatarPath ? 'on' : ''}`;
    card.innerHTML =
      `<img alt="" loading="lazy" src="/thumb/${encodeURIComponent(name)}.png"
         onerror="this.parentNode.querySelector('.ph').style.display='flex';this.style.display='none'">
       <div class="ph" style="display:none;width:100%;aspect-ratio:1;align-items:center;
         justify-content:center;background:rgba(0,0,0,.3);border-radius:4px;font-size:18px">🧍</div>
       <span>${name}</span>`;
    card.onclick = () => onSwitchAvatar?.(path, name);
    grid.appendChild(card);
  }
  body.appendChild(grid);
}

// ---- sky + weather ---------------------------------------------------------

const SLIDERS = [
  ['hours', 'time', 0, 24, 0.1, 12],
  ['rate', 'rate', 0, 48, 0.5, 0],
  ['azimuth', 'azim', 0, 360, 5, 180],
  ['sun', 'sun', 0, 2.5, 0.05, 1],
  ['ambient', 'ambnt', 0, 2.5, 0.05, 1],
  ['fill', 'fill', 0, 2.5, 0.05, 1],
  ['exposure', 'expos', 0.3, 1.8, 0.05, 1],
  ['fog', 'fog', 0, 3, 0.05, 1],
];
// Named times beat eight raw sliders for the 95% case — you want "golden", not
// hours=17.4, exposure=0.86.
const PRESETS = {
  dawn: { hours: 6.4, clouds: 'stratus' },
  noon: { hours: 12, clouds: 'cumulus' },
  golden: { hours: 17.6, clouds: 'cumulus' },
  dusk: { hours: 19.4, clouds: 'cirrus' },
  night: { hours: 0.5, clouds: 'clear' },
};

function paintSky(body) {
  if (body.dataset.init) { syncSky(body); return; }
  body.dataset.init = '1';
  body.innerHTML = '';
  const inputs = {};
  const commit = document.createElement('button');

  // Everything in this panel PREVIEWS. Only the commit button writes to the
  // world.
  //
  // Presets and dropdowns used to send a verb on every click while the sliders
  // only previewed — so idly exploring the sky wrote 53 permanent entries into
  // one world's log, every one of which replays for every future joiner. The
  // log is history; trying things out is not.
  const local = {};
  const preview = (patch) => {
    Object.assign(local, patch);
    previewSky({ ...gather() }).catch((e) => report('sky preview', e));
    commit.classList.add('dirty');
  };

  const gather = () => {
    const a = { ...skyArgs() };
    for (const [key, , , , , dflt] of SLIDERS) {
      const v = Number(inputs[key].value);
      if (key === 'hours' || key === 'azimuth' || v !== dflt) a[key] = v;
    }
    return { ...a, ...local };
  };

  const mkRow = (label, node) => {
    const row = document.createElement('div');
    row.className = 'row';
    const nm = document.createElement('span');
    nm.className = 'nm'; nm.textContent = label;
    row.append(nm, node);
    return row;
  };

  // presets
  const presetWrap = document.createElement('div');
  presetWrap.style.cssText = 'display:flex; flex-wrap:wrap; gap:3px; margin-bottom:4px;';
  for (const [name, vals] of Object.entries(PRESETS)) {
    const b = document.createElement('button');
    b.textContent = name;
    b.style.flex = '1 0 auto';
    b.onclick = () => {
      inputs.hours.value = vals.hours;
      if (vals.clouds) cl.value = vals.clouds;
      inputs.hours.dispatchEvent(new Event('input'));   // previews via the slider path
      preview({ ...vals });
    };
    presetWrap.appendChild(b);
  }
  body.appendChild(presetWrap);

  // weather — a first-class verb, not a slider
  const wx = document.createElement('select');
  wx.style.cssText = 'font:11px var(--font); background:rgba(4,14,20,.9); color:var(--fg); border:1px solid var(--edge); border-radius:5px; padding:5px;';
  for (const w of WEATHERS) wx.appendChild(new Option(w, w));
  wx.onchange = () => preview({ weather: wx.value, weatherSeconds: 12 });
  body.appendChild(mkRow('wx', wx));

  const cl = document.createElement('select');
  cl.style.cssText = wx.style.cssText;
  for (const c of CLOUDS) cl.appendChild(new Option(c, c));
  cl.value = 'cumulus';
  cl.onchange = () => preview({ clouds: cl.value });
  body.appendChild(mkRow('cloud', cl));

  const wl = document.createElement('select');
  wl.style.cssText = wx.style.cssText;
  for (const w of SKY_WORLDS) wl.appendChild(new Option(w, w));
  wl.onchange = () => preview({ world: wl.value });
  body.appendChild(mkRow('world', wl));

  // Cloud budget is YOURS, not the world's — it never becomes a verb. The
  // volumetric march is the most expensive thing the client draws and its cost
  // is per-fragment, so a big high-refresh display pays several times what a
  // small window does for the same sky.
  const cq = document.createElement('select');
  cq.style.cssText = wx.style.cssText;
  for (const q of CLOUD_QUALITY) cq.appendChild(new Option(q, q));
  cq.value = getCloudQuality();
  cq.onchange = () => { setCloudQuality(cq.value); flashHint(`clouds: ${cq.value} (yours only)`); };
  const cqRow = mkRow('clouds⚙', cq);
  cqRow.title = 'local performance setting — not shared with the world';
  body.appendChild(cqRow);

  for (const [key, label, min, max, step, dflt] of SLIDERS) {
    const input = document.createElement('input');
    input.type = 'range';
    input.min = min; input.max = max; input.step = step; input.value = dflt;
    const val = document.createElement('span');
    val.className = 'v';
    val.textContent = dflt;
    input.oninput = () => {
      val.textContent = input.value;
      previewSky(gather()).catch((e) => report('sky preview', e));
      commit.classList.add('dirty');
    };
    inputs[key] = input;
    const row = mkRow(label, input);
    row.appendChild(val);
    body.appendChild(row);
  }

  commit.textContent = '✓ log to world';
  commit.title = 'share this sky with everyone, permanently';
  commit.onclick = () => {
    sendVerb('sky', gather());
    commit.classList.remove('dirty');
    commit.textContent = '✓ logged';
    setTimeout(() => { commit.textContent = '✓ log to world'; }, 1200);
  };
  body.appendChild(commit);

  body._sync = () => {
    const a = skyArgs();
    for (const [key, , , , , dflt] of SLIDERS) {
      inputs[key].value = a[key] ?? dflt;
      inputs[key].parentNode.querySelector('.v').textContent = inputs[key].value;
    }
    if (a.weather) wx.value = a.weather;
    if (a.clouds) cl.value = a.clouds;
    if (a.world) wl.value = a.world;
  };
  body._sync();
}
function syncSky(body) { body._sync?.(); }

// ============================================================ upload

addEventListener('dragover', (e) => e.preventDefault());
addEventListener('drop', async (e) => {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (!file) return;
  const isVrm = /\.vrm$/i.test(file.name);
  if (!/\.(glb|vrm)$/i.test(file.name)) {
    toast(`can't ingest ${file.name} — .glb and .vrm only`, 'warn');
    return;
  }
  toast(`uploading ${file.name} (${(file.size / 1e6).toFixed(1)}MB)…`, 'info');
  try {
    const q = new URLSearchParams();
    if (isVrm) { q.set('as', 'avatar'); q.set('name', file.name); }
    if (CONFIG.token) q.set('token', CONFIG.token);
    const r = await fetch(`/upload${q.size ? `?${q}` : ''}`, { method: 'POST', body: file });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    const { path, name } = await r.json();
    if (isVrm) {
      toast(`avatar "${name}" is on the roster — pick it in the avatar panel`, 'info', 9000);
    } else {
      const label = file.name.replace(/\.glb$/i, '');
      sendVerb('asset', { name: label, path });  // world vocabulary grows for everyone
      await holdGhost(path, label);
    }
  } catch (err) { report(`upload ${file.name}`, err); }
});
