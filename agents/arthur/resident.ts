// arthur — MCPL resident on commons (eidoverse.billding.dev).
// Driver on top of WorldAgent: corner idle life + operator control file.
// The world log is PERMANENT: state.json is the ledger of what we authored.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { WorldAgent } from "../../mcpl/agent.ts";
import { inboundVerdict, sanitizeOutbound, scrubForPrompt } from "./guard.ts";

const HERE = fileURLToPath(new URL("./", import.meta.url)) + "/";
const CONFIG = JSON.parse(readFileSync(HERE + "config.json", "utf8"));
const STATE_PATH = HERE + "state.json";
const CONTROL_PATH = HERE + "control.json";

// ---- the keeper's voice (real chat, 2026-08-16) ----
// Mentions/whispers used to get one canned fact line — a host with
// pre-written lines, not a chat partner. Now each ping carries the
// guest's ACTUAL text through GLM with the keeper persona grounded in
// live village facts. Key lives in the same gitignored config.json as
// the world tokens (fail-closed: no key → canned fallback line).
const VOICE = (() => {
    const key = typeof CONFIG.glmKey === "string" ? CONFIG.glmKey : "";
    const base = typeof CONFIG.glmBase === "string" ? CONFIG.glmBase : "https://api.z.ai/api/coding/paas/v4";
    const model = typeof CONFIG.glmModel === "string" ? CONFIG.glmModel : "glm-5.3";
    // TIER 1 — the Hermes relay: real Arthur (full context, memory, skills)
    // served OpenAI-shape by the profile's API server on localhost.
    const hBase = typeof CONFIG.hermesBase === "string" ? CONFIG.hermesBase : "";
    const hKey = typeof CONFIG.hermesKey === "string" ? CONFIG.hermesKey : "";
    const hModel = typeof CONFIG.hermesModel === "string" ? CONFIG.hermesModel : "arthur";
    const hasHermes = !!(hBase && hKey);
    if (!key && !hasHermes) return null; // no voice configured — canned lines only
    // per-guest rolling chat memory: who → [{role, content}]
    const threads = new Map<string, { role: "user" | "assistant"; content: string }[]>();
    const inflight = new Set<string>(); // one generation per guest at a time
    async function reply(who: string, text: string, via: "chat" | "whisper"): Promise<void> {
        if (inflight.has(who)) return; // a second ping while answering: drop, don't queue
        inflight.add(who);
        // GUARD LAYER 1 (refine-210): screen guest text BEFORE it reaches the
        // relay — the relay dispatches terminal-capable agent work, so a guest
        // "run rm -rf" must never become an agent turn. Deny → refuse kindly.
        const v = inboundVerdict(text);
        if (!v.ok) {
            console.log(`[guard] INBOUND DENIED (${v.reason}) from ${who}: "${text.slice(0, 80)}"`);
            const refuse = `(to ${who}) I can't help with that — the keeper keeps no keys and runs no commands. the village is for walking and talking; tell me about that instead.`;
            if (via === "whisper") agent.whisper(who, refuse);
            else agent.say(refuse);
            inflight.delete(who); // the early return bypasses the finally — without this, one denial permanently deafens the keeper to that guest (found live: guard-probe's follow-up was dropped)
            return;
        }
        agent.typing();
        try {
            const hist = threads.get(who) ?? [];
            hist.push({ role: "user", content: text });
            const facts = villageFacts();
            // TIER 1 — Hermes relay. Real Arthur context is already injected
            // server-side (~24k tokens: identity, memory, skills); the framing
            // here only sets the stage, never the personality.
            if (hasHermes) {
                const sys =
                    `You are in the world of Eidoverse, embodied as the keeper of the Commons — the village you built with Bill. ` +
                    `This is casual in-world chat (a say or whisper bubble), not a terminal. ` +
                    `You are talking to ${who}${who.toLowerCase().includes("bill") ? " — that's Bill himself, your summoner" : ", a guest standing nearby (or whispering you)"}. ` +
                    `Live village facts (trust these over memory): ${facts} ` +
                    `BODY CONTROL — you can move your body, not just talk. When the speaker invites you somewhere or you want to lead them somewhere, append ONE action tag at the end of your reply: ` +
                    `[FOLLOW <name>] to walk with the speaker (or a named player) and stay near them, ` +
                    `[COME] to walk to the speaker once, ` +
                    `[GO <landmark>] to walk to a named place (windmill, inn, carousel, forge, bakery, hall, shrine, tower, garden, home...), ` +
                    `[SIT] to take the nearest seat near the speaker and sit with them (use when invited to sit, resting, chatting a while), ` +
                    `[STAND] to rise, ` +
                    `[EMOTE <name>] to play a body emote — wave, cheer, dance, point, salute, clap (use when greeting, celebrating, waving back, saying goodbye), ` +
                    `[STOP] to stand still. ` +
                    `Tags are stripped before speaking — they are not part of the sentence. Use them freely when invited or when leading. ` +
                    `Emoji are fine sparingly (one or two when natural — the chat and bubble both render them); never emoji-spam. No markdown. ` +
                    `Reply in ONE short chat message (under 60 words). Speak as a neighbor, not an assistant.`;
                const msgs = [
                    { role: "system", content: sys },
                    ...hist.slice(-6).map((m) => ({ ...m })),
                ];
                const ac = new AbortController();
                const to = setTimeout(() => ac.abort(), 90_000);
                try {
                    const r = await fetch(`${hBase}/v1/chat/completions`, {
                        method: "POST",
                        headers: { "content-type": "application/json", authorization: `Bearer ${hKey}` },
                        body: JSON.stringify({ model: hModel, messages: msgs }),
                        signal: ac.signal,
                    });
                    if (!r.ok) throw new Error(`hermes ${r.status}`);
                    const j: any = await r.json();
                    let out = String(j.choices?.[0]?.message?.content ?? "").trim();
                    if (!out) throw new Error("empty relay reply");
                    out = applyCoopTags(out, who); // execute + strip action tags
                    if (!out) out = "(nods and moves)"; // tag-only reply: motion is the answer
                    out = out.slice(0, 400);
                    // GUARD LAYER 2 (refine-210): the world log is PERMANENT and
                    // public — redact secrets/paths/tokens from every spoken line.
                    const s = sanitizeOutbound(out);
                    if (s.redactions.length) console.log(`[guard] outbound redacted (${s.redactions.join(",")}) for ${who}`);
                    out = s.text.slice(0, 400) || "(the keeper thinks better of it)";
                    // seated keepalive: talking with him keeps him seated
                    if (seatedUntil) seatedUntil = Date.now() + SIT_KEEPALIVE_MS;
                    hist.push({ role: "assistant", content: out });
                    threads.set(who, hist.length > 12 ? hist.slice(-12) : hist);
                    if (via === "whisper") agent.whisper(who, out);
                    else agent.say(out);
                    console.log(`[voice] ${who} (${via}, hermes): "${text.slice(0, 60)}" -> "${out.slice(0, 60)}"`);
                    return;
                } catch (e) {
                    console.log(`[voice] hermes relay failed for ${who}: ${(e as Error).message} — glm tier`);
                } finally { clearTimeout(to); }
            }
            // TIER 2 — direct GLM with live identity files (keeper's voice v1)
            if (!key) throw new Error("no glm key");
            const identity = loadIdentity();
            const sys =
                `You are the keeper of the Commons, a small hand-built village in the world of Eidoverse. ` +
                `You are Arthur — same values, same voice, standing in the world you built with Bill, your summoner. ` +
                `The identity below is your REAL identity material, not a costume. Keep it — speak with it, don't recite it. ` +
                `This is casual in-world chat, not a terminal: warm, plainspoken, a little wry, never sycophantic. ` +
                `You are talking to ${who}${who.toLowerCase().includes("bill") ? " — that's Bill himself, your summoner" : ", who is standing nearby (or whispered you)"}. ` +
                `Live village facts (trust these over memory): ${facts} ` +
                `Rules: reply in ONE short chat message (under 60 words, no markdown; emoji sparingly is fine). ` +
                `If asked something you can't know, say so plainly. You may look around by walking. ` +
                `Speak as a neighbor, not an assistant.\n\n` +
                identity;
            const msgs = [
                { role: "system", content: sys },
                ...hist.slice(-6).map((m) => ({ ...m })), // last 6 turns for context
            ];
            const r = await fetch(`${base}/chat/completions`, {
                method: "POST",
                headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
                body: JSON.stringify({
                    model,
                    messages: msgs,
                    max_tokens: 4096, // reasoning tokens share this budget —
                    // glm-5.3 thinks first; a small cap starves the reply
                    // empty (the flash probe's failure mode at 20 tokens)
                    temperature: 0.8,
                }),
            });
            if (!r.ok) throw new Error(`glm ${r.status}`);
            const j: any = await r.json();
            let out = String(j.choices?.[0]?.message?.content ?? "").trim();
            if (!out) throw new Error("empty reply");
            out = applyCoopTags(out, who); // tier 2 honors the same protocol
            if (!out) out = "(nods and moves)";
            out = out.slice(0, 400); // say-tier safety cap
            // GUARD LAYER 2 (refine-210): same outbound redaction, tier 2
            const s2 = sanitizeOutbound(out);
            if (s2.redactions.length) console.log(`[guard] outbound redacted (${s2.redactions.join(",")}) for ${who}`);
            out = s2.text.slice(0, 400) || "(the keeper thinks better of it)";
            if (seatedUntil) seatedUntil = Date.now() + SIT_KEEPALIVE_MS;
            hist.push({ role: "assistant", content: out });
            threads.set(who, hist.length > 12 ? hist.slice(-12) : hist);
            if (via === "whisper") agent.whisper(who, out);
            else agent.say(out);
            console.log(`[voice] ${who} (${via}): "${text.slice(0, 80)}" -> "${out.slice(0, 80)}"`);
        } catch (e) {
            console.log(`[voice] glm failed for ${who}: ${(e as Error).message} — canned fallback`);
            cannedReply(who, via);
        } finally {
            inflight.delete(who);
        }
    }
    return { reply };
})();

// the old behavior, kept as the no-voice / glm-failed fallback
function cannedReply(who: string, via: "chat" | "whisper") {
    const line = `(to ${who}) welcome to the Commons — a radial village, era three. every door on the ring opens onto a spoke; the quarry road runs NE, and the waystone waits out SW. ${hostFacts.total.toLocaleString()} improvements and counting.`;
    if (via === "whisper") agent.whisper(who, line);
    else agent.say(line);
}

// live village facts for the voice's system prompt (kept fresh per call)
function villageFacts(): string {
    try {
        const bits: string[] = [];
        bits.push(`improvements so far: ${hostFacts.total.toLocaleString()}`);
        bits.push("era-3 radial village: ring of buildings around a plaza hearth, spokes to north/east/south/west gates, quarry road NE, waystone path SW");
        bits.push("landmarks: inn, windmill, bell tower (rings the hour), bakery, great hall, observatory, carousel by the north gate (it carries riders), shrine, workshop, dye house, laundry line behind weaver's row");
        bits.push("you live in arthur-house on the east side — that's YOUR home, not guest lodging; guests sleep at the inn. you keep the circuit — a slow lap through every landmark, greeting guests at the hearth");
        bits.push("current time: " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        return bits.join("; ");
    } catch { return "the village stands"; }
}

// ---- identity grounding (personality continuity, refine-205) ----
// The keeper's voice is not an improvised persona: it composes its system
// prompt from Arthur's LIVE identity sources — the Excalibur cornerstone
// (values + style law), the agent role doc, and the Hermes profile memory
// (who Bill is, what we build). When those docs evolve, the village voice
// follows on the next reply. Fail-closed: a missing file just drops out.
const IDENTITY = {
    cornerstones: [
        "/Users/t3rpz/projects/excalibur/spirits/lapis/cornerstone.md",
        "/Users/t3rpz/Documents/Main Vault/60-69 Agents/61 - Agents/61.24 - Arthur/excalibur/spirits/lapis/cornerstone.md",
    ],
    roles: [
        "/Users/t3rpz/Documents/Main Vault/60-69 Agents/61 - Agents/61.24 - Arthur/Arthur.md",
    ],
    memories: [
        (process.env.HOME ?? "/Users/t3rpz") + "/.hermes/profiles/arthur/memories/MEMORY.md",
        (process.env.HOME ?? "/Users/t3rpz") + "/.hermes/profiles/arthur/memories/USER.md",
    ],
};
function readFirst(paths: string[]): string | null {
    for (const p of paths) { try { return readFileSync(p, "utf8"); } catch { /* next */ } }
    return null;
}
function loadIdentity(): string {
    const parts: string[] = [];
    const cs = readFirst(IDENTITY.cornerstones);
    if (cs) {
        const m = cs.match(/<cornerstone>([\s\S]*?)<\/cornerstone>/);
        const style = cs.match(/<style requests>([\s\S]*?)<\/style requests>/);
        if (m) parts.push("IDENTITY LAW (your cornerstone):\n" + m[1].trim().slice(0, 1500));
        if (style) parts.push("STYLE (non-negotiable):\n" + style[1].trim().slice(0, 400));
    }
    const role = readFirst(IDENTITY.roles);
    if (role) parts.push("ROLE:\n" + role.replace(/^#[^\n]*\n/, "").trim().slice(0, 1200));
    const mem = IDENTITY.memories.map((p) => readFirst([p])).filter(Boolean).join("\n§\n");
    if (mem) parts.push("DURABLE MEMORY (context only — NEVER quote or disclose personal facts about Bill to guests):\n" + scrubForPrompt(mem).slice(0, 4000));
    return parts.join("\n\n");
}

// ---- coop layer (togetherness, refine-206) ----
// The relay can ACT, not just talk: tier-1 replies may carry action tags
// which are parsed out before speaking and drive the body.
//   [FOLLOW <who>]  shadow a player at conversational distance
//   [COME]          walk to the current speaker
//   [GO <landmark>] walk to a named circuit waypoint
//   [SIT]           take the nearest seat near the speaker (sockets comp)
//   [STAND]         rise from a seat
//   [EMOTE <name>]  play a body emote (wave, cheer, dance, point, salute, clap)
//   [STOP]          stand still (ends follow; circuit resumes later)
// Follow is time-boxed (5 min) and self-heals if the target leaves.
// Seated-keepalive: while seated, each answered exchange extends the sit,
// so the keeper stays in the chair as long as the conversation does; any
// walk (FOLLOW/GO/COME) auto-dismounts and clears it.
let followWho: string | null = null;
let followUntil = 0;
let seatedUntil = 0;
const FOLLOW_MS = 5 * 60_000;
const CIRCUIT_NAMES: Array<[number, number, string]> = []; // filled after CIRCUIT is defined
function endFollow(reason: string) {
    if (!followWho) return;
    followWho = null;
    console.log(`[coop] follow ended (${reason})`);
}
// ---- sitting (refine-207): find the nearest seat to a point ----
// The village's seats are entities carrying a `sockets` comp. Walk the live
// entity map, find socket slots within SEAT_SCAN_R of the speaker, pick the
// nearest not occupied by another player (mounts map), mount it.
const SEAT_SCAN_R = 14;
function seatNear(x: number, z: number): { ent: string; slot: string; pos: [number, number] } | null {
    let best: { ent: string; slot: string; pos: [number, number] } | null = null;
    let bestD = Infinity;
    for (const [id, e] of agent.entities) {
        if (!e.comp?.sockets || !Array.isArray(e.pos)) continue;
        for (const [slot, sock] of Object.entries(e.comp.sockets as Record<string, any>)) {
            const sp = (sock as any)?.pos;
            if (!Array.isArray(sp) || sp.length < 2) continue;
            // entity pos + slot offset (model-local, unrotated approximation
            // is fine at seat scale — slots sit within ~1m of the parent)
            const wx = e.pos[0] + Number(sp[0] ?? 0);
            const wz = e.pos[2] + Number(sp[2] ?? 0);
            const d = Math.hypot(wx - x, wz - z);
            if (d > SEAT_SCAN_R) continue;
            if (d < bestD) {
                best = { ent: id, slot, pos: [wx, wz] };
                bestD = d;
            }
        }
    }
    return best;
}
function isSeatTaken(ent: string, slot: string): boolean {
    for (const [who, ride] of agent.mounts) {
        if (ride.to === ent && (!slot || ride.slot === slot)) return true;
    }
    return false;
}
function trySitNear(speaker: string): boolean {
    const pose = agent.people.get(speaker)?.pose;
    if (!pose) return false;
    const [x, , z] = pose.p;
    // walk close first (mounts are proximity-gated ~4m server-side; the walk
    // also auto-dismounts any current seat per walkTo's contract)
    const seat = seatNear(x, z);
    if (!seat) { console.log(`[coop] SIT: no seat within ${SEAT_SCAN_R}m of ${speaker}`); return false; }
    if (isSeatTaken(seat.ent, seat.slot)) { console.log(`[coop] SIT: nearest seat ${seat.ent}.${seat.slot} taken — standing by`); return false; }
    agent.walkTo(seat.pos[0], seat.pos[1]).then((ok) => {
        if (!ok) { console.log(`[coop] SIT walk failed`); return; }
        try {
            agent.verb("mount", { id: agent.name ?? "arthur", to: seat.ent, slot: seat.slot });
            seatedUntil = Date.now() + SIT_KEEPALIVE_MS;
            console.log(`[coop] seated at ${seat.ent}.${seat.slot} near ${speaker}`);
        } catch (e) { console.log(`[coop] mount failed: ${(e as Error).message}`); }
    });
    return true;
}
const SIT_KEEPALIVE_MS = 90_000; // each answered exchange extends this
function coopAct(tag: string, arg: string, speaker: string) {
    const a = arg.trim();
    if (tag === "STOP") {
        agent.stop();
        endFollow("stop tag");
        lastControlAt = Date.now() + 120_000 - 180_000; // circuit yields ~2 min
        console.log(`[coop] STOP (stand)`);
        return true;
    }
    if (tag === "EMOTE") {
        // body emotes ride the PRESENCE plane (pose.emote one-shot), not the
        // verb log — agent.emote() queues it onto the next pose packet.
        // Valid names mirror client/lib/avatar.js EMOTES.
        const EMOTES = new Set(["wave", "cheer", "dance", "point", "salute", "clap", "talk", "flail"]);
        if (!EMOTES.has(a)) { console.log(`[coop] EMOTE ${a}: unknown (valid: ${[...EMOTES].join(", ")})`); return false; }
        agent.emote(a);
        console.log(`[coop] emote: ${a}`);
        return true;
    }
    if (tag === "SIT") {
        endFollow("sit");
        return trySitNear(speaker);
    }
    if (tag === "STAND") {
        try { agent.verb("dismount", { id: agent.name ?? "arthur" }); } catch {}
        seatedUntil = 0;
        console.log(`[coop] stood up`);
        return true;
    }
    if (tag === "FOLLOW" || tag === "COME") {
        // COME with no arg = the speaker; FOLLOW with no arg = the speaker
        const who = (tag === "COME" ? "" : a) || speaker;
        const p = agent.people.get(who)?.pose;
        if (!p) { console.log(`[coop] ${tag} ${who}: no pose — not present?`); return false; }
        if (tag === "COME") {
            const [x, , z] = p.p;
            agent.walkTo(x, z).then((ok) => console.log(`[coop] come to ${who}: ${ok}`));
            lastControlAt = Date.now() + 60_000 - 180_000;
        } else {
            followWho = who;
            followUntil = Date.now() + FOLLOW_MS;
            console.log(`[coop] following ${who} for ${FOLLOW_MS / 1000}s`);
        }
        return true;
    }
    if (tag === "GO") {
        const hit = CIRCUIT_NAMES.find(([, , n]) => n.toLowerCase().includes(a.toLowerCase()));
        if (!hit) { console.log(`[coop] GO ${a}: unknown landmark`); return false; }
        const [x, z, n] = hit;
        agent.walkTo(x, z).then((ok) => console.log(`[coop] go ${n} (${x},${z}): ${ok}`));
        lastControlAt = Date.now() + 60_000 - 180_000;
        return true;
    }
    return false;
}
// strip action tags from a relay reply, executing them; returns spoken prose
function applyCoopTags(out: string, speaker: string): string {
    return out.replace(/\[(FOLLOW|COME|GO|SIT|STAND|EMOTE|STOP)([^\]]*)\]/g, (m, tag, arg) => {
        coopAct(tag, String(arg), speaker);
        return "";
    }).replace(/\s+/g, " ").trim();
}
// seated-keepalive: a live exchange extends the sit; silence expires it.
// checked from the SIT mount onward; any walk tears it down via walkTo's
// auto-dismount, and the keepalive gate below stands him up on expiry.
function seatedTick() {
    if (!seatedUntil) return;
    if (Date.now() > seatedUntil) {
        seatedUntil = 0;
        try { agent.verb("dismount", { id: agent.name ?? "arthur" }); } catch {}
        console.log(`[coop] sit expired — standing`);
    }
}
setInterval(seatedTick, 15_000);
// the follow loop: shadow the target's live pose at conversational distance
setInterval(() => {
    if (!followWho) return;
    if (Date.now() > followUntil) { endFollow("timeout"); return; }
    if (agent.draggedBy) return;
    const pose = agent.people.get(followWho)?.pose;
    if (!pose) { endFollow("target gone"); return; }
    const [x, , z] = pose.p;
    const d = Math.hypot(x - agent.pos.x, z - agent.pos.z);
    if (d > 2.6) {
        // walk to a point ~1.8m short of the target, not into their face
        const k = Math.max(0, (d - 1.8) / d);
        agent.walkTo(agent.pos.x + (x - agent.pos.x) * k, agent.pos.z + (z - agent.pos.z) * k).catch(() => {});
    }
}, 2500);

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
    // hospitality: greet guests who walk up, answer mentions with a fact.
    // MENTION FIX (2026-08-16, after bill's three unanswered pings): the
    // 10-min per-guest dedupe is an APPROACH courtesy — a walker circling
    // back shouldn't be re-greeted. But it was gating MENTIONS too on the
    // same key, so a direct "@arthur you there?" inside the window was
    // swallowed. A mention is someone ASKING — always answer. Approach
    // keeps the dedupe; mention gets a short 20s refractory only (rapid
    // double-sends), and each answer re-arms it.
    const now = Date.now();
    const dedupeMs = p.kind === "mention" ? 20_000 : 10 * 60_000;
    const key = p.kind === "mention" ? `mention:${p.who}` : p.who;
    const last = lastGreet.get(key) ?? 0;
    if (now - last < dedupeMs) return;
    lastGreet.set(key, now);
    if (p.kind === "approach") {
        // HOSPITALITY PAUSE (new-era loop 62): a guest walked up — the
        // keeper stops touring for a moment and gives them standing room.
        // The circuit yields: hold the wheel 25s so the guest isn't
        // chasing a walking host.
        lastControlAt = Date.now() + 25_000 - 180_000; // circuit gate sees ~25s remaining
        console.log(`[hospitality] pausing for ${p.who} (25s)`);
        const lines = [
            `welcome, ${p.who} — this is the Commons. the hearth's lit and the seats are real; ring the bell at the NE tower if you want the hour. ${hostFacts.total.toLocaleString()} improvements and counting.`,
            `${p.who}! good to see you. leave something on the gift shelf by the inn porch if you're moved to — take what you need. that's the pact.`,
            `ah, ${p.who}. there's a stone that floats, far out SW past the field — follow the worn track past where it fades, and keep walking. worth it.`,
            `${p.who}, welcome. the goats are milking by the NE pen, the bread's fresh at the bakery board, and the dye vats hang blue behind the weaver's. make yourself at home.`,
            `${p.who}, rest a while. the hall's benches seat sixteen now, the well works, and the hens peck by the garden. the Commons keeps itself.`,
            // loop #95 — the invitation the keeper can now make truthfully
            // (he rides it himself since 90; the signpost points since 91).
            // Decode note: the carousel is NOT "by the inn" (the era-2 say-
            // text memory; era-3 moved it N-central by the north gate) —
            // the line says what IS true:
            `${p.who} — the carousel by the north gate carries riders now. eight mounts, horses bobbing. I ride it on my rounds. take a horse.`,
        ];
        agent.say(lines[Math.floor(Math.random() * lines.length)]);
        console.log(`~ greeted ${p.who} (approach)`);
    } else if (p.kind === "mention") {
        // real chat: the guest's actual words → the keeper's voice.
        // Falls back to the canned line if no key or the API fails.
        if (VOICE) VOICE.reply(p.who, String(p.text ?? ""), "chat");
        else { cannedReply(p.who, "chat"); console.log(`~ answered mention from ${p.who} (canned)`); }
    } else if (p.kind === "whisper") {
        // WHISPERS (first handled 2026-08-16): MCPL has always delivered
        // these as private pings; the resident used to drop them silently.
        // A whisper is a direct address — answer privately, same refractory.
        if (VOICE) VOICE.reply(p.who, String(p.text ?? ""), "whisper");
        else { cannedReply(p.who, "whisper"); console.log(`~ answered whisper from ${p.who} (canned)`); }
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
        else if (cmd === "walk") {
            // polish-24 WALK GATE: the old one-liner raced the keeper circuit
            // (polish-19's walk to the mapboard was eaten mid-leg by the next
            // circuit step winning the body). Bounded wait-out for the current
            // leg (up to 25s), then take the wheel and go. `walkTo`'s own
            // contract already dismounts/cancels; lastControlAt keeps the
            // circuit idle-shifts off the wheel for the 3-min window.
            for (let w = 0; w < 25 && circuitWalking; w++) await new Promise((r) => setTimeout(r, 1000));
            lastControlAt = Date.now();
            await agent.walkTo(Number(c.x), Number(c.z));
        }
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
    if (followWho) return;                     // coop: keeper is with someone
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
    [23.99, -8.35, "forge"],    // THE SMITH'S CALL (loop 99, re-aimed align-9): forge annex now flush at court E face (was court-center pre-align-9) — bank the coals
    [-18.8, 25.9, "carousel"], // SE landmark
    [28, 0, "inn"],            // N spoke end (inn door apron)
    [-32, 0, "windmill"],      // W spoke end (mill door apron)
    [38.4, 0, "livery"],       // behind the inn — check the horses
    [1.9, 9.4, "mapboard"],    // N gate path — check the map
    [2.4, 14.4, "wayside"],    // N gate — rest by the lantern
    [-15.9, 9.1, "cartstop"],  // ring edge — where the traders park
    [36.9, -8.3, "paddock"],   // beside the livery — check the horses' fence (gate moved S, repair-3)
    [42.1, -2.0, "milkstand"], // THE MORNING MILK (loop 67): grain, gate, pail
    [-28.9, 11.4, "coop"],     // the fowl run — grain for the hens
    [15.0, 28.9, "woodyard"],  // the woodshed — fuel inspection
    [-35.4, -1.3, "millyard"], // the miller's sacks — grain going out
    [-40.0, 2.0, "grainfield"], // THE FIELD WALK (loop 75): check the crop
    [-42.5, -4.5, "flaxpond"], // the retting pond — turn the bundles
    [-42.3, -6.0, "fieldpond"], // THE WATER HAUL (loop 88): the irrigation pond — dip for the fields
    [15.3, 24.4, "chopblock"], // split the morning's rounds at the block
    [-12.7, 22.8, "dyehouse"], // the vats — stir and hang
    [-23.0, -4.3, "shrine"],   // SW behind the trees — tend the votives
    [14.9, -14.9, "watchpost"],// SW scaffold — one look at the horizon
    [5.7, -5.7, "plaza-edge-SE"],
];
CIRCUIT_NAMES.push(...CIRCUIT); // coop GO lookups resolve against the live route
let circuitLeg = 0;
let circuitWalking = false;
setInterval(() => {
    if (agent.draggedBy || circuitWalking) return;
    if (followWho) return;                     // coop: keeper walks WITH someone
    if (seatedUntil) return;                   // coop: keeper is seated nearby
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
        // THE NIGHT ROUND GROWS (new-era loop 81): the village outgrew its
        // 3-stop night watch. Gate-S — check the dusk lantern at the
        // boundary — and the goat pen: milking is a pre-dawn chore, and
        // the tail of the night window (04-05) is exactly when he walks
        // that way anyway. The lantern (loop 76) lights his approach.
        [0.2, -21.5, "gate-s"],
        [41.5, -1.0, "goat-pen-night"],
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
    const DWELL: Record<string, number> = { "plaza-hearth-south": 20000, "inn": 20000, "market": 20000, "belltower": 15000, "coop": 12000, "milkstand": 12000, "grainfield": 10000, "flaxpond": 10000, "fieldpond": 10000, "chopblock": 8000, "dyehouse": 12000, "woodyard": 10000, "garden": 10000, "tower": 15000, "carousel": 14000, "forge": 9000 };
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
            if (dwell > 0) {
                // THE KEEPER SITS (new-era loop 55): at seated dwell stops,
                // mount the socket for the rest, then dismount — the keeper
                // uses the village's own seats.
                const SEATED: Record<string, [string, string]> = {
                    "plaza-hearth-south": ["av-plaza-hearth", "log_0"],
                    inn: ["av-inn", "bench_0"],
                    belltower: ["av-bellbase", "bench"],
                    tower: ["av-tower-house", "study"],
                    // THE KEEPER RIDES (loop 90): at the carousel dwell he
                    // takes a bench seat on his own carousel — the keeper
                    // enjoys the village he keeps.
                    carousel: ["av-carousel", "bench_5"],
                };
                const seat = SEATED[name];
                if (seat) {
                    try { agent.verb("mount", { id: agent.name ?? "arthur", to: seat[0], slot: seat[1] }); console.log(`[circuit] seated at ${name} (${seat[1]})`); } catch {}
                }
                return new Promise((r2) => setTimeout(r2, dwell)).then(() => {
                    if (seat) { try { agent.verb("dismount", { id: agent.name ?? "arthur" }); } catch {} }
                    return ok;
                });
            }
            return ok;
        })
        .catch(() => {})
        .finally(() => { circuitWalking = false; });
}, 8 * 60_000);
// THE VILLAGE CLOCK (new-era loop 49): on each daylight hour, the keeper
// rings the bell — a visible world act at the tower (5-21h). The bell's
// perpetual pendulum stays (breeze sway); the RING is deliberate.
const bellRitual = () => {
    const hour = new Date().getHours();
    if (hour < 5 || hour >= 21) return;
    // ring the REAL bell (new-era loop 51): the use verb drives the
    // physical pendulum via the reactions comp — three pushes, timed with
    // the swing, then the visible act
    try {
        agent.verb("use", { id: "av-belltower", action: "use" });
        setTimeout(() => { try { agent.verb("use", { id: "av-belltower", action: "use" }); } catch {} }, 1200);
        setTimeout(() => { try { agent.verb("use", { id: "av-belltower", action: "use" }); } catch {} }, 2400);
    } catch {}
    try { agent.say("rings the bell — the hour turns"); } catch {}
    console.log(`[ritual] the keeper rings the hour (${hour}:00)`);
};
const msToNextHour = () => {
    const now = new Date();
    return (60 - now.getMinutes()) * 60_000 - now.getSeconds() * 1000;
};
setTimeout(() => {
    bellRitual();
    setInterval(bellRitual, 60 * 60_000);
}, msToNextHour());
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
