import { expect, test } from 'bun:test';
import { assertLegacyCarouselPin } from './legacy-guard';
test('legacy placer refuses a migrated carousel rather than rolling it back', () => {
  expect(() => assertLegacyCarouselPin('store/07c7feba5157336b.glb', 'store/ce3633992d07055e.glb')).toThrow('refusing rollback');
});
test('legacy pin is still readable and missing pins fail closed', () => {
  expect(() => assertLegacyCarouselPin('store/ce3633992d07055e.glb', 'store/ce3633992d07055e.glb')).not.toThrow();
  expect(() => assertLegacyCarouselPin(undefined, 'store/ce3633992d07055e.glb')).toThrow();
});
