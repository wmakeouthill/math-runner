# Math Runner — Fase 2 · Identidade visual · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a tela de título feia por uma tela bonita e organizada, com retratos SVG da Ana e do Junior de uniforme, e fazer o personagem parecer um aluno de escola dentro do jogo, num cenário de Quintal da Escola com parallax.

**Architecture:** Uma paleta única em `src/theme/palette.ts` alimenta os dois lados — o React consome as strings `#rrggbb` direto, e o Phaser converte com `toPhaserColor()`. Nenhuma arte externa entra no projeto nesta fase: o retrato é SVG em React (tem espaço para o brasão ser legível) e o sprite do jogo é desenhado num canvas do Phaser em runtime (32 × 48, lido por silhueta e cor). Isso mantém o build sem asset pipeline e sem custo de licença.

**Tech Stack:** React 19 · TypeScript (strict) · Phaser 3 · Zustand · Vitest

**Spec:** [`SPEC.md`](../../../SPEC.md) — seções 5b (personagens e uniforme), 7b (cabeçalho e créditos), 5 (Mundo 1, Quintal da Escola)

## Global Constraints

Valem para **todas** as tasks. Copiados do `SPEC.md` e das regras do projeto:

- **TypeScript `strict: true`. `any` é proibido.** Sem exceções, inclusive em testes.
- **`noUncheckedIndexedAccess` está ligado.** `array[i]` devolve `T | undefined` — trate, não use `!`.
- **Nenhum arquivo passa de 200 linhas.** Se passar, divida por responsabilidade.
- **Sem backend, sem banco, sem login.** Persistência só em `localStorage`.
- **Separação de arquivos React:** `Component.tsx` / `Component.styles.ts` / `Component.hooks.ts` / `Component.types.ts`. Zero lógica dentro do JSX.
- **Estado global de cliente via Zustand.** Não existe server state neste projeto, então **não** instale TanStack Query.
- **Nunca renderize UI dentro do Phaser.** Texto, botões e menus são React/HTML. O Phaser desenha só o mundo do jogo.
- **Nenhuma dependência nova.** Nada de biblioteca de ícones, de CSS-in-JS ou de animação. O que já está no `package.json` resolve.
- **Não reproduza o brasão oficial do Governo do Estado.** O brasão é **do jogo**: escudo com um `√` estilizado e as letras `EC`, com o nome da escola ao lado. Ver `SPEC.md` seção 5b.
- **Nomes fixos que aparecem na tela:** alunos `Junior` e `Ana`; escola `Escola Euclides da Cunha`; título `Math Runner`; subtítulo `O Resgate dos Números`; ano `2026`.
- **Commits sem trailer de coautoria.** Nada de `Co-Authored-By`, `Generated with` ou assinatura de ferramenta, em commit, comentário de código ou README. O trabalho é do Junior e da Ana.
- **Resolução base do jogo:** `960 x 540`, escala `FIT`, orientação `landscape`.
- **Commits pequenos**, um por task no mínimo, em português, prefixo `feat:` / `test:` / `chore:` / `fix:`.

### Como verificar uma task visual

Task de layout não tem asserção que valha a pena escrever — teste de snapshot de
tela quebra a cada ajuste de padding e não pega feiura. O portão destas tasks é:

```bash
npx tsc -b && npm run lint && npm run test
```

mais **olhar a tela**: `npm run dev`, abrir `http://localhost:5173`, conferir o
que o passo pede e checar que o console do navegador está limpo. Onde existe
lógica de verdade (conversão de cor), o teste é obrigatório e está no plano.

---

## Estrutura de arquivos

```
src/
├─ theme/
│  └─ palette.ts                  # ★ novo — fonte única de cor (React + Phaser)
├─ index.css                      # modificado — fundo e fonte
├─ app/
│  ├─ Portrait/
│  │  ├─ Crest.tsx                # ★ novo — brasão do jogo (escudo + √ + EC)
│  │  └─ Portrait.tsx             # ★ novo — retrato SVG da Ana e do Junior
│  └─ Title/
│     ├─ Title.tsx                # reescrito — layout de duas colunas
│     ├─ Title.styles.ts          # reescrito — usa a paleta
│     └─ OptionCard.tsx           # ★ novo — cartão selecionável reutilizável
└─ game/
   ├─ art/
   │  ├─ characterTexture.ts      # ★ novo — uniforme 32x48 em canvas
   │  └─ backdrop.ts              # ★ novo — céu, morros, muro, mangueiras
   ├─ config.ts                   # modificado — cor de fundo
   └─ scenes/
      └─ LevelScene.ts            # modificado — usa cenário e personagem

tests/
└─ theme/
   └─ palette.test.ts             # ★ novo
```

**Por que uma paleta única:** hoje o hex `#6ee7ff` está escrito à mão em cinco
lugares e o Phaser usa `0x2b3a67` sem relação nenhuma com o CSS. Quando o
professor pedir "deixa mais azul", são cinco edições e uma chance de esquecer
uma. Com `PALETTE`, é uma linha.

---

### Task 1: Paleta compartilhada entre React e Phaser

**Files:**
- Create: `src/theme/palette.ts`
- Create: `tests/theme/palette.test.ts`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: nada.
- Produces: `PALETTE` (objeto `as const` de strings `#rrggbb`), `toPhaserColor(hex: string): number`, `type ColorName`. Todas as tasks seguintes importam daqui.

- [ ] **Step 1: Escreva o teste que falha**

Crie `tests/theme/palette.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PALETTE, toPhaserColor } from '@/theme/palette';

describe('toPhaserColor', () => {
  it('converte hex de 6 dígitos em número, com ou sem #', () => {
    expect(toPhaserColor('#6ee7ff')).toBe(0x6ee7ff);
    expect(toPhaserColor('6ee7ff')).toBe(0x6ee7ff);
  });

  it('aceita maiúsculas', () => {
    expect(toPhaserColor('#F2F5FF')).toBe(0xf2f5ff);
  });

  it('recusa cor malformada em vez de devolver NaN', () => {
    expect(() => toPhaserColor('#xyzxyz')).toThrow();
    expect(() => toPhaserColor('#fff')).toThrow();
    expect(() => toPhaserColor('')).toThrow();
  });

  it('toda cor da paleta é convertível', () => {
    for (const hex of Object.values(PALETTE)) {
      expect(() => toPhaserColor(hex)).not.toThrow();
    }
  });

  it('a paleta usa sempre o formato de 6 dígitos com #', () => {
    for (const hex of Object.values(PALETTE)) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
```

Por que isto merece teste e um layout não merece: `Number.parseInt('#6ee7ff', 16)`
devolve `NaN` silenciosamente, o Phaser pinta preto e você passa vinte minutos
procurando. O teste custa dez linhas.

- [ ] **Step 2: Rode o teste e confirme que falha**

Run: `npm run test -- palette`
Expected: FAIL — `Failed to resolve import "@/theme/palette"`

- [ ] **Step 3: Escreva a paleta**

Crie `src/theme/palette.ts`:

```ts
/**
 * Fonte única de cor do projeto.
 *
 * O React consome as strings direto no `style`. O Phaser só aceita número,
 * então passe por `toPhaserColor()`. Nunca escreva um hex à mão fora daqui.
 */
export const PALETTE = {
  // Fundo da interface
  night: '#0b1020',
  deep: '#141f42',
  navy: '#1b2a5e',
  steel: '#2b3a67',

  // Texto
  ink: '#e8ecff',
  mute: '#a9b6e8',
  faint: '#6b78a9',

  // Uniforme (SPEC 5b)
  shirt: '#f2f5ff',
  sneaker: '#e8ecff',

  // Destaques
  cyan: '#6ee7ff',
  gold: '#ffd166',

  // Quintal da Escola (Mundo 1)
  sky: '#7fc8f8',
  skyLow: '#cfe9ff',
  grass: '#4c9a4c',
  grassDark: '#2f6b34',
  wall: '#d9c9a3',
  dirt: '#7a5c3a',

  // Pele e cabelo — a dupla representa melhor a turma (SPEC 5b)
  skinAna: '#8d5524',
  skinJunior: '#e0ac69',
  hairAna: '#2b1b12',
  hairJunior: '#3d2a1c',
} as const;

export type ColorName = keyof typeof PALETTE;

const HEX = /^#?[0-9a-fA-F]{6}$/;

/** `'#6ee7ff'` → `0x6ee7ff`. O Phaser não aceita string de cor. */
export function toPhaserColor(hex: string): number {
  if (!HEX.test(hex)) throw new Error(`Cor inválida: "${hex}"`);
  return Number.parseInt(hex.replace('#', ''), 16);
}
```

- [ ] **Step 4: Rode o teste e confirme que passa**

Run: `npm run test -- palette`
Expected: PASS — 5 testes

- [ ] **Step 5: Use a paleta no CSS global**

Substitua o conteúdo de `src/index.css`:

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body, #root { width: 100%; height: 100%; overflow: hidden; }

body {
  background: #0b1020;
  color: #e8ecff;
  font-family: 'Segoe UI', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}

button { font-family: inherit; }
```

`-webkit-tap-highlight-color: transparent` tira o retângulo cinza que o Chrome
do Android pisca em cima de todo botão tocado. Sem isso a tela de título parece
quebrada no celular.

- [ ] **Step 6: Rode o portão completo**

Run: `npx tsc -b && npm run lint && npm run test`
Expected: sem erro, 41 testes passando

- [ ] **Step 7: Commit**

```bash
git add src/theme/palette.ts tests/theme/palette.test.ts src/index.css
git commit -m "feat: paleta unica compartilhada entre React e Phaser"
```

---

### Task 2: Brasão do jogo e retratos SVG da Ana e do Junior

**Files:**
- Create: `src/app/Portrait/Crest.tsx`
- Create: `src/app/Portrait/Portrait.tsx`

**Interfaces:**
- Consumes: `PALETTE` da Task 1; `CharacterId` de `@/store/useGameStore.types`.
- Produces: `<Crest size?: number x?: number y?: number />` e `<Portrait character: CharacterId size?: number />`. A Task 4 usa os dois.

- [ ] **Step 1: Escreva o brasão**

Crie `src/app/Portrait/Crest.tsx`:

```tsx
import { PALETTE } from '@/theme/palette';

type CrestProps = {
  size?: number;
  /** Só quando aninhado dentro de outro `<svg>`. */
  x?: number;
  y?: number;
};

/**
 * Brasão do jogo — escudo com um √ estilizado e as iniciais da escola.
 *
 * Não é o brasão oficial do Governo do Estado que aparece na referência: aquele
 * é insígnia pública e não é nossa para usar. Este é melhor mesmo assim, porque
 * coloca a escola literalmente no peito dos personagens.
 */
export function Crest({ size = 28, x, y }: CrestProps) {
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size * 1.15}
      viewBox="0 0 40 46"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 3 H37 V26 Q37 39 20 44 Q3 39 3 26 Z"
        fill={PALETTE.navy}
        stroke={PALETTE.cyan}
        strokeWidth="2.5"
      />
      <path
        d="M10 23 L15 31 L24 11 H32"
        fill="none"
        stroke={PALETTE.cyan}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="20"
        y="40"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill={PALETTE.shirt}
      >
        EC
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Escreva o retrato**

Crie `src/app/Portrait/Portrait.tsx`:

```tsx
import { PALETTE } from '@/theme/palette';
import type { CharacterId } from '@/store/useGameStore.types';
import { Crest } from './Crest';

type PortraitProps = {
  character: CharacterId;
  size?: number;
};

/** Uniforme igual para os dois (SPEC 5b); muda pele, cabelo, barra e mochila. */
const LOOK = {
  ana: {
    name: 'Ana',
    skin: PALETTE.skinAna,
    hair: PALETTE.hairAna,
    /** Short: a barra da calça termina alto. */
    hem: 124,
  },
  junior: {
    name: 'Junior',
    skin: PALETTE.skinJunior,
    hair: PALETTE.hairJunior,
    hem: 146,
  },
} as const;

const LEG_TOP = 108;
const LEG_X = [46, 62] as const;

/**
 * Retrato de seleção. É SVG e não sprite porque aqui cabe detalhe: em 32 × 48
 * px o brasão vira uma mancha de 4 pixels (SPEC 5b).
 */
export function Portrait({ character, size = 132 }: PortraitProps) {
  const look = LOOK[character];
  const isAna = character === 'ana';

  return (
    <svg
      width={size}
      height={(size * 160) / 120}
      viewBox="0 0 120 160"
      role="img"
      aria-label={`${look.name} de uniforme da Escola Euclides da Cunha`}
    >
      {/* pernas: marinho até a barra, pele daí para baixo */}
      {LEG_X.map((x) => (
        <g key={x}>
          <rect x={x} y={LEG_TOP} width={12} height={look.hem - LEG_TOP} fill={PALETTE.deep} />
          <rect x={x} y={look.hem} width={12} height={150 - look.hem} fill={look.skin} />
          <rect x={x - 2} y={146} width={16} height={9} rx={3} fill={PALETTE.sneaker} />
          <rect x={x - 2} y={152} width={16} height={3} rx={1.5} fill={PALETTE.steel} />
        </g>
      ))}

      {/* mochila: fica atrás, só a borda aparece dos lados */}
      <rect x={32} y={66} width={56} height={40} rx={10} fill={PALETTE.cyan} opacity={0.85} />

      {/* braços */}
      {[26, 82].map((x) => (
        <g key={x}>
          <rect x={x} y={66} width={12} height={20} rx={5} fill={PALETTE.shirt} />
          <rect x={x} y={84} width={12} height={6} fill={PALETTE.navy} />
          <rect x={x} y={90} width={12} height={14} rx={5} fill={look.skin} />
        </g>
      ))}

      {/* torso: camisa branca */}
      <rect x={38} y={62} width={44} height={48} rx={7} fill={PALETTE.shirt} />

      {/* gola ringer */}
      <path
        d="M48 62 Q60 75 72 62"
        fill="none"
        stroke={PALETTE.navy}
        strokeWidth={6}
        strokeLinecap="round"
      />

      {/* alça da mochila: Ana usa as duas, Junior usa uma só (SPEC 5b) */}
      <path d="M46 64 L48 86" stroke={PALETTE.cyan} strokeWidth={4} strokeLinecap="round" />
      {isAna ? (
        <path d="M74 64 L72 86" stroke={PALETTE.cyan} strokeWidth={4} strokeLinecap="round" />
      ) : null}

      <Crest x={54} y={74} size={16} />

      {/* pescoço e cabeça */}
      <rect x={55} y={52} width={10} height={12} fill={look.skin} />
      <circle cx={60} cy={40} r={20} fill={look.skin} />

      {/* cabelo */}
      {isAna ? (
        <>
          <circle cx={60} cy={15} r={9} fill={look.hair} />
          <path
            d="M38 46 Q38 17 60 17 Q82 17 82 46 L75 46 Q75 29 60 29 Q45 29 45 46 Z"
            fill={look.hair}
          />
        </>
      ) : (
        <path d="M40 37 Q41 18 60 18 Q79 18 80 37 Q71 28 60 28 Q49 28 40 37 Z" fill={look.hair} />
      )}

      {/* rosto */}
      <circle cx={53} cy={40} r={2.4} fill={PALETTE.night} />
      <circle cx={67} cy={40} r={2.4} fill={PALETTE.night} />
      <path
        d="M53 48 Q60 54 67 48"
        fill="none"
        stroke={PALETTE.night}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
```

Ordem de desenho importa em SVG: quem vem depois fica por cima. Pernas primeiro,
mochila, braços, torso, e a cabeça por último.

- [ ] **Step 3: Confira que compila**

Run: `npx tsc -b && npm run lint`
Expected: sem erro. Os dois componentes ainda não estão em uso — o
`noUnusedLocals` não reclama de arquivo exportado sem importador.

- [ ] **Step 4: Commit**

```bash
git add src/app/Portrait
git commit -m "feat: brasao do jogo e retratos SVG da Ana e do Junior"
```

---

### Task 3: Cartão de opção reutilizável

**Files:**
- Create: `src/app/Title/OptionCard.tsx`
- Modify: `src/app/Title/Title.styles.ts` (reescrita completa)

**Interfaces:**
- Consumes: `PALETTE` da Task 1.
- Produces: `<OptionCard selected label hint? onSelect children? />` e o objeto `styles` completo da tela de título. A Task 4 usa os dois.

- [ ] **Step 1: Reescreva os estilos**

Substitua o conteúdo de `src/app/Title/Title.styles.ts`:

```ts
import type { CSSProperties } from 'react';
import { PALETTE } from '@/theme/palette';

export const styles = {
  screen: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(1.2rem, 5vw, 3.5rem)',
    width: '100%',
    height: '100%',
    padding: 'clamp(1rem, 3vw, 2rem)',
    overflowY: 'auto',
    background: `radial-gradient(130% 100% at 15% 0%, ${PALETTE.navy} 0%, ${PALETTE.night} 62%)`,
  },

  // Coluna da esquerda — marca e cabeçalho do trabalho
  brand: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.35rem',
    textAlign: 'center',
  },
  title: {
    fontSize: 'clamp(2.2rem, 7vw, 4.2rem)',
    lineHeight: 1,
    letterSpacing: '0.06em',
    color: PALETTE.shirt,
    textShadow: `0 0 28px ${PALETTE.cyan}66`,
  },
  subtitle: {
    fontSize: 'clamp(0.95rem, 2.6vw, 1.35rem)',
    color: PALETTE.cyan,
    letterSpacing: '0.04em',
  },
  schoolBand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    marginTop: '1.1rem',
    padding: '0.6rem 1.1rem',
    background: `${PALETTE.deep}cc`,
    border: `1px solid ${PALETTE.steel}`,
    borderRadius: '0.9rem',
  },
  students: {
    fontSize: '1rem',
    fontWeight: 700,
    color: PALETTE.ink,
    letterSpacing: '0.03em',
  },
  school: {
    fontSize: '0.78rem',
    color: PALETTE.mute,
  },

  // Coluna da direita — escolhas
  choices: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '1rem',
    minWidth: 'min(320px, 92vw)',
  },
  label: {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.22em',
    color: PALETTE.faint,
  },
  row: {
    display: 'flex',
    gap: '0.7rem',
  },

  card: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.7rem 0.8rem',
    color: PALETTE.ink,
    background: `${PALETTE.deep}99`,
    border: `2px solid ${PALETTE.steel}`,
    borderRadius: '0.9rem',
    cursor: 'pointer',
    transition: 'border-color 120ms, background 120ms',
  },
  cardSelected: {
    border: `2px solid ${PALETTE.cyan}`,
    background: PALETTE.navy,
    boxShadow: `0 0 0 4px ${PALETTE.cyan}22`,
  },
  cardLabel: {
    fontSize: '1rem',
    fontWeight: 700,
  },
  cardHint: {
    fontSize: '0.74rem',
    lineHeight: 1.35,
    color: PALETTE.mute,
    textAlign: 'center',
  },

  playButton: {
    marginTop: '0.4rem',
    padding: '0.95rem 1rem',
    fontSize: '1.2rem',
    fontWeight: 800,
    letterSpacing: '0.1em',
    color: PALETTE.night,
    background: PALETTE.cyan,
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    boxShadow: `0 8px 24px ${PALETTE.cyan}44`,
  },
} satisfies Record<string, CSSProperties>;
```

- [ ] **Step 2: Escreva o cartão**

Crie `src/app/Title/OptionCard.tsx`:

```tsx
import type { ReactNode } from 'react';
import { styles } from './Title.styles';

type OptionCardProps = {
  selected: boolean;
  label: string;
  /** Linha curta explicando a opção. Opcional. */
  hint?: string;
  onSelect: () => void;
  children?: ReactNode;
};

/** Cartão de escolha única — serve para personagem e para modo de jogo. */
export function OptionCard({ selected, label, hint, onSelect, children }: OptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      style={selected ? { ...styles.card, ...styles.cardSelected } : styles.card}
    >
      {children}
      <span style={styles.cardLabel}>{label}</span>
      {hint === undefined ? null : <span style={styles.cardHint}>{hint}</span>}
    </button>
  );
}
```

`aria-pressed` é o que faz o leitor de tela anunciar qual está escolhido —
o cartão é um botão de estado, não um link.

- [ ] **Step 3: Confira que compila**

Run: `npx tsc -b && npm run lint`
Expected: sem erro. A tela de título ainda referencia os estilos antigos
(`divider`, `credits`, `avatar`), então **espere erro de tipo em `Title.tsx`** —
ele é corrigido na Task 4. Se preferir um portão limpo, faça a Task 3 e a
Task 4 no mesmo commit.

- [ ] **Step 4: Commit (junto com a Task 4)**

Este commit sai junto com o da Task 4, porque os estilos novos e a tela nova
são a mesma mudança. Não commite sozinho.

---

### Task 4: Tela de título nova

**Files:**
- Modify: `src/app/Title/Title.tsx` (reescrita completa)

**Interfaces:**
- Consumes: `<Portrait>` e `<Crest>` da Task 2, `<OptionCard>` e `styles` da Task 3, `useGameStore`.
- Produces: a tela final. Nada depende dela.

- [ ] **Step 1: Reescreva a tela**

Substitua o conteúdo de `src/app/Title/Title.tsx`:

```tsx
import { useGameStore } from '@/store/useGameStore';
import type { CharacterId, GameMode } from '@/store/useGameStore.types';
import { Portrait } from '@/app/Portrait/Portrait';
import { Crest } from '@/app/Portrait/Crest';
import { OptionCard } from './OptionCard';
import { styles } from './Title.styles';

const CHARACTERS: ReadonlyArray<{ id: CharacterId; label: string }> = [
  { id: 'ana', label: 'Ana' },
  { id: 'junior', label: 'Junior' },
];

const MODES: ReadonlyArray<{ id: GameMode; label: string; hint: string }> = [
  { id: 'aventura', label: 'Aventura', hint: 'Guardiões do folclore e 3 corações' },
  { id: 'explorador', label: 'Explorador', hint: 'Só obstáculos, sem perder vida' },
];

export function Title() {
  const startLevel = useGameStore((state) => state.startLevel);
  const character = useGameStore((state) => state.character);
  const setCharacter = useGameStore((state) => state.setCharacter);
  const mode = useGameStore((state) => state.mode);
  const setMode = useGameStore((state) => state.setMode);

  return (
    <main style={styles.screen}>
      <section style={styles.brand}>
        <h1 style={styles.title}>MATH RUNNER</h1>
        <p style={styles.subtitle}>O Resgate dos Números</p>

        <div style={styles.schoolBand}>
          <Crest size={34} />
          <span>
            <span style={styles.students}>Junior · Ana</span>
            <br />
            <span style={styles.school}>Escola Euclides da Cunha — 2026</span>
          </span>
        </div>
      </section>

      <section style={styles.choices}>
        <p style={styles.label}>QUEM VAI JOGAR</p>
        <div style={styles.row}>
          {CHARACTERS.map((option) => (
            <OptionCard
              key={option.id}
              selected={character === option.id}
              label={option.label}
              onSelect={() => setCharacter(option.id)}
            >
              <Portrait character={option.id} size={96} />
            </OptionCard>
          ))}
        </div>

        <p style={styles.label}>MONSTROS</p>
        <div style={styles.row}>
          {MODES.map((option) => (
            <OptionCard
              key={option.id}
              selected={mode === option.id}
              label={option.label}
              hint={option.hint}
              onSelect={() => setMode(option.id)}
            />
          ))}
        </div>

        <button type="button" style={styles.playButton} onClick={() => startLevel('1-1')}>
          JOGAR
        </button>
      </section>
    </main>
  );
}
```

O cabeçalho do trabalho (nomes e escola) fica na faixa com o brasão, sempre
visível ao abrir — é o requisito da seção 7b do `SPEC.md`.

- [ ] **Step 2: Rode o portão**

Run: `npx tsc -b && npm run lint && npm run test`
Expected: sem erro, 41 testes passando

- [ ] **Step 3: Olhe a tela**

Run: `npm run dev` e abra `http://localhost:5173`

Confira, um a um:
- A tela tem **duas colunas** numa janela larga: marca à esquerda, escolhas à direita.
- Encolhendo a janela até ficar estreita, as duas colunas **empilham** e nada corta.
- Os retratos da Ana e do Junior aparecem, de camisa branca com gola marinho e o brasão no peito.
- Clicar num retrato acende a borda ciano só nele.
- Os dois modos mostram a linha de explicação embaixo do nome.
- Recarregar a página mantém o personagem e o modo escolhidos (`localStorage`).
- O console do navegador está sem aviso e sem erro.

- [ ] **Step 4: Commit**

```bash
git add src/app/Title
git commit -m "feat: tela de titulo com retratos, brasao e descricao dos modos"
```

---

### Task 5: Uniforme dentro do jogo

**Files:**
- Create: `src/game/art/characterTexture.ts`
- Modify: `src/game/scenes/LevelScene.ts`

**Interfaces:**
- Consumes: `PALETTE` da Task 1, `CharacterId` da store.
- Produces: `ensureCharacterTexture(scene, id): string` — cria a textura se ainda não existir e devolve a chave. A `LevelScene` chama no `create()`.

- [ ] **Step 1: Escreva o gerador de textura**

Crie `src/game/art/characterTexture.ts`:

```ts
import Phaser from 'phaser';
import { PALETTE } from '@/theme/palette';
import type { CharacterId } from '@/store/useGameStore.types';

const WIDTH = 32;
const HEIGHT = 48;

/** `hem` é onde a barra termina — a Ana usa short, o Junior usa calça. */
const LOOK = {
  ana: { skin: PALETTE.skinAna, hair: PALETTE.hairAna, hem: 36 },
  junior: { skin: PALETTE.skinJunior, hair: PALETTE.hairJunior, hem: 43 },
} as const;

export const characterTextureKey = (id: CharacterId): string => `player-${id}`;

/**
 * Desenha o uniforme direto num canvas do Phaser — sem asset externo, sem
 * pipeline de arte. Em 32 × 48 o brasão viraria uma mancha de 4 pixels, então
 * aqui o uniforme é lido por silhueta e cor: corpo branco, gola e punho
 * marinho, pernas marinho. O detalhe fino mora no retrato SVG (SPEC 5b).
 */
export function ensureCharacterTexture(scene: Phaser.Scene, id: CharacterId): string {
  const key = characterTextureKey(id);
  if (scene.textures.exists(key)) return key;

  const texture = scene.textures.createCanvas(key, WIDTH, HEIGHT);
  if (!texture) return key;

  const ctx = texture.getContext();
  const look = LOOK[id];
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // pernas
  ctx.fillStyle = PALETTE.deep;
  ctx.fillRect(9, 30, 5, look.hem - 30);
  ctx.fillRect(18, 30, 5, look.hem - 30);

  // pele abaixo da barra
  ctx.fillStyle = look.skin;
  ctx.fillRect(9, look.hem, 5, 44 - look.hem);
  ctx.fillRect(18, look.hem, 5, 44 - look.hem);

  // tênis
  ctx.fillStyle = PALETTE.sneaker;
  ctx.fillRect(8, 44, 7, 4);
  ctx.fillRect(17, 44, 7, 4);

  // camisa e braços
  ctx.fillStyle = PALETTE.shirt;
  ctx.fillRect(8, 18, 16, 13);
  ctx.fillRect(5, 19, 4, 8);
  ctx.fillRect(23, 19, 4, 8);

  // gola e punhos — é isto que faz ler como uniforme
  ctx.fillStyle = PALETTE.navy;
  ctx.fillRect(11, 18, 10, 3);
  ctx.fillRect(5, 27, 4, 3);
  ctx.fillRect(23, 27, 4, 3);

  // mãos
  ctx.fillStyle = look.skin;
  ctx.fillRect(5, 30, 4, 4);
  ctx.fillRect(23, 30, 4, 4);

  // cabeça
  ctx.fillRect(10, 6, 12, 12);

  // cabelo
  ctx.fillStyle = look.hair;
  ctx.fillRect(9, 3, 14, 5);
  if (id === 'ana') {
    ctx.fillRect(8, 6, 2, 10);
    ctx.fillRect(22, 6, 2, 10);
    ctx.fillRect(13, 0, 6, 3);
  }

  // olhos
  ctx.fillStyle = PALETTE.night;
  ctx.fillRect(13, 11, 2, 2);
  ctx.fillRect(18, 11, 2, 2);

  // alça da mochila: uma para o Junior, duas para a Ana
  ctx.fillStyle = PALETTE.cyan;
  ctx.fillRect(11, 18, 2, 12);
  if (id === 'ana') ctx.fillRect(19, 18, 2, 12);

  texture.refresh();
  return key;
}
```

- [ ] **Step 2: Ligue na cena**

Em `src/game/scenes/LevelScene.ts`:

Troque o bloco de imports do topo por:

```ts
import Phaser from 'phaser';
import { GAME_FEEL, GAME_SIZE } from '@/game/constants';
import { JumpController } from '@/game/systems/JumpController';
import { InputSystem } from '@/game/systems/InputSystem';
import { LEVEL_1_1 } from '@/game/levels/level-1-1';
import type { PlatformSpec } from '@/game/levels/reach';
import { ensureCharacterTexture } from '@/game/art/characterTexture';
import { useGameStore } from '@/store/useGameStore';
```

Apague a linha `const PLAYER_TEXTURE = 'player-rect';` e o método
`ensurePlayerTexture()` inteiro — o gerador novo substitui os dois.

Dentro de `create()`, troque as três linhas que criam o player por:

```ts
    const textureKey = ensureCharacterTexture(this, useGameStore.getState().character);

    const { spawn, worldWidth } = LEVEL_1_1;
    this.player = this.physics.add.sprite(spawn.x, spawn.y, textureKey);
    this.player.setDisplaySize(32, 48);
    this.player.setCollideWorldBounds(false);
```

**O `setTintFill(0x6ee7ff)` tem que sair.** `setTintFill` pinta o sprite inteiro
de uma cor só — com ele o uniforme vira um retângulo ciano e todo o trabalho
desta task some.

E remova a chamada a `this.ensurePlayerTexture();` no começo de `create()`.

- [ ] **Step 3: Rode o portão**

Run: `npx tsc -b && npm run lint && npm run test`
Expected: sem erro, 41 testes passando

- [ ] **Step 4: Olhe o jogo**

Run: `npm run dev`

- Escolha **Ana**, clique JOGAR: o personagem tem camisa branca, faixa marinho na gola, short marinho e cabelo preso.
- Volte (recarregue a página), escolha **Junior**: calça marinho até o tênis, cabelo curto, uma alça só de mochila.
- O personagem **não** é um retângulo de cor sólida.

- [ ] **Step 5: Commit**

```bash
git add src/game/art/characterTexture.ts src/game/scenes/LevelScene.ts
git commit -m "feat: uniforme da escola desenhado no sprite do jogador"
```

---

### Task 6: Cenário do Quintal da Escola com parallax

**Files:**
- Create: `src/game/art/backdrop.ts`
- Modify: `src/game/scenes/LevelScene.ts`
- Modify: `src/game/config.ts`

**Interfaces:**
- Consumes: `PALETTE` e `toPhaserColor` da Task 1, `GAME_SIZE` de `@/game/constants`.
- Produces: `createBackdrop(scene, worldWidth): void`.

- [ ] **Step 1: Escreva o cenário**

Crie `src/game/art/backdrop.ts`:

```ts
import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import { GAME_SIZE } from '@/game/constants';

/**
 * Quintal da Escola desenhado em runtime — sem tileset, sem download.
 *
 * Quatro profundidades com `scrollFactor` diferente: o céu não anda, os morros
 * andam devagar, o muro e as mangueiras quase acompanham o jogador. É o que dá
 * sensação de profundidade sem nenhum asset (SPEC 7).
 */
export function createBackdrop(scene: Phaser.Scene, worldWidth: number): void {
  const { width, height } = GAME_SIZE;

  // céu — preso na câmera
  const sky = scene.add.graphics();
  sky.fillGradientStyle(
    toPhaserColor(PALETTE.sky),
    toPhaserColor(PALETTE.sky),
    toPhaserColor(PALETTE.skyLow),
    toPhaserColor(PALETTE.skyLow),
    1,
  );
  sky.fillRect(0, 0, width, height);
  sky.setScrollFactor(0).setDepth(-100);

  // morros distantes
  const hills = scene.add.graphics();
  hills.fillStyle(toPhaserColor(PALETTE.grassDark), 1);
  for (let x = -200; x < worldWidth; x += 340) {
    hills.fillEllipse(x, height - 80, 540, 260);
  }
  hills.setScrollFactor(0.2).setDepth(-90);

  // muro da quadra
  const wall = scene.add.graphics();
  wall.fillStyle(toPhaserColor(PALETTE.wall), 1);
  wall.fillRect(0, height - 190, worldWidth, 120);
  wall.lineStyle(2, toPhaserColor(PALETTE.steel), 0.22);
  for (let y = height - 190; y < height - 70; y += 24) {
    wall.lineBetween(0, y, worldWidth, y);
  }
  wall.setScrollFactor(0.6).setDepth(-80);

  // mangueiras
  const trees = scene.add.graphics();
  for (let x = 180; x < worldWidth; x += 430) {
    trees.fillStyle(toPhaserColor(PALETTE.dirt), 1);
    trees.fillRect(x, height - 230, 16, 95);
    trees.fillStyle(toPhaserColor(PALETTE.grass), 1);
    trees.fillCircle(x + 8, height - 248, 54);
    trees.fillCircle(x - 30, height - 218, 38);
    trees.fillCircle(x + 46, height - 218, 38);
  }
  trees.setScrollFactor(0.8).setDepth(-70);

  // faixa de grama rente ao chão
  const grass = scene.add.graphics();
  grass.fillStyle(toPhaserColor(PALETTE.grass), 1);
  grass.fillRect(0, height - 70, worldWidth, 70);
  grass.setDepth(-60);
}
```

`fillGradientStyle` só faz degradê no renderer WebGL; no fallback Canvas o céu
sai numa cor só. Não é bug e não vale código extra para tratar — `Phaser.AUTO`
escolhe WebGL em qualquer aparelho dos últimos dez anos.

- [ ] **Step 2: Ligue o cenário e recolora as plataformas**

Em `src/game/scenes/LevelScene.ts`, acrescente ao bloco de imports:

```ts
import { PALETTE, toPhaserColor } from '@/theme/palette';
import { createBackdrop } from '@/game/art/backdrop';
```

Troque a primeira linha de `create()`:

```ts
    this.cameras.main.setBackgroundColor(PALETTE.sky);
    createBackdrop(this, LEVEL_1_1.worldWidth);
```

E troque `addPlatform` inteiro por:

```ts
  /** Corpo de terra com capim em cima. Só o corpo entra na colisão. */
  private addPlatform(
    group: Phaser.Physics.Arcade.StaticGroup,
    spec: PlatformSpec,
  ): void {
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
```

O capim é decoração e **não** entra no grupo estático — se entrasse, viraria uma
segunda plataforma flutuando 4 px acima da real e o jogador ficaria preso nela.

- [ ] **Step 3: Ajuste a cor de fundo do canvas**

Em `src/game/config.ts`, importe a paleta e troque a cor:

```ts
import { PALETTE } from '@/theme/palette';
```

```ts
    backgroundColor: PALETTE.sky,
```

Isso evita o flash azul-escuro de um frame entre o canvas montar e o céu ser
desenhado.

- [ ] **Step 4: Rode o portão**

Run: `npx tsc -b && npm run lint && npm run test`
Expected: sem erro, 41 testes passando

- [ ] **Step 5: Olhe o jogo**

Run: `npm run dev`

- O fundo é céu claro com morros verdes, muro bege e mangueiras — não é mais azul-escuro liso.
- Correndo para a direita, o muro e as árvores andam **mais devagar** que as plataformas, e os morros mais devagar ainda.
- O céu não se move.
- As plataformas são de terra com capim em cima, e o jogador pisa **no topo do capim**, sem afundar nem flutuar.
- O console do navegador está limpo.

- [ ] **Step 6: Commit**

```bash
git add src/game/art/backdrop.ts src/game/scenes/LevelScene.ts src/game/config.ts
git commit -m "feat: cenario do Quintal da Escola com parallax de quatro camadas"
```

---

## Ao fim desta fase

- A tela de título tem hierarquia, retratos de verdade e explicação dos modos.
- O personagem parece um aluno de uniforme, e a escolha da tela de título vale dentro do jogo.
- A fase tem cenário com profundidade.
- Cor é definida em um lugar só.

O que **não** está feito e é o assunto da fase seguinte: as contas. Ver
`2026-08-16-math-runner-fase-3-desafios.md`.
