import assert from 'node:assert/strict';
import { type Document, type Node, type Property, type Accessor } from '@gltf-transform/core';
import { Matrix4, Vector3 } from 'three';

type Point = [number, number, number];
function vertices(node: Node): Point[] {
  const points: Point[] = [];
  node.traverse(n => {
    const matrix = new Matrix4().fromArray(n.getWorldMatrix()), point = new Vector3();
    n.getMesh()?.listPrimitives().forEach(p => {
      const a = p.getAttribute('POSITION')!, v: number[] = [];
      for (let i = 0; i < a.getCount(); i++) {
        a.getElement(i, v); point.fromArray(v).applyMatrix4(matrix); points.push(point.toArray() as Point);
      }
    });
  });
  assert.ok(points.length && points.every(p => p.every(Number.isFinite)), 'empty/nonfinite envelope');
  return points;
}

/** Model-rest coordinates form a co-rotating carousel frame: the shared rigid spin preserves these separations. */
export function verifyEnvelopes(before: Document, after: Document, source: string) {
  const carousel = before.getRoot().listNodes().find(n => n.getName() === 'carousel')!;
  const baseY = carousel.getWorldTranslation()[1];
  const sourceSurfaces = ['deck', 'rim', 'rimBand'].map(name => {
    const geometry = source.match(new RegExp(`const ${name} = cyl\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+),`));
    assert.ok(geometry, `source platform geometry missing: ${name}`);
    const y = Number(source.match(new RegExp(`${name}\\.position\\.y = ([\\d.]+)`))?.[1] ?? 0);
    return { name, top: baseY + y + Number(geometry[3]) / 2, topRadius: Number(geometry[1]), height: Number(geometry[3]) };
  });
  const nominalTop = Math.max(...sourceSurfaces.map(s => s.top)), nominalLow = Math.min(...sourceSurfaces.map(s => s.top));
  const triangles: { node: string; a: Point; b: Point; c: Point; determinant: number; y: number }[] = [];
  function platform(n: Node) {
    if (HORSES.includes(n.getName() as any)) return;
    const matrix = new Matrix4().fromArray(n.getWorldMatrix());
    n.getMesh()?.listPrimitives().forEach(p => {
      assert.equal(p.getMode(), 4, 'platform must use triangles');
      const pos = p.getAttribute('POSITION')!, ids = p.getIndices(), v: number[] = [];
      const point = (index: number): Point => {
        pos.getElement(ids ? ids.getScalar(index) : index, v); return new Vector3().fromArray(v).applyMatrix4(matrix).toArray() as Point;
      };
      for (let i = 0; i < (ids?.getCount() ?? pos.getCount()); i += 3) {
        const a = point(i), b = point(i + 1), c = point(i + 2);
        const lo = Math.min(a[1], b[1], c[1]), hi = Math.max(a[1], b[1], c[1]);
        const determinant = (b[0] - a[0]) * (c[2] - a[2]) - (c[0] - a[0]) * (b[2] - a[2]);
        if (hi - lo < 1e-4 && determinant < -1e-10 && hi <= nominalTop + .002 && lo >= nominalLow - .002)
          triangles.push({ node: n.getName(), a, b, c, determinant, y: hi });
      }
    });
    n.listChildren().forEach(platform);
  }
  platform(carousel);
  assert.ok(triangles.length, 'no source-matched actual platform triangles');
  const actualMaxY = Math.max(...triangles.map(t => t.y));
  assert.ok(Math.abs(actualMaxY - nominalTop) < .002, 'served platform/source top drift');
  const horses = HORSES.map(name => {
    const root = after.getRoot().listNodes().find(n => n.getName() === name)!;
    const points = vertices(root), min: Point = [Infinity, Infinity, Infinity], max: Point = [-Infinity, -Infinity, -Infinity];
    points.forEach(p => p.forEach((v, axis) => { min[axis] = Math.min(min[axis], v); max[axis] = Math.max(max[axis], v); }));
    return { name, points, rest: { min: [...min], max: [...max] }, swept: { min: [min[0], min[1] - .18, min[2]], max: [max[0], max[1] + .18, max[2]] } };
  });
  const pairs: { a: string; b: string; axisGaps: number[]; separatingAxisGap: number }[] = [];
  for (let i = 0; i < horses.length; i++) for (let j = i + 1; j < horses.length; j++) {
    const a = horses[i], b = horses[j], axisGaps = a.swept.min.map((v, axis) => Math.max(v - b.swept.max[axis], b.swept.min[axis] - a.swept.max[axis]));
    const separatingAxisGap = Math.max(...axisGaps);
    assert.ok(separatingAxisGap > 0, `swept AABB overlap ${a.name}/${b.name}: ${JSON.stringify({ a: a.swept, b: b.swept, axisGaps })}; conservative bound, not proof of mesh collision`);
    pairs.push({ a: a.name, b: b.name, axisGaps, separatingAxisGap });
  }
  const checked = horses.map(({ name, points, rest, swept }) => {
    let minDeckClearance = Infinity;
    for (const p of points) {
      let top = -Infinity;
      for (const t of triangles) {
        const dx = p[0] - t.a[0], dz = p[2] - t.a[2];
        const u = (dx * (t.c[2] - t.a[2]) - (t.c[0] - t.a[0]) * dz) / t.determinant;
        const v = ((t.b[0] - t.a[0]) * dz - dx * (t.b[2] - t.a[2])) / t.determinant;
        if (u >= -1e-8 && v >= -1e-8 && u + v <= 1 + 1e-8) top = Math.max(top, t.y);
      }
      assert.ok(Number.isFinite(top), `no decoded deck under ${name} vertex ${JSON.stringify(p)}`);
      // Use the worst height over the FULL horse box too: stronger than vertex-only edge tests.
      minDeckClearance = Math.min(minDeckClearance, swept.min[1] - top);
    }
    assert.ok(minDeckClearance > 0, `${name} swept envelope penetrates/below actual deck by ${-minDeckClearance}m`);
    return { name, rest, swept, checkedVertices: points.length, minDeckClearance };
  });
  return { frame: 'model-rest co-rotating carousel frame; shared spin is rigid; bob extrema independent', bobAmplitude: .18,
    surface: { sourceSurfaces, nominalTop, actualMaxY, triangles: triangles.length, nodes: [...new Set(triangles.map(t => t.node))],
      note: 'The rim/rimBand are capped cylinders, so their top surfaces—not the lower wooden deck top—are the actual support envelope.' },
    horses: checked, pairs, scope: 'horse/platform and horse/horse only; not rider clearance or full live collision simulation' };
}

export const HORSES = ['horse_0', 'horse_2', 'horse_4', 'horse_6'] as const;
export const BUDGET = { nodes: 44, materials: 20, textures: 19, textureBytes: 200_000, bytes: 3_000_000 };

/** Semantic/bitwise verification; serialization indices and the removed Draco codec are not scene semantics. */
export function verifyFullset(before: Document, after: Document, approved: Document, byteLength: number) {
  const a = before.getRoot(), b = after.getRoot(), cream = approved.getRoot().listNodes().find(n => n.getName() === 'horse_2')!;
  const forward = new Map<Property, Property>(), reverse = new Map<Property, Property>();
  let preservedNodes = 0, preservedMeshInstances = 0;
  function resource(x: Property, y: Property) {
    assert.ok(y && x.equals(y), `resource changed: ${x.propertyType} ${x.getName()}`);
    if (forward.has(x)) { assert.equal(forward.get(x), y, 'shared resource split'); return; }
    assert.ok(!reverse.has(y), 'distinct resources merged');
    forward.set(x, y); reverse.set(y, x);
    if (x.propertyType === 'Accessor') {
      const u = (x as Accessor).getArray()!, v = (y as Accessor).getArray()!;
      assert.equal(u.constructor.name, v.constructor.name);
      assert.deepEqual(new Uint8Array(u.buffer, u.byteOffset, u.byteLength), new Uint8Array(v.buffer, v.byteOffset, v.byteLength), 'accessor bits changed');
    }
    const xe = x.getGraph().listChildEdges(x), ye = y.getGraph().listChildEdges(y);
    assert.equal(xe.length, ye.length, 'resource edges changed');
    xe.forEach((edge, i) => {
      assert.equal(edge.getName(), ye[i].getName()); assert.deepEqual(edge.getAttributes(), ye[i].getAttributes());
      resource(edge.getChild(), ye[i].getChild());
    });
  }
  function walk(x: Node, y: Node) {
    preservedNodes++;
    assert.ok(y && x.equals(y, new Set(['children'])), `node changed: ${x.getName()}`);
    assert.deepEqual(x.getWorldMatrix(), y.getWorldMatrix(), `world transform changed: ${x.getName()}`);
    if (x.getMesh()) { preservedMeshInstances++; resource(x.getMesh()!, y.getMesh()!); }
    if (HORSES.includes(x.getName() as any)) return;
    assert.equal(x.listChildren().length, y.listChildren().length, 'hierarchy changed');
    x.listChildren().forEach((child, i) => walk(child, y.listChildren()[i]));
  }
  assert.equal(a.listScenes().length, b.listScenes().length);
  assert.equal(a.listScenes().indexOf(a.getDefaultScene()!), b.listScenes().indexOf(b.getDefaultScene()!));
  a.listScenes().forEach((scene, i) => {
    const target = b.listScenes()[i]; assert.ok(scene.equals(target, new Set(['children'])));
    assert.equal(scene.listChildren().length, target.listChildren().length);
    scene.listChildren().forEach((n, j) => walk(n, target.listChildren()[j]));
  });
  // The packager must preserve even the now-unused original horse resources, not just visible nonhorse dependencies.
  for (const kind of ['listMeshes', 'listMaterials', 'listTextures', 'listAccessors'] as const) {
    const originals: Property[] = a[kind](), actuals: Property[] = b[kind]();
    assert.ok(actuals.length >= originals.length, `original resources lost: ${kind}`);
    originals.forEach(p => {
      const match = forward.get(p) ?? actuals.find(q => !reverse.has(q) && p.equals(q));
      assert.ok(match, `original resource missing: ${kind}`); resource(p, match);
    });
  }
  a.listTextures().forEach((t, i) => assert.deepEqual(t.getImage(), b.listTextures()[i].getImage(), 'original texture bytes changed'));
  let horseTrianglesEach = 0;
  cream.traverse(n => n.getMesh()?.listPrimitives().forEach(p => { horseTrianglesEach += (p.getIndices()?.getCount() ?? p.getAttribute('POSITION')!.getCount()) / 3; }));
  const actualCream = b.listNodes().find(n => n.getName() === 'horse_2')!;
  for (const name of HORSES) {
    const roots = b.listNodes().filter(n => n.getName() === name); assert.equal(roots.length, 1, `anchor ${name}`);
    const root = roots[0]; assert.equal(root.getParentNode()!.getName(), 'carousel');
    assert.equal(root.listChildren().length, cream.listChildren().length);
    root.listChildren().forEach((node, i) => {
      const expected = cream.listChildren()[i], reference = actualCream.listChildren()[i];
      assert.ok(expected.equals(node, new Set(['name', 'mesh'])), `approved node changed ${name}/${i}`);
      assert.ok(expected.getMesh()!.equals(node.getMesh()!, new Set(['name', 'primitives'])), `approved mesh changed ${name}/${i}`);
      const ps = node.getMesh()!.listPrimitives(), qs = expected.getMesh()!.listPrimitives(); assert.equal(ps.length, qs.length);
      ps.forEach((p, j) => {
        assert.ok(qs[j].equals(p, new Set(['material'])), `approved geometry changed ${name}/${i}/${j}`);
        const shared = reference.getMesh()!.listPrimitives()[j];
        p.listSemantics().forEach(s => assert.equal(p.getAttribute(s), shared.getAttribute(s), 'approved accessor duplicated'));
        assert.equal(p.getIndices(), shared.getIndices(), 'approved indices duplicated');
        if (name === 'horse_2') assert.ok(qs[j].getMaterial()!.equals(p.getMaterial()!), 'approved cream material changed');
        else assert.ok(qs[j].getMaterial()!.equals(p.getMaterial()!, new Set(['name', 'baseColorTexture'])), 'approved finish or texture-info changed');
      });
      if (name === 'horse_2') assert.ok(expected.equals(node), 'approved cream subtree changed');
    });
  }
  const nodes = b.listNodes().length, materials = b.listMaterials().length, textures = b.listTextures().length;
  const textureBytes = b.listTextures().reduce((sum, t) => sum + t.getImage()!.length, 0);
  assert.equal(preservedNodes, 24, 'nonvacuous original anchor coverage'); assert.equal(preservedMeshInstances, 18);
  assert.equal(nodes, BUDGET.nodes, 'node budget');
  assert.equal(materials, BUDGET.materials, 'material budget'); assert.equal(textures, BUDGET.textures, 'texture budget');
  assert.ok(textureBytes <= BUDGET.textureBytes && byteLength <= BUDGET.bytes, 'byte budget');
  assert.equal(b.listAccessors().length, a.listAccessors().length + approved.getRoot().listAccessors().length, 'accessor budget / approved shape duplicated');
  assert.deepEqual(b.listExtensionsUsed().map(e => e.extensionName), ['EXT_texture_webp'], 'unexpected codec/extension');
  assert.equal(b.listExtensionsUsed()[0].isRequired(), true, 'served WebP requirement lost');
  return { preservedNodes, preservedMeshInstances, preservedResources: forward.size, nodes, materials, textures, textureBytes, bytes: byteLength,
    horseTrianglesEach, horseTrianglesAll: horseTrianglesEach * 4, meshResources: b.listMeshes().length, accessorResources: b.listAccessors().length,
    anchors: a.listNodes().filter(n => n.getName() === 'carousel' || HORSES.includes(n.getName() as any) || /^cr_flag_\d+$/.test(n.getName())).map(n => n.getName()),
    budgets: BUDGET, approvedShape: 'exact decoded accessor values and sharing; no geometry optimization' };
}
