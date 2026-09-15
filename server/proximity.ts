// eidoverse-worlds sequencer — proximity triggers (VOCABULARY-LOOP.md
// § PROXIMITY CONTRACT, vocab-2). The world notices you: an entity carrying
// `comp {type:"proximity", data:{...}}` greets arrivals and bids farewells.
//
// Doctrine, same as reactions.ts: triggers in, ordinary logged verbs out,
// cause/prox provenance, replay-inert. The engine samples the PRESENCE plane
// (clients' live lastPose) once per second from the same clock that drives
// behavior timers — never per frame, and never from the fold. Occupancy is
// DERIVED: the log's own say effects are the only durable state, replayed on
// the first sweep after a restart to rebuild who was inside.
//
// Boundaries (the whole abuse story, all fail-closed):
//   - one sweep/second; log entries only on boundary transitions
//   - hysteresis: enter at dist<radius, exit only past exitRadius≥radius
//   - re-arm: after a SAID exit, the trigger stays silent for exitSec
//   - cooldown: per (entity,visitor) pair, an enter says once per cooldownSec
//   - at most TRIGGER_CAP triggers fire per world (deterministic order)
//   - spectators never occupy; effects are say-only (no verb can be minted
//     from a footstep); malformed comps clamp + lint, never crash

import type { LogEntry, WorldState } from "../shared/fold.js";

/** What the engine needs from its world — the BehaviorHost's WorldLike plus
 * two optional reads the live World carries anyway (structural, so this
 * module never imports server.ts or world.ts). */
export type ProxWorld = {
  name: string;
  state: WorldState;
  clients: Set<{ id: string; spectator: boolean; lastPose?: unknown }>;
  recentSays?: LogEntry[];
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

type Cfg = {
  radius: number;
  exitRadius: number;
  exitSec: number;
  cooldownSec: number;
  enter: string | null;
  exit: string | null;
};

const TRIGGER_CAP = 8;
const PROX_CAP_DEFAULT = 8;
const RADIUS_MIN = 0.5, RADIUS_MAX = 50;
const EXIT_SEC_MIN = 15, EXIT_SEC_MAX = 3600, EXIT_SEC_DEFAULT = 60;
const COOLDOWN_MIN = 10, COOLDOWN_MAX = 3600, COOLDOWN_DEFAULT = 60;
const LINE_MAX = 200;
const REBUILD_SAYS = 400;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const isFiniteNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function positionOf(p: unknown): number[] | null {
  if (!Array.isArray(p) || p.length < 3) return null;
  const [x, y, z] = p;
  if (!isFiniteNum(x) || !isFiniteNum(y) || !isFiniteNum(z)) return null;
  return [x, y, z];
}

/** Clamp an authored comp into a legal config, collecting lint notes.
 * Pure: no debug side effects here (the caller lints once per data shape). */
export function normalizeProximity(data: unknown): { cfg: Cfg; notes: string[] } {
  const notes: string[] = [];
  const d = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  let radius = isFiniteNum(d.radius) ? d.radius : PROX_CAP_DEFAULT;
  if (!isFiniteNum(d.radius) && d.radius !== undefined) notes.push(`radius ${JSON.stringify(d.radius)} is not a number — default ${PROX_CAP_DEFAULT}`);
  const rc = clamp(radius, RADIUS_MIN, RADIUS_MAX);
  if (rc !== radius) { notes.push(`radius ${radius} clamped to ${rc}`); radius = rc; }
  let exitRadius = isFiniteNum(d.exitRadius) ? d.exitRadius : Math.max(radius * 1.25, radius + 2);
  if (!isFiniteNum(d.exitRadius) && d.exitRadius !== undefined) notes.push(`exitRadius ${JSON.stringify(d.exitRadius)} is not a number — derived`);
  if (exitRadius < radius) { notes.push(`exitRadius ${exitRadius} below radius — raised to ${radius}`); exitRadius = radius; }
  const ec = clamp(exitRadius, radius, RADIUS_MAX);
  if (ec !== exitRadius) { notes.push(`exitRadius ${exitRadius} clamped to ${ec}`); exitRadius = ec; }
  let exitSec = isFiniteNum(d.exitSec) ? d.exitSec : EXIT_SEC_DEFAULT;
  if (!isFiniteNum(d.exitSec) && d.exitSec !== undefined) notes.push(`exitSec ${JSON.stringify(d.exitSec)} is not a number — default ${EXIT_SEC_DEFAULT}`);
  const esc = clamp(Math.round(exitSec), EXIT_SEC_MIN, EXIT_SEC_MAX);
  if (esc !== exitSec) { notes.push(`exitSec ${exitSec} clamped to ${esc}`); exitSec = esc; }
  let cooldownSec = isFiniteNum(d.cooldownSec) ? d.cooldownSec : COOLDOWN_DEFAULT;
  if (!isFiniteNum(d.cooldownSec) && d.cooldownSec !== undefined) notes.push(`cooldownSec ${JSON.stringify(d.cooldownSec)} is not a number — default ${COOLDOWN_DEFAULT}`);
  const csc = clamp(Math.round(cooldownSec), COOLDOWN_MIN, COOLDOWN_MAX);
  if (csc !== cooldownSec) { notes.push(`cooldownSec ${cooldownSec} clamped to ${csc}`); cooldownSec = csc; }
  const line = (v: unknown): string | null => {
    if (v == null) return null;
    const s = String(v).slice(0, LINE_MAX);
    if (s !== String(v)) notes.push("line clamped to 200 chars");
    return s;
  };
  return {
    cfg: { radius, exitRadius, exitSec, cooldownSec, enter: line(d.enter), exit: line(d.exit) },
    notes,
  };
}

/** One world's proximity engine. Constructed by the BehaviorHost (which the
 * World owns), swept from the global 1s behavior tick. All says are wrapped
 * so no sweep may ever take the sequencer down (house rule 3). */
export class ProximityEngine {
  private w: ProxWorld;
  /** entity id -> visitor ids currently inside (presence-plane, in-memory) */
  private occupancy = new Map<string, Set<string>>();
  /** `${entity}:${who}` -> seq of the SAID enter this inside-ness came from */
  private saidEnter = new Map<string, number>();
  /** entity id -> ts before which it stays silent after a SAID exit */
  private disarmedUntil = new Map<string, number>();
  /** `${entity}:${who}` -> ts before which that pair's enters stay silent */
  private cooldownUntil = new Map<string, number>();
  /** last linted comp shape per entity — lint once per shape, not per sweep */
  private lintedShape = new Map<string, string>();
  private cfgCache = new Map<string, Cfg>();
  private lastTriggers = new Set<string>();
  private booted = false;

  constructor(w: ProxWorld) { this.w = w; }

  /** The first sweep after a (re)start rebuilds occupancy from the log's own
   * say effects — the log is the only durable state. Mints nothing. */
  private rebuild() {
    const says = (this.w.recentSays ?? []).filter((e) => e.verb === "say" && e.actor === "world"
      && (e.args as Record<string, unknown>)?.prox != null).slice(-REBUILD_SAYS);
    const triggers = this.triggers();
    for (const { id, cfg } of triggers) {
      const inside = new Set<string>();
      // walk BACKWARDS so the LAST event per visitor wins
      for (let i = says.length - 1; i >= 0; i--) {
        const prox = (says[i].args as { prox?: { enter?: string; exit?: string; who?: string } }).prox;
        if (!prox || (prox.enter !== id && prox.exit !== id)) continue;
        const who = prox.who;
        if (!who || inside.has(who)) continue;   // last-writer-wins already set
        const wasEnter = prox.enter === id;
        if (wasEnter) {
          inside.add(who);
          this.saidEnter.set(`${id}:${who}`, says[i].seq);
          this.cooldownUntil.set(`${id}:${who}`, says[i].ts + cfg.cooldownSec * 1000);
        } else {
          this.disarmedUntil.set(id, Math.max(this.disarmedUntil.get(id) ?? 0, says[i].ts + cfg.exitSec * 1000));
          // a visitor whose last event is an exit stays OUTSIDE
        }
      }
      if (inside.size) this.occupancy.set(id, inside);
    }
    this.booted = true;
  }

  /** Entities carrying a proximity comp, in deterministic folded order, with
   * clamped configs. Lint notes fire once per authored data shape. */
  private triggers(): { id: string; cfg: Cfg; pos: number[] }[] {
    const out: { id: string; cfg: Cfg; pos: number[] }[] = [];
    const ents = this.w.state.entities as Record<string, { pos?: unknown; comp?: Record<string, unknown> }>;
    for (const [id, ent] of Object.entries(ents)) {
      const data = ent?.comp?.proximity;
      if (data == null) continue;
      const shape = JSON.stringify(data);
      let cfg = this.cfgCache.get(id);
      if (this.lintedShape.get(id) !== shape || !cfg) {
        const n = normalizeProximity(data);
        cfg = n.cfg;
        if (n.notes.length) this.w.debug("prox-lint", { entity: id, notes: n.notes });
        this.lintedShape.set(id, shape);
        this.cfgCache.set(id, cfg);
      }
      out.push({ id, cfg, pos: positionOf(ent.pos) ?? [0, 0, 0] });
    }
    return out;
  }

  /** A LIVE position for an entity: its leased transform if someone is
   * streaming it, its folded pos otherwise. */
  private livePos(id: string, folded: number[]): number[] {
    const L = this.w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
    return positionOf(L?.lastState?.p) ?? folded;
  }

  /** Embodied, posed visitors — spectators and unposed joins never occupy. */
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

  private say(text: string, id: string, prox: Record<string, unknown>, who: string): number {
    const entry = this.w.append("world", "say", { text, id, prox, by: who });
    this.w.broadcast({ type: "log", entry });
    return entry.seq;
  }

  /** The 1Hz sweep. Presence in, transition pairs out, nothing per frame. */
  sweep(now: number): void {
    if (!this.booted) this.rebuild();
    const triggers = this.triggers();
    const ids = new Set(triggers.map((t) => t.id));

    // comps removed (or entities gone): drop occupancy silently, note once
    for (const id of [...this.occupancy.keys()]) {
      if (!ids.has(id)) {
        if (this.lastTriggers.has(id)) this.w.debug("prox-skip", { entity: id, why: "component removed" });
        this.occupancy.delete(id);
        for (const k of [...this.saidEnter.keys()]) if (k.startsWith(`${id}:`)) this.saidEnter.delete(k);
      }
    }
    this.lastTriggers = ids;

    const people = this.embodied();
    let fired = 0;   // cap counted over WOULD-FIRE transitions this sweep

    for (const t of triggers) {
      const cfg = t.cfg;
      const pos = this.livePos(t.id, t.pos);
      const prev = this.occupancy.get(t.id) ?? new Set<string>();
      const inside = new Set<string>();
      const band = new Set<string>();   // inside exitRadius but past radius: hold state

      for (const person of people) {
        const d = Math.hypot(person.p[0] - pos[0], person.p[1] - pos[1], person.p[2] - pos[2]);
        if (d < cfg.radius) inside.add(person.id);
        else if (d < cfg.exitRadius) band.add(person.id);
      }
      // hysteresis: band members keep their previous inside/outside state
      for (const who of band) if (prev.has(who)) inside.add(who);

      const enters = [...inside].filter((x) => !prev.has(x));
      const exits = [...prev].filter((x) => !inside.has(x));

      for (const who of exits) {
        const key = `${t.id}:${who}`;
        const cause = this.saidEnter.get(key);
        if (cause != null && cfg.exit != null) {
          this.say(cfg.exit, t.id, { exit: t.id, who, causeEnter: cause, at: now }, who);
          this.disarmedUntil.set(t.id, now + cfg.exitSec * 1000);
        }
        this.saidEnter.delete(key);
        // a silent exit (line-less or never-said enter) never re-arms
      }

      const disarmed = now < (this.disarmedUntil.get(t.id) ?? 0);
      for (const who of enters) {
        const key = `${t.id}:${who}`;
        const cooled = now < (this.cooldownUntil.get(key) ?? 0);
        if (!disarmed && !cooled && cfg.enter != null) {
          if (fired >= TRIGGER_CAP) {
            this.w.debug("prox-cap", { entity: t.id, who, why: `trigger cap — ${TRIGGER_CAP} already fired this sweep` });
            continue;
          }
          const seq = this.say(cfg.enter, t.id, { enter: t.id, who, at: now }, who);
          this.saidEnter.set(key, seq);
          this.cooldownUntil.set(key, now + cfg.cooldownSec * 1000);
          fired++;
          this.w.debug("prox-trigger", { entity: t.id, who, effect: seq, kind: "enter" });
        }
        // suppressed enters flip occupancy silently (pair discipline)
      }

      // occupancy always tracks geometry — silence is about SAYING, not state
      this.occupancy.set(t.id, inside);
    }
  }

  /** A client disconnected: exit them NOW rather than waiting a sweep.
   * Called from the host's presence hook; same pair discipline. */
  disconnect(id: string, now = Date.now()): void {
    for (const [ent, who] of this.occupancy) {
      if (!who.has(id)) continue;
      who.delete(id);
      const key = `${ent}:${id}`;
      const cause = this.saidEnter.get(key);
      const data = (this.w.state.entities as Record<string, { comp?: Record<string, unknown> }>)[ent]?.comp?.proximity;
      const { cfg } = normalizeProximity(data);
      if (cause != null && cfg.exit != null) {
        this.say(cfg.exit, ent, { exit: ent, who: id, causeEnter: cause, at: now }, id);
        this.disarmedUntil.set(ent, now + cfg.exitSec * 1000);
      }
      this.saidEnter.delete(key);
      if (!who.size) this.occupancy.delete(ent);
    }
  }
}
