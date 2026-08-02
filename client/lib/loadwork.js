// loadwork — where load-time CPU goes, measured and spread.
//
// "The client freezes for seconds when things load into the world." Two causes,
// two jobs here:
//
//   MEASURE — every heavy materialization (a body, a spawned model) runs as a
//   labelled work record with phases. The browser's own long-task entries are
//   attributed to whatever work was active when they happened, so a freeze
//   names its culprit in the console instead of being a vibe.
//
//   SPREAD + SERIALIZE — heavy main-thread work yields to the frame loop on a
//   per-frame budget, and at most ONE materialization finalizes at a time.
//   Three bodies arriving together used to stack their parse/compile bursts
//   into the same frames; now they queue, and the queue wait is visible as its
//   own phase rather than masquerading as parse time.
//
// ⚠️ INVARIANT: serialize() is for LEAF operations only (one parse, one
// compile). Never call serialize() from inside a serialized function and never
// wrap a caller that itself awaits a serialized callee — that is a deadlock,
// the chain waits on itself.

import { bus } from './core.js';

// ---- yields -----------------------------------------------------------------

/** Wait for the next animation frame — or a macrotask when the tab is hidden,
 *  where rAF never fires and an avatar load must still finish. */
export const nextFrame = () => new Promise((res) => {
  if (document.hidden) setTimeout(res, 0);
  else requestAnimationFrame(() => res());
});

/** Wait for browser idle time (bounded — loading must finish even on a busy
 *  frame loop), for background work like clip hydration. */
export const idleYield = () => new Promise((res) => {
  if (typeof requestIdleCallback === 'function' && !document.hidden) {
    requestIdleCallback(() => res(), { timeout: 400 });
  } else setTimeout(res, 32);
});

// While the splash still covers the screen nobody sees a dropped frame, so
// load work may take bigger bites; once someone is walking around, 60fps means
// ~16ms frames and load work gets a slice of that, not all of it.
let budgetMs = 14;
bus.on('booted', () => { budgetMs = 6; });

// ---- work records -----------------------------------------------------------

const active = new Set(); // in-flight records, for long-task attribution
const LOG_THRESHOLD_MS = 120;

/** Start a labelled piece of load work. Returns a record:
 *    phase(name)  — enter a named phase (closes the previous one)
 *    tick()       — await this inside loops; yields a frame when the current
 *                   slice is over budget, otherwise resolves immediately
 *    yield()      — unconditional yield to the next frame
 *    end()        — close and log one summary line if the work was heavy
 *  Wall time includes awaited downloads and queue waits — give them their own
 *  phases so the summary tells the truth about where time went. */
export function beginWork(label) {
  const t0 = performance.now();
  const phases = [];
  let phaseName = null;
  let phaseStart = t0;
  let sliceStart = t0;
  let frames = 0;
  let ended = false;

  const closePhase = () => {
    if (phaseName !== null) phases.push([phaseName, performance.now() - phaseStart]);
  };

  const rec = {
    label,
    get phaseName() { return phaseName; },
    phase(name) {
      closePhase();
      phaseName = name;
      phaseStart = performance.now();
    },
    async tick() {
      if (performance.now() - sliceStart < budgetMs) return;
      frames++;
      await nextFrame();
      sliceStart = performance.now();
    },
    async yield() {
      frames++;
      await nextFrame();
      sliceStart = performance.now();
    },
    end() {
      if (ended) return;
      ended = true;
      closePhase();
      active.delete(rec);
      const total = performance.now() - t0;
      if (total < LOG_THRESHOLD_MS) return;
      const parts = phases
        .filter(([, ms]) => ms >= 1)
        .map(([n, ms]) => `${n} ${Math.round(ms)}ms`)
        .join(' · ');
      console.log(`[load] ${label}: ${parts} — ${Math.round(total)}ms over ${frames + 1} frame(s)`);
    },
  };
  active.add(rec);
  return rec;
}

// ---- serialization ----------------------------------------------------------

/** Queue heavy leaf work. LEAF OPERATIONS ONLY — see the invariant at the top
 *  of this file. Errors reach the caller; the lanes themselves never break.
 *
 *  Two lanes, because two different resources are being protected:
 *    cpu — parses and skeleton passes: genuinely synchronous main-thread work.
 *          Strictly one at a time; two of these in the same frames is the
 *          stall this module exists to prevent.
 *    gpu — pipeline compiles: internally frame-yielding codegen followed by
 *          seconds of WAITING on driver-side pipeline creation. Serializing
 *          that wall time was a mistake this trace paid for: a body queued
 *          19s behind crates whose "work" was mostly idle await. Two in
 *          flight overlaps the waits; the codegen slices still interleave
 *          through the frame loop.
 *
 *  Priority: 2 = your own body, 1 = anyone's body, 0 = objects. People
 *  materialize before furniture, always. Reorders WAITING work only. */
const lanes = {
  cpu: { jobs: [], running: 0, max: 1 },
  gpu: { jobs: [], running: 0, max: 2 },
};
export function enqueue(fn, { lane = 'cpu', priority = 0 } = {}) {
  return new Promise((resolve, reject) => {
    const l = lanes[lane] ?? lanes.cpu;
    const job = { fn, priority, resolve, reject };
    const i = l.jobs.findIndex((j) => j.priority < priority);
    if (i === -1) l.jobs.push(job); else l.jobs.splice(i, 0, job);
    pumpLane(l);
  });
}
// While a sky is building, object (priority-0) compiles in the gpu lane wait:
// the sky's weather wraps and env bake rewrite material graphs, so an object
// compiled before the sky pays its full compile TWICE. On Safari a single
// model's WGSL->Metal compile measures ~6 SECONDS — compile-once ordering is
// the difference between painful and fine there. Bodies (priority >= 1) are
// never held: a person appearing beats a person appearing correctly lit.
let objectsHeld = false;
export function holdObjectCompiles(until, maxMs = 25000) {
  if (objectsHeld) return;
  objectsHeld = true;
  Promise.race([until, new Promise((r) => setTimeout(r, maxMs))])
    .catch(() => {})
    .then(() => { objectsHeld = false; pumpLane(lanes.gpu); });
}
function takeJob(l) {
  if (l !== lanes.gpu || !objectsHeld) return l.jobs.shift();
  const i = l.jobs.findIndex((j) => j.priority >= 1);
  return i === -1 ? undefined : l.jobs.splice(i, 1)[0];
}
function pumpLane(l) {
  while (l.running < l.max && l.jobs.length) {
    const job = takeJob(l);
    if (!job) break;
    l.running++;
    (async () => {
      try { job.resolve(await job.fn()); } catch (e) { job.reject(e); }
      finally { l.running--; pumpLane(l); }
    })();
  }
}
/** Back-compat shape used by early call sites. */
export function serialize(fn, { urgent = false, lane = 'cpu', priority } = {}) {
  return enqueue(fn, { lane, priority: priority ?? (urgent ? 2 : 0) });
}

// ---- frame holds ------------------------------------------------------------
// Some scene changes invalidate EVERY compiled pipeline at once (the sky
// setting scene.environment, weather wrapping materials). The next render()
// then rebuilds them synchronously — the post-splash "long freezes". There is
// no way to render the old state while the new one compiles, so the honest
// option is chosen deliberately: hold presentation for one bounded moment,
// run compileAsync over the whole scene (its slices yield, input stays live),
// and resume with everything warm. One held beat instead of ten stuttered
// seconds. The frame LOOP keeps running — simulation, poses, chat all tick;
// only renderer.render is skipped while held.

let holding = 0;
let holdDeadline = 0;
export const framesHeld = () => holding > 0 && performance.now() < holdDeadline;
export async function holdFrames(promise, maxMs = 4000) {
  holding++;
  holdDeadline = Math.max(holdDeadline, performance.now() + maxMs);
  try {
    await Promise.race([promise, new Promise((r) => setTimeout(r, maxMs))]);
  } finally { holding--; }
}

// ---- long-task attribution --------------------------------------------------
// The browser already measures every main-thread stall over 50ms; all that was
// missing is knowing WHOSE stall it was. Anything unattributed logs as such —
// an honest "the freeze came from somewhere we are not measuring yet".

try {
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.duration < 90) continue;
      const during = [...active]
        .map((w) => w.phaseName ? `${w.label}[${w.phaseName}]` : w.label)
        .join(' + ');
      console.warn(`[longtask] ${Math.round(e.duration)}ms during: ${during || '(unattributed)'}`);
    }
  }).observe({ type: 'longtask', buffered: true });
} catch { /* not supported — measurement is best-effort */ }
