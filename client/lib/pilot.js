// Lease SENDER only. Existing physobj receiver renders every pilot stream.
// Injected engine edges keep the complete negotiation testable without a browser.
import { pilotAuthority } from '../../shared/pilot.js';
import { createFlight, stepFlight, returnFlight } from './pilot-flight.js';
export function createPilotController(h) {
  let pending = null, active = null;
  const seat = () => {
    const st = h.world(), id = st.mounts?.[h.identity()]?.to;
    const a = id && pilotAuthority(st, id, h.identity(), h.spectator());
    return a ? { id, ...a } : null;
  };
  const clear = () => { pending = active = null; h.keys.clear(); };
  function start(now, returning = false) {
    const a = seat();
    if (!a || pending || active || !h.connected() || h.blocked()) return false;
    pending = { ...a, at: now, returning };
    h.keys.clear(); h.send('claim', a.id, { mode: 'pilot' });
    h.notice('requesting pilot control…');
    return true;
  }
  function handle(m, now) {
    if (m.op === 'granted') {
      if (active?.id === m.id) return; // duplicate grant is not a new sim
      if (pending?.id !== m.id && m.mode !== 'pilot') return;
      const a = seat(), p = pending;
      if (m.mode !== 'pilot' || !p || p.id !== m.id || now - p.at > 3000 || !h.connected()
          || a?.signature !== p.signature) {
        h.send('release', m.id, { mode: 'pilot' });
        if (p?.id === m.id) { clear(); h.notice('pilot unavailable — a mode-tagged server grant is required'); }
        return;
      }
      const s = createFlight(p.config, m.from);
      if (!s) { h.send('release', m.id, { mode: 'pilot' }); clear(); return; }
      active = { ...p, s: p.returning ? returnFlight(s) : s, sentAt: now, tickAt: now, releasing: false };
      pending = null; h.keys.clear();
      h.notice('pilot: W/S thrust/brake · A/D turn · Space/C altitude · X return and land');
      return;
    }
    if (m.id !== active?.id && m.id !== pending?.id) return;
    if (m.op === 'released') {
      const a = active, e = h.world().entities?.[m.id];
      const landed = a?.releasing && a.s.phase === 'landed'
        && e?.pos?.every((n, i) => n === a.s.p[i]) && e?.yaw === a.s.yaw;
      clear();
      if (landed) h.landed();
    } else if (m.op === 'denied' || m.op === 'lost') {
      // Claim denials from other senders are untagged; only a retained pilot
      // stream rejection can terminate an active grant. Pending claims still
      // accept untagged denials for old-server compatibility.
      if (active && m.op === 'denied' && m.mode !== 'pilot') return;
      // Invalid stream: release WITHOUT a final. The server's last accepted pose wins.
      if (active && m.op === 'denied') h.send('release', m.id, { mode: 'pilot' });
      clear(); h.notice(m.why ?? 'pilot control ended — F to recover');
    }
  }
  function tick(dt, now) {
    if (!h.connected()) { clear(); return; }
    if (h.blocked()) h.keys.clear();
    if (pending && now - pending.at > 3000) { clear(); h.notice('pilot grant timed out — no flight started'); }
    if (!active) return;
    const a = active;
    if (seat()?.signature !== a.signature) {
      h.send('release', a.id, { mode: 'pilot' }); clear(); return;
    }
    if (a.releasing) return;
    const elapsed = Math.max(0, (now - a.tickAt) / 1000);
    a.tickAt = now;
    a.s = stepFlight(a.config, a.s, h.keys, Math.min(dt, elapsed), h.blocked());
    if (!a.s) { h.send('release', a.id, { mode: 'pilot' }); clear(); return; }
    h.apply(a.id, a.s);
    const sample = { mode: 'pilot', p: [...a.s.p], yaw: a.s.yaw };
    if (a.s.phase === 'landed') {
      a.releasing = true; h.keys.clear(); h.send('release', a.id, sample);
    } else if (now - a.sentAt >= 66) { a.sentAt = now; h.send('state', a.id, sample); }
  }
  function exit(now) {
    if (active) { if (!active.releasing) active.s = returnFlight(active.s); h.keys.clear(); return true; }
    if (pending) { pending.returning = true; h.keys.clear(); return true; }
    if (seat()) { start(now, true); return true; }
    return false;
  }
  return { seat, start, handle, tick, exit, disconnect: clear };
}
