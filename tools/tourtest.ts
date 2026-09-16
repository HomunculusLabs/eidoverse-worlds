// Tour matrix — `comp {type:"tour"}` makes a line of lamps CHOREOGRAPH
// THEMSELVES: an authored timeline of cues (t, on[], off[], line?) that the
// 1Hz sweep plays over the LAMP family (vocab-5 companions — one shared
// arithmetic). Progress lives IN THE FOLD (playing/atCue/at); the CURRENT
// cue is derived (cueAt — the doorYaw closed form), so late join/restart/
// replay/fork all read the same standing cue with zero traffic. Covers
// § TOURS CONTRACT:
//
//   bun tools/tourtest.ts
//
// - unit:       normalizeTour clamps/caps/drops; cueAt playing/frozen/
//               garbage-anchor; crossedCues batch; describe
// - authoring:  spawn + tour comp is builder-gated; visitor comp bounces
// - begin:      rank 0 + arm's reach; ONE comp write {...authored, playing,
//               atCue:-1, at:now} + say with tour{op:"begin",who,at}/cause/by;
//               cue 0's lamp comps {on:true,at} fire on cued lamps at their
//               authored offsets (companions ignite via the lamp family's
//               own comp hook — ZERO per-cue log traffic)
// - pass-through: use {action:"ring"} logs, mints nothing
// - halt:       stops at the folded cue; lighting state stays; restart +
//               replay mint nothing
// - re-begin:   ONE re-anchored write, atCue:-1, cue 0 re-fires
// - abuse:      unknown-position skip; out-of-reach begin skip; spectator
//               bounce; begin-on-paused and halt-on-halted no-ops
// - restart:    the halted tour folds; fresh sweeps mint nothing
// - mcpl:       describeTour reads folded truth
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeTour, cueAt, crossedCues, describeTour, TOUR_ENGINE_KEYS } from "../shared/tour.js";

const PORT = Number(process.env.PORT ?? 9016);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-tour";
const WORLD = `tourtest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-tour-"));

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
const tourSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.tour != null && (!id || (e.args as any)?.id === id));
const lastTourComp = (): any => logLines()
  .filter((e) => e.verb === "comp" && (e.args as any)?.type === "tour" && e.actor === "world")
  .at(-1)?.args;

try {
  console.log(`\ntour matrix — ${URL_}  world=${WORLD}\n`);

  // ---- unit: the pure math, before any server --------------------------------
  {
    const { cfg, notes } = normalizeTour({ line: ["a", "b", "c"], cues: [
      { t: 1, on: [0] }, { t: 5, off: [0], on: [1] }, { t: 9, on: [2] },
      { t: 99999, on: [0] }, { t: "x", on: [0] }, { t: 2, on: [5] }, { t: 3, on: ["q"] },
    ] });
    check("unit: cues drop garbage t / out-of-line indexes / empty-after-drop, clamp 3600",
      cfg.cues.length === 4 && cfg.cues[3].t === 3600 && cfg.cues[2].on.length === 1,
      JSON.stringify(cfg.cues));
    check("unit: drops are linted by name",
      notes.some((x) => x.includes("99999")) && notes.some((x) => x.includes("outside the line")),
      JSON.stringify(notes).slice(0, 200));
    check("unit: the authored carry strips engine keys",
      !TOUR_ENGINE_KEYS.some((k) => k in cfg.authored), JSON.stringify(cfg.authored).slice(0, 120));
    const cues = [{ t: 2, on: [0] }, { t: 4, on: [1] }, { t: 6, on: [2] }];
    check("unit: cueAt playing derives the last fired cue",
      cueAt(cues, true, -1, 1000, 1000 + 4500) === 1 && cueAt(cues, true, -1, 1000, 1000 + 6100) === 2
        && cueAt(cues, true, -1, 1000, 1000 + 1500) === -1);
    check("unit: cueAt frozen reads the folded marker",
      cueAt(cues, false, 1, 999999999, Date.now()) === 1);
    check("unit: cueAt garbage anchor fails closed to -1",
      cueAt(cues, true, -1, "bad" as unknown as number, Date.now()) === -1);
    check("unit: crossedCues batches (from,to] inclusive",
      JSON.stringify(crossedCues(cues, -1, 1)) === JSON.stringify([0, 1])
        && JSON.stringify(crossedCues(cues, 1, 1)) === JSON.stringify([])
        && JSON.stringify(crossedCues(cues, -1, 2)) === JSON.stringify([0, 1, 2]));
    const desc = describeTour({ playing: true, atCue: -1, at: Date.now() - 4500, line: ["a", "b"], cues: [{ t: 2, on: [0] }, { t: 4, on: [1] }] });
    check("unit: describeTour names playing state + cue 2/2", desc.includes("playing") && desc.includes("cue 2/2"), desc);
    const descP = describeTour({ playing: false, atCue: 1 });
    check("unit: describeTour paused names action hint", descP.includes("paused"), descP);
  }

  await startServer();

  // ---- authoring ---------------------------------------------------------------
  const alice = new Client("alice");                    // first joiner owns
  await alice.connect();
  await sleep(200);
  for (const [i, x] of [0, 2, 4].entries()) {
    alice.verb("spawn", { id: `lamp${i}`, lib: "deco/bench.glb", pos: [x, 0, 0], yaw: 0 });
  }
  await sleep(300);
  for (let i = 0; i < 3; i++) {
    alice.verb("comp", { id: `lamp${i}`, type: "lamp", data: { intensity: 6, range: 6 } });
  }
  await sleep(300);
  alice.verb("spawn", { id: "post", lib: "deco/bench.glb", pos: [1, 0, 0], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "post", type: "tour", data: {
    line: ["lamp0", "lamp1", "lamp2"],
    cues: [
      { t: 2, on: [0], line: "the lamps wake, one by one" },
      { t: 5, off: [0], on: [1] },
      { t: 8, on: [2] },
    ],
    beginAt: "the lantern tour begins",
  } });
  await sleep(400);
  check("builder authored lamps + tour comp",
    alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));

  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.verb("comp", { id: "post", type: "tour", data: { line: ["lamp0"], cues: [{ t: 1, on: [0] }] } });
  await sleep(300);
  check("visitor tour comp authoring bounces",
    logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "tour" && e.actor === "bob").length === 0,
    "visitor comp landed");

  // ---- begin: the rank-0 hand starts the show -----------------------------------
  bob.walk([1, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "post", action: "begin" });
  await sleep(400);
  {
    const says = tourSays("post");
    check("begin says one line with tour{op,who,at}/cause/by",
      says.length === 1 && (says[0].args as any)?.text === "the lantern tour begins"
        && (says[0].args as any)?.tour?.op === "begin" && (says[0].args as any)?.by === "bob"
        && (says[0].args as any)?.cause != null,
      JSON.stringify(says.map((s) => s.args)));
  }
  {
    const t = lastTourComp();
    check("the engine wrote ONE tour comp {...authored, playing:true, atCue:-1, at}",
      t != null && t?.data?.playing === true && t?.data?.atCue === -1
        && typeof t?.data?.at === "number" && t?.data?.beginAt === "the lantern tour begins",
      JSON.stringify(t?.data && { playing: t.data.playing, atCue: t.data.atCue, at: t.data.at }));
  }
  // cue 0 at t=2s: the sweep fires it
  await sleep(3200);
  {
    const f = lastTourComp();
    check("cue 0 fired: fold advanced to atCue:0",
      f?.data?.atCue === 0 && f?.data?.playing === true,
      JSON.stringify(f?.data && { atCue: f.data.atCue, playing: f.data.playing }));
    const l0 = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "lamp0"
      && (e.args as any)?.type === "lamp" && e.actor === "world").at(-1)?.args as any;
    check("cue 0's lamp write carries {...authored, on:true, at} (ride-verbatim)",
      l0?.data?.on === true && typeof l0?.data?.at === "number" && l0?.data?.intensity === 6,
      JSON.stringify(l0?.data));
    const comp0 = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "tour" && e.actor === "world");
    check("cue 0 fired exactly ONE tour comp write (the fold re-anchor)",
      comp0.length === 2, `${comp0.length} tour comps`);
    // companion ignition: the cue's lamp write must reach the LIGHT tier —
    // the lamp family's own light+mount verbs (vocab-5 derivation law), not
    // just the folded comp bit. w.append bypasses runVerb's after hooks, so
    // the tour engine must call the lamp family itself.
    const light0 = logLines().filter((e) => e.verb === "light" && (e.args as any)?.id === "lamp0·lamp").at(-1)?.args as any;
    const mount0 = logLines().filter((e) => e.verb === "mount" && (e.args as any)?.id === "lamp0·lamp").at(-1)?.args as any;
    check("cue 0 ignited lamp0's companion (light + mount verbs)",
      light0 != null && mount0?.to === "lamp0",
      JSON.stringify({ light0, mount0 }));
  }

  // ---- pass-through --------------------------------------------------------------
  {
    const before = tourSays().length;
    bob.verb("use", { id: "post", action: "ring" });
    await sleep(400);
    check("use {action:\"ring\"} passes through (logged, mints nothing)",
      logLines().some((e) => e.verb === "use" && e.actor === "bob" && (e.args as any)?.id === "post"
        && (e.args as any)?.action === "ring") && tourSays().length === before,
      `${tourSays().length} vs ${before}`);
  }

  // ---- halt: fold truth holds ----------------------------------------------------
  bob.verb("use", { id: "post", action: "halt" });
  await sleep(400);
  {
    const f = lastTourComp();
    check("halt writes playing:false keeping atCue/at",
      f?.data?.playing === false && typeof f?.data?.atCue === "number",
      JSON.stringify(f?.data && { playing: f.data.playing, atCue: f.data.atCue }));
    check("halt says its line with tour{op:\"halt\"}",
      tourSays("post").some((e) => (e.args as any)?.tour?.op === "halt"));
    const l0 = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "lamp0"
      && (e.args as any)?.type === "lamp" && e.actor === "world").at(-1)?.args as any;
    check("halted lighting state stays (lamp0 still lit in the fold)",
      l0?.data?.on === true, JSON.stringify(l0?.data));
  }
  const saysBefore = tourSays().length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(2500);                                    // sweeps run
  check("restart: replay + fresh sweeps minted nothing",
    tourSays().length === saysBefore, `${tourSays().length} vs ${saysBefore}`);
  {
    const t = probe.snapshot?.state?.entities?.post?.comp?.tour;
    check("the tour folds from the log (late-join truth)",
      t?.playing === false && typeof t?.atCue === "number"
        && JSON.stringify(t?.line) === JSON.stringify(["lamp0", "lamp1", "lamp2"]),
      JSON.stringify(t));
    check("mcpl affordance read (describeTour on folded truth)",
      describeTour(t).startsWith("tour:"), describeTour(t));
  }

  // ---- re-begin: ONE re-anchored write, cue 0 re-fires ---------------------------
  probe.walk([1, 0, 0]);
  await sleep(300);
  probe.verb("use", { id: "post", action: "begin" });
  await sleep(400);
  {
    const f = lastTourComp();
    check("re-begin writes ONE fresh anchor atCue:-1",
      f?.data?.playing === true && f?.data?.atCue === -1,
      JSON.stringify(f?.data && { playing: f.data.playing, atCue: f.data.atCue }));
  }
  await sleep(3200);                                    // cue 0 again
  {
    const f = lastTourComp();
    check("cue 0 re-fired after re-begin (fold atCue:0)",
      f?.data?.atCue === 0, JSON.stringify(f?.data && { atCue: f.data.atCue }));
    const l0 = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "lamp0"
      && (e.args as any)?.type === "lamp" && e.actor === "world").at(-1)?.args as any;
    check("cue 0's lamp write re-fired (lamp0 lit again)",
      l0?.data?.on === true, JSON.stringify(l0?.data));
  }

  // ---- abuse: unknown position, out-of-reach, spectator, no-op halts --------------
  {
    const eve = new Client("eve");
    await eve.connect();
    await sleep(200);
    // no walk: no live pose on the presence plane
    const before = tourSays().length;
    eve.verb("use", { id: "post", action: "halt" });
    await sleep(400);
    check("an unknown-position use mints nothing (skip)",
      tourSays().length === before, `${tourSays().length} vs ${before}`);
    eve.close();
  }
  {
    // out-of-reach begin (bob far away; the tour is currently playing)
    bob.walk([40, 0, 40]);
    await sleep(300);
    const compsBefore = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "tour" && e.actor === "world").length;
    const saysBefore2 = tourSays().length;
    bob.verb("use", { id: "post", action: "halt" });
    await sleep(400);
    const f = lastTourComp();
    check("an out-of-reach halt mints nothing",
      logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "tour" && e.actor === "world").length === compsBefore
        && tourSays().length === saysBefore2,
      JSON.stringify(f?.data && { playing: f.data.playing }));
  }
  {
    // spectator bounce
    const spec = new Client("spec1");
    await spec.connect(true);
    await sleep(200);
    spec.walk([1, 0, 0]);
    await sleep(300);
    const before = tourSays().length;
    spec.verb("use", { id: "post", action: "halt" });
    await sleep(400);
    check("a spectator's use mints nothing",
      tourSays().length === before, `${tourSays().length} vs ${before}`);
    spec.close();
  }
  {
    // no-op begin on a playing tour (probe at the post)
    const before = tourSays().length;
    const compsBefore = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "tour" && e.actor === "world").length;
    probe.verb("use", { id: "post", action: "begin" });
    await sleep(400);
    check("begin on a playing tour mints nothing (skip)",
      tourSays().length === before
        && logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "tour" && e.actor === "world").length === compsBefore,
      `${tourSays().length} vs ${before}`);
  }

  // ---- the full arc: on AND off through the lamp family's own companions ------
  // A second post walks its lamp through light AND dark — the cue writes
  // must reach the LIGHT tier both ways (ignite on on:true, remove on
  // on:false), the vocab-5 derivation law applied by the choreographer.
  {
    await alice.connect();                          // the folded owner returns
    await sleep(200);
    alice.verb("spawn", { id: "lamp9", lib: "deco/bench.glb", pos: [6, 0, 0], yaw: 0 });
    await sleep(300);
    alice.verb("comp", { id: "lamp9", type: "lamp", data: { intensity: 5, range: 5 } });
    await sleep(300);
    alice.verb("spawn", { id: "post2", lib: "deco/bench.glb", pos: [7, 0, 0], yaw: 0 });
    await sleep(300);
    alice.verb("comp", { id: "post2", type: "tour", data: {
      line: ["lamp9"], cues: [{ t: 1, on: [0] }, { t: 2, off: [0] }],
    } });
    await sleep(400);
    alice.walk([7, 0, 0]);                          // the owner stands at the post
    await sleep(300);
    alice.verb("use", { id: "post2", action: "begin" });
    await sleep(3500);                              // both cues fire (t=1, t=2)
    const lights = logLines().filter((e) => e.verb === "light" && (e.args as any)?.id === "lamp9·lamp");
    const removes = logLines().filter((e) => e.verb === "remove" && (e.args as any)?.id === "lamp9·lamp");
    check("the arc ignited lamp9's companion (light verb)",
      lights.length >= 1, `${lights.length} light verbs`);
    check("the arc removed lamp9's companion after the off cue (remove verb)",
      removes.length >= 1 && lights[0] != null && removes.at(-1)!.seq > lights[0].seq,
      `${lights.length} lights, ${removes.length} removes`);
    const l9 = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.id === "lamp9"
      && (e.args as any)?.type === "lamp").at(-1)?.args as any;
    check("the arc left lamp9 folded dark (off cue won)",
      l9?.data?.on === false, JSON.stringify(l9?.data && { on: l9.data.on }));
    const t2 = probe.snapshot;                      // (probe joined pre-arc; fold read is log-side anyway)
    void t2;
    const post2Comp = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "tour"
      && (e.args as any)?.id === "post2" && e.actor === "world").at(-1)?.args as any;
    check("post2's fold re-anchored to atCue:1 (both cues consumed)",
      post2Comp?.data?.atCue === 1 && post2Comp?.data?.playing === true,
      JSON.stringify(post2Comp?.data && { atCue: post2Comp.data.atCue, playing: post2Comp.data.playing }));
    // late-join truth on the arc: a fresh joiner folds lamp9 dark + post2 spent
    const late = new Client("late1");
    await late.connect();
    await sleep(300);
    const lt = late.snapshot?.state?.entities;
    check("late joiner folds the arc's end state (lamp9 dark, tour at cue 1)",
      lt?.lamp9?.comp?.lamp?.on === false && lt?.post2?.comp?.tour?.atCue === 1,
      JSON.stringify({ lamp9: lt?.lamp9?.comp?.lamp?.on, post2cue: lt?.post2?.comp?.tour?.atCue }));
    late.close();
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
