# Cabin overhaul — direct Bill commission

Bill: “can you give a total overhaul to the cabins in the village? they're kind of lame”.

## Scope

One bounded redesign of the five central dwellings in `commons-next`: `nx-town-row-cottage`, `nx-town-garden-cottage`, `nx-town-longhouse`, `nx-town-bunkhouse`, and `nx-town-tower-house`. The meeting hall is civic, the inn commercial, outer craft hamlets a separate district; neither is silently included. No old-commons edits, new settlements, terrain, engine deployment, permissions, or commits/pushes.

## Architecture

Replace the dark-box / blank-roof language, not merely append decoration. A coherent northern woodland village: limewashed panels in substantial dark timber frames, a clear stone footing, articulated charcoal/sage roofs with deliberate overlapping courses, exposed verge structure, meaningful windows and generously framed entrances. Quiet warm glazing against cool roofs. Houses have different roof and entry compositions, not five copies or detail noise. Use the village palette families, with wall values lifted toward BONE and stone toward ROCK. Furnished interiors retain their roles (weaver, gardener, communal hearth, four sleepers, scholar).

## Hard contract

- Exact same entity IDs and live poses/yaw/scale; no relocations.
- Baseline live `/geom` and actual served GLB bytes captured before building in `before/`; store keys address pre-optimization uploads, so served SHA may differ after Draco optimization. Record both identities.
- Keep each finished X/Z envelope within its old envelope unless a fresh exact geometry/site preflight proves and explicitly records a safe deviation. No larger floor plate by stealth.
- Entrances >=1.4m clear, >=2.2m headroom; exact-trimesh classifier and two-way entrance/interior tests. Preserve room floor levels, existing furniture and functional anchors or replace them with a documented equivalent.
- Separate artwalk riders/light companions remain untouched; retain their mounting surface and visible approach. Do not bury their artwork in timber braces or windows. One necessary attachment adjustment within this direct cabin-overhaul commission is permitted: garden seed lattice `nx-artwalk-b17-garden-seed-lattice` moves vertically from host-local y=2.08 to y=2.62 (+0.54m), preserving its ID, bytes, X/Z, yaw, scale, and components. The existing low mount conflicts with the required entrance headroom above the preserved 0.13m floor. The garden builder supplies the new same-plane backing at z=1.8; rollout must pin both exact endpoints and verify the final assembly. This does not authorize other rider or settlement relocation.
- Capture/reapply every host component after re-place, and verify companion/rider contracts separately.
- Deterministic double build, exact hash review, day/all-sides/gameplay/night/interior inspection before placement; fetched live served bytes rendered again afterward.
- One serialized uploader, 20s+ upload pacing and 600ms+ verbs, exact-target readback and idempotent rerun. Refuse unknown live drift.
- No unrelated source or foreign index changes. New builders/review/verification files live here; shared housekit/glbwrite/mergekit are consumed, not globally changed.

## Evidence status

Initial old-commons standing gate passed (`ALL PASS`, exit 0). It is not a substitute for focused commons-next cabin checks. Exact five-host before tuple and component contracts and ten protected rider/light companions captured. Dedicated review renderer now loads actual served Draco bytes; all five before sets exist with hash-pinned cameras. New five builds are in visual and actual-browser-collider review; no cabin rollout has executed yet. Ordinary MCPL walks bypass wall collision, so they are presence-route evidence only, not the player entrance gate. Local solo renders are labeled as such and do not claim live-world appearance.
