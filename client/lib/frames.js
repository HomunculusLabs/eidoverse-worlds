// frames — movable, resizable, collapsible windows with a remembered layout.
//
// In a 3D client the scene IS the content, so where the chrome sits is a
// personal and per-task decision: someone building wants the catalog big and
// the chat small, someone performing wants the opposite, someone spectating
// wants almost nothing. A fixed rail can't serve all three.
//
// The model is the one MMO players already have in their hands: drag a frame
// by its title, drag its corner to resize, collapse it to a title bar, lock
// the whole layout when you're happy, and have it still be there tomorrow.

import { bus } from './core.js';

const LS = (id) => `ew-frame-${id}`;
const frames = new Map();
let zTop = 30;
let locked = localStorage.getItem('ew-ui-locked') === '1';

const SNAP = 11;            // px — edge and frame-to-frame snapping distance
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function isLocked() { return locked; }
export function setLocked(v) {
  locked = v;
  localStorage.setItem('ew-ui-locked', v ? '1' : '0');
  document.body.classList.toggle('ui-locked', locked);
  bus.emit('ui-locked', locked);
}
document.body.classList.toggle('ui-locked', locked);

/**
 * @param id       stable key for the saved layout
 * @param opts     { title, x, y, w, h, minW, minH, resizable, collapsible,
 *                   closable, hidden, onResize }
 *                 x/y accept negatives to anchor from the right/bottom edge.
 */
export function makeFrame(id, opts = {}) {
  if (frames.has(id)) return frames.get(id);
  const {
    title = id, w = 300, h = 220, minW = 170, minH = 90,
    resizable = true, collapsible = true, closable = true,
    hidden = false, onResize = null, className = '',
  } = opts;

  const root = document.createElement('div');
  root.className = `frame panel ${className}`;
  root.dataset.frame = id;

  const head = document.createElement('div');
  head.className = 'fr-head';
  const ttl = document.createElement('span');
  ttl.className = 'fr-title';
  ttl.textContent = title;
  const btns = document.createElement('span');
  btns.className = 'fr-btns';
  head.append(ttl, btns);

  const body = document.createElement('div');
  body.className = 'fr-body';

  const grip = document.createElement('div');
  grip.className = 'fr-grip';

  root.append(head, body);
  if (resizable) root.appendChild(grip);
  document.body.appendChild(root);

  // ---- state
  const saved = readSaved(id);
  const state = {
    x: saved?.x ?? resolveAnchor(opts.x, w, innerWidth),
    y: saved?.y ?? resolveAnchor(opts.y, h, innerHeight),
    w: saved?.w ?? w,
    h: saved?.h ?? h,
    collapsed: saved?.collapsed ?? false,
    hidden: saved?.hidden ?? hidden,
  };

  const api = {
    id, el: root, body, head,
    get state() { return { ...state }; },
    show() {
      state.hidden = false;
      paint();
      // A hidden element measures zero, so a frame created hidden never got a
      // real position — it has to be fitted the first time it becomes visible.
      if (!fitted) { fitted = true; fit(); }
      save(); raise();
      return api;
    },
    hide() { state.hidden = true; paint(); save(); return api; },
    toggle() { state.hidden ? api.show() : api.hide(); return api; },
    get visible() { return !state.hidden; },
    collapse(v = !state.collapsed) { state.collapsed = v; paint(); save(); return api; },
    setTitle(t) { ttl.textContent = t; return api; },
    /** decorate the title bar (unread counts, status pips, …) */
    badge(html) {
      let b = head.querySelector('.fr-badge');
      if (!html) { b?.remove(); return api; }
      if (!b) { b = document.createElement('span'); b.className = 'fr-badge'; ttl.after(b); }
      b.innerHTML = html;
      return api;
    },
    raise,
    resetLayout() {
      localStorage.removeItem(LS(id));
      Object.assign(state, {
        x: resolveAnchor(opts.x, w, innerWidth),
        y: resolveAnchor(opts.y, h, innerHeight),
        w, h, collapsed: false, hidden,
      });
      paint();
      return api;
    },
  };

  function raise() { root.style.zIndex = String(++zTop); }
  function save() {
    localStorage.setItem(LS(id), JSON.stringify(state));
  }
  function paint() {
    root.style.display = state.hidden ? 'none' : 'flex';
    root.style.left = `${state.x}px`;
    root.style.top = `${state.y}px`;
    root.style.width = `${state.w}px`;
    root.classList.toggle('collapsed', state.collapsed);
    body.style.height = state.collapsed ? '0' : `${state.h}px`;
    if (!state.collapsed) onResize?.(state.w, state.h);
  }

  // ---- buttons
  if (collapsible) {
    const b = document.createElement('button');
    b.className = 'fr-btn';
    b.title = 'collapse';
    b.textContent = '–';
    b.onclick = (e) => { e.stopPropagation(); api.collapse(); };
    btns.appendChild(b);
  }
  if (closable) {
    const b = document.createElement('button');
    b.className = 'fr-btn';
    b.title = 'close';
    b.textContent = '✕';
    b.onclick = (e) => { e.stopPropagation(); api.hide(); };
    btns.appendChild(b);
  }

  // ---- dragging
  head.addEventListener('pointerdown', (e) => {
    if (locked || e.target.closest('.fr-btn')) return;
    e.preventDefault();
    raise();
    const ox = e.clientX - state.x, oy = e.clientY - state.y;
    // capture can throw for a pointer id the browser doesn't know (synthetic
    // events, some touch stacks) — losing capture is survivable, aborting the
    // whole drag is not
    try { head.setPointerCapture(e.pointerId); } catch { /* no capture */ }
    const move = (ev) => {
      state.x = ev.clientX - ox;
      state.y = ev.clientY - oy;
      snapPosition(id, state, root.offsetHeight);
      paint();
    };
    const up = () => {
      head.removeEventListener('pointermove', move);
      head.removeEventListener('pointerup', up);
      save();
    };
    head.addEventListener('pointermove', move);
    head.addEventListener('pointerup', up);
  });
  // Alt+drag anywhere on the frame — the MMO habit, and it rescues a frame
  // whose title bar has been dragged off-screen.
  root.addEventListener('pointerdown', (e) => {
    if (locked || !e.altKey) return;
    e.preventDefault(); e.stopPropagation();
    head.dispatchEvent(new PointerEvent('pointerdown', e));
  }, true);

  // ---- resizing
  grip.addEventListener('pointerdown', (e) => {
    if (locked) return;
    e.preventDefault(); e.stopPropagation();
    raise();
    const sx = e.clientX, sy = e.clientY, sw = state.w, sh = state.h;
    try { grip.setPointerCapture(e.pointerId); } catch { /* no capture */ }
    const move = (ev) => {
      state.w = clamp(sw + (ev.clientX - sx), minW, innerWidth - 20);
      state.h = clamp(sh + (ev.clientY - sy), minH, innerHeight - 60);
      state.collapsed = false;
      paint();
    };
    const up = () => {
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', up);
      save();
    };
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
  });

  root.addEventListener('pointerdown', raise);
  head.addEventListener('dblclick', () => api.collapse());

  frames.set(id, api);
  paint();
  // The anchor was computed from the BODY height, but a frame is also a title
  // bar and whatever padding its content carries — so a bottom-anchored frame
  // hung its composer off the screen. Measure once it exists and pull it back.
  let fitted = false;
  if (!saved && !state.hidden) { fitted = true; fit(); }
  addEventListener('resize', fit);

  function fit() {
    const hh = root.offsetHeight;
    if (!hh) return;
    if (opts.y != null && opts.y < 0) state.y = Math.max(8, innerHeight + opts.y - hh);
    state.y = clamp(state.y, 8, Math.max(8, innerHeight - hh - 8));
    state.x = clamp(state.x, 8, Math.max(8, innerWidth - state.w - 8));
    paint();
  }

  return api;
}

function resolveAnchor(v, size, extent) {
  if (v == null) return 40;
  return v < 0 ? Math.max(8, extent + v - size) : v;
}

function readSaved(id) {
  try { return JSON.parse(localStorage.getItem(LS(id)) ?? 'null'); } catch { return null; }
}

/** Edge snapping, plus snapping to the other frames' edges — it's what makes a
 *  hand-arranged layout look deliberate instead of approximate. */
function snapPosition(id, state, height) {
  const edges = [{ x: 8 }, { x: innerWidth - state.w - 8 }, { y: 8 }, { y: innerHeight - height - 8 }];
  for (const o of frames.values()) {
    if (o.id === id || !o.visible) continue;
    const r = o.el.getBoundingClientRect();
    edges.push({ x: r.left }, { x: r.right - state.w }, { x: r.right + 6 }, { x: r.left - state.w - 6 });
    edges.push({ y: r.top }, { y: r.bottom - height }, { y: r.bottom + 6 }, { y: r.top - height - 6 });
  }
  for (const e of edges) {
    if (e.x != null && Math.abs(state.x - e.x) < SNAP) state.x = e.x;
    if (e.y != null && Math.abs(state.y - e.y) < SNAP) state.y = e.y;
  }
  state.x = clamp(state.x, -state.w + 60, innerWidth - 60);
  state.y = clamp(state.y, 0, innerHeight - 32);
}

// Keep frames reachable when the window shrinks.
addEventListener('resize', () => {
  for (const f of frames.values()) {
    const s = f.state;
    if (s.x > innerWidth - 60 || s.y > innerHeight - 32) {
      f.el.style.left = `${clamp(s.x, 8, innerWidth - 80)}px`;
      f.el.style.top = `${clamp(s.y, 8, innerHeight - 60)}px`;
    }
  }
});

export function getFrame(id) { return frames.get(id); }
export function allFrames() { return [...frames.values()]; }
export function resetLayout() {
  for (const f of frames.values()) f.resetLayout();
  setLocked(false);
}
