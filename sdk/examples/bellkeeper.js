// bellkeeper — a rung bell swings and answers; the swing decays on its own.
// Bind:  behavior {id: "bell", src: <upload>, attach: "bell1",
//                  knobs: {period: 2.2, note: "the bell tolls"}}
// Ring:  use {id: "bell1", action: "ring"}   (or /ring bell1 in the client)
//
// Note the shape: the PUSH is one emitted motion (a function of time) — the
// script does not animate anything per-frame; clients evaluate the decay.

world.on('use', (e) => {
  if (e.action !== 'ring') return;
  const rings = (world.kv.get('rings') ?? 0) + 1;
  world.kv.set('rings', rings);
  world.emit('motion', {
    id: world.self, type: 'pendulum',
    axis: [0, 0, 1], pivot: [0, 1.6, 0],
    amp: 0.5, phase: 0, damp: 0.25,
    period: world.knobs.period ?? 2.2, t0: Date.now(),
  });
  world.emit('say', { text: `${world.knobs.note ?? '🔔'} (${rings}) — rung by ${e.by}` });
  world.log('rung by', e.by, '#', rings);
});
