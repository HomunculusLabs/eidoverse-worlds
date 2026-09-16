// Book-plate bridge matrix — vocab-27: the guestbook × plate composition.
// `comp {type:"guestbook"}` (vocab-6) × `comp {type:"plate", bridge:true}`
// (vocab-10): an entity carrying BOTH becomes a bench whose SURFACE reads
// the book's newest inscription — DERIVED, never minted (the vocab-26
// composition doctrine: the parents already write the book comp + say;
// the bridge is ONE shared derivation every consumer runs on the same
// folded bytes, so late join, restart, replay and fork agree with zero
// traffic and zero verbs of the bridge's own).
//
//   bun tools/bookplatetest.ts
//
// Pure-math (shared/bookplate.js — fails when the tier is absent):
// - not-a-bridge:  plate without bridge:true reads its OWN folded text
//                  (existing behavior, byte-identical)
// - derive:        bridged + blank plate + booked newest → the newest
//                  words on the surface
// - pin:           bridged + authored/written plate text → THAT reads
//                  (the author's standing sign outranks the crowd)
// - caps:          the derived words clamp to the PLATE's maxLen (a 160c
//                  book line on a 40-max plate reads 40c)
// - blank book:    bridged + blank plate + empty book → blank surface
// - malformed:     garbage book data never throws (sanitize doctrine)
// - describe:      describeBookplate is null for non-bridges (every
//                  existing caller unchanged); bridged names the mirror
//                  + the SIGN action; pinned names the pin
// End-to-end (scratch sequencer):
// - parents:       builder authors bench + guestbook + bridged plate
// - sign:          visitor signs (rank 0 + reach — the book's own gate)
// - mints-         the sign mints EXACTLY the parents' entries
//   nothing:       (use + comp + say); ZERO plate comp writes, ever
// - fold truth:    a late joiner's snapshot pair derives the same words
//                  the browser draws (the exact derivation, exact bytes)
// - newest:        a second signature becomes the surface (post-trim
//                  entries[0]), clamped to maxLen
// - pin path:      the builder's plate write pins the surface (the
//                  plate's OWN ladder — 2 entries, the parents' own)
// - no widening:   a visitor writing the PINNED plate bounces (plate's
//                  own edit-rank — the bridge added no write surface)
// - spectator:     a spectate leg cannot sign (the shell gate)
// - restart:       kill+restart: fresh join folds the same pair, derives
//                  the same words, replay mints nothing
// - fold parity:   log.jsonl folded through shared/fold.js carries the
//                  same two comps the snapshot does
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { foldEntry, emptyState } from "../shared/fold.js";
import { describePlate } from "../shared/plate.js";
import { describeGuestbook } from "../shared/guestbook.js";

// the bridge tier — absent at RED (dynamic so the matrix COUNTS the
// missing tier instead of crashing on the import).
const bp: any = await import("../shared/bookplate.js").then((m) => m as any).catch(() => null);
const bookplateText = (p?: any, g?: any): string | undefined =>
  bp ? bp.bookplateText(p, g) : undefined;
const describeBookplate = (p?: any, g?: any): string | null =>
  bp ? bp.describeBookplate(p, g) : null;

const PORT = Number(process.env.PORT ?? 9031);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-bp";
const WORLD = `bookplatetest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-bp-"));

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
const snapPlate = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.plate ?? null;
const snapGB = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.guestbook ?? null;

try {
  console.log(`\nbook-plate bridge matrix — ${URL_}  world=${WORLD}\n`);

  // ---- pure math: the shared derivation (absent tier fails here) -------------
  console.log("pure math — shared/bookplate.js");
  {
    const own = { maxLen: 120, text: "a plain plate's words" };
    check("not a bridge: own folded text reads (existing behavior)",
      bookplateText(own, { entries: [{ who: "x", text: "book words", at: 1 }] }) === "a plain plate's words",
      JSON.stringify(bookplateText(own, { entries: [{ who: "x", text: "book words", at: 1 }] })));
    check("bridge:false is not a bridge (non-boolean treated false)",
      bookplateText({ bridge: false, maxLen: 120 }, { entries: [{ who: "x", text: "w", at: 1 }] }) === "");
    check("bridged blank plate derives the book's newest words",
      bookplateText({ bridge: true, maxLen: 120 }, { entries: [{ who: "bob", text: "first words", at: 1 }] }) === "first words",
      JSON.stringify(bookplateText({ bridge: true, maxLen: 120 }, { entries: [{ who: "bob", text: "first words", at: 1 }] })));
    check("bridged pinned plate reads the pin (author outranks crowd)",
      bookplateText({ bridge: true, maxLen: 120, text: "Sign the register, friend" },
        { entries: [{ who: "bob", text: "first words", at: 1 }] }) === "Sign the register, friend");
    check("derived words clamp to the plate's maxLen",
      bookplateText({ bridge: true, maxLen: 40 },
        { entries: [{ who: "bob", text: "y".repeat(160), at: 1 }] }) === "y".repeat(40),
      `len=${bookplateText({ bridge: true, maxLen: 40 }, { entries: [{ who: "bob", text: "y".repeat(160), at: 1 }] })?.length}`);
    check("bridged blank plate + blank book reads blank",
      bookplateText({ bridge: true, maxLen: 120 }, { entries: [] }) === "");
    check("malformed book data never throws",
      bookplateText({ bridge: true, maxLen: 120 }, { entries: "garbage" }) === ""
        && bookplateText({ bridge: true, maxLen: 120 }, null) === "");
    check("describeBookplate is null for a non-bridge (existing callers unchanged)",
      describeBookplate({ maxLen: 120, text: "words" }, { entries: [] }) === null);
    const d1 = describeBookplate({ bridge: true, maxLen: 120 }, { entries: [{ who: "bob", text: "first words", at: 1 }] });
    check("describeBookplate names the mirror + the sign action",
      typeof d1 === "string" && d1.includes("first words") && d1.includes("sign"),
      String(d1));
    const d2 = describeBookplate({ bridge: true, maxLen: 120, text: "Sign the register", by: "alice" },
      { entries: [{ who: "bob", text: "first words", at: 1 }] });
    check("describeBookplate names the pin when pinned",
      typeof d2 === "string" && d2.includes("Sign the register") && d2.includes("pinned"),
      String(d2));
    check("describePlate unchanged for a plain plate (byte-identical read)",
      describePlate({ maxLen: 120, text: "words" }).includes("words"));
    check("describeGuestbook unchanged (parent read identical)",
      describeGuestbook({ cap: 3, entries: [{ who: "bob", text: "w", at: 1 }] }).includes("1 inscription"));
  }

  // ---- end to end: the derived bridge on a scratch world ----------------------
  await startServer();
  console.log("\nend to end — scratch sequencer");
  const alice = new Client("alice");                    // first joiner owns → builder
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "bench1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "bench1", type: "guestbook", data: { cap: 3, reach: 6, signAt: "the register takes a line" } });
  alice.verb("comp", { id: "bench1", type: "plate", data: { bridge: true, maxLen: 40, h: 1.1, reach: 6 } });
  await sleep(400);
  check("builder authored bench + guestbook + bridged plate",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.walk([3, 0, 0]);                                  // 3m off — inside reach 6
  await sleep(300);

  const before = logLines().length;
  const plateWritesBefore = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "plate").length;
  bob.verb("use", { id: "bench1", action: "sign", text: "first words" });
  await sleep(400);
  const delta = logLines().length - before;
  check("the sign mints EXACTLY the parents' entries (use + comp + say)",
    delta === 3, `Δ=${delta}`);
  check("ZERO plate comp writes from a signature (the bridge mints nothing)",
    logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "plate").length === plateWritesBefore);

  // ---- fold truth: the late joiner derives what the browser draws -------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const pc = snapPlate(late.snapshot, "bench1"), gc = snapGB(late.snapshot, "bench1");
    check("late joiner folds the pair (plate blank, book newest)",
      pc?.bridge === true && !(pc as any).text
        && Array.isArray(gc?.entries) && gc.entries[0]?.text === "first words",
      JSON.stringify({ pc, gc }));
    check("the derivation on the folded bytes reads the signature",
      bookplateText(pc, gc) === "first words",
      JSON.stringify(bookplateText(pc, gc)));
    late.close();
  }

  // ---- newest wins: a second signature becomes the surface (clamped) ----------
  bob.verb("use", { id: "bench1", action: "sign", text: "A".repeat(60) });   // > maxLen 40
  await sleep(400);
  {
    const late = new Client("latejoin2");
    await late.connect();
    await sleep(300);
    const words = bookplateText(snapPlate(late.snapshot, "bench1"), snapGB(late.snapshot, "bench1"));
    check("the NEWEST signature reads, clamped to the plate's maxLen",
      words === "A".repeat(40), JSON.stringify(words)?.slice(0, 60));
    late.close();
  }

  // ---- the pin: the plate's OWN write path, the plate's OWN ladder ------------
  alice.walk([3, 0, 0]);                                // the builder walks to the bench
  await sleep(300);
  const pb = logLines().length;
  alice.verb("use", { id: "bench1", action: "write", text: "The Register of Willow Road" });
  await sleep(400);
  check("the builder's plate write pins the surface (parents' 3 entries: use+comp+say)",
    logLines().length - pb === 3, `Δ=${logLines().length - pb}`);
  {
    const late = new Client("latejoin3");
    await late.connect();
    await sleep(300);
    const words = bookplateText(snapPlate(late.snapshot, "bench1"), snapGB(late.snapshot, "bench1"));
    check("pinned surface reads the pin, not the book",
      words === "The Register of Willow Road", JSON.stringify(words));
    late.close();
  }
  // no widening: a visitor writing the PINNED plate bounces on the plate's ladder
  const pv = logLines().length;
  bob.verb("use", { id: "bench1", action: "write", text: "vandal words" });
  await sleep(400);
  check("visitor write on the pinned plate bounces (the plate's own rank rules)",
    logLines().length - pv === 1 && !logLines().some((e) => e.verb === "comp"
      && (e.args as any)?.type === "plate" && (e.args as any)?.data?.text === "vandal words"),
    `Δ=${logLines().length - pv}`);

  // ---- spectator: the parents' shell gate --------------------------------------
  {
    const spec = new Client("spec1");
    await spec.connect(true);
    await sleep(300);
    const s0 = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "guestbook").length;
    spec.verb("use", { id: "bench1", action: "sign", text: "ghost words" });
    await sleep(400);
    check("spectate leg cannot sign (the shell gate)",
      logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "guestbook").length === s0);
    spec.close();
  }

  // ---- restart: replay mints nothing; the pair derives identically ------------
  const saidAll = logLines().filter((e) => e.verb === "say" && e.actor === "world").length;
  {
    // derive from the FILE (the fold's own truth) for the before/after compare
    const st: any = emptyState();
    for (const e of logLines()) foldEntry(st, e);       // mutates, returns void
    const ent = st?.entities?.["bench1"];
    check("file fold carries the pair (fold parity: file fold = derivation source)",
      bookplateText(ent?.comp?.plate, ent?.comp?.guestbook) === "The Register of Willow Road",
      JSON.stringify(bookplateText(ent?.comp?.plate, ent?.comp?.guestbook)));
  }
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  {
    const pc = snapPlate(probe.snapshot, "bench1"), gc = snapGB(probe.snapshot, "bench1");
    check("restart: fresh join folds the same pair",
      pc?.bridge === true && pc?.text === "The Register of Willow Road"
        && Array.isArray(gc?.entries) && gc.entries[0]?.text === "A".repeat(60).slice(0, 60),
      JSON.stringify({ pc: pc && { bridge: pc.bridge, text: pc.text }, g0: gc?.entries?.[0]?.text?.length }));
    check("restart: the derivation reads the pin identically",
      bookplateText(pc, gc) === "The Register of Willow Road",
      JSON.stringify(bookplateText(pc, gc)));
    let st: any = emptyState();
    for (const e of logLines()) foldEntry(st, e);        // mutates, returns void
    const ent = st?.entities?.["bench1"];
    check("log.jsonl folded through shared/fold.js = the snapshot's pair",
      JSON.stringify(ent?.comp?.plate) === JSON.stringify(pc)
        && JSON.stringify(ent?.comp?.guestbook) === JSON.stringify(gc));
    check("replay minted nothing",
      logLines().filter((e) => e.verb === "say" && e.actor === "world").length === saidAll);
    check("the describe tier reads the pin post-restart",
      (describeBookplate(pc, gc) ?? "").includes("The Register of Willow Road"),
      describeBookplate(pc, gc) ?? "null");
  }

  // ---- cleanup ------------------------------------------------------------------
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
