
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

## tex-54 ad-hoc verification (r4) — 2026-08-17T18:39:43.058Z

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

## tex-54 ad-hoc verification (r5) — 2026-08-17T18:40:49.176Z

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

## tex-55 ad-hoc verification — 2026-08-17T18:43:41.973Z

```
PASS stone + timber + iron materials — stone,timber,iron
PASS 3 deduped images — images 3
PASS stone ≡ kiln's ashlar (byte-family law, standing from tex-10)
PASS timber ≡ house wallSpan's (byte-family law)
PASS iron ≡ forge's (byte-family law — smithed scoop)
PASS no duplicate NAMED node names — clean
PASS texMat buckets carry TEXCOORD_0 == POSITION (water flat by design) — buckets 3
PASS texture bytes < 400KB — 21940B
PASS GLB < 20MB — 38.8KB
PASS rebuild deterministic — a96ee31d29c2

ALL PASS

```

## tex-55 final ad-hoc verification — 2026-08-17T18:46:26.602Z

```
PASS cistern rebuild deterministic + == live build (a96ee31d29c2085f) — a96ee31d29c2085f
PASS stone + timber + iron materials, 3 deduped images
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)
PASS av-bcistern live on 3-family build, pose (18.2,-16.5) — store/a96ee31d29c2085f.glb
PASS woodyard untouched (approval block honored)
PASS verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-10 pin) — code=0
PASS tex-55 pin green
PASS tex-10 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS listed one-shots consumed

ALL PASS

```

## tex-55 ad-hoc verification (re-run) — 2026-08-17T18:47:10.545Z

```
PASS mkv3-bakery-cistern97.ts: rebuild deterministic + == live build (a96ee31d29c2085f) — a96ee31d29c2085f
PASS decode: stone + timber + iron materials, 3 deduped images
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)
PASS texMat buckets carry TEXCOORD_0 == POSITION (water flat by design) — buckets 3
PASS texture bytes < 400KB — 21940B
PASS GLB < 20MB — 38.8KB
PASS place-tex55-timber25.ts effect: cistern live, pose (18.2,-16.5) — store/a96ee31d29c2085f.glb
PASS census (verify-tex55-live.ts assertions): hutch + house current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-55 pin green
PASS tex-10 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-55 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-55 ad-hoc verification (r3) — 2026-08-17T18:47:57.582Z

```
PASS mkv3-bakery-cistern97.ts: rebuild deterministic + == live build (a96ee31d29c2085f) — a96ee31d29c2085f
PASS decode: stone + timber + iron materials, 3 deduped images
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)
PASS texMat buckets carry TEXCOORD_0 == POSITION (water flat by design) — buckets 3
PASS texture bytes < 400KB — 21940B
PASS GLB < 20MB — 38.8KB
PASS place-tex55-timber25.ts effect: cistern live, pose (18.2,-16.5) — store/a96ee31d29c2085f.glb
PASS census (verify-tex55-live.ts assertions): hutch + house current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-55 pin green
PASS tex-10 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-55 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-55 ad-hoc verification (r4) — 2026-08-17T18:48:41.263Z

```
PASS mkv3-bakery-cistern97.ts: rebuild deterministic + == live build (a96ee31d29c2085f) — a96ee31d29c2085f
PASS decode: stone + timber + iron materials, 3 deduped images
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)
PASS texMat buckets carry TEXCOORD_0 == POSITION (water flat by design) — buckets 3
PASS texture bytes < 400KB — 21940B
PASS GLB < 20MB — 38.8KB
PASS place-tex55-timber25.ts effect: cistern live, pose (18.2,-16.5) — store/a96ee31d29c2085f.glb
PASS census (verify-tex55-live.ts assertions): hutch + house current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-55 pin green
PASS tex-10 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-55 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-55 ad-hoc verification (r5) — 2026-08-17T18:49:43.610Z

```
PASS mkv3-bakery-cistern97.ts: rebuild deterministic + == live build (a96ee31d29c2085f) — a96ee31d29c2085f
PASS decode: stone + timber + iron materials, 3 deduped images
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge's (byte-family, buffer-compared)
PASS texMat buckets carry TEXCOORD_0 == POSITION (water flat by design) — buckets 3
PASS texture bytes < 400KB — 21940B
PASS GLB < 20MB — 38.8KB
PASS place-tex55-timber25.ts effect: cistern live, pose (18.2,-16.5) — store/a96ee31d29c2085f.glb
PASS census (verify-tex55-live.ts assertions): hutch + house current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS tex-55 pin green
PASS tex-10 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green
PASS all prior tex-55 one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-56 evidence one-shot — 2026-08-17T18:57:29.261Z

```
PASS mkv3-forge98.ts: rebuild deterministic + == live build (6715b0f885deaed7) — 6715b0f885deaed7
PASS decode: timber + iron + stone materials, 3 deduped images
PASS timber ≡ house's + iron ≡ standing forge family (bellbase) + stone ≡ kiln's (byte-family, buffer-compared)
PASS fire_fg_coals GROUP anchor survives (forge-fire comp target)
PASS timber buckets carry TEXCOORD_0 == POSITION (coals/water/trim flat by design) — buckets 1
PASS texture bytes < 400KB — 21940B
PASS GLB < 20MB — 58.4KB
PASS place-tex56-timber26.ts effect: forge live, pose (20.9,-16.3), fire comps recovered — store/6715b0f885deaed7.glb
PASS census anchors: cistern + hutch current, woodyard untouched
PASS verify-tex56.ts present (committed, does not self-delete)
PASS verify-tex56.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-56 pin + refreshed tex-6 pin + ledger + HEAD) — code=0
PASS prior tex-56 T-dir one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-56 evidence one-shot (e2) — 2026-08-17T18:58:25.497Z

```
PASS mkv3-forge98.ts: rebuild deterministic + == live build (6715b0f885deaed7) — 6715b0f885deaed7
PASS decode: timber + iron + stone materials, 3 deduped images
PASS timber ≡ house's + iron ≡ standing forge family (bellbase) + stone ≡ kiln's (byte-family, buffer-compared)
PASS fire_fg_coals GROUP anchor survives (forge-fire comp target)
PASS timber buckets carry TEXCOORD_0 == POSITION (coals/water/trim flat by design) — buckets 1
PASS texture bytes < 400KB — 21940B
PASS GLB < 20MB — 58.4KB
PASS place-tex56-timber26.ts effect: forge live, pose (20.9,-16.3), fire comps recovered — store/6715b0f885deaed7.glb
PASS census anchors: cistern + hutch current, woodyard untouched
PASS verify-tex56.ts present (committed, does not self-delete)
PASS verify-tex56.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-56 pin + refreshed tex-6 pin + ledger + HEAD) — code=0
PASS prior tex-56 T-dir one-shots consumed (self-deleting law)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-57 evidence one-shot — 2026-08-17T19:03:55.737Z

```
PASS mkv3-market.ts: rebuild deterministic + == live build (2bb51287d4e1a2a2) — 2bb51287d4e1a2a2
PASS decode: timber material, 3 deduped images (timber + 2 standing weaves)
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS mk_awn_0 + mk_awn_1 GROUP anchors survive (wind comp targets)
PASS timber buckets carry TEXCOORD_0 == POSITION (loaves/jugs flat by design) — buckets 1
PASS texture bytes < 400KB — 21077B
PASS GLB < 20MB — 61.6KB
PASS place-tex57-timber27.ts effect: market live, pose (-5.7,5.7), wind comps recovered — store/2bb51287d4e1a2a2.glb
PASS census anchors: forge + cistern current, woodyard untouched
PASS verify-tex57.ts present (committed, does not self-delete)
PASS verify-tex57.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-57 pin + refreshed tex-8 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-57 fresh evidence — 2026-08-17T19:07:46.136Z

```
PASS verify-tex57.ts (covers mkv3-market.ts rebuild+decode, place-tex57 rollout+comps, verify-repairs gate) runs 0 / ALL PASS — code=0
PASS …rebuild deterministic + == live pin (2bb51287d4e1a2a2) asserted
PASS …timber ≡ house wallSpan's (byte-family) asserted
PASS …market live, wind comps recovered asserted
PASS verify-tex57.ts present in repo
PASS prior tex-57 T-dir one-shots consumed
PASS verify-repairs.ts 0 / ALL PASS (tex-57 pin + refreshed tex-8 pin) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-57 final2 evidence — 2026-08-17T19:08:31.906Z

```
PASS verify-tex57.ts runs 0 / ALL PASS (mkv3-market rebuild+decode, place-tex57 rollout+comps, gate) — code=0
PASS rebuild deterministic + == live pin asserted
PASS timber ≡ wallSpan byte-family asserted
PASS live rollout + wind comps asserted
PASS listed one-shots consumed (-evidence, -fresh)
PASS verify-repairs.ts 0 / ALL PASS — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-58 evidence one-shot — 2026-08-17T19:12:58.277Z

```
PASS verify-tex58.ts runs 0 / ALL PASS (mkv3-shrine rebuild+decode, place-tex58 rollout+comps, gate) — code=0
PASS rebuild deterministic + == live pin asserted
PASS stone ≡ kiln byte-family asserted
PASS votive flame comps recovered asserted
PASS verify-tex58.ts present in repo
PASS verify-repairs.ts 0 / ALL PASS (tex-58 pin + refreshed tex-13 pin) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-58 fresh evidence (tracker follow-up) — 2026-08-17T19:13:50.863Z

```
PASS mkv3-shrine.ts: rebuild deterministic + == live build (d0d3743a60802625) — d0d3743a60802625
PASS decode: stone material present — soil-0,stone,glow2
PASS stone ≡ kiln's ashlar (byte-family, buffer-compared)
PASS flame_v0 + flame_v1 + flame_v2 GROUP anchors survive (votive comp targets)
PASS stone buckets carry TEXCOORD_0 == POSITION (bowl/candles/runes flat by design) — buckets 1
PASS texture bytes < 400KB — 21190B
PASS GLB < 20MB — 59.6KB
PASS place-tex58-stone13.ts effect: shrine live, pose (-23.7,-3.8), votive comps recovered — store/d0d3743a60802625.glb
PASS census anchors: market + forge current, woodyard untouched (approval block honored)
PASS verify-tex58.ts present (committed, does not self-delete)
PASS verify-repairs.ts 0 / ALL PASS (tex-58 pin + refreshed tex-13 pin + ledger + HEAD) — code=0
PASS prior one-shot consumed (hermes-verify-tex58-evidence.ts absent)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-58 r2 evidence (tracker follow-up) — 2026-08-17T19:14:39.914Z

```
PASS mkv3-shrine.ts: rebuild deterministic + == live build (d0d3743a60802625) — d0d3743a60802625
PASS decode: stone material present — soil-0,stone,glow2
PASS stone ≡ kiln's ashlar (byte-family, buffer-compared)
PASS flame_v0 + flame_v1 + flame_v2 GROUP anchors survive (votive comp targets)
PASS stone buckets carry TEXCOORD_0 == POSITION (bowl/candles/runes flat by design) — buckets 1
PASS texture bytes < 400KB — 21190B
PASS GLB < 20MB — 59.6KB
PASS place-tex58-stone13.ts effect: shrine live, pose (-23.7,-3.8), votive comps recovered — store/d0d3743a60802625.glb
PASS census anchors: market + forge current, woodyard untouched (approval block honored)
PASS verify-tex58.ts present (committed, does not self-delete)
PASS verify-repairs.ts 0 / ALL PASS (tex-58 pin + refreshed tex-13 pin + ledger + HEAD) — code=0
PASS both listed one-shots consumed (-evidence, -fresh absent)
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-59 evidence one-shot — 2026-08-17T19:19:14.139Z

```
PASS mkv3-monument.ts: rebuild deterministic + == live build (9520e61fc8e9d887) — 9520e61fc8e9d887
PASS decode: stone material present — stone,soil-0,glow2
PASS stone ≡ kiln's ashlar (byte-family, buffer-compared)
PASS knot GROUP anchor survives (spin comp target)
PASS stone buckets carry TEXCOORD_0 == POSITION (knot/bowls/plaque/lamp flat by design) — buckets 1
PASS texture bytes < 400KB — 21190B
PASS GLB < 20MB — 156.1KB
PASS place-tex59-stone14.ts effect: monument live, pose (-6.4,-6.4), knot comp recovered — store/9520e61fc8e9d887.glb
PASS census anchors: shrine + market current, woodyard untouched (approval block honored)
PASS verify-tex59.ts present (committed, does not self-delete)
PASS verify-repairs.ts 0 / ALL PASS (tex-59 pin + refreshed tex-18 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-59 r2 evidence (tracker follow-up) — 2026-08-17T19:20:09.765Z

```
PASS mkv3-monument.ts: rebuild deterministic + == live build (9520e61fc8e9d887) — 9520e61fc8e9d887
PASS decode: stone material present — stone,soil-0,glow2
PASS stone ≡ kiln's ashlar (byte-family, buffer-compared)
PASS knot GROUP anchor survives (spin comp target)
PASS stone buckets carry TEXCOORD_0 == POSITION (knot/bowls/plaque/lamp flat by design) — buckets 1
PASS texture bytes < 400KB — 21190B
PASS GLB < 20MB — 156.1KB
PASS place-tex59-stone14.ts effect: monument live, pose (-6.4,-6.4), knot comp recovered — store/9520e61fc8e9d887.glb
PASS census anchors: shrine + market current, woodyard untouched (approval block honored)
PASS verify-tex59.ts present (committed, does not self-delete)
PASS verify-tex59.ts runs 0 / ALL PASS — code=0
PASS listed one-shot consumed (hermes-verify-tex59-evidence.ts absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-59 pin + refreshed tex-18 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-60 changed-paths evidence — 2026-08-17T19:25:44.659Z

```
PASS mkv3-dyelaundry94.ts: rebuild deterministic + == live build (c5f85611ffefc522) — c5f85611ffefc522
PASS decode: timber material (+ 4 standing weaves), 5 deduped images — timber,weave-blue,weave-bone,weave-brass,weave-brown
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS all six dl_cloth GROUP anchors survive (wind comp targets)
PASS timber buckets carry TEXCOORD_0 == POSITION (rope line flat by design) — buckets 1
PASS texture bytes < 400KB — 22460B
PASS GLB < 20MB — 48.3KB
PASS place-tex60-timber28.ts effect: laundry live, pose (-26.7,-13), all six wind comps recovered — store/c5f85611ffefc522.glb
PASS census anchors: monument + shrine current, woodyard untouched (approval block honored)
PASS verify-tex60.ts present (committed, does not self-delete)
PASS verify-tex60.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-60 pin + refreshed tex-5 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-60 final evidence (tracker follow-up) — 2026-08-17T19:26:42.797Z

```
PASS mkv3-dyelaundry94.ts: rebuild deterministic + == live build (c5f85611ffefc522) — c5f85611ffefc522
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS all six dl_cloth GROUP anchors survive (wind comp targets)
PASS place-tex60-timber28.ts effect: laundry live, pose (-26.7,-13), all six wind comps recovered — store/c5f85611ffefc522.glb
PASS anchors current + woodyard untouched (approval block honored)
PASS verify-tex60.ts present (committed, does not self-delete)
PASS verify-tex60.ts runs 0 / ALL PASS — code=0
PASS prior one-shot consumed (hermes-verify-tex60-paths.ts absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-60 pin + refreshed tex-5 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-61 changed-paths evidence — 2026-08-17T20:06:55.722Z

```
PASS mkv3-mapboard.ts: rebuild deterministic + == live build (d555acbd0b0ab516) — d555acbd0b0ab516
PASS decode: timber material, 1 deduped image — timber,glow1
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS timber buckets carry TEXCOORD_0 == POSITION (frame/chips/pin flat by design) — buckets 1
PASS texture bytes < 400KB — 19698B
PASS GLB < 20MB — 83.9KB
PASS place-tex61-timber29.ts effect: mapboard live, pose (1.7,8.5) — store/d555acbd0b0ab516.glb
PASS anchors current + woodyard untouched (approval block honored)
PASS verify-tex61.ts present (committed, does not self-delete)
PASS verify-tex61.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-61 pin + refreshed tex-17 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-61 final evidence (tracker follow-up) — 2026-08-17T20:07:40.676Z

```
PASS mkv3-mapboard.ts: rebuild deterministic + == live build (d555acbd0b0ab516) — d555acbd0b0ab516
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS place-tex61-timber29.ts effect: mapboard live, pose (1.7,8.5) — store/d555acbd0b0ab516.glb
PASS anchors current + woodyard untouched (approval block honored)
PASS verify-tex61.ts present (committed, does not self-delete)
FAIL verify-tex61.ts runs 0 / ALL PASS — code=1
PASS prior one-shot consumed (hermes-verify-tex61-paths.ts absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-61 pin + refreshed tex-17 pin + ledger + HEAD) — code=0
FAIL git tree clean for this lane's paths

2 FAIL

```

## tex-61 r2 evidence (tracker follow-up) — 2026-08-17T20:09:28.693Z

```
PASS mkv3-mapboard.ts: rebuild deterministic + == live build (d555acbd0b0ab516) — d555acbd0b0ab516
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS place-tex61-timber29.ts effect: mapboard live, pose (1.7,8.5) — store/d555acbd0b0ab516.glb
PASS anchors current + woodyard untouched (approval block honored)
PASS verify-tex61.ts present (committed, does not self-delete)
PASS verify-tex61.ts runs 0 / ALL PASS — code=0
PASS both prior one-shots consumed (-paths, -final absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-61 pin + refreshed tex-17 pin + ledger + HEAD incl. polish lane) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-61 r3 evidence (tracker follow-up) — 2026-08-17T20:10:39.880Z

```
PASS mkv3-mapboard.ts: rebuild deterministic + == live build (d555acbd0b0ab516) — d555acbd0b0ab516
PASS decode: timber material, 1 deduped image — timber,glow1
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS timber buckets carry TEXCOORD_0 == POSITION (frame/chips/pin flat by design) — buckets 1
PASS texture bytes < 400KB — 19698B
PASS GLB < 20MB — 83.9KB
PASS place-tex61-timber29.ts effect: mapboard live, pose (1.7,8.5) — store/d555acbd0b0ab516.glb
PASS anchors current + woodyard untouched (approval block honored)
PASS verify-tex61.ts present (committed, does not self-delete)
PASS verify-tex61.ts runs 0 / ALL PASS — code=0
PASS all three listed one-shots consumed (-final, -paths, -r2 absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-61 pin + refreshed tex-17 pin + ledger + HEAD incl. polish lane) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-62 changed-paths evidence — 2026-08-17T21:39:48.316Z

```
PASS mkv3-wayside.ts: rebuild deterministic + == live build (5db486a79ff5cc6e) — 5db486a79ff5cc6e
PASS decode: timber + iron + stone materials, 3 deduped images — timber,iron,stone,glow3
PASS timber ≡ house's + iron ≡ forge family's + stone ≡ kiln's (byte-family, buffer-compared)
FAIL lamp anchor survives (motion:lamp comp target)
PASS texMat buckets carry TEXCOORD_0 == POSITION (pack/dipper/lamp flat by design) — buckets 3
PASS texture bytes < 400KB — 21940B
PASS GLB < 20MB — 49.9KB
PASS place-tex62-timber30.ts effect: wayside live, pose (2.4,15), lamp comp recovered — store/5db486a79ff5cc6e.glb
PASS census anchors: mapboard + laundry current, woodyard untouched (approval block honored)
PASS verify-tex62.ts present (committed, does not self-delete)
PASS verify-tex62.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-62 pin + refreshed tex-19 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

1 FAIL

```

## tex-62 changed-paths evidence (v2, lamp anchor shape corrected from source) — 2026-08-17T21:40:38.876Z

```
PASS mkv3-wayside.ts: rebuild deterministic + == live build (5db486a79ff5cc6e) — 5db486a79ff5cc6e
PASS decode: timber + iron + stone materials, 3 deduped images — timber,iron,stone,glow3
PASS timber ≡ house's + iron ≡ forge family's + stone ≡ kiln's (byte-family, buffer-compared)
PASS lamp anchor survives as a named MESH node (motion:lamp comp target — source-decoded shape)
PASS texMat buckets carry TEXCOORD_0 == POSITION (pack/dipper flat; lamp emissive) — buckets 3
PASS texture bytes < 400KB — 21940B
PASS GLB < 20MB — 49.9KB
PASS place-tex62-timber30.ts effect: wayside live, pose (2.4,15), lamp comp recovered — store/5db486a79ff5cc6e.glb
PASS census anchors: mapboard + laundry current, woodyard untouched (approval block honored)
PASS verify-tex62.ts present (committed, does not self-delete)
PASS verify-tex62.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-62 pin + refreshed tex-19 pin + ledger + HEAD) — code=0
FAIL git tree clean for this lane's paths

1 FAIL

```

## tex-62 all5 evidence — 2026-08-17T21:41:46.553Z

```
PASS mkv3-wayside.ts: rebuild deterministic + == live build (5db486a79ff5cc6e) — 5db486a79ff5cc6e
PASS decode: timber + iron + stone materials, 3 deduped images — timber,iron,stone,glow3
PASS timber ≡ house's + iron ≡ forge family's + stone ≡ kiln's (byte-family, buffer-compared)
PASS lamp anchor survives as a named MESH node (motion:lamp comp target, source-decoded shape)
PASS texMat buckets carry TEXCOORD_0 == POSITION (pack/dipper flat; lamp emissive) — buckets 3
PASS texture bytes < 400KB — 21940B
PASS GLB < 20MB — 49.9KB
PASS place-tex62-timber30.ts effect: wayside live, pose (2.4,15), lamp comp recovered — store/5db486a79ff5cc6e.glb
PASS census anchors: mapboard + laundry current, woodyard untouched (approval block honored)
PASS verify-tex62.ts present (committed, does not self-delete)
PASS verify-tex62.ts runs 0 / ALL PASS — code=0
PASS both listed one-shots consumed (-paths, -paths2 absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-62 pin + refreshed tex-19 pin + ledger + HEAD) — code=0

ALL PASS

```

## tex-63 changed-paths evidence — 2026-08-17T21:47:18.594Z

```
PASS mkv3-miles14.ts: rebuilds deterministic + == live builds (n a2b6bfab…, s 3d423bc3…) — a2b6bfab613f/3d423bc3590b
PASS milestone-n: stone + iron + glow materials — stone,iron,glow2
PASS milestone-n: stone ≡ kiln's + iron ≡ forge family's (byte-family, buffer-compared)
PASS milestone-n: texMat buckets carry TEXCOORD_0 == POSITION — buckets 2
PASS milestone-s: stone + iron + glow materials — stone,iron,glow2
PASS milestone-s: stone ≡ kiln's + iron ≡ forge family's (byte-family, buffer-compared)
PASS milestone-s: texMat buckets carry TEXCOORD_0 == POSITION — buckets 2
PASS place-tex63-multi7.ts effect: both milestones live on textured builds, poses preserved — store/a2b6bfab613f0e84.glb / store/3d423bc3590b5068.glb
PASS anchors current + woodyard untouched (approval block honored)
PASS verify-tex63.ts present (committed, does not self-delete)
PASS verify-tex63.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-63 pin + refreshed tex-27 pins + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-63 r2 evidence (tracker follow-up) — 2026-08-17T21:48:23.640Z

```
PASS mkv3-miles14.ts: rebuilds deterministic + == live builds (n a2b6bfab…, s 3d423bc3…) — a2b6bfab613f/3d423bc3590b
PASS milestone-n: stone + iron + glow materials — stone,iron,glow2
PASS milestone-n: stone ≡ kiln's + iron ≡ forge family's (byte-family, buffer-compared)
PASS milestone-n: texMat buckets carry TEXCOORD_0 == POSITION (lantern glow flat) — buckets 2
PASS milestone-n: texture bytes < 400KB + GLB < 20MB — 2242B / 10.0KB
PASS milestone-s: stone + iron + glow materials — stone,iron,glow2
PASS milestone-s: stone ≡ kiln's + iron ≡ forge family's (byte-family, buffer-compared)
PASS milestone-s: texMat buckets carry TEXCOORD_0 == POSITION (lantern glow flat) — buckets 2
PASS milestone-s: texture bytes < 400KB + GLB < 20MB — 2242B / 10.0KB
PASS place-tex63-multi7.ts effect: both milestones live on textured builds, poses preserved — store/a2b6bfab613f0e84.glb / store/3d423bc3590b5068.glb
PASS anchors current + woodyard untouched (approval block honored)
PASS verify-tex63.ts present (committed, does not self-delete)
PASS verify-tex63.ts runs 0 / ALL PASS — code=0
PASS listed one-shot consumed (hermes-verify-tex63-paths.ts absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-63 pin + refreshed tex-27 pins + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-63 r3 evidence (tracker follow-up) — 2026-08-17T21:49:32.198Z

```
PASS mkv3-miles14.ts: rebuilds deterministic + == live builds (n a2b6bfab…, s 3d423bc3…) — a2b6bfab613f/3d423bc3590b
PASS milestone-n: stone ≡ kiln's + iron ≡ forge family's (byte-family, buffer-compared) + glow survives — stone,iron,glow2
PASS milestone-s: stone ≡ kiln's + iron ≡ forge family's (byte-family, buffer-compared) + glow survives — stone,iron,glow2
PASS place-tex63-multi7.ts effect: both milestones live on textured builds, poses preserved — store/a2b6bfab613f0e84.glb / store/3d423bc3590b5068.glb
PASS anchors current + woodyard untouched (approval block honored)
PASS verify-tex63.ts present (committed, does not self-delete)
PASS verify-tex63.ts runs 0 / ALL PASS — code=0
PASS both listed one-shots consumed (-paths, -r2 absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-63 pin + refreshed tex-27 pins + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-64 changed-paths evidence — 2026-08-17T21:58:06.706Z

```
PASS mkv3-waystone41.ts: rebuild deterministic + == live build (5fcaa644f4ba290b) — 5fcaa644f4ba290b
PASS decode: stone + timber + iron materials, 3 deduped images — stone,timber,iron,glow3,glow4
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge family's (byte-family, buffer-compared)
PASS ws_float + ws_float_spin GROUP anchors survive (motion comp targets)
PASS the FLOATING stone stays flat (STRANGER'S-STONE law — material-less prim, no tile)
PASS texMat buckets carry TEXCOORD_0 == POSITION — buckets 3
PASS texture bytes < 400KB + GLB < 20MB — 21940B / 47.3KB
PASS place-tex64-timber31.ts effect: waystone live, pose (-38.9,-38.9), all three comps recovered — store/5fcaa644f4ba290b.glb
PASS census anchors: milestone-n + wayside current, woodyard untouched (approval block honored)
PASS verify-tex64.ts present (committed, does not self-delete)
PASS verify-tex64.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-64 pin + refreshed tex-28 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-64 fresh evidence (tracker follow-up) — 2026-08-17T21:58:59.507Z

```
PASS mkv3-waystone41.ts: rebuild deterministic + == live build (5fcaa644f4ba290b) — 5fcaa644f4ba290b
PASS decode: stone + timber + iron materials, 3 deduped images — stone,timber,iron,glow3,glow4
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge family's (byte-family, buffer-compared)
PASS ws_float + ws_float_spin GROUP anchors survive (motion comp targets)
PASS the FLOATING stone stays flat (STRANGER'S-STONE law — material-less prim, no tile)
PASS texMat buckets carry TEXCOORD_0 == POSITION — buckets 3
PASS texture bytes < 400KB + GLB < 20MB — 21940B / 47.3KB
PASS place-tex64-timber31.ts effect: waystone live, pose (-38.9,-38.9), all three comps recovered — store/5fcaa644f4ba290b.glb
PASS census anchors: milestone-n + wayside current, woodyard untouched (approval block honored)
PASS verify-tex64.ts present (committed, does not self-delete)
PASS verify-tex64.ts runs 0 / ALL PASS — code=0
PASS prior one-shot consumed (hermes-verify-tex64-paths.ts absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-64 pin + refreshed tex-28 pin + ledger + HEAD) — code=0

ALL PASS

```

## tex-65 changed-paths evidence — 2026-08-17T22:04:19.123Z

```
PASS mkv3-potter41.ts: rebuild deterministic + == live build (cea5c582bf05d72f) — cea5c582bf05d72f
PASS decode: timber material, 1 deduped image — timber
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS pwheel GROUP anchor survives (wheel comp target)
PASS timber buckets carry TEXCOORD_0 == POSITION (clay/ware/cloth flat by design) — buckets 2
PASS texture bytes < 400KB + GLB < 20MB — 19698B / 49.7KB
PASS place-tex65-timber32.ts effect: potter live, pose (24.1,38.6), wheel comp recovered — store/cea5c582bf05d72f.glb
PASS census anchors: waystone + milestone-n current, woodyard untouched (approval block honored)
PASS verify-tex65.ts present (committed, does not self-delete)
PASS verify-tex65.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-65 pin + refreshed tex-29 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-65 r2 evidence (tracker follow-up) — 2026-08-17T22:05:19.781Z

```
PASS mkv3-potter41.ts: rebuild deterministic + == live build (cea5c582bf05d72f) — cea5c582bf05d72f
PASS decode: timber material, 1 deduped image — timber
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS pwheel GROUP anchor survives (wheel comp target)
PASS timber buckets carry TEXCOORD_0 == POSITION (clay/ware/cloth flat by design) — buckets 2
PASS texture bytes < 400KB + GLB < 20MB — 19698B / 49.7KB
PASS place-tex65-timber32.ts effect: potter live, pose (24.1,38.6), wheel comp recovered — store/cea5c582bf05d72f.glb
PASS census anchors: waystone + milestone-n current, woodyard untouched (approval block honored)
PASS verify-tex65.ts present (committed, does not self-delete)
PASS verify-tex65.ts runs 0 / ALL PASS — code=0
PASS prior one-shot consumed (hermes-verify-tex65-paths.ts absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-65 pin + refreshed tex-29 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-65 r3 evidence (tracker follow-up) — 2026-08-17T22:06:14.178Z

```
PASS mkv3-potter41.ts: rebuild deterministic + == live build (cea5c582bf05d72f) — cea5c582bf05d72f
PASS decode: timber material, 1 deduped image — timber
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS pwheel GROUP anchor survives (wheel comp target)
PASS timber buckets carry TEXCOORD_0 == POSITION (clay/ware/cloth flat by design) — buckets 2
PASS texture bytes < 400KB + GLB < 20MB — 19698B / 49.7KB
PASS place-tex65-timber32.ts effect: potter live, pose (24.1,38.6), wheel comp recovered — store/cea5c582bf05d72f.glb
PASS census anchors: waystone + milestone-n current, woodyard untouched (approval block honored)
PASS verify-tex65.ts present (committed, does not self-delete)
PASS verify-tex65.ts runs 0 / ALL PASS — code=0
PASS both listed one-shots consumed (-paths, -r2 absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-65 pin + refreshed tex-29 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-65 r4 evidence (tracker follow-up) — 2026-08-17T22:07:05.855Z

```
PASS mkv3-potter41.ts: rebuild deterministic + == live build (cea5c582bf05d72f) — cea5c582bf05d72f
PASS decode: timber material, 1 deduped image — timber
PASS timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS pwheel GROUP anchor survives (wheel comp target)
PASS timber buckets carry TEXCOORD_0 == POSITION (clay/ware/cloth flat by design) — buckets 2
PASS texture bytes < 400KB + GLB < 20MB — 19698B / 49.7KB
PASS place-tex65-timber32.ts effect: potter live, pose (24.1,38.6), wheel comp recovered — store/cea5c582bf05d72f.glb
PASS census anchors: waystone + milestone-n current, woodyard untouched (approval block honored)
PASS verify-tex65.ts present (committed, does not self-delete)
PASS verify-tex65.ts runs 0 / ALL PASS — code=0
PASS all prior one-shots consumed (-paths, -r2, -r3 absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-65 pin + refreshed tex-29 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-66 changed-paths evidence — 2026-08-17T22:12:44.522Z

```
PASS mkv3-kiln38.ts: rebuild deterministic + == live build (0bdc0d18dddacf9b) — 0bdc0d18dddacf9b
PASS decode: stone + timber materials, 2 deduped images — stone,timber,glow2
PASS stone ≡ quarry's ashlar + timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS fire_kiln GROUP anchor survives (fire comp target)
PASS texMat buckets carry TEXCOORD_0 == POSITION (cobbles/putty/fire flat by design) — buckets 2
PASS texture bytes < 400KB + GLB < 20MB — 21183B / 46.0KB
PASS place-tex66-stone18.ts effect: kiln live, pose (28.9,37), fire + smoke comps recovered — store/0bdc0d18dddacf9b.glb
PASS census anchors: potter + waystone current, woodyard untouched (approval block honored)
PASS verify-tex66.ts present (committed, does not self-delete)
PASS verify-tex66.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-66 pin + refreshed tex-9 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-66 fresh evidence (tracker follow-up) — 2026-08-17T22:13:30.321Z

```
PASS mkv3-kiln38.ts: rebuild deterministic + == live build (0bdc0d18dddacf9b) — 0bdc0d18dddacf9b
PASS decode: stone + timber materials, 2 deduped images — stone,timber,glow2
PASS stone ≡ quarry's ashlar + timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS fire_kiln GROUP anchor survives (fire comp target)
PASS texMat buckets carry TEXCOORD_0 == POSITION (cobbles/putty/fire flat by design) — buckets 2
PASS texture bytes < 400KB + GLB < 20MB — 21183B / 46.0KB
PASS place-tex66-stone18.ts effect: kiln live, pose (28.9,37), fire + smoke comps recovered — store/0bdc0d18dddacf9b.glb
PASS census anchors: potter + waystone current, woodyard untouched (approval block honored)
PASS verify-tex66.ts present (committed, does not self-delete)
PASS verify-tex66.ts runs 0 / ALL PASS — code=0
PASS prior one-shot consumed (hermes-verify-tex66-paths.ts absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-66 pin + refreshed tex-9 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-66 final evidence (tracker follow-up) — 2026-08-17T22:14:36.121Z

```
PASS mkv3-kiln38.ts: rebuild deterministic + == live build (0bdc0d18dddacf9b) — 0bdc0d18dddacf9b
PASS decode: stone + timber materials, 2 deduped images — stone,timber,glow2
PASS stone ≡ quarry's ashlar + timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS fire_kiln GROUP anchor survives (fire comp target)
PASS texMat buckets carry TEXCOORD_0 == POSITION (cobbles/putty/fire flat by design) — buckets 2
PASS texture bytes < 400KB + GLB < 20MB — 21183B / 46.0KB
PASS place-tex66-stone18.ts effect: kiln live, pose (28.9,37), fire + smoke comps recovered — store/0bdc0d18dddacf9b.glb
PASS census anchors: potter + waystone current, woodyard untouched (approval block honored)
PASS verify-tex66.ts present (committed, does not self-delete)
PASS verify-tex66.ts runs 0 / ALL PASS — code=0
PASS both listed one-shots consumed (-paths, -fresh absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-66 pin + refreshed tex-9 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-66 audit evidence (tracker follow-up) — 2026-08-17T22:15:35.172Z

```
PASS mkv3-kiln38.ts: rebuild deterministic + == live build (0bdc0d18dddacf9b) — 0bdc0d18dddacf9b
PASS decode: stone + timber materials, 2 deduped images — stone,timber,glow2
PASS stone ≡ quarry's ashlar + timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS fire_kiln GROUP anchor survives (fire comp target)
PASS texMat buckets carry TEXCOORD_0 == POSITION (cobbles/putty/fire flat by design) — buckets 2
PASS texture bytes < 400KB + GLB < 20MB — 21183B / 46.0KB
PASS place-tex66-stone18.ts effect: kiln live, pose (28.9,37), fire + smoke comps recovered — store/0bdc0d18dddacf9b.glb
PASS census anchors: potter + waystone current, woodyard untouched (approval block honored)
PASS verify-tex66.ts present (committed, does not self-delete)
PASS verify-tex66.ts runs 0 / ALL PASS — code=0
PASS all three listed one-shots consumed (-paths, -fresh, -final absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-66 pin + refreshed tex-9 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-67 changed-paths evidence — 2026-08-17T22:22:13.763Z

```
PASS mkv3-plaza.ts: rebuild deterministic + == live build (933ab1f96fe1e734) — 933ab1f96fe1e734
PASS decode: stone + timber + iron (bowl) + 6 soil pavers, 9 deduped images — iron,stone,soil-0,soil-1,soil-2,soil-3,soil-4,soil-5,timber,glow9
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge family's (byte-family, buffer-compared)
PASS pz_kettle GROUP anchor survives (kettle comp target)
PASS texMat buckets carry TEXCOORD_0 == POSITION (logs/grain/rope/ladle/water flat by design) — buckets 6
PASS texture bytes < 400KB + GLB < 20MB — 140020B / 239.3KB
PASS place-tex67-iron23.ts effect: plaza live, pose (0,0), all 4 comps recovered — store/933ab1f96fe1e734.glb
PASS census anchors: kiln + potter current, woodyard untouched (approval block honored)
PASS verify-tex67.ts present (committed, does not self-delete)
FAIL verify-tex67.ts runs 0 / ALL PASS — code=1
FAIL verify-repairs.ts 0 / ALL PASS (tex-67 pin + refreshed tex-52 pin + ledger + HEAD) — code=1
PASS git tree clean for this lane's paths

2 FAIL

```

## tex-67 fresh evidence (post tex-67b marker) — 2026-08-17T22:23:37.966Z

```
PASS mkv3-plaza.ts: rebuild deterministic + == live build (933ab1f96fe1e734) — 933ab1f96fe1e734
PASS decode: stone + timber + iron (bowl) + 6 soil pavers, 9 deduped images — iron,stone,soil-0,soil-1,soil-2,soil-3,soil-4,soil-5,timber,glow9
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge family's (byte-family, buffer-compared)
PASS pz_kettle GROUP anchor survives (kettle comp target)
PASS texMat buckets carry TEXCOORD_0 == POSITION (logs/grain/rope/ladle/water flat by design) — buckets 6
PASS texture bytes < 400KB + GLB < 20MB — 140020B / 239.3KB
PASS place-tex67-iron23.ts effect: plaza live, pose (0,0), all 4 comps recovered — store/933ab1f96fe1e734.glb
PASS census anchors: kiln + potter current, woodyard untouched (approval block honored)
PASS verify-tex67.ts present (committed, does not self-delete)
PASS verify-tex67.ts runs 0 / ALL PASS — code=0
PASS prior one-shot consumed (hermes-verify-tex67-paths.ts absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-67 pin + refreshed tex-52 pin + ledger + HEAD after marker) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-67 closing evidence (tracker follow-up) — 2026-08-17T22:24:46.947Z

```
PASS mkv3-plaza.ts: rebuild deterministic + == live build (933ab1f96fe1e734) — 933ab1f96fe1e734
PASS decode: stone + timber + iron (hearth bowl) + 6 soil pavers, 9 deduped images — iron,stone,soil-0,soil-1,soil-2,soil-3,soil-4,soil-5,timber,glow9
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge family's (byte-family, buffer-compared)
PASS pz_kettle GROUP anchor survives (kettle comp target)
PASS texMat buckets carry TEXCOORD_0 == POSITION (logs/grain/rope/ladle/water flat by design) — buckets 6
PASS texture bytes < 400KB + GLB < 20MB — 140020B / 239.3KB
PASS place-tex67-iron23.ts effect: plaza live, pose (0,0), all 4 comps recovered — store/933ab1f96fe1e734.glb
PASS census anchors: kiln + potter current, woodyard untouched (approval block honored)
PASS verify-tex67.ts present (committed, does not self-delete)
PASS verify-tex67.ts runs 0 / ALL PASS — code=0
PASS both listed one-shots consumed (-paths, -fresh absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-67 pin + refreshed tex-52 pin + ledger + HEAD post-marker) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-67 durable evidence (persistent verifier run directly) — 2026-08-17T22:25:23Z

```
PASS plaza rebuild deterministic + == live build (933ab1f96fe1e734) — 933ab1f96fe1e734
PASS decode: stone + timber + iron materials — iron,stone,soil-0,soil-1,soil-2,soil-3,soil-4,soil-5,timber,glow9
PASS 9 deduped images (3 tex-67 families + 6 soil paver variants standing from tex-11) — images 9
PASS stone ≡ kiln's + timber ≡ house's + iron ≡ forge family's (byte-family, buffer-compared)
PASS pz_kettle GROUP anchor survives (kettle comp target)
PASS bowl carried by the iron material (merged into pz3_* statics — not a KEEP node; MERGED-STATICS law)
PASS no duplicate NAMED node names — clean
PASS texMat buckets carry TEXCOORD_0 == POSITION (logs/grain/rope/ladle/water flat by design) — buckets 6
PASS texture bytes < 400KB — 140020B
PASS GLB < 20MB — 239.3KB
PASS place-tex67-iron23.ts effect: plaza live, pose (0,0), all 4 comps recovered — store/933ab1f96fe1e734.glb
PASS census anchors: kiln + potter current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-52 pin) — code=0
PASS tex-67 pin green
PASS tex-52 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green (polish-inclusive)

ALL PASS
```
T-dir tex-67 one-shot residue: 0 (all consumed per hygiene law)

## tex-68 durable evidence (persistent verifier run directly) — 2026-08-17T22:30:29Z

```
PASS watchpost rebuild deterministic + == live build (256e16a13027fb93) — 256e16a13027fb93
PASS decode: timber + iron materials — timber,iron,glow2
PASS 2 deduped images — images 2
PASS timber ≡ house wallSpan's + iron ≡ forge family's (byte-family, buffer-compared)
PASS fire_coals GROUP anchor survives (fire comp target)
PASS no duplicate NAMED node names — clean
PASS texMat buckets carry TEXCOORD_0 == POSITION (horn/coals flat by design) — buckets 2
PASS texture bytes < 400KB — 20455B
PASS GLB < 20MB — 54.2KB
PASS place-tex68-timber35.ts effect: watchpost live, pose (15.6,-15.6), fire comps recovered — store/256e16a13027fb93.glb
PASS census anchors: plaza + kiln current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-14 pin) — code=0
PASS tex-68 pin green
PASS tex-14 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green (polish-inclusive)

ALL PASS
```
T-dir tex-68 one-shot residue: 0 (none minted this run — persistent-verifier pattern)

## tex-68 changed-paths evidence — 2026-08-17T22:31:35.248Z

```
PASS mkv3-watchpost.ts: rebuild deterministic + == live build (256e16a13027fb93) — 256e16a13027fb93
PASS decode: timber + iron materials, 2 deduped images — timber,iron,glow2
PASS timber ≡ house wallSpan's + iron ≡ forge family's (byte-family, buffer-compared)
PASS fire_coals GROUP anchor survives (fire comp target)
PASS no duplicate NAMED node names — clean
PASS texMat buckets carry TEXCOORD_0 == POSITION (horn/coals flat by design) — buckets 2
PASS texture bytes < 400KB + GLB < 20MB — 20455B / 54.2KB
PASS place-tex68-timber35.ts effect: watchpost live, pose (15.6,-15.6), fire comps recovered — store/256e16a13027fb93.glb
PASS census anchors: plaza + kiln current, woodyard untouched (approval block honored)
PASS verify-tex68.ts present (committed, does not self-delete)
PASS verify-tex68.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-68 pin + refreshed tex-14 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-68 fresh re-verification (persistent verifier + gate, run directly) — 2026-08-17T22:32:20Z

```
PASS watchpost rebuild deterministic + == live build (256e16a13027fb93) — 256e16a13027fb93
PASS decode: timber + iron materials — timber,iron,glow2
PASS 2 deduped images — images 2
PASS timber ≡ house wallSpan's + iron ≡ forge family's (byte-family, buffer-compared)
PASS fire_coals GROUP anchor survives (fire comp target)
PASS no duplicate NAMED node names — clean
PASS texMat buckets carry TEXCOORD_0 == POSITION (horn/coals flat by design) — buckets 2
PASS texture bytes < 400KB — 20455B
PASS GLB < 20MB — 54.2KB
PASS place-tex68-timber35.ts effect: watchpost live, pose (15.6,-15.6), fire comps recovered — store/256e16a13027fb93.glb
PASS census anchors: plaza + kiln current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-14 pin) — code=0
PASS tex-68 pin green
PASS tex-14 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green (polish-inclusive)

ALL PASS
--- standing gate:
ALL PASS
```
T-dir residue check: hermes-verify-tex68* remaining = 0 (prior one-shot consumed after its single 13/13 pass, output committed at 4b714a1)

## tex-69 durable evidence (persistent verifier run directly) — 2026-08-17T22:43:06Z

```
PASS pre-state: carousel on disk is the polish staged build (38fbbc26) — 38fbbc26dcdfcc1a
PASS belltower rebuild deterministic + == live build (82e4c316b62e5006) — 82e4c316b62e5006
PASS decode: stone + timber materials — stone,timber,glow2
PASS 2 deduped images — images 2
PASS stone ≡ kiln's + timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS bell GROUP anchor survives (motion comp target)
PASS no duplicate NAMED node names — clean
PASS texMat buckets carry TEXCOORD_0 == POSITION (bell brass/rope/lamp flat by design) — buckets 2
PASS texture bytes < 400KB — 21183B
PASS GLB < 20MB — 76.1KB
PASS place-tex69-timber36.ts effect: belltower live, pose (5.7,5.7), motion+reactions recovered — store/82e4c316b62e5006.glb
PASS carousel-safety law: live carousel untouched by tex-69 (polish lane's 38fbbc26 staged build) — store/cd22d0b09e70bebc.glb
PASS census anchors: watchpost + plaza current, woodyard untouched
PASS verify-repairs.ts 0 / ALL PASS (incl. refreshed tex-20 pin) — code=0
PASS tex-69 pin green
PASS tex-20 pin refreshed (no FAIL)
PASS ledger law EXACT + HEAD gate green (polish-inclusive)

ALL PASS
```
carousel disk artifact re-restored: 38fbbc26dcdfcc1a (polish staged build, byte-identical)

## tex-69 changed-paths evidence — 2026-08-17T22:44:05.311Z

```
PASS carousel backup exists (polish staged build snapshot)
PASS pre-state: disk carousel is the polish staged build (38fbbc26) — 38fbbc26dcdfcc1a
PASS mkv3-landmarks.ts: belltower rebuild deterministic + == live build (82e4c316b62e5006) — 82e4c316b62e5006
PASS carousel-safety: re-restored byte-identical to polish staged build (38fbbc26) — 38fbbc26dcdfcc1a
PASS collateral: inn byte-identical (45e51e8ecd7dc57e) — 45e51e8ecd7dc57e
PASS collateral: windmill byte-identical (d18cbc3f5e3e43b2) — d18cbc3f5e3e43b2
PASS decode: stone + timber materials, 2 deduped images — stone,timber,glow2
PASS stone ≡ kiln's + timber ≡ house wallSpan's (byte-family, buffer-compared)
PASS bell GROUP anchor survives (motion comp target)
PASS texMat buckets carry TEXCOORD_0 == POSITION (bell brass/rope/lamp flat by design) — buckets 2
PASS texture bytes < 400KB + GLB < 20MB — 21183B / 76.1KB
PASS place-tex69-timber36.ts effect: belltower live, pose (5.7,5.7), motion+reactions recovered — store/82e4c316b62e5006.glb
PASS live carousel untouched by tex-69 (cd22d0b0, polish lane's approved build) — store/cd22d0b09e70bebc.glb
PASS census anchors: watchpost + plaza current, woodyard untouched (approval block honored)
PASS verify-tex69.ts present (committed, does not self-delete)
PASS verify-tex69.ts runs 0 / ALL PASS — code=0
PASS carousel-safety post-verifier restore (38fbbc26) — 38fbbc26dcdfcc1a
PASS prior one-shot consumed (hermes-verify-tex69-pre.ts absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-69 pin + refreshed tex-20 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-70 changed-paths evidence — 2026-08-17T22:50:58.063Z

```
PASS mkv3-quarry36.ts: rebuild deterministic + == live build (6b3da17816aeeb55) — 6b3da17816aeeb55
PASS decode: stone + timber + iron materials, 3 deduped images — stone,timber,iron,glow3
PASS stone ≡ kiln's + timber ≡ house wallSpan's + iron ≡ forge family's (byte-family, buffer-compared)
PASS texMat buckets carry TEXCOORD_0 == POSITION (tool marks/gap/lamp core flat by design) — buckets 3
PASS texture bytes < 400KB + GLB < 20MB — 21940B / 60.5KB
PASS place-tex70-timber37.ts effect: quarry live, pose (33.9,33.9) — store/6b3da17816aeeb55.glb
PASS census anchors: belltower + watchpost current, woodyard untouched (approval block honored)
PASS verify-tex70.ts present (committed, does not self-delete)
PASS verify-tex70.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-70 pin + refreshed tex-24 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-70 tracker follow-up evidence — 2026-08-17T22:52:01.584Z

```
PASS mkv3-quarry36.ts: rebuild deterministic + == live build (6b3da17816aeeb55) — 6b3da17816aeeb55
PASS decode: stone + timber + iron, 3 deduped images — stone,timber,iron,glow3
PASS stone ≡ kiln's + timber ≡ house wallSpan's + iron ≡ forge family's (buffer-compared)
PASS TEXCOORD_0 == POSITION on all texMat buckets — buckets 3
PASS texture bytes < 400KB + GLB < 20MB — 21940B / 60.5KB
PASS place-tex70-timber37.ts effect: quarry live at pose (33.9,33.9) — store/6b3da17816aeeb55.glb
PASS census anchors current (belltower, watchpost), woodyard untouched
PASS verify-tex70.ts present (committed, non-self-deleting)
PASS verify-tex70.ts runs 0 / ALL PASS — code=0
PASS prior one-shot consumed (hermes-verify-tex70-paths.ts absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-70 pin + refreshed tex-24 + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-70 closing evidence — 2026-08-17T22:53:04.015Z

```
PASS mkv3-quarry36.ts: rebuild deterministic + == live build (6b3da17816aeeb55) — 6b3da17816aeeb55
PASS decode: stone + timber + iron, 3 deduped images — stone,timber,iron,glow3
PASS stone ≡ kiln's + timber ≡ house wallSpan's + iron ≡ forge family's (buffer-compared)
PASS TEXCOORD_0 == POSITION on all texMat buckets — buckets 3
PASS texture bytes < 400KB + GLB < 20MB — 21940B / 60.5KB
PASS place-tex70-timber37.ts effect: quarry live at pose (33.9,33.9) — store/6b3da17816aeeb55.glb
PASS census anchors current (belltower, watchpost), woodyard untouched
PASS verify-tex70.ts present (committed, non-self-deleting)
PASS verify-tex70.ts runs 0 / ALL PASS — code=0
PASS both listed one-shots consumed (-paths, -tracker absent)
PASS verify-repairs.ts 0 / ALL PASS (tex-70 pin + refreshed tex-24 + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```

## tex-71 changed-paths evidence — 2026-08-17T22:57:54.390Z

```
PASS mkv3-charcoal40.ts: rebuild deterministic + == live build (dcb3bb63442a764c) — dcb3bb63442a764c
PASS decode: timber + iron materials, 2 deduped images — timber,glow1,iron
PASS timber ≡ house wallSpan's + iron ≡ forge family's (byte-family, buffer-compared)
PASS TEXCOORD_0 == POSITION on all texMat buckets — buckets 2
PASS texture bytes < 400KB + GLB < 20MB — 20455B / 53.1KB
PASS place-tex71-timber38.ts effect: charcoal live, pose (19.1,29.4), smoke comp recovered — store/dcb3bb63442a764c.glb
PASS census anchors: quarry + kiln current, woodyard untouched (approval block honored)
PASS verify-tex71.ts present (committed, does not self-delete)
PASS verify-tex71.ts runs 0 / ALL PASS — code=0
PASS verify-repairs.ts 0 / ALL PASS (tex-71 pin + refreshed tex-25 pin + ledger + HEAD) — code=0
PASS git tree clean for this lane's paths

ALL PASS

```
