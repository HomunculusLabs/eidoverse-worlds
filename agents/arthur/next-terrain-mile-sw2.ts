// next-terrain-mile-sw2.ts — read-only terrain preflight for mile-7
// (SW district ARRIVAL pair, lit variant). Boundary A = P1 = pol(71, 217.25)
// = (-42.9759, -56.5161), end of the committed SW radial (mkv3-sw-approach3.ts
// r24->r71, az217.25). Travel u = dir(az) = (sin,cos) = (-0.6091, -0.7931);
// perp N = (u.z, -u.x) = (-0.7931, +0.6091). Origin: dot(N, O-P0) = +46.6 > 0
// (origin on +N side) -> village-side LIT post = A - 2.3*N = (-41.1451,
// -57.9083); district-side unlit twin = A + 2.3*N = (-44.8067, -55.1240).
// Yaw law: arm aims at the lane centerline, yaw = az(post->A) - 90.
// Object-form WorldAgent chassis (proven next-terrain-mile-ne2.ts).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN=cfg.joinToken;
const d2r = (d: number) => (d * Math.PI) / 180;
const AZ = 217.25, R = 64; // mile-7 RESITE: r71 village-side verge is inside temple terrace-0049's platform (SAT -4.04); nearest clear station r64 (V +2.07 / D +7.21)
const a = d2r(AZ);
const A: [number, number] = [R * Math.sin(a), R * Math.cos(a)];
const U: [number, number] = [Math.sin(a), Math.cos(a)];
const N: [number, number] = [U[1], -U[0]];
const postV: [number, number] = [A[0] - N[0] * 2.3, A[1] - N[1] * 2.3]; // village-side (LIT)
const postD: [number, number] = [A[0] + N[0] * 2.3, A[1] + N[1] * 2.3]; // district-side (unlit)
console.log("A", A.map(v => v.toFixed(4)).join(", "), "U", U.map(v => v.toFixed(4)).join(", "), "N", N.map(v => v.toFixed(4)).join(", "));
console.log("postV", postV.map(v => v.toFixed(4)).join(", "), "postD", postD.map(v => v.toFixed(4)).join(", "));

const pts: Array<[string, number, number]> = [
  ["A", A[0], A[1]],
  ["postV", postV[0], postV[1]],
  ["postD", postD[0], postD[1]],
];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-mile7-terrain", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
  await agent.connect();
  await Bun.sleep(2500);
  for (const [name, x, z] of pts) console.log(JSON.stringify({ name, x, z, heightAt: agent.heightAt(x, z) }));
} finally { agent.close(); }
