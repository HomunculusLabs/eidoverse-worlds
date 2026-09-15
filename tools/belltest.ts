// Bell matrix — `comp {type:"bell"}` makes the world KEEP ITS OWN TIME: an
// authored schedule of world-clock hours; the 1Hz sweep reads the same
// hoursAt the sun uses and tolls crossed slots — ONE say (weatherzone-
// release grammar: no cause/by, TIME caused it) + presence-plane strikes
// (music/force doctrine: never logged, never replayed). No use actions
// exist; no comp transitions are ever minted.
// Self-booting: scratch sequencer (fresh WORLDS_DIR), owner authors the sky
// and the bells. Covers § BELLS CONTRACT:
//
//   bun tools/belltest.ts
//
// - unit:       normalizeBell clamps/drops/caps; bellHour; tollHz; crossedSlot
//               forward/wrap/coalesce/backward; containingSlot; describe
// - authoring:  spawn + bell comp is builder-gated; visitor comp bounces
// - toll:       a crossed slot says ONE line with bell{n,hour,at} + strikes
//               on the presence plane (first:true on strike 1; n strikes)
// - pitch:      the strike hz is DERIVED (chromatic semitones above base by
//               the hour) — one arithmetic, checked against shared/bell.js
// - minGap:     an immediate second crossing skips naming minGap; after the
//               gap the next slot tolls
// - cap:        five bells crossing one sweep → four toll, the fifth skips
//               with bell-cap
// - dayFirst:   a dayFirst bell tolls its containing slot on first sight
// - pass-through: use {action:"ring"} on a bell logs and mints nothing
// - lint-once:  garbage hours drop + ONE bell-lint event across sweeps
// - restart:    replay mints nothing; the schedule folds from the log
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeBell, bellHour, tollHz, crossedSlot, containingSlot, nextCrossingSec, describeBell } from "../shared/bell.js";

const PORT = Number(process.env.PORT ?? 9003);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-bell";
const WORLD = `belltest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-bell-"));

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
const bellSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.bell != null && (!id || (e.args as any)?.id === id));
const bellSounds = (c: Client, id?: string) => c.msgs.filter((m) => m.type === "sound"
  && m.bell != null && (!id || m.id === id));
const skyOf = (snap: any) => snap?.state?.sky ?? null;

try {
  console.log(`\nbell matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const { cfg, notes } = normalizeBell({ hours: [25, "x", 3, 3, 10], n: 99, minGap: 5, sec: 42 });
    check("unit: hours drop out-of-range/garbage + dedupe (sorted)",
      JSON.stringify(cfg.hours) === JSON.stringify([3, 10]),
      JSON.stringify(cfg.hours));
    check("unit: n clamps to 12, minGap floors at 10, sec clamps to 10",
      cfg.n === 12 && cfg.minGap === 10 && cfg.sec === 10, JSON.stringify({ n: cfg.n, minGap: cfg.minGap, sec: cfg.sec }));
    check("unit: drops are linted by name",
      notes.some((x) => x.includes("25")) && notes.some((x) => x.includes("x")), JSON.stringify(notes));
    const dflt = normalizeBell({});
    check("unit: defaults 9/15/21 · n 3 · base E4 · sine · gap 30",
      JSON.stringify(dflt.cfg.hours) === JSON.stringify([9, 15, 21]) && dflt.cfg.n === 3
        && Math.abs(dflt.cfg.base - 329.63) < 0.1 && dflt.cfg.wave === "sine" && dflt.cfg.minGap === 30,
      JSON.stringify(dflt.cfg));
    check("unit: an all-garbage schedule can never fire (noted)",
      normalizeBell({ hours: [99] }).cfg.hours.length === 0
        && normalizeBell({ hours: [99] }).notes.some((x) => x.includes("never fire")));
    check("unit: bellHour = hoursAt mod 24 (rated sky)",
      Math.abs(bellHour({ hours: 10, rate: 2, ts: 1000 }, 1000 + 3600e3) - 12) < 1e-9);
    check("unit: tollHz is chromatic above base by the hour",
      Math.abs(tollHz(dflt.cfg, 12) - 329.63) < 0.1 && Math.abs(tollHz(dflt.cfg, 15) - 329.63 * 2 ** (3 / 12)) < 0.1,
      `${tollHz(dflt.cfg, 12)} / ${tollHz(dflt.cfg, 15)}`);
    check("unit: crossedSlot forward", crossedSlot([10.5], 10, 11) === 10.5);
    check("unit: crossedSlot wrap = the midnight roll", crossedSlot([0], 23.5, 0.5) === 0);
    check("unit: multi-crossing coalesces to the LAST slot", crossedSlot([10, 11], 9, 12) === 11);
    check("unit: no movement crosses nothing", crossedSlot([10], 10, 10) === null && crossedSlot([10], 10, 10.5) === null);
    check("unit: backward jump reads as one forward wrap (disclosed)",
      crossedSlot([20], 10, 9) === 20);
    check("unit: empty schedule crosses nothing", crossedSlot([], 10, 20) === null);
    check("unit: containingSlot picks the slot the hour stands in",
      containingSlot([9, 15, 21], 17) === 15 && containingSlot([9, 15, 21], 5) === null);
    check("unit: nextCrossingSec under a rated sky",
      Math.abs(nextCrossingSec([15], 14, 1800) - 1800) < 1e-9
        && nextCrossingSec([15], 14, 0) === null);
    const desc = describeBell({ hours: [15], n: 3 }, { hours: 14, rate: 1, ts: Date.now() }, Date.now());
    check("unit: describeBell names schedule + next", desc.startsWith("bell:") && desc.includes("hour 15"), desc);
  }

  await startServer();

  // ---- authoring: owner shapes sky + bells; visitor bounces -------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("sky", { hours: 10, rate: 0 });            // fixed 10:00 sun
  alice.verb("spawn", { id: "bell1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "bell1", type: "bell", data: {
    hours: [10.5, 12, 14], n: 3, sec: 0.5, minGap: 10, base: "E4",
  } });
  await sleep(400);
  check("builder authored sky + spawn + bell comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.verb("comp", { id: "bell1", type: "bell", data: { hours: [1] } });
  await sleep(300);
  check("visitor bell comp authoring bounces",
    bob.msgs.some((m) => m.type === "error"), "no error seen for visitor comp");
  check("the visitor authored no bell comp in the log",
    !logLines().some((e) => e.verb === "comp" && (e.args as any)?.type === "bell" && e.actor === "bob"));

  // the bell stood at 10:00 with its first slot at 10.5 — UNarmed sight must
  // NOT toll (dayFirst defaults false; 10 < 10.5 anyway)
  await sleep(2500);                                    // ≥2 sweeps
  check("a standing bell before its first slot tolls nothing",
    bellSays("bell1").length === 0, `${bellSays("bell1").length} says`);

  // ---- the toll: cross 10.5 by re-authoring the sun ---------------------------
  alice.verb("sky", { hours: 11, rate: 0 });
  await sleep(2500);                                    // a sweep sees the crossing
  const says1 = bellSays("bell1");
  check("a crossed slot tolls exactly ONE say",
    says1.length === 1 && (says1[0]?.args as any)?.text === "the bell tolls 3",
    `${says1.length} says: ${JSON.stringify(says1.map((s) => (s.args as any)?.text))}`);
  {
    const b = (says1[0]?.args as any)?.bell;
    check("the say carries bell{n,hour,at} — the time-caused grammar (no cause/by)",
      b?.n === 3 && b?.hour === 10.5 && typeof b?.at === "number"
        && (says1[0]?.args as any)?.cause === undefined && (says1[0]?.args as any)?.by === undefined,
      JSON.stringify(b));
  }
  const strikes1 = bellSounds(alice, "bell1");
  check("the first strike rides the presence plane with first:true + derived pitch",
    strikes1.length >= 1 && strikes1[0]?.bell?.first === true && strikes1[0]?.bell?.n === 3
      && Math.abs(strikes1[0]?.note?.hz - tollHz(normalizeBell({ base: "E4" }).cfg, 10.5)) < 0.5,
    JSON.stringify(strikes1[0]));
  await sleep(1500);                                    // n=3 strikes at 0.4s spacing
  check("the toll strikes n times, never logged",
    bellSounds(alice, "bell1").length === 3
      && !logLines().some((e) => e.verb === "sound"),
    `${bellSounds(alice, "bell1").length} strikes`);

  // ---- minGap: an immediate second crossing skips; after the gap it tolls -----
  alice.verb("sky", { hours: 13, rate: 0 });            // crosses 12 instantly
  await sleep(2500);
  check("a crossing inside minGap mints nothing",
    bellSays("bell1").length === 1, `${bellSays("bell1").length} says`);
  bob.debug("bell-skip");
  await sleep(300);
  const skip1 = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("the skip names minGap",
    JSON.stringify(skip1?.events ?? []).includes("minGap"), JSON.stringify(skip1?.events ?? []).slice(0, 200));
  await sleep(9000);                                    // minGap 10s elapses
  alice.verb("sky", { hours: 15, rate: 0 });            // crosses 14
  await sleep(2500);
  const says2 = bellSays("bell1");
  check("after the gap the next slot tolls (hour 14)",
    says2.length === 2 && (says2[1]?.args as any)?.bell?.hour === 14,
    JSON.stringify(says2.map((s) => (s.args as any)?.bell)));

  // ---- cap: five bells crossing one sweep → four toll --------------------------
  for (const name of ["bellA", "bellB", "bellC", "bellD", "bellE"]) {
    alice.verb("spawn", { id: name, lib: "deco/bench.glb", pos: [5, 0, 5], yaw: 0 });
  }
  await sleep(300);
  for (const name of ["bellA", "bellB", "bellC", "bellD", "bellE"]) {
    alice.verb("comp", { id: name, type: "bell", data: { hours: [16], n: 1, sec: 0.5, minGap: 10 } });
  }
  await sleep(2500);                                    // armed (no slot crossed)
  check("arming five bells crossed nothing",
    ["bellA", "bellB", "bellC", "bellD", "bellE"].every((n) => bellSays(n).length === 0));
  alice.verb("sky", { hours: 17, rate: 0 });            // crosses 16 for all five
  await sleep(2500);
  const capSays = ["bellA", "bellB", "bellC", "bellD", "bellE"]
    .map((n) => bellSays(n).length).reduce((a, b) => a + b, 0);
  check("five bells crossing one sweep → exactly four toll",
    capSays === 4, `${capSays} tolls`);
  bob.debug("bell-cap");
  await sleep(300);
  const cap1 = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("the fifth bell skipped with bell-cap",
    JSON.stringify(cap1?.events ?? []).includes("bell-cap"), JSON.stringify(cap1?.events ?? []).slice(0, 200));

  // ---- dayFirst: first sight tolls the containing slot -------------------------
  alice.verb("spawn", { id: "church", lib: "deco/bench.glb", pos: [9, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "church", type: "bell", data: {
    hours: [9, 15, 21], n: 2, sec: 0.5, dayFirst: true, line: "the old bell remembers the hour",
  } });
  await sleep(2500);                                    // first sight: sky 17 → containing 15
  const df = bellSays("church");
  check("dayFirst tolls the containing slot (15) with the authored line",
    df.length === 1 && (df[0]?.args as any)?.text === "the old bell remembers the hour"
      && (df[0]?.args as any)?.bell?.hour === 15,
    JSON.stringify(df.map((s) => (s.args as any)?.bell)));
  await sleep(2500);
  check("dayFirst tolls ONCE per boot (no re-toll on later sights)",
    bellSays("church").length === 1, `${bellSays("church").length} says`);

  // ---- pass-through: use on a bell logs and mints nothing ----------------------
  {
    const before = bellSays().length;
    bob.walk([2, 0, 0]);
    await sleep(300);
    bob.verb("use", { id: "bell1", action: "ring" });
    await sleep(400);
    check("use {action:\"ring\"} passes through (logged, mints nothing)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob" && (e.args as any)?.id === "bell1"
        && (e.args as any)?.action === "ring") && bellSays().length === before,
      `${bellSays().length} vs ${before}`);
  }

  // ---- lint-once: garbage hours drop + ONE bell-lint across sweeps --------------
  alice.verb("spawn", { id: "lintbell", lib: "deco/bench.glb", pos: [12, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "lintbell", type: "bell", data: { hours: [25, "x", 3], n: 99 } } );
  await sleep(2500);                                    // ≥2 sweeps with the malformed comp
  bob.debug("bell-lint");
  await sleep(300);
  const lint = bob.msgs.filter((m) => m.type === "debug").at(-1);
  const lintEvents = JSON.stringify(lint?.events ?? []);
  check("malformed hours lint (drops named) — exactly once across sweeps",
    lintEvents.includes("lintbell") && lintEvents.includes("25")
      && lintEvents.split("lintbell").length - 1 === 1,
    lintEvents.slice(0, 240));

  // ---- restart: replay mints nothing; the schedule folds -----------------------
  alice.verb("comp", { id: "church", type: "bell", data: null });   // retire dayFirst
  await sleep(300);
  const saidAll = bellSays().length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(2500);                                    // sweeps run; sky 17 fixed
  check("restart: replay + fresh sweeps minted nothing",
    bellSays().length === saidAll, `${bellSays().length} vs ${saidAll}`);
  const folded = probe.snapshot?.state?.entities?.bell1?.comp?.bell;
  check("the schedule folds from the log (late-join truth)",
    JSON.stringify(folded?.hours) === JSON.stringify([10.5, 12, 14]) && folded?.n === 3,
    JSON.stringify(folded));
  const descLive = describeBell(folded, skyOf(probe.snapshot), Date.now());
  check("mcpl affordance read (describeBell on folded truth)",
    descLive.startsWith("bell:") && descLive.includes("10.5"), descLive);

  // ---- cleanup -------------------------------------------------------------------
  bob.close(); probe.close();
  try { alice.close(); } catch { /* already gone */ }
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
