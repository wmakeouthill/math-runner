import { create } from 'zustand';
import type { PadState } from './usePadStore.types';

const RELEASED = { left: false, right: false, jump: false, interact: false } as const;

/**
 * Botões virtuais da tela. Sem persist: isto é o dedo agora, não progresso.
 * O InputSystem lê daqui no mesmo frame em que lê o teclado.
 */
export const usePadStore = create<PadState>()((set) => ({
  ...RELEASED,
  hold: (action) => set({ [action]: true }),
  release: (action) => set({ [action]: false }),
  releaseAll: () => set({ ...RELEASED }),
}));
