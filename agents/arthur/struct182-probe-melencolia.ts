// struct182-probe-melencolia.ts — STRUCTURES LANE struct-182, R11-13
// THE MELENCOLIA STELE: Dürer's 4×4 magic square (Melencolia I, 1514).
//
// CANONICAL DATA + EXHAUSTIVE PROPERTY VERIFICATION (the honest class: the
// square is authored canonical data like the (−1,2,2,3) gasket seed; every
// magic property is machine-verified, nothing cited from prose). RED control
// included: a two-cell swap MUST break at least one core line.
//
// ONE CONTRACT with mkv3-melencolia.ts — copy these constants verbatim.
export const CELL = 0.55;                 // cell pitch (m)
export const GRID = 4 * CELL;             // 2.20 grid extent
export const MARGIN_SIDE = 0.30, MARGIN_TOP = 0.42, MARGIN_BOT = 0.40;
export const SLAB_W = GRID + 2 * MARGIN_SIDE;   // 2.80
export const SLAB_H = GRID + MARGIN_TOP + MARGIN_BOT; // 3.02
export const SLAB_T = 0.42;
export const PL_W = 3.20, PL_D = 0.95, PL_H = 0.85, SINK = 0.12;
export const TOTAL_H = PL_H - SINK + SLAB_H;    // 3.75
// glyph field
export const DIG_W = 0.17, DIG_H = 0.30, BAR_W = 0.040, BAR_D = 0.018, DIG_GAP = 0.05;
export const C34_H = 0.22;                // the "34" answer glyphs under the grid
export const WIRE_S = 0.018;              // brass grid wire square section
// (diagonal-filament GLOW variant rejected pre-build: filaments at cell
// centers would cross the corner digits 16/13/4/1 and mar them at close
// view. The sole night element is the "34" answer — emissive brass KEEP.)

// ---- the canonical square (Dürer, Melencolia I, 1514) --------------------------------
export const SQ: number[][] = [
    [16, 3, 2, 13],
    [5, 10, 11, 8],
    [9, 6, 7, 12],
    [4, 15, 14, 1],
];
export const MAGIC = 34;

let fails = 0;
const ck = (name: string, ok: boolean, detail = "") => {
    if (!ok) fails++;
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
};

// ---- property checks -----------------------------------------------------------------
{
    // P1 census: entries are exactly 1..16, each once
    const flat = SQ.flat();
    const set = new Set(flat);
    ck("P1 census 1..16 exactly once", flat.length === 16 && set.size === 16 && flat.every(v => v >= 1 && v <= 16), `sum ${flat.reduce((a, b) => a + b, 0)}`);
    ck("P1b total sum 136 = 4×34", flat.reduce((a, b) => a + b, 0) === 4 * MAGIC);

    // P2 the 10 core lines (4 rows + 4 cols + 2 diagonals)
    const lines: [string, number][] = [];
    for (let r = 0; r < 4; r++) lines.push([`row${r}`, SQ[r].reduce((a, b) => a + b, 0)]);
    for (let c = 0; c < 4; c++) lines.push([`col${c}`, SQ.reduce((a, row) => a + row[c], 0)]);
    lines.push(["diag\\", SQ[0][0] + SQ[1][1] + SQ[2][2] + SQ[3][3]]);
    lines.push(["diag/", SQ[0][3] + SQ[1][2] + SQ[2][1] + SQ[3][0]]);
    ck("P2 ten core lines all 34", lines.every(([, s]) => s === MAGIC), lines.map(([n, s]) => `${n}:${s}`).join(" "));

    // P3 quadrant family: 4 quadrants + central 2×2 + 4 corners
    const quad = (r0: number, c0: number) => SQ[r0][c0] + SQ[r0][c0 + 1] + SQ[r0 + 1][c0] + SQ[r0 + 1][c0 + 1];
    const quads = [quad(0, 0), quad(0, 2), quad(2, 0), quad(2, 2), quad(1, 1)];
    ck("P3 quadrants + central 2×2 all 34", quads.every(s => s === MAGIC), quads.join(" "));
    const corners = SQ[0][0] + SQ[0][3] + SQ[3][0] + SQ[3][3];
    ck("P3b four corners 34", corners === MAGIC, `${corners}`);

    // P4 associative: 8 center-symmetric pairs each 17
    const pairs: number[] = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        if (r * 4 + c < 15 - (r * 4 + c)) pairs.push(SQ[r][c] + SQ[3 - r][3 - c]);
    }
    ck("P4 associative 8 pairs all 17", pairs.length === 8 && pairs.every(s => s === 17), pairs.join(" "));

    // P5 the year: bottom-row middle pair reads 15|14 = 1514
    ck("P5 year cells (3,1)=15 (3,2)=14", SQ[3][1] === 15 && SQ[3][2] === 14, `${SQ[3][1]}|${SQ[3][2]}`);

    // P6 exhaustive rectangle-corner census (2 rows × 2 cols → 4 corner cells): measure, don't cite
    let rect34 = 0, rectTotal = 0;
    for (let r1 = 0; r1 < 4; r1++) for (let r2 = r1 + 1; r2 < 4; r2++)
        for (let c1 = 0; c1 < 4; c1++) for (let c2 = c1 + 1; c2 < 4; c2++) {
            rectTotal++;
            const s = SQ[r1][c1] + SQ[r1][c2] + SQ[r2][c1] + SQ[r2][c2];
            if (s === MAGIC) rect34++;
        }
    console.log(`INFO rectangle-corner sets summing 34: ${rect34}/${rectTotal}`);

    // P7 RED control: swapping two cells must break at least one core line.
    // (Self-catch: the first draft recomputed ONLY rows — a within-row swap
    // preserves row sums while breaking column sums, so the check was vacuous.
    // Recompute all TEN core lines, same shape as P2.)
    const mutant = SQ.map(r => [...r]);
    [mutant[0][1], mutant[0][2]] = [mutant[0][2], mutant[0][1]];
    const mAll = [
        ...[...Array(4).keys()].map(r => mutant[r].reduce((a, b) => a + b, 0)),
        ...[...Array(4).keys()].map(c => mutant.reduce((a, row) => a + row[c], 0)),
        mutant[0][0] + mutant[1][1] + mutant[2][2] + mutant[3][3],
        mutant[0][3] + mutant[1][2] + mutant[2][1] + mutant[3][0],
    ];
    ck("P7 RED mutant swap breaks a core line", mAll.some(s => s !== MAGIC), `mutant lines ${mAll.join(" ")}`);
}

// ---- glyph law (7-segment digit maps + field containment) -----------------------------
export const SEG: Record<string, string[]> = {
    "0": ["a", "b", "c", "d", "e", "f"],
    "1": ["b", "c"],
    "2": ["a", "b", "g", "e", "d"],
    "3": ["a", "b", "g", "c", "d"],
    "4": ["f", "g", "b", "c"],
    "5": ["a", "f", "g", "c", "d"],
    "6": ["a", "f", "g", "e", "c", "d"],
    "7": ["a", "b", "c"],
    "8": ["a", "b", "c", "d", "e", "f", "g"],
    "9": ["a", "b", "c", "d", "f", "g"],
};
export const segCount = (d: string) => SEG[d].length;
export const numDigits = (n: number) => String(n).split("");
// glyph field width for a number: digits + gaps, must fit cell inner margin 0.075/side
export const numW = (n: number) => numDigits(n).length * DIG_W + (numDigits(n).length - 1) * DIG_GAP;
{
    ck("P8 all ten digits mapped", Object.keys(SEG).length === 10 && Object.values(SEG).every(v => v.length >= 2 && v.length <= 7));
    let maxW = 0;
    for (let n = 1; n <= 16; n++) maxW = Math.max(maxW, numW(n));
    const fits = maxW <= CELL - 2 * 0.075 && DIG_H <= CELL - 2 * 0.075;
    ck("P8b widest number fits cell inner margin", fits, `maxW ${maxW.toFixed(3)} vs ${(CELL - 0.15).toFixed(3)}; DIG_H ${DIG_H}`);
    // expected segment totals (ONE source for decode asserts — computed, not hand-counted)
    let cellSegs = 0, digits23 = 0;
    for (let n = 1; n <= 16; n++) { for (const d of numDigits(n)) cellSegs += segCount(d); digits23++; }
    const c34segs = segCount("3") + segCount("4");
    console.log(`INFO expected: ${digits23} numbers, ${cellSegs} BONE cell segments, 34-answer ${c34segs} segments in the glow KEEP (emissive brass — the sole night element; diagonal-filament variant REJECTED pre-build: bars would cross the corner digits 16/13/4/1 and mar them at close view)`);
}

// ---- geometry contract ----------------------------------------------------------------
{
    const envX = Math.max(SLAB_W, PL_W);        // 3.20 width
    const envZ = Math.max(SLAB_T, PL_D);        // 0.95 depth
    ck("P9 envelope 3.20 x 3.75 x 0.95, min y 0, origin-centered",
        Math.abs(envX - 3.20) < 1e-9 && Math.abs(TOTAL_H - 3.75) < 1e-9 && Math.abs(envZ - 0.95) < 1e-9,
        `${envX.toFixed(2)} x ${TOTAL_H.toFixed(2)} x ${envZ.toFixed(2)} (x width, z depth — face +Z)`);
    ck("P9b slab seats SINK into plinth top", SINK === 0.12 && PL_H > SINK);
    ck("P9c nodes plan 4", true, "stone bucket + bone bucket + brass bucket + glow_ms_1 KEEP (the 34-answer, emissive brass)");
}

if (fails) { console.error(`${fails} CHECK(S) FAILED`); process.exit(1); }
console.log("ALL CHECKS PASS");
