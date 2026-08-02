import { plugin } from 'bun';
const STUB = new URL('./core-stub.mjs', import.meta.url).pathname;
plugin({ name: 'core-stub', setup(b) { b.onResolve({ filter: /^\.\/core\.js$/ }, () => ({ path: STUB })); } });
const { THREE } = await import('./core-stub.mjs');
const { Ragdoll } = await import('../client/lib/ragdoll.js');
const WORLD = { hips:[0,.95,0], spine:[0,1.05,0], chest:[0,1.2,0], neck:[0,1.4,0], head:[0,1.5,0],
 leftUpperArm:[.18,1.35,0], leftLowerArm:[.45,1.35,0], leftHand:[.7,1.35,0],
 rightUpperArm:[-.18,1.35,0], rightLowerArm:[-.45,1.35,0], rightHand:[-.7,1.35,0],
 leftUpperLeg:[.09,.85,0], leftLowerLeg:[.09,.45,0], leftFoot:[.09,.05,0],
 rightUpperLeg:[-.09,.85,0], rightLowerLeg:[-.09,.45,0], rightFoot:[-.09,.05,0] };
const PARENT = { hips:null, spine:'hips', chest:'spine', neck:'chest', head:'neck',
 leftUpperArm:'chest', leftLowerArm:'leftUpperArm', leftHand:'leftLowerArm',
 rightUpperArm:'chest', rightLowerArm:'rightUpperArm', rightHand:'rightLowerArm',
 leftUpperLeg:'hips', leftLowerLeg:'leftUpperLeg', leftFoot:'leftLowerLeg',
 rightUpperLeg:'hips', rightLowerLeg:'rightUpperLeg', rightFoot:'rightLowerLeg' };
function make() { const root = new THREE.Object3D(); const nodes = {};
 for (const j of Object.keys(WORLD)) { const n = new THREE.Object3D(); const p = PARENT[j];
  const w = WORLD[j], pw = p ? WORLD[p] : [0,0,0];
  n.position.set(w[0]-pw[0], w[1]-pw[1], w[2]-pw[2]); (p ? nodes[p] : root).add(n); nodes[j] = n; }
 root.updateMatrixWorld(true);
 return { root, vrm: { humanoid: { getNormalizedBoneNode: j => nodes[j] ?? null } }, setPose(){} }; }
const IMPULSES = [[0,0,0],[0.09,-0.03,0.05],[0.3,0.1,0.2],[0.02,0,0.01],[-0.15,-0.1,0.25],
 [0.5,0.2,-0.3],[0,0.15,0],[-0.4,0,0],[0.2,0.3,-0.1],[-0.05,0.05,-0.35]];
let settled = 0, deadline = 0, worstTransient = 0, worstFinal = 0, worstStretch = 0;
for (const imp of IMPULSES) {
  const rd = new Ragdoll(make(), new THREE.Vector3(...imp));
  let worst = 0, s = 0;
  const viol = () => Math.max(0, ...rd.bends.map(({a,b,c,min,max}) => {
    const u = rd.p[b].clone().sub(rd.p[a]).normalize(), v = rd.p[c].clone().sub(rd.p[b]).normalize();
    const A = Math.acos(Math.max(-1, Math.min(1, u.dot(v))));
    return Math.max(min-A, A-max); }));
  while (!rd.done && s < 3000) { rd.step(1/60); s++; worst = Math.max(worst, viol()); }
  const stretch = Math.max(...rd.links.map(l => Math.abs(rd.p[l.a].distanceTo(rd.p[l.b]) - l.len) / l.len));
  if (rd.done && s < 470) settled++; else if (rd.done) deadline++;
  worstTransient = Math.max(worstTransient, worst);
  worstFinal = Math.max(worstFinal, viol());
  worstStretch = Math.max(worstStretch, stretch);
}
const d = r => +(r*180/Math.PI).toFixed(1);
console.log(JSON.stringify({ settled, deadline, transient: d(worstTransient), final: d(worstFinal), stretchPct: +(worstStretch*100).toFixed(1) }));
