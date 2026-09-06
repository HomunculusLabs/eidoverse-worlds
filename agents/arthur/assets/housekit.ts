// housekit.ts — shared parts for sophisticated village houses.
// Everything composes with mkhouse-style named boxes; roofs are prisms.
// Palette: stone 0x56503c, dark 0x44402e, brass 0xa0a248, bone 0xdcdcba, mid 0x787250.
import * as THREE from "three";
import { mat, texMat } from "./glbwrite.ts";

export const C = { STONE: 0x56503c, DARK: 0x44402e, BRASS: 0xa0a248, BONE: 0xdcdcba, MID: 0x787250 };

// tex-3 PLASTER: gable infill triangles carry a lime-wash mottling tile —
// 3 muted tones anchored on the old flat STONE color (distance continuity),
// scale 2 = finer grain than the timber planks (plaster is fine-grained).
// Module singleton: every gableRoof call shares one material instance.
let _plaster: THREE.MeshStandardMaterial | null = null;
const plasterMat = () =>
    (_plaster ??= texMat("plaster", [0x56503c, 0x605c42, 0x4a4634], { rough: 0.95, scale: 2, weights: [2, 1, 1] }));

// tex-4 STONE: wallSpan plinths (the base course at every wall) carry an
// ashlar tile — cell-quantized 32px blocks on the same 256px tile so stone
// reads as coursed blocks, not noise. Tones anchored on STONE; rough .95.
let _stone: THREE.MeshStandardMaterial | null = null;
const stoneMat = () =>
    (_stone ??= texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 }));

// ---- THE VILLAGE PALETTE CANON (loop #86 census) ----
// Core five (above) plus the approved accent families. Every color the
// village wears, decoded + verified 2026-08-15. New builds pick from here:
//   bark/trunk    0x6a6030    canopy     0x728e5a    canopy-dk 0x5c7648
//   iron/hardware 0x404044    water      0x506a78    fire      0xff9040
//   amber glow    0xffc98a    gold/lead  0xdada70    wood      0xa09832
//   straw/hay     0xd4da82    leather    0x7c6832    rust      0xa06c32
//   sage blanket  0x5e6c7a    rock       0x8c887e    clay      0x9a9a58
//   plum blanket  0x8a7448    mattress   0x78704a    candle    0xffd9a0
// Emissives (material table only): ember 0xff5a1a, hearth-map 0xff6a1a,
// oven mouth 0xffb763/0xff7a26. Garden greens (garden cottage plantings):
// 0x609646 / 0x74a85e family.
export const ACCENTS = {
    BARK: 0x6a6030, CANOPY: 0x728e5a, CANOPY_DK: 0x5c7648, IRON: 0x404044,
    WATER: 0x506a78, FIRE: 0xff9040, AMBER: 0xffc98a, GOLD: 0xdada70,
    WOOD: 0xa09832, STRAW: 0xd4da82, LEATHER: 0x7c6832, RUST: 0xa06c32,
    SAGE: 0x5e6c7a, ROCK: 0x8c887e, CLAY: 0x9a9a58, PLUM: 0x8a7448,
    MATTRESS: 0x78704a, CANDLE: 0xffd9a0,
};

/** Named box, position in one call. */
export function box(g: THREE.Group, name: string, w: number, h: number, d: number, x: number, y: number, z: number, c: number) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, 0.95, 0));

    m.name = name;
    m.position.set(x, y, z);
    g.add(m);
    return m;
}

/** Human-scale trestle table. `floorY` is the finished floor surface. */
export function furnitureTable(g: THREE.Group, name: string, x: number, floorY: number, z: number, w: number, d: number, material: THREE.Material) {
    const add = (part: string, pw: number, ph: number, pd: number, px: number, py: number, pz: number) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, pd), material);
        mesh.name = `${name}_${part}`;
        mesh.position.set(px, py, pz);
        g.add(mesh);
    };
    add("top", w, 0.09, d, x, floorY + 0.84, z);
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
        add(`leg_${sx}_${sz}`, 0.1, 0.75, 0.1, x + sx * (w / 2 - 0.16), floorY + 0.375, z + sz * (d / 2 - 0.14));
}

/** Seatable bench with a 0.50m seat height. */
export function furnitureBench(g: THREE.Group, name: string, x: number, floorY: number, z: number, w: number, material: THREE.Material) {
    const add = (part: string, pw: number, ph: number, pd: number, px: number, py: number) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, pd), material);
        mesh.name = `${name}_${part}`;
        mesh.position.set(px, py, z);
        g.add(mesh);
    };
    add("seat", w, 0.09, 0.3, x, floorY + 0.50);
    for (const sx of [-1, 1]) add(`leg_${sx}`, 0.1, 0.46, 0.22, x + sx * (w / 2 - 0.14), floorY + 0.23);
}

/** Wall shelf with two brackets. `axis` is the wall-facing normal. */
export function furnitureShelf(g: THREE.Group, name: string, x: number, y: number, z: number, w: number, d: number, material: THREE.Material, axis: "x" | "z" = "z") {
    const board = new THREE.Mesh(axis === "z" ? new THREE.BoxGeometry(w, 0.08, d) : new THREE.BoxGeometry(d, 0.08, w), material);
    board.name = `${name}_board`;
    board.position.set(x, y, z);
    g.add(board);
    for (const sx of [-1, 1]) {
        const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), material);
        bracket.name = `${name}_bracket_${sx}`;
        bracket.position.set(axis === "z" ? x + sx * (w / 2 - 0.14) : x, y - 0.16, axis === "x" ? z + sx * (w / 2 - 0.14) : z);
        g.add(bracket);
    }
}

/** Gable roof prism: ridge along X. Width w (X), depth d (Z), height h.
 * baseY = underside of eaves. Overhang o on all sides. */
// improve-4 (opt-in, default byte-identical for siblings): two fixes for
// rectangular gabled plans. (a) SOLID RIDGE: the loop-17 "hand-laid" cap
// stagger (0.92 width factor + ±0.03 yaw) reads as a dashed/unwelded ridge
// at 18m gameplay distance — opts into a continuous cap run. (b) GABLE
// EXTENT: the gable triangle is authored with half-width w/2 (ridge length)
// but rotated to span the DEPTH axis — on any w≠d plan it horns past the
// roof plane (hall 9×6: 1.3m horn each end; accessor-decoded). trueGableHalf
// = the depth-plane half-extent the triangle should actually span.
export function gableRoof(g: THREE.Group, name: string, w: number, d: number, h: number, baseY: number, over = 0.3, c = C.MID, solidRidge = false, trueGableHalf: number | null = null) {
    // prism via ExtrudeGeometry-free approach: two sloped slabs + two gable ends
    const W = w + 2 * over, D = d + 2 * over;
    const slopeLen = Math.hypot(D / 2, h);
    const angle = Math.atan2(h, D / 2);
    const thick = 0.09;
    for (const side of [-1, 1]) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(W, thick, slopeLen), mat(c, 0.9, 0));
        slab.name = `${name}_s${side < 0 ? "n" : "s"}`;
        slab.rotation.x = side * angle;
        slab.position.set(0, baseY + h / 2, side * (D / 4));
        g.add(slab);
    }
    // RIDGE CAP (new-era loop 17): raised bone-tone stones along the peak —
    // the roofline reads finished from a distance (where the roof IS the building)
    const capSegs = Math.max(4, Math.round(W / 1.1));
    for (let rc = 0; rc < capSegs; rc++) {
        const cx2 = -W / 2 + (W * (rc + 0.5)) / capSegs;
        const cap = new THREE.Mesh(new THREE.BoxGeometry(solidRidge ? W / capSegs : W / capSegs * 0.92, 0.09, 0.24), mat(C.BONE, 0.92, 0));
        cap.name = `${name}_cap_${rc}`;
        cap.position.set(cx2, baseY + h + 0.045, 0);
        cap.rotation.y = solidRidge ? 0 : (rc % 2) * 0.06 - 0.03; // slight stagger = laid by hand
        g.add(cap);
    }
    // gable end triangles: custom BufferGeometry
    const gableHalf = trueGableHalf ?? w / 2;
    for (const side of [-1, 1]) {
        const tri = new THREE.BufferGeometry();
        const hw = gableHalf;
        const verts = new Float32Array([
            -hw, 0, 0,  hw, 0, 0,  0, h, 0,   // front face
            hw, 0, 0, -hw, 0, 0,  0, h, 0,    // back face (reversed)
        ]);
        tri.setAttribute("position", new THREE.BufferAttribute(verts, 3));
        tri.computeVertexNormals();
        // tex-3: custom geometry — UVs authored here (0..1 across width and
        // height; the material's repeat handles density like box faces)
        tri.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([
            0, 0, 1, 0, 0.5, 1,   // front face
            1, 0, 0, 0, 0.5, 1,   // back face
        ]), 2));
        const m = new THREE.Mesh(tri, plasterMat());
        m.name = `${name}_end${side < 0 ? "w" : "e"}`;
        m.position.set(side * (w / 2), baseY, 0);
        m.rotation.y = Math.PI / 2;
        g.add(m);
        // RAKE BOARDS: the gable triangle stops at the wall (w/2) but the
        // slabs overhang to D/2 — close the open strip under the roof ends
        // with sloped boards from eave to ridge (verge boards, era craft)
        for (const s2 of [-1, 1]) {
            const rake = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, slopeLen), mat(C.DARK, 0.9, 0));
            rake.name = `${name}_rake${side < 0 ? "w" : "e"}${s2 < 0 ? "n" : "s"}`;
            rake.rotation.x = s2 * angle;
            rake.position.set(side * (w / 2 + 0.03), baseY + h / 2 + 0.03, s2 * (D / 4));
            g.add(rake);
        }
    }
    // ridge beam
    box(g, `${name}_ridge`, W + 0.1, 0.1, 0.14, 0, baseY + h + 0.02, 0, C.DARK);
}

/** Hipped-ish pyramid roof for square plans (4 sloped slabs). */
export function pyramidRoof(g: THREE.Group, name: string, w: number, d: number, h: number, baseY: number, over = 0.3, c = C.MID) {
    const W = w + 2 * over, D = d + 2 * over;
    const mk = (ww: number, dd: number, ox: number, oz: number, rot: number, tag: string) => {
        const slopeLen = Math.hypot(Math.max(W, D) / 2, h) * 0.72;
        const s = new THREE.Mesh(new THREE.BoxGeometry(ww, 0.09, slopeLen), mat(c, 0.9, 0));
        s.name = `${name}_${tag}`;
        s.rotation.order = "YXZ";
        s.rotation.y = rot;
        s.rotation.x = Math.atan2(h, (rot === 0 ? D : W) / 2);
        s.position.set(ox, baseY + h / 2, oz);
        g.add(s);
    };
    mk(W, 0, 0, D / 4, 0, "s");
    mk(W, 0, 0, -D / 4, 0, "n");
    mk(D, 0, W / 4, 0, Math.PI / 2, "e");
    mk(D, 0, -W / 4, 0, Math.PI / 2, "w");
}

/** Conical roof (tower houses). */
export function coneRoof(g: THREE.Group, name: string, r: number, h: number, baseY: number, c = C.MID) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r + 0.35, h, 12), mat(c, 0.9, 0));
    m.name = name;
    m.position.y = baseY + h / 2;
    g.add(m);
}

/** Window frame: 4 thin bars around a recessed dark pane. Axis: "x"|"z". */
export function windowFrame(g: THREE.Group, name: string, x: number, y: number, z: number, w: number, h: number, axis: "x" | "z") {
    const t = 0.06, d = 0.14;
    const horiz = (yy: number, tag: string) => axis === "z"
        ? box(g, `${name}_${tag}`, w, t, d, x, yy, z, C.BONE)
        : box(g, `${name}_${tag}`, d, t, w, x, yy, z, C.BONE);
    const vert = (xx: number, zz: number, tag: string) => axis === "z"
        ? box(g, `${name}_${tag}`, t, h, d, xx, y, zz, C.BONE)
        : box(g, `${name}_${tag}`, d, h, t, xx, y, zz, C.BONE);
    horiz(y + h / 2 - t / 2, "head");
    horiz(y - h / 2 + t / 2, "sill");
    // sides depend on axis
    if (axis === "z") { vert(x - w / 2 + t / 2, z, "l"); vert(x + w / 2 - t / 2, z, "r"); }
    else { vert(x, z - w / 2 + t / 2, "l"); vert(x, z + w / 2 - t / 2, "r"); }
    // mullion
    if (axis === "z") box(g, `${name}_mul`, t * 0.7, h, d * 0.8, x, y, z, C.BONE);
    else box(g, `${name}_mul`, d * 0.8, h, t * 0.7, x, y, z, C.BONE);
    // warm lit pane: emissive amber glass behind the mullion — windows read
    // as LIT from outside at dusk (interior lights exist since loop #4)
    const pane = new THREE.Mesh(
        axis === "z" ? new THREE.BoxGeometry(w - 2 * t, h - 2 * t, 0.03) : new THREE.BoxGeometry(0.03, h - 2 * t, w - 2 * t),
        new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xfeec78, emissiveIntensity: 0.85, roughness: 0.4 }),
    );
    pane.name = `${name}_pane`;
    pane.position.set(x, y, z);
    g.add(pane);
    // OPEN SHUTTERS flanking the window (slight outward flare — era craft;
    // every window in the village gets them via the kit). Outward = away
    // from the wall's own center: N windows push -z, S push +z, W push -x,
    // E push +x (the window's position on its wall tells us which face).
    const outZ = axis === "z" ? Math.sign(z) : 0;
    const outX = axis === "x" ? Math.sign(x) : 0;
    for (const s of [-1, 1]) {
        const shut = axis === "z"
            ? new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, h + 0.06, 0.04), mat(C.BONE, 0.85, 0))
            : new THREE.Mesh(new THREE.BoxGeometry(0.04, h + 0.06, w * 0.5), mat(C.BONE, 0.85, 0));
        shut.name = `${name}_shut_${s < 0 ? "w" : "e"}`;
        if (axis === "z") {
            shut.position.set(x + s * (w / 2 + w * 0.22), y, z + outZ * 0.12);
            shut.rotation.y = s * outZ * 0.38;
        } else {
            shut.position.set(x + outX * 0.12, y, z + s * (w / 2 + w * 0.22));
            shut.rotation.y = s * outX * 0.38;
        }
        g.add(shut);
    }
}

/** Door frame: jambs + lintel in bone, around a dark opening. */
export function doorFrame(g: THREE.Group, name: string, x: number, y: number, z: number, w: number, h: number, axis: "x" | "z") {
    const t = 0.08, d = 0.18;
    if (axis === "z") {
        box(g, `${name}_jl`, t, h, d, x - w / 2 - t / 2, y, z, C.BONE);
        box(g, `${name}_jr`, t, h, d, x + w / 2 + t / 2, y, z, C.BONE);
        box(g, `${name}_lin`, w + 2 * t, t, d, x, y + h / 2 + t / 2, z, C.BONE);
    } else {
        box(g, `${name}_jl`, d, h, t, x, y, z - w / 2 - t / 2, C.BONE);
        box(g, `${name}_jr`, d, h, t, x, y, z + w / 2 + t / 2, C.BONE);
        box(g, `${name}_lin`, d, t, w + 2 * t, x, y + h / 2 + t / 2, z, C.BONE);
    }
}

/** Porch: deck slab + posts + small shed roof. Roof slopes toward -axisDir. */
export function porch(g: THREE.Group, name: string, cx: number, cz: number, w: number, d: number, deckY: number, h: number, axis: "x" | "z", dir: 1 | -1, roofC = C.MID) {
    // deck
    if (axis === "z") box(g, `${name}_deck`, w, 0.12, d, cx, deckY + 0.06, cz, C.MID);
    else box(g, `${name}_deck`, d, 0.12, w, cx, deckY + 0.06, cz, C.MID);
    // 4 posts
    const px = axis === "z" ? w / 2 - 0.08 : 0;
    const pz = axis === "z" ? 0 : d / 2 - 0.08;
    const post = (dx: number, dz: number, tag: string) =>
        box(g, `${name}_${tag}`, 0.09, h, 0.09, cx + dx, deckY + h / 2, cz + dz, C.DARK);
    if (axis === "z") { post(-px, -pz, "p1"); post(px, -pz, "p2"); post(-px, pz, "p3"); post(px, pz, "p4"); }
    else { post(-px, -pz, "p1"); post(px, -pz, "p2"); post(-px, pz, "p3"); post(px, pz, "p4"); }
    // shed roof: slab tilted
    const slabLen = d * 1.1;
    const tilt = 0.28;
    const r = new THREE.Mesh(new THREE.BoxGeometry(axis === "z" ? w + 0.5 : 0.1, 0.08, axis === "z" ? 0.1 : slabLen + 0.5), mat(roofC, 0.9, 0));
    r.name = `${name}_roof`;
    if (axis === "z") { r.geometry = new THREE.BoxGeometry(w + 0.5, 0.08, slabLen); r.rotation.x = dir * tilt; r.position.set(cx, deckY + h + 0.1, cz); }
    else { r.geometry = new THREE.BoxGeometry(slabLen + 0.5, 0.08, w + 0.5); r.rotation.z = -dir * tilt; r.position.set(cx, deckY + h + 0.1, cz); }
    g.add(r);
}

/** Chimney: tapered shoulder + stack + cap + FLUE POT (the smoke rim). */
export function chimney(g: THREE.Group, name: string, x: number, z: number, baseY: number, topY: number, c = C.DARK) {
    // shoulder: wider base where the stack meets the roof slope
    const shH = 0.35;
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.46, shH, 8), mat(c, 0.95, 0));
    sh.name = `${name}_shoulder`;
    sh.position.set(x, baseY + shH / 2 - 0.05, z);
    g.add(sh);
    const stackTop = topY - 0.12;
    box(g, `${name}_stack`, 0.42, stackTop - (baseY + shH - 0.05), 0.42, x, (baseY + shH - 0.05 + stackTop) / 2, z, c);
    box(g, `${name}_cap`, 0.58, 0.12, 0.58, x, topY + 0.06, z, C.STONE);
    // flue pot: rimmed cylinder rising from the cap — where smoke leaves
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.22, 8), mat(C.MID, 0.9, 0));
    pot.name = `${name}_pot`;
    pot.position.set(x, topY + 0.23, z);
    g.add(pot);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 5, 10), mat(C.MID, 0.9, 0));
    rim.name = `${name}_rim`;
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, topY + 0.34, z);
    g.add(rim);
}

// ================= ERA-3 COLLISION KIT (Amendment 9) =================
// The client's trimesh gates: ROOM_MIN_AREA 16m², ROOM_MIN_H 2.2m (with
// margin: build at >=20m² / >=2.4m). Doorways: >=1.4m clear, threshold
// <=0.25m, 2m x 1.5m clear apron both sides (caller keeps aprons empty).

/** Era-3 clearance constants (Collision Laws L1/L2). */
export const CLEAR = { doorGap: 1.4, doorH: 2.2, apronW: 2.0, apronD: 1.5, minArea: 20, minH: 2.4 };

/** Wall with a REAL door gap: two flanks + lintel + threshold step (<=0.25m).
 * Wall runs along X (axis "z" wall: faces +/-Z) or Z (axis "x").
 * gapW/gapH default to CLEAR.doorGap/CLEAR.doorH. floorY = floor top. */
export function doorGapWall(g: THREE.Group, name: string, len: number, H: number, T: number, cx: number, floorY: number, cz: number, axis: "x" | "z", c = C.STONE, gapW = CLEAR.doorGap, gapH = CLEAR.doorH) {
    const flank = (len - gapW) / 2;
    const lh = gapH;
    const over = (H - lh) / 2;
    const off = gapW / 2 + flank / 2;
    if (axis === "z") {
        box(g, `${name}_fl_w`, flank, H, T, cx - off, floorY + H / 2, cz, c);
        box(g, `${name}_fl_e`, flank, H, T, cx + off, floorY + H / 2, cz, c);
        box(g, `${name}_lintel`, gapW, H - lh, T, cx, floorY + lh + (H - lh) / 2, cz, C.BONE);
        box(g, `${name}_threshold`, gapW, 0.22, T * 1.6, cx, floorY + 0.11, cz, C.MID);
        // STOOP (new-era loop 16): a lower step at grade centered on the
        // door plane — turns the single 0.42-0.59 jump into two rises
        const stoopH = (floorY + 0.22) / 2;
        box(g, `${name}_stoop`, gapW + 0.15, stoopH, 0.65, cx, stoopH / 2, cz, C.STONE);
        // JAMB STONES: vertical cases framing the opening (slightly proud
        // of the wall face) + HEADER COURSE of small blocks above the lintel
        for (const jx of [-1, 1]) {
            box(g, `${name}_jamb${jx < 0 ? "w" : "e"}`, 0.12, lh, T * 1.3, cx + jx * (gapW / 2 + 0.06), floorY + lh / 2, cz, C.BONE);
        }
        for (const hx of [-0.42, -0.14, 0.14, 0.42]) {
            box(g, `${name}_hdr_${Math.round((hx + 1) * 100)}`, 0.26, 0.14, T * 1.1, cx + hx * gapW, floorY + lh + 0.07, cz, c);
        }
    } else {
        box(g, `${name}_fl_n`, flank, H, T, cx, floorY + H / 2, cz - off, c);
        box(g, `${name}_fl_s`, flank, H, T, cx, floorY + H / 2, cz + off, c);
        box(g, `${name}_lintel`, T, H - lh, gapW, cx, floorY + lh + (H - lh) / 2, cz, C.BONE);
        box(g, `${name}_threshold`, T * 1.6, 0.22, gapW, cx, floorY + 0.11, cz, C.MID);
        // STOOP (new-era loop 16): z-axis variant — same two-rise step
        const stoopH = (floorY + 0.22) / 2;
        box(g, `${name}_stoop`, 0.65, stoopH, gapW + 0.15, cx, stoopH / 2, cz, C.STONE);
        // JAMB STONES + HEADER COURSE (z-axis variant)
        for (const jz of [-1, 1]) {
            box(g, `${name}_jamb${jz < 0 ? "n" : "s"}`, T * 1.3, lh, 0.12, cx, floorY + lh / 2, cz + jz * (gapW / 2 + 0.06), C.BONE);
        }
        for (const hz of [-0.42, -0.14, 0.14, 0.42]) {
            box(g, `${name}_hdrz_${Math.round((hz + 1) * 100)}`, T * 1.1, 0.14, 0.26, cx, floorY + lh + 0.07, cz + hz * gapW, c);
        }
    }
}

/** Solid wall span (no gap). axis = the axis the wall RUNS ALONG:
 *  "x" → long in X, thin in Z (a north/south/back wall);
 *  "z" → long in Z, thin in X (a west/east wall).
 *  (NOTE the opposite convention from doorGapWall, whose axis is the
 *  FACING axis — kept for era-1 call compatibility.) */
export function wallSpan(g: THREE.Group, name: string, len: number, H: number, T: number, cx: number, floorY: number, cz: number, axis: "x" | "z", c = C.STONE) {
    // tex-2 TIMBER: wall panels carry a weathered-wood tile — 3 muted tones
    // anchored on the old flat STONE color (reads identical at distance).
    // ONE material instance for every wallSpan in every consumer (tile dedup
    // collapses them in glbwrite). Plinth stays plain STONE (grounding).
    const wallMat = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
    const mk = (w: number, d: number) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), wallMat);
        m.name = name;
        m.position.set(cx, floorY + H / 2, cz);
        g.add(m);
    };
    if (axis === "x") {
        mk(len, T);
        // BASE COURSE (loop #97): a wider plinth where the wall meets the
        // ground — the footing every real stone building shows
        const p = new THREE.Mesh(new THREE.BoxGeometry(len + 0.08, 0.22, T + 0.08), stoneMat());
        p.name = `${name}_plinth`;
        p.position.set(cx, floorY + 0.11, cz);
        g.add(p);
    } else {
        mk(T, len);
        const p = new THREE.Mesh(new THREE.BoxGeometry(T + 0.08, 0.22, len + 0.08), stoneMat());
        p.name = `${name}_plinth`;
        p.position.set(cx, floorY + 0.11, cz);
        g.add(p);
    }
}

/** Door apron rect (world coords) for the Task-16 audit: pos = entity pos,
 * yaw = entity yaw. Local door is on +Z; apron straddles the door plane. */
export function doorApron(pos: [number, number, number], yaw: number, depth = CLEAR.apronD, halfW = CLEAR.apronW / 2) {
    // local +Z direction rotated by yaw (three.js Y-rotation convention)
    const dzx = Math.sin(yaw), dzz = Math.cos(yaw);
    const cx = pos[0] + dzx * depth / 2;
    const cz = pos[2] + dzz * depth / 2;
    return { cx, cz, halfW, halfD: depth / 2, dirx: dzx, dirz: dzz };
}

/** L1 self-check: throw if a plan violates the room gates (with margin). */
export function assertRoomScale(w: number, d: number, h: number, label: string) {
    if (w * d < CLEAR.minArea) throw new Error(`${label}: footprint ${w * d}m² < ${CLEAR.minArea}m² (L1)`);
    if (h < CLEAR.minH) throw new Error(`${label}: interior height ${h}m < ${CLEAR.minH}m (L1)`);
}

/** STRUCTURES LANE primitive (struct-3): logarithmic (golden-spiral) ramp
 * ribbon. Radius interpolates geometrically r0 -> r1 across `turns` turns
 * while rising y0 -> y1 — the shell/cyclone family silhouette. Segments are
 * tangent-oriented boxes in ONE material (merge into a single node);
 * optional tread caps in a second material. `phase` = start azimuth
 * (radians; 0 -> +Z, matching CylinderGeometry parametrization). */
export function spiralRamp(
    g: THREE.Group, name: string,
    r0: number, r1: number, turns: number, y0: number, y1: number,
    segs: number, ribbonH: number, thick: number, phase: number,
    ribbonMat: THREE.Material, treadMat: THREE.Material | null,
) {
    const total = turns * Math.PI * 2;
    for (let i = 0; i < segs; i++) {
        const t = (i + 0.5) / segs;                 // segment-center param
        const phi = phase + t * total;
        const r = r0 * Math.pow(r1 / r0, t);        // logarithmic spiral
        const y = y0 + (y1 - y0) * t;
        const dphi = total / segs;
        const len = Math.max(0.18, r * dphi * 1.22); // arc length + overlap
        const seg = new THREE.Mesh(new THREE.BoxGeometry(len, ribbonH, thick), ribbonMat);
        seg.name = `${name}_s${i}`;
        seg.position.set(r * Math.sin(phi), y, r * Math.cos(phi));
        seg.rotation.y = phi;                       // box x-axis -> tangent
        g.add(seg);
        if (treadMat) {
            const tread = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, thick * 0.72), treadMat);
            tread.name = `${name}_t${i}`;
            tread.position.set(r * Math.sin(phi), y + ribbonH / 2 + 0.03, r * Math.cos(phi));
            tread.rotation.y = phi;
            g.add(tread);
        }
    }
}

/** STRUCTURES LANE primitive (struct-4): hyperbolic-paraboloid canopy as
 * its own straight rulings — slats of ONE family of the hypar
 * z = k(x² − y²). The saddle is expressed entirely by straight timber:
 * each slat is a true ruling line (y = x + c family), no curved geometry.
 * Square plan [-a,a]², canopy z=0 plane at `baseY`, corner rise k·a².
 * Slats overhang the square by `over` along their own axis. One material
 * for all slats (single merged node). */
export function hyparShell(
    g: THREE.Group, name: string,
    a: number, baseY: number, k: number, slats: number, over: number,
    slatMat: THREE.Material,
) {
    const start = new THREE.Vector3(), end = new THREE.Vector3();
    for (let i = 0; i < slats; i++) {
        const c = -2 * a + (4 * a * (i + 0.5)) / slats; // ruling offset y=x+c, c ∈ [-2a, 2a]
        // line P(t) = (t, t+c, k(t² − (t+c)²)); t range where |t|<=a and |t+c|<=a
        const tMin = Math.max(-a, -a - c), tMax = Math.min(a, a - c);
        if (tMax - tMin < 0.3) continue;
        const z = (x: number, y: number) => k * (x * x - y * y);
        // Overhang budget law (struct-40): along a ruling z is LINEAR in t
        // with slope 2k|c| (up to 2k·2a per slat). A FIXED t-space overhang
        // extrapolates steep rulings far past the boundary beams — tips at
        // grade (dangling read) and 0.6m above the crest (ragged margin).
        // Budget the extension so its rise/dip never exceeds 0.15m (a kiss,
        // sub-perceptible at 18m): flat centre slats keep the full sweep;
        // steep slats end at the rim, leaving the parabolic edge beams
        // owning the silhouette. Decode-verified extremes before: y −0.02…6.41.
        const slope = 2 * k * Math.abs(c); // |dz/dt| along this ruling
        // Budget BOTH the vertical rise/dip (0.15m) and the 3D extension
        // length (0.30m — rafter-tail scale, not spears) so no ruling can
        // overshoot the boundary beams in ANY direction.
        const zBudget = 0.15, lenBudget = 0.30;
        const maxT = Math.min(lenBudget / Math.sqrt(2 + slope * slope), slope > 1e-6 ? zBudget / slope : over);
        const budget = Math.min(over / Math.SQRT2, maxT);
        const t0 = tMin - budget, t1 = tMax + budget;
        const p0 = (t: number) => [t, t + c, z(t, t + c)] as [number, number, number];
        const [x0, y0, z0] = p0(t0), [x1, y1, z1] = p0(t1);
        start.set(x0, baseY + z0, y0); end.set(x1, baseY + z1, y1);
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const len = start.distanceTo(end);
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, len), slatMat);
        slat.name = `${name}_s${i}`;
        slat.position.copy(mid);
        slat.lookAt(end); // +z axis of the box runs along the ruling
        g.add(slat);
    }
}
