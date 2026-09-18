// mkv3-pig1.ts — fauna loop 14: THE SWINEHERD'S CORNER (new species, FAUNA-PLAN
// fauna-14 candidate row, build owed this tick). Village logic: the charcoal
// kiln + the harvest cart's acorn crates already imply pannage (pigs fattened
// on autumn mast — the charcoal-burner's historical partner); a sty in sight
// of the kiln closes that loop the way the fold closes the dyehouse's.
//
// A British-saddleback sow pair as ONE entity (nx-dress-pig-001):
//   pig_a = ROOTER (head down in fresh-turned earth, the dig swing)
//   pig_b = WALLLOWER (belly-flat sprawl, dozing, ears over eyes)
// Species law (18m identity): a LOW BLACK BULK on green with a WHITE SADDLE
// BAND across the shoulders — bulk carried LOW (vs the sheep's high wool),
// no legs silhouette (trotters are stubs), disk snout proud. The saddle is
// the read; the sprawl is the character.
//
// Furniture (village language): timber sty frame (hurdle seg chassis, stile
// family 0x6f6432/0x5a5128) on the SSW side + a fresh-rooted earth patch
// (darker TROD-family texMat + clods + spoil heap under the rooter's snout —
// the ground-tie) + an oak-litter acorn scatter (the pannage signal).
//
// Build laws exercised: true-size build (no group scales — ×bake trap);
// neck-jointed heads (fauna-1) with pitch-about-pivot arithmetic composed
// BEFORE authoring (fauna-13 v3 law); hurdle members as DIRECT meshes with
// baked segment transforms (fauna-13 law c); furniture at final coords.
// Anchors (KEEP(pig_) added to mergekit this tick): pig_a/_head/_tail,
// pig_b/_ear/_tail — 6 motion targets (rooter: bob + root-dig X-pendulum +
// tail-curl flick; wallower: bob + ear-flick swivel + lazy tail). Motion
// lives in the placer (fauna14-place-pig.ts).
//
// Seat: (15.0, 40.2) yaw 0.66 in commons-next — meadow S of the kiln yard,
// E of the SE lane's mosaic 0048 edge (film NE edge point (12.9,43.2); 3.49m
// normal clearance — pigs root BESIDE art, never on it, sheep law), 5.2m
// from the harvest cart. Heads at local +z face NE toward the lane.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// species coats — flat mats (fauna law; tex-23 freed the animals)
const BLACK = 0x171310;  // warm black (dark-hole law: never cold black)
const SADDLE = 0xefe7d8; // white saddle band (the 18m read on black/green; v4 brightened)
const SNOUT = 0xc9a084;  // pale pink-tan snout disk (v6 judge: a near-black
                         // disk fused into the dark head/earth — the disk is
                         // the species marker and must READ)
const HOOF = 0x0e0b09;
const EYE = 0x0a0806;
const TIMB = 0x6f6432;   // sty rails (stile family)
const STAKE = 0x5a5128;  // sty stakes (second timber value)
// fresh-rooted earth: v4 (18m judge: near-black patch read as the pig's
// shadow) — WARMED to mid-brown values, clearly lighter than the sow's
// near-black coat; mottled texMat + geometric clods (fauna-13 law d)
const ROOT_M = texMat("pigsty-root", [0x6a5940, 0x5d4e38, 0x514430], { rough: .98, scale: 1.5, weights: [2, 2, 1], seed: 1414 });

// ---- one sow ----
// role: "root"   = standing, head pitched down into the spoil heap
//       "sprawl" = belly-flat doze, head low-level, ears over eyes
const sow = (
    x: number, z: number, yaw: number, tag: "a" | "b",
    role: "root" | "sprawl",
) => {
    const grp = new THREE.Group();
    grp.name = `pig_${tag}`;
    grp.position.set(x, 0, z);
    grp.rotation.y = yaw;

    const sprawled = role === "sprawl";
    // hull: the species bulk — LOW and long (belly near the ground)
    const hy = sprawled ? 0.21 : 0.40;         // hull center (sprawl: belly ~on the grass)
    const hsy = sprawled ? 0.20 : 0.24;        // half-height
    const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), mat(BLACK, 0.92, 0));
    hull.scale.set(0.205, hsy, sprawled ? 0.50 : 0.53);
    hull.position.set(0, hy, 0);
    grp.add(hull);
    // rump + shoulder roundness (a pig is a barrel, not an egg — but subtly)
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(BLACK, 0.92, 0));
    shoulder.scale.set(0.195, hsy * 0.96, 0.30);
    shoulder.position.set(0, hy, 0.20);
    grp.add(shoulder);
    const rump = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(BLACK, 0.92, 0));
    rump.scale.set(0.195, hsy * 0.94, 0.28);
    rump.position.set(0, hy, -0.25);
    grp.add(rump);
    // THE SADDLE: white band across the shoulders, cresting the spine and
    // proud of the hull sides (British-saddleback marker). v4 (18m judge):
    // the band area was sub-pixel on the standing pig and hid behind the
    // hull crest line — WIDER band (z half 0.165→0.20), taller crest, plus
    // a white CHEST WRAP down the shoulder front so the camera-facing zone
    // reads white as a mass, not a sliver.
    const band = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), mat(SADDLE, 0.92, 0));
    // sprawled band bottom must stay ≥ the hull belly (decode caught v4
    // digging −13mm: half 0.235 at center 0.222); crest shows on top only
    band.scale.set(0.225, sprawled ? 0.22 : hsy + 0.045, sprawled ? 0.19 : 0.20);
    band.position.set(0, hy + (sprawled ? 0.022 : 0.02), 0.13);
    grp.add(band);
    if (!sprawled) {
        // chest wrap: the saddle blanket reaching down the shoulder front
        const wrap = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(SADDLE, 0.92, 0));
        wrap.scale.set(0.19, hsy * 0.82, 0.155);
        wrap.position.set(0, hy - 0.035, 0.26);
        grp.add(wrap);
    }

    // ---- legs ----
    if (!sprawled) {
        // standing trotters: rear black, FRONT WHITE (the saddle carries)
        for (const [sx, sz, front] of [[-0.13, 0.28, 1], [0.13, 0.28, 1], [-0.14, -0.27, 0], [0.14, -0.27, 0]] as const) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.034, 0.23, 6), mat(front ? SADDLE : BLACK, 0.92, 0));
            leg.position.set(sx, 0.115, sz);
            grp.add(leg);
            const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.026, 0.062), mat(HOOF, 0.9, 0));
            hoof.position.set(sx, 0.013, sz + 0.006);
            grp.add(hoof);
        }
    } else {
        // sprawled: stub legs folded forward/back, hull sinks to the grass
        for (const [sx, sz, front] of [[-0.12, 0.30, 1], [0.12, 0.30, 1], [-0.13, -0.26, 0], [0.13, -0.26, 0]] as const) {
            const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, front ? 0.11 : 0.09, 6), mat(front ? SADDLE : BLACK, 0.92, 0));
            // tilted cylinder's y-extent = (h/2)·cos + r·sin (decode caught
            // v2 digging −7.6mm) — seat y = extent + 1mm clearance
            const ext = (front ? 0.055 : 0.045) * Math.cos(0.55) + 0.030 * Math.sin(0.55);
            stub.position.set(sx, ext + 0.001, sz + (front ? 0.045 : -0.035));
            stub.rotation.x = front ? -0.55 : 0.45;
            grp.add(stub);
        }
    }

    // ---- head subtree: origin = the chest-top joint (pigs have no neck;
    // the head flows off the shoulders). Pitch composed via the role. ----
    const head = new THREE.Group();
    head.name = `pig_${tag}_head`;
    // v4 (18m judge): rooter joint DROPPED (0.40→0.30) + pitch steepened
    // (0.92→1.05) so the head silhouette breaks clearly BELOW the hull
    // line (head bottom 0.30-0.18=0.12 vs hull bottom 0.16) — v3's head
    // hung inside the hull's y-band, no silhouette break, pose unreadable.
    const jointY = sprawled ? 0.33 : 0.30;
    head.position.set(0, jointY, 0.46); // the joint (pendulum swings here)
    const pitch = sprawled ? 0.35 : 1.05; // rooter: steep dig angle
    // skull
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), mat(BLACK, 0.92, 0));
    skull.scale.set(0.82, 0.88, 1.08);
    skull.position.set(0, -0.02, 0.075);
    head.add(skull);
    // snout: the DISK — flat cylinder proud of the skull front; PALE
    // pink-tan (v6: the disk is the species marker — a dark disk is
    // invisible against the dark head; pale reads at distance)
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.057, 0.042, 12), mat(SNOUT, 0.9, 0));
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, -0.045, 0.170);
    head.add(snout);
    // ears: big pendant flaps hanging OVER the eyes (species marker; the
    // wallower's doze read) — dark, slightly out-turned. The WALLOWER's pair
    // rides its own keep-group (pig_b_ear, the cat's bcat_ears pattern) so
    // the ear-flick comp swivels them; the rooter's merge into the head.
    const earGrp = new THREE.Group();
    if (sprawled) {
        earGrp.name = `pig_${tag}_ear`;
        earGrp.position.set(0, 0.015, 0.035);
        head.add(earGrp);
    }
    for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), mat(BLACK, 0.92, 0));
        ear.scale.set(0.62, 1.25, 0.80);
        ear.position.set(side * 0.085, 0, 0);
        ear.rotation.z = side * -0.52;
        ear.rotation.x = 0.30;
        (sprawled ? earGrp : head).add(ear);
    }
    // eyes (dark, side-set — mostly ear-shadowed, species-true)
    for (const side of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.009, 5, 4), mat(EYE, 0.9, 0));
        eye.position.set(side * 0.060, 0.008, 0.078);
        head.add(eye);
    }
    head.rotation.x = pitch;
    grp.add(head);
    // pitch arithmetic (fauna-13 v3 law — compose BEFORE authoring the
    // ground-tie): rooter pitch 0.92 → snout terminus head-local (0,-0.045,
    // 0.187): y' = -0.045·cos.92 - 0.187·sin.92 = -0.027-0.150 = -0.177,
    // z' = -0.045·sin.92 + 0.187·cos.92 = -0.036+0.113 = +0.077 → snout
    // sow-local (0, 0.223, 0.537) — the spoil heap must crest ~0.20 there.

    // ---- tail subtree: the CURL — torus arc standing vertical in the
    // profile plane at the rump (visible from the side, species marker) ----
    const tail = new THREE.Group();
    tail.name = `pig_${tag}_tail`;
    tail.position.set(0, sprawled ? 0.36 : 0.52, sprawled ? -0.48 : -0.53);
    const curl = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.011, 6, 14, 4.1), mat(BLACK, 0.92, 0));
    curl.rotation.y = Math.PI / 2;
    tail.add(curl);
    grp.add(tail);

    return grp;
};

// ---- the pair (entity-local: both face +z/NE toward the lane) ----
g.add(sow(0.55, 0.55, 0.35, "a", "root"));    // rooter NE, snout in the patch
g.add(sow(-0.70, -0.10, -0.45, "b", "sprawl")); // wallower SW, sprawled

// ---- ×1.3 TRUE-SIZE BAKE (v7, fauna-8 law: toGLB drops group scales —
// bake positions ×1.3 + mesh scales ×1.3 group-locally AFTER construction,
// joints included). A British-saddleback sow stands ~0.90m: v6's 0.63m put
// every identity marker at 1-2px at 18m (struct-45 fraction-of-frame law;
// three FAIL rounds were mostly THIS). Sows then stand 0.82, sprawl 0.47.
{
    const S = 1.3;
    const bake = (o: THREE.Object3D) => {
        o.position.multiplyScalar(S);
        o.scale.multiplyScalar(S);
        for (const c of o.children) bake(c);
    };
    for (const c of [...g.children]) if ((c as any).name.startsWith("pig_")) bake(c);
}

// ---- furniture (placed AFTER the bake at FINAL coords — fauna-11 law b:
// the bake multiplies entity-level furniture away from its subject) ----
{
    const patch = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.86, 0.016, 22), ROOT_M);
    patch.scale.set(1.0, 1.0, 0.88);
    patch.position.set(0.86, 0.008, 1.16);
    patch.name = "root_patch";
    g.add(patch);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.58, 0.014, 18), mat(0x5d4e38, 0.98, 0));
    core.position.set(0.88, 0.016, 1.18);
    core.name = "root_core";
    g.add(core);
    // spoil: v7 LOW SPOIL SPREAD (v1-v6 heap crest 0.20 BURIED the rooter's
    // snout disk — struct-52 occlusion-by-construction, why no judge ever
    // saw a head terminus): a 0.09-crest mound that meets the disk's rim
    // (disk center now y 0.169, radius 0.075 → rim 0.094; spoil crest 0.09
    // — the disk reads as pressed INTO the churn, not swallowed)
    const heap = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), ROOT_M);
    heap.scale.set(0.95, 0.26, 0.90);
    heap.position.set(0.94, 0.089, 1.30);
    heap.name = "spoil_heap";
    g.add(heap);
    // turned clods (dark boxes scattered on the patch)
    let s = 17;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 7; k++) {
        const a = rnd() * Math.PI * 2, rr = 0.24 + rnd() * 0.5;
        const clod = new THREE.Mesh(new THREE.BoxGeometry(0.05 + rnd() * 0.04, 0.030 + rnd() * 0.02, 0.04 + rnd() * 0.03), mat(0x514430, 0.98, 0));
        clod.position.set(0.86 + Math.cos(a) * rr, 0.026 + rnd() * 0.008, 1.16 + Math.sin(a) * rr * 0.85);
        clod.rotation.y = rnd() * Math.PI;
        clod.name = `clod_${k}`;
        g.add(clod);
    }
}

// ---- oak-litter scatter (the pannage signal): acorns + leaves around the
// wallower + toward the frame — mast from the cart's crates ----
{
    let s = 53;
    const rnd = () => (s = (s * 48271) % 2147483647) / 2147483647;
    for (let k = 0; k < 9; k++) {
        const acorn = new THREE.Mesh(new THREE.SphereGeometry(0.013, 6, 5), mat(0x7a5c34, 0.9, 0));
        acorn.scale.set(1, 1.25, 1);
        acorn.position.set(-0.95 + rnd() * 1.9, 0.016, -0.55 + rnd() * 0.9);
        acorn.name = `acorn_${k}`;
        g.add(acorn);
    }
    for (let k = 0; k < 6; k++) {
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.004, 0.024), mat(0x94713c, 0.95, 0));
        leaf.position.set(-1.0 + rnd() * 1.9, 0.004, -0.65 + rnd() * 1.0);
        leaf.rotation.y = rnd() * Math.PI;
        leaf.name = `oakleaf_${k}`;
        g.add(leaf);
    }
}

// ---- sty frame: two hurdle segments on the SSW arc (windbreak shelter,
// opening NE toward the lane) — hurdle chassis, direct meshes with baked
// segment transforms (fauna-13 law c) ----
{
    const seg = (cx: number, cz: number, yaw: number, len = 1.05) => {
        const co = Math.cos(yaw), si = Math.sin(yaw);
        const put = (w: number, h: number, d: number, m: THREE.Material, lx: number, ly: number, lz: number) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
            mesh.position.set(cx + lx * co + lz * si, ly, cz - lx * si + lz * co);
            mesh.rotation.y = yaw;
            g.add(mesh);
        };
        for (const h of [0.42, 0.26]) put(len, 0.055, 0.035, mat(TIMB, 0.9, 0), 0, h, 0.045);
        for (let i = 0; i < 4; i++) {
            const sx = -len / 2 + (len / 3) * i;
            const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.026, 0.52, 6), mat(STAKE, 0.9, 0));
            stake.position.set(cx + sx * co + 0.055 * si, 0.26, cz - sx * si + 0.055 * co);
            g.add(stake);
        }
    };
    seg(-1.05, -1.02, 0.55);   // W segment
    seg(0.22, -1.22, -0.10);   // S segment (the gate-side wing)
    seg(1.28, -0.85, -0.72, 0.85); // E wing (v6 judge: two orphaned runs read
                                    // as fence fragments, not a pen — the
                                    //corner return closes the loop; sheep
                                    // fold's E-wing pattern, checked ≥0.35
                                    // clear of pig_a's hull x-extreme 0.76)
}

mergeByMaterial(g, "pigsty1");
writeFileSync("agents/arthur/assets/village_dress_pigsty.glb", toGLB(g));
console.log("village_dress_pigsty.glb —", g.children.length, "top-level");
