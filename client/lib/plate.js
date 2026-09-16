// plate — the browser realization of `comp {type:"plate"}` (vocab-10).
//
// Wires itself to the comp and entity buses on import (the door.js /
// emitters.js pattern — no boot step of its own; main.js imports this file
// for its side effects beside './lib/door.js'). The inscription is NEVER
// tween state: the sprite is REDRAWN only when the folded comp changes (a
// write, a re-author, a remove); position rides the entity (child anchor,
// the emitters doctrine — every place/mount/motion carries it); the frame
// tick only fades and scales by camera distance (the nameplate law —
// a sign you cannot read across the stage is a wall of text). State is
// derived from the same folded comp the server writes and the mcpl text
// tier reads: a late joiner, a reconnect, and this tab agree for free.

import { THREE, bus, camera } from './core.js';
import { entities, comps } from './world.js';
import { registerSystem } from './frame.js';
import { normalizePlate } from '../../shared/plate.js';
// vocab-27: the guestbook × plate composition — a bridged plate's surface
// DERIVES from the book's newest inscription (derive, never mint).
import { bookplateText } from '../../shared/bookplate.js';

/** id -> { sprite: THREE.Sprite|null, want: string } — tracked plates.
 *  The sprite attaches once the entity's object exists (async GLB load:
 *  the door.js findPart retry doctrine, resolved per frame). */
const plates = new Map();

// parchment on ink — deliberately NOT the nameplate's mint-on-dark: a
// placed sign is furniture, not a person.
const INK = '#3a3226';
const PAPER = 'rgba(242,232,213,0.93)';

function wrapText(text, maxChars) {
  const out = [];
  for (const para of String(text).split(/\n/)) {
    let line = '';
    for (const word of para.split(/\s+/)) {
      // a word longer than the line hard-slices (urls, "y"×480)
      for (const chunk of word.match(new RegExp(`.{1,${maxChars}}`, 'g')) ?? ['']) {
        if (!line) line = chunk;
        else if ((line + ' ' + chunk).length <= maxChars) line += ' ' + chunk;
        else { out.push(line); line = chunk; }
      }
    }
    out.push(line);
  }
  return out.slice(0, 6);   // six lines is a poster, not a plate
}

function drawPlate(text) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  const lines = wrapText(text || '', 26);
  ctx.font = 'bold 30px ui-monospace, monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lineH = 38;
  const blockH = Math.max(64, lines.length * lineH + 24);
  const top = (256 - blockH) / 2;
  const w = Math.min(488, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 56);
  ctx.fillStyle = PAPER;
  ctx.beginPath(); ctx.roundRect((512 - w) / 2, top, w, blockH, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(58,50,38,0.55)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect((512 - w) / 2, top, w, blockH, 14); ctx.stroke();
  ctx.fillStyle = INK;
  lines.forEach((l, i) => ctx.fillText(l, 256, top + 24 + i * lineH + lineH / 2 - 6));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const s = new THREE.Sprite(mat);
  s.renderOrder = 98;   // under nameplates (people outrank furniture)
  return s;
}

const dispose = (sprite) => { sprite?.material.map?.dispose(); sprite?.material.dispose(); };

function untrack(id) {
  const p = plates.get(id);
  if (!p) return;
  if (p.sprite) { p.sprite.parent?.remove(p.sprite); dispose(p.sprite); }
  plates.delete(id);
}

// the bag arrives folded (join snapshot) or live (comp bus) — one path.
// A data change redraws the sprite; a data null retires it.
// vocab-27: `want` is the BRIDGE derivation — the plate's own pin when
// present, else (bridged + blank) the book's newest words, so a tracked
// plate's surface follows the register it faces. comps is synced by
// models.js BEFORE the per-type emit, so the paired bag is already fresh.
function onPlateComp(id, data) {
  if (data == null) { untrack(id); return; }
  const want = bookplateText(data, comps.get(id)?.guestbook) || '';
  const cur = plates.get(id);
  if (cur && cur.want === want) return;   // not a words change (reach, h…)
  if (cur) { if (cur.sprite) { cur.sprite.parent?.remove(cur.sprite); dispose(cur.sprite); cur.sprite = null; } }
  plates.set(id, { sprite: null, want });
}

bus.on('comp', ({ id, type, data }) => {
  if (type === 'plate') onPlateComp(id, data);
  // vocab-27: a guestbook write (or removal) re-derives a bridged plate's
  // surface — the register's newest line becomes the sign with zero
  // traffic; a book leaving darkens the mirror. Non-bridged entities are
  // untracked-or-plain and re-derive to the same words they already read.
  else if (type === 'guestbook') onPlateComp(id, comps.get(id)?.plate ?? null);
});
bus.on('entity', ({ id, kind }) => {
  if (kind === 'remove' || kind === 'demote') untrack(id);
});
bus.on('world-reset', () => { for (const id of [...plates.keys()]) untrack(id); });

function tickPlate() {
  for (const [id, p] of plates) {
    const obj = entities.get(id);
    if (!obj || obj.userData?.placeholder) continue;   // not loaded yet — retry next frame
    // (re-)derive h from the live bag: a re-author can move the anchor.
    // vocab-27: the words gate is the BRIDGE derivation too — a bridged
    // plate hangs (and keeps) its sprite for the register's newest line.
    const bag = comps.get(id);
    const data = bag?.plate;
    const cfg = data ? normalizePlate(data).cfg : null;
    const want = data ? (bookplateText(data, bag?.guestbook) || '') : '';
    if (!cfg || want !== p.want) { onPlateComp(id, data); continue; }
    if (!p.sprite) {
      if (!want) continue;                  // blank surface: nothing to hang
      p.sprite = drawPlate(want);
      obj.add(p.sprite);
    }
    p.sprite.position.set(0, cfg.h, 0);
    // the nameplate law, signs edition: readable to ~30m, then fades over
    // 12m; gentle size hold at range so a trailhead sign stays legible.
    const d = obj.getWorldPosition(_v).distanceTo(camera.position);
    const vis = THREE.MathUtils.clamp(1 - (d - 30) / 12, 0, 1);
    p.sprite.material.opacity = vis;
    p.sprite.visible = vis > 0.02;
    const lw = 1.7 * (1 + Math.max(0, d - 8) * 0.012);
    p.sprite.scale.set(lw, lw * 256 / 512, 1);
  }
}

const _v = new THREE.Vector3();
// motion-adjacent like doors: state-derived, keyed off the plate comp;
// runs each frame, cheap (a Map over plates only, redraw only on change)
registerSystem('plate', () => tickPlate());
