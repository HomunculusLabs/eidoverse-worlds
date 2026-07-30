// ragdoll — a body going limp, simulated by ONE machine and streamed.
//
// The sync model is the whole point, and it is not "make physics
// deterministic" — that is unwinnable across machines. It is single authority:
//
//   * Only the body's OWNER simulates (the VRChat model the design mandates:
//     you own your avatar). Nobody else runs physics.
//   * The owner streams the resulting sparse bone rotations through the
//     presence `pose` field — the exact channel a held pose already uses, so
//     remotes render a ragdoll with zero new receiver code: it is just a pose
//     that changes every frame.
//   * When it settles, the owner CAPTURES the final bones as a held pose. That
//     rides lastPose, so a late joiner or a reconnect gets the settled RESULT,
//     never a replay of the tumble. If it should be permanent, the same bones
//     commit as a `pose` verb into the log.
//
// So physics lives on the presence plane (lossy, ephemeral, one authority) and
// its outcome becomes state. The server never simulates and never sees a bone.
//
// The simulator itself is a Verlet particle skeleton — small, stable, and more
// than convincing enough for a cosmetic flop. It is NOT a jointed rigid-body
// solver; it does not need to be.

import { THREE } from './core.js';
import { heightAt } from './terrain.js';
import { resolveColliders } from './colliders.js';

// Which bones the sim drives, each as (bone -> the child joint it points at).
// A reduced set: enough to read as a body, few enough to stay stable and to
// keep the streamed pose small.
const CHAINS = [
  ['spine', 'chest'], ['chest', 'neck'], ['neck', 'head'],
  ['leftUpperArm', 'leftLowerArm'], ['leftLowerArm', 'leftHand'],
  ['rightUpperArm', 'rightLowerArm'], ['rightLowerArm', 'rightHand'],
  ['leftUpperLeg', 'leftLowerLeg'], ['leftLowerLeg', 'leftFoot'],
  ['rightUpperLeg', 'rightLowerLeg'], ['rightLowerLeg', 'rightFoot'],
];
// Every joint we track as a particle (bones + their leaf children).
const JOINTS = [...new Set(CHAINS.flat().concat('hips'))];
// Distance constraints = the skeleton's bones, at their rest lengths.
const LINKS = [
  ['hips', 'spine'], ...CHAINS,
  ['hips', 'leftUpperLeg'], ['hips', 'rightUpperLeg'],
  ['chest', 'leftUpperArm'], ['chest', 'rightUpperArm'],
];

const GRAVITY = -9.8;
const GROUND_R = 0.06;      // keep joints just above the ground
const ITER = 6;            // constraint relaxation passes per step
const SETTLE_V = 0.06;     // speed below which we call it settled
const SETTLE_FRAMES = 24;

// Self-collision radii, as fractions of the torso radius. The torso radius
// itself is MEASURED from the body (shoulder/hip span) so this scales to any
// avatar — a bulky one gets fatter colliders than a slim one. Anatomical
// fractions give limbs their taper: a wrist is thinner than a hip.
const RADIUS_FRAC = {
  hips: 1.0, spine: 0.95, chest: 1.0, neck: 0.5, head: 0.75,
  leftUpperArm: 0.5, rightUpperArm: 0.5, leftLowerArm: 0.35, rightLowerArm: 0.35,
  leftHand: 0.3, rightHand: 0.3,
  leftUpperLeg: 0.55, rightUpperLeg: 0.55, leftLowerLeg: 0.4, rightLowerLeg: 0.4,
  leftFoot: 0.35, rightFoot: 0.35,
};

/** Estimate a self-collision radius per joint from the rest skeleton, and pair
 *  up the joints that should push each other apart. Only joints ≥3 links apart
 *  collide: closer ones are already held at a fixed distance by a bone
 *  constraint, and colliding them too would just make the two rules fight and
 *  jitter. So this catches the collisions that matter — a hand or foot sinking
 *  into the torso, arms passing through the chest, the body pancaking flat —
 *  and leaves the ones the skeleton already governs alone. */
function buildSelfCollision(p) {
  const dist = (a, b) => (p[a] && p[b] ? p[a].distanceTo(p[b]) : 0);
  const shoulderW = dist('leftUpperArm', 'rightUpperArm');
  const hipW = dist('leftUpperLeg', 'rightUpperLeg');
  const spineLen = dist('hips', 'head') || 0.5;
  // half the wider of shoulders/hips is a fair torso half-thickness; fall back
  // to a fraction of the spine if the arms/legs are missing
  const torsoR = Math.min(0.25, Math.max(0.07,
    (Math.max(shoulderW, hipW) * 0.42) || spineLen * 0.26));

  const radius = {};
  for (const j of Object.keys(p)) radius[j] = torsoR * (RADIUS_FRAC[j] ?? 0.4);

  // link adjacency + BFS hop distance
  const adj = new Map();
  const add = (a, b) => { (adj.get(a) ?? adj.set(a, new Set()).get(a)).add(b); };
  for (const [a, b] of LINKS) { if (p[a] && p[b]) { add(a, b); add(b, a); } }
  const hops = (start) => {
    const d = new Map([[start, 0]]);
    const q = [start];
    while (q.length) {
      const n = q.shift();
      for (const m of adj.get(n) ?? []) if (!d.has(m)) { d.set(m, d.get(n) + 1); q.push(m); }
    }
    return d;
  };

  const pairs = [];
  const joints = Object.keys(p);
  for (let i = 0; i < joints.length; i++) {
    const from = hops(joints[i]);
    for (let k = i + 1; k < joints.length; k++) {
      const b = joints[k];
      const h = from.get(b) ?? Infinity;
      if (h >= 3) pairs.push({ a: joints[i], b, min: radius[joints[i]] + radius[b] });
    }
  }
  return { pairs, radius };
}

const _v = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _qd = new THREE.Quaternion();
const _qp = new THREE.Quaternion();

export class Ragdoll {
  /** @param avatar the OWNER's Avatar. @param impulse optional launch velocity. */
  constructor(avatar, impulse = null) {
    this.avatar = avatar;
    this.settledFor = 0;
    this.done = false;
    const h = avatar.vrm.humanoid;

    // capture rest references in WORLD space, before anything moves
    this.nodes = {};        // joint -> node (null for pure leaves handled below)
    this.p = {};            // joint -> current world pos
    this.prev = {};         // joint -> previous world pos (verlet)
    for (const j of JOINTS) {
      const node = h.getNormalizedBoneNode(j);
      if (!node) continue;
      this.nodes[j] = node;
      const wp = node.getWorldPosition(new THREE.Vector3());
      this.p[j] = wp.clone();
      this.prev[j] = wp.clone();
    }
    // a small random-ish shove so it doesn't collapse straight down like a
    // dropped puppet (varied by which frame it started — no RNG needed)
    if (impulse) for (const j of JOINTS) if (this.prev[j]) this.prev[j].sub(impulse);

    // rest length of each link
    this.links = LINKS.filter(([a, b]) => this.p[a] && this.p[b])
      .map(([a, b]) => ({ a, b, len: this.p[a].distanceTo(this.p[b]) }));

    // self-collision: bone-sized joint spheres that keep the body from folding
    // through itself. Radii measured from THIS skeleton.
    const sc = buildSelfCollision(this.p);
    this.selfPairs = sc.pairs;
    this.radius = sc.radius;

    // per-driven-bone rest reference: its world quaternion, and the world
    // direction to its child. Rotating restDir -> the live particle direction
    // and composing onto restQuat gives the bone's new world orientation,
    // without needing to know the model's private down-the-bone axis.
    this.drive = [];
    for (const [bone, child] of CHAINS) {
      const bn = this.nodes[bone];
      if (!bn || !this.p[child]) continue;
      const bwp = bn.getWorldPosition(new THREE.Vector3());
      this.drive.push({
        bone, child,
        restDir: this.p[child].clone().sub(bwp).normalize(),
        restQuat: bn.getWorldQuaternion(new THREE.Quaternion()),
        parent: bn.parent,
      });
    }

    this.rootStartY = avatar.root.position.y;
  }

  /** Advance the sim and push the result into the avatar as a held pose.
   *  Returns the sparse pose (for streaming) while active, or null once it has
   *  been captured and handed off. */
  step(dt) {
    if (this.done) return null;
    dt = Math.min(0.033, dt);

    // ---- integrate (verlet) + gravity
    let maxV = 0;
    for (const j of JOINTS) {
      const p = this.p[j]; if (!p) continue;
      const pr = this.prev[j];
      _v.copy(p).sub(pr).multiplyScalar(0.98);         // velocity w/ damping
      maxV = Math.max(maxV, _v.length() / dt);
      pr.copy(p);
      p.add(_v);
      p.y += GRAVITY * dt * dt;
    }
    // ---- satisfy bone-length constraints
    for (let it = 0; it < ITER; it++) {
      for (const { a, b, len } of this.links) {
        const pa = this.p[a], pb = this.p[b];
        _v.copy(pb).sub(pa);
        const d = _v.length() || 1e-4;
        _v.multiplyScalar((d - len) / d * 0.5);
        pa.add(_v); pb.sub(_v);
      }
      // ---- self-collision: keep non-adjacent joint spheres from overlapping,
      // so the body has volume instead of collapsing through itself
      for (const { a, b, min } of this.selfPairs) {
        const pa = this.p[a], pb = this.p[b];
        _v.copy(pb).sub(pa);
        const d = _v.length();
        if (d > 1e-4 && d < min) {
          _v.multiplyScalar((min - d) / d * 0.5);   // push each half the overlap
          pa.sub(_v); pb.add(_v);
        }
      }
      // ---- world collision: terrain AND props.
      //
      // resolveColliders is the SAME routine the walking controller uses — it
      // pushes a point out of any collider box's sides and returns the height
      // to rest on (terrain, or a box's top if the point is above it). Running
      // each joint through it makes a body drape over a crate or a desk instead
      // of sinking through it, using the exact OBBs everything else collides
      // against. Lights carry no collider, so a ragdoll never snags on a bulb.
      for (const j of JOINTS) {
        const p = this.p[j]; if (!p) continue;
        const x0 = p.x, z0 = p.z;
        const g = resolveColliders(p, heightAt, this.radius[j] ?? 0.1) + GROUND_R;
        const pushed = Math.abs(p.x - x0) > 1e-5 || Math.abs(p.z - z0) > 1e-5;
        if (p.y < g) {
          p.y = g;
          // friction: bleed horizontal motion on contact so it doesn't slide
          this.prev[j].x += (p.x - this.prev[j].x) * 0.4;
          this.prev[j].z += (p.z - this.prev[j].z) * 0.4;
        }
        // a sideways push out of a prop should also lose momentum, or the joint
        // just springs back in next step
        if (pushed) {
          this.prev[j].x += (p.x - this.prev[j].x) * 0.3;
          this.prev[j].z += (p.z - this.prev[j].z) * 0.3;
        }
      }
    }

    // ---- root follows the hips so the body lies where it fell
    const hips = this.p.hips;
    if (hips) {
      this.avatar.root.position.x = hips.x;
      this.avatar.root.position.z = hips.z;
      this.avatar.root.position.y = Math.min(this.rootStartY, hips.y - 0.82);
    }

    // ---- map particles back to bone rotations (world-reference method)
    const pose = {};
    for (const d of this.drive) {
      const bn = this.nodes[d.bone];
      const bwp = bn.getWorldPosition(_a);
      _b.copy(this.p[d.child]).sub(bwp);
      if (_b.lengthSq() < 1e-6) continue;
      _b.normalize();
      _qd.setFromUnitVectors(d.restDir, _b);           // rest -> live direction
      _qd.multiply(d.restQuat);                        // -> new world quaternion
      // world -> local (parent may itself have moved this frame)
      d.parent.getWorldQuaternion(_qp).invert();
      _qp.multiply(_qd);
      bn.quaternion.copy(_qp);
      pose[d.bone] = [+_qp.x.toFixed(4), +_qp.y.toFixed(4), +_qp.z.toFixed(4), +_qp.w.toFixed(4)];
    }
    // apply locally too, held, so the owner sees its own flop this frame
    this.avatar.setPose(pose);

    // ---- settle detection: hand off to a captured held pose and stop
    this.settledFor = maxV < SETTLE_V ? this.settledFor + 1 : 0;
    if (this.settledFor >= SETTLE_FRAMES) {
      this.done = true;
      this.finalPose = pose;
    }
    return pose;
  }
}
