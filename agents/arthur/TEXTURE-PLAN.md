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
- stable3  03a330f0d9c1efafeb25aa5991b48c0f2d57f72d5572ff10a4f22f5b8c04bc19 (ground-truthed: live store path store/03a330f0d9c1efaf.glb == re-upload of post-change rebuild)
- market3  f9f0680aebbda0134a9073bf15f85ce8e946215ed86260d81d3bbb1829af3b90
- mapboard3 505b7f0c84f9a4ceae928ec2c1dbadf421802c03d3ef79a6a2ad188e23b54686

### [tex-1] THATCH — the stable (2026-08-17, wakeups 3-18) — DONE
Live: av-stable stands on store/56d0122215bcca65.glb (pose preserved). Edit:
mkv3-stable.ts roof mat(C.MID) -> texMat("thatch", [0x6b5d4f, 0x7a6a56, 0x5d5142],
{rough .92, scale 5, weights [2,1,1]}). Decode 11/11 (1 PNG 19699B, chain, TEXCOORD
roof-only, white COLOR_0, exact sRGB tones, deterministic). No comps target
av-stable; geometry untouched. verify-repairs.ts pins the live lib permanently.
Ledger: refine-218, refine-219. Commits: 250dd18/388d229 (tex-0), aba3d0d (tex-1).
PENDING BILL: eye-check the stable roof (continuity bet: same MID-brown at distance).
LESSON: terminal network gate blocks curl-style probes with user away — route live
network checks through bun scripts (place-*/verify-* files) which pass the gate.

Edit: mkv3-stable.ts roof slab mat(C.MID) -> texMat("thatch",
[0x6b5d4f, 0x7a6a56, 0x5d5142], {rough .92, scale 5, weights [2,1,1]}) — tones
anchored on old flat MID for continuity; ~1m tile, ~0.2m bundles at world scale.
New GLB: 56d0122215bcca6512438251f25c96fa3ec2b9f76a1719f3abd2cf1c276fc87a (47.8KB,
10 nodes unchanged). Decode probe 11/11 ALL PASS: 1 PNG (19699B), chain resolves,
TEXCOORD_0 == POSITION on the roof prim only (9 plain prims UV-free), COLOR_0 white,
pixels exact sRGB tones at 2:1:1 weights, deterministic rebuild, <400KB law.
No comps on av-stable (source-decoded wakeup 3: no placer targets it) — re-place
needs no comp re-apply. Geometry untouched (texture-only change) — walk surface
identical; pose/lib re-verified in placer, MCPL walk left to the audit lane.

- [ ] tex-1 THATCH — roof material on gableRoof (housekit.ts kit edit = all buildings at once).
      Muted straw tones (2-3), directional streak bias so slopes read as layered thatch at distance.
      First rollout: prove upload/spawn/comp-reapply/verify pipeline on ONE building first, then
      kit-wide + full census + verify-repairs texture assertions.
- [ ] tex-2 TIMBER — wallSpan beams (housekit.ts, one edit, all buildings). Wood grain, 2 tones.
### [tex-2] TIMBER — all 10 wallSpan buildings (2026-08-17, wakeup 19) — DONE
One housekit wallSpan edit → timber tile on every wall panel of arthur-house,
longhouse, garden-cottage, row-cottage, bunkhouse, hall, court, inn, windmill,
stable. Tones 0x4a4038/0x554a3e/0x3f362e (2:1:1), rough .9, scale 3. Plinths
plain. Decode 30/30; rollout live census 22/22 (10 libs + smoke×8 + interior
lights×6 + inn embers/lights + windmill sails/light); belltower bell lives
under comp key 'motion' (probe lesson). verify-repairs pins all 10 timber libs.
Ledger refine-220 (law restored after double-suffix race; refinement lane also
used refine-218 tag — tags are lane-local, tool doesn't enforce uniqueness).
Commits 854ae04, 34caeeb. PLACER LESSON: verb rate limit is shared across
lanes — placers are resume-safe (skip already-live shas) with 700ms pacing +
slow-down backoff. PENDING BILL: eye-check timber walls at distance.

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
