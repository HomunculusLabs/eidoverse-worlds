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

// The body cut mirrors the Verlet's CHAINS exactly — including CHEST, which
// the first build skipped: on real rigs the arms hang from chest/upperChest,
// and a drive table that never drives chest leaves skin twisting against the
// sim. Rigs without a chest bone get one synthesized at the spine-neck
// midpoint (VRM makes chest optional; the fleet all carry it).
const SEGMENTS = [
  ['hips', 'spine'], ['spine', 'chest'], ['chest', 'neck'], ['neck', 'head'],
  ['leftUpperArm', 'leftLowerArm'], ['leftLowerArm', 'leftHand'],
  ['rightUpperArm', 'rightLowerArm'], ['rightLowerArm', 'rightHand'],
  ['leftUpperLeg', 'leftLowerLeg'], ['leftLowerLeg', 'leftFoot'],
  ['rightUpperLeg', 'rightLowerLeg'], ['rightLowerLeg', 'rightFoot'],
];
// Ball joints carry the anatomy the solver does NOT provide: rapier's JS
// spherical joints have neither motors nor limits (probed — the calls the
// spike made on them threw silently), so swing cones, twist bounds, and
// muscle tone are OURS, applied per substep in _angularPass. Numbers are the
// Verlet's fleet-measured stance.
const JOINTS_DEF = [
  { at: 'spine', parent: 'hips', child: 'spine', kind: 'spherical', cone: 0.44, twist: 0.26 },
  { at: 'chest', parent: 'spine', child: 'chest', kind: 'spherical', cone: 0.35, twist: 0.26 },
  { at: 'neck', parent: 'chest', child: 'neck', kind: 'spherical', cone: 0.70, twist: 0.70 },
  { at: 'leftUpperArm', parent: 'chest', child: 'leftUpperArm', kind: 'spherical', cone: 1.48, twist: 0.79 },
  { at: 'rightUpperArm', parent: 'chest', child: 'rightUpperArm', kind: 'spherical', cone: 1.48, twist: 0.79 },
  { at: 'leftLowerArm', parent: 'leftUpperArm', child: 'leftLowerArm', kind: 'elbow' },
  { at: 'rightLowerArm', parent: 'rightUpperArm', child: 'rightLowerArm', kind: 'elbow' },
  { at: 'leftUpperLeg', parent: 'hips', child: 'leftUpperLeg', kind: 'spherical', cone: 0.96, twist: 0.52 },
  { at: 'rightUpperLeg', parent: 'hips', child: 'rightUpperLeg', kind: 'spherical', cone: 0.96, twist: 0.52 },
  { at: 'leftLowerLeg', parent: 'leftUpperLeg', child: 'leftLowerLeg', kind: 'knee' },
  { at: 'rightLowerLeg', parent: 'rightUpperLeg', child: 'rightLowerLeg', kind: 'knee' },
];
const RADIUS_FRAC = {
  'hips|spine': 1.0, 'spine|chest': 0.95, 'chest|neck': 1.0, 'neck|head': 0.6,
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

/** A DETERMINISTIC frame for a bone direction — never setFromUnitVectors.
 *  That helper is singular for antiparallel inputs (legs point DOWN, the
 *  reference is UP): THREE picks an arbitrary 180° axis, differently per
 *  call, and a rest pose assembled from two arbitrary choices told muscle
 *  tone that "rest" was a body folded into itself. Watched live: the whole
 *  skeleton scrunching into a ball. Frame: Y = bone, X ⟂ via world Z (world
 *  X fallback) — continuous everywhere a humanoid bone can point. */
function frameQuat(dir, out = new THREE.Quaternion()) {
  const y = dir.clone().normalize();
  const ref = Math.abs(y.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
  const x = new THREE.Vector3().crossVectors(ref, y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y);
  return out.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}
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
    // VRM makes chest optional; the chain requires it — synthesize mid-torso
    if (!live.chest && live.spine && live.neck) {
      live.chest = live.spine.clone().add(live.neck).multiplyScalar(0.5);
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
    if (!restP.chest && restP.spine && restP.neck) {
      restP.chest = restP.spine.clone().add(restP.neck).multiplyScalar(0.5);
    }

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
    const segList = [];

    // ---- the TORSO is ONE rigid body -------------------------------------
    // The spine and chest joints could not be defended: a fold forms at
    // impact faster than capped springs respond, then ground friction pins
    // it — measured 142° of swing against a 25° cone, unrecoverable by any
    // force this side of teleportation. Real ragdolls solve this the same
    // way: torsos are (nearly) rigid. Three capsules, one body; the head
    // and limbs keep their joints, which is where the looseness READS.
    const TORSO = new Set(['hips|spine', 'spine|chest', 'chest|neck']);
    const torsoDir = (live.chest ?? live.neck).clone().sub(live.hips);
    const torsoQ = frameQuat(torsoDir);
    const torsoMid = live.hips.clone().add(live.neck ?? live.chest).multiplyScalar(0.5);
    const torsoBody = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(torsoMid.x, torsoMid.y, torsoMid.z)
        .setRotation({ x: torsoQ.x, y: torsoQ.y, z: torsoQ.z, w: torsoQ.w })
        .setLinearDamping(0.15).setAngularDamping(6),
    );
    const torsoQInv = torsoQ.clone().invert();
    const toTorso = (w2) => w2.clone().sub(torsoMid).applyQuaternion(torsoQInv);

    for (const [a, b] of SEGMENTS) {
      if (!live[a] || !live[b]) continue;
      const pa = live[a], pb2 = live[b];
      const mid = pa.clone().add(pb2).multiplyScalar(0.5);
      const dir = pb2.clone().sub(pa);
      const len = Math.max(dir.length(), 0.04);
      const r = Math.min(torsoR * (RADIUS_FRAC[`${a}|${b}`] ?? 0.5), len * 0.45) * 0.9;
      const key = `${a}|${b}`;
      let body, collider, localA, localB;
      if (TORSO.has(key)) {
        body = torsoBody;
        const segQ = frameQuat(dir);
        const localQ = torsoQInv.clone().multiply(segQ);
        const localMid = toTorso(mid);
        collider = this.world.createCollider(
          RAPIER.ColliderDesc.capsule(Math.max(0.01, len / 2 - r * 0.5), r)
            .setTranslation(localMid.x, localMid.y, localMid.z)
            .setRotation({ x: localQ.x, y: localQ.y, z: localQ.z, w: localQ.w })
            .setFriction(0.8).setRestitution(0.03).setDensity(1000),
          body,
        );
        localA = toTorso(pa); localB = toTorso(pb2);
      } else {
        frameQuat(dir, _q);
        // Angular damping is the stability budget: applied INSIDE the
        // solver, unconditionally stable — no corrective torque of ours can
        // pump against it. Limbs keep enough freedom to swing.
        body = this.world.createRigidBody(
          RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(mid.x, mid.y, mid.z)
            .setRotation({ x: _q.x, y: _q.y, z: _q.z, w: _q.w })
            .setLinearDamping(0.15).setAngularDamping(a === 'neck' ? 5 : 3.5),
        );
        collider = this.world.createCollider(
          RAPIER.ColliderDesc.capsule(Math.max(0.01, len / 2 - r * 0.5), r)
            .setFriction(0.8).setRestitution(0.03).setDensity(1000),
          body,
        );
        localA = new THREE.Vector3(0, -len / 2, 0); localB = new THREE.Vector3(0, len / 2, 0);
      }
      const seg = { body, collider, localA, localB, r, a, b, idx: segList.length, torso: TORSO.has(key) };
      this.segs.set(key, seg);
      segList.push(seg);
      bodyOf.set(a, body);
    }

    // ---- self-collision, the Verlet's law ported to collision groups ------
    // Rest-overlapping pairs never collide; same-body pairs are moot; the
    // rest may touch. 16-bit masks fit the fleet; bit 15 keeps statics.
    {
      const restAt = (name) => restP[name] ?? live[name];
      const segd = (p1, q1, p2, q2) => {
        const d1 = q1.clone().sub(p1), d2 = q2.clone().sub(p2), rr = p1.clone().sub(p2);
        const A = d1.dot(d1), E = d2.dot(d2), F = d2.dot(rr);
        let s3 = 0, t3 = 0;
        if (A > 1e-9 || E > 1e-9) {
          if (A < 1e-9) { t3 = Math.min(1, Math.max(0, F / E)); }
          else {
            const C = d1.dot(rr);
            if (E < 1e-9) s3 = Math.min(1, Math.max(0, -C / A));
            else {
              const B = d1.dot(d2), den = A * E - B * B;
              s3 = den > 1e-9 ? Math.min(1, Math.max(0, (B * F - C * E) / den)) : 0;
              t3 = (B * s3 + F) / E;
              if (t3 < 0) { t3 = 0; s3 = Math.min(1, Math.max(0, -C / A)); }
              else if (t3 > 1) { t3 = 1; s3 = Math.min(1, Math.max(0, (B - C) / A)); }
            }
          }
        }
        return p1.clone().addScaledVector(d1, s3).sub(p2.clone().addScaledVector(d2, t3)).length();
      };
      const adjacent = (x, y) => x.body === y.body
        || x.a === y.a || x.a === y.b || x.b === y.a || x.b === y.b;
      const filters = segList.map(() => 0);
      for (let i = 0; i < segList.length; i++) {
        for (let j = i + 1; j < segList.length; j++) {
          const A2 = segList[i], B2 = segList[j];
          if (adjacent(A2, B2)) continue;
          const pa1 = restAt(A2.a), pb1 = restAt(A2.b), pa2 = restAt(B2.a), pb2b = restAt(B2.b);
          if (!pa1 || !pb1 || !pa2 || !pb2b) continue;
          if (segd(pa1, pb1, pa2, pb2b) < (A2.r + B2.r) * 1.05) continue;
          filters[i] |= (1 << B2.idx);
          filters[j] |= (1 << A2.idx);
        }
      }
      for (const seg of segList) {
        seg.collider.setCollisionGroups(((1 << seg.idx) << 16) | filters[seg.idx] | 0x8000);
      }
    }

    // ---- joints with the fleet-measured stance ----------------------------
    const local = (body, worldPos) => {
      const t = body.translation(), rq = body.rotation();
      return worldPos.clone().sub(new THREE.Vector3(t.x, t.y, t.z))
        .applyQuaternion(new THREE.Quaternion(rq.x, rq.y, rq.z, rq.w).invert());
    };
    this.motors = [];       // revolute joints — the only kind rapier motorizes
    this.balls = [];        // spherical joints — cones/twist/tone are OURS
    const segByParentBone = new Map();
    for (const s of this.segs.values()) segByParentBone.set(s.a, s);
    const torsoRestQ = frameQuat((restP.chest ?? restP.neck).clone().sub(restP.hips));
    const restQuatOfSeg = (s) => {
      if (s.torso) return torsoRestQ.clone();     // one frame for one body
      const ra = restP[s.a], rb = restP[s.b];
      if (!ra || !rb) return new THREE.Quaternion();
      return frameQuat(rb.clone().sub(ra));       // same frame law as the bodies
    };
    for (const J of JOINTS_DEF) {
      const pb = bodyOf.get(J.parent), cb = bodyOf.get(J.child);
      if (!pb || !cb || !live[J.at]) continue;
      if (pb === cb) continue;                    // torso-internal: rigid now
      const at = live[J.at];
      let jd;
      if (J.kind === 'spherical') {
        // NOT a free ball: linear locked AND the twist axis locked — a 2-DOF
        // swing joint, natively. This is exactly the Verlet's DOF set (its
        // direction-only drive never expressed twist), it makes head-spin
        // structurally impossible, and it leaves the angular pass a clean
        // 2-DOF swing to bound. Axis = the child bone at build, parent-local.
        const cs0 = segByParentBone.get(J.child);
        const boneW = cs0 && live[cs0.b] && live[cs0.a]
          ? live[cs0.b].clone().sub(live[cs0.a]).normalize() : _up.clone();
        const rq0 = pb.rotation();
        const axisPL = boneW.applyQuaternion(new THREE.Quaternion(rq0.x, rq0.y, rq0.z, rq0.w).invert());
        const M = RAPIER.JointAxesMask;
        jd = RAPIER.JointData.generic(local(pb, at), local(cb, at),
          axisPL, M.LinX | M.LinY | M.LinZ | M.AngX);
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
      if (J.kind === 'spherical') {
        // anatomy in REST terms: relative rest rotation + the twist axis
        // (the child bone's rest direction, in the parent segment's frame)
        const ps = segByParentBone.get(J.parent), cs = segByParentBone.get(J.child);
        if (ps && cs && restP[cs.a] && restP[cs.b]) {
          const qP0 = restQuatOfSeg(ps), qC0 = restQuatOfSeg(cs);
          const restRel = qP0.clone().invert().multiply(qC0);
          const axisL = restP[cs.b].clone().sub(restP[cs.a]).normalize()
            .applyQuaternion(qP0.clone().invert());
          // ANGULAR inertia, not mass: a solid capsule about its transverse
          // axis. Scaling torque by mass over-drove small segments by orders
          // of magnitude (a hand's I is ~1000× smaller than its m suggests) —
          // measured: 2,000,000 rad/s of hidden spin under settled positions.
          const m = cb.mass?.() ?? 1;
          const len = cs.localA.distanceTo(cs.localB);
          // per-axis: a slender capsule has ~50× less inertia about its LONG
          // axis — isotropic scaling over-drives twist and pumps
          const It = Math.max(1e-6, m * (len * len / 12 + cs.r * cs.r / 4));
          const Il = Math.max(1e-7, m * cs.r * cs.r / 2);
          this.balls.push({ pb, cb, cone: J.cone, twist: J.twist, restRel, axisL, It, Il });
        }
      } else {
        this.motors.push(joint);
      }
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
    // revolute joints take a real motor; ball joints get their tone in
    // _angularPass (rapier's JS sphericals have no motors — probed)
    for (const j of this.motors) {
      try { j.configureMotorPosition(0, s, 3); } catch { /* not motorable */ }
    }
  }

  /** The anatomy rapier does not provide, applied every substep: swing cones,
   *  twist bounds, and muscle tone on every ball joint. Limits are SURGICAL
   *  (the Verlet's law): orientation snapped back to the limit surface, the
   *  offending relative spin removed inelastically — a limit stops, it does
   *  not store. Tone is a weak spring toward rest that decays to a floor:
   *  a settled body keeps residual tone, which is also what stops the
   *  endless-free-spin failure mode. */
  _angularPass() {
    const qP = _q, qC = _qp;
    for (const B of this.balls) {
      const rp = B.pb.rotation(), rc = B.cb.rotation();
      qP.set(rp.x, rp.y, rp.z, rp.w);
      qC.set(rc.x, rc.y, rc.z, rc.w);
      // rotation from rest, in the parent's frame — canonical sign (q ≡ −q)
      const rel = qP.clone().invert().multiply(qC);
      const delta = rel.clone().multiply(B.restRel.clone().invert());
      if (delta.w < 0) { delta.x *= -1; delta.y *= -1; delta.z *= -1; delta.w *= -1; }
      const d = new THREE.Vector3(delta.x, delta.y, delta.z);
      const proj = d.dot(B.axisL);
      const twistQ = new THREE.Quaternion(B.axisL.x * proj, B.axisL.y * proj, B.axisL.z * proj, delta.w).normalize();
      const swingQ = delta.clone().multiply(twistQ.clone().invert());
      if (swingQ.w < 0) { swingQ.x *= -1; swingQ.y *= -1; swingQ.z *= -1; swingQ.w *= -1; }
      let twist = 2 * Math.atan2(proj, delta.w);
      if (twist > Math.PI) twist -= 2 * Math.PI;
      if (twist < -Math.PI) twist += 2 * Math.PI;
      const swing = 2 * Math.acos(Math.min(1, swingQ.w));

      // Everything is a TORQUE — tone inside the envelope, stiff one-sided
      // springs beyond it. No position surgery: snapping orientation about
      // the COM violates the joint anchor, and the solver answers the error
      // with a velocity impulse — a feedback pump (measured: 75M rad/s).
      const avp = B.pb.angvel(), avc = B.cb.angvel();
      const relAv = _b.set(avc.x - avp.x, avc.y - avp.y, avc.z - avp.z);
      const axisW = _a.copy(B.axisL).applyQuaternion(qP);            // bone axis, world

      // desired angular acceleration (rad/s²), assembled in world space
      const acc = _v.set(0, 0, 0);
      const ang = 2 * Math.acos(Math.min(1, delta.w));
      if (ang > 1e-3) {
        acc.addScaledVector(
          d.clone().normalize().applyQuaternion(qP), -this.tone * ang);   // tone toward rest
      }
      acc.addScaledVector(relAv, -4);                                     // relative-spin damping
      const twistOver = Math.abs(twist) - B.twist;
      if (twistOver > 0) {
        acc.addScaledVector(axisW, -Math.sign(twist) * (60 * twistOver));
        acc.addScaledVector(axisW, -12 * relAv.dot(axisW));
      }
      const swingOver = swing - B.cone;
      if (swingOver > 0 && swing > 1e-4) {
        const sax = new THREE.Vector3(swingQ.x, swingQ.y, swingQ.z).normalize().applyQuaternion(qP);
        acc.addScaledVector(sax, -60 * swingOver);
        acc.addScaledVector(sax, -8 * relAv.dot(sax));
      }

      // torque impulse through the CORRECT inertia per axis: longitudinal
      // (twist) vs transverse (swing), capped in Δω terms per substep
      const accL = axisW.clone().multiplyScalar(acc.dot(axisW));
      const accT = acc.clone().sub(accL);
      const dwCap = (twistOver > 0 || swingOver > 0) ? 1.0 : 0.5;
      const clampAcc = (v, cap) => {
        const dw = v.length() * FIXED_DT;
        if (dw > cap) v.multiplyScalar(cap / dw);
        return v;
      };
      clampAcc(accL, dwCap); clampAcc(accT, dwCap);
      const tq = accT.multiplyScalar(B.It * FIXED_DT).addScaledVector(accL, B.Il * FIXED_DT);
      B.cb.applyTorqueImpulse({ x: tq.x, y: tq.y, z: tq.z }, true);
      B.pb.applyTorqueImpulse({ x: -tq.x, y: -tq.y, z: -tq.z }, true);
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
      const anchor = seg.a === joint ? seg.localA : seg.localB;
      _a.copy(anchor).applyQuaternion(_qp.set(rq.x, rq.y, rq.z, rq.w));
      const marker = this.world.createRigidBody(
        RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(t.x + _a.x, t.y + _a.y, t.z + _a.z));
      const jd = RAPIER.JointData.spherical({ x: 0, y: 0, z: 0 }, { x: anchor.x, y: anchor.y, z: anchor.z });
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
      _a.copy(s.localA).applyQuaternion(_qp);
      (this.p[s.a] ??= new THREE.Vector3()).set(t.x + _a.x, t.y + _a.y, t.z + _a.z);
      _a.copy(s.localB).applyQuaternion(_qp);
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
      this._angularPass();
      // absolute ceiling on angular velocity: nothing anatomical rotates at
      // 20 rad/s, and any residual solver energy hides there first
      for (const s2 of this.segs.values()) {
        const w = s2.body.angvel();
        const m = Math.hypot(w.x, w.y, w.z);
        if (m > 20) {
          const k = 20 / m;
          s2.body.setAngvel({ x: w.x * k, y: w.y * k, z: w.z * k }, false);
        }
      }
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
