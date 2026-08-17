import { create } from 'zustand';
import { useGameStore } from './useGameStore';
import type { RunState } from './useRunStore.types';

/**
 * Três estrelas, três coisas diferentes (SPEC 4):
 * terminar, achar todos os números dourados, não errar nenhuma conta.
 * Só a primeira depende de chegar ao fim, então nunca é zero estrela.
 */
export function starsFor(run: Pick<RunState, 'digitsTaken' | 'digitsTotal' | 'errors'>): number {
  let stars = 1;
  if (run.digitsTaken >= run.digitsTotal) stars += 1;
  if (run.errors === 0) stars += 1;
  return stars;
}

export const MAX_HEARTS = 3;

export const useRunStore = create<RunState>()((set, get) => ({
  levelId: null,
  digitsTotal: 0,
  digitsTaken: 0,
  errors: 0,
  startedAt: 0,
  result: null,
  hearts: MAX_HEARTS,

  begin: (levelId, digitsTotal) =>
    set({
      levelId,
      digitsTotal,
      digitsTaken: 0,
      errors: 0,
      startedAt: Date.now(),
      result: null,
      hearts: MAX_HEARTS,
    }),

  takeDigit: () => set((state) => ({ digitsTaken: state.digitsTaken + 1 })),

  addError: () => set((state) => ({ errors: state.errors + 1 })),

  finish: () => {
    const run = get();
    if (run.levelId === null || run.result !== null) return;

    const result = {
      stars: starsFor(run),
      errors: run.errors,
      timeMs: Date.now() - run.startedAt,
    };
    set({ result });
    useGameStore.getState().completeLevel(run.levelId, result);
  },

  loseHeart: () => {
    const hearts = Math.max(0, get().hearts - 1);
    set({ hearts });
    return hearts > 0;
  },

  refillHearts: () => set({ hearts: MAX_HEARTS }),

  clear: () =>
    set({
      levelId: null,
      digitsTotal: 0,
      digitsTaken: 0,
      errors: 0,
      result: null,
      hearts: MAX_HEARTS,
    }),
}));
