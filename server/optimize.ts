// optimize — the store's diet.
//
// Uploaded GLBs (drag-drop, Orrery/Tripo conjures) used to be served exactly
// as they arrived: raw multi-megabyte meshes with 2K PNG textures, paid in
// full by EVERY client on EVERY first load, forever — the library got a
// draco+webp mirror on day one (~30x) and the store, where all new content
// lands, never did.
//
// This is the same proven recipe, programmatic: dedup + prune + resample +
// webp@1024 + draco. Originals are NEVER touched (append-only doctrine; they
// are the provenance the hash names). Optimized copies live in
// assets/opt/store-min/<hash>.glb and /library serving prefers them.
//
// ⚠️ RUN AS A SUBPROCESS (see CLI below). Draco and image encoding are
// CPU-seconds of synchronous wasm — inside the sequencer process they would
// freeze pose relay and every world for the duration. server.ts spawns
// `bun run server/optimize.ts <in> <out>` per file, one at a time.
//
// VRMs are deliberately NOT optimized: their springbone/MToon extension data
// has not been proven through this pipeline, and a corrupted body is a much
// worse day than a heavy one.

import { NodeIO, type Document } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRTextureBasisu } from "@gltf-transform/extensions";
import { dedup, prune, resample, textureCompress, draco, listTextureSlots } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";

let ioP: Promise<NodeIO> | null = null;
function getIO(): Promise<NodeIO> {
  ioP ??= (async () =>
    new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
      "draco3d.decoder": await draco3d.createDecoderModule(),
      "draco3d.encoder": await draco3d.createEncoderModule(),
    }))();
  return ioP;
}

export async function optimizeGlb(bytes: Uint8Array): Promise<Uint8Array> {
  const io = await getIO();
  const doc = await io.readBinary(bytes);

  const transforms = [
    dedup(),      // shared textures/accessors stored once
    prune(),      // unreferenced leftovers dropped
    resample(),   // animation keyframes deduplicated (lossless within tolerance)
  ];

  // Texture recompression needs sharp (native). If it can't load on this box,
  // a draco-only pass is still most of the win — degrade, don't die.
  try {
    const sharp = (await import("sharp")).default;
    transforms.push(textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      resize: [1024, 1024],
    }));
  } catch (e) {
    console.error(`[optimize] sharp unavailable (${(e as Error).message}) — skipping texture pass`);
  }

  transforms.push(draco());

  await doc.transform(...transforms);
  return io.writeBinary(doc);
}

// ---- KTX2 (§20a): the library variant diet ----------------------------------
// GPU-native compressed textures pay the texture bill in the right currency:
// no createImageBitmap decode (1.0-1.2s/GLB on the MacBook trace), no raw
// RGBA uploads (1.07GB of them), 4-8× less VRAM. The variant is the store
// recipe MINUS the webp stage (KTX2 encodes from the best source) PLUS a
// per-texture KTX2 pass between resample and draco. Output serves ONLY on
// ?ktx2=1 — KHR_texture_basisu lands in extensionsRequired, and parsers
// without a KTX2 decoder throw on required extensions.

/** Encoder probe: KTX2_TOKTX env (absolute path) → toktx on PATH → ktx on
 *  PATH. Absent is an ENVIRONMENT, not a failure — the CLI exits 3 so the
 *  caller env-skips, never writing a .failed marker (the sharp-degrade
 *  pattern: the content is fine, this box just can't encode yet). */
export function findKtx2Encoder(): string | null {
  const env = process.env.KTX2_TOKTX;
  if (env && existsSync(env)) return env;
  return Bun.which("toktx") ?? Bun.which("ktx");
}

// baseColor/emissive are the eye-facing sRGB slots — ETC1S block noise hides
// in shading there and the files come out ~4-8× smaller. Everything else
// (normal, occlusion-roughness-metallic, packed maps, any slot we can't name)
// carries per-channel DATA: MToon samples .r/.b scalars and normals get
// renormalized, so ETC1S artifacts read as corruption — those go UASTC+zstd.
const COLOR_SLOT = /baseColor|emissive/i;

/** Per-texture KTX2 encode, in place on the Document. Supports both
 *  KTX-Software CLIs — toktx (v4.4.2, the primary target) and the newer
 *  unified `ktx create` — detected by basename. Content problems skip the
 *  TEXTURE, never the file. Returns how many textures were converted. */
async function ktx2CompressTextures(doc: Document, encoder: string): Promise<number> {
  const isToktx = basename(encoder).toLowerCase().includes("toktx");
  // sharp converts non-PNG sources (webp/jpeg) and 4-aligns dimensions —
  // KHR_texture_basisu (and WebGPU BC upload) wants width/height % 4 == 0.
  // sharp is optional today: without it, only already-aligned PNGs encode.
  let sharp: any = null;
  try { sharp = (await import("sharp")).default; } catch { /* PNG-only pass below */ }
  const tmp = mkdtempSync(join(tmpdir(), "ew-ktx2-"));
  let converted = 0;
  try {
    const textures = doc.getRoot().listTextures();
    for (let i = 0; i < textures.length; i++) {
      const tex = textures[i];
      const image = tex.getImage();
      if (!image) continue;
      const label = tex.getName() || tex.getURI() || `#${i}`;
      const slots = listTextureSlots(tex);
      const srgb = slots.some((s) => COLOR_SLOT.test(s));
      // any non-color reference (or a slot we can't classify) ⇒ UASTC
      const uastc = slots.length === 0 || slots.some((s) => !COLOR_SLOT.test(s));
      const size = tex.getSize(); // [w, h] | null (png/jpeg/webp all readable)
      const aligned = !!size && size[0] % 4 === 0 && size[1] % 4 === 0;
      const mime = tex.getMimeType();
      // Pass the source straight through wherever the encoder reads it
      // natively — PNG always, JPEG for toktx. sharp is only the CONVERTER
      // for the rest (webp, unaligned dims), and it must be treated as
      // best-effort here: @gltf-transform/functions' ndarray-pixels vendors
      // its OWN sharp, and two libvips copies in one process can corrupt
      // each other's GLib state (observed on win32: "colourspace: parameter
      // space not set"). A sharp failure skips the TEXTURE, never the file.
      let inPath: string;
      if (aligned && (mime === "image/png" || (mime === "image/jpeg" && isToktx))) {
        inPath = join(tmp, mime === "image/png" ? `${i}.png` : `${i}.jpg`);
        await Bun.write(inPath, image);
      } else if (sharp) {
        try {
          let s = sharp(Buffer.from(image));
          const meta = await s.metadata();
          const w = meta.width ?? 0, h = meta.height ?? 0;
          if (w && h && (w % 4 || h % 4))
            s = s.resize(Math.ceil(w / 4) * 4, Math.ceil(h / 4) * 4, { fit: "fill" });
          inPath = join(tmp, `${i}.png`);
          await Bun.write(inPath, await s.png().toBuffer());
        } catch (e) {
          console.error(`[optimize] ktx2: skip ${label} — sharp convert failed (${(e as Error).message})`);
          continue;
        }
      } else {
        console.error(`[optimize] ktx2: skip ${label} (${mime}${aligned ? "" : ", not 4-aligned"}) — sharp unavailable`);
        continue;
      }
      const outPath = join(tmp, `${i}.ktx2`);
      // ETC1S rides BasisLZ (zstd would be invalid there); UASTC gets mild
      // RDO (λ=1.0, quality-preserving) + zstd 18 — raw UASTC is a flat
      // 8bpp and zstd alone barely dents it (the crow's 2048² maps came out
      // 2.6× the JPEG source; RDO is what makes zstd bite). --genmipmap
      // always: compressed mips can't be generated at runtime.
      const args = isToktx
        ? [encoder, "--t2", "--genmipmap", "--assign_oetf", srgb ? "srgb" : "linear",
           ...(uastc ? ["--encode", "uastc", "--uastc_quality", "2", "--uastc_rdo_l", "1.0", "--zcmp", "18"]
                     : ["--encode", "etc1s", "--qlevel", "128"]),
           outPath, inPath]
        : [encoder, "create", "--format", srgb ? "R8G8B8A8_SRGB" : "R8G8B8A8_UNORM",
           "--generate-mipmap",
           ...(uastc ? ["--encode", "uastc", "--uastc-quality", "2", "--uastc-rdo", "--uastc-rdo-l", "1.0", "--zstd", "18"]
                     : ["--encode", "basis-lz", "--qlevel", "128"]),
           inPath, outPath];
      const proc = Bun.spawn(args, { stdout: "ignore", stderr: "pipe" });
      const code = await proc.exited;
      const err = (await new Response(proc.stderr).text()).trim();
      if (code !== 0 || !existsSync(outPath)) {
        console.error(`[optimize] ktx2: encode failed on ${label} (${err.split("\n")[0] || `exit ${code}`}) — texture kept as-is`);
        continue;
      }
      tex.setImage(new Uint8Array(await Bun.file(outPath).arrayBuffer())).setMimeType("image/ktx2");
      const uri = tex.getURI();
      if (uri) tex.setURI(uri.replace(/\.[a-zA-Z0-9]+$/, "") + ".ktx2");
      converted++;
    }
    // the extension's write hook moves converted textures' sources under
    // KHR_texture_basisu; required per spec (no fallback image is written)
    if (converted > 0) doc.createExtension(KHRTextureBasisu).setRequired(true);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  return converted;
}

/** The --ktx2 diet: dedup + prune + resample (the store recipe minus webp —
 *  KTX2 encodes from the best source) + per-texture KTX2 + draco. */
export async function optimizeGlbKtx2(bytes: Uint8Array, encoder: string): Promise<Uint8Array> {
  const io = await getIO();
  const doc = await io.readBinary(bytes);
  await doc.transform(dedup(), prune(), resample());
  await ktx2CompressTextures(doc, encoder);
  await doc.transform(draco());
  return io.writeBinary(doc);
}

// ---- CLI: bun run server/optimize.ts [--ktx2] <in.glb> <out.glb> ------------
// Exit 0 = wrote out.glb. Exit 2 = optimization made it BIGGER (nothing
// written — serve the original). Exit 1 = failure, reason on stderr.
// Exit 3 (--ktx2 only) = no KTX2 encoder on this box — environmental, the
// caller must env-skip (never a .failed marker).

if (import.meta.main) {
  const argv = process.argv.slice(2);
  const ktx2Mode = argv.includes("--ktx2");
  const [inPath, outPath] = argv.filter((a) => a !== "--ktx2");
  if (!inPath || !outPath) {
    console.error("usage: bun run server/optimize.ts [--ktx2] <in.glb> <out.glb>");
    process.exit(1);
  }
  let encoder: string | null = null;
  if (ktx2Mode && !(encoder = findKtx2Encoder())) {
    console.error("[optimize] ktx2: no encoder — brew install ktx (so toktx/ktx is on PATH) or set KTX2_TOKTX");
    process.exit(3);
  }
  try {
    const src = new Uint8Array(await Bun.file(inPath).arrayBuffer());
    const t0 = performance.now();
    const out = ktx2Mode ? await optimizeGlbKtx2(src, encoder!) : await optimizeGlb(src);
    const ms = Math.round(performance.now() - t0);
    // An already-lean upload (someone re-uploading our own optimized output,
    // a tiny primitive) gains nothing — don't shadow it with a same-size copy.
    // The --ktx2 gate is deliberately generous: KTX2 variants exist for
    // decode/upload wins (no createImageBitmap, GPU-native mips, 4-8× less
    // VRAM), not just wire bytes — accept anything not grossly bigger than
    // the ORIGINAL source (>1.25×).
    if (out.length >= src.length * (ktx2Mode ? 1.25 : 0.95)) {
      console.error(`[optimize] not smaller (${src.length} -> ${out.length}, ${ms}ms) — keeping original`);
      process.exit(2);
    }
    // tmp+rename: a killed pass must never leave a truncated GLB where the
    // server will trustingly serve it
    await Bun.write(`${outPath}.tmp`, out);
    const { renameSync } = await import("node:fs");
    renameSync(`${outPath}.tmp`, outPath);
    console.log(`[optimize] ${src.length} -> ${out.length} bytes (${(src.length / out.length).toFixed(1)}x, ${ms}ms)`);
    process.exit(0);
  } catch (e) {
    console.error(`[optimize] ${(e as Error).stack ?? e}`);
    process.exit(1);
  }
}
