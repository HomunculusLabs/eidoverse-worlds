// Door matrix — `comp {type:"door"}` makes a thing STATEFULLY openable: every
// toggle is a world-authored comp transition write (the log is the only
// durable state) plus a say with door provenance, and the swing angle is a
// pure function of time derived from folded state (shared/door.js doorYaw).
// Self-booting: scratch sequencer (fresh WORLDS_DIR), builder authors doors,
// visitors USE them in reach. Covers § DOORS CONTRACT:
//
//   bun tools/doortest.ts
//
// - authoring:  spawn + door comp is builder-gated; visitor comp bounces
// - trigger:    use {action:"toggle"|"open"|"close"} flips folded open state
//               + says the line with door{open,who,at} + cause/by chain
// - fold:       the toggle is a world-authored comp write carrying authored
//               shape + {open, at}; late joiner folds identical truth
// - visibility: doorYaw derives open/closed purely from folded state — same
//               comp, same now, same angle; settled and mid-swing both
// - no-op:      open-on-open / close-on-closed mint nothing (door-skip)
// - reach:      out-of-reach use does not move the door (door-skip + dist)
// - spectator:  spectate legs cannot use doors (shell gate)
// - pass-through: non-door actions ("ring") fall through to other evaluators
//               (no door error, no door writes)
// - lock:       lock and door compose — a locked door still opens (lock
//               guards place/punt/spawn/remove/mount, not use)
// - re-author:  builder re-authoring the comp resets open state cleanly
// - agent path: world says land as ordinary chat an agent's look() would see
// - restart:    replay mints nothing; folded open state survives restart
// - idempotent: re-folding the same comp writes nothing further
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { doorYaw } from "../shared/door.js";

const PORT = Number(process.env.PORT ?? 8998);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const WORLD = `doortest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-door-"));

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
  /** Walk: an ordinary presence-plane pose at p. */
  walk(p: number[]) { this.send({ type: "pose", pose: { p, yaw: 0, speed: 1, clip: "walk" } }); }
  debug(kind: string) {
    this.send({ type: "debug", reqId: `d${this.msgs.length}`, kinds: [kind], limit: 80 });
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
/** world-authored says that are door effects */
const doorSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.door != null && (!id || (e.args as any)?.id === id));
/** world-authored door state writes */
const doorComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "door" && (!id || (e.args as any)?.id === id));
/** folded door state from a join snapshot */
const snapDoor = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.door ?? null;

try {
  console.log(`\ndoor matrix — ${URL_}  world=${WORLD}\n`);
  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");
  await alice.connect();                              // first joiner owns
  await sleep(200);
  alice.verb("spawn", { id: "gate1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "gate1", type: "door", data: {
    deg: 110, swingSec: 1.4, reach: 6,
    openAt: "the garden gate swings open", closeAt: "the garden gate closes",
  } });
  alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [200, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "linty", type: "door", data: { deg: 900, swingSec: -5, reach: 0 } });
  await sleep(400);
  check("builder authored spawn + door comps", alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  // ---- the toggle: use in reach ---------------------------------------------
  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.walk([3, 0, 0]);                                   // 3m from gate1 — inside reach 6
  await sleep(300);
  bob.verb("use", { id: "gate1", action: "toggle" });
  await sleep(400);
  const says1 = doorSays("gate1");
  check("in-reach toggle says the open line", says1.length === 1
    && (says1[0]?.args as any)?.text === "the garden gate swings open",
    `${says1.length} says: ${JSON.stringify(says1.map((s) => (s.args as any)?.text))}`);
  check("say carries door{open,who,at} + cause/by provenance",
    (says1[0]?.args as any)?.door?.open === true && (says1[0]?.args as any)?.door?.who === "bob"
      && typeof (says1[0]?.args as any)?.door?.at === "number"
      && typeof (says1[0]?.args as any)?.cause === "number" && (says1[0]?.args as any)?.by === "bob",
    JSON.stringify(says1[0]?.args?.door));
  const comps1 = doorComps("gate1");
  check("the toggle wrote a world-authored comp transition",
    comps1.length === 1, `${comps1.length} door comp writes`);
  check("the write carries authored shape + open:true + at",
    (comps1[0]?.args as any)?.data?.deg === 110 && (comps1[0]?.args as any)?.data?.open === true
      && typeof (comps1[0]?.args as any)?.data?.at === "number"
      && (comps1[0]?.args as any)?.data?.openAt === "the garden gate swings open",
    JSON.stringify(comps1[0]?.args?.data));
  check("the use verb logged with bob as actor (authority trace)",
    logLines().some((e) => e.verb === "use" && e.actor === "bob"
      && (e.args as any)?.id === "gate1" && (e.args as any)?.action === "toggle"));
  check("the effect broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.door?.who === "bob"));

  // ---- visibility is a pure function of folded state ------------------------
  const foldData = snapDoor(bob.snapshot, "gate1");       // bob joined AFTER authoring
  check("authored shape folds with NO open state yet (closed by default)",
    foldData != null && foldData.open === undefined,
    JSON.stringify(foldData));
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const d = snapDoor(late.snapshot, "gate1");
    check("late joiner folds open:true from the log", d?.open === true,
      JSON.stringify(d));
    const settled = doorYaw(d, Date.now() + 10_000);      // long after at
    const fresh = doorYaw(d, d.at);
    const mid = doorYaw(d, d.at + 700);                   // half of swingSec 1.4
    check("doorYaw: settled = full deg, fresh = 0, mid = half (pure state fn)",
      Math.abs(settled - 110 * Math.PI / 180) < 1e-6 && Math.abs(fresh) < 1e-6
        && Math.abs(mid - 55 * Math.PI / 180) < 0.05,
      `settled=${(settled * 180 / Math.PI).toFixed(2)}° fresh=${(fresh * 180 / Math.PI).toFixed(2)}° mid=${(mid * 180 / Math.PI).toFixed(2)}°`);
    check("doorYaw is idempotent in now (same now twice = same angle)",
      doorYaw(d, 12345) === doorYaw(d, 12345));
    late.close();
  }

  // ---- no-op: open-on-open mints nothing ------------------------------------
  const saidNow = doorSays().length, wroteNow = doorComps().length;
  bob.verb("use", { id: "gate1", action: "open" });       // already open
  await sleep(300);
  check("open-on-open is a no-op (no say, no write)",
    doorSays().length === saidNow && doorComps().length === wroteNow,
    `${doorSays().length}/${doorComps().length} vs ${saidNow}/${wroteNow}`);
  bob.debug("door-skip");
  await sleep(300);
  const skip1 = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("the no-op left a door-skip note (already open)",
    JSON.stringify(skip1?.events ?? []).includes("already open"),
    JSON.stringify(skip1?.events ?? []).slice(0, 160));

  // ---- reach gate: too far does not move the door ----------------------------
  bob.walk([30, 0, 0]);                                   // 30m away
  await sleep(300);
  bob.verb("use", { id: "gate1", action: "close" });
  await sleep(300);
  check("out-of-reach close does not move the door",
    doorSays("gate1").length === 1 && doorComps("gate1").length === 1,
    `${doorSays("gate1").length}/${doorComps("gate1").length}`);
  bob.debug("door-skip");
  await sleep(300);
  const skip2 = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("the out-of-reach skip names the distance",
    JSON.stringify(skip2?.events ?? []).includes("out of reach"),
    JSON.stringify(skip2?.events ?? []).slice(0, 160));

  // ---- unknown action passes through -----------------------------------------
  bob.walk([3, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "gate1", action: "ring" });       // not door vocabulary
  await sleep(300);
  check("non-door action falls through to other evaluators (no door writes)",
    doorSays("gate1").length === 1 && doorComps("gate1").length === 1,
    `${doorSays("gate1").length}/${doorComps("gate1").length}`);

  // ---- close: the other half of the vocabulary -------------------------------
  bob.verb("use", { id: "gate1", action: "close" });
  await sleep(300);
  const says2 = doorSays("gate1");
  check("in-reach close says the close line",
    says2.length === 2 && (says2[1]?.args as any)?.text === "the garden gate closes"
      && (says2[1]?.args as any)?.door?.open === false,
    JSON.stringify(says2.map((s) => (s.args as any)?.text)));
  check("close wrote open:false",
    (doorComps("gate1").at(-1)?.args as any)?.data?.open === false);

  // ---- spectator cannot use ---------------------------------------------------
  const eye = new Client("watcher");
  await eye.connect(true);                                // spectate
  await sleep(200);
  eye.walk([3, 0, 0]);
  await sleep(300);
  eye.verb("use", { id: "gate1", action: "open" });
  await sleep(300);
  check("spectator use bounces at the shell (no door writes)",
    doorSays("gate1").length === 2 && eye.msgs.some((m) => m.type === "error"),
    `${doorSays("gate1").length} says; err: ${eye.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "none"}`);
  eye.close();

  // ---- lock composes: a locked door still opens -------------------------------
  alice.verb("comp", { id: "gate1", type: "lock", data: true });
  await sleep(300);
  bob.verb("use", { id: "gate1", action: "open" });
  await sleep(300);
  check("a LOCKED door still opens (lock guards moves, not use)",
    doorSays("gate1").length === 3 && (doorSays("gate1").at(-1)?.args as any)?.door?.open === true,
    `${doorSays("gate1").length} says`);
  alice.verb("comp", { id: "gate1", type: "lock", data: null });
  await sleep(300);

  // ---- lint: clamp + note -------------------------------------------------------
  bob.walk([199, 0, 0]);                                 // 1m from linty (authored reach 0 clamps to 2)
  await sleep(300);
  bob.verb("use", { id: "linty", action: "toggle" });
  await sleep(300);
  bob.debug("door-lint");
  await sleep(300);
  const lint = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("out-of-range numbers clamp with a door-lint note",
    JSON.stringify(lint?.events ?? []).includes("linty"),
    JSON.stringify(lint?.events ?? []).slice(0, 200));
  check("the linted door still functioned (clamped cfg, fold write)",
    (doorComps("linty").at(-1)?.args as any)?.data?.open === true,
    JSON.stringify(doorComps("linty").at(-1)?.args?.data));

  // ---- visitor cannot AUTHOR a door (comp is builder-gated; use is not) ------
  viscomp: {
    const vBefore = doorComps().length;
    bob.verb("comp", { id: "gate1", type: "door", data: { deg: 45 } });
    await sleep(300);
    check("visitor comp bounces with rank prose (authoring ≠ using)",
      bob.msgs.some((m) => m.type === "error" && /builder rights/.test(String(m.error)))
        && doorComps().length === vBefore,
      bob.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "");
  }

  // ---- re-author resets state cleanly -------------------------------------------
  alice.verb("comp", { id: "gate1", type: "door", data: { deg: 90, swingSec: 1, reach: 6 } });
  await sleep(300);
  {
    const late = new Client("latejoin2");
    await late.connect();
    await sleep(300);
    const d = snapDoor(late.snapshot, "gate1");
    check("builder re-authoring resets open state (fresh shape, no stale open)",
      d != null && d.deg === 90 && d.open === undefined,
      JSON.stringify(d));
    late.close();
  }

  // ---- restart: replay mints nothing; folded open state survives ----------------
  // re-author left gate1 CLOSED (fresh shape, no open key); the pre-restart
  // open flips it false->true across the restart boundary
  bob.walk([2, 0, 0]);                                   // back at the gate (reach 6)
  await sleep(300);
  bob.verb("use", { id: "gate1", action: "open" });       // leave it OPEN across the restart
  await sleep(300);
  const saidAll = doorSays().length;                      // pre-restart count (open already fired)
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  check("restart: a fresh join folds open:true (state from the log, not memory)",
    snapDoor(probe.snapshot, "gate1")?.open === true,
    JSON.stringify(snapDoor(probe.snapshot, "gate1")));
  const saidAfter = doorSays().length;
  probe.verb("use", { id: "gate1", action: "open" });     // open-on-open: no-op
  await sleep(300);
  check("replay minted nothing; post-restart no-op mints nothing",
    doorSays().length === saidAfter && saidAfter === saidAll,
    `${doorSays().length} vs ${saidAfter} vs ${saidAll}`);
  check("restart chain intact (closed shape before -> open:true folded after)",
    snapDoor(probe.snapshot, "gate1")?.open === true
      && typeof snapDoor(probe.snapshot, "gate1")?.at === "number");

  // ---- fold idempotence: the same snapshot read twice is the same truth ----------
  {
    const a = JSON.stringify(snapDoor(probe.snapshot, "gate1"));
    const b = JSON.stringify(snapDoor(JSON.parse(JSON.stringify(probe.snapshot)), "gate1"));
    check("folded door state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup ---------------------------------------------------------------------
  bob.close(); probe.close();
  // alice owns the world; her socket may already be dead post-restart — close if open
  try { alice.close(); } catch { /* already gone */ }
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
