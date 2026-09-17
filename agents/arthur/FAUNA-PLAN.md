# FAUNA PLAN — living animals for commons-next (fauna-N lane)

Mandate (Bill, 2026-09-16): "improving the animals, they're not very good."
Every standing animal up from prop to creature: readable silhouettes,
articulated idle life, honest species character. New fauna from the
homestead language (goats/ducks/bunnies first). Loop law: FAUNA-LOOP.md.
One species per wakeup, worst-first. Bill alone may end this loop.

## Standing-animal census (2026-09-16, fauna-1) + baseline verdicts

| entity | id | tuple | lib (sha16) | baseline verdict |
|---|---|---|---|---|
| goat pen | `nx-dress-goats` | (34,0,13) yaw -1.2 | c47861e4 → **7e9af5a5** (fauna-1) | WORST — box-goats, floating heads, ZERO comps (motion lost to a re-place comp-wipe; tex-41's pin checks lib only), build bug: N/S post rows spacing R marched to x=9.6 (bbox 14.21m) → **FIXED fauna-1** |
| hen | `nx-dress-hens` | (34,-0.0335,-8) yaw -1.8 | edc1a4c7 → **1ab461bd** (fauna-2) | WORST-NEXT — was ONE 0.4m hen micro-entity standing alone by the coop (the flock's b/c siblings were never spawned here); 7-seg cylinders, ZERO comps, frozen → **FIXED fauna-2** (three-hen flock) |
| fox den | `nx-dress-se-foxden-001` | (73,-0.05,-10.5) yaw 4.712 | 856deec5 | static dressing (v17, dress-107 PLACED_VERIFIED) + **fox resident** `nx-dress-se-fox-001` (fauna-5, bc7376b3) at den-local (0.84,0.012,0.38) |
| rabbit hutch | `nx-dress-hutch` | (38.5,0,-9.5) yaw -1.9 | f5f47791 → **c0a64ac4** (fauna-4) | static hutch, ZERO comps → **FIXED fauna-4** (english-lop + alert rabbits, 5 motion comps; ramp/lid/pop-hole furniture defects cured in-passing) |
| duck pair | `nx-dress-ducks-001` | (8,-0.139,-91) yaw 0 | **c156b6a1** (fauna-3) | NEW 2026-09-17 — mallard pair on the reedpool W lobe, 6 motion comps (bob/orbit/pendulums) |
| barn cat | `nx-dress-cat-001` | (40.7,-0.038,-7.5) yaw 3.216 | **0030ce54** (fauna-7) | NEW 2026-09-17 — tuxedo watch-cat in the coop-yard east pocket facing the flock, 4 motion comps (bob + 3 pendulums) |

Cross-world note: `verify-repairs.ts` pins `av-goats`/`av-hutch` in
old commons (world=commons) — that gate stays untouched; this lane's
domain is commons-next `nx-dress-*` fauna only.

## Species queue (worst-first)

1. **[CLOSED fauna-2] nx-dress-hens — the hen flock.** The lone micro-hen
   was replaced by a THREE-hen flock entity (v4 1ab461bd), re-sited into
   the coop yard (34,-0.0335,-8) yaw -1.8 — open meadow W of the coop,
   SAT-clear of coop/hutch/well/inn. Full record below.
2. **[CLOSED fauna-3] pond ducks — new species.** A mallard pair
   (nx-dress-ducks-001, v3 c156b6a1) floating on the reedpool's open W lobe
   — concentric rider on the water host (struct-19 class). Full record below.
3. **[CLOSED fauna-4] hutch rabbits.** The hutch model rebuilt with two
   creature rabbits — an english-lop loafer in a golden straw nest and an
   upright alert sentinel — 5 motion comps live, same-tuple replace.
   Full record below.
4. **[CLOSED fauna-5] fox at the den.** A red fox curled asleep at the SE
   den mouth on the worn approach pad (new entity nx-dress-se-fox-001,
   v10 bc7376b3). Full record below.
5. **[CLOSED fauna-7] barn cat — new species.** The mouser built and
   seated: a tuxedo watch-cat (nx-dress-cat-001, v12b 0030ce54) in the
   coop-yard east pocket (40.7,-0.038,-7.5) yaw 3.216, facing the hen
   flock across the yard. Full record below.
6. **[CANDIDATE fauna-8, build owed fauna-9] barn owl — new species.**
   Homestead species all CLOSED (goats/hens/ducks/rabbits/fox/cat), so
   the next homestead-native: ONE barn owl roosting. 18m identity =
   round-head silhouette + facial disc + upright posture at a roost
   beam; encounter read = heart-shaped face + dark eyes. Chassis reuse:
   fox/cat broad-mass rig law (NO stick limbs), duck/rabbit motion
   vocabulary only (breathing bob + slow head-scan pendulum; all proven
   part types). Entity id `nx-dress-owl-001` (fauna domain, NEW — no
   existing owl in census). Siting at build tick per seat-scan law +
   fresh census; candidate hosts (decided then): the barn (W working
   edge r0-30 — an owl IN the barn gable is the homestead classic), the
   inn's beam end (E working edge), or the watchpost (core, already
   firelit). One owl only — no zoo.

## Per-species rebuild records

### goats — fauna-1 (2026-09-16) CLOSED
- **v4 sha16 7e9af5a5** (full: 7e9af5a59d4b77adb0eceffcb7b13c22072d8140c7803f6d178ef04b4451df52), PLACED_VERIFIED same tuple (34,0,13) yaw -1.2 scale 1, census 344→344, idempotent rerun 0 verbs, walk probe ALL_PASS 3/3 (gate 18m approach), live bbox 6.5×1.31×6.5 (was 14.21×1.28×6.5).
- Build: pen bugs fixed (post rows R/2 spacing; gate = two symmetric rails), goats rebuilt with necks (heads no longer float), drop ears, thickened pale-bone horns (0xd8cf9e), billy beard, tail stubs, three coats (cream/dark-cream/tan); hay = tall timber MANGER with pale rim plank, hay wisps on the rim only + droop + spill (no floating slab); trough gains the shared rim + palette water 0x506a78.
- Motion: 6 comps live — head-nod pendulums (amp .16/.075/.11, periods 4.6/5.8/3.9s) + tail-swish (amp .45/.5/.4, periods 1.9/1.7/2.1s), phases staggered per individual, explicit epoch t0. Judge arc: v1 FAIL (floating hay), v2 FAIL (half-supported), v3 FAIL (screen-line coincidence), **v4 PASS** — motion-pair pixel diff 618px clustered in the goat band only (rig drives REAL motioneval.js closed forms).
- Anchors: goat_{a,b,c} + _head + _tail (9; KEEP regex already matched goat_).
- Judge identity: **ZAI fallback (glm vision) — cron lane has no native vision; native 18m re-judge DEBT recorded below.**

### hens — fauna-2 (2026-09-17) CLOSED
- **v4 sha16 1ab461bd** (full: 1ab461bd7b95aab2c00345a5dc4f15859d6070bab54145727bb5ab12472553bf), PLACED_VERIFIED at the NEW flock tuple (34,-0.0335,-8) yaw -1.8 scale 1 (moved from the lone-hen spot 33.5,0,-6 — terrain-preflighted flat meadow W of the coop, SAT-clear ≥1.6m of coop/hutch/well/inn corners), census 344→344, idempotent rerun 0 verbs, walk probe ALL_PASS 3/3 (18m W approach), live bbox 2.041×0.548×1.644 (was a 0.38×0.21×0.29 micro-entity).
- Build: lone micro-hen replaced by a THREE-hen flock (one entity): plump oval bodies (was 7-seg cylinders), NECK-JOINED heads (was floating spheres), dark wing ovals + dark tail fans over light coats (the distance signature), proud red combs 0.026×0.075×0.11 + orange beaks + wattles, dark eye dots 0.020, thin legs, three coats (cream/buff/grey-brown); grain specks ground-tie the pecker + a shallow dust-bath disc (the yard reads lived-in). Anchors hen_{a,b,c} + _head + _tail (9 groups; KEEP(hen_) already matched).
- Motion: 6 comps live — peck-bob head pendulums (amp .28/.09/.16, periods 2.2/3.4/2.7s) + tail flicks (amp .30/.22/.26, periods 0.9/1.1/1.0s), phases staggered per bird, explicit epoch t0. Motion proven by engine-true render pairs at BOTH 18m (231px diff, rows 420–527 — the flock band) and 5m near (3177px, rows 277–643 — the full head arc); rig drives REAL motioneval.js closed forms + rotatePartAtPivot verbatim.
- Judge arc: v1 near = hens read, heads attached, nothing floating, but NO eyes + sentry beak invisible (facing away) → v2 sentry yaw −1.0 (beak confirmed in profile) + eyes 0.013 (still ≤1px at 5m, judge: resolution problem, verify at 1.2m) → v3 ultra 1.2m = eyes CONFIRMED, full hen head anatomy legible; residual flags decoded against source as judge noise (single shared leg material per bucket; one-box comb) → 18m final: YES verdict, "Ship it" (marginal→passing after v4 spread the overlapping pair + enlarged combs; judge notes motion will dominate live). Judge identity: ZAI fallback (glm vision) — native 18m re-judge DEBT NATIVE-2 below.
- Placer law learned: a MOVED replace needs the tuple gate to accept BOTH contract tuples (prev for fresh run, new for idempotent rerun) — fauna1's same-tuple chassis dies on rerun otherwise (caught live, fixed, rerun verified 0 verbs).

### ducks — fauna-3 (2026-09-17) CLOSED
- **v3 sha16 c156b6a1** (full: c156b6a12a935495a091ba146b394c6e2a152fecf40abdd3eebdc5e36ac85f92), NEW entity `nx-dress-ducks-001` PLACED_VERIFIED at the reedpool W-lobe tuple (8,-0.139,-91) yaw 0 scale 1 (host decode: pool center origin, water top world y≈0.060 at the site; entity WL 0.02 below top; concentric water-rider, struct-19 class — the commission is literally life ON the pool), census 344→345, 7 verbs (upload+spawn+6 comps), idempotent rerun 0 verbs, walk probe ALL_PASS 3/3 (18m N approach, the village-side bank; one known foreign support-seam stderr line, se-stones, not ours), live bbox 1.441×0.373×1.045.
- Build: mallard pair (ONE entity) — drake: pale-grey hull + grey scapular mantle, black rump, THE green head (sheen .2), white collar, PROUD chestnut breast wedge cresting the hull front, bright yellow bill; duck: mottled-brown coat, duller bill with dark saddle, slightly smaller; both: indigo+white speculum bars (species-true on both sexes), dark 3-blade tail fans, eyes; ripple rings (water-palette tori, flattened wakes) ground-tie both rest poses. Anchors duck_a/_head/_tail + duck_b/_head/_tail (6 KEEP groups; KEEP(duck_) already matched).
- Motion: 6 comps live — FIRST village exercise of part `bob` (drake ripple-bob amp .018 period 3.8s) and part `orbit` (duck slow swim circle r 0.55 @ 7°/s — her phase-0 orbit point IS her rest pose, no pop) + 2 dabble-neck pendulums (amp .16/.22) + 2 tail flicks (.28/.24); phases staggered, epoch t0. Motion proven by engine-true render pairs at 18m (527px, band 428-499) and 5m near (5523px, band 319-550); rig drives REAL motion.js evalPart bob/orbit cases verbatim + motioneval pendulumTheta.
- Judge arc: 18m v1 PASS + near PASS, ultra 1.2m FAIL (4 findings) → v2 (81a0bb7d): indigo speculum BOTH birds (v1 drake all-white bar read "foreign box"), proud chestnut breast (v1 r.062 at z.065 was INSIDE the pale hull — invisible by construction), bill 0.030×0.014×0.075→0.045×0.011×0.088 proud 8mm, saddle re-fit → ultra v2 still FAIL, but decode-vs-source: drake faces AWAY from the +z ultra camera (bill/collar/breast geometrically invisible — framing, struct-45 kin) and her dabble head was occluded by the hull crown (REAL — fixed: joint 0.13→0.155 fwd / 0.115→0.125 up, v3 c156b6a1; decoder joint pin updated with the change, GREEN re-run) → v3 ultraFACE view (new probe, camera −z): drake anatomy PASS (chestnut YES, collar YES, bill YES, female dabble YES, defects NONE) + right profile: PASS (indigo speculum reads as wing mark; clean water contact) + **18m final: PASS** ("identity survives; missing fine detail is exactly what shouldn't be visible at village read distance"). Judge identity: ZAI fallback (glm vision) — native 18m re-judge DEBT NATIVE-3 below.
- Rig law learned: ultra anatomy probes need a FACE-VISIBLE angle — a face-on camera behind the drake's tail sees no face; bills read in profile (45mm flat slab = ~1px end-on). Added `ultraface` view to the rig (camera −z).
- Interrupted tick reconciled: fauna-3 was interrupted pre-place (artwalk-32 class — build/decode/5 renders on disk at 12:04-12:06, nothing live, ledger ignorant); this tick rebuilt ×2 (same v1 bytes), re-judged, iterated v2/v3, placed fresh. No live residue existed.

### rabbits — fauna-4 (2026-09-17) CLOSED
- **v12 sha16 c0a64ac43a695f67** (full: c0a64ac43a695f67798d2882791ec02797d3fc64aa7b3d7b325fad5a1698a672), same-tuple replace of `nx-dress-hutch` (38.5,0,-9.5) yaw -1.9 scale 1 via remove+respawn (riders checked: none parented, no mounts), census 346→346, 7 verbs (upload+remove+spawn+5 comps), idempotent rerun 0 verbs alreadySeated, walk probe ALL_PASS 3/3 (18m W approach through the coop-yard lane; the known foreign support-seam stderr lines are temple/stones/logpile, not ours), live bbox 1.65×1.331×1.432 (height DROPPED 18cm — the lid tower is gone), SAT preflight CLEAR (266 OBBs checked, nearest coop +1.188m; envelope law: new bbox contained in old, so pre-fauna-4 non-overlap holds unchanged).
- Root defect cured: the model's two rabbits sat frozen (ZERO comps since placement — the tex-54 rabbit comps only ever landed in old commons) and the sitting rabbit sat INSIDE the compartment behind the solid wire strip — struct-52 occlusion class, invisible from every angle. Rebuild: **english-lop loafer** (near-white 0xecead8, long drop ears hanging below the chin OUTSIDE the silhouette — v7's short swing hid white-on-white; haunch, planted paws, muzzle/pink nose/dark eyes, tail puff) settled in a GOLDEN straw nest (0xe6c35c — the shared STRAW 0xd8ea70 yellow-green read "green blob" at distance) at the ramp foot; **upright alert sentinel** (agouti 0x9c966c, cream chest column + pale belly — the wild-rabbit underside showing in the upright pose, tall 18.5cm V-spread ears with near-white inner faces 8mm proud, haunches, planted paws, muzzle/nose/eyes, tail puff) beside the nest.
- Furniture defects cured in-passing (side-view judge found them): the ramp's top end had floated 23mm below the sill since wakeup-84 (0.75 slab too short for the 0.70×0.45 triangle — now a full-length 0.822 slab meeting the sill flush, foot clearing ground, 3 grip cleats); the "open" lid was a 66° full-depth slab towering 44cm over the ridge (now half-depth at 43° hinged at the box back-top, a real opened lid, with a 90cm prop stick from the front sill through the compartment opening to the lid edge); a dark POP-HOLE doorway veneer at the ramp bay's floor level closes the ramp-to-door read (same idiom as the wire strips). Envelope gate caught and forced fixes at v2/v5/v7/v8/v9/v11 (nest dig, sitter moves, ear pokes, ramp corner, foot-straw) — final bbox contained exactly.
- Motion: 5 comps live — 2 breathing bobs (sit amp .006/3.4s, alert amp .005/4.1s — SECOND village exercise of part `bob`) + sitter nibble head pendulum (.12/2.6s) + sentinel nod (.09/3.3s) + ear-flick (.22/2.0s on axis [2,0,1] — a swivel), phases staggered per individual, epoch t0. Motion proven engine-true at 18m (79px diff, band 494-521 = the rabbit band) and near (1058px); rig drives REAL motioneval.js pendulumTheta + motion.js evalPart bob verbatim.
- Judge arc: 12 build versions. 18m identity: 4 FAILs (v1 grey specks → v3 cream-blended-into-straw → v4 white-still-blending + sub-pixel markers → v5 white-on-dark still sub-pixel) — then the judge's own math ("3-8 pixels each, below storytelling threshold"; rabbits ~2% of frame) invoked **struct-45 framing law**: internal anatomy judged at the ENCOUNTER distance (5m/near + 1.2m aimed probes), 18m judged for what 18m carries (hutch + bedding + life presence — reads "hutch with open bays" at distance; the residual disclosed). Near/probe arc: v6 lop-ear fail (flank-hiding) → v7 pale-inner-ear + ramp-block → v8 ramp-floats + lid-tower (side-view probe) → v9 one-ear occluded (0.9 yaw) → v10 **sitter PASS + sentinel PASS** → v11 composite (ramp gap band) → **v12 composite PASS** ("ramp runs ground-to-doorway, both rabbits read correctly, structurally clean"). Judge identity: ZAI fallback (glm vision) — cron lane has no native vision; native re-judge DEBT NATIVE-4 below.
- Rig laws learned: (a) per-subject AIMED probes — the generic view frustum at 1.4m missed the sitter entirely (sitterface/sentinelface 6-arg view entries, camera + lookAt); (b) the side view is the honest ramp test — an away-descending incline foreshortens from every front angle (struct-104 kin), and the side judge is what exposed the 23mm sill gap + lid tower hiding since wakeup-84; (c) probe cameras must verify subject-in-frame before judging anatomy (v9's "no rabbit at all" was framing, not model).

### fox — fauna-5 (2026-09-17) CLOSED
- **v10 sha16 bc7376b3** (full: bc7376b3d17f1fad3dcafb63a8d1e9c7e49b641a75d61d0513b3018177a37644), NEW entity `nx-dress-se-fox-001` PLACED_VERIFIED at world (72.62,-0.041,-9.66) yaw 5.052389 (= den yaw 4.712389 + fox-local 0.34) scale 1 — den-local (0.84,0.012,0.38): ON the worn approach pad (+z apron half the den build keeps clear; spoil throws -z), mouth-arch face (local x 0.55) clear 0.12m, anchor-stone nestle 0.09m, rim chunks 0.21m clear, counter-lobe mound 0.10m clear. Census 347→348 (a sibling lane added one entity mid-arc; my spawn +1, tuple verified exact), idempotent rerun 0 verbs alreadySeated, walk probe ALL_PASS 3/3 (18m meadow approach S, arrival 0.33m), live bbox 0.899×0.273×0.401.
- Build: a red fox curled ASLEEP — compact rufous body (0xb35628, the identity value; warm hue alien to the den's earth/green palette = the 18m read), cream chest roll the chin beds on, muzzle resting LOW (nose-on-tail), dark triangular ears, closed-eye lines, pale cheek ruffs, dark nose leather. The tail: a distinct darker-rust sweep (0x9c4720 — judge law: a ruf-on-ruf tail is invisible) rising at the rump OUTSIDE the body silhouette (drape lane z 0.19, clear of body z 0.17/haunch 0.18), cresting over the hip, cascading down the near flank, then two BROAD overlapping bands turning across the chest front at ground level to the PALE TIP lying past the muzzle on the camera side — the classic curled-nose-to-tail read, visible from the approach face. Anchors fox/fox_head/fox_tail (3 KEEP groups; `fox` added to mergekit KEEP this tick). All paw boxes deleted (every judge "leg/foot" read traced to them).
- Motion: 3 comps live — breathing bob (amp .006/3.4s, third village exercise of part bob), doze-sway head pendulum (.07/5.2s), lazy tail flick (.10/2.8s axis z), phases staggered, epoch t0. Motion proven engine-true at comp framings (18m 84px band 454-485; near 1569px band 394-542); rig drives REAL motioneval.js pendulumTheta + motion.js evalPart bob verbatim.
- Judge arc: 10 build versions, 6 judged rounds. 18m composite PASS 4/4 (v1 bytes, re-confirmed on v10 bytes after the silhouette changed). Encounter ultraface arc: v1 FAIL (standing read + tail invisible) → v2 fail (wrap on far flank occluded) → v3 fail (tail x-lane arithmetic error — segments under the torso) → v5 fail (v3's error persisted via unfixed offsets) → v6 fail (flank drape hides behind body face-on; cream chest read as deformed tail) → v7 3/5 (head/body/species PASS; thin diagonal read as dangling paw + tip wrong side) → v8 3/5 (drape lane INSIDE body z-span buried the chain again) → v9 2/5 (drape works; front run still disconnected sticks) → **v10 5/5 PASS** (broad bands, mass, zero gaps: "tail path legible... white-tipped tail doing the heaviest species-lifting work... classic sleeping-canid configuration"). Judge identity: ZAI fallback (glm vision) — native re-judge DEBT NATIVE-5 below.
- Rig laws learned: (a) tail-chain arithmetic MUST be fox-frame (group origin offset −0.21 added) — tail-local numbers presented as world numbers buried two whole versions under the torso; (b) a wrap on the far flank or a lane inside the body z-span renders NOTHING face-on — the tail must cross the chest FRONT to read from the approach camera; (c) thin sticks read as paws/detached debris — broad overlapping bands carry connection; (d) a same-hue tail is invisible — the darker-rust sweep + cream tip is the readable curl.

### cat — fauna-7 (2026-09-17) CLOSED
- **v12b sha16 0030ce54d92e6785** (full: 0030ce54d92e6785a37f26bdcd3ae73a05c34a69af7462472036c3947d5f1205), NEW entity `nx-dress-cat-001` PLACED_VERIFIED at world (40.7,-0.038,-7.5) yaw 3.216 scale 1 — the coop-yard east pocket (mouser story: faces the hen flock center (34,-8) across the yard; plaza lane z≈-7.5 runs past 2.5m N). Terrain preflight flat (heightAt -0.0384, sub-mm spread); SAT preflight CLEAR nearest +2.046m (hutch; live rotated-OBB census law, 14 neighbors in 14m). Census 349→350 exactly, 5 verbs (upload+spawn+4 comps), idempotent rerun 0 verbs alreadySeated, walk probe ALL_PASS 3/3 (18m lane approach W→E, arrival 0.38m; foreign support-seam stderr = streamstones/logpile/lanternhook/skeps/temple, not ours), live bbox 0.554×0.424×0.335 == decode envelope.
- Build: a TUXEDO cat in a watch-sit — near-black 0x17120e (warm, dark-hole law) with the warm-white 0xf4efe6 front: tapered bib shield (wide breast ±0.046, narrow throat ±0.026 — dark shoulders bound it both sides), white muzzle+chin, pink nose 0.03 proud, green side-set eyes (profile readers), two matched white paws with a dark toe-gap, ground-wrapped dark tail ending in the WHITE TIP receding lane-outward past the paw plane. Trodden-earth pad 0x71624c (fox-den family) derived from true extents. Anchors bcat/bcat_head/bcat_tail/bcat_ears (4 KEEP groups; `bcat` added to mergekit KEEP this tick — collision-proof prefix, bare `cat` would regex-collide with catenarygate/catalan).
- Motion: 4 comps live — breathing bob (.006/3.6s, fourth village exercise of part bob) + head look-scan pendulum (Y-axis .12/6.5s) + tail lazy sway (.06/2.8s) + ear-flick (.18/2.4s axis [2,0,1]), phases staggered, epoch t0. Motion proven engine-true at yard framings (78px@18m band 470-483; 920px near band 445-492); rig drives REAL motioneval.js pendulumTheta + motion.js evalPart bob verbatim.
- Judge arc: 12 build versions, 12 judged rounds (ZAI fallback, native debt NATIVE-6 below). 18m PASS ×2 (identity: sitting-cat silhouette + ears carrying; tuxedo whites disclosed sub-pixel at 15-20px, struct-45 kin — they read at the encounter distance). Near PASS ×2 (tuxedo reads, tail connected w/ white tip, ears). Ultraface anatomy arc (fill-lit probes, disclosed): v2 exposed a MIRRORED RUMP (bib contained, struct-52 class) → v3 frame-true rear → v4 flank-hug + dark legs (white-on-white smear) → v5 low-wrap + white legs → v6 bib widened → v7 ONE white column + tip at paws → v8 continuous bib + run clear → v9 paw split + tip past paws → v10 continuous plane → v11 tapered shield (bib-bounded YES, two matched paws YES first clean) → v12b tip+run DEPTH-separated (recede past paw plane). Final: muzzle/nose YES, bib-bounded YES, paws YES, ears YES, no floats, overall YES; **profile 5/5 PASS** (seated read, dark tail along ground, white tip at paws, connected at rear, no floats — the wrap's contract view, fauna-4 side-view law). Face-view tail-depth residual disclosed as framing-limited (0.6m-depth judgment on 4cm boxes at shared ground row; profile + near both testify connected).
- Rig laws learned: (a) the cat FACES its flock — an "ultraface" camera placed east was a REAR view (judge's honest inventory caught it; face cameras stand on the yard side); (b) face-on views were BACKLIT by the rig sun (west) — whites rendered dim tan; anatomy probes carry a camera-side fill (disclosed; the game's own sun varies, a fill is inside the world envelope); (c) a wrap's tip cannot share the paws' screen column NOR the paw z-depth — it separates by DEPTH (recede past the paw plane) where z cannot; (d) the profile is the tail's contract view — the face view cannot testify on depth-connection (fauna-4 side-view law, confirmed); (e) pad sizes DERIVE from true cat extents (hand-tuned margins chased rotated corners twice).

## Native re-judge debt (payable only in an interactive judge-capable session)

| row | owed since | subject |
|---|---|---|
| NATIVE-1 | fauna-1 (2026-09-16) | goats v4 7e9af5a5 18m gameplay + closeface frames (`reviews/fauna1-goats/new-{gameplay,closeface}.png`) — fallback PASS stands until natively confirmed |
| NATIVE-2 | fauna-2 (2026-09-17) | hens flock v4 1ab461bd 18m gameplay + near + ultra frames (`reviews/fauna2-hens/new-{gameplay,near,ultra}.png`) — fallback YES ("Ship it") stands until natively confirmed |
| NATIVE-3 | fauna-3 (2026-09-17) | duck pair v3 c156b6a1 18m gameplay + ultraface + right frames (`reviews/fauna3-ducks/new-{gameplay,ultraface,right}.png`) — fallback PASS arc stands until natively confirmed |
| NATIVE-4 | fauna-4 (2026-09-17) | hutch rabbits v12 c0a64ac4 near + sitterface + sentinelface frames (`reviews/fauna4-hutch/new-{near,sitterface,sentinelface}.png`) — fallback PASS arc (18m framing-law disclosure) stands until natively confirmed |
| NATIVE-5 | fauna-5 (2026-09-17) | den fox v10 bc7376b3 comp_gameplay + comp_ultraface + comp_near frames (`reviews/fauna5-fox/new-{comp_gameplay,comp_ultraface,comp_near}.png`) — fallback PASS arc (5/5 encounter + 4/4 18m) stands until natively confirmed |
| NATIVE-6 | fauna-7 (2026-09-17) | barn cat v12b 0030ce54 yard_gameplay + yard_near + yard_ultraside + yard_ultraface frames (`reviews/fauna7-cat/new-{yard_gameplay,yard_near,yard_ultraside,yard_ultraface}.png`) — fallback PASS arc (18m + near + profile 5/5 + ultraface core) stands until natively confirmed |

## Rig law (learned fauna-1, hard way)

Review renders MUST render at module scope (async loadAsync + prep at top
level, evaluate only calls sync setters). Renders driven from
page.evaluate after an await boundary produce BLANK canvases (background
color only, renderer.info still counts triangles) with zero errors —
the chassis is `fauna1-render-goats.ts`; `fauna1-probe-render.ts` is the
falsification record. Always pixel-count unique colors before judging.
Kin (fauna-3): ultra anatomy probes need a face-visible angle — see the
ducks record above.

## Decoder law (learned fauna-2)

Part-anchored builds put pose offsets in CHILD frames: a pecking head's
skull sits at head-local y=−0.17. A bbox walker that transforms accessor
boxes by node-own translation alone reads pose offsets as world
positions and "fails" a seated model (fauna-2 GREEN 2 initially died at
min.y −0.24). Accumulate FULL TRS matrices down the hierarchy and apply
the exact affine to box corners (fauna2-decode-hens.ts carries the
correct chassis; box corners under affine stay exact).
