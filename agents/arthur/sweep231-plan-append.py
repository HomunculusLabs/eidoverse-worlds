#!/usr/bin/env python3
"""sweep-231 plan append: table row after the sweep-230 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES ON COMMIT — verify applied edits before staging."""
PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-230 | 2026-09-10 | 325==325 fully quiet at BOTH epochs (A/B, 20s-paced, "
ROW = ("| sweep-231 | 2026-09-10 | 325==325 lib-fold epoch tick at ALL THREE epochs (A/B/C, "
       "20s-paced, next-live-census.ts chassis) — the sweep-230 register note's known epoch "
       "folded: exactly ONE domain-valid lib flip nx-struct-unduloid 3a9b92b8aeb3722d -> "
       "014ed586a083a4df at identical tuple [95.262794,-0.031702,55] yaw -2.0944 (struct-163 "
       "committed placement dda69d89, tuple matches its ledger row line-for-line); 0 arrivals, "
       "0 departures, ZERO field drift on the 324 other shared ids (pos/yaw/scale/kind/bbox/"
       "compKeys); epochs B/C byte-identical to A (settled — no sibling landed live this tick); "
       "snapshot rewritten verbatim live-bytes anchor 215228B/325 ents/sha16 b8c43498acb3ebea "
       "(sweep231-snapshot-rewrite.py NEW lib-fold variant of the sweep-229 chassis: pre-write "
       "asserts green incl. drift==[] exactly, post-write byte-identical, drift ZERO on the 324 "
       "others) — sweep-52 precedent honored, next sweep baseline current | exit 3 on ONLY "
       "known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 187th "
       "sweep since routing, no escalation due — law keys Sev 1); SAT fresh-live 287 bbox "
       "non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 "
       "ALL_PASS real exit 0 each (core 64/64 @ 0.380, NW 5/5 @ 0.380, NE 7/7 @ 0.380, SW 5/5 "
       "@ 0.370, legs run individually per sweep-228 ceiling law; physics-banner + "
       "labyrinth-seam abstentions = known normalized diagnostics, unchanged set) + tier-2 "
       "209th cycle per committed sweep-230 pointer: longhouse 6/6 @ 0.3456 + garden-cottage "
       "6/6 @ 0.355 (match sweep-226 records for the pair exactly) | pins 15/15 ALL_PINS_OK "
       "bad:[] (185th consecutive clean); battery 28/28 PASS exit 0 on fresh census-A bytes; "
       "interlane f6254cd0 stable read fresh pre- and post-walks; ledger law EXACT 2370778 at "
       "append via canonical tool; gate ALL PASS exit 0 FIRST TRY at 4bbaaf1c + RE-RUN ALL "
       "PASS exit 0 at e75de47c pre-append (epoch law — struct-164 zero-mutation + survey-"
       "325/326 observer interleaves absorbed, survey-326 census corroborates the epoch "
       "byte-for-byte); diff tool sweep231 folded from committed sweep230 chassis (sed swap "
       "only, 3 forward / 0 stale refs, py_compile clean, clean exit 0 at epoch A unpiped on "
       "the real bytes); pools drained (IMPROVE-PLAN md5 c0f569d0 unchanged 208th, 0 "
       "live-queue OPEN, no SHARD EXECUTION, sweep owns no prefix); next pair sweep-232 "
       "row-cottage + observatory circuit (210th, tools ls-verified THIS tick) | CLEAN SWEEP "
       "— R-121 open, known, no escalation due |")

PROSE = """
sweep-231: CLEAN SWEEP, lib-fold epoch tick — the sweep-230 register note's
known epoch folded. Census 325==325 at ALL THREE epochs (A/B/C, 20s-paced,
next-live-census.ts chassis): epoch A exactly the pre-write assertion — ONE
domain-valid lib flip nx-struct-unduloid 3a9b92b8aeb3722d -> 014ed586a083a4df
at identical tuple [95.262794, -0.031702, 55] yaw -2.0944 (struct-163
committed placement dda69d89; tuple matches its ledger row line-for-line); 0
arrivals, 0 departures, ZERO field drift on the 324 other shared ids across
pos/yaw/scale/kind/bbox/compKeys. Epochs B and C byte-identical to A
(sha16 b8c43498acb3ebea) — settled, no sibling landed live this tick.
Snapshot rewritten verbatim live-bytes anchor: 215228B / 325 entities / sha16
b8c43498acb3ebea (sweep231-snapshot-rewrite.py NEW, lib-fold variant of the
sweep-229 re-seat-fold chassis — pre-write asserts green including
field-drift == [] exactly, post-write re-read byte-identical to the live
epoch-C file, drift ZERO on the 324 others) — the sweep-52 register-note
precedent honored; the next sweep's baseline is current. Sibling interleaves
absorbed (all post-epoch-C commits, none mutated the live world): struct-164
(59ce2ee1, zero-mutation banked-bytes peaucellier night re-judge, D+0/E+0 per
its entry), survey-325 (3c738864, observer re-seat slice — independently
judged unduloid v3 CLEAN on live bytes, retiring survey-312 Sev 2), survey-326
(e75de47c, observer quiet hold whose census corroborates the b8c43498acb3ebea
epoch byte-for-byte). Epoch law honored: standing gate re-run ALL PASS real
exit 0 at e75de47c before the ledger append, ledger law 2370778 exact at both
runs. Overlap: SAT fresh-live 287 bbox non-light / 236 classified / 0
coverage holes, real exit 3 un-piped on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 187th sweep since routing, NOT new, no escalation due
(the law keys on severity-1). Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0, legs run individually per the sweep-228
ceiling law — core 64/64 @ 0.380 (next-walk-core-paths.ts), NW 5/5 @ 0.380
(nw-approach1-walk.ts), NE 7/7 @ 0.380 (ne-approach2-walk.ts), SW 5/5 @ 0.370
(sw-approach3-walk.ts); physics-banner and labyrinth-seam abstentions are the
known normalized diagnostics set, unchanged; all verdicts content-anchored on
status strings + leg counts from raw unpiped output. Tier-2 209th cycle per
the committed sweep-230 pointer: longhouse 6/6 @ 0.3456
(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both ALL_PASS real exit 0 — match the
sweep-226 records for the pair exactly. Integrity: struct18-fleet-pin-check
15/15 ALL_PINS_OK bad:[] (185th consecutive clean); sweep89-battery 28/28
PASS exit 0 on fresh census-A bytes (python3 argv census-path form);
interlane md5 f6254cd0 stable, read fresh pre- and post-walks; ledger law
EXACT — base 2370778 re-read fresh via the canonical gate at both runs,
D+0/E+0 append, tool self-verifies law() both sides (running total 2370778 ->
2370778). Standing gate ALL PASS real exit 0 FIRST TRY at tick-start 4bbaaf1c
(sweep-230 repair at tip). Diff tool sweep231-census-diff.py folded from the
committed sweep230 chassis (sed swap only — 3 forward / 0 stale refs,
py_compile clean, clean exit 0 at epoch A unpiped on the real bytes). Pools
drained: IMPROVE-PLAN md5 c0f569d0 unchanged (208th check; raw 'OPEN' hits =
headers/prose, zero live-queue OPEN rows), no SHARD EXECUTION section, sweep
owns no prefix. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-232): row-cottage + observatory circuit (210th cycle — LRU chain
re-derived from committed pointers this tick: inn/tower-house @228,
forge/potter @229, hall/bunkhouse @230, longhouse/garden-cottage @231 walked
fresh, row-cottage/observatory @227 stalest standing pair at 4 sweeps; both
walk tools ls-verified present on disk this tick:
interior-walk-row-cottage.ts, struct2-walk-observatory.ts).
"""

s = open(PATH).read()
assert s.count(ROW_ANCHOR) == 1, f"row anchor not unique: {s.count(ROW_ANCHOR)}"
assert s.count("| sweep-231 |") == 0, "row already present"
assert s.count(PROSE[:60]) == 0, "prose already present"
i = s.index(ROW_ANCHOR)
end = s.index("\n", i)
s2 = s[:end + 1] + ROW + "\n" + s[end + 1:]
s2 = s2.rstrip("\n") + "\n" + PROSE
open(PATH, "w").write(s2)
rows = open(PATH).read()
assert rows.count("| sweep-231 |") == 1, "row missing after write"
assert rows.count("sweep-231: CLEAN SWEEP") == 1, "prose missing after write"
print("plan-append OK: row + prose landed, anchors unique")
