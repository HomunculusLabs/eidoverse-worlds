// sw-approach3-read18.ts — approach-3 18m readability sweep (plan §4 law).
// The lane's far end serves the SW temple seed ring: eye point on the lane
// 18m before each flanking work's arrival face, walked, sightline sampled.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const d2r = (d: number) => (d * Math.PI) / 180;

// flanking works at the lane's temple end (from the siting study):
const TARGETS: Array<{ id: string; pos: [number, number] }> = [
  { id: "nx-temple-seed-0021", pos: [-38.4, -58.2] },   // read from live census below
];

async function geom() {
  const r = await fetch(`https://eidoverse.billding.dev/geom?world=commons-next`);
  if (!r.ok) throw new Error(`geom HTTP ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}

// resolve flanking works from LIVE census (never hand-copy):
const solids = await geom();
const a = d2r(217.25);
const END: [number, number] = [71 * Math.sin(a), 71 * Math.cos(a)];
const temple = Object.values(solids).filter((e: any) => e.id.startsWith("nx-temple") && e.bbox)
  .map((e: any) => ({ id: e.id, d: Math.hypot(e.pos[0] - END[0], e.pos[2] - END[1]) }))
  .sort((x, y) => x.d - y.d);
const FLANK = temple.slice(0, 2).map(t => t.id);
console.log("flanking works:", FLANK, "dists:", temple.slice(0, 2).map(t => t.d.toFixed(1)));

function obbDist(px: number, pz: number, e: any): number {
  if (!e.bbox) return 1e9;
  const cx = e.pos[0], cz = e.pos[2], yaw = e.yaw ?? 0;
  const hx = e.bbox.size[0] / 2, hz = e.bbox.size[2] / 2;
  const dx = px - cx, dz = pz - cz;
  const lu = dx * Math.cos(yaw) - dz * Math.sin(yaw);
  const lv = dx * Math.sin(yaw) + dz * Math.cos(yaw);
  return Math.hypot(Math.max(Math.abs(lu) - hx, 0), Math.max(Math.abs(lv) - hz, 0));
}

function eyePoint(target: [number, number]): [number, number] {
  // eye on the LANE (walk backward along the lane axis 18m from the work)
  const dx = target[0] - END[0], dz = target[1] - END[1];
  const L = Math.hypot(dx, dz);
  const ux = dx / L, uz = dz / L;
  const back = 18;
  // eye sits on the lane axis at 18m back from the lane end toward the work... the
  // works flank the END; walk 18m before their arrival face ALONG the lane:
  const r = Math.hypot(target[0], target[1]);
  const az = Math.atan2(target[0], target[1]);
  const re = r - 18;
  return [re * Math.sin(az), re * Math.cos(az)];
}

const agent = new WorldAgent({ url: cfg.url, name: "arthur-approach3-read18", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  const report: any[] = [];
  for (const id of FLANK) {
    const e: any = solids[id];
    const t: [number, number] = [e.pos[0], e.pos[2]];
    const [ex, ez] = eyePoint(t);
    const okWalk = await agent.walkTo(ex, ez, false, 40_000);
    const arrival = Math.hypot(agent.pos.x - ex, agent.pos.z - ez);
    let blockedBy: string | null = null;
    for (let i = 1; i < 64 && !blockedBy; i++) {
      const s = i / 64;
      const px = ex + (t[0] - ex) * s, pz = ez + (t[1] - ez) * s;
      for (const [eid, en] of Object.entries(solids)) {
        if (eid === id || eid === "nx-core-paths" || eid.startsWith("nx-approach-")) continue;
        const eany = en as any;
        if (!eany.bbox || eany.bbox.size[1] <= 0.5) continue;
        if (obbDist(px, pz, eany) < 0.5) { blockedBy = eid; break; }
      }
    }
    const dist = Math.hypot(t[0] - ex, t[1] - ez);
    report.push({ target: id, eye: [+ex.toFixed(1), +ez.toFixed(1)], walkOk: okWalk, arrival: +arrival.toFixed(2), sightDist: +dist.toFixed(1), blockedBy });
  }
  const pass = report.every(r => r.walkOk && !r.blockedBy);
  console.log(JSON.stringify({ status: pass ? "READABILITY_PASS" : "READABILITY_FAIL", report }, null, 1));
} finally { agent.close(); }
