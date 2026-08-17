import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameState, LevelId, LevelResult } from './useGameStore.types';

const FIRST_LEVEL: LevelId = '1-1';

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
    }),
    {
      name: 'math-runner-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        progress: state.progress,
        character: state.character,
        mode: state.mode,
        muted: state.muted,
      }),
    },
  ),
);
