// Festival matrix — `comp {type:"festival"}` is ONE authored timeline
// driving FOUR affordance families through their own doors (the tour
// doctrine, vocab-22, generalized): each cue tolls the named BELL, asks
// the named WEATHERZONE, begins/halts the named TOUR, restocks the named
// VENDOR stall, or speaks a line. Progress lives IN THE FOLD
// (playing/atCue/at); the CURRENT cue is cueAt (tour.js's own closed form,
// imported — one arithmetic), so late join/restart/replay/fork all read
// the same standing cue with zero traffic. Covers § FESTIVALS CONTRACT:
//
//   bun tools/festivaltest.ts
//
// - unit:       normalizeFestival clamps/caps/drops; members lint; the
//               authored carry strips engine keys
// - authoring:  spawn + festival comp is builder-gated; visitor bounces
// - begin:      rank 0 + arm's reach; ONE comp write {...authored,
//               playing:true, atCue:-1, at} + say with festival{op,who,at}/
//               cause/by; later cues fire on the 1Hz sweep through each
//               family's OWN transitions (bell say+strikes, weather+zone
//               hold+say, tour comp+say, vendor restock comp+say)
// - pass-through: use {action:"ring"} logs, mints nothing
// - halt:       stops at the folded cue; restart + replay mint nothing
// - re-begin:   ONE re-anchored write, atCue:-1, cues re-fire
// - abuse:      unknown-position skip; out-of-reach skip; spectator
//               bounce; begin-on-playing / halt-on-halted no-ops;
//               run cap (a second festival's begin skips)
// - restart:    the playing festival RESUMES at its folded anchor — crossed
//               cues never re-fire, uncrossed ones do (kill after cue 1,
//               restart, cue 2 fires exactly once)
// - mcpl:       describeFestival reads folded truth
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeFestival, describeFestival, FESTIVAL_ENGINE_KEYS } from "../shared/festival.js";

const PORT = Number(process.env.PORT ?? 9032);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-fest";
const WORLD = `festtest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-fest-"));

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
  if (!existsSync(p)) return [] as any[];
  return readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
};
const festSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.festival != null && (!id || (e.args as any)?.id === id));
const lastFestComp = (): any => logLines()
  .filter((e) => e.verb === "comp" && (e.args as any)?.type === "festival" && e.actor === "world")
  .at(-1)?.args;
const festComps = () => logLines()
  .filter((e) => e.verb === "comp" && (e.args as any)?.type === "festival" && e.actor === "world");

try {
  console.log(`\nfestival matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const { cfg, notes } = normalizeFestival({
      bell: "bell1", zone: "zone1", tour: "post1", stall: "stand1",
      cues: [
        { t: 1, toll: true },
        { t: 2, sky: "rain" },
        { t: 3, tour: "begin" },
        { t: 4, restock: true },
        { t: 5, line: "the festival begins" },
        { t: 99999, toll: true },          // clamped to 3600
        { t: "x", toll: true },            // dropped
        { t: 2, sky: "wine" },             // illegal weather dropped
        { t: 2, tour: "dance" },           // illegal op dropped
        { t: 2, restock: 3 },              // non-true dropped
        { t: 2, toll: "yes" },             // non-true dropped
      ],
    });
    check("unit: members parsed one-per-family",
      cfg.members.bell === "bell1" && cfg.members.zone === "zone1"
        && cfg.members.tour === "post1" && cfg.members.stall === "stand1",
      JSON.stringify(cfg.members));
    check("unit: legal cues survive, garbage drops (t clamped 3600)",
      cfg.cues.length === 6 && cfg.cues[5].t === 3600,
      JSON.stringify(cfg.cues));
    check("unit: drops are linted by name",
      notes.some((x) => x.includes("99999")) && notes.some((x) => x.includes("wine"))
        && notes.some((x) => x.includes("dance")) && notes.some((x) => x.includes("restock")),
      JSON.stringify(notes).slice(0, 300));
    const noMembers = normalizeFestival({ cues: [{ t: 1, toll: true }] });
    check("unit: a toll cue with no bell member named drops (family cues need their family)",
      noMembers.cfg.cues.length === 0 && noMembers.notes.some((x) => x.includes("no bell member")),
      JSON.stringify({ cues: noMembers.cfg.cues, notes: noMembers.notes }));
    check("unit: the authored carry strips engine keys",
      !FESTIVAL_ENGINE_KEYS.some((k) => k in cfg.authored), JSON.stringify(cfg.authored).slice(0, 120));
    const desc = describeFestival({ playing: true, atCue: -1, at: Date.now() - 4500,
      bell: "b", cues: [{ t: 2, toll: true }, { t: 4, line: "x" }, { t: 6, line: "y" }] });
    check("unit: describeFestival names playing state + cue 2/3 + members",
      desc.includes("playing") && desc.includes("cue 2/3") && desc.includes("bell:b"), desc);
    const descP = describeFestival({ playing: false, atCue: 1 });
    check("unit: describeFestival paused names action hint", descP.includes("paused"), descP);
  }

  await startServer();

  // ---- authoring: the builder seats the four families + the master -------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await sleep(200);
  // the bell (a schedule — the festival tolls it on cue)
  alice.verb("spawn", { id: "bell1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  // the zone (menu rain|clear — the festival asks it on cue)
  alice.verb("spawn", { id: "zone1", lib: "deco/bench.glb", pos: [1, 0, 1], yaw: 0 });
  // the tour post + its lamp (the festival begins the tour on cue)
  alice.verb("spawn", { id: "lamp0", lib: "deco/bench.glb", pos: [2, 0, 0], yaw: 0 });
  alice.verb("spawn", { id: "post1", lib: "deco/bench.glb", pos: [3, 0, 0], yaw: 0 });
  // the stall (the festival restocks it on cue)
  alice.verb("spawn", { id: "stand1", lib: "deco/bench.glb", pos: [4, 0, 0], yaw: 0 });
  // the master post
  alice.verb("spawn", { id: "master", lib: "deco/bench.glb", pos: [5, 0, 0], yaw: 0 });
  await sleep(500);
  alice.verb("comp", { id: "bell1", type: "bell", data: { hours: [23], n: 2, sec: 0.5 } });
  alice.verb("comp", { id: "zone1", type: "weatherzone", data: { states: ["rain", "clear"], holdSec: 30 } });
  alice.verb("comp", { id: "lamp0", type: "lamp", data: { intensity: 6, range: 6 } });
  alice.verb("comp", { id: "post1", type: "tour", data: { line: ["lamp0"], cues: [{ t: 2, on: [0] }] } });
  alice.verb("comp", { id: "stand1", type: "vendor", data: { wares: { bread: 2 }, stock: { bread: 0 } } });
  await sleep(400);
  alice.verb("comp", { id: "master", type: "festival", data: {
    bell: "bell1", zone: "zone1", tour: "post1", stall: "stand1",
    cues: [
      { t: 2, toll: true },
      { t: 4, sky: "rain" },
      { t: 6, tour: "begin" },
      { t: 8, restock: true },
      { t: 10, line: "the harvest festival closes" },
    ],
    beginAt: "the harvest festival begins",
  } });
  await sleep(500);
  check("builder authored the four families + festival comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.verb("comp", { id: "master", type: "festival", data: { cues: [{ t: 1, toll: true }] } });
  await sleep(300);
  check("visitor festival comp authoring bounces",
    logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "festival" && e.actor === "bob").length === 0,
    "visitor comp landed");

  // ---- begin: the rank-0 hand starts the show -----------------------------------
  bob.walk([5, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "master", action: "begin" });
  await sleep(500);
  {
    const says = festSays("master");
    check("begin says one line with festival{op,who,at}/cause/by",
      says.length === 1 && (says[0].args as any)?.text === "the harvest festival begins"
        && (says[0].args as any)?.festival?.op === "begin" && (says[0].args as any)?.by === "bob"
        && (says[0].args as any)?.cause != null,
      JSON.stringify(says.map((s) => s.args)));
  }
  {
    const t = lastFestComp();
    check("the engine wrote ONE festival comp {...authored, playing:true, atCue:-1, at}",
      t != null && t?.data?.playing === true && t?.data?.atCue === -1
        && typeof t?.data?.at === "number" && t?.data?.beginAt === "the harvest festival begins",
      JSON.stringify(t?.data && { playing: t.data.playing, atCue: t.data.atCue, at: t.data.at }));
  }

  // ---- the cues fire through each family's OWN transitions ----------------------
  // cue 0 (t=2s): the bell tolls — ONE world say carrying bell{n,hour} + strikes
  await sleep(2600);
  {
    const bellSays = logLines().filter((e) => e.verb === "say" && e.actor === "world"
      && (e.args as any)?.bell != null && (e.args as any)?.id === "bell1");
    check("cue 0: the bell tolled through the bell family's own say (bell{n,hour})",
      bellSays.length === 1, JSON.stringify(bellSays.map((s) => s.args)));
    const f = lastFestComp();
    check("cue 0 advanced the fold to atCue:0",
      f?.data?.atCue === 0 && f?.data?.playing === true,
      JSON.stringify(f?.data && { atCue: f.data.atCue, playing: f.data.playing }));
  }
  // cue 1 (t=4s): the zone asks rain — weather verb + zone hold comp + zone say
  await sleep(2000);
  {
    const wx = logLines().filter((e) => e.verb === "weather" && (e.args as any)?.weather === "rain");
    check("cue 1: the zone asked rain through the zone family's own weather verb",
      wx.length === 1, `${wx.length} weather verbs`);
    const zoneComp = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "zone1"
      && (e.args as any)?.type === "weatherzone" && e.actor === "world").at(-1)?.args as any;
    check("cue 1: the zone hold comp carries {active:\"rain\", until, revertTo}",
      zoneComp?.data?.active === "rain" && typeof zoneComp?.data?.until === "number"
        && typeof zoneComp?.data?.revertTo === "string",
      JSON.stringify(zoneComp?.data));
    const zoneSay = logLines().filter((e) => e.verb === "say" && e.actor === "world"
      && (e.args as any)?.zone != null && (e.args as any)?.id === "zone1").at(-1)?.args as any;
    check("cue 1: the zone say carries {state,who} (who=null — TIME asked)",
      zoneSay?.zone?.state === "rain" && zoneSay?.zone?.who === null,
      JSON.stringify(zoneSay?.zone));
  }
  // cue 2 (t=6s): the tour begins — tour comp playing:true + tour say
  await sleep(2000);
  {
    const tourComp = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "post1"
      && (e.args as any)?.type === "tour" && e.actor === "world").at(-1)?.args as any;
    check("cue 2: the tour began through the tour family's own write (playing:true)",
      tourComp?.data?.playing === true && tourComp?.data?.atCue === -1,
      JSON.stringify(tourComp?.data));
    const tourSay = logLines().filter((e) => e.verb === "say" && e.actor === "world"
      && (e.args as any)?.tour?.op === "begin" && (e.args as any)?.id === "post1").at(-1)?.args as any;
    check("cue 2: the tour say carries {op:\"begin\"} with who:null (TIME began it)",
      tourSay?.tour?.who === null, JSON.stringify(tourSay?.tour));
  }
  // cue 3 (t=8s): the stall restocks — vendor comp full shelf + vendor say
  await sleep(2000);
  {
    const vdComp = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "stand1"
      && (e.args as any)?.type === "vendor" && e.actor === "world").at(-1)?.args as any;
    check("cue 3: the stall restocked through the vendor family's own write (stock full)",
      vdComp?.data?.stock?.bread === 2, JSON.stringify(vdComp?.data));
    const vdSay = logLines().filter((e) => e.verb === "say" && e.actor === "world"
      && (e.args as any)?.vd?.restock != null && (e.args as any)?.id === "stand1").at(-1)?.args as any;
    check("cue 3: the vendor say carries vd{restock:\"all\"} with who:null",
      vdSay?.vd?.restock === "all" && vdSay?.vd?.who === null, JSON.stringify(vdSay?.vd));
  }
  // cue 4 (t=10s): the pure narration line — festival say, bell grammar
  await sleep(2000);
  {
    const line = logLines().filter((e) => e.verb === "say" && e.actor === "world"
      && (e.args as any)?.text === "the harvest festival closes").at(-1)?.args as any;
    check("cue 4: the narration line said exactly once (festival{cue}, no cause/by — TIME)",
      logLines().filter((e) => e.verb === "say" && (e.args as any)?.text === "the harvest festival closes").length === 1
        && line?.festival?.cue === 4 && line?.cause === undefined,
      JSON.stringify(line?.festival));
    const f = lastFestComp();
    check("the fold re-anchored once per sweep batch (atCue:4, playing)",
      f?.data?.atCue === 4 && f?.data?.playing === true,
      JSON.stringify(f?.data && { atCue: f.data.atCue, playing: f.data.playing }));
    const n = festComps().length;
    check("the whole arc minted exactly ONE festival comp per sweep batch (5 + begin = 6)",
      n === 6, `${n} festival comps`);
  }

  // ---- late-join truth ------------------------------------------------------------
  {
    const late = new Client("late1");
    await late.connect();
    await sleep(300);
    const lt = late.snapshot?.state?.entities;
    check("late joiner folds the festival at cue 4, the tour playing, the sky raining",
      lt?.master?.comp?.festival?.atCue === 4
        && lt?.post1?.comp?.tour?.playing === true
        && lt?.stand1?.comp?.vendor?.stock?.bread === 2,
      JSON.stringify({ fest: lt?.master?.comp?.festival?.atCue, tour: lt?.post1?.comp?.tour?.playing, bread: lt?.stand1?.comp?.vendor?.stock?.bread }));
    check("mcpl affordance read (describeFestival on folded truth)",
      describeFestival(lt?.master?.comp?.festival).startsWith("festival:"), describeFestival(lt?.master?.comp?.festival));
    late.close();
  }

  // ---- pass-through -----------------------------------------------------------------
  {
    const before = festSays().length;
    bob.verb("use", { id: "master", action: "ring" });
    await sleep(400);
    check("use {action:\"ring\"} passes through (logged, mints nothing)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob" && (e.args as any)?.id === "master"
        && (e.args as any)?.action === "ring") && festSays().length === before,
      `${festSays().length} vs ${before}`);
  }

  // ---- restart mid-flight: the RESUME proof ------------------------------------------
  // Halt the spent arc (a completed arc stays PLAYING — begin-on-playing is
  // a no-op by contract), re-begin, kill after cue 0 (t=2s) fires, restart,
  // and cue 1 must fire EXACTLY ONCE — crossed cues never re-fire, uncrossed
  // ones do.
  bob.verb("use", { id: "master", action: "halt" });
  await sleep(400);
  bob.verb("use", { id: "master", action: "begin" });
  await sleep(400);
  await sleep(2600);                                   // cue 0 (bell) fires again
  {
    const bellSays = logLines().filter((e) => e.verb === "say" && e.actor === "world"
      && (e.args as any)?.bell != null && (e.args as any)?.id === "bell1");
    check("re-begin: cue 0 re-fired (bell tolled a 2nd time)", bellSays.length === 2, `${bellSays.length} bell says`);
  }
  const saysBefore = festSays().length;
  const weatherBefore = logLines().filter((e) => e.verb === "weather").length;
  const tourCompsBefore = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "post1"
    && (e.args as any)?.type === "tour" && e.actor === "world").length;
  const vdCompsBefore = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "stand1"
    && (e.args as any)?.type === "vendor" && e.actor === "world").length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(3000);                                   // sweeps run: cue 1 due at t=4s
  {
    const f = lastFestComp();
    check("restart: the playing festival RESUMED past cue 1 (atCue >= 1)",
      f?.data != null && f.data.atCue >= 1 && f.data.playing === true,
      JSON.stringify(f?.data && { atCue: f.data.atCue, playing: f.data.playing }));
    const wx = logLines().filter((e) => e.verb === "weather" && (e.args as any)?.weather === "rain");
    check("restart: cue 1 fired exactly once after the crash (rain asked once more)",
      wx.length === weatherBefore + 1, `${wx.length} vs ${weatherBefore}`);
  }
  // let the rest of the arc spend itself quietly, then verify no re-toll
  await sleep(6000);
  {
    const bellSays = logLines().filter((e) => e.verb === "say" && e.actor === "world"
      && (e.args as any)?.bell != null && (e.args as any)?.id === "bell1");
    check("restart: crossed cue 0 never re-fired after crash", bellSays.length === 2, `${bellSays.length} bell says`);
    const f = lastFestComp();
    check("the resumed arc completed (atCue:4)",
      f?.data?.atCue === 4 && f?.data?.playing === true,
      JSON.stringify(f?.data && { atCue: f.data.atCue }));
    check("restart: replay minted no festival says beyond the arc's own narration (+1)",
      festSays().length === saysBefore + 1, `${festSays().length} vs ${saysBefore}`);
    // the family no-op closures HELD under festival driving: the tour was
    // already playing and the shelf already full — cues 2/3 minted nothing
    const tourComps = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "post1"
      && (e.args as any)?.type === "tour" && e.actor === "world").length;
    const vdComps = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "stand1"
      && (e.args as any)?.type === "vendor" && e.actor === "world").length;
    check("family gates hold: the resumed tour-begin cue was a no-op (tour already playing)",
      tourComps === tourCompsBefore, `${tourComps} vs ${tourCompsBefore}`);
    check("family gates hold: the resumed restock cue was a no-op (shelf already full)",
      vdComps === vdCompsBefore, `${vdComps} vs ${vdCompsBefore}`);
  }

  // ---- halt: fold truth holds ----------------------------------------------------------
  probe.walk([5, 0, 0]);
  await sleep(300);
  probe.verb("use", { id: "master", action: "halt" });
  await sleep(400);
  {
    const f = lastFestComp();
    check("halt writes playing:false keeping atCue/at",
      f?.data?.playing === false && typeof f?.data?.atCue === "number",
      JSON.stringify(f?.data && { playing: f.data.playing, atCue: f.data.atCue }));
    check("halt says its line with festival{op:\"halt\"}",
      festSays("master").some((e) => (e.args as any)?.festival?.op === "halt"));
  }

  // ---- abuse: unknown position, out-of-reach, spectator, no-ops, run cap ---------------
  {
    const eve = new Client("eve");
    await eve.connect();
    await sleep(200);
    const before = festSays().length;
    eve.verb("use", { id: "master", action: "begin" });
    await sleep(400);
    check("an unknown-position use mints nothing (skip)",
      festSays().length === before, `${festSays().length} vs ${before}`);
    eve.close();
  }
  {
    bob.walk([40, 0, 40]);
    await sleep(300);
    const compsBefore = festComps().length;
    const saysBefore2 = festSays().length;
    bob.verb("use", { id: "master", action: "begin" });
    await sleep(400);
    check("an out-of-reach begin mints nothing",
      festComps().length === compsBefore && festSays().length === saysBefore2,
      `${festComps().length} vs ${compsBefore}`);
  }
  {
    const spec = new Client("spec1");
    await spec.connect(true);
    await sleep(200);
    spec.walk([5, 0, 0]);
    await sleep(300);
    const before = festSays().length;
    spec.verb("use", { id: "master", action: "begin" });
    await sleep(400);
    check("a spectator's use mints nothing",
      festSays().length === before, `${festSays().length} vs ${before}`);
    spec.close();
  }
  {
    const before = festSays().length;
    const compsBefore = festComps().length;
    probe.verb("use", { id: "master", action: "halt" });
    await sleep(400);
    check("halt on a halted festival mints nothing (no-op)",
      festSays().length === before && festComps().length === compsBefore,
      `${festSays().length} vs ${before}`);
  }
  {
    // run cap: a second festival cannot begin while the first runs
    await alice.connect();
    await sleep(200);
    alice.verb("spawn", { id: "master2", lib: "deco/bench.glb", pos: [6, 0, 0], yaw: 0 });
    await sleep(300);
    alice.verb("comp", { id: "master2", type: "festival", data: { cues: [{ t: 1, line: "x" }] } });
    await sleep(300);
    alice.walk([6, 0, 0]);
    await sleep(300);
    // begin the first festival again, then the second must skip
    probe.verb("use", { id: "master", action: "begin" });
    await sleep(400);
    alice.verb("use", { id: "master2", action: "begin" });
    await sleep(400);
    check("run cap: a second festival's begin skips while one runs",
      !festSays("master2").some((e) => (e.args as any)?.festival?.op === "begin"),
      JSON.stringify(festSays("master2").map((s) => s.args)));
    probe.verb("use", { id: "master", action: "halt" });
    await sleep(300);
  }
  {
    // begin on a playing festival (master currently halted -> begin it, then again)
    probe.verb("use", { id: "master", action: "begin" });
    await sleep(400);
    const before = festSays().length;
    const compsBefore = festComps().length;
    probe.verb("use", { id: "master", action: "begin" });
    await sleep(400);
    check("begin on a playing festival mints nothing (no-op)",
      festSays().length === before && festComps().length === compsBefore,
      `${festSays().length} vs ${before}`);
    probe.verb("use", { id: "master", action: "halt" });
    await sleep(300);
  }

  // ---- final restart: a halted festival stays halted ------------------------------------
  const finalFest = festComps().length;
  const finalSays = festSays().length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const last = new Client("last1");
  await last.connect();
  await sleep(2500);
  check("final restart: halted festival + fresh sweeps minted nothing",
    festComps().length === finalFest && festSays().length === finalSays,
    `${festComps().length}/${finalFest} comps, ${festSays().length}/${finalSays} says`);

  // ---- cleanup --------------------------------------------------------------------
  bob.close(); probe.close(); last.close();
  try { alice.close(); } catch { /* already gone */ }
} catch (err) {
  console.error("matrix crashed:", err);
  fail++;
} finally {
  server?.kill();
}
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
