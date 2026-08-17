const COARSE = '(pointer: coarse)';

/** Celular e tablet: o ponteiro principal é grosso. Notebook com mouse não. */
export function isCoarsePointer(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(COARSE).matches;
}

export function coarsePointerQuery(): string {
  return COARSE;
}
