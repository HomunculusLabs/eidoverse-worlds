# VISUAL POLISH PLAN — VILLAGE VISUAL POLISH LOOP

Durable state for the visual polish lane. Read this file FIRST every wakeup
and update it as work lands. The loop's job: make the village LOOK right at
spectate distance — silhouettes, seating, attachment, proportion, materials
reading as materials — not just verify right.

Created 2026-08-17 after audit-101: the mechanical depths were blind to
visual quality and the carousel roof sat unregistered through a dozen
wakeups. This lane is the standing fix for that blindness.

## Per-wakeup protocol (in order)

1. Load skill `eidoverse-world-building` FIRST.
2. Run `bun agents/arthur/verify-repairs.ts` — a FAIL is decoded at source
   before anything else (parallel lanes churn; transient = wait ~30s, re-run).
3. **Register-first**: if REPAIR-REGISTER.md has an OPEN item, fix that
   before any new work. Close it in the register (evidence, numbers) when
   the live world shows the fix.
4. Else pick ONE subject from the worklist below. One subject per wakeup —
   no shotgunning.
5. **Build**: mk script edit → `bun` rebuild → upload (16–21s pace, 429
   retry) → spawn SAME id → re-apply ALL comps via placer FILES (comp wipe
   law). Never inline-shell comps.
6. **Visual gate (mandatory, before claiming done)**:
   a. Spectate frame: write `{"cmd":"walk","x":…,"z":…}` to
      `agents/arthur/control.json` to stand the resident 15–20m from the
      subject, confirm the file is consumed, then capture the LIVE frame.
      `/snap` returns 503 (4 known failures) — fallback is `screencapture`
      of the already-positioned game window (find pid via Brave/eidoverse
      window; NEVER steer Bill's camera). Two frames ~10s apart when motion
      matters.
   b. Read the frame with `mcp__zai_vision__analyze_image`.
   c. **Decode every vision claim at source** (GLB JSON chunk, parent-chain
      world coords) before believing it — vision reads tangential horses as
      "radial" and through-body poles as "disconnected" at low-poly
      distance (audit-101 false reads).
   d. The gate passes only when the frame shows the intended fix. Bill's
      eye-check remains the final authority — report, don't self-declare
      beauty.
7. **Verify**: walk-test if enterable, else vertex probe; then
   verify-repairs.ts ALL PASS. Ad-hoc verified, never "suite green".
8. **Ledger** via `python3 agents/arthur/ledger-append.py` with exact
   `(D+N, E+n)`; **commit** with a `polish-N:` prefix; update this file's
   worklist + closed list in the same commit.
9. Report concisely what was seen, changed, and verified.

## Worklist (one subject per wakeup; prepend new subjects as they surface)

- [ ] **Carousel roof lift** (REGISTER OPEN, audit-101) — SOURCE-SIDE DONE
      (polish-1) + paint widening joined (polish-3): staged build
      `7a2faa19dfde62cb` now carries BOTH fixes — canopy +0.45 (hub 5.15,
      base 4.81/apex 5.99, rider 0.63m/ears 1.66m clear, decode 29/29)
      AND widened paint families (blue 0.31/gold 0.58/bone 0.80 lums,
      gaps ≥0.22, verify-polish3 10/10). Live vision read found the 4
      horses "uniform gray" at 18m AND 10m under fog (register: HORSE
      PAINT VARIATION UNREADABLE) — silhouette itself PASSES. ROLLOUT
      PENDING: live /geom + verbs approval-blocked THREE consecutive ticks
      (polish-1/2/3) — next wakeup with consent runs
      `bun agents/arthur/assets/placecarousel.ts` (captures live bag,
      rebuilds+uploads `38fbbc26dcdfcc1a`, re-applies comps, verifies),
      then visual gate + register close for BOTH items.
- [x] Carousel stair landing transition — DONE source-side (polish-4).
      Decode found the real defect: treads rose 0.44→1.14 (0.70 jump),
      then dropped 0.30 onto the deck, AND penetrated to z 2.33 INSIDE
      the rim ring (r 2.9) — the rotating fascia crossed the fixed stair
      continuously. Rebuilt as a real boarding flight: grounded at z 3.4,
      stops OUTSIDE the swept radius (inner tread edge 2.98 vs band 2.93),
      uniform 0.16 risers (tops 0.60/0.76/0.92), 0.16 step-up onto the
      deck floor 1.08; rim band stays the boarding lip. Gate lesson: my
      first gradient was inverted (fixed after parent-frame decode) —
      ALWAYS compose the stair group's rotation.y=π when decoding z.
      verify-polish4 14/14; joins the staged rollout build.
- [x] Carousel night contrast — DONE source-side (polish-5): 8 warm
      emissive lantern globes (0xffb066 ×1.5) hung between rib ends under
      the static canopy edge (y 4.42, clear of horse heads by 0.8m+),
      brass rods merge into the flat bucket, one shared glow material —
      no KEEP collisions. Node count 193 (177+16, the carousel's own
      all-named convention; it never calls mergeByMaterial). Lesson: the
      8 globes also tripped polish-1's over-broad TEXCOORD assertion —
      tightened to textured-materials-only per the rework plan's
      "unmapped trim stays flat" law. verify-polish5 11/11; night-cycle
      eye-check still Bill's after rollout.
- [ ] Horse silhouette at spectator distance (≥15m): read as carved
      figures, not supports. Compare 4 horses.
      — polish-3 PASS on silhouette (carved read, legs readable, none
      malformed); FAIL spun off to register (paint variation unreadable,
      fix staged). Gate lesson: `walk` positions the BODY, not the camera
      heading — capture frames from positions where the subject sits
      front-of-view regardless of heading.
- [x] av-run / av-pondlife / av-garden-fence mesh quality (Bill's standing
      priority list). — CLOSED by the REFINEMENT lane (register R-2xx
      "support-abstain residuals", refinement wakeups 1-4): av-run lie
      0.106→0.000 (withes orientation bug fixed at source), av-garden-fence
      0.105→0.025 (gate posts leveled), av-pondlife CLOSED-BY-CLASSIFICATION
      (ducks proud of waterline = classifier by design). Not polish-lane
      work; attributed and removed from this list.
- [x] Interiors visible through doorways — CLOSED BY DECODE + TOOLING LIMIT
      (polish-8). Source decode: ALL 8 enterable buildings carry door-lane-
      visible interiors (hearth terminates house/inn door axes; hall tables,
      weaver corner, bunk room, kitchen counter). The live threshold read is
      BLOCKED BY TOOLING, not world state: resident /snap 503s (4 known
      failures), and `walk` cannot gate a frame — the keeper CIRCUIT
      re-asserts control after any walk (resident log: circuit headings
      resumed 30s after my house walk). Browser capture is BILL's camera,
      not the resident's view (polish-8 false frame: striped roof + sheep
      = market/barn area, decoded and discarded). Interior furnishing is
      verified at source + door-lane walkability (audit depth-2, green);
      the furnished THRESHOLD READ joins Bill's eye-check list.
- [ ] Village night lighting balance: interior lights ×6 + hearths; look
      for dead-dark buildings on the ring.
      — polish-6 DUSK BASELINE (plaza-center frame + vision read): 6 warm
      lights visible (2/4/5/7/8/10 o'clock), 6 dark (1/3/6/9/11 + the
      belltower at 12 — landmark by design, carries the material-table
      lamp); distribution balanced, not lopsided. Source census: ALL 8
      enterable buildings carry fire/lamp glow anchors. Dusk wash makes
      dead-dark calls INCONCLUSIVE — night-cycle re-read is the real gate;
      no source change forced (that would be invented work).
      — polish-7 RE-READ ATTEMPT: world cycle now at DAY (light sky, zero
      artificial lights active, balanced). Night frame unavailable this
      tick; gate waits for the world's own cycle to reach night. No work
      invented.
      — polish-11 CLOCK DECODE + RAMP EVIDENCE (subject this wakeup): the
      cycle is now DECODED, not blind. (a) No sky verbs in recent world
      history (resident `history` read — control channel works; note the
      `verbs` filter param does NOT apply, it returns unfiltered) → world
      runs the DEFAULT clock: real wall time, tz≈local (in-game chat
      timestamps == wall EDT; dusk frame at 19:10 wall contradicts an LA-tz
      clock, which would read full afternoon). (b) sky.js:739 sun curve is
      FIXED 6→18 (day = sin((h−6)/12·π)); lamps ramp on the same clock
      after 18:00 (sky.js:805, lightrig governor). (c) Three live frames
      (window 1323, look-only, Bill's camera never steered): 19:10 dusk /
      0 lamps → 19:15 five faint white lamps ramping → 19:18 twilight /
      3–4 lamps — the ramp WORKS; no dead lamp observed in the visible
      wedge. GATE NOW SCHEDULABLE: full-night read (sky dark, lamps full)
      at wall ≥20:00; the dead-dark building census runs then. polish-6's
      dusk 6-warm/6-dark read stays the distribution baseline.
      — polish-12 FULL-NIGHT CENSUS (executed on the world's own cycle,
      19:56–19:59): frame 1 (Bill's fixed camera): 2 warm lamps right-
      clustered, A-frame center-left reads dead-dark — INCONCLUSIVE BY
      DESIGN: lightrig.js runs an 8-slot light pool assigned by camera
      distance (N=8 measured 2026-08-09, lightrig.js:21; distant lights
      are outbid, not broken) and the A-frame's lit faces are interior
      anchors seen only through door/window lanes at glancing angles
      (mkv3-house.ts carries 15 fire/lamp/glow/flame anchors). Frame 2
      (carousel vantage, during a live human moment — Bill in-world, the
      resident seated at av-carousel.horse_0 on his invitation; camera
      never steered): SEVEN distinct warm lights (street lamps 10/2
      o'clock, carousel fire-glow 11–1, market-stall lanterns 3/4, well
      lantern 9, distant glowing window 11), ZERO dead-dark buildings,
      village reads warm and alive. VERDICT: night balance PASS; no
      register item opened; no source change forced. Confirmed night gap
      = carousel roof-edge lanterns absent LIVE — already registered
      (polish-5 staged in 38fbbc26dcdfcc1a, rollout consent-blocked);
      frame 2 independently corroborates the register.
      — polish-13 CONSENT WINDOW (subject this wakeup): history shows Bill
      in-world at the carousel with the resident at ~20:00 (seq 3328-3331,
      both mounted horse_0, Bill dismounted at (-19.55, 0, 24.84)) — the
      summoner stood AT the consent-blocked subject minutes before this
      tick. Both OPEN items remain ready: staged GLB 38fbbc26dcdfcc1a
      hash-verified intact this tick (491,384B), placer contract-safe and
      dry-run-proven. UNBLOCK ATTEMPTED via the resident's own say channel
      (control.json → consumed): one line in the resident's voice offering
      the staged roof lift + paint widening + lanterns. No reply yet at
      commit time. Next tick: check chat log for a reply before anything
      else; consent still Bill's alone.
      — polish-14 VERB STALL WATCHDOG (subject this wakeup): decoded the
      real server's verb path — rate-capped messages are DROPPED SILENTLY
      (server.ts:350-354, no ack, no error; MSG_RATE window). The placer's
      ack-clocked verb loop had NO recovery: a dropped verb mid-rollout =
      stall to the 90s timeout, world left half-dressed (worse: spawn
      landed, comps half-gone — the comp-wipe law's nightmare). With the
      texture lane sharing the same IP's 12/4s verb budget, this was the
      rollout's weakest seam. FIX: watchdog re-sends the in-flight verb
      after 6s without ack, max 3 re-sends, then aborts with a named verb
      for manual look. PROVEN: mock extended with silent-drop simulation
      (first comp verb dropped exactly once, no ack); dry-run re-ran the
      FULL sequence — "verb stall — re-send #1: comp" fired in-log, all
      7 comps + sockets + both lights landed, post-place verify PASS,
      19/19 ALL PASS. Staged rollout is now drop-resilient, not just
      retry-resilient. (LSP caught one slip mid-edit — line 116 stale
      `verb` reference — fixed before any run; nothing broken shipped.)
 — polish-15 NIGHT RENDER GATE (subject this wakeup; offline — no game
      window this tick, Brave closed after Bill's ~20:00 ride):
      render-carousel.py gained a night mode (night= param: dark sky,
      lamp-lit Lambert with 0.06 floor, EMIT set renders emissive
      materials at FULL self-glow — light sources ignore the sun).
      Renders 2 night views of the staged build; vision gate on
      night-threeq: 8 distinct warm lights, evenly distributed, dark
      silhouette readable, none floating/clipped — the polish-5
      night-contrast claim now has RENDER evidence ahead of rollout
      (decode pins globes at y=4.42 under canopy edge; vision's
      "platform" placement prose = usual low-poly perspective artifact).
 Day views byte-unchanged behavior (same render() default path).
      — polish-16 MAPBOARD DISTANCE SKELETON (subject this wakeup; found via
           fresh 20m-night survey frame + vision read — "blackboard, no
           visible writing"): decoded at source before believing (plan law):
           the board DOES carry a rich painted map (hearth glow, bone ring,
	           4 spokes, 8 building chips, 30+ landmark marks, whisper, brass
	           pin) — but the skeleton read approach-range only: hearth r
	           0.09/emissive 0.9, torus tube 0.02, spokes 0.04, ring chips
	           C.DARK (near-black on dark timber — invisible at night
	           distance). Same class as polish-3 horse paint. FIX (minimal,
	           material truth kept — paint stays paint, detail chips stay
	           approach-range): hearth r→0.12 + emissive→1.5, ring bar
	           0.045→0.055, torus tube 0.02→0.03, spokes 0.04→0.05, ring
	           chips C.DARK→umber 0x7a5a42 (still dark against bone ring).
	           Staged build e732ce10400c1979 (24 nodes, 85.9KB), rebuilt ×2
	           byte-deterministic; decode: 192 umber verts in COLOR_0 (8
	           chips × 24), glow1 emissiveFactor [1.5, …]. Live rollout
	           joins the consent-blocked queue (mapboard placer = same
	           pattern as placecarousel; visual gate post-rollout).
      — polish-17 MAPBOARD RENDER GATE (subject this wakeup): built
           render-mapboard.py — the carousel rasterizer (polish-9/15)
	           adapted to VERTEX-COLORED GLBs (reads COLOR_0 normalized
	           bytes, gamma-decoded; the carousel renderer was material-
	           table-driven). Night renders of the staged build: 20m
	           spectate = honest FAIL (2.3m signpost ~64px, hearth ~7px —
	           20m threshold is carousel-scale, not signpost-scale); 10m
	           night approach = PASS: glowing hearth visible, pale ring +
	           4 spokes distinct, 8 building dots readable, verdict "reads
	           as a map of a village". READABILITY HORIZON recorded: the
	           mapboard reads at ≤10m night (approach object; a signpost
	           has no 20m duty). Live gate stays post-rollout (Bill's
	           eye); probe-bug lesson carried: glTF indices accessor
	           count = INDEX count (144 idx = 48 tris), not triangle
	           count.
      — polish-18 MAPBOARD PLACER (subject this wakeup): built
           placemapboard.ts on the contract-safe chassis (placecarousel
	           polish-2/10/14, stall watchdog included) — av-mapboard
	           carries NO comps (bare static signpost, tex-61), so the
	           verb plan is capture → spawn-at-live-pose → verify (lib +
	           pose). Mock made id-generic (spawn/comp accept any entity
	           id; av-mapboard mock entity added at live pose 1.6, 8.5).
	           DRY-RUN 8/8 ALL PASS: the REAL placer ran end-to-end vs
	           the mock — live pose captured, rebuild, forced-429 retry,
	           spawn at captured pose, post-place verify PASS, port
	           released. BOTH staged rollouts (carousel + mapboard) are
	           now execution-proven, one command each when consent lands:
	           bun agents/arthur/assets/placecarousel.ts ;
	           bun agents/arthur/assets/placemapboard.ts
      — polish-19 MAPBOARD LIVE (tex-83 banked the rollout): the texture
           lane's LIVE-EVOLUTION law carried the polish-16 build into the
           world — gate pins av-mapboard → store/e732ce10400c1979.glb
           (my hash) PASSING against the live world, timber tile
           byte-preserved. ROLLOUT VERIFIED LIVE at lib+pose level. LIVE
           NIGHT EYE-READ: attempted 3 surfaces this tick — resident walk
           (circuit re-asserted, polish-8 class), resident /snap (503,
           5th known failure), Bill's camera (he is in-world; mapboard
           out of his view; never steered). Readability horizon ≤10m
           (polish-17 render gate) stands; the night eye-read joins
           BILL'S list with the approach note: read it from ≤10m south
	           (board faces S toward plaza).
      — polish-20 THE MAP CATCHES UP AGAIN (subject this wakeup): decode
           found tex-78's drum tower-house (the village's TALLEST
	           landmark, keeper's tower + upper study, at (-8, 24.7))
	           had NO mark on the painted map — every other post-#100
	           build got one. Added map_tower chip at board-local
	           (-0.26, 0.80) (1:31 scale), timber-dark 0x6a5a4a,
	           0.07²×0.016 — ring-building read (the tower IS a home).
	           Staged build b77ef40aae3a9dae (24 nodes); decode: color
	           census 1478→1502 (+24 = exactly one box), 168 verts at
	           the tower tone (7 chips share it). NOT rolled out: the
	           live mapboard stands at e732ce10 (polish-16/19); this
	           mark joins the NEXT live-evolution pass or consent
	           rollout (placemapboard.ts re-captures pose and rolls
	           the new build — dry-run-proven chassis).
      — polish-21 TOWER-CHIP RENDER GATE (subject this wakeup): render-
           mapboard.py reads the staged b77ef40 build directly (the
	           rasterizer is artifact-driven); 4 views re-rendered, 388
	           tris (was 384 — +4 = the new chip's faces). Vision gate on
	           night-approach6: distinct dark mark in the board's upper
	           region confirmed, ~8-10 marks readable, verdict "reads as
	           a village map" at 6m. Staged evidence complete; live read
	           stays with the tex lane's next live-evolution pass or
	           consent rollout.

## Closed

- (none yet — first tick pending)

## Laws (carried from the skill + audit protocol)

- **Rollout dry-run harness (polish-10)**: `bun agents/arthur/dryrun-carousel.ts`
  stands up a local mock world (mock-carousel-server.ts) and executes the REAL
  placer end-to-end: geom capture (live spin 5°/s + socket y=1.97 preferred),
  rebuild, upload with a FORCED first-attempt 429 (retry proven), ws join +
  verb pacing, full comp re-apply in wipe-then-reapply order, both lights,
  post-verify — 19/19. The staged rollout is now execution-proven; when
  consent arrives, `bun agents/arthur/assets/placecarousel.ts` runs the exact
  tested code path against the real world.

- **Offline render gate (polish-9)**: `python3 agents/arthur/render-carousel.py
  /tmp` renders the staged carousel from 6 fixed views (software rasterizer,
  z-buffer, Lambert shading, per-material colors = decoded texture averages;
  NO WebGL needed — headless Chrome cannot screenshot WebGL on this Mac).
  Phase-2 structure gate: PASS (silhouette/canopy/poles/attachments).
  Signal recorded: legs read weakly articulated in flat shade (offline
  proxy) — live polish-3 read + Bill's eye outrank it; candidate subject.

- Decode at source before editing; the village has always been right when
  the probe was wrong.
- Probes are one-shot: write, run once, delete. Prefer inline `bun -e`.
- Live-yaw rotated SAT only; door lanes 1.4m; uploads 16–21s; verbs 12/4s.
- Never commit another lane's in-flight work; HEAD gate regex accepts
  `repair-\d|tex-\d|audit-|refine-` — polish commits append `polish-` to
  verify-repairs.ts line 80 regex on the FIRST polish commit (or the gate
  FAILs by design; that FAIL is the reminder).
- Only Bill stops the loop (LOOP_COMPLETE requires his explicit stop).
