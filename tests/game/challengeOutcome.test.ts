import { describe, expect, it } from 'vitest';
import { shouldHandleOutcome } from '@/game/scenes/challengeOutcome';
import type { ChallengeOutcome } from '@/store/useChallengeStore.types';

const CORRECT: ChallengeOutcome = { source: 'ponte-1', correct: true, answer: 7 };
const WRONG: ChallengeOutcome = { source: 'ponte-1', correct: false, answer: 7 };

describe('shouldHandleOutcome', () => {
  it('cena morta não reage — se reagir, o setText explode e a cena viva nunca desce a ponte', () => {
    expect(shouldHandleOutcome(false, CORRECT, null)).toBe(false);
  });

  it('cena viva aplica o acerto novo', () => {
    expect(shouldHandleOutcome(true, CORRECT, null)).toBe(true);
  });

  it('cena viva aplica o erro novo, para o shake repetir', () => {
    expect(shouldHandleOutcome(true, WRONG, null)).toBe(true);
    expect(shouldHandleOutcome(true, WRONG, WRONG)).toBe(false);
  });

  it('sem outcome não há o que aplicar', () => {
    expect(shouldHandleOutcome(true, null, CORRECT)).toBe(false);
  });
});
