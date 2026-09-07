// next-place-improve30-court.ts — improve-30: nx-court reseat (remove+spawn,
// exact standing tuple) with the court-identity GLB + smoke comp re-apply.
// commons-next only. Comp bag at baseline: particles:smoke {origin [-4.9,3.2,-0.8]}.
// Riders b28/b29 + b23 are separate entities — untouched (keep-outs proven at
// decode). Live pin gate: baseline 59534b10122e6b47 at the exact tuple, or
// the new pin 77cab2c3 with the smoke comp present (idempotent rerun).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [18.9, -1.5946487083102603e-08, -14.8] as const;
const YAW = -0.90756;
const SHA = "77cab2c3cc3a39c7";
const PREV = "59534b10122e6b47";
const ID = "nx-court";
const SMOKE = { preset: "smoke", origin: [-4.9, 3.2, -0.8], count: 50, size: 0.4, speed: 0.35 };
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
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/village_court3.glb`));
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
    if (!(bag["particles:smoke"] && JSON.stringify(bag["particles:smoke"].origin) === JSON.stringify(SMOKE.origin)))
        die(`${ID} rerun expected smoke comp, found ${JSON.stringify(bag)}`);
    console.log(JSON.stringify({ status: "ALREADY_LIVE_NO_VERBS", id: ID, lib: liveLib, verbs: 0 }));
    process.exit(0);
}
// comp bag capture check (baseline must carry the smoke comp we re-apply)
const baseBag = exist.comp ?? {};
if (!(baseBag["particles:smoke"] && JSON.stringify(baseBag["particles:smoke"].origin) === JSON.stringify(SMOKE.origin)))
    die(`${ID} baseline comp bag unexpected: ${JSON.stringify(Object.keys(baseBag))}`);
// SAT: envelope decode-proven strict-subset of live bbox at identical tuple —
// same-tuple re-place, no new overlap possible; standing gates already green.
(function () {
    const bb = exist.bbox;
    if (!bb || Math.abs(bb.size[0] - 13) > 0.05 || Math.abs(bb.size[2] - 5.94) > 0.05) die(`${ID} live bbox unexpected ${JSON.stringify(bb?.size)}`);
    console.log(JSON.stringify({ sat_preflight: "same-tuple re-place, envelope strict-subset (decode)", live_bbox: bb.size }));
})();
const u = new URL(`${base}/upload`);
u.searchParams.set("token", cfg.agentToken);
u.searchParams.set("name", `commons-next ${ID} improve-30`);
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
    ["comp", { id: ID, type: "particles:smoke", data: SMOKE }],
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
    ws.on("error", (e: any) => { clearTimeout(to); rej(e); });
});
console.log(JSON.stringify({ verbs_sent: sent }));
await sleep(1500);
const after = await geom();
const now = after[ID];
if (!now || now.lib !== `store/${SHA}.glb`) die(`${ID} post-place lib ${now?.lib}`);
if (!now.pos.every((n: number, i: number) => near(n, POS[i])) || !near(now.yaw, YAW)) die(`${ID} post-place pose drift ${now?.pos} ${now?.yaw}`);
const bagNow = now.comp ?? {};
if (!(bagNow["particles:smoke"] && JSON.stringify(bagNow["particles:smoke"].origin) === JSON.stringify(SMOKE.origin))) die(`${ID} smoke comp missing post-place: ${JSON.stringify(bagNow)}`);
if (!after["nx-artwalk-b28-bake-count"] || !after["nx-artwalk-b29-strike-count"] || !after["nx-artwalk-b23-cistern-rain-count"]) die("rider lost in reseat");
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: ID, lib: now.lib, pos: POS, yaw: YAW, comp: Object.keys(bagNow), riders: 3 }));
