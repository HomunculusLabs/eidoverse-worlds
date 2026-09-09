// struct132-terrain-gyroid.ts — read-only terrain preflight at the FINAL
// seat selected by struct132-scan-gyroid.ts: az184 r240 yaw pi, LAWFUL
// (worst solid harmonickiss +6.18). TRUE decoded envelope 4.60 x 4.19 x
// 4.60 ORIGIN-CENTERED x/z (decode re-run this tick ALL PASS). Entity POS
// seats form-CENTER on the axis point: origin-centered => PX = AX. 9pt =
// center + 4 corners + 4 edge mids of the true envelope, in WORLD coords
// (align-1 transform). PY = lowest sample (base on grade).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = Math.PI;
const az = 184 * Math.PI / 180, R = 240;
const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
const CX = 0, CZ = 0; // origin-centered (decode-derived)
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const PX = AX - (CX * cy + CZ * sy);
const PZ = AZ - (-CX * sy + CZ * cy);
console.log(`axis point (${AX.toFixed(6)}, ${AZ.toFixed(6)}) -> entity POS (${PX.toFixed(6)}, PY, ${PZ.toFixed(6)}) yaw ${YAW}`);
const E = 2.30; // envelope half-extent x/z (decode-derived, 4.60/2)
const local: [string, number, number][] = [
    ["center", 0, 0],
    ["corner++", E, E], ["corner+-", E, -E],
    ["corner-+", -E, E], ["corner--", -E, -E],
    ["mid-e", E, 0], ["mid-w", -E, 0],
    ["mid-n", 0, -E], ["mid-s", 0, E],
];
const pts = local.map(([n, lx, lz]) => {
    const wx = PX + lx * cy + lz * sy, wz = PZ - lx * sy + lz * cy;
    return [n, wx, wz] as [string, number, number];
});
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct132-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
try {
    await agent.connect(); await Bun.sleep(2500);
    const hs: number[] = [];
    for (const [n, wx, wz] of pts) {
        const h = await agent.heightAt(wx, wz);
        hs.push(h);
        console.log(`${n} (${wx.toFixed(3)}, ${wz.toFixed(3)}) -> ${h.toFixed(6)}`);
    }
    const spread = Math.max(...hs) - Math.min(...hs);
    console.log(`\nspread ${spread.toFixed(4)} (max-min) | PY = lowest = ${Math.min(...hs).toFixed(6)}`);
} finally {
    await agent.disconnect?.();
}
