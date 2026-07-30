// eidoverse-worlds browser client.
//
// Two planes: the world log (verbs, ordered, replayed on join) and presence
// (intent state at ~15Hz, interpolated). The client owns its own avatar; the
// server sequences and relays. This file is boot and the frame loop — every
// system lives in lib/.

import {
  THREE, scene, camera, renderer, sun, canvas, CONFIG, BASE_PIXEL_RATIO,
  bus, report, setName,
} from './lib/core.js';
import { contributeThumbnail, makeAvatar, EMOTE_ORDER, EMOTES } from './lib/avatar.js';
import { updateSky, updateAutoSystems, skyArgs, skyImpl,
  CLOUD_QUALITY, getCloudQuality, setCloudQuality } from './lib/sky.js';
import { setSkyArgsSource, entities, liveEntities, buildsPending, roleOf, worldHasOwner } from './lib/world.js';
import {
  myState, updateMe, updateFollowCamera, updateSpectator, setCamYaw, setPosture,
  togglePhotoMode, setCameraCollisionTargets, keys,
} from './lib/controller.js';
import {
  remotes, updateRemotes, updateGaze, noteSpeaking, setLodBias,
} from './lib/remotes.js';
import { net, connect, initIdentity, loginUrl, wireNet, sendVerb, sendPose, sendWhisper, sendTyping } from './lib/net.js';
import {
  initPalette, updateBuild, wireAvatarSwitch, setMyAvatarPath, toggleBuildMenu,
  hasGhost, hasSelection, toggleEditMode, isEditing,
} from './lib/build.js';
import { initConjure } from './lib/conjure.js';
import {
  toast, setHud, setHint, flashHint, buildHelp, toggleHelp,
  openDoor, toggleRoster, initRoster, initDock, paintRoster, panelFrame, el,
} from './lib/ui.js';
import { initChat, logChat, chat, openConvo } from './lib/chat.js';
import { makeFrame } from './lib/frames.js';
import { Ragdoll } from './lib/ragdoll.js';
import { shedALight, litCount } from './lib/lights.js';
import { initBoot, markPhase, finishBoot, bootDone } from './lib/boot.js';
import { startPrefetch } from './lib/prefetch.js';

// ---------------------------------------------------------------- identity

const roster = await fetch('/avatars').then((r) => r.json()).catch(() => []);
const want = CONFIG.params.get('avatar') || localStorage.getItem('ew-avatar-name') || 'claude';
let myAvatarPath = want.includes('/')
  ? want
  : (roster.find((a) => a.name === want)?.path ?? 'eidoverse/assets/vrms/claude.vrm');
let myAvatarName = want.includes('/') ? want.split('/').pop().replace(/\.vrm.*$/, '') : want;
setMyAvatarPath(myAvatarPath);

let me = null;
const isViewer = CONFIG.spectate || CONFIG.renderer;

// ---------------------------------------------------------------- minting
// ?mintthumbs — render a portrait for every body on the roster and post them
// back, then stop. Contribution-as-you-wear keeps the roster fresh, but it
// cannot SEED it: a first visitor met one portrait and seventeen blank cards.
// This is the one-time (and after-adding-VRMs) pass that gives it a baseline.

if (CONFIG.params.has('mintthumbs')) {
  const { loadVRM } = await import('./lib/assets.js');
  const list = await fetch('/avatars').then((r) => r.json());
  const out = [];
  for (const a of list) {
    try {
      const vrm = await loadVRM(a.path);
      await contributeThumbnail(a.name, vrm, CONFIG.token, { force: true });
      out.push(`ok ${a.name}`);
    } catch (e) { out.push(`FAIL ${a.name}: ${e.message}`); }
    console.log(`[mint] ${out[out.length - 1]}  (${out.length}/${list.length})`);
  }
  console.log(`[mint] done ${out.filter((s) => s.startsWith('ok')).length}/${list.length}`);
  globalThis.__mintDone = out;
} else {

// ---------------------------------------------------------------- lighting
// No shadows at all meant everything floated: objects had no contact with the
// ground and a jump had no readable height. One cascade off the sun plus the
// per-avatar blob shadows is the biggest visual-quality-per-line change here.

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 160;
const S = 46;
Object.assign(sun.shadow.camera, { left: -S, right: S, top: S, bottom: -S });
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.02;
sun.shadow.camera.updateProjectionMatrix();

setSkyArgsSource(skyArgs);
setCameraCollisionTargets(liveEntities);

// ---------------------------------------------------------------- boot

initBoot({ world: CONFIG.world, name: CONFIG.name });
buildHelp();
initChat({
  send: (text) => sendVerb('say', { text }),
  whisper: sendWhisper,
  typing: sendTyping,
  people,
});
initRoster(people);
initEmoteBar();
initDock([
  { id: 'chat', label: '💬' },
  { id: 'world', label: '🧱' },
  { id: 'who', label: '👥' },
  { id: 'emotes', label: '👋' },
]);

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
    openDoor({
      roster,
      needsKey: CONFIG.params.has('needkey'),
      login: loginUrl(),
      onEnter: ({ avatar, avatarName }) => {
        if (avatar) { myAvatarPath = avatar; myAvatarName = avatarName; setMyAvatarPath(avatar); }
        start();
      },
    });
  } else start();
}

// A rejected door key re-opens the door with a key field instead of retrying
// into a wall forever.
bus.on('bad-key', () => {
  toast('that door key was refused', 'err', 20000);
  openDoor({
    roster, needsKey: true, login: loginUrl(),
    onEnter: ({ avatar, avatarName }) => {
      if (avatar) { myAvatarPath = avatar; myAvatarName = avatarName; setMyAvatarPath(avatar); }
      connect();
    },
  });
});

function start() {
  connect();
  initPalette();
  initConjure();   // the orrery panel — prompt → your pick of images → mesh → world
  setHint('<kbd>WASD</kbd> move · <kbd>Enter</kbd> chat · <kbd>B</kbd> build · <kbd>?</kbd> help');

  if (!isViewer) {
    makeAvatar(CONFIG.name, myAvatarPath)
      .then((av) => {
        me = av;
        markPhase('body', 1);
        // Contribute a portrait of this body so the next person picks from
        // faces instead of filenames. Deferred — it costs an offscreen render,
        // and the first seconds belong to getting the person into the world.
        setTimeout(() => contributeThumbnail(myAvatarName, av.vrm, CONFIG.token), 4000);
      })
      .catch((e) => { markPhase('body', 1); report('avatar', e); });
  }
}

wireNet({
  myAvatarPath: () => myAvatarPath,
  myState,
  me: () => me,
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

// ---------------------------------------------------------------- avatar swap

wireAvatarSwitch(async (path, name) => {
  if (path === myAvatarPath) return;
  toast(`changing into ${name}…`, 'info', 3000);
  try {
    const next = await makeAvatar(CONFIG.name, path); // build before shedding the old
    me?.dispose();
    me = next;
    myAvatarPath = path;
    myAvatarName = name;
    setMyAvatarPath(path);
    localStorage.setItem('ew-avatar-name', name);
    contributeThumbnail(name, next.vrm, CONFIG.token);
    if (net.joined) {
      // re-announce: everyone rebuilds my remote with the new body
      const { sendJoin } = await import('./lib/net.js');
      sendJoin();
    }
  } catch (e) { report(`avatar switch ${name}`, e); }
});

bus.on('sky-degraded', ({ msg }) => toast(msg, 'warn', 12000));

bus.on('avatar-updated', ({ path, name, fresh }) => {
  if (myAvatarPath.split('?')[0] === path) {
    toast(`your body "${name}" was updated — refreshing`, 'info');
    myAvatarPath = fresh;
    makeAvatar(CONFIG.name, fresh).then((av) => { me?.dispose(); me = av; }).catch((e) => report('reload avatar', e));
  }
});

// ---------------------------------------------------------------- speech

// Ragdoll — owner-simulated, presence-streamed, captured to a held pose.
//
// Only this client simulates its own body; the result rides the pose field
// like any other pose, so remotes need no ragdoll code at all. On settle the
// final bones stay as a held pose (lastPose), so a reconnect or a late joiner
// gets the settled RESULT, not a replay of the flop.
let ragdoll = null;
let downed = false;

function goLimp(impulse = null) {
  if (!me || downed) return;
  downed = true;
  ragdoll = new Ragdoll(me, impulse);
  myState.clip = 'ragdoll';
  flashHint('limp — move to get up');
}
function getUp() {
  if (!downed) return;
  downed = false; ragdoll = null;
  myState.pose = null; me?.clearPose();
  myState.clip = 'idle';
  // resume from where the body ended up
  myState.pos.copy(me.root.position);
  myState.pos.y = 0;
}
function stepRagdoll(dt) {
  if (ragdoll) {
    const pose = ragdoll.step(dt);
    if (pose) myState.pose = pose;               // stream it through presence
    myState.pos.copy(me.root.position);          // streamed root tracks the sim
    if (ragdoll.done) { myState.pose = ragdoll.finalPose; ragdoll = null; }
  }
  // The camera lives in updateMe, which we skip while limp — so drive it here
  // too, or it freezes on the frame you fell (which is what it did).
  if (me) updateFollowCamera(dt, me);
}

// Being posed by someone else.
//
// A puppet is an input to MY body, applied by MY client — never a pose forced
// on me from outside. So it goes through the same presence path as my own
// movement: a pose becomes my held pose (and broadcasts), an animation I play
// and re-send as mine. Humans opt in (a director staging a scene is welcome; a
// stranger yanking your limbs is not); agents accept by default, since being
// directed is the point of a performer.
let posable = localStorage.getItem('ew-posable') === '1';
function setPosable(v) { posable = v; localStorage.setItem('ew-posable', v ? '1' : '0'); }
bus.on('puppet', ({ by, pose, anim, ragdoll: rag }) => {
  if (!posable) {
    toast(`${by} tried to pose you — enable it in settings to allow`, 'warn', 6000);
    return;
  }
  // A ragdoll request runs the sim on MY body — I own it, so I simulate and
  // stream. That is the sync guarantee: the requester never simulates me.
  if (rag) { goLimp(); flashHint(`${by} knocked you over`); return; }
  if (pose) { myState.pose = pose; flashHint(`${by} posed you`); }
  if (anim) { me?.playAnimation(anim); sendAnim(anim); }
});

bus.on('speech', ({ actor, text }) => {
  const av = actor === CONFIG.name ? me : remotes.get(actor)?.avatar;
  av?.say(text);
  if (actor !== CONFIG.name) noteSpeaking(actor, Math.min(12000, 3000 + text.length * 30));
});

// ---------------------------------------------------------------- keys

bus.on('key', (e) => {
  if (e.code === 'Slash' && e.shiftKey) { toggleHelp(); return; }
  if (e.code === 'KeyH' && !isEditing()) { toggleHelp(); return; }
  if (e.code === 'Tab') { e.preventDefault(); toggleRoster(); return; }
  if (e.code === 'KeyB') { toggleEditMode(); return; }
  if (e.code === 'KeyP') { togglePhotoMode(); return; }
  if (e.code === 'F1') { e.preventDefault(); document.body.classList.toggle('photo'); return; }
  if (e.code === 'F2') { e.preventDefault(); saveScreenshot(); return; }
  if (e.code === 'KeyR' && !isEditing()) { downed ? getUp() : goLimp(); return; }
  // any movement stands you back up
  if (downed && ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) getUp();
  // emotes on the number row — the world is a performance space and there was
  // no way to wave at anyone
  const n = /^Digit([1-6])$/.exec(e.code);
  if (n && me) {
    const name = EMOTE_ORDER[Number(n[1]) - 1];
    me.playEmote(name);
    myState.emote = name;
    flashHint(name);
  }
});

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
// ---------------------------------------------------------------- /commands

bus.on('your-rights', (r) => {
  // only worth a line when the world actually restricts — open worlds stay silent
  if (!r.open && r.role !== 'owner') {
    logChat('*', `this world has an owner — you are a ${r.role}${r.gen ? ' +gen' : ''} here`);
  }
});

bus.on('command', ({ cmd, arg }) => {
  if (cmd === 'help') return toggleHelp();
  if (cmd === 'role') {
    const who = (arg || '').trim() || CONFIG.name;
    if (who === CONFIG.name && !worldHasOwner() && net.myRights?.open !== false) {
      return logChat('*', 'this world is open — everyone here can build');
    }
    const r = who === CONFIG.name ? (roleOf(who) ?? net.myRights) : roleOf(who);
    if (!r) return logChat('*', `${who} holds no role here (visitor)`);
    return logChat('*', `${who}: ${r.role}${r.gen ? ' +gen' : ''}`);
  }
  if (cmd === 'grant') {
    // /grant <name> owner|builder|visitor [+gen|-gen] — server enforces owner-only
    const parts = (arg || '').trim().split(/\s+/).filter(Boolean);
    const id = parts[0];
    const role = parts.find((p) => ['owner', 'builder', 'visitor'].includes(p.toLowerCase()))?.toLowerCase();
    const genFlag = parts.find((p) => p === '+gen' || p === '-gen');
    if (!id || (!role && !genFlag)) {
      return logChat('*', 'usage: /grant <name> owner|builder|visitor [+gen|-gen]');
    }
    sendVerb('grant', { id, ...(role ? { role } : {}), ...(genFlag ? { gen: genFlag === '+gen' } : {}) });
    return;
  }
  if (cmd === 'sit') { setPosture('sit'); return; }
  if (cmd === 'emote') {
    const name = (arg || '').trim().toLowerCase();
    if (!EMOTE_ORDER.includes(name) && !Object.keys(EMOTES).includes(name)) {
      return logChat('*', `emotes: ${Object.keys(EMOTES).join(', ')}`);
    }
    me?.playEmote(name);
    myState.emote = name;
    return;
  }
  if (cmd === 'goto') {
    const target = [...remotes.values()].find((r) =>
      r.id.toLowerCase() === (arg || '').trim().toLowerCase());
    if (!target?.avatar) return logChat('*', `no one here called "${arg}"`);
    // walk-to is the agent verb; for a person it's a hint plus a marker
    const p = target.avatar.root.position;
    flashHint(`${target.id} is ${p.distanceTo(myState.pos).toFixed(0)}m away, bearing ${bearingTo(p)}`);
    return;
  }
});

// ---------------------------------------------------------------- emotes
// They were number keys and a slash command — invisible unless you read the
// help. On a performance platform the gestures should be somewhere you can
// see them.

function initEmoteBar() {
  const f = makeFrame('emotes', {
    title: 'emotes', x: -252, y: -10, w: 232, h: 44, minW: 120, minH: 34, hidden: true,
  });
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex; flex-wrap:wrap; gap:4px; padding:7px;';
  const ICON = { wave: '👋', cheer: '🙌', dance: '💃', point: '👉', salute: '🫡', clap: '👏' };
  EMOTE_ORDER.forEach((name, i) => {
    const b = document.createElement('button');
    b.textContent = `${ICON[name] ?? '✨'}`;
    b.title = `${name}  (${i + 1})`;
    b.onclick = () => { me?.playEmote(name); myState.emote = name; };
    wrap.appendChild(b);
  });
  f.body.appendChild(wrap);
  return f;
}

function bearingTo(p) {
  const a = Math.atan2(p.x - myState.pos.x, p.z - myState.pos.z);
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((a + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4)) % 8];
}

async function saveScreenshot() {
  try {
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `eidoverse-${CONFIG.world}-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    a.click();
    flashHint('saved');
  } catch (e) { report('screenshot', e); }
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
  const bodyReady = isViewer || !!me;
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

let last = performance.now();
let frames = 0, fpsAt = last, fps = 0;
let pixelRatio = BASE_PIXEL_RATIO;
let slowFor = 0;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  const t = now / 1000;
  globalThis._sceneTime = t;

  updateAutoSystems(t);          // grass wind, particles
  updateSky(now, t);

  if (CONFIG.renderer) { /* camera is driven per snap request */ }
  else if (CONFIG.spectate) updateSpectator(dt, CONFIG.follow ? remotes.get(CONFIG.follow) : null);
  else if (downed) stepRagdoll(dt);     // the controller yields while limp
  else updateMe(dt, me);

  // my own held pose: apply on change so I see what everyone else sees of me.
  // While downed the ragdoll owns setPose directly, so skip this path.
  if (!downed && me && myState.pose !== me._poseSig) {
    me._poseSig = myState.pose;
    if (myState.pose) me.setPose(myState.pose); else me.clearPose();
  }
  me?.update(dt, now);
  updateRemotes(dt, now);
  updateGaze(myState.pos, me, CONFIG.name, now);
  updateBuild();
  sendPose(now);

  renderer.render(scene, camera);

  frames++;
  if (now - fpsAt > 1000) {
    fps = frames; frames = 0; fpsAt = now;
    governPerformance(fps);
    paintHud();
  }
  requestAnimationFrame(frame);
}

// Shed pixels before shedding frames; shed animation detail before pixels.
// Clouds come off before pixels do. The volumetric march measured 40fps at
// high vs 60 at medium under identical GPU-bound load — a bigger lever than
// resolution, and a slightly plainer sky reads better than a blurry whole
// world. Stepped at most once every few seconds so a hitch cannot cascade
// the setting all the way to 'off'.
let lastLightDrop = 0;
function shedLight() {
  const now = performance.now();
  if (now - lastLightDrop < 6000 || litCount() === 0) return false;
  lastLightDrop = now;
  if (!shedALight()) return false;
  toast('turned a light down to keep the frame rate — it still glows', 'warn', 6000);
  return true;
}
let lastCloudDrop = 0;
function shedClouds(now) {
  if (now - lastCloudDrop < 8000) return false;
  const i = CLOUD_QUALITY.indexOf(getCloudQuality());
  if (i <= 0) return false;
  lastCloudDrop = now;
  const next = CLOUD_QUALITY[i - 1];
  setCloudQuality(next);
  toast(`clouds turned down to "${next}" to keep the frame rate — change it in the sky panel`, 'warn', 8000);
  return true;
}

function governPerformance(f) {
  if (f > 0 && f < 26) {
    slowFor++;
    if (slowFor > 2 && shedClouds(performance.now())) { /* clouds first */ }
    else if (slowFor > 2 && shedLight()) { /* then a light — point lights are costly */ }
    else if (slowFor > 2 && pixelRatio > 0.7) {
      pixelRatio = Math.max(0.7, pixelRatio - 0.25);
      renderer.setPixelRatio(pixelRatio);
    } else if (slowFor > 4) {
      setLodBias(2);              // far bodies animate at half rate again
      if (sun.shadow.mapSize.width > 1024) {
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.map?.dispose();
        sun.shadow.map = null;
      }
    }
  } else if (f > 52) {
    slowFor = 0;
    setLodBias(1);
    if (pixelRatio < BASE_PIXEL_RATIO) {
      pixelRatio = Math.min(BASE_PIXEL_RATIO, pixelRatio + 0.125);
      renderer.setPixelRatio(pixelRatio);
    }
  }
}

const statusDot = {
  live: '<span class="ok">●</span>', connecting: '<span>○</span>',
  retrying: '<span class="bad">●</span>', rejected: '<span class="bad">✕</span>',
};
function paintHud() {
  const n = remotes.size;
  setHud(
    `${statusDot[net.status] ?? ''} <b>${CONFIG.name}</b> @ ${CONFIG.world}   ` +
    `${fps}fps   ${n} other${n === 1 ? '' : 's'}` +
    (isEditing() ? '   <span class="edit">✎ editing</span>' : '') +
    (skyImpl() === 'skymesh' ? '   <span style="opacity:.6">basic sky</span>' : ''),
  );
}

requestAnimationFrame(frame);

// Idle bandwidth streams the rest of the library into the HTTP cache — fire
// and forget; it waits out the boot and yields to every real load on its own
// (stats live at __ewPrefetch, opt out with ?prefetch=0).
startPrefetch().catch((e) => report('prefetch', e));

// ---------------------------------------------------------------- debug

globalThis.EW = {
  me: () => me, remotes, entities, myState, THREE, net, scene, camera, renderer,
  skyArgs, sendVerb, setPosable, get posable() { return posable; },
};

} // end of the normal-boot branch (?mintthumbs takes the path above)
