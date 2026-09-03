// nw-approach1-read18.ts — approach-1 18m readability sweep (plan §4 law).
// For each district work whose ARRIVAL FACE the lane serves, walk the lane
// line (headless MCPL body) and at the 18m-before point check the sightline:
// the work's center must be visible (distance ~18m, no solid blocker between
// eye height 1.65 at the lane and the work's mid-height).
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const d2r = (d: number) => (d * Math.PI) / 180;
const A1 = d2r(306), A2 = d2r(315);

// flanking works: inner NW cultivation pieces whose approach the lane lands on.
// lavender-0027 (r72.3 az311.8) is the work the lane's home straight serves;
// orchard-0033 (r87.5 az315) is on the lane's extended axis beyond the edge.
const TARGETS = [
  { id: "nx-cultivation-lavender-0027", pos: [-53.907, 48.166] },
  { id: "nx-cultivation-orchard-0033", pos: [-61.872, 61.872] },
];

async function geom() {
  const r = await fetch(`https://eidoverse.billding.dev/geom?world=commons-next`);
  if (!r.ok) throw new Error(`geom HTTP ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}

const solids = await geom();
// blockers along the sightline: entity OBBs with bbox height > 0.5, excluding the targets themselves
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
  // the point on the lane 18m before the work along its approach axis
  const dx = target[0], dz = target[1];
  const r = Math.hypot(dx, dz);
  const az = Math.atan2(dx, dz);
  const re = r - 18;
  return [re * Math.sin(az), re * Math.cos(az)];
}

const agent = new WorldAgent({ url: cfg.url, name: "arthur-approach1-read18", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  const report: any[] = [];
  for (const t of TARGETS) {
    const [ex, ez] = eyePoint(t.pos);
    const okWalk = await agent.walkTo(ex, ez, false, 40_000);
    const arrival = Math.hypot(agent.pos.x - ex, agent.pos.z - ez);
    // sightline: sample 64 points between eye and target center; a blocker is a
    // solid (h>0.5) entity whose OBB contains a sample point within its footprint
    let blockedBy: string | null = null;
    for (let i = 1; i < 64 && !blockedBy; i++) {
      const s = i / 64;
      const px = ex + (t.pos[0] - ex) * s, pz = ez + (t.pos[1] - ez) * s;
      for (const [id, e] of Object.entries(solids)) {
        if (id === t.id || id === "nx-core-paths" || id === "nx-approach-nw-lane-001") continue;
        const eany = e as any;
        if (!eany.bbox || eany.bbox.size[1] <= 0.5) continue;
        if (obbDist(px, pz, eany) < 0.5) { blockedBy = id; break; }
      }
    }
    const dist = Math.hypot(t.pos[0] - ex, t.pos[1] - ez);
    report.push({ target: t.id, eye: [+ex.toFixed(1), +ez.toFixed(1)], walkOk: okWalk, arrival: +arrival.toFixed(2), sightDist: +dist.toFixed(1), blockedBy });
  }
  const pass = report.every(r => r.walkOk && !r.blockedBy && Math.abs(r.sightDist - 18) < 2);
  console.log(JSON.stringify({ status: pass ? "READABILITY_PASS" : "READABILITY_FAIL", report }, null, 1));
} finally { agent.close(); }
