// Test stand-in for client/lib/core.js — see tools/ragdoll-test.ts.
// core.js builds a WebGPURenderer at import time; headless tests swap in this
// module, which exports only what ragdoll's dependency cone touches.
// three is imported by explicit path because tools/ sits outside client/,
// where the npm install lives — this resolves to the SAME module instance
// colliders.js gets for its bare 'three' specifier.
import * as THREE from '../client/node_modules/three/build/three.module.js';
export { THREE };
export const scene = { add() {}, remove() {} };
export const ground = null;
export const grid = null;
export const bus = { on() {}, emit() {} };
