// rescale-mega.ts — R-118 fleet-shape decision: shrink the four mega-works
// without rebuilding their content. Capture live pose/lib/comp first; same-id
// spawn wipes comps, so restore every captured comp before verifying.
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const DIR = `${ROOT}/agents/arthur`;
const cfg = JSON.parse(readFileSync(process.env.PLACER_CONFIG ?? `${DIR}/config.json`, "utf8"));
const httpBase = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const TARGETS = ["av-mason-0002", "av-mason-0023", "av-mason-0036", "av-mason-0049"];
const SCALE = 0.7;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Ent = { id: string; lib: string; pos: number[]; yaw: number; scale?: number; comp?: Record<string, any> };
async function geom(): Promise<Record<string, Ent>> {
    const res = await fetch(`${httpBase}/geom?world=${cfg.world}`);
    if (!res.ok) throw new Error(`geom: ${res.status}`);
    const d = await res.json() as { entities: Ent[] };
    return Object.fromEntries((d.entities ?? []).map((e) => [e.id, e]));
}

const before = await geom();
for (const id of TARGETS) {
    const e = before[id];
    if (!e) throw new Error(`missing target ${id}`);
    if (!/^av-mason-\d{4}$/.test(id)) throw new Error(`unsafe target ${id}`);
    if (e.scale !== undefined && Math.abs(e.scale - 1) > 0.01) throw new Error(`${id} unexpected current scale ${e.scale}`);
    console.log("captured", id, JSON.stringify({ pos: e.pos, yaw: e.yaw, scale: e.scale, lib: e.lib, comps: Object.keys(e.comp ?? {}) }));
}

const verbs: Array<[string, any]> = [];
for (const id of TARGETS) {
    const e = before[id];
    verbs.push(["spawn", { id, lib: e.lib, pos: e.pos, yaw: e.yaw, scale: SCALE }]);
    for (const [type, comp] of Object.entries(e.comp ?? {})) {
        verbs.push(["comp", { id, type, data: comp?.data ?? comp }]);
    }
}

const ws = new WebSocket(cfg.url);
let next = 0;
let lastAck = Date.now();
let pending: [string, any] | null = null;
let resends = 0;
const timer = setTimeout(() => { console.log("TIMEOUT"); process.exit(1); }, 120000);
const sendNext = () => {
    if (next >= verbs.length) return;
    pending = verbs[next++];
    ws.send(JSON.stringify({ type: "verb", verb: pending[0], args: pending[1] }));
};
ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: cfg.world, id: "arthur-mason-rescale", avatar: cfg.avatar, token: cfg.joinToken }));
ws.onmessage = (ev: any) => {
    const m = JSON.parse(ev.data);
    if (m.type === "error") console.log("SERVER ERROR", JSON.stringify(m));
    if (m.type !== "snapshot" && m.type !== "log") return;
    lastAck = Date.now();
    resends = 0;
    if (next < verbs.length) sendNext();
    else pending = null;
};
const watchdog = setInterval(() => {
    if (!pending || Date.now() - lastAck < 6000) return;
    if (resends >= 3) { console.log("STALLED", pending[0]); process.exit(1); }
    resends++;
    ws.send(JSON.stringify({ type: "verb", verb: pending[0], args: pending[1] }));
}, 1500);

while (next < verbs.length || pending) await sleep(250);
await sleep(1500);
clearInterval(watchdog); clearTimeout(timer); try { ws.close(); } catch {}
const after = await geom();
let ok = true;
for (const id of TARGETS) {
    const a = after[id]; const b = before[id];
    const good = !!a && a.lib === b.lib && Math.abs((a.scale ?? 1) - SCALE) < 0.01
        && a.pos.every((v, i) => Math.abs(v - b.pos[i]) < 0.01)
        && Math.abs(a.yaw - b.yaw) < 0.005
        && Object.keys(a.comp ?? {}).length === Object.keys(b.comp ?? {}).length;
    console.log("verify", id, good ? "PASS" : "FAIL", JSON.stringify({ scale: a?.scale, pos: a?.pos, yaw: a?.yaw, comps: Object.keys(a?.comp ?? {}) }));
    if (!good) ok = false;
}
process.exit(ok ? 0 : 1);
