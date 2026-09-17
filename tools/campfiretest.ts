// Campfire matrix — `comp {type:"campfire"}` makes a multi-entity hearth:
// light it once and TIME burns it down (kindling → blaze → embers → out,
// the growth family's own stageAt over a reverse ladder) while the fire
// WARMs every companion seat, lights its own hearth, and emits fire
// particles — all through the lamp + particles families' own doors. Covers
// § CAMPFIRES CONTRACT (vocab-31):
//
//   bun tools/campfiretest.ts
//
// - unit:       normalizeCampfire clamps/caps/drops/engine-strip;
//               fireAt/fireIndex ladder + out-crossing; fireLevel ramp;
//               particlesFor presets; hearth/seat args; describeCampfire
// - authoring:  spawn + campfire comp is builder-gated; visitor bounces
// - kindle:     rank 0 + arm's reach; ONE comp write {lit:true, at, by,
//               tLit} + say cf{op,who,at}/cause/by; hearth light + mount;
//               seat lamp comps lit + companions; particles "fire"
// - pass-through: use {action:"ring"} logs, mints nothing
// - douse:      ONE comp write {lit:false} + say; teardown (hearth remove,
//               seats un-warmed + companions removed, particles null)
// - kindle-on-burning / stoke-on-cold / douse-on-cold no-ops mint nothing
// - stoke:      adds fuel (anchor toward now); re-kindling stoke from
//               embers lands mid-blaze
// - burnout:    the sweep writes the death {lit:false} + bell-grammar say;
//               teardown; kindle-after-out is a FRESH fire
// - abuse:      unknown-position skip; out-of-reach skip; spectator bounce;
//               seat warmed by another fire never fought; missing seat skips
// - restart:    burning fire resumes (hearth standing, seats warm);
//               replay mints nothing; cold fold mints nothing
// - late join:  folds hearth light + warmed seats + particles + comp
// - mcpl:       describeCampfire reads folded truth (live derivation)
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  normalizeCampfire, fireAt, fireIndex, fireLevel, particlesFor,
  hearthLightArgs, warmSeatData, describeCampfire,
  FIRE_DARK, FIRE_KINDLING, FIRE_BLAZE, FIRE_EMBERS, FIRE_OUT,
  CAMPFIRE_ENGINE_KEYS, campfireLadder,
} from "../shared/campfire.js";

const PORT = Number(process.env.PORT ?? 9031);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-fire";
const WORLD = `camptest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-camp-"));

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
  // one paced retry — an intermittent spawn-exec failure (EAGAIN under
  // machine load: child stays exit=null, zero output, port never opens)
  // is machine noise, not a server defect; the error is captured and
  // surfaced if BOTH attempts fail (the vocab-30 chassis).
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
      // a respawn that dies instantly shows its stderr in the throw
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
const cfSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.cf != null && (!id || (e.args as any)?.id === id));
const lastFireComp = (): any => logLines()
  .filter((e) => e.verb === "comp" && (e.args as any)?.type === "campfire" && e.actor === "world")
  .at(-1)?.args;
const campComps = () => logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "campfire" && e.actor === "world");

// a fast test ladder: 3s kindling / 6s blaze / 6s embers (burn 15s); stoke adds 3s
const FAST = { burnSec: 15, blazeSec: 6, embersSec: 6, stokeSec: 3 };

try {
  console.log(`\ncampfire matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    // grow probe: named stages (40+40) overrun the authored total (30) —
    // the total GROWS to 140, never silently shrinks a named stage
    const { cfg, notes } = normalizeCampfire({
      burnSec: 30, blazeSec: 40, embersSec: 40, reach: 99, seats: ["s1", "s1", 42, "s2"],
      warmR: 99, warmIntensity: 9999,
      hearthAnchor: [99, 0, 0], warmColor: "zzz", particles: { count: 9999, speed: -5 },
    });
    check("unit: burnSec grows past named stages; reach/anchors/colors clamp; seats dedupe+drop",
      cfg.burnSec === 140 && cfg.reach === 12 && cfg.hearthAnchor[0] === 8
        && cfg.warmIntensity === 60 && JSON.stringify(cfg.seats) === JSON.stringify(["s1", "s2"]),
      JSON.stringify({ burn: cfg.burnSec, reach: cfg.reach, seats: cfg.seats }));
    check("unit: clamps are linted by name",
      notes.some((x) => x.includes("reach")) && notes.some((x) => x.includes("burnSec grew"))
        && notes.some((x) => x.includes("42")) && notes.some((x) => x.includes("duplicated")),
      JSON.stringify(notes).slice(0, 240));
    check("unit: the authored carry strips engine keys",
      !CAMPFIRE_ENGINE_KEYS.some((k) => k in cfg.authored), JSON.stringify(cfg.authored).slice(0, 120));
    check("unit: particles override clamps into the declaration",
      cfg.particles!.count === 600 && cfg.particles!.speed === 0.05, JSON.stringify(cfg.particles));
    const { cfg: dflt } = normalizeCampfire({});
    check("unit: defaults (1800/900/300/600, empty seats, built-in particles)",
      dflt.burnSec === 1800 && dflt.blazeSec === 900 && dflt.embersSec === 300
        && dflt.stokeSec === 600 && dflt.seats.length === 0 && dflt.particles == null,
      JSON.stringify({ b: dflt.burnSec, z: dflt.blazeSec, e: dflt.embersSec, s: dflt.stokeSec }));
    check("unit: the ladder IS a growth ladder [kindling, blaze]",
      JSON.stringify(campfireLadder(dflt).stages.map((s: any) => s.name)) === JSON.stringify(["kindling", "blaze"]));
    const at = Date.now();
    const c2 = normalizeCampfire(FAST).cfg;
    check("unit: fireAt walks kindling → blaze → embers → out",
      fireAt(c2, at, at + 1000) === FIRE_KINDLING && fireAt(c2, at, at + 4000) === FIRE_BLAZE
        && fireAt(c2, at, at + 9500) === FIRE_EMBERS && fireAt(c2, at, at + 15000) === FIRE_OUT,
      `${fireAt(c2, at, at + 1000)}/${fireAt(c2, at, at + 4000)}/${fireAt(c2, at, at + 9500)}/${fireAt(c2, at, at + 15000)}`);
    check("unit: fireIndex: dark when not lit; OUT on garbage anchor",
      fireIndex({ lit: false }, at) === FIRE_DARK && fireIndex({ lit: true }, at) === FIRE_OUT
        && fireIndex({ lit: true, at: at - 4000, ...FAST }, at) === FIRE_BLAZE,
      `${fireIndex({ lit: false }, at)}/${fireIndex({ lit: true }, at)}`);
    check("unit: fireLevel ramps kindling (smoothstep), holds 1 blaze, 0.35 embers, 0 out",
      fireLevel(c2, at, at + 1500) > 0.2 && fireLevel(c2, at, at + 1500) < 1
        && fireLevel(c2, at, at + 5000) === 1 && fireLevel(c2, at, at + 9500) === 0.35
        && fireLevel(c2, at, at + 16000) === 0,
      `${fireLevel(c2, at, at + 1500).toFixed(2)}/${fireLevel(c2, at, at + 5000)}`);
    check("unit: particlesFor: fire while burning, embers shrunk, null when out",
      particlesFor(c2, FIRE_BLAZE)!.preset === "fire" && particlesFor(c2, FIRE_EMBERS)!.preset === "embers"
        && particlesFor(c2, FIRE_EMBERS)!.count === 28 && particlesFor(c2, FIRE_OUT) == null,
      JSON.stringify(particlesFor(c2, FIRE_EMBERS)));
    const hl = hearthLightArgs(c2, [1, 0, 1], Math.PI / 2, 1);
    check("unit: hearth args carry the rotated anchor + day:false (fires burn at noon)",
      JSON.stringify(hl.pos) === JSON.stringify([1, 0.55, 1]) && hl.day === false && hl.intensity === 26,
      JSON.stringify(hl));
    const ws = warmSeatData(c2, 0.5, "fire1");
    check("unit: warm seat data carries via ownership + level-scaled intensity",
      ws.via === "fire1" && ws.intensity === 5 && ws.on === true && ws.day === false, JSON.stringify(ws));
    const desc = describeCampfire({ lit: true, at: Date.now() - 4000, ...FAST });
    check("unit: describeCampfire names the live state + seconds left",
      desc.startsWith("campfire: blaze (") && desc.includes("stoke"), desc);
    check("unit: describeCampfire cold/out read kindle",
      describeCampfire({}).includes("cold") && describeCampfire({ lit: true, at: 1 }).includes("burnt out"),
      `${describeCampfire({})} | ${describeCampfire({ lit: true, at: 1 })}`);
  }

  await startServer();

  // ---- authoring ---------------------------------------------------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "fire1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("spawn", { id: "bench1", lib: "deco/bench.glb", pos: [2, 0, 0], yaw: 0 });
  alice.verb("spawn", { id: "bench2", lib: "deco/bench.glb", pos: [-2, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "fire1", type: "campfire", data: { ...FAST, seats: ["bench1", "bench2"] } });
  await sleep(400);
  check("builder authored the campfire comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.verb("comp", { id: "fire1", type: "campfire", data: { ...FAST } });
  await sleep(300);
  check("visitor campfire comp authoring bounces",
    logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "campfire" && e.actor === "bob").length === 0,
    "visitor comp landed");

  // ---- kindle: the rank-0 hand lights the hearth --------------------------------
  bob.walk([0, 0, 1]);
  await sleep(300);
  const tKindle = Date.now();
  bob.verb("use", { id: "fire1", action: "kindle" });
  await sleep(600);
  {
    const says = cfSays("fire1");
    check("kindle says one line with cf{op,who,at}/cause/by",
      says.length === 1 && (says[0].args as any)?.cf?.op === "kindle"
        && (says[0].args as any)?.by === "bob" && (says[0].args as any)?.cause != null,
      JSON.stringify(says.map((s) => s.args)));
    const f = lastFireComp();
    check("the engine wrote ONE campfire comp {...authored, lit:true, at, by, tLit}",
      f != null && f?.data?.lit === true && typeof f?.data?.at === "number"
        && f?.data?.by === "bob" && JSON.stringify(f?.data?.seats) === JSON.stringify(["bench1", "bench2"]),
      JSON.stringify(f?.data && { lit: f.data.lit, by: f.data.by, seats: f.data.seats }));
    const lights = logLines().filter((e) => e.verb === "light" && (e.args as any)?.id === "fire1·lamp");
    const mounts = logLines().filter((e) => e.verb === "mount" && (e.args as any)?.id === "fire1·lamp");
    check("kindle ignited the hearth companion (light + carry mount)",
      lights.length >= 1 && (lights[0].args as any)?.day === false && mounts.length >= 1 && mounts.at(-1)!.args.to === "fire1",
      JSON.stringify({ lights: lights.length, mounts: mounts.length }));
    const b1 = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "bench1"
      && (e.args as any)?.type === "lamp" && e.actor === "world").at(-1)?.args as any;
    check("the seats warmed: lamp comps {on:true, via:fire1, day:false}",
      b1?.data?.on === true && b1?.data?.via === "fire1" && b1?.data?.day === false,
      JSON.stringify(b1?.data));
    const seatLights = logLines().filter((e) => e.verb === "light" && (e.args as any)?.id === "bench1·lamp");
    check("seat companions ignited (lamp family's own doors)",
      seatLights.length >= 1, `${seatLights.length} seat lights`);
    const p = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "fire1"
      && (e.args as any)?.type === "particles").at(-1)?.args as any;
    check("the fire declares particles preset fire",
      p?.data?.preset === "fire", JSON.stringify(p?.data));
  }

  // ---- pass-through --------------------------------------------------------------
  {
    const before = cfSays().length;
    bob.verb("use", { id: "fire1", action: "ring" });
    await sleep(400);
    check("use {action:\"ring\"} passes through (logged, mints nothing)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob" && (e.args as any)?.id === "fire1"
        && (e.args as any)?.action === "ring") && cfSays().length === before,
      `${cfSays().length} vs ${before}`);
  }

  // ---- no-ops --------------------------------------------------------------------
  {
    const compsBefore = campComps().length;
    bob.verb("use", { id: "fire1", action: "kindle" });
    await sleep(400);
    check("kindle on a burning fire mints nothing",
      campComps().length === compsBefore && cfSays().length === 1, `${campComps().length} vs ${compsBefore}`);
  }

  // ---- abuse first (they mint nothing, and they age the fire past stokeSec):
  //      unknown position, out-of-reach, spectator ------------------------------
  {
    const eve = new Client("eve");
    await eve.connect();
    await sleep(200);
    const before = cfSays().length;
    eve.verb("use", { id: "fire1", action: "douse" });
    await sleep(400);
    check("an unknown-position use mints nothing (skip)",
      cfSays().length === before, `${cfSays().length} vs ${before}`);
    eve.close();
  }
  {
    bob.walk([40, 0, 40]);
    await sleep(300);
    const compsBefore = campComps().length;
    bob.verb("use", { id: "fire1", action: "douse" });
    await sleep(400);
    check("an out-of-reach douse mints nothing",
      campComps().length === compsBefore, `${campComps().length} vs ${compsBefore}`);
    bob.walk([0, 0, 1]);
    await sleep(300);
  }
  {
    const spec = new Client("spec1");
    await spec.connect(true);
    await sleep(200);
    spec.walk([0, 0, 1]);
    await sleep(300);
    const before = cfSays().length;
    spec.verb("use", { id: "fire1", action: "douse" });
    await sleep(400);
    check("a spectator's use mints nothing",
      cfSays().length === before, `${cfSays().length} vs ${before}`);
    spec.close();
  }

  // ---- stoke (elapsed now > stokeSec, state blaze): fuel added -------------------
  {
    const f0 = lastFireComp();
    const at0 = f0?.data?.at as number;
    bob.verb("use", { id: "fire1", action: "stoke" });
    await sleep(400);
    const f1 = lastFireComp();
    const at1 = f1?.data?.at as number;
    check("stoke adds fuel: the anchor moves toward now by stokeSec (clamped)",
      at1 > at0 && at1 <= tKindle + 5000 && Math.abs((at1 - at0) - 3000) < 1200,
      `at ${at0} -> ${at1} (Δ${at1 - at0}ms, stokeSec 3s)`);
    check("stoke says its line with cf{op:\"stoke\"}",
      cfSays("fire1").some((e) => (e.args as any)?.cf?.op === "stoke"));
  }

  // ---- the burn-down: blaze → embers → out (FAST ladder: 3/6/6) --------------------
  // last stoke anchored ~now-5s ⇒ kindling done, blaze from ~tKindle+? —
  // simpler: wait out the whole ladder and watch the death + teardown.
  {
    // ensure we're mid-blaze, then wait past embers into out
    await sleep(9000);                                    // deep embers
    const eLights = logLines().filter((e) => e.verb === "light" && (e.args as any)?.id === "fire1·lamp");
    const emberArgs = eLights.at(-1)?.args as any;
    check("embers re-wrote the hearth dimmed (intensity at 35%)",
      emberArgs != null && emberArgs.intensity === Math.round(26 * 0.35 * 100) / 100,
      JSON.stringify(emberArgs && { i: emberArgs.intensity }));
    const eP = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "fire1"
      && (e.args as any)?.type === "particles").at(-1)?.args as any;
    check("embers switched the particles preset (quarter count, slower)",
      eP?.data?.preset === "embers" && eP?.data?.count === 28, JSON.stringify(eP?.data));
    await sleep(7000);                                    // past out
    const death = cfSays("fire1").find((e) => (e.args as any)?.cf?.out === true);
    check("the sweep wrote the death (bell-grammar say, no cause/by)",
      death != null && death.args.cause == null, JSON.stringify(death?.args));
    const f = lastFireComp();
    check("the death comp reads {lit:false} (fold truth, restart-safe)",
      f?.data?.lit === false, JSON.stringify(f?.data && { lit: f.data.lit }));
    const rm = logLines().filter((e) => e.verb === "remove" && (e.args as any)?.id === "fire1·lamp");
    check("teardown removed the hearth companion",
      rm.length >= 1, `${rm.length} removes`);
    const b1 = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "bench1"
      && (e.args as any)?.type === "lamp").at(-1)?.args as any;
    check("the seats were un-warmed (on:false, via preserved)",
      b1?.data?.on === false && b1?.data?.via === "fire1", JSON.stringify(b1?.data));
    const p = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "fire1"
      && (e.args as any)?.type === "particles").at(-1)?.args as any;
    check("the particles declaration was nulled",
      p?.data == null, JSON.stringify(p));
  }

  // ---- fresh kindle after out ------------------------------------------------------
  {
    bob.verb("use", { id: "fire1", action: "kindle" });
    await sleep(500);
    const f = lastFireComp();
    check("kindle after out is a FRESH fire (new anchor, lit:true)",
      f?.data?.lit === true && typeof f?.data?.at === "number" && f?.data?.at > tKindle,
      JSON.stringify(f?.data && { lit: f.data.lit, at: f.data.at }));
  }

  // ---- douse: the hand puts it out --------------------------------------------------
  {
    bob.verb("use", { id: "fire1", action: "douse" });
    await sleep(500);
    const f = lastFireComp();
    check("douse writes {lit:false} + says its line",
      f?.data?.lit === false && cfSays("fire1").some((e) => (e.args as any)?.cf?.op === "douse"),
      JSON.stringify(f?.data && { lit: f.data.lit }));
    const before = cfSays().length;
    bob.verb("use", { id: "fire1", action: "douse" });
    await sleep(400);
    check("douse on a cold fire mints nothing",
      cfSays().length === before, `${cfSays().length} vs ${before}`);
    bob.verb("use", { id: "fire1", action: "stoke" });
    await sleep(400);
    check("stoke on a cold fire mints nothing",
      cfSays().length === before, `${cfSays().length} vs ${before}`);
  }

  // ---- seat ownership: another fire never fights a warmed seat ----------------------
  {
    alice.verb("spawn", { id: "fire2", lib: "deco/bench.glb", pos: [10, 0, 0], yaw: 0 });
    alice.verb("spawn", { id: "bench3", lib: "deco/bench.glb", pos: [12, 0, 0], yaw: 0 });
    await sleep(300);
    // bench1 still carries fire1's via marker (on:false) — fire2 claims bench3 only
    alice.verb("comp", { id: "fire2", type: "campfire", data: { blazeSec: 30, embersSec: 30, stokeSec: 5, seats: ["bench3"] } });
    await sleep(300);
    alice.walk([10, 0, 0]);
    await sleep(300);
    alice.verb("use", { id: "fire2", action: "kindle" });
    await sleep(500);
    const b3 = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "bench3"
      && (e.args as any)?.type === "lamp").at(-1)?.args as any;
    check("a second fire warms its own seat (via:fire2)",
      b3?.data?.on === true && b3?.data?.via === "fire2", JSON.stringify(b3?.data));
    // missing-seat skip: fire3 names a seat that does not exist
    alice.verb("spawn", { id: "fire3", lib: "deco/bench.glb", pos: [20, 0, 0], yaw: 0 });
    await sleep(300);
    alice.verb("comp", { id: "fire3", type: "campfire", data: { blazeSec: 30, embersSec: 30, seats: ["ghost"] } });
    await sleep(300);
    alice.walk([20, 0, 0]);
    await sleep(300);
    alice.verb("use", { id: "fire3", action: "kindle" });
    await sleep(500);
    check("a missing seat skips (the fire still lights; no crash)",
      logLines().some((e) => e.verb === "light" && (e.args as any)?.id === "fire3·lamp"),
      "fire3 never lit");
  }

  // ---- restart: a burning fire resumes; replay mints nothing ------------------------
  {
    // fire2 is burning (60s ladder). Kill + restart.
    const saysBefore = cfSays().length;
    const lightsBefore = logLines().filter((e) => e.verb === "light" && (e.args as any)?.id === "fire2·lamp").length;
    await server!.kill();
    await sleep(400);
    await startServer();
    const probe = new Client("probe1");
    await probe.connect();
    await sleep(2500);                                    // sweeps run
    check("restart: replay + fresh sweeps minted no says",
      cfSays().length === saysBefore, `${cfSays().length} vs ${saysBefore}`);
    const ents = probe.snapshot?.state?.entities;
    check("late joiner folds fire2 burning (comp lit) + hearth standing",
      ents?.fire2?.comp?.campfire?.lit === true && ents?.["fire2·lamp"]?.kind === "light",
      JSON.stringify({ lit: ents?.fire2?.comp?.campfire?.lit, hearth: ents?.["fire2·lamp"]?.kind }));
    const b3 = ents?.bench3?.comp?.lamp;
    check("late joiner folds the warmed seat",
      b3?.on === true && b3?.via === "fire2", JSON.stringify(b3));
    check("the death was NOT re-minted (fold truth holds)",
      cfSays().filter((e) => (e.args as any)?.cf?.out === true).length === 1, "extra deaths");
    // and the sweep did not churn: no extra hearth light verb
    const lightsAfter = logLines().filter((e) => e.verb === "light" && (e.args as any)?.id === "fire2·lamp").length;
    check("the resumed fire's hearth was not re-written (churn gate)",
      lightsAfter === lightsBefore, `${lightsAfter} vs ${lightsBefore}`);
    check("mcpl affordance read (describeCampfire on folded truth)",
      describeCampfire(ents?.fire2?.comp?.campfire).startsWith("campfire: "),
      describeCampfire(ents?.fire2?.comp?.campfire));
    // burn fire2 out via douse, wait a sweep: cold fold mints nothing
    probe.walk([10, 0, 0]);
    await sleep(300);
    probe.verb("use", { id: "fire2", action: "douse" });
    await sleep(2500);
    const saysAfterDouse = cfSays().length;
    await sleep(2500);
    check("a cold fold mints nothing on later sweeps",
      cfSays().length === saysAfterDouse, `${cfSays().length} vs ${saysAfterDouse}`);
    probe.close();
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
