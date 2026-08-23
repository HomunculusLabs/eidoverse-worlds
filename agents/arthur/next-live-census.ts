// next-live-census.ts — read-only commons-next survey for the nvp loop.
// No verbs, uploads, files, or world mutations. Prints one fresh /geom snapshot.
const WORLD = process.argv[2] ?? "commons-next";
const ONLY_ID = process.argv[3];
const url = `https://eidoverse.billding.dev/geom?world=${WORLD}`;

const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
const data: any = await res.json();
const entities = (data.entities ?? []).filter((e: any) => !ONLY_ID || e.id === ONLY_ID).map((e: any) => ({
  id: e.id,
  kind: e.kind,
  pos: e.pos,
  yaw: e.yaw,
  scale: e.scale,
  lib: e.lib,
  color: e.color,
  intensity: e.intensity,
  range: e.range,
  bbox: e.bbox,
  compKeys: Object.keys(e.comp ?? {}).sort(),
  comp: e.comp ?? {},
})).sort((a: any, b: any) => a.id.localeCompare(b.id));

console.log(JSON.stringify({ world: WORLD, count: entities.length, entities }, null, 2));
export {};
