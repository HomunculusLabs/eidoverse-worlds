// lighthouse — keeps its own clock: announces on a timer, works with nobody
// connected (server-side is the point), and shows kv + people() together.
// Bind:  behavior {id: "keeper", src: <upload>, attach: "lamp1",
//                  knobs: {every: 60, text: "all clear"}}

world.every(world.knobs.every ?? 60, () => {
  const n = (world.kv.get('sweeps') ?? 0) + 1;
  world.kv.set('sweeps', n);
  const here = world.people().length;
  if (here > 0) {
    world.emit('say', { text: `${world.knobs.text ?? 'all clear'} — sweep ${n}, ${here} soul(s) in view` });
  }
  world.log('sweep', n, 'people', here);
});
