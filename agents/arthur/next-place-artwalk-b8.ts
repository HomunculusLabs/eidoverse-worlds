// next-place-artwalk-b8.ts — host-rider placement for the Livery Harmonic Rein.
// Owns nx-artwalk-* only; nx-town-stable is read-only host truth.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const WORLD = "commons-next";
const ID = "nx-artwalk-b8-stable-harmonic-rein";
const HOST = "nx-town-stable";
const HOST_LIB = "store/84ba3b1b110282d9.glb";
const SHA = "cba8d0efb0518938c39120d1d3cdf80d9062fd47fab9e73bfd3c2f1f6959b9ea";
const LOCAL: [number, number, number] = [0, 2.22, -2.16];
const REJECTED_TRIAL_POS: [number, number, number] = [40.84, 1.65, 1.3226185430791415e-16];
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_artwalk_b8.glb`);
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const die = (message: string): never => { throw new Error(message); };

if (createHash("sha256").update(bytes).digest("hex") !== SHA) die("local build hash drift");

async function geom() {
  const response = await fetch(`${base}/geom?world=${WORLD}`, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) die(`geom HTTP ${response.status}`);
  const data: any = await response.json();
  return Object.fromEntries(data.entities.map((entity: any) => [entity.id, entity])) as Record<string, any>;
}

const before = await geom();
const host = before[HOST];
if (!host || host.lib !== HOST_LIB || host.scale !== 1) die("stable host drift");
const yaw = host.yaw ?? 0;
const c = Math.cos(yaw), s = Math.sin(yaw);
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
const rejectedTrialOK = (entity: any) => !!entity
  && entity.lib === want.lib
  && entity.pos.every((n: number, i: number) => near(n, REJECTED_TRIAL_POS[i]))
  && near(entity.yaw ?? 0, want.yaw)
  && entity.scale === 1
  && Object.keys(entity.comp ?? {}).length === 0;
if (before[ID] && !tupleOK(before[ID]) && !rejectedTrialOK(before[ID])) die("existing B-8 entity drift");

// The thin panel bridges the host's source-true open front at local -Z. Its
// x-span remains inside the 5.4m opening, and its y-band 2.22..2.64m stays
// above avatar height and below the 2.70m wall/roof line. Check every
// non-host live bbox in world space.
type OBB = { cx: number; cz: number; ux: [number, number]; uz: [number, number]; hx: number; hz: number };
const obb = (cx: number, cz: number, y: number, sx: number, sz: number): OBB => ({
  cx, cz, ux: [Math.cos(y), -Math.sin(y)], uz: [Math.sin(y), Math.cos(y)], hx: sx / 2, hz: sz / 2,
});
const fromEntity = (e: any): OBB => {
  const y = e.yaw ?? 0, co = Math.cos(y), si = Math.sin(y);
  const lx = (e.bbox.min[0] + e.bbox.max[0]) / 2;
  const lz = (e.bbox.min[2] + e.bbox.max[2]) / 2;
  return obb(e.pos[0] + lx * co + lz * si, e.pos[2] - lx * si + lz * co, y, e.bbox.size[0], e.bbox.size[2]);
};
const gap = (a: OBB, b: OBB) => {
  // SAT clearance is the greatest separating-axis gap. A negative result on
  // every axis means overlap; taking the minimum would invent intersections.
  let best = -Infinity;
  for (const axis of [a.ux, a.uz, b.ux, b.uz] as const) {
    const center = Math.abs((b.cx - a.cx) * axis[0] + (b.cz - a.cz) * axis[1]);
    const ra = a.hx * Math.abs(a.ux[0] * axis[0] + a.ux[1] * axis[1]) + a.hz * Math.abs(a.uz[0] * axis[0] + a.uz[1] * axis[1]);
    const rb = b.hx * Math.abs(b.ux[0] * axis[0] + b.ux[1] * axis[1]) + b.hz * Math.abs(b.uz[0] * axis[0] + b.uz[1] * axis[1]);
    best = Math.max(best, center - ra - rb);
  }
  return best;
};
const panelCenterLocalZ = (0.1102338433265686 - 0.042500000447034836) / 2;
const target = obb(pos[0] + panelCenterLocalZ * s, pos[2] + panelCenterLocalZ * c, yaw, 4.900000095367432, 0.15273384377360344);
let nearest = { id: "", gap: Infinity };
for (const entity of Object.values(before) as any[]) {
  if (!entity.bbox || entity.id === HOST || entity.id === ID || entity.id === "nx-town-roads" || entity.id === "nx-core-paths") continue;
  if (entity.bbox.size[1] <= 0.5) continue;
  const g = gap(target, fromEntity(entity));
  if (g < nearest.gap) nearest = { id: entity.id, gap: g };
  if (g < -0.001) die(`panel overlaps non-host ${entity.id}: ${g}`);
}
console.log(JSON.stringify({ stage: "preflight", host: HOST, hostLib: HOST_LIB, local: LOCAL, pos, nearest }));

if (!before[ID]) {
  const upload = new URL(`${base}/upload`);
  upload.searchParams.set("token", cfg.agentToken);
  upload.searchParams.set("name", "Livery Harmonic Rein");
  upload.searchParams.set("by", cfg.id);
  const response = await fetch(upload, { method: "POST", body: bytes, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) die(`upload HTTP ${response.status}`);
  const result: any = await response.json();
  if (result.path !== want.lib) die(`upload path mismatch: ${result.path}`);

}

if (!tupleOK(before[ID])) {
  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let sent = false;
    const timer = setTimeout(() => reject(new Error("spawn timeout")), 20_000);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-artwalk-b8-builder", avatar: cfg.avatar, token: cfg.joinToken, agentToken: cfg.agentToken }));
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
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, ...want, emittedVerbs: tupleOK(before[ID]) ? 0 : 1 }));
