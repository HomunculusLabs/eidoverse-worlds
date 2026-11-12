/** Local-only exact-byte Moon Moth review. Never joins or changes a world.
 * Run: bun agents/arthur/moon-moth/model-review.ts [--serve] [--no-video]
 *      [--served --expected-served-sha <64 lowercase hex SHA-256>]
 * Outputs only motion-review/<sha256>/; GLB/build/contract are read-only.
 */
import assert from 'node:assert/strict';
import { chromium, type Page } from 'playwright';

// Browser acceptance tests are written before the renderer implementation.
async function conformance(page: Page, expectedSha: string) {
  const r = await page.evaluate(() => (window as any).moonReview?.verify());
  assert(r, 'renderer must expose and execute a real motion verification');
  assert.equal(r.sha256, expectedSha, 'rendered bytes must match the pinned GLB');
  assert.equal(r.wings.length, 2, 'both named wings must be covered');
  for (const w of r.wings) {
    assert(w.excursionRadians > .43, `${w.name} must move through the full .44rad stroke`);
    assert(w.minClearance > 0, `${w.name} may not contact the local ground plane`);
    assert(w.continuousClearanceLowerBound > 0, `${w.name} needs a continuous-stroke bound, not just samples`);
  }
  assert(r.staticMeshCount > 0, 'static cabin/seat mesh coverage must be non-vacuous');
  assert.equal(r.staticMaxMatrixDelta, 0, 'all non-wing GLB meshes must remain still');
  assert.equal(r.rootMaxMatrixDelta, 0, 'the model root must remain still');
  assert.equal(r.seat.anchorName, 'moon_seat');assert.equal(r.seat.cushionName, 'moon_seat_cushion_0');
  assert.equal(r.seat.anchorMaxMatrixDelta, 0);assert.equal(r.seat.cushionMaxMatrixDelta, 0);
  assert(r.seat.engineLookupVerified, 'cushion and anchor must use exact engine lookup');
  assert(r.geometryContract.boundsMaxDelta <= .005, 'decoded geometry must remain source-contract bound');
  assert.equal(r.restoreMaxDelta, 0, 'removing motion components must restore both rest poses');
  assert(r.negativeControls.missingWingRejected, 'missing names must fail closed');
  assert(r.negativeControls.frozenWingRejected, 'a stopped wing must fail motion coverage');
  assert(r.negativeControls.movingCabinRejected, 'moving the cabin must fail static verification');
  return r;
}

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');

// Source contract is never re-pinned to optimized bytes. This records two
// independently checked hashes, not proof of an upload or a live store response.
export function bindReviewModels(sourceBytes: Buffer, contractBytes: Buffer, modelBytes: Buffer, expectedServedSha?: string) {
  const contract = JSON.parse(contractBytes.toString()), sourceHash = sha(sourceBytes), hash = sha(modelBytes);
  assert.equal(contract.sha256, sourceHash, 'source model-contract and GLB disagree');
  assert.equal(contract.bytes, sourceBytes.length, 'source model-contract byte count mismatch');
  if (expectedServedSha !== undefined) {
    assert(/^[a-f0-9]{64}$/.test(expectedServedSha), 'expected served SHA must be 64 lowercase hex characters');
    assert.equal(hash, expectedServedSha, 'served GLB SHA mismatch');
  } else assert.equal(hash, sourceHash, 'source review must use source bytes');
  function decode(bytes: Buffer) {
    assert(bytes.length >= 28 && bytes.length <= 16 * 1024 * 1024, 'GLB size outside review limit');
    assert.equal(bytes.readUInt32LE(0), 0x46546c67, 'GLB magic');
    assert.equal(bytes.readUInt32LE(4), 2, 'GLB version');
    assert.equal(bytes.readUInt32LE(8), bytes.length, 'GLB declared length');
    const jsonLength = bytes.readUInt32LE(12);
    assert(jsonLength % 4 === 0 && 20 + jsonLength <= bytes.length, 'GLB JSON bounds');
    assert.equal(bytes.readUInt32LE(16), 0x4e4f534a, 'GLB JSON chunk');
    const doc = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
    for (const item of [...doc.buffers ?? [], ...doc.images ?? []]) assert(!item.uri || item.uri.startsWith('data:'), 'GLB may not fetch external assets');
    for (const name of ['moon_wing_left', 'moon_wing_right', 'moon_seat', 'moon_seat_cushion_0']) assert.equal(doc.nodes.filter((n: any) => n.name === name).length, 1, `exactly one ${name}`);
    assert.equal(doc.nodes.length, contract.nodes, 'source node census');
    assert.equal(doc.meshes.length, contract.meshes, 'source mesh census');
    assert(!doc.animations?.length && !doc.skins?.length, 'only rigid part-motion is supported');
    return doc;
  }
  const sourceDoc = decode(sourceBytes), doc = decode(modelBytes);
  if (expectedServedSha !== undefined) assert(doc.extensionsRequired?.includes('KHR_draco_mesh_compression') && doc.meshes.some((m: any) => m.primitives.some((p: any) => p.extensions?.KHR_draco_mesh_compression)), 'served review requires DRACO-compressed geometry');
  // Compare the entire authored hierarchy (including cushion and anchor), not
  // merely a successful wing-name lookup. Optimizer-omitted identity TRS is OK.
  function nodeContract(doc: any) {
    const visited = new Set<number>();
    function node(index: number): any {
      assert(Number.isInteger(index) && doc.nodes[index] && !visited.has(index), 'invalid/repeated scene node');visited.add(index);
      const n = doc.nodes[index];assert(!n.matrix && !n.weights, 'TRS-only rigid review');
      return { name: n.name ?? '', translation: n.translation ?? [0,0,0], rotation: n.rotation ?? [0,0,0,1], scale: n.scale ?? [1,1,1],
        mesh: n.mesh === undefined ? null : { name: doc.meshes[n.mesh].name ?? '', primitives: doc.meshes[n.mesh].primitives.length },
        children: (n.children ?? []).map(node) };
    }
    const roots = doc.scenes[doc.scene ?? 0].nodes.map(node);
    assert.equal(visited.size, doc.nodes.length, 'all authored nodes must be active');return roots;
  }
  assert.deepEqual(nodeContract(doc), nodeContract(sourceDoc), 'served/source node contract mismatch');
  return { contract, doc, binding: {
    mode: expectedServedSha === undefined ? 'source' : 'served', sourceSha256: sourceHash, sourceBytes: sourceBytes.length,
    sourceContractSha256: sha(contractBytes), sourceContractVerified: true, nodeContractVerified: true,
    renderedSha256: hash, renderedBytes: modelBytes.length,
    ...(expectedServedSha === undefined ? {} : { servedSha256: hash, expectedServedSha256: expectedServedSha }),
  } };
}

async function run() {
  const options = new Map<string, string | true>();
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    assert(['--served', '--expected-served-sha', '--serve', '--no-video'].includes(key), 'unknown review argument: '+key);
    assert(!options.has(key), 'duplicate review argument: '+key);
    if (key === '--expected-served-sha') {
      const value = args[++i];
      assert(typeof value === 'string' && /^[a-f0-9]{64}$/.test(value), '--expected-served-sha requires 64 lowercase hex characters');
      options.set(key, value);
    } else options.set(key, true);
  }
  const served = options.has('--served');
  assert.equal(served, options.has('--expected-served-sha'), '--served and --expected-served-sha must be supplied together');
  const expectedServedSha = options.get('--expected-served-sha') as string | undefined;
  const sourcePath = join(here, 'moon-moth.glb');
  const sourceBytes = readFileSync(sourcePath), sourceHash = sha(sourceBytes);
  const contractBytes = readFileSync(join(here, 'model-contract.json'));
  const modelPath = served ? join(here, 'served.glb') : sourcePath;
  const modelBytes = served ? readFileSync(modelPath) : sourceBytes;
  const hash = sha(modelBytes);
  const { contract, binding } = bindReviewModels(sourceBytes, contractBytes, modelBytes, served ? expectedServedSha : undefined);
  const enginePath = join(repo, 'client/lib/motion.js');
  const evaluatorPath = join(repo, 'client/lib/motioneval.js');
  const worldPath = join(repo, 'client/lib/world.js');
  const engineSource = readFileSync(enginePath, 'utf8');
  const evaluatorSource = readFileSync(evaluatorPath, 'utf8');
  const worldSource = readFileSync(worldPath, 'utf8');
  // Preserve the actual lookup verbatim, not a replacement getObjectByName.
  const lookupStart = worldSource.indexOf('const _partCache = new WeakMap();');
  const lookupEnd = worldSource.indexOf('// ---- mounting', lookupStart);
  assert(lookupStart >= 0 && lookupEnd > lookupStart, 'findPart source boundary drift');
  const lookup = worldSource.slice(lookupStart, lookupEnd);
  assert.equal((lookup.match(/export function findPart/g) ?? []).length, 1);
  const template = readFileSync(join(here, 'viewer.html'), 'utf8');
  const tag = '<script type="module" id="review-source">';
  const begin = template.indexOf(tag), end = template.indexOf('</script>', begin);
  assert(begin >= 0 && end > begin);
  const source = template.slice(begin + tag.length, end);
  // Only the environment is isolated. tickMotion, evalPart, rotatePartAtPivot,
  // since, pendulumTheta and findPart are the real source bytes at this epoch.
  const environment = `import * as THREE from 'three';
export {THREE}; export const camera=new THREE.PerspectiveCamera(37,1,.05,240);
camera.position.set(0,3,20);
export const entities=new Map(), comps=new Map();
let now=0; export const setNow=t=>{now=t};export const serverNow=()=>now;
export const reindexCollider=()=>{}; // local visual harness: no world collider claim
`;
  const virtual: Record<string, string> = {
    'entry': source, 'environment': environment,
    'world': `export {entities, comps} from 'review:environment';\n${lookup}`,
  };
  const built = await Bun.build({
    entrypoints: ['review:entry'], target: 'browser', format: 'esm', minify: true,
    plugins: [{ name: 'isolated-real-motion', setup(b) {
      b.onResolve({ filter: /^review:/ }, args => ({ path: args.path.slice(7), namespace: 'review' }));
      b.onResolve({ filter: /^\/engine\/motion\.js$/ }, () => ({ path: enginePath }));
      b.onResolve({ filter: /^\.\/(core|world|colliders|remotes)\.js$/ }, args => {
        if (args.importer !== enginePath) return;
        return { path: args.path === './world.js' ? 'world' : 'environment', namespace: 'review' };
      });
      b.onLoad({ filter: /.*/, namespace: 'review' }, args => ({ contents: virtual[args.path], loader: 'js', resolveDir: repo }));
      b.onLoad({ filter: /client\/lib\/motion\.js$/ }, () => ({ contents: engineSource, loader: 'js', resolveDir: dirname(enginePath) }));
      b.onLoad({ filter: /client\/lib\/motioneval\.js$/ }, () => ({ contents: evaluatorSource, loader: 'js', resolveDir: dirname(evaluatorPath) }));
    }}],
  });
  assert(built.success, built.logs.map(String).join('\n'));
  assert.equal(built.outputs.length, 1, 'standalone bundle must be singular');
  const bundle = await built.outputs[0].text();
  const metadata = {
    sha256: hash, contract, binding,
    provenance: {
      engine: { path: 'client/lib/motion.js', sha256: sha(engineSource), entry: 'tickMotion', sourceUnmodified: true },
      evaluator: { path: 'client/lib/motioneval.js', sha256: sha(evaluatorSource), sourceUnmodified: true },
      partLookup: { path: 'client/lib/world.js', sha256: sha(worldSource), extractedSha256: sha(lookup), sourceUnmodified: true },
      viewerSourceSha256: sha(template), adapters: ['isolated entities/comps maps', 'deterministic serverNow milliseconds', 'review camera', 'no-op collider reindex; no collision claims'],
    },
  };
  // Pin local decoder bytes and embed them; the exported file needs no server/CDN.
  const decoderDir = join(repo, 'node_modules/three/examples/jsm/libs/draco/gltf');
  const decoder = Object.fromEntries((served ? ['draco_wasm_wrapper.js', 'draco_decoder.wasm'] : []).map(name => {
    const bytes = readFileSync(join(decoderDir, name));
    return [name, { base64: bytes.toString('base64'), sha256: sha(bytes) }];
  }));
  const injected = `<script type="application/octet-stream" id="review-contract">${contractBytes.toString('base64')}</script>\n<script type="application/json" id="review-draco">${JSON.stringify(decoder)}</script>\n<script type="application/json" id="review-meta">${JSON.stringify(metadata).replaceAll('<', '\\u003c')}</script>\n<script type="application/octet-stream" id="review-model">${modelBytes.toString('base64')}</script>\n<script type="module">${bundle.replaceAll('</script', '<\\/script')}</script>`;
  const html = template.slice(0, begin) + injected + template.slice(end + '</script>'.length);
  const out = join(here, 'motion-review', hash);
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'demo.html'), html);
  const server = createServer((req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline' 'wasm-unsafe-eval'; worker-src blob:; style-src 'unsafe-inline'; img-src data: blob:; connect-src blob: data:; media-src blob:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
    if (req.method !== 'GET' || !['/', '/index.html'].includes(req.url ?? '')) {res.writeHead(404);res.end('Not found');return;}
    res.setHeader('Content-Type', 'text/html; charset=utf-8');res.end(html);
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  const address = server.address();assert(address && typeof address !== 'string');
  const url = `http://127.0.0.1:${address.port}/`;
  const browser = await chromium.launch({ headless: true });
  const errors: string[] = [], warnings: string[] = [];
  let success = false;
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => {if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());});
    page.on('requestfailed', r => errors.push(`${r.method()} ${r.url()}: ${r.failure()?.errorText}`));
    await page.route('**/*', route => {
      const u = route.request().url();
      if (u.startsWith(url) || u.startsWith('blob:') || u.startsWith('data:')) return route.continue();
      errors.push('Denied external request '+u);return route.abort();
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => (window as any).reviewReady === true || document.querySelector('#error pre')?.textContent, undefined, { timeout: 60_000 });
    assert.equal(await page.evaluate(() => (window as any).reviewReady), true, await page.locator('#error').innerText());
    const stats = await conformance(page, hash);
    const capture = async (name: string, view: string, t: number, night = false, proxy = false) => {
      await page.evaluate(({view,t,night,proxy}) => {const r=(window as any).moonReview;r.setTime(t);r.setView(view);r.setNight(night);r.setProxy(proxy);}, {view,t,night,proxy});
      await page.screenshot({ path: join(out, name+'.png') });
    };
    await capture('close3quarter', 'close3quarter', periodQuarter());
    await capture('front', 'front', periodQuarter());
    await capture('top', 'top', periodQuarter());
    await capture('night', 'close3quarter', periodQuarter(), true);
    await capture('motion-a', 'front', 0);
    await capture('motion-b', 'front', 2.75);
    await capture('scale-proxy', 'close3quarter', periodQuarter(), false, true);
    // Exercise each public interaction instead of certifying just a screenshot.
    await page.click('#scale');assert.equal((await page.evaluate(()=>(window as any).moonReview.state())).proxy,false);
    await page.click('#night');assert.equal((await page.evaluate(()=>(window as any).moonReview.state())).night,true);
    await page.click('[data-view="top"]');
    await page.locator('#time').fill('2.75');assert.equal((await page.evaluate(()=>(window as any).moonReview.state())).time,2.75);
    await page.click('#play');const before=(await page.evaluate(()=>(window as any).moonReview.state())).time;
    await page.waitForFunction(t=>(window as any).moonReview.state().time>t+.1,before);
    await page.click('#play');assert.equal((await page.evaluate(()=>(window as any).moonReview.state())).playing,false);
    await capture('interaction-verified', 'close3quarter', periodQuarter());
    const cameraBefore=(await page.evaluate(()=>(window as any).moonReview.state())).camera;
    await page.mouse.move(800,420);await page.mouse.down();await page.mouse.move(910,455,{steps:8});await page.mouse.up();
    assert.notDeepEqual((await page.evaluate(()=>(window as any).moonReview.state())).camera,cameraBefore,'Orbit drag changes camera');
    await page.setViewportSize({width:480,height:800});
    await capture('mobile', 'front', periodQuarter());
    assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth),'mobile layout must not overflow');
    const fit=await page.evaluate(()=>(window as any).moonReview.screenBounds?.());
    assert(fit && fit.minX>=-1 && fit.maxX<=1 && fit.minY>=-1 && fit.maxY<=1,'portrait camera must contain the full model, not just a non-overflowing DOM');
    await page.setViewportSize({width:1440,height:960});
    const video: any = { requested: !process.argv.includes('--no-video'), reason: 'Not requested' };
    if(video.requested){
      console.log('Capturing 330 deterministic engine-rendered PNG frames → 11s MP4 loop.');
      const ff=spawnSync('ffmpeg',['-version'],{encoding:'utf8'});
      if(ff.status===0){
        // captureStream can silently omit frames. Screenshot each known engine
        // time, await the real PNG, and feed image2pipe with backpressure instead.
        await page.evaluate(()=>{const r=(window as any).moonReview;r.setTime(0);r.setNight(false);r.setProxy(false);r.setView('close3quarter');});
        const encoder=spawn('ffmpeg',['-y','-f','image2pipe','-framerate','30','-vcodec','png','-i','pipe:0','-an','-c:v','libx264','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',join(out,'moon-moth.mp4')],{stdio:['pipe','ignore','pipe']});
        let stderr='';encoder.stderr.on('data',chunk=>stderr+=chunk.toString());
        const ended=once(encoder,'close');const frameHashes: string[]=[];
        try{
          for(let i=0;i<330;i++){
            await page.evaluate(t=>(window as any).moonReview.setTime(t),i/30);
            // Full page preserves the explicit LOCAL study label and hash.
            const png=await page.screenshot({type:'png'});frameHashes.push(sha(png));
            if(!encoder.stdin.write(png))await once(encoder.stdin,'drain');
          }
          encoder.stdin.end();const [code]=await ended;assert.equal(code,0,stderr);
        }catch(e){encoder.kill();throw e;}
        assert.notEqual(frameHashes[0],frameHashes[82],'video must show actual motion');
        const probe=spawnSync('ffprobe',['-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=nb_read_frames,width,height,r_frame_rate,duration','-of','json',join(out,'moon-moth.mp4')],{encoding:'utf8'});
        assert.equal(probe.status,0,probe.stderr);video.mp4=JSON.parse(probe.stdout).streams[0];
        assert.equal(video.mp4.nb_read_frames,'330','video must contain all 330 actual rendered frames');
        assert(Math.abs(Number(video.mp4.duration)-11)<.05,'video must be an 11s natural-period loop');
        video.capture='deterministic Playwright PNG image2pipe; t=frame/30; no synthetic tweening or repeated/dropped frames';video.frameHashes=frameHashes;video.reason=undefined;
      }else video.reason='ffmpeg unavailable; still frames and interactive demo are complete';
    }
    // Verify self-contained file:// opening too; no server needed after delivery.
    const portable = await browser.newPage({viewport:{width:1000,height:750},reducedMotion:'reduce'});
    portable.on('pageerror',e=>errors.push('portable: '+e.message));
    portable.on('console',m=>{if(m.type()==='error')errors.push('portable: '+m.text());if(m.type()==='warning')warnings.push('portable: '+m.text());});
    portable.on('requestfailed',r=>errors.push('portable: '+r.url()+': '+r.failure()?.errorText));
    const portableURL=pathToFileURL(join(out,'demo.html')).href;
    await portable.route('**/*',route=>{
      const u=route.request().url();
      if(u===portableURL||u.startsWith('blob:')||u.startsWith('data:'))return route.continue();
      errors.push('Denied portable external request '+u);return route.abort();
    });
    await portable.goto(portableURL,{timeout:30_000});
    await portable.waitForFunction(()=>(window as any).reviewReady===true,undefined,{timeout:60_000});
    assert.equal((await portable.evaluate(()=>(window as any).moonReview.stats)).sha256,hash);
    assert.equal((await portable.evaluate(()=>(window as any).moonReview.state())).playing,false,'reduced-motion opens paused');
    await portable.close();
    assert.deepEqual(errors, []);
    assert.equal(sha(readFileSync(modelPath)), hash, 'GLB changed while rendering — this output is stale; rerun');
    assert.equal(sha(readFileSync(sourcePath)), sourceHash, 'source GLB changed while rendering');
    assert.equal(sha(readFileSync(join(here,'model-contract.json'))),sha(contractBytes),'contract changed while rendering');
    assert.equal(sha(readFileSync(enginePath)),sha(engineSource),'engine changed while rendering');
    assert.equal(sha(readFileSync(evaluatorPath)),sha(evaluatorSource),'evaluator changed while rendering');
    const result={...stats,sha256:hash,modelCurrentAtCompletion:true,exactBytes:true,visualVerdict:'pending parent native inspection',headless:true,liveCalls:0,groundPlaneY:0,video,browserErrors:errors,browserWarnings:warnings,interactiveChecks:['all view buttons','night','scale proxy','timeline','play/pause advances clock','orbit drag','mobile no overflow','standalone file URL','reduced-motion pause'],outputs:out};
    writeFileSync(join(out,'stats.json'),JSON.stringify(result,null,2)+'\n');
    writeFileSync(join(here,'motion-review','latest.json'),JSON.stringify({sha256:hash,output:out,demo:join(out,'demo.html'),stats:join(out,'stats.json')},null,2)+'\n');
    rmSync(join(out,'FAILED.json'),{force:true});
    success=true;
    console.log(JSON.stringify({verdict:'PASS — local technical checks; visual judgment pending',sha256:hash,out,wings:stats.wings,staticMeshes:stats.staticMeshCount,browserErrors:errors,video:video.mp4??video.mime,viewer:join(out,'demo.html')},null,2));
  } catch(error:any){
    writeFileSync(join(out,'FAILED.json'),JSON.stringify({sha256:hash,error:error.stack,errors,warnings},null,2)+'\n');
    throw error;
  } finally {
    await browser.close();
    if(!process.argv.includes('--serve') || !success) await new Promise<void>(r=>server.close(()=>r()));
  }
  if(process.argv.includes('--serve') && success)console.log('LOCAL_VIEWER_READY '+url+' (127.0.0.1 only; Ctrl-C to stop)');
}
function periodQuarter(){return 5.5/4;}
if(import.meta.main)await run();
