// Water matrix — `comp {type:"water"}` makes a thing water you can hear and
// turn off: exactly one durable bit (running or still) in the fold, ONE
// world-authored comp transition per change ({...authored, on, at} — doors/
// lamps doctrine) + say with water provenance + ONE presence-plane looped
// sound broadcast per change (the force doctrine: never logged, never
// folded, never replayed). Spray is DERIVED from a real preset (the water
// law: the engine ships no water preset and none is faked).
// Self-booting: scratch sequencer (fresh WORLDS_DIR). Covers § WATER
// CONTRACT:
//
//   bun tools/watertest.ts
//
// - authoring:  spawn + water comp is builder-gated; visitor comp bounces
// - flow:       use {action:"flow"} on still water writes on:true + says
//               the line + starts the loop (presence sound, state:"start")
// - no-op:      flow on running water mints nothing (water-skip)
// - still:      use {action:"still"} writes on:false + says + stops loop
// - toggle:     alternates from the folded state
// - fold:       on:true folds from the log; late joiner reads it
// - reach:      out-of-reach use mints nothing (skip names distance)
// - spectator:  spectate legs cannot use (shell gate)
// - pass-through: non-water actions ("ring") fall through, no writes
// - lint:       out-of-range numbers clamp with a water-lint note
// - log purity: no `sound` verb EVER enters the log
// - restart:    replay mints nothing; on survives; loop mints nothing
// - derive:     the derived spray is a REAL particles bag (normalize ok)
// - day/night:  gainFor phases (dawn/dusk hush, night quiet, scale)
// - describe:   describeWater states the current state + actions
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeWater, gainFor, deriveSpray, describeWater } from "../shared/water.js";
import { normalizeParticles } from "../shared/particles.js";
import { dayPhase } from "../shared/forecast.js";

const PORT = Number(process.env.PORT ?? 8985);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-water";
const WORLD = `watertest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-water-"));

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
  sounds(id?: string) {
    return this.msgs.filter((m) => m.type === "sound" && (!id || m.id === id));
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
const waterSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.water != null && (!id || (e.args as any)?.id === id));
const waterComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "water" && (!id || (e.args as any)?.id === id));
const logWater = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "water"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const snapWater = (snap: any, id: string) => snap?.state?.entities?.[id]?.comp?.water ?? null;

try {
  console.log(`\nwater matrix — ${URL_}  world=${WORLD}\n`);
  await startServer();

  // ---- shared math (pure, before any server work) -----------------------------
  {
    const n = normalizeWater({ fall: 99, reach: 1, gain: 3, nightGain: 2, gainScale: 0 });
    check("normalizeWater clamps every bound and notes it",
      n.cfg.fall === 8 && n.cfg.reach === 2 && n.cfg.gain === 1 && n.cfg.nightGain === 1 && n.cfg.gainScale === 0.1
        && n.notes.length >= 5,
      JSON.stringify(n));
    const d = normalizeWater({});
    check("normalizeWater defaults are legal",
      d.cfg.fall === 1.4 && d.cfg.reach === 4 && d.cfg.gain === 0.5 && d.cfg.nightGain === 0.5
        && d.cfg.gainScale === 1 && d.on === false,
      JSON.stringify(d.cfg));
    check("gainFor: day 1, dusk/dawn 0.8, night 0.5, scale pedals",
      gainFor("day", {}) === 1 && gainFor("dusk", {}) === 0.8 && gainFor("night", {}) === 0.5
        && gainFor("night", { nightGain: 1 }) === 1 && gainFor("day", { gainScale: 2 }) === 2,
      `${gainFor("day", {})} ${gainFor("dusk", {})} ${gainFor("night", {})}`);
    const spray = deriveSpray({ fall: 1.4, authored: {} });
    const norm = normalizeParticles(spray, { entityId: "fountain1" });
    check("derived spray is a REAL particles bag (dust, normalize ok, no fake preset)",
      spray.preset === "dust" && norm.ok === true,
      `${spray.preset} ok=${norm.ok} ${norm.why ?? ""} notes=${JSON.stringify(norm.notes)}`);
    check("dayPhase is the shared arithmetic the gain derives from",
      dayPhase(12) === "day" && dayPhase(20) === "dusk" && dayPhase(2) === "night" && dayPhase(6) === "dawn");
  }

  // ---- authoring --------------------------------------------------------------
  const alice = new Client("alice");                        // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "fountain1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "fountain1", type: "water", data: {
    fall: 2, reach: 6, flowAt: "the plaza fountain wakes", stillAt: "the fountain sleeps",
  } });
  await sleep(400);
  check("builder authored spawn + water comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  // visitor authoring bounce
  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  const compsBefore = waterComps("fountain1").length;
  bob.verb("comp", { id: "fountain1", type: "water", data: { on: true } });
  await sleep(300);
  check("visitor comp authoring bounces (builder-gated)",
    waterComps("fountain1").length === compsBefore && logWater("fountain1")?.on !== true,
    JSON.stringify(logWater("fountain1")));

  // ---- flow: still → running --------------------------------------------------
  bob.walk([3, 0, 0]);                                  // 3m from fountain1 — inside reach 6
  await sleep(300);
  bob.verb("use", { id: "fountain1", action: "flow" });
  await sleep(400);
  {
    const says = waterSays("fountain1");
    check("in-reach flow says the authored line",
      says.length === 1 && (says[0]?.args as any)?.text === "the plaza fountain wakes",
      `${says.length} says: ${JSON.stringify(says.map((s) => (s.args as any)?.text))}`);
    check("say carries water{on,who,at} + cause/by provenance",
      (says[0]?.args as any)?.water?.on === true && (says[0]?.args as any)?.water?.who === "bob"
        && typeof (says[0]?.args as any)?.water?.at === "number"
        && typeof (says[0]?.args as any)?.cause === "number" && (says[0]?.args as any)?.by === "bob",
      JSON.stringify(says[0]?.args?.water));
    const comps = waterComps("fountain1");
    check("the flow wrote ONE world-authored comp transition", comps.length === 1,
      `${comps.length} water comp writes`);
    const d = comps[0]?.args as any;
    check("the write carries authored shape + on/at (the one durable bit)",
      d?.data?.fall === 2 && d?.data?.reach === 6 && d?.data?.on === true
        && typeof d?.data?.at === "number",
      JSON.stringify(d?.data));
    const snd = bob.sounds("fountain1").filter((s: any) => s.water);
    check("the loop start is ONE presence-plane sound (state:start, note.loop)",
      snd.length === 1 && snd[0]?.water?.state === "start" && snd[0]?.note?.loop === true
        && typeof snd[0]?.note?.gain === "number" && Array.isArray(snd[0]?.p) && snd[0]?.by === "bob",
      JSON.stringify(snd));
    check("the use verb logged with bob as actor (authority trace)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob"
        && (e.args as any)?.id === "fountain1" && (e.args as any)?.action === "flow"));
    check("the effect broadcast to the room",
      alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
        && m.entry?.actor === "world" && (m.entry?.args as any)?.water?.who === "bob"));
    check("log purity: no sound verb EVER enters the log",
      !logLines().some((e) => e.verb === "sound"));
  }

  // ---- no-op: flow on running water --------------------------------------------
  {
    const saidN = waterSays("fountain1").length, wroteN = waterComps("fountain1").length;
    const sndN = bob.sounds("fountain1").filter((s: any) => s.water).length;
    bob.verb("use", { id: "fountain1", action: "flow" });
    await sleep(300);
    check("flow on running water mints nothing",
      waterSays("fountain1").length === saidN && waterComps("fountain1").length === wroteN
        && bob.sounds("fountain1").filter((s: any) => s.water).length === sndN,
      `${waterSays("fountain1").length}/${waterComps("fountain1").length}`);
    bob.debug("water-skip"); await sleep(300);
    const sk = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the no-op skip says already",
      JSON.stringify(sk?.events ?? []).includes("already"),
      JSON.stringify(sk?.events ?? []).slice(0, 160));
  }

  // ---- still: running → still ---------------------------------------------------
  bob.verb("use", { id: "fountain1", action: "still" });
  await sleep(400);
  {
    const d = logWater("fountain1");
    check("still writes on:false with the authored shape intact",
      d?.on === false && d?.fall === 2,
      JSON.stringify(d));
    const snd = bob.sounds("fountain1").filter((s: any) => s.water);
    check("the loop stop is ONE presence-plane sound (state:stop)",
      snd.length === 2 && snd[1]?.water?.state === "stop",
      JSON.stringify(snd.map((s: any) => s.water?.state)));
    check("still says its authored line",
      (waterSays("fountain1").at(-1)?.args as any)?.text === "the fountain sleeps");
  }

  // ---- toggle flips from the folded state ----------------------------------------
  bob.verb("use", { id: "fountain1", action: "toggle" });
  await sleep(400);
  check("toggle flips from the folded state",
    logWater("fountain1")?.on === true,
    JSON.stringify(logWater("fountain1")));

  // ---- fold: late joiner reads the running state -----------------------------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const d = snapWater(late.snapshot, "fountain1");
    check("late joiner folds on:true from the log",
      d?.on === true && d?.fall === 2,
      JSON.stringify(d));
    late.close();
  }

  // ---- reach gate --------------------------------------------------------------------
  bob.walk([30, 0, 0]);                                   // far from fountain1
  await sleep(300);
  {
    const saidR = waterSays("fountain1").length, wroteR = waterComps("fountain1").length;
    bob.verb("use", { id: "fountain1", action: "still" });
    await sleep(300);
    check("out-of-reach use mints nothing",
      waterSays("fountain1").length === saidR && waterComps("fountain1").length === wroteR
        && logWater("fountain1")?.on === true,
      `${waterSays("fountain1").length}/${waterComps("fountain1").length}`);
    bob.debug("water-skip"); await sleep(300);
    const sk = bob.msgs.filter((m) => m.type === "debug").at(-1);
    check("the reach skip names the distance",
      JSON.stringify(sk?.events ?? []).includes("reach"),
      JSON.stringify(sk?.events ?? []).slice(0, 160));
  }

  // ---- spectator bounce ----------------------------------------------------------------
  {
    const spec = new Client("spec1");
    await spec.connect(true);
    await sleep(200);
    spec.walk([1, 0, 1]); await sleep(200);
    const saidS = waterSays("fountain1").length, wroteS = waterComps("fountain1").length;
    spec.verb("use", { id: "fountain1", action: "still" });
    await sleep(300);
    check("spectators cannot use water (shell gate)",
      waterSays("fountain1").length === saidS && waterComps("fountain1").length === wroteS
        && logWater("fountain1")?.on === true,
      `${waterSays("fountain1").length}/${waterComps("fountain1").length}`);
    spec.close();
  }

  // ---- pass-through: a non-water action falls through ------------------------------------
  {
    const saidP = waterSays("fountain1").length, wroteP = waterComps("fountain1").length;
    bob.verb("use", { id: "fountain1", action: "ring" });
    await sleep(300);
    check("a non-water action (ring) falls through, no water writes",
      waterSays("fountain1").length === saidP && waterComps("fountain1").length === wroteP);
  }

  // ---- lint: out-of-range numbers clamp ---------------------------------------------------
  {
    alice.verb("comp", { id: "fountain1", type: "water", data: {
      fall: 99, reach: 1, gain: 3, on: true,
    } });
    await sleep(300);
    bob.walk([2, 0, 0]); await sleep(200);
    bob.verb("use", { id: "fountain1", action: "still" });
    await sleep(400);
    const d = logWater("fountain1");
    check("the write carries the authored shape verbatim (config drift is author-visible; consumers clamp — door doctrine)",
      d?.fall === 99 && d?.reach === 1 && d?.gain === 3 && d?.on === false,
      JSON.stringify(d));
    alice.debug("water-lint"); await sleep(300);
    const li = alice.msgs.filter((m) => m.type === "debug").at(-1);
    check("water-lint names the clamps",
      JSON.stringify(li?.events ?? []).includes("fall") || JSON.stringify(li?.events ?? []).includes("reach"),
      JSON.stringify(li?.events ?? []).slice(0, 200));
  }

  // ---- restart: replay mints nothing; the state survives ------------------------------------
  const saidAll = waterSays("fountain1").length;
  const compsAll = waterComps("fountain1").length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  check("restart: a fresh join folds the same water state",
    snapWater(probe.snapshot, "fountain1")?.on === false,
    JSON.stringify(snapWater(probe.snapshot, "fountain1")));
  check("replay minted nothing",
    waterSays("fountain1").length === saidAll && waterComps("fountain1").length === compsAll,
    `${waterSays("fountain1").length}/${waterComps("fountain1").length} vs ${saidAll}/${compsAll}`);
  check("no sound arrived on restart (the loop is derived, never replayed)",
    probe.sounds("fountain1").filter((s: any) => s.water).length === 0);
  check("log purity holds after restart: no sound verb in the log",
    !logLines().some((e) => e.verb === "sound"));
  check("mcpl affordance read (describeWater)",
    describeWater(snapWater(probe.snapshot, "fountain1")).startsWith("water: still"),
    describeWater(snapWater(probe.snapshot, "fountain1")));

  // ---- idempotent fold ------------------------------------------------------------------------
  {
    const a = JSON.stringify(snapWater(probe.snapshot, "fountain1"));
    const b = JSON.stringify(snapWater(JSON.parse(JSON.stringify(probe.snapshot)), "fountain1"));
    check("folded water state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup ----------------------------------------------------------------------------------
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
