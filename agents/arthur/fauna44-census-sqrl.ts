// fauna44-census-sqrl.ts — pre-build census for the fauna-44 red
// squirrel: verify the three candidate anchor hosts live (plan row 29:
// FIRST nx-dress-ne-woodstack-001; FALLBACK nx-town-woodyard /
// nx-dress-nw-logpile-001), dump their tuples/libs/bboxes for the seat
// sweep + render context, and count the standing fauna domain. Read-only.
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");

const r = await fetch(`${base}/geom?world=commons-next`, { signal: AbortSignal.timeout(25_000) });
if (!r.ok) throw Error(`geom ${r.status}`);
const d: any = await r.json();
const ents: any[] = d.entities;
console.log("census total:", ents.length);

const TARGETS = ["nx-dress-ne-woodstack-001", "nx-town-woodyard", "nx-dress-nw-logpile-001"];
for (const eid of TARGETS) {
    const e = ents.find((x: any) => x.id === eid);
    if (!e) { console.log(`${eid} -> ABSENT`); continue; }
    const bb = e.bbox;
    // yawed world-center of the local-frame bbox (struct-80 law b)
    const ecx = (bb.min[0] + bb.max[0]) / 2, ecz = (bb.min[2] + bb.max[2]) / 2;
    const cos = Math.cos(e.yaw), sin = Math.sin(e.yaw);
    const wx = e.pos[0] + ecx * cos + ecz * sin, wz = e.pos[2] - ecx * sin + ecz * cos;
    console.log(JSON.stringify({
        id: eid, pos: e.pos, yaw: +e.yaw.toFixed(4), lib: (e.lib ?? "").slice(0, 24),
        bboxSize: bb.size.map((v: number) => +v.toFixed(3)), bboxCenterWorld: [+wx.toFixed(2), +wz.toFixed(2)],
        comps: Object.keys(e.comp ?? {}),
    }));
}
const fa = ents.filter((e: any) => e.id.startsWith("nx-dress-") && /goat|hen|hutch|duck|fox|frog|bcat|owl|robin|goose|sheep|pig|dove|cow|donk|turkey|pea|roost|bee|swallow|heron|dog|wrabbit|deer|hog/.test(e.id));
console.log("fauna-domain entities standing:", fa.length);
