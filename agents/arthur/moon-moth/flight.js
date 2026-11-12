// Moon Moth v1 — plain JavaScript for sdk/behavior.d.ts / server QuickJS.
// Bind only to nx-moonmoth-001 with caps {verbs:['motion'], selfOnly:true}.
// Native paths are ABSOLUTE, arc-length-linear polylines, not local splines.
// face:false deliberately preserves the authored heading (no segment-yaw snaps).
// The circle is above the perch, tangent to it, radius 6m (12m swept root reach).
(() => {
  const ID = 'nx-moonmoth-001';
  const DURATION = 90;
  const vec = v => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
  const near = (a, b, epsilon) => vec(a) && vec(b)
    && Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) <= epsilon;
  const { perch, groundY, yaw } = world.knobs;
  if (world.self !== ID || !vec(perch) || perch.some(v => Math.abs(v) > 512)
    || !Number.isFinite(groundY) || Math.abs(groundY) > 512
    || !Number.isFinite(yaw) || Math.abs(yaw) > Math.PI
    || perch[1] < groundY || perch[1] > groundY + 4) return;
  const points = [perch, [perch[0], groundY + 22, perch[2]]];
  for (let i = 1; i < 48; i++) {
    const a = i * 2 * Math.PI / 48;
    points.push([perch[0] + 6 * (1 - Math.cos(a)), groundY + 22, perch[2] + 6 * Math.sin(a)]);
  }
  points.push([perch[0], groundY + 22, perch[2]], perch);
  function carrier() {
    const e = world.entity(ID);
    const seat = e && e.comp && e.comp.sockets && e.comp.sockets.seat;
    return e && !e.parent && near(e.pos, perch, 1e-6)
      && Number.isFinite(e.yaw) && Math.abs(e.yaw - yaw) <= 1e-6
      && seat && vec(seat.pos) && !Object.prototype.hasOwnProperty.call(seat, 'part') ? e : null;
  }
  function emitMotion(args) {
    if (Date.now() < (world.kv.get('retryAt') || 0)) return false;
    try {
      world.emit('motion', args);
      world.kv.set('retryAt', null);
      return true;
    } catch (error) {
      // Persisted backoff bounds refused attempts too; private log, never chat.
      world.kv.set('retryAt', Date.now() + 10000);
      world.log('Moon Moth motion refused; retry in 10s:', String(error));
      return false;
    }
  }
  world.on('use', e => {
    if (e.entity !== ID || e.action !== 'fly' || typeof e.by !== 'string' || !e.by) return;
    const body = carrier();
    if (!body || body.comp.motion != null) return;
    const s = body.comp.sockets.seat.pos;
    const c = Math.cos(yaw), n = Math.sin(yaw);
    const seatPos = [perch[0] + s[0] * c + s[2] * n, perch[1] + s[1], perch[2] - s[0] * n + s[2] * c];
    if (!world.people().some(p => p.id === e.by && near(p.pos, seatPos, 4))) return;
    const startedAt = Date.now();
    if (!emitMotion({ id: ID, type: 'path', points,
      duration: DURATION, loop: 'once', face: false, t0: startedAt })) return;
    world.kv.set('flight', { phase: 'flying', startedAt, returnAt: startedAt + DURATION * 1000 });
  });
  // The folded motion is the source of truth. bstate/kv may be missing if a
  // restart occurred between append(motion) and best-effort bstate persistence.
  // A rebind also clears kv. Never restart a path to reconstruct a phase.
  function remember(value) {
    if (JSON.stringify(world.kv.get('flight')) !== JSON.stringify(value)) world.kv.set('flight', value);
  }
  const pointSignature = JSON.stringify(points);
  function ownMotion(m) {
    return m.type === 'path' && m.duration === DURATION && m.loop === 'once' && m.face === false
      && Number.isSafeInteger(m.t0) && m.t0 >= 0 && Number.isSafeInteger(m.t0 + DURATION * 1000)
      && Object.keys(m).every(k => ['type', 'duration', 'loop', 'face', 'points', 't0', 'by'].includes(k))
      && JSON.stringify(m.points) === pointSignature;
  }
  function reconcile(finish) {
    const body = carrier();
    if (!body) { remember({ phase: 'blocked', reason: 'carrier-contract' }); return; }
    const m = body.comp.motion;
    const previous = world.kv.get('flight');
    if (m == null) {
      remember(previous && previous.phase === 'flying'
        ? { phase: 'rest', startedAt: previous.startedAt, outcome: 'interrupted' }
        : previous && previous.phase === 'rest' ? previous : { phase: 'rest' });
      return;
    }
    if (!ownMotion(m)) { remember({ phase: 'blocked', reason: 'foreign-motion' }); return; }
    const returnAt = m.t0 + DURATION * 1000;
    const phase = Date.now() < returnAt ? 'flying' : 'arrived';
    remember({ phase, startedAt: m.t0, returnAt });
    if (!finish || Date.now() < returnAt) return;
    // The endpoint already equals the logged base: removing motion is NOT a
    // teleport or a place-based reset. `once` holds here while timers are late.
    if (!emitMotion({ id: ID, type: null })) return;
    remember({ phase: 'rest', startedAt: m.t0, outcome: 'returned' });
  }
  reconcile(false); // reconcile private state on load; NEVER emit during load
  world.every(5, () => reconcile(true));
})();
