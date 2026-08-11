// hud — the one status line: connection dot, name @ world, fps, who else is
// here, the editing flag, the basic-sky note. Painted at 1Hz by the pulse
// system; fps comes from perf.js so this module never touches the loop.

import { CONFIG } from './core.js';
import { setHud } from './ui.js';
import { net } from './net.js';
import { remotes } from './remotes.js';
import { isEditing } from './build.js';
import { skyImpl } from './sky.js';
import { perf } from './perf.js';

const statusDot = {
  live: '<span class="ok">●</span>', connecting: '<span>○</span>',
  retrying: '<span class="bad">●</span>', rejected: '<span class="bad">✕</span>',
};

export function paintHud() {
  const n = remotes.size;
  // fps alone hides jank — a "60fps" second can hold one 100ms frame. The
  // ms is the honest number; the worst-of-last-second appears ONLY when it
  // broke a ~25ms budget (a silent HUD is the smooth-frame reward).
  const spike = perf.worst > 25 ? `  <span class="bad">▲${Math.round(perf.worst)}ms</span>` : '';
  setHud(
    `${statusDot[net.status] ?? ''} <b>${CONFIG.name}</b> @ ${CONFIG.world}   ` +
    `${perf.fps}fps ${perf.ms.toFixed(1)}ms${spike}   ${n} other${n === 1 ? '' : 's'}` +
    (isEditing() ? '   <span class="edit">✎ editing</span>' : '') +
    (skyImpl() === 'skymesh' ? '   <span style="opacity:.6">basic sky</span>' : ''),
  );
}
