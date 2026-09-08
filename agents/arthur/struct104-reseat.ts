// struct104-reseat.ts — SURVEY-70 IDENTITY CURE (struct lane): re-seat
// nx-struct-slidingladder at yaw 0.6981 rad (40°) to cure the face-on
// foreshortening that erases all 45 rungs at 18m. SAME bytes (no upload —
// proven store/ed652efc09e44123 live), SAME position (3.5, 0.0056, 58),
// yaw-only change: remove then spawn over the join WS (spawn-does-not-move
// law). Comps {} (none to restore). Post-place tuple deep-verify +
// idempotent rerun = zero verbs.
// Chassis: next-place-gates.ts proven join protocol (join msg after
// connect; ONE snapshot per join; schedule ALL verbs by timer after first
// snapshot; close after last + margin).
import * as fs from "node:fs";

const cfg = JSON.parse(fs.readFileSync("agents/arthur/config.json", "utf8"));
const URL = cfg.url;
const ID = "nx-struct-slidingladder";
const LIB = "store/ed652efc09e44123.glb";
const POS = [3.5, 0.0056, 58];
const YAW = 0.6981317007977318; // 40° exactly (2π/9)
const SCALE = 1;

const ws = new WebSocket(URL);
const send = (m: any) => ws.send(JSON.stringify(m));
let verbsSent = 0;
ws.onmessage = (ev) => {
    const m = JSON.parse(String(ev.data));
    if (m.type === "snapshot") {
        // snapshot shape (probed): m.state.entities is a DICT keyed by entity id
        const ents = m.state?.entities ?? {};
        const live = ents[ID];
        console.log("snapshot: entity", live ? `present pos=${JSON.stringify(live.pos)} yaw=${live.yaw}` : "ABSENT");
        if (!live) { console.log("FATAL: entity absent — no verbs"); setTimeout(() => ws.close(), 1200); return; }
        if (live.lib !== LIB) { console.log("FATAL: lib drift", live.lib); setTimeout(() => ws.close(), 1200); return; }
        if (Math.abs(live.yaw - YAW) < 1e-4 && live.pos.every((v: number, i: number) => Math.abs(v - POS[i]) < 1e-4)) {
            console.log("PLACED_VERIFIED already exact — zero verbs");
            setTimeout(() => ws.close(), 1200);
            return;
        }
        // gate on !ok(live), NOT presence: wrong-pose entity still gets verbs
        const plan = [
            { type: "verb", verb: "remove", args: { id: ID } },
            { type: "verb", verb: "spawn", args: { id: ID, kind: "thing", pos: POS, yaw: YAW, scale: SCALE, lib: LIB } },
        ];
        plan.forEach((v, i) => setTimeout(() => { send(v); verbsSent++; }, 600 * (i + 1)));
        setTimeout(() => ws.close(), 600 * plan.length + 1500);
    }
    if (m.type === "log" || m.type === "entry") {
        console.log("echo:", JSON.stringify(m).slice(0, 220));
    }
    if (m.type === "error") {
        console.log("SERVER ERROR:", JSON.stringify(m).slice(0, 300));
    }
};
ws.onopen = () => send({ type: "join", world: "commons-next", id: "arthur-struct104", avatar: cfg.avatar, token: cfg.joinToken });
ws.onclose = () => { console.log(`done: verbsSent=${verbsSent}`); };
ws.onerror = () => { console.error("WS error"); process.exit(3); };
