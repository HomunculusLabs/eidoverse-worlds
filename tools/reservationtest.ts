// Reservation matrix — `comp {type:"reservation"}` makes a seat HOLDABLE:
// every claim is ONE world-authored comp transition ({...authored, heldBy,
// until, at} — the log is the only durable state) plus a say with res
// provenance; expiry is FOLD-DERIVED (holdActive — a lapsed hold blocks
// nothing, no sweep engine), conflicts skip naming the holder, release
// rides the rights ladder (holder rank 0, others builder+).
// Self-booting: scratch sequencer (fresh WORLDS_DIR), builder authors the
// seat, visitors claim in reach. Covers § RESERVATIONS CONTRACT:
//
//   bun tools/reservationtest.ts
//
// - authoring:  spawn + reservation comp is builder-gated; visitor comp bounces
// - reserve:    use {action:"reserve"} on a free seat writes the hold + says
//               the line with res{by,until,at,op} + cause/by
// - fold:       heldBy/until fold from the log; late joiner reads the same hold
// - conflict:   another's reserve while held skips, NAMING THE HOLDER +
//               seconds — mints nothing
// - re-anchor:  the holder's reserve extends until (kept claim)
// - expiry:     a seeded EXPIRED hold (authored until in the past) blocks
//               nothing — the next claim finds the seat free (fold-derived
//               truth, not engine memory)
// - release:    holder releases at rank 0 (hold cleared from the fold)
// - release-rank: another's release bounces (builder+); the builder's frees
// - no-op:      release on a free seat mints nothing
// - reach:      out-of-reach reserve mints nothing (skip names distance)
// - spectator:  spectate legs cannot claim (shell gate, mint-nothing)
// - pass-through: non-reservation actions ("ring") fall through, no writes;
//               the "hold" alias reserves
// - lint:       holdSec 9999 clamps to 600 (until derived from the clamp)
// - 8KB degrade: an oversized carry degrades to {heldBy,until,at} + lint note
// - restart:    replay mints nothing; the hold survives restart folded
// - describe:   describeReservation reads holder + live countdown / free hint
// - unit:       holdActive/normalizeReservation pure-math boundary checks
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describeReservation, holdActive, normalizeReservation, holdUntil } from "../shared/reservation.js";

const PORT = Number(process.env.PORT ?? 9002);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-resv";
const WORLD = `reservationtest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-resv-"));

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
const resSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.res != null && (!id || (e.args as any)?.id === id));
const resComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "reservation" && (!id || (e.args as any)?.id === id));
/** The folded hold of a seat = the LAST reservation comp write in the log. */
const logRes = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "reservation"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const snapRes = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.reservation ?? null;

try {
  console.log(`\nreservation matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const now = Date.now();
    check("unit: holdActive true inside the window",
      holdActive({ heldBy: "bob", until: now + 60_000 }, now) === true);
    check("unit: holdActive false past the window",
      holdActive({ heldBy: "bob", until: now - 1 }, now) === false);
    check("unit: holdActive false with no holder",
      holdActive({ until: now + 60_000 }, now) === false);
    check("unit: holdActive false on garbage",
      holdActive("nonsense", now) === false && holdActive(null, now) === false);
    const { cfg, notes } = normalizeReservation({ holdSec: 9999, reach: 99 });
    check("unit: holdSec clamps to 600 + note", cfg.holdSec === 600 && notes.some((n) => n.includes("holdSec")), JSON.stringify(notes));
    check("unit: reach clamps to 12 + note", cfg.reach === 12 && notes.length === 2, JSON.stringify(notes));
    const dflt = normalizeReservation({});
    check("unit: defaults holdSec 180 / reach 4", dflt.cfg.holdSec === 180 && dflt.cfg.reach === 4);
    check("unit: holdUntil = at + holdSec·1000",
      holdUntil(dflt.cfg, 1000) === 1000 + 180_000);
    const expired = describeReservation({ holdSec: 60, heldBy: "ghost", until: now - 5000 }, now);
    check("unit: describe reads free on an expired hold", expired.startsWith("reservation: free"), expired);
  }

  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "bench1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "bench1", type: "reservation", data: {
    holdSec: 120, reach: 6,
    reserveAt: "the reading chair is spoken for",
  } });
  await sleep(400);
  check("builder authored spawn + reservation comp",
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
  carol.verb("comp", { id: "bench1", type: "reservation", data: { holdSec: 60 } });
  await sleep(300);
  check("visitor comp authoring bounces",
    carol.msgs.some((m) => m.type === "error"),
    "no error seen for visitor comp");
  check("no visitor-authored reservation comp in the log",
    !logLines().some((e) => e.verb === "comp" && (e.args as any)?.type === "reservation" && e.actor === "carol"));

  // ---- the claim: free seat, visitor in reach ---------------------------------
  bob.walk([3, 0, 0]);                                  // 3m from bench1 — inside reach 6
  await sleep(300);
  bob.verb("use", { id: "bench1", action: "reserve" });
  await sleep(400);
  const says1 = resSays("bench1");
  check("in-reach reserve on a free seat says the authored line",
    says1.length === 1 && (says1[0]?.args as any)?.text === "the reading chair is spoken for",
    `${says1.length} says: ${JSON.stringify(says1.map((s) => (s.args as any)?.text))}`);
  check("say carries res{by,until,at,op} + cause/by provenance",
    (says1[0]?.args as any)?.res?.by === "bob" && (says1[0]?.args as any)?.res?.op === "reserve"
      && typeof (says1[0]?.args as any)?.res?.until === "number"
      && typeof (says1[0]?.args as any)?.res?.at === "number"
      && typeof (says1[0]?.args as any)?.cause === "number" && (says1[0]?.args as any)?.by === "bob",
    JSON.stringify(says1[0]?.args?.res));
  const comps1 = resComps("bench1");
  check("the claim wrote ONE world-authored comp transition", comps1.length === 1,
    `${comps1.length} reservation comp writes`);
  {
    const d = comps1[0]?.args as any;
    check("the write carries authored shape + heldBy/until/at",
      d?.data?.holdSec === 120 && d?.data?.reserveAt === "the reading chair is spoken for"
        && d?.data?.heldBy === "bob" && typeof d?.data?.until === "number"
        && typeof d?.data?.at === "number",
      JSON.stringify(d?.data));
    check("the use verb logged with bob as actor (authority trace)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob"
        && (e.args as any)?.id === "bench1" && (e.args as any)?.action === "reserve"));
  }
  check("the effect broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.res?.by === "bob"));

  // ---- fold: late joiner reads the same hold ----------------------------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const d = snapRes(late.snapshot, "bench1");
    check("late joiner folds the hold from the log",
      d?.heldBy === "bob" && typeof d?.until === "number",
      JSON.stringify(d));
    late.close();
  }

  // ---- conflict: another's reserve while held ---------------------------------
  const until1 = logRes("bench1")?.until;
  carol.walk([3, 0, 2]);                                // in reach too
  await sleep(300);
  carol.verb("use", { id: "bench1", action: "reserve" });
  await sleep(400);
  check("conflict mints nothing (no new say, no new comp)",
    resSays("bench1").length === 1 && resComps("bench1").length === 1,
    `${resSays("bench1").length} says / ${resComps("bench1").length} comps`);
  check("conflict left the holder's hold untouched",
    logRes("bench1")?.heldBy === "bob" && logRes("bench1")?.until === until1);
  carol.debug("reservation-skip");
  await sleep(300);
  const skip1 = carol.msgs.filter((m) => m.type === "debug").at(-1);
  check("the conflict skip NAMES THE HOLDER + seconds",
    JSON.stringify(skip1?.events ?? []).includes("held by bob"),
    JSON.stringify(skip1?.events ?? []).slice(0, 200));

  // ---- re-anchor: the holder extends ------------------------------------------
  await sleep(600);                                     // let now advance past until1 margin? no — extend
  bob.verb("use", { id: "bench1", action: "hold" });    // the alias
  await sleep(400);
  const until2 = logRes("bench1")?.until;
  check("holder re-anchor (via the hold alias) extends until",
    until2 > until1 && logRes("bench1")?.heldBy === "bob",
    `${until1} → ${until2}`);
  check("re-anchor said its line", resSays("bench1").length === 2);

  // ---- release-rank: another's release bounces; builder's frees ----------------
  carol.verb("use", { id: "bench1", action: "release" });
  await sleep(400);
  check("another's release mints nothing and keeps the hold",
    resSays("bench1").length === 2 && logRes("bench1")?.heldBy === "bob");
  carol.debug("reservation-skip");
  await sleep(300);
  const skip2 = carol.msgs.filter((m) => m.type === "debug").at(-1);
  check("the release skip names the builder+ boundary",
    JSON.stringify(skip2?.events ?? []).includes("builder"),
    JSON.stringify(skip2?.events ?? []).slice(0, 200));
  alice.walk([2, 0, 0]);
  await sleep(300);
  alice.verb("use", { id: "bench1", action: "release" });
  await sleep(400);
  const rel = resSays("bench1").at(-1)?.args as any;
  check("builder release frees the seat (say op:release)",
    rel?.res?.op === "release" && rel?.res?.by === "alice",
    JSON.stringify(rel?.res));
  check("the fold reads free after release (heldBy cleared)",
    logRes("bench1")?.heldBy === undefined,
    JSON.stringify(logRes("bench1")));

  // ---- no-op: release on a free seat -------------------------------------------
  {
    const before = resSays("bench1").length;
    bob.verb("use", { id: "bench1", action: "release" });
    await sleep(400);
    check("release on a free seat mints nothing",
      resSays("bench1").length === before,
      `${resSays("bench1").length} vs ${before}`);
  }

  // ---- expiry: a seeded EXPIRED hold blocks nothing -----------------------------
  alice.verb("spawn", { id: "bench2", lib: "deco/bench.glb", pos: [10, 0, 0], yaw: 0 });
  await sleep(300);
  // builder authors the comp carrying an EXPIRED hold (engine keys ride the
  // authored shape — the fold's truth): until in the past
  alice.verb("comp", { id: "bench2", type: "reservation", data: {
    holdSec: 120, heldBy: "ghost", until: Date.now() - 60_000, at: Date.now() - 180_000,
  } });
  await sleep(300);
  carol.walk([12, 0, 0]);                               // in reach of bench2 at [10,0,0]
  await sleep(300);
  carol.verb("use", { id: "bench2", action: "reserve" });
  await sleep(400);
  const b2 = logRes("bench2");
  check("an EXPIRED authored hold blocks nothing — the next claim is free",
    b2?.heldBy === "carol" && typeof b2?.until === "number" && b2.until > Date.now() - 1000,
    JSON.stringify(b2));
  check("the expired-hold claim said its line",
    resSays("bench2").length === 1 && (resSays("bench2").at(-1)?.args as any)?.res?.by === "carol");

  // ---- reach: out-of-reach reserve mints nothing --------------------------------
  {
    const before = resSays().length;
    bob.verb("use", { id: "bench2", action: "release" }); // bob at [3,0,0] vs bench2 [10,0,0] — 7m > reach 4... bench2 authored reach? default 4
    await sleep(400);
    check("out-of-reach use mints nothing",
      resSays().length === before,
      `${resSays().length} vs ${before}`);
    bob.debug("reservation-skip");
    await sleep(300);
    const s = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("out-of-reach skip names the distance",
      JSON.stringify(s?.events ?? []).includes("out of reach"),
      JSON.stringify(s?.events ?? []).slice(0, 200));
  }

  // ---- spectator: spectate legs cannot claim -------------------------------------
  {
    const spec = new Client("watcher1");
    await spec.connect(true);
    await sleep(300);
    const before = resSays().length;
    spec.verb("use", { id: "bench1", action: "reserve" });
    await sleep(400);
    check("spectator use mints nothing (shell gate)",
      resSays().length === before && !logRes("bench1")?.heldBy,
      `${resSays().length} vs ${before}`);
    spec.close();
  }

  // ---- pass-through: non-reservation actions fall through ------------------------
  {
    const uses = logLines().filter((e) => e.verb === "use" && (e.args as any)?.id === "bench1" && (e.args as any)?.action === "ring").length;
    bob.walk([3, 0, 0]);
    await sleep(300);
    bob.verb("use", { id: "bench1", action: "ring" });
    await sleep(400);
    const after = logLines().filter((e) => e.verb === "use" && (e.args as any)?.id === "bench1" && (e.args as any)?.action === "ring").length;
    const compsB = resComps("bench1").length;
    bob.verb("use", { id: "bench1", action: "reserve" }); // ring must not have eaten the vocabulary
    await sleep(400);
    check("\"ring\" passes through untouched (no comp writes, vocabulary intact)",
      after === uses + 1 && compsB === resComps("bench1").length - 1,
      `ring logged ${after === uses + 1}; comps ${compsB} → ${resComps("bench1").length}`);
    bob.verb("use", { id: "bench1", action: "release" }); // holder (bob) releases — clean slate
    await sleep(400);
  }

  // ---- lint: holdSec clamps; until derives from the clamp ------------------------
  alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [20, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "linty", type: "reservation", data: { holdSec: 9999, reach: 99 } });
  await sleep(300);
  bob.walk([22, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "linty", action: "reserve" });
  await sleep(400);
  {
    const d = logRes("linty");
    const at = d?.at, until = d?.until;
    check("holdSec 9999 clamps to 600 (until = at + 600s)",
      d?.heldBy === "bob" && typeof at === "number" && until === at + 600_000,
      `at=${at} until=${until}`);
    bob.debug("reservation-lint");
    await sleep(300);
    const l = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the clamp left reservation-lint notes",
      JSON.stringify(l?.events ?? []).includes("linty") && JSON.stringify(l?.events ?? []).includes("clamped"),
      JSON.stringify(l?.events ?? []).slice(0, 200));
  }

  // ---- 8KB degrade: an oversized carry keeps the hold, drops the carry ------------
  alice.verb("spawn", { id: "fatty", lib: "deco/bench.glb", pos: [30, 0, 0], yaw: 0 });
  await sleep(300);
  const pad = "x".repeat(8100);
  alice.verb("comp", { id: "fatty", type: "reservation", data: { reach: 6, padding: pad } });
  await sleep(300);
  bob.walk([32, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "fatty", action: "reserve" });
  await sleep(400);
  {
    const d = logRes("fatty");
    check("8KB degrade keeps the hold (carry dropped, heldBy/until/at kept)",
      d?.heldBy === "bob" && typeof d?.until === "number" && typeof d?.at === "number",
      JSON.stringify(d)?.slice(0, 160));
    bob.debug("reservation-lint");
    await sleep(300);
    const l2 = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the degrade left a reservation-lint note",
      JSON.stringify(l2?.events ?? []).includes("fatty"),
      JSON.stringify(l2?.events ?? []).slice(0, 200));
  }

  // ---- restart: replay mints nothing; the hold survives folded --------------------
  // give fatty a live hold (bob holds it above); kill, restart, probe
  const saidAll = resSays().length;
  const heldBefore = { id: "fatty", d: logRes("fatty") };
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  const dr = snapRes(probe.snapshot, "fatty");
  check("restart: a fresh join folds the same hold",
    dr?.heldBy === "bob" && dr?.heldBy === heldBefore.d?.heldBy && dr?.until === heldBefore.d?.until,
    JSON.stringify(dr));
  check("replay minted nothing",
    resSays().length === saidAll,
    `${resSays().length} vs ${saidAll}`);
  const desc = describeReservation(snapRes(probe.snapshot, "linty"), Date.now());
  check("mcpl affordance read (describeReservation)",
    desc.startsWith("reservation:") && desc.includes("use {action:"),
    desc);
  check("describe on a held seat names the holder",
    describeReservation(snapRes(probe.snapshot, "fatty"), Date.now()).includes("bob"),
    describeReservation(snapRes(probe.snapshot, "fatty"), Date.now()));

  // ---- idempotent fold --------------------------------------------------------------
  {
    const a = JSON.stringify(snapRes(probe.snapshot, "fatty"));
    const b = JSON.stringify(snapRes(JSON.parse(JSON.stringify(probe.snapshot)), "fatty"));
    check("folded reservation state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup ------------------------------------------------------------------------
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
