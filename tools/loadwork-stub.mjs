// Test stand-in for client/lib/loadwork.js — the scheduler is irrelevant here.
export const beginWork = () => ({ done() {} });
export const enqueue = (fn) => Promise.resolve(fn?.());
export const idleYield = () => Promise.resolve();
