// eidoverse-worlds sequencer — echo walls (VOCABULARY-LOOP.md § ECHOES
// CONTRACT, vocab-35). Paired sound posts that relay a recorded say
// between two points with delay and rate caps: an entity carrying
// `comp {type:"echo", data:{...}}` becomes a LISTENER. A live say by a
// PRESENT, POSED actor within `listen` metres of the wall is recorded,
// and after `delaySec` the wall speaks the words back at its `pair`
// partner — the recorded say's seq as cause, the SPEAKER as by.
//
//   say {text} by a posed actor in earshot
//     → (after delaySec)
//     → 1. say {text:<words verbatim, clamped>, id:<pair>,
//               echo:{who, at}, cause:<the recorded say's seq>,
//               by:<the speaker>}              (actor world — the
//          phrases/doors provenance grammar: relay says carry by = the
//          speaker, cause = the say that was recorded)
//     → 2. broadcast {type:"sound", id:<pair>, echo:{return:true},
//                     note:{hz,sec,gain,wave}, p:<partner live pos>, at,
//                     by:<speaker>}              (presence plane only —
//          the music/force doctrine: never logged, never folded, never
//          replayed; music.js synthesizes the hum with zero new client
//          code)
//
// The comp is a STATIC AUTHORED TABLE (doors/portals/bells doctrine):
// NO comp transitions are ever minted, NO relay state is persisted —
// the relay says themselves ARE the record (world_history reads them;
// an in-flight relay that dies with the process is simply a voice that
// never finished crossing the valley — replay mints nothing).
//
// Boundaries (all fail-closed, the whole abuse story):
//   - a say past ECHO_READ_CAP (500c) is not speech to an echo — the
//     wall ignores it silently (the phrases cap)
//   - one relay per wall per say, at most ECHO_CAP (3) walls relay any
//     single say (folded-state order, deterministic — the phrases
//     ANSWER_CAP doctrine)
//   - per-wall cooldown (authored cooldownSec, clamped [1,60] d3)
//     between RECORDINGS — the rate cap: a chatty room mints one relay
//     per window, never a stream
//   - the speaker must be PRESENT and POSED: no live pose = no record
//     (arm's-reach arithmetic without the use verb — the wall listens
//     to bodies, not to history)
//   - world-authored says are never recorded (actor !== "world" — the
//     wall would hear its own voice, and every family's says, forever)
//   - loop closure: a relay say is actor "world" ⇒ never recorded ⇒
//     two walls paired to each other relay once and stop — no
//     ping-pong, no echo-storm, by construction
//   - pair validated at fire (portal 'to' doctrine): missing entity
//     skips fail-closed; pair-to-self refused; a non-echo partner is
//     LEGAL (the voice lands at a point in the world — a plain bench
//     can be the far post)
//   - spectator says never reach this path (shell gate)
//   - the delay is capped [0.5,30] d2 — the memory bound (an in-memory
//     timer set is bounded by the world's say rate)
//   - lint: clamp + note (door-lint doctrine), once per firing
//
// Authority: none taken. Listening is not a verb — nobody uses an echo
// wall; SPEAKING is the interaction, and saying is already rank-0 for
// every present body. Authoring the comp is builder (rank 1) at the
// shell. Effects are say + presence-sound ONLY — no other verb can be
// minted from a recording.
//
// Takes the same structural world as phrases (ReactionWorld). Wired
// via reactToSay in reactions.ts (after the phrases sweep, last).
// Replay-inert like all reactions: this path runs ONLY from the live
// verb path — w.append folds the engine's own writes without
// re-entering any hook, and folding history never fires anything.

import type { LogEntry } from "../shared/fold.js";
// the clamps + the relay text/note derivations, shared verbatim with
// the tests, the mcpl text tier, and any future client consumer — the
// engine writes EXACTLY what shared/echo.js derives.
import { normalizeEcho, echoText, echoNote, ECHO_READ_CAP, ECHO_CAP } from "../shared/echo.js";

export type EchoWorld = {
  name: string;
  state: { entities: Record<string, { pos?: number[]; comp?: Record<string, unknown> }> };
  broadcast(msg: unknown): void;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  debug(kind: string, detail: Record<string, unknown>): void;
};

/** Per-boot, per-wall engine memory — deliberately NOT the truth: last
 *  record time for the cooldown window. Dropped on restart; the log
 *  keeps the relay history. */
const lastRecordAt = new Map<string, number>();

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/wish.ts carry). */
function livePoseOf(
  w: EchoWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  who: string,
): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The wall's LIVE position: folded pos (walls are static by nature —
 *  a leased wall's stream pos would ride here if leases ever carry
 *  one). */
function wallLivePos(ent: { pos?: number[] }): number[] {
  return Array.isArray(ent.pos) && ent.pos.length >= 3 ? ent.pos.slice(0, 3) : [0, 0, 0];
}

/** Fire the relay at the partner: ONE world-authored say + ONE
 *  presence-plane note. The relay is the family's own transition —
 *  exported so a future tier can drive a wall through the same doors. */
export function echoRelay(
  w: EchoWorld,
  cause: LogEntry,
  cfg: ReturnType<typeof normalizeEcho>["cfg"],
  partnerId: string,
  partner: { pos?: number[] },
  speaker: string,
  text: string,
  now: number,
) {
  const say = w.append("world", "say",
    { text, id: partnerId, echo: { who: speaker, at: now }, cause: cause.seq, by: speaker });
  w.broadcast({ type: "log", entry: say });
  w.broadcast({ type: "sound", id: partnerId, echo: { return: true },
    note: echoNote(cfg), p: wallLivePos(partner), at: now, by: speaker, cause: cause.seq });
  return say;
}

/** The say listener. Called from reactToSay's tail (reactions.ts) for
 *  every live human say — iterates folded echo comps, applies the ear/
 *  pose/cooldown/cap gates, and arms the delayed relay. Returns the
 *  number of walls that recorded the say. */
export function reactToSayEcho(
  w: EchoWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
): number {
  const a = cause.args as { text?: unknown } | null | undefined;
  const raw = typeof a?.text === "string" ? a.text : "";
  if (!raw || raw.length > ECHO_READ_CAP) return 0;      // bounded work; silence is legal
  if (cause.actor === "world") return 0;                 // never record the world's own voice
  let recorded = 0;
  let linted = new Set<string>();
  for (const [id, ent] of Object.entries(w.state.entities ?? {})) {
    const data = (ent as { comp?: Record<string, unknown> })?.comp?.echo;
    if (data == null) continue;                          // not an echo wall
    try {
      const { cfg, notes } = normalizeEcho(data, id);
      if (notes.length && !linted.has(id)) { w.debug("echo-lint", { entity: id, notes }); linted.add(id); }
      if (cfg.pair == null) continue;                    // silent wall
      // cooldown: the rate cap — one RECORDING per wall per window
      const now = cause.ts;
      const last = lastRecordAt.get(id) ?? 0;
      if (now - last < cfg.cooldownSec * 1000) continue;
      // cap: at most ECHO_CAP walls record any single say
      if (recorded >= ECHO_CAP) {
        w.debug("echo-skip", { entity: id, by: cause.actor, why: `relay cap — ${ECHO_CAP} walls already recorded this say` });
        continue;
      }
      // the ear: the SPEAKER's live pose within listen metres of the wall
      const me = livePoseOf(w, cause.actor);
      if (!me) continue;                                 // unposed = not present
      const at = wallLivePos(ent as { pos?: number[] });
      if (Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.listen) continue;
      const text = echoText(raw);
      if (text == null) continue;                        // nothing to say back
      // pair validated at fire time... but the timer needs the partner
      // resolved when it fires — capture the id, resolve fresh then.
      const pairId = cfg.pair;
      recorded++;
      lastRecordAt.set(id, now);
      w.debug("echo-trigger", { entity: id, by: cause.actor, cause: cause.seq,
        pair: pairId, delayMs: Math.round(cfg.delaySec * 1000) });
      const fire = () => {
        try {
          const partner = w.state.entities?.[pairId];
          if (partner == null) {                         // pair missing at fire: fail closed
            w.debug("echo-skip", { entity: id, by: cause.actor, why: `pair "${pairId}" not in fold at fire` });
            return;
          }
          echoRelay(w, cause, cfg, pairId, partner, cause.actor, text, Date.now());
        } catch (err) {
          console.error(`[world:${w.name}] echo relay failed (never fatal)`, err);
          w.debug("reaction-error", { entity: id, action: "echo", by: cause.actor, error: String(err) });
        }
      };
      setTimeout(fire, cfg.delaySec * 1000);
    } catch (err) {
      console.error(`[world:${w.name}] echo step failed (never fatal)`, err);
      w.debug("reaction-error", { entity: id, action: "say", by: cause.actor, error: String(err) });
    }
  }
  return recorded;
}

/** Drop a wall's cooldown memory when its comp is removed — keeps the
 *  map honest without a sweep. Wired from verbs.ts's afterComp row? No:
 *  a stale cooldown key costs one Map entry per wall id that ever
 *  existed; bounded by the world's wall population. Deliberately not
 *  wired — the map is per-boot memory, never the truth. */
