// struct176-probe-clebsch.ts — R11-10 THE CLEBSCH DIAGONAL CUBIC (struct-176,
// build+judge tick). Machine checks BEFORE any mesh. Fail-closed: any FAIL
// exits 1, no build.
//
// LINEAGE (secured per the kuen/catalan law — Wikipedia wikitext
// "Clebsch surface" fetched this tick, quoting the affine equation and the
// EXPLICIT 27-line table citing Masson, P. "27 Lines on a Cubic Surface",
// analyticphysics.com 2017; class cross-check: Clebsch 1871 / Klein 1873,
// "Klein's icosahedral cubic", all 27 exceptional lines real, S5 order 120,
// 10 Eckardt points):
//   81(x^3+y^3+z^3) - 189(x^2(y+z)+y^2(z+x)+z^2(x+y)) + 54xyz
//   + 126(xy+yz+zx) - 9(x^2+y^2+z^2) - 9(x+y+z) + 1 = 0        (affine chart)
//   27 lines: (a,b,c)t + (p,q,r), rows 1..27 of the wikitext table.
//
// CLAIMED LAWS (each machine-checked below):
//   LINES LAW     all 27 rows lie EXACTLY on the surface (81 pts each).
//   COUNT LAW     exactly 27 DISTINCT lines (no duplicate rows).
//   ECKARDT LAW   exactly 10 points where exactly 3 lines concur (found by
//                 dense on-line sampling + clustering — no fragile pairwise
//                 line-intersection solver).
//   S3 LAW        the affine equation is invariant under coordinate
//                 permutations (the visible symmetry of the mounted form).
//   UNBOUNDED LAW the real locus escapes any box (odd-degree curve at
//                 infinity has real points) — measured, and it decides the
//                 presentation: BOX-CUT CELL (gyroid class), never "whole".
//   CORE LAW      the cut half-size B is DERIVED: smallest 0.05 step with
//                 every Eckardt point >= 0.30 inside the box.
//   INTERVAL LAW  every one of the 27 lines crosses the box (nonempty exact
//                 t-interval) — the brass lace is complete by construction.
//   FACE LAW      on all six faces at B the restricted curve has real points
//                 (the rim hems are real curves, gyroid hem law).
//
// HONEST PRESENTATION CLAIM (guards the false-claim class): the surface is
// NOT presented whole — it cannot be (unbounded). One clean-cut cell of the
// continuum, hemmed on the true face curves, gyroid precedent (struct-131).
let fails = 0;
const check = (name: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails++;
};

const R5 = Math.sqrt(5);
// the affine equation, VERBATIM from the wikitext
const F = (x: number, y: number, z: number) =>
    81 * (x ** 3 + y ** 3 + z ** 3)
    - 189 * (x * x * (y + z) + y * y * (z + x) + z * z * (x + y))
    + 54 * x * y * z
    + 126 * (x * y + y * z + z * x)
    - 9 * (x * x + y * y + z * z)
    - 9 * (x + y + z)
    + 1;

// the 27 lines. Rows 1-15 (Schur rational family): VERBATIM from the
// wikitext/Masson table — verified exact. Rows 16-27 (pentad family):
// DERIVED from first principles by struct176-derive-pentad.py (S5 orbit
// join construction in P^4) because BOTH published tables carry corrupt
// entries (against the Schlaefli incidence law they yield 118-126 pairs
// with impossible degrees; the derivation closes the theory EXACTLY:
// 135 pairs, every line meeting exactly 10, 7 finite + 3 at-infinity
// Eckardt triples). Constants are %.17g round-trip doubles; re-verified
// on-surface + incidence below at every run.
const L: Array<[number, number, number, number, number, number]> = [
    [1, -1, 0, 0, 0, -1 / 3], [1, 0, -1, 0, -1 / 3, 0], [0, 1, -1, -1 / 3, 0, 0],
    [1, -1, 0, 1 / 6, 1 / 6, 0], [1, -1, 0, 1 / 3, 1 / 3, 1 / 3], [1, 0, -1, 1 / 6, 0, 1 / 6],
    [1, 0, -1, 1 / 3, 1 / 3, 1 / 3], [0, 1, -1, 0, 1 / 6, 1 / 6], [0, 1, -1, 1 / 3, 1 / 3, 1 / 3],
    [3, 0, 1, 1 / 6, 0, 1 / 6], [3, 1, 0, 1 / 6, 1 / 6, 0], [0, 3, 1, 0, 1 / 6, 1 / 6],
    [1, 3, 0, 1 / 6, 1 / 6, 0], [0, 1, 3, 0, 1 / 6, 1 / 6], [1, 0, 3, 1 / 6, 0, 1 / 6],
    [-2.9270509831248424, -1.309016994374947, 1, 0.26967233145831537, 0.06366100187501722, 0],
    [-0.34164078649987317, 0.44721359549995848, 1, 0.092131067416673595, -0.056940131083312362, 0],
    [-5.2360679774997942, -2.2360679774997902, 1, 2.2847006554165641, 0.87267799624996556, 0],
    [-2.2360679774998027, -5.2360679774998209, 1, 0.87267799624997078, 2.2847006554165761, 0],
    [0.44721359549995787, -0.341640786499875, 1, -0.056940131083312299, 0.092131067416673817, 0],
    [-1.3090169943749466, -2.9270509831248419, 1, 0.063661001875017484, 0.26967233145831593, 0],
    [2.2360679774997889, -0.76393202250020908, 1, 0.12732200375003533, 0.048632677916771838, 0],
    [-0.76393202250020931, 2.2360679774997876, 1, 0.04863267791677181, 0.12732200375003511, 0],
    [-0.19098300562505233, 0.42705098312484241, 1, 0.43633899812498256, -0.10300566479164892, 0],
    [-0.44721359549995643, 2.3416407864998736, 1, 0.39027346441664584, 0.24120226591665964, 0],
    [0.42705098312484258, -0.19098300562505305, 1, -0.10300566479164933, 0.43633899812498295, 0],
    [2.3416407864998736, -0.44721359549995754, 1, 0.24120226591666016, 0.39027346441664579, 0],
];
if (L.length !== 27) { console.log("FAIL table arity"); fails++; }

const P = (i: number, t: number): [number, number, number] =>
    [L[i][0] * t + L[i][3], L[i][1] * t + L[i][4], L[i][2] * t + L[i][5]];

// lines through a point (cross-product test, exact for table lines)
const through = (pt: [number, number, number]): number[] => {
    const out: number[] = [];
    for (let i = 0; i < 27; i++) {
        const [a, b, c, p, q, r] = L[i];
        const ux = pt[0] - p, uy = pt[1] - q, uz = pt[2] - r;
        const cx = uy * c - uz * b, cy = uz * a - ux * c, cz = ux * b - uy * a;
        if (Math.hypot(cx, cy, cz) < 1e-6 * Math.hypot(ux, uy, uz)) out.push(i);
    }
    return out;
};

// C0 vacuity control — a perturbed equation (81 -> 82) must BREAK the
// line-on-surface law (a checker that cannot fail proves nothing).
{
    const Fw = (x: number, y: number, z: number) =>
        82 * (x ** 3 + y ** 3 + z ** 3)
        - 189 * (x * x * (y + z) + y * y * (z + x) + z * z * (x + y))
        + 54 * x * y * z + 126 * (x * y + y * z + z * x)
        - 9 * (x * x + y * y + z * z) - 9 * (x + y + z) + 1;
    let broke = 0;
    for (const i of [0, 4, 17]) for (const t of [-1.0, 0.3, 1.7]) {
        const [x, y, z] = P(i, t);
        if (Math.abs(Fw(x, y, z)) > 1e-6) broke++;
    }
    check("C0 vacuity control (perturbed equation breaks line law)", broke === 9, `${broke}/9 probes broke`);
}

// C1 LINES LAW — all 27 rows lie exactly on the surface
{
    let worst = 0;
    for (let i = 0; i < 27; i++) for (let k = 0; k < 81; k++) {
        const t = -2 + (4 * k) / 80;
        const [x, y, z] = P(i, t);
        worst = Math.max(worst, Math.abs(F(x, y, z)));
    }
    check("C1 lines law (27x81 pts on surface)", worst < 1e-7, `worst residual ${worst.toExponential(2)}`);
}

// C2 COUNT LAW — 27 distinct LINES. RED-fix v3: base-on-line alone detects
// MEETINGS (18 flags were real concurrences, e.g. row 1's base sits on lines
// 14+15 — an Eckardt triple), not identity. Identity = PARALLEL (cross of
// directions vanishes) AND base on line.
{
    let dup = 0;
    for (let i = 0; i < 27; i++) for (let j = 0; j < 27; j++) {
        if (i === j) continue;
        const [a1, b1, c1] = [L[i][0], L[i][1], L[i][2]], [a2, b2, c2] = [L[j][0], L[j][1], L[j][2]];
        const px = b1 * c2 - c1 * b2, py = c1 * a2 - a1 * c2, pz = a1 * b2 - b1 * a2;
        if (Math.hypot(px, py, pz) > 1e-9) continue;          // not parallel — a meeting, not a dup
        const [a, b, c, p, q, r] = L[i];
        const ux = L[j][3] - p, uy = L[j][4] - q, uz = L[j][5] - r;
        const cx = uy * c - uz * b, cy = uz * a - ux * c, cz = ux * b - uy * a;
        if (Math.hypot(cx, cy, cz) < 1e-7 * Math.hypot(ux, uy, uz)) dup++;
    }
    check("C2 count law (27 distinct lines by identity)", dup === 0, `${dup} duplicate identities`);
}

// C3 ECKARDT LAW — exactly 7 FINITE triple points (each exactly 3 lines)
// plus exactly 3 at-infinity triples (parallel classes of 3) = 10 total,
// the S5 orbit of (1:-1:0:0:0), C(5,2) = 10 (Klein/Hirzebruch theory;
// derive tool output). RED-fix lineage: shared-t solve (wrong), 2x2 normals
// (ill-conditioned), triple-product coplanarity (right test), tolerance
// 1e-9 -> 1e-12 (near-parallel pairs need the tight threshold), meeting
// point numerator (w x d2) not (d2 x w) — sign flip mirrors points.
const concurrent: Array<{ p: [number, number, number]; lines: number[] }> = [];
{
    const meets: Array<{ p: [number, number, number]; pair: [number, number] }> = [];
    let parallelTriples = 0;
    for (let i = 0; i < 27; i++) for (let j = i + 1; j < 27; j++) {
        const d1 = [L[i][0], L[i][1], L[i][2]], d2 = [L[j][0], L[j][1], L[j][2]];
        const cross = (u: number[], v: number[]) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
        const dot = (u: number[], v: number[]) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
        const d1xd2 = cross(d1, d2), n2 = dot(d1xd2, d1xd2);
        if (n2 < 1e-12) continue;                              // parallel class (at-infinity meetings)
        const w = [L[j][3] - L[i][3], L[j][4] - L[i][4], L[j][5] - L[i][5]];
        const tp = dot(d1, cross(d2, w));                     // coplanarity (signed volume x6)
        if (Math.abs(tp) > 1e-12 * Math.sqrt(n2) * Math.hypot(...w)) continue;  // skew
        const t = dot(cross(w, d2), d1xd2) / n2;              // meeting point on line i
        meets.push({ p: [L[i][0] * t + L[i][3], L[i][1] * t + L[i][4], L[i][2] * t + L[i][5]], pair: [i, j] });
    }
    for (const m of meets) {
        const hit = concurrent.find((c) => Math.hypot(c.p[0] - m.p[0], c.p[1] - m.p[1], c.p[2] - m.p[2]) < 1e-9);
        if (hit) {
            for (const li of m.pair) if (!hit.lines.includes(li)) hit.lines.push(li);
        } else concurrent.push({ p: m.p, lines: [...m.pair] });
    }
    // at-infinity triples: parallel classes of exactly 3 lines
    {
        const classes = new Map<string, number[]>();
        for (let i = 0; i < 27; i++) {
            const d = [L[i][0], L[i][1], L[i][2]];
            const n = Math.hypot(...d);
            const key = d.map((v) => (v / n).toFixed(9)).join(",");
            classes.set(key, [...(classes.get(key) ?? []), i]);
        }
        for (const members of classes.values()) if (members.length === 3) parallelTriples++;
    }
    const triple = concurrent.filter((c) => c.lines.length >= 3);
    const sizes = new Set(triple.map((c) => c.lines.length));
    check("C3 Eckardt law (7 finite + 3 at-infinity triples)", triple.length === 7 && sizes.size === 1 && sizes.has(3) && parallelTriples === 3,
        `${triple.length} finite (all exactly-3), ${parallelTriples} parallel classes of 3 = 10 total`);
}

// C10 SCHLAFLI CENSUS — every line meets exactly 10 others; 135 meeting
// pairs. THE law that exposed both published tables as corrupt (they yield
// 118-126 pairs, degrees 1..12). With the derived pentad rows the census
// must close exactly.
{
    let pairs = 0;
    const deg = new Array(27).fill(0);
    const cross = (u: number[], v: number[]) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const dot = (u: number[], v: number[]) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    for (let i = 0; i < 27; i++) for (let j = i + 1; j < 27; j++) {
        const d1 = [L[i][0], L[i][1], L[i][2]], d2 = [L[j][0], L[j][1], L[j][2]];
        const w = [L[j][3] - L[i][3], L[j][4] - L[i][4], L[j][5] - L[i][5]];
        const d1xd2 = cross(d1, d2), n2 = dot(d1xd2, d1xd2);
        if (n2 < 1e-12) { pairs++; deg[i]++; deg[j]++; continue; }   // parallel = meets at infinity
        const tp = dot(d1, cross(d2, w));
        if (Math.abs(tp) > 1e-12 * Math.sqrt(n2) * Math.hypot(...w)) continue;  // skew
        pairs++; deg[i]++; deg[j]++;
    }
    check("C10 Schlaefli census (135 pairs, all degree 10)", pairs === 135 && deg.every((d) => d === 10),
        `${pairs} pairs, degrees ${[...new Set(deg)].join(",")}`);
}

// C4 S3 LAW — equation invariant under coordinate permutations
{
    let worst = 0;
    for (let i = 0; i < 500; i++) {
        const x = -2 + 4 * ((i * 37) % 500) / 500, y = -2 + 4 * ((i * 91) % 500) / 500, z = -2 + 4 * ((i * 131) % 500) / 500;
        worst = Math.max(worst,
            Math.abs(F(x, y, z) - F(y, x, z)),
            Math.abs(F(x, y, z) - F(x, z, y)),
            Math.abs(F(x, y, z) - F(z, y, x)));
    }
    check("C4 S3 permutation law", worst < 1e-9, `worst delta ${worst.toExponential(2)}`);
}

// C5 UNBOUNDED LAW — RED-fix v2: |F|<tolerance at r=4.5 is scale-wrong (the
// cubic term reaches ~10^3 out there). Correct test: ray-march F along
// random rays from the core; a SIGN CHANGE proves the real locus crosses
// that ray (arms escape every box).
{
    let signChanges = 0, rays = 0;
    for (let i = 0; i < 600; i++) {
        // deterministic pseudo-rays (LCG)
        const s = (i * 2654435761) % 4294967296;
        const u = (s / 4294967296) * 2 - 1, ph = (s % 1000) * 0.006283185307;
        const w = Math.sqrt(Math.max(0, 1 - u * u));
        const d: [number, number, number] = [w * Math.cos(ph), u, w * Math.sin(ph)];
        let prev = F(0.05 * d[0], 0.05 * d[1], 0.05 * d[2]);
        let changed = false;
        for (let k = 1; k <= 90; k++) {
            const r = (9 * k) / 90;
            const cur = F(r * d[0], r * d[1], r * d[2]);
            if (prev === 0 || prev * cur < 0) { changed = true; break; }
            prev = cur;
        }
        rays++;
        if (changed) signChanges++;
    }
    check("C5 unbounded law (arms escape every box)", signChanges > 100,
        `${signChanges}/${rays} rays cross the surface (real locus unbounded — box-cut presentation REQUIRED)`);
}

// C6 CORE LAW — derive cut half-size B: smallest 0.05 step covering all
// FINITE Eckardt points and the pentad-line z=0 bases (the lace anchors)
// with >= 0.30 margin.
let B = 0;
{
    let maxNeed = 0;
    for (const { p } of concurrent) maxNeed = Math.max(maxNeed, Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2]));
    for (const row of L) maxNeed = Math.max(maxNeed, Math.abs(row[3]), Math.abs(row[4]), Math.abs(row[5]));
    B = Math.ceil((maxNeed + 0.30) * 20) / 20;
    check("C6 core law (cut B derived, Eckardts + lace anchors inside)", B > 0 && B < 3.5,
        `B = ${B.toFixed(2)} (max needed coord ${maxNeed.toFixed(3)} + 0.30 margin)`);
}

// C7 INTERVAL LAW — every line crosses the box [-B,B]^3 with nonempty t-interval
{
    let all = 0, minLen = Infinity;
    for (let i = 0; i < 27; i++) {
        const [a, b, c, p, q, r] = L[i];
        let lo = -Infinity, hi = Infinity;
        let ok = true;
        for (const [d, o] of [[a, p], [b, q], [c, r]] as const) {
            if (Math.abs(d) < 1e-12) { if (Math.abs(o) > B) ok = false; continue; }
            const b1 = (-B - o) / d, b2 = (B - o) / d;
            lo = Math.max(lo, Math.min(b1, b2));
            hi = Math.min(hi, Math.max(b1, b2));
        }
        if (ok && hi > lo) { all++; minLen = Math.min(minLen, hi - lo); }
    }
    check("C7 interval law (all 27 lines cross the box)", all === 27,
        `min chord ${minLen.toFixed(2)} at B ${B.toFixed(2)}`);
}

// C8 FACE LAW — restricted curve real on all 6 faces at B (rim hems exist).
// RED-fix v2: a fixed |F|<1 tolerance is scale-wrong (at B=2.6 the gradient
// reaches ~500, so a 2mm F-band vs 2.2cm cells missed everything). Correct
// test: per-scanline SIGN CHANGES — the curve crosses every row it crosses.
{
    let faces = 0, totalCross = 0;
    const N = 300;
    for (let ax = 0; ax < 3; ax++) for (const sgn of [1, -1]) {
        let crossN = 0;
        for (let i = 0; i < N; i++) {
            const u = -B + (2 * B * i) / (N - 1);
            // march the scanline v from -B to B; count sign changes
            let prev = NaN;
            for (let j = 0; j <= N; j++) {
                const v = -B + (2 * B * j) / N;
                const a: [number, number, number] = [0, 0, 0];
                a[ax] = sgn * B;
                a[(ax + 1) % 3] = u; a[(ax + 2) % 3] = v;
                const cur = F(a[0], a[1], a[2]);
                if (!Number.isNaN(prev) && (prev === 0 || prev * cur < 0)) crossN++;
                prev = cur;
            }
        }
        if (crossN > 20) faces++;
        totalCross += crossN;
    }
    check("C8 face law (real cut curves on all 6 faces)", faces === 6,
        `${faces}/6 faces crossed (${totalCross} scanline crossings)`);
}

// C9 SYMMETRY FOOTPRINT LAW (build sizing input) — report the box the
// S3-orbit of Eckardt points and line chords occupy, for SCALE derivation.
{
    let maxAbs = 0;
    for (const { p } of concurrent) maxAbs = Math.max(maxAbs, ...p.map(Math.abs));
    console.log(`INFO Eckardt max |coord| ${maxAbs.toFixed(4)}; B ${B.toFixed(2)}; ` +
        `line samples inside box: see build envelope law`);
    check("C9 info law (B covers Eckardts)", B >= maxAbs + 0.29, `B ${B.toFixed(2)} >= ${maxAbs.toFixed(3)}+0.29`);
}

console.log(fails === 0 ? "ALL CHECKS PASS" : `${fails} FAILS`);
process.exit(fails === 0 ? 0 : 1);
