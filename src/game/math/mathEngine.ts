import type { Op, Question, Rng, Tier } from './mathEngine.types';

/** Como a conta aparece na tela. `-` é o sinal de menos tipográfico. */
export const OP_LABEL: Record<Op, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

/** Faixa das parcelas em soma e subtração. */
const RANGE: Record<Tier, number> = { 1: 10, 2: 20, 3: 99 };

/** Tabuada: até 5, até 10, até 12. Dois dígitos vezes dois dígitos é outra série. */
const TABLE: Record<Tier, number> = { 1: 5, 2: 10, 3: 12 };

const pick = (rng: Rng, max: number): number => 1 + Math.floor(rng() * max);

function operands(op: Op, tier: Tier, rng: Rng): { a: number; b: number; answer: number } {
  switch (op) {
    case '+': {
      const a = pick(rng, RANGE[tier]);
      const b = pick(rng, RANGE[tier]);
      return { a, b, answer: a + b };
    }
    case '-': {
      // nunca negativo: sorteia os dois e põe o maior na frente
      const x = pick(rng, RANGE[tier]);
      const y = pick(rng, RANGE[tier]);
      const a = Math.max(x, y);
      const b = Math.min(x, y);
      return { a, b, answer: a - b };
    }
    case '*': {
      const a = pick(rng, TABLE[tier]);
      const b = pick(rng, TABLE[tier]);
      return { a, b, answer: a * b };
    }
    case '/': {
      // sempre exata: gera o divisor e o resultado, e monta o dividendo
      const b = pick(rng, TABLE[tier]);
      const answer = pick(rng, TABLE[tier]);
      return { a: b * answer, b, answer };
    }
  }
}

/**
 * Erros que criança comete de verdade: ±1, ±2 e a operação trocada. Distrator
 * aleatório se elimina no olho e ensina o chute; este ainda mostra ao aluno
 * qual foi o engano (SPEC 6).
 */
function distractors(a: number, b: number, op: Op, answer: number): readonly number[] {
  const swapped = op === '+' || op === '*' ? a - b : a + b;
  return [answer + 1, answer - 1, swapped, answer + 2, answer + 10];
}

function shuffle(list: readonly number[], rng: Rng): number[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const left = out[i];
    const right = out[j];
    if (left === undefined || right === undefined) continue;
    out[i] = right;
    out[j] = left;
  }
  return out;
}

function buildOptions(answer: number, candidates: readonly number[], rng: Rng): number[] {
  const options = [answer];

  for (const candidate of candidates) {
    if (options.length === 4) break;
    if (candidate < 0 || options.includes(candidate)) continue;
    options.push(candidate);
  }

  // rede de segurança: se os distratores colidiram entre si, completa subindo
  let filler = answer + 3;
  while (options.length < 4) {
    if (!options.includes(filler)) options.push(filler);
    filler += 1;
  }

  return shuffle(options, rng);
}

export function generateQuestion(op: Op, tier: Tier, rng: Rng = Math.random): Question {
  const { a, b, answer } = operands(op, tier, rng);
  return {
    a,
    b,
    op,
    answer,
    options: buildOptions(answer, distractors(a, b, op, answer), rng),
  };
}
