#!/usr/bin/env python3
"""survey-181 note + plan-block appends (insert-only-at-EOF, asserted).
1) Defect note -> STRUCTURES-PLAN.md EOF (grep-verified 0 pre-existing).
2) Plan-block 181 -> SURVEY-PLAN.md EOF.
Asserts gate the write; post-write verification gates the commit."""
import re

NOTE = """
SURVEY-181 defect note (2026-09-09, read-only observer probe; owning-lane
decode/execute law applies): nx-struct-enneper first-native read on LIVE
served bytes 60e90835 (upload sha ba17a712, struct-133 PLACED_VERIFIED
tuple-exact): IDENTITY FAIL + VOID/HOLE clause at 18m gameplay (silhouette
PASS, emblem needle+bead+rim PASS) — reads as a ribbed droplet/onion-shell
of nested concentric slat bands, not two crossing saddle sheets. Native
front + aerial AGREE (discrete band read, single nested shell, no
over/under crossing cue from any walk-up vantage). This slice is the
native payment of the owner's disclosed front/aerial 1210 debt (struct-133
JUDGED block) and it resolves WORSE than the ZAI margins suggested:
native outranks fallback, and the three-view unanimity upgrades the
"ribbed-lantern texture" margin to a priority finding — at 18m the
discrete-band read fully displaces the Enneper crossing identity on
gameplay/front/aerial; only the top plan (a vantage no walker gets)
delivers the 4-petal contract. Decode-settled classes honored (pitfall-11):
owner decode stands (0/64,065 verts off, ONE connected disk, only mesh
boundary = rim) — the judges' "sky-through gaps" is grazing-angle
sheet-through true of any thin minimal surface, and the comb-toothed cast
shadow is the sheet's own seam shading, so the VOID/HOLE clause is
class-inherent, not geometry damage; the IDENTITY clause is the real
probe. Priority input for the queued tick-135 enneper refine (owner
entry already names enneper native debt — no IMPROVE-PLAN candidate row,
no-duplicate law): the fix class is band-read breakup at distance —
consider fewer/wider parametric rings or a film law change so the skin
reads continuous at 18m, and localized densification at the two axis
crossings so the over/under cue lands from walk-up views. Evidence:
reviews/survey181-slice/enneper/ (gameplay+front+aerial+night+top+served
bytes). Severity: Sev 2 (identity read at distance on an otherwise
grounded, mathematically-true work — same class as the s176 gyroid note;
second consecutive S-walk arrival to fail identity-at-18m).
"""

BLOCK = """
## Judged index (survey-181)

- survey-181 (2026-09-09, ARRIVAL SLICE + DEBT PAYMENT, notes routed):
  census 322 vs committed sweep baseline 321 (agents/arthur/reviews/
  sweep-census-baseline.json, sweep-181 fold): exactly ONE arrival
  nx-struct-enneper [-17.439118,-0.013339,249.391013] yaw pi (3.141593)
  lib store/ba17a712cbc734bd.glb — classified sibling work-in-flight by
  domain = struct-133 PLACED_VERIFIED at HEAD 3ae6e9f3, tuple
  ledger-exact; 0 departures / 0 field diffs / 0 lib flips on all 321
  shared ids (9-field law, tracked survey181-census-diff.py chassis,
  s178/179/180 lineage). Gyroid lib unchanged da2a4b15 (tick-135 refine
  still pending; s176 Sev-2 note stays open with owner). Struct-family
  72. SLICE (arrival-gated, s76/s79/s80/s176 precedent): nx-struct-
  enneper judged NATIVE 3/3 calls (gameplay 18m + front + aerial — the
  owner's disclosed 1210-debt views), zero 1210, zero ZAI fallback, 8th
  consecutive all-native window. VERDICTS 1 confirmed-identity-probe /
  0 clean / 0 dropped: IDENTITY FAIL at 18m (ribbed droplet of nested
  slat bands, not crossing saddle sheets) unanimous across gameplay +
  front + aerial; silhouette PASS, emblem PASS; VOID/HOLE clause
  decode-settled class-inherent (single thin sheet, grazing-angle
  sky-through + seam shadow — owner decode 0/64,065 verts off stands,
  pitfall-11 honored); native contradicts-in-degree the owner's
  gameplay-PASS margins (native-vs-native, s77/78 arbitration class:
  owner's own front-margins + top-plan 4-petal contract corroborate the
  identity gap; only top delivers the petal read, a vantage no walker
  gets). NOTE ROUTED: 1 — SURVEY-181 defect note Sev 2 appended
  STRUCTURES-PLAN.md EOF (grep-verified 0 pre-existing open enneper
  survey note), priority input for queued tick-135 enneper refine (fix
  class: band-read breakup at distance — fewer/wider rings or film-law
  change + densified crossings); ZERO IMPROVE-PLAN candidate row
  (owner-queued tick-135 entry names the object, no-duplicate law).
  Evidence local-untracked: reviews/survey181-slice/enneper/ (8 frames +
  served-bytes, s176 evidence-shape precedent). Ledger append [survey-81]
  D+0 E+0 (one append, routing record — loop law 4 exception). Gate ALL
  PASS real exit 0 un-piped tick-start 3ae6e9f3 (ledger law EXACT
  2370772, 99 PASS lines); zero world mutations/uploads/verbs/
  comp-edits/shared-budget use (D+0, E+0).
"""


def append_eof(path, text, expect_substrings):
    raw = open(path).read()
    for probe in expect_substrings:
        assert raw.count(probe) == 1, f'anchor not unique: {probe!r} x{raw.count(probe)}'
    assert 'SURVEY-181 defect note' not in raw, 'duplicate note guard (STRUCTURES-PLAN)'
    with open(path, 'a') as f:
        f.write(text)
    raw2 = open(path).read()
    assert raw2.startswith(raw), 'append was not insert-only-at-EOF'
    assert raw2.count('SURVEY-181 defect note') == 1
    print(f'OK {path}: +{len(raw2)-len(raw)}B')


# 1) Defect note into STRUCTURES-PLAN at EOF.
append_eof(
    'agents/arthur/STRUCTURES-PLAN.md',
    NOTE,
    ['next-place-struct133.ts (all tracked); reviews/struct133-enneper/'],
)

# 2) Plan-block 181 into SURVEY-PLAN at EOF.
sp = 'agents/arthur/SURVEY-PLAN.md'
raw = open(sp).read()
assert '## Judged index (survey-181)' not in raw, 'duplicate plan-block guard'
anchors = ['zero comp edits, zero shared-budget use (D+0, E+0).']
for a in anchors:
    assert raw.count(a) >= 1, f'missing tail anchor {a!r}'
with open(sp, 'a') as f:
    f.write(BLOCK)
raw2 = open(sp).read()
assert raw2.startswith(raw), 'SURVEY-PLAN append not insert-only-at-EOF'
assert raw2.count('## Judged index (survey-181)') == 1
print(f'OK {sp}: +{len(raw2)-len(raw)}B')
