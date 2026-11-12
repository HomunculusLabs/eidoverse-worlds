// struct208-debug.ts — empirical settlement of the development + glue questions.
import { developBand, ruling, U_A, U_B, stripArea3D, P2, P1 } from "./struct208-probe-oloid.ts";

const SQ3 = Math.sqrt(3);
const d2 = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const d3 = (a: [number, number, number], b: [number, number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

for (const s of [1, -1] as const) {
    const dev = developBand(s, 240);
    console.log(`\n=== branch ${s === 1 ? "+" : "-"} ===`);
    // walk trace
    console.log("q[0]", dev.q[0], "q[120]", dev.q[120].map((v) => v.toFixed(4)), "q[240]", dev.q[240].map((v) => v.toFixed(4)));
    console.log("far[0]", dev.far[0].map((v) => v.toFixed(4)), "far[120]", dev.far[120].map((v) => v.toFixed(4)), "far[240]", dev.far[240].map((v) => v.toFixed(4)));
    console.log("cusp gap", d2(dev.far[0], dev.far[240]).toFixed(6), " walk displacement", d2(dev.q[0], dev.q[240]).toFixed(6), " walk chord", dev.q[240].map((v) => v.toFixed(4)));
    // local isometry: triangle test at every 10th station
    // physical: P1(u_i), P1(u_{i+1}), P2(u_i, s); plane: q_i, q_{i+1}, far_i
    let worst = 0, worstI = -1;
    for (let i = 0; i < 240; i += 1) {
        const u_i = U_A + ((U_B - U_A) * i) / 240;
        const u_j = U_A + ((U_B - U_A) * (i + 1)) / 240;
        const A = P1(u_i), B = P1(u_j), C = P2(u_i, s);
        const a = dev.q[i], b = dev.q[i + 1], c = dev.far[i];
        const err = Math.abs(d3(A, B) - d2(a, b)) + Math.abs(d3(A, C) - d2(a, c)) + Math.abs(d3(B, C) - d2(b, c));
        if (err > worst) { worst = err; worstI = i; }
    }
    console.log(`triangle isometry worst err ${worst.toExponential(3)} at station ${worstI}`);
    // far-edge print angles at 30° steps
    const angs: string[] = [];
    for (const i of [0, 40, 80, 120, 160, 200, 240]) {
        const base = dev.q[i], tip = dev.far[i];
        angs.push(`${i}:${(Math.atan2(tip[1] - base[1], tip[0] - base[0]) * 180 / Math.PI).toFixed(1)}deg`);
    }
    console.log("print angles", angs.join(" "));
    // far edge length (physical arc2 doubled: v: 0->2pi/3->0, arc length = 2*(2pi/3) = 4pi/3)
    let farLen = 0;
    for (let i = 0; i < 240; i++) farLen += d2(dev.far[i], dev.far[i + 1]);
    let physFar = 0;
    for (let i = 0; i < 240; i++) {
        const u_i = U_A + ((U_B - U_A) * i) / 240, u_j = U_A + ((U_B - U_A) * (i + 1)) / 240;
        physFar += d3(P2(u_i, s), P2(u_j, s));
    }
    console.log(`far edge: plane ${farLen.toFixed(4)} vs physical polyline ${physFar.toFixed(4)} (should match if isometric)`);
}
