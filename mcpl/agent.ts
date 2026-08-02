// WorldAgent — a headless world participant: the MCPL's body.
// Owns its avatar exactly like the browser client owns a human's: simulated
// position/yaw/speed ticked at 10Hz, pose intent streamed to the sequencer,
// terrain replicated (Skye's terrain.js eval'd in Bun) so feet agree with
// every renderer. No GPU here — rendering is the retina's job (see server.ts).

import * as THREE_W from "three/webgpu";
import * as TSL from "three/tsl";
import { NoiseGate, SHORT_STINT_MS, APPROACH_REFRACT_MS, APPROACH_RADIUS, REARM_RADIUS } from "./denoise.ts";

(globalThis as any).THREE = Object.assign({}, THREE_W, TSL);

const WALK = 1.55, RUN = 4.0, TICK_MS = 100, ARRIVE = 0.4;

type Vec2 = { x: number; z: number };
type Pose = { p: number[]; yaw: number; speed: number; clip: string };
type Entity = { id: string; lib: string; pos: number[]; yaw: number; actor: string };
type Person = { id: string; avatar: string; pose: Pose | null };
type InboxItem = { ts: number; kind: "say" | "arrive" | "leave" | "act"; who: string; text?: string; seq?: number | null };

/** Folded world state back into the verbs that produced it. Must stay in step
 *  with the browser client's stateToEntries — two renderers disagreeing about
 *  what a snapshot means is a world that looks different per species. */
function stateToEntries(state: any, skipChatFromSeq = Infinity): any[] {
  if (!state) return [];
  const out: any[] = [];
  let seq = -1;
  const add = (verb: string, args: any, actor = "world", ts = Date.now()) =>
    out.push({ seq: seq--, ts, actor, verb, args });
  if (state.terrain) add("terrain", state.terrain);
  if (state.grass) add("grass", state.grass);
  if (state.sky) add("sky", state.sky, "world", state.sky.ts ?? Date.now());
  for (const a of state.assets ?? []) add("asset", a);
  for (const [id, e] of Object.entries<any>(state.entities ?? {})) {
    if (e.kind === "light") {
      // folded lights have no lib — must stay in step with the browser
      // client's stateToEntries (a drift here is how Fable's porchlight
      // crashed look() for every agent in the world)
      add("light", { id, pos: e.pos, color: e.color, intensity: e.intensity, range: e.range },
        e.actor ?? "world", e.ts ?? Date.now());
    } else {
      add("spawn", { id, lib: e.lib, pos: e.pos, yaw: e.yaw, ...(e.scale != null ? { scale: e.scale } : {}) },
        e.actor ?? "world", e.ts ?? Date.now());
    }
  }
  for (const m of state.recentChat ?? []) {
    if ((m.seq ?? -1) >= skipChatFromSeq) continue;   // the tail will bring these
    out.push({ seq: typeof m.seq === "number" ? m.seq : seq--, ts: m.ts, actor: m.actor,
               verb: "say", args: { text: m.text } });
  }
  return out;
}

// A canned "knocked over" pose for headless agents, which cannot simulate.
const DOWNED_POSE: Record<string, number[]> = {
  spine: [0.6, 0, 0, 0.8], chest: [0.5, 0, 0, 0.87], neck: [0.3, 0, 0, 0.95],
  leftUpperArm: [0, 0, -0.9, 0.44], rightUpperArm: [0, 0, 0.9, 0.44],
  leftUpperLeg: [0.9, 0, 0, 0.44], rightUpperLeg: [0.9, 0, 0, 0.44],
  leftLowerLeg: [-0.7, 0, 0, 0.71], rightLowerLeg: [-0.7, 0, 0, 0.71],
};

export class WorldAgent {
  url: string; name: string; world: string; avatar: string; agentToken = "";
  ws: WebSocket | null = null;
  joined = false;
  pos = { x: 0, y: 0, z: 0 };
  yaw = 0; speed = 0; clip = "idle";
  private target: (Vec2 & { run: boolean }) | null = null;
  /** A held custom pose — sparse humanoid-bone quaternions. Presence only:
   *  it rides the pose packet and is never a log verb, because it is a moment,
   *  not a change to the world. `null` clears. */
  heldPose: Record<string, number[]> | null = null;
  private walkDone: ((arrived: boolean) => void) | null = null;
  entities = new Map<string, Entity>();
  people = new Map<string, Person>();
  inbox: InboxItem[] = [];
  private inboxCursor = 0;
  /** Highest world-log seq whose `say` already sits in the inbox. A mid-life
   *  reconnect replays the same snapshot tail — without this guard every
   *  server restart re-appended history and the next look() dumped chat the
   *  agent had already seen. */
  private inboxSeen = -Infinity;
  pings: { ts: number; kind: "mention" | "approach" | "whisper"; who: string; text?: string }[] = [];
  onPing: ((p: { ts: number; kind: string; who: string; text?: string }) => void) | null = null;
  /** live world events (say/arrive/leave) — the channel fan-out hook */
  onEvent: ((ev: { ts: number; kind: "say" | "arrive" | "leave" | "whisper" | "act"; who: string; text?: string; mention?: boolean }) => void) | null = null;
  private lastNear = new Map<string, number>(); // participant -> last approach-ping ts
  /** approach re-arm: after a walk-up ping, the SAME person must actually go
   *  away (> REARM_RADIUS) before another boundary crossing can ever count —
   *  someone pacing at 2–3m otherwise re-triggers on every crossing. */
  private nearArmed = new Map<string, boolean>();
  /** participant -> when their current non-locomotion stint began (jump, sit…) */
  private nonLocoSince = new Map<string, number>();
  /** Stateful denoiser for ambient narration (arrive/leave/acts). Says,
   *  mentions, and whispers never pass through it — a knock is not chatter.
   *  See denoise.ts for the doctrine. */
  private gate = new NoiseGate((ev) => {
    this.inbox.push({ ts: ev.ts, kind: ev.kind, who: ev.who, ...(ev.text != null ? { text: ev.text } : {}) });
    this.onEvent?.(ev);
  });
  private terrain: { heightAt(x: number, z: number): number } | null = null;
  private terrainSrc: string | null = null;
  worldInfo: Record<string, unknown> = {};
  private ticker: ReturnType<typeof setInterval> | null = null;
  /** Highest world-log seq this body has seen. This — not a wall-clock time —
   *  is what "where was I up to" means: it survives restarts, it cannot drift,
   *  and it is directly comparable with what the world hands out. */
  lastSeq = -1;
  private pendingHistory = new Map<string, (m: any) => void>();
  private histId = 0;

  constructor(opts: { url?: string; name?: string; world?: string; avatar?: string; agentToken?: string } = {}) {
    this.url = opts.url ?? process.env.WORLD_URL ?? "ws://127.0.0.1:8940/ws";
    this.name = opts.name ?? process.env.AGENT_NAME ?? "claude";
    this.world = opts.world ?? process.env.WORLD_NAME ?? "commons";
    this.avatar = opts.avatar ?? process.env.AGENT_AVATAR ?? "eidoverse/assets/vrms/claude.vrm";
    // The agent's own bearer (the one that opened the MCPL door). Forwarded at
    // join so the sequencer can verify the name — agent names are reserved.
    this.agentToken = opts.agentToken ?? process.env.AGENT_TOKEN ?? "";
  }

  get httpBase(): string {
    // Proper URL surgery, not string surgery: a WORLD_URL carrying a query
    // string (…/ws?token=…) used to defeat the old `/\/ws$/` replace and
    // send /snap + terrain fetches to a malformed URL (reported by digi/FC).
    const u = new URL(this.url);
    u.protocol = u.protocol === "wss:" ? "https:" : "http:";
    u.pathname = u.pathname.replace(/\/ws$/, "");
    u.search = "";
    return u.toString().replace(/\/$/, "");
  }

  closed = false;
  restoredPose = false;
  /** Deliberate death: stop the body, never reconnect. Sessions MUST call
   *  this (not ws.close()) — the auto-reconnect below otherwise resurrects
   *  the body as a zombie that fights its successor over the identity. */
  close() {
    this.closed = true;
    if (this.ticker) { clearInterval(this.ticker); this.ticker = null; }
    this.gate.dispose(); // held narration dies with the session
    this.ws?.close();
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.closed) return reject(new Error("agent closed"));
      const ws = new WebSocket(this.url);
      this.ws = ws;
      const timeout = setTimeout(() => reject(new Error("join timeout")), 8000);
      // `agent: true` is not a capability — it changes nothing about what this
      // body may do. It exists so the world can SAY who it is talking to.
      // Knowing whether the thing across the table thinks in tokens or neurons
      // matters here in a way it doesn't in a chat app.
      ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: this.world, id: this.name, avatar: this.avatar,
        agent: true, token: process.env.WORLD_TOKEN ?? "", agentToken: this.agentToken }));
      ws.onclose = (ev) => {
        this.joined = false;
        // 4006 = removed by moderation (kicked or banned). Reconnecting would
        // either hammer a banned door or instantly undo a kick — the body
        // stays down; its host reconnecting later is the deliberate return.
        if ((ev as { code?: number } | undefined)?.code === 4006) { this.closed = true; return; }
        if (!this.closed) setTimeout(() => this.connect().catch(() => {}), 1500);
      };
      ws.onmessage = async (ev) => {
        const msg = JSON.parse(String(ev.data));
        switch (msg.type) {
          case "error":
            // A pre-join refusal (reserved name, bad token) is final —
            // retrying the identical join every 1.5s can only produce the
            // same refusal. Surface the sequencer's reason instead of the
            // silent join-timeout loop this used to be.
            if (!this.joined) {
              this.closed = true;
              clearTimeout(timeout);
              reject(new Error(String(msg.error ?? "join refused")));
            } else {
              // A mid-life refusal (insufficient rank, a bad moderation
              // target, being kicked…). Verbs are fire-and-forget, so this is
              // the only place the answer lands: remember it so a tool call
              // can report it (modOutcome), and put it in the inbox so a
              // later look() shows what the world said no to.
              this.lastRefusal = { ts: Date.now(), text: String(msg.error ?? "refused") };
              this.inbox.push({ ts: Date.now(), kind: "act", who: "world", text: `refused: ${msg.error}` });
            }
            break;
          case "mod":
            // Moderation replies (ban lists, global-ban confirmations).
            this.lastMod = { ts: Date.now(), text: String(msg.text ?? "") };
            break;
          case "snapshot":
            this.entities.clear(); this.people.clear();
            // wake where you fell asleep — fresh body only; a body that has
            // walked this process keeps its own truth on mid-life reconnects
            if (msg.restore && !this.restoredPose && !this.target && this.pos.x === 0 && this.pos.z === 0) {
              this.pos.x = msg.restore.p[0]; this.pos.z = msg.restore.p[2];
              this.yaw = msg.restore.yaw ?? 0;
              // an enacted pose is authored, not ephemeral — wake holding it.
              // A remembered ragdoll frame is not (pre-sanitizer entries) —
              // wake standing rather than hung mid-tumble.
              if (msg.restore.clip && msg.restore.clip !== "ragdoll") this.clip = msg.restore.clip;
              if (msg.restore.pose && msg.restore.clip !== "ragdoll") this.heldPose = msg.restore.pose;
            }
            this.restoredPose = true;
            for (const p of msg.present) this.people.set(p.id, { id: p.id, avatar: p.avatar, pose: p.pose });
            // A join is now the folded world plus a tail, not the whole log.
            // An agent that only read `entries` would arrive in an empty room.
            const oldestTail = msg.entries.length
              ? Math.min(...msg.entries.map((e: any) => e.seq ?? Infinity)) : Infinity;
            for (const e of stateToEntries(msg.state, oldestTail)) await this.applyEntry(e, false);
            for (const e of msg.entries) await this.applyEntry(e, false);
            if (typeof msg.throughSeq === "number") this.lastSeq = Math.max(this.lastSeq, msg.throughSeq);
            for (const e of msg.entries) this.lastSeq = Math.max(this.lastSeq, e.seq ?? -1);
            this.joined = true;
            if (!this.ticker) this.ticker = setInterval(() => this.tick(), TICK_MS);
            clearTimeout(timeout);
            resolve();
            break;
          case "puppet":
            // A headless agent has no renderer to apply a pose TO — honouring a
            // puppet means re-broadcasting it as its own presence, so the
            // renderers that draw this body show it. Pose → held pose; anim →
            // re-send as ours.
            //
            // Ragdoll is the exception it cannot fully honour: with no skeleton
            // in-process there is nothing to run physics ON. So it slumps into a
            // fixed collapsed pose instead of simulating — visibly down, just
            // not physically settled. A renderer-backed body does the real sim.
            if (msg.ragdoll) this.heldPose = DOWNED_POSE;
            if (msg.pose) this.heldPose = msg.pose;
            if (msg.anim) this.ws?.send(JSON.stringify({ type: "anim", ...msg.anim }));
            this.onEvent?.({ ts: Date.now(), kind: "say", who: msg.by,
              text: `(posed you${msg.anim ? " with an animation" : ""})` } as any);
            break;
          case "log":
            this.lastSeq = Math.max(this.lastSeq, msg.entry?.seq ?? -1);
            await this.applyEntry(msg.entry, true);
            break;
          case "history": {
            const p = this.pendingHistory.get(msg.reqId);
            if (p) { this.pendingHistory.delete(msg.reqId); p(msg); }
            break;
          }
          case "whisper": {
            // A private message addressed to this body. Whispers never touch
            // the world log, so this is the ONLY delivery — treat it as an
            // explicit mention regardless of whether the name appears in it,
            // because being addressed directly is what a mention means.
            if (msg.echo || msg.from === this.name) break;
            this.inbox.push({ ts: msg.ts ?? Date.now(), kind: "say", who: msg.from, text: `(whisper) ${msg.text}` });
            this.ping({ ts: msg.ts ?? Date.now(), kind: "whisper", who: msg.from, text: msg.text });
            this.onEvent?.({ ts: msg.ts ?? Date.now(), kind: "whisper", who: msg.from, text: msg.text, mention: true });
            break;
          }
          case "arrive":
            // the people map is truth and updates NOW; the narration goes
            // through the gate, where a reconnect flap collapses to nothing
            this.people.set(msg.id, { id: msg.id, avatar: msg.avatar, pose: null });
            this.gate.presence(msg.id, "arrive");
            break;
          case "leave":
            this.people.delete(msg.id);
            this.gate.presence(msg.id, "leave");
            break;
          case "pose":
            this.notePose(msg.id, msg.pose);
            break;
          case "frame":
            // batched embodied plane: latest pose per id, one message per tick
            for (const [id, pose] of Object.entries(msg.poses as Record<string, Pose>)) {
              if (id !== this.name) this.notePose(id, pose);
            }
            break;
        }
      };
    });
  }

  /** Track someone's latest pose + fire the approach ping when they cross
   *  into conversational range. An approach is precious as a knock — and
   *  worthless as a metronome (Fable: Digi "walked up" six times in a row,
   *  just strolling nearby). Three gates: edge-triggered at the radius,
   *  RE-ARMED only after the person actually goes away (> REARM_RADIUS),
   *  and a long per-person refractory on top. First approach wakes;
   *  repeats within the window are background. */
  private notePose(id: string, pose: Pose) {
    const p = this.people.get(id) ?? { id, avatar: "", pose: null };
    const prev = p.pose;
    p.pose = pose; this.people.set(id, p);
    const [x, , z] = pose.p;
    const dist = Math.hypot(x - this.pos.x, z - this.pos.z);
    const prevDist = prev ? Math.hypot(prev.p[0] - this.pos.x, prev.p[2] - this.pos.z) : Infinity;
    if (dist > REARM_RADIUS) this.nearArmed.set(id, true);
    const armed = this.nearArmed.get(id) ?? true;
    const cooled = Date.now() - (this.lastNear.get(id) ?? 0) > APPROACH_REFRACT_MS;
    if (dist < APPROACH_RADIUS && prevDist >= APPROACH_RADIUS && armed && cooled) {
      this.lastNear.set(id, Date.now());
      this.nearArmed.set(id, false);
      this.ping({ ts: Date.now(), kind: "approach", who: id });
    }
    if (id !== this.name) this.noteActs(id, prev, pose);
  }

  /** Embodied acts as events. The presence stream is 15Hz noise; what an
   *  agent should hear about is TRANSITIONS — an emote fired, a pose struck
   *  or released, someone sitting down or getting up. Edge-triggered, so a
   *  held pose (or a ragdoll, which streams through the same field) speaks
   *  once when it starts and once when it ends, never per-frame.
   *
   *  Two denoising layers on top (Fable: 40+ jump pairs in one evening):
   *  the gate's per-(person, act) refractory makes a burst of the same act
   *  speak once per window instead of per repetition; and a non-locomotion
   *  stint shorter than SHORT_STINT_MS earns no "gets up" — the start
   *  already told the story, a jump is one thing, not two. */
  private noteActs(id: string, prev: Pose | null, pose: Pose & { emote?: string; pose?: Record<string, unknown> | null }) {
    const acts: { key: string; text: string }[] = [];
    if (pose.emote) acts.push({ key: `emote:${pose.emote}`, text: `emotes: ${pose.emote}` });
    const prevHeld = Boolean((prev as { pose?: unknown } | null)?.pose);
    const nowHeld = Boolean(pose.pose);
    if (nowHeld && !prevHeld) acts.push({ key: "pose", text: `strikes a pose (${Object.keys(pose.pose!).length} bones held)` });
    if (!nowHeld && prevHeld) acts.push({ key: "pose-release", text: "releases their pose" });
    const LOCO = new Set(["idle", "walk", "run"]);
    const pc = prev?.clip ?? "idle", nc = pose.clip ?? "idle";
    if (nc !== pc) {
      if (!LOCO.has(nc)) {
        if (LOCO.has(pc)) this.nonLocoSince.set(id, Date.now());
        acts.push({ key: `clip:${nc}`, text: nc.startsWith("sit") ? "sits down" : nc === "lie" ? "lies down" : `starts "${nc}"` });
      } else if (!LOCO.has(pc)) {
        const stint = Date.now() - (this.nonLocoSince.get(id) ?? 0);
        this.nonLocoSince.delete(id);
        if (stint >= SHORT_STINT_MS) acts.push({ key: "gets-up", text: "gets up" });
      }
    }
    for (const a of acts) this.gate.act(id, a.key, a.text);
  }

  private async applyEntry(entry: any, live: boolean) {
    const { verb, args, actor, ts } = entry;
    if (verb === "spawn") {
      this.entities.set(args.id, { id: args.id, lib: args.lib, pos: args.pos ?? [0, 0, 0], yaw: args.yaw ?? 0, actor });
    } else if (verb === "light") {
      // a light is an entity too, so text-tier perception can see it and it can
      // be moved/removed by id like anything else
      this.entities.set(args.id, { id: args.id, lib: "(light)", pos: args.pos ?? [0, 1, 0], yaw: 0, actor });
    } else if (verb === "place") {
      const e = this.entities.get(args.id);
      if (e) { e.pos = args.pos; if (args.yaw != null) e.yaw = args.yaw; }
    } else if (verb === "remove") {
      this.entities.delete(args.id);
    } else if (verb === "say") {
      // history lands in the inbox ONCE, so a freshly-joined agent has
      // context — and a reconnect's replayed tail is deduped by seq instead
      // of piling the same chat in again.
      const seq = typeof (entry as { seq?: unknown }).seq === "number" ? (entry as { seq: number }).seq : null;
      // only real log seqs (>= 0) dedupe — synthetic pre-history seqs descend
      if (seq != null && seq >= 0 && seq <= this.inboxSeen) return;
      if (seq != null && seq >= 0) this.inboxSeen = seq;
      this.inbox.push({ ts, kind: "say", who: actor, text: args.text, seq });
      // mention ping — @name or bare whole-word name, live messages only.
      // The agent's OWN say is deliberately never fanned out: the world log
      // echoes it back here, and delivering that echo as an incoming message
      // made every resident hear themselves (Fable: "моё собственное эхо").
      // It stays in the inbox — the scrollback record is honest — but it is
      // not an event.
      if (live && actor !== this.name) {
        const rx = new RegExp(`(@${this.name}\\b|\\b${this.name}\\b)`, "i");
        const mention = rx.test(String(args.text));
        if (mention) this.ping({ ts, kind: "mention", who: actor, text: args.text });
        this.onEvent?.({ ts, kind: "say", who: actor, text: args.text, mention });
      }
    } else if (verb === "ban" || verb === "unban" || verb === "kick") {
      // Moderation acts, narrated like any embodied transition — and, when
      // this body is the ACTOR, the confirmation its fire-and-forget verb
      // never gets: the authoritative echo doubles as the tool's answer.
      const what = verb === "ban" ? "banned" : verb === "unban" ? "lifted the ban on" : "removed";
      const line = `${what} ${args?.id}${verb !== "unban" && args?.reason ? ` — ${args.reason}` : ""}`;
      if (live) {
        this.inbox.push({ ts, kind: "act", who: actor, text: line });
        if (actor === this.name) this.lastMod = { ts: Date.now(), text: `you ${line}` };
        else this.onEvent?.({ ts, kind: "act", who: actor, text: line });
      }
    } else if (verb === "terrain") {
      await this.buildTerrain(args);
      this.worldInfo.terrain = { seed: args.seed, size: args.size, amplitude: args.amplitude, flatRadius: args.flatRadius };
    } else if (verb === "sky") {
      this.worldInfo.sky = args;
    } else if (verb === "grass") {
      this.worldInfo.grass = { area: `${args.width ?? args.size}×${args.depth ?? args.size}m around ${JSON.stringify(args.center ?? [0, 0])}` };
    }
  }

  private ping(p: { ts: number; kind: "mention" | "approach" | "whisper"; who: string; text?: string }) {
    this.pings.push(p);
    this.onPing?.(p);
  }

  takePings() {
    const out = this.pings;
    this.pings = [];
    return out;
  }

  private async buildTerrain(args: any) {
    if (!this.terrainSrc) {
      const r = await fetch(`${this.httpBase}/library/eidoverse/terrain.js`);
      this.terrainSrc = await r.text();
      (0, eval)(this.terrainSrc);
    }
    this.terrain = (globalThis as any).makeTerrain({ ...args, layers: [] });
  }

  heightAt(x: number, z: number): number {
    return this.terrain ? this.terrain.heightAt(x, z) : 0;
  }

  private tick() {
    if (!this.joined) return;
    const dt = TICK_MS / 1000;
    if (this.target) {
      const dx = this.target.x - this.pos.x, dz = this.target.z - this.pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist < ARRIVE) {
        this.target = null; this.speed = 0; this.clip = "idle";
        this.walkDone?.(true); this.walkDone = null;
      } else {
        const sp = this.target.run ? RUN : WALK;
        this.speed = sp; this.clip = this.target.run ? "run" : "walk";
        this.yaw = Math.atan2(dx, dz);
        const step = Math.min(dist, sp * dt);
        this.pos.x += (dx / dist) * step;
        this.pos.z += (dz / dist) * step;
      }
    }
    this.pos.y = this.heightAt(this.pos.x, this.pos.z);
    this.ws?.send(JSON.stringify({
      type: "pose",
      pose: {
        p: [this.pos.x, this.pos.y, this.pos.z], yaw: this.yaw, speed: this.speed, clip: this.clip,
        ...(this.heldPose ? { pose: this.heldPose } : {}),
        ...(this.pendingEmote ? { emote: this.pendingEmote } : {}),
      },
    }));
    this.pendingEmote = null; // one-shot: rides exactly one packet
  }

  walkTo(x: number, z: number, run = false, timeoutMs = 90_000): Promise<boolean> {
    this.walkDone?.(false); // cancel a previous walk
    this.target = { x, z, run };
    return new Promise((resolve) => {
      this.walkDone = resolve;
      setTimeout(() => { if (this.walkDone === resolve) { this.target = null; this.walkDone = null; resolve(false); } }, timeoutMs);
    });
  }

  stop() { this.target = null; this.speed = 0; this.clip = "idle"; this.walkDone?.(false); this.walkDone = null; }

  face(x: number, z: number) { this.yaw = Math.atan2(x - this.pos.x, z - this.pos.z); }

  verb(verb: string, args: Record<string, unknown>) {
    if (!this.joined) throw new Error("not joined");
    this.ws!.send(JSON.stringify({ type: "verb", verb, args }));
  }

  // ---- moderation ----
  // Per-world kick/ban/unban are ordinary verbs (owner-rank, same gate as
  // grant) sent via verb(). These two are the extra plumbing: non-verb
  // moderation messages, and a way to hear the world's answer.

  /** The world's most recent mid-life refusal / moderation reply. */
  lastRefusal: { ts: number; text: string } | null = null;
  lastMod: { ts: number; text: string } | null = null;

  /** Moderation messages that are not world verbs: 'world-bans' (list this
   *  world's bans — anyone present), 'global-ban' / 'global-unban' /
   *  'global-bans' (server: WORLD_ADMIN only). Answers arrive as `mod`. */
  sendMod(type: "world-bans" | "global-ban" | "global-unban" | "global-bans", extra: Record<string, unknown> = {}) {
    if (!this.joined || this.ws?.readyState !== 1) throw new Error("not joined");
    this.ws.send(JSON.stringify({ type, ...extra }));
  }

  /** Wait briefly for the world's answer to a moderation act issued at t0: a
   *  `mod` confirmation (or the authoritative log echo of our own ban/kick),
   *  or an `error` refusal. Verbs are fire-and-forget by doctrine; moderation
   *  is the act where "did that actually happen" deserves a real answer. */
  async modOutcome(t0: number, ms = 1500): Promise<string | null> {
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
      if (this.lastRefusal && this.lastRefusal.ts >= t0) return `refused: ${this.lastRefusal.text}`;
      if (this.lastMod && this.lastMod.ts >= t0) return this.lastMod.text;
      await new Promise((r) => setTimeout(r, 50));
    }
    return null;
  }

  say(text: string) { this._typingUntil = 0; this.verb("say", { text }); }

  /** Show "composing" over this body. Presence-only (never logged), the same
   *  signal a human client sends while typing in the chat box. The world relays
   *  it and renderers draw the dots above the head for ~4s. Called repeatedly
   *  as an agent streams its generation (MCPL channels/outgoing/chunk), so it
   *  is throttled to one packet per second — the world extends the 4s window on
   *  each, so a long generation keeps the dots up continuously. `say()` clears
   *  it, because the bubble that follows is the natural end of composing. */
  private _typingUntil = 0;
  typing() {
    if (!this.joined || this.ws?.readyState !== 1) return;
    const now = Date.now();
    if (now < this._typingUntil) return;   // throttle: at most ~1/s
    this._typingUntil = now + 1000;
    this.ws.send(JSON.stringify({ type: "typing", to: null }));
  }

  /** Hold a custom pose (yourself). Sparse bone -> [x,y,z,w] quaternion. */
  setPose(bones: Record<string, number[]> | null) { this.heldPose = bones; }

  /** Fire a named emote — a one-shot rider on the next presence packet, the
   *  same channel the browser's emote bar uses. Receivers resolve the name
   *  to a library clip; nothing is logged. */
  emote(name: string) { this.pendingEmote = name; }
  private pendingEmote: string | null = null;

  /** Settle into a posture clip (sit/sitchair/lie/idle). Rides the presence
   *  stream like locomotion does; walking replaces it, restore re-applies it. */
  setPosture(clip: string) {
    this.stop();
    this.speed = 0;
    this.clip = clip;
  }

  /** Change body mid-session: the same move the browser makes — re-announce
   *  with the new path and every client rebuilds this remote. Position, held
   *  pose, and identity all carry over; only the body changes. */
  setAvatar(path: string) {
    this.avatar = path;
    if (this.joined && this.ws?.readyState === 1) {
      this.ws.send(JSON.stringify({ type: "join", world: this.world, id: this.name, avatar: this.avatar,
        agent: true, token: process.env.WORLD_TOKEN ?? "", agentToken: this.agentToken }));
    }
  }

  /** Play a one-off animation on yourself — relayed once, never logged. */
  animate(data: { dur: number; loop?: boolean; tracks: Record<string, { t: number; q: number[] }[]> }) {
    if (this.joined && this.ws?.readyState === 1) {
      this.ws.send(JSON.stringify({ type: "anim", dur: data.dur, loop: !!data.loop, tracks: data.tracks }));
    }
  }

  /** Ask another body to hold a pose or play an animation. It decides. */
  puppet(target: string, spec: { pose?: Record<string, number[]>; anim?: unknown; ragdoll?: boolean }) {
    if (this.joined && this.ws?.readyState === 1) {
      this.ws.send(JSON.stringify({ type: "puppet", target,
        pose: spec.pose ?? null, anim: spec.anim ?? null, ragdoll: spec.ragdoll ?? null }));
    }
  }

  /** Ask the world what happened in a range of its history.
   *
   *  An agent does not experience time continuously — it exists in bursts,
   *  with the world moving between them. Live events fill the inbox while the
   *  process is up; this is how it recovers everything else, including what
   *  happened before it was ever started. */
  history(opts: { before?: number; after?: number; limit?: number; verbs?: string[] } = {}):
      Promise<{ entries: any[]; oldestSeq: number | null; hasMore: boolean }> {
    if (!this.joined || this.ws?.readyState !== 1) {
      return Promise.resolve({ entries: [], oldestSeq: null, hasMore: false });
    }
    const reqId = `h${++this.histId}`;
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        this.pendingHistory.delete(reqId);
        resolve({ entries: [], oldestSeq: null, hasMore: false });
      }, 8000);
      this.pendingHistory.set(reqId, (m) => {
        clearTimeout(t);
        resolve({ entries: m.entries ?? [], oldestSeq: m.oldestSeq ?? null, hasMore: !!m.hasMore });
      });
      this.ws!.send(JSON.stringify({ type: "history", reqId, ...opts }));
    });
  }

  /** Everything said since a given point, oldest first. */
  /** Advance the unread cursor past replayed history at or before `seq` —
   *  chat a previous session already presented. The persisted per-agent
   *  cursor (state.json) survives process restarts; without this, every
   *  fresh session's first look() re-dumped the tail as "since you last
   *  looked". Entries without a real seq are never presumed seen. */
  skipInboxThrough(seq: number) {
    let i = 0;
    for (; i < this.inbox.length; i++) {
      const s = this.inbox[i].seq;
      if (typeof s !== "number" || s < 0 || s > seq) break;
    }
    this.inboxCursor = Math.max(this.inboxCursor, i);
  }

  async missedSince(seq: number, limit = 120) {
    const { entries } = await this.history({ after: seq, limit, verbs: ["say"] });
    return entries.map((e) => ({ ts: e.ts, who: e.actor, text: e.args?.text ?? "", seq: e.seq }));
  }
  /** Private, point-to-point, never appended to the world log. */
  whisper(to: string, text: string) {
    if (!this.joined || this.ws?.readyState !== 1) return;
    this.ws.send(JSON.stringify({ type: "whisper", to, text }));
  }

  // ---- perception (text tier) ----

  private bearing(dx: number, dz: number): string {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]; // N = -z, E = +x
    const a = Math.atan2(dx, -dz);
    return dirs[Math.round(((a + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4)) % 8];
  }

  look(): string {
    const L: string[] = [];
    const me = this.pos;
    L.push(`You are "${this.name}" in world "${this.world}" at (${me.x.toFixed(1)}, ${me.z.toFixed(1)}), ground height ${me.y.toFixed(2)}m, facing ${this.bearing(Math.sin(this.yaw), Math.cos(this.yaw))}.`);
    if (Object.keys(this.worldInfo).length) L.push(`World: ${JSON.stringify(this.worldInfo)}`);

    const others = [...this.people.values()];
    L.push(others.length ? `\nPeople (${others.length}):` : "\nNobody else is here right now.");
    for (const p of others) {
      if (!p.pose) { L.push(`  - ${p.id} (just arrived, position unknown)`); continue; }
      const [x, , z] = p.pose.p;
      const dx = x - me.x, dz = z - me.z;
      const doing = { idle: "standing", walk: "walking", run: "running", sit: "sitting", sitchair: "sitting on a chair", lie: "lying down" }[p.pose.clip] ?? p.pose.clip;
      const held = (p.pose as { pose?: Record<string, unknown> | null }).pose;
      const posed = held ? `, holding a pose (${Object.keys(held).length} bones)` : "";
      L.push(`  - ${p.id}: ${Math.hypot(dx, dz).toFixed(1)}m ${this.bearing(dx, dz)} at (${x.toFixed(1)}, ${z.toFixed(1)}), ${doing}${posed}`);
    }

    const ents = [...this.entities.values()];
    L.push(ents.length ? `\nThings (${ents.length}):` : "\nNo placed things yet.");
    for (const e of ents.sort((a, b) => {
      const da = Math.hypot(a.pos[0] - me.x, a.pos[2] - me.z), db = Math.hypot(b.pos[0] - me.x, b.pos[2] - me.z);
      return da - db;
    })) {
      const dx = e.pos[0] - me.x, dz = e.pos[2] - me.z;
      const short = (e.lib ?? "(light)").split("/").pop()!.replace(".glb", "").split("_").slice(0, 5).join(" ");
      L.push(`  - [${e.id}] ${short}: ${Math.hypot(dx, dz).toFixed(1)}m ${this.bearing(dx, dz)} at (${e.pos[0].toFixed(1)}, ${e.pos[1].toFixed(1)}, ${e.pos[2].toFixed(1)})${e.pos[1] > 0.05 ? " (elevated)" : ""}`);
    }

    const unread = this.inbox.slice(this.inboxCursor);
    this.inboxCursor = this.inbox.length;
    if (unread.length) {
      L.push(`\nSince you last looked:`);
      for (const m of unread.slice(-25)) {
        L.push(m.kind === "say" ? `  ${m.who}: ${m.text}`
          : m.kind === "act" ? `  * ${m.who} ${m.text}`
          : `  * ${m.who} ${m.kind === "arrive" ? "arrived" : "left"}`);
      }
    }
    return L.join("\n");
  }
}
