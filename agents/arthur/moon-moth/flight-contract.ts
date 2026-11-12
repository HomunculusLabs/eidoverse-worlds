/** Local-only deployment contract. This module NEVER uploads, joins, or emits.
 * The sandbox script cannot import this module; flight.test.ts pins parity.
 *
 * Parent preflight/bind requirements:
 * - Spawn nx-moonmoth-001 at the EXACT site perch/yaw, scale 1, no parent.
 * - Add sockets.seat {pos: <measured STATIC central-body surface>, pose:'sitchair'}.
 *   Omit `part`: neither moon_wing_left nor moon_wing_right may carry the rider.
 * - Apply fixed wing pendulums as motion:moon_wing_left / motion:moon_wing_right;
 *   flight.js never changes those comps. Do not install a whole-body idle motion.
 * - Prefer lock:true against punt/drag. Motion remains legal when locked.
 * - rootFlightBounds is ROOT-only, not collision clearance. Inflate it by the
 *   decoded, yawed, ARTICULATED model + rider envelope; verify terrain and nearby
 *   works along the vertical column and elevated circuit against the final site.
 *   altitudeAGL is relative to groundY AT THE PERCH, not terrain-following.
 * - Flight stays at authored yaw; it intentionally does not face path tangents.
 * - Use {id: ENTITY_ID, action:'fly'}. Present actor must be within 4m of seat;
 *   SDK exposes no participant mount/seat state, so this is NOT a seated-only gate.
 * - Bind/rebind only after model/site approval. Check debug for script errors.
 *   No load-time motion emits. Rebind clears kv but same-path recovery is safe.
 * - Return uses motion:null ONLY after `once` reached the unchanged logged base.
 *   There is no place reset and no automatic passenger mount/dismount.
 */
export type Vec3 = readonly [number, number, number];
export type FlightSite = { perch: Vec3; groundY: number; yaw: number };
export const ENTITY_ID = 'nx-moonmoth-001';
export const BEHAVIOR_ID = ENTITY_ID + '-flight';
export const FLIGHT_POLICY = Object.freeze({
  durationSeconds: 90, radius: 6, altitudeAGL: 22, circleSegments: 48,
  proximity: 4, timerSeconds: 5,
  // Successful ordinary motion emissions; private bstate is coalesced by host.
  maxEmitsPerActivation: 1, maxEmitsPerMinute: 2,
});
function checkedSite(site: FlightSite): FlightSite {
  const { perch, groundY, yaw } = site ?? {};
  if (!Array.isArray(perch) || perch.length !== 3 || !perch.every(Number.isFinite)
    || perch.some(v => Math.abs(v) > 512) || !Number.isFinite(groundY) || Math.abs(groundY) > 512
    || !Number.isFinite(yaw) || Math.abs(yaw) > Math.PI || perch[1] < groundY || perch[1] > groundY + 4) {
    throw new Error('Invalid Moon Moth site: finite bounded perch/groundY and radian yaw required');
  }
  return { perch: [...perch] as [number, number, number], groundY, yaw };
}
export function makeFlightBinding(src: string, site: FlightSite) {
  if (typeof src !== 'string' || !/^store\/scripts\/[a-f0-9]{16}\.js$/.test(src)) {
    throw new Error('Expected the exact returned content-addressed script store path');
  }
  return { id: BEHAVIOR_ID, src, attach: ENTITY_ID,
    caps: { verbs: ['motion'], selfOnly: true }, knobs: checkedSite(site) };
}
export function rootFlightBounds(site: FlightSite) {
  const { perch: [x, y, z], groundY } = checkedSite(site);
  return { min: [x, y, z - 6], max: [x + 12, groundY + 22, z + 6] };
}
/** Payloads for the PARENT's paced comp installer, not emitted by flight.js.
 * Model rest z rotations are -0.45 (left), +0.45 (right). Both use local +Z;
 * opposite cosine phases keep their tips raised symmetrically in [0.23,0.67]. */
export function wingMotionComponents(t0: number) {
  if (!Number.isSafeInteger(t0) || t0 < 0) throw new Error('A shared epoch in milliseconds is required');
  return ['moon_wing_left', 'moon_wing_right'].map((part, index) => ({
    id: ENTITY_ID, type: 'motion:' + part,
    data: { type: 'pendulum', axis: [0, 0, 1], pivot: [0, 0, 0],
      amp: 0.22, period: 5.5, phase: index === 0 ? Math.PI : 0, damp: 0, t0 },
  }));
}
