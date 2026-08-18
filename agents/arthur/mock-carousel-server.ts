// mock-carousel-server.ts — local fake world for dry-running the carousel
// placer (polish-10). Implements just enough of the server contract:
//   GET  /geom?world=...   → world state JSON (updates as verbs arrive)
//   POST /upload           → { path: "store/<hash>.glb" } (echoes a 429 once
//                            when ?flaky=1 to exercise the retry path)
//   WS   (upgrade)         → join/snapshot/log protocol the placer speaks
// Verb log is dumped to the file in MOCK_VERBLOG (one JSON per line).
import { writeFileSync, appendFileSync } from "node:fs";

const PORT = Number(process.env.MOCK_PORT ?? 8791);
const VERBLOG = process.env.MOCK_VERBLOG ?? "/tmp/mock-carousel-verbs.jsonl";
writeFileSync(VERBLOG, "");

const state: any = {
    entities: [
        { id: "av-carousel", lib: "store/oldlivehash.glb", pos: [-18.8, 0, 25.9], yaw: 2.5137152734169854, comp: {
            "motion:carousel": { data: { type: "spin", axis: [0, 1, 0], pivot: [0, 0, 0], degPerSec: 5 } },
            "motion:horse_0": { data: { type: "bob", amp: 0.18, period: 2.4, phase: 0 } },
            "motion:horse_2": { data: { type: "bob", amp: 0.18, period: 2.4, phase: 1.57 } },
            "sockets": { data: { horse_0: { pos: [2, 1.97, 0], yaw: Math.PI, part: "horse_0" } } },
            "particles:smoke": { data: { rate: 3 } },
        } },
        { id: "av-car-l1", pos: [-18.8, 3.2, 25.9], color: 0xffb066, intensity: 2.8, range: 7 },
        { id: "av-car-l2", pos: [-18.8, 1.6, 25.9], color: 0xffd09a, intensity: 1.8, range: 5 },
        { id: "av-unrelated", lib: "store/other.glb", pos: [1, 0, 1], yaw: 0 },
    ],
};

let uploadAttempts = 0;
let droppedOnce = false; // polish-14 silent-drop simulation latch
const server = Bun.serve({
    port: PORT,
    websocket: {
        open(ws: any) { console.log("[mock] ws open"); },
        message(ws: any, ev: any) {
            const m = JSON.parse(typeof ev === "string" ? ev : ev.data.toString());
            appendFileSync(VERBLOG, JSON.stringify(m) + "\n");
            if (m.type === "join") { ws.send(JSON.stringify({ type: "snapshot", t: Date.now() })); return; }
            if (m.type === "verb") {
                const { verb, args } = m;
                // SILENT-DROP SIMULATION (polish-14): the real server drops
                // rate-capped messages with NO ack (server.ts:350-354). Drop
                // the FIRST comp verb for av-carousel exactly once — the
                // placer's stall watchdog must re-send and recover.
                if (verb === "comp" && args?.id === "av-carousel" && !droppedOnce) {
                    droppedOnce = true;
                    console.log("[mock] SILENT DROP of first comp verb (no ack) — watchdog must re-send");
                    return;
                }
                if (verb === "spawn" && args?.id === "av-carousel") {
                    const car = state.entities.find((e: any) => e.id === "av-carousel");
                    car.lib = args.lib; car.pos = args.pos; car.yaw = args.yaw; car.comp = {};
                }
                if (verb === "comp" && args?.id === "av-carousel") {
                    const car = state.entities.find((e: any) => e.id === "av-carousel");
                    car.comp[args.type] = { data: args.data };
                }
                ws.send(JSON.stringify({ type: "log", ok: true, verb }));
            }
        },
    },
    fetch(req: any) {
        const url = new URL(req.url);
        if (url.pathname === "/geom") return Response.json(state);
        if (url.pathname === "/upload") {
            uploadAttempts++;
            if (uploadAttempts === 1) {
                return new Response("rate limited", { status: 429 });  // first attempt always throttled → placer must retry
            }
            return Response.json({ path: "store/mockupload1234abcd.glb" });
        }
        if (req.headers.get("upgrade") === "websocket") return server.upgrade(req);
        return new Response("not found", { status: 404 });
    },
});
console.log(`[mock] carousel world on :${PORT} (verb log ${VERBLOG})`);
