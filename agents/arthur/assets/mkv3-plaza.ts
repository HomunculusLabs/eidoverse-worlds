// mkv3-plaza.ts — the PLAZA HEARTHBOWL: the village fire at (0,0).
// Stone bowl (footprint <2m² per L4 — no solid-box collider), fire anchor
// for embers, 4 log seats, 8 hearth stones. Merged: ~4 nodes.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// tex-52 THE WELL + HEARTH RING: the plaza's stones and woodwork join
// the families — the well drum + stone trough + the 8 hearth stones +
// 4 cap stones + the storyteller's seat take the village ashlar
// (placed/cut stones take the village stone — the tex-45/47/48
// placed-stones law, now come home to the hearth itself); the well
// posts + crossbar + winding axle + crank handle + the tripod legs +
// the well bucket take the timber (sawn boards and staves — the
// fences/buckets law); the kettle + chain + spout + lid + crank arm
// take the forge iron (smithed vessels and mechanisms). Barked log
// seats + firewood stay flat (logs are logs, not sawn boards), rope
// stays rope, water stays water, the soot-dark bowl stays dark, and
// the fire stays emissive (light is light).
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
// polish-300: the gathering-ring flags take their own darker cut-flag family —
// pixel-probed ~4% value separation vs ground made the shared-ashlar ring melt
// into the field (ring 177,188,167 vs ground 183,194,180). Slightly darker,
// earthier, flag-stone grit; still reads stone, decisively darker than ground.
const flagTex = texMat("flag", [0x4e4a38, 0x54503c, 0x444030], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 40 });
const timberTex = texMat("timber", [0x56503c, 0x605c40, 0x4a4632], { rough: 0.9, scale: 3, weights: [2, 1, 1] });
const ironTex = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const texBox = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    g.add(mesh);
};

const g = new THREE.Group();
// the bowl
// tex-67: the hearth bowl joins the forge iron — a smithed vessel over
// fire, the brazier-bowl law (tex-50: bowls that hold flame are the
// smith's own). The split-log benches stay flat (raw logs, the
// chopblock law); end-grain discs, rope, ladle, and water stay flat.
const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.58, 0.52, 12), ironTex);
bowl.name = "bowl";
bowl.position.y = 0.26;
g.add(bowl);
// coal bed (fire anchor — embers comp rides this)
const fire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), new THREE.MeshStandardMaterial({ color: 0xff9040, emissive: new THREE.Color(0xff6a1a), emissiveIntensity: 1.0, roughness: 0.35, metalness: 0.1 }));
fire.name = "fire";
fire.position.y = 0.58;
g.add(fire);
// 4 HEARTH BENCHES at the diagonals — split-log seats (flat top face where
// the log was sawn lengthwise, bark sides, end-grain discs) + the
// STORYTELLER'S STONE (a taller seat facing the fire, at the S approach)
for (let s = 0; s < 4; s++) {
    const a = ((45 + s * 90) * Math.PI) / 180;
    const bench = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.15, 9, 1, false, 0, Math.PI * 2), mat(0x6c5426, 0.9, 0));
    bench.name = `log_${s}`;
    bench.rotation.z = Math.PI / 2;
    bench.rotation.y = -a;
    // flatten the seating face: scale y to make the top sawn-flat
    bench.scale.set(1, 0.62, 1);
    bench.position.set(Math.cos(a) * 1.9, 0.11, Math.sin(a) * 1.9);
    g.add(bench);
    // end-grain disc (lighter cut face on the outer end)
    const grain = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 9), mat(0x9e8e46, 0.85, 0));
    grain.name = `grain_${s}`;
    grain.rotation.z = Math.PI / 2;
    grain.rotation.y = -a;
    grain.scale.set(1, 0.62, 1);
    grain.position.set(Math.cos(a) * 1.9 + Math.cos(-a) * 0.58, 0.11, Math.sin(a) * 1.9 + Math.sin(-a) * 0.58);
    g.add(grain);
}
// plaza-4 RING STONES: the hearth's own stone circle takes the UV-window
// language — 8 hearth stones + 4 cap stones + well drum + trough + the
// storyteller's stone each show a hash-shifted window at their own block
// scale (tex-52 gave them the tile but identical UVs; the fire ring is the
// most-viewed stone cluster in the village and reads tiled up close).
const ringHash = (n: number) => Math.abs(Math.sin(n * 12.9898 + 78.233) * 43758.5453) % 1;
const winUV = (mesh: THREE.Mesh, hi: number) => {
    const du = (hi * 7) % 1, dv = (hi * 13 / 7) % 1, sc = 0.9 + ((hi * 29) % 1) * 0.22;
    const uv = mesh.geometry.attributes.uv;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, (uv.getX(k) + du) * sc, (uv.getY(k) + dv) * sc);
};
// the storyteller's stone: taller flat rock at the S approach (0.8, 2.9) —
// OFF the N plaza axis (loop #84: was at x0, blocking the gate→hearth line)
const ss = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.5, 8), stoneTex);
ss.name = "tale_seat";
ss.scale.set(1.2, 1, 0.8);
ss.position.set(0.8, 0.25, 2.9);
winUV(ss, ringHash(101));
g.add(ss);
// 8 hearth stones ringing the fire (flat; 4 alternating ones get a raised
// cap stone — the fire ring was repaired with newer stones over the years)
for (let st = 0; st < 8; st++) {
    const a = (st / 8) * Math.PI * 2 + Math.PI / 8;
    texBox(`hstone_${st}`, 0.42, 0.12, 0.3, Math.cos(a) * 1.05, 0.06, Math.sin(a) * 1.05, stoneTex);
    if (st % 2 === 0) texBox(`hcap_${st}`, 0.34, 0.08, 0.24, Math.cos(a) * 1.05, 0.16, Math.sin(a) * 1.05, stoneTex);
}
// (plaza-4: hstone/hcap windows applied post-add — texBox adds to g; find
// by name and window the geometry in place)
for (const ch of g.children) {
    if ((ch.name.startsWith("hstone_") || ch.name.startsWith("hcap_")) && (ch as any).isMesh) {
        winUV(ch as THREE.Mesh, ringHash(parseInt(ch.name.split("_")[1], 10) + (ch.name.startsWith("hcap_") ? 50 : 200)));
    }
}
// 8 outer pavers at r=2.7 (gathering ring) — WORN: alternating sizes and
// 1cm dips, matching the ring road's wear (a meeting spot trampled daily)
// plaza-1 PAVING: the gathering ring joins the village ashlar — laid
// stone underfoot around the fire (the r=5 plaza ring + these complete
// the plaza floor; roads stay earth). Per-slab variance by the UV-
// window language (hash-shifted window + block-scale jitter over ONE
// standing tile) + the existing wear alternation — hand-laid, not tiled.
const uvWindow = (mesh: THREE.Mesh, hi: number) => {
    const du = (hi * 7) % 1, dv = (hi * 13 / 7) % 1, sc = 0.9 + ((hi * 29) % 1) * 0.22;
    const uv = mesh.geometry.attributes.uv;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, (uv.getX(k) + du) * sc, (uv.getY(k) + dv) * sc);
};
// polish-300 GATHERING RING RE-LAY: judged from live pixels at 18m, the 8
// long tangential slabs read as scattered debris — root cause probed: ring
// band mean RGB (177,188,167) vs open ground (183,194,180) = ~4% value
// separation (shared stoneTex melts into the ground) + 8 plank-scale slabs.
// One coherent intervention: a true flagstone ring — 20 slots at r 2.95
// (9°+k·18°, none dead-on the well axis), alternating 0.58/0.46m flags
// (flagstone scale, not plank scale), own darker cut-flag family for value
// separation from both ground and the fire-ring ashlar. Obstacle math
// (corner-checked): inner edge r 2.60 clears the bench tips (2.475) by
// 0.125m at every diagonal; the ±9° well-apron flags are narrowed+shortened
// (0.30×0.30 @ r 2.62 — nearest corner 0.702 vs drum r 0.68, 2.2cm clear);
// the 81° slot is skipped — the storyteller's stone owns that sector.
for (let pv = 0; pv < 20; pv++) {
    const a = ((9 + pv * 18) * Math.PI) / 180;
    const big = pv % 2 === 0;
    const h = Math.abs(Math.sin(pv * 91.7 + 5.3) * 43758.5453) % 1;
    if (pv === 4) continue; // tale-seat sector
    // polish-300 v2: the two tiny well-apron flags (0.30×0.30 @ r 2.62) read
    // as ambiguous slivers at aerial zoom (judge nit) — the well owns its own
    // sector; the ring now carries two DELIBERATE breaks (well E, teller S).
    if (pv === 0 || pv === 19) continue; // well sector — bare approach
    const tangent = big ? 0.58 : 0.46;
    const radial = 0.7;
    const rr = 2.95;
    const m = new THREE.Mesh(new THREE.BoxGeometry(tangent, 0.06, radial), flagTex);
    m.name = `ppaver_${pv}`;
    m.position.set(Math.cos(a) * rr, (big ? 0.03 : 0.024) - h * 0.008, Math.sin(a) * rr);
    m.rotation.y = -a + (big ? 0.05 : -0.07);
    uvWindow(m, h);
    g.add(m);
}

// THE COOKING TRIPOD + KETTLE: three slender legs over the bowl rim, chain,
// and a round kettle hanging at cooking height — the plaza fire cooks, not
// just glows. All merged; thin legs = no collider concern at small-object scale.
for (let tp = 0; tp < 3; tp++) {
    const a = ((90 + tp * 120) * Math.PI) / 180;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.7, 6), timberTex);
    leg.name = `tpod_${tp}`;
    // feet at r=0.95 from center, tops meeting at (0, 1.75, 0)
    const fx = Math.cos(a) * 0.95, fz = Math.sin(a) * 0.95;
    leg.position.set(fx / 2, 0.88, fz / 2);
    // lean toward center: rotate about the axis perpendicular to the radial dir
    leg.rotation.z = 0.06; // placeholder—computed below via lookAt-style tilt
    leg.rotation.y = -a;
    // tilt: the leg leans inward ~16°
    const tilt = Math.atan2(0.95, 1.75);
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(Math.sin(a), 0, -Math.cos(a)), tilt);
    leg.quaternion.copy(q);
    g.add(leg);
}
// chain + kettle — Wakeup-37/38: the kettle rides a pz_kettle anchor group
// (KEEP pz_kettle) so a simmer comp has a real target; chain hangs static.
texBox("kchain", 0.02, 0.42, 0.02, 0, 1.55, 0, ironTex);
const kGrp = new THREE.Group();
kGrp.name = "pz_kettle";
const kettle = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), ironTex);
kettle.name = "kettle";
kettle.scale.set(1, 0.8, 1);
kettle.position.set(0, 1.12, 0);
kGrp.add(kettle);
g.add(kGrp);
// kettle spout + lid handle
texBox("kspout", 0.06, 0.05, 0.2, 0.2, 1.16, 0.1, ironTex);
texBox("klid", 0.2, 0.03, 0.2, 0, 1.32, 0, ironTex);
// firewood stacked between two hearth stones (SW side, off the seat diagonals)
for (let fw = 0; fw < 5; fw++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.55, 5), mat(0x6c5426, 0.95, 0));
    log.name = `plog_${fw}`;
    log.rotation.z = Math.PI / 2;
    const a = ((202.5 + (fw % 2) * 11) * Math.PI) / 180;
    log.position.set(Math.cos(a) * 1.45, 0.06 + Math.floor(fw / 2) * 0.12, Math.sin(a) * 1.45 + (fw % 2) * 0.08);
    g.add(log);
}

// THE WELL — stone drum, twin posts, crossbar, rope + bucket, at plaza E
// (footprint ~1.2m drum: small-object collider, not a room)
const WX = 3.4, WZ = 0;
const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.75, 10), stoneTex);
drum.name = "well_drum";
drum.position.set(WX, 0.375, WZ);
winUV(drum, ringHash(302)); // plaza-4: the well drum's own window
g.add(drum);
for (const pz of [-0.55, 0.55]) texBox(`wpost_${pz}`, 0.1, 1.5, 0.1, WX, 0.75, WZ + pz, timberTex);
texBox("wbar", 1.5, 0.09, 0.09, WX, 1.45, WZ, timberTex);
// WINDING AXLE: cylinder across the posts w/ a crank handle on the E face
// and 3 rope spiral turns — the mechanism that raises the bucket
const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 8), timberTex);
axle.name = "waxle";
axle.rotation.x = Math.PI / 2;
axle.position.set(WX, 1.45, WZ);
g.add(axle);
// crank: arm out + handle
texBox("crank_arm", 0.06, 0.32, 0.06, WX, 1.29, WZ + 0.72, ironTex);
const crankHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.24, 6), timberTex);
crankHandle.name = "crank_handle";
crankHandle.position.set(WX, 1.13, WZ + 0.78);
g.add(crankHandle);
// rope spiral on the axle (4 thin torus turns)
for (let rs = 0; rs < 4; rs++) {
    const turn = new THREE.Mesh(new THREE.TorusGeometry(0.065 + (rs % 2) * 0.012, 0.012, 4, 10), mat(0x9a9a58, 0.9, 0));
    turn.name = `wrope_${rs}`;
    turn.rotation.x = Math.PI / 2;
    turn.position.set(WX, 1.45, WZ - 0.28 + rs * 0.16);
    g.add(turn);
}
// STONE TROUGH at the drum's S side (for the animals) + a ladle hanging on
// the W post (bowl + handle)
texBox("trough", 1.0, 0.3, 0.45, WX, 0.15, WZ - 1.05, stoneTex);
for (const ch of g.children) if (ch.name === "trough" && (ch as any).isMesh) winUV(ch as THREE.Mesh, ringHash(404)); // plaza-4
const twater = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.04, 0.34), mat(0x506a78, 0.25, 0.4));
twater.name = "twater";
twater.position.set(WX, 0.31, WZ - 1.05);
g.add(twater);
const ladle = new THREE.Mesh(new THREE.SphereGeometry(0.09, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x9a9a58, 0.6, 0.1));
ladle.name = "ladle";
ladle.rotation.z = Math.PI * 0.85;
ladle.position.set(WX - 0.1, 0.95, WZ - 0.55);
g.add(ladle);
box(g, "ladle_handle", 0.3, 0.035, 0.035, WX - 0.26, 1.02, WZ - 0.55, 0xa09832);
// rope + bucket hang from the bar as a NAMED GROUP "well_" — pendulum comp
// target (sways in the breeze). Group origin AT the crossbar = the hinge.
const wellSwing = new THREE.Group();
wellSwing.name = "well_";
wellSwing.position.set(WX, 1.45, WZ);
const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 5), mat(0x9a9a58, 0.9, 0));
rope.name = "well_rope";
rope.position.y = -0.29;
wellSwing.add(rope);
const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.2, 8), timberTex);
bucket.name = "well_bucket";
bucket.position.y = -0.62;
wellSwing.add(bucket);
g.add(wellSwing);
// water glint inside drum
const water = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.03, 10), mat(0x506a78, 0.25, 0.4));
water.name = "well_water";
water.position.set(WX, 0.62, WZ);
g.add(water);

mergeByMaterial(g, "pz3");
writeFileSync("agents/arthur/assets/village_plaza3.glb", toGLB(g));
console.log("village_plaza3.glb —", g.children.length, "nodes");
