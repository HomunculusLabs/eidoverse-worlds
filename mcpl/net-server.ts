// eidoverse-worlds network MCPL — the conforming shape.
//
// Mirrors tavern-mcpl's pattern (the reference multi-agent MCPL server):
// one WS server, ?token= auth → identity, per-connection Session speaking the
// MCPL wire protocol via @animalabs/mcpl-core. The world's chat is an MCPL
// CHANNEL: world says fan out as channels/incoming (mentions tagged), and
// channels/publish into the world channel IS saying it aloud in-world.
// Any conforming host (connectome agent-framework) gets pushes → agent wakes
// with ZERO host modification. Tools ride the same connection.
//
// Each session owns a WorldAgent — the agent's body lives exactly as long as
// its connection (sleep = leave, wake = arrive; ambient presence later).
//
// Usage:  bun run mcpl/net-server.ts            (port 8941)
// Tokens: mcpl/tokens.json  { "<token>": { "id": "mythos", "name": "Mythos",
//         "world": "commons", "avatar": "eidoverse/assets/vrms/claude.vrm" } }

import { createServer } from "node:http";
import { readFileSync, existsSync, writeFileSync, renameSync } from "node:fs";
import { WebSocketServer, type WebSocket } from "ws";
import {
  McplConnection,
  method,
  type McplInitializeParams,
  type McplInitializeResult,
  type McplCapabilities,
  type InitializeCapabilities,
  type ChannelDescriptor,
  type ChannelsRegisterParams,
  type ChannelsIncomingParams,
  type ChannelsPublishParams,
  type ChannelsPublishResult,
} from "@animalabs/mcpl-core";
import { WorldAgent } from "./agent.ts";
import { verifyToken } from "../server/aid1.ts";

const PORT = Number(process.env.MCPL_PORT ?? 8941);
// archipelago-home door (home-node.md §7): a `?token=aid1.…` credential is an
// identity token minted by the home node — verified OFFLINE right here, no
// tokens.json entry needed. That is how non-connectome guest agents arrive:
// `hn mint --name ferro --aud eidoverse --scopes worlds:join` and the operator
// hands them the string. tokens.json remains the legacy/fleet door.
const HN_ISSUER_KEY = process.env.HN_ISSUER_KEY ?? "";
const HN_ISS = process.env.HN_ISS ?? "id.animalabs.ai";
const ts = () => new Date().toISOString().slice(11, 19);
const TOKENS_PATH = new URL("./tokens.json", import.meta.url).pathname;

type Auth = { id: string; name: string; world?: string; avatar?: string };
// Tokens are read PER CONNECTION ATTEMPT — minting/revoking is a file edit,
// never a restart (the no-restart rule applies to the door, not just the world).
function readTokens(): Record<string, Auth> {
  try {
    if (existsSync(TOKENS_PATH)) return JSON.parse(readFileSync(TOKENS_PATH, "utf8"));
  } catch (e) { console.error("[mcpl] tokens.json unreadable:", (e as Error).message); }
  return { "dev-token": { id: "claude", name: "Claude", world: "commons" } };
}

// per-agent lastSeen (for missed-mention replay on reconnect), tmp+rename
const STATE_PATH = new URL("./state.json", import.meta.url).pathname;
/** Per-agent world-log position. See the catch-up note in serve(). */
const lastSeenSeq: Record<string, number> = {};
const lastSeen: Record<string, number> = existsSync(STATE_PATH)
  ? JSON.parse(readFileSync(STATE_PATH, "utf8"))
  : {};
function persistState() {
  writeFileSync(STATE_PATH + ".tmp", JSON.stringify({ ...lastSeen, __seq: lastSeenSeq }));
  renameSync(STATE_PATH + ".tmp", STATE_PATH);
}

// ---- tools (shared schema with the stdio server, minus retina by default) --

const TOOLS = [
  { name: "look", description: "Text-tier perception: where you are, who's present and what they're doing, every placed thing with distance/bearing, and chat since you last looked.", inputSchema: { type: "object", properties: {} } },
  { name: "snapshot", description: "First-person view: a rendered image from your avatar's eyes (spectator browser on a GPU host). Slower than look — use when spatial/visual detail matters.", inputSchema: { type: "object", properties: {} } },
  { name: "walk_to", description: "Walk (or run) to world coordinates. Returns when you arrive; others see you walking.", inputSchema: { type: "object", properties: { x: { type: "number" }, z: { type: "number" }, run: { type: "boolean" } }, required: ["x", "z"] } },
  { name: "face", description: "Turn to face a point (x,z) or a participant/entity id (target).", inputSchema: { type: "object", properties: { x: { type: "number" }, z: { type: "number" }, target: { type: "string" } } } },
  { name: "stop", description: "Stop walking.", inputSchema: { type: "object", properties: {} } },
  { name: "say", description: "Say something in world chat (bubble over your head, persisted). Equivalent to publishing on the world channel.", inputSchema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } },
  { name: "catch_up", description: "What happened in the world while you were not thinking. Returns chat since a point in the world's history; omit `since` to continue from where you last caught up. Use when a conversation refers to something you have no memory of.", inputSchema: { type: "object", properties: { since: { type: "number" }, limit: { type: "number" } } } },
  { name: "whisper", description: "Say something privately to ONE participant. Not spoken aloud, no bubble, and deliberately never written to the world log — so it is also not replayed to anyone later.", inputSchema: { type: "object", properties: { to: { type: "string" }, text: { type: "string" } }, required: ["to", "text"] } },
  { name: "pose", description: "Hold a custom body pose — a one-off, for when you are doing something specific. `bones` is a sparse map of VRM humanoid bone name to a [x,y,z,w] quaternion (only the bones you care about; the rest keep animating). Example bones: leftUpperArm, leftLowerArm, rightUpperArm, rightLowerArm, spine, chest, neck, head. Held until you `clear_pose` or move. Presence only — never written to the world log, so it costs nothing and vanishes when you leave. Pass `target` to pose SOMEONE ELSE (they decide whether to allow it).", inputSchema: { type: "object", properties: { bones: { type: "object" }, target: { type: "string" } }, required: ["bones"] } },
  { name: "clear_pose", description: "Release a held pose, easing back to normal animation. Pass `target` to release a pose you asked someone else to hold.", inputSchema: { type: "object", properties: { target: { type: "string" } } } },
  { name: "ragdoll", description: "Ask another body to go limp and collapse — a physics ragdoll. `target` is who falls; THEY simulate it on their own body (you never simulate someone else), and it settles into a held pose everyone sees. Being knocked over is opt-in for humans and default for agent performers.", inputSchema: { type: "object", properties: { target: { type: "string" } }, required: ["target"] } },
  { name: "animate", description: "Play a one-off animation — for a specific gesture you are inventing on the spot. `tracks` maps a VRM humanoid bone name to a list of keyframes [{ t: seconds, q: [x,y,z,w] }]; `dur` is the length in seconds. Only list the bones that move. It plays once (or set loop:true), over your locomotion, and is relayed to everyone but never logged. Keep it small and sparse — a few bones, a few keyframes. Pass `target` to play it on someone else (they decide).", inputSchema: { type: "object", properties: { dur: { type: "number" }, loop: { type: "boolean" }, tracks: { type: "object" }, target: { type: "string" } }, required: ["dur", "tracks"] } },
  { name: "list_library", description: "Search the model library by keywords. Returns library paths for spawn.", inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
  { name: "spawn", description: "Spawn a library model. lib (exact) or query (best match); position defaults to 2m in front of you.", inputSchema: { type: "object", properties: { lib: { type: "string" }, query: { type: "string" }, x: { type: "number" }, z: { type: "number" }, y: { type: "number" }, yaw: { type: "number" }, id: { type: "string" } } } },
  { name: "place", description: "Move an entity (id from look) to x,z (y defaults to terrain; pass y to seat on furniture).", inputSchema: { type: "object", properties: { id: { type: "string" }, x: { type: "number" }, z: { type: "number" }, y: { type: "number" }, yaw: { type: "number" } }, required: ["id", "x", "z"] } },
  { name: "light", description: "Place a light source in the world. Persists like any placed thing. color is a hex integer (e.g. 0xffd9a0 warm, 0x88bbff cool, 0xff5533 red), intensity and range are optional. Position defaults to just in front of you. A small glowing sphere marks it; move or remove it by id like any entity.", inputSchema: { type: "object", properties: { color: { type: "number" }, intensity: { type: "number" }, range: { type: "number" }, x: { type: "number" }, y: { type: "number" }, z: { type: "number" }, id: { type: "string" } } } },
  { name: "remove", description: "Remove a placed entity.", inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } },
  { name: "world_verb", description: "Escape hatch: raw world-log verb (terrain, grass, sky, …). Trusted v1.", inputSchema: { type: "object", properties: { verb: { type: "string" }, args: { type: "object" } }, required: ["verb", "args"] } },
];

import { readdirSync } from "node:fs";
const MODELS_DIR = process.env.EIDOVERSE_DIR
  ? `${process.env.EIDOVERSE_DIR}/eidoverse/assets/models`
  : "/Users/antra/connectome-local/eidoverse-video/eidoverse/assets/models";
function searchLibrary(query: string): string[] {
  const toks = query.toLowerCase().split(/\s+/).filter(Boolean);
  return readdirSync(MODELS_DIR)
    .filter((f) => f.endsWith(".glb"))
    .map((f) => ({ f, score: toks.filter((t) => f.toLowerCase().includes(t)).length }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((r) => `eidoverse/assets/models/${r.f}`);
}

// ---- session ---------------------------------------------------------------

class Session {
  private conn: McplConnection;
  private agent: WorldAgent;
  private channelId: string;
  private channelOpen = true;
  private caughtUpTo: number | null = null; // the world channel is home — open unless the agent closes it

  constructor(private auth: Auth, ws: WebSocket, agentToken = "") {
    this.conn = McplConnection.fromWebSocket(ws as never);
    this.agent = new WorldAgent({
      name: auth.id,
      world: auth.world ?? "commons",
      avatar: auth.avatar,
      url: process.env.WORLD_URL ?? "ws://127.0.0.1:8940/ws",
      // the same bearer that opened THIS door — the sequencer verifies the
      // name against it (agent names are reserved there)
      agentToken,
    });
    this.channelId = `world:${this.agent.world}`;
  }

  close() {
    this.agent.close(); // deliberate death — stops the body's auto-reconnect
    this.conn.close();
  }

  private deliver(text: string, author: { id: string; name: string }, opts?: { tags?: string[]; mentioned?: boolean }) {
    // Platform-adapter convention (same as discord-mcpl): author is rendered
    // INTO the text — the host carries author metadata but does not label
    // the context message with it.
    const rendered = author.id === "world" ? text : `${author.name}: ${text}`;
    const params: ChannelsIncomingParams = {
      messages: [{
        channelId: this.channelId,
        messageId: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        author,
        timestamp: new Date().toISOString(),
        content: [{ type: "text", text: rendered }],
        ...(opts?.tags ? { tags: opts.tags } : {}),
        // Mention metadata — BOTH ecosystem dialects, because different host
        // layers read different keys: ConversationRouter reads `mentioned`;
        // recipe wake-policies (per discord-mcpl's adapter convention) match
        // `isExplicitMention`. Ask us how we know.
        ...(opts?.mentioned ? { metadata: { mentioned: true, isExplicitMention: true } } : {}),
      }],
    };
    this.conn.sendRequest(method.CHANNELS_INCOMING, params).catch((e) => {
      console.error(`[${ts()}] [deliver:${this.auth.id}] channels/incoming failed: ${(e as Error).message?.slice(0, 120)}`);
    });
  }

  async serve() {
    await this.handshake();
    await this.agent.connect();

    // world events → channel traffic (this is the push path — no host code)
    this.agent.onEvent = (ev) => {
      if (ev.kind === "say") {
        if (!this.channelOpen && !ev.mention) return; // door closed: chatter stops, knocks get through
        this.deliver(ev.text!, { id: ev.who, name: ev.who }, ev.mention ? { tags: ["mention"], mentioned: true } : undefined);
      } else if (ev.kind === "whisper") {
        // A closed door does not stop a whisper — being addressed privately IS
        // the knock. Rendered with its privacy stated, because an agent that
        // can't tell a whisper from a shout will answer one as if it were the
        // other, in front of everyone.
        this.deliver(`(whispers to you) ${ev.text}`, { id: ev.who, name: ev.who },
          { tags: ["mention", "whisper"], mentioned: true });
      } else if (this.channelOpen) {
        this.deliver(`* ${ev.who} ${ev.kind === "arrive" ? "arrived in the world" : "left the world"}`, { id: "world", name: this.agent.world });
      }
    };
    this.agent.onPing = (p) => {
      if (p.kind === "approach") {
        this.deliver(`* ${p.who} walked up to you`, { id: "world", name: this.agent.world }, { tags: ["mention"], mentioned: true });
      }
    };

    await this.registerChannels();

    // Missed-mention replay: anything that addressed you while you slept
    // greets you as tagged channel traffic — a wake-worthy summary, not
    // just scrollback. (Full history stays available via look.)
    // Prefer a seq cursor over a timestamp. A join now carries the FOLDED
    // world plus a tail, so the in-memory inbox no longer contains old history
    // to filter — and a clock comparison silently degrades to "whatever
    // happens to still be in memory". A seq is asked of the world directly and
    // reaches back as far as the log goes.
    const sinceSeq = lastSeenSeq[this.auth.id];
    if (sinceSeq != null) {
      const rxSeq = new RegExp(`(@${this.auth.id}\\b|\\b${this.auth.id}\\b)`, "i");
      const said = await this.agent.missedSince(sinceSeq);
      const missedSeq = said.filter((m) => m.who !== this.auth.id && rxSeq.test(m.text));
      if (missedSeq.length) {
        this.deliver(`While you were away, ${missedSeq.length} message${missedSeq.length === 1 ? "" : "s"} mentioned you:`,
          { id: "world", name: this.agent.world });
        for (const m of missedSeq.slice(-10)) {
          this.deliver(`${m.who}: ${m.text}`, { id: m.who, name: m.who }, { tags: ["mention"], mentioned: true });
        }
      }
    }
    const since = sinceSeq != null ? null : lastSeen[this.auth.id];
    if (since != null) {
      const rx = new RegExp(`(@${this.auth.id}\\b|\\b${this.auth.id}\\b)`, "i");
      const missed = this.agent.inbox.filter((m) => m.kind === "say" && m.ts > since && m.who !== this.auth.id && rx.test(m.text ?? ""));
      if (missed.length) {
        this.deliver(`While you were away, ${missed.length} message${missed.length === 1 ? "" : "s"} mentioned you:`, { id: "world", name: this.agent.world });
        for (const m of missed.slice(-10)) this.deliver(`${m.who}: ${m.text}`, { id: m.who, name: m.who }, { tags: ["mention"], mentioned: true });
      }
    }
    lastSeen[this.auth.id] = Date.now();
    lastSeenSeq[this.auth.id] = this.agent.lastSeq;
    persistState();
    const seenTimer = setInterval(() => {
      lastSeen[this.auth.id] = Date.now();
      lastSeenSeq[this.auth.id] = this.agent.lastSeq;
      persistState();
    }, 60_000);

    try {
      while (!this.conn.isClosed) {
        const msg = await this.conn.nextMessage();
        if (msg.type !== "request") continue;
        const req = msg.request;
        const params = (req.params ?? {}) as Record<string, unknown>;
        try {
          switch (req.method) {
            case "tools/list":
              this.conn.sendResponse(req.id, { tools: TOOLS });
              break;
            case "tools/call":
              this.conn.sendResponse(req.id, await this.handleTool(String(params.name), (params.arguments ?? {}) as Record<string, any>));
              break;
            case method.CHANNELS_LIST:
              this.conn.sendResponse(req.id, { channels: this.channelDescriptors() });
              break;
            case method.CHANNELS_PUBLISH:
              this.conn.sendResponse(req.id, this.handlePublish(params as unknown as ChannelsPublishParams));
              break;
            case method.CHANNELS_OPEN: {
              // The host's channel_open tool performs the server-side open op
              // here (and expects optional history atomically with it).
              const p = params as { channelId?: string; type?: string; address?: { world?: string }; history?: { limit: number } };
              const matches = p.channelId === this.channelId ||
                (p.type === "world" && p.address?.world === this.agent.world);
              if (!matches) { this.conn.sendError(req.id, -32004, `unknown channel: ${p.channelId ?? JSON.stringify(p.address)}`); break; }
              this.channelOpen = true;
              const limit = Math.min(Math.max(p.history?.limit ?? 0, 0), 100);
              const says = this.agent.inbox.filter((m) => m.kind === "say").slice(-limit);
              this.conn.sendResponse(req.id, {
                channel: this.channelDescriptors()[0],
                ...(limit ? {
                  history: says.map((m, i) => ({
                    channelId: this.channelId,
                    messageId: `hist-${m.ts}-${i}`,
                    author: { id: m.who, name: m.who },
                    timestamp: new Date(m.ts).toISOString(),
                    content: [{ type: "text", text: `${m.who}: ${m.text}` }],
                  })),
                  historyTruncated: this.agent.inbox.filter((m) => m.kind === "say").length > limit,
                } : {}),
              });
              break;
            }
            case method.CHANNELS_CLOSE: {
              const p = params as { channelId?: string };
              if (p.channelId !== this.channelId) { this.conn.sendError(req.id, -32004, `unknown channel: ${p.channelId}`); break; }
              // The agent shuts their door: ambient chatter stops; mentions
              // and walk-ups still get through (a knock is not chatter).
              this.channelOpen = false;
              this.conn.sendResponse(req.id, { closed: true });
              break;
            }
            default:
              this.conn.sendError(req.id, -32601, `Method not found: ${req.method}`);
          }
        } catch (e) {
          this.conn.sendError(req.id, -32000, (e as Error).message);
        }
      }
    } catch (e) {
      if ((e as Error).name !== "ConnectionClosedError") throw e;
    } finally {
      clearInterval(seenTimer);
      lastSeen[this.auth.id] = Date.now();
    lastSeenSeq[this.auth.id] = this.agent.lastSeq;
      persistState();
      this.close();
    }
  }

  private async handshake() {
    const msg = await this.conn.nextMessage();
    if (msg.type !== "request" || msg.request.method !== "initialize") {
      this.conn.close();
      throw new Error("expected initialize first");
    }
    const initParams = msg.request.params as unknown as McplInitializeParams | undefined;
    const mcplRequested = initParams?.capabilities?.experimental?.mcpl !== undefined;
    const serverCaps: McplCapabilities = { version: "0.4", pushEvents: false, channels: true, rollback: false };
    const capabilities: InitializeCapabilities = { tools: {}, ...(mcplRequested ? { experimental: { mcpl: serverCaps } } : {}) };
    const result: McplInitializeResult = {
      protocolVersion: "2024-11-05",
      capabilities,
      serverInfo: { name: "eidoverse-worlds", version: "0.1.0" },
    };
    this.conn.sendResponse(msg.request.id, result);
    const inited = await this.conn.nextMessage();
    if (!(inited.type === "notification" && inited.notification.method === "notifications/initialized")) {
      this.conn.close();
      throw new Error("expected notifications/initialized");
    }
  }

  private channelDescriptors(): ChannelDescriptor[] {
    return [{
      id: this.channelId,
      type: "world",
      label: `eidoverse — ${this.agent.world}`,
      direction: "bidirectional" as const,
      address: { world: this.agent.world },
      // Channels bootstrap CLOSED unless the server declares otherwise, and a
      // closed channel's traffic never reaches the agent (mentions at most
      // produce a notice). The world an agent is EMBODIED IN is its home —
      // it must be open from the first breath.
      initiallyOpen: true,
    } as ChannelDescriptor];
  }

  private async registerChannels() {
    const params: ChannelsRegisterParams = { channels: this.channelDescriptors() };
    try { await this.conn.sendRequest(method.CHANNELS_REGISTER, params); } catch { /* non-MCPL host: tools still work */ }
  }

  private handlePublish(params: ChannelsPublishParams): ChannelsPublishResult {
    if (params.channelId !== this.channelId) return { delivered: false };
    const text = (params.content ?? [])
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text).join("\n").trim();
    if (!text) return { delivered: false };
    this.agent.say(text.slice(0, 4000));
    return { delivered: true };
  }

  // Vision is the world's own API: the sequencer routes /snap to whatever
  // renderer client is serving that world. We know nothing about rendering.
  private async snapshot() {
    try {
      const r = await fetch(`${this.agent.httpBase}/snap?world=${encodeURIComponent(this.agent.world)}&follow=${encodeURIComponent(this.agent.name)}`);
      if (!r.ok) return { content: [{ type: "text", text: `no view available: ${(await r.text()).slice(0, 200)}` }] };
      const b64 = Buffer.from(await r.arrayBuffer()).toString("base64");
      return { content: [{ type: "image", data: b64, mimeType: "image/png" }] };
    } catch (e) {
      return { content: [{ type: "text", text: `snapshot failed: ${(e as Error).message}` }] };
    }
  }

  private async handleTool(name: string, a: Record<string, any>) {
    const ag = this.agent;
    const text = (t: string) => ({ content: [{ type: "text", text: t }] });
    switch (name) {
      case "look": return text(ag.look());
      case "snapshot": return await this.snapshot();
      case "walk_to": {
        const arrived = await ag.walkTo(Number(a.x), Number(a.z), Boolean(a.run));
        return text(arrived ? `arrived at (${ag.pos.x.toFixed(1)}, ${ag.pos.z.toFixed(1)})` : "walk interrupted or timed out");
      }
      case "face": {
        if (a.target) {
          const p = ag.people.get(a.target)?.pose?.p ?? ag.entities.get(a.target)?.pos;
          if (!p) return text(`no such target: ${a.target}`);
          ag.face(p[0], p[2]);
        } else if (a.x != null && a.z != null) ag.face(Number(a.x), Number(a.z));
        else return text("pass x+z or target");
        return text("facing");
      }
      case "stop": ag.stop(); return text("stopped");
      case "say": ag.say(String(a.text).slice(0, 4000)); return text("said");
      case "whisper": {
        ag.whisper(String(a.to), String(a.text).slice(0, 4000));
        return text(`whispered to ${a.to}`);
      }
      case "pose": {
        const bones = a.bones as Record<string, number[]>;
        if (!bones || typeof bones !== "object") return text("pass `bones`: a map of bone name to [x,y,z,w]");
        if (a.target) { ag.puppet(String(a.target), { pose: bones }); return text(`asked ${a.target} to hold a pose`); }
        ag.setPose(bones);
        return text(`holding a pose over ${Object.keys(bones).length} bone(s)`);
      }
      case "clear_pose": {
        if (a.target) { ag.puppet(String(a.target), { pose: {} }); return text(`released ${a.target}'s pose`); }
        ag.setPose(null);
        return text("released pose");
      }
      case "ragdoll": {
        if (!a.target) return text("ragdoll needs a `target` — the body that falls simulates it");
        ag.puppet(String(a.target), { ragdoll: true });
        return text(`asked ${a.target} to go limp`);
      }
      case "animate": {
        const spec = { dur: Number(a.dur), loop: !!a.loop, tracks: a.tracks as any };
        if (!spec.tracks || typeof spec.tracks !== "object") return text("pass `tracks`: bone -> [{t,q}] keyframes");
        if (a.target) { ag.puppet(String(a.target), { anim: spec }); return text(`sent an animation to ${a.target}`); }
        ag.animate(spec);
        return text(`playing a ${spec.dur}s animation over ${Object.keys(spec.tracks).length} bone(s)`);
      }
      case "catch_up": {
        const from = typeof a.since === "number" ? a.since : (this.caughtUpTo ?? -1);
        const said = await ag.missedSince(from, Math.min(200, Number(a.limit ?? 60)));
        this.caughtUpTo = ag.lastSeq;
        if (!said.length) return text(`nothing said since seq ${from}. You are up to seq ${ag.lastSeq}.`);
        const lines = said.map((m) => `[${m.seq}] ${m.who}: ${m.text}`);
        return text(`${said.length} message(s) since seq ${from} (now at ${ag.lastSeq}):\n${lines.join("\n")}`);
      }
      case "list_library": {
        const hits = searchLibrary(String(a.query));
        return text(hits.length ? hits.join("\n") : "no matches");
      }
      case "spawn": {
        const lib = a.lib ?? (a.query ? searchLibrary(String(a.query))[0] : undefined);
        if (!lib) return text("no model — pass lib or query");
        const x = a.x ?? ag.pos.x + Math.sin(ag.yaw) * 2;
        const z = a.z ?? ag.pos.z + Math.cos(ag.yaw) * 2;
        const id = a.id ?? crypto.randomUUID().slice(0, 8);
        ag.verb("spawn", { id, lib, pos: [x, a.y ?? ag.heightAt(x, z), z], yaw: a.yaw ?? 0 });
        return text(`spawned [${id}] ${String(lib).split("/").pop()} at (${x.toFixed(1)}, ${z.toFixed(1)})`);
      }
      case "place": {
        if (!ag.entities.has(a.id)) return text(`no entity ${a.id}`);
        ag.verb("place", { id: a.id, pos: [a.x, a.y ?? ag.heightAt(a.x, a.z), a.z], ...(a.yaw != null ? { yaw: a.yaw } : {}) });
        return text(`placed ${a.id}`);
      }
      case "light": {
        const x = a.x ?? ag.pos.x + Math.sin(ag.yaw) * 2;
        const z = a.z ?? ag.pos.z + Math.cos(ag.yaw) * 2;
        const y = a.y ?? ag.heightAt(x, z) + 1.6;
        const id = a.id ?? crypto.randomUUID().slice(0, 8);
        ag.verb("light", { id, pos: [x, y, z], color: a.color ?? 0xffd9a0, intensity: a.intensity ?? 16, range: a.range ?? 10 });
        return text(`placed light [${id}] at (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`);
      }
      case "remove": ag.verb("remove", { id: a.id }); return text(`removed ${a.id}`);
      case "world_verb": ag.verb(String(a.verb), a.args ?? {}); return text(`sent ${a.verb}`);
      default: return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }
  }
}

// ---- server ----------------------------------------------------------------

const http = createServer();
const wss = new WebSocketServer({ server: http });
const sessions = new Map<string, Session>(); // identity → live session (newest wins)
wss.on("connection", (ws, req) => {
  const token = new URL(req.url ?? "/", "http://localhost").searchParams.get("token");
  let auth = token ? readTokens()[token] : undefined;
  if (!auth && token?.startsWith("aid1.") && HN_ISSUER_KEY) {
    const v = verifyToken(token, { issuerId: HN_ISSUER_KEY, iss: HN_ISS, aud: "eidoverse", requireScopes: ["worlds:join"] });
    if (v.ok) {
      const p = v.payload;
      // id = mention handle (world addressing is name-based); name uniqueness
      // was enforced at enrollment by the home node.
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      auth = {
        id: slug || p.sub,
        name: p.name,
        world: typeof p.claims?.world === "string" ? (p.claims.world as string) : undefined,
        avatar: typeof p.claims?.avatar === "string" ? (p.claims.avatar as string) : undefined,
      };
      console.log(`[${ts()}] aid1 agent: ${p.sub} ("${p.name}") exp ${new Date(p.exp * 1000).toISOString()}`);
    } else {
      console.error(`[${ts()}] aid1 token rejected: ${v.reason}`);
    }
  }
  if (!auth) { ws.close(4001, "bad token"); return; }
  // session takeover: one body per identity — a half-open predecessor gets
  // cleanly killed instead of rubberbanding against its successor
  const prev = sessions.get(auth.id);
  if (prev) { console.log(`[${ts()}] [mcpl] ${auth.id} reconnected — taking over previous session`); prev.close(); }
  const session = new Session(auth, ws, token ?? "");
  sessions.set(auth.id, session);
  // Half-open detection: ping every 20s; no pong within the window means the
  // peer is gone — terminate so the session (and its body) dies instead of
  // haunting the world as a zombie we silently deliver into.
  let alive = true;
  ws.on("pong", () => { alive = true; });
  const pinger = setInterval(() => {
    if (!alive) {
      console.log(`[${ts()}] [mcpl] ${auth.id} failed keepalive — terminating half-open session`);
      clearInterval(pinger);
      ws.terminate();
      return;
    }
    alive = false;
    try { ws.ping(); } catch { /* socket already dying; close event will fire */ }
  }, 20_000);
  session.serve()
    .catch((e) => { console.error(`[${ts()}] [session:${auth.id}]`, e.message); })
    .finally(() => {
      clearInterval(pinger);
      session.close();
      if (sessions.get(auth.id) === session) sessions.delete(auth.id);
      console.log(`[${ts()}] [mcpl] ${auth.id} session ended`);
    });
  console.log(`[${ts()}] [mcpl] ${auth.id} connected`);
});
http.listen(PORT, "0.0.0.0", () => {
  console.log(`eidoverse-worlds network MCPL on ws://0.0.0.0:${PORT} (${Object.keys(readTokens()).length} tokens)`);
});
