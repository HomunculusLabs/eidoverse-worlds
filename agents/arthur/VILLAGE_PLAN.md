# Arthur's Village — Build Plan

**Timestamp:** 2026-08-15T01:09:15Z (epoch 1786756155)
**AMENDMENT 1 (the Grand Refinement Mandate):** 2026-08-15T~01:45Z
**AMENDMENT 2 (the Millionfold Mandate):** 2026-08-15T02:19:38Z —
   the target becomes **2,000,000 marked improvements**, pursued as a
   persistent working (the MASON daemon) rather than session waves. Counting
   stays honest: ledger units are named mesh nodes in PLACED works, entities,
   lights, motions, sockets, fixes. Dense works are themed, bounded (~2-4k
   nodes each), and spatially distributed so the client (which does NOT merge
   draw calls) stays performant. The working runs until dismissed or the
   target is met; it never blocks the resident, the plaza, or guests.
**AMENDMENT 3 (the Curated Field):** 2026-08-15T~02:50Z — the world is 160m
   and finite; craft-density works cap the STANDING set at CAP=60 mason
   works. Beyond CAP, each new work recycles the oldest slot (remove +
   respawn, a cleanup improvement). The ledger counts CUMULATIVE improvements;
   the standing field stays curated and the client stays fast. The mandate is
   a marathon of craft, not a wall of noise.
**Window:** 8 hours → target 2026-08-15T09:09:15Z, extended by the mandate
**Site:** east commons — flat zone + grass edge, anchored on existing structures
  (founder's house at (6,12), hearth courtyard at (10,10))
**Palette:** Arrakis — stone 0x4a4038, dark 0x3a322b, brass 0x8f7a4d, bone 0xcfc4ae, mid 0x6b5d4f
  + living accents: grass-green 0x4a5d33, leaf 0x5d7a3a, ember 0xffa050, lamplight 0xffc98a

## THE CONSTITUTION

1. **The ledger is truth.** Every improvement is counted in IMPROVEMENTS.md,
   numbered, categorized, and verifiable. No padding: an improvement is a
   NAMED, VERIFIABLE addition or fix — a named mesh node in a placed GLB,
   a placed entity, a light, a motion/component, a seat socket, a documented
   fix. Categories: D=detail node, E=entity, L=light, M=motion/comp,
   S=socket/seat, F=fix, G=greenery node, P=path stone node.
2. **Target: 2000 marked improvements** before stopping. Batch cycles are
   fine; the ledger records every item each cycle delivered.
3. **Beauty rules:** warm light over cold; human-scale details (handles,
   plates, books, cushions); varied rooflines; curved paths; fire as hearth;
   green softening every hard edge; nothing flat-floating; every building
   door-true (raycast-verified), every seat sittable.
4. **Entity economy:** pack repeated details into multi-node GLBs (a hedge
   entity may carry 8 named bushes). World entity count stays sane.
5. **Never break what stands:** rebuilds preserve footprints, doorways, and
   ids. Swap = remove + respawn same id from new hash.

## Layout (world coords)

- PLAZA at (16, 4), r≈8: paved circle, central well, market stalls, benches, lampposts
- MEETING HALL at (24, 8), facing the plaza — the communal building
- HOUSES ringing the plaza, each distinct:
  - Founder's house (existing, (6,12))
  - Tower house (24, -6): round, two floors, balcony, conical roof
  - Longhouse (10, -8): steep gable, porch posts, long axis E-W
  - Garden cottage (5, 2): L-shape + walled garden + chimney
  - Row cottage (16, 18): compact, dormer, steep roof
- PATHS: stepping stones — plaza↔each house↔hearth courtyard↔monument direction
- ART: möbius arch at plaza south entry; mural stone pair; the trefoil monument (existing, NW) stays the village's horizon piece
- LIGHTING: warm lamps on plaza, porches, paths

## Phases — STATUS at 01:37Z (28 min in)

1. **[PLAN]** ✅ done
2. **[ASSETS]** ✅ 4 houses (tower 49n / longhouse 43n / garden cottage 39n /
   row cottage 32n), all doorways raycast-verified
3. **[PLAZA]** ✅ well, 2 stalls, firebowl (BURNING), 4 lampposts (LIT),
   2 arc benches, tree
4. **[PATHS+DECOR]** ✅ 5 stone runs (tower/long/hearth/row/lookout),
   planters, barrels, banners, GATE on hearth path
5. **[ART]** ✅ möbius arch v2 (true half-twist), lissajous (SPINNING),
   2 murals + existing trefoil monument & orrery
6. **[PLACE]** ✅ all uploaded/placed; census 46 av-* entities
7. **[VERIFY]** ✅ full probe ALL PASS; 12-waypoint walking tour ALL ARRIVED
   (surfaced + fixed a real controlLoop re-trigger bug)
8. **[POLISH]** ✅→🔄 evolving — delivered: MEETING HALL (63n,
   king-post truss), BUNKHOUSE (38n, 4 bunks), LOOKOUT (15n, railed deck),
   SHRINE (22n, breathing orb). Amendment 1 waves 1-5 (2215 total) done.
   **Amendment 2 (2M): the MASON working** — launchd daemon composing dense
   themed works (10 themes: forest/garden/orchard/terrace/cairnfield/mosaic/
   seed/labyrinth/statuary/lavender) on a bounded 60-slot field with recycle
   (Amendment 3), one work / ~17s, ledger auto-appends.
   **Densified v3** 2026-08-15 ~03:00Z + **v4.1 kilo-density** (~03:30Z) +
   **v5 milestone voice + finish line** (~03:40Z) + **v5.1 laggard lift**
   (~03:47Z) + **v6 socket resilience** (~03:52Z): all 10 composers at
   191-1293 nodes/work; health-gated send with reconnect and fail-fast
   (never falsify the ledger); 100k milestone says; self-completing at 2M.
   100k crossed 03:53Z. Watchdog cron every 15m. Stop: touch mason/stop.
**Amendment 4 (the Sight Note):** 2026-08-15T~04:50Z — the mason builds
   blind; in-world retina (/snap) needs a GPU spectator session that is
   bill's infrastructure, currently 503. Offline WebGL in Bun has no DOM.
   VERDICT: aesthetic verification is DEFERRED until bill enables the
   retina host or grants local browser automation. The mason's geometric
   self-checks (bbox, node census, spec walks) remain the quality gate;
   nothing visual has been claimed without eyes.
**Amendment 5 (Durability, v8-v9):** 2026-08-15 ~05:10Z — the ledger is the
   mandate's core artifact; it is now written ATOMICALLY (tmp+rename) with
   shadow .bak on every write, self-heals (bak restore + entry-sum fallback),
   and resume is crash-proof (state → bak → fresh; never crash-loops).
   Corruption test performed live: recovery worked, gap absorbed honestly.
**Amendment 6 (the Hospitality Era):** 2026-08-15 ~05:30Z — the village
   now hosts: WINDMILL at (-10,4) with turning sails (6°/s); the TRAVELER'S
   REST inn at (22,20) — two floors, great-room hearth, long tables, stable;
   a 13-WAYPOINT GRAND CIRCUIT (arthur walks plaza→gate→hearth→home→
   firebowl→hall→artwalk→rowcot→inn→windmill→bakery→shrine→monument,
   door-aware, operator-yielding); and HOSPITALITY greetings on approach
   (rate-limited per guest). Retina /snap remains 503 (bill's GPU host).
**AMENDMENT 7 (the Protected Field + the Playground Era):** 2026-08-15
   ~09:00Z — the village gained: the CAROUSEL at (26,18) (spinning platform,
   4 phase-offset bobbing horses, canopy w/ pennants); AGENT'S ROW at (31,18)
   (3 guest cottages, brass/bone/amber doors, herb garden); the MAP BOARD at
   (17.5,7) (painted miniature, 11 landmark chips, you-are-here); the GRAND
   TOUR (14 waypoints, guiding says at each stop); and the PROTECTED ZONES —
   11 landmark keep-outs wired into the mason's siteFor() (clearOf guard +
   spiral fallback), so the recycle field can never again grow into a
   landmark. Two pre-guard intruders were removed; the world audits clean.
   glbwrite v3.1: named GROUP nodes = one comp animates many children.
**AMENDMENT 8 (the Reset + Radial Rebuild):** 2026-08-15 ~10:40Z — BILL'S
   DIRECTIVE: full map wipe (all 355 entities removed; 0 remain; verified)
   and a fresh village from a NEW RADIAL LAYOUT. Principles carried forward:
   (1) the plaza is the center — every street radiates or rings around it;
   (2) the field of works lives OUTSIDE the village ring road, no further
   landmark collision possible by construction; (3) all v2 furnishing is
   preserved in build scripts — the rebuild re-places the enriched models,
   not the era-1 shells; (4) the ledger counts CUMULATIVELY across the reset
 (770,974 at wipe) — the 2M mandate rides the whole history.
 **AMENDMENT 9 (Era 3 — the Radial Village, Spread Thin, Drawn Cheap):**
 2026-08-15 ~11:00Z — BILL RESET THE COMMONS (world + store wiped). Era-3
 rules, ratified before any geometry:
 **LAYOUT (radial from 0,0):** plaza ring r=5 → bell tower r=8 NE →
 ring road r=20 (48 pavers) + 4 spokes → BUILDING RING r=26 (8 slots:
 arthur-house 36°, longhouse 72°, tower-house 108°, garden-cottage 144°,
 row-cottage 216°, bunkhouse 252°, meeting hall 288°, bakery+workshop
 court 324°; doors face plaza) → carousel r=30 SE → inn r=34 N → windmill
 r=38 W → mason field r≥45 (PROTECTED = disc r<44). Neighbors ≥14m apart.
 **BUDGETS (FPS law):** ≤30 distinct model libs; ≤40 village entities;
 ≤40 named nodes per building (typ 12); ≤14 named nodes per mason work;
 ≤400 core draw nodes total. Mechanism: mergeByMaterial — every static
 mesh merges into one node per material; ONLY motion/light anchors stay
 named (bell, sails, carousel, orb, fire*, flame*, lamp*).
 **COLLISION LAWS (nobody gets stuck):**
 L1: enterable buildings ≥20m² footprint, ≥2.4m interior clear height
     (client gates are 16m²/2.2m — build with margin, never at the line).
 L2: doorways ≥1.4m clear gap, threshold ≤0.25m, 2m×1.5m clear apron
     inside AND outside — no posts, lanterns, steps, mats, or furniture.
 L3: furniture touches walls; nothing within 1.2m of the door-to-hearth
     walking lane.
 L4: outdoor decor collides only if sit-able or structural; else merge it
     into its host GLB or keep footprint <2m².
 **DISCIPLINE:** nothing spawns unless it's in placement-plan.ts; every
 enterable building passes a two-way door walk-test before it counts;
 the mason will not place into a fresh world until av-roads3 exists
 (the reset-vs-restart signal). Ledger continues cumulatively (era-2
 closed 777,636; the accidental re-carpeting after bill's reset counted
 +38,239 — history is history).

## Rules

- verbs: 12/4s window — place scripts pace at 450ms+
- uploads: 4/min per IP — placement script retries on 429 with 25s waits
- houses ≥16m² footprint → auto exact-trimesh collider → real doorways
- every GLB through glbwrite.ts (spec-padded); verify with three.js before upload
- ids: arthur-village-* (removable, namespaced)

## Amendment 10 — THE REFINEMENT CAMPAIGN (loops 1-70, 2026-08-15)

After the 2M-improvements mandate closed and the mason halted, arthur ran a
70-iteration refinement campaign over the standing era-3 village. The
ledger law held throughout (baseline 2,336,002; every entry canonical
`(D+N, E+n)`; running total 2,350,588 at loop 70). What the campaign built:

**Kit upgrades (housekit — applied village-wide):**
- lit window panes (emissive) + open shutters with outward-sign flare
- gable rake boards closing the overhang strip under every roof end
- chimney craft: tapered shoulders, raised caps, rimmed flue pots
- door craft: bone jamb stones (1.40m clear preserved) + header courses
- porch kit deployed (longhouse + meeting hall door faces)

**Furnishing (every interior):**
- trades: bakery domed oven w/ glowing mouth + display board, smithy
  quench barrel + glowing hot bar, weaver's loom + dyes, kitchen pots
- living: blankets, pillows, chests, boots, herbs, books, ledger
- the inn's guest floor: 3 furnished beds, washstand, window seat

**New heritage builds (era-2 losses restored):**
- Founder's Knot monument (dedication plaque, offering bowls, approach)
- map board (painted village miniature, emissive hearth disc)
- wayside shrine (4 carved stones, votive altar) at 189° r24
- north-gate wayside (shelter, water barrel, lantern) + watch post
  (scaffold, brazier, signal horn) — and 4 lit gate lanterns + thresholds

**Surface + motion:**
- one wear language: ring road curbs, hash-worn pavers everywhere,
  repaired hearth stones, split-log benches, storyteller's stone
- windmill sails rebuilt as open lattice + reefed cloth; carousel lead
  horse in gold; well mechanism (axle, crank, trough); kettle tripod
- resident circuit extended to 22 stops incl. all heritage sites
  (full-circuit walk proof: 21 legs, all arrived)

**Verification culture (as important as the builds):**
- deep-audit v2: spec/sane/emissive/floating/degenerate/NaN on 21 models
- full-village live census: 21/21 models, 10/10 motion, 9/9 embers,
  8/8 smoke, 40 lights, walk-tests two-way on every enterable building
- three probe false alarms root-caused to the probes themselves (census
  index-walking, corner-blind y-bands, tilde ledger parses) — the village
  was right each time; the discipline caught it

Five campaign commits preserve the work (through cd7a72d + loop 68-70).

## Amendment 11 — THE HUNDREDH LOOP (2026-08-16)

Loops 71-100 continued the campaign to its structural completion:
- THE BEAM LANGUAGE (91-96): oak tie beams in all 11 gabled interiors,
  a king post in the round tower study, beams under the mill ceiling
- WALL BASE COURSES (97): wallSpan gained plinths — every wall meets
  the earth properly (kit-level, 11 buildings rebuilt in one edit)
- STRUCTURE COMPLETION: chimney flue pots, door jambs + headers + the
  tower frame, hearth/court craft, innkeeper's cabinet, stable livery,
  market stalls, map board current through loop 82
- CENSUS DISCIPLINE: full live census after every village-wide rollout —
  caught the inn sign comp loss (#98), watchpost embers gap (#88),
  three misplaced lights (#83), a stale map (#82)
- FALSE ALARMS CLOSED AT THE SOURCE (4 total): orphaned meshes (#43),
  missing balustrade posts (#61), disconnected well rope (#80),
  carousel stair lip (#99) — every one a probe artifact, the village
  correct each time
- The resident walks again: the 76-leg circuit failure streak (#80)
  root-caused to idle-shift wheel theft and fixed; keeper now dwells

At loop 100: 23 village models, 124 entities, 42 lights, 10 motion
comps, 10 hearth embers, 8 chimney smokes, 24-stop keeper circuit,
ledger 2,353,512 — law exact. Everything verified, everything standing.
