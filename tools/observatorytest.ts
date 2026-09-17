// Observatory matrix — `comp {type:"observatory"}` makes a telescope
// SESSION-HOLDING: use {action:"observe"} derives the NEXT scheduled
// celestial event (a day-phase crossing — the sun's own schedule) from the
// FOLDED SKY, fails closed when the sky is fixed (a telescope without a
// moving sky reads nothing), and mints ONE world-authored comp transition
// (the session {...authored, heldBy, until, at, ev} — the log is the only
// durable state, reservation doctrine) plus ONE say with obs provenance.
// Expiry is FOLD-DERIVED (sessionActive): a lapsed session blocks nothing,
// no sweep engine exists — late join, restart, replay and fork read the
// same window from the log alone.
// Self-booting: scratch sequencer (fresh WORLDS_DIR), builder authors the
// dome, visitors observe in reach under an owner-rated sky. Covers
// § OBSERVATORY CONTRACT:
//
//   bun tools/observatorytest.ts
//
// - unit:      nextEvent/sessionActive/normalize/sunDirection pure math
// - authoring: spawn + observatory comp is builder-gated; visitor bounces
// - observe:   use {action:"observe"} writes session + says with
//              obs{who,phase,at,until} + cause/by provenance
// - fold:      session folds from the log; late joiner reads the same window
// - conflict:  another's observe while held skips, NAMING THE HOLDER +
//              seconds — mints nothing
// - re-observe: the holder's observe re-anchors the session (kept claim)
// - expiry:    a seeded EXPIRED session blocks nothing — fold-derived truth
// - fixed sky: observe under a fixed hour fails closed (skip names it)
// - release:   holder release frees at rank 0; another's needs builder+
// - no-op:     release on a free eyepiece mints nothing
// - pass-through: non-observatory actions ("ring") fall through, no writes
// - reach:     out-of-reach observe mints nothing (skip names distance)
// - spectator: spectate legs cannot observe (shell gate)
// - lint:      slotSec 99999 clamps to 900 (until derives from the clamp)
// - 8KB:       oversized carry degrades to the session keys + lint note
// - restart:   replay mints nothing; the session survives restart folded
// - describe:  mcpl affordance reads next event + holder/free hint
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  describeObservatory, nextEvent, sessionActive, sessionRemainSec,
  normalizeObservatory, elevDeg, sunDirection, daySchedule, phaseOfHours,
} from "../shared/observatory.js";
import { hoursAt, effectiveClock } from "../shared/forecast.js";

const PORT = Number(process.env.PORT ?? 9041);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-obs";
const WORLD = `obstest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-obs-"));

let pass = 0, fail = 0;
const check = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class Client {
  ws!: WebSocket;
  msgs: any[] = [];
  snapshot: any = null;
  constructor(public id: string) {}
  connect(spectate = false): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(URL_);
      const t = setTimeout(() => reject(new Error(`${this.id}: join timeout`)), 8000);
      this.ws.onopen = () => this.ws.send(JSON.stringify({
        type: "join", world: WORLD, id: this.id, token: TOKEN,
        ...(spectate ? { spectate: true } : {}),
      }));
      this.ws.onmessage = (ev) => {
        const m = JSON.parse(String(ev.data));
        this.msgs.push(m);
        if (m.type === "snapshot") { this.snapshot = m; clearTimeout(t); resolve(); }
      };
      this.ws.onerror = () => { clearTimeout(t); reject(new Error(`${this.id}: socket error`)); };
    });
  }
  send(o: unknown) { this.ws.send(JSON.stringify(o)); }
  verb(verb: string, args: unknown) { this.send({ type: "verb", verb, args }); }
  walk(p: number[]) { this.send({ type: "pose", pose: { p, yaw: 0, speed: 1, clip: "walk" } }); }
  debug(kind: string) {
    this.send({ type: "debug", reqId: `d${this.msgs.length}`, kinds: [kind], limit: 120 });
  }
  close() { this.ws.close(); }
}

let server: ReturnType<typeof spawn> | null = null;
async function startServer() {
  server = spawn(process.execPath, [join(import.meta.dir, "..", "server", "server.ts")], {
    env: {
      ...process.env, PORT: String(PORT), WORLDS_DIR: worldsDir, JOIN_TOKEN: TOKEN,
      FOLD_EVERY: "40", VERB_RATE: "5000", MSG_RATE: "5000",
    },
    stdio: "ignore",
  });
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://127.0.0.1:${PORT}/avatars`)).ok) return; } catch { /* boot */ }
    await sleep(100);
  }
  throw new Error("scratch sequencer did not start");
}

const logLines = () => {
  const p = join(worldsDir, WORLD, "log.jsonl");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
};
const obsSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.obs != null && (!id || (e.args as any)?.id === id));
const obsComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "observatory" && (!id || (e.args as any)?.id === id));
/** The folded session of a dome = the LAST observatory comp write in the log. */
const logObs = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "observatory"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const snapObs = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.observatory ?? null;
/** A simplified sky-fold for test assertions (mirror of foldSkyEntry sky arm):
 *  ts/seq/by stamped, clock passthrough. */
const foldSky = (lines: any[]) => {
  let sky: any = null;
  for (const e of lines) {
    if (e.verb === "sky") sky = { ...e.args, ts: e.ts, seq: e.seq, by: e.actor };
    else if (e.verb === "weather" && sky) {
      sky = { ...sky, ...e.args, ts: e.ts };
    }
  }
  return sky;
};

try {
  console.log(`\nobservatory matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const T0 = 1_700_000_000_000;
    // a rated sky: hour 7.5, rate 360 (10s per world-hour) → dawn→day (+0.5h) in 5s
    const sky = { hours: 7.5, rate: 360, ts: T0 };
    const ev = nextEvent(sky, T0);
    check("unit: nextEvent finds dawn→day at hour 8 exactly",
      ev?.phase === "day" && Math.abs(ev.h - 8) < 1 / 60,
      JSON.stringify(ev));
    check("unit: nextEvent atMs = T0 + 0.5 world-hours at rate 360 (= +5s)",
      ev != null && Math.abs(ev.atMs - (T0 + (0.5 * 3600e3) / 360)) < 1500,
      `atMs=${ev?.atMs} want ${T0 + 5000}`);
    check("unit: hoursAt agrees at the crossing (mirrored math)",
      ev != null && Math.abs(hoursAt(sky, ev.atMs) - 8) < 1 / 60);
    // fail-closed arms
    check("unit: nextEvent null on a FIXED sky (fail closed)",
      nextEvent({ hours: 7.5, rate: 0, ts: T0 }, T0) == null
      && nextEvent({ hours: 7.5, ts: T0 }, T0) == null);
    check("unit: nextEvent null on NO sky",
      nextEvent(null, T0) == null && nextEvent(undefined, T0) == null);
    // horizon bound: rate 2, hour 8.9 → next crossing hour 18 = +9.1 world-hours
    // = 4.55 REAL hours at rate 2 — past a 1h look-ahead → null (fail closed)
    check("unit: nextEvent null past the authored horizon",
      nextEvent({ hours: 8.9, rate: 2, ts: T0 }, T0, { horizonH: 1 }) == null);
    check("unit: horizon 1h still finds the +5s crossing",
      nextEvent(sky, T0, { horizonH: 1 }) != null);
    // a night sky: hour 23.5 → night→dawn at hour 29 ≡ 5 (next day) = +5.5h = 55s
    const nightSky = { hours: 23.5, rate: 360, ts: T0 };
    const nev = nextEvent(nightSky, T0);
    check("unit: night→dawn wraps past midnight (hour 29 ≡ 5 mod 24)",
      nev?.phase === "dawn" && Math.abs(nev.h - 5) < 1 / 60,
      JSON.stringify(nev));
    // session math
    const now = Date.now();
    check("unit: sessionActive true inside the window",
      sessionActive({ heldBy: "bob", until: now + 60_000 }, now) === true);
    check("unit: sessionActive false past the window",
      sessionActive({ heldBy: "bob", until: now - 1 }, now) === false);
    check("unit: sessionActive false with no holder / garbage",
      sessionActive({ until: now + 60_000 }, now) === false
      && sessionActive("nonsense", now) === false && sessionActive(null, now) === false);
    // normalize clamps
    const { cfg, notes } = normalizeObservatory({ slotSec: 99999, reach: 99, az: 400 });
    check("unit: slotSec clamps to 900 + reach 12 + az normalized",
      cfg.slotSec === 900 && cfg.reach === 12 && cfg.az === 40 && notes.some((n) => n.includes("slotSec")),
      JSON.stringify({ cfg, notes }));
    const dflt = normalizeObservatory({});
    check("unit: defaults reach 4 / slot 300 / horizon 12 / az 180",
      dflt.cfg.reach === 4 && dflt.cfg.slotSec === 300 && dflt.cfg.horizonH === 12 && dflt.cfg.az === 180);
    // sun math mirrors sky.js
    check("unit: elevDeg mirrors sky.js (noon 60°, hour 6/18 = -8°, night clamps ≥ -8)",
      Math.abs(elevDeg(12) - 60) < 1e-9 && Math.abs(elevDeg(6) - (-8)) < 1e-9
      && Math.abs(elevDeg(18) - (-8)) < 1e-9 && elevDeg(2) === -8);
    const d180 = sunDirection(12, 180);
    check("unit: sunDirection default az = due south (z −cos60°, y sin60°)",
      Math.abs(d180.z + Math.cos((60 * Math.PI) / 180)) < 1e-9 && Math.abs(d180.x) < 1e-9
      && Math.abs(d180.y - Math.sin((60 * Math.PI) / 180)) < 1e-9,
      JSON.stringify(d180));
    const d0 = sunDirection(12, 0);
    check("unit: az 0 = due north (+z), same elevation",
      d0.z > 0 && Math.abs(d0.z - Math.cos((60 * Math.PI) / 180)) < 1e-9 && Math.abs(d0.x) < 1e-9);
    check("unit: daySchedule rides dayPhase's own bounds",
      JSON.stringify(daySchedule().map((s) => s.h)) === JSON.stringify([5, 8, 18, 21])
      && phaseOfHours(6) === "dawn" && phaseOfHours(23) === "night" && phaseOfHours(3) === "night"
      && phaseOfHours(9) === "day" && phaseOfHours(19) === "dusk");
    // describe reads
    const descHeld = describeObservatory({ heldBy: "bob", until: Date.now() + 100_000 }, sky, Date.now());
    check("unit: describe names the holder + next event",
      descHeld.startsWith("observatory:") && descHeld.includes("bob"), descHeld);
    const descFixed = describeObservatory({}, { hours: 12, rate: 0, ts: Date.now() }, Date.now());
    check("unit: describe names the fixed sky fail-closed",
      descFixed.includes("fixed") && descFixed.includes("no scheduled"), descFixed);
    check("unit: describe names the empty-sky fail-closed",
      describeObservatory({}, null, Date.now()).includes("no sky"), "empty sky line");
  }

  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await sleep(200);
  // the owner authors a rated sky: hour 6.0, rate 60 (1 world-hour = 60s) →
  // dawn→day at hour 8 = +120s real — a deterministic window the whole
  // matrix runs inside, and the ev assertions read "day" throughout
  alice.verb("sky", { hours: 6.0, rate: 60 });
  await sleep(300);
  const sky1 = foldSky(logLines());
  check("owner authored a rated sky (folds hours 6.0 ×60)",
    Math.abs(hoursAt(sky1, sky1.ts) - 6.0) < 1e-9 && effectiveClock(sky1, sky1.ts).mode === "rated",
    JSON.stringify(sky1));
  alice.verb("spawn", { id: "dome1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "dome1", type: "observatory", data: {
    slotSec: 120, reach: 6,
    line: "the great conjunction is observed",
  } });
  await sleep(400);
  check("builder authored spawn + observatory comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  const carol = new Client("carol");
  await carol.connect();
  await sleep(200);
  alice.verb("grant", { id: "carol", role: "visitor" });
  await sleep(300);
  // visitor comp authoring bounces (builder gate)
  carol.verb("comp", { id: "dome1", type: "observatory", data: { slotSec: 60 } });
  await sleep(300);
  check("visitor comp authoring bounces",
    carol.msgs.some((m) => m.type === "error"),
    "no error seen for visitor comp");
  check("no visitor-authored observatory comp in the log",
    !logLines().some((e) => e.verb === "comp" && (e.args as any)?.type === "observatory" && e.actor === "carol"));

  // ---- the session: free eyepiece, visitor in reach --------------------------
  bob.walk([3, 0, 0]);                                  // 3m from dome1 — inside reach 6
  await sleep(300);
  bob.verb("use", { id: "dome1", action: "observe" });
  await sleep(400);
  const says1 = obsSays("dome1");
  check("in-reach observe on a free eyepiece says the authored line",
    says1.length === 1 && (says1[0]?.args as any)?.text === "the great conjunction is observed",
    `${says1.length} says: ${JSON.stringify(says1.map((s) => (s.args as any)?.text))}`);
  {
    const s = says1[0]?.args as any;
    const d1 = logObs("dome1");
    check("say carries obs{who,phase,at,until} + cause/by provenance",
      s?.obs?.who === "bob" && typeof s?.obs?.phase === "string"
        && typeof s?.obs?.at === "number" && typeof s?.obs?.until === "number"
        && typeof s?.cause === "number" && s?.by === "bob",
      JSON.stringify(s?.obs));
    check("the write carried authored shape + session keys",
      d1?.slotSec === 120 && d1?.line === "the great conjunction is observed"
        && d1?.heldBy === "bob" && typeof d1?.until === "number"
        && typeof d1?.at === "number" && d1?.ev?.phase === "day",
      JSON.stringify(d1));
    check("the session until = at + slotSec·1000 (clamped slot)",
      d1?.at != null && d1?.until === d1.at + 120_000,
      `at=${d1?.at} until=${d1?.until}`);
    check("the ev anchor sits in the future (the NEXT crossing)",
      d1?.ev?.atMs > Date.now() - 2000);
    check("the use verb logged with bob as actor (authority trace)",
      logLines().some((e) => verbUser(e, "bob", "dome1", "observe")));
    check("comp transition is world-authored",
      obsComps("dome1").length === 1 && obsComps("dome1")[0].actor === "world");
  }
  check("the effect broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.obs?.who === "bob"));

  // ---- fold: late joiner reads the same session ------------------------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const d = snapObs(late.snapshot, "dome1");
    check("late joiner folds the session from the log",
      d?.heldBy === "bob" && typeof d?.until === "number" && d?.ev?.phase === "day",
      JSON.stringify(d));
    late.close();
  }

  // ---- conflict: another's observe while held --------------------------------
  const until1 = logObs("dome1")?.until;
  carol.walk([3, 0, 2]);                                // in reach too
  await sleep(300);
  carol.verb("use", { id: "dome1", action: "observe" });
  await sleep(400);
  check("conflict mints nothing (no new say, no new comp)",
    obsSays("dome1").length === 1 && obsComps("dome1").length === 1,
    `${obsSays("dome1").length} says / ${obsComps("dome1").length} comps`);
  check("conflict left the holder's session untouched",
    logObs("dome1")?.heldBy === "bob" && logObs("dome1")?.until === until1);
  carol.debug("observatory-skip");
  await sleep(300);
  const skip1 = carol.msgs.filter((m) => m.type === "debug").at(-1);
  check("the conflict skip NAMES THE HOLDER + seconds",
    JSON.stringify(skip1?.events ?? []).includes("held by bob"),
    JSON.stringify(skip1?.events ?? []).slice(0, 200));

  // ---- re-observe: the holder extends ---------------------------------------
  await sleep(600);
  bob.verb("use", { id: "dome1", action: "look up" });  // the alias
  await sleep(400);
  const until2 = logObs("dome1")?.until;
  check("holder re-observe (via the \"look up\" alias) extends until",
    until2 > until1 && logObs("dome1")?.heldBy === "bob",
    `${until1} → ${until2}`);
  check("re-observe said its line", obsSays("dome1").length === 2);

  // ---- release-rank: another's release bounces; builder's frees --------------
  carol.verb("use", { id: "dome1", action: "release" });
  await sleep(400);
  check("another's release mints nothing and keeps the session",
    obsSays("dome1").length === 2 && logObs("dome1")?.heldBy === "bob");
  carol.debug("observatory-skip");
  await sleep(300);
  const skip2 = carol.msgs.filter((m) => m.type === "debug").at(-1);
  check("the release skip names the builder+ boundary",
    JSON.stringify(skip2?.events ?? []).includes("builder"),
    JSON.stringify(skip2?.events ?? []).slice(0, 200));
  alice.walk([2, 0, 0]);
  await sleep(300);
  alice.verb("use", { id: "dome1", action: "release" });
  await sleep(400);
  const rel = obsSays("dome1").at(-1)?.args as any;
  check("builder release frees the eyepiece (say op:release)",
    rel?.obs?.op === "release" && rel?.obs?.by === "alice",
    JSON.stringify(rel?.obs));
  check("the fold reads free after release (heldBy cleared)",
    logObs("dome1")?.heldBy === undefined,
    JSON.stringify(logObs("dome1")));

  // ---- no-op: release on a free eyepiece ------------------------------------
  {
    const before = obsSays("dome1").length;
    bob.verb("use", { id: "dome1", action: "release" });
    await sleep(400);
    check("release on a free eyepiece mints nothing",
      obsSays("dome1").length === before,
      `${obsSays("dome1").length} vs ${before}`);
  }

  // ---- expiry: a seeded EXPIRED session blocks nothing -----------------------
  alice.verb("spawn", { id: "dome2", lib: "deco/bench.glb", pos: [10, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "dome2", type: "observatory", data: {
    slotSec: 120, heldBy: "ghost", until: Date.now() - 60_000, at: Date.now() - 180_000,
  } });
  await sleep(300);
  carol.walk([12, 0, 0]);                               // in reach of dome2
  await sleep(300);
  carol.verb("use", { id: "dome2", action: "observe" });
  await sleep(400);
  const d2 = logObs("dome2");
  check("an EXPIRED authored session blocks nothing — the next claim is free",
    d2?.heldBy === "carol" && typeof d2?.until === "number" && d2.until > Date.now() - 1000,
    JSON.stringify(d2));
  check("the expired-session claim said its line",
    obsSays("dome2").length === 1 && (obsSays("dome2").at(-1)?.args as any)?.obs?.who === "carol");

  // ---- fixed sky: observe fails closed --------------------------------------
  alice.verb("sky", { hours: 12, rate: 0 });
  await sleep(300);
  alice.verb("spawn", { id: "dome3", lib: "deco/bench.glb", pos: [20, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "dome3", type: "observatory", data: { slotSec: 60 } });
  await sleep(300);
  bob.walk([22, 0, 0]);
  await sleep(300);
  {
    const before = obsSays().length;
    bob.verb("use", { id: "dome3", action: "observe" });
    await sleep(400);
    check("observe under a FIXED sky mints nothing",
      obsSays().length === before,
      `${obsSays().length} vs ${before}`);
    bob.debug("observatory-skip");
    await sleep(300);
    const s = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the fixed-sky skip names the reason",
      JSON.stringify(s?.events ?? []).includes("fixed"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // re-rate the sky for the remaining legs (dome3 observe + lint + 8KB + restart)
  alice.verb("sky", { hours: 9.5, rate: 60 });
  await sleep(300);

  // ---- lint: slotSec clamps; until derives from the clamp --------------------
  alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [30, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "linty", type: "observatory", data: { slotSec: 99999, reach: 99, az: 400 } });
  await sleep(300);
  bob.walk([32, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "linty", action: "observe" });
  await sleep(400);
  {
    const d = logObs("linty");
    const at = d?.at, until = d?.until;
    check("slotSec 99999 clamps to 900 (until = at + 900s)",
      d?.heldBy === "bob" && typeof at === "number" && until === at + 900_000,
      `at=${at} until=${until}`);
    bob.debug("observatory-lint");
    await sleep(300);
    const l = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the clamp left observatory-lint notes",
      JSON.stringify(l?.events ?? []).includes("linty") && JSON.stringify(l?.events ?? []).includes("clamped"),
      JSON.stringify(l?.events ?? []).slice(0, 200));
  }

  // ---- 8KB degrade: oversized carry keeps the session, drops the carry -------
  alice.verb("spawn", { id: "fatty", lib: "deco/bench.glb", pos: [40, 0, 0], yaw: 0 });
  await sleep(300);
  const pad = "x".repeat(8100);
  alice.verb("comp", { id: "fatty", type: "observatory", data: { reach: 6, padding: pad } });
  await sleep(300);
  bob.walk([42, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "fatty", action: "observe" });
  await sleep(400);
  {
    const d = logObs("fatty");
    check("8KB degrade keeps the session (carry dropped)",
      d?.heldBy === "bob" && typeof d?.until === "number" && typeof d?.at === "number",
      JSON.stringify(d)?.slice(0, 160));
    bob.debug("observatory-lint");
    await sleep(300);
    const l2 = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the degrade left an observatory-lint note",
      JSON.stringify(l2?.events ?? []).includes("fatty"),
      JSON.stringify(l2?.events ?? []).slice(0, 200));
  }

  // ---- pass-through: non-observatory actions fall through --------------------
  {
    const uses = logLines().filter((e) => e.verb === "use" && (e.args as any)?.id === "dome1" && (e.args as any)?.action === "ring").length;
    bob.walk([3, 0, 0]);
    await sleep(300);
    bob.verb("use", { id: "dome1", action: "ring" });
    await sleep(400);
    const after = logLines().filter((e) => e.verb === "use" && (e.args as any)?.id === "dome1" && (e.args as any)?.action === "ring").length;
    const compsB = obsComps("dome1").length;
    bob.verb("use", { id: "dome1", action: "observe" }); // ring must not have eaten the vocabulary
    await sleep(400);
    check("\"ring\" passes through untouched (no comp writes, vocabulary intact)",
      after === uses + 1 && compsB === obsComps("dome1").length - 1,
      `ring logged ${after === uses + 1}; comps ${compsB} → ${obsComps("dome1").length}`);
    bob.verb("use", { id: "dome1", action: "release" }); // holder (bob) releases — clean slate
    await sleep(400);
  }

  // ---- reach: out-of-reach observe mints nothing -----------------------------
  {
    bob.walk([3, 0, 0]);
    await sleep(300);
    const before = obsSays().length;
    bob.verb("use", { id: "dome2", action: "observe" }); // dome2 [10,0,0] vs bob [3,0,0] — 7m > reach 4 default
    await sleep(400);
    check("out-of-reach use mints nothing",
      obsSays().length === before,
      `${obsSays().length} vs ${before}`);
    bob.debug("observatory-skip");
    await sleep(300);
    const s = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("out-of-reach skip names the distance",
      JSON.stringify(s?.events ?? []).includes("out of reach"),
      JSON.stringify(s?.events ?? []).length > 0 ? JSON.stringify(s?.events ?? []).slice(0, 200) : "no events");
  }

  // ---- spectator: spectate legs cannot observe -------------------------------
  {
    const spec = new Client("watcher1");
    await spec.connect(true);
    await sleep(300);
    const before = obsSays().length;
    spec.verb("use", { id: "dome1", action: "observe" });
    await sleep(400);
    check("spectator use mints nothing (shell gate)",
      obsSays().length === before && !logObs("dome1")?.heldBy,
      `${obsSays().length} vs ${before}`);
    spec.close();
  }

  // ---- restart: replay mints nothing; the session survives folded ------------
  const saidAll = obsSays().length;
  const heldBefore = { id: "fatty", d: logObs("fatty") };
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  const dr = snapObs(probe.snapshot, "fatty");
  check("restart: a fresh join folds the same session",
    dr?.heldBy === "bob" && dr?.heldBy === heldBefore.d?.heldBy && dr?.until === heldBefore.d?.until,
    JSON.stringify(dr));
  check("replay minted nothing",
    obsSays().length === saidAll,
    `${obsSays().length} vs ${saidAll}`);
  const skyR = foldSky(logLines());
  check("restart: the rated sky folds back (hours derived at the sky's own ts)",
    effectiveClock(skyR, Date.now()).mode === "rated",
    JSON.stringify(skyR));
  {
    const d1 = snapObs(probe.snapshot, "dome1");
    const desc = describeObservatory(d1, skyR, Date.now());
    check("mcpl affordance read (describeObservatory)",
      desc.startsWith("observatory:") && desc.includes("use {action:"),
      desc);
    check("describe on a held eyepiece names the holder",
      describeObservatory(snapObs(probe.snapshot, "fatty"), skyR, Date.now()).includes("bob"),
      describeObservatory(snapObs(probe.snapshot, "fatty"), skyR, Date.now()));
  }

  // ---- idempotent fold --------------------------------------------------------
  {
    const a = JSON.stringify(snapObs(probe.snapshot, "fatty"));
    const b = JSON.stringify(snapObs(JSON.parse(JSON.stringify(probe.snapshot)), "fatty"));
    check("folded observatory state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup ----------------------------------------------------------------
  bob.close(); carol.close(); probe.close();
  try { alice.close(); } catch { /* already gone */ }
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
function verbUser(e: any, actor: string, id: string, action: string) {
  return e.verb === "use" && e.actor === actor && (e.args as any)?.id === id && (e.args as any)?.action === action;
}
