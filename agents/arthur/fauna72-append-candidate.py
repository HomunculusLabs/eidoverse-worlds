#!/usr/bin/env python3
# fauna72-append-candidate.py — insert the hare CANDIDATE row 47 into
# FAUNA-PLAN.md before the first per-species rebuild record (the '### mute
# swan' header), with the lane's assert-unique-anchor law. Read -> assert ->
# insert -> write -> verify (grep count + byte delta).
import io, sys

P = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/FAUNA-PLAN.md"
ANCHOR = "### mute swan — fauna-63 (2026-09-20) CLOSED"
TAG = "proposed fauna-72"

src = io.open(P, encoding="utf-8").read()
assert src.count(ANCHOR) == 1, f"anchor not unique: {src.count(ANCHOR)}"
assert src.count(TAG) == 0, f"tag already present: {src.count(TAG)}"

BLOCK = """47. **[CANDIDATE — proposed fauna-72, 2026-09-20, build fauna-73] brown
    hare at the open meadow — the lagomorph triad's missing member.** ONE
    entity `nx-dress-hare-001` (short-id convention, magpi/pheas law).
    Census-grounded (fauna72-census-hare.ts, READ-ONLY): 417 entities,
    ZERO hare/lepus/lagomorph ids AND libs (magpie fauna-57 proposal law)
    — the species slot is genuinely open. Village logic: the fleet's
    lagomorphs are the DOMESTIC hutch pair (fauna-4) and the WILD rabbit
    pair (fauna-38) — the brown hare (Lepus europaeus) is the third and
    the classic English-countryside completion (the rodent triad's vole
    law, applied to lagomorphs): the open-country animal of fallow
    margins and arable edges that never burrows — it beds in a shallow
    FORM in the open grass and outruns everything on long hind legs.
    Bill's homestead language holds bunnies; the hare is the meadow's
    own. Species contract: PAIR, TRUE-SIZE authored directly (hares are
    BIG — body ~55cm, lankier and taller than every rabbit; carries 18m
    natively, no bake expected; wrabbit chassis scaled honestly) —
    hare_a THE UPRIGHT SENTINEL on its hocks (the tall sit-up, ears at
    FULL HEIGHT ~12cm with THE BLACK TIPS — the 18m silhouette lock,
    zero confusion risk with the rabbit's 8.5cm plain ears) + hare_b
    FLAT IN THE FORM (pressed to the ground in a shallow grass
    depression, ears pinned flat along the back — the classic
    walk-past-then-it-moves discovery reward; maximum posture
    contrast, both states species-true). Markers: grizzled brown-gold
    coat 0x9c8a62 with black guard-hair ticking, LONG hind legs with
    big feet (the athletic deep-chest build vs the rabbit's egg — the
    profile distinction), amber eyes, black-tipped ears with pale
    inner faces. Furniture: the FORM only — a shallow pressed-earth
    dish + parted grass blades + 2 droppings at the rim (grain law;
    zero timber — the open meadow IS the habitat, zoo-dump law).
    Motion contract: 2 breathing bobs + sentinel tall ear-slow-scan Y
    (hares scan slow, ~10s) + nested ear-flick + the flat one's
    ear-shiver Z (the pinned ears twitch) + head-up check X (the form
    hare lifts its head to look, ~12s — the signature: the patch of
    grass that LOOKS BACK); phases staggered per individual, epoch t0.
    Anchor contract: hare_a{,_head,_ears} + hare_b{,_head,_ears} (6
    KEEP groups; `hare` prefix — collision-free, census-verified zero
    hits this tick; rg over all mkv3 sources + gitignored assets owed
    at build tick, magpi law). Siting: open-meadow GROUND seat,
    FIRST-CHOICE the SW meadow S reach zone center (−24,−42) —
    genuinely open (this tick's co-resident table: nearest solid
    milestone sw-005 at 4.1m, donkey 8.1m, sheep 11.1m — the S reach
    is the village's quietest open grass on a reader line), SECOND the
    N gallery-ring margin (−26,30; hedgehog 3.8m the nearest
    co-resident, amphi 7.8m); exact tuple owed to the build tick
    (25cm-grid seat sweep + live heightAt + live SAT + walk-up
    discover vantage on the SW-lane reader line, bearing 60.3° to
    plaza, clean-slate law fauna-61 law a). Judge contract: profile
    (the lanky build + black-tipped ears — the contract view) +
    discover (the form find at ~2.6m) + 18m scope PRESENT (the
    upright sentinel carries; robin-law encounter-reward disclosure
    for the flat one). Provenance: wrabbit chassis verbatim (TRUE-SIZE
    lagomorph, two-segment tapered ears), deer watch/graze
    posture-contrast law, dog contact-shadow, vole grass-run furniture
    discipline (the form is vole-lane pressed-earth, scaled up).
    Proposal only — build fauna-73.


"""

out = src.replace(ANCHOR, BLOCK + ANCHOR, 1)
io.open(P, "w", encoding="utf-8").write(out)

chk = io.open(P, encoding="utf-8").read()
assert chk.count(TAG) == 1, f"post-write tag count {chk.count(TAG)}"
assert chk.count(ANCHOR) == 1, f"post-write anchor count {chk.count(ANCHOR)}"
print(f"PATCHED: +{len(out) - len(src)} bytes; tag x1; anchor x1; total {len(chk)} bytes")
