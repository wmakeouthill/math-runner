import type { Tier } from './mathEngine.types';

/** SPEC 6: três acertos seguidos sobem o nível. */
export const RIGHT_TO_LEVEL_UP = 3;

/** Dois erros seguidos descem. Descer é mais rápido do que subir de propósito. */
export const WRONG_TO_LEVEL_DOWN = 2;

/**
 * `streak` positivo conta acertos seguidos, negativo conta erros seguidos.
 * Um número só em vez de dois contadores: acertar zera o erro e vice-versa,
 * que é exatamente o que trocar de sinal faz.
 */
export function nextTier(tier: Tier, streak: number): Tier {
  if (streak >= RIGHT_TO_LEVEL_UP && tier < 3) return (tier + 1) as Tier;
  if (streak <= -WRONG_TO_LEVEL_DOWN && tier > 1) return (tier - 1) as Tier;
  return tier;
}
