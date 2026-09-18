import { describe, expect, test } from 'bun:test';
import * as THREE from 'three';
import { buildHorse, buildHorseGLB } from './sculpture.ts';
import { createHash } from 'node:crypto';

describe('cream carousel horse prototype', () => {
  test('renders finite geometry at the existing horse-local scale with an identity root', () => {
    const horse = buildHorse();
    expect(horse.name).toBe('horse_2');
    expect(horse.position.toArray()).toEqual([0, 0, 0]);
    expect(horse.quaternion.toArray()).toEqual([0, 0, 0, 1]);
    const box = new THREE.Box3().setFromObject(horse);
    expect(box.isEmpty()).toBe(false);
    for (const value of [...box.min.toArray(), ...box.max.toArray()]) expect(Number.isFinite(value)).toBe(true);
    expect(box.min.x).toBeGreaterThanOrEqual(-0.42);
    expect(box.max.x).toBeLessThanOrEqual(0.42);
    // Authored short suspension pole reaches -.26; hooves stay above -.15.
    expect(box.min.y).toBeGreaterThanOrEqual(-0.27);
    expect(box.max.y).toBeLessThanOrEqual(1.60);
    expect(box.min.z).toBeGreaterThanOrEqual(-1.15);
    expect(box.max.z).toBeLessThanOrEqual(1.10);
    expect(box.getSize(new THREE.Vector3()).y).toBeGreaterThan(1.4);
  });

  test('keeps the actual central seat surface level at horse-local Y 1.015', () => {
    const horse = buildHorse();
    horse.updateMatrixWorld(true);
    const ray = new THREE.Raycaster(new THREE.Vector3(0, 2, -.10), new THREE.Vector3(0, -1, 0));
    const hit = ray.intersectObject(horse, true)[0];
    expect(hit?.point.y).toBeCloseTo(1.015, 5);
    expect(hit?.face?.normal.y).toBeCloseTo(1, 5);
  });

  test('saddle and blanket overlap at the contact patch instead of leaving an air slit', () => {
    const horse=buildHorse();horse.updateMatrixWorld(true);
    const seat=horse.getObjectByName('level_saddle_seat') as any;
    const blanket=horse.getObjectByName('draped_blanket') as any;
    seat.material.side=THREE.DoubleSide;blanket.material.side=THREE.DoubleSide;
    const ray=new THREE.Raycaster(new THREE.Vector3(0,2,-.04),new THREE.Vector3(0,-1,0));
    const seatY=ray.intersectObject(seat,false).map((h:any)=>h.point.y);
    const blanketY=ray.intersectObject(blanket,false).map((h:any)=>h.point.y);
    expect(seatY.length).toBeGreaterThan(0);expect(blanketY.length).toBeGreaterThan(0);
    expect(Math.min(...seatY)).toBeLessThanOrEqual(Math.max(...blanketY));
    expect(Math.max(...seatY)).toBeGreaterThan(Math.max(...blanketY));
  });

  test('both eyes are visible on the coat surface, not buried in the skull', () => {
    const horse=buildHorse();horse.updateMatrixWorld(true);
    for(const side of [-1,1]) {
      const eye=horse.getObjectByName(`eye_${side}`)!;
      const ray=new THREE.Raycaster(new THREE.Vector3(side,eye.position.y,eye.position.z),new THREE.Vector3(-side,0,0));
      expect(ray.intersectObject(horse,true)[0]?.object.name).toBe(`eye_${side}`);
    }
  });

  test('carved hair faces outward instead of disappearing under back-face culling', () => {
    const horse=buildHorse();
    for(const name of ['carved_mane','carved_tail','forelock']) {
      const mesh=horse.getObjectByName(name) as THREE.Mesh;
      const p=mesh.geometry.getAttribute('position'),n=mesh.geometry.getAttribute('normal');
      // Ring 12, seam vertex, is on the positive-X side of each swept mass.
      expect(p.getX(12*11)).toBeGreaterThan(0);
      expect(n.getX(12*11)).toBeGreaterThan(.5);
    }
  });

  test('exports one complete cream horse in five material buckets, deterministically', () => {
    const a=Buffer.from(buildHorseGLB()),b=Buffer.from(buildHorseGLB());
    expect(createHash('sha256').update(a).digest('hex')).toBe(createHash('sha256').update(b).digest('hex'));
    const j=JSON.parse(a.subarray(20,20+a.readUInt32LE(12)).toString());
    expect(j.materials.map((m: any)=>m.name).sort()).toEqual([
      'prototype_brass','prototype_cream_paint','prototype_hair_hoof','prototype_saddle_leather','prototype_teal_blanket',
    ]);
    expect(j.meshes.length).toBe(5);
    expect(j.nodes.filter((n: any)=>/^horse_[0-9]+$/.test(n.name)).map((n: any)=>n.name)).toEqual(['horse_2']);
  });
});
