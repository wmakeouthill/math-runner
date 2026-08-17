import { describe, expect, it } from 'vitest';
import { BOSS_ROUNDS, FOLK_KINDS, FOLK_OP } from '@/game/art/folklore';
import { LEVEL_ORDER } from '@/game/levels';

describe('operação de cada monstro', () => {
  it('cada monstro do folclore cobra sua própria operação (SPEC 4b)', () => {
    expect(FOLK_OP.saci).toBe('+');
    expect(FOLK_OP.cuca).toBe('-');
    expect(FOLK_OP.boitata).toBe('*');
    expect(FOLK_OP.boto).toBe('/');
  });

  it('os cinco do folclore estão no jogo', () => {
    expect(FOLK_KINDS).toHaveLength(5);
  });
});

describe('monstros nas fases', () => {
  it('a operação que o monstro cobra é a do folclore dele', () => {
    for (const level of LEVEL_ORDER) {
      for (const guardian of level.guardians) {
        if (guardian.kind === 'curupira') continue;
        expect(guardian.op).toBe(FOLK_OP[guardian.kind]);
      }
    }
  });

  it('o mundo 1 não repete o mesmo monstro em todas as fases', () => {
    const kinds = new Set(LEVEL_ORDER.flatMap((l) => l.guardians.map((g) => g.kind)));
    expect(kinds.size).toBeGreaterThanOrEqual(4);
  });
});

describe('o chefe', () => {
  it('o Curupira aparece uma vez só, e é na última fase', () => {
    const bosses = LEVEL_ORDER.flatMap((level) =>
      level.guardians.filter((g) => g.kind === 'curupira').map(() => level.id),
    );
    expect(bosses).toEqual(['1-5']);
  });

  it('o chefe cobra mais de uma conta', () => {
    expect(BOSS_ROUNDS).toBeGreaterThan(1);
  });

  it('o chefe fica antes da porta, não depois', () => {
    const fase = LEVEL_ORDER.find((level) => level.id === '1-5');
    const chefe = fase?.guardians.find((g) => g.kind === 'curupira');
    const porta = fase?.mechanisms.find((m) => m.kind === 'porta');
    expect(chefe && porta && chefe.at.x < porta.panel.x).toBe(true);
  });
});
