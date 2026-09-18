// Public-client carousel inspection. ONLY --help/--check and tests are offline.
// Live --inspect/--ride are parent-operated; no CDP, GUI, resident profile, or engine edits.
import { parseArgs } from 'node:util';

export function contextOptions(ride: boolean, out: string) {
  return { viewport:{width:1280,height:900}, deviceScaleFactor:1, permissions:[], serviceWorkers:'block' as const,
    acceptDownloads:false, ...(ride ? {recordVideo:{dir:out,size:{width:1280,height:900}}} : {}) };
}
export async function run(argv = process.argv.slice(2)) {
  const a = parseOptions(argv);
  if (a.help) {
    console.log('Offline: --help or --check (no browser/network/config read). Live parent only: --inspect (default, zero verbs) OR --ride --expect-lib store/<16 lowercase hex>.glb. --slot horse_2 default; --all-slots runs horse_0,horse_2,horse_4,horse_6 sequentially in separate guests, stops on failure. --times 2,5,9,14,20 seconds of existing spin/bob, no use action. --door-config agents/arthur/config.json reads ONLY joinToken in Node relay, never agentToken. --out NEW_DIR; --channel chrome|chromium. Exact pin gate before mount. Public trySitOn + native KeyW dismount. Screenshots/video/metrics remain visualVerdict=NOT_JUDGED.');
    return 0;
  }
  if (a.check) {
    console.log(JSON.stringify({outcome:'OPTIONS_VALIDATED_OFFLINE',network:false,credentialsRead:false,world:WORLD,target:TARGET,mode:a.mode,slots:a.slots,times:a.times,expectLib:a.expectLib,channel:a.channel}));
    return 0;
  }
  return (await import('./live-review.runtime.ts')).runLive(a);
}

export const BASE = 'https://eidoverse.billding.dev';
export const WORLD = 'commons-next';
export const TARGET = 'nx-carousel';
export const SLOTS = ['horse_0', 'horse_2', 'horse_4', 'horse_6'] as const;
export type Slot = typeof SLOTS[number];
export type WireConfig = { mode: string; name: string; world: string; target: string; slot: string };
// Self-contained for serialization into an isolated page; enforce again at the Node relay.
export function wireAllowed(m: any, c: WireConfig): boolean {
  const keys = (o: any, names: string[]) => !!o && typeof o === 'object' && !Array.isArray(o) && Object.keys(o).every(k => names.includes(k));
  const finite3 = (v: any) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
  if (!/^carousel-probe-[a-f0-9]{8}$/.test(c.name) || c.world !== 'commons-next' || c.target !== 'nx-carousel' || !['horse_0','horse_2','horse_4','horse_6'].includes(c.slot)) return false;
  if (!m || typeof m !== 'object' || Array.isArray(m)) return false;
  if (m.type === 'join') return keys(m,['type','id','world','avatar','token','renderer','spectate']) && m.id === c.name && m.world === c.world && !m.token && !m.renderer && !m.spectate;
  // Presence is implicitly the joined connection's own avatar; reject target/id extensions.
  if (m.type === 'pose') return keys(m,['type','pose']) && keys(m.pose,['p','yaw','speed','clip','pitch','emote','pose','pins']) && finite3(m.pose.p);
  if (['ping','history','debug'].includes(m.type)) return true;
  if (c.mode !== 'ride' || m.type !== 'verb' || !keys(m,['type','verb','args'])) return false;
  const a = m.args;
  if (m.verb === 'mount') return keys(a,['id','to','slot']) && a.id === c.name && a.to === c.target && a.slot === c.slot;
  if (m.verb === 'dismount') return keys(a,['id','pos','yaw']) && a.id === c.name && finite3(a.pos) && Number.isFinite(a.yaw);
  return false; // No use action: the carousel already spins and bobs.
}
export function createWireGate(cfg: WireConfig, allowed: typeof wireAllowed) {
  let joined = false, armed = false, mounted = false, dismounted = false;
  const audit = { sentTypes: {} as Record<string, number>, sentVerbs: [] as any[], blocked: [] as string[] };
  return { audit, arm() { armed = true; }, accept(m: any) {
    const key = m?.type === 'verb' ? `verb:${m.verb}` : m?.type ?? 'non-json';
    const valid = allowed(m,cfg) && (m.type === 'join' ? !joined : joined) &&
      (m.type !== 'verb' || (m.verb === 'mount' ? armed && !mounted : mounted && !dismounted));
    if (!valid) { if (audit.blocked.length < 80) audit.blocked.push(key); return false; }
    if (m.type === 'join') joined = true;
    if (m.type === 'verb') {
      if (m.verb === 'mount') mounted = true; else dismounted = true;
      audit.sentVerbs.push({ verb:m.verb, args:m.args, at:Date.now() });
    }
    audit.sentTypes[key] = (audit.sentTypes[key] ?? 0) + 1;
    return true;
  }};
}
export function installWireGuard(cfg: WireConfig, allowed: typeof wireAllowed, factory: typeof createWireGate) {
  const w = window as any, gate = w.__carouselGuard = factory(cfg,allowed);
  const original = WebSocket.prototype.send;
  WebSocket.prototype.send = function(data: any) {
    let m: any; try { m = JSON.parse(String(data)); } catch { m = null; }
    if (gate.accept(m)) original.call(this,data);
  };
}
export function assertPreflight(p: any, lib: string, slot: string) {
  if (!/^store\/[a-f0-9]{16}\.glb$/.test(lib) || p.targetState?.lib !== lib) throw new Error('target absent or exact lib pin differs — no mount');
  if (p.occupied) throw new Error('carrier occupied — no mount');
  if (!p.slot || p.slot.part !== slot || !Array.isArray(p.slot.pos) || p.slot.pos.length !== 3 || !p.slot.pos.every(Number.isFinite)) throw new Error('socket missing or not attached to intended horse — no mount');
  if (p.horse?.name !== slot || p.horse?.parent !== 'carousel' || !p.horse?.motionBase || !p.carousel?.motionBase || p.motion?.type !== 'bob' || p.spin?.type !== 'spin') throw new Error('public engine lacks loaded nested horse bob/carousel spin support — no mount');
  if (!p.publicSit || !p.nativeKeys) throw new Error('public trySitOn/native movement-dismount unavailable — no mount');
}
export function attachmentMetrics(samples: any[], c: Pick<WireConfig,'target'|'slot'>) {
  const finite3 = (v: any) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
  const attachment = samples.length >= 2 && samples.every(s => s.authoritativeMount?.to === c.target && s.authoritativeMount?.slot === c.slot &&
    s.localMount?.to === c.target && s.localMount?.slot === c.slot && Number.isFinite(s.rootErrorM) && s.rootErrorM < .08 &&
    Number.isFinite(s.stateErrorM) && s.stateErrorM < .08 && s.riderVisible && s.seatHud && s.riderClip === s.mountInfo?.pose &&
    finite3(s.horseWorld) && finite3(s.riderRoot) && finite3(s.riderInHorseLocal) && Number.isFinite(s.carouselYaw));
  const travel = (key: string, xz = false) => samples.length >= 2 && samples.every(s => finite3(s[key])) ?
    Math.max(...samples.map(s => Math.hypot(...s[key].map((v: number,i: number) => xz && i === 1 ? 0 : v - samples[0][key][i])))) : 0;
  const yRange = (key: string) => samples.length >= 2 && samples.every(s => finite3(s[key])) ? Math.max(...samples.map(s => s[key][1])) - Math.min(...samples.map(s => s[key][1])) : 0;
  const carouselRotationRad = samples.length >= 2 && samples.every(s => Number.isFinite(s.carouselYaw)) ?
    Math.max(...samples.map(s => Math.abs(Math.atan2(Math.sin(s.carouselYaw-samples[0].carouselYaw),Math.cos(s.carouselYaw-samples[0].carouselYaw))))) : 0;
  const rendererAdvanced = samples.length >= 2 && samples.every(s => Number.isFinite(s.rendererFrame)) && samples.at(-1).rendererFrame > samples[0].rendererFrame;
  const horseXZTravelM = travel('horseWorld',true), horseYRangeM = yRange('horseWorld'), riderTravelM = travel('riderRoot'), riderYRangeM = yRange('riderRoot');
  const riderHorseLocalDriftM = travel('riderInHorseLocal');
  return { sampleCount:samples.length, attachment:!!attachment, movingAttachment:!!attachment && rendererAdvanced && riderHorseLocalDriftM < .08 &&
    horseXZTravelM > .5 && horseYRangeM > .1 && riderTravelM > .5 && riderYRangeM > .1 && carouselRotationRad > .1,
    horseXZTravelM, horseYRangeM, riderTravelM, riderYRangeM, riderHorseLocalDriftM, carouselRotationRad, rendererAdvanced,
    carrierXZTravelM:travel('carrierWorld',true), maxRootErrorM:samples.length ? Math.max(...samples.map(s => s.rootErrorM ?? Infinity)) : null,
    visualVerdict:'NOT_JUDGED', scope:'AD-HOC metrics only — not suite green; visual saddle/contact review required' };
}
export function parseOptions(argv: string[]) {
  const { values: a, tokens } = parseArgs({ args: argv, strict: true, allowPositionals: false, tokens: true, options: {
    inspect: { type: 'boolean' }, ride: { type: 'boolean' }, check: { type: 'boolean' }, help: { type: 'boolean' },
    out: { type: 'string' }, slot: { type: 'string' }, 'all-slots': { type: 'boolean' },
    times: { type: 'string' }, 'expect-lib': { type: 'string' }, channel: { type: 'string', default: 'chrome' },
    'door-config': { type: 'string' },
  }});
  const names = tokens.filter(t => t.kind === 'option').map(t => t.name);
  if (new Set(names).size !== names.length) throw new Error('duplicate options are forbidden');
  if (a.inspect && a.ride) throw new Error('choose --inspect OR --ride');
  if (a.slot && a['all-slots']) throw new Error('choose --slot OR --all-slots');
  if (a.slot !== undefined && !SLOTS.includes(a.slot as Slot)) throw new Error('--slot must be horse_0, horse_2, horse_4, or horse_6');
  if ((a.ride || a['expect-lib'] !== undefined) && !/^store\/[a-f0-9]{16}\.glb$/.test(a['expect-lib'] ?? '')) throw new Error('--ride requires exact --expect-lib store/<16 lowercase hex>.glb');
  const times = String(a.times ?? '2,5,9,14,20').split(',').map(Number);
  if (times.length < 2 || times.length > 12 || times.some((t, i) => !Number.isFinite(t) || t <= 0 || t > 180 || (i > 0 && t <= times[i - 1]))) throw new Error('--times requires 2–12 strictly increasing finite seconds in (0,180]');
  if (!['chrome','chromium'].includes(a.channel!)) throw new Error('--channel must be chrome or chromium');
  if (a.out === '' || a['door-config'] === '') throw new Error('empty paths are forbidden');
  return { mode: a.ride ? 'ride' as const : 'inspect' as const, check: !!a.check, help: !!a.help,
    slots: a['all-slots'] ? [...SLOTS] : [a.slot as Slot ?? 'horse_2'], times, expectLib: a['expect-lib'],
    channel: a.channel!, out: a.out, doorConfig: a['door-config'] };
}
if (import.meta.main) run().then(code => { process.exitCode = code; }).catch(() => { console.error('Carousel review refused or failed before report; check options, output path, or shared-door config (details withheld to protect credentials).'); process.exitCode = 1; });
