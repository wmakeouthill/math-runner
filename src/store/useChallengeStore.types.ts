import type { Question } from '@/game/math/mathEngine.types';

/** Id do mecanismo que pediu a conta — a resposta volta endereçada a ele. */
export type ChallengeSource = string;

export type Challenge = {
  source: ChallengeSource;
  question: Question;
  /** Erros seguidos nesta conta. A partir de 2, a dica aparece. */
  wrongStreak: number;
};

export type ChallengeOutcome = {
  source: ChallengeSource;
  correct: boolean;
  /** A resposta certa. O mecanismo usa como N: quantos blocos, qual altura. */
  answer: number;
};

export type ChallengeState = {
  challenge: Challenge | null;
  outcome: ChallengeOutcome | null;
  open: (source: ChallengeSource, question: Question) => void;
  answer: (option: number) => void;
  close: () => void;
};
