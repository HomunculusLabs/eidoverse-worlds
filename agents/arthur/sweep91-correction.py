#!/usr/bin/env python3
"""sweep-91 correction of record: index-race disclosure block at EOF.
No new ledger entry (one append per tick already made). Single subject:
my commit 428a6e8e swept 5 foreign dress-108 files a sibling staged in
the shared index mid-tick because the commit was chained without gating
on the staged-partition listing."""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

block = """

CORRECTION OF RECORD (sweep-91, index-race disclosure, artwalk-34
adjacent class): commit 428a6e8e (sweep-91) swept FIVE foreign
dress-lane files that a sibling had staged in the shared index mid-tick
— agents/arthur/DRESSING-PLAN.md, dress108-decode-hookrow.ts,
dress108-render-hookrow.ts, dress108-terrain-hookrow.ts,
sw-dress108-lanternhook-place.ts — because my `git add` (explicit-name,
lawful) was followed by a CHAINED commit that never gated on the
staged-partition listing; `git diff --cached` printed the 10-file union
in the same compound command one step before `git commit` consumed it.
No data lost, no history rewritten: the sibling's dress-109 ledger
entry rode my commit's IMPROVEMENTS.md snapshot (verified exactly-once
at HEAD, artwalk-34 interleaving law) and its own commit 9800d2fe
landed on top carrying only mkv3-dress-sw-lanternhook1.ts. Ledger law
closes EXACT at final HEAD 9800d2fe: canonical running-total line
2370721 == audit-balance slice sum (sibling D+6 absorbed post-append —
my pre-append probe constant 2370715 was frozen at append time, not a
ledger defect); standing gate re-run ALL PASS real exit 0 at 9800d2fe.
Zero sweep-lane world mutations throughout (domain law intact — the
defect was commit hygiene, not world action). LAW going forward
(chain-gating amendment, this lane's own discipline): when staging and
committing in one terminal call, the commit must be gated on the
partition — `git diff --cached --name-only` must be read and checked
against the intended explicit-name list BEFORE `git commit` runs, or
the two steps must be separate terminal calls with the listing
inspected between them (the 3-call-split shape this lane already uses
for hold ticks).
"""

assert s.count('Next tier-2 pair (sweep-92):') == 1, 'EOF anchor not unique'
assert 'CORRECTION OF RECORD (sweep-91, index-race disclosure' not in s, 'block already present'
s = s.rstrip('\n') + '\n' + block
open(P, 'w').write(s)
print('CORRECTION BLOCK OK; bytes now', len(s))
