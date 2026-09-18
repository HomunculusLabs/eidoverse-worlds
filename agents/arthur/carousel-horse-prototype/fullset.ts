import { NodeIO, type Node, type Document, type Material } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { packagePrototype } from './package.ts';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { texMat, encodePNG } from '../assets/glbwrite.ts';

export function stationPaints(source: string) {
  const table = source.match(/const horseDefs = \[([\s\S]*?)\];/)?.[1];
  assert.ok(table, 'source horseDefs missing');
  const rows = [...table.matchAll(/\{\s*m:\s*(\d+),\s*x:\s*(-?\d+),\s*z:\s*(-?\d+),\s*body:\s*(\w+),\s*blanket:\s*(0x[\da-f]+)\s*\}/g)];
  assert.equal(rows.length, 4, 'source must describe exactly four stations');
  assert.deepEqual(rows.map(r => [Number(r[1]), r[4]]), [[0, 'goldPaint'], [2, 'bonePaint'], [4, 'bluePaint'], [6, 'bonePaint']], 'source coat identity drift');
  const leather = source.match(/function leatherMaterial\(m: number\) \{ return mat\(m === 0 \? (0x[\da-f]+) : m === 4 \? (0x[\da-f]+) : (0x[\da-f]+)/);
  assert.ok(leather, 'source leather identity missing');
  return rows.map(r => {
    const palette = source.match(new RegExp(`const ${r[4]} = texMat\\([^,]+, \\[(0x[\\da-f]+)`));
    assert.ok(palette, `source palette missing: ${r[4]}`);
    const m = Number(r[1]);
    return { name: `horse_${m}`, body: r[4], coat: Number(palette[1]), blanket: Number(r[5]), leather: Number(leather[m === 0 ? 1 : m === 4 ? 2 : 3]) };
  });
}

function paint(doc: Document, source: Material, name: string, color: number): Material {
  // Preserve the approved finish and texture-info settings; only the paint hue varies.
  const rgb = [color >> 16 & 255, color >> 8 & 255, color & 255];
  const lifted = rgb.map(v => Math.min(255, v + 2)).reduce((a, v) => a * 256 + v, 0);
  const swatch = texMat(name, [color, lifted], { weights: [4, 1], scale: 1 });
  const image = swatch.map!.image as { width: number; height: number; data: Uint8Array };
  const texture = doc.createTexture(name).setMimeType('image/png').setImage(encodePNG(image.width, image.height, image.data));
  const material = source.clone().setName(name).setBaseColorTexture(texture);
  swatch.map!.dispose(); swatch.dispose();
  return material;
}

export const BASELINE_SHA = '24d7a62d1454bf06fc179e88179272782ca500ff3e050f5714f3ee6a5c8ca8be';
export const APPROVED_SHA = 'b3709223f5d620eb5418fcc64e3b4dc5f387a0836d4d282d1204b6f12aea392b';
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

/** Offline composition only. packagePrototype validates and copies the approved cream first. */
export async function packageFullset(baseline: Uint8Array, horse: Uint8Array): Promise<Uint8Array> {
  assert.equal(sha256(baseline), BASELINE_SHA, 'baseline SHA differs from pinned served bytes');
  assert.equal(sha256(horse), APPROVED_SHA, 'horse SHA differs from approved cream v2');
  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS);
  const doc = await io.readBinary(await packagePrototype(baseline, horse));
  const source = doc.getRoot().listNodes().find(n => n.getName() === 'horse_2')!;
  const identities = stationPaints(await readFile(new URL('../assets/mkcarousel.ts', import.meta.url), 'utf8'));
  for (const identity of identities.filter(i => i.name !== 'horse_2')) {
    const { name } = identity;
    const target = doc.getRoot().listNodes().find(n => n.getName() === name)!;
    const old: Node[] = [];
    target.listChildren().forEach(n => n.traverse(child => old.push(child)));
    old.reverse().forEach(n => n.dispose()); // Only nodes. Preserve ALL baseline resources, including shared/orphaned ones.
    const copyNode = (node: Node): Node => doc.createNode().copy(node,
      property => property.propertyType === 'Node' ? copyNode(property as Node) : property)
      .setName(node.getName().replace(/^horse_2_/, `${name}_`));
    source.listChildren().forEach(child => target.addChild(copyNode(child)));
    target.traverse(node => {
      const mesh = node.getMesh(); if (!mesh) return;
      const replacements = mesh.listPrimitives().map(p => {
        const material = p.getMaterial()!;
        const color = material.getName() === 'prototype_cream_paint' && identity.body !== 'bonePaint' ? identity.coat
          : material.getName() === 'prototype_teal_blanket' ? identity.blanket
          : material.getName() === 'prototype_saddle_leather' ? identity.leather : undefined;
        return color === undefined ? null : paint(doc, material, `${name}_${material.getName().replace('prototype_', '')}`, color);
      });
      if (replacements.some(Boolean)) {
        const copy = mesh.clone().setName(node.getName());
        copy.listPrimitives().forEach(p => copy.removePrimitive(p));
        mesh.listPrimitives().forEach((p, i) => copy.addPrimitive(p.clone().setMaterial(replacements[i] ?? p.getMaterial())));
        node.setMesh(copy); // Mesh/primitive wrappers only; ALL accessors stay shared bit-for-bit.
      }
    });
  }
  return io.writeBinary(doc); // No transforms, welding, simplification, or recompression.
}
