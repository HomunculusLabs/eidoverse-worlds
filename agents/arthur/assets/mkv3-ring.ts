// mkv3-ring.ts — the seven remaining BUILDING RING houses, era-3 style:
// kit shells (doorGapWall L1/L2), wall-touching interiors, mergeByMaterial.
// One script, seven GLBs. Local door on +Z for all (plan yaw aims at plaza).
// tex-76: the HALL joins the families (house-interior law tex-53, the inn's
// tex-74) — firebowl on forge iron (brazier-bowl law tex-50/67: bowls that
// hold flame are the smith's own), both bench rows + legs, the council
// table + both legs + all three stools, all three tie beams on village
// timber; the dais + speaker's stone on ashlar (laid stone — the band/cap
// chain; a speaking platform is a plinth). Floors stay flat DARK (house
// law); fire/candle/lamps stay emissive; the charter banner's cloth + brass
// wheel + spokes stay flat (cloth is cloth, brass is brass); firewood logs
// stay raw-log flat (tex-16 law — fuel is not construction).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, ACCENTS, box, gableRoof, coneRoof, pyramidRoof, chimney, doorGapWall, doorFrame, wallSpan, windowFrame, porch, assertRoomScale, furnitureTable, furnitureBench, furnitureShelf } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const texBox = (g: THREE.Group, name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
};

// lift-1: gableRoof() builds in PARENT frame with no x argument. For the
// court's two offset sheds (±3.4) that stacked both gables at the group's
// center over the open yard — covering neither unit. addRoofAt builds the
// roof into a scratch group, then reparents every child with the shed's own
// x baked into its position: pure parent-frame translation, so the merge
// walk (mergeByMaterial applies world matrices to loose meshes) folds them
// into the material buckets exactly as before. No signature change to the
// shared kit — the other six ring houses keep their centered calls.
const addRoofAt = (g: THREE.Group, name: string, w: number, d: number, h: number, baseY: number, over: number, x: number) => {
    const scratch = new THREE.Group();
    gableRoof(scratch, name, w, d, h, baseY, over);
    for (const child of [...scratch.children]) {
        child.position.x += x;
        g.add(child);
    }
};

const glow = (g: THREE.Group, name: string, x: number, y: number, z: number, c = 0xffc98a, r = 0.06) => {
    // EMISSIVE bulb: the light these beads pretend to be (glbwrite v3.2
    // exports emissiveFactor, so they genuinely glow in the dark)
    const cc = new THREE.Color(c);
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), new THREE.MeshStandardMaterial({
        color: c, emissive: cc, emissiveIntensity: 0.9, roughness: 0.4,
    }));
    m.name = name;
    m.position.set(x, y, z);
    g.add(m);
};
const fireMesh = (g: THREE.Group, name: string, x: number, y: number, z: number, r = 0.22) => {
    // EMISSIVE fire core: hearth fires genuinely glow (rides the v3.2
    // material table alongside the embers particles comp)
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), new THREE.MeshStandardMaterial({
        color: 0xff9040, emissive: new THREE.Color(0xff6a1a), emissiveIntensity: 1.0, roughness: 0.35, metalness: 0.1,
    }));
    m.name = name;
    m.position.set(x, y, z);
    g.add(m);
};

type Built = { name: string; g: THREE.Group };
const out: Built[] = [];

// ---------- 1. LONGHOUSE v3 (72°) — 8.5 x 5, hall house ----------
{
    const g = new THREE.Group();
    const W = 8.5, D = 5, H = 2.6, T = 0.2, FY = 0.2;
    assertRoomScale(W, D, H, "longhouse-v3");
    box(g, "floor", W, 0.4, D, 0, 0, 0, C.DARK);
    wallSpan(g, "wall_n", W, H, T, 0, FY, -(D / 2 - T / 2), "x");
    wallSpan(g, "wall_w", D - 2 * T, H, T, -(W / 2 - T / 2), FY, 0, "z");
    wallSpan(g, "wall_e", D - 2 * T, H, T, W / 2 - T / 2, FY, 0, "z");
    doorGapWall(g, "front", W, H, T, 0, FY, D / 2 - T / 2, "z"); // door +Z center
    windowFrame(g, "win_n1", -2.4, 1.7, -(D / 2 - T / 2), 0.8, 0.8, "z");
    windowFrame(g, "win_n2", 2.4, 1.7, -(D / 2 - T / 2), 0.8, 0.8, "z");
    gableRoof(g, "roof", W, D, 1.7, FY + H, 0.4);
    chimney(g, "chim", -2.0, 0, FY + H + 1.1, FY + H + 2.2);
    // FRONT PORCH (beyond the 1.5m apron): the kit's porch() finally earns
    // its keep — deck + 4 posts + shed roof on the door face
    porch(g, "porch", 0, D / 2 + 1.05, 3.6, 1.4, 0.2, 2.1, "z", 1);
    // interior: hearth W end, two trestle tables along the walls (lane center clear)
    texBox(g, "hearth", 0.6, 1.1, 1.6, -(W / 2 - 0.5), FY + 0.55, 0, timberTex);
    fireMesh(g, "fire", -(W / 2 - 0.55), FY + 0.62, 0);
    texBox(g, "mantel", 0.8, 0.12, 1.9, -(W / 2 - 0.3), FY + 1.3, 0, timberTex);
    for (const tx of [-1.4, 1.4]) {
        texBox(g, `table_${tx}`, 2.0, 0.09, 0.7, tx, FY + 0.84, -(D / 2 - 0.6), timberTex);
        texBox(g, `tlegs_${tx}`, 1.7, 0.7, 0.1, tx, FY + 0.42, -(D / 2 - 0.6), timberTex);
    }
    texBox(g, "bench_n", 2.4, 0.07, 0.3, 0, FY + 0.5, -(D / 2 - 1.05), timberTex);
    // bed alcove E end + THE HIGH SEAT: carved chair on a dais (the hall's
    // place of honor, where the village elder sits at feasts)
    texBox(g, "bed", 1.0, 0.24, 1.9, W / 2 - 0.8, FY + 0.12, -1.2, timberTex);
    texBox(g, "dais", 1.5, 0.18, 1.6, W / 2 - 0.95, FY + 0.09, 1.3, stoneTex);
    texBox(g, "hseat", 0.55, 0.5, 0.5, W / 2 - 0.75, FY + 0.43, 1.3, timberTex);
    texBox(g, "hseat_back", 0.55, 0.9, 0.08, W / 2 - 0.75, FY + 0.9, 1.05, timberTex);
    texBox(g, "hseat_arm_l", 0.08, 0.22, 0.45, W / 2 - 1.0, FY + 0.56, 1.3, timberTex);
    texBox(g, "hseat_arm_r", 0.08, 0.22, 0.45, W / 2 - 0.5, FY + 0.56, 1.3, timberTex);
    // interior-13 (P2-4): THE FEAST KIT on the high seat — the elder's place
    // set for a feast night: a carved serving board with a round of cheese,
    // an ale horn row (three horns, alternating brass/bone mounts) rising
    // from one table line along the seat back rail, and one brass-feet
    // platter. Counts live exactly on/above the existing seat volume
    // (x∈[3.35,3.95], z∈[1.05,1.55]) — the dais, chair, and door lane
    // stay untouched; nothing new reaches the floor.
    {
        // serving board across the seat front edge w/ cheese round
        texBox(g, "feastboard", 0.5, 0.03, 0.3, W / 2 - 0.75, FY + 0.69, 1.42, timberTex);
        const cheese = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 9), mat(0xd8c278, 0.9, 0));
        cheese.name = "feastcheese";
        cheese.position.set(W / 2 - 0.82, FY + 0.73, 1.44);
        g.add(cheese);
        // platter w/ brass feet on the seat, beside the board
        const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.03, 9), mat(0xa0a248, 0.4, 0.55));
        platter.name = "feastplatter";
        platter.position.set(W / 2 - 0.6, FY + 0.7, 1.2);
        g.add(platter);
        // ale horn row: three horns on the back-rail line, alternating mounts
        for (const [ki, kx, mount] of [[0, W / 2 - 0.95, 0xa0a248], [1, W / 2 - 0.75, C.BONE], [2, W / 2 - 0.55, 0xa0a248]] as const) {
            const horn = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.26, 7), mat(0x8a6a3a, 0.75, 0.1));
            horn.name = `alehorn_${ki}`;
            horn.rotation.z = Math.PI;
            horn.position.set(kx, FY + 1.06, 1.09);
            g.add(horn);
            box(g, `hornmount_${ki}`, 0.05, 0.05, 0.05, kx, FY + 0.94, 1.09, mount);
        }
    }
    // interior-3: two communal sleeping benches flank the front door and face
    // the hearth. Their inner edges stop at local x ±1.2, leaving the full
    // 1.4m door lane and its turn toward the fire untouched.
    for (const [si, sx] of [[0, -2.1], [1, 2.1]] as const) {
        furnitureBench(g, `sleepbench_${si}`, sx, FY, 1.82, 1.8, timberTex);
        box(g, `sleepmat_${si}`, 1.65, 0.1, 0.52, sx, FY + 0.79, 1.82, ACCENTS.MATTRESS);
        box(g, `sleeppillow_${si}`, 0.38, 0.12, 0.42, sx + (si ? 0.48 : -0.48), FY + 0.9, 1.82, C.BONE);
        box(g, `sleepblanket_${si}`, 0.62, 0.06, 0.48, sx + (si ? -0.34 : 0.34), FY + 0.87, 1.82, si ? ACCENTS.PLUM : ACCENTS.SAGE);
    }
    // firewood stacked by the hearth (6 split logs, ends facing in)
    for (let fw = 0; fw < 6; fw++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 6), mat(0x6c5426, 0.95, 0));
        log.name = `fwood_${fw}`;
        log.rotation.z = Math.PI / 2;
        log.position.set(-(W / 2 - 0.35), FY + 0.07 + Math.floor(fw / 3) * 0.14, -1.5 + (fw % 3) * 0.16);
        g.add(log);
    }
    // herbs hanging from the rafters (3 bundles over the hearth end)
    // ---- TIE BEAMS (loop #91): oak beams crossing wall-to-wall under the
    // ridge — the visible roof structure a real longhouse reads from
    // inside, and what the herb bundles actually hang from ----
    for (const [bi2, bz2] of [[0, -2.3], [1, 0], [2, 2.3]] as const) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.14, 0.16), timberTex);
        beam.name = `tiebeam_${bi2}`;
        beam.position.set(0, FY + H + 0.05, bz2);
        g.add(beam);
    }
    for (const [hi, hz] of [[0, -2.3], [1, 0], [2, 2.3]] as const) {
        const bundle = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.34, 6), mat(0x64844a, 0.95, 0));
        bundle.name = `herb_${hi}`;
        bundle.rotation.x = Math.PI;
        // hang directly under the tie beams (loop #91 re-anchor)
        bundle.position.set(-(W / 2 - 1.3), FY + H - 0.12, hz);
        g.add(bundle);
    }
    glow(g, "flame", W / 2 - 0.5, FY + 1.0, 1.5);
    texBox(g, "cstand", 0.3, 0.05, 0.3, W / 2 - 0.5, FY + 0.6, 1.5, timberTex);
    glow(g, "lamp", 1.8, FY + 2.15, D / 2 + 0.35);
    // ---- PROVISIONS CHESTS (new-era loop 22): the communal hall's shared
    // storage — a row of 3 iron-banded chests along the back (N) wall,
    // clear of the center aisle
    for (const [ci, cx] of [[0, -1.6], [1, -0.4], [2, 0.8]] as const) {
        texBox(g, `pchest_${ci}`, 0.95, 0.5, 0.55, cx, FY + 0.25, -(D / 2 - 0.42), timberTex);
        texBox(g, `pchestlid_${ci}`, 1.0, 0.1, 0.6, cx, FY + 0.55, -(D / 2 - 0.42), timberTex);
        texBox(g, `pchestband_${ci}`, 0.97, 0.52, 0.06, cx, FY + 0.26, -(D / 2 - 0.42), ironTex);
    }
    mergeByMaterial(g, "lg3");
    out.push({ name: "village_longhouse3", g });
}

// ---------- 2. TOWER HOUSE v3 (108°) — round, R=2.9 ----------
{
    const g = new THREE.Group();
    const R = 2.9, H = 5.4, T = 0.22, FY = 0.2;
    assertRoomScale(2 * R * 0.9, 2 * R * 0.9, H - 2.55, "tower-v3-upper");
    // ground: ring wall segments with door gap (+Z, ±16°)
    const segs = 24, doorArc = Math.PI / 5;
    for (let i = 0; i < segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        const nearDoor = Math.abs(a - Math.PI / 2) < doorArc;
        const h = nearDoor ? H - 2.2 : H;
        const y0 = nearDoor ? 2.2 : 0;
        const m = new THREE.Mesh(new THREE.BoxGeometry(2 * R * Math.tan(Math.PI / segs) + 0.02, h, T), mat(C.STONE, 0.95, 0));
        m.name = `twall_${i}`;
        m.position.set(Math.cos(a) * (R - T / 2), y0 + h / 2, Math.sin(a) * (R - T / 2));
        m.rotation.y = -a + Math.PI / 2;
        g.add(m);
    }
    box(g, "floor", 2 * (R - T), 0.4, 2 * (R - T), 0, 0, 0, C.DARK);
    // Upper floor with a real 1.30 × 1.40m ladder hatch. The inherited single
    // slab sealed the landing even though the rungs reached it; four slabs keep
    // the room floor continuous while leaving x=[1.05,2.35], z=[0.85,2.25] open.
    const F = R - T;
    box(g, "floor2_w", 3.73, 0.15, 2 * F, -0.815, 2.55, 0, C.MID);
    box(g, "floor2_e", 0.33, 0.15, 2 * F, 2.515, 2.55, 0, C.MID);
    box(g, "floor2_s", 1.30, 0.15, 3.53, 1.70, 2.55, -0.915, C.MID);
    box(g, "floor2_n", 1.30, 0.15, 0.43, 1.70, 2.55, 2.465, C.MID);
    // DOOR CRAFT (loop #89): the tower was the one door without a frame —
    // bone jamb stones flanking the +Z gap + a lintel bar over it
    for (const jx of [-0.82, 0.82]) {
        const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.2, 0.28), mat(C.BONE, 0.9, 0));
        jamb.name = `tjamb_${jx}`;
        jamb.position.set(jx, 1.1, R - 0.08);
        g.add(jamb);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.16, 0.28), mat(C.BONE, 0.9, 0));
    lintel.name = "tLintel";
    lintel.position.set(0, 2.28, R - 0.08);
    g.add(lintel);
    // ground interior: desk + shelf ring the wall (lane to ladder clear)
    texBox(g, "desk", 1.3, 0.08, 0.6, -0.8, FY + 0.92, -1.8, timberTex);
    texBox(g, "dleg", 0.08, 0.74, 0.08, -0.8, FY + 0.46, -1.8, timberTex);
    texBox(g, "shelf", 0.3, 0.06, 1.2, -(R - T - 0.2), FY + 1.5, 0.4, timberTex);
    texBox(g, "chair", 0.4, 0.4, 0.4, -0.8, FY + 0.2, -1.1, timberTex);
    // ladder to upper — rungs now REACH the deck (7 rungs to y=3.12 > 2.55)
    for (let lr = 0; lr < 7; lr++) texBox(g, `rung_${lr}`, 0.55, 0.05, 0.05, 1.7, 0.6 + lr * 0.42, 1.55, timberTex);
    texBox(g, "ladderA", 0.06, 2.9, 0.06, 1.98, 1.6, 1.55, timberTex);
    texBox(g, "ladderB", 0.06, 2.9, 0.06, 1.42, 1.6, 1.55, timberTex);
    // upper: bed + chest (against wall)
    texBox(g, "bed", 0.95, 0.24, 1.85, -1.5, 2.63, -0.6, timberTex);
    texBox(g, "chest", 0.7, 0.4, 0.45, -1.55, 2.85, 1.3, timberTex);
    glow(g, "flame", -0.4, 3.35, -1.6);
    texBox(g, "cstand", 0.28, 0.05, 0.28, -0.4, 3.25, -1.6, timberTex);
    // balcony ring (front half) + windows + conical roof
    const balc = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.7, R + 0.7, 0.1, 24, 1, false, -Math.PI / 3, 2 * Math.PI / 3), mat(C.MID, 0.9, 0));
    balc.name = "balcony";
    balc.position.y = 3.0;
    g.add(balc);
    // ---- KING POST (loop #96): the round study gets its central support —
    // an oak post from the upper floor to the cone apex region (the
    // structural heart a round room reads instantly)
    const kpost = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.9, 7), timberTex);
    kpost.name = "kingpost";
    kpost.position.set(0, 2.55 + 0.95, 0);
    g.add(kpost);
    // ---- THE UPPER STUDY (new-era loop 20): the candlelit room finally
    // furnished — writing desk against the W wall, candle w/ emissive
    // flame, an open book, and a stack of 3 more; the keeper's own room
    const uy = 2.55 + 0.075; // floor2 top
    texBox(g, "udesk", 0.55, 0.07, 1.1, -(R - T - 0.35), uy + 0.38, -0.5, timberTex);
    for (const [li, lz] of [[0, -0.9], [1, -0.1]] as const) {
        texBox(g, `udeskleg_${li}`, 0.5, 0.36, 0.07, -(R - T - 0.35), uy + 0.19, lz, timberTex);
    }
    // open book on the desk (two angled pages)
    box(g, "ubookL", 0.22, 0.03, 0.3, -(R - T - 0.35), uy + 0.42, -0.62, 0xf2f2de);
    box(g, "ubookR", 0.22, 0.03, 0.3, -(R - T - 0.35), uy + 0.42, -0.3, 0xe4e4c2);
    // candle + emissive flame (the study's namesake light)
    const cand = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.14, 7), mat(0xf2f2de, 0.9, 0));
    cand.name = "ucandle";
    cand.position.set(-(R - T - 0.35), uy + 0.49, 0.05);
    g.add(cand);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 5), new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: new THREE.Color(0xfef28a), emissiveIntensity: 1.0, roughness: 0.3 }));
    flame.name = "uflame";
    flame.position.set(-(R - T - 0.35), uy + 0.6, 0.05);
    g.add(flame);
    // book stack in the N corner
    for (const [si2, sy] of [[0, 0.035], [1, 0.1], [2, 0.165]] as const) {
        box(g, `ubstack_${si2}`, 0.3, 0.06, 0.42, -(R - T - 0.5), uy + sy, 0.7, si2 % 2 ? 0xa06c32 : 0x4e5c6a);
    }
    // BALUSTRADE: posts + top rail around the balcony's curved edge (a 3m
    // platform with nothing to lean on is a hazard), following the same arc
    {
        const bR = R + 0.55;
        const start = -Math.PI / 3, sweep = 2 * Math.PI / 3;
        for (let bp = 0; bp <= 8; bp++) {
            const a = start + (bp / 8) * sweep;
            box(g, `bpost_${bp}`, 0.07, 0.85, 0.07, Math.cos(a) * bR, 3.45, Math.sin(a) * bR, C.DARK);
        }
        for (let br = 0; br < 10; br++) {
            const a = start + (br / 9) * sweep;
            const seg = new THREE.Mesh(new THREE.BoxGeometry(bR * (sweep / 9) + 0.12, 0.08, 0.09), mat(C.MID, 0.9, 0));
            seg.name = `brail_${br}`;
            const am = start + ((br + 0.5) / 9) * sweep;
            seg.position.set(Math.cos(am) * bR, 3.85, Math.sin(am) * bR);
            seg.rotation.y = -am + Math.PI / 2;
            g.add(seg);
        }
    }
    coneRoof(g, "roof", R, 2.2, H);
    // polish-265: the finial was a bare 0.12m stick (7.6..8.1) — the crown died
    // into a stub, same gazebo-adjacent read the carousel had before polish-258.
    // Same accepted treatment at tower scale: brass collar + tapered gold cone.
    box(g, "finial_collar", 0.3, 0.12, 0.3, 0, H + 2.26, 0, C.BRASS);
    const tspire = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.75, 10), mat(0xb98245, 0.78, 0));
    tspire.name = "spire";
    tspire.position.y = H + 2.7;
    g.add(tspire);
    glow(g, "lamp", 0, 2.15, R + 0.35);
    // lit window on the upper drum (faces the door arc; emissive pane rides
    // the material table — the tower was the only unlit building at night)
    windowFrame(g, "twin", 0, 4.3, R - 0.11, 0.6, 0.75, "z");
    mergeByMaterial(g, "tw3");
    out.push({ name: "village_tower3", g });
}

// ---------- 3. GARDEN COTTAGE v3 (144°) — 5.2 x 4.2 + garden ----------
{
    const g = new THREE.Group();
    const W = 5.2, D = 4.2, H = 2.6, T = 0.2, FY = 0.2;
    assertRoomScale(W, D, H, "garden-v3");
    box(g, "floor", W + 2.4, 0.4, D + 2.6, 0, 0, 0.6, C.DARK);
    wallSpan(g, "wall_n", W, H, T, 0, FY, -(D / 2 - T / 2), "x");
    wallSpan(g, "wall_w", D - 2 * T, H, T, -(W / 2 - T / 2), FY, 0, "z");
    wallSpan(g, "wall_e", D - 2 * T, H, T, W / 2 - T / 2, FY, 0, "z");
    doorGapWall(g, "front", W, H, T, 0, FY, D / 2 - T / 2, "z");
    windowFrame(g, "win_e", W / 2 - T / 2, 1.7, 0, 0.75, 0.8, "x");
    gableRoof(g, "roof", W, D, 1.5, FY + H, 0.35);
    chimney(g, "chim", -1.3, -0.7, FY + H + 1.0, FY + H + 2.0);
    // interior: kitchen W end (counter wall-touching), bed E end, table off-lane
    texBox(g, "counter", 1.4, 0.62, 0.55, -(W / 2 - 0.85), FY + 0.31, -(D / 2 - 0.4), timberTex);
    texBox(g, "hearth", 1.0, 1.0, 0.45, 0.8, FY + 0.5, -(D / 2 - 0.32), timberTex);
    fireMesh(g, "fire", 0.8, FY + 0.55, -(D / 2 - 0.38), 0.2);
    // ---- kitchen craft (era-2 heritage restored) ----
    // 3 hanging pots on a rail over the counter
    texBox(g, "potrail", 1.2, 0.05, 0.05, -(W / 2 - 0.85), FY + 1.6, -(D / 2 - 0.4), timberTex);
    for (const [pi, px] of [[0, -1.35], [1, -1.75], [2, -2.05]] as const) {
        const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 4), mat(0x404044, 0.5, 0.6));
        hook.name = `phook_${pi}`;
        hook.position.set(px, FY + 1.5, -(D / 2 - 0.4));
        g.add(hook);
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.09 + pi * 0.015, 0.07, 0.13 + pi * 0.02, 8), mat(0x404044, 0.55, 0.5));
        pot.name = `hpot_${pi}`;
        pot.position.set(px, FY + 1.34 - pi * 0.015, -(D / 2 - 0.4));
        g.add(pot);
    }
    // water basin on a stand by the counter's N end
    texBox(g, "basinstand", 0.5, 0.72, 0.45, -(W / 2 - 0.4), FY + 0.36, -(D / 2 - 1.15), timberTex);
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.14, 10), mat(0x9a9a58, 0.6, 0.1));
    basin.name = "basin";
    basin.position.set(-(W / 2 - 0.4), FY + 0.79, -(D / 2 - 1.15));
    g.add(basin);
    // 2 storage jars on the counter
    for (const [ji, jx] of [[0, -1.6], [1, -1.85]] as const) {
        const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.22, 8), mat(0xbaae60, 0.85, 0));
        jar.name = `jar_${ji}`;
        jar.position.set(jx, FY + 0.73, -(D / 2 - 0.4));
        g.add(jar);
    }
    texBox(g, "bed", 0.95, 0.24, 1.9, W / 2 - 0.65, FY + 0.12, -0.9, timberTex);

    texBox(g, "table", 1.1, 0.08, 0.7, 0.3, FY + 0.8, 0.9, timberTex);
    texBox(g, "tleg", 0.08, 0.66, 0.08, 0.3, FY + 0.4, 0.9, timberTex);
    glow(g, "flame", 0.3, FY + 0.93, 0.9, 0xffc98a, 0.045);
    glow(g, "lamp", 1.7, FY + 2.15, D / 2 + 0.35);
    // THE KITCHEN GARDEN (merged into this model — L4): 3 crop beds W side,
    // bean trellis, berry bushes, watering can, stepping stones
    for (let pl = 0; pl < 3; pl++) {
        const zc = -1.4 + pl * 1.1;
        texBox(g, `planter_${pl}`, 1.0, 0.3, 0.5, -(W / 2 + 0.9), 0.15, zc, timberTex);
        // crop rows ON the bed: 4 plants per bed (leafy clusters)
        for (let cr = 0; cr < 4; cr++) {
            const crop = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06 + (cr % 2) * 0.02, 0), mat(cr % 2 ? 0x609648 : 0x74a85e, 0.9, 0));
            crop.name = `crop_${pl}_${cr}`;
            crop.position.set(-(W / 2 + 0.9) - 0.3 + cr * 0.2, 0.42, zc + ((cr % 2) - 0.5) * 0.14);
            g.add(crop);
        }
    }
    // the flowers stay (border color)
    for (const [fi, fz] of [[0, -1.4], [1, -0.3], [2, 0.8]] as const) {
        const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), mat(fi % 2 ? 0xdec64e : 0x9a748c, 0.85, 0));
        fl.name = `gflower_${fi}`;
        fl.position.set(-(W / 2 + 1.45), 0.24, fz);
        g.add(fl);
    }
    // bean trellis: 2 poles + crossbar + climbing vine dots
    for (const tz of [-1.7, -0.9]) texBox(g, `tpole_${tz}`, 0.06, 1.5, 0.06, -(W / 2 + 2.0), 0.75, tz, timberTex);
    texBox(g, "tbar", 0.06, 0.06, 0.9, -(W / 2 + 2.0), 1.45, -1.3, timberTex);
    for (let vv = 0; vv < 5; vv++) {
        const vine = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0), mat(0x609648, 0.9, 0));
        vine.name = `vine_${vv}`;
        vine.position.set(-(W / 2 + 2.0) + Math.sin(vv * 1.3) * 0.08, 0.5 + vv * 0.18, -1.3 + Math.cos(vv * 1.1) * 0.3);
        g.add(vine);
    }
    // berry bushes S of the beds: 2 low round bushes w/ red berries
    for (const [bi, bz] of [[0, 1.9], [1, 2.5]] as const) {
        const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), mat(0x508440, 0.95, 0));
        bush.name = `bush_${bi}`;
        bush.position.set(-(W / 2 + 1.0), 0.26, bz);
        bush.scale.set(1.2, 0.8, 1);
        g.add(bush);
        for (let br = 0; br < 3; br++) {
            const berry = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), mat(0xc4602c, 0.6, 0));
            berry.name = `berry_${bi}_${br}`;
            berry.position.set(-(W / 2 + 1.0) + (br - 1) * 0.18, 0.34 + (br % 2) * 0.1, bz + (br % 2 - 0.5) * 0.2);
            g.add(berry);
        }
    }
    // watering can by the beds (body + spout)
    const wcan = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.22, 8), mat(0x9a9a58, 0.6, 0.3));
    wcan.name = "wcan";
    wcan.position.set(-(W / 2 + 1.3), 0.42, -2.0);
    g.add(wcan);
    box(g, "wspout", 0.22, 0.04, 0.04, -(W / 2 + 1.12), 0.5, -2.0, 0x9a9a58);
    // stepping stones between beds and door (laid stone — the walked-surface
    // chain: soil pavers at the house, ashlar slabs here at garden scale)
    for (let ss = 0; ss < 4; ss++) {
        texBox(g, `sstone_${ss}`, 0.4, 0.05, 0.32, -(W / 2 - 0.2 + ss * 0.75), 0.03, 2.0 - ss * 0.22, stoneTex);
    }
        // ---- TIE BEAMS (loop #94): the beam language reaches the cottages ----
    for (const [bi, bz] of [[0, -1.3], [1, 1.3]] as const) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.13, 0.15), timberTex);
        beam.name = `tiebeam_${bi}`;
        beam.position.set(0, FY + H + 0.05, bz);
        g.add(beam);
    }
    mergeByMaterial(g, "gc3");
    out.push({ name: "village_garden3", g });
}

// ---------- 4. ROW COTTAGE v3 (216°) — 5 x 4.5, dormer ----------
{
    const g = new THREE.Group();
    const W = 5, D = 4.5, H = 2.6, T = 0.2, FY = 0.2;
    assertRoomScale(W, D, H, "row-v3");
    box(g, "floor", W, 0.4, D, 0, 0, 0, C.DARK);
    wallSpan(g, "wall_n", W, H, T, 0, FY, -(D / 2 - T / 2), "x");
    wallSpan(g, "wall_w", D - 2 * T, H, T, -(W / 2 - T / 2), FY, 0, "z");
    wallSpan(g, "wall_e", D - 2 * T, H, T, W / 2 - T / 2, FY, 0, "z");
    doorGapWall(g, "front", W, H, T, 0, FY, D / 2 - T / 2, "z");
    windowFrame(g, "win_w", -(W / 2 - T / 2), 1.7, -0.7, 0.65, 0.8, "x");
    // improve-15 F2: solid ridge — the staggered hand-laid cap reads as
    // tabs/notches at 18m (hall D3 / inn D2 / bunkhouse D3 class); opt into
    // the proven continuous cap run. No trueGableHalf needed: W 5 < D+2·over
    // 5.3, the gable triangle sits inside the slab edge on this plan.
    gableRoof(g, "roof", W, D, 1.6, FY + H, 0.4, C.MID, true);
    // dormer on E slope — a REAL dormer: cheek walls meeting the roof slope,
    // lit window facing +Z, and its own tiny gable roof
    const dx = 1.35, dy = FY + H + 0.75;
    box(g, "dormer_front", 0.9, 0.85, 0.12, dx, dy + 0.42, 0.5, C.STONE); // face w/ window
    windowFrame(g, "dwin", dx, dy + 0.5, 0.56, 0.5, 0.55, "z");
    box(g, "dormer_back", 0.9, 0.6, 0.12, dx, dy + 0.3, -0.5, C.STONE); // sinks into roof
    box(g, "dormer_cheek_n", 0.12, 0.85, 1.0, dx - 0.39, dy + 0.42, 0, C.STONE);
    box(g, "dormer_cheek_s", 0.12, 0.85, 1.0, dx + 0.39, dy + 0.42, 0, C.STONE);
    // tiny gable roof over the dormer (ridge runs Z): 2 thin sloped slabs
    box(g, "dormer_roof_e", 0.62, 0.05, 1.15, dx - 0.27, dy + 0.92, 0, C.MID);
    box(g, "dormer_roof_w", 0.62, 0.05, 1.15, dx + 0.27, dy + 0.92, 0, C.MID);
    // interior: hearth W, table E, bed N wall
    texBox(g, "hearth", 0.5, 1.05, 1.3, -(W / 2 - 0.4), FY + 0.52, -0.5, timberTex);
    fireMesh(g, "fire", -(W / 2 - 0.45), FY + 0.6, -0.5, 0.2);
    texBox(g, "table", 1.0, 0.08, 0.7, W / 2 - 0.75, FY + 0.8, 0.8, timberTex);
    texBox(g, "tleg", 0.08, 0.66, 0.08, W / 2 - 0.75, FY + 0.4, 0.8, timberTex);
    texBox(g, "bed", 1.9, 0.24, 0.95, 0.2, FY + 0.12, -(D / 2 - 0.65), timberTex);
    // interior-8: the weaver's bed gains a mattress, pillow, and one folded
    // blanket whose three brass rule-lines carry Two Histories into cloth.
    // The whole ensemble stays on the north wall, outside the door lane.
    box(g, "wbed_mat", 1.75, 0.1, 0.84, 0.2, FY + 0.29, -(D / 2 - 0.65), ACCENTS.MATTRESS);
    box(g, "wbed_pillow", 0.42, 0.12, 0.5, -0.42, FY + 0.4, -(D / 2 - 0.65), C.BONE);
    box(g, "wbed_blanket", 0.78, 0.06, 0.78, 0.55, FY + 0.38, -(D / 2 - 0.65), ACCENTS.PLUM);
    for (const [ri, rz] of [[0, -1.84], [1, -1.6], [2, -1.36]] as const)
        box(g, `wbed_rule_${ri}`, 0.68, 0.018, 0.028, 0.55, FY + 0.42, rz, C.BRASS);
    // ---- the weaver's corner (S wall, W of the door lane |x|>0.8) ----
    // LOOM: two uprights + warp beam + heddle bar + cloth on the beam
    texBox(g, "loomA", 0.08, 1.5, 0.08, 1.3, FY + 0.75, D / 2 - 0.45, timberTex);
    texBox(g, "loomB", 0.08, 1.5, 0.08, 2.15, FY + 0.75, D / 2 - 0.45, timberTex);
    texBox(g, "warpbeam", 0.95, 0.09, 0.09, 1.72, FY + 1.42, D / 2 - 0.45, timberTex);
    box(g, "heddle", 0.85, 0.06, 0.06, 1.72, FY + 0.85, D / 2 - 0.45, C.BONE);
    box(g, "cloth", 0.8, 0.5, 0.04, 1.72, FY + 0.55, D / 2 - 0.52, 0xdcdcba);
    // thread basket beside the loom
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.2, 8), mat(0xa09832, 0.9, 0));
    basket.name = "tbasket";
    basket.position.set(0.95, FY + 0.1, D / 2 - 0.5);
    g.add(basket);
    for (const [ti2, tz2] of [[0, -0.05], [1, 0.04]] as const) {
        const thread = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.018, 5, 10), mat(ti2 ? 0xa06c32 : 0x4e5c6a, 0.8, 0));
        thread.name = `thread_${ti2}`;
        thread.rotation.x = Math.PI / 2;
        thread.position.set(0.95, FY + 0.22, D / 2 - 0.5 + tz2);
        g.add(thread);
    }
    // linen chest at the bed's foot
    texBox(g, "lchest", 0.55, 0.38, 0.8, 1.35, FY + 0.19, -(D / 2 - 0.65), timberTex);
    // dye-jar shelf on the E wall (3 colored jars)
    texBox(g, "dshelf", 0.05, 0.06, 0.9, W / 2 - 0.08, FY + 1.3, 0, timberTex);
    for (const [di, dz] of [[0, -0.28], [1, 0], [2, 0.28]] as const) {
        const dye = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.16, 7), mat(di === 0 ? 0xa06c32 : di === 1 ? 0x4c7266 : 0x7c6088, 0.6, 0));
        dye.name = `dye_${di}`;
        dye.position.set(W / 2 - 0.14, FY + 1.41, dz);
        g.add(dye);
    }
    // herb bundles hanging from the rafters (2, over the hearth end)
    for (const [hi2, hx2] of [[0, -1.4], [1, -0.8]] as const) {
        const bundle = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 6), mat(0x64844a, 0.95, 0));
        bundle.name = `herb_${hi2}`;
        bundle.rotation.x = Math.PI;
        bundle.position.set(hx2, FY + H - 0.16, -1.3);
        g.add(bundle);
    }
    glow(g, "flame", W / 2 - 0.75, FY + 0.94, 0.8, 0xffc98a, 0.045);
    // improve-15 F1: the front-wall lamp was a bare glow dot floating proud
    // of the wall (survey-2 + native-confirmed) — mount it as a real wall
    // lantern: iron plate on the wall face, arm, drop hook, hood cap. The
    // KEEP-named `lamp` bead stays at its position, under the hood.
    {
        const LX = -1.7, LY = FY + 2.15; // bead center x/y
        // iron mounting plate on the wall face (z 2.25)
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.05), mat(C.DARK, 0.9, 0));
        plate.name = "lamp_plate";
        plate.position.set(LX, LY + 0.13, D / 2 - 0.025);
        g.add(plate);
        // horizontal arm out from the plate to over the bead
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.42), mat(C.DARK, 0.9, 0));
        arm.name = "lamp_arm";
        arm.position.set(LX, LY + 0.26, D / 2 + 0.13);
        g.add(arm);
        // drop hook from the arm down toward the hood
        const hook = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.04), mat(C.DARK, 0.9, 0));
        hook.name = "lamp_hook";
        hook.position.set(LX, LY + 0.175, D / 2 + 0.32);
        g.add(hook);
        // hood cap above the bead (reads as a dark silhouette at 18m)
        const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.12, 0.07, 7), mat(C.DARK, 0.9, 0));
        hood.name = "lamp_hood";
        hood.position.set(LX, LY + 0.12, D / 2 + 0.35);
        g.add(hood);
    }
    glow(g, "lamp", -1.7, FY + 2.15, D / 2 + 0.35);
        // ---- TIE BEAMS (loop #94): the beam language reaches the cottages ----
    for (const [bi, bz] of [[0, -1.4], [1, 1.4]] as const) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.13, 0.15), timberTex);
        beam.name = `tiebeam_${bi}`;
        beam.position.set(0, FY + H + 0.05, bz);
        g.add(beam);
    }
    mergeByMaterial(g, "rc3");
    out.push({ name: "village_row3", g });
}

// ---------- 5. BUNKHOUSE v3 (252°) — 6.5 x 4.5, two bunks ----------
{
    const g = new THREE.Group();
    const W = 6.5, D = 4.5, H = 2.7, T = 0.2, FY = 0.2;
    assertRoomScale(W, D, H, "bunk-v3");
    box(g, "floor", W, 0.4, D, 0, 0, 0, C.DARK);
    wallSpan(g, "wall_n", W, H, T, 0, FY, -(D / 2 - T / 2), "x");
    wallSpan(g, "wall_w", D - 2 * T, H, T, -(W / 2 - T / 2), FY, 0, "z");
    wallSpan(g, "wall_e", D - 2 * T, H, T, W / 2 - T / 2, FY, 0, "z");
    doorGapWall(g, "front", W, H, T, 0, FY, D / 2 - T / 2, "z", C.STONE, 1.5);
    gableRoof(g, "roof", W, D, 1.6, FY + H, 0.4);
    // interior: two bunk frames against N + S walls — kept WEST of the door
    // lane (door gap x∈[-0.75,0.75]; bunk edge must stay < -0.9)
    for (const [bi, bz] of [[0, -(D / 2 - 0.5)], [1, D / 2 - 0.5]] as const) {
        texBox(g, `bunk_${bi}`, 2.1, 0.5, 0.9, -1.95, FY + 0.35, bz, timberTex);
        box(g, `mattress_${bi}`, 2.0, 0.16, 0.8, -1.95, FY + 0.68, bz, 0x78704a);
        // wool blanket folded over the foot of each bunk
        box(g, `blanket_${bi}`, 0.7, 0.07, 0.82, -2.6, FY + 0.79, bz, bi % 2 ? 0x8a7448 : 0x5e6c7a);
        // pillow at the head
        box(g, `pillow_${bi}`, 0.4, 0.09, 0.5, -1.4, FY + 0.79, bz, C.BONE);
        // ---- UPPER TIER (loop #71): a proper double-deck bunk — the lodge
        // sleeps four. Posts at the frame corners, upper mattress + blanket
        // + pillow, ladder-rung side rails to climb. Ceiling H=2.6: upper
        // mattress top at 1.85 leaves 0.75m sitting headroom.
        for (const [pi, px] of [[0, -2.95], [1, -1.0]] as const) {
            texBox(g, `upost_${bi}_${pi}`, 0.08, 1.45, 0.08, px, FY + 0.72, bz - 0.38, timberTex);
            texBox(g, `upostb_${bi}_${pi}`, 0.08, 1.45, 0.08, px, FY + 0.72, bz + 0.38, timberTex);
        }
        texBox(g, `ubunk_${bi}`, 2.1, 0.1, 0.9, -1.95, FY + 1.5, bz, timberTex);
        box(g, `umattress_${bi}`, 2.0, 0.16, 0.8, -1.95, FY + 1.63, bz, 0x78704a);
        box(g, `ublanket_${bi}`, 0.7, 0.07, 0.82, -2.6, FY + 1.74, bz, bi % 2 ? 0x5e6c7a : 0x8a7448);
        box(g, `upillow_${bi}`, 0.4, 0.09, 0.5, -1.4, FY + 1.74, bz, C.BONE);
        // side safety rail on the upper tier (door side)
        texBox(g, `urail_${bi}`, 2.0, 0.05, 0.05, -1.95, FY + 1.95, bz + (bi === 0 ? 0.44 : -0.44), timberTex);
        // climb rungs on the bunk end (E end, two rungs)
        for (const rr of [0, 1]) texBox(g, `rungclimb_${bi}_${rr}`, 0.05, 0.05, 0.7, -0.85, FY + 0.9 + rr * 0.55, bz, timberTex);
    }
    texBox(g, "bench", 1.8, 0.07, 0.32, 2.3, FY + 0.5, -(D / 2 - 0.35), timberTex);
    texBox(g, "bleg", 0.08, 0.4, 0.26, 2.3, FY + 0.25, -(D / 2 - 0.35), timberTex);
    // side table + 2 mugs (E end, off-lane)
    texBox(g, "table", 0.8, 0.06, 0.8, W / 2 - 0.7, FY + 0.72, 0.6, timberTex);
    texBox(g, "tlegA", 0.07, 0.68, 0.07, W / 2 - 1.0, FY + 0.36, 0.3, timberTex);
    texBox(g, "tlegB", 0.07, 0.68, 0.07, W / 2 - 0.4, FY + 0.36, 0.9, timberTex);
    for (const [mi, mx, mz] of [[0, 2.35, 0.35], [1, 2.7, 0.75]] as const) {
        const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.09, 6), mat(0x9a9a58, 0.7, 0));
        mug.name = `mug_${mi}`;
        mug.position.set(mx, FY + 0.8, mz);
        g.add(mug);
    }

    // woodbox beside the hearth (split logs inside)
    texBox(g, "woodbox", 0.8, 0.4, 0.55, -(W / 2 - 0.5), FY + 0.2, 1.35, timberTex);
    for (let wb = 0; wb < 3; wb++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.5, 5), mat(0x6c5426, 0.95, 0));
        log.name = `wlog_${wb}`;
        log.rotation.z = Math.PI / 2;
        log.position.set(-(W / 2 - 0.5), FY + 0.44, 1.2 + wb * 0.16);
        g.add(log);
    }
    // wall pegs + 2 hanging cloaks beside the door (on the E jamb wall, |x|>0.9)
    for (const [pi, px] of [[0, 1.35], [1, 2.1]] as const) {
        texBox(g, `peg_${pi}`, 0.05, 0.05, 0.14, px, FY + 1.7, D / 2 - 0.12, timberTex);
        box(g, `cloak_${pi}`, 0.32, 0.6, 0.08, px, FY + 1.35, D / 2 - 0.16, pi % 2 ? 0x78704a : 0x4e5c6a);
    }
    // boot row on the S wall by the door (2 pairs)
    for (const [bo, bx] of [[0, -1.3], [1, -0.95]] as const) {
        box(g, `boots_${bo}`, 0.22, 0.18, 0.36, bx, FY + 0.09, D / 2 - 0.35, 0x58502a);
    }
    // center hearth-brazier against W wall (out of lane)
    texBox(g, "hearth", 0.5, 0.9, 1.2, -(W / 2 - 0.42), FY + 0.45, 0, timberTex);
    fireMesh(g, "fire", -(W / 2 - 0.48), FY + 0.5, 0, 0.2);
    // lamp on the SIDE wall line (x=±2.6 band), clear of the 1.5m door gap (|x|<0.75+margin)
    glow(g, "lamp", 2.6, FY + 2.2, D / 2 - 0.05);
        // ---- TIE BEAMS (loop #94): the beam language reaches the cottages ----
    for (const [bi, bz] of [[0, -1.4], [1, 1.4]] as const) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.13, 0.15), timberTex);
        beam.name = `tiebeam_${bi}`;
        beam.position.set(0, FY + H + 0.05, bz);
        g.add(beam);
    }
    mergeByMaterial(g, "bk3");
    out.push({ name: "village_bunk3", g });
}

// ---------- 6. MEETING HALL v3 (288°) — 9 x 6, two opposite doors ----------
{
    const g = new THREE.Group();
    const W = 9, D = 6, H = 3.0, T = 0.22, FY = 0.2;
    assertRoomScale(W, D, H, "hall-v3");
    box(g, "floor", W, 0.4, D, 0, 0, 0, C.DARK);
    wallSpan(g, "wall_w", D - 2 * T, H, T, -(W / 2 - T / 2), FY, 0, "z");
    wallSpan(g, "wall_e", D - 2 * T, H, T, W / 2 - T / 2, FY, 0, "z");
    doorGapWall(g, "door_s", W, H, T, 0, FY, D / 2 - T / 2, "z", C.STONE, 1.8, 2.4); // wide, faces plaza
    doorGapWall(g, "door_n", W, H, T, 0, FY, -(D / 2 - T / 2), "z", C.STONE, 1.4, 1.95); // flow-through
    // polish-269: the civic hall's two doors were raw holes — the only unframed
    // openings left in the village (loop #89 gave the tower the same fix). Bone
    // frames on both doors give the plaza-facing entrance its civic read.
    // Frames sit PROUD of the wall face (z offset +0.12) so the bone reads as
    // applied trim, not buried trim: first attempt centered them in the wall
    // thickness and the front render diff was 1 pixel — invisible.
    doorFrame(g, "door_s_frame", 0, FY + 1.2, D / 2 - T / 2 + 0.12, 1.8, 2.4, "z");
    // improve-4 D1: the N gap narrows 1.6 -> 1.4 and drops 2.3 -> 1.95 so the
    // far opening reads as a DOOR, not a sky-hole, through the S porch (the
    // first candidate at 1.4x2.3 FAILED its falsification: level rays
    // 1.6-2.5 still exited the gap — casing + sconces alone do not kill the
    // rectangle). No aisle obstruction — MCPL walkTo is straight-line, a
    // solid screen would false-pass probes while blocking avatars (align-3
    // class); interior-1/-11 keep the door-to-door aisle law. Walking happens
    // below 1.9m; the added wall is above avatar head.
    doorFrame(g, "door_n_frame", 0, FY + 0.975, -(D / 2 - T / 2) - 0.12, 1.4, 1.95, "z");
    windowFrame(g, "win_w", -(W / 2 - T / 2), 1.9, 0, 0.8, 1.0, "x");
    windowFrame(g, "win_e", W / 2 - T / 2, 1.9, 0, 0.8, 1.0, "x");
    // improve-4 D2/D3: hall opts into the kit fixes — solidRidge (D3: the
    // 0.92-factor staggered cap read DASHED at 18m) and trueGableHalf = the
    // roof's true depth half-extent d/2+over (D2: gable triangle was authored
    // w/2 = 4.5 → 1.3m plaster horn past the roof plane each gable end).
    gableRoof(g, "roof", W, D, 2.0, FY + H, 0.45, C.MID, true, D / 2 + 0.45);
    chimney(g, "chim", -2.2, 0, FY + H + 1.2, FY + H + 2.6);
    // FRONT PORCH on the plaza-facing door (beyond the 1.5m apron) — the
    // council's covered threshold
    porch(g, "porch", 0, D / 2 + 1.05, 3.9, 1.5, 0.2, 2.2, "z", 1);
    // interior: firebowl center-W, bench rows flanking the center aisle (N door <-> S door)
    texBox(g, "firebowl", 1.1, 0.5, 1.1, -2.2, FY + 0.25, 0, ironTex);
    fireMesh(g, "fire", -2.2, FY + 0.6, 0, 0.26);
    for (const [bi, bz] of [[0, -1.4], [1, 1.4]] as const)
        furnitureBench(g, `bench_${bi}`, 1.5, FY, bz, 2.7, timberTex);
    // speaker's stone at W end
    texBox(g, "dais", 1.4, 0.25, 2.2, -(W / 2 - 0.9), FY + 0.125, 0, stoneTex);
    // THE COUNCIL TABLE at the E end: long table + 3 stools (where disputes
    // are settled and treaties signed)
    furnitureTable(g, "ctable", W / 2 - 1.1, FY, 0, 1.0, 2.6, timberTex);
    for (const [si, sz] of [[0, -0.75], [1, 0], [2, 0.75]] as const) {
        texBox(g, `cstool_${si}`, 0.34, 0.44, 0.34, W / 2 - 2.0, FY + 0.22, sz, timberTex);
    }
    // a council candle on the table
    box(g, "cccandle", 0.07, 0.14, 0.07, W / 2 - 1.1, FY + 0.94, 0.75, C.BONE);
    const cf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.9, roughness: 0.4 }));
    cf.name = "ccflame";
    cf.position.set(W / 2 - 1.1, FY + 1.06, 0.75);
    g.add(cf);
    // interior-1: the charter ledger lives beside the council table rather
    // than as loose decoration. Two wall shelves carry six bound volumes;
    // the full x=0 door-to-door aisle remains untouched.
    furnitureShelf(g, "ledger_shelf_lo", W / 2 - 0.18, FY + 1.15, 0, 1.9, 0.34, timberTex, "x");
    furnitureShelf(g, "ledger_shelf_hi", W / 2 - 0.18, FY + 1.85, 0, 1.9, 0.34, timberTex, "x");
    for (const [li, ly, lz] of [[0, 1.23, -0.62], [1, 1.23, 0], [2, 1.23, 0.62], [3, 1.93, -0.62], [4, 1.93, 0], [5, 1.93, 0.62]] as const) {
        box(g, `ledger_${li}`, 0.18, 0.28, 0.08, W / 2 - 0.37, FY + ly, lz, li % 2 ? 0x8e6834 : 0x4e5c6a);
    }
    // interior-11 (P2-2): the council's decision-history frieze above the
    // charter shelves — nine carved decision marks (alternating brass/bone
    // tallies, one per founding decision) on a dark backing band, closed by
    // one brass rule-line. Extends the B-1 charter-wall rule-line language
    // on the hall's own record wall; sits y∈[2.54,2.96], clear of the east
    // window top (2.4) and under the tie beams (3.18), proud of the wall
    // face (x=4.28) the polish-269 way so the carving reads as applied work.
    texBox(g, "frieze_band", 0.06, 0.42, 3.2, W / 2 - 0.25, FY + 2.55, 0, mat(0x4c462a, 0.95, 0));
    for (const [di, dz] of [[0, -1.44], [1, -1.08], [2, -0.72], [3, -0.36], [4, 0], [5, 0.36], [6, 0.72], [7, 1.08], [8, 1.44]] as const) {
        box(g, `decision_${di}`, 0.02, 0.3, 0.06, W / 2 - 0.29, FY + 2.55, dz, di % 2 ? C.BONE : 0xa0a248);
    }
    box(g, "frieze_rule", 0.02, 0.03, 3.2, W / 2 - 0.29, FY + 2.38, 0, 0xa0a248);
    // CHARTER BANNER on the W wall above the dais (the village's founding
    // standard — brass wheel on dark cloth)
    box(g, "banner_cloth", 1.2, 1.7, 0.05, -(W / 2 - T / 2 - 0.04), FY + 1.75, 0, 0x4c462a);
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 6, 14), mat(0xa0a248, 0.35, 0.6));
    wheel.name = "banner_wheel";
    wheel.position.set(-(W / 2 - T / 2 - 0.1), FY + 1.85, 0);
    g.add(wheel);
    for (let sp = 0; sp < 4; sp++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.04), mat(0xa0a248, 0.35, 0.6));
        spoke.name = `banner_spoke_${sp}`;
        spoke.rotation.z = (sp / 4) * Math.PI;
        spoke.position.set(-(W / 2 - T / 2 - 0.1), FY + 1.85, 0);
        g.add(spoke);
    }
    // firewood stack beside the firebowl (E side, aisle kept clear)
    for (let fw2 = 0; fw2 < 6; fw2++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 5), mat(0x6c5426, 0.95, 0));
        log.name = `hlog_${fw2}`;
        log.rotation.z = Math.PI / 2;
        log.position.set(-3.4 + Math.floor(fw2 / 3) * 0.14, FY + 0.07 + (fw2 % 3) * 0.13, 0);
        g.add(log);
    }
    glow(g, "lamp", -3.4, FY + 2.5, 0);
    glow(g, "lamp2", 3.4, FY + 2.5, 0);
    // ---- TIE BEAMS (loop #92): the council hall gets the same visible
    // roof structure as the longhouse — 3 oak beams crossing under the
    // ridge; the charter banner hangs properly framed by real timber
    for (const [bi3, bz3] of [[0, -2.4], [1, 0], [2, 2.4]] as const) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.14, 0.16), timberTex);
        beam.name = `tiebeam_${bi3}`;
        beam.position.set(0, FY + H + 0.05, bz3);
        g.add(beam);
    }
    // ---- improve-4 D1 (execution): lit-doorway read replaces the sky-void
    // read (polish-273/274 emissive law: faint same-hue warm emissives, no
    // new light sources). All anchors KEEP-named (lamp/glow) so they survive
    // mergeByMaterial as named nodes. Nothing enters the x=0 aisle.
    // Deep timber header inside the N opening — visible recess depth so the
    // far doorway reads as a cased door, not a cut hole. Gap top now 1.95;
    // header spans 1.79-1.95 flush under the lintel.
    box(g, "n_header", 1.7, 0.16, T + 0.10, 0, FY + 1.87, -(D / 2) + T / 2 + 0.05, C.DARK);
    // Warm sconce glows flanking the N door, INSIDE (x = ±0.95, clear of the
    // 1.4 opening at 0.7 half-gap), at the upper-door height
    glow(g, "lamp_nsconce_l", -0.95, FY + 1.7, -(D / 2) + 0.45, 0xffc98a, 0.055);
    glow(g, "lamp_nsconce_r", 0.95, FY + 1.7, -(D / 2) + 0.45, 0xffc98a, 0.055);
    // Porch lamp over the S door: wall-mounted above the door frame (the
    // classic lintel lamp). Two hanging-bead candidates under the porch roof
    // proved occluded at grazing angles by the tilted porch slab (night view:
    // invisible speck) — decode + night render both checked; the wall mount
    // sits in the open recess sight line, below the inner slab (y≈2.7).
    glow(g, "lamp_porch", 0, FY + 2.6, D / 2, 0xffd9a0, 0.07);
    // Lantern glows flanking the S door outside (village glow pattern)
    glow(g, "lamp_slant_l", -1.15, FY + 0.9, D / 2 + 0.35, 0xffc98a, 0.05);
    glow(g, "lamp_slant_r", 1.15, FY + 0.9, D / 2 + 0.35, 0xffc98a, 0.05);
    mergeByMaterial(g, "hl3");
    out.push({ name: "village_hall3", g });
}

// ---------- 7. BAKERY + WORKSHOP COURT v3 (324°) — two sheds + yard ----------
{
    const g = new THREE.Group();
    // BAKERY: open-front shed 5.4 x 4.2 (door = the whole open face)
    const BW = 5.4, BD = 4.2, H = 2.6, T = 0.2, FY = 0.2;
    assertRoomScale(BW, BD, H, "bakery-v3");
    box(g, "bk_floor", BW, 0.4, BD, -3.4, 0, 0, C.DARK);
    wallSpan(g, "bk_wall_n", BW, H, T, -3.4, FY, -(BD / 2 - T / 2), "x");
    wallSpan(g, "bk_wall_w", BD - 2 * T, H, T, -3.4 - BW / 2 + T / 2, FY, 0, "z");
    wallSpan(g, "bk_wall_e", BD - 2 * T, H, T, -3.4 + BW / 2 - T / 2, FY, 0, "z");
    doorGapWall(g, "bk_front", BW, H, T, -3.4, FY, BD / 2 - T / 2, "z", C.STONE, 2.2, 2.3); // wide open front
    // lift-1: gableRoof builds in PARENT frame with no x argument — called
    // twice on the court it stacked BOTH gables at the group's center (x=0),
    // over the open yard, covering neither shed (summoner's in-world read:
    // "doesn't cover both units"). addRoofAt bakes the shed's own x into the
    // roof parts before they join the merge walk — each unit now carries its
    // own roof, and the court reads as two sibling sheds of one build.
    addRoofAt(g, "bk_roof", BW, BD, 1.2, FY + H, 0.35, -3.4);
    // THE OVEN: domed beehive with a glowing mouth (fired every morning)
    const ovenDome = new THREE.Mesh(new THREE.SphereGeometry(0.72, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(C.MID, 0.97, 0));
    ovenDome.name = "oven_dome";
    ovenDome.position.set(-4.9, FY + 1.0, -0.8);
    g.add(ovenDome);
    box(g, "oven_base", 1.5, 0.45, 1.3, -4.9, FY + 0.22, -0.8, C.MID);
    // polish-268: the oven is the court's fire source (smoke origin lives at
    // [-4.9, 3.2, -0.8]) but rose from a bare dome — every other fired building
    // in the village vents through the housekit chimney with its flue pot.
    // A stack at the dome's back edge gives the smoke a source and the shed a
    // proper working silhouette.
    chimney(g, "oven_chim", -5.5, -0.8, FY + 1.2, FY + 3.6);
    // glowing oven mouth: emissive disc facing the room (the bake fire)
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.36, 0.06), new THREE.MeshStandardMaterial({ color: 0xffb763, emissive: 0xff7a26, emissiveIntensity: 1.1, roughness: 0.6 }));
    mouth.name = "oven_mouth";
    mouth.position.set(-4.9, FY + 0.68, -0.24);
    g.add(mouth);
    fireMesh(g, "fire", -4.9, FY + 1.1, -0.8, 0.18);
    // peel (the long bakery paddle) leaning by the oven
    texBox(g, "peel_handle", 0.05, 1.6, 0.05, -4.0, FY + 0.8, -1.35, timberTex);
    box(g, "peel_head", 0.4, 0.04, 0.5, -3.85, FY + 1.55, -1.35, C.BONE);
    texBox(g, "counter", 2.4, 0.62, 0.5, -3.0, FY + 0.31, -(BD / 2 - 0.42), timberTex);
    // loaves on the counter: 3 risen dough ovals
    for (const [li, lx] of [[0, -3.6], [1, -3.0], [2, -2.4]] as const) {
        const loaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), mat(0xccbe58, 0.9, 0));
        loaf.name = `loaf_${li}`;
        loaf.scale.set(1.3, 0.7, 0.8);
        loaf.position.set(lx, FY + 0.72, -(BD / 2 - 0.42));
        g.add(loaf);
    }
    glow(g, "flame", -3.0, FY + 0.95, -(BD / 2 - 0.42), 0xffc98a, 0.05);
    // ---- bakery craft, part 2 ----
    // DISPLAY BOARD outside the W edge of the open front (clear of the
    // 2.2m entry lane x -4.5..-2.3): a plank on trestle legs against the
    // shed's W wall, with 4 loaves of the morning's bake facing the yard
    texBox(g, "dboard", 0.5, 0.07, 1.6, -5.05, 0.82, 0.6, timberTex);
    for (const dz of [-0.05, 1.25]) texBox(g, `dleg_${dz}`, 0.08, 0.8, 0.08, -5.05, 0.4, dz, timberTex);
    for (const [dli, dlz] of [[0, -0.0], [1, 0.4], [2, 0.8], [3, 1.2]] as const) {
        const loaf = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), mat(0xccbe58, 0.9, 0));
        loaf.name = `dloaf_${dli}`;
        loaf.scale.set(0.8, 0.7, 1.3);
        loaf.rotation.y = dli * 0.4;
        loaf.position.set(-5.05, 0.93, dlz);
        g.add(loaf);
    }
    // flour bin by the counter's W end (round tub w/ lid askew)
    const fbin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.5, 9), timberTex);
    fbin.name = "flourbin";
    // nvp-11: outside the bakery's 2.0m-wide interior apron (x -4.4..-2.4).
    fbin.position.set(-4.9, FY + 0.25, 0.9);
    g.add(fbin);
    const flid = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 9), timberTex);
    flid.name = "flourlid";
    flid.rotation.z = 0.12;
    flid.position.set(-4.9, FY + 0.53, 0.9);
    g.add(flid);
    // rising shelf on the W wall: covered dough bowls (2)
    texBox(g, "rshelf", 0.28, 0.06, 1.2, -(3.4 + BW / 2 - T / 2 - 0.05), FY + 1.15, -0.6, timberTex);
    for (const [rb, rz] of [[0, -0.35], [1, 0.25]] as const) {
        const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xdcdcba, 0.9, 0));
        bowl.name = `rbowl_${rb}`;
        bowl.position.set(-(3.4 + BW / 2 - T / 2 - 0.05), FY + 1.18, rz);
        g.add(bowl);
    }
    // WORKSHOP: open-front shed, mirrored on +X side of the court
    const WW = 5.4, WD = 4.2;
    assertRoomScale(WW, WD, H, "workshop-v3");
    box(g, "ws_floor", WW, 0.4, WD, 3.4, 0, 0, C.DARK);
    wallSpan(g, "ws_wall_n", WW, H, T, 3.4, FY, -(WD / 2 - T / 2), "x");
    wallSpan(g, "ws_wall_w", WD - 2 * T, H, T, 3.4 - WW / 2 + T / 2, FY, 0, "z");
    wallSpan(g, "ws_wall_e", WD - 2 * T, H, T, 3.4 + WW / 2 - T / 2, FY, 0, "z");
    doorGapWall(g, "ws_front", WW, H, T, 3.4, FY, WD / 2 - T / 2, "z", C.STONE, 2.2, 2.3);
    addRoofAt(g, "ws_roof", WW, WD, 1.2, FY + H, 0.35, 3.4); // lift-1: roof over its own shed
    texBox(g, "forge", 0.9, 0.75, 0.9, 4.7, FY + 0.37, -0.8, stoneTex);
    // forge hood + tue-iron glow (the smith's fire)
    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.5, 8), ironTex);
    hood.name = "forge_hood";
    hood.position.set(4.7, FY + 1.15, -0.8);
    g.add(hood);
    // THE ANVIL: horn body on a stump, at the working height
    const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.42, 8), mat(0x6a6030, 0.95, 0));
    stump.name = "anvil_stump";
    // nvp-11: shift the anvil station east of the workshop's 2.0m-wide
    // interior apron (x 2.4..4.4), keeping the full arrival rectangle clear.
    stump.position.set(5.0, FY + 0.21, 0.6);
    g.add(stump);
    const anvilBody = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.24), ironTex);
    anvilBody.name = "anvil_body";
    anvilBody.position.set(5.0, FY + 0.5, 0.6);
    g.add(anvilBody);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 6), ironTex);
    horn.name = "anvil_horn";
    horn.rotation.z = -Math.PI / 2;
    horn.position.set(5.4, FY + 0.5, 0.6);
    g.add(horn);
    // half-finished work: a bar resting on the anvil face — the working end
    // GLOWS (emissive): iron at forge heat
    const hotBar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.06), new THREE.MeshStandardMaterial({ color: 0x787250, emissive: new THREE.Color(0xff5a1a), emissiveIntensity: 0.0, roughness: 0.6 }));
    hotBar.name = "wbar_hot";
    hotBar.position.set(5.05, FY + 0.6, 0.6);
    g.add(hotBar);
    // the glowing tip: small emissive segment at the bar's horn end
    const hotTip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.07), new THREE.MeshStandardMaterial({ color: 0xfed254, emissive: new THREE.Color(0xff6a1a), emissiveIntensity: 1.0, roughness: 0.4 }));
    hotTip.name = "wbar_tip";
    hotTip.position.set(5.35, FY + 0.6, 0.6);
    g.add(hotTip);
    fireMesh(g, "fire2", 4.7, FY + 0.85, -0.8, 0.2);
    // QUENCH BARREL: oak cask w/ iron hoops + dark water ring at the rim,
    // by the anvil (SW of it, clear of the open-face lane)
    const qb = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.72, 10), timberTex);
    qb.name = "quench";
    qb.position.set(4.4, FY + 0.36, -0.2);
    g.add(qb);
    for (const qh of [-0.26, 0.26]) {
        const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.305, 0.02, 5, 12), ironTex);
        hoop.name = `qhoop_${qh}`;
        hoop.rotation.x = Math.PI / 2;
        hoop.position.set(4.4, FY + 0.36 + qh, -0.2);
        g.add(hoop);
    }
    const qwater = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 10), mat(0x2c3a3c, 0.3, 0.2));
    qwater.name = "qwater";
    qwater.position.set(4.4, FY + 0.73, -0.2);
    g.add(qwater);
    // finished work on the bench: 3 hinge hasps + a stack of nails
    for (const [hi, hx] of [[0, 2.6], [1, 3.0], [2, 3.4]] as const) {
        box(g, `hasp_${hi}`, 0.18, 0.04, 0.12, hx, FY + 0.92, -(WD / 2 - 0.5), 0x404044);
    }
    box(g, "nailbox", 0.22, 0.1, 0.16, 3.9, FY + 0.95, -(WD / 2 - 0.5), 0xa09832);
    texBox(g, "bench", 2.4, 0.09, 0.6, 3.2, FY + 0.86, -(WD / 2 - 0.5), timberTex);
    // tool rack on the N wall: 3 hanging hammers/tongs
    for (const [ti, tx] of [[0, 2.6], [1, 3.2], [2, 3.8]] as const) {
        texBox(g, `tool_${ti}`, 0.08, 0.42, 0.08, tx, FY + 1.3, -(WD / 2 - 0.18), timberTex);
    }
    // ---- FUEL + STOCK (new-era loop 19): the forge's input side —
    // charcoal basket + iron bar stock racked on the wall, what the fire
    // consumes and the hammer works
    const cbin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.34, 8), timberTex);
    cbin.name = "charcoal_bin";
    cbin.position.set(5.35, FY + 0.17, -0.8);
    g.add(cbin);
    const clump = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 0), mat(0x302c24, 0.98, 0));
    clump.name = "charcoal_heap";
    clump.position.set(5.35, FY + 0.36, -0.8);
    clump.scale.set(1.2, 0.55, 1.2);
    g.add(clump);
    for (const [bi, by] of [[0, 1.1], [1, 1.4]] as const) {
        box(g, `ironstock_${bi}`, 0.9, 0.05, 0.05, 4.7, FY + by, -(WD / 2 - 0.16), 0x5c5c60);
    }
    texBox(g, "stockshelf", 1.0, 0.05, 0.12, 4.7, FY + 0.95, -(WD / 2 - 0.16), timberTex);
    // shared yard pavers between the sheds (laid stone — walked-surface chain)
    for (let pv = 0; pv < 6; pv++) texBox(g, `paver_${pv}`, 0.85, 0.06, 0.62, -1.5 + (pv % 3) * 1.5, 0.03, -0.6 + Math.floor(pv / 3) * 1.3, stoneTex);
    // ---- THE WORKING YARD (between the sheds, out of both door lanes) ----
    // flour cart: 2 big wheels + tray + handles, parked at the yard's N
    const cartWheel = (cx: number, cz: number) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.07, 10), timberTex);
        w.name = `cwheel_${cx}_${cz}`;
        w.rotation.z = Math.PI / 2;
        w.position.set(cx, 0.36, cz);
        g.add(w);
    };
    cartWheel(-1.6, -2.6);
    cartWheel(-1.6, -1.9);
    texBox(g, "ctray", 1.1, 0.1, 0.85, -1.6, 0.52, -2.25, timberTex);
    texBox(g, "ctraylip_n", 1.1, 0.16, 0.06, -1.6, 0.6, -2.64, timberTex);
    texBox(g, "ctraylip_s", 1.1, 0.16, 0.06, -1.6, 0.6, -1.86, timberTex);
    texBox(g, "chandle", 0.75, 0.06, 0.06, -0.9, 0.62, -2.25, timberTex);
    // flour sacks on the tray (2, tied)
    for (const [fsi, fz] of [[0, -2.4], [1, -2.1]] as const) {
        const sack = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 6), mat(0xdcdcba, 0.9, 0));
        sack.name = `fsack_${fsi}`;
        sack.scale.set(1.15, 0.85, 1);
        sack.position.set(-1.6, 0.68, fz);
        g.add(sack);
    }
    // stacked crates at the yard's S edge (3, pyramid; shifted W clear of
    // the workshop open-face lane x 2.3+)
    for (const [cri, cx2, cy2] of [[0, 0.9, 0.2], [1, 1.5, 0.2], [2, 1.2, 0.62]] as const) {
        texBox(g, `crate_${cri}`, 0.5, 0.42, 0.5, cx2, cy2, 1.9, timberTex);
    }
    // nvp-11 door-apron gate: the old bench sat centered at x=-3.4,z=2.75.
    // Although earlier prose called it "clear", it occupied the bakery's
    // REQUIRED 2m × 1.5m exterior apron (door x=-4.5..-2.3, z=2.0..3.5).
    // Seat it under the W eave BESIDE the opening: right edge -4.55 leaves
    // the full 2.2m door width and canonical 1.4m travel corridor untouched.
    texBox(g, "wbtop", 1.3, 0.08, 0.5, -5.2, 0.92, 2.75, timberTex);
    for (const lx of [-5.75, -4.65]) texBox(g, `wbleg_${lx}`, 0.08, 0.86, 0.08, lx, 0.45, 2.75, timberTex);
    texBox(g, "wvice", 0.16, 0.14, 0.2, -4.65, 1.03, 2.75, ironTex);
    // yard lamp on a post at the yard's W edge — off both shed door lanes
    glow(g, "lamp", -4.6, FY + 2.4, 2.6);
        // ---- TIE BEAMS (loop #94): one oak beam per shed span ----
    for (const [bi, bz] of [[0, 0]] as const) {
        const beamB = new THREE.Mesh(new THREE.BoxGeometry(BW - 0.4, 0.13, 0.15), timberTex);
        beamB.name = `tiebeam_${bi}`;
        beamB.position.set(-BW / 2 - 0.4, FY + H + 0.05, bz);
        g.add(beamB);
        const beamW = new THREE.Mesh(new THREE.BoxGeometry(BW - 0.4, 0.13, 0.15), timberTex);
        beamW.name = `tiebeam_w${bi}`;
        beamW.position.set(BW / 2 + 0.4, FY + H + 0.05, bz);
        g.add(beamW);
    }
    mergeByMaterial(g, "ct3");
    out.push({ name: "village_court3", g });
}

for (const { name, g } of out) {
    writeFileSync(`agents/arthur/assets/${name}.glb`, toGLB(g));
    console.log(`${name}.glb — ${g.children.length} nodes (merged)`);
}
