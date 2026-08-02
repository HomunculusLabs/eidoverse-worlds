// greeter — says hello to arrivals, remembers how many it has met.
// Bind:  behavior {id: "greeter", src: <upload>, knobs: {greeting: "welcome to the meadow"}}
// World-level (no attach): hears every arrival.

world.on('enter', (e) => {
  const met = (world.kv.get('met') ?? 0) + 1;
  world.kv.set('met', met);
  world.emit('say', { text: `${world.knobs.greeting ?? 'welcome'}, ${e.id} — you are visitor #${met}` });
  world.log('greeted', e.id, 'total', met);
});
