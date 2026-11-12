// struct208-debug3.ts — find the single open census edge at fine resolution.
import { stripGrid } from "./struct208-probe-oloid.ts";

const Ekey = (p: number[]) => `${Math.round(p[0] * 1e6)},${Math.round(p[1] * 1e6)},${Math.round(p[2] * 1e6)}`;
const edgeMap = new Map<string, string[]>();
for (const s of [1, -1] as const) {
    const G = stripGrid(s, 240, 12);
    for (let i = 0; i < G.length - 1; i++) {
        const Ri = G[i], Rj = G[i + 1];
        const n = Math.max(Ri.length, Rj.length) - 1;
        for (let j = 0; j < n; j++) {
            const a = Ri[j];
            const b = j + 1 < Ri.length ? Ri[j + 1] : a;
            const c = j + 1 < Rj.length ? Rj[j + 1] : Rj[j];
            const d = Rj[j];
            for (const [p, q] of [[a, c], [c, d], [a, b], [b, c]] as [number[], number[]][]) {
                const key = [Ekey(p), Ekey(q)].sort().join("|");
                if (!edgeMap.has(key)) edgeMap.set(key, []);
                edgeMap.get(key)!.push(`s${s}i${i}j${j}`);
            }
        }
    }
}
const open = [...edgeMap.entries()].filter(([, v]) => v.length !== 2);
console.log("open edges:", open.length);
for (const [k, v] of open) console.log("  ", k, v);
// also: total degenerate (a==b or a==c zero-length) keys
let deg = 0;
for (const [k] of edgeMap) if (k.split("|")[0] === k.split("|")[1]) deg++;
console.log("zero-length edge keys:", deg);
