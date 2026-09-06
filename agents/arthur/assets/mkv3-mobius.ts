// mkv3-mobius.ts — STRUCTURES LANE struct-5: S-4 MÖBIUS BANDSTAND.
// struct-42 REBUILD (improve round-1 row 23): the original 36 discrete
// pitched boxes stepped the rim ~9cm at every seam (native-confirmed
// V-notch serration) and their flat end-faces at mismatched pitch opened
// wedge see-throughs (native-confirmed right-half slit). One cause, both
// findings. This is the TRUE form: ONE continuous swept band —
// rectangular cross-section (W x T) whose pitch rotates continuously
// phi = theta/2 (half-twist per revolution), 144 segments (1.3mm chord
// sagitta — smooth at any distance), Möbius join WELDED (ring N reuses
// ring 0's vertices with corner flip j -> j+2; the twisted sweep closes
// as an orientable torus boundary, so winding stays consistent).
// Materials moved to texMat lanes (struct-38/39/40 family law — plain
// mat() buckets export no glTF material and render loader-default).
// 6 slender posts carry the band's centerline ring; stone stage disc
// with brass spin pin below. Open sides (walk in). Collider honesty:
// bbox ~12.5x12.5 = 156m2 >= 16, height ~5 >= 2.2 -> real trimesh.
// No comps, no motion.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
// texMat lanes (close tones, family idioms: folly_core posts / hypar gold)
const bandMat = texMat("mobius_band", [0x787250, 0x6e6a4c, 0x82765a], { rough: 0.9, scale: 2, weights: [2, 1, 1] });
const postMat = texMat("mobius_iron", [0x44402e, 0x3c3828, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const goldTex = texMat("mobius_gold", [0xa09832, 0x887c2a], { rough: 0.85, scale: 2, weights: [3, 1] });

const R = 5.5;        // band centerline radius
const W = 2.0;        // band width (cross-section)
const T = 0.09;       // band thickness
const Y = 4.0;        // band centerline height
const N = 144;        // sweep segments (2.5 deg; continuous pitch)

// THE BAND: one half-twist per revolution, swept continuously.
// Frame at azimuth th, pitch phi = th/2:
//   center C = (R sin th, Y, R cos th)
//   width  dir Y' = (sin phi sin th, cos phi, sin phi cos th)
//   thick  dir Z' = (sin th cos phi, -sin phi, cos th cos phi)
// corner(a,b) = C + a*Y' + b*Z'   (a in +/-W/2, b in +/-T/2)
// Join law: at th = 2pi the section is rotated 180deg (phi = pi maps
// Y'->-Y', Z'->-Z'), so ring N's corner (a,b) coincides with ring 0's
// corner (-a,-b) — we WELD by reusing ring 0's vertex indices with the
// corner-index map j -> (j+2)%4 (rotation preserves cyclic order, so
// quad winding stays outward all the way around the closed surface).
const A = W / 2, B = T / 2;
const corner = (th: number, a: number, b: number): [number, number, number] => {
    const phi = th / 2, sp = Math.sin(phi), cp = Math.cos(phi);
    const st = Math.sin(th), ct = Math.cos(th);
    return [
        R * st + a * sp * st + b * st * cp,
        Y + a * cp - b * sp,
        R * ct + a * sp * ct + b * ct * cp,
    ];
};
// section corner order (cyclic): 0:(-A,-B) 1:(+A,-B) 2:(+A,+B) 3:(-A,+B)
const SA = [-A, A, A, -A], SB = [-B, -B, B, B];
const pos: number[] = [], uv: number[] = [], idx: number[] = [];
const ringIdx: number[][] = []; // ringIdx[i][j] = vertex index of ring i, corner j
for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2;
    const ring: number[] = [];
    for (let j = 0; j < 4; j++) {
        const p = corner(th, SA[j], SB[j]);
        ring.push(pos.length / 3);
        pos.push(p[0], p[1], p[2]);
        uv.push((i / N) * 12, j / 4); // u: 12 tiles around; v: section param
    }
    ringIdx.push(ring);
}
// welded join: ring N == ring 0 with corner map j -> (j+2)%4
ringIdx.push([ringIdx[0][2], ringIdx[0][3], ringIdx[0][0], ringIdx[0][1]]);
// quads between ring i and ring i+1 (i = 0..N-1 closes the loop)
for (let i = 0; i < N; i++) {
    const r0 = ringIdx[i], r1 = ringIdx[i + 1];
    for (let j = 0; j < 4; j++) {
        const jn = (j + 1) % 4;
        idx.push(r0[j], r0[jn], r1[jn], r0[j], r1[jn], r1[j]);
    }
}
const bandGeom = new THREE.BufferGeometry();
bandGeom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
bandGeom.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
bandGeom.setIndex(idx);
bandGeom.computeVertexNormals();
const band = new THREE.Mesh(bandGeom, bandMat);
band.name = "band";
g.add(band);

// 6 slender posts carry the band's centerline ring (tops hidden inside
// the band thickness — the twist rides above them)
for (let p = 0; p < 6; p++) {
    const th = (p / 6) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, Y, 10), postMat);
    post.name = `post_${p}`;
    post.position.set(R * Math.sin(th), Y / 2, R * Math.cos(th));
    g.add(post);
}

// performance circle: stone stage disc + brass center pin
{
    const stage = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.65, 0.3, 24), stoneTex);
    stage.name = "stage";
    stage.position.y = 0.15;
    g.add(stage);
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), goldTex);
    pin.name = "spinpin";
    pin.position.y = 0.42;
    g.add(pin);
}

const merged = mergeByMaterial(g, "mobius");
writeFileSync("agents/arthur/assets/village_mobius3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_mobius3.glb");
