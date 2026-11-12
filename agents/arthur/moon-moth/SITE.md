# Moon Moth siting — SPATIAL_PASS, no mutation

**Use `site-contract.json` unchanged:**
- `nx-moonmoth-001`, world `commons-next`.
- **pos `[-90,0.0008015504140560737,13]`, yaw `Math.PI/2`, scale1.**
- GroundY `0.0008015504140560737`; verified clearance cylinder **radius6.8m**.
- GLB SHA `df959099a243ef27945380da52591cc3a7a0f34cc5ecc378abb0cc461498e519`.

**Directions:** west from the plaza, past the windmill; the launch clearing is 13m on the +Z side of the west axis, beside the screw-well and outside the lavender beds. Direct plaza distance90.934m. Model +Z faces east toward town. Coordinate signs are authoritative; older district prose uses inconsistent compass dialects. No player walk/visibility claim—the windmill may hide the parked moth from spawn.

## Verified evidence

At **2026-09-08T00:43:28.667Z**, fresh matching before/after census: **295 entities (257 models, 38 non-geometric lights)**. The new sibling `nx-struct-fifthbench` was included. Nine motion-bearing entities were decoded from their live served GLBs and re-fetched with exact served-byte hashes unchanged.

| Check | Result |
|---|---|
| Perch/lift cylinder | Clear at all elevations |
| Nearest edge gap: screw-well, moving screw included | **2.623m** |
| Lavender / millrace edge gaps | **2.644m / 3.811m** |
| Nearest >=7m-high structure, windmill | **38.409m** beyond cylinder edge |
| Perch envelope ring | **r84.134..97.734** |
| Cardinal walking-axis clearance | **6.2m**, against extra3m reserve |
| Terrain, 178 samples | **−0.007183..+0.012607m**, spread **19.79mm** |
| Actual cruise root range | x[-90,-78], z[7,19], cruise Y22.00080155 |
| Cruise rectangle inflated6.8m, full ring range | **r71.513..98.784** |
| Cruise vertical gap above highest padded scene geometry | **8.663m**, above northneedle top13.338m |

The checker imports **`rootFlightBounds` from the actual flight contract**. It certifies the east-offset circuit, not a fictitious perch-centered orbit or vertical-only flight. Dock ascent/descent stays in the clear cylinder; the elevated circuit clears the entire scene vertically. `flight.js` parity with that contract remains the parent's separate gate.

## Geometry and laws

Sources: `AGENTS.md`, `INTERLANE-PROTOCOL.md`, **CITY-PLAN bands and standing laws1/3/4**, `client/lib/motion.js` part-local transforms, `server/geometry.ts` local-frame bbox semantics. Entire perch and flight envelopes remain inside district **r70..100**. No processional, closed-ring, or outside-rim exception is assumed.

Signed circle–OBB distance uses local min/max center, scale, then correct yaw transform. Every modeled ground film, road, path, network, host and rider remains in the collision set; only explicit non-geometric lights are omitted. Neighbor bbox faces get2mm padding. For animated neighbors, decoded node-hierarchy motion bounds are unioned with census boxes.

Final wings use the delivered **±0.22-radian, damp0** contract. Finite angular extrema are analytic, not time-sampled or misread as full360 rotation. The conservative hierarchical per-vertex enclosure has radius **6.751776m**, so **6.8m** passes. This enclosure may overstate the reviewer's exact correlated-vertex6.5m radius; **it is not evidence the actual moth exceeds6.5m**. No tighter proof is needed at this site. Articulated minY0.01288281 clears sampled terrain at the selected PY.

Terrain uses the proven object-form `WorldAgent` constructor. Runtime credentials are never printed. Readiness is checked explicitly: `heightAt` fallback-zero is not accepted. A short ephemeral presence join occurs; **no verbs, uploads, or object mutations**. The existing heightAt implementation ignores authored terrain layers; modeled films/networks are separately avoided. Terrain sampling is not a continuous-surface or locomotion proof.

## Parent integration

```ts
import { preflight } from './site-preflight.ts';
import contract from './site-contract.json';
const evidence = await preflight(contract); // fresh, immediately before upload
```

```sh
bun agents/arthur/moon-moth/site-preflight.ts --self-test
bun agents/arthur/moon-moth/site-preflight.ts --check agents/arthur/moon-moth/site-contract.json
```

**NEW-only remains fail-closed:** an existing target always throws. Parent's idempotent path must verify the exact existing target independently and skip this new-placement preflight only after that verification. No target filtering or ownership widening was added.

Missing/malformed geometry, incomplete census, target existence, unsupported motion, network/terrain failure, inadequate gap, source/byte drift, or scene changes during a run refuse success. Model SHA, full input contract SHA, flight-contract source SHA, and before/after live state bind each PASS. Do not cache across placement. `--site` exits2 provisionally; `--search` is discovery only. Existing physics startup output can precede CLI JSON; importing the returned object avoids stdout parsing ambiguity.

Parent still gates: exact visual/model contract agreement; `flight.js` path parity; final wing/socket/avatar/dismount fits. The successful input explicitly assumes rider envelope `[-1,0,-1]..[1,5,1]`—not a measured avatar proof. Also verify optimized/rendered bytes after upload and exact live tuple/components after placement. `/library/store/<original-hash>.glb` may serve optimized bytes with a different SHA (`server/optimize.ts:9..12`, `server/routes.ts:601..607`); the checker binds actual served bytes separately.

**Authored files only:** `site-preflight.ts`, `SITE.md`, and parent-requested exact `site-contract.json`. No uploads, verbs, live-object edits, commits, or unrelated repository edits.
