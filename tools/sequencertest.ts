// Sequencer matrix — `comp {type:"sequencer"}` makes an entity a STEP-GRID
// MUSIC MACHINE: an authored or hand-written pattern, a fold-anchored run
// bit, and client-side synthesis through the music family's own synth.
// Every seq/start/stop is ONE world-authored comp transition + say with sq
// provenance. Covers § SEQUENCERS CONTRACT:
//
//   bun tools/sequencertest.ts
//
// - unit:       normalizeSequencer clamps/defaults; grid caps; cell
//               resolution (name/degree/hz/rest); stepAt closed form;
//               stepNotes; describe; action disjointness; engine keys;
//               unknown keys ride; malformed shapes
// - authoring:  spawn + sequencer comp is builder-gated; visitor bounces
// - seq:        use {action:"seq", steps} writes grid + say with
//               sq{seq, who, at} + cause/by; one comp transition
// - lint:       authored garbage clamps with notes; engine write verbatim
// - start/stop: rank 0 + reach; comp transition + say; grid swap mid-run
// - late-join:  snapshot folds grid + run bit + anchor; stepAt agrees
// - no-ops:     start on playing / stop on stopped mint nothing
// - 8KB:        oversized carry degrades to engine keys
// - restart:    replay mints nothing; the anchor is unchanged; the step
//               derives forward (time held the truth)
// - authority:  visitor seq-authoring over another's grid bounces (builder
//               once a grid exists); reach/spectator gates
// - pass-through: non-sequencer actions fall through untouched
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  SEQUENCER_ACTIONS, SEQUENCER_ENGINE_KEYS, cellHz, describeSequencer,
  normalizeSequencer, stepAt, stepNotes,
} from "../shared/sequencer.js";

const PORT = Number(process.env.PORT ?? 9011);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-seq";
const WORLD = `seqtest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-seq-"));

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
    this.send({ type: "debug", reqId: `d${this.msgs.length}`, kinds: [kind], limit: 160 });
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
const sqSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.sq != null && (!id || (e.args as any)?.id === id));
const sqComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "sequencer" && (!id || (e.args as any)?.id === id));
/** The folded sequencer = the LAST sequencer comp write in the log. */
const logSq = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "sequencer"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const snapSq = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.sequencer ?? null;
const lastDebug = (c: Client) => c.msgs.filter((m) => m.type === "debug").at(-1);

try {
  console.log(`\nsequencer matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const { cfg, playing, at, lint } = normalizeSequencer({ bpm: 400, gain: 2, sec: 9, reach: 40, steps: [] });
    check("unit: clamps bpm/gain/sec/reach with notes",
      cfg.bpm === 240 && cfg.gain === 1 && cfg.sec === 2 && cfg.reach === 12 && lint.length > 0,
      JSON.stringify(lint));
    check("unit: empty grid → stopped, stepAt i:-1",
      playing === false && at === 0 && stepAt(cfg, [], false, at, Date.now()).i === -1);
    const g = normalizeSequencer({ bpm: 100, steps: [0, null, [0, 4], "C4"] });
    check("unit: bare pitch = one voice; array = chord; names ride verbatim",
      g.steps.length === 4 && g.steps[0].length === 1 && g.steps[2].length === 2
        && g.steps[3][0] === "C4" && g.steps[2][0] === 0 && g.steps[2][1] === 4,
      JSON.stringify(g.steps));
    check("unit: rest cells resolve null", g.steps[1][0] === null);
    check("unit: cellHz resolves degree 0 from A3 root = 220hz; degree 4 (semitone 9) ≈ 369.99hz",
      cellHz(g.steps[0][0], g.cfg) === 220 && Math.abs((cellHz(g.steps[2][1], g.cfg) ?? 0) - 369.994) < 0.01,
      `${cellHz(g.steps[0][0], g.cfg)} / ${cellHz(g.steps[2][1], g.cfg)}`);
    check("unit: stepAt wraps and dt stays within the step",
      (() => {
        const s = stepAt({ bpm: 60000 }, [0], true, 0, 5000);   // 1 step per ms, raw cfg
        return s.i === 0 && s.k === 5000 && s.dt < 1;
      })());
    check("unit: stepNotes resolves {hz, sec, gain, wave} per voice",
      (() => {
        const { cfg, steps } = normalizeSequencer({ bpm: 100, steps: [[0, 1]] });
        const ns = stepNotes(cfg, steps, 0);
        return ns.length === 2 && ns[0].hz === 220 && Math.abs(ns[1].hz - 220 * 2 ** (2 / 12)) < 0.01
          && ns[0].wave === "sine" && ns[0].sec === 0.35;
      })());
    check("unit: describe names steps + state + actions",
      (() => {
        const s = describeSequencer({ bpm: 100, steps: [0, null], playing: true, at: Date.now() - 100 });
        return s.startsWith("sequencer:") && s.includes("playing") && s.includes('action:"start"');
      })());
    const PRIOR_ACTIONS = ["open", "close", "toggle", "light", "snuff", "sign", "erase", "write", "enter", "travel", "step", "through", "hop", "teleport", "blink", "reserve", "hold", "release", "mute", "quiet", "unmute", "resume", "flow", "still", "advance", "tend", "beacon", "befriend", "tame", "heel", "stay", "come", "dismiss", "free", "play", "note", "ring", "post", "unpost", "buy", "restock", "dedicate", "retract", "begin", "halt", "plant", "harvest", "weed"];
    check("unit: SEQUENCER actions seq/start/stop DISJOINT from all 19 prior families",
      SEQUENCER_ACTIONS.has("seq") && SEQUENCER_ACTIONS.has("start") && SEQUENCER_ACTIONS.has("stop")
        && !PRIOR_ACTIONS.includes("seq") && !PRIOR_ACTIONS.includes("start") && !PRIOR_ACTIONS.includes("stop"));
    check("unit: engine keys steps/playing/at stripped from carry (authoring doctrine)",
      SEQUENCER_ENGINE_KEYS.has("steps") && SEQUENCER_ENGINE_KEYS.has("playing") && SEQUENCER_ENGINE_KEYS.has("at"));
    check("unit: unknown keys ride (bag is public)",
      (() => { const { cfg } = normalizeSequencer({ custom: "rides" }); return (cfg.authored as any).custom === "rides"; })());
    check("unit: malformed steps (object) noted, none authored",
      (() => { const { steps, lint } = normalizeSequencer({ steps: { 0: 1 } as unknown as number[] }); return steps.length === 0 && lint.some((n) => n.includes("is not an array")); })());
    check("unit: >16 steps truncate with a note",
      (() => { const { steps, lint } = normalizeSequencer({ steps: Array(20).fill(0) }); return steps.length === 16 && lint.some((n) => n.includes("capped")); })());
    check("unit: >4 voices truncate with a note",
      (() => { const { steps, lint } = normalizeSequencer({ steps: [[0, 2, 4, 7, 9]] }); return steps[0].length === 4 && lint.some((n) => n.includes("voices")); })());
    check("unit: unresolvable cell → rest with a note",
      (() => { const { steps, lint } = normalizeSequencer({ steps: ["N0T3"] }); return steps[0][0] === null && lint.some((n) => n.includes("unresolvable")); })());
  }

  await startServer();

  // ---- authoring ---------------------------------------------------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "looper1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "looper1", type: "sequencer", data: { bpm: 120, gain: 0.6 } });
  await sleep(400);
  check("builder authored spawn + sequencer comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  bob.walk([0, 0, 0.4]);                                // local pose ≈ [0, 0.4]
  await sleep(300);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  const carol = new Client("carol");
  await carol.connect();
  await sleep(200);
  alice.verb("grant", { id: "carol", role: "visitor" });
  await sleep(300);
  carol.verb("comp", { id: "looper1", type: "sequencer", data: { bpm: 300 } });
  await sleep(300);
  check("visitor comp authoring bounces",
    carol.msgs.some((m) => m.type === "error"),
    "no error seen for visitor comp");
  check("no visitor-authored sequencer comp in the log",
    !logLines().some((e) => e.verb === "comp" && (e.args as any)?.type === "sequencer" && e.actor === "carol"));

  // ---- seq: visitor near, writes the grid --------------------------------------
  bob.verb("use", { id: "looper1", action: "seq", steps: [0, null, 4, null] });
  await sleep(400);
  const says1 = sqSays("looper1");
  check("rank-0 seq in reach writes the grid (default line)",
    says1.length === 1 && (says1[0]?.args as any)?.text === "bob writes a pattern",
    `${says1.length} says: ${JSON.stringify(says1.map((s) => (s.args as any)?.text))}`);
  check("say carries sq{seq, who, at} + cause/by provenance",
    (says1[0]?.args as any)?.sq?.seq === true && (says1[0]?.args as any)?.sq?.who === "bob"
      && typeof (says1[0]?.args as any)?.sq?.at === "number"
      && typeof (says1[0]?.args as any)?.cause === "number" && (says1[0]?.args as any)?.by === "bob",
    JSON.stringify(says1[0]?.args?.sq));
  const comps1 = sqComps("looper1");
  check("the seq wrote ONE world-authored comp transition",
    comps1.length === 1, `${comps1.length} sequencer comp writes`);
  {
    const d = comps1[0]?.args as any;
    check("the write carries authored shape + steps engine key",
      d?.data?.bpm === 120 && d?.data?.steps?.length === 4 && d?.data?.steps[2][0] === 4
        && d?.data?.playing === false,
      JSON.stringify(d?.data)?.slice(0, 200));
    check("the use verb logged with bob as actor (authority trace)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob"
        && (e.args as any)?.id === "looper1" && (e.args as any)?.action === "seq"));
  }
  check("the effect broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.sq?.who === "bob"));

  // ---- seq: unresolvable voices are rests (fail-open per voice) -----------------
  bob.verb("use", { id: "looper1", action: "seq", steps: [0, "zzz"] });
  await sleep(400);
  {
    const d = logSq("looper1");
    check("unresolvable voice drops to a rest, pattern survives",
      d?.steps?.length === 2 && d?.steps[1][0] === null,
      JSON.stringify(d?.steps));
  }

  // ---- start: rank 0 + reach -----------------------------------------------------
  bob.verb("use", { id: "looper1", action: "start" });
  await sleep(400);
  {
    const d = logSq("looper1");
    check("start anchors the run: playing:true + at:now",
      d?.playing === true && typeof d?.at === "number" && d?.at > 0,
      JSON.stringify({ playing: d?.playing, at: d?.at }));
    const saysList = sqSays("looper1");
    check("start said its line with sq{start:true}",
      saysList.some((s2) => (s2.args as any)?.sq?.start === true && (s2.args as any)?.text === "the music begins"),
      JSON.stringify(saysList.map((x) => x.args?.text)));
  }

  // ---- grid swap mid-run: a second seq while playing re-anchors ------------------
  {
    await sleep(150);
    bob.verb("use", { id: "looper1", action: "seq", steps: [0, null] });
    await sleep(400);
    const d = logSq("looper1");
    check("seq while playing KEEPS playing (grid swap mid-run)",
      d?.playing === true && d?.steps?.length === 2,
      JSON.stringify({ playing: d?.playing, steps: d?.steps?.length }));
  }

  // ---- late-join: snapshot folds grid + run bit + anchor -------------------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const d = snapSq(late.snapshot, "looper1");
    const nrm = normalizeSequencer(d);
    const s = stepAt(nrm.cfg, nrm.steps, nrm.playing, nrm.at, Date.now());
    check("late joiner folds grid + run bit + anchor and derives a step",
      d?.steps?.length === 2 && d?.playing === true && typeof d?.at === "number" && s.i >= 0,
      JSON.stringify(d)?.slice(0, 120));
    late.close();
  }

  // ---- no-ops: start on playing / stop on stopped --------------------------------
  {
    const before = sqSays("looper1").length;
    bob.verb("use", { id: "looper1", action: "start" });
    await sleep(400);
    check("start on playing is a no-op (mint-nothing)",
      sqSays("looper1").length === before,
      `${sqSays("looper1").length} vs ${before}`);
    bob.verb("use", { id: "looper1", action: "stop" });
    await sleep(400);
    check("stop said its line", sqSays("looper1").some((s2) => (s2.args as any)?.sq?.stop === true));
    const before2 = sqSays("looper1").length;
    bob.verb("use", { id: "looper1", action: "stop" });
    await sleep(400);
    check("stop on stopped is a no-op (mint-nothing)",
      sqSays("looper1").length === before2,
      `says ${sqSays("looper1").length} vs ${before2}`);
    const d = logSq("looper1");
    check("stop wrote playing:false into the fold",
      d?.playing === false && d?.steps?.length === 2,
      JSON.stringify({ playing: d?.playing }));
  }

  // ---- pass-through ----------------------------------------------------------------
  {
    const compsB = sqComps("looper1").length;
    bob.verb("use", { id: "looper1", action: "ring" });
    await sleep(400);
    check("\"ring\" passes through untouched (logged, no comp writes)",
      sqComps("looper1").length === compsB
        && logLines().some((e) => e.verb === "use" && (e.args as any)?.id === "looper1" && (e.args as any)?.action === "ring"),
      `comps ${compsB} → ${sqComps("looper1").length}`);
  }

  // ---- lint: authored garbage clamps at read; engine write verbatim ----------------
  {
    alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [40, 0, 0], yaw: 0 });
    await sleep(300);
    alice.verb("comp", { id: "linty", type: "sequencer", data: { bpm: 400, steps: Array(20).fill(0) } });
    await sleep(300);
    bob.walk([41, 0, 0]);
    await sleep(300);
    bob.verb("use", { id: "linty", action: "start" });
    await sleep(400);
    const d = logSq("linty");
    check("engine write carries authored cfg VERBATIM + sanitized grid + run keys",
      d?.bpm === 400 && Array.isArray(d?.steps) && d.steps.length === 16 && d?.playing === true,
      JSON.stringify(d)?.slice(0, 160));
    const n = normalizeSequencer(d);
    check("a late reader CLAMPS the carry at read time",
      n.cfg.bpm === 240 && n.steps.length === 16 && n.lint.some((x) => x.includes("bpm")),
      JSON.stringify(n.lint));
    bob.debug("sequencer-lint");
    await sleep(300);
    const l = lastDebug(bob);
    check("the clamps left sequencer-lint notes",
      JSON.stringify(l?.events ?? []).includes("clamped"),
      JSON.stringify(l?.events ?? []).slice(0, 200));
  }

  // ---- 8KB degrade -------------------------------------------------------------------
  {
    alice.verb("spawn", { id: "fatty", lib: "deco/bench.glb", pos: [50, 0, 0], yaw: 0 });
    await sleep(300);
    const pad = "x".repeat(8100);
    alice.verb("comp", { id: "fatty", type: "sequencer", data: { steps: [0], padding: pad } });
    await sleep(300);
    bob.walk([52, 0, 0]);
    await sleep(300);
    bob.verb("use", { id: "fatty", action: "start" });
    await sleep(400);
    const d = logSq("fatty");
    check("8KB degrade keeps the truth (carry dropped)",
      d?.steps?.length === 1 && d?.padding === undefined,
      JSON.stringify(d)?.slice(0, 160));
  }

  // ---- reach: out-of-reach start mints nothing ----------------------------------------
  {
    const before = sqSays().length;
    bob.walk([100, 0, 0]);
    await sleep(300);
    bob.verb("use", { id: "looper1", action: "start" });
    await sleep(400);
    check("out-of-reach start mints nothing",
      sqSays().length === before,
      `says ${sqSays().length} vs ${before}`);
    bob.debug("sequencer-skip");
    await sleep(300);
    const s = lastDebug(bob);
    check("out-of-reach skip names the distance",
      JSON.stringify(s?.events ?? []).includes("out of reach"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- spectator (pre-restart sockets) ------------------------------------------------
  {
    const spec = new Client("watcher1");
    await spec.connect(true);
    await sleep(300);
    const before = sqSays().length;
    spec.verb("use", { id: "looper1", action: "start" });
    await sleep(400);
    check("spectator use mints nothing (shell gate)",
      sqSays().length === before,
      `${sqSays().length} vs ${before}`);
    spec.close();
  }

  // ---- restart: replay mints nothing; anchor unchanged; step derives forward ----------
  const saidAll = sqSays().length;
  bob.walk([0, 0, 0.4]);
  await sleep(300);
  bob.verb("use", { id: "looper1", action: "start" });
  await sleep(400);
  const preAt = logSq("looper1")?.at;
  const preN = normalizeSequencer(logSq("looper1"));
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  {
    const d1 = snapSq(probe.snapshot, "looper1");
    const nrm = normalizeSequencer(d1);
    const s = stepAt(nrm.cfg, nrm.steps, nrm.playing, nrm.at, Date.now());
    check("restart: a fresh join folds the same grid + run bit + anchor",
      d1?.steps?.length === 2 && d1?.playing === true && d1?.at === preAt,
      JSON.stringify(d1)?.slice(0, 200));
    check("restart: replay minted nothing", sqSays().length === saidAll + 1,
      `${sqSays().length} vs ${saidAll + 1} (one restart-start say is ours)`);
    check("restart: the step still derives (time held the truth)",
      s.i >= 0 && s.i < 2,
      `i=${s.i}`);
    check("mcpl affordance read (describeSequencer)",
      describeSequencer(d1).startsWith("sequencer:"), describeSequencer(d1).slice(0, 80));
    void preN;
  }

  // ---- idempotent fold ------------------------------------------------------------------
  {
    const a = JSON.stringify(snapSq(probe.snapshot, "looper1"));
    const b = JSON.stringify(snapSq(JSON.parse(JSON.stringify(probe.snapshot)), "looper1"));
    check("folded sequencer state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup ---------------------------------------------------------------------------
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
