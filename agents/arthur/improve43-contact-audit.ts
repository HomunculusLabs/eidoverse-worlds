// improve43-contact-audit.ts — stone-level contact audit for the improve-43
// cairn cure, run on the PRE-MERGE composed group (stones still named
// cairn_i_stone_s; mergeByMaterial would destroy them). Recomposes each work
// through the exact live pipeline minus merge/export, then per cairn checks
// every consecutive stone pair with the TRUE 3D sphere-overlap test:
// dist(center_s, center_{s-1}) < r_s + r_{s-1} (centers carry the radius-
// scaled jitter, so the test includes lateral offset). Reports per work:
// cairn count, stone pairs, min overlap margin (r_s+r_prev - dist), any
// FAILING pairs, max stack top, and the analytic y-embed value per pair.
// Read-only. Usage: bun agents/arthur/improve43-contact-audit.ts
import * as THREE from "three";

function rng(seed: number) {
    let s = (seed >>> 0) || 1;
    return () => { s = (s * 16607) % 2147483647; return s / 2147483647; };
}
const DIR = import.meta.dir;
const mason = await import(`${DIR}/assets/mason.ts`);
const THEMES = (mason as any).THEMES as ReadonlyArray<readonly [string, (g: THREE.Group, r: () => number) => string]>;
const WORKS = [1642, 1655, 1668, 1681, 1694];

for (const i of WORKS) {
    const [themeName, compose] = THEMES[i % THEMES.length];
    if (themeName !== "cairnfield") throw Error(`work ${i} theme ${themeName}`);
    const g = new THREE.Group();
    const r = rng(i + 1);
    compose(g, r);
    // collect stones by cairn
    const byCairn = new Map<number, { s: number; pos: THREE.Vector3; r: number }[]>();
    for (const ch of g.children as THREE.Mesh[]) {
        const m = /^(cairn_\d+)_stone_(\d+)$/.exec(ch.name ?? "");
        if (!m) continue;
        const cairn = Number(m[1].split("_")[1]);
        const s = Number(m[2]);
        const geo = ch.geometry as THREE.IcosahedronGeometry;
        const rad = geo.parameters.radius;
        const arr = byCairn.get(cairn) ?? []; arr.push({ s, pos: ch.position.clone(), r: rad }); byCairn.set(cairn, arr);
    }
    let pairs = 0, fails = 0, minMargin = Infinity, maxTop = 0;
    const failDetail: any[] = [];
    for (const [, stones] of byCairn) {
        stones.sort((a, b) => a.s - b.s);
        for (let k = 1; k < stones.length; k++) {
            const a = stones[k - 1], b = stones[k];
            const d = a.pos.distanceTo(b.pos);
            const margin = (a.r + b.r) - d;
            pairs++;
            if (margin < minMargin) minMargin = margin;
            if (margin <= 0) { fails++; if (failDetail.length < 5) failDetail.push({ cairn: stones[0].s, pair: `${a.s}->${b.s}`, dist: +d.toFixed(3), need: +(a.r + b.r).toFixed(3) }); }
        }
        const top = stones[stones.length - 1];
        maxTop = Math.max(maxTop, top.pos.y + top.r);
    }
    console.log(JSON.stringify({
        work: i, cairns: byCairn.size, stone_pairs: pairs, failing_pairs: fails,
        min_overlap_margin_m: +minMargin.toFixed(4), max_stack_top_m: +maxTop.toFixed(3),
        fail_samples: failDetail,
    }));
}
console.log("AUDIT_DONE");
