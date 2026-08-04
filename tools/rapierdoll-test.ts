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
  const av2 = makeAvatar(rig.P);
  const rd2: any = new RapierRagdoll(av2, toppleLean(), av2.restBonePositions());
  for (let i = 0; i < 30; i++) rd2.step(1 / 60);
  const x0 = rd2.p.hips.x;
  rd2.impulse(new THREE.Vector3(3, 0, 0));
  check('impulse restarts the clocks', rd2.elapsed === 0 && rd2.settledFor === 0);
  let s2 = 0;
  while (!rd2.done && s2 < 900) { rd2.step(1 / 60); s2++; }
  check('a mid-tumble shove still comes to rest, downwind',
    rd2.done && rd2.p.hips.x - x0 > 0.15, `Δx=${(rd2.p.hips.x - x0).toFixed(2)}`);

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
