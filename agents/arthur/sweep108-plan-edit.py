#!/usr/bin/env python3
"""sweep-108 plan edit: narrative register block appended at file tail
(matches the sweep-103..107 committed pattern). Narrative-only, no table row."""

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

block = """
sweep-108: CLEAN SWEEP, steady-state tick. Census 299==299 at epochs A and B
(25s-paced) vs the committed sweep-107 baseline (sha16 ec2eeb876e233bf8):
0 arrivals, 0 departures, 0 drift field-sets on all 299 shared ids across
id/pos/yaw/scale/lib/kind/bbox — single stable epoch, no sibling landed this
window; snapshot byte-identical, NO rewrite (sweep-106 precedent). Overlap:
SAT fresh-live 261 bbox non-light / 232 classified / 0 coverage holes, exit 3
on ONLY the known R-121 lamp-n | nx-town-mapboard -0.407 (Sev 2 routed to
artwalk @ sweep-43, sixty-fourth sweep since routing, no escalation due — the
law keys on severity-1); zero new contacts. Tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @
0.38, SW 5/5 @ 0.37 — standing profile exact. Walk stderr support-seam
abstentions on foreign dress/temple entities = the known normalized
diagnostics set, unchanged. Tier-2 86th cycle per committed pointer: market
6/6 @ 0.389 (interior-walk-market.ts) + inn 6/6 @ 0.364 (interior-walk-inn.ts),
both real exit 0, both over the overhaul-wave bytes. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (62nd consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 — the sweep-106 refreshed pins
hold with zero FAILs (comp-bearing 21, 38 lights); interlane md5 f6254cd0
stable, read fresh. Probe self-caught pre-verdict: (a) first tier-1 walk run
piped output through tail and captured tail's exit code (polish-270
content-laundering class) — all four legs re-run with file capture and real
exit codes; (b) first parser keyed per-leg maxArrival before reading the
actual schemas and crashed on the approach tools' array shape (sweep-48
class) — re-keyed on results[].ok + status + maxArrival. Ledger law EXACT —
base re-read fresh immediately before append, 2370741. Standing gate
ALL_PINS_OK real exit 0 at tick-start 0100a1f2 (own sweep-107 close at HEAD,
no sibling commit since). Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-109): forge + potter (87th cycle — LRU chain: @108
market/inn, @107 garden-cottage/tower-house, @106 bunkhouse/longhouse, @105
stable/observatory, @104 hall/row-cottage, @103 forge/potter — forge and
potter last walked sweep-103, now the stalest standing pair; both walk tools
verified present: interior-walk-forge.ts, interior-walk-potter.ts).
"""

assert s.count('sweep-108: CLEAN SWEEP') == 0
assert s.count('pair (sweep-108):') == 1
s = s + block

open(P, 'w').write(s)
# verify
v = open(P).read()
assert v.count('sweep-108: CLEAN SWEEP') == 1
assert v.count('pair (sweep-109):') == 1
# newline-anchored: two PROSE mentions of this header exist in sweep-95/97
# narrative blocks (adjacent-token-bleed class) — anchor on the true header
assert v.count('\n## Findings register') == 1
print('PLAN_OK bytes', len(block))
