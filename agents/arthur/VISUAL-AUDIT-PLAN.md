# VISUAL AUDIT PLAN — flash-vision standing-works sweep (Arthur, started 2026-08-26)

Purpose: 5.3-flash has native vision. This lane spends it on the thing loops
were always worst at — actually LOOKING at every finished work standing in both
worlds, at gameplay distance, night, and motion-interval, and registering real
visual defects instead of trusting manifests.

Lane prefix: `viz-N`. Commit prefix `viz-`. Ledger tool: `ledger-append.py`.
Self-paced /loop (no interval token). Race-ready: ALL tags derive from
LEDGER MAX over `- [(viz-\d+)]`, never git HEAD; re-check the ledger tail
immediately before every append.

## Phase 1 scope (observation only)

This lane OBSERVES and REGISTERS. It never mutates a world. Defects land in
`agents/arthur/REPAIR-REGISTER.md` (register-first law) or, for ring-slot
candidates, into `NEXT-PLACEMENT-APPROVALS.md`; repairs execute in the owner
lanes' ticks (repair loop, nvp placement loop). One subject per wakeup.

Subjects (closed backlog, in order):
1. commons-next core: the 21 PLACED_VERIFIED entities (hearth through tower
   ensemble). Highest value: this is the village Bill will eventually link.
2. NW Cultivation slots once placed.
3. commons ring works (~60): sampled by district, prioritizing landmarks.

## Per-wakeup protocol

1. Load skill `eidoverse-world-building` FIRST.
2. Fresh survey: `git status --short --branch`, `git log -5 --oneline`,
   standing gate `bun agents/arthur/verify-repairs.ts` (real exit 0), fresh
   census via the committed script `bun agents/arthur/next-live-census.ts
   <world>` (never inline an external URL into shell — approval stall).
3. Re-derive next free viz-N from the LEDGER MAX, not HEAD.
4. Pick ONE subject. Bind evidence EXACTLY:
   - Record the live tuple (id, pos, yaw, scale, lib/hash, complete component
     bag) from the census output.
   - Prove local bytes == live store hash before trusting ANY local render:
     rebuild deterministically from the maker/composer source OR otherwise
     obtain byte-exact GLB; sha256 must equal the live `lib` hash. A hash
     mismatch stops the tick (report drift — itself a finding).
   - Render with the committed reviewer (`bun agents/arthur/review-model.ts
     <glb> <outdir>`) — four daylight angles, gameplay distance, top/aerial,
     night when emissives/light anchors exist, motion interval pair (two
     frames, different phases) when motion comps are live.
5. VISION PASS (native): actually view every frame. Judge, at minimum:
   - silhouette identity at gameplay distance — reads instantly as itself?
   - night readability — do lit works stay legible, do unlit ones go black?
   - back/side completeness, grounding (no floating/sunk geometry), camera
     occlusion vs asset quality separated;
   - motion pair shows ACTUAL movement (never infer motion from one still);
   - material hierarchy surviving distance.
   Eye-check law: if the image needs explanation, it failed.
6. Verdict: PASS or ONE highest-value defect named concretely (what, where,
   why it matters visually). Real defect → register-first entry in
   REPAIR-REGISTER.md with the frame paths and exact live tuple. Do NOT fix,
   do NOT shotgun-polish.
7. Ledger: `python3 agents/arthur/ledger-append.py viz-N D+x E+1 "<prose>"`
   (E+1 per registration even on hold; prose never ends with its own pair).
8. Commit evidence-referenced state with `viz-N:` message (frames/reviews dirs
   conventionally stay untracked like assets residue unless small + durable;
   the REGISTER entry is the tracked record).

## Hold discipline

Backlog exhausted → steady-state hold tick per the lean-hold protocol: survey
green, gate exit 0, ledger D+0 E+1, `viz-N:` commit, one-line English report.
Never manufacture jank. Never self-judge the worlds done. LOOP_COMPLETE only
when Bill says stop.

## Laws carried

- NEVER modify any world entity, verb, or comp from this lane. Observation +
  registration only. `commons` and `commons-next` are read-only here.
- NEVER use computer_use, browser automation, or GUI steering. Live truth =
  committed census scripts; visual truth = deterministic exact-hash-bound
  local renders (hash proved against live store this tick).
- NEVER touch `mx-` ids (Mai's ground). Out-of-scope sightings get one report
  line max, no register entry.
- Reviewer is Arthur; routine acceptance delegated by Bill. Authority calls
  (demo/removal of someone else's work) escalate to Bill, never registered.
- Two consecutive FAILed gates or a law breach = HOLD, report, wait.
