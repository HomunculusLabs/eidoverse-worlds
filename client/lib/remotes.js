// remotes — everyone else's bodies.
//
// Presence is lossy and arrives at ~15Hz. Rendering it means answering "where
// was this body 100ms ago, between the two samples that bracket that moment" —
// not "snap to the newest thing that arrived". The old client lerped toward
// the latest sample with an exponential factor, which stutters under jitter and
// freezes-then-teleports under loss.

import { THREE, camera, scene, report, angleDelta } from './core.js';
import { makeAvatar } from './avatar.js';

export const remotes = new Map(); // id -> RemoteBody

const DEFAULT_AVATAR = 'eidoverse/assets/vrms/claude.vrm';
/** How far behind the newest sample we render. One frame of slack at 15Hz is
 *  66ms; 110 gives room for one dropped packet without a visible stall. */
const INTERP_MS = 110;
const BUF_MAX = 12;

// Server-to-local clock offset, smoothed. Frames carry the server's `t`.
let clockOffset = null;
export function noteServerTime(t) {
  if (typeof t !== 'number') return;
  const sample = t - performance.timeOrigin - performance.now();
  clockOffset = clockOffset === null ? sample : clockOffset * 0.92 + sample * 0.08;
}
const serverNow = () => performance.timeOrigin + performance.now() + (clockOffset ?? 0);

export async function ensureRemote(id, avatarPath, meta = {}) {
  const existing = remotes.get(id);
  if (existing) {
    if (meta.agent !== undefined) existing.agent = meta.agent;
    // same person, new body: rebuild (live avatar switching re-announces via join)
    if (avatarPath && !existing.loading && existing.avatarPath !== avatarPath) {
      remotes.delete(id);
      existing.avatar?.dispose();
    } else return existing;
  }
  const r = {
    id, avatar: null, avatarPath, loading: true, agent: !!meta.agent,
    buf: [],                 // [{ t, p:[x,y,z], yaw, speed, clip, pitch }]
    lastClip: 'idle',
    lodAcc: 0, lodTick: 0,
    speakingUntil: 0,
  };
  remotes.set(id, r);
  try {
    r.avatar = await makeAvatar(id, avatarPath || DEFAULT_AVATAR);
    if (!remotes.has(id)) { r.avatar.dispose(); return r; } // left while loading
    if (r.buf.length) applyImmediate(r);
  } catch (e) { report(`avatar ${id}`, e); }
  r.loading = false;
  return r;
}

export function dropRemote(id) {
  const r = remotes.get(id);
  remotes.delete(id);
  r?.avatar?.dispose();
}

/** Feed one presence sample. `t` is the server stamp when available. */
export function pushPose(id, pose, t) {
  const r = remotes.get(id);
  if (!r || !pose) return;
  const stamp = typeof t === 'number' ? t : serverNow();
  const last = r.buf[r.buf.length - 1];
  if (last && stamp <= last.t) return;    // out of order — drop
  r.buf.push({ t: stamp, ...pose });
  while (r.buf.length > BUF_MAX) r.buf.shift();
}

function applyImmediate(r) {
  const s = r.buf[r.buf.length - 1];
  if (!r.avatar || !s) return;
  r.avatar.root.position.set(...s.p);
  r.avatar.root.rotation.y = s.yaw ?? 0;
}

/** Presence extras that aren't position: the held pose (bones), emotes, and
 *  the locomotion clip. Applied from whichever sample is current, in BOTH the
 *  interpolated and single-sample paths so a late joiner isn't missing them. */
function applyPresenceExtras(r, s) {
  const poseSig = s.pose ? JSON.stringify(s.pose) : '';
  if (poseSig !== r.lastPoseSig) {
    r.lastPoseSig = poseSig;
    if (s.pose) r.avatar.setPose(s.pose); else r.avatar.clearPose();
  }
  const clip = s.clip ?? 'idle';
  if (s.emote && s.emote !== r.lastEmote) {
    r.lastEmote = s.emote;
    r.avatar.playEmote(s.emote);
  } else {
    if (clip !== r.lastClip) r.lastClip = clip;
    r.avatar.setClip(clip, s.speed ?? 0);
  }
}

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

// Camera-aware animation LOD: with a full stage (24 bodies) a midrange laptop
// cannot run 24 complete VRM updates (spring bones, expressions, look-at) every
// frame. Position interpolation stays per-frame (cheap, keeps motion glued);
// skeletal updates tick at 1×/2×/4× by distance, integrating accumulated dt so
// motion SPEED is unchanged — a far avatar animates at lower temporal
// resolution, not in slow motion.
const LOD_NEAR = 8, LOD_MID = 20;
export let lodBias = 1;                 // raised by the perf governor under load
export function setLodBias(v) { lodBias = v; }

export function updateRemotes(dt, now = performance.now()) {
  const renderAt = serverNow() - INTERP_MS;

  for (const r of remotes.values()) {
    if (!r.avatar) continue;
    const buf = r.buf;

    if (buf.length >= 2) {
      // find the pair bracketing renderAt
      let i = buf.length - 1;
      while (i > 0 && buf[i - 1].t > renderAt) i--;
      const b = buf[i], a = buf[i - 1] ?? b;
      const span = b.t - a.t;
      const k = span > 0 ? THREE.MathUtils.clamp((renderAt - a.t) / span, 0, 1) : 1;

      _a.set(...a.p); _b.set(...b.p);
      r.avatar.root.position.copy(_a).lerp(_b, k);
      r.avatar.root.rotation.y = a.yaw + angleDelta(a.yaw, b.yaw ?? a.yaw) * k;
      r.avatar.pitch = (a.pitch ?? 0) + ((b.pitch ?? 0) - (a.pitch ?? 0)) * k;
      // drop samples we've moved past, but always keep one behind renderAt
      while (buf.length > 2 && buf[1].t < renderAt - 400) buf.shift();
      applyPresenceExtras(r, b);
    } else if (buf.length === 1) {
      applyImmediate(r);
      // A late joiner with only the snapshot's single pose must still apply
      // its held bones — otherwise a body that fell before you arrived shows
      // as a STANDING figure sunk into the ground (the root lowers, the pose
      // never folds). This ran only in the interpolation branch before.
      applyPresenceExtras(r, buf[0]);
    }

    const d = r.avatar.root.position.distanceTo(camera.position);
    const every = Math.round((d < LOD_NEAR ? 1 : d < LOD_MID ? 2 : 4) * lodBias);
    r.lodAcc += dt;
    r.lodTick = (r.lodTick + 1) % Math.max(1, every);
    if (r.lodTick === 0) { r.avatar.update(r.lodAcc, now); r.lodAcc = 0; }
  }
}

/** Mark someone as currently speaking, so other bodies turn to look at them. */
export function noteSpeaking(id, ms = 4000) {
  const r = remotes.get(id);
  if (r) r.speakingUntil = performance.now() + ms;
}

/** Point every body at whatever currently deserves attention: the most recent
 *  speaker if there is one, otherwise the nearest other body. This is the
 *  cheapest presence win in the client — VRM ships a lookAt rig and nothing
 *  was ever aiming it, so every avatar had dead eyes. */
export function updateGaze(myPos, myAvatar, myName, now = performance.now()) {
  let speaker = null;
  for (const r of remotes.values()) {
    if (r.speakingUntil > now && r.avatar) {
      if (!speaker || r.speakingUntil > speaker.speakingUntil) speaker = r;
    }
  }

  const focusOf = (self) => {
    if (speaker && speaker !== self) {
      return _a.copy(speaker.avatar.root.position).setY(speaker.avatar.root.position.y + 1.5);
    }
    // nearest other body, including me
    let best = null, bestD = 9;
    const from = self ? self.avatar.root.position : myPos;
    if (self && myPos) {
      const d = from.distanceTo(myPos);
      if (d < bestD) { bestD = d; best = _a.copy(myPos).setY(myPos.y + 1.5); }
    }
    for (const o of remotes.values()) {
      if (o === self || !o.avatar) continue;
      const d = from.distanceTo(o.avatar.root.position);
      if (d < bestD) { bestD = d; best = _a.copy(o.avatar.root.position).setY(o.avatar.root.position.y + 1.5); }
    }
    return best;
  };

  for (const r of remotes.values()) {
    if (!r.avatar) continue;
    r.avatar.setGazeTarget(focusOf(r));
  }
  if (myAvatar) {
    const f = speaker ? _b.copy(speaker.avatar.root.position).setY(speaker.avatar.root.position.y + 1.5) : null;
    myAvatar.setGazeTarget(f);
  }
}

export function clearRemotes() {
  for (const r of remotes.values()) r.avatar?.dispose();
  remotes.clear();
}
