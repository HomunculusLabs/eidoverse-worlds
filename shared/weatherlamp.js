// weatherlamp — the weather-lamp composition derivation, as pure math.
//
// The first affordance-pair composition (VOCABULARY-LOOP.md § WEATHERLAMP
// CONTRACT, vocab-26): a lit lamp's REALIZED intensity is dimmed by the
// current weather and restored when the sky releases. The composition MINTS
// NOTHING — the weatherzone family (vocab-14) already writes the weather
// verb into the fold, the lamp family (vocab-5) already writes the comp and
// the companion light; what couples them is ONE multiplier every consumer
// derives for itself from (folded sky, now), the doorYaw/stageAt
// closed-form doctrine. Shared verbatim by the browser realization
// (client/lib/weatherlamp.js → lightrig's per-frame multiply), the mcpl
// text tier (describeLamp's hush line), and the test matrix — so what the
// rig multiplies, what the fold carries, and what the tests assert are one
// arithmetic, never three.
//
// The lamp family's own state is NEVER touched: dim ≠ snuff. The folded
// companion stays lit at its authored intensity; the dim is a REALIZED
// quantity (what this client renders), like dayness — which means late
// join, restart, replay, and fork all agree with zero traffic, and a
// builder reading the fold sees the lamp exactly as it was authored.

import { effectiveSky } from './forecast.js';

// The rain ladder. Dry states never dim (a lantern under a fair sky is a
// lantern); wet states step down by storminess; an UNKNOWN weather never
// dims — fail toward light, never toward darkness (the same fail-open
// direction every ambient realization here takes: a broken derivation must
// not black out the village at night).
const LADDER = {
  clear: 1, fair: 1, overcast: 1,
  sunshower: 0.85, rain: 0.6, storm: 0.45, cyclone: 0.35, darkstorm: 0.3,
};

/** The factor for one weather state — 1 = dry/unknown, lower = hushed. */
export function weatherDim(weather) {
  return LADDER[weather] ?? 1;
}

/** The factor for a folded sky at a moment. PURE: same sky + now → same
 *  factor on every runtime, with zero traffic.
 *
 *  - no sky (null/absent) → 1 — a world without weather never dims;
 *  - an authored weather (the weatherzone path under no forecast) → the
 *    state's factor, instant (authored changes are instant, like the sky's
 *    own authored path);
 *  - a governing forecast → the CURRENT segment's factor, and during the
 *    sky's own transition window the factor BLENDS from the previous
 *    segment's factor along the policy's transitionSec — the hush eases in
 *    exactly as the rain does, one clock for both. */
export function dimAt(sky, nowMs) {
  if (!sky || typeof sky !== 'object') return 1;
  if (sky.forecast && typeof sky.forecast === 'object' && sky.forecast.epoch) {
    const eff = effectiveSky(sky, nowMs);
    const target = weatherDim(eff.weather);
    if (eff.inTransition && eff.seg && eff.seg.prevState) {
      const from = weatherDim(eff.seg.prevState);
      const span = (eff.seconds ?? 0) * 1000;
      if (span > 0) {
        const t = Math.min(1, Math.max(0, (nowMs - eff.seg.startMs) / span));
        return from + (target - from) * t;
      }
    }
    return target;
  }
  return weatherDim(sky.weather);
}

/** What a consumer RENDERS: the folded/base intensity times the factor.
 *  The fold's own intensity field is never changed by the weather. */
export function weatheredIntensity(intensity, sky, nowMs) {
  const f = dimAt(sky, nowMs);
  return (typeof intensity === 'number' && Number.isFinite(intensity) ? intensity : 0) * f;
}
