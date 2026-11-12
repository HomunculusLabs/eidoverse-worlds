// struct208-debug2.ts — settle the glue 0.17 err + the single open edge.
import { developBand, stripGrid, U_A, U_B, U_STAR, NU, toWorld, TUMBLE, SOLVE } from "./struct208-probe-oloid.ts";

// --- glue err ---
const devA = developBand(+1);
const seg = devA.lines[NU / 2];
console.log("seg len", Math.hypot(seg[1][0] - seg[0][0], seg[1][1] - seg[0][1]), "want", Math.sqrt(3));
const wa = toWorld(TUMBLE.a), wb = toWorld(TUMBLE.b);
console.log("world contact len", Math.hypot(wb[0] - wa[0], wb[2] - wa[2]));
const glueA = SOLVE.linesA[NU / 2];
console.log("glueA", glueA.map((p) => p.map((v) => v.toFixed(6))));
console.log("contact", SOLVE.contact.map((p) => p.map((v) => v.toFixed(6))));

// --- open edge: census of which edges are open at fine resolution ---
const Ekey = (p: number[]) => `${Math.round(p[0] * 1e6)},${Math.round(p[1] * 1e6)},${Math.round(p[2] * 1e6)}`;
for (const s of [1, -1] as const) {
    const G = stripGrid(s, 240, 12);
    const edgeMap = new Map<string, string[]>();
    const addE = (p: number[], q: number[], tag: string) => {
        const key = [Ekey(p), Ekey(q)].sort().join("|");
        if (!edgeMap.has(key)) edgeMap.set(key, []);
        edgeMap.get(key)!.push(tag);
    };
    for (let i = 0; i < G.length - 1; i++) {
        const Ri = G[i], Rj = G[i + 1];
        const n = Math.max(Ri.length, Rj.length) - 1;
        for (let j = 0; j < n; j++) {
            const a = Ri[j];
            const b = j + 1 < Ri.length ? Ri[j + 1] : a;
            const c = j + 1 < Rj.length ? Rj[j + 1] : Rj[j];
            const d = Rj[j];
            addE(a, c, `i${i}j${j}ac`); addE(c, d, `i${i}j${j}cd`);
            addE(a, b, `i${i}j${j}ab`); addE(b, c, `i${i}j${j}bc`);
        }
    }
    const open = [...edgeMap.entries()].filter(([, v]) => v.length !== 2);
    console.log(`branch ${s}: open edges ${open.length}`);
    for (const [k, v] of open.slice(0, 6)) console.log("  ", k, v);
    // row lengths at the ends
    console.log(`  row lengths: R0=${G[0].length} R119=${G[119].length} R120=${G[120].length} R239=${G[239].length} R240=${G[240].length}`);
}
