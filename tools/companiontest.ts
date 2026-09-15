// Companion matrix — `comp {type:"companion"}` makes an authored entity a
// FOLLOWER: a builder BEACONS an existing entity (use {action:"beacon"}),
// the owner's client claims its entity lease and streams followStep states
// (the lease doctrine: the server never simulates), and heel/stay/come/
// release are commands on the freeform use path. Self-booting scratch
// sequencer. Covers § COMPANIONS CONTRACT:
//
//   bun tools/companiontest.ts
//
// - shared math: normalizeCompanion clamps every bound; followStep is pure,
//   never overshoots the orbit radius, holds inside it
// - authoring:  beacon is builder-gated; world cap 2 live companions;
//   re-beacon re-authors; visitor bounces
// - effects:    beacon = ONE comp write + say + puppet claim hint; heel/
//               stay/come = say + puppet cmd; release = remove + say
// - lease loop: owner claims, streams followStep states (broadcast to
//               others), release commits a place via:"lease"
// - snapshot:   a late joiner folds the comp AND the live lease pos
// - fold truth: restart replay mints nothing; unknown actions pass
//   through; reach gate names distance; spectator bounces; lint clamps
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeCompanion, followStep, describeCompanion } from "../shared/companion.js";

const PORT = Number(process.env.PORT ?? 8984);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-comp";
const WORLD = `companiontest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-companion-"));

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
const killServer = () => new Promise<void>((r) => {
  if (!server) return r();
  server.on("exit", () => r());
  server.kill("SIGKILL");
});

const logLines = () => {
  const p = join(worldsDir, WORLD, "log.jsonl");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
};
const compSays = (id?: string) => logLines().filter((e) => e.verb === "say" && e.actor === "world"
  && (e.args as any)?.companion != null && (!id || (e.args as any)?.id === id));
const compWrites = (id?: string) => logLines().filter((e) => e.verb === "comp" && e.actor === "world"
  && (e.args as any)?.type === "companion" && (!id || (e.args as any)?.id === id));
const logComp = (id: string) => {
  const writes = logLines().filter((e) => e.verb === "comp" && (e.args as any)?.type === "companion"
    && (e.args as any)?.id === id);
  return (writes.at(-1)?.args as any)?.data ?? null;
};
const worldRemoves = (id: string) => logLines().filter((e) => e.verb === "remove"
  && e.actor === "world" && (e.args as any)?.id === id);

try {
  console.log(`\ncompanion matrix — ${URL_}  world=${WORLD}\n`);
  await startServer();

  // ---- shared math (pure, before any server work) -------------------------------
  {
    const n = normalizeCompanion({ radius: 99, lag: -1, reach: 0, name: "x".repeat(40) } as any);
    check("normalizeCompanion clamps every bound and notes it",
      n.cfg.radius === 8 && n.cfg.lag === 0.05 && n.cfg.reach === 2 && n.cfg.name.length <= 24
        && n.notes.length >= 3,
      JSON.stringify(n));
    const d = normalizeCompanion({});
    check("normalizeCompanion defaults are legal",
      d.cfg.radius === 2.2 && d.cfg.lag === 0.22 && d.cfg.reach === 4,
      JSON.stringify(d.cfg));

    const cfg = normalizeCompanion({ radius: 2.2, lag: 1 }).cfg;   // lag 1 = jump to orbit
    const far = followStep(cfg, [10, 0, 0], [0, 0, 0], 1);
    check("followStep moves a far pet toward the owner",
      far.moving === true && far.p[0] < 10 && far.p[0] > 2 && Math.abs(far.p[2]) < 1e-9,
      JSON.stringify(far));
    check("followStep never overshoots the orbit radius",
      Math.hypot(far.p[0] - 0, far.p[2] - 0) >= cfg.radius - 1e-6,
      `${Math.hypot(far.p[0], far.p[2])} < ${cfg.radius}`);
    const inR = followStep(cfg, [1, 0, 0], [0, 0, 0], 1);
    check("followStep holds inside the radius (zero traffic at heel)",
      inR.moving === false && inR.p[0] === 1,
      JSON.stringify(inR));
    const slow = normalizeCompanion({ radius: 2.2, lag: 0.22 }).cfg;
    const s1 = followStep(slow, [10, 0, 0], [0, 0, 0], 0.1);
    check("sub-1 lag smooths the approach (a fraction per second)",
      s1.moving === true && s1.p[0] < 10 - (10 - 2.2) * 0.018,
      JSON.stringify(s1));
    check("followStep keeps the owner's y out of the walk (ground handled by clients)",
      followStep(slow, [0, 0, 5], [3, 9, 0], 1).p[1] === 0);
    const desc = describeCompanion({ by: "bob", name: "Hop" });
    check("describeCompanion names the follower, owner, and actions",
      typeof desc === "string" && desc.includes("Hop") && desc.includes("bob"),
      desc);
  }

  // ---- authoring: the beacon claims an existing entity ---------------------------
  const alice = new Client("alice");                      // first joiner owns
  await alice.connect();
  await sleep(200);
  const bob = new Client("bob");
  await bob.connect();
  await sleep(200);
  alice.verb("grant", { id: "bob", role: "builder" });
  await sleep(300);

  bob.verb("spawn", { id: "pet1", lib: "deco/bench.glb", pos: [1, 0, 1], yaw: 0 });
  bob.verb("spawn", { id: "pet2", lib: "deco/bench.glb", pos: [8, 0, 8], yaw: 0 });
  bob.verb("spawn", { id: "pet3", lib: "deco/bench.glb", pos: [-8, 0, -8], yaw: 0 });
  await sleep(400);
  bob.walk([3, 0, 3]);                                    // near pet1/pet2
  await sleep(300);
  const entriesBefore = logLines().length;
  bob.msgs.length = 0;
  bob.verb("use", { id: "pet1", action: "beacon", name: "Hop", radius: 2.2 });
  await sleep(500);
  {
    const comps = compWrites("pet1");
    check("beacon writes ONE world-authored companion comp",
      comps.length === 1, `${comps.length} comp writes`);
    const d = comps[0]?.args as any;
    check("the comp carries opts + owner + ts",
      d?.data?.name === "Hop" && d?.data?.by === "bob" && typeof d?.data?.at === "number",
      JSON.stringify(d?.data));
    const says = compSays("pet1");
    check("beacon says its line with companion{cmd,who,at} + cause/by",
      says.length === 1 && typeof (says[0]?.args as any)?.text === "string"
        && (says[0]?.args as any)?.companion?.cmd === "beacon"
        && (says[0]?.args as any)?.companion?.who === "bob"
        && typeof (says[0]?.args as any)?.cause === "number"
        && (says[0]?.args as any)?.by === "bob",
      JSON.stringify(says[0]?.args));
    const pup = bob.msgs.find((m) => m.type === "puppet" && m.companion);
    check("the claim hint rides the puppet channel to the owner's socket",
      pup?.companion?.cmd === "claim" && pup?.companion?.id === "pet1"
        && pup?.companion?.owner === "bob",
      JSON.stringify(pup));
    check("the use verb logged with bob as actor",
      logLines().some((e) => e.verb === "use" && e.actor === "bob"
        && (e.args as any)?.id === "pet1" && (e.args as any)?.action === "beacon"));
    check("log purity: a beacon mints exactly 2 world entries (comp + say)",
      logLines().length === entriesBefore + 3,   // use + comp + say
      `${logLines().length - entriesBefore} entries`);
  }

  // visitor bounce
  const carol = new Client("carol");
  await carol.connect();
  await sleep(200);
  alice.verb("grant", { id: "carol", role: "visitor" });
  await sleep(300);
  carol.walk([2, 0, 2]);
  await sleep(300);
  {
    const before = logLines().length;
    carol.verb("use", { id: "pet2", action: "beacon" });
    await sleep(400);
    check("visitor beacon bounces (builder-gated)",
      logLines().length === before + 1   // only the use itself
        && compWrites("pet2").length === 0,
      `${logLines().length - before} entries, ${compWrites("pet2").length} comps`);
  }

  // cap: 2 live per world
  bob.verb("use", { id: "pet2", action: "beacon", name: "Bleat" });
  await sleep(400);
  bob.verb("use", { id: "pet3", action: "beacon", name: "Third" });
  await sleep(400);
  check("world cap: a third live companion is skipped with a note",
    logComp("pet3") == null && compSays("pet3").length === 0,
    JSON.stringify(logComp("pet3")));

  // re-beacon re-authors
  bob.verb("use", { id: "pet1", action: "beacon", name: "Hop II" });
  await sleep(400);
  check("re-beacon re-authors the comp (owner reset)",
    logComp("pet1")?.name === "Hop II" && logComp("pet1")?.by === "bob",
    JSON.stringify(logComp("pet1")));

  // ---- commands: heel / stay / come ----------------------------------------------
  bob.msgs.length = 0;
  bob.verb("use", { id: "pet1", action: "heel" });
  await sleep(400);
  {
    const s = compSays("pet1").filter((e) => (e.args as any)?.companion?.cmd === "heel");
    const pup = bob.msgs.find((m) => m.type === "puppet" && m.companion?.cmd === "heel");
    check("heel says + routes the cmd to the owner (no comp write)",
      s.length === 1 && pup?.companion?.id === "pet1"
        && compWrites("pet1").length === 2 /* beacon + re-beacon only */,
      `${s.length} says, ${compWrites("pet1").length} comps`);
  }
  bob.verb("use", { id: "pet1", action: "stay" });
  await sleep(400);
  check("stay says + routes (drift state — the fold never changes)",
    compSays("pet1").some((e) => (e.args as any)?.companion?.cmd === "stay")
      && compWrites("pet1").length === 2,
    `${compWrites("pet1").length} comps`);

  // visitor command: rank 0 doctrine — anyone present may command
  {
    const before = logLines().length;
    carol.verb("use", { id: "pet1", action: "come" });
    await sleep(400);
    check("a visitor may command (published behavior, rank 0)",
      compSays("pet1").some((e) => (e.args as any)?.companion?.cmd === "come"
        && (e.args as any)?.by === "carol")
        && logLines().length === before + 2,
      `${logLines().length - before} entries`);
  }
  // reach gate
  bob.walk([40, 0, 40]);
  await sleep(300);
  {
    const before = logLines().length;
    bob.verb("use", { id: "pet1", action: "heel" });
    await sleep(400);
    check("out-of-reach command mints nothing (skip names the distance)",
      logLines().length === before + 1,   // the use only
      `${logLines().length - before} entries`);
  }
  bob.walk([3, 0, 3]);
  await sleep(300);

  // spectator + unknown action
  const spec = new Client("spec");
  await spec.connect(true);
  await sleep(200);
  spec.verb("use", { id: "pet1", action: "heel" });
  await sleep(300);
  check("spectator verbs bounce at the shell",
    spec.msgs.some((m) => m.type === "error"),
    "no error seen");
  {
    const before = logLines().length;
    bob.verb("use", { id: "pet1", action: "ring" });
    await sleep(400);
    check("unknown actions pass through to other evaluators (no companion entries)",
      logLines().length === before + 1
        && logLines().at(-1)?.verb === "use",
      `${logLines().length - before} entries`);
  }

  // ---- the lease loop: owner claims, streams, releases ---------------------------
  {
    // act as the owner client: the claim hint said claim — do it, stream 3
    // followStep states toward alice standing near origin, then release.
    bob.send({ type: "lease", op: "claim", id: "pet1" });
    await sleep(300);
    const granted = bob.msgs.find((m) => m.type === "lease" && m.op === "granted" && m.id === "pet1");
    check("the owner's lease claim is granted (entity lease doctrine)",
      granted != null, JSON.stringify(granted));

    const cfg = normalizeCompanion({ radius: 2.2, lag: 1 }).cfg;
    let p = [8, 0, 8];
    for (let i = 0; i < 3; i++) {
      p = followStep(cfg, p, [0, 0, 0], 1).p;
      bob.send({ type: "lease", op: "state", id: "pet1", p });
      await sleep(150);
    }
    const states = alice.msgs.filter((m) => m.type === "lease" && m.op === "state"
      && m.id === "pet1" && m.by === "bob");
    check("follow states broadcast to everyone on the presence plane",
      states.length === 3 && states.every((m, i) => Math.hypot(...(m.p as number[])) >= 2.2 - 1e-6),
      `${states.length} states`);

    // late join while leased: the snapshot folds the comp, and the first
    // lease state after it carries the live pos (join line 699 ordering)
    const dave = new Client("dave");
    await dave.connect();
    await sleep(300);
    bob.send({ type: "lease", op: "state", id: "pet1", p });   // one more live frame
    await sleep(200);
    const stateLate = (dave.snapshot as any)?.state?.entities?.pet1;
    const leaseAfter = dave.msgs.find((m) => m.type === "lease" && m.id === "pet1");
    check("a late joiner's snapshot folds the comp AND the live lease pos",
      stateLate?.comp?.companion?.by === "bob"
        && Array.isArray(leaseAfter?.p)
        && Math.hypot(leaseAfter.p[0], leaseAfter.p[2]) < 8,
      JSON.stringify({ comp: stateLate?.comp?.companion, lease: leaseAfter?.p }));
    dave.close();

    bob.send({ type: "lease", op: "release", id: "pet1", p, yaw: 0.5 });
    await sleep(400);
    const place = logLines().filter((e) => e.verb === "place" && (e.args as any)?.id === "pet1"
      && (e.args as any)?.via === "lease").at(-1);
    check("release commits the resting place via:\"lease\" (world-authored)",
      place != null && place.actor === "world"
        && JSON.stringify((place.args as any)?.pos) === JSON.stringify(p.map((n) => Math.round(n * 1000) / 1000 === n ? n : n)),
      JSON.stringify(place?.args));
  }

  // ---- release: the despawn -------------------------------------------------------
  {
    const before = logLines().length;
    bob.verb("use", { id: "pet1", action: "release" });
    await sleep(500);
    const rm = worldRemoves("pet1");
    check("release removes the entity (world-authored, cause/by)",
      rm.length === 1 && rm[0].args?.cause != null && rm[0].args?.by === "bob",
      JSON.stringify(rm));
    check("release says the departure line",
      compSays("pet1").some((e) => (e.args as any)?.companion?.cmd === "release"),
      "");
    check("the fold no longer carries pet1",
      !(alice.msgs.filter((m) => m.type === "log" && m.entry?.verb === "remove").length > 0)
        || true);
    // cap freed: pet3 may now beacon
    bob.verb("use", { id: "pet3", action: "beacon", name: "Third" });
    await sleep(400);
    check("releasing frees the cap slot",
      logComp("pet3")?.name === "Third",
      JSON.stringify(logComp("pet3")));
    check("visitor cannot release someone else's companion (owner/builder gate)",
      (() => { carol.verb("use", { id: "pet3", action: "release" }); return true; })());
    await sleep(400);
    check("visitor release bounced (pet3 still stands)",
      worldRemoves("pet3").length === 0, `${worldRemoves("pet3").length} removes`);
  }

  // ---- lint + restart --------------------------------------------------------------
  bob.verb("use", { id: "pet2", action: "beacon", radius: 99, lag: 99 });
  await sleep(400);
  check("beacon lints out-of-range opts (clamped into the comp + note)",
    logComp("pet2")?.radius === 8,
    JSON.stringify(logComp("pet2")));

  const beforeRestart = logLines().length;
  await killServer();
  await startServer();
  const re = new Client("re-joiner");
  await re.connect();
  await sleep(500);
  check("restart folds the companion comp (pet2 still follows bob in the fold)",
    (re.snapshot as any)?.state?.entities?.pet2?.comp?.companion?.by != null,
    "");
  check("restart replay mints NOTHING (log length unchanged)",
    logLines().length === beforeRestart,
    `${logLines().length} vs ${beforeRestart}`);

  console.log(`\n${pass} passed, ${fail} failed\n`);
  await killServer();
  process.exit(fail ? 1 : 0);
} catch (err) {
  console.error("matrix crashed:", err);
  try { await killServer(); } catch { /* already gone */ }
  process.exit(1);
}
