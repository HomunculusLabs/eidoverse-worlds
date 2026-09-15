// Guestbook matrix — `comp {type:"guestbook"}` makes a thing REMEMBER:
// every signature is ONE world-authored comp transition write (entries
// newest-first, capped — the log is the only durable state) plus a say
// with gb provenance, and the erase boundary rides the rights ladder
// itself (self-erase rank 0; erasing ANOTHER's words is builder+).
// Self-booting: scratch sequencer (fresh WORLDS_DIR), builder authors
// the book, visitors sign it in reach. Covers § GUESTBOOK CONTRACT:
//
//   bun tools/guestbooktest.ts
//
// - authoring:  spawn + guestbook comp is builder-gated; visitor comp bounces
// - trigger:    use {action:"sign", text} writes the entry + says the line
//               with gb{who,text,at} + cause/by chain
// - fold:       entries fold from the log; late joiner reads the same book
// - trim:       at cap the oldest is evicted (entries stay exactly cap)
// - 8KB degrade: an oversized book degrades to entries:[new] + lint note
// - reach:      out-of-reach sign mints nothing (skip names distance)
// - spectator:  spectate legs cannot sign (shell gate)
// - pass-through: non-guestbook actions ("ring") fall through, no writes
// - self-erase: a visitor strikes their OWN words (rank 0, in reach)
// - moderation: a visitor erasing ANOTHER's words bounces (skip names
//               boundary); the builder erases anyone's
// - closed:     open:false makes every sign skip (closed)
// - no-op:      self-erase with no entries of yours mints nothing
// - restart:    replay mints nothing; entries survive restart
// - idempotent: folding the same comp twice is the same truth
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describeGuestbook } from "../shared/guestbook.js";

const PORT = Number(process.env.PORT ?? 8997);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-gb";
const WORLD = `gbtest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-gb-"));

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
const gbSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.gb != null && (!id || (e.args as any)?.id === id));
const gbComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "guestbook" && (!id || (e.args as any)?.id === id));
/** The folded entries of a book = the LAST guestbook comp write in the log
 *  (world- or client-authored — each write carries the whole array). */
const logEntries = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "guestbook"
    && (e.args as any)?.id === id);
  const d = (writes.at(-1)?.args as any)?.data;
  return Array.isArray(d?.entries) ? d.entries : [];
};
const snapGB = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.guestbook ?? null;
const snapEntries = (snap: any, id: string) => Array.isArray(snapGB(snap, id)?.entries) ? snapGB(snap, id).entries : [];

try {
  console.log(`\nguestbook matrix — ${URL_}  world=${WORLD}\n`);
  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");                        // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "book1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "book1", type: "guestbook", data: {
    cap: 3, reach: 6,
    signAt: "the trail register takes a line",
  } });
  await sleep(400);
  check("builder authored spawn + guestbook comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  // ---- the sign: use in reach -------------------------------------------------
  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.walk([3, 0, 0]);                                  // 3m from book1 — inside reach 6
  await sleep(300);
  bob.verb("use", { id: "book1", action: "sign", text: "first words" });
  await sleep(400);
  const says1 = gbSays("book1");
  check("in-reach sign says the authored line",
    says1.length === 1 && (says1[0]?.args as any)?.text === "the trail register takes a line",
    `${says1.length} says: ${JSON.stringify(says1.map((s) => (s.args as any)?.text))}`);
  check("say carries gb{who,text,at} + cause/by provenance",
    (says1[0]?.args as any)?.gb?.who === "bob" && (says1[0]?.args as any)?.gb?.text === "first words"
      && typeof (says1[0]?.args as any)?.gb?.at === "number"
      && typeof (says1[0]?.args as any)?.cause === "number" && (says1[0]?.args as any)?.by === "bob",
    JSON.stringify(says1[0]?.args?.gb));
  const comps1 = gbComps("book1");
  check("the sign wrote a world-authored comp transition", comps1.length === 1,
    `${comps1.length} guestbook comp writes`);
  {
    const d = (comps1[0]?.args as any)?.data;
    check("the write carries authored shape + entries[0]",
      d?.cap === 3 && d?.signAt === "the trail register takes a line"
        && Array.isArray(d?.entries) && d.entries.length === 1
        && d.entries[0]?.who === "bob" && d.entries[0]?.text === "first words",
      JSON.stringify(d));
  }
  check("the use verb logged with bob as actor (authority trace)",
    logLines().some((e) => e.verb === "use" && e.actor === "bob"
      && (e.args as any)?.id === "book1" && (e.args as any)?.action === "sign"
      && (e.args as any)?.text === "first words"));
  check("the effect broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.gb?.who === "bob"));

  // ---- fold: late joiner reads the same book ----------------------------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const e = snapEntries(late.snapshot, "book1");
    check("late joiner folds entries from the log",
      e.length === 1 && e[0]?.who === "bob" && e[0]?.text === "first words",
      JSON.stringify(e));
    late.close();
  }

  // ---- trim: cap evicts the oldest ---------------------------------------------
  bob.verb("use", { id: "book1", action: "sign", text: "second" });
  await sleep(300);
  bob.verb("use", { id: "book1", action: "sign", text: "third" });
  await sleep(300);
  bob.verb("use", { id: "book1", action: "sign", text: "fourth" });
  await sleep(400);
  const e4 = logEntries("book1");
  check("at cap 3 the book keeps exactly 3 (oldest evicted for the newest)",
    e4.length === 3 && e4[0]?.text === "fourth" && e4[1]?.text === "third" && e4[2]?.text === "second",
    JSON.stringify(e4));

  // ---- text clamp: 300 chars -> 160 ---------------------------------------------
  bob.verb("use", { id: "book1", action: "sign", text: "x".repeat(300) });
  await sleep(400);
  const e5 = logEntries("book1");
  check("inscription text clamps to 160 chars",
    e5[0]?.text?.length === 160,
    `len=${e5[0]?.text?.length}`);

  // ---- reach gate -----------------------------------------------------------------
  bob.walk([30, 0, 0]);                                    // 30m away
  await sleep(300);
  const saidNow = gbSays("book1").length, wroteNow = gbComps("book1").length;
  bob.verb("use", { id: "book1", action: "sign", text: "from afar" });
  await sleep(300);
  check("out-of-reach sign mints nothing",
    gbSays("book1").length === saidNow && gbComps("book1").length === wroteNow,
    `${gbSays("book1").length}/${gbComps("book1").length} vs ${saidNow}/${wroteNow}`);
  bob.debug("guestbook-skip");
  await sleep(300);
  const skip1 = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("the out-of-reach skip names the distance",
    JSON.stringify(skip1?.events ?? []).includes("out of reach"),
    JSON.stringify(skip1?.events ?? []).slice(0, 160));

  // ---- spectator cannot sign --------------------------------------------------------
  const eye = new Client("watcher");
  await eye.connect(true);                                 // spectate
  await sleep(200);
  eye.walk([3, 0, 0]);
  await sleep(300);
  eye.verb("use", { id: "book1", action: "sign", text: "spying" });
  await sleep(300);
  check("spectator sign bounces at the shell (no guestbook writes)",
    gbComps("book1").length === wroteNow && eye.msgs.some((m) => m.type === "error"),
    `${gbComps("book1").length} writes; err: ${eye.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "none"}`);
  eye.close();

  // ---- unknown action passes through ------------------------------------------------
  bob.walk([3, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "book1", action: "ring" });        // not guestbook vocabulary
  await sleep(300);
  check("non-guestbook action falls through to other evaluators",
    gbSays("book1").length === saidNow && gbComps("book1").length === wroteNow,
    `${gbSays("book1").length}/${gbComps("book1").length} vs ${saidNow}/${wroteNow}`);

  // ---- self-erase: your words are yours ----------------------------------------------
  bob.walk([2, 0, 0]);
  await sleep(300);
  const bobHad = logEntries("book1").filter((x) => x.who === "bob").length; // 4
  bob.verb("use", { id: "book1", action: "erase" });       // self-service
  await sleep(400);
  const afterSelf = logEntries("book1");
  check("visitor self-erase strikes ALL their own words (rank 0)",
    afterSelf.filter((x) => x.who === "bob").length === 0
      && afterSelf.length === 0,
    `bob had ${bobHad}; now ${JSON.stringify(afterSelf)}`);
  const esays = gbSays("book1").filter((s) => (s.args as any)?.gb?.erased != null);
  check("erase says its line with gb{erased,at} + cause/by",
    esays.length === 1 && (esays[0]?.args as any)?.gb?.erased?.includes("bob")
      && (esays[0]?.args as any)?.by === "bob",
    JSON.stringify(esays.map((s) => s.args?.gb)));

  // ---- no-op: erase with nothing of yours ----------------------------------------------
  const saidE = gbSays("book1").length, wroteE = gbComps("book1").length;
  bob.verb("use", { id: "book1", action: "erase" });
  await sleep(300);
  check("self-erase with no entries of yours mints nothing",
    gbSays("book1").length === saidE && gbComps("book1").length === wroteE,
    `${gbSays("book1").length}/${gbComps("book1").length} vs ${saidE}/${wroteE}`);
  bob.debug("guestbook-skip");
  await sleep(300);
  const skip2 = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("the nothing-to-erase skip names it",
    JSON.stringify(skip2?.events ?? []).includes("nothing to erase"),
    JSON.stringify(skip2?.events ?? []).slice(0, 160));

  // ---- moderation boundary: carol signs; bob (visitor) may not strike hers -------------
  const carol = new Client("carol");
  await carol.connect();
  await sleep(200);
  alice.verb("grant", { id: "carol", role: "visitor" });
  await sleep(300);
  carol.walk([3, 0, 0]);
  await sleep(300);
  carol.verb("use", { id: "book1", action: "sign", text: "carol was here" });
  await sleep(400);
  bob.walk([2, 0, 0]);                                     // bob back at the book
  await sleep(300);
  const saidM = gbSays("book1").length, wroteM = gbComps("book1").length;
  bob.verb("use", { id: "book1", action: "erase", who: "carol" });
  await sleep(300);
  check("visitor erasing ANOTHER's words mints nothing",
    gbSays("book1").length === saidM && gbComps("book1").length === wroteM,
    `${gbSays("book1").length}/${gbComps("book1").length} vs ${saidM}/${wroteM}`);
  bob.debug("guestbook-skip");
  await sleep(300);
  const skip3 = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("the moderation skip names the builder boundary",
    JSON.stringify(skip3?.events ?? []).includes("builder"),
    JSON.stringify(skip3?.events ?? []).slice(0, 200));
  check("carol's words survive the refused erase",
    logEntries("book1").some((x: any) => x.who === "carol"));

  // ---- the builder erases anyone's ------------------------------------------------------
  alice.walk([2, 0, 0]);
  await sleep(300);
  alice.verb("use", { id: "book1", action: "erase", who: "carol" });
  await sleep(400);
  check("builder erase of another's words strikes them",
    logEntries("book1").filter((x: any) => x.who === "carol").length === 0,
    JSON.stringify(logEntries("book1")));
  const esays2 = gbSays("book1").filter((s) => (s.args as any)?.gb?.erased != null);
  check("moderation erase says the line with by=<moderator>",
    esays2.length === 2 && (esays2.at(-1)?.args as any)?.by === "alice"
      && (esays2.at(-1)?.args as any)?.gb?.erased?.includes("carol"),
    JSON.stringify(esays2.map((s) => s.args?.gb)));

  // ---- closed: open:false refuses signs --------------------------------------------------
  alice.verb("comp", { id: "book1", type: "guestbook", data: { cap: 3, reach: 6, open: false } });
  await sleep(300);
  carol.verb("use", { id: "book1", action: "sign", text: "closed?" });
  await sleep(300);
  const closedSaid = gbSays("book1").length, closedWrote = gbComps("book1").length;
  check("closed book refuses signs",
    gbSays("book1").length === closedSaid && gbComps("book1").length === closedWrote
      && logEntries("book1").every((x: any) => x.text !== "closed?"),
    JSON.stringify(logEntries("book1")));
  carol.debug("guestbook-skip");
  await sleep(300);
  const skip4 = carol.msgs.filter((m) => m.type === "debug").at(-1);
  check("the closed skip says so", JSON.stringify(skip4?.events ?? []).includes("closed"),
    JSON.stringify(skip4?.events ?? []).slice(0, 160));
  alice.verb("comp", { id: "book1", type: "guestbook", data: { cap: 3, reach: 6 } }); // reopen
  await sleep(300);

  // ---- lint: clamp + note -----------------------------------------------------------------
  alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [200, 0, 0], yaw: 0 });
  await sleep(200);
  alice.verb("comp", { id: "linty", type: "guestbook", data: { cap: 999, reach: -3 } });
  await sleep(300);
  bob.walk([199, 0, 0]);                                   // 1m from linty (reach clamps to 2)
  await sleep(300);
  bob.verb("use", { id: "linty", action: "sign", text: "lint me" });
  await sleep(300);
  bob.debug("guestbook-lint");
  await sleep(300);
  const lint = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("out-of-range numbers clamp with a guestbook-lint note",
    JSON.stringify(lint?.events ?? []).includes("linty"),
    JSON.stringify(lint?.events ?? []).slice(0, 200));
  check("the linted book still functioned (clamped cfg, fold write)",
    logEntries("linty").some((x: any) => x.text === "lint me"),
    JSON.stringify(logEntries("linty")));

  // ---- 8KB degrade: oversized book forgets its oldest, never refuses -----------------------
  {
    // author the FULLEST legal book (just under the comp validator's 8KB
    // gate), then one more sign crosses it: the engine must DEGRADE the
    // write to {entries:[new]} with a lint note — never refuse the writer.
    const mk = (n: number) => Array.from({ length: n }, (_, i) =>
      ({ who: `w${i}`, text: "y".repeat(160), at: 1700000000000 + i }));
    const sizeOf = (n: number) => JSON.stringify({ cap: 64, reach: 6, entries: mk(n) }).length;
    let n = 2; while (sizeOf(n + 1) <= 8192) n++;        // fullest legal book
    alice.verb("comp", { id: "book1", type: "guestbook", data: { cap: 64, reach: 6, entries: mk(n) } });
    await sleep(300);
    check(`the fullest legal book authored (${n} entries, ${sizeOf(n)}B ≤ 8KB)`,
      logEntries("book1").length === n,
      `len=${logEntries("book1").length} want=${n}`);
    bob.walk([2, 0, 0]);                                   // bob at the book (reach 6)
    await sleep(300);
    bob.verb("use", { id: "book1", action: "sign", text: "degrade me" });
    await sleep(400);
    const d = logEntries("book1");
    check("8KB degrade keeps the book legal (newest kept, oversized history dropped)",
      d.length >= 1 && d[0]?.text === "degrade me",
      `len=${d.length}`);
    bob.debug("guestbook-lint");
    await sleep(300);
    const lint2 = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the degrade left a guestbook-lint note",
      JSON.stringify(lint2?.events ?? []).includes("book1"),
      JSON.stringify(lint2?.events ?? []).slice(0, 200));
  }

  // ---- restart: replay mints nothing; entries survive ---------------------------------------
  const saidAll = gbSays("book1").length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  const er = snapEntries(probe.snapshot, "book1");
  check("restart: a fresh join folds the same entries",
    er.length >= 1 && er[0]?.text === "degrade me",
    JSON.stringify(er));
  const saidAfter = gbSays("book1").length;
  check("replay minted nothing",
    saidAfter === saidAll,
    `${saidAfter} vs ${saidAll}`);
  check("mcpl affordance read (describeGuestbook)",
    describeGuestbook(snapGB(probe.snapshot, "book1")).includes("guestbook:"),
    describeGuestbook(snapGB(probe.snapshot, "book1")));
  check("describeGuestbook states the count",
    describeGuestbook(snapGB(probe.snapshot, "book1")).includes("1 inscription"),
    describeGuestbook(snapGB(probe.snapshot, "book1")));

  // ---- idempotent fold ----------------------------------------------------------------------
  {
    const a = JSON.stringify(snapGB(probe.snapshot, "book1"));
    const b = JSON.stringify(snapGB(JSON.parse(JSON.stringify(probe.snapshot)), "book1"));
    check("folded guestbook state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup --------------------------------------------------------------------------------
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
