// mkv3-landmarks.ts — era-3 landmarks, merged + named motion groups:
//   belltower (bell pendulum group), carousel (spin group + bob horses),
//   inn (enterable, walk-tested), windmill (sails spin group).
// Named groups survive mergeByMaterial via KEEP (bell/sails/carousel/horse_).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box, gableRoof, doorGapWall, wallSpan, windowFrame, chimney, assertRoomScale, furnitureTable, furnitureBench } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// tex-20 STONE VII: the belltower's masonry joins the ashlar family —
// base slab, 4 piers, 4 arch beams take the village stone tile (cell
// law; the tower's structure is laid stone like every plinth). Bell
// brass, rungs, cap stay flat (brass/emissive, small trim).
// tex-69: the tower's remaining flats join — the 16 timber braces, the
// ladder rails + rungs, the belfry floor, and the pyramid cap take the
// village timber (built-post/structural-wood chain: the watchpost
// scaffold tex-68 reads on the same posts; a tower's braces are its
// scaffold); the cap RING takes the ashlar (band/cap chain tex-58→63:
// a masonry ring on stone piers is laid stone). Bell brass + crown +
// clapper stay flat (brass is brass — the forge's own bowl law excludes
// struck bells; the bell rings, it does not read as iron), the hemp
// rope + knot + cleat + tail stay flat (rope is rope), the finial
// stays brass, the lamp stays emissive.
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const texBox = (g: THREE.Group, name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
};

const glow = (g: THREE.Group, name: string, x: number, y: number, z: number, c = 0xffc98a, r = 0.07) => {
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

// ---------- BELL TOWER v3 (r=8, 45°): 4 piers, belfry, named bell group ----------
{
    const g = new THREE.Group();
    const PH = 4.4, PS = 1.5; // pier height, pier spread
    texBox(g, "base", 3.4, 0.3, 3.4, 0, 0.15, 0, stoneTex);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
        texBox(g, `pier_${dx}${dz}`, 0.42, PH, 0.42, dx * PS / 2, PH / 2 + 0.3, dz * PS / 2, stoneTex);
    // TIMBER BRACING: X-braces between piers at 2 levels (all 4 faces each) —
    // thin diagonals, merged; a real tower resists wind
    for (const lvl of [1.2, 2.9]) {
        for (const [sx, sz, ax] of [[0, 1, "x"], [0, -1, "x"], [1, 0, "z"], [-1, 0, "z"]] as const) {
            for (const dir of [1, -1] as const) {
                const br = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.1, 0.08), timberTex);
                br.name = `brace_${lvl}_${sx}${sz}${ax}${dir > 0 ? "p" : "m"}`;
                if (ax === "x") {
                    br.position.set(0, lvl + 0.85, sz * (PS / 2 - 0.05));
                    br.rotation.z = dir * 0.62;
                } else {
                    br.position.set(sx * (PS / 2 - 0.05), lvl + 0.85, 0);
                    br.rotation.x = dir * 0.62;
                }
                g.add(br);
            }
        }
    }
    // access ladder up one pier (rungs between two rails)
    for (let lr = 0; lr < 9; lr++) texBox(g, `blrung_${lr}`, 0.5, 0.05, 0.05, -PS / 2 + 0.3, 0.75 + lr * 0.42, -PS / 2 - 0.06, timberTex);
    texBox(g, "blrail_a", 0.06, 4.0, 0.06, -PS / 2 + 0.3, 2.4, -PS / 2 - 0.06, timberTex);
    texBox(g, "blrail_b", 0.06, 4.0, 0.06, -PS / 2 - 0.02, 2.4, -PS / 2 - 0.06, timberTex);
    // belfry floor + arch beams + pyramid cap
    texBox(g, "belfry_floor", 2.1, 0.12, 2.1, 0, PH + 0.36, 0, timberTex);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
        texBox(g, `arch_${dx}${dz}`, 0.16, 1.0, 0.16, dx * 0.95, PH + 0.9, dz * 0.95, stoneTex);
    texBox(g, "cap_ring", 2.4, 0.14, 2.4, 0, PH + 1.45, 0, stoneTex);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.9, 1.3, 4), timberTex);
    cap.name = "cap";
    cap.position.y = PH + 2.15;
    cap.rotation.y = Math.PI / 4;
    g.add(cap);
    box(g, "finial", 0.1, 0.4, 0.1, 0, PH + 3.0, 0, C.BRASS);
    // THE BELL: named group (pendulum target); crown at group origin = hinge
    const bellGrp = new THREE.Group();
    bellGrp.name = "bell";
    bellGrp.position.set(0, PH + 1.15, 0);
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.03, 6, 10), mat(0xdada70, 0.4, 0.3));
    crown.name = "bell_crown";
    bellGrp.add(crown);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.55, 10), mat(0xdada70, 0.35, 0.5));
    body.name = "bell_body";
    body.position.y = -0.38;
    bellGrp.add(body);
    const clap = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), mat(0xa0a248, 0.4, 0.4));
    clap.name = "bell_clap";
    clap.position.y = -0.72;
    bellGrp.add(clap);
    g.add(bellGrp);
    // polish-263: the lamp bead sat at (0, PH+1.9) = y 6.3 — 0.4 INSIDE the
    // closed pyramid cap (cone base 5.9, radius 1.32 at that height), fully
    // occluded day and night. Move it into open belfry air between the arch
    // posts: a corner position clears the bell (r 0.42) and reads from every
    // approach; the tower gains its warm night signal.
    glow(g, "lamp", 0.75, 5.6, 0.75);
    // THE BELL ROPE (loop #75): a hemp rope drops from the clap level to a
    // hand-height cleat on the S pier — anchored STATIC (the bell swings;
    // the rope hangs free beside it, tied off at the bottom). Segmented
    // with a slight sag between tie points, era-2 heritage.
    {
        const rr = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, PH - 0.35, 5), mat(0xd4da82, 0.95, 0));
        rr.name = "bellrope";
        rr.position.set(0.12, (PH + 0.35) / 2 + 0.2, 0.62);
        g.add(rr);
        // the sag: a small knot bulge mid-rope + cleat at hand height
        const knot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 5, 4), mat(0xd4da82, 0.95, 0));
        knot.name = "rope_knot";
        knot.position.set(0.12, 1.35, 0.62);
        g.add(knot);
        const cleat = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 5), mat(0xa09832, 0.9, 0));
        cleat.name = "rope_cleat";
        cleat.rotation.z = Math.PI / 2;
        cleat.position.set(0.12, 1.05, 0.62);
        g.add(cleat);
        // hanging bell-end tail (a short free end below the cleat)
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.3, 5), mat(0xd4da82, 0.95, 0));
        tail.name = "rope_tail";
        tail.position.set(0.12, 0.88, 0.62);
        g.add(tail);
    }
    mergeByMaterial(g, "bt3");
    writeFileSync("agents/arthur/assets/village_belltower3.glb", toGLB(g));
    console.log("village_belltower3.glb —", g.children.length, "nodes");
}

// ---------- CAROUSEL v3 (r=32, 126°): spin group + 4 bob horses ----------
{
    const g = new THREE.Group();
    // platform base + deck
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 0.5, 16), mat(C.MID, 0.95, 0));
    base.name = "base";
    base.position.y = 0.25;
    g.add(base);
    // center pole + canopy
    box(g, "pole", 0.22, 3.2, 0.22, 0, 1.9, 0, C.DARK);
    // HUB COLLAR (loop #99): the brass ring where the pole enters the deck
    // — every real carousel has one; also a matching ring at the canopy
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 6, 12), mat(0xdada70, 0.35, 0.6));
    collar.name = "hub_collar";
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.82;
    g.add(collar);
    const collar2 = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.04, 6, 12), mat(0xdada70, 0.35, 0.6));
    collar2.name = "hub_collar2";
    collar2.rotation.x = Math.PI / 2;
    collar2.position.y = 3.55;
    g.add(collar2);
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(4.1, 1.4, 12), mat(0xa06c32, 0.9, 0));
    canopy.name = "canopy";
    canopy.position.y = 4.2;
    g.add(canopy);
    box(g, "finial2", 0.1, 0.5, 0.1, 0, 5.1, 0, C.BRASS);
    // THE PLATFORM: named spin group (motion:carousel)
    const car = new THREE.Group();
    car.name = "carousel";
    car.position.y = 0.7;
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.14, 16), mat(C.DARK, 0.9, 0));
    deck.name = "deck";
    car.add(deck);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.06, 6, 20), mat(0xa0a248, 0.4, 0.6));
    rim.name = "rim";
    rim.rotation.x = Math.PI / 2;
    car.add(rim);
    // DECK INLAY: 8 alternating bone/rust wedge pavers riding the deck (they
    // spin WITH the platform — the painted floor of the carousel)
    for (let w = 0; w < 8; w++) {
        const wa = (w / 8) * Math.PI * 2;
        const wedge = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.03, 0.6), mat(w % 2 ? 0xdcdcba : 0xa06c32, 0.85, 0));
        wedge.name = `dwedge_${w}`;
        wedge.position.set(Math.cos(wa) * 2.0, 0.085, Math.sin(wa) * 2.0);
        wedge.rotation.y = -wa;
        car.add(wedge);
    }
    g.add(car);
    // 4 horses: named groups horse_0..3 INSIDE the spin group (bob comps).
    // v3.1 — REAL horses: capsule body, arched neck, head, gallop-posed legs,
    // tail, brass saddle, pole. Statics merge; group node count unchanged.
    for (let h = 0; h < 4; h++) {
        const a = (h / 4) * Math.PI * 2;
        const horse = new THREE.Group();
        horse.name = `horse_${h}`;
        horse.position.set(Math.cos(a) * 2.4, 1.6, Math.sin(a) * 2.4);
        horse.rotation.y = -a + Math.PI / 2; // face along the spin
        // THE LEAD HORSE: horse_0 rides in gold (real carousels crown one)
        const isLead = h === 0;
        const coat = isLead ? 0xdada70 : h % 2 ? 0xdcdcba : 0x787250;
        const coatDark = isLead ? 0xc8ca36 : h % 2 ? 0xc6c6a0 : 0x666042;
        // body: capsule (cylinder + sphere rumps); the lead horse shines
        const bodyM = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.62, 8), mat(coat, isLead ? 0.3 : 0.9, isLead ? 0.7 : 0));
        bodyM.name = `hbody_${h}`;
        bodyM.rotation.z = Math.PI / 2;
        horse.add(bodyM);
        const rump = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), mat(coat, 0.9, 0));
        rump.name = `hrump_${h}`;
        rump.position.set(-0.31, 0, 0);
        horse.add(rump);
        const chest = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), mat(coat, 0.9, 0));
        chest.name = `hchest_${h}`;
        chest.position.set(0.31, 0, 0);
        horse.add(chest);
        // arched neck rising forward
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.42, 7), mat(coat, 0.9, 0));
        neck.name = `hneck_${h}`;
        neck.position.set(0.38, 0.24, 0);
        neck.rotation.z = -0.6;
        horse.add(neck);
        // head with muzzle + ears
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.13), mat(coatDark, 0.9, 0));
        head.name = `hhead_${h}`;
        head.position.set(0.52, 0.42, 0);
        head.rotation.z = 0.35;
        horse.add(head);
        const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.1), mat(coatDark, 0.9, 0));
        muzzle.name = `hmuz_${h}`;
        muzzle.position.set(0.64, 0.38, 0);
        horse.add(muzzle);
        for (const ez of [-0.05, 0.05]) {
            const ear = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 4), mat(coatDark, 0.9, 0));
            ear.name = `hear_${h}_${ez}`;
            ear.position.set(0.42, 0.55, ez);
            horse.add(ear);
        }
        // legs in gallop pose: front pair extended forward, rear pair back
        const legGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.5, 6);
        const legPos: Array<[number, number, number, number, string]> = [
            [0.24, -0.28, 0.09, -0.85, "ff"],   // front-forward
            [0.22, -0.28, -0.09, -0.55, "fr"],  // front-folded
            [-0.26, -0.28, 0.09, 0.6, "bf"],    // rear-back
            [-0.28, -0.28, -0.09, 0.95, "br"],  // rear-extended
        ];
        for (const [lx, ly, lz, tilt, tag] of legPos) {
            const leg = new THREE.Mesh(legGeo, mat(coatDark, 0.9, 0));
            leg.name = `hleg_${h}_${tag}`;
            leg.position.set(lx, ly, lz);
            leg.rotation.z = tilt;
            horse.add(leg);
        }
        // tail streaming behind
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.36, 5), mat(coatDark, 0.95, 0));
        tail.name = `htail_${h}`;
        tail.position.set(-0.42, 0.02, 0);
        tail.rotation.z = 1.9;
        horse.add(tail);
        // brass saddle + SADDLE HORN (the pommel a rider grips) + a saddle
        // blanket beneath (bone weave, era palette)
        const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.07, 0.22), mat(0xa0a248, 0.35, 0.6));
        saddle.name = `hsaddle_${h}`;
        saddle.position.set(0, 0.16, 0);
        horse.add(saddle);
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.09, 6), mat(0xa0a248, 0.3, 0.7));
        horn.name = `hhorn_${h}`;
        horn.position.set(0.1, 0.24, 0);
        horse.add(horn);
        const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.28), mat(h % 2 ? 0xa06c32 : 0x4e5c6a, 0.9, 0));
        blanket.name = `hblanket_${h}`;
        blanket.position.set(-0.02, 0.11, 0);
        horse.add(blanket);
        const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.7, 6), mat(0xa0a248, 0.5, 0.4));
        pole2.name = `hpole_${h}`;
        horse.add(pole2);
        car.add(horse); // rides the spin
    }
    // canopy pennants — real TRIANGULAR flags (cone segments) on brass pins
    // Wakeup-24: each flag wraps in a cr_flag_${p} anchor group (KEEP cr_flag)
    // so wind comps have real targets — flags that fly while it spins.
    for (let p = 0; p < 8; p++) {
        const a = (p / 8) * Math.PI * 2;
        const px = Math.cos(a) * 3.95, pz = Math.sin(a) * 3.95;
        box(g, `ppin_${p}`, 0.04, 0.28, 0.04, px, 3.72, pz, C.BRASS);
        const flagGrp = new THREE.Group();
        flagGrp.name = `cr_flag_${p}`;
        const flag = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.42, 4), mat(p % 2 ? 0xdcdcba : 0xa06c32, 0.85, 0));
        flag.name = `pflag_${p}`;
        flag.rotation.x = Math.PI; // point down from the pin
        flag.position.set(px, 3.55, pz);
        flagGrp.add(flag);
        g.add(flagGrp);
    }
    // BOARDING STAIR at the SE approach: 3 steps + side cheeks, aligned so
    // the door-path pavers meet it (deck top 0.77; steps 0.26/0.52/0.77)
    for (let st = 0; st < 3; st++) {
        box(g, `cstep_${st}`, 1.3, 0.26, 0.38, 3.95 + 0.0, 0.13 + st * 0.26, 1.6 - st * 0.4, C.MID);
    }
    box(g, "cstair_cheek_e", 1.3, 0.3, 0.06, 3.95, 0.15, 1.72, C.DARK);
    box(g, "cstair_cheek_w", 1.3, 0.3, 0.06, 3.95, 0.15, 0.0, C.DARK);
    glow(g, "lamp", 0, 4.75, 0);
    mergeByMaterial(g, "cr3");
    writeFileSync("agents/arthur/assets/village_carousel3.glb", toGLB(g));
    console.log("village_carousel3.glb —", g.children.length, "nodes");
}

// ---------- INN v3 (r=34, 0°): two-story, enterable, porch outside apron ----------
// tex-74: the inn's interiors join the families (the house-interior
// law, tex-53): the great-room hearth + mantel, both long tables +
// trestle legs + benches, the bar counter, both cellar cradles, the
// stair flight, all three tie beams, the upper beds/chests/washstand,
// the window seat, and the porch deck + both posts + roof take the
// village timber; the cellar cask HOOPS take the forge iron (the
// barrel law — hoops are smithed, one iron through every barrel).
// Floors stay flat DARK (house law: floors read as shadow at distance);
// fires/flames stay emissive; tankards/candles/bottles/pillows/
// blankets/cushions stay flat (goods/cloth); the sign board + emblem
// stay flat (painted sign faces — the welcome-board law).
{
    const g = new THREE.Group();
    const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
    const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
    const W = 8, D = 6, H = 2.7, T = 0.22, FY = 0.2;
    assertRoomScale(W, D, H, "inn-v3");
    // ground floor
    box(g, "floor", W, 0.4, D, 0, 0, 0, C.DARK);
    wallSpan(g, "wall_n", W, H, T, 0, FY, -(D / 2 - T / 2), "x");
    wallSpan(g, "wall_w", D - 2 * T, H, T, -(W / 2 - T / 2), FY, 0, "z");
    wallSpan(g, "wall_e", D - 2 * T, H, T, W / 2 - T / 2, FY, 0, "z");
    doorGapWall(g, "front", W, H, T, 0, FY, D / 2 - T / 2, "z", C.STONE, 1.7, 2.3); // wide inn door
    windowFrame(g, "win_w", -(W / 2 - T / 2), 1.8, -1, 0.8, 0.9, "x");
    windowFrame(g, "win_e", W / 2 - T / 2, 1.8, 1, 0.8, 0.9, "x");
    // upper floor shell (shorter, overhang) + gable roofs
    // (upper floor is the holed udeck below, not a full slab)
    wallSpan(g, "uwall_n", W - 0.6, 2.2, T, 0, FY + H + 0.18, -(D - 0.6) / 2 + T / 2, "x");
    wallSpan(g, "uwall_w", D - 0.6 - 2 * T, 2.2, T, -(W - 0.6) / 2 + T / 2, FY + H + 0.18, 0, "z");
    wallSpan(g, "uwall_e", D - 0.6 - 2 * T, 2.2, T, (W - 0.6) / 2 - T / 2, FY + H + 0.18, 0, "z");
    box(g, "uwall_s_lo", (W - 0.6 - 1.2) / 2, 2.2, T, -((W - 0.6 - 1.2) / 4 + 0.6), FY + H + 0.18, (D - 0.6) / 2 - T / 2, C.STONE);
    box(g, "uwall_s_hi", 1.2, 0.7, T, 0, FY + H + 0.18 + 1.85, (D - 0.6) / 2 - T / 2, C.STONE); // upper dormer gap
    box(g, "uwall_s_e", (W - 0.6 - 1.2) / 2, 2.2, T, (W - 0.6 - 1.2) / 4 + 0.6, FY + H + 0.18, (D - 0.6) / 2 - T / 2, C.STONE); // east segment (was missing)
    gableRoof(g, "roof", W, D, 2.0, FY + H + 0.18, 0.45);
    chimney(g, "chim", -2.4, -1.2, FY + H + 2.2, FY + H + 3.6);
    // interior-0: great-room hearth W end and two east-side table ensembles.
    // Their west edge is local x=+0.7, preserving the full local x ±0.7
    // door corridor; paired benches complete real seating on both sides.
    texBox(g, "hearth", 0.6, 1.15, 1.8, -(W / 2 - 0.5), FY + 0.575, 0, timberTex);
    const fire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 0), new THREE.MeshStandardMaterial({ color: 0xff9040, emissive: new THREE.Color(0xff6a1a), emissiveIntensity: 1.0, roughness: 0.35, metalness: 0.1 }));
    fire.name = "fire";
    fire.position.set(-(W / 2 - 0.55), FY + 0.68, 0);
    g.add(fire);
    texBox(g, "mantel", 0.8, 0.12, 2.1, -(W / 2 - 0.3), FY + 1.35, 0, timberTex);
    for (const [ti, tz] of [[0, -1.3], [1, 1.3]] as const) {
        furnitureTable(g, `table_${ti}`, 1.65, FY, tz, 1.9, 0.72, timberTex);
        furnitureBench(g, `bench_${ti}_inner`, 1.65, FY, tz + (tz < 0 ? 0.56 : -0.56), 1.9, timberTex);
        furnitureBench(g, `bench_${ti}_outer`, 1.65, FY, tz + (tz < 0 ? -0.56 : 0.56), 1.9, timberTex);
    }
    // bar counter along N wall (E half, clear of lane)
    texBox(g, "bar", 2.8, 0.95, 0.5, 2.6, FY + 0.475, -(D / 2 - 0.45), timberTex);
    glow(g, "flame", 2.6, FY + 1.1, -(D / 2 - 0.45));
    // THE CELLAR CASKS behind the bar: 2 lying casks on timber cradles (W of
    // the bar, against N wall) + 1 standing cask at the corner
    for (const [ci, cx] of [[0, -1.6], [1, -0.6]] as const) {
        const cask = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 10), mat(0x7c6832, 0.9, 0));
        cask.name = `cask_${ci}`;
        cask.rotation.z = Math.PI / 2;
        cask.position.set(cx, FY + 0.5, -(D / 2 - 0.45));
        g.add(cask);
        // iron hoops
        for (const hz of [-0.3, 0.3]) {
            const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.02, 5, 12), ironTex);
            hoop.name = `hoop_${ci}_${hz}`;
            hoop.rotation.y = Math.PI / 2;
            hoop.position.set(cx + hz, FY + 0.5, -(D / 2 - 0.45));
            g.add(hoop);
        }
        texBox(g, `cradle_${ci}`, 0.85, 0.16, 0.6, cx, FY + 0.08, -(D / 2 - 0.45), timberTex);
    }
    // tankards on both long tables (2 each) + candle per table
    for (const [ti, tz] of [[0, -1.3], [1, 1.3]] as const) {
        for (const [mj, mx] of [[0, 1.15], [1, 2.15]] as const) {
            const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.1, 6), mat(0x9a9a58, 0.7, 0));
            mug.name = `tankard_${ti}_${mj}`;
            mug.position.set(mx, FY + 0.94, tz);
            g.add(mug);
        }
        box(g, `tcandle_${ti}`, 0.06, 0.12, 0.06, 1.65, FY + 0.95, tz, C.BONE);
        const tf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.9, roughness: 0.4 }));
        tf.name = `tflame_${ti}`;
        tf.position.set(1.65, FY + 1.06, tz);
        g.add(tf);
    }
    // bottles behind the bar top (3 small flasks on the counter)
    for (const [bi2, bx2] of [[0, 1.9], [1, 2.2], [2, 2.5]] as const) {
        const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.22, 6), mat(0x4c7266, 0.3, 0.1));
        bottle.name = `bottle_${bi2}`;
        bottle.position.set(bx2, FY + 1.06, -(D / 2 - 0.45));
        g.add(bottle);
    }
    // stair to upper: one straight flight along the W wall, door-adjacent S
    // end rising N to the deck (14 steps, 0.2 rise, arrives at deck top 3.17)
    for (let st = 0; st < 14; st++) texBox(g, `stair_${st}`, 1.0, 0.2, 0.3, -(W / 2 - 0.85), FY + 0.2 + st * 0.2, D / 2 - 1.0 - st * 0.27, timberTex);
    // ---- TIE BEAMS (loop #93): the inn's common room joins the beam
    // language — 3 oak beams under the ridge at ground-ceiling height
    for (const [bi, bz] of [[0, -1.9], [1, 0], [2, 1.9]] as const) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.14, 0.16), timberTex);
        beam.name = `tiebeam_${bi}`;
        beam.position.set(0, FY + H + 0.05, bz);
        g.add(beam);
    }
    // ---- innkeeper's craft (loop #87: the common room completed) ----
    // WALL SCONCES: 2 iron brackets + candle flames on the long walls
    for (const [si, sx, sz] of [[0, -1.4, D / 2 - 0.22], [1, 1.4, D / 2 - 0.22]] as const) {
        box(g, `sconce_${si}`, 0.05, 0.05, 0.16, sx, FY + 1.9, sz, 0x404044);
        box(g, `scplate_${si}`, 0.14, 0.03, 0.14, sx, FY + 1.86, sz - 0.1, 0x404044);
        const sf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.9, roughness: 0.4 }));
        sf.name = `scflame_${si}`;
        sf.position.set(sx, FY + 1.92, sz - 0.1);
        g.add(sf);
    }
    // HEARTH TOOLS by the W hearth: poker + brush leaning on a stand
    texBox(g, "toolstand", 0.22, 0.06, 0.16, -(W / 2 - 0.5), FY + 0.03, 1.35, timberTex);
    const poker = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.85, 5), ironTex);
    poker.name = "poker";
    poker.rotation.z = 0.18;
    poker.position.set(-(W / 2 - 0.52), FY + 0.45, 1.42);
    g.add(poker);
    const shovel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.75, 5), timberTex);
    shovel.name = "hearth_shovel";
    shovel.rotation.z = -0.16;
    shovel.position.set(-(W / 2 - 0.44), FY + 0.4, 1.42);
    g.add(shovel);
    // ---- HEARTH CRANE (new-era loop 26): the inn cooks — a swung iron arm
    // in the hearth w/ hook + hanging kettle, and a pan on a 3-leg trivet
    // beside the fire. A fireplace becomes a kitchen.
    texBox(g, "crane_post", 0.07, 1.3, 0.07, -(W / 2 - 0.35), FY + 0.65, 0.45, ironTex);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.75), ironTex);
    arm.name = "crane_arm";
    arm.position.set(-(W / 2 - 0.35), FY + 1.26, 0.05);
    g.add(arm);
    texBox(g, "crane_hook", 0.02, 0.18, 0.02, -(W / 2 - 0.35), FY + 1.17, 0.32, ironTex);
    const iket = new THREE.Mesh(new THREE.SphereGeometry(0.19, 9, 7), ironTex);
    iket.name = "crane_kettle";
    iket.scale.set(1, 0.8, 1);
    iket.position.set(-(W / 2 - 0.35), FY + 0.94, 0.32);
    g.add(iket);
    // trivet + pan on the hearth's S side
    for (const [ti, ta] of [[0, 0], [1, (2.1 * Math.PI) / 3], [2, (4.2 * Math.PI) / 3]] as const) {
        const tv = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28, 5), ironTex);
        tv.name = `trivet_${ti}`;
        tv.position.set(-(W / 2 - 0.5) + Math.cos(ta) * 0.14, FY + 0.14, -0.65 + Math.sin(ta) * 0.14);
        tv.rotation.z = Math.cos(ta) * 0.35;
        tv.rotation.x = -Math.sin(ta) * 0.35;
        g.add(tv);
    }
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.07, 9), ironTex);
    pan.name = "frypan";
    pan.position.set(-(W / 2 - 0.5), FY + 0.3, -0.65);
    g.add(pan);
    texBox(g, "panhandle", 0.24, 0.025, 0.03, -(W / 2 - 0.5) + 0.26, FY + 0.32, -0.65, timberTex);
    // THE KEY CABINET behind the bar: a wall box w/ 3 brass hooks + tags
    texBox(g, "keybox", 0.5, 0.4, 0.08, 2.6, FY + 1.55, -(D / 2 - 0.21), timberTex);
    for (const [ki, kx] of [[0, 2.45], [1, 2.6], [2, 2.75]] as const) {
        box(g, `keyhook_${ki}`, 0.03, 0.1, 0.03, kx, FY + 1.62, -(D / 2 - 0.17), 0xdada70);
        box(g, `keytag_${ki}`, 0.06, 0.08, 0.02, kx, FY + 1.52, -(D / 2 - 0.15), C.BONE);
    }
    // upper floor: deck with a stair hole at the SW corner — hole x∈[-3.7,-2.4], z∈[1.4,2.7]
    // (2 slabs: N strip full-width; S strip east of the hole)
    const UY = FY + H + 0.18; // upper floor top reference
    box(g, "udeck_n", W - 0.6, 0.18, (D - 0.6) - 1.3, 0, UY, -0.65, C.MID);
    box(g, "udeck_s", (W - 0.6) - 1.3, 0.18, 1.3, 0.65, UY, (D - 0.6) / 2 - 0.65, C.MID);
    // upper furniture: 3 guest beds against N wall + candle stand
    for (const bx of [-2.2, 0, 2.2]) texBox(g, `ubed_${bx}`, 1.0, 0.24, 1.85, bx, UY + 0.12, -(D - 0.6) / 2 + 1.1, timberTex);
    // ---- guest-room comfort (loop #50: the lodging floor furnished) ----
    // pillows + folded wool blankets on each bed (alternating colors)
    for (const [bi, bx] of [[0, -2.2], [1, 0], [2, 2.2]] as const) {
        const pil = new THREE.Mesh(new THREE.SphereGeometry(0.18, 7, 5), mat(0xdcdcba, 0.9, 0));
        pil.name = `upil_${bi}`;
        pil.scale.set(1.15, 0.55, 0.8);
        pil.position.set(bx, UY + 0.32, -(D - 0.6) / 2 + 1.85);
        g.add(pil);
        box(g, `ubln_${bi}`, 0.9, 0.07, 0.75, bx, UY + 0.28, -(D - 0.6) / 2 + 0.55, bi % 2 ? 0xa06c32 : 0x4e5c6a);
    }
    // traveler chest at each bed's foot
    for (const [ci, cx] of [[0, -2.2], [1, 0], [2, 2.2]] as const) {
        texBox(g, `uchest_${ci}`, 0.6, 0.36, 0.42, cx, UY + 0.18, -(D - 0.6) / 2 + 2.35, timberTex);
    }
    // interior-P2-1: guest-room life layer — one travel bag beside each
    // chest (leather satchel: body + flap + strap) on the chest line, and
    // a bedside candle (stub + gentle glow) along each bed's west side.
    // Guest beds gain the evidence of arrival while the open deck middle
    // (z ∈ [-0.1, 1.1]) stays clear for the stair-hole → window-seat walk.
    for (const [bi, bx] of [[0, -2.2], [1, 0], [2, 2.2]] as const) {
        const bagX = bx + 0.55;
        texBox(g, `ubag_${bi}`, 0.42, 0.3, 0.26, bagX, UY + 0.15, -(D - 0.6) / 2 + 2.35, timberTex);
        const flap = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.05, 0.28), ironTex);
        flap.name = `ubagflap_${bi}`;
        flap.position.set(bagX, UY + 0.32, -(D - 0.6) / 2 + 2.35);
        g.add(flap);
        const strap = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 5, 10), ironTex);
        strap.name = `ubagstrap_${bi}`;
        strap.rotation.x = Math.PI / 2;
        strap.position.set(bagX, UY + 0.3, -(D - 0.6) / 2 + 2.22);
        g.add(strap);
        box(g, `ucandle_${bi}`, 0.05, 0.1, 0.05, bx - 0.62, UY + 0.05, -(D - 0.6) / 2 + 1.7, C.BONE);
        const cflame = new THREE.Mesh(new THREE.IcosahedronGeometry(0.032, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.85, roughness: 0.4 }));
        cflame.name = `ucflame_${bi}`;
        cflame.position.set(bx - 0.62, UY + 0.16, -(D - 0.6) / 2 + 1.7);
        g.add(cflame);
    }
    // washstand + basin by the stair hole (E of the hole, off the lane)
    texBox(g, "uwash", 0.45, 0.72, 0.4, -1.4, UY + 0.36, 2.2, timberTex);
    const ubasin = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.14, 0.12, 9), mat(0x9a9a58, 0.6, 0.1));
    ubasin.name = "ubasin";
    ubasin.position.set(-1.4, UY + 0.78, 2.2);
    g.add(ubasin);
    // window seat under the twin E windows (stone bench, bone cushion)
    texBox(g, "useat", 0.45, 0.42, 1.7, (W - 0.6) / 2 - 0.28, UY + 0.21, 0.1, timberTex);
    box(g, "ucush", 0.42, 0.09, 1.6, (W - 0.6) / 2 - 0.26, UY + 0.46, 0.1, 0xa06c32);
    texBox(g, "ucstand", 0.3, 0.05, 0.3, (W - 0.6) / 2 - 0.5, UY + 0.62, 0.8, timberTex);
    glow(g, "uflame", (W - 0.6) / 2 - 0.5, UY + 0.76, 0.8);
    // porch: deck + posts OUTSIDE the 2m apron (posts at x=±2.6, 0.9m off door)
    texBox(g, "porch_deck", 4.6, 0.14, 1.6, 0, 0.07, D / 2 + 0.85, timberTex);
    for (const px of [-2.5, 2.5]) texBox(g, `ppost_${px}`, 0.1, 2.5, 0.1, px, 1.25, D / 2 + 1.5, timberTex);
    texBox(g, "porch_roof", 5.0, 0.1, 2.0, 0, FY + H - 0.1, D / 2 + 0.9, timberTex);
    // hanging sign: NAMED GROUP "sign" — pendulum comp target, swings on the
    // breeze. Group origin at the sign-hook (post top, y=1.9) = the hinge.
    const sign = new THREE.Group();
    sign.name = "sign";
    sign.position.set(2.5, 1.9, D / 2 + 1.6);
    const sboard = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.05), mat(0x7c6832, 0.85, 0));
    sboard.name = "sign_board";
    sboard.position.y = -0.32;
    sign.add(sboard);
    // painted emblem: a brass circle (the wheel) on the board
    const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 10), mat(0xa0a248, 0.35, 0.6));
    emblem.name = "sign_emblem";
    emblem.rotation.x = Math.PI / 2;
    emblem.position.y = -0.32;
    sign.add(emblem);
    g.add(sign);
    glow(g, "lamp", 2.5, 2.35, D / 2 + 1.6);
    glow(g, "lamp2", -2.5, 2.35, D / 2 + 1.6);
    mergeByMaterial(g, "in3");
    writeFileSync("agents/arthur/assets/village_inn3.glb", toGLB(g));
    console.log("village_inn3.glb —", g.children.length, "nodes");
}

// ---------- WINDMILL v3.2 (r=38, 180°): real mill room + sails group ----------
// tex-72: the windmill joins the families — the 5-tier tower takes the
// ashlar (belltower law tex-20/69: a masonry tower is laid stone, and
// this one is the village's second tower), the millstones (bed +
// runner) take the same ashlar (they ARE stone — ground querns), and
// all built woodwork takes the timber: tie beams (tex-53 chain),
// tailpole + crossbar + tailwheel + yoking stakes (built-post chain
// tex-68), sail shafts + spars (structural wood), the interior bench +
// legs, the wooden cap, and the gallery ring. Sail cloth + flour sacks
// stay flat (cloth, goods); the sail hub stays brass; windows keep
// their lit frames; lamp stays emissive.
{
    const g = new THREE.Group();
    const TH = 7.5;
    const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
    const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
    // MILL ROOM: 5.2 x 5.2 (27m² > 20 gate w/ margin), H 2.6, door on +Z
    const RW = 5.2, RH = 2.6, T = 0.2, FY = 0.2;
    assertRoomScale(RW, RW, RH, "windmill-room");
    box(g, "rfloor", RW + 0.4, 0.4, RW + 0.4, 0, 0, 0, C.DARK);
    wallSpan(g, "rwall_n", RW, RH, T, 0, FY, -(RW / 2 - T / 2), "x");
    wallSpan(g, "rwall_w", RW - 2 * T, RH, T, -(RW / 2 - T / 2), FY, 0, "z");
    wallSpan(g, "rwall_e", RW - 2 * T, RH, T, RW / 2 - T / 2, FY, 0, "z");
    doorGapWall(g, "rfront", RW, RH, T, 0, FY, RW / 2 - T / 2, "z", C.STONE, 1.4, 2.2);
    // room ceiling = the tower base: thicker slab the tower rises from
    box(g, "rceil", RW, 0.3, RW, 0, FY + RH + 0.15, 0, C.MID);
    // ---- TIE BEAMS (loop #96): the mill room joins the beam language —
    // 2 oak beams under its flat ceiling (the miller works beneath timber)
    for (const [bi, bz] of [[0, -1.5], [1, 1.5]] as const) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(RW - 0.5, 0.13, 0.15), timberTex);
        beam.name = `tiebeam_${bi}`;
        beam.position.set(0, FY + RH - 0.02, bz);
        g.add(beam);
    }
    // tapered tower above the room (base 3.2 — fits inside the 5.2 room)
    for (let s = 0; s < 5; s++) {
        const w0 = 3.2 - s * 0.36;
        texBox(g, `twr_${s}`, w0, (TH - (FY + RH + 0.3)) / 5, w0, 0, FY + RH + 0.3 + ((TH - (FY + RH + 0.3)) / 5) * s + (TH - (FY + RH + 0.3)) / 10, 0, stoneTex);
    }
    // windows on the tower face — REAL lit frames now (frames + emissive
    // panes, matching the village; the tower used to go dark at night)
    windowFrame(g, "wwin1", 0, 4.7, 1.35, 0.55, 0.75, "z");
    windowFrame(g, "wwin2", 0, 5.9, 1.1, 0.5, 0.7, "z");
    // TAILPOLE: the great slanted beam out the mill's back — how the miller
    // walks the cap around to face the wind. Pole + crossbar + ground wheel.
    const tp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 4.6), timberTex);
    tp.name = "tailpole";
    tp.position.set(0, 3.4, -3.2);
    tp.rotation.x = 0.83; // reaches from tower (y≈5.2,z≈-1.2) to ground (y≈0.5,z≈-5.4)
    g.add(tp);
    texBox(g, "tailbar", 1.3, 0.1, 0.1, 0, 0.72, -5.35, timberTex); // crossbar handle
    const twheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 10), timberTex);
    twheel.name = "tailwheel";
    twheel.rotation.z = Math.PI / 2;
    twheel.position.set(0, 0.34, -5.5);
    g.add(twheel);
    // anchoring stakes around the yard (the pole's yoking posts)
    for (const [yi, yx] of [[0, -1.6], [1, -2.2]] as const) {
        texBox(g, `ystake_${yi}`, 0.12, 0.55, 0.12, yx, 0.27, -4.9 + yi * 0.5, timberTex);
    }
    // interior: millstones (bed + runner) W side, flour sacks, bench — all
    // against walls, door lane (|x|<0.7) clear
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.22, 12), stoneTex);
    stone.name = "mbed";
    stone.position.set(-(RW / 2 - 0.85), FY + 0.11, -0.9);
    g.add(stone);
    const runner = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.18, 12), stoneTex);
    runner.name = "mrunner";
    runner.position.set(-(RW / 2 - 0.85), FY + 0.31, -0.9);
    g.add(runner);
    // drive shaft from runner up through the ceiling (visual)
    texBox(g, "mshaft", 0.12, RH - 0.4, 0.12, -(RW / 2 - 0.85), FY + (RH - 0.4) / 2 + 0.4, -0.9, timberTex);
    for (const [si, sx] of [[0, -(RW / 2 - 0.55)], [1, -(RW / 2 - 0.5)], [2, -(RW / 2 - 0.62)]] as const) {
        const sack = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), mat(0xdcdcba, 0.9, 0));
        sack.name = `sack_${si}`;
        sack.scale.set(1, 1.25, 1);
        sack.position.set(sx, FY + 0.28, 1.55 + si * 0.06);
        g.add(sack);
    }
    texBox(g, "mbench", 1.4, 0.07, 0.35, RW / 2 - 0.85, FY + 0.48, -1.4, timberTex);
    texBox(g, "mbleg", 0.08, 0.4, 0.26, RW / 2 - 0.85, FY + 0.22, -1.4, timberTex);
    // wooden cap + gallery
    const cap2 = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.6, 10), timberTex);
    cap2.name = "cap2";
    cap2.position.y = TH + 0.8;
    g.add(cap2);
    const gal = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.07, 6, 16), timberTex);
    gal.name = "gallery";
    gal.rotation.x = Math.PI / 2;
    gal.position.y = 5.2;
    g.add(gal);
    // THE SAILS: named group (motion:sails spin)
    const sails = new THREE.Group();
    sails.name = "sails";
    sails.position.set(0, TH + 0.4, 1.45);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 8), mat(0xa0a248, 0.4, 0.5));
    hub.name = "hub";
    hub.rotation.x = Math.PI / 2;
    sails.add(hub);
    for (let w = 0; w < 4; w++) {
        const arm = new THREE.Group();
        arm.name = `arm_${w}`;
        arm.rotation.z = (w / 4) * Math.PI * 2;
        const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.09, 3.4, 0.09), timberTex);
        shaft.name = `shaft_${w}`;
        shaft.position.y = 1.7;
        arm.add(shaft);
        // outer frame edge (the trailing spar the lattice mounts to)
        const spar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.6, 0.06), timberTex);
        spar.name = `spar_${w}`;
        spar.position.set(0.55, 1.9, 0);
        arm.add(spar);
        // LATTICE: 6 cross-ribs shaft→spar (an open frame, not a slab —
        // wind passes through, the way real mills reef their sails)
        for (let rr = 0; rr < 6; rr++) {
            const rib = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.035), mat(0xdcdcba, 0.85, 0));
            rib.name = `rib_${w}_${rr}`;
            rib.position.set(0.3, 0.85 + rr * 0.42, 0);
            arm.add(rib);
        }
        // reefed cloth on the inner half (bone panel — sails working the wind)
        const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.2, 0.03), mat(0xdcdcba, 0.8, 0));
        cloth.name = `cloth_${w}`;
        cloth.position.set(0.3, 1.35, 0.015);
        arm.add(cloth);
        sails.add(arm);
    }
    g.add(sails);
    glow(g, "lamp", 0, 2.6, 1.7);
    mergeByMaterial(g, "wm3");
    writeFileSync("agents/arthur/assets/village_windmill3.glb", toGLB(g));
    console.log("village_windmill3.glb —", g.children.length, "nodes");
}
