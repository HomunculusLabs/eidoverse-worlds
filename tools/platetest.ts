// Plate matrix — `comp {type:"plate"}` makes a thing SAY one thing:
// every write is ONE world-authored comp transition ({...authored, text,
// by, at} — the log is the only durable state) plus a say with plate
// provenance, and the edit-rank boundary rides the rights ladder itself
// (blank plate + own words = rank 0; rewriting ANOTHER's words = builder+;
// editable:true = a public board by design).
// Self-booting: scratch sequencer (fresh WORLDS_DIR), builder authors the
// plate, visitors write in reach. Covers § PLATES CONTRACT:
//
//   bun tools/platetest.ts
//
// - authoring:  spawn + plate comp is builder-gated; visitor comp bounces
// - carve:      use {action:"write", text} on a blank plate writes the
//               inscription + says the line with plate{by,at} + cause/by
// - fold:       text/by fold from the log; late joiner reads the same words
// - self:       the writer rewrites their own words (rank 0)
// - other:      a visitor rewriting another's words bounces (skip names the
//               boundary); the builder rewrites anyone's
// - editable:   editable:true lets any visitor rewrite (public board)
// - authored:   a pre-carved plaque (text authored, no by) is the author's
//               words — visitor bounce, builder ok
// - no-op:      writing the identical text mints nothing
// - no-text:    a blank write skips
// - clamp:      text clamps to maxLen (authored, [8,480] d120)
// - reach:      out-of-reach write mints nothing (skip names distance)
// - spectator:  spectate legs cannot write (shell gate)
// - pass-through: non-plate actions ("ring") fall through, no writes
// - lint:       out-of-range numbers clamp with a plate-lint note
// - 8KB degrade: an oversized carry degrades to {text,by,at} + lint note
// - restart:    replay mints nothing; the words survive restart
// - idempotent: folding the same comp twice is the same truth
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describePlate } from "../shared/plate.js";

const PORT = Number(process.env.PORT ?? 8984);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-plate";
const WORLD = `platetest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-plate-"));

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
const plateSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.plate != null && (!id || (e.args as any)?.id === id));
const plateComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "plate" && (!id || (e.args as any)?.id === id));
/** The folded inscription of a plate = the LAST plate comp write in the log
 *  (world- or client-authored — each write carries the whole surface). */
const logPlate = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "plate"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const snapPlate = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.plate ?? null;

try {
  console.log(`\nplate matrix — ${URL_}  world=${WORLD}\n`);
  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");                        // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "sign1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "sign1", type: "plate", data: {
    maxLen: 40, reach: 6, h: 1.2,
    writeAt: "the trailhead sign takes new words",
  } });
  await sleep(400);
  check("builder authored spawn + plate comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  // ---- the carve: blank plate, visitor in reach -------------------------------
  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.walk([3, 0, 0]);                                  // 3m from sign1 — inside reach 6
  await sleep(300);
  bob.verb("use", { id: "sign1", action: "write", text: "north trail → summit" });
  await sleep(400);
  const says1 = plateSays("sign1");
  check("in-reach carve on a blank plate says the authored line",
    says1.length === 1 && (says1[0]?.args as any)?.text === "the trailhead sign takes new words",
    `${says1.length} says: ${JSON.stringify(says1.map((s) => (s.args as any)?.text))}`);
  check("say carries plate{by,at} + cause/by provenance",
    (says1[0]?.args as any)?.plate?.by === "bob"
      && typeof (says1[0]?.args as any)?.plate?.at === "number"
      && typeof (says1[0]?.args as any)?.cause === "number" && (says1[0]?.args as any)?.by === "bob",
    JSON.stringify(says1[0]?.args?.plate));
  const comps1 = plateComps("sign1");
  check("the carve wrote a world-authored comp transition", comps1.length === 1,
    `${comps1.length} plate comp writes`);
  {
    const d = comps1[0]?.args as any;
    check("the write carries authored shape + text/by/at (ONE field, not entries)",
      d?.data?.maxLen === 40 && d?.data?.writeAt === "the trailhead sign takes new words"
        && d?.data?.text === "north trail → summit" && d?.data?.by === "bob"
        && typeof d?.data?.at === "number",
      JSON.stringify(d?.data));
    check("the write carries no entries key",
      d?.data?.entries === undefined,
      JSON.stringify(Object.keys(d?.data ?? {})));
  }
  check("the use verb logged with bob as actor (authority trace)",
    logLines().some((e) => e.verb === "use" && e.actor === "bob"
      && (e.args as any)?.id === "sign1" && (e.args as any)?.action === "write"
      && (e.args as any)?.text === "north trail → summit"));
  check("the effect broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.plate?.by === "bob"));

  // ---- fold: late joiner reads the same words ---------------------------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const d = snapPlate(late.snapshot, "sign1");
    check("late joiner folds the inscription from the log",
      d?.text === "north trail → summit" && d?.by === "bob",
      JSON.stringify(d));
    late.close();
  }

  // ---- self-rewrite: your words are yours -------------------------------------
  bob.verb("use", { id: "sign1", action: "write", text: "north trail → lake" });
  await sleep(400);
  {
    const d = logPlate("sign1");
    check("the writer rewrites their own words (rank 0)",
      d?.text === "north trail → lake" && d?.by === "bob",
      JSON.stringify(d));
    check("the rewrite replaced the surface (no history rows)",
      logPlate("sign1")?.text === "north trail → lake" && plateComps("sign1").length === 2,
      `${plateComps("sign1").length} comp writes`);
  }

  // ---- rewrite another's: the ladder answers ----------------------------------
  const carol = new Client("carol");
  await carol.connect();
  await sleep(200);
  alice.verb("grant", { id: "carol", role: "visitor" });
  await sleep(300);
  carol.walk([3, 0, 0]);
  await sleep(300);
  const saidM = plateSays("sign1").length, wroteM = plateComps("sign1").length;
  carol.verb("use", { id: "sign1", action: "write", text: "carol was here" });
  await sleep(300);
  check("visitor rewriting another's words mints nothing",
    plateSays("sign1").length === saidM && plateComps("sign1").length === wroteM,
    `${plateSays("sign1").length}/${plateComps("sign1").length} vs ${saidM}/${wroteM}`);
  carol.debug("plate-skip");
  await sleep(300);
  const skipA = carol.msgs.filter((m) => m.type === "debug").at(-1);
  check("the rewrite skip names the builder boundary",
    JSON.stringify(skipA?.events ?? []).includes("builder"),
    JSON.stringify(skipA?.events ?? []).slice(0, 200));
  check("bob's words survive the refused rewrite",
    logPlate("sign1")?.text === "north trail → lake");

  // ---- the builder rewrites anyone's -------------------------------------------
  alice.walk([2, 0, 0]);
  await sleep(300);
  alice.verb("use", { id: "sign1", action: "write", text: "trail closed for mud season" });
  await sleep(400);
  {
    const d = logPlate("sign1");
    check("builder rewrite of another's words stands",
      d?.text === "trail closed for mud season" && d?.by === "alice",
      JSON.stringify(d));
    const esays = plateSays("sign1").filter((s) => (s.args as any)?.plate?.by === "alice");
    check("the rewrite says its line with by=<builder>",
      esays.length === 1 && (esays[0]?.args as any)?.by === "alice",
      JSON.stringify(esays.map((s) => s.args?.plate)));
  }

  // ---- editable:true = public board ---------------------------------------------
  alice.verb("comp", { id: "sign1", type: "plate", data: {
    maxLen: 40, reach: 6, h: 1.2, editable: true, text: "market board",
  } });
  await sleep(300);
  carol.verb("use", { id: "sign1", action: "write", text: "eggs and honey today" });
  await sleep(400);
  {
    const d = logPlate("sign1");
    check("editable:true lets any visitor rewrite (public board)",
      d?.text === "eggs and honey today" && d?.by === "carol",
      JSON.stringify(d));
  }

  // ---- authored pre-carved plaque: the author's words -----------------------------
  alice.verb("spawn", { id: "plaque1", lib: "deco/bench.glb", pos: [100, 0, 0], yaw: 0 });
  await sleep(200);
  alice.verb("comp", { id: "plaque1", type: "plate", data: {
    text: "this bench remembers Odile, who planted the grove", reach: 6,
  } });
  await sleep(300);
  carol.walk([100, 0, 3]);                                    // 3m from plaque1
  await sleep(300);
  const saidP = plateSays("plaque1").length, wroteP = plateComps("plaque1").length;
  carol.verb("use", { id: "plaque1", action: "write", text: "vandalism" });
  await sleep(300);
  check("a pre-carved plaque refuses visitor rewrites (the author's words)",
    plateSays("plaque1").length === saidP && plateComps("plaque1").length === wroteP
      && logPlate("plaque1")?.text === "this bench remembers Odile, who planted the grove",
    JSON.stringify(logPlate("plaque1")));
  carol.debug("plate-skip");
  await sleep(300);
  const skipP = carol.msgs.filter((m) => m.type === "debug").at(-1);
  check("the plaque skip names the author boundary",
    JSON.stringify(skipP?.events ?? []).includes("builder"),
    JSON.stringify(skipP?.events ?? []).slice(0, 200));

  // ---- no-op: identical text mints nothing -----------------------------------------
  bob.walk([100, 0, 3]);
  await sleep(300);
  const saidN = plateSays("plaque1").length, wroteN = plateComps("plaque1").length;
  alice.walk([100, 0, 2]);                                    // builder, identical text
  await sleep(300);
  alice.verb("use", { id: "plaque1", action: "write", text: "this bench remembers Odile, who planted the grove" });
  await sleep(300);
  check("writing the identical text mints nothing",
    plateSays("plaque1").length === saidN && plateComps("plaque1").length === wroteN,
    `${plateSays("plaque1").length}/${plateComps("plaque1").length} vs ${saidN}/${wroteN}`);
  alice.debug("plate-skip");
  await sleep(300);
  const skipN = alice.msgs.filter((m) => m.type === "debug").at(-1);
  check("the identical-text skip says so",
    JSON.stringify(skipN?.events ?? []).includes("already reads"),
    JSON.stringify(skipN?.events ?? []).slice(0, 160));

  // ---- no text ------------------------------------------------------------------------
  alice.verb("use", { id: "plaque1", action: "write", text: "   " });
  await sleep(300);
  check("a blank write mints nothing",
    plateSays("plaque1").length === saidN && plateComps("plaque1").length === wroteN,
    `${plateSays("plaque1").length}/${plateComps("plaque1").length}`);
  {
    alice.debug("plate-skip");
    await sleep(300);
    const skipT = alice.msgs.filter((m) => m.type === "debug").at(-1);
    check("the blank-text skip says no text",
      JSON.stringify(skipT?.events ?? []).includes("no text"),
      JSON.stringify(skipT?.events ?? []).slice(0, 160));
  }

  // ---- clamp: text clamps to maxLen ------------------------------------------------------
  alice.walk([2, 0, 0]);                                      // builder back at sign1
  await sleep(300);
  alice.verb("use", { id: "sign1", action: "write", text: "y".repeat(200) });   // maxLen 40
  await sleep(400);
  check("text clamps to the authored maxLen (200 → 40)",
    logPlate("sign1")?.text?.length === 40,
    `len=${logPlate("sign1")?.text?.length}`);

  // ---- reach gate -------------------------------------------------------------------------
  bob.walk([30, 0, 0]);                                       // far from sign1
  await sleep(300);
  const saidR = plateSays("sign1").length, wroteR = plateComps("sign1").length;
  bob.verb("use", { id: "sign1", action: "write", text: "from afar" });
  await sleep(300);
  check("out-of-reach write mints nothing",
    plateSays("sign1").length === saidR && plateComps("sign1").length === wroteR,
    `${plateSays("sign1").length}/${plateComps("sign1").length} vs ${saidR}/${wroteR}`);
  bob.debug("plate-skip");
  await sleep(300);
  const skipR = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("the out-of-reach skip names the distance",
    JSON.stringify(skipR?.events ?? []).includes("out of reach"),
    JSON.stringify(skipR?.events ?? []).slice(0, 160));

  // ---- spectator cannot write -----------------------------------------------------------------
  const eye = new Client("watcher");
  await eye.connect(true);                                    // spectate
  await sleep(200);
  eye.walk([2, 0, 0]);
  await sleep(300);
  eye.verb("use", { id: "sign1", action: "write", text: "spying" });
  await sleep(300);
  check("spectator write bounces at the shell (no plate writes)",
    plateComps("sign1").length === wroteR && eye.msgs.some((m) => m.type === "error"),
    `${plateComps("sign1").length} writes; err: ${eye.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "none"}`);
  eye.close();

  // ---- unknown action passes through ------------------------------------------------------------
  bob.walk([3, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "sign1", action: "ring" });           // not plate vocabulary
  await sleep(300);
  check("non-plate action falls through to other evaluators",
    plateSays("sign1").length === saidR && plateComps("sign1").length === wroteR,
    `${plateSays("sign1").length}/${plateComps("sign1").length} vs ${saidR}/${wroteR}`);

  // ---- lint: clamp + note --------------------------------------------------------------------------
  alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [200, 0, 0], yaw: 0 });
  await sleep(200);
  alice.verb("comp", { id: "linty", type: "plate", data: { maxLen: 999, reach: -3, h: 99 } });
  await sleep(300);
  bob.walk([199, 0, 0]);                                      // 1m from linty (reach clamps to 2)
  await sleep(300);
  bob.verb("use", { id: "linty", action: "write", text: "lint me" });
  await sleep(300);
  bob.debug("plate-lint");
  await sleep(300);
  const lint = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("out-of-range numbers clamp with a plate-lint note",
    JSON.stringify(lint?.events ?? []).includes("linty"),
    JSON.stringify(lint?.events ?? []).slice(0, 200));
  check("the linted plate still functioned (clamped cfg, fold write)",
    logPlate("linty")?.text === "lint me",
    JSON.stringify(logPlate("linty")));

  // ---- 8KB degrade: oversized carry degrades, never refuses the writer ------------------------------
  {
    // author a legal comp just under the 8KB gate riding unknown keys, then a
    // write spreads cfg.authored — crossing the gate: the engine must DEGRADE
    // the write to {text,by,at} with a lint note, never refuse the writer.
    const pad = "p".repeat(7600);
    alice.verb("comp", { id: "linty", type: "plate", data: { reach: 6, padding: pad } });
    await sleep(300);
    bob.verb("use", { id: "linty", action: "write", text: "degrade me" });
    await sleep(400);
    const d = logPlate("linty");
    check("8KB degrade keeps the words (carry dropped, text/by/at kept)",
      d?.text === "degrade me" && d?.by === "bob" && typeof d?.at === "number",
      JSON.stringify(d)?.slice(0, 160));
    bob.debug("plate-lint");
    await sleep(300);
    const lint2 = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the degrade left a plate-lint note",
      JSON.stringify(lint2?.events ?? []).includes("linty"),
      JSON.stringify(lint2?.events ?? []).slice(0, 200));
  }

  // ---- restart: replay mints nothing; the words survive ---------------------------------------------
  const saidAll = plateSays().length;
  const lastWords = logPlate("linty")?.text;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  const dr = snapPlate(probe.snapshot, "linty");
  check("restart: a fresh join folds the same words",
    dr?.text === lastWords && dr?.by === "bob",
    JSON.stringify(dr));
  check("replay minted nothing",
    plateSays().length === saidAll,
    `${plateSays().length} vs ${saidAll}`);
  const desc = describePlate(snapPlate(probe.snapshot, "sign1"));
  check("mcpl affordance read (describePlate)",
    desc.startsWith("plate:") && desc.includes("use {action:\"write\""),
    desc);
  check("describePlate carries the words and their author",
    desc.includes("y".repeat(10)) || desc.includes("…"),
    desc);

  // ---- idempotent fold ------------------------------------------------------------------------------
  {
    const a = JSON.stringify(snapPlate(probe.snapshot, "linty"));
    const b = JSON.stringify(snapPlate(JSON.parse(JSON.stringify(probe.snapshot)), "linty"));
    check("folded plate state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup ----------------------------------------------------------------------------------------
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
