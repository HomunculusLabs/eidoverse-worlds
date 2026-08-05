// voice-lifecycle — the consent choices, executed.
//
//   bun tools/voice-lifecycle-test.ts
//
// Fake RTCPeerConnection / getUserMedia / SpeechRecognition, per the review's
// ask: "a small fake harness is enough". Server smoke proves the relay; this
// proves the two permissions the relay knows nothing about — who may hear me,
// and whether I hear them — plus that refusing either does not restart-loop.

import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`); }
};

// ---- fakes ----------------------------------------------------------------
const created: FakePC[] = [];
class FakeTrack { stopped = false; kind = "audio"; stop() { this.stopped = true; } }
class FakeStream {
  tracks = [new FakeTrack()];
  getTracks() { return this.tracks; }
  getAudioTracks() { return this.tracks; }
}
class FakePC {
  signalingState = "stable";
  connectionState = "new";
  closed = false;
  senders: { track: FakeTrack | null }[] = [];
  localDescription: unknown = null;
  remote: unknown = null;
  ontrack: ((e: unknown) => void) | null = null;
  onicecandidate: unknown = null;
  onconnectionstatechange: unknown = null;
  constructor() { created.push(this); }
  addTrack(t: FakeTrack) { this.senders.push({ track: t }); return this.senders.at(-1); }
  removeTrack(s: { track: FakeTrack | null }) { s.track = null; }
  getSenders() { return this.senders; }
  async createOffer() { return { type: "offer", sdp: "fake" }; }
  async createAnswer() { return { type: "answer", sdp: "fake" }; }
  async setLocalDescription(d: unknown) { this.localDescription = d; this.signalingState = "have-local-offer"; }
  async setRemoteDescription(d: unknown) { this.remote = d; this.signalingState = "stable"; }
  async addIceCandidate() {}
  close() { this.closed = true; this.connectionState = "closed"; }
  /** simulate the far end delivering audio */
  deliverAudio() { this.ontrack?.({ streams: [new FakeStream()] }); }
}
(globalThis as Record<string, unknown>).RTCPeerConnection = FakePC;

let micGrants = 0, micDenies = 0;
let denyMic = false;
Object.defineProperty(globalThis.navigator, "mediaDevices", {
  configurable: true,
  value: {
    async getUserMedia() {
      if (denyMic) { micDenies++; throw new Error("NotAllowedError"); }
      micGrants++; return new FakeStream();
    },
  },
});

let sttStarts = 0, sttStops = 0;
class FakeSR {
  continuous = false; interimResults = false; lang = "en";
  onresult: unknown = null; onerror: unknown = null; onend: unknown = null;
  start() { sttStarts++; }
  stop() { sttStops++; }
  abort() { sttStops++; }
}
(globalThis as Record<string, unknown>).SpeechRecognition = FakeSR;
(globalThis as Record<string, unknown>).webkitSpeechRecognition = FakeSR;

class FakeAudioCtx {
  currentTime = 0; state = "running";
  createGain() { return { gain: { value: 0, setTargetAtTime() {} }, connect: () => ({ connect() {} }), disconnect() {} }; }
  createMediaStreamSource() { return { connect: () => ({ connect() {} }), disconnect() {} }; }
  createAnalyser() { return { fftSize: 0, frequencyBinCount: 8, getByteTimeDomainData() {}, connect() {}, disconnect() {} }; }
  async resume() {}
}
(globalThis as Record<string, unknown>).AudioContext = FakeAudioCtx;

// Module substitution: voice.js reaches core/net/ui/controller/remotes, none
// of which can exist headless (core.js constructs a WebGPU renderer). Bun's
// module mock swaps them for tools/voice-stubs.mjs — same doctrine as the
// house's chat-core-stub.mjs, one level up.
const stubs = await import("./voice-stubs.mjs");
const { mock } = await import("bun:test");
for (const m of ["core", "net", "ui", "controller", "remotes"])
  mock.module(`${import.meta.dir}/../client/lib/${m}.js`, () => stubs);

const consent = await import("../client/lib/voiceconsent.js");
const voice = await import("../client/lib/voice.js");
const bus = stubs.bus;
// the rtc/roster/consent subscriptions live in initVoice — a client that
// never initialises has no voice at all, which is itself the correct default
voice.initVoice("me");

const settle = () => new Promise((r) => setTimeout(r, 20));
const offerFrom = (who: string) => bus.emit("rtc", { from: who, payload: { sdp: { type: "offer", sdp: "x" } } });

// ---- receive consent ------------------------------------------------------
consent.setReceiveVoice(false);
created.length = 0;
offerFrom("stranger");
await settle();
check("receive-OFF: an inbound offer opens no peer connection at all", created.length === 0,
  `${created.length} pc(s) created`);

consent.setReceiveVoice(true);
offerFrom("friend");
await settle();
check("receive-ON: an inbound offer is accepted", created.length >= 1);
const pc = created.at(-1)!;
check("receive-ON: the answer is sent back", pc.localDescription != null);

// ---- revoking listen tears the live leg down ------------------------------
consent.setReceiveVoice(false);
await settle();
check("revoking receive closes the existing inbound peer", pc.closed);

// ---- mic is a SEPARATE permission -----------------------------------------
consent.setReceiveVoice(true);
created.length = 0;
offerFrom("friend2");
await settle();
const inbound = created.at(-1)!;
denyMic = false;
await voice.toggleMic("me");
check("mic on requests exactly one getUserMedia", micGrants === 1, `${micGrants}`);
const liveTrack = (await import("../client/lib/voice.js")).micOn();
await voice.toggleMic("me");
check("mic off stops the local track", liveTrack === true && voice.micOn() === false);
check("mic off does NOT close a consented inbound peer (send ≠ receive)", !inbound.closed);
check("mic off leaves no outbound track on the peer",
  inbound.getSenders().every((s) => s.track === null));

// ---- refusal must not loop ------------------------------------------------
denyMic = true;
const before = micDenies;
const r1 = await voice.toggleMic("me");
await settle();
check("denied mic permission returns false and does not retry", r1 === false && micDenies === before + 1,
  `${micDenies - before} attempt(s)`);
denyMic = false;

// ---- STT is a third, separate choice --------------------------------------
consent.setSttConsent(false);
const stt = await import("../client/lib/stt.js");
sttStarts = 0;
stt.setSTT(true);
await settle();
check("STT does not start without its own consent",
  sttStarts === 0 || !consent.sttConsented(), `${sttStarts} start(s)`);
const consentSrc = await Bun.file(new URL("../client/lib/voiceconsent.js", import.meta.url)).text();
check("consent copy names the third party in plain words",
  /vendor|third party/i.test(consentSrc) && /transcrib/i.test(consentSrc));
check("consent copy says the text becomes a durable log entry",
  /world log|stored/i.test(consentSrc));
check("consent copy says voice works without it",
  /does NOT require|without it/i.test(consentSrc));

// ---- categories stay independent ------------------------------------------
consent.setVolume("world", 0.5);
consent.setReceiveVoice(false);
check("muting voices leaves world volume untouched", consent.audioPrefs().volWorld === 0.5);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
