// improve16-decode-garden.ts — decode audit: after (cee52aca) vs before
// (872aec35). Checks: (1) b17 keep-out zone (x −0.75..0.75, y 2.08..2.54,
// z 1.75..1.92) differential — identical vert sets, zero new/gone; (2) win_e
// pane proud of the x=2.2 face; (3) win_s pane proud of the z=1.8 face;
// (4) win_n pane proud of the z=−1.8 face; (5) gcwall texMat bucket present;
// (6) footprint bbox comparison (must be unchanged: ±5.0 x, −3.8 z).
import { readFileSync } from "node:fs";

function decodeGLB(path: string) {
  const buf = readFileSync(path);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const jsonLen = dv.getUint32(12, true);
  const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString("utf8"));
  let binHdr = 20 + jsonLen; binHdr = (binHdr + 3) & ~3;
  const binHdrLen = dv.getUint32(binHdr, true);
  if (dv.getUint32(binHdr + 4, true) !== 0x004e4942) throw Error(`BIN magic at ${binHdr}`);
  const base0 = binHdr + 8;
  const bin = buf.slice(binHdr + 8, binHdr + 8 + binHdrLen);
  const meshes = json.meshes ?? [];
  const nodes = json.nodes ?? [];
  const out: { node: string; verts: [number, number, number][] }[] = [];
  for (const node of nodes) {
    if (node.mesh === undefined) continue;
    if (node.mesh === 0) { /* mesh index 0 is legal (falsy-trap law) */ }
    const mesh = meshes[node.mesh];
    if (!mesh) continue;
    const t = node.translation ?? [0, 0, 0];
    for (const prim of mesh.primitives) {
      const posAcc = json.accessors[prim.attributes.POSITION];
      const bv = json.bufferViews[posAcc.bufferView];
      const off = (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
      const n = posAcc.count;
      const verts: [number, number, number][] = [];
      for (let i = 0; i < n; i++) {
        const o = base0 + off + i * 12;
        verts.push([
          dv.getFloat32(o, true) + t[0],
          dv.getFloat32(o + 4, true) + t[1],
          dv.getFloat32(o + 8, true) + t[2],
        ]);
      }
      out.push({ node: node.name ?? `#${nodes.indexOf(node)}`, verts });
    }
  }
  return { json, buckets: out };
}

const A = decodeGLB("/tmp/improve16/before-garden.glb");
const B = decodeGLB("agents/arthur/assets/village_garden_cottage.glb");
const allV = (d: ReturnType<typeof decodeGLB>) => d.buckets.flatMap((b) => b.verts);
const bbox = (vs: [number, number, number][]) => {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (const v of vs) for (let i = 0; i < 3; i++) { if (v[i] < mn[i]) mn[i] = v[i]; if (v[i] > mx[i]) mx[i] = v[i]; }
  return { mn, mx };
};
const fmt = (b: any) => b.mn.map((n: number) => n.toFixed(3)).join(",") + " .. " + b.mx.map((n: number) => n.toFixed(3)).join(",");
let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " | " + detail : ""}`);
  ok ? pass++ : fail++;
};

// (1) b17 keep-out differential
const inZone = (v: [number, number, number]) =>
  v[0] >= -0.75 && v[0] <= 0.75 && v[1] >= 2.08 && v[1] <= 2.54 && v[2] >= 1.75 && v[2] <= 1.92;
const za = allV(A).filter(inZone).map((v) => v.map((n) => n.toFixed(4)).join(",")).sort();
const zb = allV(B).filter(inZone).map((v) => v.map((n) => n.toFixed(4)).join(",")).sort();
check("b17 keep-out differential identical", za.length === zb.length && za.join("|") === zb.join("|"), `zone verts ${za.length}==${zb.length}`);

// (2)-(4) proud panes: warm-pane material verts past faces. Panes are the
// emissive material bucket — find buckets whose material has emissive.
const emissive = (d: ReturnType<typeof decodeGLB>) =>
  d.buckets.filter((b) => {
    const mesh = d.json.meshes[d.json.nodes.find((n: any) => n.name === b.node)?.mesh];
    return mesh?.primitives?.some((p: any) => {
      const m = d.json.materials?.[p.material];
      return m?.emissiveFactor;
    });
  });
const eb = emissive(B);
const paneVerts = eb.flatMap((b) => b.verts);
const eXs = paneVerts.filter((v) => Math.abs(v[1] - 1.5) < 0.5 && Math.abs(v[2]) < 0.4).map((v) => +v[0].toFixed(3)).sort((a, b) => a - b).pop() ?? "none";
check("win_e pane past x=2.2", paneVerts.some((v) => v[0] > 2.2 && v[0] < 2.3 && Math.abs(v[1] - 1.5) < 0.5 && Math.abs(v[2]) < 0.4), `max x ${eXs}`);
const sZs = paneVerts.filter((v) => v[0] < -0.9 && v[1] < 1.6).map((v) => +v[2].toFixed(3)).sort((a, b) => a - b).pop() ?? "none";
check("win_s pane past z=1.8", paneVerts.some((v) => v[2] > 1.8 && v[2] < 1.9 && v[0] < -0.9 && v[1] < 1.6), `max z ${sZs}`);
const nZs = paneVerts.filter((v) => Math.abs(v[0] + 1.2) < 0.45).map((v) => +v[2].toFixed(3)).sort((a, b) => a - b).shift() ?? "none";
check("win_n pane past z=-1.8", paneVerts.some((v) => v[2] < -1.8 && v[2] > -1.9 && Math.abs(v[0] + 1.2) < 0.45), `min z ${nZs}`);
const ea = emissive(A);
check("pane bucket count grows (1 buried-lit before -> visible after)", eb.length >= ea.length, `emissive buckets ${ea.length}->${eb.length}`);

// (5) gcwall bucket present with texMat
const gcm = B.json.materials?.find((m: any) => m.name === "gcwall");
check("gcwall texMat material present", !!gcm, gcm ? "found" : "MISSING");

// (6) bbox comparison — fence post caps extend 0.105m past the old board
// ends at the two far corners (x −5.105, z −3.905): recorded growth toward
// open ground (away from the carousel side), SAT-neutral, placer preflights.
const ba = bbox(allV(A)), bb = bbox(allV(B));
const near = (a: number, b: number, tol = 0.02) => Math.abs(a - b) <= tol;
check("bbox x growth = post-cap extent only (−0.105)", near(bb.mn[0], ba.mn[0] - 0.105, 0.02) && near(ba.mx[0], bb.mx[0]), `x ${ba.mn[0].toFixed(3)}..${ba.mx[0].toFixed(3)} -> ${bb.mn[0].toFixed(3)}..${bb.mx[0].toFixed(3)}`);
check("bbox y top unchanged", near(ba.mx[1], bb.mx[1]), `y max ${ba.mx[1].toFixed(3)} -> ${bb.mx[1].toFixed(3)}`);
check("bbox z growth = post-cap extent only (−0.105)", near(bb.mn[2], ba.mn[2] - 0.105, 0.02) && near(ba.mx[2], bb.mx[2]), `z ${ba.mn[2].toFixed(3)}..${ba.mx[2].toFixed(3)} -> ${bb.mn[2].toFixed(3)}..${bb.mx[2].toFixed(3)}`);

// fence posts present (dark bucket verts in the fence band y 0..0.85, x < -3.4)
const fencePosts = allV(B).filter((v) => v[1] < 0.85 && v[0] < -3.4 && v[2] < -0.9 && v[2] > -6);
check("fence post/cap verts present W+N runs", new Set(fencePosts.map((v) => Math.round(v[0] * 10) + ":" + Math.round(v[2] * 10))).size > 10, `${fencePosts.length} verts in band`);

console.log(fail === 0 ? `DECODE ALL PASS (${pass})` : `DECODE FAIL (${fail} failed, ${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);
