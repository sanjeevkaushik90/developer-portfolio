export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/**
 * Eases from 0 to 1 as `v` moves from `a` to `b` (0 before `a`, 1 after `b`).
 * It is a pure function of `v`, so the same scroll position always gives the same result:
 * scrolling up exactly reverses scrolling down.
 */
export function seg(v: number, a: number, b: number): number {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
}