// Dedication matrix — `comp {type:"dedication"}` makes an entity a
// BENCH DEDICATION: one carved line, a solemn ladder (no public prong),
// the seat's owner stamped from the spawn actor, the log the only memory.
// Self-booting: scratch sequencer (fresh WORLDS_DIR), builder authors the
// bench, visitors dedicate/retract. Covers § DEDICATIONS CONTRACT:
//
//   bun tools/dedicationtest.ts
//
// - unit:       normalizeDedication clamps/defaults; dedicationText
//               single-line collapse + cap; carve/retract ladder incl.
//               the communal prong; describe; action disjointness
// - authoring:  spawn + dedication comp is builder-gated; visitor comp bounces
// - dedicate:   use {action:"dedicate", text} in reach writes the line +
//               says with ded{by,at} + cause/by + stamps owner from spawn
// - fold:       line folds from the log; late joiner reads the same
// - recarve:    the dedicator rewrites their own line (rank 0)
// - visitor-bounce: another visitor's carve skips fail-closed naming the
//               boundary
// - builder-rewrite: a builder rewrites the line (communal act)
// - retract:    the dedicator retracts (line:"", owner kept)
// - blank-again: after retract the bench takes the next first words
// - no-op:      carving the text the plaque already reads mints nothing
// - no-text:    empty carve mints nothing
// - who:        builder names another; visitor's who ignored (skip names it)
// - clamp:      over-long line clamps to maxLen; newlines collapse
// - reach:      out-of-reach carve mints nothing (skip names distance)
// - spectator:  spectate legs cannot carve (shell gate, mint-nothing)
// - pass-through: non-dedication actions ("ring", "sign") fall through
// - lint:       maxLen 5000 clamps at read; engine write verbatim
// - 8KB degrade: an oversized carry keeps the truth, drops the carry
// - restart:    replay mints nothing; line/by/owner survive folded
// - describe:   describeDedication reads line + dedicator + action hint
// - idempotent: folded state is stable across snapshot re-reads
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DEDICATION_ACTIONS, canCarveDedication, canRetractDedication,
  dedicationText, describeDedication, normalizeDedication,
} from "../shared/dedication.js";

const PORT = Number(process.env.PORT ?? 9007);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-dedication";
const WORLD = `dedicationtest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-dedication-"));

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
const dedSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.ded != null && (!id || (e.args as any)?.id === id));
const dedComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "dedication" && (!id || (e.args as any)?.id === id));
/** The folded dedication = the LAST dedication comp write in the log. */
const logDed = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "dedication"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const snapDed = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.dedication ?? null;

try {
  console.log(`\ndedication matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const { cfg, notes } = normalizeDedication({ maxLen: 5000, reach: 99 } as any);
    check("unit: maxLen 5000 clamps to 240 + note", cfg.maxLen === 240 && notes.some((n) => n.includes("maxLen")), JSON.stringify(notes));
    check("unit: reach 99 clamps to 12", cfg.reach === 12);
    const dflt = normalizeDedication({});
    check("unit: defaults maxLen 120 / reach 4 / visible true",
      dflt.cfg.maxLen === 120 && dflt.cfg.reach === 4 && dflt.cfg.visible === true);
    check("unit: dedicationText collapses newlines to spaces",
      dedicationText("line one\nline two", 120) === "line one line two");
    check("unit: dedicationText caps at maxLen", dedicationText("x".repeat(500), 120).length === 120);
    check("unit: dedicationText garbage → empty", dedicationText(42 as any) === "" && dedicationText(undefined) === "");
    check("unit: carve ladder — blank takes anyone", canCarveDedication({}, "bob", 0).ok === true);
    check("unit: carve ladder — dedicator rewrites own", canCarveDedication({ line: "x", by: "bob" }, "bob", 0).ok === true);
    check("unit: carve ladder — other visitor fails; builder passes", (() => {
      const cur = { line: "x", by: "bob" };
      return canCarveDedication(cur, "carol", 0).ok === false && canCarveDedication(cur, "carol", 1).ok === true;
    })());
    check("unit: communal prong — builder+ maintains an orphaned seat",
      canCarveDedication({ line: "x", by: "bob" }, "carol", 1, 0).ok === true
      && (canCarveDedication({ line: "x", by: "bob" }, "carol", 1, 0) as any).communal === true);
    check("unit: retract ladder — blank fails; dedicator retracts; visitor fails",
      canRetractDedication({}, "bob", 0).ok === false
      && canRetractDedication({ line: "x", by: "bob" }, "bob", 0).ok === true
      && canRetractDedication({ line: "x", by: "bob" }, "carol", 0).ok === false);
    check("unit: describe names blank + the dedicate action", (() => {
      const s = describeDedication({});
      return s.startsWith("dedication: blank") && s.includes('action:"dedicate"');
    })());
    check("unit: describe names the line + dedicator", (() => {
      const s = describeDedication({ line: "For Mai, who taught the goats", by: "alice" });
      return s.startsWith("dedication:") && s.includes("For Mai") && s.includes("for alice");
    })());
    check("unit: describe names private when visible:false", describeDedication({ line: "x", by: "a", visible: false }).includes("(private)"));
    const PRIOR = ["open", "close", "toggle", "light", "snuff", "sign", "erase", "write", "post", "unpost", "buy", "restock", "begin", "halt", "enter", "travel", "hop", "teleport", "blink", "reserve", "hold", "release", "mute", "quiet", "unmute", "resume", "flow", "still", "advance", "tend", "beacon", "befriend", "tame", "heel", "stay", "come", "dismiss", "free", "play", "note", "ring", "dedicate", "retract"];
    check("unit: DEDICATION vocabulary dedicate/retract is DISJOINT from prior families",
      DEDICATION_ACTIONS.has("dedicate") && DEDICATION_ACTIONS.has("retract")
      && !PRIOR.slice(0, -2).includes("dedicate") && !PRIOR.slice(0, -2).includes("retract"));
  }

  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "bench1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "bench1", type: "dedication", data: {
    maxLen: 120, dedicateAt: "a line is carved on the bench",
  } });
  await sleep(400);
  check("builder authored spawn + dedication comp",
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
  carol.verb("comp", { id: "bench1", type: "dedication", data: { maxLen: 10 } });
  await sleep(300);
  check("visitor comp authoring bounces",
    carol.msgs.some((m) => m.type === "error"),
    "no error seen for visitor comp");
  check("no visitor-authored dedication comp in the log",
    !logLines().some((e) => e.verb === "comp" && (e.args as any)?.type === "dedication" && e.actor === "carol"));

  // ---- dedicate: visitor in reach, bench BLANK --------------------------------
  bob.walk([3, 0, 0]);                                  // 3m — inside reach 4
  await sleep(300);
  bob.verb("use", { id: "bench1", action: "dedicate", text: "For Mai, who taught the goats to come" });
  await sleep(400);
  const says1 = dedSays("bench1");
  check("blank bench takes the first dedication (rank 0, in reach)",
    says1.length === 1 && (says1[0]?.args as any)?.text === "a line is carved on the bench",
    `${says1.length} says: ${JSON.stringify(says1.map((s) => (s.args as any)?.text))}`);
  check("say carries ded{by,at} + cause/by provenance",
    (says1[0]?.args as any)?.ded?.by === "bob"
      && typeof (says1[0]?.args as any)?.ded?.at === "number"
      && typeof (says1[0]?.args as any)?.cause === "number" && (says1[0]?.args as any)?.by === "bob",
    JSON.stringify(says1[0]?.args?.ded));
  const comps1 = dedComps("bench1");
  check("the carve wrote ONE world-authored comp transition", comps1.length === 1,
    `${comps1.length} dedication comp writes`);
  {
    const d = comps1[0]?.args as any;
    check("the write carries authored shape + line/by/owner/at",
      d?.data?.maxLen === 120 && d?.data?.line === "For Mai, who taught the goats to come"
        && d?.data?.by === "bob" && d?.data?.owner === "alice" && typeof d?.data?.at === "number",
      JSON.stringify(d?.data)?.slice(0, 220));
    check("the use verb logged with bob as actor (authority trace)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob"
        && (e.args as any)?.id === "bench1" && (e.args as any)?.action === "dedicate"));
  }
  check("the effect broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.ded?.by === "bob"));

  // ---- fold: late joiner reads the same line -----------------------------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const d = snapDed(late.snapshot, "bench1");
    check("late joiner folds line + by + owner from the log",
      d?.line === "For Mai, who taught the goats to come" && d?.by === "bob" && d?.owner === "alice",
      JSON.stringify(d)?.slice(0, 160));
    late.close();
  }

  // ---- recarve: the dedicator rewrites their own line ------------------------------
  bob.verb("use", { id: "bench1", action: "dedicate", text: "For Mai — still teaching" });
  await sleep(400);
  {
    const d = logDed("bench1");
    check("dedicator rewrites own line at rank 0 (rewritten flag on the say)",
      d?.line === "For Mai — still teaching" && d?.by === "bob"
        && (dedSays("bench1").at(-1)?.args as any)?.ded?.rewritten === true,
      JSON.stringify(d)?.slice(0, 200));
  }

  // ---- visitor-bounce: another visitor's carve skips fail-closed ---------------------
  carol.walk([3, 0, 2]);                                // in reach
  await sleep(300);
  carol.verb("use", { id: "bench1", action: "dedicate", text: "hijack" });
  await sleep(400);
  check("another visitor's carve skips (ladder boundary)",
    logDed("bench1")?.by === "bob" && dedSays("bench1").length === 2,
    `${dedSays("bench1").length} says`);
  carol.debug("dedication-skip");
  await sleep(300);
  {
    const s = carol.msgs.filter((m) => m.type === "debug").at(-1);
    check("the skip names the boundary",
      JSON.stringify(s?.events ?? []).includes("bench1") && JSON.stringify(s?.events ?? []).includes("builder"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- builder-rewrite: a builder rewrites the line --------------------------------
  alice.walk([0, 0, 2]);
  await sleep(300);
  alice.verb("use", { id: "bench1", action: "dedicate", text: "For Mai, beloved teacher — from the village" });
  await sleep(400);
  {
    const d = logDed("bench1");
    check("builder (the seat's owner) rewrites the line",
      d?.line === "For Mai, beloved teacher — from the village" && d?.by === "alice",
      JSON.stringify(d)?.slice(0, 200));
  }

  // ---- who: builder names another; visitor's who is ignored --------------------------
  alice.verb("use", { id: "bench1", action: "dedicate", text: "In memory of Old Barnabas", who: "barnabas" });
  await sleep(400);
  {
    const d = logDed("bench1");
    check("builder carves NAME ANOTHER (by = the named, namedBy on the say)",
      d?.line === "In memory of Old Barnabas" && d?.by === "barnabas"
        && (dedSays("bench1").at(-1)?.args as any)?.ded?.namedBy === "alice",
      JSON.stringify(dedSays("bench1").at(-1)?.args?.ded));
    const sayLine = (dedSays("bench1").at(-1)?.args as any)?.text;
    check("named carve says the authored line (provenance rides in ded)",
      sayLine === "a line is carved on the bench",
      sayLine);
  }
  {
    const before = dedSays().length;
    bob.walk([3, 0, 0]);
    await sleep(300);
    bob.verb("use", { id: "bench1", action: "dedicate", text: "bob words", who: "someoneelse" });
    await sleep(400);
    // bob is rank 0 over barnabas's line → ladder skip; and his who could
    // never name another anyway
    check("visitor's who-named carve skips (ladder boundary first)",
      dedSays().length === before && logDed("bench1")?.by === "barnabas",
      `${dedSays().length} vs ${before}`);
    bob.debug("dedication-skip");
    await sleep(300);
    const s = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the who skip names the builder boundary",
      JSON.stringify(s?.events ?? []).includes("builder"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- clamp: over-long line clamps; newlines collapse -------------------------------
  alice.verb("use", { id: "bench1", action: "dedicate", text: "y".repeat(500) });
  await sleep(400);
  {
    const d = logDed("bench1");
    check("over-long carve clamps to maxLen 120", d?.line?.length === 120, `${d?.line?.length}`);
  }
  alice.verb("use", { id: "bench1", action: "dedicate", text: "line one\nline two" });
  await sleep(400);
  {
    const d = logDed("bench1");
    check("a multi-line carve collapses to one line (a plaque has one face)",
      d?.line === "line one line two", JSON.stringify(d?.line));
  }

  // ---- retract: the builder (current dedicator) retracts ------------------------------
  alice.verb("use", { id: "bench1", action: "retract" });
  await sleep(400);
  {
    const d = logDed("bench1");
    check("dedicator retracts (line cleared, owner kept, retracted flag)",
      d?.line === "" && d?.owner === "alice"
        && (dedSays("bench1").at(-1)?.args as any)?.ded?.retracted === true,
      JSON.stringify(d)?.slice(0, 200));
  }

  // ---- blank-again: after retract the bench takes the next first words ----------------
  carol.verb("use", { id: "bench1", action: "dedicate", text: "The bench remembers no one yet" });
  await sleep(400);
  {
    const d = logDed("bench1");
    check("after a retract the bench takes the next first-words (blank prong)",
      d?.line === "The bench remembers no one yet" && d?.by === "carol",
      JSON.stringify(d)?.slice(0, 160));
  }

  // ---- no-op: carving the text the plaque already reads --------------------------------
  {
    const before = dedSays().length;
    carol.verb("use", { id: "bench1", action: "dedicate", text: "The bench remembers no one yet" });
    await sleep(400);
    check("carving the same text mints nothing",
      dedSays().length === before,
      `${dedSays().length} vs ${before}`);
    carol.debug("dedication-skip");
    await sleep(300);
    const s = carol.msgs.filter((m) => m.type === "debug").at(-1);
    check("the no-op skip names the state",
      JSON.stringify(s?.events ?? []).includes("already reads"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- no-text: empty carve mints nothing ------------------------------------------------
  {
    const before = dedSays().length;
    carol.verb("use", { id: "bench1", action: "dedicate", text: "   " });
    await sleep(400);
    check("empty carve mints nothing",
      dedSays().length === before,
      `${dedSays().length} vs ${before}`);
  }

  // ---- communal prong: an orphaned seat is builder-maintained ---------------------------
  // bench2 is owned by bob (visitor-rank owner) — a builder maintains it,
  // a visitor never could
  alice.verb("grant", { id: "bob", role: "builder" });
  await sleep(300);
  bob.verb("spawn", { id: "bench2", lib: "deco/bench.glb", pos: [10, 0, 0], yaw: 0 });
  await sleep(300);
  bob.verb("comp", { id: "bench2", type: "dedication", data: {} });
  await sleep(300);
  bob.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.walk([13, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "bench2", action: "dedicate", text: "from bob with love" });
  await sleep(400);
  check("orphan prong setup: bob carved bench2 (owner, then demoted)",
    logDed("bench2")?.line === "from bob with love" && logDed("bench2")?.owner === "bob",
    JSON.stringify(logDed("bench2"))?.slice(0, 140));
  alice.walk([10, 0, 2]);
  await sleep(300);
  alice.verb("use", { id: "bench2", action: "dedicate", text: "maintained by the village" });
  await sleep(400);
  check("builder maintains an orphaned seat (owner demoted below builder)",
    logDed("bench2")?.line === "maintained by the village" && logDed("bench2")?.by === "alice",
    JSON.stringify(logDed("bench2"))?.slice(0, 140));

  // ---- reach: out-of-reach carve mints nothing ----------------------------------------------
  {
    const before = dedSays("bench2").length;
    bob.walk([60, 0, 0]);                               // far from bench2 at [10,0,0]
    await sleep(300);
    bob.verb("use", { id: "bench2", action: "dedicate", text: "far away" });
    await sleep(400);
    check("out-of-reach carve mints nothing",
      dedSays("bench2").length === before,
      `${dedSays("bench2").length} vs ${before}`);
    bob.debug("dedication-skip");
    await sleep(300);
    const s = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("out-of-reach skip names the distance",
      JSON.stringify(s?.events ?? []).includes("out of reach"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- spectator: spectate legs cannot carve ------------------------------------------------
  {
    const spec = new Client("watcher1");
    await spec.connect(true);
    await sleep(300);
    const before = dedSays().length;
    spec.verb("use", { id: "bench2", action: "dedicate", text: "ghost words" });
    await sleep(400);
    check("spectator use mints nothing (shell gate)",
      dedSays().length === before,
      `${dedSays().length} vs ${before}`);
    spec.close();
  }

  // ---- pass-through: non-dedication actions fall through -------------------------------------
  {
    bob.walk([13, 0, 0]);
    await sleep(300);
    const compsB = dedComps("bench2").length;
    bob.verb("use", { id: "bench2", action: "ring" });
    await sleep(400);
    check("\"ring\" passes through untouched (logged, no comp writes)",
      dedComps("bench2").length === compsB
        && logLines().some((e) => e.verb === "use" && (e.args as any)?.id === "bench2" && (e.args as any)?.action === "ring"),
      `comps ${compsB} → ${dedComps("bench2").length}`);
    const compsC = dedComps("bench2").length;
    bob.verb("use", { id: "bench2", action: "sign" });
    await sleep(400);
    check("guestbook's \"sign\" is not dedication vocabulary (no writes)",
      dedComps("bench2").length === compsC,
      `${dedComps("bench2").length} vs ${compsC}`);
  }

  // ---- lint: clamps ride into the engine write -----------------------------------------------
  alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [40, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "linty", type: "dedication", data: { maxLen: 5000, reach: 99 } });
  await sleep(300);
  bob.walk([41, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "linty", action: "dedicate", text: "clamped cfg" });
  await sleep(400);
  {
    const d = logDed("linty");
    check("engine write carries the authored shape VERBATIM + engine keys (regions doctrine)",
      d?.maxLen === 5000 && d?.reach === 99 && d?.line === "clamped cfg" && d?.by === "bob",
      JSON.stringify(d)?.slice(0, 160));
    check("a late reader CLAMPS the carry at read time (normalizeDedication)",
      normalizeDedication(d).cfg.maxLen === 240 && normalizeDedication(d).cfg.reach === 12);
    bob.debug("dedication-lint");
    await sleep(300);
    const l = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the clamps left dedication-lint notes",
      JSON.stringify(l?.events ?? []).includes("linty") && JSON.stringify(l?.events ?? []).includes("clamped"),
      JSON.stringify(l?.events ?? []).slice(0, 200));
  }

  // ---- 8KB degrade ------------------------------------------------------------------------------
  alice.verb("spawn", { id: "fatty", lib: "deco/bench.glb", pos: [50, 0, 0], yaw: 0 });
  await sleep(300);
  const pad = "x".repeat(8100);
  alice.verb("comp", { id: "fatty", type: "dedication", data: { reach: 6, padding: pad } });
  await sleep(300);
  bob.walk([52, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "fatty", action: "dedicate", text: "fat" });
  await sleep(400);
  {
    const d = logDed("fatty");
    check("8KB degrade keeps the truth (carry dropped)",
      d?.line === "fat" && d?.by === "bob" && d?.padding === undefined,
      JSON.stringify(d)?.slice(0, 160));
  }

  // ---- restart: replay mints nothing; line/by/owner survive folded -----------------------------
  const saidAll = dedSays().length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  {
    const d1 = snapDed(probe.snapshot, "bench1");
    check("restart: a fresh join folds the same line + by + owner",
      d1?.line === "The bench remembers no one yet" && d1?.by === "carol" && d1?.owner === "alice",
      JSON.stringify(d1)?.slice(0, 200));
    const d2 = snapDed(probe.snapshot, "bench2");
    check("restart: bench2 folds the maintained line",
      d2?.line === "maintained by the village" && d2?.by === "alice",
      JSON.stringify(d2)?.slice(0, 140));
  }
  check("replay minted nothing",
    dedSays().length === saidAll,
    `${dedSays().length} vs ${saidAll}`);
  check("mcpl affordance read (describeDedication)",
    describeDedication(snapDed(probe.snapshot, "bench1")).startsWith("dedication:"),
    describeDedication(snapDed(probe.snapshot, "bench1")).slice(0, 80));
  check("describe on a live bench names the dedicate action",
    describeDedication(snapDed(probe.snapshot, "bench2")).includes('action:"dedicate"'),
    describeDedication(snapDed(probe.snapshot, "bench2")));

  // ---- idempotent fold ------------------------------------------------------------------------------
  {
    const a = JSON.stringify(snapDed(probe.snapshot, "bench1"));
    const b = JSON.stringify(snapDed(JSON.parse(JSON.stringify(probe.snapshot)), "bench1"));
    check("folded dedication state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup ----------------------------------------------------------------------------------
  bob.close(); carol.close(); probe.close();
  try { alice.close(); } catch { /* already gone */ }
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
