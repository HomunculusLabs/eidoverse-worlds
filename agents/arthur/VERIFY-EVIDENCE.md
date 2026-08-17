
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

## tex-50 ad-hoc verification (re-run) — 2026-08-17T17:56:01.637Z

```
PASS mkv3-watchpost.ts: rebuild deterministic + == live build (e7f5534850748fd3) — e7f5534850748fd3
PASS decode: iron material, 2 deduped images
PASS iron ≡ forge's (byte-family, buffer-compared)
PASS fire_coals GROUP anchor survives (sentry-fire comp target)
PASS horn survives as flat merged static (MERGED-STATICS, tex-25)
PASS iron bucket carries TEXCOORD_0 == POSITION (bowl only; coals + horn flat by design) — buckets 1
PASS place-tex50-metal5.ts effect: watchpost live, pose (15.6,-15.6), fire comps recovered — store/e7f5534850748fd3.glb
PASS census (verify-tex50-live.ts assertions): stable + treeline current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-50 pin green
PASS refreshed tex-14 pin green (e7f55348)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-50 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-50 ad-hoc verification (r3) — 2026-08-17T17:57:08.608Z

```
PASS mkv3-watchpost.ts: rebuild deterministic + == live build (e7f5534850748fd3) — e7f5534850748fd3
PASS decode: iron material, 2 deduped images
PASS iron ≡ forge's (byte-family, buffer-compared)
PASS fire_coals GROUP anchor survives (sentry-fire comp target)
PASS horn survives as flat merged static (MERGED-STATICS, tex-25)
PASS iron bucket carries TEXCOORD_0 == POSITION (bowl only; coals + horn flat by design) — buckets 1
PASS place-tex50-metal5.ts effect: watchpost live, pose (15.6,-15.6), fire comps recovered — store/e7f5534850748fd3.glb
PASS census (verify-tex50-live.ts assertions): stable + treeline current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-50 pin green
PASS refreshed tex-14 pin green (e7f55348)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-50 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-50 ad-hoc verification (r4) — 2026-08-17T17:58:16.004Z

```
PASS mkv3-watchpost.ts: rebuild deterministic + == live build (e7f5534850748fd3) — e7f5534850748fd3
PASS decode: iron material, 2 deduped images
PASS iron ≡ forge's (byte-family, buffer-compared)
PASS fire_coals GROUP anchor survives (sentry-fire comp target)
PASS horn survives as flat merged static (MERGED-STATICS, tex-25)
PASS iron bucket carries TEXCOORD_0 == POSITION (bowl only; coals + horn flat by design) — buckets 1
PASS place-tex50-metal5.ts effect: watchpost live, pose (15.6,-15.6), fire comps recovered — store/e7f5534850748fd3.glb
PASS census (verify-tex50-live.ts assertions): stable + treeline current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-50 pin green
PASS refreshed tex-14 pin green (e7f55348)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-50 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-51 ad-hoc verification — 2026-08-17T18:01:11.721Z

```
PASS timber + iron materials (weaves already stand from tex-8) — timber,iron,weave-blue,weave-bone2
PASS 4 deduped images (timber/iron/weave-blue/weave-bone2) — images 4
PASS timber ≡ house wallSpan's (byte-family law)
PASS iron ≡ forge's (byte-family law — hoops are smithed)
PASS dh_strip_blue + dh_strip_bone GROUP anchors survive (wind comps)
PASS no duplicate NAMED node names — clean
PASS timber + iron buckets carry TEXCOORD_0 == POSITION (liquids + rope flat by design) — buckets 2
PASS texture bytes < 400KB — 21834B
PASS GLB < 20MB — 63.0KB
PASS rebuild deterministic — 29b4efc54101

ALL PASS

```

## tex-51 final ad-hoc verification — 2026-08-17T18:04:23.570Z

```
PASS dyehouse rebuild deterministic + == live build (29b4efc54101106d) — 29b4efc54101106d
PASS timber + iron materials, 4 deduped images
PASS timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)
PASS dh_strip GROUP anchors survive (wind comp targets)
PASS timber + iron buckets carry TEXCOORD_0 == POSITION (liquids + rope flat by design) — buckets 2
PASS av-dyehouse live on textured build, pose (-21,-21.6), wind comps recovered — store/29b4efc54101106d.glb
PASS woodyard untouched (approval block honored)
PASS verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-8 pin) — code=0
PASS tex-51 pin green
FAIL tex-8 pin refreshed to 29b4efc5 (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS listed one-shots consumed

1 FAIL

```

## tex-51b final ad-hoc verification (label-line regex corrected) — 2026-08-17T18:05:14.166Z

```
PASS dyehouse rebuild deterministic + == live build (29b4efc54101106d) — 29b4efc54101106d
PASS timber + iron materials, 4 deduped images
PASS timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)
PASS dh_strip GROUP anchors survive (wind comp targets)
PASS timber + iron buckets carry TEXCOORD_0 == POSITION (liquids + rope flat by design) — buckets 2
PASS av-dyehouse live on textured build, pose (-21,-21.6), wind comps recovered — store/29b4efc54101106d.glb
PASS woodyard untouched (approval block honored)
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-51 pin green
PASS tex-8 pin green with refresh annotation (label reads 'refreshed by tex-51'; hash on continuation line)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-51 one-shots consumed (self-deleting law)

ALL PASS

```

## tex-51 ad-hoc verification (re-run) — 2026-08-17T18:06:21.277Z

```
PASS mkv3-dyehouse70.ts: rebuild deterministic + == live build (29b4efc54101106d) — 29b4efc54101106d
PASS decode: timber + iron materials, 4 deduped images
PASS timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)
PASS dh_strip GROUP anchors survive (wind comp targets)
PASS timber + iron buckets carry TEXCOORD_0 == POSITION (liquids + rope flat by design) — buckets 2
PASS place-tex51-timber22.ts effect: dyehouse live, pose (-21,-21.6), wind comps recovered — store/29b4efc54101106d.glb
PASS census (verify-tex51-live.ts assertions): dyelaundry + watchpost current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-51 pin green
PASS tex-8 pin green with refresh annotation
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-51 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-51 closing ad-hoc verification — 2026-08-17T18:07:21.502Z

```
PASS mkv3-dyehouse70.ts: rebuild deterministic + == live build (29b4efc54101106d) — 29b4efc54101106d
PASS decode: timber + iron materials, 4 deduped images
PASS timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)
PASS dh_strip GROUP anchors survive (wind comp targets)
PASS timber + iron buckets carry TEXCOORD_0 == POSITION (liquids + rope flat by design) — buckets 2
PASS place-tex51-timber22.ts effect: dyehouse live, pose (-21,-21.6), wind comps recovered — store/29b4efc54101106d.glb
PASS census (verify-tex51-live.ts assertions): dyelaundry + watchpost current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-51 pin green
PASS tex-8 pin green with refresh annotation
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-51 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-52 ad-hoc verification — 2026-08-17T18:12:26.873Z

```
PASS stone + timber + iron + 6 soil materials — stone,soil-0,soil-1,soil-2,soil-3,soil-4,soil-5,timber,iron,glow9
PASS 9 deduped images (3 families + 6 soil variants) — images 9
PASS stone ≡ kiln's ashlar (byte-family law)
PASS timber ≡ house wallSpan's (byte-family law)
PASS iron ≡ forge's (byte-family law)
PASS fire + pz_kettle + well_ anchors survive (embers/simmer/pendulum comps)
PASS no duplicate NAMED node names — clean
PASS stone + timber + iron buckets carry TEXCOORD_0 == POSITION (logs/rope/water/fire flat by design) — buckets 6
PASS texture bytes < 400KB — 140020B
PASS GLB < 20MB — 239.5KB
PASS rebuild deterministic — 4e58865a35f8

ALL PASS

```

## tex-52 final ad-hoc verification — 2026-08-17T18:15:36.810Z

```
PASS plaza rebuild deterministic + == live build (4e58865a35f82ab9) — 4e58865a35f82ab9
PASS stone + timber + iron + 6 soil materials, 9 deduped images
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)
PASS pz_kettle + well_ GROUP anchors survive
PASS av-plaza-hearth live on 3-family build, pose (0,0), all 4 comps recovered — store/4e58865a35f82ab9.glb
PASS woodyard untouched (approval block honored)
PASS verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-11 pin) — code=0
PASS tex-52 pin green
PASS tex-11 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS listed one-shots consumed

ALL PASS

```

## tex-52 ad-hoc verification (re-run) — 2026-08-17T18:16:24.466Z

```
PASS mkv3-plaza.ts: rebuild deterministic + == live build (4e58865a35f82ab9) — 4e58865a35f82ab9
PASS decode: stone + timber + iron + 6 soil, 9 deduped images
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)
PASS pz_kettle + well_ GROUP anchors survive
PASS texMat buckets carry TEXCOORD_0 == POSITION (logs/rope/water/fire flat by design) — buckets 6
PASS place-tex52-multi6.ts effect: plaza live, pose (0,0), all 4 comps recovered — store/4e58865a35f82ab9.glb
PASS census (verify-tex52-live.ts assertions): dyehouse + watchpost current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-52 pin green
PASS tex-11 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-52 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-52 ad-hoc verification (r3) — 2026-08-17T18:17:37.500Z

```
PASS mkv3-plaza.ts: rebuild deterministic + == live build (4e58865a35f82ab9) — 4e58865a35f82ab9
PASS decode: stone + timber + iron + 6 soil, 9 deduped images
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)
PASS pz_kettle + well_ GROUP anchors survive (simmer + pendulum comps)
PASS texMat buckets carry TEXCOORD_0 == POSITION (logs/rope/water/fire flat by design) — buckets 6
PASS texture bytes < 400KB — 140020B
PASS GLB < 20MB — 239.5KB
PASS place-tex52-multi6.ts effect: plaza live, pose (0,0), all 4 comps recovered — store/4e58865a35f82ab9.glb
PASS census (verify-tex52-live.ts assertions): dyehouse + watchpost current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-52 pin green
PASS tex-11 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-52 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-52 ad-hoc verification (r4) — 2026-08-17T18:18:50.585Z

```
PASS mkv3-plaza.ts: rebuild deterministic + == live build (4e58865a35f82ab9) — 4e58865a35f82ab9
PASS decode: stone + timber + iron + 6 soil, 9 deduped images
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)
PASS pz_kettle + well_ GROUP anchors survive (simmer + pendulum comps)
PASS texMat buckets carry TEXCOORD_0 == POSITION (logs/rope/water/fire flat by design) — buckets 6
PASS texture bytes < 400KB — 140020B
PASS GLB < 20MB — 239.5KB
PASS place-tex52-multi6.ts effect: plaza live, pose (0,0), all 4 comps recovered — store/4e58865a35f82ab9.glb
PASS census (verify-tex52-live.ts assertions): dyehouse + watchpost current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-52 pin green
PASS tex-11 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-52 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-53 ad-hoc verification — 2026-08-17T18:25:09.334Z

```
PASS timber + iron materials — timber,stone,glow2,plaster,iron,glow5,glow6
FAIL 2 deduped images — images 4
PASS timber ≡ standing wallSpan family (byte-family law; house is the source)
PASS iron ≡ forge's (byte-family law — smithed pot)
PASS fire + flame + lamp anchors survive
PASS no duplicate NAMED node names — clean
PASS texMat buckets carry TEXCOORD_0 == POSITION (fires/books/blanket/rug flat by design) — buckets 2
PASS texture bytes < 400KB — 41606B
PASS GLB < 20MB — 131.6KB
PASS rebuild deterministic — cff51defbdac

1 FAIL

```

## tex-53b ad-hoc verification (corrected 4-image expectation) — 2026-08-17T18:25:37.565Z

```
PASS timber + iron + stone + plaster materials (+ 3 emissive glows) — timber,stone,glow2,plaster,iron,glow5,glow6
PASS 4 deduped images (timber/stone/plaster/iron — the 4 texture families) — images 4
PASS timber ≡ standing wallSpan family (byte-family law)
PASS iron ≡ forge's (byte-family law — smithed pot)
PASS stone ≡ kiln's (byte-family law, standing from earlier phase)
PASS fire + flame + lamp anchors survive
PASS no duplicate NAMED node names — clean
PASS tex-53 buckets carry TEXCOORD_0 == POSITION (fires/books/blanket/rug flat by design) — buckets 2
PASS texture bytes < 400KB — 41606B
PASS GLB < 20MB — 131.6KB
PASS rebuild deterministic — cff51defbdac

ALL PASS

```

## tex-53 final ad-hoc verification — 2026-08-17T18:28:25.777Z

```
PASS house rebuild deterministic + == live build (cff51defbdacd0ce) — cff51defbdacd0ce
PASS timber + iron + stone materials (4 families total, 4 deduped images)
PASS timber ≡ standing family + iron ≡ forge's + stone ≡ kiln's (byte-family, buffer-compared)
PASS fire + flame + lamp anchors survive
PASS arthur-house live on textured-interior build, pose (22,16), smoke comp recovered — store/cff51defbdacd0ce.glb
PASS woodyard untouched (approval block honored)
PASS verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-4 pin) — code=0
PASS tex-53 pin green
PASS tex-4 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS listed one-shots consumed

ALL PASS

```

## tex-53 ad-hoc verification (re-run) — 2026-08-17T18:29:13.208Z

```
PASS mkv3-house.ts: rebuild deterministic + == live build (cff51defbdacd0ce) — cff51defbdacd0ce
PASS decode: timber + iron + stone materials, 4 deduped images
PASS timber ≡ standing family + iron ≡ forge's + stone ≡ kiln's (byte-family, buffer-compared)
PASS fire + flame + lamp anchors survive
PASS tex-53 buckets carry TEXCOORD_0 == POSITION (fires/books/blanket/rug flat by design) — buckets 2
PASS texture bytes < 400KB — 41606B
PASS GLB < 20MB — 131.6KB
PASS place-tex53-timber23.ts effect: house live, pose (22,16), smoke comp recovered — store/cff51defbdacd0ce.glb
PASS census (verify-tex53-live.ts assertions): plaza + dyehouse current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-53 pin green
PASS tex-4 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-53 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-53 ad-hoc verification (r3) — 2026-08-17T18:30:15.252Z

```
PASS mkv3-house.ts: rebuild deterministic + == live build (cff51defbdacd0ce) — cff51defbdacd0ce
PASS decode: timber + iron + stone materials, 4 deduped images
PASS timber ≡ standing family + iron ≡ forge's + stone ≡ kiln's (byte-family, buffer-compared)
PASS fire + flame + lamp anchors survive
PASS tex-53 buckets carry TEXCOORD_0 == POSITION (fires/books/blanket/rug flat by design) — buckets 2
PASS texture bytes < 400KB — 41606B
PASS GLB < 20MB — 131.6KB
PASS place-tex53-timber23.ts effect: house live, pose (22,16), smoke comp recovered — store/cff51defbdacd0ce.glb
PASS census (verify-tex53-live.ts assertions): plaza + dyehouse current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-53 pin green
PASS tex-4 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-53 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-53 ad-hoc verification (r4) — 2026-08-17T18:31:11.637Z

```
PASS mkv3-house.ts: rebuild deterministic + == live build (cff51defbdacd0ce) — cff51defbdacd0ce
PASS decode: timber + iron + stone materials, 4 deduped images
PASS timber ≡ standing family + iron ≡ forge's + stone ≡ kiln's (byte-family, buffer-compared)
PASS fire + flame + lamp anchors survive
PASS tex-53 buckets carry TEXCOORD_0 == POSITION (fires/books/blanket/rug flat by design) — buckets 2
PASS texture bytes < 400KB — 41606B
PASS GLB < 20MB — 131.6KB
PASS place-tex53-timber23.ts effect: house live, pose (22,16), smoke comp recovered — store/cff51defbdacd0ce.glb
PASS census (verify-tex53-live.ts assertions): plaza + dyehouse current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-53 pin green
PASS tex-4 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-53 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-54 ad-hoc verification — 2026-08-17T18:33:52.870Z

```
PASS timber material — timber
PASS 1 deduped image — images 1
PASS timber ≡ house wallSpan's (byte-family law — legs join the boards)
FAIL rabbits GROUP anchor survives (rabbit motion comp)
PASS no duplicate NAMED node names — clean
PASS timber buckets carry TEXCOORD_0 == POSITION (rabbits/straw/tails flat by design) — buckets 1
PASS texture bytes < 400KB — 19698B
PASS GLB < 20MB — 51.5KB
PASS rebuild deterministic — 6263e8a20eb1

1 FAIL

```

## tex-54b ad-hoc verification (anchor names corrected from source) — 2026-08-17T18:34:27.051Z

```
PASS timber material — timber
PASS 1 deduped image — images 1
PASS timber ≡ house wallSpan's (byte-family law — legs join the boards)
PASS rabbit_sit + rabbit_hop GROUP anchors survive (motion comp targets)
PASS no duplicate NAMED node names — clean
PASS timber buckets carry TEXCOORD_0 == POSITION (rabbits/straw/tails flat by design) — buckets 1
PASS texture bytes < 400KB — 19698B
PASS GLB < 20MB — 51.5KB
PASS rebuild deterministic — 6263e8a20eb1

ALL PASS

```

## tex-54 final ad-hoc verification — 2026-08-17T18:37:13.655Z

```
PASS hutch rebuild deterministic + == live build (6263e8a20eb17cc9) — 6263e8a20eb17cc9
PASS timber material, 1 deduped image
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS rabbit_sit + rabbit_hop GROUP anchors survive (motion comp targets)
PASS av-hutch live on leg-timber build, pose (-28,17.8), rabbit comps recovered — store/6263e8a20eb17cc9.glb
PASS woodyard untouched (approval block honored)
PASS verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-21 pin) — code=0
PASS tex-54 pin green
PASS tex-21 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS listed one-shots consumed

ALL PASS

```

## tex-54 ad-hoc verification (re-run) — 2026-08-17T18:38:00.061Z

```
PASS mkv3-hutch84.ts: rebuild deterministic + == live build (6263e8a20eb17cc9) — 6263e8a20eb17cc9
PASS decode: timber material, 1 deduped image
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS rabbit_sit + rabbit_hop GROUP anchors survive (motion comp targets)
PASS timber buckets carry TEXCOORD_0 == POSITION (rabbits/straw flat by design) — buckets 1
PASS texture bytes < 400KB — 19698B
PASS GLB < 20MB — 51.5KB
PASS place-tex54-timber24.ts effect: hutch live, pose (-28,17.8), rabbit comps recovered — store/6263e8a20eb17cc9.glb
PASS census (verify-tex54-live.ts assertions): house + plaza current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-54 pin green
PASS tex-21 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-54 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-54 ad-hoc verification (r3) — 2026-08-17T18:38:43.606Z

```
PASS mkv3-hutch84.ts: rebuild deterministic + == live build (6263e8a20eb17cc9) — 6263e8a20eb17cc9
PASS decode: timber material, 1 deduped image
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS rabbit_sit + rabbit_hop GROUP anchors survive (motion comp targets)
PASS timber buckets carry TEXCOORD_0 == POSITION (rabbits/straw flat by design) — buckets 1
PASS texture bytes < 400KB — 19698B
PASS GLB < 20MB — 51.5KB
PASS place-tex54-timber24.ts effect: hutch live, pose (-28,17.8), rabbit comps recovered — store/6263e8a20eb17cc9.glb
PASS census (verify-tex54-live.ts assertions): house + plaza current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-54 pin green
PASS tex-21 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-54 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```
