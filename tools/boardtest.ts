// Board matrix — `comp {type:"board"}` makes an entity a MESSAGE BOARD:
// one multi-line notice (the current text) + a capped revision history
// (superseded notices, newest-first), written as world-authored comp
// transitions. Edit authority rides the rights ladder itself (plate
// edit-rank doctrine): blank takes anyone's first words; the last poster
// rewrites their own; others need builder+ unless the author opted the
// board public (editable:true).
// Self-booting: scratch sequencer (fresh WORLDS_DIR), builder authors the
// board, visitors post/supersede/take-down. Covers § BOARDS CONTRACT:
//
//   bun tools/boardtest.ts
//
// - unit:       normalizeBoard clamps/defaults; boardText newline collapse
//               and cap; sanitize history; edit ladder; describe; BOARD
//               action disjointness (post/unpost vs the 13 prior families)
// - authoring:  spawn + board comp is builder-gated; visitor comp bounces
// - post:       use {action:"post", text} in reach writes the notice (+
//               revision bump) + says with bd{text,by,at,rev} + cause/by
// - fold:       notice folds from the log; late joiner reads the same
// - own:        the last poster rewrites their own notice (rank 0)
// - visitor-bounce: another visitor's post skips fail-closed naming the
//               boundary
// - builder-rewrite: a builder rewrites anyone's notice (communal act)
// - history-cap: revs:N caps the superseded list at N (oldest evicted)
// - unpost:     the poster clears their own notice (history keeps it)
// - blank-again: after a clear the board takes the next first-words
// - no-op:      posting the text the board already reads mints nothing
// - no-text:    empty post mints nothing
// - ladder-skip+clamp: bob's post over carol's notice skips; carol's own
//               over-long post clamps to maxLen
// - editable:   editable:true makes the board public (visitor supersedes)
// - pre-carved: an authored pre-carved notice (no by) resists visitors
// - reach:      out-of-reach post mints nothing (skip names distance)
// - spectator:  spectate legs cannot post (shell gate, mint-nothing)
// - pass-through: non-board actions ("ring", "sign") fall through
// - lint:       maxLen 5000 / revs 99 clamp at read; engine write verbatim
// - 8KB degrade: an oversized carry keeps the truth, drops the carry
// - restart:    replay mints nothing; notice + history survive folded
// - describe:   describeBoard reads notice head + rev + action hint
// - idempotent: folded board state is stable across snapshot re-reads
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  BOARD_ACTIONS, boardText, canPostBoard, canUnpostBoard,
  describeBoard, normalizeBoard, sanitizeBoardHistory,
} from "../shared/board.js";

const PORT = Number(process.env.PORT ?? 9005);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-board";
const WORLD = `boardtest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-board-"));

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
const bdSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.bd != null && (!id || (e.args as any)?.id === id));
const bdComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "board" && (!id || (e.args as any)?.id === id));
/** The folded board = the LAST board comp write in the log. */
const logBd = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "board"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const snapBd = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.board ?? null;

try {
  console.log(`\nboard matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const { cfg, notes } = normalizeBoard({ maxLen: 5000, revs: 99, reach: 99 } as any);
    check("unit: maxLen 5000 clamps to 600 + note", cfg.maxLen === 600 && notes.some((n) => n.includes("maxLen")), JSON.stringify(notes));
    check("unit: revs 99 clamps to 32; reach 99 clamps to 12", cfg.revs === 32 && cfg.reach === 12);
    const dflt = normalizeBoard({});
    check("unit: defaults maxLen 300 / revs 8 / reach 4 / editable false",
      dflt.cfg.maxLen === 300 && dflt.cfg.revs === 8 && dflt.cfg.reach === 4 && dflt.cfg.editable === false);
    check("unit: multi-line text is PRESERVED (a notice is multi-line)",
      boardText("line one\nline two\n\nline four", 300) === "line one\nline two\n\nline four");
    check("unit: 3+ blank lines collapse to one blank line (newline-spam guard)",
      boardText("a\n\n\n\n\nb", 300) === "a\n\nb");
    check("unit: boardText caps at maxLen", boardText("x".repeat(500), 300).length === 300);
    check("unit: boardText garbage → empty", boardText(42 as any) === "" && boardText(undefined) === "");
    check("unit: history sanitize keeps authored no-by rows (author words)", (() => {
      const h = sanitizeBoardHistory([{ text: "carved", at: 5 }, { text: "", by: "bob", at: 6 }, "garbage"], 300);
      return h.length === 1 && h[0].text === "carved" && h[0].by === "";
    })());
    check("unit: canPostBoard ladder — blank takes anyone", canPostBoard({}, "bob", 0, false) === true);
    check("unit: canPostBoard ladder — last poster rewrites own", canPostBoard({ text: "x", by: "bob" }, "bob", 0, false) === true);
    check("unit: canPostBoard ladder — other visitor fails, builder passes",
      canPostBoard({ text: "x", by: "bob" }, "carol", 0, false) === false && canPostBoard({ text: "x", by: "bob" }, "carol", 1, false) === true);
    check("unit: canPostBoard ladder — editable:true makes it public", canPostBoard({ text: "x", by: "bob" }, "carol", 0, true) === true);
    check("unit: canUnpostBoard ladder — blank fails (nothing to unpost)", canUnpostBoard({}, "bob", 2, true) === false);
    check("unit: canUnpostBoard ladder — poster clears own; visitor fails; builder passes", (() => {
      const cur = { text: "x", by: "bob" };
      return canUnpostBoard(cur, "bob", 0, false) === true && canUnpostBoard(cur, "carol", 0, false) === false && canUnpostBoard(cur, "carol", 1, false) === true;
    })());
    check("unit: describe names empty + the post action", (() => {
      const s = describeBoard({});
      return s.startsWith("board: empty") && s.includes('action:"post"');
    })());
    check("unit: describe names rev + head + kept", (() => {
      const s = describeBoard({ text: "Tonight: stew and song\nsecond line", by: "alice", rev: 3, history: [{ text: "old", by: "alice", at: 1 }] });
      return s.startsWith("board: rev 3 —") && s.includes("Tonight: stew and song") && s.includes("1 kept");
    })());
    const PRIOR = ["open", "close", "toggle", "light", "snuff", "sign", "erase", "write", "enter", "travel", "step", "through", "hop", "teleport", "blink", "reserve", "hold", "release", "mute", "quiet", "unmute", "resume", "flow", "still", "advance", "tend", "beacon", "befriend", "tame", "heel", "stay", "come", "dismiss", "free", "play", "note", "ring"];
    check("unit: BOARD action vocabulary post/unpost is DISJOINT from all 13 prior families",
      BOARD_ACTIONS.has("post") && BOARD_ACTIONS.has("unpost") && !PRIOR.includes("post") && !PRIOR.includes("unpost"));
  }

  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "board1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "board1", type: "board", data: {
    maxLen: 120, revs: 3, postAt: "a new notice goes up on the board",
  } });
  await sleep(400);
  check("builder authored spawn + board comp",
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
  carol.verb("comp", { id: "board1", type: "board", data: { maxLen: 10 } });
  await sleep(300);
  check("visitor comp authoring bounces",
    carol.msgs.some((m) => m.type === "error"),
    "no error seen for visitor comp");
  check("no visitor-authored board comp in the log",
    !logLines().some((e) => e.verb === "comp" && (e.args as any)?.type === "board" && e.actor === "carol"));

  // ---- post: visitor in reach, board BLANK --------------------------------------
  bob.walk([3, 0, 0]);                                  // 3m — inside reach 4
  await sleep(300);
  bob.verb("use", { id: "board1", action: "post", text: "Tonight: stew and song\nbring a spoon" });
  await sleep(400);
  const says1 = bdSays("board1");
  check("blank board takes the first post (rank 0, in reach)",
    says1.length === 1 && (says1[0]?.args as any)?.text === "a new notice goes up on the board",
    `${says1.length} says: ${JSON.stringify(says1.map((s) => (s.args as any)?.text))}`);
  check("say carries bd{text,by,at,rev} + cause/by provenance",
    (says1[0]?.args as any)?.bd?.by === "bob"
      && typeof (says1[0]?.args as any)?.bd?.at === "number"
      && (says1[0]?.args as any)?.bd?.rev === 1
      && typeof (says1[0]?.args as any)?.cause === "number" && (says1[0]?.args as any)?.by === "bob",
    JSON.stringify(says1[0]?.args?.bd));
  const comps1 = bdComps("board1");
  check("the post wrote ONE world-authored comp transition", comps1.length === 1,
    `${comps1.length} board comp writes`);
  {
    const d = comps1[0]?.args as any;
    check("the write carries authored shape + text/by/at/rev + empty history",
      d?.data?.maxLen === 120 && d?.data?.revs === 3 && d?.data?.text === "Tonight: stew and song\nbring a spoon"
        && d?.data?.by === "bob" && typeof d?.data?.at === "number" && d?.data?.rev === 1
        && Array.isArray(d?.data?.history) && d?.data?.history.length === 0,
      JSON.stringify(d?.data)?.slice(0, 220));
    check("the use verb logged with bob as actor (authority trace)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob"
        && (e.args as any)?.id === "board1" && (e.args as any)?.action === "post"));
  }
  check("the effect broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.bd?.by === "bob"));

  // ---- fold: late joiner reads the same notice -----------------------------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const d = snapBd(late.snapshot, "board1");
    check("late joiner folds notice + by + rev from the log",
      d?.text === "Tonight: stew and song\nbring a spoon" && d?.by === "bob" && d?.rev === 1,
      JSON.stringify(d)?.slice(0, 160));
    late.close();
  }

  // ---- own: the last poster rewrites their own notice ------------------------------
  bob.verb("use", { id: "board1", action: "post", text: "Tomorrow: market day\nbring coin" });
  await sleep(400);
  {
    const d = logBd("board1");
    check("last poster rewrites own notice at rank 0 (rev 2, superseded kept)",
      d?.text === "Tomorrow: market day\nbring coin" && d?.rev === 2 && d?.by === "bob"
        && Array.isArray(d?.history) && d?.history.length === 1 && d?.history[0]?.text === "Tonight: stew and song\nbring a spoon",
      JSON.stringify(d)?.slice(0, 240));
  }

  // ---- visitor-bounce: another visitor's post skips fail-closed ---------------------
  carol.walk([3, 0, 2]);                                // in reach
  await sleep(300);
  carol.verb("use", { id: "board1", action: "post", text: "hijack" });
  await sleep(400);
  check("another visitor's post skips (ladder boundary)",
    logBd("board1")?.by === "bob" && bdSays("board1").length === 2,
    `${bdSays("board1").length} says`);
  carol.debug("board-skip");
  await sleep(300);
  {
    const s = carol.msgs.filter((m) => m.type === "debug").at(-1);
    check("the skip names the boundary",
      JSON.stringify(s?.events ?? []).includes("board1") && JSON.stringify(s?.events ?? []).includes("builder"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- builder-rewrite: a builder rewrites anyone's notice --------------------------
  alice.walk([0, 0, 2]);
  await sleep(300);
  alice.verb("use", { id: "board1", action: "post", text: "Curfew at dusk\nby order of the reeve" });
  await sleep(400);
  {
    const d = logBd("board1");
    check("builder rewrites anyone's notice (rev 3, history 2)",
      d?.text === "Curfew at dusk\nby order of the reeve" && d?.rev === 3 && d?.by === "alice" && d?.history?.length === 2,
      JSON.stringify(d)?.slice(0, 200));
  }

  // ---- history cap: revs 3 evicts the oldest -----------------------------------------
  alice.verb("use", { id: "board1", action: "post", text: "Notice four" });
  await sleep(400);
  {
    const d = logBd("board1");
    check("revs holds AT cap 3 (newest superseded first, nothing evicted yet)",
      d?.rev === 4 && d?.history?.length === 3 && d?.history[0]?.text === "Curfew at dusk\nby order of the reeve"
        && d?.history[2]?.text === "Tonight: stew and song\nbring a spoon",
      JSON.stringify(d?.history?.map((h: any) => h.text)));
  }

  // ---- unpost: poster clears own (alice posted last) -----------------------------------
  alice.verb("use", { id: "board1", action: "unpost" });
  await sleep(400);
  {
    const d = logBd("board1");
    check("poster unposts own notice (cleared, history keeps it, rev bumps)",
      (d?.text === undefined || d?.text === "") && d?.rev === 5 && d?.history?.length === 3
        && d?.history?.[0]?.text === "Notice four",
      JSON.stringify(d)?.slice(0, 240));
    check("unpost said its default line",
      bdSays("board1").length === 5 && (bdSays("board1").at(-1)?.args as any)?.bd?.cleared === true,
      JSON.stringify((bdSays("board1").at(-1)?.args as any)?.bd));
  }

  // ---- blank again: after unpost the board takes the next first-words ------------------
  carol.verb("use", { id: "board1", action: "post", text: "The board is mine now" });
  await sleep(400);
  {
    const d = logBd("board1");
    check("after a clear the board takes the next first-words (blank prong)",
      d?.text === "The board is mine now" && d?.by === "carol" && d?.rev === 6,
      JSON.stringify(d)?.slice(0, 160));
  }

  // ---- no-op: posting the text the board already reads ----------------------------------
  {
    const before = bdSays().length;
    carol.verb("use", { id: "board1", action: "post", text: "The board is mine now" });
    await sleep(400);
    check("posting the same text mints nothing",
      bdSays().length === before,
      `${bdSays().length} vs ${before}`);
    carol.debug("board-skip");
    await sleep(300);
    const s = carol.msgs.filter((m) => m.type === "debug").at(-1);
    check("the no-op skip names the state",
      JSON.stringify(s?.events ?? []).includes("already reads"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- no-text: empty post mints nothing ------------------------------------------------
  {
    const before = bdSays().length;
    carol.verb("use", { id: "board1", action: "post", text: "   " });
    await sleep(400);
    check("empty post mints nothing",
      bdSays().length === before,
      `${bdSays().length} vs ${before}`);
  }

  // ---- ladder-skip + clamp ----------------------------------------------------------------
  {
    const before = bdSays().length;
    bob.verb("use", { id: "board1", action: "post", text: "y".repeat(500) });
    await sleep(400);
    check("visitor bob's post over carol's notice skips (ladder boundary)",
      bdSays().length === before && logBd("board1")?.by === "carol",
      `${bdSays().length} vs ${before}`);
    carol.verb("use", { id: "board1", action: "post", text: "y".repeat(500) });
    await sleep(400);
    const d = logBd("board1");
    check("carol's own over-long post clamps to maxLen 120 (rev 7)",
      d?.by === "carol" && d?.text?.length === 120 && d?.rev === 7,
      JSON.stringify(d?.text?.length));
  }

  // ---- editable: a public board ----------------------------------------------------------
  alice.verb("spawn", { id: "pub1", lib: "deco/bench.glb", pos: [20, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "pub1", type: "board", data: { editable: true, maxLen: 60 } });
  await sleep(300);
  bob.walk([21, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "pub1", action: "post", text: "found: one glove" });
  await sleep(400);
  {
    const d = logBd("pub1");
    check("editable:true — visitor posts on a blank public board",
      d?.text === "found: one glove" && d?.by === "bob",
      JSON.stringify(d)?.slice(0, 140));
  }
  carol.walk([21, 0, 2]);
  await sleep(300);
  carol.verb("use", { id: "pub1", action: "post", text: "claimed!" });
  await sleep(400);
  {
    const d = logBd("pub1");
    check("editable:true — second visitor supersedes (public board)",
      d?.text === "claimed!" && d?.by === "carol" && d?.rev === 2,
      JSON.stringify(d)?.slice(0, 140));
  }

  // ---- pre-carved: authored text has author-words status ---------------------------------
  alice.verb("spawn", { id: "plaque1", lib: "deco/bench.glb", pos: [30, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "plaque1", type: "board", data: { text: "Welcome, traveller", maxLen: 60 } });
  await sleep(300);
  bob.walk([31, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "plaque1", action: "post", text: "hijack" });
  await sleep(400);
  check("pre-carved authored notice resists a visitor's post (author words)",
    logBd("plaque1")?.text === "Welcome, traveller",
    JSON.stringify(logBd("plaque1")?.text));
  bob.verb("use", { id: "plaque1", action: "unpost" });
  await sleep(400);
  check("pre-carved unpost by visitor also bounces",
    logBd("plaque1")?.text === "Welcome, traveller" && bdSays("plaque1").length === 0,
    `${bdSays("plaque1").length} says`);

  // ---- reach: out-of-reach post mints nothing ----------------------------------------------
  {
    const before = bdSays("pub1").length;
    bob.walk([60, 0, 0]);                                // far from pub1 at [20,0,0]
    await sleep(300);
    bob.verb("use", { id: "pub1", action: "post", text: "far away" });
    await sleep(400);
    check("out-of-reach post mints nothing",
      bdSays("pub1").length === before,
      `${bdSays("pub1").length} vs ${before}`);
    bob.debug("board-skip");
    await sleep(300);
    const s = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("out-of-reach skip names the distance",
      JSON.stringify(s?.events ?? []).includes("out of reach"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- spectator: spectate legs cannot post ------------------------------------------------
  {
    const spec = new Client("watcher1");
    await spec.connect(true);
    await sleep(300);
    const before = bdSays().length;
    spec.verb("use", { id: "pub1", action: "post", text: "ghost words" });
    await sleep(400);
    check("spectator use mints nothing (shell gate)",
      bdSays().length === before,
      `${bdSays().length} vs ${before}`);
    spec.close();
  }

  // ---- pass-through: non-board actions fall through -----------------------------------------
  {
    bob.walk([21, 0, 0]);
    await sleep(300);
    const compsB = bdComps("pub1").length;
    bob.verb("use", { id: "pub1", action: "ring" });
    await sleep(400);
    check("\"ring\" passes through untouched (logged, no comp writes)",
      bdComps("pub1").length === compsB
        && logLines().some((e) => e.verb === "use" && (e.args as any)?.id === "pub1" && (e.args as any)?.action === "ring"),
      `comps ${compsB} → ${bdComps("pub1").length}`);
    const compsC = bdComps("pub1").length;
    bob.verb("use", { id: "pub1", action: "sign" });
    await sleep(400);
    check("guestbook's \"sign\" is not board vocabulary (no writes)",
      bdComps("pub1").length === compsC,
      `${bdComps("pub1").length} vs ${compsC}`);
  }

  // ---- lint: clamps ride into the engine write -----------------------------------------------
  alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [40, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "linty", type: "board", data: { maxLen: 5000, revs: 99 } });
  await sleep(300);
  bob.walk([41, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "linty", action: "post", text: "clamped cfg" });
  await sleep(400);
  {
    const d = logBd("linty");
    check("engine write carries the authored shape VERBATIM + engine keys (regions doctrine)",
      d?.maxLen === 5000 && d?.revs === 99 && d?.text === "clamped cfg" && d?.by === "bob",
      JSON.stringify(d)?.slice(0, 160));
    check("a late reader CLAMPS the carry at read time (normalizeBoard)",
      normalizeBoard(d).cfg.maxLen === 600 && normalizeBoard(d).cfg.revs === 32);
    bob.debug("board-lint");
    await sleep(300);
    const l = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the clamps left board-lint notes",
      JSON.stringify(l?.events ?? []).includes("linty") && JSON.stringify(l?.events ?? []).includes("clamped"),
      JSON.stringify(l?.events ?? []).slice(0, 200));
  }

  // ---- 8KB degrade ----------------------------------------------------------------------------
  alice.verb("spawn", { id: "fatty", lib: "deco/bench.glb", pos: [50, 0, 0], yaw: 0 });
  await sleep(300);
  const pad = "x".repeat(8100);
  alice.verb("comp", { id: "fatty", type: "board", data: { reach: 6, padding: pad } });
  await sleep(300);
  bob.walk([52, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "fatty", action: "post", text: "fat" });
  await sleep(400);
  {
    const d = logBd("fatty");
    check("8KB degrade keeps the truth (carry dropped)",
      d?.text === "fat" && d?.by === "bob" && d?.padding === undefined,
      JSON.stringify(d)?.slice(0, 160));
  }

  // ---- restart: replay mints nothing; notice + history survive folded -------------------------
  const saidAll = bdSays().length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  {
    const d1 = snapBd(probe.snapshot, "board1");
    check("restart: a fresh join folds the same notice + history",
      d1?.by === "carol" && d1?.text?.length === 120 && d1?.rev === 7 && d1?.history?.length === 3
        && d1?.history?.[0]?.text === "The board is mine now",
      JSON.stringify(d1)?.slice(0, 200));
    const d2 = snapBd(probe.snapshot, "pub1");
    check("restart: pub1 folds claimed!",
      d2?.text === "claimed!" && d2?.by === "carol",
      JSON.stringify(d2));
  }
  check("replay minted nothing",
    bdSays().length === saidAll,
    `${bdSays().length} vs ${saidAll}`);
  check("mcpl affordance read (describeBoard)",
    describeBoard(snapBd(probe.snapshot, "board1")).startsWith("board:"),
    describeBoard(snapBd(probe.snapshot, "board1")).slice(0, 80));
  check("describe on a live board names the post action",
    describeBoard(snapBd(probe.snapshot, "pub1")).includes('action:"post"'),
    describeBoard(snapBd(probe.snapshot, "pub1")));

  // ---- idempotent fold --------------------------------------------------------------------------
  {
    const a = JSON.stringify(snapBd(probe.snapshot, "board1"));
    const b = JSON.stringify(snapBd(JSON.parse(JSON.stringify(probe.snapshot)), "board1"));
    check("folded board state is stable across snapshot re-reads", a === b);
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
