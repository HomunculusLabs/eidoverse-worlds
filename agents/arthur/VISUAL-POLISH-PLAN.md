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
      (polish-1): canopy assembly +0.45 (hub 5.15, cone base 4.81/apex 5.99,
      edge 4.83, finial 6.08; mast lengthened, drop-poles/ribs/flags follow).
      Decode 29/29 ALL PASS: rider head clears 0.63m @r=2.0 (target ≥0.4),
      ears 1.66m @r=2.1 (≥1.5), bob-peak both green; horses/sockets/comps
      untouched; build byte-deterministic `e0227166a8a7fe6b`. ROLLOUT
      PENDING: live /geom read + verbs approval-blocked TWO consecutive
      ticks (polish-1, polish-2) — next wakeup runs
      `bun agents/arthur/assets/placecarousel.ts`, now REWRITTEN
      contract-safe (polish-2): captures the live comp/socket bag from
      /geom at execution time instead of baking stale values (the old
      placer's socket y=2.47 predated candidate-6's saddle-plane 1.97 —
      it would have seated riders 0.5m high); re-applies the captured bag,
      verifies lib+comps+pose post-place. Unit-tested offline 19/19
      (verify-polish2.ts). Then visual gate + register close.
      Gate note: tex-27 pin FAIL during polish-2 was the texture lane's
      own tex-63 in-flight window — self-resolved at their `1b6c72f`
      (transient, not a finding; audit-20/49 class).
- [ ] Carousel stair landing transition (declared-open in rework plan).
- [ ] Carousel night contrast: warm lights vs canopy shadow — spectate at
      night cycle, consider lantern emissives under canopy edge.
- [ ] Horse silhouette at spectator distance (≥15m): read as carved
      figures, not supports. Compare 4 horses.
- [ ] av-run / av-pondlife / av-garden-fence mesh quality (Bill's standing
      priority list).
- [ ] Interiors visible through doorways — furnished read at threshold.
- [ ] Village night lighting balance: interior lights ×6 + hearths; look
      for dead-dark buildings on the ring.

## Closed

- (none yet — first tick pending)

## Laws (carried from the skill + audit protocol)

- Decode at source before editing; the village has always been right when
  the probe was wrong.
- Probes are one-shot: write, run once, delete. Prefer inline `bun -e`.
- Live-yaw rotated SAT only; door lanes 1.4m; uploads 16–21s; verbs 12/4s.
- Never commit another lane's in-flight work; HEAD gate regex accepts
  `repair-\d|tex-\d|audit-|refine-` — polish commits append `polish-` to
  verify-repairs.ts line 80 regex on the FIRST polish commit (or the gate
  FAILs by design; that FAIL is the reminder).
- Only Bill stops the loop (LOOP_COMPLETE requires his explicit stop).
