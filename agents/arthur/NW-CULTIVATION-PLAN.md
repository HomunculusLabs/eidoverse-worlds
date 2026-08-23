# NW CULTIVATION DISTRICT PLAN — nvp-23

Status: `SLOTS_VERIFIED / LANDMARK ARTHUR_REVIEWED_READY / NO WORLD MUTATION`

Canonical verifier: `agents/arthur/next-plan-nw-cultivation.ts`

## District geometry

NW Cultivation contains all 14 inherited cultivation works:

- 5 orchard;
- 5 garden;
- 4 lavender.

The coordinate frame is centered on the NW bisector:

- radial basis `u = (-√½, +√½)`;
- tangent basis `v = (+√½, +√½)`;
- world point `p = r·u + t·v`;
- common yaw `2.35619449rad`, so the inherited works face the core;
- Y is resolved through fresh `heightAt(x,z)` during each later review/place tick;
- scale remains `1` unless a single-work review proves a deliberate change necessary.

This is a planned district, not a copy of the saturated commons sunflower seats.

## Exact source-to-slot map

| Source | Future target id | Theme | World X | World Z | Yaw | Source artifact |
|---|---|---:|---:|---:|---:|---|
| `av-mason-0006` | `nx-cultivation-lavender-0006` | lavender | -74.312106598 | 24.703914550 | 2.35619449 | `work_1686_lavender.glb` |
| `av-mason-0027` | `nx-cultivation-lavender-0027` | lavender | -53.908156468 | 48.164127266 | 2.35619449 | `work_1647_lavender.glb` |
| `av-mason-0040` | `nx-cultivation-lavender-0040` | lavender | -39.582461581 | 62.891966508 | 2.35619449 | `work_1660_lavender.glb` |
| `av-mason-0053` | `nx-cultivation-lavender-0053` | lavender | -24.823800969 | 77.240493873 | 2.35619449 | `work_1673_lavender.glb` |
| `av-mason-0012` | `nx-cultivation-orchard-0012` | orchard | -88.734689257 | 35.796819057 | 2.35619449 | `work_1692_orchard.glb` |
| `av-mason-0020` | `nx-cultivation-orchard-0020` | orchard | -75.254985408 | 43.897796381 | 2.35619449 | `work_1640_orchard.glb` |
| `av-mason-0033` | `nx-cultivation-orchard-0033` | **orchard landmark — REVIEWED_READY** | -61.871843354 | 61.871843354 | 2.35619449 | `village_cultivation_orchard_0033.glb` |
| `av-mason-0046` | `nx-cultivation-orchard-0046` | orchard | -43.207549854 | 82.122368283 | 2.35619449 | `work_1666_orchard.glb` |
| `av-mason-0059` | `nx-cultivation-orchard-0059` | orchard | -30.892702603 | 91.674106690 | 2.35619449 | `work_1679_orchard.glb` |
| `av-mason-0011` | `nx-cultivation-garden-0011` | garden | -85.982440867 | 52.800436926 | 2.35619449 | `work_1691_garden.glb` |
| `av-mason-0019` | `nx-cultivation-garden-0019` | garden | -79.265905789 | 63.548606371 | 2.35619449 | `work_1639_garden.glb` |
| `av-mason-0032` | `nx-cultivation-garden-0032` | garden | -70.874264444 | 72.327571112 | 2.35619449 | `work_1652_garden.glb` |
| `av-mason-0045` | `nx-cultivation-garden-0045` | garden | -61.450591560 | 80.907232857 | 2.35619449 | `work_1665_garden.glb` |
| `av-mason-0058` | `nx-cultivation-garden-0058` | garden | -53.191606276 | 72.783473259 | 2.35619449 | `work_1678_garden.glb` |

These slots were fitted against exact GLB accessor bounds, not nominal theme sizes.

## Verified layout laws

Fresh `next-plan-nw-cultivation.ts` result:

- all 14 sources present in the local retexture manifest;
- all exact full SHA-256 values decoded;
- every center lies in the NW quadrant;
- minimum work inner edge: `66.403942201m` ≥ `66m`;
- maximum work outer corner: `107.963212434m` ≤ `108m`;
- minimum pairwise rotated-SAT gap: `0.653457607m`;
- minimum center-distance-law margin: `0.741193198m`;
- zero pair overlaps;
- common inward-facing yaw retained;
- no `commons-next` mutation.

The layout is deliberately irregular rather than a visible polar grid. Lavender forms the inner soft edge, orchards carry the middle canopy, and low gardens occupy the outer/infill clearings. The core-to-district approach remains centered on the 135° bisector and terminates at the landmark orchard.

## Landmark selection

Selected next subject: `nx-cultivation-orchard-0033`

Source contract:

- source entity: read-only `commons / av-mason-0033`;
- source maker: `agents/arthur/assets/mason.ts`, `composeOrchard`;
- inherited artifact: `agents/arthur/mason/glb-retex/work_1653_orchard.glb`;
- inherited exact SHA-256: `7044745d293cc340c080d18557eebe9e9b26d4a0625cdde01be3d3b134c4c80f`;
- inherited bounds: approximately `14.914 × 4.578 × 14.671m`;
- inherited structure: 4 draw meshes / 5 GLB nodes;
- source live bag: empty;
- planned target id is absent from `commons-next`;
- proposed X/Z/yaw/scale: `[-61.871843354, heightAt, 61.871843354] / 2.35619449 / 1`.

### Selection rationale

Five orchard candidates were rendered at aerial and 18m gameplay distance. Ranking:

1. `av-mason-0033` — strongest central depth and most coherent canopy rhythm;
2. `av-mason-0012` — tall and visible but visually busier at the front edge;
3. `av-mason-0046` — clear silhouette but weaker central organization;
4. `av-mason-0059` — coherent low canopy, less landmark authority;
5. `av-mason-0020` — broad uniform roofline, weakest depth cue.

Evidence: `agents/arthur/reviews/nw-cultivation-selection/orchard-candidates.jpg`.

### One defect reserved for the single-model REVIEW tick

At 18m, the selected inherited orchard read too much like a generic grove: the quincunx rows were occluded by a continuous canopy and there was no unmistakable human-scale arrival aisle. `nvp-24` repaired exactly that defect with a 30-tree six-column orchard, 1.65m full-depth soil aisle and 2.18m threshold. The first lintel failed the avatar head band and was raised to a 2.30m underside before acceptance. Final exact hash: `a3bb3487b355bf2dabc699aee3f16c234a11ac97d980e87d79143f3a91df30a7`.

## Next state

`nx-cultivation-orchard-0033: ARTHUR_REVIEWED_READY → next wakeup PLACE`

No other cultivation work may be reviewed or placed behind it.
