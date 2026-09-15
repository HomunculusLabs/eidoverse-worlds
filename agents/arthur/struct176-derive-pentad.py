#!/usr/bin/env python3
# struct176-derive-pentad.py — THE 12 PENTAD LINES OF THE CLEBSCH DIAGONAL
# CUBIC, derived from first principles (struct-176 lineage tool).
#
# WHY THIS EXISTS: the explicit 27-line table in Wikipedia "Clebsch surface"
# (citing Masson 2017, analyticphysics.com — fetched this tick, both checked)
# carries CORRUPT entries in rows 16-27 (the pentad family): against the
# Schläfli incidence law (every line meets exactly 10 others; 135 meeting
# pairs total) the table yields only 118-126 pairs with impossible degrees
# (rows 16/17 of that table meet just 1 line each). Rows 1-15 (the Schur
# rational family) verify EXACTLY (on-surface residual 3.4e-11, and Masson's
# own page confirms them verbatim).
#
# DERIVATION (this script, self-contained): the 12 remaining lines are the
# S5-orbit join construction in P^4: P = (1:zeta:zeta^2:zeta^3:zeta^4) with
# zeta = e^(2*pi*i/5); P lies on x0+..+x4 = 0 and x0^3+..+x4^3 = 0 (power
# sums of the 5th roots of unity vanish), so the JOIN of P with its complex
# conjugate is a REAL projective line on the surface — span_R{Re P, Im P}.
# The S5 permutation orbit gives 24 projective points = 12 conjugate pairs
# = the 12 real lines (Wikipedia states exactly this: "the 12 images of the
# line through (1:zeta:...:zeta^4) and its complex conjugate").
# Affine chart via Masson's linear y-expressions (M w = Y inverted by least
# squares; residual 1.6e-15), normalized w4 = 1.
#
# VERIFICATION IN-SCRIPT (fail-closed, exit 1 on any failure):
#   - 24 projective orbit points, 12 distinct real spans
#   - all 12 derived lines lie ON the affine surface (sampled, < 1e-6)
#   - with rows 1-15: exactly 135 coplanar pairs, every line meets exactly 10
#   - finite triple points: exactly 7 (the visible Eckardt points); the
#     remaining 3 Eckardt points sit AT INFINITY on the 3 parallel classes
#     of 3 lines (9 parallel pairs) — 7 + 3 = 10, the S5 orbit of
#     (1:-1:0:0:0), C(5,2) = 10.
#
# OUTPUT: the 12 lines as z=0-based double constants (%.17g, round-trip
# exact) for the TypeScript probe/build. The constants are then verified
# EVERY RUN by the TS probe (on-surface + incidence), so float provenance is
# self-checking — no exact-arithmetic port required.
import itertools
import math
import sys

import numpy as np

fails = 0


def check(name, ok, detail=""):
    global fails
    print(f"{'PASS' if ok else 'FAIL'} {name} — {detail}")
    if not ok:
        fails += 1


zeta = complex(math.cos(2 * math.pi / 5), math.sin(2 * math.pi / 5))
P = [zeta ** k for k in range(5)]
M = [[9, -3, -3, -1], [-3, 9, -3, -1], [-3, -3, 9, -1], [-6, -6, -6, 2], [3, 3, 3, 1]]
for row in M:
    row[:] = [v / 12 for v in row]


def F(x, y, z):
    return (81 * (x ** 3 + y ** 3 + z ** 3)
            - 189 * (x * x * (y + z) + y * y * (z + x) + z * z * (x + y))
            + 54 * x * y * z + 126 * (x * y + y * z + z * x)
            - 9 * (x * x + y * y + z * z) - 9 * (x + y + z) + 1)


# 24 projective orbit points (permutations modulo projective scaling)
pts = []
for sigma in itertools.permutations(range(5)):
    q = [P[sigma[k]] for k in range(5)]
    dup = False
    for r in pts:
        cs = [q[k] / r[k] for k in range(5) if abs(r[k]) > 1e-12]
        if cs and all(abs(c - cs[0]) < 1e-9 for c in cs):
            dup = True
            break
    if not dup:
        pts.append(q)
check("24 projective orbit points", len(pts) == 24, f"{len(pts)}")


def same_span(b1, d1, b2, d2):
    return np.linalg.matrix_rank(np.array([b1, d1, b2, d2]), tol=1e-9) == 2


lines5 = []
for p in pts:
    b = [x.real for x in p]
    d = [x.imag for x in p]
    if any(same_span(B, D, b, d) for B, D in lines5):
        continue
    lines5.append((b, d))
check("12 distinct real spans", len(lines5) == 12, f"{len(lines5)}")

A = np.array(M)
aff = []
worst_resid = 0.0
for b, d in lines5:
    w0, *_ = np.linalg.lstsq(A, np.array(b, dtype=float), rcond=None)
    w1, *_ = np.linalg.lstsq(A, np.array([b[k] + d[k] for k in range(5)]), rcond=None)
    worst_resid = max(worst_resid, float(np.linalg.norm(A @ w0 - b)), float(np.linalg.norm(A @ w1 - np.array([b[k] + d[k] for k in range(5)]))))
    p0 = [w0[k] / w0[3] for k in range(3)]
    p1 = [w1[k] / w1[3] for k in range(3)]
    aff.append((p0, [p1[k] - p0[k] for k in range(3)]))
check("affine map residual", worst_resid < 1e-12, f"worst {worst_resid:.2e}")

worst = 0.0
for p0, dv in aff:
    for t in (-1.5, -0.7, -0.2, 0.0, 0.3, 0.9, 1.6, 2.4):
        worst = max(worst, abs(F(p0[0] + dv[0] * t, p0[1] + dv[1] * t, p0[2] + dv[2] * t)))
check("12 derived lines on-surface", worst < 1e-6, f"worst {worst:.2e}")

# full 27 with the verified Schur rows 1-15
S = [(1, -1, 0, 0, 0, -1 / 3), (1, 0, -1, 0, -1 / 3, 0), (0, 1, -1, -1 / 3, 0, 0),
     (1, -1, 0, 1 / 6, 1 / 6, 0), (1, -1, 0, 1 / 3, 1 / 3, 1 / 3), (1, 0, -1, 1 / 6, 0, 1 / 6),
     (1, 0, -1, 1 / 3, 1 / 3, 1 / 3), (0, 1, -1, 0, 1 / 6, 1 / 6), (0, 1, -1, 1 / 3, 1 / 3, 1 / 3),
     (3, 0, 1, 1 / 6, 0, 1 / 6), (3, 1, 0, 1 / 6, 1 / 6, 0), (0, 3, 1, 0, 1 / 6, 1 / 6),
     (1, 3, 0, 1 / 6, 1 / 6, 0), (0, 1, 3, 0, 1 / 6, 1 / 6), (1, 0, 3, 1 / 6, 0, 1 / 6)]
L = [(tuple(s[3:]), tuple(s[:3])) for s in S] + [(tuple(p), tuple(d)) for p, d in aff]


def coplanar(i, j):
    b1, d1 = L[i]
    b2, d2 = L[j]
    w = [b2[k] - b1[k] for k in range(3)]
    # t = ((w x d2) . (d1 x d2)) / |d1 x d2|^2 — operand order matters:
    # (d2 x w) flips the sign and mirrors every meeting point (caught by
    # hand-check: rows 10,12 meet at (0,0,1/9), not (1/3,0,2/9))
    cx = [w[1] * d2[2] - w[2] * d2[1], w[2] * d2[0] - w[0] * d2[2], w[0] * d2[1] - w[1] * d2[0]]
    tp = d1[0] * cx[0] + d1[1] * cx[1] + d1[2] * cx[2]
    sc = math.hypot(*d1) * math.hypot(*d2) * (math.hypot(*w) if math.hypot(*w) > 1e-12 else 1.0)
    return sc > 0 and abs(tp) / sc < 1e-9


def parallel(i, j):
    d1 = L[i][1]
    d2 = L[j][1]
    cx = [d1[1] * d2[2] - d1[2] * d2[1], d1[2] * d2[0] - d1[0] * d2[2], d1[0] * d2[1] - d1[1] * d2[0]]
    return math.hypot(*cx) < 1e-9


pairs = [(i, j) for i in range(27) for j in range(i + 1, 27) if coplanar(i, j)]
deg = {i: 0 for i in range(27)}
for i, j in pairs:
    deg[i] += 1
    deg[j] += 1
check("135 meeting pairs (Schläfli)", len(pairs) == 135, f"{len(pairs)}")
check("every line meets exactly 10", all(v == 10 for v in deg.values()), f"degrees {sorted(set(deg.values()))}")

# finite triple points (tolerance 1e-9; at-infinity triples ride parallel classes)
clusters = []
for i, j in pairs:
    if parallel(i, j):
        continue  # meets at infinity — counted separately
    b1, d1 = L[i]
    b2, d2 = L[j]
    w = [b2[k] - b1[k] for k in range(3)]
    cx = [w[1] * d2[2] - w[2] * d2[1], w[2] * d2[0] - w[0] * d2[2], w[0] * d2[1] - w[1] * d2[0]]
    cxx = [d1[1] * d2[2] - d1[2] * d2[1], d1[2] * d2[0] - d1[0] * d2[2], d1[0] * d2[1] - d1[1] * d2[0]]
    n2 = sum(v * v for v in cxx)
    if n2 < 1e-24:
        continue
    t = sum(cx[k] * cxx[k] for k in range(3)) / n2
    m = [b1[k] + d1[k] * t for k in range(3)]
    hit = None
    for c in clusters:
        if math.hypot(*(m[k] - c[0][k] for k in range(3))) < 1e-9:
            hit = c
            break
    if hit:
        for li in (i, j):
            if li not in hit[1]:
                hit[1].append(li)
    else:
        clusters.append((m, [i, j]))
tri = [c for c in clusters if len(c[1]) >= 3]
check("7 finite Eckardt triples, all exactly 3", len(tri) == 7 and all(len(c[1]) == 3 for c in tri),
      f"{len(tri)} triples, sizes {sorted(len(c[1]) for c in tri)}")

par_pairs = [(i, j) for i, j in pairs if parallel(i, j)]
par_classes = []
for i, j in par_pairs:
    hit = [c for c in par_classes if i in c or j in c]
    if hit:
        merged = set(hit[0]) | {i, j}
        for c in hit[1:]:
            merged |= set(c)
        par_classes = [c for c in par_classes if c not in hit]
        par_classes.append(sorted(merged))
    else:
        par_classes.append([i, j])
check("3 at-infinity Eckardt classes (parallel, exactly 3 lines each)",
      len(par_classes) == 3 and all(len(c) == 3 for c in par_classes),
      f"{len(par_classes)} classes sizes {[len(c) for c in par_classes]}")

if tri:
    max_eck = max(abs(v) for c in tri for v in c[0])
    print(f"INFO finite Eckardt max |coord| {max_eck:.6f}")

print("--- TS constants (z=0 base, dir z=1; %.17g round-trip):")
for p0, dv in aff:
    assert abs(dv[2]) > 1e-12
    t0 = -p0[2] / dv[2]
    b = [p0[k] + dv[k] * t0 for k in range(3)]
    d = [dv[k] / dv[2] for k in range(3)]
    print(f"    [{d[0]:.17g}, {d[1]:.17g}, 1, {b[0]:.17g}, {b[1]:.17g}, 0],")

print("ALL CHECKS PASS" if fails == 0 else f"{fails} FAILS")
sys.exit(0 if fails == 0 else 1)
