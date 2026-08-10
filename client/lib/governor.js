// governor — one quality controller, session-scoped, two-way.
//
// The old governor (main.js) was five one-way ratchets and two recovering
// levers: shed grass never grew back, a doused light stayed doused
// (MAX_CAST-- was permanent), the shadow map never re-sharpened — and the
// cloud lever both PERSISTED its degradation to localStorage across
// sessions and answered "this machine is slow right now" with a full sky
// rebuild, the single most expensive operation the client has. One bad
// three-second window (a tab restore, a burst of arrivals) could
// permanently degrade a world.
//
// The new contract (TEL0S_NOTES §12.6):
//   * every lever moves BOTH ways — what a slow minute takes, a smooth
//     minute gives back;
//   * session-scoped, never a localStorage write — machine pressure is not
//     a preference;
//   * the governor never touches the cloud tier at all. Cloud quality is
//     the resident's ⚙ choice (a preference, persisted as one); the levers
//     below are cheaper, reversible, and measured. The old cloud lever is
//     simply gone.
//
// The ladder, in shed order (recovery unwinds it back-to-front, so pixels —
// shed late — return first, and content comes back last):
//
//   casters   distant objects stop casting shadows (castShadow is in no
//             pipeline key — free toggles, §12.1)
//   slots     the light-slot cap drops (idle slots are uniform zeros)
//   emitters  per-emitter instance counts thin (auto → med → low)
//   grass     the meadow thins (instanced count — no rebuild)
//   pixels    render scale, −0.25 steps to 0.7
//   detail    LOD bias 2 (far bodies at half rate) + shadow map 1024
//
// Pacing: a shed needs 3 consecutive slow seconds and resets the counter —
// one lever per window, so a hitch cannot cascade the whole ladder. A
// restore needs 5 consecutive smooth seconds. The 26/52 fps gap between
// the two thresholds is the hysteresis that keeps shed/restore from
// chattering; the dead band between them counts toward neither.

import { renderer, sun, BASE_PIXEL_RATIO } from './core.js';
import { setSlotCap, getSlotCap, maxSlots, setCasterBudget, getCasterBudget } from './lightrig.js';
import { setEmitterQuality, emitterQuality, emitterCount } from './emitters.js';
import { setGrassDensity, getGrassDensity, hasGrass } from './terrain.js';
import { setLodBias } from './remotes.js';
import { toast } from './ui.js';

let pixelRatio = BASE_PIXEL_RATIO;
const setPR = (v) => { pixelRatio = v; renderer.setPixelRatio(v); };

const EMITTER_TIERS = ['auto', 'med', 'low'];
const CASTER_STEPS = [12, 6, 2];
const GRASS_STEPS = [1, 0.6, 0.35];

// Each lever: shed() / restore() return whether they moved a notch. The
// toast rides the shed (people deserve to know why the world changed);
// restores are silent — detail quietly coming back needs no announcement.
const LEVERS = [
  {
    name: 'casters',
    shed() {
      const i = CASTER_STEPS.indexOf(getCasterBudget());
      const next = i >= 0 ? CASTER_STEPS[i + 1] : CASTER_STEPS[1];
      if (next === undefined || getCasterBudget() <= CASTER_STEPS[CASTER_STEPS.length - 1]) return false;
      setCasterBudget(next);
      return true;
    },
    restore() {
      const i = CASTER_STEPS.indexOf(getCasterBudget());
      if (i <= 0) return false;
      setCasterBudget(CASTER_STEPS[i - 1]);
      return true;
    },
  },
  {
    name: 'lights',
    shed() {
      if (getSlotCap() === 0) return false;
      setSlotCap(getSlotCap() - 1);
      toast('turned a light down to keep the frame rate — it still glows', 'warn', 6000);
      return true;
    },
    restore() {
      if (getSlotCap() >= maxSlots()) return false;
      setSlotCap(getSlotCap() + 1);
      return true;
    },
  },
  {
    name: 'emitters',
    shed() {
      if (!emitterCount()) return false;
      const i = EMITTER_TIERS.indexOf(emitterQuality());
      if (i < 0 || i >= EMITTER_TIERS.length - 1) return false;
      if (!setEmitterQuality(EMITTER_TIERS[i + 1])) return false;
      toast('particle effects thinned to keep the frame rate', 'warn', 8000);
      return true;
    },
    restore() {
      const i = EMITTER_TIERS.indexOf(emitterQuality());
      if (i <= 0) return false;
      return Boolean(setEmitterQuality(EMITTER_TIERS[i - 1]));
    },
  },
  {
    name: 'grass',
    // steps from the EFFECTIVE density: the resident's grass⚙ cap already
    // applies, and "shedding" a meadow the cap holds below the step would
    // toast without changing a blade
    shed() {
      const eff = getGrassDensity();
      if (!hasGrass() || eff <= GRASS_STEPS[GRASS_STEPS.length - 1]) return false;
      setGrassDensity(eff > 0.65 ? 0.6 : 0.35);
      toast('grass thinned to keep the frame rate', 'warn', 8000);
      return true;
    },
    restore() {
      const eff = getGrassDensity();
      if (!hasGrass() || eff >= 1) return false;
      setGrassDensity(eff < 0.5 ? 0.6 : 1);
      return true;
    },
  },
  {
    name: 'pixels',
    shed() {
      if (pixelRatio <= 0.7) return false;
      setPR(Math.max(0.7, pixelRatio - 0.25));
      return true;
    },
    restore() {
      if (pixelRatio >= BASE_PIXEL_RATIO) return false;
      setPR(Math.min(BASE_PIXEL_RATIO, pixelRatio + 0.125));
      return true;
    },
  },
  {
    name: 'detail',
    shed() {
      if (shedDetail) return false;
      shedDetail = true;
      setLodBias(2);                    // far bodies animate at half rate
      if (sun.shadow.mapSize.width > 1024) {
        // mapSize is uniform + texture realloc, not pipeline shape (§12.1)
        // — which is exactly what makes this lever two-way at last
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.map?.dispose();
        sun.shadow.map = null;
      }
      return true;
    },
    restore() {
      if (!shedDetail) return false;
      shedDetail = false;
      setLodBias(1);
      if (sun.shadow.mapSize.width < 2048) {
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.map?.dispose();
        sun.shadow.map = null;
      }
      return true;
    },
  },
];
let shedDetail = false;

let slowFor = 0;
let goodFor = 0;
const history = [];   // recent lever moves, for the debug surface

/** Feed once per second with the measured fps. */
export function governPerformance(fps) {
  if (fps > 0 && fps < 26) {
    goodFor = 0;
    slowFor++;
    if (slowFor > 2) {
      for (const lever of LEVERS) {
        if (lever.shed()) {
          slowFor = 0;   // one lever per slow window — a hitch cannot cascade
          if (history.length < 60) history.push(`− ${lever.name} @${Math.round(performance.now() / 1000)}s`);
          break;
        }
      }
    }
  } else if (fps > 52) {
    slowFor = 0;
    goodFor++;
    if (goodFor > 4) {
      // unwind back-to-front: pixels return before the meadow regrows
      for (let i = LEVERS.length - 1; i >= 0; i--) {
        if (LEVERS[i].restore()) {
          goodFor = 0;
          if (history.length < 60) history.push(`+ ${LEVERS[i].name} @${Math.round(performance.now() / 1000)}s`);
          break;
        }
      }
    }
  } else {
    // the dead band: neither slow nor provably smooth — both counters
    // re-earn their streaks
    slowFor = 0;
    goodFor = 0;
  }
}

export const governorDebug = () => ({
  pixelRatio, slowFor, goodFor,
  casterBudget: getCasterBudget(), slotCap: getSlotCap(),
  emitters: emitterQuality(), grass: getGrassDensity(),
  detailShed: shedDetail, history: [...history],
});
