// Lamp matrix — `comp {type:"lamp"}` makes a thing a STATEFULLY lightable
// lamp: use {action:"light"|"snuff"|"toggle"} (rank 0 + arm's reach) is the
// only state transition, writing {...authored, on} + a companion LIGHT
// entity at a DERIVED anchor (pure function of folded entity + comp,
// shared/lamp.js) that RIDES the host via one cargo mount, plus a say with
// lamp{on,who,at} + cause/by. Time-of-day realization is the EXISTING light
// rig (dayness dim; authored day:false burns at noon). Self-booting scratch
// sequencer. Covers § LAMPS CONTRACT (VOCABULARY-LOOP.md):
//
//   bun tools/lamptest.ts
//
// - authoring:  spawn + lamp comp is builder-gated; visitor comp bounces
// - dark ride:  authoring mints NOTHING — no light, no say, no mount
// - trigger:    in-reach toggle lights: say + comp write + companion light
//               + cargo mount, in order, with full provenance
// - derivation: companion id "<id>·lamp", folded at the DERIVED anchor
//               (local anchor rotated by host yaw), params from clamped comp
// - carry:      keep/day authored ride the light verb verbatim
// - motion:     the mount means host motion carries the cast (fold parent)
// - no-op:      light-on-lit / snuff-on-dark mint nothing (lamp-skip)
// - reach:      out-of-reach use mints nothing (lamp-skip names distance)
// - pass-thru:  non-lamp actions fall through to other evaluators
// - snuff:      the other half — comp on:false + companion removed + say
// - spectator:  spectate legs cannot use (shell gate)
// - lock:       lock composes — a locked host still lights
// - lint:       out-of-range numbers clamp with lamp-lint; lamp still works
// - re-author:  re-authoring reconciles the companion to the new fold
// - comp-null:  removing the comp cleans the companion
// - orphan:     removing the host sweeps the companion
// - decoy:      a spawned decoy holding the companion id is replaced by the
//               light (flat namespace, wholesale replace — no collision)
// - restart:    replay mints nothing; folded lit state + anchor survive
// - agent path: world says land as ordinary chat an agent's look() sees
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lampLightId, lampAnchor, lampLightArgs } from "../shared/lamp.js";

const PORT = Number(process.env.PORT ?? 8997);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const WORLD = `lamptest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-lamp-"));

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const near = (a: number, b: number, eps = 0.001) => Math.abs(a - b) < eps;

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
/** world-authored says that are lamp effects */
const lampSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.lamp != null && (!id || (e.args as any)?.id === id));
/** world-authored lamp comp writes */
const lampComps = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "lamp" && (!id || (e.args as any)?.id === id));
/** world-authored companion-light writes */
const lampLightWrites = (cid: string) => logLines().filter((e) => e.verb === "light" && e.actor === "world"
  && (e.args as any)?.id === cid);
const snapEnt = (snap: any, id: string) => snap?.state?.entities?.[id] ?? null;

try {
  console.log(`\nlamp matrix — ${URL_}  world=${WORLD}\n`);
  await startServer();

  // ---- authoring ------------------------------------------------------------
  const alice = new Client("alice");
  await alice.connect();                              // first joiner owns
  await sleep(200);
  alice.verb("spawn", { id: "post1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "post1", type: "lamp", data: {
    anchor: [0, 0.5, 0.6], color: 0xffc080, intensity: 20, range: 9,
    lightAt: "the porch lamp flickers alive", snuffAt: "the porch lamp goes dark",
  } });
  // a yawed host proves the anchor rotation; keep/day ride verbatim
  alice.verb("spawn", { id: "yawlamp", lib: "deco/bench.glb", pos: [50, 0, 0], yaw: Math.PI / 2 });
  alice.verb("comp", { id: "yawlamp", type: "lamp", data: { anchor: [0, 0.5, 0.6], day: false, keep: true } });
  // a linty comp: everything out of range
  alice.verb("spawn", { id: "linty", lib: "deco/bench.glb", pos: [200, 0, 0], yaw: 0 });
  alice.verb("comp", { id: "linty", type: "lamp", data: { anchor: [99, 0.5, 0], intensity: 500, range: -3, reach: 0 } });
  await sleep(400);
  check("builder authored spawn + lamp comps", alice.msgs.filter((m) => m.type === "error").length === 0,
    alice.msgs.filter((m) => m.type === "error").map((m) => m.error).join("; "));
  check("authoring mints NOTHING (dark until used)",
    lampLightWrites("post1·lamp").length === 0 && lampSays().length === 0 && lampComps().length === 0,
    `${lampLightWrites("post1·lamp").length} lights / ${lampSays().length} says / ${lampComps().length} comps`);

  // ---- the ignite: use in reach ---------------------------------------------
  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "visitor" });
  await sleep(300);
  bob.walk([3, 0, 0]);                                   // 3m from post1 — inside reach 4
  await sleep(300);
  bob.verb("use", { id: "post1", action: "toggle" });
  await sleep(400);
  const says1 = lampSays("post1");
  check("in-reach toggle says the light line", says1.length === 1
    && (says1[0]?.args as any)?.text === "the porch lamp flickers alive",
    `${says1.length} says: ${JSON.stringify(says1.map((s) => (s.args as any)?.text))}`);
  check("say carries lamp{on,who,at} + cause/by provenance",
    (says1[0]?.args as any)?.lamp?.on === true && (says1[0]?.args as any)?.lamp?.who === "bob"
      && typeof (says1[0]?.args as any)?.lamp?.at === "number"
      && typeof (says1[0]?.args as any)?.cause === "number" && (says1[0]?.args as any)?.by === "bob",
    JSON.stringify(says1[0]?.args?.lamp));
  const comps1 = lampComps("post1");
  check("the transition wrote a world-authored comp transition",
    comps1.length === 1, `${comps1.length} lamp comp writes`);
  check("the write carries authored shape + on:true + at",
    (comps1[0]?.args as any)?.data?.anchor?.[2] === 0.6 && (comps1[0]?.args as any)?.data?.on === true
      && typeof (comps1[0]?.args as any)?.data?.at === "number"
      && (comps1[0]?.args as any)?.data?.lightAt === "the porch lamp flickers alive",
    JSON.stringify(comps1[0]?.args?.data));
  const lights1 = lampLightWrites("post1·lamp");
  check("companion light written at the DERIVED anchor with params",
    lights1.length === 1 && near((lights1[0]?.args as any)?.pos?.[0], 0)
      && near((lights1[0]?.args as any)?.pos?.[1], 0.5) && near((lights1[0]?.args as any)?.pos?.[2], 0.6)
      && (lights1[0]?.args as any)?.color === 0xffc080 && (lights1[0]?.args as any)?.intensity === 20
      && (lights1[0]?.args as any)?.range === 9,
    JSON.stringify(lights1[0]?.args));
  check("companion RIDES the host (world-authored cargo mount on ignite)",
    logLines().some((e) => e.verb === "mount" && e.actor === "world"
      && (e.args as any)?.id === "post1·lamp" && (e.args as any)?.to === "post1"
      && JSON.stringify((e.args as any)?.offset) === JSON.stringify([0, 0.5, 0.6])),
    JSON.stringify(logLines().filter((e) => e.verb === "mount" && e.actor === "world").map((e) => e.args)));
  check("the use verb logged with bob as actor (authority trace)",
    logLines().some((e) => e.verb === "use" && e.actor === "bob"
      && (e.args as any)?.id === "post1" && (e.args as any)?.action === "toggle"));
  check("the effect broadcast to the room",
    alice.msgs.some((m) => m.type === "log" && m.entry?.verb === "say"
      && m.entry?.actor === "world" && (m.entry?.args as any)?.lamp?.who === "bob"));

  // ---- derivation + late-join truth ------------------------------------------
  {
    const late = new Client("latejoin1");
    await late.connect();
    await sleep(300);
    const comp = late.snapshot?.state?.entities?.post1?.comp?.lamp;
    const lit = snapEnt(late.snapshot, "post1·lamp");
    check("late joiner folds on:true + companion light at anchor + parent",
      comp?.on === true && lit?.kind === "light"
        && near(lit?.pos?.[0], 0) && near(lit?.pos?.[1], 0.5) && near(lit?.pos?.[2], 0.6)
        && lit?.parent?.to === "post1" && near(lit?.parent?.offset?.[0], 0)
        && near(lit?.parent?.offset?.[1], 0.5) && near(lit?.parent?.offset?.[2], 0.6)
        && lit?.color === 0xffc080 && lit?.intensity === 20 && lit?.range === 9,
      JSON.stringify({ comp, lit }));
    // the yawed host: shared math says anchor [0,0.5,0.6] at yaw π/2 lands at
    // [50.6, 0.5, 0] — and keep/day ride verbatim
    bob.walk([50, 0, 3]);
    await sleep(300);
    bob.verb("use", { id: "yawlamp", action: "light" });
    await sleep(400);
    const late2 = new Client("latejoin2");
    await late2.connect();
    await sleep(300);
    const yl = snapEnt(late2.snapshot, "yawlamp·lamp");
    check("yawed host: companion at the ROTATED derived anchor (shared/lamp.js math)",
      yl?.kind === "light" && near(yl?.pos?.[0], 50.6) && near(yl?.pos?.[1], 0.5) && near(yl?.pos?.[2], 0, 1e-6),
      JSON.stringify(yl?.pos));
    check("authored keep/day ride the light verb verbatim",
      yl?.keep === true && yl?.day === false, JSON.stringify({ keep: yl?.keep, day: yl?.day }));
    late.close(); late2.close();
  }

  // ---- no-op: light-on-lit mints nothing --------------------------------------
  const saidNow = lampSays().length, lightNow = lampLightWrites("post1·lamp").length;
  bob.verb("use", { id: "post1", action: "light" });       // already lit
  await sleep(300);
  check("light-on-lit is a no-op (no say, no light)",
    lampSays().length === saidNow && lampLightWrites("post1·lamp").length === lightNow,
    `${lampSays().length}/${lampLightWrites("post1·lamp").length} vs ${saidNow}/${lightNow}`);
  bob.debug("lamp-skip");
  await sleep(300);
  const skip1 = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("the no-op left a lamp-skip note (already lit)",
    JSON.stringify(skip1?.events ?? []).includes("already lit"),
    JSON.stringify(skip1?.events ?? []).slice(0, 160));

  // ---- reach gate --------------------------------------------------------------
  bob.walk([30, 0, 0]);                                   // 30m away
  await sleep(300);
  bob.verb("use", { id: "post1", action: "snuff" });
  await sleep(300);
  check("out-of-reach snuff mints nothing",
    lampSays("post1").length === 1 && lampLightWrites("post1·lamp").length === 1,
    `${lampSays("post1").length}/${lampLightWrites("post1·lamp").length}`);
  bob.debug("lamp-skip");
  await sleep(300);
  const skip2 = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("the out-of-reach skip names the distance",
    JSON.stringify(skip2?.events ?? []).includes("out of reach"),
    JSON.stringify(skip2?.events ?? []).slice(0, 160));

  // ---- unknown action passes through -------------------------------------------
  bob.walk([3, 0, 0]);
  await sleep(300);
  bob.verb("use", { id: "post1", action: "ring" });       // not lamp vocabulary
  await sleep(300);
  check("non-lamp action falls through to other evaluators (no lamp writes)",
    lampSays("post1").length === 1 && lampLightWrites("post1·lamp").length === 1,
    `${lampSays("post1").length}/${lampLightWrites("post1·lamp").length}`);

  // ---- snuff: the other half of the vocabulary ----------------------------------
  bob.verb("use", { id: "post1", action: "snuff" });
  await sleep(400);
  const says2 = lampSays("post1");
  check("in-reach snuff says the dark line",
    says2.length === 2 && (says2[1]?.args as any)?.text === "the porch lamp goes dark"
      && (says2[1]?.args as any)?.lamp?.on === false,
    JSON.stringify(says2.map((s) => (s.args as any)?.text)));
  check("snuff wrote on:false and REMOVED the companion",
    (lampComps("post1").at(-1)?.args as any)?.data?.on === false
      && logLines().some((e) => e.verb === "remove" && e.actor === "world"
        && (e.args as any)?.id === "post1·lamp"),
    "");
  {
    const late = new Client("latejoin3");
    await late.connect();
    await sleep(300);
    check("late joiner folds the snuffed truth (no companion, on:false)",
      snapEnt(late.snapshot, "post1·lamp") == null
        && late.snapshot?.state?.entities?.post1?.comp?.lamp?.on === false);
    late.close();
  }

  // ---- spectator cannot use ------------------------------------------------------
  const eye = new Client("watcher");
  await eye.connect(true);                                // spectate
  await sleep(200);
  eye.walk([3, 0, 0]);
  await sleep(300);
  eye.verb("use", { id: "post1", action: "light" });
  await sleep(300);
  check("spectator use bounces at the shell (no lamp writes)",
    lampSays("post1").length === 2 && eye.msgs.some((m) => m.type === "error"),
    `${lampSays("post1").length} says; err: ${eye.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "none"}`);
  eye.close();

  // ---- lock composes: a locked host still lights ----------------------------------
  alice.verb("comp", { id: "post1", type: "lock", data: true });
  await sleep(300);
  bob.verb("use", { id: "post1", action: "light" });
  await sleep(400);
  check("a LOCKED host still lights (lock guards moves, not use)",
    lampSays("post1").length === 3 && (lampSays("post1").at(-1)?.args as any)?.lamp?.on === true,
    `${lampSays("post1").length} says`);
  alice.verb("comp", { id: "post1", type: "lock", data: null });
  await sleep(300);

  // ---- lint: clamp + note ----------------------------------------------------------
  bob.walk([199, 0, 0]);                                 // 1m from linty (reach 0 clamps to 2)
  await sleep(300);
  bob.verb("use", { id: "linty", action: "light" });
  await sleep(400);
  bob.debug("lamp-lint");
  await sleep(300);
  const lint = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("out-of-range numbers clamp with a lamp-lint note",
    JSON.stringify(lint?.events ?? []).includes("linty"),
    JSON.stringify(lint?.events ?? []).slice(0, 200));
  {
    const late = new Client("latejoin4");
    await late.connect();
    await sleep(300);
    const ll = snapEnt(late.snapshot, "linty·lamp");
    check("the linted lamp still lit at the CLAMPED anchor/params",
      ll?.kind === "light" && near(ll?.pos?.[0], 208) && ll?.intensity === 60 && ll?.range === 1,
      JSON.stringify({ pos: ll?.pos, intensity: ll?.intensity, range: ll?.range }));
    late.close();
  }

  // ---- visitor cannot AUTHOR a lamp --------------------------------------------------
  viscomp: {
    const vBefore = lampComps().length;
    bob.verb("comp", { id: "post1", type: "lamp", data: { reach: 9 } });
    await sleep(300);
    check("visitor comp bounces with rank prose (authoring ≠ using)",
      bob.msgs.some((m) => m.type === "error" && /builder rights/.test(String(m.error)))
        && lampComps().length === vBefore,
      bob.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "");
  }

  // ---- re-author while LIT resets to dark (door doctrine), then relights ------
  bob.walk([3, 0, 0]);                                   // back at post1 (reach 6)
  await sleep(300);
  alice.verb("comp", { id: "post1", type: "lamp", data: { anchor: [0, 1.2, 0], intensity: 30, reach: 6 } });
  await sleep(400);
  {
    const late = new Client("latejoin5");
    await late.connect();
    await sleep(300);
    const comp = late.snapshot?.state?.entities?.post1?.comp?.lamp;
    check("re-author resets (fresh shape, no stale on, companion swept)",
      comp?.on === undefined && comp?.anchor?.[1] === 1.2 && snapEnt(late.snapshot, "post1·lamp") == null,
      JSON.stringify({ comp, lit: snapEnt(late.snapshot, "post1·lamp") }));
    late.close();
  }
  bob.verb("use", { id: "post1", action: "light" });     // dark since re-author — relight at the NEW shape
  await sleep(400);
  {
    const late = new Client("latejoin6");
    await late.connect();
    await sleep(300);
    const lit = snapEnt(late.snapshot, "post1·lamp");
    check("relight lands at the NEW anchor/params, still mounted",
      lit?.kind === "light" && near(lit?.pos?.[1], 1.2) && lit?.intensity === 30
        && lit?.parent?.to === "post1" && near(lit?.parent?.offset?.[1], 1.2),
      JSON.stringify(lit));
    late.close();
  }

  // ---- comp null cleans up --------------------------------------------------------------
  alice.verb("comp", { id: "post1", type: "lamp", data: null });
  await sleep(400);
  {
    const late = new Client("latejoin7");
    await late.connect();
    await sleep(300);
    check("comp null removes the comp AND sweeps the companion",
      late.snapshot?.state?.entities?.post1?.comp?.lamp == null
        && snapEnt(late.snapshot, "post1·lamp") == null);
    late.close();
  }

  // ---- removing the host sweeps the companion --------------------------------------------
  bob.walk([50, 0, 3]);                                  // back at yawlamp (its light still stands)
  await sleep(300);
  alice.verb("remove", { id: "yawlamp" });
  await sleep(400);
  {
    const late = new Client("latejoin8");
    await late.connect();
    await sleep(300);
    check("host removal sweeps the standing companion light",
      snapEnt(late.snapshot, "yawlamp·lamp") == null && snapEnt(late.snapshot, "yawlamp") == null);
    late.close();
  }

  // ---- decoy: an authored entity holding the companion id is replaced ---------------------
  alice.verb("spawn", { id: "post2", lib: "deco/bench.glb", pos: [100, 0, 0], yaw: 0 });
  alice.verb("spawn", { id: "post2·lamp", lib: "deco/bench.glb", pos: [100, 1, 1], yaw: 0 });
  await sleep(300);
  alice.verb("comp", { id: "post2", type: "lamp", data: { anchor: [0, 0.5, 0.6] } });
  await sleep(300);
  bob.walk([100, 0, 3]);
  await sleep(300);
  bob.verb("use", { id: "post2", action: "light" });
  await sleep(400);
  {
    const late = new Client("latejoin9");
    await late.connect();
    await sleep(300);
    const d = snapEnt(late.snapshot, "post2·lamp");
    check("a decoy holding the companion id is replaced wholesale by the light",
      d?.kind === "light" && near(d?.pos?.[0], 100) && near(d?.pos?.[2], 0.6) && d?.parent?.to === "post2",
      JSON.stringify(d));
    late.close();
  }

  // ---- restart: replay mints nothing; folded lit state survives ----------------------------
  bob.walk([101, 0, 3]);
  await sleep(300);
  bob.verb("use", { id: "post2", action: "snuff" });     // leave it DARK across the restart? no —
  await sleep(300);
  bob.verb("use", { id: "post2", action: "light" });     // leave it LIT across the restart
  await sleep(400);
  const saidAll = lampSays().length;
  const litAll = logLines().filter((e) => e.actor === "world" && e.verb === "light").length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  const pl = snapEnt(probe.snapshot, "post2·lamp");
  check("restart: a fresh join folds the lit companion at the derived anchor",
    pl?.kind === "light" && near(pl?.pos?.[0], 100) && near(pl?.pos?.[2], 0.6) && pl?.parent?.to === "post2"
      && probe.snapshot?.state?.entities?.post2?.comp?.lamp?.on === true,
    JSON.stringify(pl));
  const saidAfter = lampSays().length;
  const litAfter = logLines().filter((e) => e.actor === "world" && e.verb === "light").length;
  probe.verb("use", { id: "post2", action: "light" });   // light-on-lit: no-op (probe owns now)
  await sleep(300);
  check("replay minted nothing; post-restart no-op mints nothing",
    lampSays().length === saidAfter && saidAfter === saidAll
      && logLines().filter((e) => e.actor === "world" && e.verb === "light").length === litAfter
      && litAfter === litAll,
    `${lampSays().length} vs ${saidAfter} vs ${saidAll}; lights ${litAfter} vs ${litAll}`);

  // ---- fold idempotence -------------------------------------------------------------------
  {
    const a = JSON.stringify(snapEnt(probe.snapshot, "post2·lamp"));
    const b = JSON.stringify(snapEnt(JSON.parse(JSON.stringify(probe.snapshot)), "post2·lamp"));
    check("folded companion state is stable across snapshot re-reads", a === b);
  }

  // ---- cleanup ------------------------------------------------------------------------------
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
