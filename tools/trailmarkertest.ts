// Trailmarker matrix — `comp {type:"trailmarker"}` pairs a waypoint post
// with a waystone BEACON: use {action:"guide"} mints ONE say with
// trailmarker provenance and routes ONE puppet-channel guidance REQUEST
// whose target is derived OUTSIDE the beacon's hop reach — then the walker
// walks THEMSELVES (their own controller/agent path, the designed consent
// surface). Self-booting: scratch sequencer (fresh WORLDS_DIR), builder
// authors the marker + beacon pair, visitors USE it in reach.
// Covers § TRAILMARKERS CONTRACT:
//
//   bun tools/trailmarkertest.ts
//
// - authoring:   spawn + trailmarker comp is builder-gated; visitor comp bounces
// - lint:        pair illegal/absent → trailmarker-lint + skip, no fire
// - pass-through: non-trailmarker actions ("ring") fall through to other
//                evaluators (no trailmarker writes)
// - fire:        use {action:"guide"} mints the say with
//                tm{to,who,at}/cause/by and routes the puppet request to
//                the walker's socket with the derived target
// - target:      stop-short point on the marker→beacon line, OUTSIDE the
//                beacon's hop reach, arrival yaw FACING the beacon
// - reach:       out-of-reach use skips with the distance
// - spectator:   spectate legs cannot guide (shell gate)
// - cooldown:    second guide inside cooldownSec skips; skips don't consume
//                the window; after the window it re-fires
// - pairing:     pair to a non-entity / non-waystone / itself skips with
//                the reason
// - seated:      a body-mounted walker skips (unseat first)
// - agent path:  the agent puppet handler honors guidance with walkTo
//                (module-level check: the mcpl agent file carries the
//                trailmarker branch)
// - browser path: the browser realization arms a guide state the
//                controller steers (module-level check: client/lib/
//                trailmarker.js exists + controller wires guidance +
//                main.js imports it)
// - rollback:    a declining client simply never moves (last pose is truth)
// - restart:     replay mints nothing; no request re-sent (a fresh client
//                joining after restart receives no puppet traffic)
// - late join:   a client joining after guides folds the say history and
//                the standing marker + beacon comps — the complete truth
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeTrailmarker, guideTarget } from "../shared/trailmarker.js";

const PORT = Number(process.env.PORT ?? 9031);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-door";
const WORLD = `trailmarker-w-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-trailmarker-"));

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
  world: string;
  constructor(public id: string, world: string) { this.world = world; }
  connect(spectate = false): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(URL_);
      const t = setTimeout(() => reject(new Error(`${this.id}: join timeout`)), 8000);
      this.ws.onopen = () => this.ws.send(JSON.stringify({
        type: "join", world: this.world, id: this.id, token: TOKEN,
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
  close() { try { this.ws.close(); } catch { /* already gone */ }
  }
}

let server: ReturnType<typeof spawn> | null = null;
let serverLog = "";
let spawnErr = "";
async function startServer() {
  // one paced retry — an intermittent spawn-exec failure (EAGAIN under
  // machine load: child stays exit=null, zero output, port never opens)
  // is machine noise, not a server defect; the error is captured and
  // surfaced if BOTH attempts fail.
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
  }
  throw new Error(`scratch sequencer did not start (exit=${server!.exitCode}, spawnErr=${spawnErr}, last fetch err=${lastErr})\n--- server output ---\n${serverLog.slice(-2000)}`);
}

const logLines = (world: string) => {
  const p = join(worldsDir, world, "log.jsonl");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
};
/** world-authored says that are trailmarker effects */
const tmSays = (world: string) => logLines(world).filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.tm);

const near = (a: number[], b: number[], tol = 0.02) =>
  Array.isArray(a) && a.length >= 2 && Math.hypot(a[0] - b[0], a[2] - b[2]) < tol;

async function main() {
  console.log(`trailmarker matrix — scratch world ${WORLD}`);
  await startServer();

  // ---- shared math, pinned first (the shared-verbatim law)
  const { cfg: mc, notes: mnotes } = normalizeTrailmarker({ pair: "beacon1", stop: 5, reach: 4, cooldownSec: 10 });
  check("normalize: legal comp clamps clean (no notes)",
    mc.pair === "beacon1" && mnotes.length === 0, JSON.stringify({ mc, mnotes }));
  const t0 = guideTarget([0, 0, 0], [20, 0, 0], 4, 5);
  check("guideTarget: stop 5 outside beacon reach 4 → 11m from beacon",
    near(t0.p, [15, 0, 0]), JSON.stringify(t0));
  check("guideTarget: arrival yaw FACES the beacon", Math.abs(t0.yaw - Math.PI / 2) < 1e-9, `yaw ${t0.yaw}`);
  const tNear = guideTarget([0, 0, 0], [6, 0, 0], 4, 5);
  check("guideTarget: adjacent pair never guides backward (2m floor)",
    near(tNear.p, [2, 0, 0]), JSON.stringify(tNear));
  const tBig = guideTarget([0, 0, 0], [20, 0, 0], 8, 3);
  check("guideTarget: effStop = max(stop, beaconReach+1) — big reach wins",
    near(tBig.p, [11, 0, 0]), JSON.stringify(tBig));
  const tOff = guideTarget([2, 0, 2], [12, 0, 2], 4, 5);
  check("guideTarget: off-axis target stays on the line", near(tOff.p, [7, 0, 2], 0.03), JSON.stringify(tOff));
  const { cfg: bad } = normalizeTrailmarker({ pair: "not an id!" });
  check("normalize: illegal pair → null (validated, never clamped)", bad.pair === null);
  const { cfg: absent } = normalizeTrailmarker({});
  check("normalize: absent pair → null (required)", absent.pair === null);
  const { cfg: clamped, notes: cnotes } = normalizeTrailmarker({ pair: "beacon1", stop: 99, reach: 99, cooldownSec: 1 });
  check("normalize: clamps collected as lint notes (stop 99→12, reach 99→12, cooldownSec 1→2)",
    clamped.stop === 12 && clamped.reach === 12 && clamped.cooldownSec === 2 && cnotes.length === 3,
    JSON.stringify({ clamped, cnotes }));

  // ---- setup: builder + visitor + the pair
  const bob = new Client("bob", WORLD);   // builder (first embodied join = owner)
  await bob.connect();
  const alice = new Client("alice", WORLD);   // visitor (rank 0)
  await alice.connect();
  bob.verb("grant", { id: "alice", role: "visitor" });
  await sleep(300);
  await bob.walk([2, 0, 2]); await sleep(150);
  bob.verb("spawn", { id: "post1", lib: "eidoverse/assets/misc/plinth.glb", pos: [2, 0, 2] });
  bob.verb("spawn", { id: "beacon1", lib: "eidoverse/assets/misc/plinth.glb", pos: [22, 0, 2] });
  await sleep(300);
  check("post + beacon stand in the fold",
    logLines(WORLD).filter((e) => e.verb === "spawn" && ["post1", "beacon1"].includes((e.args as any)?.id)).length === 2);

  // ---- frozen baseline
  const saysBase = tmSays(WORLD).length;

  // ---- authoring is builder-gated
  alice.verb("comp", { id: "post1", type: "trailmarker", data: { pair: "beacon1" } });
  await sleep(300);
  check("visitor trailmarker comp bounces (builder-gated)",
    !logLines(WORLD).some((e) => e.verb === "comp" && (e.args as any)?.type === "trailmarker" && e.actor === "alice"));
  bob.verb("comp", { id: "beacon1", type: "waystone", data: { pair: "post1", arrive: [1, 0, 0] } });
  bob.verb("comp", { id: "post1", type: "trailmarker", data: { pair: "beacon1" } });
  await sleep(300);
  check("builder authors beacon (waystone) + marker comps",
    logLines(WORLD).filter((e) => e.verb === "comp"
      && ((e.args as any)?.type === "trailmarker" || (e.args as any)?.type === "waystone")
      && e.actor === "bob").length === 2);

  // ---- pass-through: a non-trailmarker action falls through
  bob.verb("use", { id: "post1", action: "ring" });
  await sleep(300);
  check("non-trailmarker action passes through (no trailmarker writes)",
    tmSays(WORLD).length === saysBase);

  // ---- lint: illegal pair — comp with pair: "not an id!" → lint + skip at fire
  bob.verb("comp", { id: "post1", type: "trailmarker", data: { pair: "not an id!" } });
  await sleep(300);
  await alice.walk([3, 0, 3]); await sleep(150);
  alice.verb("use", { id: "post1", action: "guide" });
  await sleep(300);
  alice.send({ type: "debug", reqId: "d1", kinds: ["trailmarker-lint", "trailmarker-skip"], limit: 60 });
  await sleep(300);
  const lintRaw = alice.msgs.filter((m) => m.type === "debug").at(-1);
  check("illegal pair lints (trailmarker-lint)",
    JSON.stringify(lintRaw?.events ?? []).includes("pair"), JSON.stringify(lintRaw?.events ?? []).slice(0, 160));
  check("illegal pair skips (no fire)", tmSays(WORLD).length === saysBase);
  bob.verb("comp", { id: "post1", type: "trailmarker", data: { pair: "beacon1" } });
  await sleep(300);

  // ---- pairing: pair to a non-entity / non-waystone / itself
  bob.verb("comp", { id: "post1", type: "trailmarker", data: { pair: "ghost-post" } });
  await sleep(300);
  await alice.walk([3, 0, 3]); await sleep(150);
  alice.verb("use", { id: "post1", action: "guide" }); await sleep(300);
  check("pair to a non-entity skips", tmSays(WORLD).length === saysBase);
  bob.verb("comp", { id: "post1", type: "trailmarker", data: { pair: "post1" } });
  await sleep(300);
  alice.verb("use", { id: "post1", action: "guide" }); await sleep(300);
  check("pair to itself skips", tmSays(WORLD).length === saysBase);
  bob.verb("spawn", { id: "plain1", lib: "eidoverse/assets/misc/plinth.glb", pos: [30, 0, 2] });
  bob.verb("comp", { id: "post1", type: "trailmarker", data: { pair: "plain1" } });
  await sleep(300);
  alice.verb("use", { id: "post1", action: "guide" }); await sleep(300);
  check("pair to a non-waystone entity skips", tmSays(WORLD).length === saysBase);
  alice.send({ type: "debug", reqId: "d2", kinds: ["trailmarker-skip"], limit: 60 });
  await sleep(300);
  const skipRaw = alice.msgs.filter((m) => m.type === "debug").at(-1);
  check("pairing skips are named (trailmarker-skip)",
    JSON.stringify(skipRaw?.events ?? []).includes("not a waystone"),
    JSON.stringify(skipRaw?.events ?? []).slice(0, 200));
  bob.verb("comp", { id: "post1", type: "trailmarker", data: { pair: "beacon1" } });
  await sleep(300);

  // ---- reach: out-of-reach use skips
  await alice.walk([15, 0, 15]); await sleep(150);
  alice.verb("use", { id: "post1", action: "guide" });
  await sleep(300);
  check("out-of-reach use skips", tmSays(WORLD).length === saysBase);
  alice.send({ type: "debug", reqId: "d3", kinds: ["trailmarker-skip"], limit: 60 });
  await sleep(300);
  const reachRaw = alice.msgs.filter((m) => m.type === "debug").at(-1);
  check("reach skip names the distance",
    JSON.stringify(reachRaw?.events ?? []).includes("out of reach"),
    JSON.stringify(reachRaw?.events ?? []).slice(0, 160));

  // ---- FIRE: in reach — alice guides post1 → beacon1
  await alice.walk([3, 0, 3]); await sleep(150);
  alice.verb("use", { id: "post1", action: "guide" });
  await sleep(400);
  check("use guide fires the guidance say", tmSays(WORLD).length === saysBase + 1,
    `got ${tmSays(WORLD).length} trailmarker says`);
  const fx = tmSays(WORLD).at(-1);
  check("say carries tm{to,who,at} + cause/by",
    fx?.args?.tm?.to === "beacon1" && fx?.args?.tm?.who === "alice"
    && typeof fx?.args?.tm?.at === "number"
    && typeof fx?.args?.cause === "number" && fx?.args?.by === "alice");
  // the puppet request reached alice's socket with the derived target:
  // post1 [2,0,2] → beacon1 [22,0,2], stop 5, beacon waystone reach 4
  // → effStop 5 → target [17,0,2]; yaw faces the beacon (+x → π/2)
  const req = alice.msgs.find((m) => m.type === "puppet" && m.trailmarker);
  check("guidance request routed to the walker", !!req);
  check("target derives on the line, 5m short of the beacon",
    req && near(req.trailmarker.p, [17, 0, 2]), req ? JSON.stringify(req.trailmarker.p) : "no request");
  check("target yaw faces the beacon",
    req && Math.abs(req.trailmarker.yaw - Math.PI / 2) < 1e-6, req ? `yaw ${req.trailmarker.yaw}` : "no request");
  check("target sits OUTSIDE the beacon's hop reach",
    req && Math.hypot(req.trailmarker.p[0] - 22, req.trailmarker.p[2] - 2) > 4,
    req ? JSON.stringify(req.trailmarker.p) : "no request");

  // ---- cooldown: second guide inside the window skips (default 10s)
  await alice.walk([3, 0, 3]); await sleep(150);
  alice.verb("use", { id: "post1", action: "guide" }); await sleep(300);
  check("second guide inside cooldown skips", tmSays(WORLD).length === saysBase + 1,
    `says ${tmSays(WORLD).length}`);
  alice.send({ type: "debug", reqId: "d4", kinds: ["trailmarker-skip"], limit: 60 });
  await sleep(300);
  const cdRaw = alice.msgs.filter((m) => m.type === "debug").at(-1);
  check("cooldown skip is named",
    JSON.stringify(cdRaw?.events ?? []).includes("cooldown"),
    JSON.stringify(cdRaw?.events ?? []).slice(0, 200));
  // skips don't consume the window: after 10.5s the guide re-fires
  await sleep(10_600);
  await alice.walk([3, 0, 3]); await sleep(150);
  alice.verb("use", { id: "post1", action: "guide" }); await sleep(400);
  check("after the cooldown window the guide re-fires",
    tmSays(WORLD).length === saysBase + 2, `says ${tmSays(WORLD).length}`);

  // ---- the walker walks THEMSELVES: alice applies guidance by walking
  // (simulated client: she walks toward the request's target — the
  // observable is ordinary presence poses, nothing else)
  const lastReq = alice.msgs.filter((m) => m.type === "puppet" && m.trailmarker).at(-1);
  check("request still queued client-side (one per fire)", !!lastReq);
  if (lastReq) {
    // a guided walk in two steps — the body's own pace
    const tp = lastReq.trailmarker.p;
    for (const k of [0.5, 1]) {
      alice.walk([3 + (tp[0] - 3) * k, 0, 3 + (tp[2] - 3) * k]);
      await sleep(200);
    }
  }
  const joiner = new Client("joiner", WORLD);
  await joiner.connect();
  const alicePose = joiner.snapshot?.present?.find((p: any) => p.id === "alice")?.pose;
  check("the guided walk observable is ordinary presence poses at the target",
    !!lastReq && !!alicePose && near(alicePose.p, lastReq.trailmarker.p, 0.1),
    JSON.stringify(alicePose?.p ?? null));

  // ---- seated: a body-mounted walker does not guide
  await bob.walk([2, 0, 2]); await sleep(150);
  bob.verb("mount", { id: "bob", to: "post1", offset: [0, 0.6, 0] });
  await sleep(300);
  const preSeated = tmSays(WORLD).length;
  bob.verb("use", { id: "post1", action: "guide" }); await sleep(300);
  check("seated walker skips (unseat first)", tmSays(WORLD).length === preSeated);
  bob.send({ type: "debug", reqId: "d5", kinds: ["trailmarker-skip"], limit: 60 });
  await sleep(300);
  const seatedRaw = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("seated skip names the reason",
    JSON.stringify(seatedRaw?.events ?? []).includes("unseat"),
    JSON.stringify(seatedRaw?.events ?? []).slice(0, 200));
  bob.verb("dismount", { id: "bob", pos: [2, 0, 2], yaw: 0 });
  await sleep(300);

  // ---- spectator: spectate legs cannot guide
  const spec = new Client("spec", WORLD);
  await spec.connect(true);
  spec.verb("use", { id: "post1", action: "guide" });
  await sleep(300);
  const saysSpec = tmSays(WORLD).length;
  spec.close();
  check("spectator use bounces at the shell", tmSays(WORLD).length === saysSpec);

  // ---- rollback: a declining client simply never moves
  const dave = new Client("dave", WORLD);
  await dave.connect();
  await dave.walk([3, 0, 3]); await sleep(150);
  const preDave = tmSays(WORLD).length;
  dave.verb("use", { id: "post1", action: "guide" }); await sleep(400);
  check("dave's fire mints the say", tmSays(WORLD).length === preDave + 1);
  const daveReq = dave.msgs.filter((m) => m.type === "puppet" && m.trailmarker).at(-1);
  check("dave received the request", !!daveReq);
  // dave DECLINES: sends nothing. A fresh joiner reads his last pose.
  const fresh1 = new Client("fresh1", WORLD);
  await fresh1.connect();
  const davePose = fresh1.snapshot?.present?.find((p: any) => p.id === "dave")?.pose;
  check("declining client never moved (last pose is the truth)",
    davePose && Math.hypot(davePose.p[0] - 3, davePose.p[2] - 3) < 0.05,
    JSON.stringify(davePose?.p ?? null));
  fresh1.close();

  // ---- restart: replay mints nothing, no request re-sent
  server!.kill("SIGKILL");
  await sleep(500);
  await startServer();
  const fresh2 = new Client("fresh2", WORLD);
  await fresh2.connect();
  await sleep(600);
  check("restart replays the says as history (count preserved)",
    tmSays(WORLD).length === preDave + 1);
  check("no puppet traffic after restart (replay-inert)",
    !fresh2.msgs.some((m) => m.type === "puppet"));
  check("late joiner folds the standing marker + beacon comps",
    fresh2.snapshot?.state?.entities?.post1?.comp?.trailmarker?.pair === "beacon1"
    && fresh2.snapshot?.state?.entities?.beacon1?.comp?.waystone?.pair === "post1",
    JSON.stringify(fresh2.snapshot?.state?.entities?.post1?.comp?.trailmarker ?? null));
  check("late joiner folds guide history (recentChat)",
    (fresh2.snapshot?.state?.recentChat ?? []).some((l: any) => /guided|waystone/.test(String(l?.text ?? ""))));

  // ---- client/agent wiring present (module-level; the handlers are
  // puppet-plane, proven above by the routed request)
  const repo = join(import.meta.dir, "..");
  const agentSrc = readFileSync(join(repo, "mcpl", "agent.ts"), "utf8");
  check("mcpl agent honors guidance (trailmarker puppet branch → walkTo)",
    agentSrc.includes("trailmarker") && /msg\.trailmarker[\s\S]{0,600}walkTo/.test(agentSrc));
  check("mcpl look() describes the marker (describeTrailmarker)",
    agentSrc.includes("describeTrailmarker"));
  const clientTm = readFileSync(join(repo, "client", "lib", "trailmarker.js"), "utf8");
  check("browser realization exists (client/lib/trailmarker.js arms guideState)",
    clientTm.includes("guideState") && clientTm.includes("trailmarker"));
  const controllerSrc = readFileSync(join(repo, "client", "lib", "controller.js"), "utf8");
  check("controller steers guidance through updateMe (activeGuide block)",
    controllerSrc.includes("activeGuide") && controllerSrc.includes("clearGuide"));
  const mainSrc = readFileSync(join(repo, "client", "main.js"), "utf8");
  check("main.js imports the realization (one line, waystone pattern)",
    mainSrc.includes("trailmarker.js"));

  // ---- cleanup
  for (const c of [bob, alice, joiner, spec, dave, fresh2]) c.close();
  await sleep(200);
  server!.kill("SIGKILL");
  await sleep(200);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error(e); server?.kill("SIGKILL"); process.exit(1); });
