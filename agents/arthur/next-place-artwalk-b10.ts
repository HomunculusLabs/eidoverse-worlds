// next-place-artwalk-b10.ts — host-rider placement for the Four-Wind Crown.
// Owns nx-artwalk-* only; nx-town-windmill remains read-only host truth.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const WORLD = "commons-next";
const ID = "nx-artwalk-b10-windmill-four-wind-crown";
const HOST = "nx-town-windmill";
const HOST_LIB = "store/4feee38977d7c6e5.glb";
const SHA = "8e55e366b5a289877ef7386fe04be3bef9e797b94b417a276fe06a94ba3a37d8";
const LOCAL: [number, number, number] = [0, 2.22, 2.62];
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_artwalk_b10.glb`);
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const die = (message: string): never => { throw new Error(message); };
if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("local build hash drift");

async function geom() {
  const response = await fetch(`${base}/geom?world=${WORLD}`, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) die(`geom HTTP ${response.status}`);
  const data: any = await response.json();
  return Object.fromEntries(data.entities.map((entity: any) => [entity.id, entity])) as Record<string, any>;
}

type OBB = { cx: number; cz: number; ux: [number, number]; uz: [number, number]; hx: number; hz: number };
const obb = (cx: number, cz: number, yaw: number, sx: number, sz: number): OBB => ({
  cx, cz, ux: [Math.cos(yaw), -Math.sin(yaw)], uz: [Math.sin(yaw), Math.cos(yaw)], hx: sx / 2, hz: sz / 2,
});
const gap = (a: OBB, b: OBB) => {
  let best = -Infinity;
  for (const axis of [a.ux, a.uz, b.ux, b.uz] as const) {
    const center = Math.abs((b.cx - a.cx) * axis[0] + (b.cz - a.cz) * axis[1]);
    const ra = a.hx * Math.abs(a.ux[0] * axis[0] + a.ux[1] * axis[1]) + a.hz * Math.abs(a.uz[0] * axis[0] + a.uz[1] * axis[1]);
    const rb = b.hx * Math.abs(b.ux[0] * axis[0] + b.ux[1] * axis[1]) + b.hz * Math.abs(b.uz[0] * axis[0] + b.uz[1] * axis[1]);
    best = Math.max(best, center - ra - rb);
  }
  return best;
};
const unit = obb(0, 0, 0, 2, 2);
if (!near(gap(unit, obb(4, 0, 0, 2, 2)), 2)) die("SAT distant self-test");
if (!near(gap(unit, obb(2, 0, 0, 2, 2)), 0)) die("SAT touching self-test");
if (!(gap(unit, obb(1, 0, 0, 2, 2)) < 0)) die("SAT overlap self-test");

const before = await geom();
const host = before[HOST];
if (!host || host.lib !== HOST_LIB || host.scale !== 1) die("windmill host drift");
const yaw = host.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
const pos: [number, number, number] = [
  host.pos[0] + LOCAL[0] * c + LOCAL[2] * s,
  host.pos[1] + LOCAL[1],
  host.pos[2] - LOCAL[0] * s + LOCAL[2] * c,
];
const want = { lib: `store/${SHA.slice(0, 16)}.glb`, pos, yaw, scale: 1 };
const tupleOK = (entity: any) => !!entity
  && entity.lib === want.lib
  && entity.pos.every((n: number, i: number) => near(n, want.pos[i]))
  && near(entity.yaw ?? 0, want.yaw)
  && entity.scale === 1
  && Object.keys(entity.comp ?? {}).length === 0;
if (before[ID] && !tupleOK(before[ID])) die("existing B-10 entity drift");

const fromEntity = (entity: any): OBB => {
  const y = entity.yaw ?? 0, co = Math.cos(y), si = Math.sin(y);
  const lx = (entity.bbox.min[0] + entity.bbox.max[0]) / 2;
  const lz = (entity.bbox.min[2] + entity.bbox.max[2]) / 2;
  return obb(entity.pos[0] + lx * co + lz * si, entity.pos[2] - lx * si + lz * co, y, entity.bbox.size[0], entity.bbox.size[2]);
};
const localCenterZ = (-0.03500000014901161 + 0.13500000536441803) / 2;
const target = obb(pos[0] + localCenterZ * s, pos[2] + localCenterZ * c, yaw, 2.25, 0.17000000551342964);
let nearest = { id: "", gap: Infinity };
for (const entity of Object.values(before) as any[]) {
  if (!entity.bbox || entity.id === HOST || entity.id === ID || entity.id === "nx-town-roads" || entity.id === "nx-core-paths") continue;
  if (entity.bbox.size[1] <= 0.5) continue;
  const clearance = gap(target, fromEntity(entity));
  if (clearance < nearest.gap) nearest = { id: entity.id, gap: clearance };
  if (clearance < -0.001) die(`crown overlaps non-host ${entity.id}: ${clearance}`);
}
console.log(JSON.stringify({ stage: "preflight", host: HOST, hostLib: HOST_LIB, local: LOCAL, pos, envelope: { bottom: 2.22, top: 2.87, doorTop: 2.2, ceilingTop: 3.1 }, nearest }));

if (!before[ID]) {
  const upload = new URL(`${base}/upload`);
  upload.searchParams.set("token", cfg.agentToken);
  upload.searchParams.set("name", "Four-Wind Crown");
  upload.searchParams.set("by", cfg.id);
  const response = await fetch(upload, { method: "POST", body: bytes, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) die(`upload HTTP ${response.status}`);
  const result: any = await response.json();
  if (result.path !== want.lib) die(`upload path mismatch: ${result.path}`);

  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let sent = false;
    const timer = setTimeout(() => reject(new Error("spawn timeout")), 20_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-artwalk-b10-builder", avatar: cfg.avatar, token: cfg.joinToken, agentToken: cfg.agentToken }));
    ws.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(String(event.data));
      if (message.type === "error") { clearTimeout(timer); ws.close(); reject(new Error(message.error)); }
      if (message.type === "snapshot" && !sent) {
        sent = true;
        ws.send(JSON.stringify({ type: "verb", verb: "spawn", args: { id: ID, lib: want.lib, pos: want.pos, yaw: want.yaw, scale: 1 } }));
        setTimeout(() => { clearTimeout(timer); ws.close(); resolve(); }, 1500);
      }
    };
  });
}
const after = await geom();
if (!tupleOK(after[ID])) die("post-place tuple verification failed");
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, ...want, emittedVerbs: before[ID] ? 0 : 1 }));
