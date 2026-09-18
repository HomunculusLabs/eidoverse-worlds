// struct220-verdict-rupert.ts — REGISTER VERDICT for R11-35 PRINCE RUPERT'S CUBE
// (struct-220 build+judge tick, 2026-09-18). This file records WHY the form is NOT
// built this tick and what the next tick owes. Not a probe: no carve happened.
//
// THE MATH ARC (all RED-first, every claim from real tool output this tick):
//
// 1. THEOREM CONSTANT CORRECTED. My working memory said "the door is 3*sqrt2/4 times
//    the face". WRONG on two counts, caught by computation:
//    (a) The maximum square SECTION inscribed in a unit cube has side 1.250324649719
//        (edge-inscribed square, vertices on 4 cube edges, found by exhaustive
//        edge-quadruple + Newton solve: 67 inscribed squares, max side 1.2503).
//        The value 3*sqrt2/4 = 1.06066 is NOT the max section — it is the classic
//        UPPER BOUND proof value for the PASSING cube's side (Speer 1994 bound).
//    (b) The door PRISM need not be a section at all — the sandwich structure
//        (passer-shadow ⊆ door ⊆ wall-shadow, all ⊥ bore axis) admits prisms whose
//        section exceeds every planar section. This is the actual miracle of
//        Rupert's cube and it defeated my first two probe drafts:
//        - draft-1 (centered family) falsified by its own probe: max centered
//          section == the face exactly (sigma 1 vs 1.06066 claimed) — RED-1.
//        - draft-2 (offset LP) exposed a half-side/side factor-of-2 convention bug
//          and a coordinate-descent saddle; fixed by bisection evaluator + brute
//          confirmation.
//    (c) The honest unrestricted 5-dof sandwich solve (bore n 2 dof + passer tilt
//        2 + in-plane 1, LP over door center/size) converged to s = 1.059651 vs
//        the classic 1.060660 (rel deficit 9.5e-4 = pattern-search floor). The
//        passer fits with ~mm daylight: the PASS is real and machine-verified at
//        that pose (independent 3D corner check PASS).
//
// 2. THE MONUMENT CONSTRAINT THAT KILLED THE BUILD TICK. The lane's carving method
//    is conservative raster courses (cell 0.18 x layer 0.24, all-8-corners). For
//    the wall to be ONE connected stone (a real structure, not floating islands):
//    - At the solved passing pose, the door prism exits through SIDE faces, and the
//      raster remainder is 4 components at every centered door in [need, wallMax]
//      and at offsets +-0.2 and yaws 0-180 in 2-deg steps: NO CONNECTED (phi, door,
//      offset) exists. Root cause: a door larger than the face necessarily escapes
//      the top/bottom faces (face-containment caps the door at exactly 1.0 — proven
//      by the constrained solve), so the bore cuts side openings that sever corners.
//    - At the MAX-SECTION frame (side 1.2503, n = (-0.2961, 0.4688, -0.8322)),
//      the raster remainder is TWO symmetric components of EQUAL size at every
//      door from 1.25 down to 0.80 unit: the wall splits like a fork. (The
//      dbg-sect4 "all singletons" run was a broken flood-fill condition —
//      `solid.has(nb) + "" === ""` always false — its output is VOID; sect2/sect3
//      floods were clean.)
//
// 3. THE HONEST FORM THIS LEAVES (next build tick's commission): RUPERT'S FORK —
//    the carved cube carrying two pillars of itself, with the EQUAL solid cube
//    caught mid-pass between them; the bore's slit daylight and a brass sleeve at
//    the waist carry the theorem. The "one connected wall" law can also be honored
//    by an explicit clamp/collar course family (a designed ring course that
//    bridges the two pillars at the crown, outside the bore prism) — that decision
//    belongs to the next tick's concept contract, judged against renders.
//
// 4. BUG LEDGER (standing law, all self-caught RED-first):
//    - half-side vs side convention (2x) — bisection evaluator beats algebraic
//      corner-bounds when the parametrization is fresh.
//    - transposed rotation application (RP_T vs RP) — three sites, all caught by
//      absurd spans (7.5 m need vs 4.7 wallMax).
//    - improper mirror: cross products flip under reflection; mirror the FRAME
//      explicitly and keep it proper (right-handed).
//    - raster ranges must COVER the cube's shadow extents in the carving frame —
//      assert it (draft-3 dropped draft-2's assert and silently carved 4 islands
//      out of undercoverage; with coverage restored the 4 comps were REAL).
//    - coarse raster (0.30 cell) erodes the whole wall to dust (0 cells at door
//      0.5) — connectivity verdicts only at the true carve resolution.
//    - rounding coordinates across processes breaks feasibility (pitfall 6 —
//      solve/polish/verify must live in ONE process).
//    - flood-fill with a typo'd boolean (`x + "" === ""`) reports every cell a
//      singleton — always sanity-check component sizes against total cell count.
//
// DISPOSITION: Rupert's cube stays UNBUILT and UNBARRED. The verified substrate:
//    - passing pose (unit): n = (-0.318506, 0.728404, 0.606615), passer tilt
//      Rx(-50.4092 deg) Ry(73.2053 deg), in-plane 21 deg, door window
//      [4.638, 4.703] at S=4.5 — PASS verified (worst corner 2.3190 <= 2.3515).
//    - max-section frame (unit): side 1.250324649719, u = (-0.257596, 0.799792,
//      0.542196), v = (0.542196, 0.799792, 0.257596), n = (-0.296130, 0.468785,
//      -0.832195), vertices on cube edges.
//    Next tick: concept contract for RUPERT'S FORK (or the collar-bridged wall),
//      probe -> build -> decode -> render -> judge -> bank for placement.
export {};
