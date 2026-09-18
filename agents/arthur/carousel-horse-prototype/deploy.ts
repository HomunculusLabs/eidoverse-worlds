// Explicit, component-preserving replacement for commons-next / nx-carousel only.
// Default is HTTP-only dry-run. --apply opens a unique, muted MCPL probe.
// --out is a NEW report JSON path; served bytes are saved beside it as
// <out>.upload.served.glb and <out>.verified.served.glb. No local optimization.
// Rerunning a partial target aborts: human review/recovery is required.
import { createHash, randomUUID } from "node:crypto";
import { readFileSync, openSync, writeSync, writeFileSync, ftruncateSync, fsyncSync, closeSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { emptyState, foldEntry } from "../../../shared/fold.js";

export class RolloutMonitor {
  private state = emptyState();
  private pending: Verb | null = null;
  private poisoned = false;
  seq: number;
  readonly rank: number;
  constructor(snapshot: any, readonly probeId: string) {
    if (snapshot?.type !== "snapshot" || snapshot.world !== WORLD || snapshot.you !== probeId
      || !probeId.startsWith("arthur-carousel-rollout-")
      || !record(snapshot.state?.entities) || !snapshot.state.entities[ID]
      || !Number.isSafeInteger(snapshot.throughSeq) || !Array.isArray(snapshot.entries)
      || snapshot.entries.some((e: any) => !Number.isSafeInteger(e.seq))) fail("invalid snapshot identity/world/fold");
    // server/world.ts::joinPayload returns LIVE state. Its tail is not replayed here.
    const raw = snapshot.state.entities[ID];
    const allowed = ["lib", "pos", "yaw", "scale", "parent", "comp", "collide", "actor", "ts"];
    if (Object.keys(raw).some(k => !allowed.includes(k))) fail("unpreservable folded entity fields");
    if (raw.collide != null && !["exact", "box"].includes(raw.collide)) fail("unknown collision override");
    // shared/fold.js::mount: avatar mounts live in state.mounts[id].to;
    // mounted things instead carry entities[id].parent.to. Never move either rider.
    if (Object.values(snapshot.state.mounts ?? {}).some((r: any) => r?.to === ID)
      || Object.values(snapshot.state.entities).some((e: any) => e?.parent?.to === ID)) fail("occupied carousel: refusing replacement");
    this.state.entities[ID] = structuredClone(raw);
    this.seq = snapshot.entries.reduce((n: number, e: any) => Math.max(n, e.seq), snapshot.throughSeq);
    this.rank = ({ visitor: 0, builder: 1, owner: 2 } as Record<string, number>)[snapshot.yourRights?.role] ?? -1;
    validateEntity(this.entity());
  }
  entity(): Entity {
    if (this.poisoned) fail("rollout monitor aborted");
    const e = this.state.entities[ID];
    return structuredClone({ id: ID, ...e, lib: e.lib!, yaw: e.yaw ?? 0, scale: e.scale ?? 1,
      parent: e.parent ?? null, comp: e.comp ?? {} });
  }
  abort() { this.poisoned = true; }
  arm(verb: Verb) {
    this.entity();
    if (this.pending || !["spawn", "comp"].includes(verb.verb) || verb.args.id !== ID) fail("out-of-scope or overlapping verb");
    this.pending = structuredClone(verb);
  }
  accept(entry: any): boolean {
    this.entity();
    if (!Number.isSafeInteger(entry?.seq) || entry.seq !== this.seq + 1) {
      this.poisoned = true; fail("world log sequence gap/replay: aborting");
    }
    this.seq = entry.seq;
    if (entry.args?.id !== ID && entry.args?.to !== ID) return false;
    if (entry.actor !== this.probeId || !this.pending
      || entry.verb !== this.pending.verb || !isDeepStrictEqual(entry.args, this.pending.args)) {
      this.poisoned = true; fail("protected carousel drift or mismatched acknowledgement");
    }
    foldEntry(this.state, entry);
    this.pending = null;
    return true;
  }
}

export type Probe = { monitor: RolloutMonitor; send(v: Verb): Promise<any>; close(): void };
export type RolloutIO = {
  readEntity(): Promise<Entity>; openProbe(): Promise<Probe>; upload(bytes: Uint8Array): Promise<any>;
  captureServed(lib: string, phase: string): Promise<any>; sleep(ms: number): Promise<void>;
  checkpoint(report: Record<string, any>): void;
};
export async function runRollout(options: Options, baseline: Entity, bytes: Uint8Array, io: RolloutIO) {
  const report: Record<string, any> = { world: WORLD, id: ID, apply: options.apply,
    originalUploadSha256: options.sha, uploadAttempts: 0, verbAttempts: 0, acknowledgements: [] };
  try {
  const targetLib = validateBytes(bytes, options.sha);
  const before = await io.readEntity();
  const plan = decideRollout(baseline, before, options.fromLib, targetLib);
  Object.assign(report, { targetLib, before, plan, status: "DRY_RUN_READY" });
  if (plan.action === "already-target") {
    report.after = await io.readEntity();
    if (decideRollout(baseline, report.after, options.fromLib, targetLib).action !== "already-target") fail("fresh target readback failed");
    report.status = "ALREADY_TARGET_VERIFIED";
  }
  if (options.apply && plan.action === "replace") {
    let probe: Probe | undefined;
    try {
      probe = await io.openProbe();
      const captured = probe.monitor.entity();
      const joinedPlan = decideRollout(baseline, captured, options.fromLib, targetLib);
      if (probe.monitor.rank < 1) fail("own probe lacks builder rights; refusing upload");
      report.beforeSnapshot = captured;
      report.snapshotSeq = probe.monitor.seq;
      report.plan = joinedPlan;
      if (joinedPlan.action === "replace") {
        const gateSource = async () => {
          if (decideRollout(baseline, await io.readEntity(), options.fromLib, targetLib).action !== "replace") fail("source changed before write");
          assertExact(captured, probe!.monitor.entity(), true);
        };
        await gateSource();
        report.status = "UPLOADING"; report.uploadAttempts++;
        io.checkpoint(report);
        report.upload = { path: validateUpload(await io.upload(bytes), options.sha), originalSha256: options.sha };
        report.servedAfterUpload = await io.captureServed(targetLib, "upload");
        io.checkpoint(report);
        await gateSource(); // upload/optimizer work creates a new race window
        const expected = emptyState();
        expected.entities[ID] = structuredClone(captured) as any;
        for (const v of joinedPlan.verbs) {
          await io.sleep(700);
          const prior: any = expected.entities[ID];
          assertExact({ ...prior, id: ID, parent: prior.parent ?? null, comp: prior.comp ?? {}, scale: prior.scale ?? 1 }, probe.monitor.entity(), true);
          report.status = "APPLYING"; report.verbAttempts++;
          io.checkpoint(report); // intent is durable BEFORE send; an interruption is never retried
          const ack = await probe.send(v);
          foldEntry(expected, ack);
          // spawn drops the bag and parent. HTTP/snapshot normalization is explicit.
          const e: any = expected.entities[ID];
          assertExact({ ...e, id: ID, parent: e.parent ?? null, comp: e.comp ?? {}, scale: e.scale ?? 1 }, probe.monitor.entity(), true);
          report.acknowledgements.push(ack);
          io.checkpoint(report);
        }
      }
      probe.close(); probe = undefined;
      probe = await io.openProbe(); // fresh authoritative join, not a stale in-memory echo
      report.afterSnapshot = probe.monitor.entity();
      if (decideRollout(baseline, report.afterSnapshot, options.fromLib, targetLib).action !== "already-target") fail("fresh snapshot target verification failed");
      assertExact({ ...captured, lib: targetLib }, report.afterSnapshot, true);
      report.after = await io.readEntity();
      if (decideRollout(baseline, report.after, options.fromLib, targetLib).action !== "already-target") fail("fresh geometry target verification failed");
      report.served = await io.captureServed(targetLib, "verified");
      assertExact(report.afterSnapshot, probe.monitor.entity(), true);
      report.status = joinedPlan.action === "replace" ? "PLACED_VERIFIED" : "ALREADY_TARGET_VERIFIED";
    } finally { probe?.close(); }
  }
  io.checkpoint(report);
  return report;
  } catch (error) {
    report.abortedDuring = report.status ?? "PREFLIGHT";
    report.status = "ABORTED";
    report.error = safeMessage(error);
    io.checkpoint(report);
    throw new RolloutFailure(report.error);
  }
}

type Config = { url: string; joinToken: string; agentToken: string; avatar?: string };
export async function openProbe(cfg: Config, probeId: string,
  loadAgent = () => import("../../../mcpl/agent.ts")): Promise<Probe> {
  endpoint(cfg);
  if (!/^arthur-carousel-rollout-[a-z0-9-]{1,32}$/.test(probeId) || !cfg.joinToken) fail("invalid own probe identity/door");
  const { WorldAgent } = await loadAgent();
  const agent = new WorldAgent({ url: cfg.url, world: WORLD, name: probeId,
    avatar: cfg.avatar ?? "eidoverse/assets/vrms/arthur.vrm", agentToken: "" });
  let monitor: RolloutMonitor | undefined, fatal: RolloutFailure | undefined;
  let closing = false, didJoin = false, allowed: Verb | null = null;
  let pending: { resolve(e: any): void; reject(e: Error): void } | undefined;
  const stop = (message: string) => {
    fatal ??= new RolloutFailure(message); monitor?.abort(); pending?.reject(fatal); agent.close();
  };
  const previousToken = process.env.WORLD_TOKEN;
  process.env.WORLD_TOKEN = cfg.joinToken;
  try {
    const connecting = agent.connect();
    // No auto-reconnect: an interrupted transaction must remain interrupted.
    agent.closed = true;
    const ws = agent.ws!;
    const sendRaw = ws.send.bind(ws);
    ws.send = ((data: any) => {
      if (fatal || closing) fail("probe closed/aborted");
      const m = JSON.parse(String(data));
      if (m.type === "join") {
        if (didJoin || m.id !== probeId || m.world !== WORLD) { stop("out-of-scope join"); throw fatal; }
        didJoin = true; return sendRaw(data);
      }
      if (m.type === "verb") {
        if (!allowed || !isDeepStrictEqual({ verb: m.verb, args: m.args }, allowed)) {
          stop("unarmed/out-of-scope authored verb"); throw fatal;
        }
        allowed = null; return sendRaw(data);
      }
      // MCPL owns connection semantics, but this placer is not a resident body.
      // Mute ALL other outgoing planes (pose, puppet replies, chat, leases, etc.).
    }) as typeof ws.send;
    ws.addEventListener("message", ev => {
      try {
        const m = JSON.parse(String(ev.data));
        if (m.type === "error") { stop("server refused operation; no retry"); return; }
        if (m.type === "snapshot") {
          if (monitor) { stop("unexpected second snapshot"); return; }
          monitor = new RolloutMonitor(m, probeId);
        } else if (m.type === "log") {
          if (!monitor) { stop("log arrived before snapshot"); return; }
          if (monitor.accept(m.entry)) pending?.resolve(structuredClone(m.entry));
        } else if (m.type === "lease" && m.id === ID && m.op !== "released") stop("carousel is leased; refusing to overwrite physics");
      } catch (error) { stop(safeMessage(error)); }
    });
    ws.addEventListener("close", () => { if (!closing) stop("probe disconnected; no retry"); });
    ws.addEventListener("error", () => stop("probe websocket error; no retry"));
    try { await connecting; } catch { stop("own probe join failed; no retry"); }
    if (fatal) throw fatal;
    if (!monitor) fail("own probe did not receive an authoritative snapshot");
    return {
      monitor: monitor!,
      close() { closing = true; agent.close(); },
      async send(v: Verb) {
        if (fatal) throw fatal;
        if (ws.readyState !== 1 || !agent.joined || closing) fail("probe not connected");
        monitor!.arm(v); allowed = structuredClone(v);
        let timeout: ReturnType<typeof setTimeout>;
        try {
          return await new Promise((resolve, reject) => {
            pending = { resolve, reject };
            timeout = setTimeout(() => stop("authoritative verb acknowledgement timeout; no retry"), 10_000);
            try { agent.verb(v.verb, v.args); } catch { stop("verb send failed; no retry"); }
          });
        } finally { clearTimeout(timeout!); pending = undefined; allowed = null; }
      },
    };
  } catch (error) { closing = true; agent.close(); throw error; }
  finally {
    if (previousToken === undefined) delete process.env.WORLD_TOKEN;
    else process.env.WORLD_TOKEN = previousToken;
  }
}

export type Options = { file: string; sha: string; fromLib: string; baseline: string; out: string; apply: boolean };
export const USAGE = "bun agents/arthur/carousel-horse-prototype/deploy.ts --file FILE.glb --sha SHA256 --from-lib store/HASH.glb --baseline ENTITY.json --out REPORT.json [--apply]";
const LIB = /^store\/[0-9a-f]{16}\.glb$/;
const SHA256 = /^[0-9a-f]{64}$/;
export function parseArgs(argv: string[]): Options {
  const values: Record<string, string> = {};
  let apply = false;
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === "--apply" && !apply) { apply = true; continue; }
    if (!["--file", "--sha", "--from-lib", "--baseline", "--out"].includes(key)
      || key in values || !argv[i + 1] || argv[i + 1].startsWith("--")) fail("invalid CLI; " + USAGE);
    values[key] = argv[++i];
  }
  if (Object.keys(values).length !== 5 || !SHA256.test(values["--sha"]) || !LIB.test(values["--from-lib"]))
    fail("explicit inputs required; SHA must be 64 lowercase hex and lib an exact store path; " + USAGE);
  return { file: values["--file"], sha: values["--sha"], fromLib: values["--from-lib"],
    baseline: values["--baseline"], out: values["--out"], apply };
}

export function endpoint(cfg: { url: string }) {
  let url: URL;
  try { url = new URL(cfg.url); } catch { return fail("invalid configured endpoint"); }
  if (url.protocol !== "wss:" || url.hostname !== "eidoverse.billding.dev" || url.port
    || url.pathname !== "/ws" || url.username || url.password || url.search || url.hash)
    fail("refusing configured endpoint: requires wss://eidoverse.billding.dev/ws");
  return { ws: cfg.url, http: "https://" + url.host };
}

export const sha256 = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
function glbHeader(bytes: Uint8Array) {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.byteLength < 20 || v.getUint32(0, true) !== 0x46546c67
    || v.getUint32(4, true) !== 2 || v.getUint32(8, true) !== bytes.byteLength) fail("invalid GLB header/length");
}
export function validateBytes(bytes: Uint8Array, sha: string) {
  if (!SHA256.test(sha) || sha256(bytes) !== sha) fail("upload byte SHA-256 mismatch");
  glbHeader(bytes);
  return `store/${sha.slice(0, 16)}.glb`;
}
export function validateUpload(response: any, sha: string) {
  // server/upload.ts hashes ORIGINAL body bytes then queues store-min asynchronously.
  const expected = `store/${sha.slice(0, 16)}.glb`;
  if (!SHA256.test(sha) || response?.path !== expected) fail("upload returned an unexpected original-hash path");
  return expected;
}
export function servedMetadata(bytes: Uint8Array, originalSha: string) {
  glbHeader(bytes);
  const sha = sha256(bytes);
  return { sha256: sha, bytes: bytes.byteLength, matchesOriginalUpload: sha === originalSha,
    provenance: "served-library-bytes; may be server-optimized" };
}

export const WORLD = "commons-next";
export const ID = "nx-carousel";
export type Entity = {
  id: string; lib: string; pos: number[]; yaw: number; scale: number;
  parent: unknown; comp: Record<string, any>; geometry?: unknown; collide?: unknown;
};
export type Verb = { verb: "spawn" | "comp"; args: Record<string, any> };
class RolloutFailure extends Error {}
const safeMessage = (error: unknown) => error instanceof RolloutFailure ? error.message : "runtime failure (details withheld to protect credentials)";
const fail = (message: string): never => { throw new RolloutFailure(message); };
const record = (v: any) => v !== null && typeof v === "object" && !Array.isArray(v);
function validateEntity(e: Entity) {
  if (!record(e) || e.id !== ID || typeof e.lib !== "string"
    || !Array.isArray(e.pos) || e.pos.length !== 3 || !e.pos.every(Number.isFinite)
    || !Number.isFinite(e.yaw) || !Number.isFinite(e.scale) || e.scale <= 0
    || !Object.hasOwn(e, "parent") || !record(e.comp)) fail("invalid entity tuple");
}
function assertExact(expected: Entity, live: Entity, collision = false) {
  for (const key of ["id", "lib", "pos", "yaw", "scale", "parent", "comp", ...(collision ? ["collide"] : [])])
    if (!isDeepStrictEqual((expected as any)[key], (live as any)[key])) fail(`drift: ${key}`);
}
export function decideRollout(baseline: Entity, live: Entity, fromLib: string, targetLib: string) {
  validateEntity(baseline); validateEntity(live);
  if (baseline.lib !== fromLib) fail("baseline library differs from --from-lib");
  if (baseline.parent !== null) fail("mounted baseline cannot be preserved by a spawn-only rollout");
  for (const [type, data] of Object.entries(baseline.comp)) {
    if (!type || type.length > 32 || data == null || JSON.stringify(data).length > 8192)
      fail("component cannot be restored verbatim");
  }
  for (const key of ["id", "pos", "yaw", "scale", "parent", "comp"] as const)
    if (!live || !isDeepStrictEqual(baseline[key], live[key])) fail(`drift: ${key}`);
  if (live.lib !== fromLib && live.lib !== targetLib) fail("drift: source library");
  if (live.lib === targetLib) return { action: "already-target" as const, verbs: [] as Verb[] };
  if (baseline.comp.lock) fail("locked source: refusing to unlock or overwrite");
  const verbs: Verb[] = [{ verb: "spawn", args: {
    id: ID, lib: targetLib, pos: structuredClone(baseline.pos), yaw: baseline.yaw, scale: baseline.scale,
    ...(Object.hasOwn(live, "collide") ? { collide: live.collide } : {}),
  } }];
  for (const type of Object.keys(baseline.comp).sort())
    verbs.push({ verb: "comp", args: { id: ID, type, data: structuredClone(baseline.comp[type]) } });
  return { action: "replace" as "replace" | "already-target", verbs };
}

export function httpIO(cfg: Config, probeId: string, fetcher: (url: any, init: any) => Promise<Response> = fetch) {
  const { http } = endpoint(cfg);
  const request = async (path: string, init: RequestInit = {}) => {
    const u = new URL(path, http);
    if (u.origin !== http) fail("out-of-scope HTTP origin");
    u.searchParams.set("_rollout", randomUUID());
    let r: Response;
    try { r = await fetcher(u, { ...init, cache: "no-store", redirect: "error",
      headers: { "cache-control": "no-cache", ...init.headers }, signal: AbortSignal.timeout(60_000) }); }
    catch { return fail("HTTP transport failed; no retry (URL withheld)"); }
    if (!r.ok) fail(`HTTP ${r.status}; no retry`);
    return r;
  };
  return {
    readEntity: async (): Promise<Entity> => (await request(`/geom?world=${WORLD}&id=${ID}`)).json(),
    upload: async (bytes: Uint8Array) => {
      if (!cfg.agentToken) fail("missing upload credential");
      const q = new URLSearchParams({ token: cfg.agentToken, by: probeId, name: "commons-next reviewed carousel rollout" });
      return (await request(`/upload?${q}`, { method: "POST", body: bytes as BodyInit,
        headers: { "content-type": "model/gltf-binary" } })).json();
    },
    download: async (lib: string) => {
      if (!LIB.test(lib)) fail("invalid served library path");
      return new Uint8Array(await (await request(`/library/${lib}`)).arrayBuffer());
    },
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2)); // BEFORE reading any private config
  const out = resolve(options.out);
  mkdirSync(dirname(out), { recursive: true });
  // Never overwrite an earlier report, the candidate, or the baseline.
  const fd = openSync(out, "wx", 0o600);
  let last: Record<string, any> = { status: "PREFLIGHT", world: WORLD, id: ID, apply: options.apply,
    inputs: options, uploadAttempts: 0, verbAttempts: 0 };
  const checkpoint = (r: Record<string, any>) => {
    last = { ...last, ...structuredClone(r), updatedAt: new Date().toISOString() };
    const data = Buffer.from(JSON.stringify(last, null, 2) + "\n");
    writeSync(fd, data, 0, data.length, 0); ftruncateSync(fd, data.length); fsyncSync(fd);
  };
  const abortSignal = () => {
    checkpoint({ status: "INTERRUPTED", error: "Interrupted; inspect fresh live tuple. Do not retry a partial target." });
    process.exit(130);
  };
  process.once("SIGINT", abortSignal); process.once("SIGTERM", abortSignal);
  try {
    checkpoint(last);
    const baseline: Entity = JSON.parse(readFileSync(options.baseline, "utf8"));
    const bytes = readFileSync(options.file);
    validateBytes(bytes, options.sha);
    decideRollout(baseline, baseline, options.fromLib, `store/${options.sha.slice(0, 16)}.glb`);
    // Runtime only. No credential file is read on import or by unit tests.
    const configFile = fileURLToPath(new URL("../config.json", import.meta.url));
    let cfg: Config;
    try { cfg = JSON.parse(readFileSync(configFile, "utf8")); } catch { return fail("could not load runtime config (contents withheld)"); }
    const host = endpoint(cfg);
    const probeId = `arthur-carousel-rollout-${randomUUID().replaceAll("-", "").slice(0, 24)}`;
    checkpoint({ endpoint: host.http, probeId, baseline,
      dryRunScope: "HTTP tuple only; apply also gates fresh snapshot occupants, collision, rights and live log drift" });
    const http = httpIO(cfg, probeId);
    const result = await runRollout(options, baseline, bytes, {
      readEntity: http.readEntity,
      upload: http.upload,
      openProbe: () => openProbe(cfg, probeId),
      captureServed: async (lib, phase) => {
        const served = await http.download(lib);
        const meta = servedMetadata(served, options.sha);
        const file = `${out}.${phase}.served.glb`;
        writeFileSync(file, served, { flag: "wx", mode: 0o600 });
        return { ...meta, file, lib, fetchedAt: new Date().toISOString(),
          note: "Library prefers asynchronous store-min shadow; this is exactly what was served at fetchedAt, not proof optimization has finished." };
      },
      sleep: ms => new Promise(r => setTimeout(r, ms)), checkpoint,
    });
    console.log(JSON.stringify({ status: result.status, world: WORLD, id: ID, targetLib: result.targetLib,
      uploadAttempts: result.uploadAttempts, verbAttempts: result.verbAttempts, report: out, servedFile: result.served?.file ?? null }));
  } catch (error) { checkpoint({ status: "ABORTED", error: safeMessage(error) }); throw error; }
  finally { process.off("SIGINT", abortSignal); process.off("SIGTERM", abortSignal); closeSync(fd); }
}

if (import.meta.main) {
  try { await main(); } catch (error) { console.error(safeMessage(error)); process.exitCode = 1; }
}
