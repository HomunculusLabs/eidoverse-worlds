import os

block = """
## struct-211 (2026-09-17): ARBELOS PLACEMENT TICK — committed carry from
## struct-210 executed (nx-struct-arbelos v1 PLACED_VERIFIED live at the
## next on-line Math Avenue step az94/r390; 10.0m rhythm held)

211%3=1 placement slot per the 178..210 alternation (struct-210 banked
arbelos with "placement = struct-211 carry"). Gate ALL PASS real exit 0
tick-start at 8999706c (vocab-32) + RE-RUN clean immediately before the
mutation at the SAME HEAD (epoch law held, no sibling commit landed
mid-tick). Shard state: IMPROVE-PLAN carries 0 OPEN nx-struct rows (same
drained state as struct-204..210).

Local bytes re-verified sha256
1a0b3967a47bfa560376c0c6b05e8b3e67bd2bd44f4a4ff61694e03fad6bb2ed ==
struct-210 v1 bank pin BEFORE upload (shasum -a 256, 206,040 B, mtime
Sep 17 14:55); struct210-decode re-run this tick ALL PASS 9/9 (D1 4
nodes; D3 blade 3072/3072 in band 100.0% + 123/123 voussoirs; D4 sole
rod + pins [131,131,99]; D5 twins 1078/1142 exact tori + 185 ruler;
D6 bead centroid == D within 5mm emissiveFactor present; D7 keel toe ==
curb top - 8cm exact; D8 envelope 6.300x3.029x0.900 origin-centered
drift 0.00mm; D9 texMats ab_stone/ab_iron/ab_brass).

SEAT (struct211-scan + struct211-select, fresh 346 census — unchanged
from struct-210's placement-era 346): avenue axis re-derived FRESH =
91.0 deg (20 deg density window, 41 forms; 45 math-family structs
standing). Procession read complete — gyroid240 -> enneper250 -> ... ->
mandelbrot360 -> viviani370 -> morley380 (~10m steps, all az94.0). 597
lawful band candidates r382-410; the arbelos takes the NEXT ON-LINE
STEP: az94.0 r390.0, 10.0m step == the procession rhythm. NN 10.00 vs
nx-struct-morley (law 8.0), SAT 6.19 vs nx-struct-morley at FINAL yaw
(law 1.4).

YAW LAW (struct-104 oblique-read, struct-210 carry contract):
3.735004599267865 (214deg, exhaustive 0.5 deg band scan maximizing SAT)
puts the +Z face normal at az304 — 30 deg off the az274 anti-travel
sightline, east lean (the procession's standing convention, now
melencolia/fourier/cissoid/quadratrix/archispiral/nephroid/folium/
rhodonea/versiera/elliptic/mandelbrot/viviani/morley/arbelos). The
outbound walker reads the construction face obliquely on approach; the
6.300m curb runs az124/304, the blade plane faces the walker.

TERRAIN (struct211-terrain-arbelos.ts): 9pt over the TRUE rotated
footprint (literal corners of the 6.300x0.900 curb rectangle): spread
15.2mm (mild outbound-slope tilt on the far procession, disclosed — the
8cm cradle embed class absorbs it, same as morley's 7.0mm), PY =
-0.022859.

PLACEMENT (next-place-struct211.ts, struct209 fresh-spawn chassis): hash
gate green; entity ABSENT on fresh 346 census; SAT/NN preflight re-run
at FINAL pose vs same fresh set (symmetric footprint 2.86x2.13 at yaw
214): NN floor morley 10.00, SAT worst morley 6.19 — clean. 1 upload
(content-addressed store/1a0b3967a47bfa56.glb) + 1 paced spawn over one
WS join; PLACED_VERIFIED exact tuple + yaw + scale 1 + lib + comp {} on
fresh re-read; census 346 -> 347 exactly. Idempotent rerun:
ALREADY_SEATED, zero verbs. Folly class (5.67 sqm curb footprint, h
3.03 real trimesh) — no walk owed. Comp bag empty by contract (sole
night bead emissive-in-GLB glow KEEP — no comp-wipe class on first
spawn).

Native debt board after this tick: arbelos v1 stays OWED (fallback-judged
acceptance from struct-210, disclosed; probe L1-L5 theorems 4.44e-16 /
4e-9 + decode D3-D6 are the binding evidence); plus monkeysaddle gate,
hypar row 22, kuen v3, catalan v1, clebsch v1, menger v2, apollonian v1,
melencolia v3, tribar v2, fourier v1, cissoid v2, quadratrix v1,
archispiral v1, nephroid v1, folium v1, rhodonea v1, versiera v1,
elliptic v3, mandelbrot v1, viviani v1, morley v1 — 22 owed.

Bill eye-check pointer: on Math Avenue past the trisector heart — a long
stone curb carrying the shoemaker's blade: a stepped blade-shaped plate
whose two lower scoops open to the sky, two brass rings seated in the
blade's face each kissing the top arc, its scoop, and the vertical brass
line between them, an iron datum rod along the curb. Archimedes' Book of
Lemmas: the twin circles, and the construction line whose height is the
geometric mean of the lobes. After dark: one warm bead burns where the
line meets the sky-arc.

Files: struct211-scan-arbelos.ts + struct211-select-arbelos.ts +
struct211-terrain-arbelos.ts + next-place-struct211.ts (all NEW, tracked),
STRUCTURES-PLAN.md (this block), IMPROVEMENTS.md (one append struct-211,
D+1 E+1). One upload + one verb total (shared budget). Zero pushes.
"""

path = "agents/arthur/STRUCTURES-PLAN.md"
with open(path, "a") as f:
    f.write(block)
data = open(path).read()
print("struct-211 blocks:", data.count("## struct-211 (2026-09-17)"))
print("size:", os.path.getsize(path))
print("tail check:", data[-60:].replace("\n", " | "))
