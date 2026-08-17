import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameState, LevelId, LevelResult } from './useGameStore.types';
import type { Op, Tier } from '@/game/math/mathEngine.types';
import { nextTier } from '@/game/math/tier';

const FIRST_LEVEL: LevelId = '1-1';
const START_TIER: Record<Op, Tier> = { '+': 1, '-': 1, '*': 1, '/': 1 };
const NO_STREAK: Record<Op, number> = { '+': 0, '-': 0, '*': 0, '/': 0 };

function previousLevel(id: LevelId): LevelId | null {
  const [world, index] = id.split('-').map(Number);
  if (world === undefined || index === undefined) return null;
  if (index <= 1) return null;
  return `${world}-${index - 1}`;
}

function isBetter(next: LevelResult, current: LevelResult): boolean {
  if (next.stars !== current.stars) return next.stars > current.stars;
  return next.timeMs < current.timeMs;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'title',
      currentLevel: null,
      progress: {},
      character: 'ana',
      mode: 'aventura',

      goToScreen: (screen) => set({ screen }),

      startLevel: (id) => set({ screen: 'game', currentLevel: id }),

      completeLevel: (id, result) =>
        set((state) => {
          const current = state.progress[id];
          if (current && !isBetter(result, current)) return state;
          return { progress: { ...state.progress, [id]: result } };
        }),

      isUnlocked: (id) => {
        if (id === FIRST_LEVEL) return true;
        const previous = previousLevel(id);
        if (previous === null) return false;
        return get().progress[previous] !== undefined;
      },

      setCharacter: (character) => set({ character }),

      setMode: (mode) => set({ mode }),

      resetProgress: () => set({ progress: {}, currentLevel: null }),

      muted: false,

      toggleMuted: () => set((state) => ({ muted: !state.muted })),

      playerTier: { ...START_TIER },
      streak: { ...NO_STREAK },

      recordAnswer: (op, correct) =>
        set((state) => {
          const atual = state.streak[op];
          // Acertar zera a sequência de erros, e vice-versa.
          const streak = correct ? Math.max(1, atual + 1) : Math.min(-1, atual - 1);
          const tier = nextTier(state.playerTier[op], streak);
          // Mudou de nível? A sequência recomeça, senão ele sobe de dois em dois.
          const zera = tier !== state.playerTier[op];

          return {
            playerTier: { ...state.playerTier, [op]: tier },
            streak: { ...state.streak, [op]: zera ? 0 : streak },
          };
        }),
    }),
    {
      name: 'math-runner-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        progress: state.progress,
        character: state.character,
        mode: state.mode,
        muted: state.muted,
        playerTier: state.playerTier,
      }),
    },
  ),
);
