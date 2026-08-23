# commons-next minimal-core end-to-end audit — nvp-22

Audited: 2026-08-23  
Mode: harness-only, read-only  
Target world mutation: none

## Verdict

`CORE_AUDIT_PASS`

The accepted commons-next core is technically coherent, walkable, visually legible by day and night, and functionally complete without a third principal mass. The 60-work district queue may open under the existing one-model inspect→place law.

## Exact live census

`agents/arthur/next-audit-core.ts` returned:

- 21 exact live entities;
- 15 exact model tuples;
- 6 exact authored lights;
- zero unclassified model intersections;
- four classified intentional attachments:
  - tower ↔ shutters;
  - court ↔ cistern beneath the accepted overhang;
  - court ↔ bakery wall sign;
  - court ↔ smithy wall sign;
- 75 exact live path pavers;
- minimum paver-to-model clearance `0.1795855594703042m`;
- no `mx-` entities.

All expected hashes, poses, yaws, scales and component-key sets matched fresh `/geom`.

## Component and light census

Model component contracts remain intact:

- hearth: embers, two pendulums, five sockets;
- carousel: platform spin, four phased horse bobs, smoke, four rider sockets;
- court: contract-correct local oven smoke;
- forge: coal bob and 84-count local ember emitter;
- tower: study socket;
- all reviewed satellites and paths: empty bags.

Read-only light-history fold matched:

- plaza: `#ff9040`, intensity `2.5`, range `7`;
- welcome: `#ffb066`, intensity `1.2`, range `4`;
- four cardinal lights: `#ffb066`, intensity `1.35`, range `4.5`.

## Real MCPL walk evidence

Fresh end-to-end walks all passed:

- core paths: five routes, 64/64 outward/return legs, maximum arrival `0.38m`;
- court: bakery and workshop openings both directions, four passes at `0.34m`;
- tower: outside→inside→ladder→inside→outside, four passes at `0.265–0.380m`.

All dedicated placers reconcile idempotently with zero verbs.

## Exact-hash visual audit

Evidence: `agents/arthur/reviews/nx-core-audit/`.

The committed `review-core-composition.ts` pins all 15 live model hashes at exact poses and includes all six authored light contracts. Final views cover top, aerial, SW arrival, gameplay, night arrival and night aerial.

Findings:

- clear three-anchor composition around the hearth: carousel NW, tower NE, working court SE;
- paths explain movement without filling the grass;
- cardinal lamps organize the near field and remain legible from both sides;
- SW arrival meadow stays visibly open;
- court remains the functional work/bakery mass; tower supplies residence/study and vertical identity; carousel supplies play/social motion; hearth/welcome establish the commons center;
- warm night hierarchy is concentrated at the hearth and approaches, with quieter principal-mass beacons;
- no blocking silhouette, attachment, path, lighting or camera-occlusion defect.

A third principal mass is **not needed**. It would weaken the intentional open quadrant and duplicate functions already supplied by the court/tower pair.

Strongest non-blocking limitation: the core remains intentionally sparse at the 48m composition scale. The district ring must provide distant context without back-filling the SW meadow or turning the core paths into a dense road web.

## Audit defects fixed during this wakeup

1. The tower placer treated the new path model's aggregate 32m bbox as a solid obstruction, despite the reviewed 75-paver micro-SAT being clear. It now fail-closes on the exact path tuple and excludes that aggregate ground-dressing bbox from building SAT. All three placers then reconciled with zero verbs.
2. The first full-core audit renderer used stale fallback plaza-light values. Read-only live light history proved the exact plaza contract is `#ff9040 / 2.5 / 7`; renderer evidence was corrected and regenerated before verdict.

## Gate

- Standing `verify-repairs.ts`: real exit 0 / `ALL PASS`.
- No GUI/computer-use/browser automation.
- `commons` read-only; `mx-` untouched.
- Keeper migration and public-link authority remain Bill-only.
