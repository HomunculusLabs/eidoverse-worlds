# NEW-VILLAGE BUILD LOOP — canonical prompt (nv-N, created 2026-08-21 for Bill's painting session)

Every 2h tick. Reports to discord:#projects. Bill is AFK — full lane autonomy.

---8<--- LOOP PROMPT ---8<---

NEW-VILLAGE BUILD LOOP — wakeup nv-N.

Load skill `eidoverse-world-building` FIRST. Repo: /Users/t3rpz/projects/eidoverse-worlds
Build world: commons-next (https://eidoverse.billding.dev/?world=commons-next)
NEVER touch world `commons` (the keeper's home, 200 entities, read-only reference).
NEVER touch ids with prefix mx- (Mai's future district).
Bill is away painting. Full autonomy. English reports, concise.

## PLAN (Bill-approved 2026-08-21: SUBTRACTION — keep only what Arthur loves)
Total build = plaza (already staked) + 3 buildings + 4-way lamp ring + work ring + keeper-later.
- Plaza trio STAKED & verified (nv-1): nx-hearth (0,0), nx-welcome (-3,0,-4.3) yaw .6092,
  nx-carousel (-18.8,0,25.9) yaw 2.5137. Libs: hearth store/43fcaf1442f5d6b8.glb,
  welcome store/6cd75bbbbf379df5.glb, carousel store/38fbbc26dcdfcc1a.glb.
- Core (3 only): forge+court, bakery, tower-house — placed fresh at r 18-26, doors facing plaza,
  rebuilt ONLY if era-2 libs look wrong; else carry live commons libs (content-addressed) first,
  elevate later. Draw plot coords in the plan file BEFORE placing.
- Lamps: plaza light (0,1.2,0) copied from commons av-plaza-l params; one lamp per approach;
  welcome board lamp from day one (polish-29 lesson).
- Work ring: 60 av-mason works lift from commons into band r∈[66,108], four districts
  (NW cultivation: orchard/garden/lavender; NE craft: hamlet/cloister/statuary;
  SE wild: forest/wayside/cairnfield; SW contemplative: labyrinth/terrace/seed/mosaic).
  Center distance ≥ max(width_i,width_j)×0.75; inner edge ≥66m; farthest corner ≤108m.
  Same libs, same ids renamed nx-mason-0000..0059; capture comp bags BEFORE from commons,
  re-apply AFTER (comp-wipe law). Mason lights carry too (23).
- Keeper: NOT in this loop's scope (phase 2, Bill's call).

## QUEUE (work top-down, one major item per tick)
1. nv-2 COMPS (parked mid-stride — do FIRST): write placer FILE next-comps.ts applying
   verbatim bags — nx-carousel: motion:carousel (spin 6°/s y-axis), motion:horse_0/2/4/6
   (bob amp .18 period 2.4 phases 0/1.57/3.14/4.71), sockets (horse seats y 1.97, yaw π..),
   particles:smoke (origin [-18.8,6.3,25.9] — carousel sits at identical offset, verbatim OK);
   nx-hearth: particles embers (origin [0,0.7,0] count 30 size .22 speed .32), motion:well_
   (pendulum x-axis amp 3 period 9 damp .99), sockets log_0/1/2 (pos ±1.344,0.32,±1.344,
   yaw ∓2.356), motion:pz_kettle (pendulum z-axis pivot [0,1.55,0] amp 2.5 period 11);
   nx-welcome: EMPTY in commons — here add a lamp light entity nx-welcome-l near (-3,2.2,-4.3),
   warm, modest intensity. Also plaza light nx-plaza-l at (0,1.2,0) — read av-plaza-l's exact
   color/intensity from commons /geom and copy. Verify all via live /geom census: carousel 6
   comps, hearth 5, welcome 0+lamp entity. If a full comp JSON is needed, re-read it from
   commons /geom fresh — never trust this prose over the live bag.
2. nv-3 lamp ring + welcome lamp verification at night-equivalent (emissive anchors named).
3. nv-4..6 the 3 core buildings (plot → place → walk-test two-way MCPL → comps).
4. nv-7+ work ring by district, ~8-10 works per tick, comp bags carried, sweep after each
   district (no work-work overlap, no rim overhang past 112m).
5. Final: end-to-end audit (census, drift, intersections) + report to Bill.

## LAWS
- Fresh survey each tick: git log -5; bun agents/arthur/verify-repairs.ts MUST exit 0 before
  and after work (fix gate before building if red).
- NEW-LANE LAW: the HEAD-gate regex (verify-repairs.ts:207) does NOT include nv- yet. The
  FIRST nv- commit must widen the regex to include nv (and every verifier carrying the same
  regex) IN THAT SAME COMMIT, else the gate trips.
- Placer FILES only (see agents/arthur/next-plaza.ts for the chassis: WS join via
  agents/arthur/config.json, paced verbs, /geom verify). Never inline shell JSON comps.
- NEVER curl|python3 pipes (approval-blocked in cron): read live state via bun scripts using
  fetch, or curl to a temp file then parse. Plain curl to the .dev URL prints fine.
- Re-place wipes comps: capture BEFORE, re-apply ALL AFTER.
- Ledger: python3 agents/arthur/ledger-append.py nv-N "D+n" "E+n" "prose" — tag from ledger
  max, prose NEVER ends with a (D+n,E+n) pair.
- Commit every tick: nv-N message. Push not required.
- Uploads 4/min, verbs 12/4s — pace ≥600ms, retry once on 429.
- HOLD LAW: if every remaining item blocks on Bill, say so ONCE in the report and do
  lightweight audit/stewardship only. No 200 no-op ticks.
- LOOP_COMPLETE: NEVER — only Bill says stop.
- If a terminal approval blocks mid-tick: stop that thread cleanly, note it in the report,
  move to the next queue item. Never push through a block.
- Report each tick (delivered to #projects): survey result, what landed (ids, numbers,
  before/after), what's next, anything needing Bill.

---8<--- END LOOP PROMPT ---8<---
