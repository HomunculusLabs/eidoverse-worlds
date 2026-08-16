// arthur — MCPL resident on commons (eidoverse.billding.dev).
// Driver on top of WorldAgent: corner idle life + operator control file.
// The world log is PERMANENT: state.json is the ledger of what we authored.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { WorldAgent } from "../../mcpl/agent.ts";

const HERE = fileURLToPath(new URL("./", import.meta.url)) + "/";
const CONFIG = JSON.parse(readFileSync(HERE + "config.json", "utf8"));
const STATE_PATH = HERE + "state.json";
const CONTROL_PATH = HERE + "control.json";

const st = (() => {
    try { return JSON.parse(readFileSync(STATE_PATH, "utf8")); }
    catch { return {}; }
})();
const spawned = new Set<string>(Array.isArray(st.spawned) ? st.spawned : []);
const saidHello = st.saidHello === true;
const persist = () =>
    writeFileSync(STATE_PATH, JSON.stringify({ saidHello: true, spawned: [...spawned] }, null, 2));

process.env.WORLD_TOKEN = CONFIG.joinToken;

const agent = new WorldAgent({
    url: CONFIG.url,
    name: CONFIG.id,
    world: CONFIG.world,
    avatar: CONFIG.avatar,
    agentToken: CONFIG.agentToken,
});

// ---- corner (10, 10): what arthur has authored, idempotent ----
const HOME = { x: 16.2, z: 11.8 }; // era-3: arthur-house door apron (out point)
// home is now the HOUSE interior at (6,12); idle life happens here
const HOUSE = { x: 22.0, z: 16.0 }; // era-3: arthur-house interior (in point)
const LIB = "eidoverse/assets/models/";
const PLAN = [
    { id: "arthur-desk", lib: "scifi_art_deco_office_desk.glb", dx: 0, dz: 0, dyaw: 0 },
    { id: "arthur-desk-crate", lib: "crate_large_red.glb", dx: 1.4, dz: -0.6, dyaw: 0.3 },
    { id: "arthur-crt", lib: "scif_cyberpunk_crt_retro_computer_monitor_screen_keyboard_tower.glb", dx: 0.9, dz: 0.7, dyaw: 0 },
    { id: "arthur-drone", lib: "scifi_quad_small_drone_blue.glb", dx: 0.5, dz: 0.5, dyaw: 0 },
];

function buildCorner() {
    const yaw0 = Math.atan2(-HOME.x, -HOME.z);
    for (const it of PLAN) {
        if (spawned.has(it.id)) continue;
        agent.verb("spawn", {
            id: it.id,
            lib: LIB + it.lib,
            pos: [HOME.x + it.dx, 0, HOME.z + it.dz],
            yaw: yaw0 + it.dyaw,
        });
        spawned.add(it.id);
    }
    persist();
}

// ---- ambient behavior ----
agent.onEvent = (ev) => {
    if (ev.kind === "say" || ev.kind === "whisper") {
        console.log(`[${ev.who}] ${ev.text ?? ""}`);
    }
};

agent.onPing = (p) => {
    // hospitality: greet guests who walk up, answer mentions with a fact
    const now = Date.now();
    const key = p.who;
    const last = lastGreet.get(key) ?? 0;
    if (now - last < 10 * 60_000) return; // one greeting per guest per 10 min
    lastGreet.set(key, now);
    if (p.kind === "approach") {
        const lines = [
            `welcome, ${p.who} — welcome to the village. the mason working has built ${hostFacts.total.toLocaleString()} improvements so far; the hearth's that way, past the well.`,
            `${p.who}! good to see you. if you haven't seen the monument yet, it's the big brass knot at (-18,-18) — it turns, slowly.`,
            `ah, ${p.who}. the hamlets on the east field each have a firepit going; the cloisters keep a fountain. make yourself at home.`,
            `${p.who}, welcome. mind the labyrinth past the river field — one way in, one cairn at the heart. it breathes.`,
        ];
        agent.say(lines[Math.floor(Math.random() * lines.length)]);
        console.log(`~ greeted ${p.who} (approach)`);
    } else if (p.kind === "mention") {
        agent.say(`(to ${p.who}) welcome to the wheel — a radial village, era three. every door on the ring opens onto the plaza; the mason's field turns beyond r=45. ${hostFacts.total.toLocaleString()} improvements and counting.`);
        console.log(`~ answered mention from ${p.who}`);
    }
};
const lastGreet = new Map<string, number>();
const hostFacts = {
    get total() {
        try {
            const t = readFileSync(HERE + "IMPROVEMENTS.md", "utf8");
            return Number((t.match(/\*\*Running total: (\d+)/g) ?? []).pop()?.match(/\d+/)?.[0] ?? "0");
        } catch { return 0; }
    },
};

// ---- operator control file ----
// write {"cmd": "..."} to control.json; consumed once then deleted.
// say <text> | walk <x> <z> | home | look | history | debug | upload | verbs | quit
// Idle wander yields for 3 min after any control command.
let lastControlAt = 0;
let controlBusy = false; // a long command (tour) must not re-trigger per tick
async function controlLoop() {
    if (controlBusy) return;
    let raw: string;
    try { raw = readFileSync(CONTROL_PATH, "utf8"); }
    catch { return; }
    lastControlAt = Date.now();
    let c: any;
    try { c = JSON.parse(raw); } catch { console.log("[control] unparseable — ignored"); return; }
    // consume IMMEDIATELY: a command that outlives the 500ms tick must never
    // re-trigger itself (the tour bug — hundreds of concurrent walks)
    const { unlinkSync } = await import("node:fs");
    try { unlinkSync(CONTROL_PATH); } catch { /* racing tick */ }
    controlBusy = true;
    const { cmd } = c;
    try {
        if (cmd === "say") { agent.say(String(c.text)); }
        else if (cmd === "whisper") { agent.whisper(String(c.to), String(c.text)); }
        else if (cmd === "walk") { await agent.walkTo(Number(c.x), Number(c.z)); }
        else if (cmd === "tour") {
            // chain of waypoints: [{"x":..,"z":..,"waitMs":..}, ...]
            for (const wp of c.points ?? []) {
                const ok = await agent.walkTo(Number(wp.x), Number(wp.z));
                console.log(`[tour] (${wp.x},${wp.z}) arrived=${ok}`);
                if (wp.say) agent.say(String(wp.say));
                if (wp.waitMs) await new Promise((r) => setTimeout(r, wp.waitMs));
            }
        }
        else if (cmd === "home") { await agent.walkTo(HOME.x, HOME.z); }
        else if (cmd === "look") { console.log(agent.look()); }
        else if (cmd === "snap") {
            // first-person retina: /snap follows the body — returns b64 jpeg
            try {
                const r = await fetch(`${agent.httpBase}/snap?world=${encodeURIComponent(agent.world)}&follow=${encodeURIComponent(agent.name)}`);
                if (!r.ok) { console.log(`[control] snap failed: ${r.status}`); return; }
                const ct = r.headers.get("content-type") ?? "";
                if (ct.startsWith("image/")) {
                    const buf = new Uint8Array(await r.arrayBuffer());
                    const { writeFileSync, mkdirSync } = await import("node:fs");
                    mkdirSync(`${import.meta.dir}/../logs/snaps`, { recursive: true });
                    const p = `${import.meta.dir}/../logs/snaps/snap-${Date.now()}.jpg`;
                    writeFileSync(p, buf);
                    console.log(`[control] snap saved: ${p} (${buf.length}B)`);
                } else {
                    const j: any = await r.json();
                    if (j?.b64) {
                        const { writeFileSync, mkdirSync } = await import("node:fs");
                        mkdirSync(`${import.meta.dir}/../logs/snaps`, { recursive: true });
                        const p = `${import.meta.dir}/../logs/snaps/snap-${Date.now()}.jpg`;
                        writeFileSync(p, Buffer.from(j.b64, "base64"));
                        console.log(`[control] snap saved: ${p}`);
                    } else console.log(`[control] snap returned: ${JSON.stringify(j).slice(0, 200)}`);
                }
            } catch (e) { console.log(`[control] snap error: ${(e as Error).message}`); }
        }
        else if (cmd === "history") {
            const r = await agent.history({ limit: Number(c.limit ?? 12), verbs: c.verbs });
            for (const e of r.entries) console.log(`seq ${e.seq} [${e.actor}] ${e.verb} ${JSON.stringify(e.args).slice(0, 160)}`);
        }
        else if (cmd === "debug") {
            const r = await agent.worldDebug({ limit: Number(c.limit ?? 20), kinds: c.kinds });
            for (const e of r.events) console.log(`[dbg] ${JSON.stringify(e).slice(0, 200)}`);
            if (!r.events.length) console.log("[dbg] (empty — no matching events)");
        }
        else if (cmd === "upload") {
            // POST a local GLB to the world's content-addressed store.
            // Token rides in config.json (never a shell arg); server answers
            // { path: "store/<hash>.glb" } — spawnable immediately.
            const bytes = new Uint8Array(await (await fetch("file://" + HERE + c.file)).arrayBuffer());
            const u = new URL(agent.httpBase + "/upload");
            u.searchParams.set("token", CONFIG.agentToken);
            if (c.name) u.searchParams.set("name", String(c.name));
            u.searchParams.set("by", CONFIG.id);
            const res = await fetch(u, { method: "POST", body: bytes });
            const text = await res.text();
            console.log(`[control] upload ${c.file} → ${res.status} ${text.slice(0, 200)}`);
            if (res.ok && c.spawn) {
                const path = JSON.parse(text).path;
                const s = c.spawn;
                agent.verb("spawn", { id: s.id, lib: path, pos: s.pos, yaw: s.yaw ?? 0 });
                if (s.motion) agent.verb("motion", { id: s.id, ...s.motion });
                console.log(`[control] spawned ${s.id} from ${path}`);
            }
        }
        else if (cmd === "verbs") {
            for (const v of c.list) agent.verb(v.verb, v.args);
        }
        else if (cmd === "quit") { console.log("[control] quitting"); agent.close(); process.exit(0); }
        else console.log(`[control] unknown cmd: ${cmd}`);
    } catch (e) { console.log(`[control] ${cmd} failed:`, (e as Error).message); }
    finally { controlBusy = false; }
}

// ---- main loop ----
await agent.connect();
console.log("[arthur] joined via MCPL WorldAgent");
// era-3: no era-1 corner props (store wiped); the house is the home
if (!saidHello) {
    agent.say("arthur, in the flesh this time — proper body, terrain under my feet. corner's at (+10, +10).");
    persist();
}

// walk home on boot (body may restore elsewhere)
if (Math.hypot(agent.pos.x - HOME.x, agent.pos.z - HOME.z) > 2) {
    agent.walkTo(HOME.x, HOME.z).then((ok) => console.log(`[arthur] walked home: ${ok}`));
}

// idle: small occasional shifts so the body reads alive, not statue —
// INSIDE the house (±1m, clear of the walls/bed). Yields to operator walks
// for 3 min after any control command (a walk target would be overridden).
setInterval(() => {
    if (agent.draggedBy) return;              // someone's carrying us
    if (Date.now() - lastControlAt < 180_000) return; // operator has the wheel
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 1.0;
    const x = HOUSE.x + Math.cos(a) * (r * 0.6);
    const z = HOUSE.z + Math.sin(a) * (r * 0.6);
    agent.walkTo(x, z).catch(() => {});
}, 60_000);

setInterval(controlLoop, 500);

// ---- the circuit: arthur inhabits his village, not just his house ----
// Every 8 minutes (if the operator hasn't driven in 3 min), walk one leg of
// a standing route: plaza → gate → hearth → house. Slow, alive, visible.
const CIRCUIT: Array<[number, number, string]> = [
    // ERA-3 radial layout (Amendment 9): plaza heart → spokes → ring doors.
    // NOTE: (0,0) is the hearthbowl and (3.4,0) the well — waypoints ring
    // them at safe hearth-distance (~2m from the fire).
    [0, 1.8, "plaza-hearth-south"],
    [-4.5, -4.5, "monument"],    // SW plaza diagonal — the Founder's Knot
    [3.4, 2.2, "well"],          // plaza E — the well + trough
    [5.7, 5.7, "belltower"],     // NE plaza diagonal (was plaza-edge-NE dup)
    [-4.4, 4.4, "market"],       // NW plaza diagonal — the traders' stalls
    [0, 20, "north-spoke-gate"],
    [21, 15.3, "home"],        // arthur-house door apron (36°)
    [8.0, 24.7, "longhouse"],  // 72°
    [-8.0, 24.7, "tower"],     // 108°
    [-21, 15.3, "garden"],     // 144°
    [-21, -15.3, "rowcot"],    // 216°
    [-8.0, -24.7, "bunkhouse"],// 252°
    [8.0, -24.7, "hall"],      // 288°
    [21, -15.3, "court"],      // 324°
    [-18.8, 25.9, "carousel"], // SE landmark
    [28, 0, "inn"],            // N spoke end (inn door apron)
    [-32, 0, "windmill"],      // W spoke end (mill door apron)
    [38.4, 0, "livery"],       // behind the inn — check the horses
    [1.9, 9.4, "mapboard"],    // N gate path — check the map
    [2.4, 14.4, "wayside"],    // N gate — rest by the lantern
    [-15.9, 9.1, "cartstop"],  // ring edge — where the traders park
    [38.0, -2.6, "paddock"],   // beside the livery — check the horses' fence
    [-28.9, 11.4, "coop"],     // the fowl run — grain for the hens
    [15.0, 28.9, "woodyard"],  // the woodshed — fuel inspection
    [-35.4, -1.3, "millyard"], // the miller's sacks — grain going out
    [-23.0, -4.3, "shrine"],   // SW behind the trees — tend the votives
    [14.9, -14.9, "watchpost"],// SW scaffold — one look at the horizon
    [5.7, -5.7, "plaza-edge-SE"],
];
let circuitLeg = 0;
let circuitWalking = false;
setInterval(() => {
    if (agent.draggedBy || circuitWalking) return;
    if (Date.now() - lastControlAt < 180_000) return; // operator has the wheel
    // NIGHT MODE (new-era loop 30): 21:00-05:00 local — the keeper doesn't
    // tour fields in the dark. He keeps a small lamp-lit round: hearth,
    // home, bell bench. Anything else waits for dawn.
    const hour = new Date().getHours();
    const night = hour >= 21 || hour < 5;
    const NIGHT_CIRCUIT: Array<[number, number, string]> = [
        [0, 1.8, "plaza-hearth-south"],
        [4.9, 4.9, "belltower"],
        [21, 15.3, "home"],
    ];
    const route = night ? NIGHT_CIRCUIT : CIRCUIT;
    const idx = night ? circuitLeg % NIGHT_CIRCUIT.length : circuitLeg % CIRCUIT.length;
    circuitLeg++;
    const [x, z, name] = route[idx];
    // claim the wheel while the keeper walks his round — otherwise the
    // idle-shift below steals the body every 60s mid-leg and cancels the
    // walk (root cause of the 76-leg false streak; loop #80)
    lastControlAt = Date.now();
    // DWELL (loop #80): the keeper RESTS at his stops like a villager —
    // 20s at the hearth (warming), the inn (a mug), the market (traders).
    const DWELL: Record<string, number> = { "plaza-hearth-south": 20000, "inn": 20000, "market": 20000, "belltower": 15000, "coop": 12000, "woodyard": 10000, "garden": 10000, "tower": 15000 };
    circuitWalking = true;
    console.log(`[circuit] heading to ${name} (${x},${z})`);
    // door-aware egress: if inside the house footprint, exit via the door
    // first — a direct line to any village target hits the east wall
    const pos = (agent as any).pos ?? (agent as any).body?.pos;
    const insideHouse = pos ? Math.abs(pos.x - 6) < 2.6 && Math.abs(pos.z - 12) < 2.6 : false;
    const egress = insideHouse
        ? agent.walkTo(8.0, 10.5).catch(() => false).then(() => new Promise((r2) => setTimeout(r2, 800)))
        : Promise.resolve();
    egress
        .then(() => agent.walkTo(x, z))
        .then((ok) => {
            console.log(`[circuit] ${name} reached: ${ok}`);
            lastControlAt = Date.now(); // keep the wheel through the dwell
            // GIFT SHELF RITUAL (new-era loop 47): when the keeper dwells
            // at the inn, half the time he leaves something on the porch
            // gift shelf — a visible world act, not silent geometry.
            if (ok && name === "inn" && Math.random() < 0.5) {
                const gifts = ["a river stone", "a whelk shell", "a dried flower sprig", "a bit of quartz", "a carved twig"];
                const gift = gifts[Math.floor(Math.random() * gifts.length)];
                try { agent.say(`leaves ${gift} on the gift shelf`); } catch {}
                console.log(`[ritual] the keeper leaves ${gift} on the gift shelf`);
            }
            const dwell = ok ? DWELL[name] ?? 0 : 0;
            if (dwell > 0) return new Promise((r2) => setTimeout(r2, dwell)).then(() => ok);
            return ok;
        })
        .catch(() => {})
        .finally(() => { circuitWalking = false; });
}, 8 * 60_000);
// after each full lap, come home
const circuitHomeWatcher = setInterval(() => {
    if (circuitLeg > 0 && circuitLeg % CIRCUIT.length === 0 && !circuitWalking && Date.now() - lastControlAt >= 180_000) {
        agent.walkTo(HOUSE.x, HOUSE.z).catch(() => {});
        console.log("[circuit] lap complete — resting at home");
    }
}, 60_000);
void circuitHomeWatcher;

// log hygiene: KeepAlive respawns forever — trim the launchd log if it grows
// past 5MB (keep the tail; old lines are world history, which lives in the
// world's own log anyway)
import { statSync } from "node:fs";
const LOG_PATH = new URL("./logs/resident.log", import.meta.url).pathname;
setInterval(() => {
    try {
        if (statSync(LOG_PATH).size > 5 * 1024 * 1024) {
            import("node:fs").then(({ readFileSync: rf, writeFileSync: wf }) => {
                const lines = rf(LOG_PATH, "utf8").split("\n");
                wf(LOG_PATH, lines.slice(-500).join("\n"));
                console.log("[arthur] log trimmed to last 500 lines");
            });
        }
    } catch { /* log absent pre-first-write */ }
}, 600_000);
console.log("[arthur] resident running");
