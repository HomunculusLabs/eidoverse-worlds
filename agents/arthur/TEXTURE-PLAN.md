# TEXTURE-PLAN — real surface textures for a vertex-colored village

Loop state for the VILLAGE TEXTURE LOOP. Read first, update every run.
Baseline era-3 village: all GLBs are vertex-color only (POSITION/NORMAL/COLOR_0 + flat PBR).
Client GLTFLoader has DRACO+KTX2 — PNG textures WILL render. Upload cap 20MB.

## Law (from Bill's wakeup prompt)

- Taste: textures read as MATERIAL at distance, not decals. 2-4 muted tones. Subtler when in doubt.
- <400KB texture bytes per GLB. 256px tiles, pure-code PNG (no image deps), deterministic bytes.
- Full pipeline per family rollout: edit mk source -> rebuild -> upload (new hash) -> spawn same id
  -> re-apply comps via FILES -> verify-repairs.ts (extend with texture assertions) -> ledger -> commit.
- Comps wipe on re-place. Uploads 16-21s paced, retry 429. Verbs 12/4s, placers 380ms+.
- Eye-check is Bill's. Only end LOOP_COMPLETE if Bill says stop.

## Phase log

### [tex-0] PHASE 0 — glbwrite texture chain (2026-08-17, wakeup 2)
STATUS: DONE (code + offline verification; no world change — no mk source uses textures yet)

Implemented in `agents/arthur/assets/glbwrite.ts`:
- `encodePNG(w,h,rgba)`: pure-code PNG encoder — CRC32 table, chunk() builder, filter-0 rows,
  zlib level 9 / Z_FILTERED / memLevel 8 (fixed opts = deterministic bytes). No image deps.
- `texMat(name, tones[], {rough,metal,scale,weights})`: deterministic 256px tile → THREE.DataTexture
  (RepeatWrapping, sRGB) → MeshStandardMaterial with .map set. Pixel value = seeded int hash of
  (x,y) → weighted palette pick of 2-4 muted tones; full tint baked into texture.
- toGLB: when a mesh's material has .map (DataTexture): emit TEXCOORD_0 (VEC2 f32, count=POSITION),
  PNG image (deduped by 64-bit pixel hash) → images[] + samplers[] (10497 wrap, 9987/9729 filters)
  → textures[] → material with pbrMetallicRoughness.baseColorTexture. COLOR_0 emitted as white
  255³ for mapped meshes (tint lives in the texture; glTF multiplies COLOR_0 × texture).
- Untextured meshes: byte-identical output path as before (no TEXCOORD, COLOR_0 = material color).
- mergekit.ts: bucket key extended with texture identity (`:T<hash>`) so differently-textured
  materials never merge; untextured key unchanged → existing GLBs byte-stable.

Verified (ad-hoc probe, once, deleted):
- Texture GLB decodes: images/samplers/textures/materials chain present, TEXCOORD_0 count == POSITION
  count, PNG signature in bufferView, IDAT inflates to w*(h)*(4+1)+filter bytes exactly.
- Determinism: two builds → identical sha256.
- Regression: stable/market/mapboard GLBs byte-identical to pre-change hashes (phase0 baseline).
- Texture bytes ~4-15KB per 256px RGBA tile (well under 400KB law).

Baseline hashes before change (regression anchors):
- stable3  03a330f0d9c1efafeb25aa5991b48c0f2d57f72d5577ff10a4f22f5b8c04bc19
- market3  f9f0680aebbda0134a9073bf15f85ce8e946215ed86260d81d3bbb1829af3b90
- mapboard3 505b7f0c84f9a4ceae928ec2c1dbadf421802c03d3ef79a6a2ad188e23b54686

## Phase queue (one family per run)

- [ ] tex-1 THATCH — roof material on gableRoof (housekit.ts kit edit = all buildings at once).
      Muted straw tones (2-3), directional streak bias so slopes read as layered thatch at distance.
      First rollout: prove upload/spawn/comp-reapply/verify pipeline on ONE building first, then
      kit-wide + full census + verify-repairs texture assertions.
- [ ] tex-2 TIMBER — wallSpan beams (housekit.ts, one edit, all buildings). Wood grain, 2 tones.
- [ ] tex-3 PLASTER — wall infill panels. Subtle mottling, 2-3 tones.
- [ ] tex-4 STONE — foundations/plinths/well/kiln. 3-4 muted tones.
- [ ] tex-5 TEXTILES — dye-trade tints (dyehouse awnings, laundry line, market bolts).
- [ ] tex-6 METAL — forge/anvil/hardware. Low-key, roughness-led.
- [ ] tex-7 SOIL — paths, garden beds.

## Open risks / notes

- verify-repairs.ts texture assertions pending (add with tex-1 when first textured entity lands).
- UV coverage: mergekit zero-fills missing UVs — any textured material MUST get real UVs in geometry
  (three primitives have them; custom BufferGeometry needs explicit UV authoring in the family edit).
- Determinism depends on fixed zlib opts (bun/node version pinned by machine); re-hash after toolchain bumps.
