import { describe, expect, it } from 'vitest';
import { generateQuestion, MIN_ANSWER, OP_LABEL } from '@/game/math/mathEngine';
import type { Op, Question, Tier } from '@/game/math/mathEngine.types';

const OPS: readonly Op[] = ['+', '-', '*', '/'];
const TIERS: readonly Tier[] = [1, 2, 3];

/** Mil contas de cada combinação — é a bateria que o SPEC 6 pede. */
function everyQuestion(visit: (question: Question) => void): void {
  for (const op of OPS) {
    for (const tier of TIERS) {
      for (let i = 0; i < 1000; i += 1) visit(generateQuestion(op, tier));
    }
  }
}

describe('generateQuestion', () => {
  it('nunca gera resposta negativa', () => {
    everyQuestion((q) => expect(q.answer).toBeGreaterThanOrEqual(0));
  });

  it('a conta escrita bate com a resposta', () => {
    everyQuestion((q) => {
      const value =
        q.op === '+'
          ? q.a + q.b
          : q.op === '-'
            ? q.a - q.b
            : q.op === '*'
              ? q.a * q.b
              : q.a / q.b;
      expect(value).toBe(q.answer);
    });
  });

  it('a divisão é sempre exata', () => {
    for (const tier of TIERS) {
      for (let i = 0; i < 1000; i += 1) {
        const q = generateQuestion('/', tier);
        expect(q.a % q.b).toBe(0);
      }
    }
  });

  it('sempre 4 opções, sem repetir, com a resposta entre elas', () => {
    everyQuestion((q) => {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(q.answer);
    });
  });

  it('nenhuma opção é negativa — negativo entrega o erro de graça', () => {
    everyQuestion((q) => {
      for (const option of q.options) expect(option).toBeGreaterThanOrEqual(0);
    });
  });

  it('o tier 1 não passa de 10 nas parcelas', () => {
    for (let i = 0; i < 500; i += 1) {
      const q = generateQuestion('+', 1);
      expect(q.a).toBeLessThanOrEqual(10);
      expect(q.b).toBeLessThanOrEqual(10);
    }
  });

  it('o mesmo rng gera a mesma conta', () => {
    const fixed = (): number => 0.42;
    expect(generateQuestion('+', 2, fixed)).toEqual(generateQuestion('+', 2, fixed));
  });

  /**
   * O MIN_ANSWER é o que o level design usa para dimensionar a escada de
   * blocos. Se uma operação puder responder menos do que ele promete, existe
   * uma partida em que a escada nasce curta demais e a fase trava.
   */
  it('nenhuma resposta fica abaixo do MIN_ANSWER da operação', () => {
    everyQuestion((q) => expect(q.answer).toBeGreaterThanOrEqual(MIN_ANSWER[q.op]));
  });

  it('mostra × e ÷, não * e /', () => {
    expect(OP_LABEL['*']).toBe('×');
    expect(OP_LABEL['/']).toBe('÷');
  });
});
