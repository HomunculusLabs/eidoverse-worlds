import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import * as deploy from "./deploy.ts";

const FROM = "store/ce3633992d07055e.glb";
const SHA = "07c7feba5157336b3d8f9087906e6c7fab04f456475c91d489eec481215bcadb";
const TO = `store/${SHA.slice(0, 16)}.glb`;
const baseline = (): deploy.Entity => ({
  id: "nx-carousel", lib: FROM, pos: [-18, 0.00014950061063032772, 18],
  yaw: 2.35619, scale: 1, parent: null,
  comp: { "motion:carousel": { type: "spin", degPerSec: 6 },
    "particles:smoke": { origin: [0, 6.3, 0], count: 50 },
    sockets: { horse_0: { pos: [2, 1.97, 0], part: "horse_0" } } },
  geometry: { bbox: { min: [-3.55, 0, -3.55], max: [3.55, 6.77, 3.84] } },
});

test("matching source plans only same-id spawn and verbatim complete components", () => {
  expect(typeof deploy.decideRollout).toBe("function");
  const b = baseline();
  const copy = structuredClone(b);
  const plan = deploy.decideRollout(b, structuredClone(b), FROM, TO);
  expect(plan.action).toBe("replace");
  expect(plan.verbs).toEqual([
    { verb: "spawn", args: { id: b.id, lib: TO, pos: b.pos, yaw: b.yaw, scale: b.scale } },
    ...Object.keys(b.comp).sort().map(type => ({ verb: "comp", args: { id: b.id, type, data: b.comp[type] } })),
  ]);
  expect(b).toEqual(copy);
});

for (const lib of [FROM, TO]) {
  for (const [name, change] of Object.entries({
    "tiny position drift": (e: any) => { e.pos[1] += 1e-12; },
    yaw: (e: any) => { e.yaw += 1e-12; },
    scale: (e: any) => { e.scale = 2; },
    parent: (e: any) => { e.parent = { to: "other" }; },
    "missing component": (e: any) => { delete e.comp.sockets; },
    "extra component": (e: any) => { e.comp.unreviewed = true; },
    "changed component value": (e: any) => { e.comp["particles:smoke"].origin[0] = 1; },
    id: (e: any) => { e.id = "other"; },
  })) test(`fail closed on ${name} at ${lib}`, () => {
    const live = { ...baseline(), lib };
    change(live);
    expect(() => deploy.decideRollout(baseline(), live, FROM, TO)).toThrow();
  });
}

test("fail closed on unexpected source library", () => {
  expect(() => deploy.decideRollout(baseline(), { ...baseline(), lib: "store/ffffffffffffffff.glb" }, FROM, TO)).toThrow();
});

test("rejects malformed or unpreservable baselines before authorizing", () => {
  for (const change of [
    (b: any) => { b.id = "other"; },
    (b: any) => { b.lib = TO; },
    (b: any) => { delete b.scale; },
    (b: any) => { b.pos[0] = NaN; },
    (b: any) => { b.parent = { to: "carrier" }; },
    (b: any) => { b.comp.lock = true; },
    (b: any) => { b.comp.invalid = null; },
    (b: any) => { b.comp["x".repeat(33)] = true; },
    (b: any) => { b.comp.huge = "x".repeat(8193); },
  ]) {
    const b = baseline(); change(b);
    expect(() => deploy.decideRollout(b, structuredClone(b), FROM, TO)).toThrow();
  }
});

test("CLI requires explicit pinned inputs and defaults to dry-run", () => {
  expect(typeof deploy.parseArgs).toBe("function");
  const args = ["--file", "/candidate.glb", "--sha", SHA, "--from-lib", FROM,
    "--baseline", "/baseline.json", "--out", "/report.json"];
  expect(deploy.parseArgs(args)).toEqual({ file: "/candidate.glb", sha: SHA, fromLib: FROM,
    baseline: "/baseline.json", out: "/report.json", apply: false });
  expect(deploy.parseArgs([...args, "--apply"]).apply).toBe(true);
  for (const bad of [args.slice(2), [...args, "--apply=true"], [...args, "--file", "/x"],
    args.map(x => x === SHA ? SHA.toUpperCase() : x), args.map(x => x === FROM ? "../" + FROM : x)])
    expect(() => deploy.parseArgs(bad)).toThrow();
});

test("configured endpoint is respected only at the approved TLS host", () => {
  expect(typeof deploy.endpoint).toBe("function");
  expect(deploy.endpoint({ url: "wss://eidoverse.billding.dev/ws" })).toEqual({ ws: "wss://eidoverse.billding.dev/ws", http: "https://eidoverse.billding.dev" });
  for (const url of ["wss://eidoverse.animalabs.ai/ws", "ws://eidoverse.billding.dev/ws", "wss://eidoverse.billding.dev.evil/ws",
    "wss://eidoverse.billding.dev:8993/ws", "wss://secret@eidoverse.billding.dev/ws", "wss://eidoverse.billding.dev/ws?token=secret"])
    expect(() => deploy.endpoint({ url })).toThrow();
});

test("pins original upload bytes without mistaking served optimizer bytes for their hash", () => {
  expect(typeof deploy.validateBytes).toBe("function");
  const bytes = Buffer.alloc(20); bytes.write("glTF"); bytes.writeUInt32LE(2, 4); bytes.writeUInt32LE(20, 8);
  const sha = createHash("sha256").update(bytes).digest("hex");
  expect(deploy.validateBytes(bytes, sha)).toBe(`store/${sha.slice(0, 16)}.glb`);
  expect(() => deploy.validateBytes(bytes, SHA)).toThrow();
  expect(() => deploy.validateBytes(Buffer.from("not a GLB"), sha)).toThrow();
  expect(deploy.validateUpload({ path: TO }, SHA)).toBe(TO);
  expect(() => deploy.validateUpload({ path: FROM }, SHA)).toThrow();
  const served = deploy.servedMetadata(bytes, SHA);
  expect(served.sha256).toBe(sha);
  expect(served.matchesOriginalUpload).toBe(false);
  expect(served.provenance).toBe("served-library-bytes; may be server-optimized");
});

test("preserves folded spawn-only collision override", () => {
  const live = { ...baseline(), collide: "exact" };
  const plan = deploy.decideRollout(baseline(), live, FROM, TO);
  expect(plan.verbs[0].args.collide).toBe("exact");
});

const PROBE = "arthur-carousel-rollout-test";
function snapshot() {
  const { id, geometry, parent, ...entity } = baseline();
  return { type: "snapshot", world: "commons-next", you: PROBE, throughSeq: 10,
    yourRights: { role: "builder", gen: true }, state: { entities: { [id]: entity } },
    entries: [{ seq: 11, actor: "old", verb: "spawn", args: { id, lib: FROM, pos: entity.pos } }] };
}
test("monitor uses the live-folded snapshot without reapplying its tail and acknowledges exact own verbs", () => {
  expect(typeof deploy.RolloutMonitor).toBe("function");
  const m = new deploy.RolloutMonitor(snapshot(), PROBE);
  expect(m.entity().comp).toEqual(baseline().comp);
  const plan = deploy.decideRollout(baseline(), m.entity(), FROM, TO);
  for (const [i, v] of plan.verbs.entries()) {
    m.arm(v);
    expect(m.accept({ seq: 12 + i, actor: PROBE, ts: 100 + i, ...v })).toBe(true);
  }
  expect(deploy.decideRollout(baseline(), m.entity(), FROM, TO).action).toBe("already-target");
});

test("monitor fails closed on scope drift, sequence gaps, mismatched echoes or invalid authority", () => {
  for (const change of [
    (s: any) => { s.you = "arthur"; }, (s: any) => { s.world = "commons"; },
    (s: any) => { s.state.entities["nx-carousel"].kind = "light"; },
    (s: any) => { s.throughSeq = null; },
  ]) { const s = snapshot(); change(s); expect(() => new deploy.RolloutMonitor(s, PROBE)).toThrow(); }
  const v = deploy.decideRollout(baseline(), baseline(), FROM, TO).verbs[0];
  for (const e of [
    { seq: 13, actor: PROBE, ...v },
    { seq: 12, actor: "other", ...v },
    { seq: 12, actor: PROBE, verb: "spawn", args: { ...v.args, scale: 2 } },
    { seq: 12, actor: "other", verb: "mount", args: { id: "visitor", to: "nx-carousel" } },
  ]) {
    const m = new deploy.RolloutMonitor(snapshot(), PROBE); m.arm(v);
    expect(() => m.accept(e)).toThrow();
    expect(() => m.entity()).toThrow();
  }
  const m = new deploy.RolloutMonitor(snapshot(), PROBE);
  expect(m.accept({ seq: 12, actor: "other", verb: "comp", args: { id: "other", type: "foo", data: true } })).toBe(false);
  expect(() => m.arm({ verb: "comp", args: { id: "other", type: "x", data: 1 } })).toThrow();
});

test("refuses an occupied carousel from the snapshot avatar mount map", () => {
  const s: any = snapshot(); s.state.mounts = { bill: { to: "nx-carousel", slot: "horse_0" } };
  expect(() => new deploy.RolloutMonitor(s, PROBE)).toThrow(/occupied/);
});

function dummyBytes() {
  const b = Buffer.alloc(20); b.write("glTF"); b.writeUInt32LE(2, 4); b.writeUInt32LE(20, 8); return b;
}
function harness(start = baseline()) {
  let live = structuredClone(start);
  const calls: string[] = [];
  const bytes = dummyBytes(), sha = deploy.sha256(bytes), target = `store/${sha.slice(0, 16)}.glb`;
  const options = { file: "/candidate.glb", sha, fromLib: FROM, baseline: "/baseline.json", out: "/report.json", apply: false };
  let opened = 0;
  const io: deploy.RolloutIO = {
    readEntity: async () => { calls.push("read"); return structuredClone(live); },
    openProbe: async () => {
      calls.push("join"); opened++;
      const s: any = snapshot(); const { id, geometry, parent, ...raw } = live;
      s.state.entities[id] = raw;
      const monitor = new deploy.RolloutMonitor(s, PROBE);
      return { monitor, close: () => { calls.push("close"); }, send: async (v: deploy.Verb) => {
        calls.push(v.verb); monitor.arm(v);
        const e = { seq: monitor.seq + 1, actor: PROBE, ts: 10, ...v };
        monitor.accept(e); live = monitor.entity(); return e;
      } };
    },
    upload: async () => { calls.push("upload"); return { path: target }; },
    captureServed: async (_lib, phase) => { calls.push(`served:${phase}`); return { ...deploy.servedMetadata(bytes, sha), file: `/served-${phase}.glb` }; },
    sleep: async ms => { calls.push(`sleep:${ms}`); },
    checkpoint: () => {},
  };
  return { calls, bytes, options, io, target, setLive: (e: deploy.Entity) => { live = e; } };
}
test("orchestrator dry-run never uploads, joins or sends verbs", async () => {
  expect(typeof deploy.runRollout).toBe("function");
  const h = harness();
  const r = await deploy.runRollout(h.options, baseline(), h.bytes, h.io);
  expect(r.status).toBe("DRY_RUN_READY");
  expect(h.calls).toEqual(["read"]);
  expect(r.uploadAttempts).toBe(0); expect(r.verbAttempts).toBe(0);
});

test("apply at an already-target tuple performs zero uploads and zero verbs", async () => {
  const h = harness(); h.options.apply = true;
  h.setLive({ ...baseline(), lib: h.target });
  const r = await deploy.runRollout(h.options, baseline(), h.bytes, h.io);
  expect(r.status).toBe("ALREADY_TARGET_VERIFIED");
  expect(h.calls).toEqual(["read", "read"]);
  expect(r.uploadAttempts).toBe(0); expect(r.verbAttempts).toBe(0);
});

test("apply rechecks after upload, restores all components at 700ms, then verifies a fresh join", async () => {
  const h = harness(); h.options.apply = true;
  const r = await deploy.runRollout(h.options, baseline(), h.bytes, h.io);
  expect(r.status).toBe("PLACED_VERIFIED");
  expect(r.uploadAttempts).toBe(1); expect(r.verbAttempts).toBe(4);
  expect(r.after.comp).toEqual(baseline().comp);
  expect(h.calls).toEqual(["read", "join", "read", "upload", "served:upload", "read",
    "sleep:700", "spawn", "sleep:700", "comp", "sleep:700", "comp", "sleep:700", "comp",
    "close", "join", "read", "served:verified", "close"]);
});

test("post-upload drift aborts with captured report and no spawn", async () => {
  const h = harness(); h.options.apply = true;
  let last: any;
  h.io.checkpoint = r => { last = structuredClone(r); };
  const upload = h.io.upload;
  h.io.upload = async b => { const response = await upload(b); h.setLive({ ...baseline(), yaw: 0 }); return response; };
  await expect(deploy.runRollout(h.options, baseline(), h.bytes, h.io)).rejects.toThrow();
  expect(h.calls.includes("spawn")).toBe(false);
  expect(last.status).toBe("ABORTED"); expect(last.uploadAttempts).toBe(1); expect(last.verbAttempts).toBe(0);
});

test("partial target remains fail-closed on rerun", async () => {
  const h = harness(); h.options.apply = true;
  h.setLive({ ...baseline(), lib: h.target, comp: {} });
  await expect(deploy.runRollout(h.options, baseline(), h.bytes, h.io)).rejects.toThrow();
  expect(h.calls).toEqual(["read"]);
});

test("MCPL adapter joins only its probe and permits only armed carousel verbs", async () => {
  expect(typeof deploy.openProbe).toBe("function");
  const sent: any[] = [];
  let agent: any;
  class FakeAgent {
    ws = new EventTarget() as any;
    joined = false;
    constructor(readonly opts: any) { agent = this;
      this.ws.readyState = 1;
      this.ws.send = (text: string) => {
        const m = JSON.parse(text); sent.push(m);
        if (m.type === "join") queueMicrotask(() => {
          this.joined = true; this.ws.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(snapshot()) })); this.ready();
        });
        if (m.type === "verb") queueMicrotask(() => this.ws.dispatchEvent(new MessageEvent("message", {
          data: JSON.stringify({ type: "log", entry: { seq: 12, actor: PROBE, ts: 10, verb: m.verb, args: m.args } }) })));
      };
    }
    ready = () => {};
    connect() { return new Promise<void>(resolve => { this.ready = resolve;
      queueMicrotask(() => this.ws.send(JSON.stringify({ type: "join", world: this.opts.world, id: this.opts.name, token: process.env.WORLD_TOKEN })));
    }); }
    verb(verb: string, args: any) { this.ws.send(JSON.stringify({ type: "verb", verb, args })); }
    close() { this.ws.readyState = 3; }
  }
  const cfg = { url: "wss://eidoverse.billding.dev/ws", joinToken: "test-door", agentToken: "test-upload-secret" };
  const probe = await deploy.openProbe(cfg, PROBE, async () => ({ WorldAgent: FakeAgent as any }));
  agent.ws.send(JSON.stringify({ type: "pose", p: [0, 0, 0] }));
  const v = deploy.decideRollout(baseline(), probe.monitor.entity(), FROM, TO).verbs[0];
  await probe.send(v);
  expect(sent.map(m => m.type)).toEqual(["join", "verb"]);
  expect(sent[0].id).toBe(PROBE); expect(sent[0].world).toBe("commons-next");
  expect(JSON.stringify(sent)).not.toContain("test-upload-secret");
  probe.close();
});

test("CLI rejects incomplete invocation without reading config or connecting", () => {
  const r = Bun.spawnSync([process.execPath, new URL("./deploy.ts", import.meta.url).pathname, "--apply"]);
  expect(r.exitCode).toBe(1);
  expect(r.stderr.toString()).toContain("explicit inputs required");
});

test("HTTP adapter uses pinned origin, raw bytes, cache-bypassed served download", async () => {
  expect(typeof deploy.httpIO).toBe("function");
  const requests: { url: URL; init: any }[] = [];
  const bytes = dummyBytes();
  const io = deploy.httpIO({ url: "wss://eidoverse.billding.dev/ws", joinToken: "door", agentToken: "upload-token" }, PROBE,
    async (input: any, init: any) => {
      const url = new URL(input); requests.push({ url, init });
      return url.pathname === "/geom" ? Response.json(baseline()) : url.pathname === "/upload" ? Response.json({ path: TO }) : new Response(bytes);
    });
  expect((await io.readEntity()).id).toBe("nx-carousel");
  expect(await io.upload(bytes)).toEqual({ path: TO });
  expect(await io.download(TO)).toEqual(new Uint8Array(bytes));
  expect(requests.every(r => r.url.hostname === "eidoverse.billding.dev" && r.init.redirect === "error")).toBe(true);
  expect(requests[1].init.body).toBe(bytes);
  expect(requests[2].url.pathname).toBe(`/library/${TO}`);
  expect(requests[2].init.cache).toBe("no-store");
});

test("already-target exact tuple has no planned verbs", () => {
  const b = baseline();
  const live = { ...structuredClone(b), lib: TO, geometry: { different: true } };
  expect(deploy.decideRollout(b, live, FROM, TO)).toEqual({ action: "already-target", verbs: [] });
});
