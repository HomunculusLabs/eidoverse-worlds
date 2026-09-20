#!/usr/bin/env python3
# fauna74-append-candidate.py — insert the carp CANDIDATE row 48 into
# FAUNA-PLAN.md before the brown-hare rebuild record, with the lane's
# assert-unique-anchor law. Read -> assert -> insert -> write -> verify
# (grep count + byte delta).
import io

P = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/FAUNA-PLAN.md"
ANCHOR = "### brown hare — fauna-73 (2026-09-20) CLOSED"
TAG = "proposed fauna-74"

src = io.open(P, encoding="utf-8").read()
assert src.count(ANCHOR) == 1, f"anchor not unique: {src.count(ANCHOR)}"
assert src.count(TAG) == 0, f"tag already present: {src.count(TAG)}"

BLOCK = """48. **[CANDIDATE — proposed fauna-74, 2026-09-20, build fauna-75] common
    carp at the reedpool NE open water — the fleet's first FISH, the
    angler's implied catch.** ONE entity `nx-dress-carp-001` (short-id
    convention, magpi/pheas/hare law). Census-grounded
    (fauna74-census-carp.ts, READ-ONLY): 418 entities, ZERO fish fauna
    ids AND libs (magpie fauna-57 proposal law; the 18 id hits are
    substring classes — approach-lane/lamp names carrying 'roach' inside
    'approach', plus kfish = the kingfisher BIRD; zero lib hits) — the
    species slot is genuinely open. Queue-law note: the domain law's
    first-priority homestead families all STAND (goats fauna-1, ducks
    fauna-3, bunnies ×3: hutch fauna-4 + wild fauna-38 + hare fauna-73),
    so the honest next head is the implied-fauna law (woodpecker
    fauna-59 class): **the angler (`nx-struct-angler`) has fished a
    fishless pool since placement** — heron wades it, swans swim it,
    ducks dabble it, the frog sits on it, and nothing lives UNDER the
    surface. The reedpool is the village's richest habitat host (six
    residents) and its water column is empty; the NE open-water quadrant
    carries no resident at all (this tick's quadrant table: NW frog,
    SW ducks+swan, SE heron, geese/robin on banks). The common carp
    (Cyprinus carpio) is THE European village-pond fish — the stocked
    water every village keeps, the dark shadow that cruises just under
    the surface. OPAQUE-WATER VISIBILITY LAW (fauna-29 law a) governs
    the whole build: anything below the water face is invisible by
    construction, so the carp reads as a SURFACE EVENT — the dark
    bronze-olive back + the dorsal fin CRESTING the water plane (the
    cruiser's shadow), never a full fish. Species contract: SINGLE large
    mirror carp (~65cm class, mid-band male — carp are the pool's
    largest underwater resident), cruising posture with the tail
    half-cocked, deep-bodied hump back, ONE tall serrated dorsal fin
    cresting ~40mm above the waterline, dark bronze-olive 0x4a4a30 back
    water-slotted between wake geometry, surface WAKE ONLY as furniture
    (ducks/swan law — dark calm annulus + ripple arcs, zero ground
    geometry, the pool IS the host). Motion contract: THE CRUISE —
    small-radius slow orbit r 0.5-0.7 degPerSec ~8-12 (the shadow
    circles the NE water, ducks' duck_a precedent scaled slower) + fin
    waterline bob + a slow tail-slide Z; phases staggered, epoch t0.
    Anchor contract: carp (orbit root) / carp_body / carp_dfin (3 KEEP
    groups; `carp` prefix — collision-free THIS TICK: rg over mkv3
    sources + gitignored assets = carpet/carpentry prose only, zero
    node-name tokens; re-verify at build tick, magpi law). Siting:
    NE open-water concentric water-rider (ducks fauna-3 / swan fauna-63
    class): entity PY = decoded water top arithmetic (host -0.05907 +
    local water disc top 0.140 = world 0.08093, fauna-29's exact
    derivation) with the fin crest composed ABOVE it; exact tuple owed
    to the build tick (25cm-grid seat sweep ON the water vs decoded
    residents + angler empty-corner decode + rim; host tuple+lib
    hard-gated, artwalk-39 law). Judge contract: bridge-deck TOP
    vantage (fauna-29 law d — the surface reader looks DOWN) + SW-bank
    18m reader line + the angler's-rod sightline (the fish he is not
    catching, read from his own vantage). Provenance: ducks/swan
    waterline discipline + wake idiom (the ONLY water furniture that
    passed the 18m gate, fauna-63 r11/r12), frog surface-rider chassis
    (y=0 seat plane law), duck_a orbit precedent, kfish water-margin
    reader discipline. Proposal only — build fauna-75.


"""

out = src.replace(ANCHOR, BLOCK + ANCHOR, 1)
io.open(P, "w", encoding="utf-8").write(out)

chk = io.open(P, encoding="utf-8").read()
assert chk.count(TAG) == 1, f"post-write tag count {chk.count(TAG)}"
assert chk.count(ANCHOR) == 1, f"post-write anchor count {chk.count(ANCHOR)}"
print(f"PATCHED: +{len(out) - len(src)} bytes; tag x1; anchor x1; total {len(chk)} bytes")
