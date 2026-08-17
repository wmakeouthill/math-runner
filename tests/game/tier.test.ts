import { describe, expect, it } from 'vitest';
import { nextTier, RIGHT_TO_LEVEL_UP, WRONG_TO_LEVEL_DOWN } from '@/game/math/tier';

describe('nextTier', () => {
  it('sobe depois de três acertos seguidos', () => {
    expect(nextTier(1, RIGHT_TO_LEVEL_UP)).toBe(2);
    expect(nextTier(2, RIGHT_TO_LEVEL_UP)).toBe(3);
  });

  it('não passa do tier 3', () => {
    expect(nextTier(3, 99)).toBe(3);
  });

  it('desce depois de dois erros seguidos', () => {
    expect(nextTier(3, -WRONG_TO_LEVEL_DOWN)).toBe(2);
  });

  it('não desce abaixo do tier 1 — não existe conta mais fácil que somar até 10', () => {
    expect(nextTier(1, -99)).toBe(1);
  });

  it('fica onde está enquanto a sequência não fecha', () => {
    expect(nextTier(2, 2)).toBe(2);
    expect(nextTier(2, -1)).toBe(2);
    expect(nextTier(2, 0)).toBe(2);
  });
});
