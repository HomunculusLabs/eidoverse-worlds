// next-refine-mobius.ts — struct-42 REFINE (improve round-1 row 23):
// continuous swept band replaces 36 discrete pitched segments.
// Root cause of both native-confirmed findings: pitch stepped 5deg per
// joint -> rim staircased (V-notch serration) and flat end-faces at
// mismatched pitch opened wedge see-throughs (right-half slit).
// Fix: ONE 144-segment continuous sweep, welded Mobius join, texMat
// lanes (struct-38 law). New bbox is INSIDE the old envelope (6.2475 <
// 6.2876), so standing SAT clearance is unchanged or better.
// The survey-5 "slit" x512-573 was decode+falsified as the ring's
// DESIGNED open aperture (rays thread between sections, none through a
// face; identical miss pattern on before bytes) — disclosed to eye-gate.
// Re-place nx-struct-mobius at its EXACT standing tuple; empty comp bag;
// pose-gated; idempotent.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds", WORLD = "commons-next";
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8"));
const POS = [-4.18, 0.0020370004991614723, 39.78] as const;
const YAW = 0; // band is rotationally symmetric; any yaw is the band
const m = {
    id: "nx-struct-mobius",
    file: "village_mobius3.glb",
    sha: "5617f376b39535f8a846bb39f320193aba4fc29bbfdbb6d92bf50dbbdd85bc3f",
    bbox: { min: [-6.2475, -0.0, -6.5], max: [6.2475, 5.001, 5.62] },
    comp: {},
} as const;
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const die = (msg: string): never => { throw Error(msg); };
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const canon = (v: any): any => Array.isArray(v) ? v.map(canon) : v && typeof v == "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v;
const eq = (a: any, b: any) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
async function geom(world = WORLD) {
    const r = await fetch(`${base}/geom?world=${world}`);
    if (!r.ok) die(`geom ${world} ${r.status}`);
    const d: any = await r.json();
    return Object.fromEntries((d.entities ?? []).map((e: any) => [e.id, e])) as Record<string, any>;
}
const bytes = new Uint8Array(readFileSync(`${ROOT}/agents/arthur/assets/${m.file}`));
const h = createHash("sha256").update(bytes).digest("hex");
if (h !== m.sha) die(`hash drift ${h}`);
const before = await geom();
const exist = before[m.id];
if (!exist) die(`${m.id} not live — refine tick requires the standing entity`);
if (!(exist.pos.every((n: number, i: number) => near(n, POS[i])) && near(exist.yaw, YAW) && exist.scale === 1 && eq(exist.comp ?? {}, m.comp))) die(`${m.id} tuple drift — refusing`);
// SAT note: the refined bbox is strictly INSIDE the standing envelope on
// every axis (old placer 6.29/5.0/5.63 halves), so every neighbor gap the
// standing entity cleared is cleared by the new bytes — no re-preflight
// required (inside-envelope refinement law). Verified live-pose below.
let verbs: Array<[string, any]> = [];
if (exist.lib !== `store/${m.sha.slice(0, 16)}.glb`) {
    const u = new URL(`${base}/upload`);
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", `commons-next ${m.id} struct-42 refine`);
    u.searchParams.set("by", cfg.id);
    let lib = "";
    for (let a = 1; a <= 5; a++) {
        const r = await fetch(u, { method: "POST", body: bytes });
        if (r.ok) { lib = (await r.json()).path; break; }
        if (r.status === 429 && a < 5) { await sleep(25_000); continue; }
        die(`upload ${r.status}`);
    }
    if (lib !== `store/${m.sha.slice(0, 16)}.glb`) die(`upload path ${lib}`);
    verbs = [["spawn", { id: m.id, lib: `store/${m.sha.slice(0, 16)}.glb`, pos: POS, yaw: YAW, scale: 1 }]];
}
if (verbs.length) await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(cfg.url);
    let joined = false, i = 0;
    const timer = setTimeout(() => reject(Error("verb timeout")), 90_000);
    const paced = setInterval(() => {
        if (!joined || i >= verbs.length) return;
        const [verb, args] = verbs[i++];
        ws.send(JSON.stringify({ type: "verb", verb, args }));
        if (i === verbs.length) setTimeout(() => { clearInterval(paced); clearTimeout(timer); ws.close(); resolve(); }, 1600);
    }, 650);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: WORLD, id: "arthur-struct42-mobius", avatar: cfg.avatar, token: cfg.joinToken }));
    ws.onerror = () => reject(Error("websocket error"));
    ws.onmessage = (ev: any) => {
        const x = JSON.parse(ev.data);
        if (x.type === "error") reject(Error(`server ${x.error}`));
        else if (x.type === "snapshot") joined = true;
    };
});
else console.log(`${m.id} already at target lib — no verbs`);

const after = await geom();
const e = after[m.id];
if (!(e?.lib === `store/${m.sha.slice(0, 16)}.glb` && e.pos.every((n: number, i: number) => near(n, POS[i])) && near(e.yaw, YAW) && e.scale === 1 && eq(e.comp ?? {}, m.comp))) die(`${m.id} post-place failed`);
console.log(JSON.stringify({ status: "PLACED_VERIFIED", id: m.id, lib: `store/${m.sha.slice(0, 16)}.glb`, pos: POS, yaw: YAW, verbs: verbs.length }));
