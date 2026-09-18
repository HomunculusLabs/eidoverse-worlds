// Legacy verification must never implicitly roll newer geometry back.
export function assertLegacyCarouselPin(liveLib: unknown, reviewedLib: string): void {
  if (liveLib !== reviewedLib) throw new Error('Legacy carousel lib differs: refusing rollback; use carousel-horse-prototype/deploy.ts with an explicit from-lib contract');
}
