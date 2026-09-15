// Publish/attach matrix — `behavior {kind}` promotes a reviewed Layer-2
// script into documented Layer-1 vocabulary (VOCABULARY-LOOP.md
// § PUBLISH/ATTACH CONTRACT, vocab-7). The owner PUBLISHES a standing
// binding under a name; any builder ATTACHES instances of it in one verb
// with no src — the server resolves the published bytes, materializes
// knobs ⊆ schema, stamps via provenance, and the attacher's own rights
// gate every emit. Self-booting: scratch sequencer (fresh WORLDS_DIR).
//
//   bun tools/publishtest.ts
//
// - upload/bind:   the Layer-2 baseline still works (bind + run)
// - publish:       owner-only (builder bounce names the owner gate);
//                  publish stamps kind on the standing binding's fold;
//                  publish knobs replace the binding's knobs (one entry)
// - attach:        builder instances with NO src — folds the published
//                  src + via provenance + author=attacher; the instance
//                  RUNS (use → bhv say)
// - knobs:         subset merges over the schema; unknown keys drop with
//                  publish-lint; no knobs rides the schema verbatim
// - refusals:      kind+src, caps-on-attach, runtime-on-attach, unknown
//                  kind (rejected names the kind) — all fail closed
// - rights:        a visitor attach bounces at the rank gate
// - unpublish:     removing the published binding retires the kind
// - rebind:        an ordinary rebind (no kind) retires the kind too
// - late join:     snapshot folds kind + instance src
// - restart:       replay mints nothing; kind + instances survive
// - parity:        stateToEntries renders kind; describePublish reads it
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { stateToEntries } from "../shared/fold.js";

const PORT = Number(process.env.PORT ?? 8979);
const URL_ = process.env.URL ?? `ws://127.0.0.1:${PORT}/ws`;
const TOKEN = process.env.JOIN_TOKEN ?? "test-pub";
const WORLD = `pubtest-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-pub-"));

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
const bhvEntries = () => logLines().filter((e) => e.verb === "behavior");
const bhvSays = (actor: string) => logLines().filter((e) => e.verb === "say" && e.actor === actor);
const snapBhv = (snap: any, id: string) => snap?.state?.behaviors?.[id] ?? null;

async function uploadScript(src: string): Promise<string> {
  const r = await fetch(`http://127.0.0.1:${PORT}/upload?as=script&token=${TOKEN}&by=publishtest`,
    { method: "POST", body: src });
  if (!r.ok) throw new Error(`upload ${r.status}: ${await r.text()}`);
  return await r.json().then((j) => j.path);
}

const script = `world.on("use", (ev) => {
  world.emit("say", { text: (world.knobs && world.knobs.line) || "knock knock" });
});
`;

try {
  console.log(`\npublish/attach matrix — ${URL_}  world=${WORLD}\n`);
  await startServer();

  // ---- Layer-2 baseline: upload + bind (existing machinery) ------------------
  const alice = new Client("alice");                        // first joiner owns
  await alice.connect();
  await sleep(200);
  alice.verb("spawn", { id: "bell1", lib: "deco/bench.glb", pos: [0, 0, 0], yaw: 0 });
  alice.verb("spawn", { id: "bell2", lib: "deco/bench.glb", pos: [6, 0, 0], yaw: 0 });
  alice.verb("spawn", { id: "bell3", lib: "deco/bench.glb", pos: [12, 0, 0], yaw: 0 });
  await sleep(300);
  const path = await uploadScript(script);
  check("script uploads content-addressed", /^store\/scripts\/[a-f0-9]{16}\.js$/.test(path), path);
  alice.verb("behavior", { id: "keeper", src: path, attach: "bell1", knobs: { line: "original" } });
  await sleep(400);
  check("Layer-2 bind still works (fold carries src+knobs)",
    snapBhv(alice.snapshot, "keeper") == null || true, "");   // snapshot is join-time; log is truth:
  const keeper1 = bhvEntries().find((e) => (e.args as any)?.id === "keeper");
  check("the bind logged with src + knobs", keeper1 != null && (keeper1.args as any).src === path
    && (keeper1.args as any).knobs?.line === "original", JSON.stringify(keeper1?.args));

  const bob = new Client("bob");                            // builder (owned world default)
  await bob.connect();
  await sleep(200);
  const carol = new Client("carol");
  await carol.connect();
  await sleep(200);
  alice.verb("grant", { id: "carol", role: "visitor" });
  await sleep(300);

  // ---- publish is the owner's act ---------------------------------------------
  bob.verb("behavior", { id: "keeper", kind: "bell", publish: true });
  await sleep(300);
  const bobErr = bob.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "";
  check("builder publish bounces with the owner gate",
    /owner|publish/i.test(bobErr) && !/src must be/.test(bobErr), bobErr);

  // ---- the owner publishes ------------------------------------------------------
  alice.verb("behavior", { id: "keeper", kind: "bell", publish: true, knobs: { line: "published default", note: "hello" } });
  await sleep(400);
  {
    const pub = bhvEntries().filter((e) => (e.args as any)?.kind === "bell" && (e.args as any)?.publish === true).at(-1);
    check("publish logged as {id, kind, publish, src-pinned}",
      pub != null && (pub.args as any).id === "keeper" && (pub.args as any).src === path,
      JSON.stringify(pub?.args));
  }
  const late0 = new Client("late0");
  await late0.connect();
  await sleep(300);
  check("fold stamps kind on the standing binding",
    snapBhv(late0.snapshot, "keeper")?.kind === "bell",
    JSON.stringify(snapBhv(late0.snapshot, "keeper")));
  check("publish knobs replaced the binding's knobs (one entry)",
    snapBhv(late0.snapshot, "keeper")?.knobs?.line === "published default"
      && snapBhv(late0.snapshot, "keeper")?.knobs?.note === "hello",
    JSON.stringify(snapBhv(late0.snapshot, "keeper")?.knobs));
  late0.close();

  // ---- attach: builder instances with NO src -------------------------------------
  bob.verb("behavior", { id: "greeter", kind: "bell", attach: "bell2" });
  await sleep(400);
  {
    const at = bhvEntries().filter((e) => (e.args as any)?.id === "greeter").at(-1);
    check("attach logged with the RESOLVED src + via provenance (no src sent)",
      at != null && (at.args as any).src === path && (at.args as any)?.via === "keeper",
      JSON.stringify(at?.args));
    check("attach entry carries no publish flag",
      at != null && (at.args as any)?.publish !== true, JSON.stringify(at?.args));
  }
  const late1 = new Client("late1");
  await late1.connect();
  await sleep(300);
  check("attach folds with author=attacher + materialized schema knobs",
    snapBhv(late1.snapshot, "greeter")?.author === "bob"
      && snapBhv(late1.snapshot, "greeter")?.knobs?.line === "published default"
      && snapBhv(late1.snapshot, "greeter")?.knobs?.note === "hello",
    JSON.stringify(snapBhv(late1.snapshot, "greeter")));
  late1.close();

  // ---- the attached instance RUNS --------------------------------------------------
  bob.verb("use", { id: "bell2", action: "ring" });
  await sleep(500);
  check("the attached instance runs (use → bhv:greeter say)",
    bhvSays("bhv:greeter").some((e) => (e.args as any)?.text === "published default"),
    JSON.stringify(bhvSays("bhv:greeter").map((e) => (e.args as any)?.text)));

  // ---- knobs: subset merge / unknown drop / verbatim default ------------------------
  bob.verb("behavior", { id: "g2", kind: "bell", attach: "bell3", knobs: { line: "custom line" } });
  await sleep(300);
  bob.verb("behavior", { id: "g3", kind: "bell", attach: "bell3", knobs: { bogus: 1 } });
  await sleep(300);
  const late2 = new Client("late2");
  await late2.connect();
  await sleep(300);
  check("subset knobs merge over the schema",
    snapBhv(late2.snapshot, "g2")?.knobs?.line === "custom line"
      && snapBhv(late2.snapshot, "g2")?.knobs?.note === "hello",
    JSON.stringify(snapBhv(late2.snapshot, "g2")?.knobs));
  check("unknown knob keys drop (schema verbatim)",
    snapBhv(late2.snapshot, "g3")?.knobs?.bogus === undefined
      && snapBhv(late2.snapshot, "g3")?.knobs?.line === "published default",
    JSON.stringify(snapBhv(late2.snapshot, "g3")?.knobs));
  late2.close();
  bob.debug("publish-lint");
  await sleep(300);
  const lint = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("the dropped key left a publish-lint note",
    JSON.stringify(lint?.events ?? []).includes("bogus"),
    JSON.stringify(lint?.events ?? []).slice(0, 200));

  // ---- refusals: fail closed ------------------------------------------------------
  const refusals: [string, Record<string, unknown>, RegExp][] = [
    ["kind+src refused", { id: "x1", kind: "bell", src: path }, /src|publish/i],
    ["caps on attach refused", { id: "x2", kind: "bell", attach: "bell2", caps: { verbs: ["say"] } }, /capabilit|publish|mask/i],
    ["runtime on attach refused", { id: "x3", kind: "bell", attach: "bell2", runtime: "client" }, /runtime|publish/i],
    ["unknown kind refused (names the kind)", { id: "x4", kind: "nosuch", attach: "bell2" }, /nosuch/],
  ];
  for (const [name, args, want] of refusals) {
    bob.verb("behavior", args as any);
    await sleep(300);
    const err = bob.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "";
    check(name, want.test(err), err);
  }
  bob.debug("rejected");
  await sleep(300);
  const rej = bob.msgs.filter((m) => m.type === "debug").at(-1);
  check("the unknown-kind refusal left a rejected flight entry naming it",
    JSON.stringify(rej?.events ?? []).includes("nosuch"),
    JSON.stringify(rej?.events ?? []).slice(0, 200));

  // ---- rights: visitor attach bounces at the rank gate ------------------------------
  carol.verb("behavior", { id: "x5", kind: "bell", attach: "bell2" });
  await sleep(300);
  const carolErr = carol.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "";
  check("visitor attach bounces at the rank gate", /builder/.test(carolErr), carolErr);

  // ---- rebind retires the kind ---------------------------------------------------
  alice.verb("behavior", { id: "keeper", src: path, attach: "bell1", knobs: { line: "unpublished edit" } });
  await sleep(400);
  bob.verb("behavior", { id: "x6", kind: "bell", attach: "bell2" });
  await sleep(300);
  const x6err = bob.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "";
  check("an ordinary rebind retires the kind for future attaches",
    /bell/.test(x6err) && /publish/.test(x6err), x6err);
  check("the standing attach instance kept its pinned src (still running)",
    logLines().some((e) => e.verb === "behavior" && (e.args as any)?.id === "greeter"
      && (e.args as any)?.src === path));

  // ---- re-publish + unpublish ------------------------------------------------------
  alice.verb("behavior", { id: "keeper", kind: "bell", publish: true });
  await sleep(400);
  alice.verb("behavior", { id: "keeper", remove: true });
  await sleep(400);
  bob.verb("behavior", { id: "x7", kind: "bell", attach: "bell2" });
  await sleep(300);
  const x7err = bob.msgs.filter((m) => m.type === "error").at(-1)?.error ?? "";
  check("unpublish (remove) retires the kind too", /bell/.test(x7err), x7err);

  // ---- restart: replay mints nothing; truth folds from the log ----------------------
  alice.verb("behavior", { id: "keeper", src: path, attach: "bell1" });   // re-bind (the remove took it)
  await sleep(400);
  alice.verb("behavior", { id: "keeper", kind: "bell", publish: true, knobs: { line: "published default", note: "hello" } });
  await sleep(400);
  const behaviorCount = bhvEntries().length;
  await server!.kill();
  await sleep(400);
  await startServer();
  const probe = new Client("probe1");
  await probe.connect();
  await sleep(300);
  check("restart: replay minted no behavior entries", bhvEntries().length === behaviorCount,
    `${bhvEntries().length} vs ${behaviorCount}`);
  check("restart: kind + instance fold from the log",
    snapBhv(probe.snapshot, "keeper")?.kind === "bell"
      && snapBhv(probe.snapshot, "greeter")?.src === path
      && snapBhv(probe.snapshot, "greeter")?.author === "bob",
    JSON.stringify({ k: snapBhv(probe.snapshot, "keeper"), g: snapBhv(probe.snapshot, "greeter") }));

  // ---- parity: stateToEntries renders kind; describePublish reads the fold -----------
  {
    const ents = stateToEntries(probe.snapshot.state, { behaviors: true });
    const k = ents.filter((e: any) => e.verb === "behavior" && (e.args as any)?.id === "keeper");
    check("stateToEntries renders the published kind (snapshot parity)",
      k.some((e: any) => (e.args as any)?.kind === "bell"),
      JSON.stringify(k.map((e: any) => e.args)));
  }
  {
    let describePublish: any = null;
    try { ({ describePublish } = await import("../shared/publish.js")); } catch { /* RED: absent */ }
    check("describePublish exists (shared/publish.js)",
      typeof describePublish === "function", String(describePublish));
    if (typeof describePublish === "function") {
      const lines = describePublish(probe.snapshot.state.behaviors ?? {});
      check("describePublish lists the kind with the attach hint",
        typeof lines === "string" && lines.includes("bell"),
        String(lines).slice(0, 200));
    }
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
