import { create } from 'zustand';
import type { Challenge, ChallengeState } from './useChallengeStore.types';

/** Dois erros seguidos e a conta vira desenho. É a válvula do SPEC 6. */
export const HINT_AFTER_ERRORS = 2;

/**
 * Conta aberta no momento. Sem `persist` de propósito: isto é estado de um
 * instante, não progresso. Salvar traria a conta de volta na próxima abertura
 * do jogo, e a fase reabriria com um card por cima do nada.
 */
export const useChallengeStore = create<ChallengeState>()((set, get) => ({
  challenge: null,
  outcome: null,

  open: (source, question) =>
    set({ challenge: { source, question, wrongStreak: 0 }, outcome: null }),

  answer: (option) => {
    const current = get().challenge;
    if (current === null) return;

    if (option === current.question.answer) {
      set({
        challenge: null,
        outcome: { source: current.source, correct: true, answer: current.question.answer },
      });
      return;
    }

    // Errar num mecanismo do cenário não pune: a mesma conta continua aberta.
    set({
      challenge: { ...current, wrongStreak: current.wrongStreak + 1 },
      outcome: { source: current.source, correct: false, answer: current.question.answer },
    });
  },

  close: () => set({ challenge: null, outcome: null }),
}));

export const showsHint = (challenge: Challenge): boolean =>
  challenge.wrongStreak >= HINT_AFTER_ERRORS;
