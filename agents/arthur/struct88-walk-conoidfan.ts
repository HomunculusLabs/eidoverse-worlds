// struct88-walk-conoidfan.ts — struct-88: MCPL walk gate for THE CONOID FAN
// (owed by struct-87 queue-law FIRST). Entity origin (25.82, -0.0154, 48.56)
// yaw -1.0821 rad; envelope center world (26.89, 50.57), grown half 4.44x4.34.
// Enterable pavilion: under-canopy both directions (mast side <-> tip edge)
// via the t~0.8 post gap, flank entry to center, outside circuit 8m standoff
// (axis clearance 3.56m; circuit clears nx-approach-ne-lamp-002-l by >=1.58m
// on every leg, checked analytically). Ribs' low underside 2.285m.
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const CX = 26.89, CZ = 50.57, ST = 8;
const results: any[] = [];
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct88-walk", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
async function leg(name: string, end: [number, number], expect: "PASS" | "BLOCKED" = "PASS") {
    const ok = await agent.walkTo(end[0], end[1], false, 20_000);
    const dist = Math.hypot(agent.pos.x - end[0], agent.pos.z - end[1]);
    const pass = expect === "PASS" ? (ok && dist <= .6) : (!ok || dist > 1.0);
    results.push({ name, ok, dist: +dist.toFixed(3), expect, pass });
    if (!pass) throw Error(`${name} failed ok=${ok} dist=${dist} expect=${expect}`);
}
try {
    await agent.connect(); await Bun.sleep(1700); agent.stop();
    // local->world at yaw -1.0821 (cos .4712, sin -.8820):
    //   wx = 25.82 + lx*.4712 + lz*(-.8820); wz = 48.56 + lx*.8820 + lz*.4712
    const mastOut: [number, number] = [22.76, 44.53];  // local (-5, 0.8)
    const tipOut: [number, number] = [28.65, 55.55];   // local (7.5, 0.8)
    const ctr: [number, number] = [26.90, 50.59];      // local (2.275, 0) under mid-fan
    const flankIn: [number, number] = [32.20, 47.76];  // local (2.3, -6)
    agent.pos.x = mastOut[0]; agent.pos.z = mastOut[1]; agent.pos.y = agent.heightAt(mastOut[0], mastOut[1]); await Bun.sleep(250);
    await leg("mastIn_center", ctr);        // enter mast side, under all 17 ribs
    await leg("center_tipOut", tipOut);     // exit past the tip rail
    await leg("tipIn_center", ctr);         // reverse: re-enter at tip edge
    await leg("center_mastOut", mastOut);   // exit mast side (through both ways)
    agent.stop(); agent.pos.x = flankIn[0]; agent.pos.z = flankIn[1]; agent.pos.y = agent.heightAt(flankIn[0], flankIn[1]); await Bun.sleep(250);
    await leg("flankIn_center", ctr);       // flank entry under the fan
    agent.stop();
    // outside circuit CW at standoff (obstruction check, lamp clear >=1.58m)
    agent.pos.x = CX; agent.pos.z = CZ - ST; agent.pos.y = agent.heightAt(CX, CZ - ST); await Bun.sleep(250);
    await leg("n->e", [CX + ST, CZ]);
    await leg("e->s", [CX, CZ + ST]);
    await leg("s->w", [CX - ST, CZ]);
    await leg("w->n", [CX, CZ - ST]);
    const maxArr = Math.max(...results.map(r => r.dist));
    console.log(JSON.stringify({ status: "ALL_PASS", legs: results.length, maxArrival: +maxArr.toFixed(3), results }, null, 2));
} finally { agent.close(); }
