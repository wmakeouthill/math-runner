# Math Runner — Fase 3 · Os desafios de matemática · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer a conta aparecer e mudar o mundo: o jogador chega num Painel de Cálculo, aperta ação, responde, e a ponte levantada deita sobre um buraco que ele não conseguia pular.

**Architecture:** O gerador de contas é TypeScript puro com `rng` injetável — roda no Vitest sem canvas e é onde ficam as regras pedagógicas (nunca negativo, divisão exata, distratores plausíveis). O card da conta é React, sobreposto ao canvas; o Phaser nunca desenha o card. A `useChallengeStore` é a ponte: o Phaser abre a conta, o React responde, o Phaser reage ao resultado via `subscribe`. O mecanismo declara no arquivo da fase qual plataforma ele entrega, e o teste de alcance verifica que a fase só é atravessável **com o mecanismo acionado**.

**Tech Stack:** React 19 · TypeScript (strict) · Phaser 3 · Zustand · Vitest

**Spec:** [`SPEC.md`](../../../SPEC.md) — seções 3 (loop), 4 (mecanismos), 6 (motor de contas), 8 (controles)

**Depende de:** [`2026-08-16-math-runner-fase-2-identidade-visual.md`](2026-08-16-math-runner-fase-2-identidade-visual.md) — a `PALETTE` da Task 1 daquele plano é usada aqui. Faça a Fase 2 primeiro.

## Global Constraints

Valem para **todas** as tasks. Copiados do `SPEC.md` e das regras do projeto:

- **TypeScript `strict: true`. `any` é proibido.** Sem exceções, inclusive em testes.
- **`noUncheckedIndexedAccess` está ligado.** `array[i]` devolve `T | undefined` — trate, não use `!`.
- **Nenhum arquivo passa de 200 linhas.** Se passar, divida por responsabilidade.
- **Sem backend, sem banco, sem login.** Persistência só em `localStorage`.
- **Separação de arquivos React:** `Component.tsx` / `Component.styles.ts` / `Component.hooks.ts` / `Component.types.ts`. Zero lógica dentro do JSX.
- **Estado global de cliente via Zustand.** Não existe server state neste projeto, então **não** instale TanStack Query.
- **Nunca renderize UI dentro do Phaser.** Card da conta, menus, HUD e botões são React/HTML. **Exceção única e estreita:** o balão de tecla que flutua acima do Painel de Cálculo é objeto de mundo, diegético, e fica no Phaser — ele acompanha a câmera junto com o painel. Nada além disso.
- **Nenhuma dependência nova.**
- **Erro nunca trava.** Errar num mecanismo do cenário **não** pune: a mesma conta continua, e a partir do segundo erro seguido a dica visual aparece (`SPEC.md` pilar 3 e seção 6). Corações e contra-ataque são da Fase 5, não desta.
- **Nenhuma fase pode depender de derrotar um monstro para ser terminada** (`SPEC.md` 4b) — vale também para o modo Explorador, que ainda não muda nada aqui.
- **Commits sem trailer de coautoria.** Nada de `Co-Authored-By`, `Generated with` ou assinatura de ferramenta, em commit, comentário de código ou README. O trabalho é do Junior e da Ana.
- **Resolução base do jogo:** `960 x 540`, escala `FIT`, orientação `landscape`.
- **Commits pequenos**, um por task no mínimo, em português, prefixo `feat:` / `test:` / `chore:` / `fix:`.

---

## Estrutura de arquivos

```
src/
├─ game/
│  ├─ math/
│  │  ├─ mathEngine.ts             # ★ novo — gerador puro, rng injetável
│  │  └─ mathEngine.types.ts       # ★ novo — Op, Tier, Question
│  ├─ mechanisms/
│  │  ├─ CalcPanel.ts              # ★ novo — painel + balão de tecla
│  │  └─ Bridge.ts                 # ★ novo — ponte que deita
│  ├─ levels/
│  │  ├─ reach.ts                  # modificado — MechanismSpec, panelIsReachable
│  │  └─ level-1-1.ts              # modificado — buraco de verdade + ponte
│  ├─ systems/
│  │  ├─ touchZones.ts             # modificado — zona de ação
│  │  └─ InputSystem.ts            # modificado — interactJustPressed
│  └─ scenes/
│     └─ LevelScene.ts             # modificado — abre a conta, aplica o resultado
├─ store/
│  ├─ useChallengeStore.ts         # ★ novo — a ponte React ↔ Phaser da conta
│  └─ useChallengeStore.types.ts   # ★ novo
└─ app/
   ├─ MathCard/
   │  ├─ MathCard.tsx              # ★ novo — card no rodapé
   │  ├─ MathCard.styles.ts        # ★ novo
   │  ├─ MathCard.hooks.ts         # ★ novo — teclas 1–4
   │  └─ Hint.tsx                  # ★ novo — a conta desenhada com fichas
   └─ GameCanvas/
      └─ GameCanvas.tsx            # modificado — card por cima do canvas

tests/
├─ game/
│  ├─ mathEngine.test.ts           # ★ novo
│  ├─ touchZones.test.ts           # modificado
│  └─ reach.test.ts                # modificado
└─ store/
   └─ useChallengeStore.test.ts    # ★ novo
```

**Por que a store da conta é separada da `useGameStore`:** progresso é persistido
em `localStorage`, conta aberta é transitória. Misturar as duas faria a conta ser
salva no disco e reaparecer na próxima abertura do jogo.

---

### Task 1: Motor de contas

**Files:**
- Create: `src/game/math/mathEngine.types.ts`
- Create: `src/game/math/mathEngine.ts`
- Create: `tests/game/mathEngine.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `type Op = '+' | '-' | '*' | '/'`, `type Tier = 1 | 2 | 3`, `type Question = { a, b, op, answer, options }`, `generateQuestion(op: Op, tier: Tier, rng?: Rng): Question`, `OP_LABEL: Record<Op, string>`.

- [ ] **Step 1: Escreva os tipos**

Crie `src/game/math/mathEngine.types.ts`:

```ts
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
```

- [ ] **Step 2: Escreva o teste que falha**

Crie `tests/game/mathEngine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { generateQuestion, OP_LABEL } from '@/game/math/mathEngine';
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

  it('mostra × e ÷, não * e /', () => {
    expect(OP_LABEL['*']).toBe('×');
    expect(OP_LABEL['/']).toBe('÷');
  });
});
```

- [ ] **Step 3: Rode o teste e confirme que falha**

Run: `npm run test -- mathEngine`
Expected: FAIL — `Failed to resolve import "@/game/math/mathEngine"`

- [ ] **Step 4: Escreva o motor**

Crie `src/game/math/mathEngine.ts`:

```ts
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
```

- [ ] **Step 5: Rode o teste e confirme que passa**

Run: `npm run test -- mathEngine`
Expected: PASS — 8 testes

- [ ] **Step 6: Rode o portão**

Run: `npx tsc -b && npm run lint && npm run test`
Expected: sem erro

- [ ] **Step 7: Commit**

```bash
git add src/game/math tests/game/mathEngine.test.ts
git commit -m "feat: gerador de contas com divisao exata e distratores plausiveis"
```

---

### Task 2: Store da conta aberta

**Files:**
- Create: `src/store/useChallengeStore.types.ts`
- Create: `src/store/useChallengeStore.ts`
- Create: `tests/store/useChallengeStore.test.ts`

**Interfaces:**
- Consumes: `Question` da Task 1.
- Produces: `useChallengeStore` com `{ challenge, outcome, open(source, question), answer(option), close() }`, `showsHint(challenge): boolean`, `HINT_AFTER_ERRORS`, e os tipos `Challenge` e `ChallengeOutcome`.

- [ ] **Step 1: Escreva os tipos**

Crie `src/store/useChallengeStore.types.ts`:

```ts
import type { Question } from '@/game/math/mathEngine.types';

/** Id do mecanismo que pediu a conta — a resposta volta endereçada a ele. */
export type ChallengeSource = string;

export type Challenge = {
  source: ChallengeSource;
  question: Question;
  /** Erros seguidos nesta conta. A partir de 2, a dica aparece. */
  wrongStreak: number;
};

export type ChallengeOutcome = {
  source: ChallengeSource;
  correct: boolean;
  /** A resposta certa. O mecanismo usa como N: quantos blocos, qual altura. */
  answer: number;
};

export type ChallengeState = {
  challenge: Challenge | null;
  outcome: ChallengeOutcome | null;
  open: (source: ChallengeSource, question: Question) => void;
  answer: (option: number) => void;
  close: () => void;
};
```

- [ ] **Step 2: Escreva o teste que falha**

Crie `tests/store/useChallengeStore.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { showsHint, useChallengeStore } from '@/store/useChallengeStore';
import type { Question } from '@/game/math/mathEngine.types';

const QUESTION: Question = { a: 3, b: 4, op: '+', answer: 7, options: [5, 7, 8, 12] };

const get = () => useChallengeStore.getState();

describe('useChallengeStore', () => {
  beforeEach(() => get().close());

  it('começa sem conta aberta', () => {
    expect(get().challenge).toBeNull();
    expect(get().outcome).toBeNull();
  });

  it('open mostra a conta com o contador de erros zerado', () => {
    get().open('ponte-1', QUESTION);
    expect(get().challenge?.source).toBe('ponte-1');
    expect(get().challenge?.question).toEqual(QUESTION);
    expect(get().challenge?.wrongStreak).toBe(0);
  });

  it('acertar fecha a conta e avisa o mecanismo com o valor da resposta', () => {
    get().open('ponte-1', QUESTION);
    get().answer(7);
    expect(get().challenge).toBeNull();
    expect(get().outcome).toEqual({ source: 'ponte-1', correct: true, answer: 7 });
  });

  it('errar num mecanismo não fecha a conta e não pune', () => {
    get().open('ponte-1', QUESTION);
    get().answer(5);
    expect(get().challenge?.wrongStreak).toBe(1);
    expect(get().outcome?.correct).toBe(false);
  });

  it('a conta continua a mesma depois do erro — a dica ensina esta, não outra', () => {
    get().open('ponte-1', QUESTION);
    get().answer(5);
    expect(get().challenge?.question).toEqual(QUESTION);
  });

  it('a dica aparece a partir do segundo erro seguido', () => {
    get().open('ponte-1', QUESTION);

    get().answer(5);
    const afterOne = get().challenge;
    expect(afterOne).not.toBeNull();
    expect(afterOne ? showsHint(afterOne) : null).toBe(false);

    get().answer(8);
    const afterTwo = get().challenge;
    expect(afterTwo).not.toBeNull();
    expect(afterTwo ? showsHint(afterTwo) : null).toBe(true);
  });

  it('responder sem conta aberta não faz nada', () => {
    get().answer(7);
    expect(get().outcome).toBeNull();
  });

  it('cada erro gera um outcome novo, para o mecanismo reagir de novo', () => {
    get().open('ponte-1', QUESTION);
    get().answer(5);
    const first = get().outcome;
    get().answer(8);
    expect(get().outcome).not.toBe(first);
  });

  it('a conta aberta não é salva em localStorage', () => {
    get().open('ponte-1', QUESTION);
    expect(localStorage.getItem('math-runner-challenge')).toBeNull();
  });
});
```

- [ ] **Step 3: Rode o teste e confirme que falha**

Run: `npm run test -- useChallengeStore`
Expected: FAIL — `Failed to resolve import "@/store/useChallengeStore"`

- [ ] **Step 4: Escreva a store**

Crie `src/store/useChallengeStore.ts`:

```ts
import { create } from 'zustand';
import type { Challenge, ChallengeState } from './useChallengeStore.types';

/** Dois erros seguidos e a conta vira desenho. É a válvula do SPEC 6. */
export const HINT_AFTER_ERRORS = 2;

/**
 * Conta aberta no momento. Sem `persist` de propósito: isto é estado de um
 * instante, não progresso. Salvar traria a conta de volta na próxima abertura
 * do jogo, e a fase reabriria com um card por cima do nada.
 */
export const useChallengeStore = create<ChallengeState>()((set, get) => ({
  challenge: null,
  outcome: null,

  open: (source, question) =>
    set({ challenge: { source, question, wrongStreak: 0 }, outcome: null }),

  answer: (option) => {
    const current = get().challenge;
    if (current === null) return;

    if (option === current.question.answer) {
      set({
        challenge: null,
        outcome: { source: current.source, correct: true, answer: current.question.answer },
      });
      return;
    }

    // Errar num mecanismo do cenário não pune: a mesma conta continua aberta.
    set({
      challenge: { ...current, wrongStreak: current.wrongStreak + 1 },
      outcome: { source: current.source, correct: false, answer: current.question.answer },
    });
  },

  close: () => set({ challenge: null, outcome: null }),
}));

export const showsHint = (challenge: Challenge): boolean =>
  challenge.wrongStreak >= HINT_AFTER_ERRORS;
```

- [ ] **Step 5: Rode o teste e confirme que passa**

Run: `npm run test -- useChallengeStore`
Expected: PASS — 9 testes

- [ ] **Step 6: Commit**

```bash
git add src/store/useChallengeStore.ts src/store/useChallengeStore.types.ts tests/store/useChallengeStore.test.ts
git commit -m "feat: store da conta aberta como ponte entre React e Phaser"
```

---

### Task 3: Card da conta em React

**Files:**
- Create: `src/app/MathCard/MathCard.styles.ts`
- Create: `src/app/MathCard/MathCard.hooks.ts`
- Create: `src/app/MathCard/Hint.tsx`
- Create: `src/app/MathCard/MathCard.tsx`
- Modify: `src/app/GameCanvas/GameCanvas.tsx`

**Interfaces:**
- Consumes: `useChallengeStore` e `showsHint` da Task 2; `OP_LABEL` e `Question` da Task 1; `PALETTE` da Fase 2.
- Produces: `<MathCard />`, montado por cima do canvas. Nada depende dele.

- [ ] **Step 1: Escreva os estilos**

Crie `src/app/MathCard/MathCard.styles.ts`:

```ts
import type { CSSProperties } from 'react';
import { PALETTE } from '@/theme/palette';

export const styles = {
  /** Rodapé, não tela cheia: o cenário continua visível atrás (SPEC 3). */
  card: {
    position: 'absolute',
    left: '50%',
    bottom: 'clamp(0.6rem, 3vh, 1.5rem)',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.6rem',
    width: 'min(560px, 94vw)',
    padding: 'clamp(0.7rem, 2.5vw, 1.1rem)',
    background: `${PALETTE.night}f2`,
    border: `2px solid ${PALETTE.cyan}`,
    borderRadius: '1.1rem',
    boxShadow: `0 12px 40px ${PALETTE.night}cc`,
  },
  question: {
    fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: PALETTE.ink,
  },
  options: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
    width: '100%',
  },
  option: {
    position: 'relative',
    padding: '0.85rem 0.4rem',
    fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
    fontWeight: 700,
    color: PALETTE.ink,
    background: PALETTE.navy,
    border: `2px solid ${PALETTE.steel}`,
    borderRadius: '0.8rem',
    cursor: 'pointer',
  },
  optionKey: {
    position: 'absolute',
    top: '0.25rem',
    left: '0.4rem',
    fontSize: '0.65rem',
    fontWeight: 600,
    color: PALETTE.faint,
  },
  retry: {
    fontSize: '0.85rem',
    color: PALETTE.gold,
  },
  hint: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.35rem 0.9rem',
  },
  hintGroup: {
    display: 'flex',
    gap: '0.25rem',
  },
  dot: {
    width: '0.85rem',
    height: '0.85rem',
    borderRadius: '999px',
  },
} satisfies Record<string, CSSProperties>;
```

- [ ] **Step 2: Escreva o hook das teclas 1–4**

Crie `src/app/MathCard/MathCard.hooks.ts`:

```ts
import { useEffect } from 'react';

/**
 * Teclas 1–4 respondem, como manda o SPEC 8. Passe `null` quando não houver
 * conta aberta — o hook não pode ser chamado condicionalmente.
 */
export function useAnswerKeys(
  options: readonly number[] | null,
  answer: (option: number) => void,
): void {
  useEffect(() => {
    if (options === null) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      const option = options[Number(event.key) - 1];
      if (option === undefined) return;
      event.preventDefault();
      answer(option);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [options, answer]);
}
```

- [ ] **Step 3: Escreva a dica visual**

Crie `src/app/MathCard/Hint.tsx`:

```tsx
import { PALETTE } from '@/theme/palette';
import type { Question } from '@/game/math/mathEngine.types';
import { styles } from './MathCard.styles';

/** Acima disso a tela vira um mar de bolinhas e a dica deixa de ajudar. */
const MAX_DOTS = 30;

/** Em quantos grupos e de que tamanho a conta é desenhada. */
function groups(question: Question): readonly number[] {
  const { a, b, op, answer } = question;
  if (op === '+') return [a, b];
  if (op === '-') return [a - b, b];
  if (op === '*') return Array.from({ length: a }, () => b);
  return Array.from({ length: b }, () => answer);
}

const total = (rows: readonly number[]): number => rows.reduce((sum, size) => sum + size, 0);

/**
 * A conta desenhada com fichas. Ver 3 + 4 virar sete bolinhas é o momento mais
 * pedagógico do jogo (SPEC 6) — vale deixar visível na apresentação.
 *
 * Na subtração, o segundo grupo é o que foi tirado, e aparece apagado.
 */
export function Hint({ question }: { question: Question }) {
  const rows = groups(question);
  if (total(rows) > MAX_DOTS) return null;

  const fadedRow = question.op === '-' ? 1 : -1;

  return (
    <div style={styles.hint} aria-hidden="true">
      {rows.map((size, row) => (
        <div key={row} style={styles.hintGroup}>
          {Array.from({ length: size }, (_unused, dot) => (
            <span
              key={dot}
              style={{
                ...styles.dot,
                background: row === fadedRow ? PALETTE.faint : PALETTE.gold,
                opacity: row === fadedRow ? 0.35 : 1,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

`key={row}` usa o índice de propósito: os grupos não são reordenados nem
removidos, são regerados inteiros a cada conta.

- [ ] **Step 4: Escreva o card**

Crie `src/app/MathCard/MathCard.tsx`:

```tsx
import { showsHint, useChallengeStore } from '@/store/useChallengeStore';
import { OP_LABEL } from '@/game/math/mathEngine';
import { useAnswerKeys } from './MathCard.hooks';
import { Hint } from './Hint';
import { styles } from './MathCard.styles';

export function MathCard() {
  const challenge = useChallengeStore((state) => state.challenge);
  const answer = useChallengeStore((state) => state.answer);

  // Antes de qualquer return: React não permite hook depois de saída condicional.
  useAnswerKeys(challenge?.question.options ?? null, answer);

  if (challenge === null) return null;

  const { a, b, op, options } = challenge.question;

  return (
    <section style={styles.card} aria-live="polite">
      <p style={styles.question}>{`${a} ${OP_LABEL[op]} ${b} = ?`}</p>

      {showsHint(challenge) ? <Hint question={challenge.question} /> : null}

      <div style={styles.options}>
        {options.map((option, index) => (
          <button key={option} type="button" style={styles.option} onClick={() => answer(option)}>
            <span style={styles.optionKey}>{index + 1}</span>
            {option}
          </button>
        ))}
      </div>

      {challenge.wrongStreak > 0 ? <p style={styles.retry}>Quase! Tente de novo.</p> : null}
    </section>
  );
}
```

- [ ] **Step 5: Monte o card por cima do canvas**

Substitua o conteúdo de `src/app/GameCanvas/GameCanvas.tsx`:

```tsx
import { MathCard } from '@/app/MathCard/MathCard';
import { usePhaserGame } from './GameCanvas.hooks';

export function GameCanvas() {
  const containerRef = usePhaserGame();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <MathCard />
    </div>
  );
}
```

- [ ] **Step 6: Rode o portão**

Run: `npx tsc -b && npm run lint && npm run test`
Expected: sem erro. O card ainda não abre — nada o dispara até a Task 5.

- [ ] **Step 7: Commit**

```bash
git add src/app/MathCard src/app/GameCanvas/GameCanvas.tsx
git commit -m "feat: card da conta no rodape com dica em fichas e teclas 1-4"
```

---

### Task 4: Botão de ação no teclado e no toque

**Files:**
- Modify: `src/game/systems/touchZones.ts`
- Modify: `src/game/systems/InputSystem.ts`
- Modify: `tests/game/touchZones.test.ts`

**Interfaces:**
- Consumes: nada novo.
- Produces: `TouchAction` ganha `'action'`; `touchZone(x, y, view)` muda de assinatura; `InputState` ganha `interactJustPressed: boolean`.

- [ ] **Step 1: Reescreva o teste das zonas de toque**

Substitua o conteúdo de `tests/game/touchZones.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { touchZone } from '@/game/systems/touchZones';

const VIEW = { width: 960, height: 540 };
const SMALL = { width: 400, height: 300 };

describe('touchZone', () => {
  it('primeiro quarto da tela move para a esquerda', () => {
    expect(touchZone(10, 400, VIEW)).toBe('left');
    expect(touchZone(239, 400, VIEW)).toBe('left');
  });

  it('segundo quarto da tela move para a direita', () => {
    expect(touchZone(240, 400, VIEW)).toBe('right');
    expect(touchZone(479, 400, VIEW)).toBe('right');
  });

  it('a metade direita pula', () => {
    expect(touchZone(480, 400, VIEW)).toBe('jump');
    expect(touchZone(959, 400, VIEW)).toBe('jump');
  });

  it('o canto superior direito é o botão de ação', () => {
    expect(touchZone(900, 20, VIEW)).toBe('action');
    expect(touchZone(730, 170, VIEW)).toBe('action');
  });

  it('o d-pad nunca vira ação, por mais alto que o dedo esteja', () => {
    expect(touchZone(100, 5, VIEW)).toBe('left');
    expect(touchZone(300, 5, VIEW)).toBe('right');
  });

  it('funciona em qualquer tamanho de tela', () => {
    expect(touchZone(50, 200, SMALL)).toBe('left');
    expect(touchZone(150, 200, SMALL)).toBe('right');
    expect(touchZone(300, 200, SMALL)).toBe('jump');
    expect(touchZone(380, 20, SMALL)).toBe('action');
  });
});
```

- [ ] **Step 2: Rode e confirme que falha**

Run: `npm run test -- touchZones`
Expected: FAIL — `Expected 2 arguments, but got 3` no runtime, ou resultado `'jump'` onde se esperava `'action'`

- [ ] **Step 3: Reescreva as zonas**

Substitua o conteúdo de `src/game/systems/touchZones.ts`:

```ts
export type TouchAction = 'left' | 'right' | 'jump' | 'action';

export type Viewport = { width: number; height: number };

/** Fração da largura e da altura reservada ao botão de ação. */
const ACTION_X = 0.75;
const ACTION_Y = 1 / 3;

/**
 * Metade esquerda = d-pad (quarto 1 esquerda, quarto 2 direita).
 * Metade direita = pulo, menos o canto superior direito, que é a ação.
 *
 * A ação fica no canto alto porque o polegar direito descansa embaixo, em cima
 * do pulo: ninguém aperta ação sem querer no meio de uma corrida.
 */
export function touchZone(x: number, y: number, view: Viewport): TouchAction {
  if (x < view.width / 2) return x < view.width / 4 ? 'left' : 'right';
  return x > view.width * ACTION_X && y < view.height * ACTION_Y ? 'action' : 'jump';
}
```

- [ ] **Step 4: Rode e confirme que passa**

Run: `npm run test -- touchZones`
Expected: PASS — 6 testes

- [ ] **Step 5: Ligue a ação no InputSystem**

Em `src/game/systems/InputSystem.ts`, aplique quatro mudanças.

Acrescente o campo ao tipo:

```ts
export type InputState = {
  left: boolean;
  right: boolean;
  jumpJustPressed: boolean;
  jumpJustReleased: boolean;
  interactJustPressed: boolean;
};
```

Acrescente os campos da classe, ao lado dos que já existem:

```ts
  private readonly keyE: Phaser.Input.Keyboard.Key;
  private readonly keyEnter: Phaser.Input.Keyboard.Key;
  private touchInteractPressed = false;
```

No construtor, depois de `this.keySpace = ...`:

```ts
    this.keyE = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
```

Substitua `onPointerDown`, o retorno de `read()` e `endFrame()`:

```ts
  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    const action = touchZone(pointer.x, pointer.y, {
      width: this.scene.scale.width,
      height: this.scene.scale.height,
    });
    this.touches.set(pointer.id, action);
    if (action === 'jump') this.touchJumpPressed = true;
    if (action === 'action') this.touchInteractPressed = true;
  }
```

```ts
    return {
      left: this.cursors.left.isDown || this.keyA.isDown || this.isTouching('left'),
      right: this.cursors.right.isDown || this.keyD.isDown || this.isTouching('right'),
      jumpJustPressed:
        jumpKeys.some((key) => Phaser.Input.Keyboard.JustDown(key)) || this.touchJumpPressed,
      jumpJustReleased:
        jumpKeys.some((key) => Phaser.Input.Keyboard.JustUp(key)) || this.touchJumpReleased,
      interactJustPressed:
        Phaser.Input.Keyboard.JustDown(this.keyE) ||
        Phaser.Input.Keyboard.JustDown(this.keyEnter) ||
        this.touchInteractPressed,
    };
```

```ts
  /** Chame no fim de cada update para limpar os eventos de toque do frame. */
  endFrame(): void {
    this.touchJumpPressed = false;
    this.touchJumpReleased = false;
    this.touchInteractPressed = false;
  }
```

Por que `E` e `Enter` e não `↑`: o `SPEC.md` seção 8 listava `↑` nas duas
funções, e `↑` já é pulo aqui. Ambiguidade em controle é bug garantido.
Atualize a seção 8 do `SPEC.md` para `E` / `Enter` no mesmo commit.

- [ ] **Step 6: Rode o portão**

Run: `npx tsc -b && npm run lint && npm run test`
Expected: sem erro

- [ ] **Step 7: Commit**

```bash
git add src/game/systems tests/game/touchZones.test.ts SPEC.md
git commit -m "feat: botao de acao no teclado e no canto superior direito do toque"
```

---

### Task 5: Painel de Cálculo e ponte

**Files:**
- Create: `src/game/mechanisms/CalcPanel.ts`
- Create: `src/game/mechanisms/Bridge.ts`

**Interfaces:**
- Consumes: `PALETTE` e `toPhaserColor` da Fase 2; `PlatformSpec` de `@/game/levels/reach`.
- Produces: `class CalcPanel` com `readonly source: string`, `updateProximity(playerX, playerY): boolean` e `markSolved(): void`; `class Bridge` com `lower(): void`. A Task 6 monta os dois.

- [ ] **Step 1: Escreva o painel**

Crie `src/game/mechanisms/CalcPanel.ts`:

```ts
import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';

const REACH_X = 64;
const REACH_Y = 90;

/**
 * Painel de Cálculo: o jogador encosta, aperta ação e a conta abre.
 *
 * O painel não sabe qual é a conta nem se ela está certa — só avisa que está ao
 * alcance e mostra o balão da tecla. Quem gera a conta é o mathEngine, quem a
 * desenha é o React.
 */
export class CalcPanel {
  readonly source: string;
  private readonly x: number;
  private readonly y: number;
  private readonly glyph: Phaser.GameObjects.Text;
  private readonly prompt: Phaser.GameObjects.Container;
  private solved = false;

  constructor(scene: Phaser.Scene, source: string, x: number, y: number) {
    this.source = source;
    this.x = x;
    this.y = y;

    scene.add.rectangle(x, y + 30, 6, 56, toPhaserColor(PALETTE.dirt));

    const board = scene.add.rectangle(x, y, 46, 38, toPhaserColor(PALETTE.navy));
    board.setStrokeStyle(3, toPhaserColor(PALETTE.cyan));

    this.glyph = scene.add.text(x, y, '?', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '22px',
      color: PALETTE.cyan,
    });
    this.glyph.setOrigin(0.5);

    const badge = scene.add.rectangle(0, 0, 28, 24, toPhaserColor(PALETTE.night), 0.85);
    badge.setStrokeStyle(2, toPhaserColor(PALETTE.cyan));

    const key = scene.add.text(0, 0, 'E', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '13px',
      color: PALETTE.cyan,
    });
    key.setOrigin(0.5);

    this.prompt = scene.add.container(x, y - 36, [badge, key]);
    this.prompt.setVisible(false);
  }

  /** Mostra ou esconde o balão e devolve se dá para interagir agora. */
  updateProximity(playerX: number, playerY: number): boolean {
    const near =
      !this.solved &&
      Math.abs(playerX - this.x) < REACH_X &&
      Math.abs(playerY - this.y) < REACH_Y;

    this.prompt.setVisible(near);
    return near;
  }

  markSolved(): void {
    this.solved = true;
    this.prompt.setVisible(false);
    this.glyph.setText('✓');
    this.glyph.setColor(PALETTE.gold);
  }
}
```

- [ ] **Step 2: Escreva a ponte**

Crie `src/game/mechanisms/Bridge.ts`:

```ts
import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import type { PlatformSpec } from '@/game/levels/reach';

const FALL_MS = 560;

/**
 * Ponte levantada. Nasce em pé na beirada e deita sobre o buraco quando a conta
 * é respondida certo.
 *
 * O corpo de colisão só entra no grupo estático quando a animação termina:
 * corpo estático do Arcade é AABB e não acompanha rotação, então uma ponte
 * girando com corpo ligado teria caixa de colisão errada o caminho inteiro.
 * Meio segundo sem colisão numa ponte que está caindo não incomoda ninguém.
 */
export class Bridge {
  private readonly scene: Phaser.Scene;
  private readonly group: Phaser.Physics.Arcade.StaticGroup;
  private readonly plank: Phaser.GameObjects.Rectangle;
  private lowered = false;

  constructor(
    scene: Phaser.Scene,
    group: Phaser.Physics.Arcade.StaticGroup,
    spec: PlatformSpec,
  ) {
    this.scene = scene;
    this.group = group;

    // Origem na ponta esquerda: é o eixo em que a ponte gira. Com originX = 0 e
    // ângulo 0 no fim, o AABB coincide exatamente com o `spec`.
    this.plank = scene.add.rectangle(
      spec.x - spec.width / 2,
      spec.y,
      spec.width,
      spec.height,
      toPhaserColor(PALETTE.dirt),
    );
    this.plank.setOrigin(0, 0.5);
    this.plank.setStrokeStyle(2, toPhaserColor(PALETTE.deep));
    this.plank.setAngle(-90);
  }

  lower(): void {
    if (this.lowered) return;
    this.lowered = true;

    this.scene.tweens.add({
      targets: this.plank,
      angle: 0,
      duration: FALL_MS,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.group.add(this.plank);
        this.group.refresh();
      },
    });
  }
}
```

- [ ] **Step 3: Confira que compila**

Run: `npx tsc -b && npm run lint`
Expected: sem erro. As duas classes ainda não têm quem as construa.

- [ ] **Step 4: Commit (junto com a Task 6)**

Sai no mesmo commit da Task 6 — classe sem quem a use não é entrega.

---

### Task 6: A fase 1-1 ganha um buraco de verdade

**Files:**
- Modify: `src/game/levels/reach.ts`
- Modify: `src/game/levels/level-1-1.ts`
- Modify: `tests/game/reach.test.ts`
- Modify: `src/game/scenes/LevelScene.ts`

**Interfaces:**
- Consumes: tudo das tasks anteriores.
- Produces: `MechanismSpec`, `allPlatforms(level)`, `panelIsReachable(level, panel)`; `LevelSpec` ganha `mechanisms`.

- [ ] **Step 1: Escreva o teste que falha**

Substitua o conteúdo de `tests/game/reach.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LEVEL_1_1 } from '@/game/levels/level-1-1';
import {
  allPlatforms,
  canReach,
  horizontalGap,
  panelIsReachable,
  reachablePlatforms,
  spawnPlatformIndex,
  topOf,
  JUMP_REACH,
  SAFE_GAP,
  SAFE_STEP,
  type PlatformSpec,
} from '@/game/levels/reach';

const chao: PlatformSpec = { x: 400, y: 500, width: 400, height: 40 };

describe('limites de alcance', () => {
  it('derivam do GAME_FEEL e sobram folga sobre o máximo', () => {
    expect(SAFE_STEP).toBeLessThan(JUMP_REACH.maxHeight);
    expect(SAFE_GAP).toBeLessThan(JUMP_REACH.maxDistance);
  });
});

describe('canReach', () => {
  it('aceita um degrau dentro do alcance', () => {
    const degrau: PlatformSpec = { x: 400, y: 500 - 80, width: 160, height: 24 };
    expect(canReach(chao, degrau)).toBe(true);
  });

  it('recusa um degrau alto demais', () => {
    const altoDemais: PlatformSpec = {
      x: 400,
      y: chao.y - SAFE_STEP - 30,
      width: 160,
      height: 24,
    };
    expect(canReach(chao, altoDemais)).toBe(false);
  });

  it('recusa uma plataforma longe demais na horizontal', () => {
    const longe: PlatformSpec = {
      x: chao.x + chao.width / 2 + SAFE_GAP + 100,
      y: chao.y,
      width: 160,
      height: 24,
    };
    expect(canReach(chao, longe)).toBe(false);
  });

  it('descer é sempre possível, por mais fundo que seja', () => {
    const fundo: PlatformSpec = { x: 420, y: 5000, width: 160, height: 24 };
    expect(canReach(chao, fundo)).toBe(true);
  });
});

describe('horizontalGap', () => {
  it('é zero quando as plataformas se sobrepõem', () => {
    const sobreposta: PlatformSpec = { x: 500, y: 400, width: 400, height: 24 };
    expect(horizontalGap(chao, sobreposta)).toBe(0);
  });

  it('mede o vão independente da ordem dos argumentos', () => {
    const direita: PlatformSpec = { x: 800, y: 500, width: 200, height: 24 };
    expect(horizontalGap(chao, direita)).toBe(100);
    expect(horizontalGap(direita, chao)).toBe(100);
  });
});

describe('fase 1-1', () => {
  it('o jogador nasce em cima de uma plataforma, não no vácuo', () => {
    expect(spawnPlatformIndex(LEVEL_1_1)).toBeGreaterThanOrEqual(0);
  });

  /**
   * O invariante é "alcançável **com os mecanismos acionados**": a plataforma
   * que a ponte entrega entra na conta. É por isso que `allPlatforms` existe.
   */
  it('toda plataforma da fase é alcançável a partir do nascimento', () => {
    const alcancadas = reachablePlatforms(LEVEL_1_1);
    const perdidas = allPlatforms(LEVEL_1_1)
      .map((platform, index) => ({ index, topo: topOf(platform) }))
      .filter(({ index }) => !alcancadas.has(index));

    expect(perdidas).toEqual([]);
  });

  it('sem a ponte, o buraco é largo demais para qualquer pulo', () => {
    const chaoInicial = LEVEL_1_1.platforms[0];
    const chaoFinal = LEVEL_1_1.platforms[1];
    expect(chaoInicial).toBeDefined();
    expect(chaoFinal).toBeDefined();
    if (!chaoInicial || !chaoFinal) return;

    expect(horizontalGap(chaoInicial, chaoFinal)).toBeGreaterThan(JUMP_REACH.maxDistance);
  });

  it('todo painel de cálculo dá para alcançar a pé', () => {
    expect(LEVEL_1_1.mechanisms.length).toBeGreaterThan(0);
    for (const mechanism of LEVEL_1_1.mechanisms) {
      expect(panelIsReachable(LEVEL_1_1, mechanism.panel)).toBe(true);
    }
  });
});
```

O teste do buraco é o que dá sentido ao mecanismo: se um dia alguém estreitar o
vão sem querer, a ponte vira enfeite e o teste avisa.

- [ ] **Step 2: Rode e confirme que falha**

Run: `npm run test -- reach`
Expected: FAIL — `allPlatforms` e `panelIsReachable` não existem

- [ ] **Step 3: Estenda o reach**

Em `src/game/levels/reach.ts`, acrescente o import no topo:

```ts
import type { Op, Tier } from '@/game/math/mathEngine.types';
```

Substitua o bloco de tipos `LevelSpec` por:

```ts
export type MechanismSpec = {
  /** Liga painel, resposta e mecanismo. Único dentro da fase. */
  id: string;
  op: Op;
  tier: Tier;
  /** Onde fica o Painel de Cálculo. */
  panel: { x: number; y: number };
  /** A plataforma que o mecanismo entrega quando a conta é respondida certo. */
  platform: PlatformSpec;
};

export type LevelSpec = {
  spawn: { x: number; y: number };
  worldWidth: number;
  platforms: readonly PlatformSpec[];
  mechanisms: readonly MechanismSpec[];
};

/** Tudo em que dá para pisar depois que os mecanismos foram acionados. */
export function allPlatforms(level: LevelSpec): readonly PlatformSpec[] {
  return [...level.platforms, ...level.mechanisms.map((mechanism) => mechanism.platform)];
}
```

Troque as duas funções que varrem a fase para usarem `allPlatforms`:

```ts
/** Índice da plataforma em que o jogador nasce, ou -1 se ele nascer no vácuo. */
export function spawnPlatformIndex(level: LevelSpec): number {
  return allPlatforms(level).findIndex(
    (p) => leftOf(p) <= level.spawn.x && level.spawn.x <= rightOf(p),
  );
}

/** Índices de todas as plataformas alcançáveis a partir do nascimento. */
export function reachablePlatforms(level: LevelSpec): ReadonlySet<number> {
  const start = spawnPlatformIndex(level);
  if (start === -1) return new Set();

  const platforms = allPlatforms(level);
  const reached = new Set([start]);
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.pop();
    if (current === undefined) continue;

    const from = platforms[current];
    if (!from) continue;

    platforms.forEach((to, index) => {
      if (reached.has(index) || !canReach(from, to)) return;
      reached.add(index);
      queue.push(index);
    });
  }

  return reached;
}

/**
 * Um painel fora de alcance é um jogo travado. Ele precisa estar em cima de uma
 * plataforma que o jogador consegue pisar, e a poucos pixels acima dela.
 */
export function panelIsReachable(level: LevelSpec, panel: { x: number; y: number }): boolean {
  const reached = reachablePlatforms(level);

  return allPlatforms(level).some((platform, index) => {
    if (!reached.has(index)) return false;
    if (panel.x < leftOf(platform) || panel.x > rightOf(platform)) return false;

    const above = topOf(platform) - panel.y;
    return above >= 0 && above <= SAFE_STEP;
  });
}
```

- [ ] **Step 4: Redesenhe a fase**

Substitua o conteúdo de `src/game/levels/level-1-1.ts`:

```ts
import type { LevelSpec } from './reach';

const GROUND_Y = 500;

/**
 * Quintal da Escola, fase de abertura.
 *
 * O buraco entre os dois chãos tem 220 px — mais largo que o pulo mais longo
 * possível (≈202 px). Ele só se atravessa com a ponte, e a ponte só desce com a
 * conta certa. É o loop do jogo inteiro numa fase só.
 *
 * Se você mexer nestes números ou no GAME_FEEL, tests/game/reach.test.ts falha
 * antes de você descobrir jogando.
 */
export const LEVEL_1_1: LevelSpec = {
  spawn: { x: 200, y: GROUND_Y - 140 },
  worldWidth: 1840,
  platforms: [
    // 0: chão inicial — o jogador nasce aqui. 130 … 830
    { x: 480, y: GROUND_Y, width: 700, height: 40 },
    // 1: chão final, do outro lado do buraco. 1050 … 1750
    { x: 1400, y: GROUND_Y, width: 700, height: 40 },
    // degrau
    { x: 1180, y: GROUND_Y - 90, width: 160, height: 24 },
    // ponto alto da fase
    { x: 1440, y: GROUND_Y - 170, width: 160, height: 24 },
  ],
  mechanisms: [
    {
      id: 'ponte-1',
      op: '+',
      tier: 1,
      panel: { x: 760, y: 450 },
      // deitada, fecha exatamente o vão 830 … 1050 no nível do chão
      platform: { x: 940, y: GROUND_Y - 10, width: 220, height: 20 },
    },
  ],
};
```

- [ ] **Step 5: Rode e confirme que passa**

Run: `npm run test -- reach`
Expected: PASS — 10 testes

- [ ] **Step 6: Reescreva a cena**

Substitua o conteúdo de `src/game/scenes/LevelScene.ts`:

```ts
import Phaser from 'phaser';
import { GAME_FEEL, GAME_SIZE } from '@/game/constants';
import { JumpController } from '@/game/systems/JumpController';
import { InputSystem } from '@/game/systems/InputSystem';
import { LEVEL_1_1 } from '@/game/levels/level-1-1';
import type { PlatformSpec } from '@/game/levels/reach';
import { ensureCharacterTexture } from '@/game/art/characterTexture';
import { createBackdrop } from '@/game/art/backdrop';
import { CalcPanel } from '@/game/mechanisms/CalcPanel';
import { Bridge } from '@/game/mechanisms/Bridge';
import { generateQuestion } from '@/game/math/mathEngine';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import { useGameStore } from '@/store/useGameStore';
import { useChallengeStore } from '@/store/useChallengeStore';
import type { ChallengeOutcome } from '@/store/useChallengeStore.types';

export class LevelScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private controls!: InputSystem;
  private readonly jump = new JumpController();
  private readonly panels: CalcPanel[] = [];
  private readonly bridges = new Map<string, Bridge>();
  private unsubscribe: (() => void) | null = null;

  constructor() {
    super('LevelScene');
  }

  create(): void {
    // create() roda de novo em scene.restart(); sem isto os painéis duplicam.
    this.panels.length = 0;
    this.bridges.clear();

    this.cameras.main.setBackgroundColor(PALETTE.sky);
    createBackdrop(this, LEVEL_1_1.worldWidth);

    const platforms = this.physics.add.staticGroup();
    for (const spec of LEVEL_1_1.platforms) this.addPlatform(platforms, spec);

    for (const mechanism of LEVEL_1_1.mechanisms) {
      this.panels.push(new CalcPanel(this, mechanism.id, mechanism.panel.x, mechanism.panel.y));
      this.bridges.set(mechanism.id, new Bridge(this, platforms, mechanism.platform));
    }

    const textureKey = ensureCharacterTexture(this, useGameStore.getState().character);
    const { spawn, worldWidth } = LEVEL_1_1;

    this.player = this.physics.add.sprite(spawn.x, spawn.y, textureKey);
    this.player.setDisplaySize(32, 48);
    this.player.setCollideWorldBounds(false);
    this.physics.add.collider(this.player, platforms);

    this.physics.world.setBounds(0, 0, worldWidth, GAME_SIZE.height);
    this.cameras.main.setBounds(0, 0, worldWidth, GAME_SIZE.height);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setFollowOffset(-80, 0);

    this.controls = new InputSystem(this);
    this.unsubscribe = useChallengeStore.subscribe((state, previous) => {
      if (state.outcome !== null && state.outcome !== previous.outcome) {
        this.applyOutcome(state.outcome);
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.controls.destroy();
      this.unsubscribe?.();
      useChallengeStore.getState().close();
    });
  }

  /** Corpo de terra com capim em cima. Só o corpo entra na colisão. */
  private addPlatform(group: Phaser.Physics.Arcade.StaticGroup, spec: PlatformSpec): void {
    const body = this.add.rectangle(
      spec.x,
      spec.y,
      spec.width,
      spec.height,
      toPhaserColor(PALETTE.dirt),
    );
    group.add(body);

    this.add.rectangle(
      spec.x,
      spec.y - spec.height / 2 + 4,
      spec.width,
      8,
      toPhaserColor(PALETTE.grass),
    );
  }

  private applyOutcome(outcome: ChallengeOutcome): void {
    if (!outcome.correct) {
      this.cameras.main.shake(140, 0.005);
      return;
    }

    this.bridges.get(outcome.source)?.lower();
    for (const panel of this.panels) {
      if (panel.source === outcome.source) panel.markSolved();
    }
    useChallengeStore.getState().close();
  }

  private openChallenge(panel: CalcPanel): void {
    const mechanism = LEVEL_1_1.mechanisms.find((item) => item.id === panel.source);
    if (!mechanism) return;

    useChallengeStore
      .getState()
      .open(mechanism.id, generateQuestion(mechanism.op, mechanism.tier));
  }

  override update(_time: number, delta: number): void {
    const state = this.controls.read();

    // Com a conta aberta o mundo para: o card é do rodapé, mas o foco é dele.
    if (useChallengeStore.getState().challenge !== null) {
      this.player.setVelocityX(0);
      this.controls.endFrame();
      return;
    }

    const nearby = this.panels.filter((panel) =>
      panel.updateProximity(this.player.x, this.player.y),
    );
    const target = nearby[0];
    if (target && state.interactJustPressed) this.openChallenge(target);

    const body = this.player.body;
    const direction = Number(state.right) - Number(state.left);
    this.player.setVelocityX(direction * GAME_FEEL.moveSpeed);

    const command = this.jump.update(
      delta,
      body.blocked.down || body.touching.down,
      { justPressed: state.jumpJustPressed, justReleased: state.jumpJustReleased },
      body.velocity.y,
    );

    if (command.type === 'start') {
      this.player.setVelocityY(GAME_FEEL.jumpVelocity);
    } else if (command.type === 'cut') {
      this.player.setVelocityY(body.velocity.y * GAME_FEEL.jumpCutMultiplier);
    }

    if (this.player.y > GAME_SIZE.height + 200) this.respawn();

    this.controls.endFrame();
  }

  private respawn(): void {
    this.player.setPosition(LEVEL_1_1.spawn.x, LEVEL_1_1.spawn.y);
    this.player.setVelocity(0, 0);
    this.jump.reset();
  }
}
```

`filter` em vez de `find` na varredura dos painéis é de propósito: `find` para
no primeiro que dá `true` e os painéis seguintes nunca escondem o balão.

- [ ] **Step 7: Rode o portão**

Run: `npx tsc -b && npm run lint && npm run test`
Expected: sem erro, 58 testes passando

- [ ] **Step 8: Jogue**

Run: `npm run dev`

Confira, um a um:
- Correndo para a direita, existe um buraco que **não dá para pular** — tentar cair leva ao respawn.
- Antes do buraco há um painel com `?`. Chegando perto, aparece o balão `E` acima dele.
- Apertando `E` (ou `Enter`), o card abre no rodapé com uma conta de soma e 4 opções, e o cenário continua visível atrás.
- O personagem para de andar enquanto o card está aberto.
- Respondendo **errado**: a tela treme de leve, a mesma conta continua, ninguém perde nada. No segundo erro seguido, as fichas douradas aparecem desenhando a conta.
- Respondendo **certo**: o card some, a ponte deita com quique e o `?` do painel vira `✓` dourado.
- Depois da ponte deitar, dá para atravessar o buraco andando por cima dela.
- As teclas `1`–`4` respondem sem precisar do mouse.
- No celular (ou no modo dispositivo do Chrome, em paisagem): tocar o canto superior direito abre a conta; tocar as opções responde.
- O console do navegador está limpo.

- [ ] **Step 9: Commit**

```bash
git add src/game/mechanisms src/game/levels src/game/scenes/LevelScene.ts tests/game/reach.test.ts
git commit -m "feat: painel de calculo e ponte que desce com a conta certa"
```

---

## Ao fim desta fase

O loop do `SPEC.md` seção 3 está fechado pela primeira vez: correr → caminho
bloqueado → painel → responder → mecanismo anima → avançar. A partir daqui o
resto do Mundo 1 é conteúdo, não engenharia.

O que **não** está feito, em ordem de valor:

1. **Mecanismo Blocos** (`SPEC.md` 4, item 2) — respondeu 5, nascem 5 blocos. É o mecanismo que faz professor levantar a sobrancelha, e já tem tudo de que precisa: `ChallengeOutcome.answer` carrega o N.
2. **Dígitos dourados, HUD de estrelas e porta de saída** — fecha a fase 1-1 de ponta a ponta e liga o `completeLevel` que já existe na `useGameStore`.
3. **Checkpoint.**
4. **Corações e o guardião Saci-Pererê** (`SPEC.md` 4b, Fase 5) — inclusive a válvula anti-frustração, que aqui já existe em parte: `wrongStreak` é o mesmo contador.
5. **Áudio.**
