// ragdoll sim test — the physics, run headless, no browser and no renderer.
//
//   bun tools/ragdoll-test.ts
//
// core.js builds a WebGPURenderer at import time, so it cannot load under Bun;
// a loader plugin swaps it for a stub exporting just what ragdoll's dependency
// cone actually uses (THREE, and terrain's scene/ground/grid). The skeleton is
// synthetic — a T-pose humanoid of plain Object3Ds — because the invariants
// under test live in the particle sim, not in any particular VRM.
//
// What it asserts:
//   * the body settles into a held pose (the capture handoff fires)
//   * bone lengths survive the tumble (the skeleton doesn't stretch)
//   * every joint stays inside its BEND_LIMITS range for the WHOLE tumble
//   * the same tumble with limits disabled DOES violate them — i.e. the
//     assertion above is load-bearing, not vacuously true
//   * nothing ends underground, and the captured pose is finite

import { plugin } from 'bun';

const STUB = new URL('./core-stub.mjs', import.meta.url).pathname;
plugin({
  name: 'core-stub',
  setup(build) {
    build.onResolve({ filter: /^\.\/core\.js$/ }, () => ({ path: STUB }));
  },
});

const { THREE } = await import('./core-stub.mjs');
const { Ragdoll } = await import('../client/lib/ragdoll.js');

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ''}`); }
};

// ---- synthetic T-pose skeleton (world-space joint positions, then local)
const WORLD: Record<string, [number, number, number]> = {
  hips: [0, 0.95, 0], spine: [0, 1.05, 0], chest: [0, 1.2, 0],
  neck: [0, 1.4, 0], head: [0, 1.5, 0],
  leftUpperArm: [0.18, 1.35, 0], leftLowerArm: [0.45, 1.35, 0], leftHand: [0.7, 1.35, 0],
  rightUpperArm: [-0.18, 1.35, 0], rightLowerArm: [-0.45, 1.35, 0], rightHand: [-0.7, 1.35, 0],
  leftUpperLeg: [0.09, 0.85, 0], leftLowerLeg: [0.09, 0.45, 0], leftFoot: [0.09, 0.05, 0],
  rightUpperLeg: [-0.09, 0.85, 0], rightLowerLeg: [-0.09, 0.45, 0], rightFoot: [-0.09, 0.05, 0],
};
const PARENT: Record<string, string | null> = {
  hips: null, spine: 'hips', chest: 'spine', neck: 'chest', head: 'neck',
  leftUpperArm: 'chest', leftLowerArm: 'leftUpperArm', leftHand: 'leftLowerArm',
  rightUpperArm: 'chest', rightLowerArm: 'rightUpperArm', rightHand: 'rightLowerArm',
  leftUpperLeg: 'hips', leftLowerLeg: 'leftUpperLeg', leftFoot: 'leftLowerLeg',
  rightUpperLeg: 'hips', rightLowerLeg: 'rightUpperLeg', rightFoot: 'rightLowerLeg',
};

function makeAvatar(scale = 1) {
  const root = new THREE.Object3D();
  const nodes: Record<string, any> = {};
  for (const j of Object.keys(WORLD)) {
    const n = new THREE.Object3D();
    n.name = j;
    const p = PARENT[j];
    const w = WORLD[j], pw = p ? WORLD[p] : [0, 0, 0];
    n.position.set((w[0] - pw[0]) * scale, (w[1] - pw[1]) * scale, (w[2] - pw[2]) * scale);
    (p ? nodes[p] : root).add(n);
    nodes[j] = n;
  }
  root.updateMatrixWorld(true);
  return {
    root,
    nodes,
    vrm: { humanoid: { getNormalizedBoneNode: (j: string) => nodes[j] ?? null } },
    setPose(_pose: any) { this.poses = (this.poses ?? 0) + 1; },
    poses: 0,
  };
}

const angleAt = (rd: any, a: string, b: string, c: string) => {
  const u = rd.p[b].clone().sub(rd.p[a]).normalize();
  const v = rd.p[c].clone().sub(rd.p[b]).normalize();
  return Math.acos(Math.max(-1, Math.min(1, u.dot(v))));
};

// run one tumble, tracking the worst bend-limit violation seen on ANY step
function tumble(impulse: any, { disableLimits = false, maxSteps = 3000, scale = 1 } = {}) {
  const avatar = makeAvatar(scale);
  const rd = new Ragdoll(avatar, impulse);
  const bends = rd.bends.map((b: any) => ({ ...b }));  // keep a copy for measuring
  if (disableLimits) rd.bends = [];
  let worst = 0; // radians beyond [min, max], worst over all joints and steps
  let steps = 0;
  while (!rd.done && steps < maxSteps) {
    rd.step(1 / 60);
    steps++;
    for (const { a, b, c, min, max } of bends) {
      const ang = angleAt(rd, a, b, c);
      worst = Math.max(worst, min - ang, ang - max);
    }
  }
  return { rd, avatar, steps, worst, bends };
}

const deg = (r: number) => (r * 180 / Math.PI).toFixed(1);

console.log('ragdoll sim, headless:');

// ---- construction
{
  const rd = new Ragdoll(makeAvatar(), null);
  check('all 11 bend limits resolve on a full skeleton', rd.bends.length === 11,
    `got ${rd.bends.length}`);
  check('every resolved range is sane (0 ≤ min < max ≤ π)',
    rd.bends.every((b: any) => b.min >= 0 && b.min < b.max && b.max <= Math.PI + 1e-9));
}

// ---- a violent tumble, limits ON
{
  const { rd, avatar, steps, worst } = tumble(new THREE.Vector3(0.09, -0.03, 0.05));
  check('the body settles and captures a pose', rd.done && !!rd.finalPose,
    `steps=${steps}`);
  // the clamp is SOFT (50%/pass — see ragdoll.js for why exact snapping and
  // angle caps both lose), so transient overshoot during impact frames is
  // expected; it decays at 0.5^ITER per frame. 10° covers an ordinary tumble
  // with margin — pre-limits violations ran 60°+.
  const SLOP = 10 * Math.PI / 180;
  check('no joint ever leaves its motion range (±10° transient slop)', worst <= SLOP,
    `worst violation ${deg(worst)}°`);
  const finalViol = Math.max(0, ...rd.bends.map(({ a, b, c, min, max }: any) => {
    const ang = angleAt(rd, a, b, c);
    return Math.max(min - ang, ang - max);
  }));
  check('the CAPTURED pose is within range (±5°)', finalViol <= 5 * Math.PI / 180,
    `final violation ${deg(finalViol)}°`);
  const stretch = Math.max(...rd.links.map((l: any) =>
    Math.abs(rd.p[l.a].distanceTo(rd.p[l.b]) - l.len) / l.len));
  check('bone lengths survive (≤10% stretch at settle)', stretch <= 0.10,
    `worst ${(stretch * 100).toFixed(1)}%`);
  check('nothing settles underground',
    Object.keys(rd.p).every((j: string) => rd.p[j].y >= -0.01));
  check('captured pose is finite quaternions',
    Object.values(rd.finalPose).every((q: any) =>
      q.length === 4 && q.every((x: number) => Number.isFinite(x))));
  check('owner saw its own flop (setPose ran every step)', avatar.poses === steps,
    `${avatar.poses} vs ${steps}`);
}

// ---- avatar proportions: the root-follow offset is measured per skeleton,
// not assumed. On a youngopus-proportioned body (hips ~0.59 vs claude_suit's
// 0.85) the old hardcoded 0.82 rendered the pelvis ~25cm underground; the
// invariant is that the hips BONE tracks the hips PARTICLE at all times.
{
  for (const [label, scale] of [['adult', 1], ['short (youngopus-ish)', 0.62]] as const) {
    const { rd, avatar } = tumble(new THREE.Vector3(0.09, -0.03, 0.05), { scale });
    avatar.root.updateMatrixWorld(true);
    const boneY = avatar.nodes.hips.getWorldPosition(new THREE.Vector3()).y;
    const gap = Math.abs(boneY - rd.p.hips.y);
    check(`${label}: hips bone tracks hips particle (gap ≤ 2cm)`, gap <= 0.02,
      `gap ${(gap * 100).toFixed(1)}cm`);
    check(`${label}: pelvis is driven (pose streams hips)`, !!rd.finalPose?.hips);
    // the shove knocks it flat: the pelvis must actually TIP, not stand
    // upright inside a lying body
    const up = new THREE.Vector3(0, 1, 0)
      .applyQuaternion(avatar.nodes.hips.getWorldQuaternion(new THREE.Quaternion()));
    check(`${label}: pelvis lies down with the body (tilt > 30°)`,
      Math.acos(Math.min(1, Math.abs(up.y))) > 30 * Math.PI / 180
      || rd.p.hips.y > 0.3 /* unless it settled propped high */,
      `tilt ${deg(Math.acos(Math.min(1, Math.abs(up.y))))}°`);
  }
}

// ---- the straight-down collapse (goLimp's default null impulse). The limits
// make its end state marginally stable — a slumped sit that micro-wobbles —
// so this exercises the deadline: the sim must ALWAYS end in a captured pose.
{
  const { rd, steps, worst } = tumble(null, { maxSteps: 8 * 60 + 30 });
  check('zero-impulse collapse still ends in a captured pose (deadline)',
    rd.done && !!rd.finalPose, `steps=${steps}`);
  check('…and stays near range while it wobbles (±15°)', worst <= 15 * Math.PI / 180,
    `worst violation ${deg(worst)}°`);
}

// ---- the SAME tumble with limits disabled must violate them, or the pass
// above proves nothing
{
  const { worst, steps } = tumble(new THREE.Vector3(0.09, -0.03, 0.05), { disableLimits: true });
  check('control: without the clamp the same tumble breaks the ranges',
    worst > 20 * Math.PI / 180, `worst only ${deg(worst)}° after ${steps} steps`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
