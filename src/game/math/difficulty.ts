import type { Tier } from './mathEngine.types';

export type Difficulty = 'facil' | 'medio' | 'dificil';

/** Do mais leve ao mais pesado. A ordem é o que decide quem aparece quando. */
export const DIFFICULTY_ORDER: readonly Difficulty[] = ['facil', 'medio', 'dificil'];

export const DIFFICULTY: Record<
  Difficulty,
  { label: string; hint: string; tierOffset: number; hearts: number }
> = {
  facil: {
    label: 'Fácil',
    hint: 'Contas do tamanho da fase, 3 corações',
    tierOffset: 0,
    hearts: 3,
  },
  medio: {
    label: 'Médio',
    hint: 'Contas um nível acima e mais monstros',
    tierOffset: 1,
    hearts: 3,
  },
  dificil: {
    label: 'Difícil',
    hint: 'Contas dois níveis acima, todos os monstros, 2 corações',
    tierOffset: 2,
    hearts: 2,
  },
};

/**
 * O nível da conta que vai aparecer.
 *
 * `base` é o que a fase pede, `player` é onde o aluno chegou sozinho naquela
 * operação, e a dificuldade escolhida desloca os dois. O maior entre fase e
 * aluno, e nunca fora de 1..3.
 */
export function effectiveTier(base: Tier, player: Tier, difficulty: Difficulty): Tier {
  const raw = Math.max(base, player) + DIFFICULTY[difficulty].tierOffset;
  return Math.min(3, Math.max(1, raw)) as Tier;
}

/** Este monstro aparece na dificuldade escolhida? */
export function guardianShows(from: Difficulty | undefined, current: Difficulty): boolean {
  return DIFFICULTY_ORDER.indexOf(current) >= DIFFICULTY_ORDER.indexOf(from ?? 'facil');
}
