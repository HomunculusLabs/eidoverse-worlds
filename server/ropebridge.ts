// eidoverse-worlds sequencer — rope bridges (VOCABULARY-LOOP.md §
// ROPEBRIDGES CONTRACT, vocab-36). A swaying crossing between two towers:
// an entity carrying `comp {type:"ropebridge", data:{pair, ...}}` is the
// DECK; `pair` names the FAR ANCHOR entity (validated not clamped — the
// trailmarker doctrine). There are NO use actions (the bell/regions
// lineage): FOOTSTEPS drive it. A 1Hz sweep (the BehaviorHost tick, the
// vocab-2/3/14/17/22/29/31/32 precedent) watches embodied visitors'
// presence against the span capsule [near anchor live pos, far anchor
// live pos] of half-width `width` (clamped [1,8] d3): the FIRST entry
// into the band (per bridge, per walker) fires ONE creak — a say in the
// bell grammar (rb:{who, at} — TIME'S kin: the deck itself noticed, no
// cause/by — plus ONE presence-plane creak sound at the crossing point,
// the chime/music doctrine: never logged, never replayed) — and pumps the
// deck's standing pendulum motion THROUGH THE PENDULUM FAMILY'S OWN
// ARITHMETIC (pendulumImpulse, imported from reactions.ts — the same
// function the swing's `reactions {push}` path uses; its client twin is
// motion.js evalPendulum — the mirrored-math law honored BY CONSTRUCTION).
// The impulse rides the crossing's direction: |dir·cross| (the walker
// crossed, not stood) — clamped [0.02,0.6] d0.12, SIGNED toward the
// crossing direction so a return trip pumps the other way.
// The sway write is ONE world-authored `motion {id, type:"pendulum",
// ...impulseResult, t0}` entry (actor `world`, cause: the crossing's
// nearest live use? NO — crossings are presence-caused, so NO cause/by:
// the bell grammar). Re-entry inside exitScale·width keeps state (no
// re-fire); leaving the capsule + cooldownSec gates the re-arm. A walker
// idling inside the band fires exactly once per armed window.
//
// Doctrine (regions/echo): the comp is a STATIC AUTHORED TABLE — zero
// engine keys, zero comp transitions ever minted. The SWAY state lives in
// the folded motion comp (the motion family's own shape): late join,
// restart, replay, fork fold the standing sway from the log alone; the
// sweep's in-memory crossers map is per-boot presence truth only. Author
// the deck's pendulum (amp 0, damp small) beside the ropebridge comp; a
// bridge with NO motion comp is still legal (crossings still creak; the
// impulse write will CREATE the pendulum from scratch — pendulumImpulse
// on {} defaults sanely).
//
// Boundaries (the whole abuse story, all fail-closed):
//   - one sweep/second; log entries only on armed entries (a crowd
//     milling on the deck mints one creak per walker per window)
//   - FIRING_CAP 4 crossings fire per sweep world-wide (regions doctrine)
//   - per (bridge, walker) cooldownSec [2,60] d4 between fires
//   - hysteresis: inside width = in-band; out past exitScale·width = out
//   - spectators never cross (regions doctrine)
//   - the creak sound is presence-plane: zero log weight, replay-inert
//   - malformed comps clamp + lint (ropebridge-lint); a bridge whose
//     pair does not exist / is itself / has no legal id skips silent
//     (ropebridge-skip, once per reason per boot — a sweep must never spam)
//   - the whole sweep wrapped in try/catch (house rule 3 — no bridge
//     takes the server down)

import type { LogEntry, WorldState } from "../shared/fold.js";
// The derivation + clamps (shared/ropebridge.js — the shared-verbatim
// pattern): one arithmetic across engine, tests, and the mcpl text tier.
import { normalizeRopebridge, distToSpan, creakNote } from "../shared/ropebridge.js";
// The pendulum family's own impulse math — IMPORTED, never re-implemented
// (the mirrored-math law; same function the swing push path uses).
import { pendulumImpulse } from "./reactions.ts";

/** What the engine needs from its world — the BehaviorHost's WorldLike
 *  plus the presence-plane reads (structural, so this module never
 *  imports server.ts or world.ts). */
export type RopebridgeWorld = {
  name: string;
  state: WorldState;
  clients: Set<{ id: string; spectator: boolean; lastPose?: unknown; ws?: { send(data: string): void } }>;
  leases?: Map<string, { lastState?: { p?: number[]; yaw?: number } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

const FIRING_CAP = 4;
/** Seeded pendulum when the deck carries no motion comp of its own — a
 *  slow, damped sway (never perpetual: a bridge settles). Entity-local. */
const SEED_MOTION = { type: "pendulum", period: 3.8, damp: 0.12, axis: [1, 0, 0], pivot: [0, 3, 0], maxAmp: 0.35 };

const positionOf = (p: unknown): number[] | null => {
  if (!Array.isArray(p) || p.length < 3) return null;
  const [x, y, z] = p;
  return [x, y, z].every((n) => typeof n === "number" && Number.isFinite(n)) ? [x, y, z] : null;
};

/** One world's rope-bridge engine. Constructed by the BehaviorHost, swept
 *  from the global 1s behavior tick. Everything is wrapped so no sweep may
 *  ever take the sequencer down (house rule 3). */
export class RopebridgeEngine {
  private w: RopebridgeWorld;
  /** `${bridge}:${who}` -> currently in-band (presence truth, per boot) */
  private inBand = new Map<string, boolean>();
  /** `${bridge}:${who}` -> ts before which a re-entry does not re-fire */
  private cooldownUntil = new Map<string, number>();
  /** last linted comp shape per bridge — lint once per shape, not per sweep */
  private lintedShape = new Map<string, string>();
  /** skip reasons already named this boot (a sweep must never spam) */
  private skipNoted = new Set<string>();
  private lastBridges = new Set<string>();

  constructor(w: RopebridgeWorld) { this.w = w; }

  /** A thing's LIVE position: lease stream if someone carries it, folded
   *  pos otherwise (the vPunt live-position rule). */
  private livePos(id: string, folded: number[]): number[] {
    const L = this.w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
    return positionOf(L?.lastState?.p) ?? folded;
  }

  /** Embodied, posed visitors — spectators and unposed joins never cross. */
  private embodied(): { id: string; p: number[] }[] {
    const out: { id: string; p: number[] }[] = [];
    for (const c of this.w.clients) {
      if (c.spectator) continue;
      const pose = c.lastPose as { p?: unknown } | null | undefined;
      const p = positionOf(pose?.p);
      if (!p) continue;
      out.push({ id: c.id, p });
    }
    return out;
  }

  /** The 1Hz sweep. Presence in, crossings out; one creak (say + sound)
   *  and one sway write per armed entry, cooldown- and cap-gated. */
  sweep(now: number): void {
    const ents = this.w.state.entities as Record<string, { pos?: unknown; comp?: Record<string, unknown> }>;
    const bridges: { id: string; cfg: ReturnType<typeof normalizeRopebridge>["cfg"]; a: number[]; b: number[]; deck: { comp?: Record<string, unknown> } }[] = [];
    for (const [id, ent] of Object.entries(ents)) {
      const data = ent?.comp?.ropebridge;
      if (data == null) continue;
      const shape = JSON.stringify(data);
      let n = normalizeRopebridge(data);
      if (this.lintedShape.get(id) !== shape) {
        if (n.notes.length) this.w.debug("ropebridge-lint", { entity: id, notes: n.notes });
        this.lintedShape.set(id, shape);
      }
      const cfg = n.cfg;
      // pair resolution — fail closed, once per reason per boot: an absent,
      // illegal, missing, or self pair is a bridge that sways nowhere.
      if (cfg.pair === null || cfg.pair === id || !ents[cfg.pair]) {
        const why = cfg.pair === null ? "pair names nowhere (absent or illegal entity id)"
          : cfg.pair === id ? "a rope bridge cannot pair with itself"
          : `pair "${cfg.pair}" does not exist in the fold`;
        const key = `${id}:${why}`;
        if (!this.skipNoted.has(key)) {
          this.skipNoted.add(key);
          this.w.debug("ropebridge-skip", { entity: id, why });
        }
        continue;
      }
      bridges.push({
        id, cfg, deck: ent,
        a: this.livePos(id, positionOf(ent.pos) ?? [0, 0, 0]),
        b: this.livePos(cfg.pair, positionOf(ents[cfg.pair].pos) ?? [0, 0, 0]),
      });
    }

    // comps removed (or entities gone): drop tracking silently, note once
    const ids = new Set(bridges.map((x) => x.id));
    for (const key of [...this.inBand.keys()]) {
      const bridge = key.slice(0, key.lastIndexOf(":"));
      if (!ids.has(bridge)) {
        this.inBand.delete(key);
        if (this.lastBridges.has(bridge)) this.w.debug("ropebridge-skip", { entity: bridge, why: "component removed" });
      }
    }
    this.lastBridges = ids;

    const people = this.embodied();
    let fired = 0;   // FIRING_CAP counted over this sweep, world-wide

    for (const br of bridges) {
      const { cfg } = br;
      const bandOut = cfg.width * cfg.exitScale;
      for (const person of people) {
        const d = distToSpan(person.p, br.a, br.b);
        const key = `${br.id}:${person.id}`;
        const prev = this.inBand.get(key) === true;
        const inside = d <= cfg.width;
        const outside = d >= bandOut;
        // hysteresis: between width and bandOut keeps state (regions doctrine)
        const nowIn = inside || (prev && !outside);
        if (nowIn && !prev) {
          // an armed ENTRY — fire unless cooled or capped
          const cooled = now < (this.cooldownUntil.get(key) ?? 0);
          if (cooled || fired >= FIRING_CAP) {
            if (!cooled) this.w.debug("ropebridge-cap", { entity: br.id, who: person.id, why: `firing cap — ${FIRING_CAP} crossings already fired this sweep` });
            // silent flip (regions doctrine): state tracks geometry regardless
          } else {
            this.fire(br, person, now);
            this.cooldownUntil.set(key, now + cfg.cooldownSec * 1000);
            fired++;
          }
        }
        this.inBand.set(key, nowIn);
        // a light sweep: a long-lived process must not accumulate dead keys
        if (this.cooldownUntil.size > 512) for (const [k, v] of this.cooldownUntil) if (v < now) this.cooldownUntil.delete(k);
      }
    }
  }

  /** One crossing: the creak (say + presence sound) and the sway write
   *  (through the pendulum family's own impulse arithmetic). */
  private fire(
    br: { id: string; cfg: ReturnType<typeof normalizeRopebridge>["cfg"]; a: number[]; b: number[]; deck: { comp?: Record<string, unknown> } },
    person: { id: string; p: number[] },
    now: number,
  ): void {
    const { cfg } = br;
    // the crossing point: clamped projection of the walker onto the span
    const dx = br.b[0] - br.a[0], dz = br.b[2] - br.a[2];
    const len2 = dx * dx + dz * dz;
    let t = 0;
    if (len2 > 0) t = Math.min(1, Math.max(0, ((person.p[0] - br.a[0]) * dx + (person.p[2] - br.a[2]) * dz) / len2));
    const px = br.a[0] + t * dx, pz = br.a[2] + t * dz;
    // the entry side (2D cross product sign): the deck lurches AWAY from
    // the stepping foot — a deterministic, meaningful impulse sign
    const side = Math.sign((person.p[0] - br.a[0]) * dz - (person.p[2] - br.a[2]) * dx) || 1;
    // the creak say — regions-enter grammar (no cause: presence caused it,
    // there is no use seq to cite; `by` names the walker)
    const line = `the rope bridge creaks under ${person.id}`;
    const say = this.w.append("world", "say", { text: line, id: br.id, rb: { who: person.id, at: now }, by: person.id });
    this.w.broadcast({ type: "log", entry: say });
    // the creak sound — presence plane, never logged, never replayed
    this.w.broadcast({ type: "sound", id: br.id, rb: { creak: true }, note: creakNote(cfg), p: [px, br.a[1], pz], at: now, by: person.id });
    // the sway write — THROUGH the pendulum family's own arithmetic. A deck
    // with no motion comp seeds a slow damped pendulum; a deck whose motion
    // is not a pendulum (a spin, a path) keeps its authored motion untouched
    // (the reactions.ts impulse-guard doctrine) and only creaks.
    const m = br.deck.comp?.motion as Record<string, unknown> | undefined;
    let motionSeq: number | undefined;
    if (m == null || m.type === "pendulum") {
      const base = m ?? SEED_MOTION;
      const next = pendulumImpulse(base, cfg.impulse * side, now);
      const entry = this.w.append("world", "motion", { id: br.id, ...next });
      this.w.broadcast({ type: "log", entry });
      motionSeq = entry.seq;
    } else {
      this.w.debug("ropebridge-skip", { entity: br.id, why: `deck motion is "${String(m.type)}" — impulses need a pendulum; crossing creaked only` });
    }
    this.w.debug("ropebridge-trigger", { entity: br.id, who: person.id, effect: say.seq, motion: motionSeq, d: Math.round(cfg.impulse * side * 1000) / 1000, kind: "crossing" });
  }
}
