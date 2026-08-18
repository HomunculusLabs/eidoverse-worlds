# VISUAL POLISH PLAN — VILLAGE VISUAL POLISH LOOP

Durable state for the visual polish lane. Read this file FIRST every wakeup
and update it as work lands. The loop's job: make the village LOOK right at
spectate distance — silhouettes, seating, attachment, proportion, materials
reading as materials — not just verify right.

Created 2026-08-17 after audit-101: the mechanical depths were blind to
visual quality and the carousel roof sat unregistered through a dozen
wakeups. This lane is the standing fix for that blindness.

## LANE STATUS (one glance — updated each polish record; the p70 law)
- **Staged, consent-blocked**: carousel `38fbbc26` (roof+paint+smoke-heal
  via placer), welcome lamp `62746d1a`, mapboard chip `b77ef40a`. Live
  unchanged: `cd22d0b0` / `fa0c9d94` / `e732ce10` (sweep #4, p74).
- **Proven gates**: three-point time-safe (day/dusk/night x3 subjects,
  p29/43/50/51/71/72/75); horizons (lamp ~5m/10m, mapboard ~10m, carousel
  ~30m BEACON, halved in heavy fog p76); rebuild determinism all 3 (p63/64).
- **Standing verifier**: 29 checks — 4 placer behaviorals + 3 decoders +
  3 rebuilds + runbook-sync guard + sentinel (live via POLISH_LIVE=1).
- **Known-blocked**: all live rollouts (Bill's consent or tex-lane banking);
  mock dry-runs (:8793/:8794 consent-blocked, no retry).
- **Next**: post-rollout live re-reads; tex-lane watch; new visual axes as
  they surface. Register: 3 OPEN (R-107 another lane's, lamp, smoke-heal).

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
      (polish-1) + paint widening joined (polish-3): the staged build
      carries BOTH fixes (current hash below) — canopy +0.45 (hub 5.15,
      base 4.81/apex 5.99, rider 0.63m/ears 1.66m clear, decode 29/29)
      AND widened paint families (blue 0.31/gold 0.58/bone 0.80 lums,
      gaps ≥0.22, verify-polish3 10/10). Live vision read found the 4
      horses "uniform gray" at 18m AND 10m under fog (register: HORSE
      PAINT VARIATION UNREADABLE) — silhouette itself PASSES. STAGED
      BUILD (polish-5 refresh, correction p60): `38fbbc26dcdfcc1a`
      (491,384B — the polish-1/3 era hash `7a2faa19dfde62cb` cited here
      before was the OLD pre-refresh build). The placer now also carries
      the KNOWN_BAG smoke heal (p45/46/52), light re-anchor (p55); the
      runbook (p59 refresh) is the authoritative execution path —
      ROLLOUT remains consent-gated (live /geom + verbs approval-blocked
      since the loop began; Bill's in-world words are the unlock).
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
- [x] Horse silhouette at spectator distance (≥15m): read as carved
      figures, not supports. Compare 4 horses.
      — polish-3 PASS on silhouette (carved read, legs readable, none
      malformed); FAIL spun off to register (paint variation unreadable,
      fix staged). Gate lesson: `walk` positions the BODY, not the camera
      heading — capture frames from positions where the subject sits
      front-of-view regardless of heading.
      — polish-36 WORKLIST HONESTY: box closed to match its own record —
      the SILHOUETTE subject passed at polish-3; the spun-off paint item
      lives in the register (staged 38fbbc26, offline gates green through
      polish-22/23 fog). No open work hides under this box.
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
- [x] Village night lighting balance: interior lights ×6 + hearths; look
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
      — polish-36 WORKLIST HONESTY: box closed to match polish-12's own
      terminal verdict ("night balance PASS; no register item opened" —
      7 distinct warm lights, zero dead-dark, on the world's own cycle).
      The only live gap (carousel lanterns) is register-tracked and
      rides the staged rollout; no open work hides under this box.
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
      — polish-22 HORSE PAINT DAY-SPECTATE GATE (subject this wakeup;
           register OPEN item pre-verified offline): render-carousel.py
	           gained a DAY SPECTATE SET (day18/day10 front+threeq —
	           the exact distances the live reads failed at, plain-sky
	           charitable case). Vision gates: 18m front PASS (3 paint
	           families separable, dark-blue clearly distinct from bone,
	           "vary in color not uniform gray"), 18m threeq PASS (all
	           three families named, verdict "vary in color"), 10m
	           front PASS (families separable, verdict "vary in
	           color"). The staged paint widening HOLDS at both
	           complaint distances in the charitable case — fog was the
	           live confound. Item stays OPEN pending live read after
	           consent rollout (fog unmodeled; render PASS is
	           necessary-not-sufficient). 12 views total now.
      — polish-23 FOG GATE (subject this wakeup): the live reads failed
           "under fog" — so the REAL fog was decoded at source and
           modeled: core.js:115 FogExp2(0x101828, 0.018), weather-
           scaled sky.js:798 (0.018 * a.fog). render-carousel.py gained
           a fog= param (three.js FogExp2 math, per-tri factor
           1-exp(-(d*dist)²), fog color 0x101828) + 3 gated views:
           fog18-base (true 0.018), fog18-heavy (0.036 = 2x weather),
           fog10-base. VISION GATE heavy fog: PASS — "vary in color",
           darkest vs palest still separable, cool cast noted. Base-
           fog vision read was a PROBE ARTIFACT (claimed no horses
           visible — on a frame strictly between two passing brackets);
           pixel decode settles it: lum spread 95 clear / 85 base / 61
           heavy — monotonic, physical, base > heavy. The live
           "uniform gray" reads cohere: they read the OLD narrow
           paint; the staged widening is exactly what survives fog.
           Register item remains OPEN for the live read (now with the
           full offline case: clear + fog + heavy fog all PASS).
      — polish-24 WALK GATE + SNAP DECODE (batch of 11 wakeups served
           as one; subjects picked per batch law): (a) /snap 503 ×5
           DECODED at source — routes.ts:40-41 requires a RENDERER
           client (invisible hub-spectator) serving the world; none is
           deployed on commons → deterministic 503, a server
           deployment surface, NOT daemon-fixable. Recorded; the
           first-person channel stays closed until a renderer client
           exists. (b) the walk-vs-circuit race (polish-19's walk was
           eaten mid-leg) FIXED agent-side: control walk now waits out
           the in-flight leg (bounded 25s) then claims the wheel
           (lastControlAt) before walkTo. PROVEN LIVE: walk to the
           mapboard vantage (1.6, 17.5) landed the body at (1.9, 17.5)
           with the circuit actively seated — 0.3m tolerance. The
           keeper now goes where sent. Daemon restart performed
           (launchctl stop/start); bell + rituals intact.
      — polish-25 LIVE NIGHT EYE-READ ATTEMPT (subject this wakeup):
           Bill in-world at (-4,-3.3), full night, camera captured
           look-only. Vision found one plain white board at 2 o'clock,
           5-8m — decode: that is the WELCOME BOARD (S r5 ≈ (0,-5),
           5.0m ESE of Bill; plain by design), NOT the mapboard. The
           mapboard (1.6, 8.5) is 13.1m NNE of Bill — beyond the ≤10m
           readability horizon — and indeed NO map pattern is
           discernible anywhere in the frame: pixel scan of the frame's
           only warm-pale rect (x849-1269 y400-465) shows a smooth lit
           gradient (no emissive dot, 6.5:1 aspect ≠ mapboard's 1.5:1).
           VERDICT: no map read at 13.1m — CONSISTENT with the
           polish-17 horizon law (live corroboration, weak form).
           Definitive live read still wants a vantage ≤10m S of the
           board (or the resident's /snap once a renderer client
           serves commons — polish-24 decode). No code changed this
           tick; the horizon law gained its first live-consistent
           data point.
      — polish-26 LIVE-READ WINDOW PURSUIT (subject this wakeup):
           walk gate re-exercised (command consumed cleanly); my look
           fired AFTER the 3-min wheel window so the body showed home
           (21.8, 15.9) — circuit resumption is per design, mistimed
           verification was my probe error; the gate itself stands on
           polish-24's live proof. Geometry decode ends the pursuit:
           Bill sits ~32m SW of the keeper's home; a keeper at the
           mapboard vantage is ~26m from his camera — no line of
           sight worth staging. The definitive map read stays with
           BILL'S OWN EYE at ≤10m south of the board (1.6, 8.5), or
           a renderer client serving commons for /snap (polish-24
           decode). Lane returns to subject-surfacing; no code
           changed this tick either.
      — polish-27 RECORD CORRECTION (subject this wakeup): polish-25's
           "welcome board … plain by design" was WRONG at source —
           mkv3-welcome59.ts decodes: BONE board 1.0×0.42 + carved
           name bar "THE COMMONS" (0x8a7a5a, 0.72×0.08, top) + FIVE
           timber pointer arms fanning below (N road/E well/SW
           monument/SE market/ESE carousel, loop-91). Corrected
           plainly per plan law. The correction SURFACES a real
           subject: at 5m night vision read the board as a "plain
           solid white rectangle" — either the probe under-read a
           night frame (probe-skepticism law) or the name bar's
           contrast (0x8a7a5a on 0xd8cdb5, no emissive) genuinely
           fails to read at night spectator distance — polish-16
           class. QUEUED as next decode: re-capture at ≤5m and
           pixel-check for the bar stripe + arms before touching the
           source.
      — polish-28 WELCOME BOARD NIGHT GATE (subject this wakeup): the
           queued decode executed — render-mapboard.py made GLB-generic
           (argv[2]; still mapboard-default) + 3 welcome views (5m
           night / 5m day / 3m night, board faces N). VISION GATES:
           5m NIGHT = FAIL — "plain board": name bar barely
           discernible, arms don't read, and this is the CHARITABLE
           case (no fog, ideal angle) → genuine polish-16-class
           defect CONFIRMED, not a live under-read (vindicates the
           polish-27 correction). 5m DAY = PASS — bar + all arms
           read. So the defect is NIGHT-SPECIFIC: no emissive, no
           lamp; the lightrig 8-slot budget leaves the S-rim board
           dark at night. FIX DIRECTION (next build tick): the map
           board's own medicine — a small emissive bar-glow (like
           map_hearth) or a lamp over the board; village-native, one
           material. Live re-capture failed this tick (Bill's camera
           moved off the board; candidates decoded as lamp prop) —
           offline charitable case is the honest gate. Fix rides the
           same staged-rollout law as the mapboard chip.
      — polish-29 WELCOME BOARD NIGHT FIX (subject this wakeup, the
           queued BUILD): mkv3-welcome59.ts gained a NIGHT LAMP —
           timber arm (0.34m) over the board + one warm emissive
           globe (0xffb066 / emissive 0xff9a4a ×1.5, the carousel-
           lantern & map-hearth tone), node wb_lamp (KEEP `lamp`
           law) + wb_lamp_arm. Staged build 62746d1af698eacc (5
           nodes; ×2 byte-deterministic; decode: glow2
           emissiveFactor [1.5, .48, .10] present, 132 tris vs 52
           pre-fix). POST-FIX GATE (rasterizer, 5m night): PASS on
           the claim — lantern clearly visible, verdict "reads as a
           signposted place at night" vs prior "blank pale
           rectangle"; arms stay dark BY DESIGN (landing point, not
           full illumination); pixel corroboration: 116 warm px,
           warmest (255,183,91). NOT rolled out (staged-rollout
           law; live av-welcome still at its tex-15 build — next
           live-evolution pass or consent carries it).
      — polish-30 LIVE BEFORE-ANCHOR (subject this wakeup): the
           welcome board PIXEL-LOCATED live for the first time —
           warm-pale rect x998-1191, y572-609 in Bill's frame (same
           camera position as polish-25's "plain white rectangle at 2
           o'clock, 5m"; bearing/distance match the board at (0,-5)).
           Pixel structure: pale face 167-183 lum, dark lower-edge
           stripe 103-124 (name-bar/rim at oblique angle), flanking
           darker stubs at mid-height (arms) — consistent with the
           polish-28 night-gate FAIL at the live site. This banks the
           BEFORE coordinates for the post-rollout after-comparison
           (same crop, lamp visible = decisive). Vision crop-read on
           this exact region remains inconclusive ×3 (cylinder /
           container / hexagon mis-reads) — recorded as a known
           low-confidence crop; pixel evidence stands. No code
           changed; no rollout (staged law holds).
      — polish-31 WAYFINDING CHAIN GATE (subject this wakeup): the two
           staged signs gated TOGETHER for the first time — the
           rasterizer gained a chain mode (multi-GLB composite at world
           offsets; welcome lamp at (0,-5) + mapboard hearth at (1.6,
           8.5)) and a southern-arrival night view (camera (0.8,-12)
           looking N, welcome ~7m near-frame, mapboard ~20m up-frame).
           VISION GATE: PASS — two distinct warm glows at different
           depths, read as a vertically-aligned leading pair, verdict
           "signed/wayfound at night". PIXEL CORROBORATION: two warm
           clusters — y126-134 tight (106 px, far map-hearth) + y186-192
           wide-thin (26 px, near lamp edge-on); 130 px total. The
           chain claim (near lantern leads the eye to the map's glow)
           holds offline in the charitable case. Live chain read joins
           Bill's list post-rollout (both builds ride the staged law).
           Patch notes: first composite attempt had an incoherent
           frame (first model local, second world) — fixed with the
           explicit first-offset arg; one malformed comprehension line
           was caught by ast.parse and removed before any run (lint
 discipline held).
 — polish-32 CHAIN FOG GATE (subject this wakeup): the wayfinding
 pair gated under the REAL confound — FogExp2 ported into
 the mapboard rasterizer (village truth: 0x101828 / 0.018
 base / 0.036 weather, core.js:115 + sky.js:798, same math
 as polish-23). Honest arc: (1) first heavy-fog frame came
 back 0 warm px — PIXEL DECODE caught my cam_dist=13.6
 double-count (chain view's `center` IS the camera; zs
 already camera-relative) — fixed to cam_dist=0. (2) Vision
 read the buggy frame as "lantern not visible" (consistent
 with the bug, not physics) and the corrected frame as
 "pair reads" — pixel math and vision now cohere.
 CORRECTED RESULTS: base fog (0.018): pair UNCHANGED (132
 warm px, 2 clusters — identical to no-fog). Heavy fog
 (0.036): near lamp 26→12 px (~6% physics loss at 7m), far
 hearth dot intact (emissive 1.5 survives the ~40% blend at
 20m); vision verdict on the corrected frame: pair reads.
 LAW: the wayfinding pair survives both baseline and 2x
 weather fog offline; the near lamp is the fog-proof anchor
 by geometry. Live fog-chain read joins Bill's list
 post-rollout.
 — polish-33 WELCOME PLACER (subject this wakeup): the staged
 rollout package completed — placewelcome.ts built on the
 proven placemapboard chassis (capture law, no-comp decode
 — the polish-29 lamp is geometry-level emissive, node
 wb_lamp; the live av-welcome carries no comps), stall
 watchdog, PLACER_CONFIG override, DEFAULTS fallback (0,-5)
 facing N. Mock server extended with the bare av-welcome
 entity. OFFLINE VERIFIED 7/7: contract at source, helpers
 import + planVerbs pure (spawn at captured pose), fallback
 matches source decode, mock entity present, port 8793
 released, gate green. DRY-RUN BLOCKED by consent gate — the
 mock dry-run command timed out without user response;
 per the block law: no retry, no rephrase. The end-to-end
 dry-run remains the ONE unexecuted step; every other lane
 placer (carousel 19/19, mapboard 8/8) proved this chassis
 incl. 429 recovery + silent-drop survival. Staged build
 62746d1af698eacc unchanged; live world untouched.
 — polish-34 PERSISTENT VERIFIER (subject this wakeup): the lane
 gains its first committed standing verifier —
 verify-polish-staged.ts (tex-lane pattern; NOT a one-shot;
 reproducible via `bun agents/arthur/verify-polish-staged.ts`).
 Covers the whole staged package offline in one command:
 (A) three staged builds byte-exact (carousel 38fbbc26 /
 mapboard b77ef40a / welcome 62746d1a) + mapboard/welcome
 rebuild determinism; (B) GLB decodes (mapboard 24 nodes,
 welcome 5, glow2 emissive [1.5,.48,.10]); (C) all three
 placers present with contract markers + welcome helpers
 pure; (D) standing gate + control idle. FIRST RUN: 17/17
 ALL PASS. The staged package is now one-command verifiable
 — the answer to the flag-cycle (persistent green artifact
 instead of one-shot residue). No network, no mock (the
 consent-blocked dry-run untouched).
 — polish-35 REGISTER-FIRST COMPLETION (subject this wakeup): the
 welcome-board night defect — CONFIRMED by polish-28's
 charitable-case gate, corroborated live by polish-25/30,
 fixed-staged by polish-29 — had never been appended to
 REPAIR-REGISTER.md (the cross-lane surface). Protocol
 breach closed: full entry appended with evidence (entity,
 pose, defect class, gate numbers, staged hash, close
 condition). The register is the durable cross-lane
 record; the plan alone was not enough. No code changed.
      — polish-36 WORKLIST HONESTY (subject this wakeup): two worklist
 boxes closed to match their own terminal records — horse
 silhouette (polish-3 PASS; the paint FAIL lives in the
 register) and night lighting balance (polish-12 VERDICT
 PASS, 7 warm lights / zero dead-dark on the world's own
 cycle). Stale checkboxes were misrepresenting the lane's
 true open surface: what remains genuinely open is now ONLY
 the consent-blocked register items (carousel roof+paint
 rollout, welcome lamp rollout) — one rollout away from
 closing both. No code changed.
      — polish-37 REGISTER LIB CORRECTION (subject this wakeup): the
 roof-lift entry's live-lib evidence line was STALE — it
 cited audit-101-era `937fd0b6…` while the tex lane has
 since re-placed the carousel (their committed verifier
 verify-tex69.ts:106 pins live `cd22d0b09e70bebc`). Decode
 before edit: roof geometry is UNCHANGED between the builds
 (tex lane's own rebuild returns byte-identical 38fbbc26
 disk-side) — so the defect and staged fix both stand; only
 the cited lib was stale. Corrected with attribution + a
 note that the staged rollout remains the close path.
 Same staleness audit applied to the welcome entry: its
 lib citation is generic ("live lib at tex-15 build"),
 already current. No code changed.
 — polish-38 CHRONOLOGY RE-CORRECTION (subject this wakeup):
 my own polish-37 note ("roof geometry unchanged
 between builds") was WRONG — decoded chronology: live
 `cd22d0b0` was rolled at tex-69 BEFORE the polish loop
 existed (21:43 vs daytime), so live carries the OLD LOW
 ROOF; staged `38fbbc26` carries the lift. Register
 re-corrected (defect live, register framing correct,
 staged rollout IS the close path). GOOD NEWS surfaced by
 the same decode: the staged build is already
 texture-family converted (mkcarousel.ts carries texMat
 families) — rolling it regresses NOTHING (my earlier
 worry about a vertex-color regression over live textures
 was unfounded; same conversion state). Also decoded: the
 "@arthur come sit on the carousel" lines in the log tail
 are the W#13-era exchange, not fresh words — no new
 consent signal. No code changed; register honesty
 tightened twice in two ticks.
      — polish-39 ROLLOUT SENTINEL (subject this wakeup): the
 register's close conditions ("rollout happens → live
 re-read closes the item") had no WATCHER — if the tex
 lane banks a staged build (tex-83 precedent), nothing
 flips the register. verify-polish-staged.ts gained an
 env-gated LIVE section: default stays offline (sentinel
 skips — verified), POLISH_LIVE=1 performs the same
 read-only /geom GET the standing gate does every tick and
 maps live libs → register action (cd22d0b0 = defect still
 live/OPEN correct; 38fbbc26 = ROLLED → close items;
 unknown = investigate). Read-only, never places.
 OFFLINE VERIFIED: 17/17 + skip line. The live-path mock
 check was consent-blocked (no retry, block law); its code
 mirrors the standing gate's proven GET pattern. Mock
 killed, port 8794 released, residue cleaned.
      — polish-40 SENTINEL FIRST LIVE RUN (subject this wakeup): the
 polish-39 sentinel's live path verified for real —
 POLISH_LIVE=1 run performed the standing gate's own
 read-only /geom GET and read all three subjects correctly:
 carousel=cd22d0b0 (defect still LIVE → register OPEN
 correct), welcome=fa0c9d94 (lamp not rolled → OPEN
 correct; matches the tex lane's recorded live build),
 mapboard=e732ce10 (live pin stands, chip staged). Full
 verifier incl. sentinel: ALL PASS. Read-only; no verb, no
 place, no comp — the gate's own GET class. The rollout
 watcher now stands proven both modes.
      — polish-41 DEEP-NIGHT RE-READ (subject this wakeup): a second
 time-point for the polish-36-closed night-balance box —
 01:57 full deep night, six hours past polish-12's 19:56
 verdict, look-only from Bill's fixed camera. Pixel census:
 ~7000 warm px, 4 distinct near lights (plaza hearth big
 at 4-5 o'clock, two at 8-9, one at 11). Vision summary
 read "unbalanced / dead-dark buildings" — DECODED before
 declaring: this vantage (plaza south) differs from
 polish-12's frame 2 (carousel), and dead-distant is the
 lightrig 8-slot budget law (polish-12 frame 1: distant
 lights outbid BY DESIGN, not broken). The observed
 distance profile (near bright, far dimmed) is exactly
 what the law predicts. VERDICT: consistent — no register
 item; the closure stands on polish-12 + this
 corroboration-by-law. HONEST CAVEAT: this is not a
 same-vantage repeat; a true apples-to-apples re-read
 would need the carousel vantage (joins Bill's post-
 rollout list).
 — polish-43 LAMP DAY GATE (subject this wakeup): the time
 coverage completed for the staged lamp — night-gated at
 polish-29, never DAY-gated (an always-on emissive could
 read obtrusive in daylight). Offline rasterizer, same 5m
 view: VISION PASS — lantern reads as a natural unlit
 brass/amber fixture on its timber arm, proportionate
 (~1/5 the top-stripe width), palette-consistent, "sits
 quietly"; signboard still reads as a welcome sign by day.
 PIXEL CORROBORATION: 9 warm-family px total, bbox 7x5
 (x318-324, y382-386) — sub-patch-scale accent, not a
 day-sore. LAW: the staged lamp is time-safe (night
 anchor + day quiet); the welcome rollout keeps its
 green. No code changed; staged 62746d1a unchanged.
 — polish-44 ROOF DECODER (subject this wakeup): the sentinel's
 UNKNOWN carousel branch had no teeth — "investigate" if
 the tex lane rolls a NEWER build. Now self-answering from
 bytes: decodeRoof(path|URL) walks the GLB JSON to the
 cr_canopy_hub node and classifies by world Y (LIFTED >=
 5.0 / LOW <= 4.8 / AMBIGUOUS / NO-HUB). The sentinel
 UNKNOWN branch now prints the exact decode command
 (LIFTED = close items; LOW = old roof still live); it
 never auto-downloads — strictly /geom-class. Structural
 work alongside: the verifier body is now guarded by
 import.meta.main (proper module hygiene — decodeRoof
 importable for tests; the run body silent on import).
 VERIFIED: staged 38fbbc26 → LIFTED (hub y=5.15); welcome
 GLB → NO-HUB-NODE (correct negative); standalone run
 still ALL PASS. Honest arc: three patch passes needed
 (export-inside-guard, stray brace, lost decoder brace —
 each caught by ast/exec before any commit).
 — polish-45 SMOKE HEAL (subject wakeups #55-58, live comp
 census): the first LIVE census of our own subject found
 the comp-wipe law's casualty — the tex-69 carousel
 re-place restored 6 comps but DROPPED particles:smoke
 (polish-13's pre-replace capture carried 7; every
 chimney in the village smokes — 9 entities — the
 carousel's boiler-puff is the only lost one). Decode
 before declaring: av-car-l1/l2 are separate light
 ENTITIES at the carousel pose (present, intact — not
 comps, not lost); the live 403 on python urllib
 redirects to the proven bun-fetch pattern. HEAL STAGED:
 placecarousel.ts gained KNOWN_BAG {particles:smoke} —
 the capture-reapply loop now MERGES known-lost comps
 (never overwrites live data, no double-apply; verified:
 6-comp capture → 7 planned; 7-comp capture → still 1
 smoke). Register entry appended (heal rides the
 consent-gated carousel rollout; closes when live reads
 7). LAW: capture-reapply alone perpetuates a past wipe —
 known bags heal forward.
 — polish-46 HEAL DATA CORRECTION (subject this wakeup): the
 polish-45 heal stubbed {x:1} — mirroring the MOCK's
 comp shape, not the live village. Live decode of all 9
 smoking entities + place-smoke.ts:28: the true idiom is
 {preset:"smoke", origin:[wx, topY, wz], count:50,
 size:0.4, speed:0.35}. The original carousel comp data
 was never captured (no record; resident.log holds only
 building chimneys) — HONEST RECONSTRUCTION in the
 village idiom: origin at the finial top (mkcarousel
 finial 6.08 + r 0.18 → y≈6.3, world (-18.8, 25.9)),
 chimney-grade count/speed, with a recorded tune-down
 note (charcoal precedent: 6 @ 0.22 for a lighter puff).
 Verified: the heal now emits the exact village shape.
 Register entry updated below.
 — polish-47 HEAL IN THE STANDING VERIFIER (subject this
 wakeup): the KNOWN_BAG heal — the package's subtlest
 piece — had NO standing coverage (verify-polish-staged
 checked placer contract markers only; a wrong-shape
 restore would ship silently). The verifier gained two
 BEHAVIORAL heal checks (smoke-less capture heals in the
 exact village idiom, 7 planned; no double-apply, live
 data wins) + a residue-clean check. Now 20/20 ALL PASS
 — every future run re-proves the heal. Honest arc: two
 fix passes (multi-line bun -e broke sh -c quoting →
 probe moved to a self-deleting temp file; missing
 writeFileSync import), each caught by exec before
 commit. The verifier's check count moves 17 → 20.
 — polish-48 LAMP DECODER (subject this wakeup): welcome's
 sentinel branch was blind (if the tex lane rolls a
 NEWER welcome build, the sentinel couldn't tell whether
 the lamp survived). decodeLamp(path|URL) answers from
 bytes — but the FIRST signature was WRONG: I keyed on
 the wb_lamp node name and the staged build read
 NO-LAMP. DECODE LAW (learned, recorded): mergeByMaterial
 RENAMES nodes — the staged build carries wb3_0..wb3_4;
 wb_lamp exists only in the mk script pre-merge. The
 truthful merge-proof signature is the glow2 EMISSIVE
 MATERIAL itself ([1.5, ~.48, ~.10]) — and the green
 channel separates it from the mapboard hearth's
 [1.5, .216, .016] (cross-subject collision tested).
 The sentinel welcome branch now 3-ways: rolled / tex-15
 (pre-lamp, OPEN correct) / UNKNOWN + exact decode
 command. VERIFIED: staged → LAMP; mapboard + carousel
 negatives; hearth-collision negative. Verifier
 standalone still ALL PASS (20/20).
      — polish-49 LIVE SENTINEL SWEEP (subject this wakeup): fresh
           read-only POLISH_LIVE=1 run against the live world —
           all three subjects UNCHANGED after the tex lane's busy
           night (kilns/laundry/awnings touched nothing of ours):
           carousel cd22d0b0 (defect live, register OPEN correct),
           welcome fa0c9d94 — the new 3-way branch reading
           correctly IN PRODUCTION (tex-15 pre-lamp → OPEN
           correct), mapboard e732ce10 (pin stands, chip staged).
           Full verifier incl. live sentinel: ALL PASS. The
           decoders stand armed for a real UNKNOWN; none arrived.
           No rollout, no verb — read-only throughout.
      — polish-50 TOWER-CHIP DAY GATE (subject this wakeup): the
           time-coverage audit continued — the mapboard chip was
           vision-gated at NIGHT only (polish-21, 6m approach);
           the day-close render existed for tri counts but never
           got a day gate. Offline rasterizer, 4m day-close view:
           VISION PASS — chip distinguishable as its own mark
           (rectangular, uniform umber against the pale board;
           strong day contrast), reads as a natural landmark, no
           legibility cost. Pixel corroboration: 15290 dark-mark
           px in the upper half — the map's marks read strong by
           day. LAW: the staged chip is time-safe (night distinct
           per polish-21 + day landmark per this gate); the
           mapboard rollout keeps its green. No code changed;
           staged b77ef40a unchanged.
      — polish-51 LANTERN DAY GATE (subject this wakeup): the
           time-coverage table completed — the carousel's staged
           lanterns were night-gated at polish-15 (8 warm lights);
           the polish-22 day-spectate gates covered HORSE PAINT,
           not the lanterns' day read. Offline rasterizer, the
           exact day-spectate views (18m front/threeq, 10m front):
           VISION PASS — lanterns visible as physical brass/amber
           fixtures under the canopy edge, natural unlit, no
           blobs/artifacts, palette harmonizes with the horse
           paint families. PIXEL CORROBORATION: warm-fixture px
           scales with proximity 42 @18m front → 90 @18m threeq →
           135 @10m — the expected fixture signature. LAW: all
           three staged subjects are now TIME-SAFE (welcome lamp
           p43, mapboard chip p50, carousel lanterns p51 — night
           anchor + day quiet each). The staged package's full
           time coverage holds; every rollout keeps its green.
      — polish-52 POSE-RELATIVE HEAL (subject this wakeup): the
           smoke heal's origin was HARDCODED world coords (-18.8,
           6.3, 25.9) — if any lane re-places the carousel at a
           moved pose, the healed smoke would float at the STALE
           location. The bag now stores the LOCAL anchor
           (finial top, local y=6.3, x/z=0 — ON the spin axis,
           yaw-invariant); planVerbs transforms it into the
           captured pose's world frame at rollout. VERIFIED:
           original pose reproduces [-18.8, 6.3, 25.9] exactly
           (standing verifier unchanged, 20/20 incl. both heal
           behaviorals); a moved pose (5, -10) carries the heal
           to [5, 6.3, -10]; no originLocal key leaks into the
           verb data. LAW: heals ride the capture law — never a
           hardcoded world anchor.
      — polish-53 POSE-RELATIVE IN THE STANDING VERIFIER (subject
           this wakeup): the polish-52 pose-relative heal had no
           standing coverage — the verifier's H1/H2 ran at the
           default pose only; a regression back to a hardcoded
           origin would pass silently. H3 added: a MOVED pose
           (5, -10, yaw 0.7) must carry the heal to [5, 6.3,
           -10] with no originLocal leak. Verifier now 21/21 —
           every future run re-proves all three heal behaviorals
           (idiom / no-dup / pose-relative). First run green.
      — polish-54 SENTINEL SPLIT ADVICE (subject this wakeup): the
           carousel ROLLED branch advised closing ALL register items
           on the lib hash alone — but the smoke item is COMP-level
           with its own close condition (bag reads 7). If the tex
           lane banks our staged build via their OWN placer, the lib
           reads ROLLED while smoke stays lost — the old advice would
           close a still-broken item. The branch now reads the live
           comp bag from the SAME /geom payload and splits the
           advice: smoke PRESENT → close all three; smoke STILL
           LOST → "the heal was skipped, keep the item OPEN".
           VERIFIED offline both ways (6-comp heal-skipped → keep
           OPEN; healed → close it too); live run re-read all three
           subjects correct. Read-only as ever.
      — polish-55 LIGHT RE-ANCHOR (subject this wakeup): the
           polish-52 staleness law applies to the LIGHT entities
           too — av-car-l1/l2 are separate entities captured at
           their own absolute positions; a lane re-placing the
           carousel at a moved pose WITHOUT moving the lights
           would leave the placer faithfully re-emitting drifted
           positions (perpetuating the drift). Guard added: if a
           captured light sits >0.5m horizontally from the
           CAPTURED carousel pose, re-anchor to pose + dy (the
           local light geometry). VERIFIED three ways: consistent
           capture verbatim; drifted light re-anchored to the new
           pose; benign sub-0.5m jitter KEPT (the guard never
           fights small offsets). Verifier 21/21 unchanged.
      — polish-56 CHIP DECODER (subject this wakeup): the decoder
           family completed — the mapboard UNKNOWN branch was the
           last blind one ("investigate" only). decodeChip counts
           the COLOR_0 pipeline verts: CHIP ≥ 1490 (chip-era 1502;
           polish-20 added 24), NO-CHIP ≤ 1480 (pre-chip 1478).
           VERIFIED: staged b77ef40 → CHIP (exactly 1502); welcome
           → NO-CHIP (371, in-domain negative). SCOPE NOTE (honest):
           the carousel GLB reads CHIP (8762 verts) — true but
           out-of-domain; like decodeRoof, the decoder answers its
           OWN subject's builds. The mapboard UNKNOWN branch now
           prints the exact decode command. Verifier 21/21. (Record
           landed one commit late — the first patch's anchor text
           mismatched; the verify block caught it.)
      — polish-57 MOCK FIDELITY (subject this wakeup): the committed
           mock carried the pre-polish-45 world shape — smoke
           PRESENT with stub data {rate:3}, authored before the
           live census. Today's real bag is 6 comps, smoke LOST at
           tex-69; a future dry-run against the stale mock would
           exercise the wrong capture. The mock's carousel entity
           now mirrors live exactly (smoke removed). VERIFIED: mock
           source reads smoke-absent; a mock-shaped 4-comp capture
           heals to 7 planned with smoke restored in the village
           idiom (the heal fires exactly as it would in
           production). NOTE: importing the mock STARTS the server
           (it listens at import) — killed by port 8791, verified
           free; verb-log residue cleaned. (Record again one commit
           late — anchor text; caught by the verify block.)
      — polish-58 DECODERS IN THE STANDING VERIFIER (subject this
           wakeup): decodeRoof/decodeLamp/decodeChip were one-shot
           verified at p44/p48/p56 — a regression in any of them
           would pass silently. D1-D3 added: roof -> staged LIFTED
           (hub y=5.15); lamp -> staged LAMP + mapboard-hearth
           NO-LAMP (green-channel separation); chip -> staged CHIP
           @1502 + welcome NO-CHIP @371. Verifier now 24/24, first
           run green — every future run re-proves all three
           byte-decoders alongside the three heal behaviorals.
      — polish-61 CAROUSEL NIGHT HORIZON (subject this wakeup): the
           readability-horizon law covered the mapboard (~10m) but
           never the carousel — the village's tallest, self-lit
           structure. Distance ladder ADDED to render-carousel.py
           (20/30/45m, night, base fog 0.018 scalar, cam_dist set —
           the mapboard rasterizer's 4-tuple fog signature does NOT
           apply here; caught by exec). PIXEL LADDER: 65/24/4 warm
           px at 20/30/45m. VISION GRADES: 30m = BEACON (individual
           lanterns distinguishable), 45m = GLOW (faint smudge,
           threshold). LAW: the carousel's night horizon is ~30m
           BEACON / ~45m GLOW — triple the mapboard's, as expected
           for an 8-lantern self-lit structure. The staged lantern
           package reads as a village beacon at real approach
           distances. (Plan record one commit late again — the
           anchor lived in the commit message; verify block caught.)

      — polish-62 WELCOME LAMP HORIZON (subject this wakeup): the
           third point of the horizon-law family — mapboard ~10m,
           carousel ~30m BEACON, welcome lamp gated at 5m only
           (116 warm px). Distance ladder ADDED to render-mapboard.py
           (10/16/24m, night, scalar fog 0.018, cam_dist=d — the p61
           lesson applied first try). PIXEL LADDER: 7/3/1 warm px.
           VISION: 10m = GLOW (faint identifiable warmth — a
           wayfinding dot if you know where to look, not a beacon).
           LAW: the welcome lamp's night horizon is ~5m BEACON /
           ~10m GLOW / gone by ~16m — a single-globe signpost, as
           expected against the carousel's 8-lantern ring. The
           horizon-law family now covers all three staged subjects
           with graded expectations per structure size. (Plan record
           one commit late — em-dash anchor; verify block caught.)

      — polish-63 CAROUSEL REBUILD DETERMINISM (subject this
           wakeup): a coverage hole in the verifier — it proved
           mapboard + welcome source->bytes determinism every run
           but NEVER the carousel's, though the placer REBUILDS
           from source at rollout (drift would ship unverified).
           Proven by exec first (backup pinned, rebuild ran:
           38fbbc26dcdfcc1a reproduced byte-exact, 491,384B),
           then added as a standing check. Verifier now 25/25 —
           all three staged builds re-prove determinism each run.

      — polish-64 REBUILD SAFETY (subject this wakeup): p63's
           addition exposed a hole in the verifier itself — the
           rebuild checks OVERWRITE the staged GLBs (gitignored,
           no git recovery); a source-drift FAIL would have already
           DESTROYED the pinned artifact. Hash-swap safety added:
           copy to .bak, rebuild in place, compare, RESTORE the
           original on mismatch (success leaves the byte-identical
           rebuild). All three rebuilds now run under the guard;
           restore-path verified (corrupt-then-restore preserves
           bytes, pinned hash intact); zero .bak residue. Verifier
           25/25 green. LAW: destructive checks must fail safe —
           back up before you overwrite what you pin.

      — polish-65 LIVE SENTINEL SWEEP #2 (subject this wakeup):
           15 wakeups since the last live read (p49); the tex lane
           banked builds all night. Read-only POLISH_LIVE=1 run: all
           three subjects UNCHANGED — carousel cd22d0b0 (defect
           live, OPEN correct), welcome fa0c9d94 (3-way branch:
           pre-lamp, OPEN correct), mapboard e732ce10 (pin stands,
           chip staged). Full verifier incl. live sentinel + the
           new rebuild-safety tier: 25/25 ALL PASS. The armed
           decoders were ready for an UNKNOWN; none arrived. No
           rollout, no verb — read-only throughout.

      — polish-66 MAPBOARD PLACER BEHAVIORAL (subject this
           wakeup): the placer tier's coverage was asymmetric —
           welcome had a behavioral check, mapboard only marker
           checks. Added: a MOVED capture (9, -7, yaw 1.2) must
           carry through to the spawn verb exactly; a NULL capture
           falls back to the DEFAULTS pose verbatim (1.6, 8.5,
           yaw 0). First run green — verifier now 26/26; the
           placer tier has behaviorals for both zero-comp subjects.

      — polish-67 DEFECT-BRANCH BAG CENSUS (subject this wakeup):
           the sentinel's defect-live branch reported the lib hash
           alone (p54 gave the bag census only to the ROLLED
           branch) — a tex-lane re-place dropping MORE comps (below
           the known 6) would surface nowhere, and the smoke item's
           close condition ("bag reads 7") was invisible. The
           defect branch now censuses the live bag every sweep and
           flags COMP LOSS below 6. LIVE-PROVEN first run: "live
           bag 6 comps, smoke still lost (heal rides rollout)" —
           matching the p45 census exactly. Offline sub-branch:
           a 4-comp bag flags loss.

      — polish-68 LIVE SWEEP #3 (subject this wakeup): fresh
           read-only POLISH_LIVE=1 — all three subjects unchanged
           (carousel cd22d0b0, welcome fa0c9d94, mapboard
           e732ce10). The p67 bag census read live for the first
           time in a sweep: "live bag 6 comps, smoke still lost
           (heal rides rollout)" — matching the p45 census
           exactly; no comp loss since tex-69. Full verifier
           26/26 ALL PASS. Read-only throughout.

      — polish-69 LIGHT RE-ANCHOR STANDING (subject this
           wakeup): the p55 re-anchor was verified once and never
           again — a regression in the lights block would pass
           silently (the p47/p53/p58 pattern). H4 added: consistent
           capture emits verbatim; a light drifted 31m re-anchors to
           the pose; benign sub-0.5m jitter is kept. Verifier now
           27/27, first run green — all four placer behaviorals
           (heal idiom / no-dup / pose-relative / light re-anchor)
           re-prove every run.

      — polish-70 RUNBOOK-SYNC GUARD (subject this wakeup):
           records drift landed twice (p59 cited 24 checks while
           the verifier ran 27 — rebuild + mapboard behavioral +
           H4 all landed after the citation). The standing-coverage
           pattern applied to records themselves: ck() now counts
           live, and the verifier's LAST check reads the plan's
           cited "offline N checks" and FAILs on mismatch (self-
           included). FIRST RUN CAUGHT THE REAL DRIFT: plan 24 vs
           actual 28; runbook synced to 28. Verifier 28/28. LAW:
           every number a record cites about the tooling must be
           guarded by the tooling — counts drift, guards hold.

      — polish-71 DUSK RAMP GATE (subject this wakeup): the
           time-coverage family covered day and night but never the
           TRANSITION — the world clock ramps lamps after 18:00
           (p11 law), the moment the lamp must read neither glaring
           nor absent. render-mapboard.py gained a DUSK mode (low
           warm sun 0.62/0.42/0.30 at dusk vs 0.4/0.75/0.5 day;
           emissive ramped to 60% — the honest ramp mid-point).
           VISION PASS: the lamp reads as a soft warm accent just
           waking up, no glare, natural transition; the board reads
           as a dark silhouette (correct for the hour). PIXEL:
           12/2 warm px at 5/10m dusk. LAW: time-coverage wants
           THREE points — day, night, and the ramp between them.

      — polish-72 CAROUSEL DUSK GATE (subject this wakeup; the
           p71 three-point law, second subject): HONEST GATE ARC —
           the first dusk pass reused the dark DAY background
           (24,26,34) and vision rightly FAILED the lanterns as
           GLARING against it. Decode: the failure was in my
           rasterizer's sky, not the lanterns — the engine's real
           dusk is a brighter twilight. Corrected bg (72,58,48):
           vision PASS — lanterns read as soft warm accents in
           twilight, no glare, silhouette clearly readable.
           PIXEL: 36/3 warm px at 18/30m dusk. LAW: a gate FAIL
           indicts the harness first — decode the fixture (bg, fog,
           sun) before indicting the subject. The lantern package
           is now three-point time-safe (day p51 / dusk p72 /
           night p15).

      — polish-73 RETROACTIVE FIXTURE FIX (subject this wakeup):
           the p72 harness-first law, applied retroactively — p71's
           welcome-lamp dusk gate ran under the SAME wrong dark
           day background that p72 caught in the carousel
           rasterizer. Fixed in render-mapboard.py (dusk now uses
           the honest twilight bg 72,58,48) and the gate RE-RUN:
           vision PASS — lamp still a soft warm accent, no glare,
           transition natural. Pixel unchanged (12/2 @ 5/10m — the
           lamp itself is tiny; the fixture, not the subject, was
           wrong). The p71 verdict now stands on an honest
           fixture. LAW CONFIRMED: harness flaws are lane-wide —
           fix the fixture ONCE and re-gate every subject that ran
           under it.

      — polish-74 LIVE SWEEP #4 (subject this wakeup): fresh
           read-only POLISH_LIVE=1 — all three subjects unchanged
           (carousel cd22d0b0 defect live/OPEN correct, bag 6 comps
           smoke still lost; welcome fa0c9d94 pre-lamp; mapboard
           e732ce10 pin stands). No comp loss; decoders armed, no
           UNKNOWN arrived. Verifier 28/28 ALL PASS. Read-only.

      — polish-75 HEARTH DUSK GATE (subject this wakeup): the
           three-point law's third and final subject — the mapboard
           hearth glow (glow1 [1.5,.216,.016]) was night-gated
           (388px) and day-gated (280px) but never at the ramp.
           Gate under the p73-corrected honest twilight fixture:
           vision PASS — hearth reads as a soft warm map mark, lit
           but not glaring; other map marks stay readable; natural
           dusk atmosphere. PIXEL: 5/2 warm-family px at 6/10m
           dusk (the glow recedes honestly as the sun dims it).
           LAW CLOSED: all three staged subjects are now
           three-point time-safe (day / dusk / night each) — lamp
           p43/p71/p29, chip p50/p75/p21, lanterns p51/p72/p15.

      — polish-76 WEATHER AXIS: BEACON IN HEAVY FOG (subject this
           wakeup): the time law closed, opening the WEATHER axis —
           every night gate ran at base fog 0.018, but the decoded
           sky law (p32) weather-scales to 0.036 HEAVY. The
           flagship beacon re-gated in heavy fog: pixel ladder
           33/0/0 warm px at 20/30/45m (vs 65/24/4 base). VISION
           PASS at 20m: the lanterns merge into a soft diffused
           warm glow through mist — atmospherically correct, a
           player knows something lit is there; graceful
           degradation, not extinction. LAW: the beacon horizon
           halves in heavy fog (30m BEACON -> ~20m GLOW) — fog is
           the honest weather axis, and the light survives it.
           Subject closed on this axis; the lamp/chip heavy-fog
           gates deferred (they already read at horizon-edge in
           BASE fog — heavy-fog extinction there is expected, not
           a defect).

      — polish-78 LIVE SWEEP #5 (subject this wakeup): fresh
           read-only POLISH_LIVE=1 — all three subjects unchanged
           (carousel cd22d0b0 defect live/OPEN correct, bag 6 comps
           smoke still lost; welcome fa0c9d94 pre-lamp; mapboard
           e732ce10 pin stands). Verifier 28/28 ALL PASS. Read-only.

      — polish-79 STATUS-BLOCK GUARD (subject this wakeup):
           self-indictment — the p77 status block I added cites
           "28 checks" in its own phrasing, which the p70 guard
           (regex on 'offline N checks') did NOT cover — my own
           addition violated my own records law on landing. Fixed:
           the verifier now guards BOTH cited counts (runbook +
           status block); both read 29 after the fix (the new
           guard is itself a check). Verifier 29/29. LAW EXTENDED:
           a records guard must enumerate every phrasing it
           protects — adding a citation surface means extending
           the guard in the SAME commit.

## Rollout Runbook (polish-42 — one-glance execution when consent or a tex-lane banking arrives)

The staged package, its proofs, and the exact close path. Verify first:
`POLISH_LIVE=1 bun agents/arthur/verify-polish-staged.ts` (offline 29 checks
— 4 heal behaviorals + light re-anchor + 3 decoder behaviorals + 3 rebuild
determinism + 2 placer behaviorals + runbook-sync guard — + live sentinel:
reads live libs AND the live comp bag, maps to register action). (polish-59
refresh, count synced p70:
the runbook was written at p42, 16 iterations before the smoke heal, the
split advice, the light re-anchor, and the decoders.)

1. **Carousel (register: ROOF TOO LOW + HORSE PAINT)** — staged
   `38fbbc26dcdfcc1a` (491,384B; textured families + roof lift +0.45 + paint
   widening + stair fix; regresses NOTHING over live cd22d0b0 — same
   conversion state). Execute: `bun agents/arthur/assets/placecarousel.ts`
   (proven 19/19 incl. 429 recovery + silent-drop survival; captures live
   comp bag, rebuilds, uploads, re-applies ALL comps, verifies pose+lib).
   Then: sentinel — the ROLLED branch SPLITS (p54): roof+paint flip CLOSED
   on the lib hash; the SMOKE item (p45, comp-level) closes only if the
   live bag reads 7 with particles:smoke present — if the tex lane banked
   the build via their own placer and skipped our heal, re-apply
   particles:smoke (village idiom, finial anchor, p46/p52) and KEEP the
   item OPEN until the bag reads 7. The placer now carries the KNOWN_BAG
   heal + light re-anchor (>0.5m drift guard, p55) — running OUR placer
   gets both. Live vision re-read (18m/10m + fog) closes the HORSE PAINT
   visual confirm; carousel lanterns ride the same build (night-gated p15,
   day-gated p51).
2. **Welcome lamp (register: NIGHT-UNREADABLE)** — staged
   `62746d1af698eacc` (5 nodes, glow2 [1.5,.48,.10]). Execute:
   `bun agents/arthur/assets/placewelcome.ts` (chassis-proven; live
   av-welcome carries no comps — geometry-level emissive, nothing to
   re-apply). Then: sentinel — UNKNOWN welcome lib? run decodeLamp (p48;
   glow2 [1.5,~.48,~.10] signature, merge-proof) before touching the
   register; lamp ROLLED → welcome item CLOSED; after-read at the
   banked crop coords (x998-1191, y572-609, ~5m night) shows the lamp
   (night-gated p29, day-gated p43).
3. **Mapboard tower chip (staged, NO register item — cosmetic)** — staged
   `b77ef40aae3a9dae`. Execute: `bun agents/arthur/assets/placemapboard.ts`
   (proven 8/8; mapboard carries NO comps — pose + lib only). Then: sentinel
   reports chip ROLLED — UNKNOWN mapboard lib? run decodeChip (p56;
   COLOR_0 1502 chip-era vs 1478 pre-chip); render-gated 6m night (p21)
   AND 4m day (p50).
4. **After any of the three**: re-run the standing gate; watch the tex
   lane's next pins (they may bank these builds themselves — tex-83
   precedent); ledger entry via ledger-append.py (landed deltas only).

Order: welcome (cheapest, zero-comp) → mapboard → carousel (comp-heaviest).
All three live-rollout executions remain consent-gated; the sentinel is
read-only and runs freely.

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
