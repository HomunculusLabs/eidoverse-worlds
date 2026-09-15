// eidoverse-worlds sequencer — regions (VOCABULARY-LOOP.md § REGIONS CONTRACT,
// vocab-3). A place that KNOWS WHO IS INSIDE, restart-safely: an entity
// carrying `comp {type:"region", data:{...}}` tracks embodied visitors and
// answers boundary crossings, and membership itself is WRITTEN INTO THE FOLD
// (world-authored comp transition writes carrying the authored shape plus the
// current members), so replay, late join, restart and fork all fold the same
// truth with no ring-window heuristics — the log is the only durable state.
//
// Doctrine, same as reactions.ts/proximity.ts: presence-plane in, ordinary
// logged verbs out, cause/provenance, replay-inert. Effects are say-only —
// no verb can be minted from a footstep.
//
// Boundaries (the whole abuse story, all fail-closed):
//   - one sweep/second; log entries only on boundary transitions
//   - membership writes are COALESCED: one comp write per region per sweep,
//     only when membership actually changed; standing inside writes nothing
//   - shape: a scaled ellipsoid (radius, heightScale) with a hysteresis band
//     (normalized distance 1 → exitScale)
//   - re-arm: after a SAID exit, the region stays silent for exitSec
//   - cooldown: per (region,visitor) pair, an enter says once per cooldownSec
//   - at most TRIGGER_CAP enters say per sweep; overflow flips state silently
//   - spectators never become members; malformed comps clamp + lint
//   - boot grace: members folded at boot are held for graceSec; a member who
//     re-presents inside keeps CONTINUOUS membership (no re-welcome); absent
//     members prune SILENTLY after grace (no exit says — their exit was a
//     disconnect, already said or never sayable)

import type { LogEntry, WorldState } from "../shared/fold.js";

/** What the engine needs from its world — the BehaviorHost's WorldLike plus
 * the presence-plane reads (structural, so this module never imports
 * server.ts or world.ts). */
export type RegionWorld = {
  name: string;
  state: WorldState;
  clients: Set<{ id: string; spectator: boolean; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

type Cfg = {
  radius: number;
  heightScale: number;
  exitScale: number;
  exitSec: number;
  cooldownSec: number;
  graceSec: number;
  enter: string | null;
  exit: string | null;
  /** the authored data object, written back verbatim with fresh members */
  authored: Record<string, unknown>;
};

const TRIGGER_CAP = 8;
const RADIUS_DEFAULT = 8;
const RADIUS_MIN = 1, RADIUS_MAX = 100;
const HEIGHT_MIN = 0.05, HEIGHT_MAX = 8, HEIGHT_DEFAULT = 1;
const EXIT_SCALE_MIN = 1, EXIT_SCALE_MAX = 2;
const EXIT_SEC_MIN = 5, EXIT_SEC_MAX = 3600, EXIT_SEC_DEFAULT = 30;
const COOLDOWN_MIN = 5, COOLDOWN_MAX = 3600, COOLDOWN_DEFAULT = 60;
const GRACE_MIN = 3, GRACE_MAX = 600, GRACE_DEFAULT = 45;
const LINE_MAX = 200;
const MEMBERS_CAP = 64;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const isFiniteNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function positionOf(p: unknown): number[] | null {
  if (!Array.isArray(p) || p.length < 3) return null;
  const [x, y, z] = p;
  if (!isFiniteNum(x) || !isFiniteNum(y) || !isFiniteNum(z)) return null;
  return [x, y, z];
}

/** Clamp an authored comp into a legal config, collecting lint notes.
 * The authored shape rides along so membership writes preserve it. Pure. */
export function normalizeRegion(data: unknown): { cfg: Cfg; notes: string[] } {
  const notes: string[] = [];
  const d = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  let radius = isFiniteNum(d.radius) ? d.radius : RADIUS_DEFAULT;
  if (!isFiniteNum(d.radius) && d.radius !== undefined) notes.push(`radius ${JSON.stringify(d.radius)} is not a number — default ${RADIUS_DEFAULT}`);
  const rc = clamp(radius, RADIUS_MIN, RADIUS_MAX);
  if (rc !== radius) { notes.push(`radius ${radius} clamped to ${rc}`); radius = rc; }
  let heightScale = isFiniteNum(d.heightScale) ? d.heightScale : HEIGHT_DEFAULT;
  if (!isFiniteNum(d.heightScale) && d.heightScale !== undefined) notes.push(`heightScale ${JSON.stringify(d.heightScale)} is not a number — default ${HEIGHT_DEFAULT}`);
  const hc = clamp(heightScale, HEIGHT_MIN, HEIGHT_MAX);
  if (hc !== heightScale) { notes.push(`heightScale ${heightScale} clamped to ${hc}`); heightScale = hc; }
  let exitScale = isFiniteNum(d.exitScale) ? d.exitScale : 1.2;
  if (!isFiniteNum(d.exitScale) && d.exitScale !== undefined) notes.push(`exitScale ${JSON.stringify(d.exitScale)} is not a number — default 1.2`);
  if (exitScale < EXIT_SCALE_MIN) { notes.push(`exitScale ${exitScale} below 1 — raised to ${EXIT_SCALE_MIN}`); exitScale = EXIT_SCALE_MIN; }
  const esc = clamp(exitScale, EXIT_SCALE_MIN, EXIT_SCALE_MAX);
  if (esc !== exitScale) { notes.push(`exitScale ${exitScale} clamped to ${esc}`); exitScale = esc; }
  let exitSec = isFiniteNum(d.exitSec) ? d.exitSec : EXIT_SEC_DEFAULT;
  if (!isFiniteNum(d.exitSec) && d.exitSec !== undefined) notes.push(`exitSec ${JSON.stringify(d.exitSec)} is not a number — default ${EXIT_SEC_DEFAULT}`);
  const xsc = clamp(Math.round(exitSec), EXIT_SEC_MIN, EXIT_SEC_MAX);
  if (xsc !== exitSec) { notes.push(`exitSec ${exitSec} clamped to ${xsc}`); exitSec = xsc; }
  let cooldownSec = isFiniteNum(d.cooldownSec) ? d.cooldownSec : COOLDOWN_DEFAULT;
  if (!isFiniteNum(d.cooldownSec) && d.cooldownSec !== undefined) notes.push(`cooldownSec ${JSON.stringify(d.cooldownSec)} is not a number — default ${COOLDOWN_DEFAULT}`);
  const csc = clamp(Math.round(cooldownSec), COOLDOWN_MIN, COOLDOWN_MAX);
  if (csc !== cooldownSec) { notes.push(`cooldownSec ${cooldownSec} clamped to ${csc}`); cooldownSec = csc; }
  let graceSec = isFiniteNum(d.graceSec) ? d.graceSec : GRACE_DEFAULT;
  if (!isFiniteNum(d.graceSec) && d.graceSec !== undefined) notes.push(`graceSec ${JSON.stringify(d.graceSec)} is not a number — default ${GRACE_DEFAULT}`);
  const gsc = clamp(Math.round(graceSec), GRACE_MIN, GRACE_MAX);
  if (gsc !== graceSec) { notes.push(`graceSec ${graceSec} clamped to ${gsc}`); graceSec = gsc; }
  const line = (v: unknown): string | null => {
    if (v == null) return null;
    const s = String(v).slice(0, LINE_MAX);
    if (s !== String(v)) notes.push("line clamped to 200 chars");
    return s;
  };
  return {
    cfg: { radius, heightScale, exitScale, exitSec, cooldownSec, graceSec,
      enter: line(d.enter), exit: line(d.exit), authored: d },
    notes,
  };
}

/** One world's region engine. Constructed by the BehaviorHost, swept from the
 * global 1s behavior tick. Everything is wrapped so no sweep may ever take
 * the sequencer down (house rule 3). */
export class RegionEngine {
  private w: RegionWorld;
  /** region id -> normalized membership (mirrors the folded comp's members) */
  private members = new Map<string, string[]>();
  /** `${region}:${who}` -> seq of the SAID enter this inside-ness came from */
  private saidEnter = new Map<string, number>();
  /** region id -> ts before which it stays silent after a SAID exit */
  private disarmedUntil = new Map<string, number>();
  /** `${region}:${who}` -> ts before which that pair's enters stay silent */
  private cooldownUntil = new Map<string, number>();
  /** last linted comp shape per region — lint once per shape, not per sweep */
  private lintedShape = new Map<string, string>();
  private cfgCache = new Map<string, Cfg>();
  private lastRegions = new Set<string>();
  private booted = false;
  private bootTs = 0;
  /** membership folded at boot, held through grace */
  private bootMembers = new Map<string, { who: string; until: number }>();

  constructor(w: RegionWorld) { this.w = w; }

  private say(text: string, id: string, region: Record<string, unknown>, who: string): number {
    const entry = this.w.append("world", "say", { text, id, region, by: who });
    this.w.broadcast({ type: "log", entry });
    return entry.seq;
  }

  /** The membership write: one world-authored comp entry carrying the
   * AUTHORED shape plus the new members — the fold is the durable state.
   * The verb layer's 8KB gate doesn't sit on this path (reactions doctrine:
   * world-authority appends), so cap it here — fail closed: an oversized
   * write degrades to a minimal members-only shape, never a bloated one. */
  private writeMembers(id: string, cfg: Cfg, members: string[]) {
    let data: Record<string, unknown> = { ...cfg.authored, members };
    if (JSON.stringify(data).length > 8000) {
      this.w.debug("region-lint", { entity: id, notes: ["membership write over 8KB — wrote members only (author data too large)"] });
      data = { members };
    }
    const entry = this.w.append("world", "comp", { id, type: "region", data });
    this.w.broadcast({ type: "log", entry });
  }

  /** Regions carrying a region comp, in deterministic folded order, with
   * clamped configs. Lint notes fire once per authored data shape. */
  private regions(): { id: string; cfg: Cfg; pos: number[] }[] {
    const out: { id: string; cfg: Cfg; pos: number[] }[] = [];
    const ents = this.w.state.entities as Record<string, { pos?: unknown; comp?: Record<string, unknown> }>;
    for (const [id, ent] of Object.entries(ents)) {
      const data = ent?.comp?.region;
      if (data == null) continue;
      const shape = JSON.stringify(data);
      let cfg = this.cfgCache.get(id);
      if (this.lintedShape.get(id) !== shape || !cfg) {
        const n = normalizeRegion(data);
        cfg = n.cfg;
        if (n.notes.length) this.w.debug("region-lint", { entity: id, notes: n.notes });
        this.lintedShape.set(id, shape);
        this.cfgCache.set(id, cfg);
        // a re-authored shape may free members no longer tracked: drop them
        const keep = new Set(this.members.get(id) ?? []);
        this.members.set(id, keep.size ? [...keep] : []);
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

  /** Normalized ellipsoid distance from p to the region's live center:
   * 1.0 is the boundary, <1 inside. Y scales by heightScale. */
  private normDist(p: number[], c: number[], radius: number, heightScale: number): number {
    const dx = (p[0] - c[0]) / radius;
    const dy = (p[1] - c[1]) / (radius * heightScale);
    const dz = (p[2] - c[2]) / radius;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /** The first sweep after a (re)start: seed membership from the FOLD (the
   * comp's own members array — the log is the state), hold it through a
   * grace window, and mint nothing. */
  private rebuild(now: number) {
    this.bootTs = now;
    for (const { id, cfg } of this.regions()) {
      const raw = (this.w.state.entities as Record<string, { comp?: Record<string, unknown> }>)[id]?.comp?.region;
      const data = raw as { members?: unknown } | undefined;
      const folded = Array.isArray(data?.members)
        ? (data!.members as unknown[]).filter((x): x is string => typeof x === "string").slice(0, MEMBERS_CAP)
        : [];
      this.members.set(id, [...folded]);
      for (const who of folded) {
        this.bootMembers.set(`${id}:${who}`, { who, until: now + cfg.graceSec * 1000 });
      }
    }
    this.booted = true;
  }

  /** The 1Hz sweep. Presence in, transitions out; membership writes are
   * coalesced per region per sweep. */
  sweep(now: number): void {
    if (!this.booted) this.rebuild(now);
    const regions = this.regions();
    const ids = new Set(regions.map((r) => r.id));

    // comps removed (or entities gone): drop tracking silently, note once
    for (const id of [...this.members.keys()]) {
      if (!ids.has(id)) {
        if (this.lastRegions.has(id)) this.w.debug("region-skip", { entity: id, why: "component removed" });
        this.members.delete(id);
        for (const k of [...this.saidEnter.keys()]) if (k.startsWith(`${id}:`)) this.saidEnter.delete(k);
        for (const k of [...this.bootMembers.keys()]) if (k.startsWith(`${id}:`)) this.bootMembers.delete(k);
      }
    }
    this.lastRegions = ids;

    const people = this.embodied();
    const present = new Map(people.map((p) => [p.id, p.p]));
    let fired = 0;   // cap counted over WOULD-SAY enters this sweep

    for (const r of regions) {
      const cfg = r.cfg;
      const pos = this.livePos(r.id, r.pos);
      const prev = this.members.get(r.id) ?? [];
      const prevSet = new Set(prev);
      const inside = new Set<string>();
      const band = new Set<string>();   // past the boundary, inside exitScale: hold state

      for (const person of people) {
        const d = this.normDist(person.p, pos, cfg.radius, cfg.heightScale);
        if (d < 1) inside.add(person.id);
        else if (d < cfg.exitScale) band.add(person.id);
      }
      // hysteresis: band members keep their previous inside/outside state
      for (const who of band) if (prevSet.has(who)) inside.add(who);

      // boot-grace: a held member who re-presents inside keeps membership
      // (no re-enter); grace expiry prunes absent members SILENTLY
      for (const [key, held] of [...this.bootMembers]) {
        if (!key.startsWith(`${r.id}:`)) continue;
        if (now >= held.until) { this.bootMembers.delete(key); continue; }
        if (inside.has(held.who)) this.bootMembers.delete(key);   // continuous — grace done for them
        else if (prevSet.has(held.who) && !present.has(held.who)) inside.add(held.who);   // absent but held
      }

      const enters = [...inside].filter((x) => !prevSet.has(x));
      const exits = [...prevSet].filter((x) => !inside.has(x));

      for (const who of exits) {
        const key = `${r.id}:${who}`;
        this.bootMembers.delete(key);
        const cause = this.saidEnter.get(key);
        if (cause != null && cfg.exit != null) {
          this.say(cfg.exit, r.id, { exit: r.id, who, causeEnter: cause, at: now }, who);
          this.disarmedUntil.set(r.id, now + cfg.exitSec * 1000);
        }
        this.saidEnter.delete(key);
        // a silent exit (line-less or never-said enter) never re-arms
      }

      const disarmed = now < (this.disarmedUntil.get(r.id) ?? 0);
      for (const who of enters) {
        const key = `${r.id}:${who}`;
        const cooled = now < (this.cooldownUntil.get(key) ?? 0);
        if (!disarmed && !cooled && cfg.enter != null) {
          if (fired >= TRIGGER_CAP) {
            this.w.debug("region-cap", { entity: r.id, who, why: `trigger cap — ${TRIGGER_CAP} already fired this sweep` });
            continue;
          }
          const seq = this.say(cfg.enter, r.id, { enter: r.id, who, at: now }, who);
          this.saidEnter.set(key, seq);
          this.cooldownUntil.set(key, now + cfg.cooldownSec * 1000);
          fired++;
          this.w.debug("region-trigger", { entity: r.id, who, effect: seq, kind: "enter" });
        }
        // suppressed enters flip membership silently (pair discipline) — and
        // a re-presenting grace member was never an enter (deleted from held)
      }

      // membership always tracks geometry; write ONLY on change, coalesced
      const next = [...inside];
      if (next.length > MEMBERS_CAP) next.length = MEMBERS_CAP;   // deterministic folded order
      const changed = next.length !== prev.length || next.some((x, i) => x !== prev[i]);
      if (changed) {
        this.writeMembers(r.id, cfg, next);
        this.members.set(r.id, next);
      }
    }
  }

  /** A client disconnected: exit them NOW rather than waiting a sweep.
   * Called from the host's presence hook; same pair discipline. */
  disconnect(id: string, now = Date.now()): void {
    for (const [ent, prev] of this.members) {
      if (!prev.includes(id)) continue;
      const key = `${ent}:${id}`;
      this.bootMembers.delete(key);
      const cause = this.saidEnter.get(key);
      const data = (this.w.state.entities as Record<string, { comp?: Record<string, unknown> }>)[ent]?.comp?.region;
      const { cfg } = normalizeRegion(data);
      if (cause != null && cfg.exit != null) {
        this.say(cfg.exit, ent, { exit: ent, who: id, causeEnter: cause, at: now }, id);
        this.disarmedUntil.set(ent, now + cfg.exitSec * 1000);
      }
      this.saidEnter.delete(key);
      this.members.set(ent, prev.filter((x) => x !== id));
      this.writeMembers(ent, cfg, prev.filter((x) => x !== id));
    }
  }
}
