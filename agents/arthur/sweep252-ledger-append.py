#!/usr/bin/env python3
"""sweep-252 ledger append: re-read ledger max immediately before, append via canonical tool."""
import re, subprocess, sys

LEDGER = 'agents/arthur/IMPROVEMENTS.md'
src = open(LEDGER, encoding='utf-8').read()
tags = re.findall(r'- \[sweep-(\d+)\]', src)
mx = max(int(t) for t in tags)
print(f"ledger max sweep-{mx} (re-read fresh immediately before append)")
assert mx == 251, f"expected max 251, got {mx} — re-derive tag"

prose = ("CLEAN SWEEP arrival tick (fully settled — epochs B/C byte-identical, 24th consecutive quiet-or-classified pair). "
"Census epoch A 330==330 BYTE-IDENTICAL to the committed sweep-251 baseline (218241B sha16 28397d8096762bcb): 0/0/0 all five drift classes. "
"Mid-tick struct-181 (d2f09c01) landed the committed carry: epoch B 330->331, exactly ONE domain-valid arrival nx-struct-apollonian @ (1.433333,-0.01264,164.243746) yaw 0.8726646 (50 deg oblique) lib 6ba69bea474cb575 comp {} — tuple matches its committed ledger line-for-line (PLACED_VERIFIED, idempotent, own NN 12.60/SAT 7.66), corroborated by SAT re-run at epoch B; 0 departures, 0 drift on 330 shared ids; epoch C 20s-paced BYTE-IDENTICAL to B, epoch D post-rewrite read BYTE-IDENTICAL to the new baseline. "
"Baseline lawfully rewritten with pre-write assertions (arrivals exactly [nx-struct-apollonian]): 218842B / 331 entities / sha16 37d85b22b9b6ca3b, post-rewrite drift ZERO. "
"Overlap: SAT epoch A 292/237/0 exit 3 on ONLY R-121 lamp-n|nx-town-mapboard -0.407 (known Sev 2 artwalk-routed @ sweep-43, 208th sweep since routing, no escalation due — law keys severity-1); SAT RE-RUN epoch B 293/237/0 — apollonian classified clean, no new contacts, same single R-121. "
"Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS every leg real exit 0, legs run individually per sweep-228 ceiling law — core 64/64 @ 0.380 ([physics] banner + labyrinth 0.48m seam abstentions = known normalized diagnostics), NW 5/5 @ 0.380, NE 7/7 @ 0.380, SW 5/5 @ 0.370; apollonian r164.25 — 144m+ off every walked leg, walks stand by construction (sweep-53 precedent, menger r155 class). "
"Tier-2 230th cycle per the committed sweep-251 POINTER CORRECTION OF RECORD: longhouse 6/6 @ 0.3456 + garden-cottage 6/6 @ 0.355, both ALL_PASS real exit 0, matching sweep-246 records; tools ls-verified pre-run. "
"Integrity: pins 15/15 ALL_PINS_OK bad:[] (206th consecutive), battery 28/28 PASS on BOTH epoch-A and epoch-B bytes, interlane md5 f6254cd0 stable read fresh, pools drained (IMPROVE md5 c0f569d0 228th, 0 OPEN rows; sweep owns no prefix; CITY-PLAN-V2 assigns sweep no reset role — audit-continues banner governs, read fresh). "
"Standing gate ALL PASS real exit 0 FIRST TRY at tick-start d3533646 (city-137), RE-RUN ALL PASS real exit 0 at d2f09c01 after the mid-tick struct-181 HEAD advance (epoch law honored before append). "
"Diff tool sweep252-census-diff.py folded from the sweep251 chassis (first sed attempt keyed wrong source tag — 0 forward/3 stale caught by count probe pre-run, re-folded 3/0, py_compile clean, exit 0 both epochs unpiped); baseline-rewrite helper first run died on a bare-list shape assumption (re-derived from actual bytes, dict['entities']). "
"Zero world mutations, zero defect notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use. "
"Next tier-2 pair (sweep-253): inn + tower-house (231st cycle — LRU re-derived: inn/tower-house @248 stalest at 4 sweeps; tools ls-verified present).")

r = subprocess.run(['python3', 'agents/arthur/ledger-append.py', 'sweep-252', 'D+0', 'E+0', prose],
                   capture_output=True, text=True)
print(r.stdout)
print(r.stderr, file=sys.stderr)
sys.exit(r.returncode)
