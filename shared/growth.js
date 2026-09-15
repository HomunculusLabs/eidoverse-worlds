// growth — the plant lifecycle derivation, as pure math.
//
// Shared verbatim by every runtime (the forecast.js / door.js / water.js
// pattern): the server engine (server/growth.ts) derives and writes exactly
// what this module computes, the browser realization (client/lib/growth.js)
// scales its sprout from the same folded comp, the mcpl text tier
// (agent.ts look()) reads the affordance line from it, and the test matrix
// (tools/growthtest.ts) checks the same arithmetic — one truth.
//
// Doctrine (VOCABULARY-LOOP.md § GROWTH CONTRACT, vocab-12): a plant's
// stage is DERIVED FROM TIME, never tweened — stageAt(cfg, plantedAt, now)
// is a pure function every client evaluates at its own clock, so one comp
// buys the whole lifecycle with zero traffic after the write. The folded
// `stage` literal is history's last word; TIME is the truth. A hand
// (use advance/tend) writes a back-dated transition so the folded literal
// and the derivation agree at the moment of the write.

const DWELL_MIN = 0, DWELL_MAX = 86400, DWELL_DEFAULT = 3600;
const STAGES_MAX = 8;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const NAME_MAX = 24;
const LINE_MAX = 200;

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const line = (notes, v) => {
  if (v == null) return null;
  const s = String(v).slice(0, LINE_MAX);
  if (s !== String(v)) notes.push('line clamped to 200 chars');
  return s;
};

/** Clamp an authored growth comp into a legal config, collecting lint
 *  notes (the door-lint / particles-lint doctrine: clamp, never reject).
 *  `stages` is the ladder: [{name, dwell(sec)}…] oldest first, the LAST
 *  stage is the crown (bloom); past its dwell a non-cyclic plant wilts and
 *  holds, a cyclic one wraps back to the first stage. Unknown keys ride in
 *  `authored`. */
export function normalizeGrowth(data) {
  const notes = [];
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  // stages ladder
  let stages;
  if (!Array.isArray(d.stages) || d.stages.length === 0) {
    if (d.stages !== undefined) notes.push(`stages ${JSON.stringify(d.stages).slice(0, 40)} is not a non-empty array — default one-stage ladder`);
    stages = [{ name: 'grown', dwell: DWELL_DEFAULT }];
  } else {
    stages = d.stages.slice(0, STAGES_MAX).map((s, i) => {
      const o = (s && typeof s === 'object' && !Array.isArray(s)) ? s : {};
      let dwell = isFiniteNum(o.dwell) ? o.dwell : DWELL_DEFAULT;
      if (!isFiniteNum(o.dwell) && o.dwell !== undefined) notes.push(`stages[${i}].dwell ${JSON.stringify(o.dwell)} is not a number — default ${DWELL_DEFAULT}`);
      const c = clamp(dwell, DWELL_MIN, DWELL_MAX);
      if (c !== dwell) { notes.push(`stages[${i}].dwell ${dwell} clamped to ${c}`); dwell = c; }
      const name = o.name == null ? `stage ${i + 1}` : String(o.name).slice(0, NAME_MAX);
      return { name, dwell };
    });
    if (d.stages.length > STAGES_MAX) notes.push(`stages truncated to ${STAGES_MAX}`);
  }
  let reach = isFiniteNum(d.reach) ? d.reach : REACH_DEFAULT;
  if (!isFiniteNum(d.reach) && d.reach !== undefined) notes.push(`reach ${JSON.stringify(d.reach)} is not a number — default ${REACH_DEFAULT}`);
  const rc = clamp(reach, REACH_MIN, REACH_MAX);
  if (rc !== reach) { notes.push(`reach ${reach} clamped to ${rc}`); reach = rc; }
  if (d.cycle !== undefined && typeof d.cycle !== 'boolean') {
    notes.push(`cycle ${JSON.stringify(d.cycle)} is not a boolean — treated as false`);
  }
  return {
    cfg: {
      stages, reach,
      cycle: d.cycle === true,
      growAt: line(notes, d.growAt),
      tendAt: line(notes, d.tendAt),
      plantedAt: isFiniteNum(d.plantedAt) ? d.plantedAt : null,
      seed: isFiniteNum(d.seed) ? d.seed : null,
      authored: d,
    },
    notes,
  };
}

/** The derivation base: when the plant's clock starts. An authored
 *  `plantedAt` wins; else the last hand transition's `at` (every engine
 *  write carries one); else `now` (a freshly authored seed — fail closed
 *  to stage 0, never the epoch). */
function baseTime(plantedAt, at, now) {
  if (isFiniteNum(plantedAt)) return plantedAt;
  if (isFiniteNum(at)) return at;
  return now;
}

/** The stage a client perceives at `now` — THE pure function of time.
 *  Returns the stage INDEX in [0, stages.length] (non-cyclic: past the
 *  last dwell it returns stages.length = the wilt hold; cyclic: wraps
 *  within [0, stages.length-1]). Every runtime derives the same integer
 *  at the same instant with zero traffic. */
export function stageAt(cfg, plantedAt, at, now, baseOverride) {
  const stages = cfg.stages;
  const base = baseOverride ?? baseTime(plantedAt, at, now);
  let t = (now - base) / 1000;                     // seconds grown
  const total = stages.reduce((s, st) => s + st.dwell, 0);
  if (cfg.cycle && total > 0) t = ((t % total) + total) % total;
  let acc = 0;
  for (let i = 0; i < stages.length; i++) {
    acc += stages[i].dwell;
    if (t < acc) return i;
  }
  return stages.length;                            // wilt hold (non-cyclic past end)
}

/** The growth factor within the CURRENT stage — smoothstep from just
 *  sprouted (0) to fully formed (1) across the stage's dwell. A
 *  zero-dwell stage (an instant crown) reads 1. This is the scale the
 *  browser applies (whole entity × base scale); pure, tweenless. */
export function growthK(cfg, plantedAt, at, now) {
  const stages = cfg.stages;
  const base = baseTime(plantedAt, at, now);
  let t = Math.max(0, (now - base) / 1000);
  const total = stages.reduce((s, st) => s + st.dwell, 0);
  if (cfg.cycle && total > 0) t = ((t % total) + total) % total;
  let acc = 0;
  for (let i = 0; i < stages.length; i++) {
    const d = stages[i].dwell;
    if (t < acc + d || i === stages.length - 1) {
      const f = d > 0 ? clamp((t - acc) / d, 0, 1) : 1;
      return f * f * (3 - 2 * f);                  // smoothstep
    }
    acc += d;
  }
  return 1;
}

/** Cumulative dwell (ms) through stage index `n` — what the engine
 *  back-dates `plantedAt` with so a hand-written stage is exactly earned
 *  at the write instant (folded literal == derived, always). */
export function cumMs(cfg, n) {
  let s = 0;
  for (let i = 0; i < n && i < cfg.stages.length; i++) s += cfg.stages[i].dwell;
  return s * 1000;
}

/** The stage name for an index (the wilt hold names itself). */
export function stageName(cfg, i) {
  if (i >= cfg.stages.length) return 'wilt';
  return cfg.stages[i]?.name ?? `stage ${i + 1}`;
}

/** The text-tier affordance line (the describeDoor pattern): what an
 *  agent's look() lists for a living thing. */
export function describeGrowth(data) {
  const { cfg } = normalizeGrowth(data);
  const now = Date.now();
  const i = stageAt(cfg, data?.plantedAt, data?.at, now);
  const n = cfg.stages.length;
  return `growth: ${stageName(cfg, i)} (stage ${Math.min(i + 1, n + 1)}/${n + 1} — use {action:"advance"} to help it grow, {action:"tend"} to nurture it back)`;
}

/** FNV-1a — a stable 32-bit seed from the entity id for per-instance
 *  client jitter (every browser derives the same wobble from the same
 *  id; an authored numeric seed wins). */
export function seedOf(id, authoredSeed) {
  if (isFiniteNum(authoredSeed)) return authoredSeed >>> 0;
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
