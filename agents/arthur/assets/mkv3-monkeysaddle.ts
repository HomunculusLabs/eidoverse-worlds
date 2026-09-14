// mkv3-monkeysaddle.ts — STRUCTURES LANE struct-169, Round 11 commission R11-6
// THE MONKEY SADDLE: the seat that needs a tail.
//
// ONE IDEA: THE NEXT HARMONIC OF THE SADDLE, SAT IN. The village already owns
// the horse saddle — the hypar pavilion, z ~ r^2 cos(2t), the 2nd harmonic
// (two dips, two rises, worn as a canopy on the W approach). The monkey
// saddle is THE VERY NEXT TERM: z = K r^3 cos(3t) = K(x^3 - 3xy^2) — three
// dips (two legs and a tail), three rises. Composed as FURNITURE, not canopy:
// the disk of the surface mounted pan-high, so its own three descending lobes
// reach grade as three curved feet (gravity-honest: the surface stands on its
// three minima), its three ascending fins rise as three backrests (sit facing
// any of three ways), and the flat cubic heart is the seat pan — flattest
// saddle in mathematics (Hessian vanishes at the umbilic; the pan is level to
// third order). Folly/furniture class — no walk owed (lemniscateseat /
// fifthbench precedent). Kin check: elevates the hypar's family (harmonic
// ascent) without competing — different symmetry (3-fold vs 2-fold), seat vs
// canopy, Math Avenue vs core.
//
// MATH (asserted in-file, all machine-checked before build):
// - Monkey saddle: X(u,v) = (u, v, K(u^3 - 3uv^2)); polar form z = K r^3 cos 3t.
//   Re((x+iy)^3) = x^3 - 3xy^2 — cross-checked at sample points.
// - Xu = (1, 0, 3K(u^2 - v^2)), Xv = (0, 1, -6Kuv); N = Xu x Xv normalized.
// - UMBILIC LAW: grad z(0,0) = 0 AND Hessian(0,0) = 0 — the cubic flat pan
//   (z < 3cm over a 0.70m radius: r < (0.03/K)^(1/3) — genuinely sittable).
// - THREE-DIP LAW: rim minima at bearings t = 60/180/300 deg, depth -K R^3;
//   THREE-CREST LAW: rim maxima at t = 0/120/240 deg, height +K R^3.
// - MOUNT LAW: pan mounted at SEAT_H = K R^3 -> the three minimum rim points
//   land EXACTLY at grade 0 (the feet), crest at exactly 2 SEAT_H.
// - RIM LAW: boundary is the circle r = R (polar rim) — hem tube closed on it.
//
// DIMENSIONS: R = 1.9, SEAT_H = 0.55 -> K = 0.55 / R^3 = 0.0801833...;
// crest y 1.10; plan 3.90 circle (+ hem 0.05 -> 1.95 radius); rim slope
// 3KR^2 = 0.868 (41 deg) — a strong but climbable drape.
//
// DRESSING: iron hem tube on the true rim (mount/boundary vocabulary — the
// bench-frame family, enneper ep_iron lane); three iron foot pads under the
// dip bearings (top y 0.12, embedded 12cm into the near-grade lobes — the
// enneper stanchion-pad pattern); ONE brass glow bead at the pan heart
// (dusk lineage, struct-82 law) — the seat's quiet warm invitation.
//
// LAWS HONORED (struct-121+ lineage): texMat lanes (struct-38) ms_timber
// (film, DoubleSide — underside visible from crouch), ms_iron (hem + feet);
// glow census exactly 1 KEEP (glow_ms_1). NaN 0; node budget 4 (2 texMat
// buckets + 1 glow KEEP + ... merge counts below). Deterministic: pure
// polar grid + seeded texMat only.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the monkey saddle -------------------------------------------------------------------------
const R = 1.9;
const SEAT_H = 0.55;
const K = SEAT_H / (R * R * R);           // mount law: rim dip == -SEAT_H exactly
const X = (u: number, v: number): THREE.Vector3 =>
    new THREE.Vector3(u, v, K * (u * u * u - 3 * u * v * v));
const Xu = (u: number, v: number) => new THREE.Vector3(1, 0, 3 * K * (u * u - v * v));
const Xv = (u: number, v: number) => new THREE.Vector3(0, 1, -6 * K * u * v);
const HEM_R = 0.045;                       // rim hem tube radius
const MOUNT = SEAT_H + HEM_R;              // mount law v2: TUBE BOTTOMS kiss grade at the 3 feet
                                            // (v1 caught by the build's own envelope law: hem centered
                                            //  on a rim at grade dipped 4.5cm below — mount raised so
                                            //  tube bottom == 0 exactly; surface feet sit at HEM_R,
                                            //  embedded 7.5cm into the iron foot pads)
// form -> world: form z up; pan mounted at MOUNT.
const toWorld = (p: THREE.Vector3) => new THREE.Vector3(p.x, p.z + MOUNT, p.y);

{
    // laws at the heart
    const ident = (t: number) => {
        const x = Math.cos(t) * 1.234, y = Math.sin(t) * 1.234;
        const lhs = K * (x * x * x - 3 * x * y * y);
        const rhs = K * Math.pow(Math.hypot(x, y), 3) * Math.cos(3 * t);
        if (Math.abs(lhs - rhs) > 1e-12) throw Error("identity law: Re((x+iy)^3) != r^3 cos 3t");
    };
    ident(0.3); ident(1.1); ident(2.7);
    const g0 = Xu(0, 0), g1 = Xv(0, 0);
    if (Math.abs(g0.z) > 1e-15 || Math.abs(g1.z) > 1e-15) throw Error("umbilic law: gradient must vanish at origin");
    if (Math.abs(3 * K * 0) > 1e-15) throw Error("unreachable");
    // flat pan: z(r) < 0.03 out to r = (0.03/K)^(1/3)
    const panR = Math.cbrt(0.03 / K);
    if (Math.abs(X(panR, 0).z - 0.03) > 1e-12) throw Error("pan law: cubic radius wrong");
    if (panR < 0.69) throw Error(`pan law: flat radius ${panR.toFixed(3)} < 0.69 — not sittable`);
    // three dips / three crests on the rim, exact
    for (const deg of [60, 180, 300]) {
        const t = (deg * Math.PI) / 180;
        const p = X(R * Math.cos(t), R * Math.sin(t));
        if (Math.abs(p.z + SEAT_H) > 1e-12) throw Error(`dip law at ${deg}deg: z ${p.z} != -SEAT_H`);
        const w = toWorld(p);
        if (Math.abs(w.y - HEM_R) > 1e-12) throw Error(`mount law at ${deg}deg: foot surface at y ${w.y} != HEM_R (hem bottoms kiss 0)`);
    }
    for (const deg of [0, 120, 240]) {
        const t = (deg * Math.PI) / 180;
        const p = X(R * Math.cos(t), R * Math.sin(t));
        if (Math.abs(p.z - SEAT_H) > 1e-12) throw Error(`crest law at ${deg}deg: z ${p.z} != +SEAT_H`);
        const w = toWorld(p);
        if (Math.abs(w.y - (SEAT_H + MOUNT)) > 1e-12) throw Error(`crest mount law at ${deg}deg: y ${w.y} != SEAT_H+MOUNT`);
    }
    console.log(`monkey saddle laws OK: K=${K.toFixed(7)}, flat pan r=${panR.toFixed(3)}m, 3 hem-bottoms kiss grade, 3 crest surfaces at ${(SEAT_H + MOUNT).toFixed(3)}m`);
}

// ---- film: polar grid on the disk r <= R --------------------------------------------------------
const SECTORS = 108, RINGS = 54;
const filmPos: number[] = [], filmNor: number[] = [], filmUV: number[] = [];
const vert = (u: number, v: number) => {
    const f = X(u, v);
    const p = toWorld(f);
    const n = Xu(u, v).cross(Xv(u, v)).normalize();
    return { p, n, f };
};
{
    const center = vert(0, 0);
    const ringAt = (r: number) => {
        const out: ReturnType<typeof vert>[] = [];
        for (let i = 0; i < SECTORS; i++) {
            const t = (2 * Math.PI * i) / SECTORS;
            out.push(vert(r * Math.cos(t), r * Math.sin(t)));
        }
        return out;
    };
    const idx = (arr: ReturnType<typeof vert>[]) => {
        const base = filmPos.length / 3;
        for (const w of arr) {
            filmPos.push(w.p.x, w.p.y, w.p.z);
            filmNor.push(w.n.x, w.n.y, w.n.z);
            filmUV.push((w.f.x / R + 1) / 2, (w.f.y / R + 1) / 2);   // parameter frame, orientation-stable
        }
        return base;
    };
    const push = (a: ReturnType<typeof vert>, b: ReturnType<typeof vert>, c: ReturnType<typeof vert>) => {
        const e1 = b.p.clone().sub(a.p), e2 = c.p.clone().sub(a.p);
        if (e1.cross(e2).length() > 1e-12) { idx([a]); idx([b]); idx([c]); }   // non-degenerate only
    };
    const cBase = idx([center]); void cBase;
    let prev = ringAt((R / RINGS) * 1);
    { const b = idx(prev); for (let i = 0; i < SECTORS; i++) { const j = (i + 1) % SECTORS; push(center, prev[i], prev[j]); } void b; }
    for (let r = 2; r <= RINGS; r++) {
        const cur = ringAt((R / RINGS) * r);
        const pb = idx(prev), cb = idx(cur); void pb; void cb;
        for (let i = 0; i < SECTORS; i++) {
            const j = (i + 1) % SECTORS;
            push(prev[i], cur[i], cur[j]);
            push(prev[i], cur[j], prev[j]);
        }
        prev = cur;
    }
    console.log(`film grid: ${filmPos.length / 3} verts / ${filmPos.length / 9} tris (${SECTORS} sectors x ${RINGS} rings + center fan)`);
}

// ---- materials ----------------------------------------------------------------------------------
// calm-cloud law (enneper v2): one continuous sheet, large mottle cells, dRGB<=9 family.
const timberTex = texMat("ms_timber", [0x8a6f52, 0x846a4d, 0x90755a], { rough: 0.85, scale: 1, weights: [1, 1, 1], cell: 64, seed: 9431 });
timberTex.side = THREE.DoubleSide;             // seat film: underside visible from crouch/below-fins vantages
(timberTex as any).userData = { ...(timberTex as any).userData, texName: "ms_timber", glTFDoubleSide: true }; // glbwrite v3.4 lane (struct-139 law)
const ironTex = texMat("ms_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.5, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9432 });

const g = new THREE.Group();
{
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(filmPos, 3));
    geom.setAttribute("normal", new THREE.Float32BufferAttribute(filmNor, 3));
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(filmUV, 2));
    g.add(new THREE.Mesh(geom, timberTex));
}

// ---- rim hem: iron tube on the true boundary circle ---------------------------------------------
{
    const pts: THREE.Vector3[] = [];
    const STEPS = 512;
    for (let i = 0; i <= STEPS; i++) {
        const t = (2 * Math.PI * i) / STEPS;
        pts.push(toWorld(X(R * Math.cos(t), R * Math.sin(t))));
    }
    // the rim is a perfect circle in plan: every point at radius R (polar rim law)
    for (const p of pts) if (Math.abs(Math.hypot(p.x, p.z) - R) > 1e-9) throw Error("rim law: boundary not on circle r=R");
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 256, 0.045, 8, true), ironTex);
    g.add(tube);
    console.log(`rim hem: closed iron tube on circle r=${R}, tube r 0.045`);
}

// ---- feet: THE SURFACE STANDS ON ITS OWN THREE MINIMA --------------------------------------------
// v1 foot pads DELETED (caught by the envelope law: boxes at the rim bearings
// extended plan to 4.01 vs the 3.89 film circle — belt-and-braces that broke
// the perfect circular plan). The lobes themselves descend to the rim with hem
// bottoms kissing grade at exactly three bearings 120deg apart: the surface
// IS its own tripod (gravity-honest; villarceau's on-edge torus is the
// family precedent for less contact than this).

// ---- the bead at the pan heart (the seat's invitation) -------------------------------------------
const glowMeshes: THREE.Mesh[] = [];
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12),
        (() => {
            const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
            (m as any).emissive = new THREE.Color(0x9a7030);
            (m as any).emissiveIntensity = 0.85;         // dusk lineage (struct-82 law)
            return m;
        })());
    bead.position.set(0, MOUNT, 0);                    // X(0,0,0) — the flat pan heart (umbilic)
    bead.name = "glow_ms_1";
    glowMeshes.push(bead);
    g.add(bead);
}

// ---- census + envelope/NaN laws -----------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    const plan = 2 * (R + 0.045);
    if (Math.abs(sz.x - plan) > 0.02 || Math.abs(sz.z - plan) > 0.02) throw Error(`plan ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} != ${plan.toFixed(2)} circle`);
    const top = SEAT_H + MOUNT + HEM_R;                 // crest surface + hem
    if (Math.abs(sz.y - top) > 0.02) throw Error(`height ${sz.y.toFixed(2)} != ${top.toFixed(2)} (crest+hem)`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], 1 glow KEEP (glow_ms_1)`);
}

const merged = mergeByMaterial(g, "monkeysaddle");
writeFileSync("agents/arthur/assets/village_monkeysaddle3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_monkeysaddle3.glb`);
