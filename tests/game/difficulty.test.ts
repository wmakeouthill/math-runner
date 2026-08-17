import { describe, expect, it } from 'vitest';
import { DIFFICULTY, effectiveTier, guardianShows } from '@/game/math/difficulty';

describe('effectiveTier', () => {
  it('no fácil, a fase manda', () => {
    expect(effectiveTier(1, 1, 'facil')).toBe(1);
    expect(effectiveTier(2, 1, 'facil')).toBe(2);
  });

  it('quem já domina a operação recebe conta maior que a da fase', () => {
    expect(effectiveTier(1, 3, 'facil')).toBe(3);
  });

  it('médio sobe um nível, difícil sobe dois', () => {
    expect(effectiveTier(1, 1, 'medio')).toBe(2);
    expect(effectiveTier(1, 1, 'dificil')).toBe(3);
  });

  it('nunca passa do tier 3 nem cai abaixo do 1', () => {
    expect(effectiveTier(3, 3, 'dificil')).toBe(3);
    expect(effectiveTier(1, 1, 'facil')).toBe(1);
  });
});

describe('guardianShows', () => {
  it('monstro sem exigência aparece em qualquer dificuldade', () => {
    expect(guardianShows(undefined, 'facil')).toBe(true);
  });

  it('monstro de médio não aparece no fácil', () => {
    expect(guardianShows('medio', 'facil')).toBe(false);
    expect(guardianShows('medio', 'medio')).toBe(true);
    expect(guardianShows('medio', 'dificil')).toBe(true);
  });

  it('monstro de difícil só aparece no difícil', () => {
    expect(guardianShows('dificil', 'medio')).toBe(false);
    expect(guardianShows('dificil', 'dificil')).toBe(true);
  });
});

describe('corações por dificuldade', () => {
  it('o difícil dá menos coração que os outros dois', () => {
    expect(DIFFICULTY.dificil.hearts).toBeLessThan(DIFFICULTY.facil.hearts);
    expect(DIFFICULTY.facil.hearts).toBe(DIFFICULTY.medio.hearts);
  });
});
