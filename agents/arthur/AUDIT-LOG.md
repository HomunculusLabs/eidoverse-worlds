# Village Audit Log

Find-only quality gate. One rotating depth per wakeup (1 true-SAT sweep /
2 door-lane walk-tests / 3 content-hash drift / 4 comp census / 5 keeper
sanity). Defects appended to REPAIR-REGISTER.md for the refinement loop.
verify-repairs.ts runs first each wakeup — a failure is itself a finding.

## 2026-08-17 00:5x — wakeup 1 (depth 1: true-SAT sweep, baseline)

- verify-repairs.ts: ALL PASS (13/13) — every past repair's live pose +
  clearances hold; ledger law exact at 2,367,880; hygiene clean.
- Live-yaw rotated-SAT sweep over 28 footprint entities (191 live total):
  **ALL CLEAR** — zero accidental overlaps; all standing contacts fixed or
  classified designed/rider.
- No commits existed since loop start (baseline run — AUDIT-LOG created;
  refinement/textures loops not yet launched by Bill).
- Register: 0 OPEN items. No new findings.

## 2026-08-17 ~01:2x — wakeups 2-13 consolidated (depth 2 logged; batch cheap-ticks)

- Depth 2 (door-lane walk-tests, run under wakeup 1's rotation): 4/4 PASS —
  av-inn 0.28/0.39m, av-row-cottage 0.36/0.27m, av-garden-cottage
  0.31/0.38m, arthur-house 0.25/0.28m (fresh MCPL body, probe deleted).
- verify-repairs.ts: ALL PASS both before and after the tex-1 work landed.
- Uncommitted tex-1 state observed mid-flight (refine-218 thatch on the
  stable roof, ledger law EXACT at 2,367,882): the textures loop is ACTIVE
  in parallel — its commit is its own to make (no audit-side commits of
  another lane's work).
- Wakeups 3-13: no new commits appeared between checks (texture loop's
  next commit still pending) — cheap ticks, consolidated here.
- Register: 0 OPEN items.
- 2026-08-17 ~01:4x — wakeup 14: cheap tick (no new commits since c672f93; tex-1 still mid-flight).

## 2026-08-17 ~02:0x — wakeup 15 (depth 3: content-hash drift)

- New commits since audit-14: tex-1 thatch rollout live-confirmed
  (aba3d0d + 65febfd) — the audit's first real coverage of texture work.
- verify-repairs.ts: ALL PASS (incl. the tex-1 verify pin).
- Depth 3: sha256[:16] of all 24 village GLBs vs live lib paths —
  **24 MATCH / 0 DRIFT**. The thatched stable is live on the new content
  hash (store/56d0122215bcca65 per tex-1's own confirm); standing world
  == source of truth across the whole set.
- Register: 0 OPEN items. No findings.

## 2026-08-17 ~02:1x — wakeup 16 (depth 4: comp census)

- verify-repairs.ts: ALL PASS.
- Census: 37 entities carry comps — all smoke/particles, motion anchors
  (carousel horses, hens, sails, bell, well, knot, waystone, mason works),
  sockets, and fireflies present and accounted.
- **Probe-blindness catch, not a defect:** my EXPECT table listed
  av-stable as a smoke carrier — it is NOT one by design. Decoded at
  source: mkv3-stable.ts (open-front livery) has no chimney/hearth/lamp
  anchor, and place-smoke.ts's chimney list correctly excludes it. So
  comp=[] on the tex-1 re-placed stable is the design, not a comp-wipe
  loss. No register entry per the loop law.
- Interior lights census (separate light entities, not comps):
  6/6 PRESENT (tw/gc/rc/bk/hl/ct).
- Register: 0 OPEN items.

## 2026-08-17 ~02:2x — wakeup 17 (depth 5: keeper daemon + route sanity)

- New since audit-16: refine-218 (honest-top run+fence — the support-abstain
  residuals FIXED, lie 0.106→0.000 / 0.105→0.025; register close-out).
  verify-repairs.ts: ALL PASS (now accepts refine- prefixed HEADs too).
- Keeper daemon: launchctl shows dev.arthur.eidoverse-resident PID 43556
  running (exit-code slot −15 = previously SIGTERMed instance, current one
  alive). resident.log writing as of 1 min ago — 746 circuit entries, laps
  completing ("lap complete — resting at home"), goat-pen-night stop
  reached: true. Route sanity: GOOD.
- resident.err holds 3 OOM RangeErrors — timestamps decode to the OLD
  daemon (19:37, pre-restart; err file not written since). Not a live
  fault; watching for recurrence next depth-5 rotation.
- Register: 0 OPEN items. No findings.
- 2026-08-17 ~02:3x — wakeup 18: cheap tick (no new commits since audit-17; depth-1 re-sweep ALL CLEAR over 28 entities for good measure).
- 2026-08-17 ~02:4x — wakeup 19: cheap tick (no new commits since audit-18).
- 2026-08-17 ~02:5x — wakeup 20: cheap tick (no new commits since audit-19).

## 2026-08-17 ~02:5x — wakeup 20 (cheap tick + verify FAIL decode)

- verify-repairs.ts: 1 FAILURE — "[tex-1] av-stable stands on the thatch
  build (56d0122215bcca65)".
- Decoded at source (not a village defect): av-stable live lib is
  store/aaf04bc81719be50.glb, and the LOCAL village_stable3.glb hashes to
  exactly aaf04bc81719be50 — **live == current source**. The world is
  consistent; the verify PIN is stale: TEXTURE-PLAN shows tex-2 (TIMBER via
  housekit wallSpan, which the stable consumes) as the next unchecked item —
  an in-flight texture-loop run rebuilt + re-placed the stable after tex-1,
  and the pin refresh belongs to that run's close-out (tex-1 did the same).
- No register entry: the standing world is correct; the pin is the texture
  lane's to update on commit. ESCALATION RULE for next wakeup: if verify
  still FAILs on this pin AND the texture lane has gone quiet (no new
  commits), append it to the register as a stale-pin defect.
- 2026-08-17 ~03:0x — wakeup 21: R-109 registered (stale pin per audit-20 escalation rule; texture lane quiet since 00:25, tex-2 uncommitted).

## 2026-08-17 ~03:1x — wakeup 22 (depth 3: hash drift, post-tex-2)

- New since audit-21: tex-2 TIMBER landed (854ae04 timber on all 10 wallSpan
  buildings, live census 22/22, comps re-applied; 34caeeb pins timber libs;
  43abf78 plan closed). R-109 CLOSED — the texture lane resumed, committed,
  and refreshed the pins exactly per the register's fix path.
- verify-repairs.ts: ALL PASS (superseded tex-1 pin now pinned to the
  thatch+timber build).
- Depth 3: 24 MATCH / 0 DRIFT across all village GLBs incl. the rebuilt
  timber batch — world == source everywhere.
- Register: 0 OPEN.
- 2026-08-17 ~03:2x — wakeup 23: cheap tick (no new commits since audit-22; verify ALL PASS).

## 2026-08-17 ~03:4x — wakeup 24 (depth 4: comp census, mid-tex-3)

- New since audit-23: refine-221 (inn door leaf to threshold + ledger race
  repair). tex-3 PLASTER is IN FLIGHT right now: place-tex3-plaster.ts +
  rebuilt garden3 at 00:39-00:40, refine-221 ledger entry uncommitted.
- verify-repairs.ts: ALL PASS. Ledger law EXACT (221 wrote itself once).
- Depth-4 census on the timber-re-placed buildings: av-inn carries
  particles(embers)+particles:smoke — good. 6 buildings show
  particles:smoke only, no hearth "particles" embers — SUSPECT, but
  decoded: the embers placer history shows embers were only ever placed
  on the inn hearth (refine-88 watchpost/embers, tex placers target
  av-inn); the other 6 chimneyed buildings carry SMOKE by design, embers
  were never theirs. motion:sign missing on av-inn: SUSPECT — tex-3's
  placer (00:40) re-places av-inn LAST among its targets; the sign comp
  re-apply is that in-flight run's step, still pending. ESCALATION RULE:
  if av-inn still lacks motion:sign next wakeup AND tex-3 has gone quiet,
  register it (comp-wipe law violation class — loop #98 precedent).
- Interior lights 6/6. Register: 0 OPEN.

## 2026-08-17 ~03:5x — wakeup 25 (escalation: R-110 registered)

- New since audit-24: tex-3 PLASTER closed (1b4e097 + f8615b1; 8 gabled
  buildings, census 20/20, pins refreshed).
- verify-repairs.ts: ALL PASS.
- The audit-24 escalation rule FIRED: av-inn still lacks motion:sign and
  the texture lane is quiet. Deeper decode: NO placer file in the repo
  contains motion:sign — the comp was applied once (pre-audit era) and no
  re-apply path exists. R-110 registered (comp-wipe class, loop #98
  precedent). Register: 1 OPEN.
- 2026-08-17 ~04:0x — wakeup 26: cheap tick (no new commits since audit-25; R-110 OPEN awaiting builder lane).
- 2026-08-17 ~04:1x — wakeup 27: cheap tick (no new commits since audit-26; R-110 still OPEN awaiting builder lane).
- 2026-08-17 ~04:2x — wakeup 28: cheap tick (no new commits since audit-27; R-110 still OPEN — builder loops idle, audit lane holds the fort).
- 2026-08-17 ~04:3x — wakeup 29: cheap tick (no new commits since audit-28; one transient verify blip re-ran clean 3x; R-110 OPEN).

## 2026-08-17 ~04:4x — wakeup 30 (cheap tick + keeper sanity bonus)

- New since audit-29: tex-4 STONE closed (f807fd0 + 8f3969c; ashlar on
  wallSpan plinths, census 22/22, pins refreshed).
- verify-repairs.ts: ALL PASS (clean, no blip).
- R-110 check: av-inn motion:sign STILL missing — tex-4 didn't touch it
  (stone plinths don't re-place the sign placer; the register fix path is
  still pending a builder lane that reads the register).
- Keeper bonus check (cheap while here): daemon PID 43556 alive, laps
  completing. Register: 1 OPEN (R-110).

## 2026-08-17 ~04:5x — wakeup 31 (rotation depth 5: keeper + register status)

- New since audit-30: refine-223 (dead-motion census — hens/waystone revived,
  8 mason dead comps folded; 0 dead targets village-wide). Note: refine-223
  touched MOTION comps broadly but R-110's av-inn motion:sign is still
  missing — the dead-motion census folded comps, it didn't recreate the inn
  sign from the register's fix path.
- verify-repairs.ts: ALL PASS.
- Depth-5 keeper sanity: daemon PID 43556 alive (same PID across 3 checks
  now — stable), circuit laps continuing. No OOM recurrence in resident.err.
- Register: R-110 still OPEN (2 wakeups unaddressed by builder lanes — the
  refinement loop is running but skipping the register; flagging louder in
  this entry so its next run reads it).

## 2026-08-17 ~05:0x — wakeup 32 (R-110 closed — the loud flag worked)

- New since audit-31: refine-224 — R-110 FIXED. Standing
  place-inn-comps.ts now re-applies all 4 inn comps (incl. motion:sign
  pendulum data recreated from the ledger origin); verify pin added; a
  concurrent ledger race self-repaired.
- verify-repairs.ts: ALL PASS (one transient blip on first run, clean on
  re-run — same flaky-fetch pattern as wakeup 29).
- Live confirm: av-inn comps now include motion:sign — RESTORED.
- Register: 0 OPEN. First full find→fix→verify lifecycle for R-110
  complete (registered audit-25, fixed refine-224, confirmed here).
- 2026-08-17 ~05:1x — wakeup 33: cheap tick (no new commits since audit-32; register 0 OPEN, R-110 lifecycle complete).

## 2026-08-17 ~05:2x — wakeup 34 (register consolidation + refine-225 spot-check)

- New since audit-33: 99ba3fb (R-110 consolidation — ledger-reconstructed
  comp + comp-law lesson recorded in plan) and refine-225 (KEEP class
  audit that probe-caught a latent monument motion kill; knot$ anchor
  class-closed, 4/4 re-verified).
- verify-repairs.ts: ALL PASS.
- Spot-check of refine-225's claim: av-monument motion:knot ALIVE live —
  the class-closure holds.
- Register: 0 OPEN.

## 2026-08-17 ~05:3x — wakeup 35 (tex-5 spot-check)

- New since audit-34: refine-226 (goats chew — anchor groups + calm life
  comps, census 17 live / 0 dead) and tex-5 TEXTILES (woven stripe mode on
  the laundry line, census 4/4, plan closed with dye-trade sites noted).
- verify-repairs.ts: ALL PASS.
- Register: 0 OPEN.
- 2026-08-17 ~05:4x — wakeup 36: cheap tick (only refine-227 ledger-race repair since audit-35; law re-verified EXACT inline; verify ALL PASS; 0 OPEN).
- 2026-08-17 ~05:5x — wakeup 37: cheap tick (no new commits since audit-36; verify ALL PASS; 0 OPEN).
- 2026-08-17 ~06:0x — wakeup 38: cheap tick (no new commits since audit-37; verify ALL PASS; 0 OPEN).
- 2026-08-17 ~06:1x — wakeup 39: cheap tick (no new commits since audit-38; verify ALL PASS; 0 OPEN).

## 2026-08-17 ~06:2x — wakeup 40 (refine-228 pond-life spot-check)

- New since audit-39: tex-6 METAL (plan closed with metal law), refine-228
  (the pond lives — duck anchors + water-bob comps:
  swimmer/upender/drake; census 20 live / 0 dead), refine-229 renumber.
- verify-repairs.ts: ALL PASS.
- Register: 0 OPEN.

- Spot-check NOTE (post-commit): my "water-bob" grep found no carriers, but
  decoding refine-228's ledger text shows the comps landed as
  motion:duck_d1/d2/d3 on av-pondlife — live-confirmed present. The
  "water-bob" name in the commit title is prose shorthand, not a comp key.
  Claim holds. No finding.
- 2026-08-17 ~06:3x — wakeup 41: cheap tick (no new commits since audit-40 addendum; verify ALL PASS; 0 OPEN).
- 2026-08-17 ~06:4x — wakeup 42: cheap tick (no new commits since audit-41; verify ALL PASS; 0 OPEN).
- 2026-08-17 ~06:5x — wakeup 43: cheap tick (no new commits since audit-42; verify ALL PASS; 0 OPEN).

## 2026-08-17 ~07:0x — wakeup 44 (refine-230 spot-check)

- New since audit-43: refine-230 (the rabbits breathe — hutch anchor
  groups + gentle life comps; census 22 live / 0 dead).
- verify-repairs.ts: ALL PASS.
- Register: 0 OPEN.

## 2026-08-17 ~07:1x — wakeup 45 (tex-7 milestone)

- New since audit-44: tex-7 SOIL (trodden earth on door paths, 6
  seed-variant tiles, census 5/5) — THE ORIGINAL SEVEN-FAMILY TEXTURE
  QUEUE IS COMPLETE: thatch, timber, plaster, stone, textiles, metal,
  soil. Plan closed with the soil law + follow-ups listed.
- verify-repairs.ts: ALL PASS.
- Register: 0 OPEN. Milestone noted; eye-check of all seven families
  remains Bill's pass.
- 2026-08-17 ~07:2x — wakeup 46: cheap tick (no new commits since audit-45; verify ALL PASS; 0 OPEN).
- 2026-08-17 ~07:3x — wakeup 47: cheap tick (no new commits since audit-46; verify ALL PASS; 0 OPEN).
- 2026-08-17 ~07:4x — wakeup 48: cheap tick (no new commits since audit-47; verify ALL PASS; 0 OPEN).

## 2026-08-17 ~07:5x — wakeup 49 (mid-flight tex rework, no finding)

- verify-repairs.ts first 2 runs: 1 FAIL ([tex-5] laundry on old weave pin
  603df21b) — decoded: texture lane IN FLIGHT (assets mtime 01:35, plan
  01:29); it re-placed av-dyelaundry to a NEW weave build d55427b8
  (+cloth anchors r21, live==local confirmed) and the pin edit was landing
  in the working tree as I ran. With the lane's pin update in place:
  ALL PASS. Not a defect — in-flight rollout (audit-20 pattern). The
  lane's commit will close it; no register entry.
- Register: 0 OPEN.

## 2026-08-17 ~08:0x — wakeup 50 (refine-231 closes the in-flight window)

- New since audit-49: refine-231 (the wind finds the line — laundry
  garment anchors + out-of-phase wind comps; tex-5 pin refreshed). This
  is the commit that closes the in-flight window decoded at audit-49.
- verify-repairs.ts: ALL PASS (tex-5 pin green on new build).
- Spot-check: av-dyelaundry carries the wind comps live.
- Register: 0 OPEN.

- Addendum: my grep for "wind" in comp keys found none — decode: the
  wind IS the motion comps (motion:dl_cloth_0..5 on the garments, named
  for the cloth anchors; "wind comps" in the commit title is prose for
  the out-of-phase swaying these drive). All 6 cloth comps live on
  av-dyelaundry — claim holds. Same prose-vs-key pattern as audit-40's
  "water-bob".

## 2026-08-17 ~08:1x — wakeup 51 (tex-8 noted)

- New since audit-50: tex-8 (dye-trade cloth chain complete — market +
  dyehouse weaves; census 8/8, pin added; live-evolution law recorded).
  The texture lane continues past the original seven into follow-up
  sites, as its plan flagged.
- verify-repairs.ts: ALL PASS (tex-8 pin green).
- Register: 0 OPEN.
- 2026-08-17 ~08:2x — wakeup 52: cheap tick (no new commits since audit-51; verify ALL PASS; 0 OPEN).
- 2026-08-17 ~08:3x — wakeup 53: cheap tick (no new commits since audit-52; verify ALL PASS; 0 OPEN).
