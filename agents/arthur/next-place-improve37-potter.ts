// next-place-improve37-potter.ts — improve-37: nx-town-potter reseat
// (remove+spawn, exact standing tuple) with the spoked-flywheel GLB +
// motion:pwheel spin comp re-apply (comp bag captured BEFORE, re-applied
// AFTER — comp-wipe law). commons-next only. Keep-outs: rider
// nx-artwalk-b3-ruled-porch + light nx-town-potter-l are separate
// entities, untouched; envelope strict-subset (decode-proven) so the
// same-tuple re-place is SAT-neutral. Gate: baseline lib dad7c82e at the
// exact tuple, or the new pin 2062c446 with the pwheel comp present
// (idempotent rerun).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [26, 0, 40.5] as const;
const YAW = -2.5834592128922376;
const SHA = "2062c4468996b2bb";
const PREV = "dad7c82efbf3202b";
const ID = "nx-town-potter";
const PWHEEL = { type: "spin", axis: [0, 1, 0], pivot: [0, 0, 0], degPerSec: 9 };
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (m: string): never => { throw Error(m); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
async function geom() {
    const r = await fetch(`${base}/geom?world=${WORLD}`);
    if (!r.ok) die(`geom ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_potter3.glb`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h.slice(0, 16) !== SHA) die(`${ID} hash drift ${h}`);
const before = await geom();
const exist = before[ID];
if (!exist) die(`${ID} not standing — this placer only reseats`);
const liveLib = exist.lib;
const atPin = exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1;
if (!atPin) die(`${ID} live pose drift: pos=${exist.pos} yaw=${exist.yaw}`);
if (!(liveLib === `store/${PREV}.glb` || liveLib === `store/${SHA}.glb`)) die(`${ID} live lib drift: ${liveLib}`);
if (liveLib === `store/${SHA}.glb`) {
    const bag = exist.comp ?? {};
    if (!(bag["motion:pwheel"] && bag["motion:pwheel"].degPerSec === PWHEEL.degPerSec))
        die(`${ID} rerun expected pwheel comp, found ${JSON.stringify(bag)}`);
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", id: ID, lib: liveLib, verbs: 0 }));
    process.exit(0);
}
// comp bag capture check (baseline must carry the pwheel spin we re-apply)
const baseBag = exist.comp ?? {};
if (!(baseBag["motion:pwheel"] && baseBag["motion:pwheel"].degPerSec === PWHEEL.degPerSec))
    die(`${ID} baseline comp bag unexpected: ${JSON.stringify(Object.keys(baseBag))}`);
// SAT: envelope decode-proven strict-subset of live bbox at identical
// tuple — same-tuple re-place, no new overlap possible; standing gates
// already green.
(function () {
    const bb = exist.bbox;
    if (!bb || Math.abs(bb.size[0] - 3.435) > 0.05 || Math.abs(bb.size[2] - 1.706) > 0.05) die(`${ID} live bbox unexpected ${JSON.stringify(bb?.size)}`);
    console.log(JSON.stringify({ sat_preflight: "same-tuple re-place, envelope strict-subset (decode)", live_bbox: bb.size }));
})();
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", `commons-next ${ID} improve-37`);
u.searchParams.set("by", cfg.id);
let lib = "";
for (let a = 1; a <= 5; a++) {
    const r = await fetch(u, { method: "POST", body: bytes });
    if (r.ok) { lib = (await r.json()).path; break; }
    if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
    die(`${ID} upload ${r.status}`);
}
if (lib !== `store/${SHA}.glb`) die(`${ID} upload path ${lib} want ${SHA}`);
const verbs: Array<[string, any]> = [
    ["remove", { id: ID }],
    ["spawn", { id: ID, lib: `store/${SHA}.glb`, pos: POS, yaw: YAW, scale: 1 }],
    ["comp", { id: ID, type: "motion:pwheel", data: PWHEEL }],
];
const WebSocket = (await import("ws")).default;
const ws = new WebSocket(cfg.url, { headers: { Authorization: `Bearer ${cfg.agentToken}` } });
const sent: string[] = [];
await new Promise<void>((res, rej) => {
    const to = setTimeout(() => rej(Error("ws timeout")), 30_000);
    ws.on("open", () => {
        ws.send(JSON.stringify({ type: "join", world: WORLD, token: cfg.joinToken ?? cfg.agentToken }));
        verbs.forEach(([v, args], i) => setTimeout(() => { ws.send(JSON.stringify({ type: "verb", verb: v, args })); sent.push(v); }, 600 * (i + 1)));
        setTimeout(() => { clearTimeout(to); ws.close(); res(); }, 600 * verbs.length + 1200);
    });
    ws.on("error", e => { clearTimeout(to); rej(e); });
});
// post-place verify: fresh census, exact tuple + lib + comp
await sleep(1500);
const after = await geom();
const e2 = after[ID];
if (!e2) die(`${ID} gone after reseat`);
if (!(e2.lib === `store/${SHA}.glb` && e2.pos.every((n: number, i: number) => near(n, POS[i])) && near(e2.yaw, YAW)))
    die(`${ID} post-place drift: lib=${e2.lib} pos=${e2.pos} yaw=${e2.yaw}`);
const bag2 = e2.comp ?? {};
if (!(bag2["motion:pwheel"] && bag2["motion:pwheel"].degPerSec === PWHEEL.degPerSec))
    die(`${ID} post-place comp bag missing pwheel: ${JSON.stringify(bag2)}`);
// rider + light companion still standing
if (!after["nx-artwalk-b3-ruled-porch"]) die("rider nx-artwalk-b3-ruled-porch missing after reseat");
if (!after["nx-town-potter-l"]) die("light companion nx-town-potter-l missing after reseat");
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: e2.lib, tuple: e2.pos, yaw: e2.yaw, compKeys: Object.keys(bag2), verbs: sent.length, verbList: sent }));
