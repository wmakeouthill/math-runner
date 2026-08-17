export type Op = '+' | '-' | '*' | '/';

/** T1 até 10, T2 até 20, T3 dois dígitos (SPEC 6). */
export type Tier = 1 | 2 | 3;

export type Question = {
  a: number;
  b: number;
  op: Op;
  answer: number;
  /** Quatro opções embaralhadas; exatamente uma é a resposta. */
  options: readonly number[];
};

/** Injetável para o teste ser determinístico. */
export type Rng = () => number;
