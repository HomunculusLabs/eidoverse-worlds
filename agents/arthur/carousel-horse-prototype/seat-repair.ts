// Seat-only contract for commons-next / nx-carousel. No network work on import.
import { NodeIO, type Document } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";

export async function decodeModel(bytes: Uint8Array): Promise<Document> {
  try {
    if (!(bytes instanceof Uint8Array) || bytes.length < 28) fail("invalid GLB header");
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (v.getUint32(0, true) !== 0x46546c67 || v.getUint32(4, true) !== 2 || v.getUint32(8, true) !== bytes.length)
      fail("invalid GLB magic/version/length");
    let json: any, chunks = 0, binary = 0;
    for (let offset = 12; offset < bytes.length;) {
      if (offset + 8 > bytes.length) fail("invalid GLB chunk");
      const length = v.getUint32(offset, true), type = v.getUint32(offset + 4, true);
      if (length % 4 || offset + 8 + length > bytes.length) fail("invalid GLB chunk length");
      if (chunks === 0 && type === 0x4e4f534a)
        json = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(offset + 8, offset + 8 + length)));
      else if (chunks === 1 && type === 0x004e4942) binary = length;
      else fail("invalid GLB chunk type");
      chunks++; offset += 8 + length;
    }
    if (json?.asset?.version !== "2.0" || !Array.isArray(json.nodes) || json.scenes?.length !== 1 ||
      json.buffers?.length !== 1 || json.buffers[0].uri !== undefined || !binary ||
      !Number.isSafeInteger(json.buffers[0].byteLength) || json.buffers[0].byteLength <= 0 ||
      binary - json.buffers[0].byteLength < 0 || binary - json.buffers[0].byteLength > 3 ||
      json.images?.some((i: any) => i.uri !== undefined) || json.animations?.length || json.skins?.length)
      fail("one static self-contained GLB required; external resources forbidden");
    const parent = new Set<number>(), visited = new Set<number>(), active = new Set<number>();
    const ref = (i: number) => { if (!Number.isSafeInteger(i) || i < 0 || i >= json.nodes.length) fail("invalid node reference"); };
    for (const n of json.nodes) {
      for (const [k, len] of [["translation", 3], ["rotation", 4], ["scale", 3], ["matrix", 16]] as const)
        if (n[k] !== undefined && !vector(n[k], len)) fail("malformed node transform");
      if (n.rotation && Math.abs(n.rotation.reduce((a: number, b: number) => a + b * b, 0) - 1) > 1e-6)
        fail("non-unit node quaternion");
      if (n.matrix && ["translation", "rotation", "scale"].some(k => n[k] !== undefined)) fail("ambiguous node transform");
      if (n.children !== undefined && !Array.isArray(n.children)) fail("invalid children");
      for (const i of n.children ?? []) { ref(i); if (parent.has(i)) fail("duplicate node parent"); parent.add(i); }
    }
    const walk = (i: number) => {
      ref(i); if (active.has(i)) fail("cyclic node hierarchy"); if (visited.has(i)) return;
      active.add(i); for (const c of json.nodes[i].children ?? []) walk(c); active.delete(i); visited.add(i);
    };
    json.nodes.forEach((_: any, i: number) => walk(i));
    const roots = json.scenes[0].nodes;
    if (!Array.isArray(roots) || !roots.length || new Set(roots).size !== roots.length) fail("invalid scene roots");
    for (const i of roots) { ref(i); if (parent.has(i)) fail("scene root has parent"); }
    const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
      .registerDependencies({ "draco3d.decoder": await draco3d.createDecoderModule() });
    const doc = await io.readBinary(bytes);
    for (const a of doc.getRoot().listAccessors())
      if (!a.getArray()?.every(Number.isFinite)) fail("non-finite decoded geometry");
    return doc;
  } catch (error) { if (error instanceof SeatRepairFailure) throw error; return fail("invalid or unsupported model (decoder details withheld)"); }
}
import { Matrix4, Vector3, Triangle } from "three";
import { isDeepStrictEqual } from "node:util";
import { ID, WORLD, sha256, httpIO, openProbe, endpoint, type Entity, type Verb, type Probe } from "./deploy.ts";
import { randomUUID } from "node:crypto";
import { readFileSync, openSync, writeSync, ftruncateSync, fsyncSync, closeSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const USAGE = "bun agents/arthur/carousel-horse-prototype/seat-repair.ts --baseline ENTITY.json --lib store/HASH.glb --model APPROVED.glb --slots horse_2|all --out NEW_REPORT.json [--apply]";
export function parseArgs(argv: string[]): Options {
  const values: Record<string, string> = {}; let apply = false;
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--apply" && !apply) { apply = true; continue; }
    if (!["--baseline", "--lib", "--model", "--slots", "--out"].includes(k) || k in values ||
      !argv[i + 1] || argv[i + 1].startsWith("--")) fail("invalid CLI; " + USAGE);
    values[k] = argv[++i];
  }
  if (Object.keys(values).length !== 5 || !LIB.test(values["--lib"]) || !["horse_2", "all"].includes(values["--slots"]))
    fail("exact baseline/lib/model/slots/out required; " + USAGE);
  return { baseline: values["--baseline"], lib: values["--lib"], model: values["--model"], slots: values["--slots"] as Slots,
    out: values["--out"], apply };
}
function runtimeIO(checkpoint: SeatRepairIO["checkpoint"]): SeatRepairIO {
  let cfg: any;
  try { cfg = JSON.parse(readFileSync(fileURLToPath(new URL("../config.json", import.meta.url)), "utf8")); }
  catch { return fail("could not load runtime config (contents withheld)"); }
  endpoint(cfg);
  // The shared resident default is not this explicitly commissioned target.
  // httpIO/openProbe use fixed WORLD=commons-next, never cfg.world.
  const probeId = `arthur-carousel-rollout-${randomUUID().replaceAll("-", "").slice(0, 24)}`;
  const http = httpIO(cfg, probeId);
  // Deliberately do not pass upload, resident identity, or any generalized verb surface.
  return { readEntity: http.readEntity, download: http.download, openProbe: () => openProbe(cfg, probeId), checkpoint };
}
export async function main(argv: string[], makeIO: (checkpoint: SeatRepairIO["checkpoint"]) => SeatRepairIO = runtimeIO) {
  const options = parseArgs(argv), out = resolve(options.out);
  mkdirSync(dirname(out), { recursive: true });
  const fd = openSync(out, "wx", 0o600); // rejects existing reports, symlinks and input collisions
  let last: Record<string, any> = { status: "PREFLIGHT", mode: options.apply ? "apply" : "dryrun", world: WORLD, id: ID,
    endpoint: "https://eidoverse.billding.dev", inputs: options, verbAttempts: 0 };
  const checkpoint: SeatRepairIO["checkpoint"] = r => {
    last = { ...last, ...structuredClone(r), updatedAt: new Date().toISOString() };
    const data = Buffer.from(JSON.stringify(last, null, 2) + "\n");
    writeSync(fd, data, 0, data.length, 0); ftruncateSync(fd, data.length); fsyncSync(fd);
  };
  const interrupt = () => { checkpoint({ status: "INTERRUPTED", error: "Inspect fresh state; no automatic retry or rollback." }); process.exit(130); };
  process.once("SIGINT", interrupt); process.once("SIGTERM", interrupt);
  try {
    checkpoint(last);
    const baseline = JSON.parse(readFileSync(options.baseline, "utf8")), bytes = readFileSync(options.model);
    // Validate public, local inputs BEFORE touching runtime credentials or opening any transport.
    planSeatRepair(baseline, baseline, options.lib, deriveSeatProof(await decodeModel(bytes), options.slots));
    return await runSeatRepair(options, baseline, bytes, makeIO(checkpoint));
  } catch (error) { checkpoint({ status: "ABORTED", error: safeMessage(error) }); throw new SeatRepairFailure(safeMessage(error)); }
  finally { process.off("SIGINT", interrupt); process.off("SIGTERM", interrupt); closeSync(fd); }
}

export type Options = { baseline: string; lib: string; model: string; slots: Slots; out: string; apply: boolean };
export type SeatRepairIO = {
  readEntity(): Promise<Entity>; download(lib: string): Promise<Uint8Array>;
  openProbe(): Promise<Probe>; checkpoint(report: Record<string, any>): void;
};
const safeMessage = (e: unknown) => e instanceof SeatRepairFailure ? e.message : "runtime failure (details withheld to protect credentials)";
export async function runSeatRepair(options: Options, baseline: Entity, bytes: Uint8Array, io: SeatRepairIO) {
  const report: Record<string, any> = { world: WORLD, id: ID, lib: options.lib, slots: options.slots,
    mode: options.apply ? "apply" : "dryrun", verbAttempts: 0, acknowledgements: [],
    occupancy: { status: "NOT_CHECKED_HTTP_ONLY" }, status: "PREFLIGHT" };
  try {
    const proof = deriveSeatProof(await decodeModel(bytes), options.slots);
    planSeatRepair(baseline, baseline, options.lib, proof); // invalid contract never reaches network
    const before = await io.readEntity(), plan = planSeatRepair(baseline, before, options.lib, proof);
    report.before = before; report.plannedAfter = plan.after; report.plan = plan;
    report.models = { approved: { sha256: sha256(bytes), bytes: bytes.length, proof } };
    const capture = async () => {
      const served = await io.download(options.lib), actual = deriveSeatProof(await decodeModel(served), options.slots);
      if (!isDeepStrictEqual(proof.anchors, actual.anchors)) fail("served model anchor drift from approved model");
      for (const name of Object.keys(proof.slots))
        if (!proof.slots[name].modelSeat.every((v: number, i: number) => Math.abs(v - actual.slots[name].modelSeat[i]) <= EPS))
          fail("served saddle plane drift");
      return { lib: options.lib, sha256: sha256(served), bytes: served.length, proof: actual };
    };
    report.models.servedBefore = await capture();
    report.after = await io.readEntity(); assertExact(before, report.after);
    report.status = plan.action === "already-target" ? `${options.apply ? "APPLY" : "DRY_RUN"}_ALREADY_TARGET_VERIFIED` : "DRY_RUN_READY";
    if (options.apply && plan.action === "repair") {
      let probe: Probe | undefined;
      try {
        report.status = "SNAPSHOT_PREFLIGHT"; io.checkpoint(report);
        probe = await io.openProbe(); // deploy.RolloutMonitor refuses ALL avatar and entity riders
        const captured = probe.monitor.entity(); assertExact(before, captured);
        if (probe.monitor.rank < 1) fail("own probe lacks builder rights");
        report.beforeSnapshot = captured; report.snapshotSeq = probe.monitor.seq;
        report.occupancy = { status: "SNAPSHOT_UNOCCUPIED", seq: probe.monitor.seq,
          checkedBy: "deploy.RolloutMonitor: state.mounts[*].to and state.entities[*].parent.to; all slots protected" };
        report.models.servedPrewrite = await capture();
        assertExact(before, await io.readEntity()); assertExact(captured, probe.monitor.entity());
        const v = plan.verbs[0], seq = probe.monitor.seq + 1;
        report.status = "APPLYING"; report.verbAttempts = 1; report.after = null;
        io.checkpoint(report); // durable intent before the sole send; NEVER retry an uncertain result
        const ack = await probe.send(v);
        // RolloutMonitor enforces contiguous world seq; unrelated entries may precede our echo.
        if (!Number.isSafeInteger(ack?.seq) || ack.seq < seq || ack.seq > probe.monitor.seq ||
          ack.actor !== probe.monitor.probeId || ack.verb !== "comp" || !isDeepStrictEqual(ack.args, v.args))
          fail("missing or mismatched authoritative socket acknowledgement");
        report.acknowledgements.push(ack);
        const expectedSnapshot = { ...captured, comp: structuredClone(plan.after.comp) };
        assertExact(expectedSnapshot, probe.monitor.entity());
        report.status = "VERIFYING"; io.checkpoint(report);
        probe.close(); probe = undefined;
        probe = await io.openProbe(); // fresh authoritative snapshot, not the previous folded echo
        report.afterSnapshot = probe.monitor.entity(); assertExact(expectedSnapshot, report.afterSnapshot);
        report.models.servedAfter = await capture();
        report.after = await io.readEntity(); assertExact(plan.after, report.after);
        assertExact(expectedSnapshot, probe.monitor.entity());
        report.status = "APPLIED_VERIFIED";
      } finally { probe?.close(); }
    }
    io.checkpoint(report); return report;
  } catch (error) {
    report.abortedDuring = report.status; report.status = "ABORTED"; report.error = safeMessage(error);
    io.checkpoint(report); throw new SeatRepairFailure(report.error);
  }
}

const LIB = /^store\/[0-9a-f]{16}\.glb$/;
const record = (v: any) => v !== null && typeof v === "object" && !Array.isArray(v);
const vector = (v: any, n = 3) => Array.isArray(v) && v.length === n && v.every(Number.isFinite);
function validateEntity(e: Entity) {
  if (!record(e) || e.id !== ID || !LIB.test(e.lib) || !vector(e.pos) || !Number.isFinite(e.yaw)
    || !Number.isFinite(e.scale) || e.scale <= 0 || e.parent !== null || !record(e.comp) || !record(e.comp.sockets))
    fail("invalid single-entity tuple/components");
  // Reject values JSON would silently drop/coerce, rather than changing them on the wire.
  try { if (!isDeepStrictEqual(e, JSON.parse(JSON.stringify(e)))) fail("non-JSON entity"); }
  catch { fail("non-JSON entity"); }
  for (const name of HORSES) {
    const s = e.comp.sockets[name];
    if (!record(s) || !vector(s.pos) || s.part !== name ||
      (Object.hasOwn(s, "yaw") && !Number.isFinite(s.yaw))) fail("invalid horse socket");
  }
  if (JSON.stringify(e.comp.sockets).length > 8192) fail("sockets component exceeds verb limit");
}
function sameTuple(a: Entity, b: Entity) {
  return ["id", "lib", "pos", "yaw", "scale", "parent", "comp", "collide"].every(k =>
    isDeepStrictEqual((a as any)[k], (b as any)[k]));
}
function assertExact(a: Entity, b: Entity) {
  validateEntity(b);
  if (!sameTuple(a, b)) fail("exact carousel tuple/component drift");
  for (const k of ["actor", "ts"])
    if (Object.hasOwn(a, k) && !isDeepStrictEqual((a as any)[k], (b as any)[k])) fail("folded provenance drift");
}
export function planSeatRepair(baseline: Entity, live: Entity, lib: string, proof: ReturnType<typeof deriveSeatProof>) {
  validateEntity(baseline); validateEntity(live);
  if (!LIB.test(lib) || baseline.lib !== lib) fail("baseline library differs from exact --lib");
  const after = structuredClone(baseline);
  for (const [name, seat] of Object.entries(proof.slots)) {
    const socket = after.comp.sockets[name];
    if (!socket || ![0, 2].every(k => Math.abs(socket.pos[k] - seat.modelSeat[k]) <= EPS))
      fail("socket XZ differs from decoded saddle plane");
    socket.pos[1] = seat.modelSeat[1];
    // world.mountTransform already rotates +Z by the animated horse part.
    socket.yaw = 0;
  }
  const action = sameTuple(live, after) ? "already-target" : "repair";
  assertExact(action === "already-target" ? after : baseline, live);
  const verbs: Verb[] = action === "already-target" ? [] : [{ verb: "comp", args: {
    id: ID, type: "sockets", data: structuredClone(after.comp.sockets),
  } }];
  return { action, before: structuredClone(live), after, verbs };
}

export type Slots = "horse_2" | "all";
const HORSES = ["horse_0", "horse_2", "horse_4", "horse_6"] as const;
const SEAT = [0, 1.015, 0] as const;
const EPS = 5e-5; // 50 micrometres: archived served Draco plane differs by 23.5µm; NEVER tuple/anchor tolerance
class SeatRepairFailure extends Error {}
function fail(message: string): never { throw new SeatRepairFailure(message); }

export function deriveSeatProof(doc: Document, selection: Slots) {
  if (!["horse_2", "all"].includes(selection)) fail("invalid slot selection");
  const root = doc.getRoot(), scene = root.getDefaultScene();
  if (!scene || root.listScenes().length !== 1 || root.listAnimations().length || root.listSkins().length)
    fail("one static model scene required");
  const reachable = new Set(); scene.traverse(n => reachable.add(n));
  const unique = (name: string) => {
    const nodes = root.listNodes().filter(n => n.getName() === name);
    if (nodes.length !== 1 || !reachable.has(nodes[0])) fail("missing, duplicate or unreachable model anchor");
    return nodes[0];
  };
  const close = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => Number.isFinite(v) && Math.abs(v - b[i]) < 1e-8);
  const carousel = unique("carousel");
  if (!close(carousel.getTranslation(), [0, 1, 0]) || !close(carousel.getRotation(), [0, 0, 0, 1]))
    fail("carousel rest anchor drift");
  const positions = [[2, 1.02, 0], [0, 1.02, 2], [-2, 1.02, 0], [0, 1.02, -2]];
  const yaws = [Math.PI, Math.PI / 2, 0, -Math.PI / 2];
  const anchors: Record<string, any> = {};
  for (const [i, name] of ["carousel", ...HORSES].entries()) {
    const node = unique(name), m = node.getWorldMatrix();
    if (!close(node.getScale(), [1, 1, 1]) || !vector(m, 16)) fail("invalid model anchor scale/matrix");
    if (i && (node.getParentNode() !== carousel || !close(node.getTranslation(), positions[i - 1]) ||
      !close(new Vector3(0, 0, 1).transformDirection(new Matrix4().fromArray(node.getMatrix())).toArray(),
        [Math.sin(yaws[i - 1]), 0, Math.cos(yaws[i - 1])]) ||
      !close(new Vector3(0, 1, 0).transformDirection(new Matrix4().fromArray(node.getMatrix())).toArray(), [0, 1, 0])))
      fail("horse rest anchor drift");
    anchors[name] = { parent: node.getParentNode()?.getName() ?? null, worldMatrix: m, localMatrix: node.getMatrix() };
  }
  const slots: Record<string, any> = {};
  for (const name of selection === "all" ? HORSES : ["horse_2"]) {
    const nodes = doc.getRoot().listNodes().filter(n => n.getName() === name);
    if (nodes.length !== 1) fail("missing or duplicate horse anchor");
    const horse = nodes[0], worldMatrix = horse.getWorldMatrix();
    const inverse = new Matrix4().fromArray(worldMatrix).invert();
    const contact = new Vector3(...SEAT);
    let surfaceTriangles = 0, surfaceError = Infinity, decodedHorseLocalContact: number[] | null = null;
    horse.traverse(node => {
      const matrix = new Matrix4().multiplyMatrices(inverse, new Matrix4().fromArray(node.getWorldMatrix()));
      for (const p of node.getMesh()?.listPrimitives() ?? []) {
        const pos = p.getAttribute("POSITION"), ix = p.getIndices();
        if (!pos || pos.getType() !== "VEC3" || p.getMode() !== 4) fail("invalid saddle geometry");
        const count = ix?.getCount() ?? pos.getCount();
        if (count % 3) fail("invalid saddle triangle count");
        for (let i = 0; i < count; i += 3) {
          const v = [0, 1, 2].map(k => new Vector3().fromArray(pos.getElement(ix ? ix.getScalar(i + k) : i + k, [])) .applyMatrix4(matrix));
          if (v.every(p => Math.abs(p.y - SEAT[1]) <= EPS)) {
            const tri = new Triangle(v[0], v[1], v[2]), nearest = tri.closestPointToPoint(contact, new Vector3());
            const error = nearest.distanceTo(contact);
            if (tri.getArea() > 1e-10 && tri.getNormal(new Vector3()).y > .99 && error <= EPS) {
              surfaceTriangles++;
              if (error < surfaceError) { surfaceError = error; decodedHorseLocalContact = nearest.toArray(); }
            }
          }
        }
      }
    });
    if (!surfaceTriangles) fail("central saddle plane missing from decoded horse geometry");
    slots[name] = { part: name, horseLocalSeat: [...SEAT], worldMatrix,
      decodedHorseLocalContact, surfaceError, surfaceTolerance: EPS,
      relativeSocketYaw: 0, localForward: [0, 0, 1], partRestYaw: Math.atan2(worldMatrix[8], worldMatrix[10]),
      modelSeat: contact.applyMatrix4(new Matrix4().fromArray(worldMatrix)).toArray(), surfaceTriangles };
  }
  return { selection, anchors, slots };
}

if (import.meta.main) {
  try {
    const r = await main(process.argv.slice(2));
    console.log(JSON.stringify({ status: r.status, mode: r.mode, world: WORLD, id: ID, lib: r.lib,
      slots: r.slots, verbAttempts: r.verbAttempts, report: resolve(parseArgs(process.argv.slice(2)).out) }));
  } catch (error) { console.error(safeMessage(error)); process.exitCode = 1; }
}

