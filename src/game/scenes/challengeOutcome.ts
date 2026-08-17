import type { ChallengeOutcome } from '@/store/useChallengeStore.types';

/**
 * O React StrictMode (e o HMR) pode deixar um subscribe da cena antiga vivo.
 * Se essa cena morta reage ao acerto, o `setText` do painel explode — canvas
 * já foi embora — e o Zustand para o forEach: a cena viva nunca desce a ponte.
 */
export function shouldHandleOutcome(
  sceneActive: boolean,
  outcome: ChallengeOutcome | null,
  previous: ChallengeOutcome | null,
): outcome is ChallengeOutcome {
  return sceneActive && outcome !== null && outcome !== previous;
}
