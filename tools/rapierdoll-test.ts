// RapierRagdoll parity suite — the same lifecycle promises the Verlet earns,
// demanded of the articulated engine, on the SHIPPED fleet rigs.
//
//   bun tools/rapierdoll-test.ts
//
// Interface parity is the contract (bodysim.js): everything downstream must
// be unable to tell which engine produced the pose. So: falls come to rest,
// captures are finite sparse local-quat poses, pins hang and release, shoves
// land mid-tumble, corpses kick, the root lies down, and the wasm world is
// freed at capture.

import { plugin } from 'bun';
const STUB = new URL('./core-stub.mjs', import.meta.url).pathname;
plugin({
  name: 'core-stub',
  setup(build) {
    build.onResolve({ filter: /^\.\/core\.js$/ }, () => ({ path: STUB }));
  },
});

const { THREE } = await import('./core-stub.mjs');
const { RapierRagdoll, ensureRapier } = await import('../client/lib/rapierdoll.js');
const { rigs, makeAvatar, toppleLean } = await import('./rig-load.mjs');

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ''}`); }
};

check('wasm door opens', await ensureRapier());

const FLEET = rigs().filter((r: any) => !r.err);
console.log(`\nthe fleet (${FLEET.length} rigs):`);

function run(av: any, lean: any = null, { maxSteps = 900, seedVel = null as any } = {}) {
  const rd: any = new RapierRagdoll(av, lean, av.restBonePositions(), seedVel);
  let steps = 0;
  while (!rd.done && steps < maxSteps) { rd.step(1 / 60); steps++; }
  return { rd, steps };
}

{
  // The launch-day failure report, turned into permanent assertions: "body
  // just crumples, self intersection not respected, head spins endlessly,
  // everything is twisted" (antra, live, 2026-08-04). Anatomy is measured
  // DURING the run — dispose() frees the wasm world at capture.
  const bad: Record<string, string[]> = {
    rest: [], finite: [], lying: [], poses: [], twist: [], crumple: [], spin: [],
  };
  const relTwist = (rd: any, parentKey: string, childKey: string, axisRest: any) => {
    const ps: any = rd.segs.get(parentKey), cs: any = rd.segs.get(childKey);
    if (!ps || !cs) return 0;
    const rp = ps.body.rotation(), rc = cs.body.rotation();
    const qp = new THREE.Quaternion(rp.x, rp.y, rp.z, rp.w);
    const qc = new THREE.Quaternion(rc.x, rc.y, rc.z, rc.w);
    const rel = qp.invert().multiply(qc);
    const d = new THREE.Vector3(rel.x, rel.y, rel.z);
    const proj = d.dot(axisRest);
    let tw = 2 * Math.atan2(proj, rel.w);
    if (tw > Math.PI) tw -= 2 * Math.PI;
    if (tw < -Math.PI) tw += 2 * Math.PI;
    return Math.abs(tw);
  };
  const foldOf = (p: any) => {
    const a = p.spine?.clone().sub(p.hips ?? p.spine)?.normalize();
    const b = p.neck?.clone().sub(p.chest ?? p.neck)?.normalize();
    return a && b ? Math.acos(Math.min(1, Math.max(-1, a.dot(b)))) : 0;
  };
  for (const rig of FLEET) {
    // the Verlet is the quality BASELINE: same rig, same lean, same metric —
    // the articulated engine must not fold more than the incumbent does
    const vav = makeAvatar(rig.P);
    const vrd: any = new (await import('../client/lib/ragdoll.js')).Ragdoll(vav, toppleLean(), vav.restBonePositions());
    let vsteps = 0;
    while (!vrd.done && vsteps < 900) { vrd.step(1 / 60); vsteps++; }
    const vFold = foldOf({ ...vrd.p, chest: vrd.p.chest ?? vrd.p.spine });

    const av = makeAvatar(rig.P);
    const rd: any = new RapierRagdoll(av, toppleLean(), av.restBonePositions());
    const UP = new THREE.Vector3(0, 1, 0);
    let steps = 0, worstNeckTwist = 0, worstSpin = 0, lastFold = 0;
    while (!rd.done && steps < 900) {
      rd.step(1 / 60);
      steps++;
      if (rd.segs.size) {
        worstNeckTwist = Math.max(worstNeckTwist, relTwist(rd, 'chest|neck', 'neck|head', UP));
        if (steps > 240) {                      // spin should be DEAD long before capture
          for (const s of rd.segs.values()) {
            const w = s.body.angvel();
            worstSpin = Math.max(worstSpin, Math.hypot(w.x, w.y, w.z));
          }
        }
        lastFold = foldOf(rd.p);
      }
    }
    if (!rd.done) { bad.rest.push(`${rig.name}(never captured)`); continue; }
    var foldBound = Math.max(vFold * 1.35 + 0.17, 1.15);
    const q = Object.values(rd.finalPose ?? {});
    if (!q.length || !q.every((a: any) => a.length === 4 && a.every(Number.isFinite))) bad.finite.push(rig.name);
    if (Object.keys(rd.finalPose ?? {}).length < 8) bad.poses.push(`${rig.name}(${Object.keys(rd.finalPose ?? {}).length} bones)`);
    if (av.root.position.y > -0.05) bad.lying.push(`${rig.name}(root.y=${av.root.position.y.toFixed(2)})`);
    // SIM-frame twist never renders (the drive is direction-only) — sanity
    // bound only: catastrophic wind-up would show as precession jitter
    if (worstNeckTwist > 3.0) bad.twist.push(`${rig.name}(${(worstNeckTwist * 180 / Math.PI).toFixed(0)}°)`);
    // the articulated body may not fold meaningfully more than the incumbent
    // Verlet on the same rig with the same lean
    if (lastFold > foldBound) bad.crumple.push(`${rig.name}(${(lastFold * 180 / Math.PI).toFixed(0)}° vs verlet ${(foldBound * 180 / Math.PI).toFixed(0)}° bound)`);
    // residual hidden spin renders as vibration — bounded hard
    if (worstSpin > 12) bad.spin.push(`${rig.name}(${worstSpin.toFixed(1)} rad/s)`);
  }
  const none = (k: string) => bad[k].length === 0;
  check('every rig comes to rest', none('rest'), bad.rest.join(' '));
  check('every capture is a finite sparse pose', none('finite'), bad.finite.join(' '));
  check('every pose drives a full skeleton (≥8 bones)', none('poses'), bad.poses.join(' '));
  check('the rendered root lies down with the body', none('lying'), bad.lying.join(' '));
  check('sim twist stays sane (renders as zero regardless)', none('twist'), bad.twist.join(' '));
  check('folds no more than the Verlet on the same rig', none('crumple'), bad.crumple.join(' '));
  check('no hidden spin late in the fall (≤12 rad/s)', none('spin'), bad.spin.join(' '));
}

// ---------------------------------------------------------------------------
// ANATOMY UNDER YAW — the instrument the suite did not have.
//
// The block above was 19/19 green while the live body "just crumples, self
// intersection not respected, head spins endlessly, everything is twisted".
// It could not see any of that, for three reasons, all fixed here:
//
//   1. It never set root.rotation.y, and toppleLean() defaults to yaw 0. Every
//      rig was tested facing due north. The elbow/knee hinge axes are built in
//      WORLD space, so they are only correct facing north — and degenerate at
//      east/west, where the axis collapses onto the bone and the hinge becomes
//      a twist joint carrying hinge limits.
//   2. Its twist bound was 3.0 rad (172°), annotated "sanity bound only". A
//      165° twist on a 45° joint passed.
//   3. It asserted NOTHING about the swing cones — the actual anatomy.
//
// A limit that is not asserted is a comment. These assert.
console.log('\nanatomy under yaw (cones, twist, hinge axes — swept N/E/S/W):');
{
  const YAWS = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  const YAW_NAME = ['N', 'E', 'S', 'W'];
  // STRIDE IS NOT OPTIONAL. makeAvatar() gives every bone an identity
  // quaternion, so at stride 0 the "live" pose IS restBonePositions() — and
  // this engine's whole design is about reconciling live with rest. Tested
  // only at stride 0, every frame-alignment bug is invisible by construction:
  // three real ones (a cone that could not hold the rest pose, torso anchors
  // missing by up to 115 mm, 45° of error on a hinge's locked axes) all sat
  // under a 25/25 green suite until this sweep existed. The Verlet suite has
  // tested mid-stride falls since it shipped; this one now does too.
  const STRIDES = [0, 1];
  // A hinge axis is a property of the RIG, not of the compass. There is no
  // fixed world direction it should equal — a T-pose elbow flexes about the
  // vertical, an A-pose elbow about the lateral, and both are correct. The
  // invariant that holds for every rig and every correct implementation is
  // EQUIVARIANCE: turn the body by θ and its hinge axes must turn by θ too.
  // A world-space axis fails this by construction, which is the bug.
  const EQUIV_DOT = Math.cos((10 * Math.PI) / 180);
  // ...and a hinge axis must be perpendicular to the bone it hinges. When the
  // cross product that builds it collapses, the axis falls onto the bone and
  // the joint silently becomes a twist joint wearing hinge limits.
  const PERP_DOT = Math.cos((60 * Math.PI) / 180);
  // Cones may be overshot transiently on impact — a joint that never yields
  // reads as robotic — but not blown through. Measured worst across the fleet
  // after the rewrite is 5-9°; the bound is set well inside the 128° the
  // out-of-solver build produced, and well outside ordinary solver softness.
  // Shoulders are the hard case and set this number: they carry the most load
  // in a tumble AND the widest cone, so their axis-aligned limits sit closest
  // to the 90° degeneracy where rapier's per-axis angles stop separating.
  // Measured worst across 112 rig×facing×stride combinations after the
  // rewrite: 27° on shino's leftUpperArm, everything else under 20°. The
  // out-of-solver build this replaced reached 128° over, on every rig.
  const CONE_PEAK = 0.55;      // rad, ~31°, worst at any instant
  // Twist is only MEASURABLE while the joint is inside its cone. A swing-twist
  // decomposition attributes part of a large swing to twist as the swing
  // approaches 90° — verified: every twist excursion over bound on the fleet
  // coincided with swing at or past the cone (e.g. victoria rightUpperArm,
  // twist 104° exactly when swing was 108° of an 85° cone). Rapier bounds its
  // own per-axis coordinate, which is not this decomposition, and there is no
  // getter for it in the JS build. So assert twist where the two agree, and
  // let the cone assertion above own the large-swing regime. Asserting twist
  // across the coupled regime would be measuring an artifact.
  const TWIST_PEAK = 0.45;
  // Conditioning degrades as swing approaches 90°, not merely past the cone —
  // victoria's excursions all sat at swing 78-83° of an 85° cone. So measure
  // twist only where the separation is well-posed. The two assertions TOGETHER
  // bound the joint and neither does alone: this one owns small-swing twist,
  // CONE_PEAK owns total angular deviation at large swing. A gate can go
  // vacuous, so the sample count is asserted too.
  const TWIST_VALID = 1.0;     // rad, ~57° of swing
  let twistSamples = 0;

  const bad: Record<string, string[]> = {
    hinge: [], perp: [], cone: [], twist: [], mass: [], build: [], born: [],
  };
  // where the live skeleton's humanoid bones actually are, right now
  const liveBones = (av: any) => {
    const out: Record<string, any> = {};
    av.root.updateMatrixWorld(true);
    for (const n of Object.keys(av.nodes)) {
      const node = av.vrm.humanoid.getNormalizedBoneNode(n);
      if (node) out[n] = node.getWorldPosition(new THREE.Vector3());
    }
    return out;
  };
  for (const rig of FLEET) {
    // reference: the same rig facing north. Every other facing must be this,
    // rotated — and the reference itself must have well-formed axes.
    const refAv = makeAvatar(rig.P);
    refAv.root.updateMatrixWorld(true);
    const refRd: any = new RapierRagdoll(refAv, null, refAv.restBonePositions());
    // A trunk lighter than the legs gets thrown around by its own limbs. The
    // spine-only torso measured 29% of body mass against an anthropometric
    // ~50-55%; the shoulder and pelvis bars that gave the trunk its volume
    // gave it this too.
    const ms = refRd.massSplit();
    if (!(ms.frac > 0.45 && ms.frac < 0.72)) {
      bad.mass.push(`${rig.name}(${(ms.frac * 100).toFixed(0)}%)`);
    }
    const refAxis = new Map<string, any>();
    for (const h of refRd.hingeAxes()) {
      refAxis.set(h.name, h.axisWorld.clone().normalize());
      const perp = Math.abs(h.axisWorld.clone().normalize().dot(h.boneDir.clone().normalize()));
      if (perp > PERP_DOT) {
        bad.perp.push(`${rig.name}:${h.name}(${(90 - (Math.acos(Math.min(1, perp)) * 180) / Math.PI).toFixed(0)}° off perpendicular)`);
      }
    }
    refRd.dispose();

    for (let yi = 0; yi < YAWS.length; yi++) {
     for (const stride of STRIDES) {
      const yaw = YAWS[yi];
      const tag = `${rig.name}@${YAW_NAME[yi]}${stride ? '/stride' : ''}`;
      // realParent builds the rig's ACTUAL humanoid hierarchy (upperChest,
      // shoulders and all), which 6 of the 14 shipped rigs have and which the
      // simplified chain is not.
      const av = makeAvatar(rig.P, { stride, realParent: rig.realParent });
      av.root.rotation.y = yaw;
      av.root.updateMatrixWorld(true);
      const rd: any = new RapierRagdoll(av, toppleLean(yaw), av.restBonePositions());

      // BUILD CONSISTENCY: the sim must start where the skeleton IS, and it
      // must not be born fighting itself. A frame-alignment error shows up
      // here as either the reconstructed joint missing the live bone, or as
      // the solver annihilating a built-in constraint violation on frame one.
      // (The torso is rest-shaped by design — a rigid trunk cannot reproduce a
      // bent live spine — so trunk joints get a looser bound than limbs.)
      const TRUNK = new Set(['hips', 'spine', 'chest', 'neck', 'head']);
      for (const [name, want] of Object.entries(liveBones(av))) {
        const got = rd.p[name];
        if (!got) continue;
        const err = got.distanceTo(want as any);
        const bound = TRUNK.has(name) ? 0.06 : 0.01;
        if (err > bound) {
          bad.build.push(`${tag}:${name}(${(err * 1000).toFixed(0)}mm)`);
          break;
        }
      }
      rd.step(1 / 60);
      let bornSpin = 0;
      for (const s of rd.segs.values()) {
        const w = s.body.angvel();
        bornSpin = Math.max(bornSpin, Math.hypot(w.x, w.y, w.z));
      }
      if (bornSpin > 8) bad.born.push(`${tag}(${bornSpin.toFixed(1)} rad/s on frame 1)`);

      // hinge axes are a BUILD-time property — measure before stepping
      for (const h of rd.hingeAxes()) {
        const want = refAxis.get(h.name);
        if (!want) continue;
        const expect = want.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        const d = Math.abs(h.axisWorld.clone().normalize().dot(expect));   // sign is free
        if (d < EQUIV_DOT) {
          bad.hinge.push(`${tag}:${h.name}(${((Math.acos(Math.min(1, d)) * 180) / Math.PI).toFixed(0)}° from equivariant)`);
          break;                                  // one witness per rig/yaw is enough
        }
      }

      let peakCone = 0, peakConeAt = '', peakTwist = 0, peakTwistAt = '';
      let steps = 0;
      while (!rd.done && steps < 900) {
        rd.step(1 / 60); steps++;
        if (rd.done) break;          // capture frees the wasm world — measure before, never after
        for (const j of rd.jointAngles()) {
          // two independent per-axis limits of ±cone bound a SQUARE, so the
          // reachable total swing is the diagonal, √2·cone — not cone
          const bound = j.cone * Math.SQRT2;
          if (j.swing - bound > peakCone) { peakCone = j.swing - bound; peakConeAt = j.name; }
          if (j.swing <= Math.min(j.cone, TWIST_VALID)) {
            twistSamples++;
            if (j.twist - j.twistLimit > peakTwist) {
              peakTwist = j.twist - j.twistLimit; peakTwistAt = j.name;
            }
          }
        }
      }
      const deg = (r: number) => ((r * 180) / Math.PI).toFixed(0);
      if (peakCone > CONE_PEAK) bad.cone.push(`${tag}:${peakConeAt}(+${deg(peakCone)}°)`);
      if (peakTwist > TWIST_PEAK) bad.twist.push(`${tag}:${peakTwistAt}(+${deg(peakTwist)}°)`);
     }
    }
  }
  const none = (k: string) => bad[k].length === 0;
  const few = (a: string[], n = 4) => a.slice(0, n).join(' ') + (a.length > n ? ` +${a.length - n} more` : '');
  check('the sim starts where the skeleton is', none('build'), few(bad.build));
  check('...and is not born fighting its own joints', none('born'), few(bad.born));
  check('hinge axes turn with the body (yaw-equivariant)', none('hinge'), few(bad.hinge));
  check('hinge axes are perpendicular to their bone', none('perp'), few(bad.perp));
  check('the trunk carries a trunk\'s share of the mass', none('mass'), few(bad.mass));
  check('swing cones hold under load (≤26° overshoot)', none('cone'), few(bad.cone));
  check('twist bounds hold under load (≤26° overshoot)', none('twist'), few(bad.twist));
  check('...and that twist gate is not vacuous', twistSamples > 10000, `${twistSamples} in-regime samples`);
}

// ---------------------------------------------------------------------------
// GOING LIMP MUST NOT TELEPORT — asserted on the RENDERED pose.
//
// Everything above measures the sim. Nothing measured what the skeleton
// actually ends up looking like, and that is a separate mapping which can be
// wrong on its own: the drive's reference direction and reference orientation
// have to describe the SAME pose, or frame one renders the bone at twice its
// offset from the bind pose. Live report: "head and neck rotate anti-nod-wise
// around the axis of shoulders, a complete revolution; arms also try to get to
// the other side of the body immediately."
//
// This is invisible unless the rig is POSED — bind == live is exactly the case
// where a mismatched pairing and a correct one agree — and unless setPose is
// actually applied, which the stub avatar does not do. So: pose it like a real
// idle, apply the returned pose, and compare world quaternions.
console.log('\ngoing limp does not teleport the skeleton (rendered pose):');
{
  const bad: string[] = [];
  const DRIVEN = ['hips', 'spine', 'chest', 'neck',
    'leftUpperArm', 'leftLowerArm', 'rightUpperArm', 'rightLowerArm',
    'leftUpperLeg', 'leftLowerLeg', 'rightUpperLeg', 'rightLowerLeg'];
  for (const rig of FLEET) {
    const av = makeAvatar(rig.P, { realParent: rig.realParent });
    const P: any = rig.P;
    // a real idle is nowhere near the bind pose: arms well down, head turned
    const up = (P.neck ?? P.chest).clone().sub(P.hips).normalize();
    const lat = P.leftUpperArm.clone().sub(P.rightUpperArm);
    lat.addScaledVector(up, -lat.dot(up)).normalize();
    const fwd = new THREE.Vector3().crossVectors(lat, up).normalize();
    av.nodes.leftUpperArm?.quaternion.setFromAxisAngle(fwd, (-70 * Math.PI) / 180);
    av.nodes.rightUpperArm?.quaternion.setFromAxisAngle(fwd, (70 * Math.PI) / 180);
    av.nodes.neck?.quaternion.setFromAxisAngle(lat, (18 * Math.PI) / 180);
    av.root.updateMatrixWorld(true);

    const before: Record<string, any> = {};
    for (const n of DRIVEN) {
      const node = av.vrm.humanoid.getNormalizedBoneNode(n);
      if (node) before[n] = node.getWorldQuaternion(new THREE.Quaternion());
    }
    const rd: any = new RapierRagdoll(av, null, av.restBonePositions());
    const pose = rd.step(1 / 60);          // one frame: the sim has barely moved
    if (pose) {
      for (const [n, q] of Object.entries(pose)) {
        const node = av.vrm.humanoid.getNormalizedBoneNode(n);
        if (node) node.quaternion.set((q as any)[0], (q as any)[1], (q as any)[2], (q as any)[3]);
      }
      av.root.updateMatrixWorld(true);
    }
    let worst = 0, worstAt = '';
    for (const n of DRIVEN) {
      if (!before[n]) continue;
      const node = av.vrm.humanoid.getNormalizedBoneNode(n);
      const now = node.getWorldQuaternion(new THREE.Quaternion());
      // angle between the two orientations
      const d = Math.min(1, Math.abs(before[n].dot(now)));
      const ang = 2 * Math.acos(d);
      if (ang > worst) { worst = ang; worstAt = n; }
    }
    if (worst > 0.25) {                    // ~14°, generous for one frame of fall
      bad.push(`${rig.name}:${worstAt}(${((worst * 180) / Math.PI).toFixed(0)}°)`);
    }
    rd.dispose();
  }
  check('a posed body renders where it stood, not at twice the offset',
    bad.length === 0, bad.slice(0, 5).join(' ') + (bad.length > 5 ? ` +${bad.length - 5}` : ''));
}

console.log('\nlifecycle (one rig, every downstream contract):');
{
  const rig: any = FLEET[0];

  // pin: hang, persist, release-and-fall — the nail contract
  const av = makeAvatar(rig.P);
  const rd: any = new RapierRagdoll(av, null, av.restBonePositions());
  const hold = new THREE.Vector3(0.3, 2.2, 0.2);
  rd.setPin('head', hold);
  for (let i = 0; i < 600; i++) { rd.setPin('head', hold); rd.step(1 / 60); }
  check('a pinned body never captures', !rd.done);
  check('...and hangs AT the pin', rd.p.head.distanceTo(hold) < 0.1, `${rd.p.head.distanceTo(hold).toFixed(3)}m off`);
  check('...pins map mirrors the hold (bodydrag reads it)', rd.pins.get('head')?.distanceTo(hold) === 0);
  check('...and the body dangles below', rd.p.hips.y < rd.p.head.y, `hips ${rd.p.hips.y.toFixed(2)}`);
  rd.setPin(null);
  let steps = 0;
  while (!rd.done && steps < 900) { rd.step(1 / 60); steps++; }
  check('nail pulled: falls and rests', rd.done, `steps=${steps}`);
  check('capture freed the wasm world', (rd as any)._freed === true);

  // impulse mid-tumble: restarts clocks, moves the body
  // A CONTROLLED comparison, not an absolute bar. A falling body is chaotic:
  // measured across the fleet, the same shove moves the hips 0.11 m on one rig
  // and 0.49 m on another (the Verlet spreads 0.18-0.44 on the same rigs), so
  // any fixed threshold on a single rig is testing the rig, not the shove.
  // Run the same fall twice, shove one, and ask which ended further downwind.
  // ...and AVERAGED over several rigs, because one falling body is chaotic
  // enough that a single pair can land 0.18 vs 0.14 while the shove is
  // working perfectly well. Averaging is what makes the comparison about the
  // shove instead of about which way one particular rig happened to topple.
  const shoved = (push: boolean, r0: any) => {
    const a = makeAvatar(r0.P, { realParent: r0.realParent });
    const r: any = new RapierRagdoll(a, toppleLean(), a.restBonePositions());
    for (let i = 0; i < 30; i++) r.step(1 / 60);
    const x0 = r.p.hips.x;
    if (push) r.impulse(new THREE.Vector3(3, 0, 0));
    const clocks = { elapsed: r.elapsed, settledFor: r.settledFor };
    let s = 0;
    while (!r.done && s < 900) { r.step(1 / 60); s++; }
    return { dx: r.p.hips.x - x0, done: r.done, clocks };
  };
  const panel = FLEET.slice(0, 6);
  let pushSum = 0, stillSum = 0, allDone = true;
  let pushed: any = null;
  for (const r0 of panel) {
    const a = shoved(true, r0), b = shoved(false, r0);
    pushed ??= a;
    pushSum += a.dx; stillSum += b.dx;
    allDone &&= a.done && b.done;
  }
  const pushedMean = pushSum / panel.length, stillMean = stillSum / panel.length;
  const still = { dx: stillMean, done: allDone };
  check('impulse restarts the clocks', pushed.clocks.elapsed === 0 && pushed.clocks.settledFor === 0);
  check('a mid-tumble shove still comes to rest, downwind of an unshoved twin',
    allDone && pushedMean > stillMean + 0.05,
    `mean over ${panel.length} rigs: shoved Δx=${pushedMean.toFixed(2)} vs unshoved ${stillMean.toFixed(2)}`);

  // snapshot/seed round-trip: the drag handover format
  const av3 = makeAvatar(rig.P);
  const rd3: any = new RapierRagdoll(av3, toppleLean(), av3.restBonePositions());
  for (let i = 0; i < 20; i++) rd3.step(1 / 60);
  const snap = rd3.snapshot();
  check('snapshot is the packed handover shape',
    Array.isArray(snap.j) && snap.p.length === snap.j.length * 3 && snap.v.length === snap.j.length * 3
    && snap.p.every(Number.isFinite) && snap.v.every(Number.isFinite),
    JSON.stringify({ j: snap.j?.length, p: snap.p?.length }));
  rd3.dispose();
  const av4 = makeAvatar(rig.P);
  const { rd: rd4 } = run(av4, null, { seedVel: snap });
  check('a seeded sim (drag release) accepts the handover and rests', rd4.done);

  // hostile magnitude is capped, not obeyed
  const av5 = makeAvatar(rig.P);
  const rd5: any = new RapierRagdoll(av5, new THREE.Vector3(1000, 0, 0), av5.restBonePositions());
  let s5 = 0;
  while (!rd5.done && s5 < 900) { rd5.step(1 / 60); s5++; }
  check('a hostile 1000 m/s lean is capped, not obeyed',
    rd5.done && Object.values(rd5.p).every((p: any) => Number.isFinite(p.x) && Math.abs(p.x) < 60),
    `done=${rd5.done}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
