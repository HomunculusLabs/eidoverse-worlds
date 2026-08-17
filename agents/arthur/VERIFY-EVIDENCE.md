
## tex-48 ad-hoc verification — 2026-08-17T17:39:06.169Z

```
PASS mkv3-trees.ts: rebuild deterministic + == live build (8770a4d12ca5503b) — 8770a4d12ca5503b
PASS decode: stone material, 1 deduped image
PASS stone ≡ kiln's (byte-family, buffer-compared)
PASS stone bucket carries TEXCOORD_0 == POSITION (trees/shrubs/grass flat by design) — buckets 1
PASS place-tex48-stone12.ts effect: treeline live, pose (0,0), ff comps recovered — store/8770a4d12ca5503b.glb
PASS census (verify-tex48-live.ts assertions): fieldpond + grainfield current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-48 pin green
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-48 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-49 ad-hoc verification — 2026-08-17T17:42:13.001Z

```
PASS timber + iron materials (thatch already stands from tex-1) — timber,stone,thatch,iron
FAIL 2 deduped images — images 4
PASS timber ≡ house wallSpan's (byte-family law)
PASS iron ≡ forge's (byte-family law)
PASS no duplicate NAMED node names — clean
PASS texMat buckets carry TEXCOORD_0 == POSITION (hay/water/harness flat by design) — buckets 2
PASS texture bytes < 400KB — 41639B
PASS GLB < 20MB — 71.9KB
PASS rebuild deterministic — 89dc80d7bb8f

1 FAIL

```

## tex-49b ad-hoc verification (corrected 4-family expectation) — 2026-08-17T17:42:48.147Z

```
PASS 4 texture families present (thatch/stone/timber/iron) — timber,stone,thatch,iron
PASS 4 deduped images (one per family) — images 4
PASS timber ≡ house wallSpan's (byte-family law)
PASS iron ≡ forge's (byte-family law)
PASS stone ≡ kiln's (byte-family law)
PASS thatch tile unchanged (self-consistent with tex-1 standing build)
PASS no duplicate NAMED node names — clean
PASS tex-49 texMat buckets carry TEXCOORD_0 == POSITION (hay/water/harness flat by design) — buckets 2
PASS texture bytes < 400KB — 41639B
PASS GLB < 20MB — 71.9KB
PASS rebuild deterministic — 89dc80d7bb8f

ALL PASS

```

## tex-49 final ad-hoc verification — 2026-08-17T17:46:01.186Z

```
PASS stable rebuild deterministic + == live build (89dc80d7bb8fc395) — 89dc80d7bb8fc395
PASS 4 families (thatch/stone/timber/iron), 4 deduped images
PASS timber ≡ house's + iron ≡ forge's + stone ≡ kiln's (byte-family, buffer-compared)
PASS av-stable live on textured-fittings build, pose (40,0) — store/89dc80d7bb8fc395.glb
PASS woodyard untouched (approval block honored)
PASS verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-4 pin) — code=0
PASS tex-49 pin green
PASS tex-4 stable pin refreshed to 89dc80d7 (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS listed one-shots consumed

ALL PASS

```

## tex-49 ad-hoc verification (re-run) — 2026-08-17T17:46:57.241Z

```
PASS mkv3-stable.ts: rebuild deterministic + == live build (89dc80d7bb8fc395) — 89dc80d7bb8fc395
PASS decode: 4 families (thatch/stone/timber/iron), 4 deduped images
PASS timber ≡ house's + iron ≡ forge's + stone ≡ kiln's (byte-family, buffer-compared)
PASS tex-49 buckets carry TEXCOORD_0 == POSITION (hay/water/tack flat by design) — buckets 2
PASS place-tex49-timber21.ts effect: stable live, pose (40,0) — store/89dc80d7bb8fc395.glb
PASS census (verify-tex49-live.ts assertions): treeline + fieldpond + stablebench current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-49 pin green
PASS refreshed tex-4 pin green (89dc80d7)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-49 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-49 ad-hoc verification (r3) — 2026-08-17T17:47:54.642Z

```
PASS mkv3-stable.ts: rebuild deterministic + == live build (89dc80d7bb8fc395) — 89dc80d7bb8fc395
PASS decode: 4 families (thatch/stone/timber/iron), 4 deduped images
PASS timber ≡ house's + iron ≡ forge's + stone ≡ kiln's (byte-family, buffer-compared)
PASS tex-49 buckets carry TEXCOORD_0 == POSITION (hay/water/tack flat by design) — buckets 2
PASS place-tex49-timber21.ts effect: stable live, pose (40,0) — store/89dc80d7bb8fc395.glb
PASS census (verify-tex49-live.ts assertions): treeline + fieldpond + stablebench current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-49 pin green
PASS refreshed tex-4 pin green (89dc80d7)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-49 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-50b ad-hoc verification (corrected child-index handling) — 2026-08-17T17:51:24.346Z

```
PASS iron + timber materials (glow2 = emissive coals) — timber,iron,glow2
PASS 2 deduped images — images 2
PASS iron ≡ forge's (byte-family law — braziers are smithed)
PASS fire_coals GROUP anchor survives (sentry-fire comp target)
PASS coals stay flat emissive (own glow2 material, not iron/timber)
FAIL horn node present (stays flat by design)
PASS no duplicate NAMED node names — clean
PASS iron bucket carries TEXCOORD_0 == POSITION (bowl only) — buckets 1
PASS texture bytes < 400KB — 20455B
PASS GLB < 20MB — 52.3KB
PASS rebuild deterministic — e7f553485074

1 FAIL

```

## tex-50c ad-hoc verification (horn = merged static, source-verified) — 2026-08-17T17:52:19.801Z

```
PASS iron + timber materials (glow2 = emissive coals) — timber,iron,glow2
PASS 2 deduped images — images 2
PASS iron ≡ forge's (byte-family law — braziers are smithed)
PASS fire_coals GROUP anchor survives (sentry-fire comp target)
PASS coals stay flat emissive (own glow2 material, not iron/timber)
PASS horn survives as flat merged static (MERGED-STATICS, tex-25; ~31-vert material-less bucket)
PASS no duplicate NAMED node names — clean
PASS iron bucket carries TEXCOORD_0 == POSITION (bowl only) — buckets 1
PASS texture bytes < 400KB — 20455B
PASS GLB < 20MB — 52.3KB
PASS rebuild deterministic — e7f553485074

ALL PASS

```

## tex-50 final ad-hoc verification — 2026-08-17T17:55:10.914Z

```
PASS watchpost rebuild deterministic + == live build (e7f5534850748fd3) — e7f5534850748fd3
PASS iron material, 2 deduped images
PASS iron ≡ forge's (byte-family, buffer-compared)
PASS fire_coals GROUP anchor survives
PASS horn survives as flat merged static (MERGED-STATICS)
PASS av-watchpost live on iron-bowl build, pose (15.6,-15.6), fire comps recovered — store/e7f5534850748fd3.glb
PASS woodyard untouched (approval block honored)
PASS verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-14 pin) — code=0
PASS tex-50 pin green
PASS tex-14 watchpost pin refreshed to e7f55348 (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS listed one-shots consumed

ALL PASS

```
