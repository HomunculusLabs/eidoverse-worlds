// ne-approach2-read18.ts — approach-2 18m readability sweep (plan §4 law).
// The lane's home straight serves the NE craft ring's inner edge: the eye point
// is on the lane 18m before each flanking work's arrival face, walked by the
// headless body, sightline sampled for solid blockers.
import { readFileSync } from "node:fs";
import { WorldAgent } from "../../mcpl/agent.ts";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const d2r = (d: number) => (d * Math.PI) / 180;

// flanking works: statuary-0052 (r74 az27) and hamlet-0054 (r88 az16) — the lane
// ends at (72, az15) between their arrival faces.
const TARGETS: Array<{ id: string; pos: [number, number] }> = [
  { id: "nx-craft-statuary-0052", pos: [33.6, 65.9] },
  { id: "nx-craft-hamlet-0054", pos: [24.3, 84.6] },
];

async function geom() {
  const r = await fetch(`https://eidoverse.billding.dev/geom?world=commons-next`);
  if (!r.ok) throw new Error(`geom HTTP ${r.status}`);
  const d: any = await r.json();
  return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}

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
  const r = Math.hypot(target[0], target[1]);
  const az = Math.atan2(target[0], target[1]);
  const re = r - 18;
  return [re * Math.sin(az), re * Math.cos(az)];
}

const solids = await geom();
const agent = new WorldAgent({ url: cfg.url, name: "arthur-approach2-read18", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect();
  await Bun.sleep(2200);
  agent.stop();
  const report: any[] = [];
  for (const t of TARGETS) {
    const [ex, ez] = eyePoint(t.pos);
    const okWalk = await agent.walkTo(ex, ez, false, 40_000);
    const arrival = Math.hypot(agent.pos.x - ex, agent.pos.z - ez);
    let blockedBy: string | null = null;
    for (let i = 1; i < 64 && !blockedBy; i++) {
      const s = i / 64;
      const px = ex + (t.pos[0] - ex) * s, pz = ez + (t.pos[1] - ez) * s;
      for (const [id, e] of Object.entries(solids)) {
        if (id === t.id || id === "nx-core-paths" || id.startsWith("nx-approach-")) continue;
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
