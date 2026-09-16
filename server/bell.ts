// eidoverse-worlds sequencer — bell (VOCABULARY-LOOP.md § BELLS CONTRACT,
// vocab-17). A day-schedule chime: an entity carrying
// `comp {type:"bell", data:{...}}` publishes WORLD-CLOCK HOURS; the 1Hz
// sweep reads the same hoursAt the sun uses and tolls crossed slots.
// A bell is not an instrument — there are NO use actions; time itself is
// the trigger. The schedule is a STATIC TABLE (doors/portals doctrine): no
// comp transitions are ever minted, no toll state is persisted.
//
//   sweep crosses a slot
//     → 1. say {text, id, bell:{n, hour, at}}          (actor world —
//          the weatherzone-release grammar: no cause/by, TIME caused it)
//     → 2. n × {type:"sound", id, note:{hz,sec,gain,wave}, p, at,
//                bell:{n, hour, first?}}               (presence plane,
//          the music/force doctrine — never logged, never folded, never
//          replayed; music.js synthesizes each strike with zero new client
//          code)
//
// The strike pitch is DERIVED: chromatic semitones above the authored base
// by the hour (shared/bell.js tollHz) — noon on an E4 bell rings E.
//
// Boundaries (all fail-closed, the whole abuse story):
//   - at most 4 bells TOLL per world per sweep (bell-cap)
//   - minGap real-seconds between one bell's tolls (floor 10 — the strobe
//     bound; an authored sky rate can push the day through hours fast)
//   - one toll per bell per sweep (multi-crossing coalesces)
//   - lint fires at most once per boot per bell (a sweep must never
//     lint-spam)
//
// Restart truth: the fold carries the schedule; the engine seeds each
// bell's lastTollAt from the world's own say record (recentSays — the last
// world say carrying bell.id) so a slot that tolled before a crash does
// not re-toll after it. Replay mints nothing: this path runs ONLY from the
// live tick.
//
// Takes the same structural world as weatherzone.ts. Wired via the
// BehaviorHost tick in behaviors.ts (the vocab-2/3/14 precedent).

import { normalizeBell, bellHour, tollHz, crossedSlot, containingSlot } from "../shared/bell.js";

export type BellWorld = {
  name: string;
  state: {
    sky?: Record<string, any> | null;
    entities: Record<string, { pos?: number[]; comp?: Record<string, unknown> }>;
  };
  /** The world's own say ring — restart seeding (last toll per bell). */
  recentSays?: { seq: number; ts: number; verb: string; actor: string; args: Record<string, unknown> }[];
  append(actor: string, verb: string, args: Record<string, unknown>): unknown;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

/** Per-boot engine memory — deliberately NOT the truth (the fold is): arm
 *  markers seed from the log, lastTollAt seeds from recentSays, lint fires
 *  once. All dropped on restart, all re-derived. */
type BellMem = {
  seen: boolean;          // the engine has an hour reading for this bell
  prevHour: number;       // last sweep's world hour
  lastTollAt: number;     // ms — minGap arithmetic (log-seeded on boot)
  linted: boolean;        // one bell-lint per boot per bell
  dayFirstDone: boolean;  // one dayFirst toll per boot
};

const MS_MIN_GAP_FLOOR = 10_000;

/** ONE toll — the bell family's own transition (one say + n presence-plane
 *  strikes, spaced ~sec·0.8), extracted from the engine's private path so
 *  the festival tier (vocab-29) can drive a bell through the SAME
 *  arithmetic: one truth, every caller (the igniteCompanion precedent). */
export function bellToll(
  w: BellWorld, id: string,
  cfg: ReturnType<typeof normalizeBell>["cfg"],
  slot: number, hour: number, now: number,
) {
  const line = cfg.line ?? `the bell tolls ${cfg.n}`;
  const entry = w.append("world", "say",
    { text: line, id, bell: { n: cfg.n, hour: slot, at: now } });
  w.broadcast({ type: "log", entry });
  const hz = tollHz(cfg, slot);
  const ent = w.state.entities?.[id];
  const p = Array.isArray(ent?.pos) && ent.pos.length >= 3 ? ent.pos.slice(0, 3) : [0, 0, 0];
  for (let k = 0; k < cfg.n; k++) {
    const fire = () => {
      try {
        w.broadcast({ type: "sound", id, note: { hz, sec: cfg.sec, gain: cfg.gain, wave: cfg.wave },
          p, at: now, bell: { n: cfg.n, hour: slot, ...(k === 0 ? { first: true } : {}) } });
      } catch { /* a strike must never take the server down */ }
    };
    if (k === 0) fire(); else setTimeout(fire, k * cfg.sec * 800);
  }
  w.debug("bell-trigger", { entity: id, hour: slot, worldHour: Math.round(hour * 100) / 100,
    n: cfg.n, hz: Math.round(hz * 100) / 100, say: (entry as { seq?: number })?.seq });
}

export class BellEngine {
  private w: BellWorld;
  private mem = new Map<string, BellMem>();

  constructor(w: BellWorld) { this.w = w; }

  sweep(now: number) {
    const sky = (this.w.state.sky ?? null) as Record<string, any> | null;
    const hour = bellHour(sky, now);
    let tolled = 0;                                     // this sweep's world-wide cap
    for (const [id, ent] of Object.entries(this.w.state.entities ?? {})) {
      const data = (ent as { comp?: Record<string, unknown> })?.comp?.bell;
      if (data == null) continue;                       // not a bell
      if (tolled >= 4) {
        // The crossing is CONSUMED — a cap skip means SKIP (deterministic
        // folded order decides who tolls; the overflow misses its slot,
        // it does not queue for the next sweep).
        const m = this.mem.get(id);
        if (m) m.prevHour = hour;
        this.w.debug("bell-cap", { entity: id, why: `4 bells already tolled this sweep (cap)` });
        continue;
      }
      try {
        tolled += this.step(id, data, hour, now) ? 1 : 0;
      } catch (err) {
        console.error(`[world:${this.w.name}] bell step failed (never fatal)`, err);
        this.w.debug("reaction-error", { entity: id, action: "sweep", error: String(err) });
      }
    }
  }

  /** One bell's sweep step. Returns true when it tolled. */
  private step(id: string, data: unknown, hour: number, now: number): boolean {
    const m = this.mem.get(id);
    if (m == null) {
      // first sight: seed from the world's own record, lint once, arm
      const { cfg, notes } = normalizeBell(data);
      const seed = this.seedLastToll(id);
      this.mem.set(id, {
        seen: true, prevHour: hour, lastTollAt: seed, linted: false, dayFirstDone: false,
      });
      const mem = this.mem.get(id)!;
      if (notes.length) { this.w.debug("bell-lint", { entity: id, notes }); mem.linted = true; }
      // dayFirst: announce where the day stands (once per boot)
      if (cfg.dayFirst) {
        const slot = containingSlot(cfg.hours, hour);
        if (slot != null) { mem.dayFirstDone = true; this.toll(id, cfg, slot, hour, now); return true; }
      }
      return false;
    }
    // every sight: new lint appears only if the comp was re-authored with
    // new garbage — one note per change, never per sweep
    const { cfg, notes } = normalizeBell(data);
    if (notes.length && !m.linted) { this.w.debug("bell-lint", { entity: id, notes }); m.linted = true; }
    else if (!notes.length) m.linted = false;
    const slot = crossedSlot(cfg.hours, m.prevHour, hour);
    m.prevHour = hour;
    if (slot == null) return false;
    if (now - m.lastTollAt < Math.max(MS_MIN_GAP_FLOOR, cfg.minGap * 1000)) {
      this.w.debug("bell-skip", { entity: id, why: `minGap ${cfg.minGap}s — last toll ${Math.round((now - m.lastTollAt) / 1000)}s ago` });
      return false;
    }
    m.lastTollAt = now;
    this.toll(id, cfg, slot, hour, now);
    return true;
  }

  /** The world's own say record seeds lastTollAt (the last world say
   *  carrying this bell's id) — a slot that tolled before a crash does not
   *  re-toll after it. No record (quiet world / rotated out) = 0 = armed. */
  private seedLastToll(id: string): number {
    const ring = this.w.recentSays ?? [];
    for (let i = ring.length - 1; i >= 0; i--) {
      const e = ring[i];
      if (e.verb === "say" && e.actor === "world" && (e.args as any)?.id === id
        && (e.args as any)?.bell != null) {
        return e.ts;
      }
    }
    return 0;
  }

  /** ONE toll: one say + n presence-plane strikes, spaced ~sec·0.8. The
   *  family's own transition — exported as bellToll for the festival tier
   *  (vocab-29, TIME-driven) so one arithmetic serves every caller. */
  private toll(id: string, cfg: ReturnType<typeof normalizeBell>["cfg"], slot: number, hour: number, now: number) {
    bellToll(this.w, id, cfg, slot, hour, now);
  }

  /** The bell's LIVE position: folded pos (bells are static by nature; a
   *  leased bell's stream pos would ride here if leases ever carry one). */
  private livePos(id: string): number[] {
    const ent = this.w.state.entities?.[id];
    return Array.isArray(ent?.pos) && ent.pos.length >= 3 ? ent.pos.slice(0, 3) : [0, 0, 0];
  }
}
