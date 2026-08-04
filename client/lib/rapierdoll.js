// rapierdoll — the articulated body engine. Same interface as Ragdoll
// (client/lib/ragdoll.js), different physics underneath: rigid segments with
// rotational inertia, fleet-measured joint limits, real contacts, and joint
// MOTORS — muscle tone, a body going limp rather than a power cut.
//
// Interface parity is the whole contract: constructor(avatar, lean, rest),
// step(dt) → sparse local-quat pose (and it drives the avatar directly),
// impulse(v), setPin(joint, target)/setPin(null), .pins/.pinned/.done/
// .finalPose/.p/.maxV, dispose(). Everything downstream — drag, nails,
// corpse-kicks, the presence stream, headless agents — cannot tell which
// engine produced the pose. That is the lease thesis applied to our own
// house physics: engines are interchangeable behind the wire.
//
// The spike (tools/rapier-spike.ts) validated the numbers: perf is a wash
// with the Verlet at fleet scale, settle is FASTER with tone, and bones
// cannot stretch by construction.

import { THREE } from './core.js';
import { heightAt } from './terrain.js';
import { colliders } from './colliders.js';

// loaded lazily by bodysim.js — a WASM module has an async init, and the
// Ragdoll interface is synchronous, so readiness is a precondition
let RAPIER = null;
export async function ensureRapier() {
  if (RAPIER) return true;
  try {
    const mod = await import('@dimforge/rapier3d-compat');
    RAPIER = mod.default ?? mod;
    await RAPIER.init();
    return true;
  } catch (e) {
    console.error('[rapierdoll] wasm init failed — verlet stays', e);
    return false;
  }
}
export const rapierReady = () => !!RAPIER;

// the game-standard body cut along our humanoid chain (spike-proven)
const SEGMENTS = [
  ['hips', 'spine'], ['spine', 'neck'], ['neck', 'head'],
  ['leftUpperArm', 'leftLowerArm'], ['leftLowerArm', 'leftHand'],
  ['rightUpperArm', 'rightLowerArm'], ['rightLowerArm', 'rightHand'],
  ['leftUpperLeg', 'leftLowerLeg'], ['leftLowerLeg', 'leftFoot'],
  ['rightUpperLeg', 'rightLowerLeg'], ['rightLowerLeg', 'rightFoot'],
];
const JOINTS_DEF = [
  { at: 'spine', parent: 'hips', child: 'spine', kind: 'spherical' },
  { at: 'neck', parent: 'spine', child: 'neck', kind: 'spherical' },
  { at: 'leftUpperArm', parent: 'spine', child: 'leftUpperArm', kind: 'spherical' },
  { at: 'rightUpperArm', parent: 'spine', child: 'rightUpperArm', kind: 'spherical' },
  { at: 'leftLowerArm', parent: 'leftUpperArm', child: 'leftLowerArm', kind: 'elbow' },
  { at: 'rightLowerArm', parent: 'rightUpperArm', child: 'rightLowerArm', kind: 'elbow' },
  { at: 'leftUpperLeg', parent: 'hips', child: 'leftUpperLeg', kind: 'spherical' },
  { at: 'rightUpperLeg', parent: 'hips', child: 'rightUpperLeg', kind: 'spherical' },
  { at: 'leftLowerLeg', parent: 'leftUpperLeg', child: 'leftLowerLeg', kind: 'knee' },
  { at: 'rightLowerLeg', parent: 'rightUpperLeg', child: 'rightLowerLeg', kind: 'knee' },
];
const RADIUS_FRAC = {
  'hips|spine': 1.0, 'spine|neck': 0.95, 'neck|head': 0.6,
  'leftUpperArm|leftLowerArm': 0.5, 'leftLowerArm|leftHand': 0.35,
  'rightUpperArm|rightLowerArm': 0.5, 'rightLowerArm|rightHand': 0.35,
  'leftUpperLeg|leftLowerLeg': 0.62, 'leftLowerLeg|leftFoot': 0.45,
  'rightUpperLeg|rightLowerLeg': 0.62, 'rightLowerLeg|rightFoot': 0.45,
};

const FIXED_DT = 1 / 60;
const MAX_FRAMES = 8;            // a hitch drops its backlog, never simulates a second at once
const SETTLE_V = 0.07;
const SETTLE_TIME = 0.45;
const DEADLINE = 8;
const TONE0 = 28;                // starting muscle tone (motor stiffness)
const TONE_DECAY = 0.82;         // per 0.1s — limp in ~1.5s

const _up = new THREE.Vector3(0, 1, 0);
const _q = new THREE.Quaternion();
const _qp = new THREE.Quaternion();
const _v = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

export class RapierRagdoll {
  constructor(avatar, lean = null, rest = null, seedVel = null) {
    this.avatar = avatar;
    this.done = false;
    this.pose = null;
    this.finalPose = null;
    this.pins = new Map();          // joint -> THREE.Vector3 (world) — bodydrag reads this
    this._pinBodies = new Map();    // joint -> { marker, joint }
    this.settledFor = 0;
    this.elapsed = 0;
    this.acc = 0;
    this.maxV = Infinity;
    this.p = {};                    // joint -> world pos (debug + parity surface)

    const h = avatar.vrm.humanoid;
    avatar.root.updateMatrixWorld(true);

    // live capture (where the body IS) + neutral rest (what limits mean)
    const live = {};
    for (const j of new Set(SEGMENTS.flat())) {
      const n = h?.getNormalizedBoneNode?.(j);
      if (n) live[j] = n.getWorldPosition(new THREE.Vector3());
    }
    // inherited motion (a drag release carrying the hand's sim state): the
    // packed form also carries POSITIONS — the hand's truth outranks the
    // skeleton's current frame. Velocities land on segments after build.
    const seedV = {};
    if (seedVel?.j) {
      const { j: names, p: pos, v: vel, dy = 0 } = seedVel;
      for (let i = 0; i < names.length; i++) {
        const n = names[i], k = i * 3;
        if (live[n]) live[n].set(pos[k], pos[k + 1] + dy, pos[k + 2]);
        seedV[n] = new THREE.Vector3(vel[k], vel[k + 1], vel[k + 2]);
      }
    } else if (seedVel) {
      for (const j of Object.keys(live)) {
        const v = seedVel.get?.(j) ?? seedVel[j];
        if (v) seedV[j] = new THREE.Vector3(v.x, v.y, v.z);
      }
    }
    const restP = {};
    const restSrc = rest ?? avatar.restBonePositions?.() ?? live;
    for (const [j, v] of Object.entries(restSrc)) restP[j] = v.clone ? v.clone() : new THREE.Vector3(v.x, v.y, v.z);

    // the drive table, exactly the Verlet's world-reference method: bones are
    // rotated so rest direction meets live direction — proven on 14 rigs
    this.drive = [];
    for (const [bone, child] of SEGMENTS) {
      const bn = h?.getNormalizedBoneNode?.(bone);
      const cn = h?.getNormalizedBoneNode?.(child);
      if (!bn || !cn || !restP[bone] || !restP[child]) continue;
      const restDir = restP[child].clone().sub(restP[bone]);
      if (restDir.lengthSq() < 1e-8) continue;
      this.drive.push({
        bone, child, node: bn, parent: bn.parent,
        restDir: restDir.normalize(),
        restQuat: bn.getWorldQuaternion(new THREE.Quaternion()),
      });
    }

    // ---- the physics world: local flat ground + nearby furniture ----------
    this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    this.world.timestep = FIXED_DT;
    const hips = live.hips ?? avatar.root.position;
    this.groundY = heightAt(hips.x, hips.z);
    this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(60, 0.5, 60).setTranslation(hips.x, this.groundY - 0.5, hips.z).setFriction(0.85),
    );
    for (const [, c] of colliders) {
      const obj = c.obj;
      if (!obj || c.interior || !c.box) continue;
      if (Math.hypot(obj.position.x - hips.x, obj.position.z - hips.z) > 8) continue;
      const size = c.box.getSize(new THREE.Vector3()).multiplyScalar(obj.scale?.x || 1);
      const center = c.box.getCenter(new THREE.Vector3()).add(obj.position);
      this.world.createCollider(
        RAPIER.ColliderDesc.cuboid(Math.max(size.x / 2, 0.02), Math.max(size.y / 2, 0.02), Math.max(size.z / 2, 0.02))
          .setTranslation(center.x, center.y, center.z).setFriction(0.8),
      );
    }

    // ---- segments as capsules, at the LIVE pose ---------------------------
    const span = live.leftUpperArm && live.rightUpperArm
      ? live.leftUpperArm.distanceTo(live.rightUpperArm) : 0.3;
    const torsoR = Math.max(0.05, span * 0.22);
    this.segs = new Map();
    const bodyOf = new Map();
    for (const [a, b] of SEGMENTS) {
      if (!live[a] || !live[b]) continue;
      const pa = live[a], pb = live[b];
      const mid = pa.clone().add(pb).multiplyScalar(0.5);
      const dir = pb.clone().sub(pa);
      const len = Math.max(dir.length(), 0.04);
      const r = Math.min(torsoR * (RADIUS_FRAC[`${a}|${b}`] ?? 0.5), len * 0.45) * 0.9;
      _q.setFromUnitVectors(_up, dir.clone().normalize());
      const body = this.world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(mid.x, mid.y, mid.z)
          .setRotation({ x: _q.x, y: _q.y, z: _q.z, w: _q.w })
          .setLinearDamping(0.15).setAngularDamping(0.7),
      );
      this.world.createCollider(
        RAPIER.ColliderDesc.capsule(Math.max(0.01, len / 2 - r * 0.5), r)
          .setFriction(0.8).setRestitution(0.03).setDensity(1000),
        body,
      );
      this.segs.set(`${a}|${b}`, { body, halfLen: len / 2, r, a, b });
      bodyOf.set(a, body);
    }

    // ---- joints with the fleet-measured stance ----------------------------
    const local = (body, worldPos) => {
      const t = body.translation(), rq = body.rotation();
      return worldPos.clone().sub(new THREE.Vector3(t.x, t.y, t.z))
        .applyQuaternion(new THREE.Quaternion(rq.x, rq.y, rq.z, rq.w).invert());
    };
    this.motors = [];
    for (const J of JOINTS_DEF) {
      const pb = bodyOf.get(J.parent), cb = bodyOf.get(J.child);
      if (!pb || !cb || !live[J.at]) continue;
      const at = live[J.at];
      let jd;
      if (J.kind === 'spherical') {
        jd = RAPIER.JointData.spherical(local(pb, at), local(cb, at));
      } else {
        const boneDir = restP[J.child] && restP[J.parent]
          ? restP[J.child].clone().sub(restP[J.parent]).normalize() : _up.clone();
        const axisWorld = J.kind === 'knee'
          ? new THREE.Vector3(1, 0, 0)
          : new THREE.Vector3().crossVectors(new THREE.Vector3(0, 0, 1), boneDir).normalize();
        if (axisWorld.lengthSq() < 1e-6) axisWorld.set(1, 0, 0);
        const rq = pb.rotation();
        const axisLocal = axisWorld.applyQuaternion(new THREE.Quaternion(rq.x, rq.y, rq.z, rq.w).invert());
        jd = RAPIER.JointData.revolute(local(pb, at), local(cb, at), axisLocal);
        jd.limitsEnabled = true;
        jd.limits = J.kind === 'knee' ? [-2.6, 0.09] : [-0.09, 2.6];
      }
      const joint = this.world.createImpulseJoint(jd, pb, cb, true);
      joint.setContactsEnabled(false);
      this.motors.push(joint);
    }
    this.tone = TONE0;
    this._setTone(this.tone);
    this._toneAcc = 0;

    // inherited velocities: each segment takes its endpoints' average
    for (const s of this.segs.values()) {
      const va = seedV[s.a], vb = seedV[s.b];
      if (!va && !vb) continue;
      _v.copy(va ?? vb).add(vb ?? va).multiplyScalar(0.5);
      s.body.setLinvel({ x: _v.x, y: _v.y, z: _v.z }, true);
    }

    // root follow, exactly the Verlet's law
    this.rootStartY = avatar.root.position.y;
    this.hipsOffset = (live.hips?.y ?? 0) - avatar.root.position.y;

    if (lean) this._topple(lean);
    this._syncP();
  }

  _setTone(s) {
    for (const j of this.motors) {
      try { j.configureMotorPosition(0, s, 3); } catch { /* not motorable */ }
    }
  }

  _topple(lean) {
    let lo = Infinity, hi = -Infinity;
    for (const s of this.segs.values()) { const y = s.body.translation().y; lo = Math.min(lo, y); hi = Math.max(hi, y); }
    const span = (hi - lo) || 1;
    _v.copy(lean);
    const cap = 8;
    if (_v.lengthSq() > cap * cap) _v.setLength(cap);
    for (const s of this.segs.values()) {
      const w = (s.body.translation().y - lo) / span;
      const cur = s.body.linvel();
      s.body.setLinvel({ x: cur.x + _v.x * w, y: cur.y, z: cur.z + _v.z * w }, true);
    }
  }

  impulse(v) {
    if (this.done) return;
    this._topple(v);
    this.settledFor = 0;
    this.elapsed = 0;
  }

  setPin(joint, target) {
    if (!joint) {
      for (const j of [...this._pinBodies.keys()]) this.setPin(j, null);
      return;
    }
    const seg = [...this.segs.values()].find((s) => s.a === joint || s.b === joint);
    if (!seg) return;
    if (!target) {
      const pin = this._pinBodies.get(joint);
      if (pin) {
        this.world.removeImpulseJoint(pin.joint, true);
        this.world.removeRigidBody(pin.marker);
        this._pinBodies.delete(joint);
        this.pins.delete(joint);
      }
      return;
    }
    let pin = this._pinBodies.get(joint);
    if (!pin) {
      // the marker is born AT the joint — zero constraint error at creation —
      // and CHASES the target at capped speed (see step). Teleporting it
      // resolves the position error as one giant solver impulse: measured
      // 955km of body displacement in a frame. The chase is also the feel:
      // a hand pulling a body, not a body snapping to a hand.
      const t = seg.body.translation(), rq = seg.body.rotation();
      const end = seg.a === joint ? -seg.halfLen : seg.halfLen;
      _a.set(0, end, 0).applyQuaternion(_qp.set(rq.x, rq.y, rq.z, rq.w));
      const marker = this.world.createRigidBody(
        RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(t.x + _a.x, t.y + _a.y, t.z + _a.z));
      const jd = RAPIER.JointData.spherical({ x: 0, y: 0, z: 0 }, { x: 0, y: end, z: 0 });
      const j = this.world.createImpulseJoint(jd, marker, seg.body, true);
      pin = { marker, joint: j, at: new THREE.Vector3(t.x + _a.x, t.y + _a.y, t.z + _a.z) };
      this._pinBodies.set(joint, pin);
      this.pins.set(joint, new THREE.Vector3());
    }
    this.pins.get(joint).copy(target);
    for (const s of this.segs.values()) s.body.wakeUp();
  }

  /** Markers chase their targets at a bounded speed — every substep, so the
   *  injection per solver tick stays small and the sim stays stable. */
  _chasePins() {
    const MAXV = 6 * FIXED_DT;
    for (const [joint, pin] of this._pinBodies) {
      const want = this.pins.get(joint);
      if (!want) continue;
      _v.copy(want).sub(pin.at);
      const d = _v.length();
      if (d > 1e-6) pin.at.addScaledVector(_v, Math.min(1, MAXV / d));
      pin.marker.setNextKinematicTranslation({ x: pin.at.x, y: pin.at.y, z: pin.at.z });
    }
  }

  get pinned() { return this.pins.size > 0; }

  /** The drag-release handover, same packed format as the Verlet's: joint
   *  names + positions + velocities. Endpoint velocity is the rigid-body
   *  truth: v + ω × r — a swung body hands over its swing. */
  snapshot() {
    this._syncP();
    const j = [], p = [], v = [];
    const seen = new Set();
    for (const s of this.segs.values()) {
      const t = s.body.translation(), lv = s.body.linvel(), av = s.body.angvel();
      for (const [name, sign] of [[s.a, -1], [s.b, 1]]) {
        if (seen.has(name) || !this.p[name]) continue;
        seen.add(name);
        const q = this.p[name];
        j.push(name);
        p.push(+q.x.toFixed(4), +q.y.toFixed(4), +q.z.toFixed(4));
        _a.set(q.x - t.x, q.y - t.y, q.z - t.z);          // r from center
        _b.set(av.x, av.y, av.z).cross(_a).add(_v.set(lv.x, lv.y, lv.z));
        v.push(+_b.x.toFixed(3), +_b.y.toFixed(3), +_b.z.toFixed(3));
      }
    }
    return { j, p, v };
  }

  _syncP() {
    for (const s of this.segs.values()) {
      const t = s.body.translation(), rq = s.body.rotation();
      _qp.set(rq.x, rq.y, rq.z, rq.w);
      _a.set(0, 1, 0).applyQuaternion(_qp).multiplyScalar(s.halfLen);
      (this.p[s.a] ??= new THREE.Vector3()).set(t.x - _a.x, t.y - _a.y, t.z - _a.z);
      (this.p[s.b] ??= new THREE.Vector3()).set(t.x + _a.x, t.y + _a.y, t.z + _a.z);
    }
  }

  step(dt) {
    if (this.done) return null;
    dt = Math.min(0.25, Math.max(0, dt || 0));
    this.acc += dt;
    let n = 0;
    let maxSpeed = 0;
    while (this.acc >= FIXED_DT && n < MAX_FRAMES) {
      // muscle tone decays — limp is a process, not a switch
      this._toneAcc += FIXED_DT;
      if (this._toneAcc >= 0.1 && this.tone > 0.2) {
        this._toneAcc = 0;
        this.tone *= TONE_DECAY;
        this._setTone(this.tone);
      }
      this._chasePins();
      this.world.step();
      this.acc -= FIXED_DT;
      n++;
    }
    if (n === MAX_FRAMES) this.acc = 0;
    for (const s of this.segs.values()) {
      const v = s.body.linvel();
      maxSpeed = Math.max(maxSpeed, Math.hypot(v.x, v.y, v.z));
    }
    this.maxV = maxSpeed;

    this.elapsed += dt;
    if (this.pinned) { this.settledFor = 0; this.elapsed = 0; }
    if (this.maxV < SETTLE_V) this.settledFor += dt; else this.settledFor = 0;

    if (n === 0 && this.pose) return this.pose;
    this._syncP();

    // root follows the hips; the falling-only ceiling lifts while pinned
    const hips = this.p.hips;
    if (hips) {
      this.avatar.root.position.x = hips.x;
      this.avatar.root.position.z = hips.z;
      const y = hips.y - this.hipsOffset;
      if (this.pinned && y > this.rootStartY) this.rootStartY = y;
      this.avatar.root.position.y = Math.min(this.rootStartY, y);
    }

    // bones: rest direction → live direction, world-reference (parents first)
    const pose = {};
    for (const d of this.drive) {
      const bp = this.p[d.bone], cp = this.p[d.child];
      if (!bp || !cp) continue;
      _b.copy(cp).sub(bp);
      if (_b.lengthSq() < 1e-6) continue;
      _b.normalize();
      _q.setFromUnitVectors(d.restDir, _b).multiply(d.restQuat);
      d.parent.getWorldQuaternion(_qp).invert();
      _qp.multiply(_q);
      d.node.quaternion.copy(_qp);
      pose[d.bone] = [+_qp.x.toFixed(4), +_qp.y.toFixed(4), +_qp.z.toFixed(4), +_qp.w.toFixed(4)];
    }
    this.pose = pose;
    this.avatar.setPose(pose);

    if (this.settledFor >= SETTLE_TIME || this.elapsed >= DEADLINE) {
      this.done = true;
      this.finalPose = pose;
      this.dispose();
      return null;
    }
    return pose;
  }

  /** Free the WASM world — rigid bodies do not garbage-collect. Safe to call
   *  twice; called automatically at capture. */
  dispose() {
    if (this._freed) return;
    this._freed = true;
    try { this.world.free(); } catch { /* already gone */ }
    this.segs.clear();
    this._pinBodies.clear();
  }
}
