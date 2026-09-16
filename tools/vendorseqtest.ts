// Vendor-instrument economy matrix — vocab-28: the vendor × sequencer
// composition (a SONGSTAND). A vendor comp whose authored data carries
// `vendored: {ware: pattern}` sells PATTERN wares: buying one decrements
// the shelf (the vendor family's own comp write + say) and installs the
// granted grid on the SAME entity's sequencer comp through the sequencer
// family's own compose (the tour doctrine — the vendor family drives the
// machine family through the machine family's arithmetic; engine keys
// stripped, playing/at preserved — phase continuity). The bridge adds NO
// verbs, NO actions, NO ranks; plain wares take the vocab-20 path
// byte-identically. Late join, restart, replay and fork fold stock,
// grant log, and playback state from the same two comps — the queue
// row's own consistency demand.
//
//   bun tools/vendorseqtest.ts
//
// Pure-math (shared/songstand.js — fails when the tier is absent):
// - patternWare:    a vendored ware's pattern sanitizes through the
//                   machine family's own grid caps (≤16 steps, ≤4 voices,
//                   verbatim cells, unresolvables→rests)
// - plain:          a ware not in the vendored map → plain grant
// - broken:         an authored pattern that sanitizes to nothing
// - caps:           >16 steps truncate; >4 voices truncate
// - malformed:      garbage vendored map never throws (total)
// - describe:       describeSongstand null for non-vendored (existing
//                   callers unchanged); vendored names the pattern ware
//                   + the buy action; the live mark when the machine
//                   carries the pattern
// End-to-end (scratch sequencer):
// - parents:        builder authors stand + vendor (pattern + plain wares)
//                   + sequencer comp
// - pattern buy:    Δ4 exactly (use + vendor comp + ONE machine comp +
//                   say); the machine's folded steps = the granted pattern
// - stock/log:      shelf decrements, grant row prepends (the parent's
//                   own tables)
// - phase:          start (the machine family's own action) then rebuy:
//                   playing/at preserved, identical grid = NO machine
//                   churn (the tour no-op doctrine)
// - late join:      fresh snapshot folds the pair; the shelf's promise
//                   (patternWare) === the machine's folded steps
// - sold out:       the parent's own gate — skip, machine unchanged
// - plain ware:     bread buys with EXACTLY vocab-20's Δ3, zero machine
//                   writes
// - hand grid:      a hand seq write after the sale takes the machine
//                   (the sale locks nothing)
// - machine-less:   a pattern ware on a stand with no sequencer comp
//                   skips fail-closed naming it (chime doctrine)
// - spectator:      a spectate leg cannot buy (the shell gate)
// - out of reach:   the arm's-reach gate skips, nothing minted
// - restart:        kill+restart: stock, grant log, and playback state
//                   fold identically; replay mints nothing
// - fold parity:    log.jsonl folded through shared/fold.js = the
//                   snapshot's pair
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { foldEntry, emptyState } from "../shared/fold.js";
import { describeVendor } from "../shared/vendor.js";
import { describeSequencer } from "../shared/sequencer.js";

// the composition tier — absent at RED (dynamic so the matrix COUNTS the
// missing tier instead of crashing on the import).
const ss: any = await import("../shared/songstand.js").then((m) => m as any).catch(() => null);
const patternWare = (v?: any, w?: any): any => (ss ? ss.patternWare(v, w) : undefined);
const describeSongstand = (v?: any, q?: any): string | null =>
  ss ? ss.describeSongstand(v, q) : null;

const PORT = Number(process.env.PORT ?? 9033);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-vs";
const WORLD = `vendorseqtest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-vs-"));

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
const snapVendor = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.vendor ?? null;
const snapSeq = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.sequencer ?? null;
const seqWrites = () => logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "sequencer").length;

const PATTERN = [[0], [2], [4], [2]];

try {
  console.log(`\nvendor-sequencer songstand matrix — ${URL_}  world=${WORLD}\n`);

  // ---- pure math: the shared tier (absent tier fails here) ---------------------
  console.log("pure math — shared/songstand.js");
  {
    const v = { wares: { bread: 2, "loop:nocturne": 2 }, vendored: { "loop:nocturne": PATTERN } };
    const pw = patternWare(v, "loop:nocturne");
    check("a vendored ware's pattern sanitizes through the machine caps",
      pw?.kind === "pattern" && JSON.stringify(pw.steps) === JSON.stringify(PATTERN),
      JSON.stringify(pw)?.slice(0, 80));
    check("a ware not in the vendored map is a PLAIN grant (vocab-20 path)",
      patternWare(v, "bread")?.kind === "plain",
      JSON.stringify(patternWare(v, "bread")));
    const over = patternWare(
      { vendored: { loop: Array.from({ length: 20 }, () => [0, 2, 4, 2, 7, 9]) } }, "loop");
    check("caps: >16 steps and >4 voices truncate (clamp-not-reject)",
      over?.kind === "pattern" && over.steps.length === 16 && over.steps[0].length === 4,
      JSON.stringify(over?.steps?.length) + "/" + JSON.stringify(over?.steps?.[0]?.length));
    check("broken: an authored pattern that sanitizes to nothing is broken (skip)",
      patternWare({ vendored: { loop: [] } }, "loop")?.kind === "broken",
      JSON.stringify(patternWare({ vendored: { loop: [] } }, "loop")));
    check("malformed vendored map never throws (total)",
      patternWare({ vendored: "garbage" }, "loop")?.kind === "plain"
        && patternWare(null, "loop")?.kind === "plain");
    check("describeSongstand is null for a non-vendored stand (existing callers unchanged)",
      describeSongstand({ wares: { bread: 2 } }, { bpm: 120 }) === null);
    const d = describeSongstand(v, { bpm: 120, steps: PATTERN });
    check("describeSongstand names the pattern ware + buy action + the live mark",
      typeof d === "string" && d.includes("loop:nocturne") && d.includes("buy") && d.includes("live"),
      String(d));
    const d2 = describeSongstand(v, { bpm: 120 });
    check("a machine without the pattern carries no live mark",
      typeof d2 === "string" && d2.includes("loop:nocturne") && !d2.includes("live"),
      String(d2));
    check("describeVendor unchanged (parent read identical)",
      describeVendor({ wares: { bread: 2 } }).includes("bread"));
    check("describeSequencer unchanged (parent read identical)",
      describeSequencer({ steps: PATTERN, playing: true, at: 1 }, 1500).includes("playing"));
  }

  // ---- end to end: the songstand on a scratch world ---------------------------
  await startServer();
  console.log("\nend to end — scratch sequencer");
  const alice = new Client("alice");                    // first joiner owns → builder
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "stand1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "stand1", type: "sequencer", data: { bpm: 120, scale: "pentatonic", root: "A3" } });
  alice.verb("comp", { id: "stand1", type: "vendor", data: {
    wares: { bread: 2, "loop:nocturne": 2 },
    vendored: { "loop:nocturne": PATTERN },
    reach: 6, buyAt: "the stand hands over its wares",
  } });
  alice.verb("spawn", { id: "stand2", lib: "deco/bench.glb", pos: [0, 0, 3], yaw: 0 });   // machine-less
  alice.verb("comp", { id: "stand2", type: "vendor", data: {
    wares: { "loop:ghost": 1 }, vendored: { "loop:ghost": PATTERN }, reach: 6,
  } });
  await sleep(400);
  check("builder authored stands + vendor + sequencer comps",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.walk([3, 0, 0]);                                  // 3m off — inside reach 6
  await sleep(300);

  // ---- the pattern buy: the parents' entries + ONE machine write ---------------
  const seqWrites0 = seqWrites();
  const before = logLines().length;
  bob.verb("use", { id: "stand1", action: "buy", item: "loop:nocturne" });
  await sleep(400);
  const delta = logLines().length - before;
  check("the pattern buy mints Δ4 exactly (use + vendor comp + ONE machine comp + say)",
    delta === 4, `Δ=${delta}`);
  check("the sale minted exactly ONE sequencer-family write",
    seqWrites() - seqWrites0 === 1, `Δseq=${seqWrites() - seqWrites0}`);
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const vc = snapVendor(late.snapshot, "stand1"), qc = snapSeq(late.snapshot, "stand1");
    check("the machine's folded steps = the granted pattern",
      JSON.stringify(qc?.steps) === JSON.stringify(PATTERN), JSON.stringify(qc)?.slice(0, 90));
    check("the machine's authored cfg rides (bpm/scale/root preserved)",
      qc?.bpm === 120 && qc?.scale === "pentatonic" && qc?.root === "A3", JSON.stringify(qc)?.slice(0, 90));
    check("playback state preserved across the sale (stopped stays stopped)",
      qc?.playing === false, JSON.stringify(qc?.playing));
    check("stock decremented + grant row prepended (the parent's own tables)",
      vc?.stock?.["loop:nocturne"] === 1 && vc?.sales?.[0]?.item === "loop:nocturne"
        && vc?.sales?.[0]?.who === "bob", JSON.stringify(vc?.stock) + " / " + JSON.stringify(vc?.sales?.[0]));
    check("the authored vendored map rides verbatim in the carry (regions doctrine)",
      JSON.stringify(vc?.vendored) === JSON.stringify({ "loop:nocturne": PATTERN }));
    check("the shelf's promise === the machine's truth (patternWare on folded bytes)",
      JSON.stringify(patternWare(vc, "loop:nocturne")?.steps) === JSON.stringify(qc?.steps));
    late.close();
  }

  // ---- phase continuity: start (the machine's own action), then rebuy ----------
  bob.verb("use", { id: "stand1", action: "start" });
  await sleep(400);
  const seqWrites1 = seqWrites();
  const atStart = (() => {
    const st: any = emptyState();
    for (const e of logLines()) foldEntry(st, e);
    return st?.entities?.["stand1"]?.comp?.sequencer?.at;
  })();
  check("start runs the sold pattern (the machine family's own action)",
    (() => {
      const st: any = emptyState();
      for (const e of logLines()) foldEntry(st, e);
      const q = st?.entities?.["stand1"]?.comp?.sequencer;
      return q?.playing === true && JSON.stringify(q?.steps) === JSON.stringify(PATTERN);
    })(), "fold after start");
  const before2 = logLines().length;
  bob.verb("use", { id: "stand1", action: "buy", item: "loop:nocturne" });
  await sleep(400);
  check("rebuy of the identical pattern = the parents' Δ3 only (NO machine churn — tour doctrine)",
    logLines().length - before2 === 3 && seqWrites() === seqWrites1,
    `Δ=${logLines().length - before2}, Δseq=${seqWrites() - seqWrites1}`);
  check("playback held through the rebuy (playing + anchor untouched — phase continuity)",
    (() => {
      const st: any = emptyState();
      for (const e of logLines()) foldEntry(st, e);
      const q = st?.entities?.["stand1"]?.comp?.sequencer;
      return q?.playing === true && q?.at === atStart;
    })(), "fold after rebuy");

  // ---- sold out: the parent's own gate ------------------------------------------
  const so = logLines().length;
  bob.verb("use", { id: "stand1", action: "buy", item: "loop:nocturne" });
  await sleep(400);
  check("sold-out pattern ware skips (the parent's gate; the use logs, nothing mints)",
    logLines().length - so === 1 && seqWrites() === seqWrites1, `Δ=${logLines().length - so}`);

  // ---- plain ware: byte-identical vocab-20 --------------------------------------
  const pw0 = logLines().length;
  bob.verb("use", { id: "stand1", action: "buy", item: "bread" });
  await sleep(400);
  check("plain ware buys with EXACTLY vocab-20's Δ3 (no machine write)",
    logLines().length - pw0 === 3 && seqWrites() === seqWrites1, `Δ=${logLines().length - pw0}`);

  // ---- the hand grid: the sale locks nothing ------------------------------------
  bob.verb("use", { id: "stand1", action: "seq", steps: [[1], [1], [1]] });
  await sleep(400);
  check("a hand seq write after the sale takes the machine (last write wins)",
    (() => {
      const st: any = emptyState();
      for (const e of logLines()) foldEntry(st, e);
      return JSON.stringify(st?.entities?.["stand1"]?.comp?.sequencer?.steps) === JSON.stringify([[1], [1], [1]]);
    })(), "fold after hand seq");

  // ---- machine-less stand: the chime doctrine -----------------------------------
  const ml = logLines().length;
  const stock2 = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "vendor"
    && (e.args as any)?.id === "stand2").length;
  bob.verb("use", { id: "stand2", action: "buy", item: "loop:ghost" });
  await sleep(400);
  check("a pattern ware on a machine-less stand skips fail-closed (nothing mints, shelf untouched)",
    logLines().length - ml === 1
      && logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "vendor"
        && (e.args as any)?.id === "stand2").length === stock2,
    `Δ=${logLines().length - ml}`);

  // ---- spectator: the parents' shell gate ----------------------------------------
  {
    const spec = new Client("spec1");
    await spec.connect(true);
    await sleep(300);
    const s0 = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "vendor").length;
    spec.verb("use", { id: "stand1", action: "buy", item: "bread" });
    await sleep(400);
    check("spectate leg cannot buy (the shell gate)",
      logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "vendor").length === s0);
    spec.close();
  }

  // ---- out of reach: the arm's-reach gate ----------------------------------------
  bob.walk([30, 0, 0]);
  await sleep(300);
  const or = logLines().length;
  const seqBefore = seqWrites();
  bob.verb("use", { id: "stand1", action: "buy", item: "bread" });
  await sleep(400);
  check("out-of-reach buy skips (nothing mints, machine + shelf unchanged)",
    logLines().length - or === 1 && seqWrites() === seqBefore, `Δ=${logLines().length - or}`);

  // ---- restart: stock, grant log, playback state consistent ----------------------
  // (the stop + start pair below mints exactly TWO world says — the replay
  // check therefore compares against saidAll + 2)
  const saidAll = logLines().filter((e) => e.verb === "say" && e.actor === "world").length;
  // restart the machine on the sold pattern's rhythm for a strong resume read
  bob.walk([3, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "stand1", action: "stop" });
  await sleep(300);
  bob.verb("use", { id: "stand1", action: "start" });
  await sleep(400);
  let prePair: any = null, preAt = 0;
  {
    const late = new Client("latejoin2");
    await late.connect();
    await sleep(300);
    prePair = { v: snapVendor(late.snapshot, "stand1"), q: snapSeq(late.snapshot, "stand1") };
    preAt = prePair.q?.at;
    late.close();
  }
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  {
    const vc = snapVendor(probe.snapshot, "stand1"), qc = snapSeq(probe.snapshot, "stand1");
    check("restart: stock + grant log fold identically",
      JSON.stringify(vc) === JSON.stringify(prePair.v),
      JSON.stringify({ stock: vc?.stock, sales: vc?.sales?.length }));
    check("restart: playback state folds identically (playing + the SAME anchor)",
      qc?.playing === true && qc?.at === preAt
        && JSON.stringify(qc?.steps) === JSON.stringify(prePair.q?.steps),
      JSON.stringify({ playing: qc?.playing, at: qc?.at, preAt }));
    check("replay minted nothing",
      logLines().filter((e) => e.verb === "say" && e.actor === "world").length === saidAll + 2,
      `says=${logLines().filter((e) => e.verb === "say" && e.actor === "world").length} vs ${saidAll}+2`);
    let st: any = emptyState();
    for (const e of logLines()) foldEntry(st, e);
    const ent = st?.entities?.["stand1"];
    check("log.jsonl folded through shared/fold.js = the snapshot's pair",
      JSON.stringify(ent?.comp?.vendor) === JSON.stringify(vc)
        && JSON.stringify(ent?.comp?.sequencer) === JSON.stringify(qc));
    check("the describe tier reads the songstand post-restart",
      (describeSongstand(vc, qc) ?? "").includes("loop:nocturne"), describeSongstand(vc, qc) ?? "null");
  }

  // ---- cleanup --------------------------------------------------------------------
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
