// struct130-terrain-harmonickiss.ts — read-only terrain preflight at the
// FINAL seat selected by struct130-scan-harmonickiss.ts: az184 r230 yaw pi.
// TRUE decoded envelope 3.00 x 6.40 x 3.00, ORIGIN-CENTERED x/z (CX=CZ=0,
// decode ALL PASS 17/17). Entity POS seats form-CENTER on the axis point:
// PX = AX - (CX*cos + CZ*sin) = AX (origin-centered). 9pt = center + 4
// corners + 4 edge mids of the true envelope, in WORLD coords (align-1
// transform). PY = lowest sample (base on grade).
import { WorldAgent } from "../../mcpl/agent.ts";
import { readFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
process.env.WORLD_TOKEN = cfg.joinToken;
const YAW = Math.PI;
const az = 184 * Math.PI / 180, R = 230;
const AX = R * Math.sin(az), AZ = -R * Math.cos(az);
const CX = 0, CZ = 0; // origin-centered (decode-derived)
const cy = Math.cos(YAW), sy = Math.sin(YAW);
const PX = AX - (CX * cy + CZ * sy);
const PZ = AZ - (-CX * sy + CZ * cy);
console.log(`axis point (${AX.toFixed(6)}, ${AZ.toFixed(6)}) -> entity POS (${PX.toFixed(6)}, PY, ${PZ.toFixed(6)}) yaw ${YAW}`);
const local: [string, number, number][] = [
    ["center", 0, 0],
    ["corner++", 1.5, 1.5], ["corner+-", 1.5, -1.5],
    ["corner-+", -1.5, 1.5], ["corner--", -1.5, -1.5],
    ["mid-e", 1.5, 0], ["mid-w", -1.5, 0],
    ["mid-n", 0, -1.5], ["mid-s", 0, 1.5],
];
const pts = local.map(([n, lx, lz]) => {
    const wx = PX + lx * cy + lz * sy, wz = PZ - lx * sy + lz * cy;
    return [n, wx, wz] as [string, number, number];
});
const agent = new WorldAgent({ url: cfg.url, name: "arthur-struct130-terrain-read", world: "commons-next", avatar: cfg.avatar, agentToken: cfg.agentToken });
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
