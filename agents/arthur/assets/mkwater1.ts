// mkwater1.ts — WATER & KINETIC PACK: tiered fountain (water particles),
// birdbath, wind chimes (slow spin), weathervane (rooster-arrow, faster spin).
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { writeFileSync } from "node:fs";

// ---- fountain: basin + pedestal + upper bowl (water comp on upper) ----
const fountain = new THREE.Group();
{
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.45, 14), mat(C.STONE, 0.95, 0));
    basin.name = "ft_basin";
    basin.position.y = 0.225;
    fountain.add(basin);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.08, 8, 16), mat(C.BONE, 0.7, 0.2));
    rim.name = "ft_rim";
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.46;
    fountain.add(rim);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 1.1, 10), mat(C.STONE, 0.95, 0));
    ped.name = "ft_pedestal";
    ped.position.y = 0.95;
    fountain.add(ped);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.5, 0.3, 12), mat(C.STONE, 0.95, 0));
    bowl.name = "ft_bowl";
    bowl.position.y = 1.65;
    fountain.add(bowl);
    // polish-322 (brass-ball identity): the finial was mat(C.BRASS,.3,.85) —
    // the legacy COLOR_0-only lane (no glTF material; params never reach the
    // wire), and C.BRASS 0xa0a248 is an olive that reads grey-white at 18m.
    // Judges (day+night, polish-321 close): "white blob on white spray" /
    // "foam-white glowing orb, brightest element". Re-authored as REAL
    // bell-gold (polish-307 belltower recipe 0xd9ac52 r.45 m.15) + faint
    // warm night accent 0xffc98a@0.06 — quiet brass below the moonlit-water
    // emissive ladder (strands .29, burst .42).
    const finialMat = new THREE.MeshStandardMaterial({
        color: 0xd9ac52, roughness: 0.45, metalness: 0.15,
        emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.06,
    });
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), finialMat);
    finial.name = "ft_finial";
    finial.position.y = 2.42;
    fountain.add(finial);
    // spout (water particles target = entity origin [0,1.95,0]) — NOTE: the
    // engine ships no water particle preset (shared/particles.js: fire/sparks/
    // embers/smoke/dust/snow/magic/stars/muzzle only), so water is GEOMETRY,
    // same law as the bakery cistern (mkv3-bakery-cistern97.ts). Water faces:
    // basin pool + upper-bowl pool + central jet; finial rides the jet crown.
    // polish-274 night law: the water faces vanish after dark (fountain is
    // 13m from the plaza light, past its range). Same-hue faint emissive on
    // the three water faces only — moonlit-water read, no added light source,
    // no bulb noise; stone stays unlit dark.
    const waterMat = new THREE.MeshStandardMaterial({
        color: 0x506a78, roughness: 0.25, metalness: 0.5,
        emissive: new THREE.Color(0x2e4a58), emissiveIntensity: 0.55,
    });
    const basinWater = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.38, 0.03, 14), waterMat);
    basinWater.name = "ft_basin_water";
    basinWater.position.y = 0.37;
    fountain.add(basinWater);
    // polish-320 water-read intervention (one defect class: fountain reads
    // dry — water invisible AS water; judges' convergent recipe 2026-09-20):
    //   (1) upper tier = real basin: bone retaining lip at the bowl top
    //       (r 0.75 tube 0.05, crest 1.85) + bowl water dropped 1.79 -> 1.755
    //       (9.5cm freeboard) so containment reads, not a disc flush on a
    //       flat-topped drum;
    //   (2) CASCADE SHEET: open-ended water film r 0.77 -> 0.79 falling from
    //       the lip (y 1.80) to the basin pool (y 0.38) — a 1.4m VERTICAL
    //       water wall. Flat pool interiors are rim-occluded at the 18m
    //       grazing vantage (dress-79 down-angle law); the vertical sheet is
    //       the water surface that actually reads at eye height, and its
    //       landing point tells the basin "water into water";
    //   (3) splash grammar: ripple ring where the cascade lands (r 0.78 on
    //       the basin pool) + squashed dome cresting the upper pool where
    //       the jet lands (dress-79 crest cure); jet flared (0.04 -> 0.09)
    //       and re-spanned 1.80..2.32 so it TOUCHES dome and finial — a
    //       stream meeting its splash, not a rod floating between.
    const bowlWater = new THREE.Mesh(new THREE.CylinderGeometry(0.63, 0.63, 0.03, 12), waterMat);
    bowlWater.name = "ft_bowl_water";
    bowlWater.position.y = 1.755;
    fountain.add(bowlWater);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 8, 16), mat(C.BONE, 0.7, 0.2));
    lip.name = "ft_lip";
    lip.rotation.x = Math.PI / 2;
    lip.position.y = 1.80;
    fountain.add(lip);
    // polish-320 v3 (measured round 3, judges' convergent recipe): the solid
    // sheet — dark (v1) or bright (v2) — reads as a monolithic slab/cake
    // tier; the dome was lip-occluded (polish-52: crest must clear the
    // RETAINING structure, not the water); the jet was sky-valued. v3:
    //   (a) CASCADE = 14 vertical STRANDS (thin boxes, tangent-aligned,
    //       tilted so the top hugs under the lip r 0.76 and the bottom
    //       flares to r ~0.90 + per-strand jitter) — gaps let the dark
    //       pedestal show through = natural vertical streaking and
    //       translucency; ragged landing line kills the box silhouette;
    //   (b) IMPACT FOAM at the basin landing (judge: "single change that
    //       does the most for working fountain"): fat bright ring r 0.87
    //       + 8 squashed foam blobs, near arc unoccluded at grazing;
    //   (c) DOME re-crested to clear the lip sight line (crest 1.90 vs lip
    //       band top 1.85; +4cm margin at the 18m/1.65m eye);
    //   (d) JET near-white FOAM material (brighter than the strands, holds
    //       against sky) + spray crown kissing the finial base.
    const sprayMat = new THREE.MeshStandardMaterial({
        color: 0xcfe4ec, roughness: 0.15, metalness: 0.35,
        emissive: new THREE.Color(0x9fc9dd), emissiveIntensity: 0.5,
    });
    const foamMat = new THREE.MeshStandardMaterial({
        color: 0xe9f5f9, roughness: 0.12, metalness: 0.3,
        emissive: new THREE.Color(0xc4e4f0), emissiveIntensity: 0.55,
    });
    const R_TOP = 0.76, R_BOT = 0.90;
    // v5 (judge's recipe): strand CLUSTERS and GAPS — widths swing 0.4x..2.2x
    // (clustered pairs vs wisps), two slots skipped entirely, lengths vary so
    // some fall short and some overshoot INTO the foam.
    const WPROF = [1.6, 0.5, 2.2, 1.1, 0.0, 1.8, 0.7, 0.0, 2.0, 0.9, 1.5, 0.6, 1.9, 1.2];
    const HPROF = [1.30, 1.05, 1.42, 1.18, 0, 1.38, 1.00, 0, 1.44, 1.12, 1.33, 1.02, 1.40, 1.20];
    for (let i = 0; i < 14; i++) {
        if (WPROF[i] === 0) continue; // gap
        const th = (i / 14) * Math.PI * 2 + (Math.sin(i * 12.9898) * 4.1147) % 1 * 0.14 - 0.07;
        const rTop = R_TOP + (((i * 7.3) % 1) - 0.5) * 0.03;
        const rBot = 0.82 + ((i * 5.1) % 1) * 0.20; // v6: landings spread 0.82..1.02 (judge: bundled at foot)
        const h = HPROF[i];
        const w = (0.011 + ((i * 6.1) % 1) * 0.007) * WPROF[i];
        const rm = (rTop + rBot) / 2;
        const strand = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.65, w, h, 4), sprayMat);
        strand.name = `ft_strand_${i}`;
        strand.position.set(Math.cos(th) * rm, 0, Math.sin(th) * rm);
        strand.position.y = 1.80 - h / 2 + ((i * 2.9) % 1) * 0.06; // tops hug under the lip, ragged
        const tangent = new THREE.Vector3(-Math.sin(th), 0, Math.cos(th));
        const radial = new THREE.Vector3(Math.cos(th), 0, Math.sin(th));
        const qAlign = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -th);
        const qTilt = new THREE.Quaternion().setFromAxisAngle(tangent, Math.atan((rBot - rTop) / h));
        const qJitter = new THREE.Quaternion().setFromAxisAngle(radial, (((i * 8.3) % 1) - 0.5) * 0.14);
        strand.quaternion.multiplyQuaternions(qJitter, qTilt.multiply(qAlign));
        fountain.add(strand);
    }
    // v6: foam ring lives in the visibility WINDOW (crest 0.53 > crest-
    // threshold 0.50; band top 0.505 < visible band bottom 0.52 — v5's
    // crest 0.60 swallowed the whole visible interior = "cream pie"; v3's
    // 0.47 sat below the threshold = invisible). BROKEN ring: 6 arcs with
    // gaps so dark pool shows between them.
    const splash = new THREE.Mesh(new THREE.TorusGeometry(0.90, 0.045, 7, 18), foamMat);
    splash.name = "ft_splash";
    splash.rotation.x = Math.PI / 2;
    splash.position.y = 0.485;
    fountain.add(splash);
    for (let i = 0; i < 8; i++) {
        const th = (i / 8) * Math.PI * 2 + 0.39;
        const r = 0.84 + ((i * 9.7) % 1) * 0.13;
        const blob = new THREE.Mesh(new THREE.SphereGeometry(0.06 + ((i * 4.3) % 1) * 0.035, 6, 4), foamMat);
        blob.name = `ft_foam_${i}`;
        blob.scale.set(1, 0.45, 1);
        blob.position.set(Math.cos(th) * r, 0.51, Math.sin(th) * r);
        fountain.add(blob);
    }
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.15, 9, 6), foamMat);
    dome.name = "ft_dome";
    dome.scale.set(1, 0.45, 1);
    dome.position.y = 1.845; // crest 1.91 — 6cm proud of lip band, modest scale (v5 read "white cone")
    fountain.add(dome);
    // v6: jet = THIN widening cone (base r 0.03 -> top r 0.085) — the v5 fat
    // base (0.10) read as a baluster/architecture. Crown = wide burst
    // (r 0.14, flat) at the finial base — the visible top of the plume.
    const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.03, 0.47, 8), foamMat);
    jet.name = "ft_jet";
    jet.position.y = 2.055; // spans 1.82..2.29
    fountain.add(jet);
    // v7 (polish-321): burst widened r 0.14 -> 0.24 — at 18m the v6 crown
    // (d 0.28m == ball d 0.28m) merged DOWNWARD into the white jet (judge:
    // "2-4px flare where jet meets ball", white-on-white); the wider
    // mushroom (d 0.48m, ~25px at 18m) reads as a distinct burst cap around
    // the jet top, annulus ~0.10m each side proud of the ball silhouette.
    // Crest stays 2.35 < ball equator 2.42 — ball still crowns the burst.
    // polish-322: node.scale.set(1,0.28,1) NEVER SHIPS (toGLB scale-drop,
    // polish-321 finding) — the burst rendered as a FULL sphere r 0.24
    // topping y 2.55 vs ball top 2.56, i.e. the brass ball ~96% ENCLOSED in
    // white foam (polish-52: enclosure beats tint). Bake the authored squash
    // into the GEOMETRY (flattened sphere y-semi-axis 0.067, crest 2.377 <
    // ball equator 2.42) so the ball's crown reads above the burst disc.
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 5), foamMat);
    crown.name = "ft_crown";
    crown.scale.set(1, 0.28, 1);
    const crownPos = crown.geometry.attributes.position;
    for (let vi = 0; vi < crownPos.count; vi++) crownPos.setY(vi, crownPos.getY(vi) * 0.28);
    crownPos.needsUpdate = true;
    crown.position.y = 2.31; // crest 2.377 — burst disc under the ball crown
    fountain.add(crown);
    // v6: lobes re-heighted into the window (0.49..0.515) + droplets in the
    // window (0.52..0.60, separated from the crest).
    for (let i = 0; i < 3; i++) {
        const th = i * 2.09 + 0.6;
        const arc = new THREE.Mesh(new THREE.TorusGeometry(0.88 + i * 0.025, 0.04 + i * 0.012, 7, 7, Math.PI * 0.42), foamMat);
        arc.name = `ft_lobe_${i}`;
        arc.rotation.x = Math.PI / 2;
        arc.rotation.z = th;
        arc.position.y = 0.49 + i * 0.012;
        fountain.add(arc);
    }
    for (let i = 0; i < 4; i++) {
        const th = 0.9 + i * 1.63;
        const drop = new THREE.Mesh(new THREE.SphereGeometry(0.028, 5, 4), foamMat);
        drop.name = `ft_drop_${i}`;
        drop.position.set(Math.cos(th) * 0.93, 0.545 + i * 0.02, Math.sin(th) * 0.93);
        fountain.add(drop);
    }
}

// ---- birdbath: low basin on foot + visiting bird ----
const birdbath = new THREE.Group();
{
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.6, 8), mat(C.STONE, 0.95, 0));
    foot.name = "bb_foot";
    foot.position.y = 0.3;
    birdbath.add(foot);
    const bath = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.14, 10), mat(C.BONE, 0.8, 0.1));
    bath.name = "bb_bath";
    bath.position.y = 0.67;
    birdbath.add(bath);
    const bird = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), mat(0x787250, 0.9, 0));
    bird.name = "bb_bird";
    bird.scale.set(1.3, 1, 1);
    bird.position.set(0.12, 0.8, 0.05);
    birdbath.add(bird);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.05, 5), mat(0xbaae62, 0.9, 0));
    beak.name = "bb_beak";
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.2, 0.8, 0.05);
    birdbath.add(beak);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.03), mat(0x787250, 0.9, 0));
    tail.name = "bb_tail";
    tail.position.set(0.02, 0.82, 0.05);
    tail.rotation.z = 0.4;
    birdbath.add(tail);
}

// ---- wind chimes: hook + disc + 7 tubes (slow sway via spin of whole) ----
const chimes = new THREE.Group();
{
    box(chimes, "wc_hook", 0.04, 0.12, 0.04, 0, 0, 0, C.DARK);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 10), mat(C.BRASS, 0.4, 0.8));
    top.name = "wc_top";
    top.position.y = -0.15;
    chimes.add(top);
    for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const len = 0.28 + (i % 3) * 0.09;
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, len, 6), mat(C.BRASS, 0.35, 0.85));
        tube.name = `wc_tube_${i}`;
        tube.position.set(Math.cos(a) * 0.1, -0.15 - len / 2 - 0.08, Math.sin(a) * 0.1);
        chimes.add(tube);
        const cord = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.08, 0.008), mat(C.BONE, 0.9, 0));
        cord.name = `wc_cord_${i}`;
        cord.position.set(Math.cos(a) * 0.1, -0.17, Math.sin(a) * 0.1);
        chimes.add(cord);
    }
    const clapper = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), mat(C.DARK, 0.6, 0.4));
    clapper.name = "wc_clapper";
    clapper.position.y = -0.42;
    chimes.add(clapper);
    const sailD = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.16), mat(C.BONE, 0.9, 0));
    sailD.name = "wc_sail";
    sailD.position.y = -0.58;
    chimes.add(sailD);
}

// ---- weathervane: post + compass + arrow + rooster silhouette ----
const vane = new THREE.Group();
{
    box(vane, "wv_post", 0.05, 0.9, 0.05, 0, 0.45, 0, C.DARK);
    const compass = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 8), mat(C.DARK, 0.7, 0.4));
    compass.name = "wv_compass";
    compass.position.y = 0.95;
    vane.add(compass);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 5), mat(C.BRASS, 0.35, 0.85));
    rod.name = "wv_rod";
    rod.position.y = 1.2;
    vane.add(rod);
    const arrow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.06), mat(C.BRASS, 0.35, 0.85));
    arrow.name = "wv_arrow";
    arrow.position.y = 1.28;
    vane.add(arrow);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 5), mat(C.BRASS, 0.35, 0.85));
    head.name = "wv_head";
    head.rotation.z = -Math.PI / 2;
    head.position.set(0.28, 1.28, 0);
    vane.add(head);
    // rooster silhouette (stylized boxes)
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.05), mat(C.DARK, 0.6, 0.4));
    body.name = "wv_rooster_body";
    body.position.set(-0.06, 1.35, 0);
    vane.add(body);
    const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.03), mat(C.DARK, 0.6, 0.4));
    tail2.name = "wv_rooster_tail";
    tail2.rotation.z = -0.6;
    tail2.position.set(-0.15, 1.4, 0);
    vane.add(tail2);
    const head2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.04), mat(C.DARK, 0.6, 0.4));
    head2.name = "wv_rooster_head";
    head2.position.set(0.02, 1.43, 0);
    vane.add(head2);
}

const OUT: Array<[string, THREE.Group]> = [
    ["village_fountain", fountain],
    ["village_birdbath", birdbath],
    ["village_chimes", chimes],
    ["village_weathervane", vane],
];
for (const [n, g] of OUT) writeFileSync(`agents/arthur/assets/${n}.glb`, toGLB(g));
console.log(OUT.map(([n, g]) => `${n}(${g.children.length})`).join(", "));
