// Vocab demo stagehand — READ-ONLY toward production; scratch world only.
// Boots a scratch sequencer, authors the 7 eye-check-deferred vocab families
// as visible demos, drives an MCPL body (billwalk) through the interactions,
// and (after the browser renderer joins) serves /snap captures for Bill.
//
//   bun agents/arthur/vocab-demo/stagehand.ts
//
// Everything here is scratch: WORLDS_DIR is a fresh tmpdir, JOIN_TOKEN set,
// FOLD_EVERY/VERB_RATE/MSG_RATE raised like every other test boot.
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WorldAgent } from "../../../mcpl/agent.ts";

const PORT = 8957;
const TOKEN = "vocab-demo";
const WORLD = `vocabdemo-${Date.now().toString(36)}`;
const worldsDir = mkdtempSync(join(tmpdir(), "ew-vocabdemo-"));
const OUT = join(import.meta.dir, "captures");
mkdirSync(OUT, { recursive: true });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const log = (...a: any[]) => console.log(`[stagehand ${new Date().toISOString().slice(11, 19)}]`, ...a);

// ---------------------------------------------------------------------------
// 1. boot the scratch sequencer
// ---------------------------------------------------------------------------
let server: ReturnType<typeof spawn> | null = null;
async function boot(): Promise<void> {
  server = spawn(process.execPath, [join(import.meta.dir, "..", "..", "..", "server", "server.ts")], {
    env: {
      ...process.env, PORT: String(PORT), WORLDS_DIR: worldsDir, JOIN_TOKEN: TOKEN,
      FOLD_EVERY: "40", VERB_RATE: "5000", MSG_RATE: "5000",
      // snap PNGs at spectator pixelRatio exceed the 256KB default — the
      // cap is a pre-parse allocation bound, and scratch needs headroom
      WS_MESSAGE_MAX_BYTES: "4000000",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout!.on("data", (d) => { const s = String(d); if (/error|⚠/i.test(s)) log("server:", s.trim().slice(0, 200)); });
  server.stderr!.on("data", (d) => log("server ERR:", String(d).trim().slice(0, 300)));
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(`http://127.0.0.1:${PORT}/avatars`)).ok) return; } catch { /* boot */ }
    await sleep(125);
  }
  throw new Error("scratch sequencer did not start");
}

// ---------------------------------------------------------------------------
// 2. capture helper — /snap asks the browser renderer for a frame
// ---------------------------------------------------------------------------
async function snapOnce(follow: string, view: string): Promise<Buffer | null> {
  const u = new URL(`http://127.0.0.1:${PORT}/snap`);
  u.search = new URLSearchParams({ world: WORLD, follow, view }).toString();
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(15000) });
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    return null;
  } catch { return null; }
}
async function snap(name: string, follow: string, view = "first"): Promise<void> {
  for (let i = 0; i < 30; i++) {
    const buf = await snapOnce(follow, view);
    if (buf && buf.length > 2000) {
      writeFileSync(join(OUT, `${name}.png`), buf);
      log(`snap ${name} ← ${follow}/${view}: ${buf.length}B`);
      return;
    }
    await sleep(2000);
  }
  throw new Error(`renderer never served snap ${name}`);
}

// ---------------------------------------------------------------------------
// 3. the show
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  log("booting scratch sequencer…");
  process.env.WORLD_TOKEN = TOKEN;   // WorldAgent reads the door key from env
  await boot();
  log(`world ${WORLD} — renderer URL: http://127.0.0.1:${PORT}/?world=${WORLD}&renderer=1&key=${TOKEN}&name=eyecam`);

  const stagehand = new WorldAgent({ url: `ws://127.0.0.1:${PORT}/ws`, name: "stagehand", world: WORLD, avatar: "claude.vrm" });
  await stagehand.connect();
  log("stagehand joined (owner)");

  // ---- author the world ---------------------------------------------------
  // Ground: soft meadow, flat plaza at spawn
  stagehand.verb("terrain", { seed: 21, size: 220, amplitude: 3.2, flatRadius: 24, layers: [{ color: "#55683a", repeat: 18 }] });
  stagehand.verb("grass", { width: 110, depth: 110, spacing: 0.3, perCell: 4, color: 0x46652f });
  // Sky: late dusk to start (lamp scene is first)
  stagehand.verb("sky", { hours: 19.0, rate: 0 });

  // lamp (vocab-5): cyberpunk streetlight post, warm lamp head
  stagehand.verb("spawn", { id: "lampPost", lib: "eidoverse/assets/models/streetlight_lamp_light_street_blade_runner_cyberpunk.glb", pos: [-4, 0, -3], yaw: 0.4 });
  stagehand.verb("comp", { id: "lampPost", type: "lamp", data: {
    anchor: [0, 3.1, 0.35], color: 0xffc080, intensity: 26, range: 11,
    lightAt: "the street lamp flickers alive", snuffAt: "the street lamp goes dark",
  } });

  // plate (vocab-10): parking-meter post as the trailhead sign
  stagehand.verb("spawn", { id: "trailSign", lib: "eidoverse/assets/models/parking_meter_electronic_street_blade_runner_cyberpunk.glb", pos: [2.5, 0, -4], yaw: -0.5 });
  stagehand.verb("comp", { id: "trailSign", type: "plate", data: {
    maxLen: 40, reach: 6, h: 1.5, writeAt: "the trailhead sign takes new words",
  } });

  // water (vocab-11): fountain from stacked barrels at plaza east
  stagehand.verb("spawn", { id: "plazaFountain", lib: "eidoverse/assets/models/scifi_barrels_group_of_four.glb", pos: [8, 0, -4], yaw: 0 });
  stagehand.verb("comp", { id: "plazaFountain", type: "water", data: {
    fall: 2, reach: 6, flowAt: "the plaza fountain wakes", stillAt: "the fountain sleeps",
  } });

  // growth (vocab-12): a yucca that grows by hand
  stagehand.verb("spawn", { id: "sapling", lib: "eidoverse/assets/models/stylized_yucca_joshua_tree_desert_cactus_plant.glb", pos: [-1.5, 0, 6], yaw: 0.3, scale: 0.25 });
  stagehand.verb("comp", { id: "sapling", type: "growth", data: {
    stages: [{ name: "seed", dwell: 8 }, { name: "sprout", dwell: 8 }, { name: "bloom", dwell: 8 }],
    growAt: "the seedling grows", tendAt: "the seedling is tended",
  } });

  // companion (vocab-13): a crate pet for billwalk (beaconed later BY billwalk)
  stagehand.verb("spawn", { id: "petCrate", lib: "eidoverse/assets/models/crate_large_red.glb", pos: [-6, 0, 2], yaw: 0, scale: 0.45 });

  // soundpost (vocab-18): a humming shrine post
  stagehand.verb("spawn", { id: "shrinePost", lib: "eidoverse/assets/models/inanna_tech_cyber_scifi_sphere_orb.glb", pos: [6, 0, 6], yaw: 0 });
  stagehand.verb("comp", { id: "shrinePost", type: "soundpost", data: {
    timbre: "drone", hz: 220, gain: 0.4, range: 30, muteAt: "the shrine hum fades",
  } });

  // ropebridge (vocab-36): deck + far anchor pillars across the meadow's east
  stagehand.verb("spawn", { id: "deck1", lib: "eidoverse/assets/models/scifi_barrels_single.glb", pos: [14, 0, 8] });
  stagehand.verb("spawn", { id: "farAnchor", lib: "eidoverse/assets/models/scifi_barrels_single.glb", pos: [26, 0, 8] });
  stagehand.verb("comp", { id: "deck1", type: "ropebridge", data: { pair: "farAnchor", width: 2, impulse: 0.25, cooldownSec: 2, exitScale: 1.5 } });

  await sleep(2000);
  log("world authored; waiting for the browser renderer …");

  // billwalk: the visitor whose eyes we ride
  const bill = new WorldAgent({ url: `ws://127.0.0.1:${PORT}/ws`, name: "billwalk", world: WORLD, avatar: "aletheia.vrm" });
  await bill.connect();
  log("billwalk joined");

  // block until the renderer is serving snaps (probe with tiny asks)
  for (let i = 0; i < 150; i++) {
    const buf = await snapOnce("billwalk", "first");
    if (buf) { log("renderer is live"); break; }
    await sleep(2000);
    if (i === 149) throw new Error("no renderer joined within 5min");
  }

  // ---------------- scene 1: lamp at night (vocab-5) -------------------------
  await bill.walkTo(-4, -3 + 3.4).catch(() => {});   // ~3.4m south of the lamp
  await sleep(800);
  bill.face(-4, -3);   // LOOK AT the lamp
  stagehand.verb("sky", { hours: 21.5, rate: 0 });
  await sleep(2500);
  await bill.verb("use", { id: "lampPost", action: "toggle" });   // IN REACH (3.4m < 4)
  await sleep(1200);
  await snap("vocab05-lamp-night", "billwalk", "first");
  await bill.verb("use", { id: "lampPost", action: "toggle" });   // snuff contrast
  await sleep(1000);
  await snap("vocab05-lamp-snuffed", "billwalk", "first");

  // ---------------- scene 2: inscription plate (vocab-10) --------------------
  await bill.walkTo(2.5, -4 + 2.8).catch(() => {});
  await sleep(600);
  bill.face(2.5, -4);  // LOOK AT the sign
  stagehand.verb("sky", { hours: 16, rate: 0 });
  await sleep(2200);
  await bill.verb("use", { id: "trailSign", action: "write", text: "NORTH TRAIL → SUMMIT" });
  await sleep(1500);
  await snap("vocab10-plate", "billwalk", "first");

  // ---------------- scene 3: water fountain (vocab-11) -----------------------
  await bill.walkTo(8, -4 + 3).catch(() => {});
  await sleep(600);
  bill.face(8, -4);     // LOOK AT the fountain
  await bill.verb("use", { id: "plazaFountain", action: "flow" });
  await sleep(1800);
  await snap("vocab11-water-day", "billwalk", "first");
  stagehand.verb("sky", { hours: 21.5, rate: 0 });
  await sleep(2200);
  await snap("vocab11-water-night", "billwalk", "first");

  // ---------------- scene 4: growth (vocab-12) -------------------------------
  stagehand.verb("sky", { hours: 12, rate: 0 });
  await bill.walkTo(-1.5, 6 - 3).catch(() => {});
  await sleep(600);
  bill.face(-1.5, 6);   // LOOK AT the sapling
  await bill.verb("use", { id: "sapling", action: "advance" });   // seed → sprout
  await sleep(1000);
  await snap("vocab12-growth-sprout", "billwalk", "first");
  await bill.verb("use", { id: "sapling", action: "advance" });   // sprout → bloom
  await sleep(6500);                                                // let bloom grow (k→0.95)
  await snap("vocab12-growth-bloom", "billwalk", "first");

  // ---------------- scene 5: companion (vocab-13) -----------------------------
  await bill.walkTo(-6 + 2, 2 + 2).catch(() => {});
  await sleep(600);
  await bill.verb("use", { id: "petCrate", action: "beacon", name: "Rusty", radius: 2.2 });
  await stagehand.walkTo(-12, 8).catch(() => {});   // stagehand out of frame
  await sleep(1200);                                     // adoption + lease claim
  await bill.walkTo(2, -1).catch(() => {});              // walk; Rusty trails
  await sleep(2500);                                     // let it catch up partway
  await snap("vocab13-companion-trailing", "billwalk", "third");
  await bill.verb("use", { id: "petCrate", action: "stay" });
  await sleep(800);
  await snap("vocab13-companion-stay", "billwalk", "third");

  // ---------------- scene 6: soundpost (vocab-18) -----------------------------
  await bill.walkTo(6 - 2.4, 6 - 2.4).catch(() => {});   // close = loud drone
  await sleep(800);
  bill.face(6, 6);      // LOOK AT the shrine orb
  await snap("vocab18-soundpost-near", "billwalk", "first");
  await bill.walkTo(6 - 14, 6 - 14).catch(() => {});     // far = faded
  await sleep(1500);
  bill.face(6, 6);      // LOOK AT the shrine orb (far)
  await snap("vocab18-soundpost-far", "billwalk", "first");

  // ---------------- scene 7: ropebridge (vocab-36) ----------------------------
  await bill.walkTo(14 - 2.5, 8).catch(() => {});        // west approach
  await sleep(700);
  bill.face(26, 8);     // LOOK ALONG the span east
  stagehand.verb("sky", { hours: 10, rate: 0 });
  await sleep(2000);
  await snap("vocab36-ropebridge-approach", "billwalk", "first");
  const crossed = await bill.walkTo(26 + 1.5, 8).catch(() => false);  // cross it
  await sleep(2500);                                     // creak + sway fired
  await snap("vocab36-ropebridge-crossed", "billwalk", "third");

  log(`done — ${crossed ? "crossed" : "walk outcome unknown"}; captures in ${OUT}`);
  bill.close();
  stagehand.close();
  server?.kill();
  process.exit(0);
}

main().catch((e) => { console.error("STAGEHAND FAILED:", e); server?.kill(); process.exit(1); });
