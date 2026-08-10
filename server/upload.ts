// eidoverse-worlds sequencer — live asset ingestion (TEL0S_NOTES §15, 7c).
// POST /upload (models, avatars, runtime scripts) moved here whole from the
// unsplit fetch(), together with the machinery only it feeds: the per-IP
// upload rate windows and the store-optimization queue whose subprocess
// builds each uploaded GLB its draco+webp shadow off the request path — plus
// the deferred boot sweep that queues whatever accumulated while the server
// was down. routes.ts delegates the endpoint here; nothing else changes hands.

import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { JOIN_TOKEN, UPLOAD_CAP, ROOT, OPT_DIR, STORE_MIN } from "./config.ts";
import { agentTokens, HN_ISSUER_KEY, HN_ISS, HN_AUD } from "./auth.ts";
import { verifyToken } from "./aid1.ts";
import { worlds } from "./world.ts";

/** What the handler needs from Bun's server object, structurally (the
 *  VerbWorld precedent): the socket address behind the nginx front. */
type UploadSrv = { requestIP(req: Request): { address: string } | null };

const uploadWin = new Map<string, { t: number; n: number }>(); // per-IP upload rate windows

// ---- store optimization -----------------------------------------------------
// Every uploaded GLB (drag-drop, Orrery conjures) gets a draco+webp shadow in
// store-min/, built by a SUBPROCESS — draco encoding is CPU-seconds of
// synchronous wasm, and inside this process it would freeze pose relay for
// every world. One file at a time; the sequencer never waits on it.
const optQueue: string[] = [];
let optRunning = false;
function queueOptimize(absPath: string) {
  if (!optQueue.includes(absPath)) { optQueue.push(absPath); pumpOptimize(); }
}
async function pumpOptimize() {
  if (optRunning) return;
  optRunning = true;
  try {
    while (optQueue.length) {
      const src = optQueue.shift()!;
      const base = basename(src);                      // <hash>.glb
      const dest = join(STORE_MIN, base);
      const failed = join(STORE_MIN, `${base}.failed`);
      if (!existsSync(src) || existsSync(dest) || existsSync(failed)) continue;
      mkdirSync(STORE_MIN, { recursive: true });
      // process.execPath = the running bun binary — PATH under systemd has no bun
      const proc = Bun.spawn([process.execPath, "run", join(ROOT, "server", "optimize.ts"), src, dest],
        { stdout: "pipe", stderr: "pipe" });
      const code = await proc.exited;
      const err = (await new Response(proc.stderr).text()).trim();
      if (code === 0) {
        const ratio = (Bun.file(src).size / Math.max(1, Bun.file(dest).size)).toFixed(1);
        console.log(`[store] optimized ${base} (${ratio}x)`);
      } else if (code === 2) {
        // already lean — mark so the boot sweep stops re-measuring it
        writeFileSync(failed, "not-smaller");
        console.log(`[store] ${base} already lean — serving original`);
      } else {
        // Environmental failures (deps not installed yet) must NOT mark the
        // file — that would permanently skip every upload made before the
        // first successful `bun install`. Only content failures stick.
        const envFail = /cannot find module|cannot resolve|error: script not found/i.test(err);
        if (!envFail) writeFileSync(failed, err.slice(0, 2000) || `exit ${code}`);
        console.error(`[store] optimize ${envFail ? "unavailable (deps?)" : `FAILED ${base}`}: ${err.split("\n")[0] || `exit ${code}`}`);
        if (envFail) { optQueue.length = 0; break; } // no point grinding the rest
      }
    }
  } finally { optRunning = false; }
}
// Boot sweep: whatever accumulated before this shipped (or failed mid-queue
// last run) gets its shadow now. Deferred so boot stays about serving worlds.
setTimeout(() => {
  const dir = join(OPT_DIR, "store");
  if (!existsSync(dir)) return;
  const pending = readdirSync(dir).filter((f) => f.endsWith(".glb")
    && !existsSync(join(STORE_MIN, f)) && !existsSync(join(STORE_MIN, `${f}.failed`)));
  if (!pending.length) return;
  console.log(`[store] boot sweep: ${pending.length} unoptimized upload(s) queued`);
  for (const f of pending) queueOptimize(join(dir, f));
}, 5000);

// ---- the endpoint -----------------------------------------------------------

/** POST /upload — live asset ingestion. Two destinations:
 *   - models (default): content-addressed into assets/opt/store/<hash>.glb —
 *     immutable by construction, so spawn verbs can reference the path
 *     forever and clients cache it forever. DESIGN.md's "content-addressed
 *     assets" plane, made real.
 *   - ?as=avatar&name=foo: named into the overlay vrms dir, because the
 *     roster is name-keyed and people re-export their bodies (mtime
 *     versioning handles the cache).
 *  Trust model: the door token, any per-agent bearer from
 *  mcpl/tokens.json, OR an aid1 credential the home node vouches for
 *  (so Orrery and agents can push generated GLBs here directly — the
 *  store is content-addressed and inert; what enters a WORLD is still
 *  the `asset`/`spawn` verbs, which per-world roles gate), plus per-IP
 *  rate limiting — live generation is the feature, an upload flood is
 *  not. `?by=` is attribution for the console trail. */
export async function handleUpload(req: Request, url: URL, srv: UploadSrv): Promise<Response> {
  const upTok = url.searchParams.get("token") ?? "";
  let upAgent = agentTokens().byToken.get(upTok);
  // The aid1 leg the join door has: guests enrolled via archipelago-home
  // carry no tokens.json entry, but the scripting tier's `behavior` verb
  // is already reachable to them through world_verb — the bytes it binds
  // must be landable by the same identity, or the tier is half-open.
  // Same audience/scope/slug derivation as the two doors, no jti burn
  // (an aid1 credential is reusable until expiry at every door).
  if (!upAgent && HN_ISSUER_KEY && upTok.startsWith("aid1.")) {
    const v = verifyToken(upTok, { issuerId: HN_ISSUER_KEY, iss: HN_ISS, aud: HN_AUD, requireScopes: ["worlds:join"] });
    if (v.ok) upAgent = v.payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || v.payload.sub;
  }
  if (JOIN_TOKEN && upTok !== JOIN_TOKEN && !upAgent)
    return new Response("token required", { status: 401 });
  const upBy = (url.searchParams.get("by") ?? upAgent ?? "?").slice(0, 64);
  // Behind the show's nginx front every socket is 127.0.0.1 — the real
  // client address rides X-Real-IP. (Spoofable only when directly exposed,
  // which is the tailnet dev case where rate limits hardly matter.)
  const ip = req.headers.get("x-real-ip") ?? srv.requestIP(req)?.address ?? "?";
  const u = uploadWin.get(ip) ?? { t: 0, n: 0 };
  if (Date.now() - u.t > 60_000) { u.t = Date.now(); u.n = 0; }
  u.n++; uploadWin.set(ip, u);
  if (u.n > 4) return new Response("upload rate limit (4/min)", { status: 429 });
  const body = new Uint8Array(await req.arrayBuffer());
  if (body.length > UPLOAD_CAP) return new Response(`too large (${UPLOAD_CAP / 1e6}MB cap)`, { status: 413 });
  if (url.searchParams.get("as") === "script") {
    // Runtime-script ingestion: plain UTF-8 JS, content-addressed like
    // models, so a `behavior` entry pins exact bytes forever. The store
    // is inert — what RUNS is still gated by the behavior verb + sandbox.
    if (body.length > 64 * 1024) return new Response("script too large (64KB cap)", { status: 413 });
    let text: string;
    try { text = new TextDecoder("utf-8", { fatal: true }).decode(body); } catch {
      return new Response("script must be UTF-8 text", { status: 415 });
    }
    if (!text.trim()) return new Response("empty script", { status: 415 });
    const shash = new Bun.CryptoHasher("sha256").update(body).digest("hex").slice(0, 16);
    const sdir = join(OPT_DIR, "store", "scripts");
    mkdirSync(sdir, { recursive: true });
    const srel = `store/scripts/${shash}.js`;
    if (!existsSync(join(OPT_DIR, srel))) writeFileSync(join(OPT_DIR, srel), body);
    console.log(`[upload] script ${srel} (${body.length}B) by ${upBy}`);
    return new Response(JSON.stringify({ path: srel }),
      { headers: { "content-type": "application/json" } });
  }
  if (body.length < 12 || new DataView(body.buffer).getUint32(0, true) !== 0x46546c67)
    return new Response("not a GLB container (glb/vrm)", { status: 415 });
  if (url.searchParams.get("as") === "avatar") {
    const raw = url.searchParams.get("name") ?? "unnamed";
    const name = raw.replace(/\.vrm$/i, "").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48) || "unnamed";
    const dir = join(OPT_DIR, "eidoverse/assets/vrms");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${name}.vrm`), body);
    console.log(`[upload] avatar "${name}" (${(body.length / 1e6).toFixed(1)}MB) by ${upBy}`);
    // Live cache invalidation: avatars are name-keyed and mutable (people
    // iterate on their bodies), so every connected client — all worlds —
    // learns the file changed; wearers hot-swap with the fresh version.
    const rel = `eidoverse/assets/vrms/${name}.vrm`;
    const update = JSON.stringify({ type: "avatar-updated", name, path: rel, v: Date.now() });
    let notified = 0;
    for (const w of worlds.values()) for (const c of w.clients) { c.ws.send(update); notified++; }
    if (notified) console.log(`[upload] avatar-updated "${name}" → ${notified} client(s)`);
    return new Response(JSON.stringify({ name, path: rel }),
      { headers: { "content-type": "application/json" } });
  }
  const hash = new Bun.CryptoHasher("sha256").update(body).digest("hex").slice(0, 16);
  const dir = join(OPT_DIR, "store");
  mkdirSync(dir, { recursive: true });
  const rel = `store/${hash}.glb`;
  if (!existsSync(join(OPT_DIR, rel))) writeFileSync(join(OPT_DIR, rel), body);
  queueOptimize(join(OPT_DIR, rel)); // draco+webp shadow, built off the request path
  // The store is content-addressed, so the human name arrives ONLY here —
  // record it, or the catalog can never list this object as anything but
  // a hash (an orrery send used to vanish into exactly that black hole).
  const upName = (url.searchParams.get("name") ?? "").replace(/\.glb$/i, "").replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 64).trim();
  {
    const mp = join(dir, "manifest.json");
    let man: Record<string, { name?: string; by: string; ts: number }> = {};
    try { if (existsSync(mp)) man = JSON.parse(readFileSync(mp, "utf8")); } catch { /* fresh */ }
    man[hash] = { ...(upName ? { name: upName } : {}), by: upBy, ts: Date.now() };
    writeFileSync(`${mp}.tmp`, JSON.stringify(man));
    renameSync(`${mp}.tmp`, mp);
  }
  console.log(`[upload] model ${rel}${upName ? ` ("${upName}")` : ""} (${(body.length / 1e6).toFixed(1)}MB) by ${upBy}`);
  return new Response(JSON.stringify({ path: rel }), { headers: { "content-type": "application/json" } });
}
