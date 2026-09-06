// mkvillage-houses.ts — the four village houses, each composed from housekit.
// Local frames: door on +Z, roofs ridge along X unless noted. All walls ≥2.4m
// interior height, doorways real gaps (walk-through under exact-trimesh).
import * as THREE from "three";
import { toGLB } from "./glbwrite.ts";
import { C, box, gableRoof, coneRoof, windowFrame, doorFrame, porch, chimney } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ============ 1. TOWER HOUSE (24,-6) — round, two floors, balcony ============
// Cylinder wall with door gap + 3 windows; interior floor at 2.6; balcony
// ring at 3.0; conical roof. R=2.6, H=5.6.
function towerHouse() {
    const g = new THREE.Group();
    const R = 2.6, H = 5.6, T = 0.22;
    // wall as arc segments (24), skipping the door arc (front, +Z, ±16°)
    const segs = 24, doorArc = Math.PI / 5;
    for (let i = 0; i < segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        const ax = Math.abs(((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - Math.PI / 2);
        const nearDoor = Math.abs(a - Math.PI / 2) < doorArc; // door at +Z (a=90°)
        const h = nearDoor ? H - 2.15 : H;
        const y0 = nearDoor ? 2.15 : 0;
        const m = new THREE.Mesh(
            new THREE.BoxGeometry(2 * R * Math.tan(Math.PI / segs) + 0.02, h, T),
            (windowFrameMat as any) ?? mat(C.STONE, 0.95, 0),
        );
        m.name = `tower_wall_${i}`;
        m.position.set(Math.cos(a) * (R - T / 2), y0 + h / 2, Math.sin(a) * (R - T / 2));
        m.rotation.y = -a + Math.PI / 2;
        g.add(m);
    }
    // lintel above door
    box(g, "tower_lintel", 1.5, 0.4, T, 0, 2.15 + 0.2, R - T / 2, C.BONE);
    // interior floor (upper storey)
    box(g, "tower_floor2", 2 * (R - T), 0.15, 2 * (R - T), 0, 2.55, 0, C.MID);
    // balcony ring at 3.0 (front half): deck + railing
    const balc = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.7, R + 0.7, 0.1, 24, 1, false, -Math.PI / 3, Math.PI + Math.PI / 3 * 2 * 0), mat(C.MID, 0.9, 0));
    balc.name = "tower_balcony";
    balc.position.y = 3.0;
    g.add(balc);
    // improve-9 D1b: fascia band under the deck edge — same arc params as the
    // deck, gives the 0.1m slab a visible 0.24m edge and caps both ragged ends.
    const fascia = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.7, R + 0.7, 0.24, 24, 1, true, -Math.PI / 3, Math.PI), mat(C.MID, 0.9, 0));
    fascia.name = "tower_bfascia";
    fascia.position.y = 2.95;
    g.add(fascia);
    // improve-9 D1a: stone corbel arms under the deck (skip the front ±18° —
    // artwalk b21 rider keep-out zone at the drum face below y 2.7).
    for (const th of [-52.5, -30, 30, 52.5, 75, 97.5, 112.5]) {
        const rad = (th * Math.PI) / 180;
        const cor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.8), mat(C.STONE, 0.95, 0));
        cor.name = `tower_corbel_${th}`;
        cor.position.set(Math.sin(rad) * 2.92, 2.86, Math.cos(rad) * 2.92);
        cor.rotation.y = rad;
        g.add(cor);
    }
    // improve-9 D3: railing rebuilt in the DECK's own convention. The old
    // loop placed posts at (cos a, sin a) — centered on +X, ~60° off the
    // deck arc (which is front-centered, x=sinθ z=cosθ, θ∈[-60°,+120°]).
    // 13 posts + top rail + mid rail now follow the deck exactly.
    const rR = R + 0.65;
    for (let i = 0; i <= 12; i++) {
        const th = -Math.PI / 3 + (i / 12) * Math.PI;
        box(g, `tower_rail_${i}`, 0.07, 0.9, 0.07, Math.sin(th) * rR, 3.5, Math.cos(th) * rR, C.DARK);
    }
    for (let i = 0; i < 12; i++) {
        const a1 = -Math.PI / 3 + (i / 12) * Math.PI;
        const am = -Math.PI / 3 + ((i + 0.5) / 12) * Math.PI;
        const seg = new THREE.Mesh(new THREE.BoxGeometry(2 * rR * Math.sin(Math.PI / 24) + 0.1, 0.08, 0.09), mat(C.MID, 0.9, 0));
        seg.name = `tower_brail_${i}`;
        seg.position.set(Math.sin(am) * rR, 3.9, Math.cos(am) * rR);
        seg.rotation.y = am;
        g.add(seg);
        const seg2 = new THREE.Mesh(new THREE.BoxGeometry(2 * rR * Math.sin(Math.PI / 24) + 0.1, 0.06, 0.07), mat(C.MID, 0.9, 0));
        seg2.name = `tower_bmidrail_${i}`;
        seg2.position.set(Math.sin(am) * rR, 3.5, Math.cos(am) * rR);
        seg2.rotation.y = am;
        g.add(seg2);
    }
    // improve-9 D2c: exterior ladder at the deck's -60° end (front-left,
    // plaza-visible). Leans ~6° out from the drum to the fascia top; the
    // whole ladder stays inside the standing bbox (SAT-neutral re-place).
    {
        const lad = new THREE.Group();
        for (const s of [-1, 1]) {
            const st = new THREE.Mesh(new THREE.BoxGeometry(0.09, 3.85, 0.09), mat(C.DARK, 0.9, 0));
            st.name = `tower_ladside_${s < 0 ? "a" : "b"}`;
            st.position.set(s * 0.28, 1.925, 0);
            lad.add(st);
        }
        for (let lr = 0; lr < 11; lr++) {
            const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 5), mat(C.MID, 0.9, 0));
            rung.rotation.z = Math.PI / 2;
            rung.position.set(0, 0.38 + lr * 0.345, 0);
            rung.name = `tower_lrung_${lr}`;
            lad.add(rung);
        }
        lad.rotation.order = "YXZ";
        lad.rotation.y = -Math.PI / 3;
        lad.rotation.x = 0;
        lad.position.set(Math.sin(-Math.PI / 3) * 3.04, 0.03, Math.cos(-Math.PI / 3) * 3.04);
        g.add(lad);
    }
    // windows (upper, 3 around)
    for (const [wx, wz, a] of [[R - T, 0, 0], [-(R - T), 0, Math.PI], [0, -(R - T), -Math.PI / 2]] as const) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.9, 0.1), mat(C.BONE, 0.6, 0.1));
        win.name = `tower_win_${a.toFixed(1)}`;
        win.position.set(wx, 4.0, wz);
        win.rotation.y = a;
        g.add(win);
    }
    // ground window on -Z
    windowFrame(g, "tower_gwin", 0, 1.5, -(R - T / 2), 0.6, 0.9, "z");
    // door frame
    doorFrame(g, "tower_door", 0, 1.05, R - T / 2, 1.05, 2.1, "z");
    // conical roof + finial
    coneRoof(g, "tower_roof", R + 0.3, 2.2, H);
    box(g, "tower_finial", 0.12, 0.5, 0.12, 0, H + 2.2 + 0.25, 0, C.BRASS);
    // ---- v2 ground floor: the study (desk, chair, bookshelf, rug) ----
    box(g, "tw_desk", 1.5, 0.08, 0.7, -0.7, 0.95, -1.3, C.MID);
    box(g, "tw_deskleg_a", 0.08, 0.8, 0.08, -1.3, 0.55, -1.3, C.DARK);
    box(g, "tw_deskleg_b", 0.08, 0.8, 0.08, -0.1, 0.55, -1.3, C.DARK);
    const twchair = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.4, 7), mat(C.MID, 0.9, 0));
    twchair.position.set(-0.7, 0.2, -0.55);
    twchair.name = "tw_chair";
    g.add(twchair);
    // open book on the desk + quill
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.24), mat(C.BONE, 0.85, 0.05));
    book.position.set(-0.75, 1.01, -1.3);
    book.name = "tw_book";
    g.add(book);
    const quill = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.22, 5), mat(0xe6e6b4, 0.8, 0.05));
    quill.rotation.z = 0.5;
    quill.position.set(-0.45, 1.08, -1.2);
    quill.name = "tw_quill";
    g.add(quill);
    // interior-7 / built-in art: a brass meridian instrument shares the desk
    // with the book and quill. One concentric ring plus crossed rule-lines
    // carries the Golden Measure vocabulary inward without painted noise.
    const meridian = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.022, 6, 18), mat(C.BRASS, 0.4, 0.5));
    meridian.name = "tw_meridian";
    meridian.rotation.x = Math.PI / 2;
    meridian.position.set(-1.15, 1.035, -1.3);
    g.add(meridian);
    box(g, "tw_meridian_rule_x", 0.31, 0.018, 0.025, -1.15, 1.035, -1.3, C.BRASS);
    box(g, "tw_meridian_rule_z", 0.025, 0.018, 0.31, -1.15, 1.035, -1.3, C.BRASS);
    // bookshelf against the -X wall (2 shelves + 8 books)
    box(g, "tw_shelfframe", 0.3, 1.9, 1.4, -(R - 0.3), 0.95 + 0.14, 0.3, C.DARK);
    for (const sl of [0, 1]) {
        box(g, `tw_shelf_${sl}`, 0.26, 0.05, 1.3, -(R - 0.28), 0.14 + 0.85 + sl * 0.6, 0.3, C.MID);
        for (let bk = 0; bk < 4; bk++) {
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.3, 0.06), mat(bk % 2 ? 0xa08232 : 0x4e5e6c, 0.9, 0));
            b.rotation.x = Math.PI / 2;
            b.position.set(-(R - 0.28), 0.14 + 1.05 + sl * 0.6, -0.1 + bk * 0.28);
            b.name = `tw_book_${sl}_${bk}`;
            g.add(b);
        }
    }
    // round rug
    const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.03, 14), mat(0x7a6438, 0.97, 0));
    rug.position.set(0, 0.16, 0);
    rug.name = "tw_rug";
    g.add(rug);
    // ladder to the upper floor
    for (let lr = 0; lr < 6; lr++) {
        const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 5), mat(C.MID, 0.9, 0));
        rung.rotation.z = Math.PI / 2;
        rung.position.set(1.55, 0.5 + lr * 0.38, 1.2);
        rung.name = `tw_rung_${lr}`;
        g.add(rung);
    }
    box(g, "tw_ladderside_a", 0.06, 2.4, 0.06, 1.55, 1.45, 1.48, C.DARK);
    box(g, "tw_ladderside_b", 0.06, 2.4, 0.06, 1.55, 1.45, 0.92, C.DARK);
    // ---- v2 upper floor: the bedchamber (bed, chest, candle stand) ----
    box(g, "tw_bedframe", 1.0, 0.2, 1.9, -1.3, 2.63 + 0.1, -0.6, C.DARK);
    box(g, "tw_mattress", 0.9, 0.13, 1.75, -1.3, 2.63 + 0.27, -0.6, 0x78704a);
    box(g, "tw_pillow", 0.38, 0.09, 0.3, -1.3, 2.63 + 0.38, 0.1, C.BONE);
    box(g, "tw_blanket", 0.92, 0.05, 0.95, -1.3, 2.63 + 0.36, -1.0, 0xa08232);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.5), mat(0x7c6832, 0.9, 0));
    chest.position.set(-1.35, 2.63 + 0.23, 1.35);
    chest.name = "tw_chest";
    g.add(chest);
    box(g, "tw_chestlid", 0.84, 0.1, 0.54, -1.35, 2.63 + 0.5, 1.35, 0x6c5426);
    // candle stand by the bed
    box(g, "tw_cstand", 0.3, 0.05, 0.3, -0.35, 2.63 + 0.62, -1.5, C.MID);
    box(g, "tw_cstandleg", 0.07, 0.55, 0.07, -0.35, 2.63 + 0.3, -1.5, C.DARK);
    const twc = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.033, 0.13, 6), mat(0xffe8c8, 0.6, 0.15));
    twc.position.set(-0.35, 2.63 + 0.71, -1.5);
    twc.name = "tw_candle";
    g.add(twc);
    const twf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.033, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: 0xffa45f, emissiveIntensity: 1.25, roughness: 0.4 }));
    twf.position.set(-0.35, 2.63 + 0.8, -1.5);
    twf.name = "tw_flame";
    g.add(twf);
    // improve-9 D1c: study-desk candle — warm read through the door bay at
    // night, replacing the pure-black void (windowFrame lit-pane recipe).
    const scnd = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.033, 0.13, 6), mat(0xffe8c8, 0.6, 0.15));
    scnd.position.set(-0.15, 1.05, -1.3);
    scnd.name = "tw_candle2";
    g.add(scnd);
    const sfl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.033, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: 0xffa45f, emissiveIntensity: 1.25, roughness: 0.4 }));
    sfl.position.set(-0.15, 1.13, -1.3);
    sfl.name = "tw_flame2";
    g.add(sfl);
    // improve-9 D2a: banner replaced per polish-273 cloth law — swallowtail
    // pennant with a real V-notch in the free edge, hoisted on the top rail
    // OUTSIDE the deck edge (clear of the b21 rider below y 2.7).
    {
        const shp = new THREE.Shape();
        shp.moveTo(0, 0);
        shp.lineTo(0, 0.92);
        shp.lineTo(0.34, 0.78);
        shp.lineTo(0.17, 0.46); // V-notch: in to the middle, then out
        shp.lineTo(0.34, 0.14);
        shp.lineTo(0, 0);
        const pen = new THREE.Mesh(
            new THREE.ShapeGeometry(shp),
            new THREE.MeshStandardMaterial({ color: 0xa06c32, roughness: 0.95, metalness: 0, side: THREE.DoubleSide }),
        );
        pen.name = "tw_pennant";
        // improve-10 decode fix: NO rotation.x — the XY shape already hangs
        // vertical; the old -pi/2 laid it flat as a fin under the deck.
        pen.position.set(-0.17, 2.96, R + 0.73);
        g.add(pen);
        // hoist bar on the rail: y 3.88, spans the pennant's 0.34 width
        // (improve-10: centered on the cloth, was offset -0.17)
        box(g, "tw_penbar", 0.42, 0.05, 0.05, 0, 3.88, R + 0.7, C.DARK);
    }
    // improve-9 D2b: real balcony door on the drum above the deck — timber
    // slab + frame + brass handle (front face has no window: clean zone).
    // improve-10 decode fix: slab mounted PROUD of the wall face (outer z
    // 2.60) — the old center z=2.51 buried it inside the wall band (2.38..
    // 2.60), invisible from outside.
    box(g, "tw_bdoor", 0.95, 1.25, 0.1, 0, 3.62, R + 0.02, 0x5c4a30);
    doorFrame(g, "tw_bdoorframe", 0, 3.62, R + 0.02, 0.95, 1.25, "z");
    box(g, "tw_bdoorhandle", 0.07, 0.07, 0.05, 0.32, 3.55, R + 0.08, C.BRASS);
    // interior-7: target-only merge brings this legacy room under the current
    // draw-call law while leaving the sibling house outputs untouched.
    mergeByMaterial(g, "twi3");
    return g;
}

// mat import needed locally (tower used windowFrameMat placeholder)
import { mat } from "./glbwrite.ts";
const windowFrameMat = null;

// ============ 2. LONGHOUSE (10,-8) — steep gable, porch posts ============
function longhouse() {
    const g = new THREE.Group();
    const W = 8.2, D = 4.6, H = 2.55, T = 0.2;
    // floor
    box(g, "long_floor", W, 0.28, D, 0, 0.0, 0, C.DARK);
    // long walls (±Z) with window gaps: solid + frames
    for (const s of [-1, 1]) {
        box(g, `long_wall_${s < 0 ? "n" : "s"}`, W, H, T, 0, H / 2 + 0.14, s * (D / 2 - T / 2), C.STONE);
        windowFrame(g, `long_win_${s < 0 ? "n" : "s"}1`, -2.2, 1.5, s * (D / 2 - T / 2), 0.8, 1.0, "z");
        windowFrame(g, `long_win_${s < 0 ? "n" : "s"}2`, 2.2, 1.5, s * (D / 2 - T / 2), 0.8, 1.0, "z");
    }
    // end walls (±X): one with door (+X end, facing plaza east... actually
    // door on +Z long side is better for path layout; put door on south long
    // wall center, so cut that wall instead — simpler: door on +X gable end.
    box(g, "long_wall_w", T, H, D, -(W / 2 - T / 2), H / 2 + 0.14, 0, C.STONE);
    // east end wall with door gap
    const eX = W / 2 - T / 2;
    box(g, "long_wall_e_n", T, H, (D - 1.1) / 2, eX, H / 2 + 0.14, -(1.1 / 2 + (D - 1.1) / 4), C.STONE);
    box(g, "long_wall_e_s", T, H, (D - 1.1) / 2, eX, H / 2 + 0.14, (1.1 / 2 + (D - 1.1) / 4), C.STONE);
    box(g, "long_lintel", T, H - 2.1, 1.1, eX, 2.1 + (H - 2.1) / 2 + 0.14, 0, C.BONE);
    doorFrame(g, "long_door", eX, 1.05, 0, 1.0, 2.1, "x");
    // steep gable roof (ridge X)
    gableRoof(g, "long_roof", W, D, 2.1, H + 0.14, 0.45, C.MID);
    // chimney mid-ridge
    chimney(g, "long_chimney", -1.5, 0, H + 2.0, H + 2.9);
    // porch on east (door side): deck + posts + shed roof
    porch(g, "long_porch", eX + 0.9, 0, 2.6, 1.9, 0.14, 2.2, "x", 1);
    // ---- v2 interior: hearth, tables, shelving, sconces, partition ----
    // hearth against west wall (firebox + glow + mantel + firewood)
    box(g, "long_hearth", 0.5, 1.15, 1.6, -(W / 2 - 0.45), 0.575 + 0.14, 0, C.MID);
    const fire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 0), mat(0xff9040, 0.35, 0.6));
    fire.position.set(-(W / 2 - 0.5), 0.75 + 0.14, 0);
    fire.name = "long_fire";
    g.add(fire);
    box(g, "long_mantel", 0.7, 0.12, 1.9, -(W / 2 - 0.28), 1.35 + 0.14, 0, C.DARK);
    for (let wl = 0; wl < 3; wl++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 6), mat(0x56503c, 0.95, 0));
        log.rotation.z = Math.PI / 2;
        log.position.set(-(W / 2 - 0.75), 0.14 + 0.07 + wl * 0.15, 0.95 + (wl % 2) * 0.18);
        log.name = `long_wood_${wl}`;
        g.add(log);
    }
    // two trestle tables w/ benches (the longhall common room)
    for (const [ti, tx] of [[0, -1.2], [1, 1.4]] as const) {
        box(g, `long_table_${ti}`, 2.1, 0.09, 0.85, tx, 0.86, 0, C.MID);
        box(g, `long_tleg_${ti}a`, 0.1, 0.72, 0.1, tx - 0.85, 0.36, 0, C.DARK);
        box(g, `long_tleg_${ti}b`, 0.1, 0.72, 0.1, tx + 0.85, 0.36, 0, C.DARK);
        box(g, `long_bench_n${ti}`, 2.1, 0.07, 0.3, tx, 0.52, -0.75, C.MID);
        box(g, `long_bench_s${ti}`, 2.1, 0.07, 0.3, tx, 0.52, 0.75, C.MID);
        // table settings: bowls + candle
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.07, 7), mat(C.BONE, 0.85, 0.05));
        bowl.position.set(tx - 0.5, 0.94, 0.2);
        bowl.name = `long_bowl_${ti}`;
        g.add(bowl);
        const jug = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.18, 7), mat(0xa0a248, 0.7, 0.1));
        jug.position.set(tx + 0.45, 0.99, -0.2);
        jug.name = `long_jug_${ti}`;
        g.add(jug);
    }
    // candle on each table
    for (const [ci, cx] of [[0, -1.2], [1, 1.4]] as const) {
        const cd = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.14, 6), mat(0xffe8c8, 0.6, 0.15));
        cd.position.set(cx, 0.98, 0);
        cd.name = `long_candle_${ci}`;
        g.add(cd);
        const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), mat(0xffc98a, 0.4, 0));
        fl.position.set(cx, 1.08, 0);
        fl.name = `long_flame_${ci}`;
        g.add(fl);
    }
    // storage shelving on north wall (shelf boards + stored goods)
    for (const sl of [0, 1]) {
        box(g, `long_shelf_${sl}`, 2.6, 0.06, 0.32, 1.4, 1.1 + sl * 0.55, -(D / 2 - 0.22), C.MID);
        for (const gi of [0, 1, 2]) {
            const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.16 + sl * 0.04, 7), mat(gi % 2 ? 0xaaaa72 : C.BONE, 0.8, 0.05));
            jar.position.set(0.5 + gi * 0.85, 1.22 + sl * 0.55, -(D / 2 - 0.22));
            jar.name = `long_jar_${sl}_${gi}`;
            g.add(jar);
        }
    }
    // wall sconces (north + south)
    for (const [si, sz] of [[0, -1], [1, 1]] as const) {
        const br = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.24), mat(C.DARK, 0.9, 0));
        br.position.set(-2.6, 1.9, sz * (D / 2 - 0.14));
        br.name = `long_sconce_${si}`;
        g.add(br);
        const gl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), mat(0xffc98a, 0.4, 0));
        gl.position.set(-2.6, 1.82, sz * (D / 2 - 0.26));
        gl.name = `long_sglow_${si}`;
        g.add(gl);
    }
    // interior partition (sleeping alcove at east end)
    box(g, "long_partition", T, H - 0.2, D - 0.3, W / 2 - 1.5, (H - 0.2) / 2 + 0.14, 0, C.MID);
    // bedrolls in the alcove
    for (const [bi, bz] of [[0, -0.8], [1, 0.8]] as const) {
        const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.5, 7), mat(0x78704a, 0.95, 0));
        roll.rotation.x = Math.PI / 2;
        roll.position.set(W / 2 - 0.85, 0.16 + 0.14, bz);
        roll.name = `long_bedroll_${bi}`;
        g.add(roll);
        const pil = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.3), mat(C.BONE, 0.9, 0));
        pil.position.set(W / 2 - 0.15, 0.34, bz);
        pil.name = `long_pillow_${bi}`;
        g.add(pil);
    }
    // exterior: window shutters (south face)
    for (const [shi, sx] of [[0, -2.2], [1, 2.2]] as const) {
        const shut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.5), mat(C.MID, 0.9, 0));
        shut.position.set(sx - 0.55, 1.5, D / 2 + 0.06);
        shut.name = `long_shutter_${shi}`;
        g.add(shut);
    }
    return g;
}

// ============ 3. GARDEN COTTAGE (5,2) — L-shape + garden wall + chimney ============
function gardenCottage() {
    const g = new THREE.Group();
    const H = 2.45, T = 0.2;
    // main block: 4.4 × 3.6, door on +Z
    const MW = 4.4, MD = 3.6;
    box(g, "gc_floor", MW + 2.2, 0.26, MD + 1.8, 0, 0, 0, C.DARK); // floor spans both wings
    box(g, "gc_wall_n", MW, H, T, 0, H / 2 + 0.13, -(MD / 2 - T / 2), C.STONE);
    // south wall with door gap
    const sZ = MD / 2 - T / 2;
    box(g, "gc_wall_sw", (MW - 1.0) / 2, H, T, -(0.5 + (MW - 1.0) / 4), H / 2 + 0.13, sZ, C.STONE);
    box(g, "gc_wall_se", (MW - 1.0) / 2, H, T, (0.5 + (MW - 1.0) / 4), H / 2 + 0.13, sZ, C.STONE);
    box(g, "gc_lintel", 1.0, H - 2.05, T, 0, 2.05 + (H - 2.05) / 2 + 0.13, sZ, C.BONE);
    doorFrame(g, "gc_door", 0, 1.0, sZ, 0.95, 2.05, "z");
    box(g, "gc_wall_w", T, H, MD, -(MW / 2 - T / 2), H / 2 + 0.13, 0, C.STONE);
    // east wall with window
    box(g, "gc_wall_e", T, H, MD, MW / 2 - T / 2, H / 2 + 0.13, 0, C.STONE);
    windowFrame(g, "gc_win_e", MW / 2 - T / 2, 1.5, 0, 0.7, 0.9, "x");
    windowFrame(g, "gc_win_n", -1.2, 1.5, -(MD / 2 - T / 2), 0.7, 0.9, "z");
    // wing: 2.2 × 2.4 attached on +X (lower)
    const WX = MW / 2 + 1.1, WH = 2.0;
    box(g, "gc_wing_wall_n", 2.2, WH, T, WX, WH / 2 + 0.13, -1.0, C.STONE);
    box(g, "gc_wing_wall_s", 2.2, WH, T, WX, WH / 2 + 0.13, 1.4 - T / 2 + 0.6, C.STONE);
    box(g, "gc_wing_wall_e", T, WH, 2.4, WX + 1.1 - T / 2, WH / 2 + 0.13, 0.2, C.STONE);
    // wing roof (lower gable)
    gableRoof(g, "gc_roof", MW, MD, 1.5, H + 0.13, 0.35);
    gableRoof(g, "gc_wing_roof", 2.2, 2.4, 1.0, WH + 0.13, 0.25);
    // big chimney on main
    chimney(g, "gc_chimney", -1.4, -0.8, H + 1.4, H + 2.6);
    // garden wall: low ring on the -Z/-X side with a gap
    const GW = 0.14, GH = 0.7;
    box(g, "gc_garden_w", GW, GH, 5.2, -(MW / 2 + 1.6), GH / 2, -1.2, C.STONE);
    box(g, "gc_garden_n", 4.4, GH, GW, -MW / 2 - 0.6, GH / 2, -3.6, C.STONE);
    // planters inside garden (2 low boxes)
    box(g, "gc_planter_a", 1.1, 0.32, 0.5, -(MW / 2 + 1.2), 0.16, -2.6, C.MID);
    box(g, "gc_planter_b", 0.6, 0.26, 0.5, -(MW / 2 + 1.4), 0.13, -1.6, C.MID);
    // ---- v2 interior: kitchen + work table + bed ----
    // kitchen in the -X corner: counter, basin, hearth w/ fire
    box(g, "gc_counter", 1.6, 0.65, 0.6, -(MW / 2 - 0.95), 0.13 + 0.325, -(MD / 2 - 0.42), C.MID);
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.14, 10), mat(0x9e9e9e, 0.6, 0.15), );
    basin.position.set(-(MW / 2 - 0.6), 0.13 + 0.72, -(MD / 2 - 0.42));
    basin.name = "gc_basin";
    g.add(basin);
    // hearth on the -Z wall beside the window
    box(g, "gc_hearth", 1.1, 1.0, 0.45, 0.9, 0.13 + 0.5, -(MD / 2 - 0.3), C.MID);
    const gcf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), mat(0xff9040, 0.35, 0.6));
    gcf.position.set(0.9, 0.13 + 0.55, -(MD / 2 - 0.38));
    gcf.name = "gc_fire";
    g.add(gcf);
    box(g, "gc_mantel", 1.3, 0.1, 0.55, 0.9, 0.13 + 1.2, -(MD / 2 - 0.3), C.DARK);
    // pot rack above the counter (bar + 3 hanging pots)
    box(g, "gc_potrack", 1.4, 0.05, 0.05, -(MW / 2 - 0.95), 1.85, -(MD / 2 - 0.3), C.DARK);
    for (let pr = 0; pr < 3; pr++) {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.13, 7), mat(0x68603a, 0.85, 0.05));
        pot.position.set(-(MW / 2 - 1.35 + pr * 0.42), 1.7, -(MD / 2 - 0.3));
        pot.name = `gc_pot_${pr}`;
        g.add(pot);
    }
    // work table center + stool + basket of vegetables
    box(g, "gc_wtable", 1.7, 0.08, 0.9, 0.2, 0.85, 0.35, C.MID);
    box(g, "gc_wtleg_a", 0.09, 0.71, 0.09, -0.5, 0.49, 0.35, C.DARK);
    box(g, "gc_wtleg_b", 0.09, 0.71, 0.09, 0.9, 0.49, 0.35, C.DARK);
    const gcstool = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.33, 7), mat(C.MID, 0.9, 0));
    gcstool.position.set(0.2, 0.13 + 0.17, 1.2);
    gcstool.name = "gc_stool";
    g.add(gcstool);
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.16, 8), mat(0xdada70, 0.9, 0));
    basket.position.set(0.55, 0.97, 0.35);
    basket.name = "gc_basket";
    g.add(basket);
    for (let vg = 0; vg < 3; vg++) {
        const car = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 6), mat(0xeab620, 0.9, 0));
        car.rotation.x = Math.PI / 2;
        car.position.set(0.47 + vg * 0.09, 1.06, 0.3 + (vg % 2) * 0.12);
        car.name = `gc_carrot_${vg}`;
        g.add(car);
    }
    // interior-6: the gardener's seed shelf sits against the west wall behind
    // the work table, outside the centered door lane. Three labelled jars
    // turn the already-furnished cottage into one specific keeper's room.
    box(g, "gc_seed_shelf", 0.28, 0.06, 1.1, -(MW / 2 - 0.18), 1.35, 0.55, C.MID);
    for (const sz of [0.18, 0.55, 0.92])
        box(g, `gc_seed_bracket_${sz}`, 0.08, 0.28, 0.08, -(MW / 2 - 0.18), 1.2, sz, C.DARK);
    for (const [si, sz] of [[0, 0.2], [1, 0.55], [2, 0.9]] as const) {
        const seed = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.18, 8), mat(si % 2 ? 0xbaae60 : 0x9a9a58, 0.85, 0));
        seed.name = `gc_seedjar_${si}`;
        seed.position.set(-(MW / 2 - 0.34), 1.47, sz);
        g.add(seed);
    }
    // bed in the +X corner
    box(g, "gc_bedframe", 1.0, 0.2, 1.85, MW / 2 - 0.8, 0.13 + 0.1, MD / 2 - 1.1, C.DARK);
    box(g, "gc_mattress", 0.9, 0.13, 1.7, MW / 2 - 0.8, 0.13 + 0.27, MD / 2 - 1.1, 0x78704a);
    box(g, "gc_pillow", 0.38, 0.09, 0.3, MW / 2 - 0.8, 0.13 + 0.38, MD / 2 - 0.35, C.BONE);
    box(g, "gc_blanket", 0.92, 0.05, 0.95, MW / 2 - 0.8, 0.13 + 0.36, MD / 2 - 1.35, 0x56724c);
    // ---- v2 garden: flowers in the planters + climbing vines + garden bench ----
    for (const [pi, px, pz] of [[0, -(MW / 2 + 1.2), -2.6], [1, -(MW / 2 + 1.4), -1.6]] as const) {
        for (let f = 0; f < 4; f++) {
            const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.055, 0), mat(f % 2 ? 0xdec64e : 0x9a748c, 0.85, 0));
            fl.position.set(px - 0.4 + f * 0.27, 0.42 + (pi === 0 ? 0.32 : 0.26), pz + (f % 2) * 0.12);
            fl.name = `gc_gflower_${pi}_${f}`;
            g.add(fl);
        }
    }
    // vine on the -X wall of the house
    for (let vv = 0; vv < 4; vv++) {
        const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), mat(0x446632, 0.92, 0));
        leaf.position.set(-MW / 2 - 0.05, 0.6 + vv * 0.42, -0.5 + Math.sin(vv) * 0.3);
        leaf.name = `gc_vine_${vv}`;
        g.add(leaf);
    }
    // garden bench inside the wall
    box(g, "gc_gbench", 1.3, 0.07, 0.34, -(MW / 2 + 1.5), 0.42, -3.1, C.MID);
    box(g, "gc_gbenchleg", 0.08, 0.4, 0.28, -(MW / 2 + 1.5), 0.2, -3.1, C.DARK);
    // interior-6: this legacy builder predated the draw-call law. Merge only
    // the target cottage; fire remains a named KEEP anchor.
    mergeByMaterial(g, "gci3");
    return g;
}

// ============ 4. ROW COTTAGE (16,18) — compact, dormer, steep roof ============
function rowCottage() {
    const g = new THREE.Group();
    const W = 4.8, D = 4.2, H = 2.5, T = 0.2;
    box(g, "rc_floor", W, 0.28, D, 0, 0, 0, C.DARK);
    // walls, door on +Z
    const sZ = D / 2 - T / 2;
    box(g, "rc_wall_n", W, H, T, 0, H / 2 + 0.14, -sZ, C.STONE);
    box(g, "rc_wall_sw", (W - 1.0) / 2, H, T, -(0.5 + (W - 1.0) / 4), H / 2 + 0.14, sZ, C.STONE);
    box(g, "rc_wall_se", (W - 1.0) / 2, H, T, (0.5 + (W - 1.0) / 4), H / 2 + 0.14, sZ, C.STONE);
    box(g, "rc_lintel", 1.0, H - 2.1, T, 0, 2.1 + (H - 2.1) / 2 + 0.14, sZ, C.BONE);
    doorFrame(g, "rc_door", 0, 1.05, sZ, 0.95, 2.1, "z");
    box(g, "rc_wall_w", T, H, D, -(W / 2 - T / 2), H / 2 + 0.14, 0, C.STONE);
    box(g, "rc_wall_e", T, H, D, W / 2 - T / 2, H / 2 + 0.14, 0, C.STONE);
    windowFrame(g, "rc_win_w", -(W / 2 - T / 2), 1.5, -0.9, 0.65, 0.85, "x");
    windowFrame(g, "rc_win_e", W / 2 - T / 2, 1.5, 0.9, 0.65, 0.85, "x");
    // steep gable roof, ridge along Z (perpendicular to others for variety)
    gableRoof(g, "rc_roof", D, W, 1.9, H + 0.14, 0.4);
    // rotate roof group 90°: our gableRoof ridges along X; rotate whole roof?
    // simpler: build roof ridge along Z by swapping W/D args — done above
    // dormer on east slope: box + tiny gable + window
    const dx = 1.35, dy = H + 0.14 + 0.75;
    box(g, "rc_dormer_box", 0.9, 0.8, 1.1, dx, dy + 0.4, 0, C.STONE);
    box(g, "rc_dormer_roof", 1.1, 0.08, 1.3, dx, dy + 0.84, 0, C.MID);
    windowFrame(g, "rc_dormer_win", dx + 0.42, dy + 0.38, 0, 0.5, 0.6, "x");
    // ---- v2 interior: hearth corner, table, shelf, bed nook ----
    // hearth in the NE corner (firebox + glow + mantel)
    box(g, "rc_hearth", 0.45, 1.05, 1.3, -(W / 2 - 0.4), 0.14 + 0.525, -(D / 2 - 0.75), C.MID);
    const rfire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), mat(0xff9040, 0.35, 0.6));
    rfire.position.set(-(W / 2 - 0.45), 0.14 + 0.65, -(D / 2 - 0.75));
    rfire.name = "rc_fire";
    g.add(rfire);
    box(g, "rc_mantel", 0.6, 0.1, 1.5, -(W / 2 - 0.22), 0.14 + 1.25, -(D / 2 - 0.75), C.DARK);
    // firewood stack beside
    for (let rl = 0; rl < 2; rl++) {
        const rlog = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 6), mat(0x56503c, 0.95, 0));
        rlog.rotation.z = Math.PI / 2;
        rlog.position.set(-(W / 2 - 0.4), 0.14 + 0.07 + rl * 0.13, -(D / 2 - 1.6));
        rlog.name = `rc_wood_${rl}`;
        g.add(rlog);
    }
    // table + two stools (center)
    box(g, "rc_table", 1.1, 0.08, 0.7, 0.3, 0.82, 0.2, C.MID);
    box(g, "rc_tleg", 0.09, 0.68, 0.09, 0.3, 0.48, 0.2, C.DARK);
    for (const [si, sx] of [[0, -0.45], [1, 1.05]] as const) {
        const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.34, 7), mat(C.MID, 0.9, 0));
        stool.position.set(sx, 0.14 + 0.17, 0.35);
        stool.name = `rc_stool_${si}`;
        g.add(stool);
    }
    // candle on the table
    const rcd = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.033, 0.13, 6), mat(0xffe8c8, 0.6, 0.15));
    rcd.position.set(0.3, 0.93, 0.2);
    rcd.name = "rc_candle";
    g.add(rcd);
    const rcfl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.033, 0), mat(0xffc98a, 0.4, 0));
    rcfl.position.set(0.3, 1.02, 0.2);
    rcfl.name = "rc_flame";
    g.add(rcfl);
    // shelf + jars on the east wall
    box(g, "rc_shelf", 1.6, 0.06, 0.28, W / 2 - 0.25, 1.35, 0.6, C.MID);
    for (let rj = 0; rj < 3; rj++) {
        const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 7), mat(rj % 2 ? 0xaaaa72 : C.BONE, 0.8, 0.05));
        jar.position.set(W / 2 - 0.25, 1.45, 0.15 + rj * 0.4);
        jar.name = `rc_jar_${rj}`;
        g.add(jar);
    }

    // bed nook in the SE corner (frame + mattress + pillow + blanket)
    box(g, "rc_bedframe", 1.0, 0.22, 2.0, W / 2 - 0.75, 0.14 + 0.11, D / 2 - 1.15, C.DARK);
    box(g, "rc_mattress", 0.9, 0.14, 1.85, W / 2 - 0.75, 0.14 + 0.29, D / 2 - 1.15, 0x78704a);
    box(g, "rc_pillow", 0.4, 0.09, 0.32, W / 2 - 0.75, 0.14 + 0.41, D / 2 - 0.35, C.BONE);
    box(g, "rc_blanket", 0.94, 0.05, 1.0, W / 2 - 0.75, 0.14 + 0.39, D / 2 - 1.4, 0xa08232);
    // ---- v2 exterior: window boxes, shutters, hanging lantern, doorstep ----
    for (const [wi, wx] of [[0, -(W / 2 - 0.05)], [1, W / 2 - 0.05]] as const) {
        const wb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.85), mat(C.MID, 0.9, 0));
        wb.position.set(wx, 1.02, 0.9 * (wi === 0 ? -1 : 1));
        wb.name = `rc_winbox_${wi}`;
        g.add(wb);
        for (let f = 0; f < 3; f++) {
            const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), mat(f % 2 ? 0xdec64e : 0x528638, 0.85, 0));
            fl.position.set(wx, 1.14, 0.55 + f * 0.35);
            fl.name = `rc_wbflower_${wi}_${f}`;
            g.add(fl);
        }
    }
    // shutters on east window
    const rshut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.4), mat(C.MID, 0.9, 0));
    rshut.position.set(W / 2 + 0.06, 1.5, 0.45);
    rshut.name = "rc_shutter";
    g.add(rshut);
    // hanging lantern by the door
    const rhook = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.03), mat(C.DARK, 0.9, 0));
    rhook.position.set(0.85, 2.15, sZ + 0.12);
    rhook.name = "rc_lanthook";
    g.add(rhook);
    const rlamp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), mat(0xffc98a, 0.4, 0));
    rlamp.position.set(0.85, 2.0, sZ + 0.12);
    rlamp.name = "rc_lantern";
    g.add(rlamp);
    // doorstep
    box(g, "rc_step", 1.1, 0.1, 0.45, 0, 0.05, sZ + 0.3, C.MID);

    return g;
}

// build all four
const houses = [
    ["village_tower_house", towerHouse()],
    ["village_longhouse", longhouse()],
    ["village_garden_cottage", gardenCottage()],
    ["village_row_cottage", rowCottage()],
] as const;
for (const [name, g] of houses) {
    writeFileSync(`agents/arthur/assets/${name}.glb`, toGLB(g));
    console.log(`${name}.glb — ${g.children.length} nodes`);
}
