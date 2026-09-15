#!/usr/bin/env python3
"""sweep-252 plan block append: asserted unique anchor, one-block growth."""
import io, sys

PLAN = 'agents/arthur/SWEEP-PLAN.md'
BLOCK = """
sweep-252: CLEAN SWEEP, arrival tick (fully settled — epochs B and C
byte-identical, 24th consecutive quiet-or-classified epoch pair). Census
epoch A 330==330 BYTE-IDENTICAL to the committed sweep-251 baseline (raw
218241B sha16 28397d8096762bcb, cmp-verified): 0 arrivals, 0 departures,
all five semantic drift classes EMPTY. Mid-tick struct-181 (d2f09c01)
landed the committed carry placement: epoch B 330->331 with exactly ONE
domain-valid arrival nx-struct-apollonian @ (1.433333,-0.01264,164.243746)
yaw 0.8726646 (50 deg oblique) lib 6ba69bea474cb575 comp {} scale 1 kind
thing — tuple matches its committed ledger line-for-line (PLACED_VERIFIED,
census 330->331, idempotent; own NN 12.60 vs peaucellier law 8, SAT 7.66
law 1.4), independently corroborated by SAT re-run at epoch B below; 0
departures, 0 drift on 330 shared ids (all five classes). Epoch C 20s-paced
re-read BYTE-IDENTICAL to B — arrival settled; epoch D post-rewrite read
BYTE-IDENTICAL to the new baseline. Baseline lawfully rewritten with
pre-write assertions (arrivals exactly [nx-struct-apollonian], departures
[], drift []): 218842B / 331 entities / sha16 37d85b22b9b6ca3b,
post-rewrite drift vs live ZERO. Overlap: SAT fresh-live at epoch A
292/237/0 exit 3 on exactly ONE unclassified = R-121 lamp-n|nx-town-mapboard
-0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43, 208th
sweep since routing, NOT new, no escalation due (law keys severity-1);
SAT RE-RUN at epoch B (293 bbox non-light / 237 classified / 0 coverage
holes) — apollonian classified clean, no new contacts, same single
unclassified R-121. Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0, legs run individually per the sweep-228 ceiling law
— core 64/64 @ 0.380 (next-walk-core-paths.ts; [physics] banner +
labyrinth 0.48m support-seam abstentions = known normalized diagnostics,
unchanged set), NW 5/5 @ 0.380 (nw-approach1-walk.ts), NE 7/7 @ 0.380
(ne-approach2-walk.ts), SW 5/5 @ 0.370 (sw-approach3-walk.ts); verdicts
content-anchored on status strings + per-leg ok counts + maxArrival from
raw files. Apollonian sits r164.25 Math terminal island E-flank — 144m+
off every tier-1/tier-2 leg, walks stand by construction (sweep-53
precedent, menger r155 class). Tier-2 230th cycle per the committed
sweep-251 POINTER CORRECTION OF RECORD: longhouse 6/6 @ 0.3456
(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both ALL_PASS real exit 0 — match the
sweep-246 records for the pair exactly; both tools ls-verified present on
disk pre-run. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[]
(206th consecutive clean); sweep89-battery 28/28 PASS exit 0 on BOTH
epoch-A and epoch-B bytes (python3 argv census-path form); interlane md5
f6254cd0 stable, read fresh this tick; ledger law EXACT — base re-read
fresh via grep immediately before append (max sweep-251), D+0/E+0 append,
tool self-verifies law() both sides. Pools drained: IMPROVE-PLAN md5
c0f569d0 unchanged (228th check; 0 SHARD EXECUTION sections, 0 open
candidate rows), sweep owns no prefix; CITY-PLAN-V2 assigns sweep no reset
role — the audit-continues freeze banner governs and was read fresh this
tick. Diff tool sweep252-census-diff.py folded from the committed sweep251
chassis (sed swap; FIRST ATTEMPT keyed on the wrong source tag sweep250 —
0 forward/3 stale refs caught by the forward/stale count probe pre-run,
re-folded correctly: 3 forward / 0 stale, py_compile clean, clean exit 0
at epochs A and B unpiped on the real bytes). Baseline-rewrite helper
sweep252-baseline-rewrite.py: first inline-heredoc attempt was blocked by
the gateway parser (sanctioned-retry path); first on-disk run died on a
shape assumption (bare list vs dict['entities'] — re-derived from the
actual bytes, sweep-5 class). Probe self-catch pre-verdict: core-walk
parse keyed legs-as-int (sweep-245 class; re-anchored on status + ok-count
+ maxArrival strings). Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-253): inn + tower-house (231st cycle — LRU chain
re-derived from committed pointers this tick: longhouse/garden-cottage
@252 walked fresh, row-cottage/observatory @251, forge/potter @249,
hall/bunkhouse @250, inn/tower-house @248 stalest standing pair at 4
sweeps; both walk tools ls-verified present on disk this tick:
interior-walk-inn.ts, interior-walk-tower-house.ts). (D+0, E+0)
"""

src = io.open(PLAN, encoding='utf-8').read()
anchor = 'sweep-252 walks longhouse + garden-cottage (230th cycle).'
assert src.count(anchor) == 1, f"anchor count {src.count(anchor)} != 1"
size_before = len(src.encode('utf-8'))
out = src + BLOCK
io.open(PLAN, 'w', encoding='utf-8').write(out)
check = io.open(PLAN, encoding='utf-8').read()
assert check.count('sweep-252: CLEAN SWEEP, arrival tick') == 1
delta = len(check.encode('utf-8')) - size_before
assert 3000 < delta < 6000, f"growth {delta}B outside one-block band"
print(f"PLAN APPENDED: anchor unique, block present once, growth {delta}B")
