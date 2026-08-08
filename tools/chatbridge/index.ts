// Chat bridge: mirrors a world's spoken chat into one Discord text channel,
// and carries that channel's messages back in as speech.
//
//   world WS (embodied "discord") ── say verbs ──▶ Discord channel
//   Discord channel ── messages ──▶ say {text: "author: …"} in the world
//
// The bridge joins EMBODIED, not as a spectator, because authoring (even
// `say`, rank 0) needs a body — and that is honest UX anyway: the world
// shows a presence named "discord" standing where the channel is listening.
// Everything it relays is attributed inside the say text ("author: …"), so
// provenance survives in the log verbatim.
//
// Loop safety (both directions, both by identity):
//   world → Discord: entries whose actor is the bridge's own id are skipped —
//     that covers the echo of every line it just spoke.
//   Discord → world: messages from bots/webhooks are skipped — that covers
//     the bridge's own posts (and any other bot; humans only by default).
//
// Env:
//   WORLD_URL      ws(s)://host/ws            (default ws://127.0.0.1:8940/ws)
//   WORLD_TOKEN    door key                    (JOIN_TOKEN accepted too — the
//                                              one-secret-two-names footgun,
//                                              issue #41, answered by taking both)
//   WORLD_NAME     world to mirror             (default commons)
//   BRIDGE_ID      in-world identity           (default "discord")
//   DISCORD_TOKEN  bot token                   (omit with DRY_RUN=1)
//   CHANNEL_ID     the mirrored text channel
//   ALLOW_BOTS=1   relay other bots' Discord messages too (default: humans only)
//   DRY_RUN=1      no Discord: world lines print to stdout, stdin lines of the
//                  form "Name: text" play the part of Discord messages — lets
//                  the world half be rehearsed before bot credentials exist
//
// The Discord application needs the MESSAGE CONTENT privileged intent enabled
// (dev portal → Bot → Message Content Intent), or every message arrives empty.
//
// Queue policy, both directions: bounded, oldest dropped with a log line — a
// mirror that runs minutes behind is worse than one with a hole it admits to.

const WORLD_URL = process.env.WORLD_URL ?? "ws://127.0.0.1:8940/ws";
const WORLD_TOKEN = process.env.WORLD_TOKEN ?? process.env.JOIN_TOKEN ?? "";
const WORLD_NAME = process.env.WORLD_NAME ?? "commons";
const BRIDGE_ID = process.env.BRIDGE_ID ?? "discord";
const CHANNEL_ID = process.env.CHANNEL_ID ?? "";
const ALLOW_BOTS = process.env.ALLOW_BOTS === "1";
const DRY_RUN = process.env.DRY_RUN === "1";

const MAX_BACKLOG = 50;        // per direction; beyond this the oldest drop
const MAX_LINE_CHARS = 1500;   // Discord → world cap (with honest ellipsis)
const DISCORD_CHUNK = 1900;    // world → Discord split point (limit is 2000)
const SEND_GAP_MS = 350;       // world verb pacing; VERB_RATE default is 12/4s

const log = (m: string) => console.log(`[chatbridge ${new Date().toISOString().slice(11, 19)}] ${m}`);

// ---------------------------------------------------------------- world → discord

type Out = { actor: string; text: string; at: number };
const toDiscord: Out[] = [];
let postChannel: { send: (o: unknown) => Promise<unknown> } | null = null;
let posting = false;

async function pumpDiscord() {
  if (posting) return;
  posting = true;
  while (toDiscord.length) {
    while (toDiscord.length > MAX_BACKLOG) {
      const d = toDiscord.shift()!;
      log(`⏭ discord backlog — dropped "${d.actor}: ${d.text.slice(0, 40)}…"`);
    }
    const line = toDiscord.shift()!;
    const body = `**${line.actor}** — ${line.text}`;
    for (let i = 0; i < body.length; i += DISCORD_CHUNK) {
      const chunk = body.slice(i, i + DISCORD_CHUNK);
      if (DRY_RUN) { log(`→ discord: ${chunk}`); continue; }
      try {
        // never ping: a world line containing @everyone must stay ink, not a bell
        await postChannel?.send({ content: chunk, allowedMentions: { parse: [] } });
      } catch (e) {
        log(`discord send failed: ${(e as Error).message} — retrying once in 3s`);
        await new Promise((r) => setTimeout(r, 3000));
        await postChannel?.send({ content: chunk, allowedMentions: { parse: [] } }).catch((e2) =>
          log(`dropped after retry: ${(e2 as Error).message}`));
      }
    }
  }
  posting = false;
}

// ---------------------------------------------------------------- discord → world

type In = { author: string; text: string; at: number };
const toWorld: In[] = [];
let worldWs: WebSocket | null = null;
let joined = false;
let speaking = false;

async function pumpWorld() {
  if (speaking) return;
  speaking = true;
  while (toWorld.length) {
    if (!joined || worldWs?.readyState !== WebSocket.OPEN) break; // flushed on rejoin
    while (toWorld.length > MAX_BACKLOG) {
      const d = toWorld.shift()!;
      log(`⏭ world backlog — dropped "${d.author}: ${d.text.slice(0, 40)}…"`);
    }
    const m = toWorld.shift()!;
    let text = `${m.author}: ${m.text}`;
    if (text.length > MAX_LINE_CHARS) text = `${text.slice(0, MAX_LINE_CHARS)}…`;
    worldWs.send(JSON.stringify({ type: "verb", verb: "say", args: { text } }));
    await new Promise((r) => setTimeout(r, SEND_GAP_MS));
  }
  speaking = false;
}

// ---------------------------------------------------------------- world socket

let lastSeq = -Infinity; // dedupe guard across reconnects (tail replay overlaps live)

function connectWorld() {
  const ws = new WebSocket(WORLD_URL);
  worldWs = ws;
  ws.onopen = () =>
    ws.send(JSON.stringify({ type: "join", world: WORLD_NAME, id: BRIDGE_ID, token: WORLD_TOKEN }));
  ws.onclose = () => {
    joined = false;
    log("world socket closed — reconnecting in 1.5s");
    setTimeout(connectWorld, 1500);
  };
  ws.onmessage = (ev) => {
    let msg: any;
    try { msg = JSON.parse(String(ev.data)); } catch { return; }
    if (msg.type === "error") { log(`world says: ${msg.error}`); return; }
    if (msg.type === "snapshot") {
      joined = true;
      // live lines only: the channel is a window, not an archive — but keep
      // the tail's high-water seq so a reconnect can't replay it at us
      for (const e of msg.entries ?? []) if (typeof e.seq === "number") lastSeq = Math.max(lastSeq, e.seq);
      log(`joined "${msg.world}" as ${msg.you} (${msg.entries?.length ?? 0} tail entries skipped — live lines only)`);
      pumpWorld().catch((e) => log(`world pump error: ${e.message}`));
      return;
    }
    if (msg.type !== "log" || msg.entry?.verb !== "say") return;
    const { actor, seq, args } = msg.entry;
    if (typeof seq === "number") { if (seq <= lastSeq) return; lastSeq = seq; }
    if (actor === BRIDGE_ID) return; // our own speech echoing back
    const text = String(args?.text ?? "").trim();
    if (!text) return;
    toDiscord.push({ actor, text, at: Date.now() });
    pumpDiscord().catch((e) => log(`discord pump error: ${e.message}`));
  };
}

// ---------------------------------------------------------------- discord

async function connectDiscord() {
  if (DRY_RUN) {
    log("DRY_RUN — stdin plays Discord: type lines like  Name: hello world");
    (async () => {
      for await (const chunk of process.stdin) {
        for (const raw of String(chunk).split("\n")) {
          const m = raw.match(/^([^:]{1,64}):\s*(.+)$/);
          if (!m) continue;
          toWorld.push({ author: m[1].trim(), text: m[2], at: Date.now() });
          pumpWorld().catch((e) => log(`world pump error: ${e.message}`));
        }
      }
    })();
    return;
  }
  const TOKEN = process.env.DISCORD_TOKEN ?? "";
  if (!TOKEN || !CHANNEL_ID) throw new Error("DISCORD_TOKEN and CHANNEL_ID required (or DRY_RUN=1)");
  const { Client, GatewayIntentBits } = await import("discord.js");
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  });
  await client.login(TOKEN);
  await new Promise<void>((res) => client.once("ready", () => res()));
  const ch = await client.channels.fetch(CHANNEL_ID);
  if (!ch || !("send" in ch)) throw new Error(`channel ${CHANNEL_ID} is not a sendable text channel`);
  postChannel = ch as unknown as { send: (o: unknown) => Promise<unknown> };
  log(`discord: mirroring #${(ch as any).name ?? CHANNEL_ID} as ${client.user?.tag}`);

  client.on("messageCreate", (m: any) => {
    if (m.channelId !== CHANNEL_ID) return;
    if ((m.author?.bot || m.webhookId) && !ALLOW_BOTS) return; // loop gate + bot hygiene
    let text = String(m.content ?? "").replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "").trim();
    const files = [...(m.attachments?.values?.() ?? [])].map((a: any) => a.url).filter(Boolean);
    if (files.length) text = [text, ...files].filter(Boolean).join(" ");
    if (!text) return;
    const author = String(m.member?.displayName ?? m.author?.username ?? "someone").slice(0, 64);
    toWorld.push({ author, text, at: Date.now() });
    pumpWorld().catch((e) => log(`world pump error: ${e.message}`));
  });
}

await connectDiscord();
connectWorld();
log(`bridging world "${WORLD_NAME}" (${WORLD_URL}) as "${BRIDGE_ID}" — ${DRY_RUN ? "DRY RUN" : `channel ${CHANNEL_ID}`}`);
