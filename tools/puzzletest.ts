// Puzzle matrix — `comp {type:"puzzle"}` links two inscription plates to a
// door: the door is HELD shut until both plates carry the same hand-written
// words within windowSec of each other, and the linked state is a PURE
// FUNCTION OF THE FOLD (zero engine keys). The engine is a pure observer
// (chime/bell doctrine: no action vocabulary of its own) that reconciles
// the DOOR family's own comp toward the derivation — never a second door
// arithmetic. Covers § PUZZLES CONTRACT (vocab-32):
//
//   bun tools/puzzletest.ts
//
// - unit:       normalizePuzzle clamps/caps/drops + can-never-fire notes;
//               puzzleMatch blank/disagree/match/window-gap/authored-
//               pre-carve/missing; describePuzzle live reads
// - authoring:  the puzzle comp is builder-gated; visitor bounces
// - hold:       one plate written ≠ solved — the door stays shut; a manual
//               open while unsolved is re-closed in the same reaction
//               (door family's own write shape + say with cause/by)
// - solve:      the second plate completes the match → the door's comp
//               opens (world actor, cause = the solving use) + unlock say
// - free:       once matched, the door answers its own open/close/toggle
//               (the engine never fights a hand on a matched door)
// - re-lock:    rewriting one plate breaks the match → an open door is
//               re-closed through the same reconciliation
// - window:     matching words written past windowSec do NOT unlock (the
//               why names the gap)
// - sweep heal: an unsolved puzzle authored over a standing-open door is
//               healed by the 1Hz sweep (bell-grammar say, no cause/by)
// - missing:    a ghost door or missing plates skip fail-closed (no crash)
// - pass-through: use {action:"ring"} on the puzzle host mints nothing
// - spectator:  spectate legs cannot write plates (shell gate)
// - restart:    replay mints nothing; the sweep does not churn holds; the
//               live solve path still works after restart
// - late join:  folds plates + open door + matched derivation
// - mcpl:       describePuzzle reads folded truth (live derivation)
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  normalizePuzzle, puzzleMatch, describePuzzle,
} from "../shared/puzzle.js";

const PORT = Number(process.env.PORT ?? 9032);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-puzzle";
const WORLD = `puzzletest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-puzzle-"));

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
  close() { this.ws.close(); }
}

let server: ReturnType<typeof spawn> | null = null;
let serverLog = "", spawnErr = "";
async function startServer() {
  // one paced retry (the vocab-30/31 chassis: an EAGAIN spawn under machine
  // load is noise, not a server defect)
  let lastErr = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(1200);
    server = spawn(process.execPath, [join(import.meta.dir, "..", "server", "server.ts")], {
      env: {
        ...process.env, PORT: String(PORT), WORLDS_DIR: worldsDir, JOIN_TOKEN: TOKEN,
        FOLD_EVERY: "40", VERB_RATE: "5000", MSG_RATE: "5000",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    serverLog = ""; spawnErr = ""; lastErr = "";
    server.on("error", (e) => { spawnErr = String(e); });
    server.stdout!.on("data", (d) => { serverLog += d; });
    server.stderr!.on("data", (d) => { serverLog += d; });
    for (let i = 0; i < 100; i++) {
      try { if ((await fetch(`http://127.0.0.1:${PORT}/avatars`)).ok) return; } catch (e) { lastErr = String(e); }
      if (server.exitCode != null) break;
      await sleep(100);
    }
    server.kill();
    await sleep(200);
  }
  throw new Error(`scratch sequencer did not start (exit=${server!.exitCode}, spawnErr=${spawnErr}, last fetch err=${lastErr})\n--- server output ---\n${serverLog.slice(-2000)}`);
}

const logLines = () => {
  const p = join(worldsDir, WORLD, "log.jsonl");
  if (!existsSync(p)) return [] as any[];
  return readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
};
const pzSays = (doorId?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.pz != null && (!doorId || (e.args as any)?.id === doorId));
const doorComps = (id: string) => logLines()
  .filter((e) => e.verb === "comp" && (e.args as any)?.type === "door" && (e.args as any)?.id === id);
const lastDoorComp = (id: string): any => doorComps(id).at(-1);

try {
  console.log(`\npuzzle matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const { cfg, notes } = normalizePuzzle({
      windowSec: 999999, plates: ["plA", 42, "plB", "plA", "plC"], door: "door1",
    });
    check("unit: windowSec clamps to 86400; plates sanitize/dedupe/cap at 2",
      cfg.windowSec === 86400 && JSON.stringify(cfg.plates) === JSON.stringify(["plA", "plB"]),
      JSON.stringify({ w: cfg.windowSec, plates: cfg.plates }));
    check("unit: lint notes name every drop by value",
      notes.some((x) => x.includes("42")) && notes.some((x) => x.includes("capped")) && notes.some((x) => x.includes("windowSec")),
      JSON.stringify(notes).slice(0, 200));
    const bad = normalizePuzzle({ plates: ["only-one"] });
    check("unit: fewer than 2 plates or no door = can never fire (noted, never guessed)",
      bad.notes.some((x) => x.includes("can never fire")) && bad.cfg.door === null,
      JSON.stringify(bad.notes));
    const ents: any = {
      plA: { comp: { plate: { text: "open sesame", by: "bob", at: 1000 } } },
      plB: { comp: { plate: { text: "open sesame", by: "carol", at: 64000 } } },
    };
    const cfg2 = normalizePuzzle({ plates: ["plA", "plB"], door: "d", windowSec: 300 }).cfg;
    check("unit: same words within the window MATCH",
      puzzleMatch(cfg2, ents, 70000).ok === true);
    const cfg3 = normalizePuzzle({ plates: ["plA", "plB"], door: "d", windowSec: 5 }).cfg;
    const gap = puzzleMatch(cfg3, ents, 70000);
    check("unit: same words past the window do NOT match (why names the gap)",
      gap.ok === false && gap.why.includes("apart") && gap.why.includes("window 5s"),
      JSON.stringify(gap));
    const authored: any = {
      plA: { comp: { plate: { text: "set by author" } } },
      plB: { comp: { plate: { text: "set by author" } } },
    };
    check("unit: an authored pre-carve (no hand at) never matches — fail closed",
      puzzleMatch(cfg2, authored, 70000).ok === false,
      JSON.stringify(puzzleMatch(cfg2, authored, 70000)));
    const blank: any = {
      plA: { comp: { plate: { text: "words", by: "bob", at: 1000 } } },
      plB: { comp: { plate: { text: "", by: "carol", at: 2000 } } },
    };
    check("unit: a blank plate is 'still blank'",
      puzzleMatch(cfg2, blank, 70000).why === "a plate is still blank");
    const disagree: any = {
      plA: { comp: { plate: { text: "one", by: "bob", at: 1000 } } },
      plB: { comp: { plate: { text: "two", by: "carol", at: 2000 } } },
    };
    check("unit: disagreeing plates 'disagree'",
      puzzleMatch(cfg2, disagree, 70000).why === "the plates disagree");
    const miss = puzzleMatch(cfg2, {}, 70000);
    check("unit: a missing plate is a missing-entity skip, not a mismatch",
      miss.ok === false && miss.missing === "plA", JSON.stringify(miss));
    check("unit: describePuzzle reads live state (matched / disagree)",
      describePuzzle({ plates: ["plA", "plB"], door: "d", windowSec: 300 }, ents).includes("MATCHED")
        && describePuzzle({ plates: ["plA", "plB"], door: "d", windowSec: 300 }, disagree).includes("disagree"),
      "");
  }

  // ---- scratch server ----------------------------------------------------------
  await startServer();
  const alice = new Client("alice");
  await alice.connect();

  // ---- the board: two plates, a held door --------------------------------------
  alice.verb("spawn", { id: "plA", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("spawn", { id: "plB", lib: "deco/bench.glb", pos: [6, 0, 0], yaw: 0 });
  alice.verb("spawn", { id: "door1", lib: "deco/bench.glb", pos: [12, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "plA", type: "plate", data: { reach: 6 } });
  alice.verb("comp", { id: "plB", type: "plate", data: { reach: 6 } });
  alice.verb("comp", { id: "door1", type: "door", data: { deg: 90, swingSec: 0.6 } });
  await sleep(300);
  alice.verb("comp", { id: "door1", type: "puzzle", data: { plates: ["plA", "plB"], door: "door1", windowSec: 20 } });
  await sleep(300);

  // ---- authoring gate (a standing board exists for the visitor to target) ------
  {
    const eve = new Client("eve");
    await eve.connect();
    await sleep(200);
    alice.verb("grant", { id: "eve", role: "visitor" });
    await sleep(300);
    eve.verb("comp", { id: "door1", type: "puzzle", data: { plates: ["plA", "plB"], door: "door1" } });
    await sleep(400);
    check("authoring the puzzle comp is builder-gated (visitor denied)",
      eve.msgs.some((m) => m.type === "error" && /builder/.test(String(m.error))),
      eve.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));
    eve.close();
  }

  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);

  // ---- one plate ≠ solved; manual open while held reverts in-flight ------------
  {
    bob.walk([0, 0, 1]);
    await sleep(300);
    bob.verb("use", { id: "plA", action: "write", text: "open sesame" });
    await sleep(400);
    check("one plate written: the door stays shut (no door comp writes)",
      doorComps("door1").every((e: any) => e.actor !== "world"),
      `${doorComps("door1").filter((e: any) => e.actor === "world").length} world door writes`);
    bob.walk([12, 0, 1]);
    await sleep(300);
    bob.verb("use", { id: "door1", action: "open" });
    await sleep(500);
    const last = lastDoorComp("door1");
    check("a manual open while unsolved is re-closed in the same reaction window",
      last?.args?.data?.open === false && last?.actor === "world",
      JSON.stringify(last && { actor: last.actor, open: last.args.data.open }));
    const refuse = pzSays("door1").at(-1);
    check("the re-close says its line with pz{open:false} + cause/by chain",
      refuse?.args?.pz?.open === false && refuse.args.cause != null && refuse.args.by === "bob",
      JSON.stringify(refuse?.args));
  }

  // ---- the solve: second plate completes the match ------------------------------
  {
    bob.walk([6, 0, 1]);
    await sleep(300);
    bob.verb("use", { id: "plB", action: "write", text: "open sesame" });
    await sleep(500);
    const last = lastDoorComp("door1");
    check("the matching second write opens the door (door family's own write shape)",
      last?.args?.data?.open === true && last.actor === "world" && last.args.data.deg === 90,
      JSON.stringify(last && { actor: last.actor, open: last.args.data.open, deg: last.args.data.deg }));
    const unlock = pzSays("door1").find((e: any) => e.args.pz.open === true);
    check("the unlock says its line with pz{open:true} + cause = the solving use",
      unlock != null && unlock.args.cause != null && unlock.args.by === "bob",
      JSON.stringify(unlock?.args));
  }

  // ---- a matched door is FREE ---------------------------------------------------
  {
    const pzBefore = pzSays("door1").length;
    bob.walk([12, 0, 1]);
    await sleep(300);
    bob.verb("use", { id: "door1", action: "close" });
    await sleep(400);
    let last = lastDoorComp("door1");
    check("a matched door closes by hand (no fight, no pz say)",
      last?.args?.data?.open === false && pzSays("door1").length === pzBefore,
      `${pzSays("door1").length} vs ${pzBefore}`);
    bob.verb("use", { id: "door1", action: "open" });
    await sleep(400);
    last = lastDoorComp("door1");
    check("and re-opens by hand (the engine never fights a matched door)",
      last?.args?.data?.open === true && pzSays("door1").length === pzBefore,
      `${pzSays("door1").length} vs ${pzBefore}`);
  }

  // ---- re-lock: rewriting one plate breaks the match ----------------------------
  {
    bob.walk([0, 0, 1]);
    await sleep(300);
    bob.verb("use", { id: "plA", action: "write", text: "changed my mind" });
    await sleep(500);
    const last = lastDoorComp("door1");
    check("breaking the match re-closes an open door through the same reconciliation",
      last?.args?.data?.open === false && last.actor === "world",
      JSON.stringify(last && { actor: last.actor, open: last.args.data.open }));
    check("the re-lock says its line with pz{open:false}",
      pzSays("door1").at(-1)?.args?.pz?.open === false, "");
  }

  // ---- the window: same words, written too far apart ----------------------------
  {
    alice.verb("spawn", { id: "plC", lib: "deco/bench.glb", pos: [24, 0, 0], yaw: 0 });
    alice.verb("spawn", { id: "plD", lib: "deco/bench.glb", pos: [26, 0, 0], yaw: 0 });
    alice.verb("spawn", { id: "door3", lib: "deco/bench.glb", pos: [30, 0, 0], yaw: 0 });
    await sleep(300);
    alice.verb("comp", { id: "plC", type: "plate", data: { reach: 6 } });
    alice.verb("comp", { id: "plD", type: "plate", data: { reach: 6 } });
    alice.verb("comp", { id: "door3", type: "door", data: { deg: 90 } });
    alice.verb("comp", { id: "door3", type: "puzzle", data: { plates: ["plC", "plD"], door: "door3", windowSec: 5 } });
    await sleep(300);
    bob.walk([24, 0, 1]);
    await sleep(300);
    bob.verb("use", { id: "plC", action: "write", text: "twin words" });
    await sleep(6000);                                  // past windowSec 5
    bob.walk([26, 0, 1]);
    await sleep(300);
    bob.verb("use", { id: "plD", action: "write", text: "twin words" });
    await sleep(500);
    check("matching words written past the window do NOT unlock",
      lastDoorComp("door3")?.args?.data?.open !== true && pzSays("door3").length === 0,
      JSON.stringify(lastDoorComp("door3")?.args?.data && { open: lastDoorComp("door3").args.data.open }));
  }

  // ---- sweep heal: an unsolved puzzle authored over a standing-open door ---------
  {
    alice.verb("spawn", { id: "door2", lib: "deco/bench.glb", pos: [18, 0, 0], yaw: 0 });
    await sleep(300);
    alice.verb("comp", { id: "door2", type: "door", data: { deg: 90 } });
    await sleep(300);
    alice.walk([18, 0, 1]);
    await sleep(300);
    alice.verb("use", { id: "door2", action: "open" });
    await sleep(400);
    check("door2 stands open by hand (pre-puzzle)", lastDoorComp("door2")?.args?.data?.open === true, "");
    // an unsolved puzzle over the open door (plA reads "changed my mind", plB "open sesame")
    alice.verb("comp", { id: "door2", type: "puzzle", data: { plates: ["plA", "plB"], door: "door2" } });
    await sleep(1800);                                  // sweep heal window
    const last = lastDoorComp("door2");
    check("the 1Hz sweep heals the hold (door re-closed, world actor)",
      last?.args?.data?.open === false && last.actor === "world",
      JSON.stringify(last && { actor: last.actor, open: last.args.data.open }));
    const heal = pzSays("door2").at(-1);
    check("the heal says its line in the bell grammar (no cause/by — the standing rule)",
      heal?.args?.pz?.open === false && heal.args.cause == null && heal.args.by == null,
      JSON.stringify(heal?.args));
  }

  // ---- missing door: fail-closed, no crash ---------------------------------------
  {
    alice.verb("spawn", { id: "plF", lib: "deco/bench.glb", pos: [36, 0, 0], yaw: 0 });
    alice.verb("spawn", { id: "plG", lib: "deco/bench.glb", pos: [38, 0, 0], yaw: 0 });
    await sleep(300);
    alice.verb("comp", { id: "plF", type: "plate", data: { reach: 6 } });
    alice.verb("comp", { id: "plG", type: "plate", data: { reach: 6 } });
    alice.verb("spawn", { id: "pghost", lib: "deco/bench.glb", pos: [42, 0, 0], yaw: 0 });
    await sleep(300);
    alice.verb("comp", { id: "pghost", type: "puzzle", data: { plates: ["plF", "plG"], door: "ghost-door" } });
    await sleep(300);
    bob.walk([36, 0, 1]);
    await sleep(300);
    bob.verb("use", { id: "plF", action: "write", text: "pair" });
    await sleep(300);
    bob.walk([38, 0, 1]);
    await sleep(300);
    bob.verb("use", { id: "plG", action: "write", text: "pair" });
    await sleep(800);
    check("a ghost door skips fail-closed (no writes, no crash — server alive)",
      pzSays("ghost-door").length === 0 && server?.exitCode == null, "");
  }

  // ---- pass-through + spectator ---------------------------------------------------
  {
    const pzBefore = pzSays().length;
    bob.verb("use", { id: "door1", action: "ring" });
    await sleep(400);
    check("use {action:\"ring\"} on the puzzle host mints nothing",
      pzSays().length === pzBefore, `${pzSays().length} vs ${pzBefore}`);
    const spec = new Client("spec1");
    await spec.connect(true);
    await sleep(200);
    spec.walk([0, 0, 1]);
    await sleep(300);
    spec.verb("use", { id: "plA", action: "write", text: "spectator words" });
    await sleep(400);
    check("a spectator cannot write plates (shell gate)",
      pzSays().length === pzBefore, `${pzSays().length} vs ${pzBefore}`);
    spec.close();
  }

  // ---- restart: replay mints nothing; holds do not churn; solve still works ------
  {
    const pzBefore = pzSays().length;
    const doorWritesBefore = (id: string) => doorComps(id).length;
    const w1 = doorWritesBefore("door1"), w2 = doorWritesBefore("door2"), w3 = doorWritesBefore("door3");
    await server!.kill();
    await sleep(400);
    await startServer();
    const probe = new Client("probe1");
    await probe.connect();
    await sleep(2500);                                  // sweeps run
    check("restart: replay + fresh sweeps minted no pz says",
      pzSays().length === pzBefore, `${pzSays().length} vs ${pzBefore}`);
    check("restart: the sweep did not churn any held door",
      doorComps("door1").length === w1 && doorComps("door2").length === w2 && doorComps("door3").length === w3,
      `${doorComps("door1").length}/${doorComps("door2").length}/${doorComps("door3").length} vs ${w1}/${w2}/${w3}`);
    const ents = probe.snapshot?.state?.entities;
    check("late joiner folds the plates + the held door (linked truth)",
      ents?.plA?.comp?.plate?.text === "changed my mind" && ents?.door1?.comp?.door?.open === false
        && ents?.door1?.comp?.puzzle != null,
      JSON.stringify({ plA: ents?.plA?.comp?.plate?.text, open: ents?.door1?.comp?.door?.open }));
    check("mcpl affordance read (describePuzzle on folded truth)",
      describePuzzle(ents?.door1?.comp?.puzzle, ents).startsWith("puzzle: ")
        && describePuzzle(ents?.door1?.comp?.puzzle, ents).includes("disagree"),
      describePuzzle(ents?.door1?.comp?.puzzle, ents));
    // alice (builder) rewrites plA: her fresh `at` is now outside door1's
    // window vs plB's old stamp — so refresh BOTH plates within the window
    // (the pair, not one plate, is the solution).
    const alice2 = new Client("alice");
    await alice2.connect();
    await sleep(300);
    alice2.walk([0, 0, 1]);
    await sleep(300);
    alice2.verb("use", { id: "plA", action: "write", text: "second life" });
    await sleep(300);
    alice2.walk([6, 0, 1]);
    await sleep(300);
    // plB still reads the solve-phase words with a stale stamp — a same-text
    // no-op write mints nothing and never fires the tail, so the returning
    // solver re-writes BOTH plates fresh (the honest long-absence story)
    alice2.verb("use", { id: "plB", action: "write", text: "second life" });
    await sleep(600);
    const last = lastDoorComp("door1");
    check("post-restart live solve still opens the door (builder rewrite completes the match)",
      last?.args?.data?.open === true && last.actor === "world"
        && pzSays("door1").some((e: any) => e.args.pz.open === true && e.args.by === "alice"),
      JSON.stringify(last && { actor: last.actor, open: last.args.data.open }));
    probe.close();
    alice2.close();
  }

  // ---- cleanup --------------------------------------------------------------------
  bob.close();
  try { alice.close(); } catch { /* already gone */ }
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
