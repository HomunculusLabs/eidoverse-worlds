import { expect, test } from "bun:test";
import { Document, NodeIO } from "@gltf-transform/core";
import * as repair from "./seat-repair.ts";
import { RolloutMonitor, type Probe, type Verb } from "./deploy.ts";
import { mkdtempSync, readFileSync, writeFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const LIB = "store/07c7feba5157336b.glb";
const HORSES = ["horse_0", "horse_2", "horse_4", "horse_6"];
const positions = [[2, 1.02, 0], [0, 1.02, 2], [-2, 1.02, 0], [0, 1.02, -2]];
const yaws = [Math.PI, Math.PI / 2, 0, -Math.PI / 2];
function model() {
  const d = new Document(), buffer = d.createBuffer();
  const scene = d.createScene(); d.getRoot().setDefaultScene(scene);
  const carousel = d.createNode("carousel").setTranslation([0, 1, 0]); scene.addChild(carousel);
  for (const [i, name] of HORSES.entries()) {
    const horse = d.createNode(name).setTranslation(positions[i] as any)
      .setRotation([0, Math.sin(yaws[i] / 2), 0, Math.cos(yaws[i] / 2)]);
    carousel.addChild(horse);
    const a = d.createAccessor().setType("VEC3").setBuffer(buffer).setArray(new Float32Array([
      -.12, 1.015, -.12, -.12, 1.015, .12, .12, 1.015, -.12,
      .12, 1.015, -.12, -.12, 1.015, .12, .12, 1.015, .12,
    ]));
    horse.addChild(d.createNode(`${name}_saddle`).setMesh(d.createMesh().addPrimitive(d.createPrimitive().setAttribute("POSITION", a))));
  }
  return d;
}
function baseline(): any {
  return { id: "nx-carousel", lib: LIB, pos: [-18, .00014950061063032772, 18], yaw: 2.35619,
    scale: 1, parent: null, comp: { "motion:carousel": { type: "spin", degPerSec: 6 },
      ...Object.fromEntries(HORSES.map(name => [`motion:${name}`, { type: "bob", amp: .18, period: 2.4 }])),
      "particles:smoke": { count: 50, origin: [0, 6.3, 0] },
      sockets: Object.fromEntries(HORSES.map((name, i) => [name, {
        pos: [positions[i][0], 1.97, positions[i][2]], yaw: yaws[i], part: name,
        pose: "sitchair", custom: { untouched: [true, "yes"] },
      }])) } };
}

test("seat proof includes the nested carousel metre via getWorldMatrix", () => {
  expect(typeof repair.deriveSeatProof).toBe("function");
  const proof = repair.deriveSeatProof(model(), "horse_2");
  expect(proof.slots.horse_2.horseLocalSeat).toEqual([0, 1.015, 0]);
  expect(proof.slots.horse_2.modelSeat).toEqual([0, 3.035, 2]);
  expect(proof.slots.horse_2.modelSeat[1]).not.toBe(2.035);
  expect(proof.slots.horse_2.worldMatrix[13]).toBe(2.02);
});

test("one socket repair preserves the entire tuple and bag, without applying horse yaw twice", () => {
  expect(typeof repair.planSeatRepair).toBe("function");
  const b = baseline(), saved = structuredClone(b);
  const proof = repair.deriveSeatProof(model(), "horse_2");
  const plan = repair.planSeatRepair(b, structuredClone(b), LIB, proof);
  expect(plan.action).toBe("repair");
  expect(plan.after.comp.sockets.horse_2).toEqual({ ...b.comp.sockets.horse_2, pos: [0, 3.035, 2], yaw: 0 });
  const restored = structuredClone(plan.after);
  restored.comp.sockets.horse_2 = b.comp.sockets.horse_2;
  expect(restored).toEqual(b);
  expect(plan.verbs).toEqual([{ verb: "comp", args: { id: "nx-carousel", type: "sockets", data: plan.after.comp.sockets } }]);
  expect(b).toEqual(saved);
  expect(proof.slots.horse_2.partRestYaw).toBeCloseTo(Math.PI / 2, 12);
  expect(proof.slots.horse_2.relativeSocketYaw).toBe(0);
  expect(proof.slots.horse_2.partRestYaw + plan.after.comp.sockets.horse_2.yaw).toBeCloseTo(Math.PI / 2, 12);
  expect(proof.slots.horse_2.partRestYaw + b.comp.sockets.horse_2.yaw).toBeCloseTo(Math.PI, 12);
});

test("contract gate rejects exact tuple/component drift, malformed baselines, and off-plane XZ", () => {
  const proof = repair.deriveSeatProof(model(), "horse_2");
  const mutations = [
    (b: any) => { b.id = "other"; }, (b: any) => { b.lib = "store/ffffffffffffffff.glb"; },
    (b: any) => { b.pos[1] += 1e-12; }, (b: any) => { b.yaw += 1e-12; },
    (b: any) => { b.scale = 2; }, (b: any) => { b.parent = { to: "other" }; },
    (b: any) => { b.comp.extra = true; }, (b: any) => { delete b.comp["motion:carousel"]; },
    (b: any) => { b.comp.sockets.horse_0.yaw += 1e-12; },
    (b: any) => { b.comp.sockets.horse_2.pos[0] += 1e-12; },
    (b: any) => { b.comp.sockets.horse_2.pose = "different"; },
  ];
  for (const change of mutations) {
    const live = baseline(); change(live);
    expect(() => repair.planSeatRepair(baseline(), live, LIB, proof)).toThrow();
  }
  for (const change of [
    (b: any) => { b.lib = "store/ffffffffffffffff.glb"; }, (b: any) => { b.pos[0] = NaN; },
    (b: any) => { delete b.scale; }, (b: any) => { b.comp.sockets = []; },
    (b: any) => { b.comp.sockets.horse_2.pos = [0, 1, 2, 3]; },
    (b: any) => { b.comp.sockets.horse_2.part = "horse_0"; },
    (b: any) => { b.comp.sockets.horse_2.yaw = "1"; },
    (b: any) => { b.comp.sockets.horse_2.pos[2] += .01; },
    (b: any) => { b.comp.sockets.horse_2.huge = "x".repeat(8193); },
    (b: any) => { b.comp.sockets.horse_2.custom = undefined; },
  ]) {
    const b = baseline(); change(b);
    expect(() => repair.planSeatRepair(b, structuredClone(b), LIB, proof)).toThrow();
  }
  expect(() => repair.planSeatRepair([baseline()] as any, baseline(), LIB, proof)).toThrow();
  expect(() => repair.planSeatRepair(baseline(), baseline(), LIB.toUpperCase(), proof)).toThrow();
});

test("model gates require reachable unique intact carousel/horse anchors and a real saddle plane", () => {
  const changes = [
    (d: Document) => { d.getRoot().listNodes().find(n => n.getName() === "carousel")!.setTranslation([0, 0, 0]); },
    (d: Document) => { d.getRoot().listNodes().find(n => n.getName() === "horse_2")!.setRotation([0, 0, 0, 1]); },
    (d: Document) => { d.getRoot().listNodes().find(n => n.getName() === "horse_4")!.setName("missing"); },
    (d: Document) => { d.createNode("horse_2"); },
    (d: Document) => { const n = d.getRoot().listNodes().find(n => n.getName() === "horse_2")!;
      n.getParentNode()!.removeChild(n); d.getRoot().getDefaultScene()!.addChild(n); },
    (d: Document) => { const n = d.getRoot().listNodes().find(n => n.getName() === "horse_2_saddle")!; n.setTranslation([0, -.05, 0]); },
  ];
  for (const change of changes) { const d = model(); change(d); expect(() => repair.deriveSeatProof(d, "horse_2")).toThrow(); }
  const d = model(), carousel = d.getRoot().listNodes().find(n => n.getName() === "carousel")!;
  const scene = d.getRoot().getDefaultScene()!; scene.removeChild(carousel);
  scene.addChild(d.createNode("outer_parent").setTranslation([0, .25, 0]).addChild(carousel));
  expect(repair.deriveSeatProof(d, "horse_2").slots.horse_2.modelSeat[1]).toBe(3.285);
  const p = repair.deriveSeatProof(model(), "all"), b = baseline();
  const plan = repair.planSeatRepair(b, b, LIB, p);
  expect(Object.keys(p.slots)).toEqual(HORSES);
  for (const name of HORSES) expect(plan.after.comp.sockets[name]).toEqual({ ...b.comp.sockets[name], pos: [b.comp.sockets[name].pos[0], 3.035, b.comp.sockets[name].pos[2]], yaw: 0 });
  expect(repair.planSeatRepair(b, plan.after, LIB, p).verbs).toEqual([]);
});

function rewriteGLB(bytes: Uint8Array, edit: (json: any) => void) {
  const b = Buffer.from(bytes), oldLength = b.readUInt32LE(12);
  const json = JSON.parse(b.subarray(20, 20 + oldLength).toString()); edit(json);
  const text = Buffer.from(JSON.stringify(json)), padded = Buffer.alloc(Math.ceil(text.length / 4) * 4, 32); text.copy(padded);
  const header = Buffer.from(b.subarray(0, 20)), bin = b.subarray(20 + oldLength);
  header.writeUInt32LE(20 + padded.length + bin.length, 8); header.writeUInt32LE(padded.length, 12);
  return Buffer.concat([header, padded, bin]);
}
test("GLB decoder is offline and fails closed before normalizing invalid resources/hierarchies", async () => {
  expect(typeof repair.decodeModel).toBe("function");
  const bytes = await new NodeIO().writeBinary(model());
  expect(repair.deriveSeatProof(await repair.decodeModel(bytes), "horse_2").slots.horse_2.modelSeat).toEqual([0, 3.035, 2]);
  const bad = [
    Buffer.from("invalid"), bytes.subarray(0, bytes.length - 4),
    rewriteGLB(bytes, j => { j.buffers[0].uri = "https://invalid.test/secret"; }),
    rewriteGLB(bytes, j => { j.nodes[0].children.push(0); }),
    rewriteGLB(bytes, j => { j.nodes[0].children.push(j.nodes[0].children[0]); }),
    rewriteGLB(bytes, j => { j.nodes[0].translation = [0, 1]; }),
    rewriteGLB(bytes, j => { j.nodes[0].rotation = [0, 0, 0, 2]; }),
    rewriteGLB(bytes, j => { j.scenes[0].nodes.push(j.nodes[0].children[0]); }),
  ];
  for (const b of bad) await expect(repair.decodeModel(b)).rejects.toThrow();
});

async function harness(apply = false) {
  const bytes = await new NodeIO().writeBinary(model());
  let live = baseline(), mounts: any = {}, role = "builder", current: Probe | undefined;
  const calls: string[] = [], checkpoints: any[] = [];
  const probeId = "arthur-carousel-rollout-seat-test";
  const options = { baseline: "/baseline.json", lib: LIB, model: "/approved.glb", slots: "horse_2" as const, out: "/report.json", apply };
  const io = {
    readEntity: async () => { calls.push("read"); return structuredClone(live); },
    download: async (_lib: string) => { calls.push("download"); return bytes; },
    openProbe: async (): Promise<Probe> => {
      calls.push("join");
      const { id, geometry, ...raw } = live;
      const monitor = new RolloutMonitor({ type: "snapshot", world: "commons-next", you: probeId,
        throughSeq: 10, entries: [], yourRights: { role }, state: { entities: { [id]: raw }, mounts } }, probeId);
      current = { monitor, close: () => { calls.push("close"); }, send: async (v: Verb) => {
        calls.push(v.verb); monitor.arm(v);
        const ack = { seq: monitor.seq + 1, actor: probeId, ts: 100, ...v };
        monitor.accept(ack); live = monitor.entity(); return ack;
      } };
      return current;
    },
    checkpoint: (r: any) => { checkpoints.push(structuredClone(r)); },
  };
  return { bytes, options, io, calls, checkpoints, setLive: (e: any) => { live = e; },
    getLive: () => structuredClone(live), occupy: () => { mounts = { bill: { to: "nx-carousel", slot: "horse_2" } }; },
    denyRights: () => { role = "visitor"; }, getProbe: () => current! };
}
test("dry-run reports exact before/planned after plus served geometry, with no joins or verbs", async () => {
  expect(typeof repair.runSeatRepair).toBe("function");
  const h = await harness();
  const r = await repair.runSeatRepair(h.options, baseline(), h.bytes, h.io);
  expect(r.status).toBe("DRY_RUN_READY");
  expect(r.mode).toBe("dryrun"); expect(r.before).toEqual(baseline()); expect(r.after).toEqual(baseline());
  expect(r.plannedAfter.comp.sockets.horse_2.pos[1]).toBe(3.035);
  expect(r.models.approved.proof.slots.horse_2.modelSeat[1]).toBe(3.035);
  expect(r.models.servedBefore.proof.slots.horse_2.surfaceTriangles).toBeGreaterThan(0);
  expect(r.verbAttempts).toBe(0); expect(r.occupancy.status).toBe("NOT_CHECKED_HTTP_ONLY");
  expect(h.calls).toEqual(["read", "download", "read"]);
});

test("apply sends one acknowledged sockets comp then requires a fresh exact snapshot and HTTP readback", async () => {
  const h = await harness(true);
  const r = await repair.runSeatRepair(h.options, baseline(), h.bytes, h.io);
  expect(r.status).toBe("APPLIED_VERIFIED"); expect(r.mode).toBe("apply");
  expect(r.verbAttempts).toBe(1); expect(r.acknowledgements).toHaveLength(1);
  expect(r.acknowledgements[0].verb).toBe("comp"); expect(r.acknowledgements[0].args.type).toBe("sockets");
  expect(r.afterSnapshot.comp).toEqual(r.plannedAfter.comp); expect(r.after.comp).toEqual(r.plannedAfter.comp);
  expect(r.occupancy.status).toBe("SNAPSHOT_UNOCCUPIED");
  expect(h.calls.filter(c => c === "join")).toHaveLength(2);
  expect(h.calls.filter(c => c === "comp")).toHaveLength(1);
  expect(h.checkpoints.find(r => r.status === "APPLYING").verbAttempts).toBe(1);
  h.calls.length = 0;
  const again = await repair.runSeatRepair(h.options, baseline(), h.bytes, h.io);
  expect(again.status).toBe("APPLY_ALREADY_TARGET_VERIFIED"); expect(again.verbAttempts).toBe(0);
  expect(h.calls).toEqual(["read", "download", "read"]);
});

test("CLI requires all exact pins, defaults dry-run, writes new private report and never overwrites inputs", async () => {
  expect(typeof repair.parseArgs).toBe("function"); expect(typeof repair.main).toBe("function");
  const h = await harness(), dir = mkdtempSync(join(tmpdir(), "seat-repair-test-"));
  try {
    const b = join(dir, "baseline.json"), m = join(dir, "approved.glb"), out = join(dir, "dryrun.json");
    writeFileSync(b, JSON.stringify(baseline())); writeFileSync(m, h.bytes);
    const args = ["--baseline", b, "--lib", LIB, "--model", m, "--slots", "horse_2", "--out", out];
    expect(repair.parseArgs(args)).toEqual({ baseline: b, lib: LIB, model: m, slots: "horse_2", out, apply: false });
    expect(repair.parseArgs([...args, "--apply"]).apply).toBe(true);
    for (const bad of [args.slice(2), [...args, "--slots", "all"], [...args, "--apply", "--apply"],
      args.map(x => x === LIB ? LIB.toUpperCase() : x), args.map(x => x === "horse_2" ? "horse_0" : x), [...args, "--world", "commons"]])
      expect(() => repair.parseArgs(bad)).toThrow();
    await repair.main(args, checkpoint => ({ ...h.io, checkpoint }));
    const r = JSON.parse(readFileSync(out, "utf8"));
    expect(r.status).toBe("DRY_RUN_READY"); expect(r.mode).toBe("dryrun");
    expect(r.before).toEqual(baseline()); expect(r.plannedAfter.comp.sockets.horse_2.yaw).toBe(0);
    expect(statSync(out).mode & 0o777).toBe(0o600);
    h.calls.length = 0;
    await expect(repair.main(args, () => { throw Error("must not load runtime"); })).rejects.toThrow();
    await expect(repair.main(args.map(x => x === out ? b : x), () => { throw Error("must not load runtime"); })).rejects.toThrow();
    expect(h.calls).toEqual([]); expect(JSON.parse(readFileSync(b, "utf8"))).toEqual(baseline());
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("served Draco rounding is bounded in geometric proof without moving the approved seat target", () => {
  const d = model();
  for (const a of d.getRoot().listAccessors()) {
    const arr = a.getArray()!;
    for (let i = 1; i < arr.length; i += 3) arr[i] = 1.0149765014648438; // measured archived served saddle plane
  }
  const proof = repair.deriveSeatProof(d, "all");
  for (const name of HORSES) {
    expect(proof.slots[name].modelSeat[1]).toBe(3.035);
    expect(proof.slots[name].decodedHorseLocalContact[1]).toBe(1.0149765014648438);
    expect(proof.slots[name].surfaceError).toBeLessThan(5e-5);
    expect(proof.slots[name].surfaceError).toBeGreaterThan(2e-5);
  }
});

test("archived optimized fullset fixture passes all-seat geometry and exact-anchor dry-run gates", async () => {
  const base = "/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout/";
  const bytes = readFileSync(base + "carousel-fullset-v2-a.glb");
  const served = readFileSync(base + "fullset-optimized-preview.glb");
  const b = JSON.parse(readFileSync(base + "fullset-entity-before-seat-repair.json", "utf8"));
  const h = await harness();
  const r = await repair.runSeatRepair({ ...h.options, lib: "store/1c0128b61b510a5d.glb", slots: "all" }, b, bytes,
    { ...h.io, readEntity: async () => structuredClone(b), download: async () => served });
  expect(r.status).toBe("DRY_RUN_READY"); expect(r.verbAttempts).toBe(0);
  expect(r.models.approved.proof.anchors).toEqual(r.models.servedBefore.proof.anchors);
  for (const name of HORSES) {
    expect(r.plannedAfter.comp.sockets[name].pos[1]).toBe(3.035);
    expect(r.plannedAfter.comp.sockets[name].yaw).toBe(0);
    expect(r.models.servedBefore.proof.slots[name].surfaceError).toBeLessThan(5e-5);
    expect(r.models.servedBefore.proof.slots[name].surfaceTriangles).toBeGreaterThan(0);
  }
});

test("unrelated sequenced traffic before the own acknowledgement does not invalidate a repair", async () => {
  const h = await harness(true), open = h.io.openProbe;
  h.io.openProbe = async () => { const p = await open(), send = p.send;
    p.send = async v => {
      p.monitor.accept({ seq: p.monitor.seq + 1, actor: "other", verb: "say", args: { text: "unrelated" } });
      return send(v);
    }; return p;
  };
  expect((await repair.runSeatRepair(h.options, baseline(), h.bytes, h.io)).status).toBe("APPLIED_VERIFIED");
});

for (const scenario of ["occupant", "rights", "http drift", "new rider", "model drift", "bad ack", "stale snapshot", "stale http", "transport secret"])
  test(`apply fails closed on ${scenario}; never dismounts or retries`, async () => {
    const h = await harness(true), read = h.io.readEntity, download = h.io.download, open = h.io.openProbe;
    if (scenario === "occupant") h.occupy();
    if (scenario === "rights") h.denyRights();
    if (scenario === "http drift") h.io.readEntity = async () => {
      const e = await read(); if (h.calls.includes("join")) e.pos[0] += 1e-12; return e;
    };
    if (scenario === "new rider") h.io.download = async lib => {
      if (h.calls.includes("join")) {
        const m = h.getProbe().monitor;
        m.accept({ seq: m.seq + 1, actor: "bill", verb: "mount", args: { id: "bill", to: "nx-carousel", slot: "horse_0" } });
      }
      return download(lib);
    };
    if (scenario === "model drift") {
      const d = model(), carousel = d.getRoot().listNodes().find(n => n.getName() === "carousel")!, scene = d.getRoot().getDefaultScene()!;
      scene.removeChild(carousel); scene.addChild(d.createNode("drifted_parent").setTranslation([0, .1, 0]).addChild(carousel));
      const changed = await new NodeIO().writeBinary(d); h.io.download = async () => changed;
    }
    if (scenario === "bad ack") h.io.openProbe = async () => { const p = await open();
      p.send = async v => { h.calls.push(v.verb); return { actor: p.monitor.probeId, seq: 11, verb: "comp", args: { ...v.args, type: "bad" } }; }; return p;
    };
    if (scenario === "stale snapshot") h.io.openProbe = async () => {
      if (h.calls.includes("comp")) h.setLive(baseline()); return open();
    };
    if (scenario === "stale http") h.io.readEntity = async () => h.calls.includes("comp") ? baseline() : read();
    if (scenario === "transport secret") h.io.download = async () => { throw Error("secret-credential-must-not-leak"); };
    await expect(repair.runSeatRepair(h.options, baseline(), h.bytes, h.io)).rejects.toThrow();
    const r = h.checkpoints.at(-1); expect(r.status).toBe("ABORTED");
    expect(r.verbAttempts).toBe(["bad ack", "stale snapshot", "stale http"].includes(scenario) ? 1 : 0);
    expect(h.calls.filter(c => c === "comp").length).toBeLessThanOrEqual(1);
    expect(h.calls.includes("dismount")).toBe(false);
    expect(JSON.stringify(r)).not.toContain("secret-credential-must-not-leak");
  });
