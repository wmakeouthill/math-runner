# Math Runner — Fase 5: variedade, folclore e dificuldade

> **Para quem executa:** implemente uma tarefa por vez, na ordem. Cada tarefa
> termina com teste rodando e commit. Pare no fim de cada tarefa para revisão.

**Goal:** tirar a sensação de que as cinco fases são a mesma fase — cada uma num
cenário brasileiro próprio e mais longa, com os cinco monstros do folclore no
lugar de só o Saci, e um seletor de dificuldade que mexe nas contas e nos
monstros ao mesmo tempo.

**Architecture:** o cenário vira dado (`LevelTheme` no `LevelSpec`) e o
`createBackdrop` passa a desenhar o tema que a fase pedir, em vez do quintal
fixo. Os monstros viram um `kind` do folclore com desenho próprio, e a escada de
blocos para de derivar o tamanho da resposta — quem decide passa a ser a fase.
Nada de asset novo: tudo continua desenhado em runtime com primitivas.

**Tech Stack:** Vite + React 19 + TypeScript strict + Phaser 3.90 + Zustand 5 +
Vitest. **Nenhuma dependência nova.**

**Spec:** `SPEC.md`

## Estado do repositório antes desta fase

Fases 0 a 4 implementadas e commitadas (`43972ce`). Cinco fases jogáveis, som
sintetizado, partículas, comemoração na porta, dificuldade adaptativa por
operação, guardião Saci no modo Aventura, ventania na 1-4 e 1-5, quatro
operações distribuídas. **127 testes, `tsc` limpo, `oxlint` limpo, build ok.**

**Antes de começar, commite o que estiver pendente.** No momento em que este
plano foi escrito havia trabalho não commitado em `Guardian.ts`, `LevelScene.ts`,
`palette.ts` e nos arquivos novos de animação do personagem (`playerPose.ts`,
`wingTexture.ts`, `characterAnims.ts`). A Tarefa 0 reescreve o `create()` da
`LevelScene` e a Tarefa 3 reescreve o construtor do `Guardian` — começar com
essas mudanças soltas na árvore mistura os dois trabalhos num diff só e você
perde a chance de reverter um sem o outro.

O plano já contempla esse trabalho: o Saci desenhado ali é o que a Tarefa 3
copia para o `folklore.ts`, e `PALETTE.saci` já existe — não crie um segundo
vermelho para ele.

Existe uma dívida conhecida: `src/game/scenes/LevelScene.ts` está com 359 linhas
(o teto do projeto é 200) e a montagem do mundo mora toda no `create()`.
**A Tarefa 0 resolve isso antes de qualquer coisa** — este plano acrescenta
mecanismo, monstro e tema à cena, e mexer numa cena de 359 linhas é como o bug
entra.

## Global Constraints

- **Nenhum trailer de coautoria** em commit, comentário ou README. Nada de
  `Co-Authored-By`, nada de "Generated with". O trabalho é do Junior e da Ana.
- **Sem backend, sem banco, sem login.** Só `localStorage`.
- **Nenhuma dependência nova.** Todo cenário e todo monstro é primitiva do
  Phaser desenhada em runtime — sem tileset, sem sprite baixado, sem CDN.
- **Toda cor sai de `src/theme/palette.ts`.** Nunca escreva hex à mão fora dali.
- Comentários e mensagens de commit **em português**, sem acento na mensagem de
  commit.
- **`npm run lint` está quebrado neste ambiente.** Use `npx oxlint src tests`.
- **Não mexa em `GAME_FEEL`.** `SAFE_STEP`, `SAFE_GAP`, `FLIGHT_STEP` e
  `FLIGHT_GAP` saem dele, e as cinco fases foram desenhadas contra esses
  números.
- **Não relaxe `tests/game/reach.test.ts` para uma fase passar.** Se ele
  reprovar, quem está errada é a geometria da fase.
- TypeScript strict com `noUncheckedIndexedAccess` e `erasableSyntaxOnly`:
  todo acesso por índice pode ser `undefined`, e **não existe** parameter
  property (`constructor(private x: number)` não compila).
- Toda UI é React. O canvas do Phaser desenha só o mundo do jogo.

---

### Task 0: Tirar a montagem do mundo de dentro da cena

Dívida antes de dívida nova. `LevelScene.create()` monta painéis, pontes,
blocos, ventanias, guardiões, dígitos e bandeiras — e este plano vai
acrescentar monstro novo e tema. **Refatoração pura: nenhum teste muda.** Se
algum teste precisar de ajuste, o corte saiu do lugar errado.

**Files:**
- Create: `src/game/scenes/buildLevel.ts`
- Modify: `src/game/scenes/LevelScene.ts`

**Interfaces:**
- Produz: `buildLevel(scene, level, mode): LevelParts`

- [ ] **Step 1: Escreva o módulo de montagem**

`src/game/scenes/buildLevel.ts`:

```ts
import type Phaser from 'phaser';
import type { LevelSpec } from '@/game/levels/reach';
import type { GameMode } from '@/store/useGameStore.types';
import { CalcPanel } from '@/game/mechanisms/CalcPanel';
import { Bridge } from '@/game/mechanisms/Bridge';
import { Blocks } from '@/game/mechanisms/Blocks';
import { Whirlwind } from '@/game/mechanisms/Whirlwind';
import { Guardian } from '@/game/mechanisms/Guardian';
import { GoldenDigit } from '@/game/mechanisms/GoldenDigit';
import { Checkpoint } from '@/game/mechanisms/Checkpoint';

/** Tudo que a fase põe no mundo. A cena guarda isto e cuida do resto. */
export type LevelParts = {
  panels: CalcPanel[];
  bridges: Map<string, Bridge>;
  blocks: Map<string, Blocks>;
  winds: Map<string, Whirlwind>;
  guardians: Map<string, Guardian>;
  digits: GoldenDigit[];
  flags: Checkpoint[];
};

/**
 * Monta o mundo da fase. Só construção: nada aqui lê input, roda tween de
 * resultado ou fala com store — isso é da cena.
 */
export function buildLevel(
  scene: Phaser.Scene,
  level: LevelSpec,
  mode: GameMode,
  platforms: Phaser.Physics.Arcade.StaticGroup,
): LevelParts {
  const parts: LevelParts = {
    panels: [],
    bridges: new Map(),
    blocks: new Map(),
    winds: new Map(),
    guardians: new Map(),
    digits: [],
    flags: [],
  };

  for (const mechanism of level.mechanisms) {
    parts.panels.push(
      new CalcPanel(scene, mechanism.panel, mechanism.id, mechanism.kind === 'porta' ? 'porta' : 'painel'),
    );

    switch (mechanism.kind) {
      case 'ponte':
        parts.bridges.set(mechanism.id, new Bridge(scene, mechanism.platform, platforms));
        break;
      case 'blocos':
        parts.blocks.set(mechanism.id, new Blocks(scene, mechanism.origin, platforms));
        break;
      case 'ventania':
        parts.winds.set(mechanism.id, new Whirlwind(scene, mechanism.origin));
        break;
      case 'porta':
        break;
    }
  }

  // Guardiões só existem no modo Aventura — é o botão da tela de título.
  if (mode === 'aventura') {
    for (const spec of level.guardians) {
      parts.guardians.set(spec.id, new Guardian(scene, spec.id, spec.at));
    }
  }

  for (const at of level.digits) parts.digits.push(new GoldenDigit(scene, at));
  for (const at of level.checkpoints) parts.flags.push(new Checkpoint(scene, at));

  return parts;
}
```

> **Ajuste as assinaturas dos construtores para as que já existem no seu
> código.** O corte é o que importa, não a ordem dos argumentos: se o `Bridge`
> de hoje recebe outra coisa, passe o que ele recebe. Não mude construtor
> nenhum nesta tarefa.

- [ ] **Step 2: Use na cena**

Em `LevelScene.create()`, troque todo o bloco de montagem por:

```ts
    const parts = buildLevel(this, this.level, useGameStore.getState().mode, this.platforms);
    this.panels = parts.panels;
    this.bridges = parts.bridges;
    this.blocks = parts.blocks;
    this.winds = parts.winds;
    this.guardians = parts.guardians;
    this.digits = parts.digits;
    this.flags = parts.flags;
```

Os campos deixam de ser `readonly ... = new Map()` e passam a ser atribuídos
aqui — troque as declarações para `private panels: CalcPanel[] = [];` e
`private bridges = new Map<string, Bridge>();` e assim por diante. O `clear()`
de cada um no começo do `create()` sai: a atribuição já substitui tudo.

- [ ] **Step 3: Prove que nada mudou**

```bash
npx tsc -b
npx oxlint src tests
npx vitest run
wc -l src/game/scenes/LevelScene.ts
```

Esperado: 127 testes passando, **nenhum teste alterado**, e `LevelScene` abaixo
de 260 linhas.

Abra a 1-5 (`npm run dev`) e confirme que ainda aparecem os quatro mecanismos,
os dois guardiões (modo Aventura) e os seis números dourados. É a fase que
exercita tudo de uma vez.

- [ ] **Step 4: Commit**

```bash
git add src/game/scenes
git commit -m "refactor: montagem do mundo sai da cena para buildLevel"
```

---

### Task 1: A escada de blocos passa a ser do tamanho do vão

Hoje a escada cresce um bloco por unidade da resposta, com teto de 8. É por isso
que ela fica desproporcional: uma resposta 17 constrói 8 degraus (320 px de
altura, 352 px de largura) onde o vão precisava de 3. E é por isso que blocos só
aceita `+` — com `−` a resposta pode ser 0 e a fase trava.

**A fase passa a declarar quantos degraus precisa.** A conta certa dispara a
escada, exatamente como já dispara a ponte e a porta. Isso resolve três coisas
de uma vez: o tamanho fica previsível, a escada aceita as quatro operações, e
somem `MAX_BLOCK_STEPS` e a regra do `MIN_ANSWER`.

**Files:**
- Modify: `src/game/levels/reach.ts`
- Modify: `src/game/mechanisms/Blocks.ts`
- Modify: `src/game/scenes/LevelScene.ts`
- Modify: `src/game/math/mathEngine.ts`
- Modify: `src/game/levels/level-1-2.ts`, `level-1-3.ts`, `level-1-5.ts`
- Test: `tests/game/reach.test.ts`, `tests/game/mathEngine.test.ts`

**Interfaces:**
- Produz: `{ kind: 'blocos'; origin: Point; steps: number }`, `BLOCK_STEPS`.
- Some: `MAX_BLOCK_STEPS`, `MIN_ANSWER`.

- [ ] **Step 1: Escreva os testes que falham**

Em `tests/game/reach.test.ts`, **substitua** os blocos `describe('teto da escada
de blocos', …)` e `describe.each(LEVEL_ORDER)('fase $id — blocos', …)` por:

```ts
describe('escada do tamanho do vão', () => {
  it('a escada tem exatamente os degraus que a fase pediu', () => {
    expect(blockStair({ x: 0, y: 500 }, 3)).toHaveLength(3);
    expect(blockStair({ x: 0, y: 500 }, 2)).toHaveLength(2);
  });

  it('cada degrau continua pulável', () => {
    expect(BLOCK.stepY).toBeLessThanOrEqual(SAFE_STEP);
    expect(BLOCK.stepX - BLOCK.size).toBeLessThanOrEqual(SAFE_GAP);
  });
});

describe.each(LEVEL_ORDER)('fase $id — blocos', (level: LevelSpec) => {
  /**
   * Escada curta demais não sobe; comprida demais atravessa a fase. Duas a
   * quatro é a faixa que o level design usa e que a fase reserva espaço para.
   */
  it('toda escada declara entre 2 e 4 degraus', () => {
    for (const mechanism of level.mechanisms) {
      if (mechanism.kind !== 'blocos') continue;
      expect(mechanism.steps).toBeGreaterThanOrEqual(BLOCK_STEPS.min);
      expect(mechanism.steps).toBeLessThanOrEqual(BLOCK_STEPS.max);
    }
  });
});
```

Em `tests/game/mathEngine.test.ts`, **apague** o teste que checa `MIN_ANSWER`
sobre mil contas. Ele existia só para proteger a escada e agora não protege nada.

- [ ] **Step 2: Rode e veja falhar**

```bash
npx vitest run tests/game/reach.test.ts
```

Esperado: FAIL — `BLOCK_STEPS` não existe e `mechanism.steps` não existe.

- [ ] **Step 3: Mude o tipo e a escada**

Em `src/game/levels/reach.ts`:

```ts
/** Faixa de degraus que uma escada de blocos pode ter. */
export const BLOCK_STEPS = { min: 2, max: 4 } as const;
```

**Apague** `MAX_BLOCK_STEPS` e o `Math.min(count, MAX_BLOCK_STEPS)` de dentro do
`blockStair` — o `count` volta a ser usado direto:

```ts
export function blockStair(origin: Point, count: number): PlatformSpec[] {
  const steps: PlatformSpec[] = [];
  for (let i = 0; i < count; i += 1) {
```

No `MechanismEffect`, o caso de blocos ganha o tamanho:

```ts
  | { kind: 'blocos'; origin: Point; steps: number }
```

e em `mechanismPlatforms`, o teste de alcance passa a medir a escada de verdade,
não mais o pior caso da conta:

```ts
    case 'blocos': return blockStair(mechanism.origin, mechanism.steps);
```

Em `src/game/math/mathEngine.ts`, **apague** o `MIN_ANSWER` e o comentário dele.
Nada mais o usa.

- [ ] **Step 4: A escada do jogo usa o mesmo número**

Em `src/game/scenes/LevelScene.ts`, no `applyOutcome`, o caso de blocos deixa de
passar a resposta:

```ts
      case 'blocos':
        playSfx('blocos');
        this.blocks.get(mechanism.id)?.raise(mechanism.steps);
        break;
```

Em `src/game/mechanisms/Blocks.ts` nada muda — `raise(count)` já constrói o que
recebe.

- [ ] **Step 5: Declare os degraus nas fases, e solte as operações**

`level-1-2.ts` — o comentário no topo do arquivo explica a regra velha ("cada
unidade da resposta vira um degrau… até a menor resposta possível (2, no `+`)").
Reescreva:

```ts
/**
 * Recreio no Pátio: aqui entra a escada de blocos.
 *
 * O terraço está 150 px acima do chão e o pulo alcança 136 — não tem como
 * subir sem os blocos. A fase pede dois degraus: eles põem o jogador 80 px
 * acima do chão e o pulo cobre os 70 que faltam. Quem decide o tamanho é a
 * fase, não a resposta: escada derivada do resultado saía desproporcional e
 * prendia o mecanismo à soma.
 */
```

e `blocos-1` ganha `steps: 2`:

```ts
    {
      kind: 'blocos',
      id: 'blocos-1',
      op: '*',
      tier: 1,
      steps: 2,
      panel: { x: 700, y: 450 },
      origin: { x: 860, y: GROUND_Y - 20 },
    },
```

`level-1-3.ts` — `blocos-1-3` ganha `steps: 3` e `op: '/'`, `tier: 1`.

`level-1-5.ts` — `blocos-1-5` ganha `steps: 2` e continua `op: '+'`, `tier: 2`.

> Agora que a escada não depende da resposta, `×` e `÷` podem acionar blocos.
> Isso sozinho já tira a repetição: a 1-2 deixa de ser "duas contas de somar".

- [ ] **Step 6: Rode e comite**

```bash
npx tsc -b
npx oxlint src tests
npx vitest run
git add src/game tests/game
git commit -m "feat: a fase declara o tamanho da escada e blocos aceita as quatro operacoes"
```

---

### Task 2: Dificuldade fácil, médio e difícil

Um botão na tela de título que mexe em três coisas ao mesmo tempo: o nível das
contas, quantos corações o jogador tem e quantos monstros aparecem.

Isso convive com a dificuldade adaptativa da Fase 4 sem brigar: a adaptativa
mede **o aluno**, esta mede **a escolha dele**. O nível efetivo é o maior entre
o que a fase pede e o que o aluno já domina, mais o deslocamento da dificuldade.

**Files:**
- Create: `src/game/math/difficulty.ts`
- Modify: `src/store/useGameStore.types.ts`, `src/store/useGameStore.ts`
- Modify: `src/store/useRunStore.ts`
- Modify: `src/app/Title/Title.tsx`
- Modify: `src/game/levels/reach.ts`
- Modify: `src/game/scenes/LevelScene.ts`, `src/game/scenes/buildLevel.ts`
- Test: `tests/game/difficulty.test.ts`

**Interfaces:**
- Produz: `Difficulty`, `DIFFICULTY`, `effectiveTier(base, player, difficulty)`,
  `guardianShows(from, current)`, `useGameStore().difficulty`, `setDifficulty`.

- [ ] **Step 1: Escreva o teste que falha**

`tests/game/difficulty.test.ts`:

```ts
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
```

- [ ] **Step 2: Rode e veja falhar**

```bash
npx vitest run tests/game/difficulty.test.ts
```

- [ ] **Step 3: Escreva a regra**

`src/game/math/difficulty.ts`:

```ts
import type { Tier } from './mathEngine.types';

export type Difficulty = 'facil' | 'medio' | 'dificil';

/** Do mais leve ao mais pesado. A ordem é o que decide quem aparece quando. */
export const DIFFICULTY_ORDER: readonly Difficulty[] = ['facil', 'medio', 'dificil'];

export const DIFFICULTY: Record<
  Difficulty,
  { label: string; hint: string; tierOffset: number; hearts: number }
> = {
  facil: {
    label: 'Fácil',
    hint: 'Contas do tamanho da fase, 3 corações',
    tierOffset: 0,
    hearts: 3,
  },
  medio: {
    label: 'Médio',
    hint: 'Contas um nível acima e mais monstros',
    tierOffset: 1,
    hearts: 3,
  },
  dificil: {
    label: 'Difícil',
    hint: 'Contas dois níveis acima, todos os monstros, 2 corações',
    tierOffset: 2,
    hearts: 2,
  },
};

/**
 * O nível da conta que vai aparecer.
 *
 * `base` é o que a fase pede, `player` é onde o aluno chegou sozinho naquela
 * operação, e a dificuldade escolhida desloca os dois. O maior entre fase e
 * aluno, e nunca fora de 1..3.
 */
export function effectiveTier(base: Tier, player: Tier, difficulty: Difficulty): Tier {
  const raw = Math.max(base, player) + DIFFICULTY[difficulty].tierOffset;
  return Math.min(3, Math.max(1, raw)) as Tier;
}

/** Este monstro aparece na dificuldade escolhida? */
export function guardianShows(from: Difficulty | undefined, current: Difficulty): boolean {
  return DIFFICULTY_ORDER.indexOf(current) >= DIFFICULTY_ORDER.indexOf(from ?? 'facil');
}
```

- [ ] **Step 4: Guarde a escolha**

Em `src/store/useGameStore.types.ts`:

```ts
import type { Difficulty } from '@/game/math/difficulty';
```

e dentro de `GameState`:

```ts
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
```

Em `src/store/useGameStore.ts`, no objeto do `create`:

```ts
      difficulty: 'facil',
      setDifficulty: (difficulty) => set({ difficulty }),
```

e no `partialize`, acrescente `difficulty: state.difficulty,`.

- [ ] **Step 5: Os corações seguem a dificuldade**

Em `src/store/useRunStore.ts`, `MAX_HEARTS` deixa de ser o número fixo e passa a
ser o teto do fácil. No `begin`, troque `hearts: MAX_HEARTS` por:

```ts
      hearts: DIFFICULTY[useGameStore.getState().difficulty].hearts,
```

e em `refillHearts`, a mesma expressão. `MAX_HEARTS` continua exportado como
`DIFFICULTY.facil.hearts` — o HUD usa para desenhar os corações apagados.

- [ ] **Step 6: Botão na tela de título**

Em `src/app/Title/Title.tsx`, acrescente a lista e o bloco, no mesmo formato dos
outros dois grupos de `OptionCard`:

```tsx
const DIFFICULTIES = DIFFICULTY_ORDER.map((id) => ({
  id,
  label: DIFFICULTY[id].label,
  hint: DIFFICULTY[id].hint,
}));
```

```tsx
  const difficulty = useGameStore((state) => state.difficulty);
  const setDifficulty = useGameStore((state) => state.setDifficulty);
```

```tsx
        <p style={styles.label}>DIFICULDADE</p>
        <div style={styles.row}>
          {DIFFICULTIES.map((option) => (
            <OptionCard
              key={option.id}
              selected={difficulty === option.id}
              label={option.label}
              hint={option.hint}
              onSelect={() => setDifficulty(option.id)}
            />
          ))}
        </div>
```

- [ ] **Step 7: A conta e os monstros obedecem**

Em `src/game/levels/reach.ts`, o `GuardianSpec` ganha a exigência:

```ts
  /** A partir de qual dificuldade este monstro aparece. Sem isto, sempre. */
  from?: Difficulty;
```

Em `src/game/scenes/buildLevel.ts`, o laço dos guardiões filtra:

```ts
  if (mode === 'aventura') {
    for (const spec of level.guardians) {
      if (!guardianShows(spec.from, difficulty)) continue;
      parts.guardians.set(spec.id, new Guardian(scene, spec.id, spec.at));
    }
  }
```

(acrescente `difficulty: Difficulty` aos parâmetros do `buildLevel` e passe
`useGameStore.getState().difficulty` na chamada.)

Em `LevelScene`, **os dois lugares** que hoje fazem
`Math.max(spec.tier, playerTier[spec.op]) as Tier` — o `openChallenge` e o laço
dos guardiões no `update` — passam a usar:

```ts
    const { playerTier, difficulty } = useGameStore.getState();
    const tier = effectiveTier(mechanism.tier, playerTier[mechanism.op], difficulty);
```

- [ ] **Step 8: Rode e comite**

```bash
npx tsc -b
npx oxlint src tests
npx vitest run
git add src tests
git commit -m "feat: dificuldade facil, medio e dificil mexe nas contas e nos monstros"
```

---

### Task 3: O folclore inteiro, não só o Saci

A SPEC 4b prevê cinco: Saci `+`, Cuca `−`, Boitatá `×`, Boto `÷` e o Curupira
como chefe. Hoje o `Guardian` desenha Saci e nada mais, então todo monstro do
jogo é o mesmo monstro.

**Files:**
- Create: `src/game/art/folklore.ts`
- Modify: `src/theme/palette.ts`
- Modify: `src/game/mechanisms/Guardian.ts`
- Modify: `src/game/levels/reach.ts`
- Modify: `src/game/levels/level-1-2.ts` … `level-1-5.ts`
- Modify: `src/game/scenes/buildLevel.ts`
- Test: `tests/game/folklore.test.ts`

**Interfaces:**
- Produz: `FolkKind`, `FOLK_OP`, `drawFolk(scene, kind)`,
  `GuardianSpec.kind: FolkKind`, `new Guardian(scene, id, at, kind)`.

- [ ] **Step 1: Cores do folclore**

Em `src/theme/palette.ts`, acrescente ao objeto `PALETTE`. **O vermelho do Saci
já existe como `saci` — não crie outro.**

```ts
  // Folclore (SPEC 4b)
  cucaGreen: '#6f9c3a',
  cucaHair: '#e8b23a',
  boitataFire: '#ff7a2f',
  boitataGlow: '#ffd166',
  botoPink: '#f08fb0',
  curupiraHair: '#e4472c',
  curupiraSkin: '#b5763f',
```

- [ ] **Step 2: Escreva o teste que falha**

`tests/game/folklore.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { FOLK_KINDS, FOLK_OP } from '@/game/art/folklore';
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
```

- [ ] **Step 3: Rode e veja falhar**

```bash
npx vitest run tests/game/folklore.test.ts
```

- [ ] **Step 4: Desenhe os cinco**

`src/game/art/folklore.ts`:

```ts
import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import type { Op } from '@/game/math/mathEngine.types';

export type FolkKind = 'saci' | 'cuca' | 'boitata' | 'boto' | 'curupira';

export const FOLK_KINDS: readonly FolkKind[] = [
  'saci',
  'cuca',
  'boitata',
  'boto',
  'curupira',
];

/** A conta que cada um cobra (SPEC 4b). O Curupira cobra as quatro. */
export const FOLK_OP: Record<Exclude<FolkKind, 'curupira'>, Op> = {
  saci: '+',
  cuca: '-',
  boitata: '*',
  boto: '/',
};

export const FOLK_NAME: Record<FolkKind, string> = {
  saci: 'Saci-Pererê',
  cuca: 'Cuca',
  boitata: 'Boitatá',
  boto: 'Boto-cor-de-rosa',
  curupira: 'Curupira',
};

const cor = toPhaserColor;

/**
 * Um monstro montado: a poeira que fica no chão e a figura que flutua.
 *
 * A separação existe porque as duas animam diferente — a figura sobe e desce,
 * a poeira gira e estica. É a estrutura que o Saci já usa.
 */
export type FolkArt = {
  dust: Phaser.GameObjects.GameObject[];
  figure: Phaser.GameObjects.Container;
};

/** Cada monstro em primitivas do Phaser. Nenhum arquivo de imagem. */
export function drawFolk(scene: Phaser.Scene, kind: FolkKind): FolkArt {
  switch (kind) {
    case 'saci': {
      // Este é o Saci que já está no jogo — copiado do Guardian.ts atual,
      // shape por shape. Não redesenhe: ele já foi ajustado à mão.
      const foot = scene.add.ellipse(3, 20, 16, 7, cor(PALETTE.night));
      const leg = scene.add.rectangle(0, 10, 8, 18, cor(PALETTE.night));
      const torso = scene.add.ellipse(0, -6, 26, 30, cor(PALETTE.hairJunior));
      const head = scene.add.circle(0, -24, 11, cor(PALETTE.skinAna));
      const eyeL = scene.add.rectangle(-4, -26, 3, 3, cor(PALETTE.night));
      const eyeR = scene.add.rectangle(4, -26, 3, 3, cor(PALETTE.night));
      const smile = scene.add.rectangle(0, -20, 7, 2, cor(PALETTE.night));
      const cap = scene.add.triangle(1, -36, 0, 18, 16, -8, 28, 18, cor(PALETTE.saci));
      const pompom = scene.add.circle(16, -46, 5, cor(PALETTE.shirt));
      const pipe = scene.add.rectangle(13, -18, 11, 3, cor(PALETTE.wall));
      const bowl = scene.add.circle(19, -18, 3, cor(PALETTE.steel));

      return {
        dust: [
          scene.add.ellipse(0, 20, 52, 16, cor(PALETTE.faint), 0.5),
          scene.add.ellipse(0, 22, 34, 10, cor(PALETTE.dirt), 0.55),
        ],
        figure: scene.add.container(0, 0, [
          leg, foot, torso, head, eyeL, eyeR, smile, cap, pompom, pipe, bowl,
        ]),
      };
    }

    case 'cuca': {
      const corpo = scene.add.ellipse(0, -2, 34, 40, cor(PALETTE.cucaGreen));
      const focinho = scene.add.rectangle(16, -6, 26, 12, cor(PALETTE.cucaGreen));
      const dente = scene.add.triangle(22, -1, 0, -4, 5, -4, 2, 3, cor(PALETTE.shirt));
      const cabelo = scene.add.ellipse(-6, -30, 40, 22, cor(PALETTE.cucaHair));
      const olhoL = scene.add.circle(8, -18, 4, cor(PALETTE.ink));
      const olhoR = scene.add.circle(19, -18, 4, cor(PALETTE.ink));
      const garra = scene.add.rectangle(-16, 12, 10, 6, cor(PALETTE.cucaGreen));

      return {
        dust: [scene.add.ellipse(0, 20, 48, 14, cor(PALETTE.cucaGreen), 0.35)],
        figure: scene.add.container(0, 0, [corpo, garra, focinho, dente, cabelo, olhoL, olhoR]),
      };
    }

    case 'boitata': {
      // cobra de fogo: três anéis subindo, a cabeça no topo
      const anelA = scene.add.ellipse(-14, 8, 30, 18, cor(PALETTE.boitataFire));
      const anelB = scene.add.ellipse(4, -6, 30, 18, cor(PALETTE.boitataFire));
      const cabeca = scene.add.ellipse(18, -22, 28, 17, cor(PALETTE.boitataFire));
      const chama = scene.add.triangle(18, -36, 0, 10, 7, -10, 14, 10, cor(PALETTE.boitataGlow));
      const olho = scene.add.circle(26, -24, 3.5, cor(PALETTE.ink));

      return {
        dust: [scene.add.ellipse(0, 20, 60, 18, cor(PALETTE.boitataGlow), 0.4)],
        figure: scene.add.container(0, 0, [anelA, anelB, cabeca, chama, olho]),
      };
    }

    case 'boto': {
      const corpo = scene.add.ellipse(0, -4, 46, 26, cor(PALETTE.botoPink));
      const bico = scene.add.triangle(26, -2, 0, -5, 18, 0, 0, 5, cor(PALETTE.botoPink));
      const nadadeira = scene.add.triangle(-4, -20, 0, 8, 9, -9, 18, 8, cor(PALETTE.botoPink));
      const aba = scene.add.rectangle(-4, -24, 32, 5, cor(PALETTE.wall));
      const copa = scene.add.rectangle(-4, -32, 18, 13, cor(PALETTE.wall));
      const olho = scene.add.circle(12, -7, 3, cor(PALETTE.ink));

      return {
        dust: [scene.add.ellipse(0, 20, 52, 14, cor(PALETTE.cyan), 0.3)],
        figure: scene.add.container(0, 0, [nadadeira, corpo, bico, aba, copa, olho]),
      };
    }

    case 'curupira': {
      // pés virados para trás — é a marca dele na lenda
      const peL = scene.add.triangle(-11, 20, 0, 0, 17, 0, 17, -8, cor(PALETTE.curupiraSkin));
      const peR = scene.add.triangle(11, 20, 0, 0, -17, 0, -17, -8, cor(PALETTE.curupiraSkin));
      const corpo = scene.add.ellipse(0, -2, 32, 42, cor(PALETTE.curupiraSkin));
      const cabelo = scene.add.circle(0, -32, 21, cor(PALETTE.curupiraHair));
      const rosto = scene.add.circle(0, -26, 12, cor(PALETTE.curupiraSkin));
      const olhoL = scene.add.circle(-5, -28, 3, cor(PALETTE.ink));
      const olhoR = scene.add.circle(5, -28, 3, cor(PALETTE.ink));

      return {
        dust: [scene.add.ellipse(0, 22, 62, 16, cor(PALETTE.grassDark), 0.45)],
        figure: scene.add.container(0, 0, [peL, peR, corpo, cabelo, rosto, olhoL, olhoR]),
      };
    }
  }
}
```

> O Curupira é o chefe. O Step 5 o deixa maior que os outros com
> `figure.setScale(1.35)`, para dar de cara que ele é diferente.

- [ ] **Step 5: O guardião passa a saber quem é**

Em `src/game/mechanisms/Guardian.ts`, o construtor ganha o `kind` e passa a
pegar o desenho do `folklore.ts` em vez de montar o Saci na mão. **Só o bloco
das primitivas sai** — as três tweens continuam, exatamente como estão hoje,
porque `dust[0]`, `dust[1]` e `figure` são os mesmos alvos que `dustA`, `dustB`
e `figure` eram.

Troque o comentário do topo da classe por:

```ts
/**
 * Monstro do folclore que cobra uma conta. Não persegue — fica no lugar e
 * pergunta para quem chega perto. Guardião que corre atrás vira jogo de
 * reflexo, e o jogo é de conta.
 */
```

e o corpo do construtor por:

```ts
  readonly kind: FolkKind;

  constructor(scene: Phaser.Scene, id: string, at: Point, kind: FolkKind) {
    this.scene = scene;
    this.id = id;
    this.at = at;
    this.kind = kind;

    const { dust, figure } = drawFolk(scene, kind);
    // O chefe é maior que os outros — dá para ver de longe que ele é diferente.
    if (kind === 'curupira') figure.setScale(1.35);

    this.body = scene.add.container(at.x, at.y, [...dust, figure]);
    this.body.setDepth(1);

    scene.tweens.add({
      targets: figure,
      y: -6,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    if (dust[0]) {
      scene.tweens.add({
        targets: dust[0],
        scaleX: 1.3,
        angle: 180,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
    if (dust[1]) {
      scene.tweens.add({
        targets: dust[1],
        scaleX: 0.7,
        duration: 480,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
```

`isBlocking` e `defeat` não mudam. No `taunt`, o comentário diz "o Saci
rodopia" — troque por "o monstro rodopia comemorando".

Em `src/game/levels/reach.ts`, o `GuardianSpec` ganha `kind: FolkKind;`.
Em `buildLevel.ts`, passe: `new Guardian(scene, spec.id, spec.at, spec.kind)`.

- [ ] **Step 6: Espalhe os monstros pelas fases**

Cada guardião passa a declarar `kind`, e a `op` tem que bater com o folclore
dele — é o que o teste do Step 2 cobra.

`level-1-2.ts`:

```ts
  guardians: [{ id: 'saci-1-2', kind: 'saci', at: { x: 1450, y: 300 }, op: '+', tier: 1 }],
```

`level-1-3.ts`:

```ts
  guardians: [
    // saiu de 1300: lá ele ficava em cima do painel dos blocos, os dois
    // desenhados no mesmo ponto. 1420 ainda está no chão do meio (1000 … 1500).
    { id: 'boitata-1-3', kind: 'boitata', at: { x: 1420, y: 450 }, op: '*', tier: 1 },
    { id: 'boto-1-3', kind: 'boto', at: { x: 2100, y: 300 }, op: '/', tier: 1, from: 'medio' },
  ],
```

`level-1-4.ts`:

```ts
  guardians: [
    { id: 'cuca-1-4', kind: 'cuca', at: { x: 1500, y: 450 }, op: '-', tier: 1 },
    { id: 'saci-1-4', kind: 'saci', at: { x: 2400, y: 170 }, op: '+', tier: 2, from: 'medio' },
    { id: 'boitata-1-4', kind: 'boitata', at: { x: 2900, y: 450 }, op: '*', tier: 2, from: 'dificil' },
  ],
```

`level-1-5.ts`:

```ts
  guardians: [
    { id: 'cuca-1-5', kind: 'cuca', at: { x: 1300, y: 300 }, op: '-', tier: 2 },
    { id: 'boto-1-5', kind: 'boto', at: { x: 2200, y: 300 }, op: '/', tier: 2, from: 'medio' },
    { id: 'boitata-1-5', kind: 'boitata', at: { x: 3400, y: 450 }, op: '*', tier: 2, from: 'medio' },
  ],
```

> Repare no `from`: no fácil o aluno encontra um monstro por fase, no médio dois
> e no difícil três. É a dificuldade mexendo na quantidade, como a Tarefa 2
> prometeu.

- [ ] **Step 7: Rode**

```bash
npx tsc -b
npx oxlint src tests
npx vitest run
```

**O teste de alcance vai reclamar se algum monstro novo ficou fora de alcance.**
Se reclamar, mova o monstro — não o teste. `boitata-1-4` em `{x: 2900, y: 430}`
fica no chão final da 1-4; `saci-1-4` em `{x: 2400, y: 170}` fica na laje alta.

- [ ] **Step 8: Commit**

```bash
git add src tests
git commit -m "feat: cuca, boitata e boto entram no jogo com a conta de cada um"
```

---

### Task 4: Curupira, o chefe do Mundo 1

O guardião comum cobra uma conta. O chefe cobra **três seguidas**, uma de cada
operação que a fase ensinou. Errar não zera o progresso — custa um coração e a
mesma pergunta volta. É o fecho do Mundo 1.

**Files:**
- Modify: `src/game/mechanisms/Guardian.ts`
- Modify: `src/game/levels/reach.ts`, `src/game/levels/level-1-5.ts`
- Modify: `src/game/scenes/LevelScene.ts`
- Test: `tests/game/folklore.test.ts`

- [ ] **Step 1: Escreva o teste que falha**

Em `tests/game/folklore.test.ts`:

```ts
import { BOSS_ROUNDS } from '@/game/art/folklore';

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
```

- [ ] **Step 2: Rode e veja falhar**

```bash
npx vitest run tests/game/folklore.test.ts
```

- [ ] **Step 3: Quantas rodadas o chefe cobra**

Em `src/game/art/folklore.ts`:

```ts
/** Contas seguidas que o chefe cobra antes de ser derrotado. */
export const BOSS_ROUNDS = 3;
```

- [ ] **Step 4: O guardião conta as rodadas**

Em `src/game/mechanisms/Guardian.ts`, acrescente:

```ts
  private rounds: number;
```

no construtor, depois do `this.kind = kind;`:

```ts
    this.rounds = kind === 'curupira' ? BOSS_ROUNDS : 1;
```

e o método que a cena usa para saber se acabou:

```ts
  /** Uma conta certa a menos. Devolve true quando o monstro cai de vez. */
  scoreRound(): boolean {
    this.rounds = Math.max(0, this.rounds - 1);
    return this.rounds === 0;
  }

  /** Quantas contas ainda faltam. O HUD do chefe mostra isso. */
  get roundsLeft(): number {
    return this.rounds;
  }
```

- [ ] **Step 5: A cena reabre a conta enquanto o chefe estiver de pé**

Em `LevelScene.applyOutcome`, dentro do ramo do guardião, o caso do acerto:

```ts
      if (outcome.correct) {
        playSfx('certo');
        useChallengeStore.getState().close();

        if (!guardian.scoreRound()) {
          // Chefe ainda de pé: a próxima conta vem na hora, sem sair do lugar.
          burst(this, guardian.at.x, guardian.at.y - 20, toPhaserColor(PALETTE.gold), 10);
          this.time.delayedCall(420, () => this.askGuardian(guardian.id));
          return;
        }

        guardian.defeat();
        burst(this, guardian.at.x, guardian.at.y, toPhaserColor(PALETTE.cyan), 24);
        return;
      }
```

e extraia o que hoje está no laço do `update` para um método, que os dois lados
passam a chamar:

```ts
  /** Abre a conta de um monstro. O chefe sorteia a operação a cada rodada. */
  private askGuardian(id: string): void {
    const spec = this.level.guardians.find((item) => item.id === id);
    if (!spec) return;

    const { playerTier, difficulty } = useGameStore.getState();
    // O Curupira cobra as quatro operações; o resto cobra a sua.
    const op = spec.kind === 'curupira' ? pickOp(this.level) : spec.op;
    const tier = effectiveTier(spec.tier, playerTier[op], difficulty);

    useChallengeStore.getState().open(spec.id, generateQuestion(op, tier));
  }
```

com, no topo do arquivo:

```ts
/** As operações que a fase usa. O chefe cobra do que a fase ensinou. */
function pickOp(level: LevelSpec): Op {
  const ops = [...new Set(level.mechanisms.map((m) => m.op))];
  return ops[Math.floor(Math.random() * ops.length)] ?? '+';
}
```

No laço do `update`, o corpo vira `this.askGuardian(guardian.id); break;`.

- [ ] **Step 6: Ponha o chefe na 1-5**

Em `level-1-5.ts`, acrescente ao fim de `guardians`:

```ts
    { id: 'curupira-1-5', kind: 'curupira', at: { x: 3700, y: 450 }, op: '+', tier: 2 },
```

(o `op` fica como valor de reserva — o chefe sorteia a cada rodada.)

Ajuste o teste do Step 2 da Tarefa 3 para pular o Curupira na conferência de
`FOLK_OP` — ele já foi escrito assim (`if (guardian.kind === 'curupira') continue`).

- [ ] **Step 7: Rode e comite**

```bash
npx tsc -b
npx oxlint src tests
npx vitest run
git add src tests
git commit -m "feat: curupira fecha o mundo 1 cobrando tres contas seguidas"
```

---

### Task 5: Cada fase no seu cenário

Esta é a tarefa que resolve "as fases parecem todas iguais". Hoje o
`createBackdrop` desenha o quintal da escola, fixo, nas cinco. O cenário vira
dado da fase.

**Files:**
- Modify: `src/theme/palette.ts`
- Modify: `src/game/art/backdrop.ts`
- Modify: `src/game/levels/reach.ts`
- Modify: `src/game/levels/level-1-1.ts` … `level-1-5.ts`
- Modify: `src/game/scenes/LevelScene.ts`
- Test: `tests/game/reach.test.ts`

**Interfaces:**
- Produz: `LevelTheme`, `THEMES`, `LevelSpec.theme: ThemeName`,
  `createBackdrop(scene, worldWidth, theme)`.

- [ ] **Step 1: Escreva o teste que falha**

Em `tests/game/reach.test.ts`:

```ts
import { THEMES } from '@/game/art/backdrop';

describe('cenários', () => {
  it('cada fase tem um cenário conhecido', () => {
    for (const level of LEVEL_ORDER) {
      expect(THEMES[level.theme]).toBeDefined();
    }
  });

  it('as cinco fases não repetem cenário — é o que tira o "tudo igual"', () => {
    const usados = new Set(LEVEL_ORDER.map((level) => level.theme));
    expect(usados.size).toBe(LEVEL_ORDER.length);
  });
});
```

- [ ] **Step 2: Rode e veja falhar**

```bash
npx vitest run tests/game/reach.test.ts
```

- [ ] **Step 3: Cores dos cinco cenários**

Em `src/theme/palette.ts`, acrescente:

```ts
  // Feira Livre (1-2)
  feiraSky: '#ffd9a0',
  feiraSkyLow: '#ffeccb',
  feiraTent: '#e2574c',
  feiraCrate: '#c98f4b',

  // Festa Junina à noite (1-3)
  festaSky: '#2b1f52',
  festaSkyLow: '#6b3f7a',
  festaFlag: '#ffd166',
  festaFire: '#ff8a3d',

  // Mata do Curupira (1-4)
  mataSky: '#bfe6c9',
  mataSkyLow: '#e6f5ea',
  mataTrunk: '#5a4028',
  mataLeaf: '#1f5c33',

  // Sertão (1-5)
  sertaoSky: '#ffc478',
  sertaoSkyLow: '#ffe6b8',
  sertaoGround: '#c4a06a',
  sertaoCactus: '#4f7a3a',
```

- [ ] **Step 4: O backdrop passa a receber o tema**

Reescreva `src/game/art/backdrop.ts`:

```ts
import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import { GAME_SIZE } from '@/game/constants';

export type ThemeName = 'quintal' | 'feira' | 'festa' | 'mata' | 'sertao';

/** O que muda de um cenário para o outro. Tudo desenhado em runtime. */
export type LevelTheme = {
  sky: string;
  skyLow: string;
  /** Vulto distante: morro, barraca, árvore, duna. */
  far: string;
  /** Faixa rente ao chão. */
  near: string;
  /** Cor do enfeite alto (copa, bandeirinha, mandacaru). */
  decor: string;
  decorAlt: string;
};

export const THEMES: Record<ThemeName, LevelTheme> = {
  quintal: {
    sky: PALETTE.sky,
    skyLow: PALETTE.skyLow,
    far: PALETTE.grassDark,
    near: PALETTE.grass,
    decor: PALETTE.grass,
    decorAlt: PALETTE.dirt,
  },
  feira: {
    sky: PALETTE.feiraSky,
    skyLow: PALETTE.feiraSkyLow,
    far: PALETTE.feiraTent,
    near: PALETTE.feiraCrate,
    decor: PALETTE.feiraTent,
    decorAlt: PALETTE.wall,
  },
  festa: {
    sky: PALETTE.festaSky,
    skyLow: PALETTE.festaSkyLow,
    far: PALETTE.steel,
    near: PALETTE.dirt,
    decor: PALETTE.festaFlag,
    decorAlt: PALETTE.festaFire,
  },
  mata: {
    sky: PALETTE.mataSky,
    skyLow: PALETTE.mataSkyLow,
    far: PALETTE.mataLeaf,
    near: PALETTE.grassDark,
    decor: PALETTE.mataLeaf,
    decorAlt: PALETTE.mataTrunk,
  },
  sertao: {
    sky: PALETTE.sertaoSky,
    skyLow: PALETTE.sertaoSkyLow,
    far: PALETTE.dirt,
    near: PALETTE.sertaoGround,
    decor: PALETTE.sertaoCactus,
    decorAlt: PALETTE.dirt,
  },
};

const cor = toPhaserColor;

/**
 * Cenário desenhado em runtime — sem tileset, sem download.
 *
 * Quatro profundidades com `scrollFactor` diferente: o céu não anda, os vultos
 * distantes andam devagar, o enfeite quase acompanha o jogador. É o que dá
 * profundidade sem nenhum asset (SPEC 7).
 */
export function createBackdrop(
  scene: Phaser.Scene,
  worldWidth: number,
  themeName: ThemeName,
): void {
  const { width, height } = GAME_SIZE;
  const theme = THEMES[themeName];

  const sky = scene.add.graphics();
  sky.fillGradientStyle(cor(theme.sky), cor(theme.sky), cor(theme.skyLow), cor(theme.skyLow), 1);
  sky.fillRect(0, 0, width, height);
  sky.setScrollFactor(0).setDepth(-100);

  // Noite de festa junina ganha lua; os outros ganham sol baixo.
  const astro = scene.add.circle(
    width - 90,
    82,
    themeName === 'festa' ? 26 : 34,
    cor(themeName === 'festa' ? PALETTE.ink : PALETTE.festaFlag),
    themeName === 'festa' ? 0.9 : 0.55,
  );
  astro.setScrollFactor(0).setDepth(-95);

  const far = scene.add.graphics();
  far.fillStyle(cor(theme.far), 1);
  for (let x = -200; x < worldWidth; x += 340) {
    if (themeName === 'feira') {
      // barracas de feira: telhado triangular
      far.fillTriangle(x - 130, height - 120, x, height - 250, x + 130, height - 120);
      far.fillRect(x - 120, height - 130, 240, 70);
    } else {
      far.fillEllipse(x, height - 80, 540, 260);
    }
  }
  far.setScrollFactor(0.2).setDepth(-90);

  const decor = scene.add.graphics();
  for (let x = 180; x < worldWidth; x += 430) {
    switch (themeName) {
      case 'sertao':
        // mandacaru: tronco e dois braços
        decor.fillStyle(cor(theme.decor), 1);
        decor.fillRect(x, height - 240, 20, 145);
        decor.fillRect(x - 26, height - 200, 26, 16);
        decor.fillRect(x + 20, height - 220, 26, 16);
        decor.fillRect(x - 26, height - 216, 16, 32);
        decor.fillRect(x + 30, height - 236, 16, 32);
        break;

      case 'festa':
        // bandeirinhas penduradas entre dois postes
        decor.fillStyle(cor(theme.decorAlt), 1);
        decor.fillRect(x, height - 250, 8, 160);
        for (let i = 0; i < 8; i += 1) {
          decor.fillStyle(cor(i % 2 === 0 ? theme.decor : theme.decorAlt), 1);
          const bx = x + 14 + i * 46;
          decor.fillTriangle(bx, height - 246, bx + 26, height - 246, bx + 13, height - 218);
        }
        break;

      case 'mata':
        // mata fechada: tronco alto e copa larga
        decor.fillStyle(cor(theme.decorAlt), 1);
        decor.fillRect(x, height - 300, 22, 165);
        decor.fillStyle(cor(theme.decor), 1);
        decor.fillCircle(x + 11, height - 318, 74);
        decor.fillCircle(x - 46, height - 280, 50);
        decor.fillCircle(x + 68, height - 280, 50);
        break;

      case 'feira':
        // caixotes empilhados
        decor.fillStyle(cor(theme.decorAlt), 1);
        decor.fillRect(x, height - 150, 54, 54);
        decor.fillRect(x + 58, height - 150, 54, 54);
        decor.fillRect(x + 28, height - 206, 54, 54);
        break;

      case 'quintal':
        // mangueiras
        decor.fillStyle(cor(theme.decorAlt), 1);
        decor.fillRect(x, height - 230, 16, 95);
        decor.fillStyle(cor(theme.decor), 1);
        decor.fillCircle(x + 8, height - 248, 54);
        decor.fillCircle(x - 30, height - 218, 38);
        decor.fillCircle(x + 46, height - 218, 38);
        break;
    }
  }
  decor.setScrollFactor(0.8).setDepth(-70);

  const chao = scene.add.graphics();
  chao.fillStyle(cor(theme.near), 1);
  chao.fillRect(0, height - 70, worldWidth, 70);
  chao.setDepth(-60);
}
```

- [ ] **Step 5: A fase declara o cenário**

Em `src/game/levels/reach.ts`, acrescente a `LevelSpec`:

```ts
  /** Cenário desta fase. Duas fases não repetem cenário no mesmo mundo. */
  theme: ThemeName;
```

Em cada fase, acrescente o campo e o nome novo:

| Fase | `theme` | `name` | mudou? |
|------|---------|--------|--------|
| 1-1 | `'quintal'` | `Quintal da Escola` | só o campo `theme` |
| 1-2 | `'feira'` | `Feira do Bairro` | era `Recreio no Pátio` |
| 1-3 | `'festa'` | `Festa Junina no Pátio` | só o campo `theme` |
| 1-4 | `'sertao'` | `Travessia do Sertão` | era `Quadra Coberta` |
| 1-5 | `'mata'` | `Mata do Curupira` | era `Portão da Escola` |

> **Por que a 1-4 virou sertão e a 1-5 virou mata:** a 1-4 é a fase da ventania,
> e vento em estrada seca faz mais sentido do que vento em quadra coberta. E o
> Curupira é guardião de mata — o chefe do Mundo 1 tem que estar na casa dele.
> A porta da 1-5 continua sendo o portão da escola: a mata é o caminho até ela.

Ajuste também o comentário no topo de cada arquivo de fase. Os da 1-2, 1-4 e
1-5 descrevem o cenário antigo ("Recreio no Pátio", "laje da quadra", "Portão da
Escola") e viram mentira depois desta tarefa.

Em `LevelScene.create()`, troque as duas linhas do cenário por:

```ts
    this.cameras.main.setBackgroundColor(THEMES[this.level.theme].sky);
    createBackdrop(this, this.level.worldWidth, this.level.theme);
```

Em `src/app/LevelSelect/LevelSelect.tsx`, o subtítulo fixo
`MUNDO 1 · QUINTAL DA ESCOLA` vira `MUNDO 1 · BRASIL` — o mundo deixou de ser
um lugar só.

- [ ] **Step 6: Rode e olhe**

```bash
npx tsc -b
npx oxlint src tests
npx vitest run
npm run dev
```

Abra as cinco fases pela tela de seleção. **Este é o passo em que o teste não
ajuda:** cenário não tem teste que prove que ficou bonito. Olhe as cinco lado a
lado e confirme que dá para saber em qual você está sem ler o nome.

- [ ] **Step 7: Commit**

```bash
git add src tests
git commit -m "feat: cada fase no seu cenario - feira, festa junina, mata e sertao"
```

---

### Task 6: Fases maiores

As cinco terminam cedo demais. Em vez de redesenhar geometria já provada, cada
fase **ganha um trecho novo antes da porta**: a porta anda para a direita e no
espaço que abriu entram duas plataformas em degrau, um número dourado e, em duas
delas, um monstro.

O trecho novo segue o mesmo molde em todas — sobe dois degraus e desce para o
chão da porta — porque o molde já respeita `SAFE_STEP` (95,28) e `SAFE_GAP`
(141,6) com folga.

**Files:**
- Modify: `src/game/levels/level-1-1.ts` … `level-1-5.ts`

- [ ] **Step 1: Estenda as cinco fases**

Em cada fase: acrescente as três plataformas à lista, mova o `panel` da porta
para o novo `x`, e acrescente os dígitos. **Nada mais muda** — o que já existia
continua onde estava, com a geometria que o teste já aprovou.

| Fase | `worldWidth` | Degrau 1 | Degrau 2 | Chão da porta | `panel` da porta |
|------|--------------|----------|----------|---------------|------------------|
| 1-1 | `3600` | `{ x: 2770, y: 410, width: 140, height: 40 }` | `{ x: 3010, y: 320, width: 140, height: 40 }` | `{ x: 3330, y: 500, width: 340, height: 40 }` | `{ x: 3400, y: 450 }` |
| 1-2 | `3600` | `{ x: 2710, y: 420, width: 180, height: 40 }` | `{ x: 2990, y: 340, width: 180, height: 40 }` | `{ x: 3330, y: 500, width: 340, height: 40 }` | `{ x: 3400, y: 450 }` |
| 1-3 | `4200` | `{ x: 3300, y: 410, width: 160, height: 40 }` | `{ x: 3560, y: 320, width: 160, height: 40 }` | `{ x: 3910, y: 500, width: 380, height: 40 }` | `{ x: 4000, y: 450 }` |
| 1-4 | `4400` | `{ x: 3500, y: 420, width: 160, height: 40 }` | `{ x: 3760, y: 330, width: 160, height: 40 }` | `{ x: 4110, y: 500, width: 380, height: 40 }` | `{ x: 4200, y: 450 }` |
| 1-5 | `5200` | `{ x: 4210, y: 410, width: 180, height: 40 }` | `{ x: 4490, y: 320, width: 180, height: 40 }` | `{ x: 4880, y: 500, width: 440, height: 40 }` | `{ x: 5000, y: 450 }` |

Números dourados novos, um por fase, sobre o degrau 2:

| Fase | dígito novo |
|------|-------------|
| 1-1 | `{ x: 3010, y: 270 }` |
| 1-2 | `{ x: 2990, y: 290 }` |
| 1-3 | `{ x: 3560, y: 270 }` |
| 1-4 | `{ x: 3760, y: 280 }` |
| 1-5 | `{ x: 4490, y: 270 }` |

E uma bandeira nova no chão da porta de cada fase, em
`{ x: <x do chão da porta> - 120, y: 450 }` — trecho longo sem bandeira é trecho
que o jogador refaz inteiro quando cai.

> Os monstros da Tarefa 3 que ficam em `x` alto (`boitata-1-4` em 2900,
> `boitata-1-5` em 3400, `curupira-1-5` em 3700) continuam válidos: eles estão
> no chão que já existia, antes do trecho novo.

- [ ] **Step 2: Rode o teste de alcance — é ele que aprova a geometria**

```bash
npx vitest run tests/game/reach.test.ts
```

Esperado: PASS nas cinco fases. Se reprovar, a mensagem diz qual ponto ficou
fora de alcance. **Conserte a fase, não o teste.**

- [ ] **Step 3: Jogue as cinco do começo ao fim**

```bash
npm run dev
```

Cronometre. Cada fase deve levar mais de um minuto sem pressa — se a 1-1 ainda
acabar em 30 segundos, o trecho novo não entrou.

- [ ] **Step 4: Commit**

```bash
git add src/game/levels
git commit -m "feat: as cinco fases ganham um trecho novo antes da porta"
```

---

### Task 7: SPEC em dia e verificação manual

- [ ] **Step 1: Atualize a SPEC**

Na seção 4 (Mecanismos), a descrição da escada de blocos ainda diz que a
resposta vira degraus. Reescreva: **a fase declara de 2 a 4 degraus e a conta
certa levanta a escada**, igual à ponte. Diga por quê, em uma linha: escada
derivada da resposta fica desproporcional e prende o mecanismo a `+`.

Na seção 4b, marque quem está no jogo: Saci, Cuca, Boitatá, Boto e o Curupira
como chefe do Mundo 1.

Na seção 5 (Progressão), acrescente o seletor de dificuldade: fácil, médio e
difícil, o que cada um faz nas contas, nos corações e no número de monstros.

Na seção 10, marque o passo 7 como feito e deixe como próximos: créditos ao
terminar a 1-5, e deploy na VPS com instalação no celular.

- [ ] **Step 2: Commit**

```bash
git add SPEC.md
git commit -m "docs: spec com escada por fase, folclore completo e dificuldade"
```

- [ ] **Step 3: Verificação manual**

```bash
npm run dev
```

Escada:
- [ ] Na 1-2 a escada tem sempre 2 degraus, do tamanho do vão — não importa a conta
- [ ] A escada da 1-2 agora cobra uma multiplicação, e a da 1-3 uma divisão
- [ ] Nenhuma escada atravessa plataforma nem sai da tela

Dificuldade:
- [ ] A tela de título tem três cartões: Fácil, Médio, Difícil
- [ ] No Fácil as contas são as de antes; no Difícil vêm bem maiores
- [ ] No Difícil o HUD mostra 2 corações; nos outros, 3
- [ ] Recarregar a página mantém a dificuldade escolhida
- [ ] No Fácil aparece 1 monstro por fase; no Médio 2; no Difícil 3

Folclore:
- [ ] Dá para diferenciar Saci, Cuca, Boitatá e Boto sem ler nada
- [ ] Cada um cobra a conta dele: Saci soma, Cuca subtrai, Boitatá multiplica,
      Boto divide
- [ ] No fim da 1-5 o Curupira cobra **três** contas seguidas
- [ ] Errar contra o chefe custa um coração e a conta volta — o progresso das
      rodadas certas não se perde

Cenários e tamanho:
- [ ] As cinco fases têm céu, chão e enfeite diferentes
- [ ] Dá para saber em que fase você está sem ler o nome
- [ ] A festa junina é de noite, com bandeirinhas; o sertão tem mandacaru
- [ ] Cada fase leva mais de um minuto, e a 1-5 é claramente a mais longa
- [ ] O trecho novo de cada fase tem bandeira — cair nele não devolve ao começo

No celular (`npm run dev -- --host`):
- [ ] Os três cartões de dificuldade cabem na tela em pé
- [ ] O jogo continua a 60 fps nas fases maiores
