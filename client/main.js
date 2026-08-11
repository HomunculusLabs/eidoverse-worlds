// eidoverse-worlds browser client.
//
// Two planes: the world log (verbs, ordered, replayed on join) and presence
// (intent state at ~15Hz, interpolated). The client owns its own avatar; the
// server sequences and relays. This file is the boot sequence and the frame
// system LIST — every system lives in lib/ (§14 6c): identity and the `me`
// handle in mybody.js, my body's physics in localbody.js, consent in
// consent.js, voice mouths in voicemouths.js, /commands in lib/commands/.

import {
  THREE, scene, camera, renderer, CONFIG, bus, report,
} from './lib/core.js';
import { contributeThumbnail, makeAvatar, EMOTE_ORDER } from './lib/avatar.js';
import { updateSky, updateAutoSystems, skyArgs } from './lib/sky.js';
import { setSkyArgsSource, entities, buildsPending, avatarMounts } from './lib/world.js';
import { foldParity } from './lib/parity.js';
import { initModelsRealizer, reconcileModels, residencyDebug, setResidencyFocus, drainPromoteTail } from './lib/realize/models.js';
import { initEnvironmentRealizer } from './lib/realize/environment.js';
import { initSocialRealizer } from './lib/realize/social.js';
import { initCauses } from './lib/realize/causes.js';
// side-effecting: the `particles` component's host wires itself to the comp
// and entity buses on import (it has no boot step of its own)
import './lib/emitters.js';
import { tickMotion } from './lib/motion.js';
import {
  myState, updateMe, updateSpectator, setCamYaw, setPosture, togglePhotoMode,
} from './lib/controller.js';
import { remotes, updateRemotes, updateGaze } from './lib/remotes.js';
import {
  net, connect, initIdentity, loginUrl, wireNet, sendVerb, sendPose, sendWhisper, sendTyping,
} from './lib/net.js';
import { initPalette, updateBuild, toggleEditMode, isEditing } from './lib/build.js';
import { initConjure } from './lib/conjure.js';
import { initVoice } from './lib/voice.js';
import './lib/mictoggle.js'; // mic + headphone toggles beside the HUD, both off by default
import { initAudioPanel } from './lib/audiopanel.js';
import { initSceneGraph } from './lib/scenegraph.js';
import {
  toast, setHint, flashHint, buildHelp, toggleHelp,
  openDoor, toggleRoster, initRoster, initDock, panelFrame,
} from './lib/ui.js';
import { initDebug, updateDebug, toggleDebug } from './lib/debug.js';
import { dragSim, updateBodyDrag, dragState } from './lib/bodydrag.js';
import { initChat, logChat } from './lib/chat.js';
import { bodyEngine, setBodyEngine, listBodyEngines } from './lib/bodysim.js';
import { initPhysObj, tickPhysObj, leaseApi } from './lib/physobj.js';
import { initBodyDrag, updateBodyDrag, beingDragged, revokeDragged, dragState } from './lib/bodydrag.js';
import { initPhysObj, tickPhysObj, kick, leaseApi } from './lib/physobj.js';
>>>>>>> origin/main
import { initMods, tickMods, modsApi } from './lib/mods.js';
import { initBoot, markPhase, finishBoot, bootDone } from './lib/boot.js';
import { protoStats } from './lib/assets.js';
import { grassTiles } from './lib/terrain.js';
import { warmStats } from './lib/warmqueue.js';
import { laneStats as schedLaneStats } from './lib/scheduler.js';
import { laneStats as loadLaneStats } from './lib/loadwork.js';
import { colliderCacheStats } from './lib/colliders.js';
import { governPerformance, governorDebug, whenCalm } from './lib/governor.js';
import { registerSystem, startFrame, frameDebug } from './lib/frame.js';
import { perf } from './lib/perf.js';
import { paintHud } from './lib/hud.js';
import { updateMaterials, materialsDebug } from './lib/materials.js';
import { updateRig, rigDebug } from './lib/lightrig.js';
import { startPrefetch } from './lib/prefetch.js';
import {
  getMe, setMe, getMyAvatarPath, getMyAvatarName, resolveMyAvatarPath,
  rosterLazy, chooseAvatar,
} from './lib/mybody.js';
import {
  initLocalBody, isDowned, activeRagdoll, goLimp, getUp,
  stepRagdoll, updateMountedMe, updateSeatHint,
} from './lib/localbody.js';
import { posable, pushable, setPosable, setPushable } from './lib/consent.js';
import { updateVoiceMouths } from './lib/voicemouths.js';
import { initEmoteBar } from './lib/emotebar.js';
import { initCommands, saveScreenshot } from './lib/commands/handlers.js';

// (Crash breadcrumbs live in lib/bc.js now; the frame loop stamps each
// system's name as it runs. avatar.js still reads globalThis.__ewBC.)

if (CONFIG.params.has('mintthumbs')) {
  // ?mintthumbs — seed the roster's portraits, then stop (lib/mint.js owns
  // the why and the how). The else below is the entire normal boot.
  await (await import('./lib/mint.js')).mintThumbnails();
} else {

const isViewer = CONFIG.spectate || CONFIG.renderer;

// ---------------------------------------------------------------- lighting
// The sun shadow's config and camera-following frustum live in the light
// rig (lightrig.js §12.5) — set at module init, before the first compile,
// because shadowMap enabled/type are pipeline-shape.

setSkyArgsSource(skyArgs);
setResidencyFocus(() => myState?.pos ?? null);   // the body anchors residency too (§13.3)
// The realizers project folded state into the scene. Wired before connect()
// so the hydrated event of the very first snapshot finds them listening;
// causes.js takes the fold-inert live verbs off the 'live-entry' bus.
initModelsRealizer();
initEnvironmentRealizer();
initSocialRealizer();
initCauses();

// ---------------------------------------------------------------- boot

initBoot({ world: CONFIG.world, name: CONFIG.name });
buildHelp();
initChat({
  send: (text) => sendVerb('say', { text }),
  whisper: sendWhisper,
  typing: (to) => { sendTyping(to); getMe()?.setTyping(); },
  people,
});
initRoster(people);
initEmoteBar();
initDock([
  { id: 'chat', label: '💬' },
  { id: 'world', label: '🧱' },
  { id: 'who', label: '👥' },
  { id: 'emotes', label: '👋' },
  { id: 'debug', label: '🐞' },
]);
initDebug({
  // the body in your HAND wins over your own — that is the one being worked on
  ragdoll: () => dragSim() ?? activeRagdoll(),
  downed: () => !!dragSim() || isDowned(),
  dragging: () => !!dragSim(),
  fps: () => perf.fps,
  perf: () => perf,          // fps + frame ms + worst-of-last-second
  bill: frameDebug,          // per-system EWMA ms — where the frame goes
  // drop again from where you stand, so a shape can be reproduced back to back
  reLimp: () => { if (isDowned()) getUp(); goLimp(); },
});
// Verified identity resolves BEFORE anything reads CONFIG.name — otherwise the
// door panel and the local nameplate greet a stale localStorage name while the
// server (correctly) calls this person by their Discord name.
await initIdentity();

if (isViewer) {
  panelFrame().hide();
  markPhase('body', 1);
  start();
} else {
  // The front door: ask once for a name and a body, remember, never ask again.
  // A person handed a bare link used to become `guest-a1b2` in the default body
  // with no way to change either and no idea what the keys were.
  const firstRun = !CONFIG.params.has('name') && localStorage.getItem('ew-name-set') !== '1';
  if (firstRun) {
    // the door is already an interactive pause — its roster fetch is lazy,
    // and the choice is cached so the NEXT boot needs no fetch at all
    rosterLazy().then((roster) => openDoor({
      roster,
      needsKey: CONFIG.params.has('needkey'),
      login: loginUrl(),
      onEnter: ({ avatar, avatarName }) => {
        if (avatar) chooseAvatar(avatar, avatarName, { remember: true });
        start();
      },
    }));
  } else start();
}

// A rejected door key re-opens the door with a key field instead of retrying
// into a wall forever.
bus.on('bad-key', () => {
  toast('that door key was refused', 'err', 20000);
  rosterLazy().then((roster) => openDoor({
    roster, needsKey: true, login: loginUrl(),
    onEnter: ({ avatar, avatarName }) => {
      if (avatar) chooseAvatar(avatar, avatarName);
      connect();
    },
  }));
});

function start() {
  connect();
  initPalette();
  initConjure();   // the orrery panel — prompt → your pick of images → mesh → world
  initVoice(CONFIG.name);
  initAudioPanel();   // 🔊 categories: voices / world / TTS + consent rows
  initSceneGraph();   // 🌳 the world as a tree + 📜 the scripts that animate it
  setHint('<kbd>WASD</kbd> move · <kbd>Enter</kbd> chat · <kbd>B</kbd> build · <kbd>?</kbd> help');

  if (!isViewer) {
    resolveMyAvatarPath()
      .then((path) => makeAvatar(CONFIG.name, path, { urgent: true })) // your body skips the load queue
      .then((av) => {
        setMe(av);
        markPhase('body', 1);
        // Contribute a portrait of this body so the next person picks from
        // faces instead of filenames. Deferred behind the governor's calm
        // signal — it costs an offscreen render-target compile burst, and the
        // old t+4s wall clock dropped that into the middle of the boot storm
        // (§16.1g). Calm = 5 smooth seconds with no load work in flight.
        whenCalm().then(() => contributeThumbnail(getMyAvatarName(), av.vrm, CONFIG.token));
      })
      .catch((e) => { markPhase('body', 1); report('avatar', e); });
  }
}

wireNet({
  myAvatarPath: () => getMyAvatarPath(),   // a bare name: the server resolves
  myState,
  me: () => getMe(),
  onRestore: (r) => {
    myState.pos.set(r.p[0], r.p[1] ?? 0, r.p[2]);
    myState.yaw = r.yaw ?? 0;
    setCamYaw(myState.yaw + Math.PI); // camera behind you, facing your way
    if (r.clip === 'sit' || r.clip === 'sitchair' || r.clip === 'lie') {
      setPosture(r.clip === 'lie' ? 'lie' : 'sit');
    }
    // an enacted pose is authored content — wake holding it, like the spot
    // you stood on. It rides the next presence packet, so everyone sees it.
    // EXCEPT a remembered ragdoll frame (pre-sanitizer entries): that is
    // wreckage, not authorship — wake standing instead of hung mid-tumble.
    if (r.clip === 'ragdoll') { myState.pos.y = 0; return; }
    if (r.pose) myState.pose = r.pose;
  },
  onSnapshotDone: () => {},
});

bus.on('sky-degraded', ({ msg }) => toast(msg, 'warn', 12000));

// ---------------------------------------------------------------- my body
// The avatar swap + avatar-updated wiring rides mybody.js's import; the
// physics of being a body here (ragdoll, seats, drag, pins, shoves) is
// localbody.js, handed logChat instead of importing chat (§14.2).

initPhysObj({ myPos: () => myState.pos });
initMods();   // 🧩 runtime client scripts: local trusted mods + world offers
initLocalBody({ logChat });
initCommands();   // the /command surface (lib/commands/) + its bus subscriptions

// ---------------------------------------------------------------- keys

bus.on('key', (e) => {
  if (e.code === 'Slash' && e.shiftKey) { toggleHelp(); return; }
  if (e.code === 'KeyH' && !isEditing()) { toggleHelp(); return; }
  if (e.code === 'Tab') { e.preventDefault(); toggleRoster(); return; }
  if (e.code === 'KeyB') { toggleEditMode(); return; }
  if (e.code === 'KeyP') { togglePhotoMode(); return; }
  if (e.code === 'F1') { e.preventDefault(); document.body.classList.toggle('photo'); return; }
  if (e.code === 'F2') { e.preventDefault(); saveScreenshot(); return; }
  if (e.code === 'F3') { e.preventDefault(); toggleDebug(); return; }
  if (e.code === 'KeyR' && !isEditing()) { isDowned() ? getUp() : goLimp(); return; }
  // any movement stands you back up
  if (isDowned() && ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) getUp();
  // emotes on the number row — the world is a performance space and there was
  // no way to wave at anyone
  const n = /^Digit([1-6])$/.exec(e.code);
  const me = getMe();
  if (n && me) {
    const name = EMOTE_ORDER[Number(n[1]) - 1];
    me.playEmote(name);
    myState.emote = name;
    flashHint(name);
  }
});

// ---------------------------------------------------------------- roster

function people() {
  const list = [{ id: CONFIG.name, me: true, dist: null }];
  for (const r of remotes.values()) {
    list.push({
      id: r.id, me: false, agent: !!r.agent,
      dist: r.avatar ? r.avatar.root.position.distanceTo(myState.pos) : null,
    });
  }
  return list;
}

// ---------------------------------------------------------------- readiness
// "Ready" is not "the page loaded" — it's the moment there is something to
// stand in: your body exists, the log has been folded, and no heavy build
// (terrain, grass, the sky's first bake) is still running. Dropping someone
// into a dark grid the instant the socket opens is how the old boot felt
// instantaneous and looked broken.

let hydrated = false;
bus.on('hydrated', () => { hydrated = true; checkReady(); });

// An empty world is indistinguishable from a broken one: no ground, no sky,
// no objects, no explanation. That is what a mistyped world name gets you,
// and it is the worst possible first impression because everything is working
// exactly as designed.
bus.on('hydrated', () => {
  if (entities.size > 0) return;
  const named = CONFIG.params.has('world');
  logChat('*', named
    ? `"${CONFIG.world}" is empty — nothing has ever been built here.`
    : `you are in "${CONFIG.world}", which is empty. Add ?world=<name> to the link to go somewhere else.`);
  logChat('*', 'press B to start building, or ? for the controls.');
  toast(`"${CONFIG.world}" is an empty world — press B to build in it`, 'warn', 14000);
});
bus.on('build-queue', checkReady);

function checkReady() {
  if (bootDone()) return;
  const bodyReady = isViewer || !!getMe();
  if (!bodyReady || !hydrated || buildsPending() > 0) return;
  // one frame with everything in place before the curtain lifts
  requestAnimationFrame(() => requestAnimationFrame(() => finishBoot('ready')));
}

// A world with no entities drains its build queue before anything subscribes,
// so poll as a backstop rather than relying on an edge that may never fire.
const readyPoll = setInterval(() => {
  if (bootDone()) { clearInterval(readyPoll); return; }
  checkReady();
}, 400);

// ---------------------------------------------------------------- frame loop
// The loop itself lives in lib/frame.js (§14.2 6b); this is the LIST — the
// registration order IS the execution order, and it encodes the constraints
// §14.1 documents: motion before remotes, sky → materials → rig,
// voice-mouths before the avatar update, bodydrag before remotes, gaze
// after, send-pose after every myState writer, render last. Each system is
// timed (EW.frame() prints the bill) and the governor may stride cosmetic
// ones. The governor + HUD ride the 1Hz pulse, registered last.

registerSystem('autos', (dt, t) => updateAutoSystems(t));       // grass wind, particles
registerSystem('motion', () => tickMotion());                   // the world's moving parts
registerSystem('sky', (dt, t, now) => updateSky(now, t));
registerSystem('materials', (dt, t, now) => updateMaterials(now)); // weather → uniforms
registerSystem('rig', (dt, t, now) => updateRig(now));          // light slots follow requests
registerSystem('me-drive', (dt) => {
  if (CONFIG.renderer) { /* camera is driven per snap request */ }
  else if (CONFIG.spectate) updateSpectator(dt, CONFIG.follow ? remotes.get(CONFIG.follow) : null);
  else if (isDowned()) stepRagdoll(dt);     // the controller yields while limp
  else if (avatarMounts.has(CONFIG.name)) updateMountedMe(dt);  // seated: derived, not driven
  else updateMe(dt, getMe());
  updateSeatHint(dt);            // "X — sit" while a declared seat is in reach
});
registerSystem('held-pose', () => {
  // my own held pose: apply on change so I see what everyone else sees of
  // me. While downed the ragdoll owns setPose directly, so skip this path.
  const me = getMe();
  if (!isDowned() && me && myState.pose !== me._poseSig) {
    me._poseSig = myState.pose;
    if (myState.pose) me.setPose(myState.pose); else me.clearPose();
  }
});
registerSystem('me-update', (dt, t, now) => {
  updateVoiceMouths(now);        // BEFORE the avatar update that consumes it
  getMe()?.update(dt, now);
});
registerSystem('bodydrag', (dt, t, now) => updateBodyDrag(dt, now)); // before remotes:
                                 // the takeover pose lands in this frame's avatar.update
registerSystem('physobj', (dt, t, now) => tickPhysObj(dt, now)); // entity leases I hold
registerSystem('mods', (dt, t, now) => tickMods(dt, now));       // 🧩 runtime scripts
registerSystem('remotes', (dt, t, now) => updateRemotes(dt, now));
registerSystem('gaze', (dt, t, now) => updateGaze(myState.pos, getMe(), CONFIG.name, now));
registerSystem('build', () => updateBuild());
registerSystem('promote-tail', () => drainPromoteTail());        // §16.2.C: promote
                                 // boulders (colliders/lamps/casters/mount
                                 // re-checks) land ≤~4ms/frame, not six in one;
                                 // before 'debug' so F3 sees same-frame colliders
registerSystem('debug', (dt, t, now) => updateDebug(now));       // F3 wireframes
registerSystem('send-pose', (dt, t, now) => sendPose(now));
registerSystem('render', () => renderer.render(scene, camera));
let _pulseAt = 0;
registerSystem('pulse', (dt, t, now) => {
  if (now - _pulseAt < 1000) return;
  _pulseAt = now;
  governPerformance(perf.fps);
  paintHud();
});

startFrame();   // explicit — the loop starts only after identity resolved

// Idle bandwidth streams the rest of the library into the HTTP cache — fire
// and forget; it waits out the boot and yields to every real load on its own
// (stats live at __ewPrefetch, opt out with ?prefetch=0).
startPrefetch().catch((e) => report('prefetch', e));

// ---------------------------------------------------------------- debug

globalThis.EW = {
  me: () => getMe(), remotes, entities, myState, THREE, net, scene, camera, renderer, bus,
  skyArgs, sendVerb, setPosable, get posable() { return posable(); },
  setPushable, get pushable() { return pushable(); }, dragState,
  lease: leaseApi,   // the entity-lease surface runtime plugins script against
  mods: modsApi,     // load/run/offer runtime client scripts (🧩)
  bodysim: { engine: bodyEngine, setEngine: setBodyEngine, list: listBodyEngines },  // swappable body physics
  foldParity,        // shadow-mode drift probe (TEL0S_NOTES §11.6)
  reconcileModels,   // force a full realizer pass (idempotent — §11.4)
  materials: materialsDebug,   // factory counters + live weather uniforms (§12.3)
  lightrig: rigDebug,          // slot pool + request table (§12.4)
  governor: governorDebug,     // the two-way lever ladder (§12.6)
  residency: residencyDebug,   // real/stand-in/loading counts + sweep stats (§13.3)
  gpu: () => ({ ...renderer.info.memory, ...protoStats() }),   // bytes + proto/byte tiers
  frame: frameDebug,           // per-system rolling ms + strides (§14.2 6b)
  grass: grassTiles,           // tile-level draw truth (§13.2, landed 8e)
  warm: warmStats,             // the conductor's queue (§16.2.A)
  lanes: () => ({ sched: schedLaneStats(), load: loadLaneStats() }),  // queue depths vs caps
  colliderCache: colliderCacheStats,   // per-lib shared BVH/lie bytes (§16.2.C)
};

} // end of the normal-boot branch (?mintthumbs takes the path above)
