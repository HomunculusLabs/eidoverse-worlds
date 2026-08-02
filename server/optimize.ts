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

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, resample, textureCompress, draco } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";

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

// ---- CLI: bun run server/optimize.ts <in.glb> <out.glb> ---------------------
// Exit 0 = wrote out.glb. Exit 2 = optimization made it BIGGER (nothing
// written — serve the original). Exit 1 = failure, reason on stderr.

if (import.meta.main) {
  const [inPath, outPath] = process.argv.slice(2);
  if (!inPath || !outPath) {
    console.error("usage: bun run server/optimize.ts <in.glb> <out.glb>");
    process.exit(1);
  }
  try {
    const src = new Uint8Array(await Bun.file(inPath).arrayBuffer());
    const t0 = performance.now();
    const out = await optimizeGlb(src);
    const ms = Math.round(performance.now() - t0);
    // An already-lean upload (someone re-uploading our own optimized output,
    // a tiny primitive) gains nothing — don't shadow it with a same-size copy.
    if (out.length >= src.length * 0.95) {
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
