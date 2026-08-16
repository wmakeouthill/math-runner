# Math Runner — Fase 0 + Fase 1 · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ter um projeto Vite + React + Phaser rodando no PC e no celular, instalável como PWA, com um personagem que corre e pula com game feel de qualidade (coyote time, jump buffer, pulo variável).

**Architecture:** Build 100% estático, sem backend. React renderiza a shell (tela de título com o cabeçalho da escola, HUD, futuros menus) e o Phaser renderiza apenas o canvas do jogo; Zustand é a ponte entre os dois e persiste o progresso em `localStorage`. A lógica de game feel fica em classes TypeScript puras, fora do Phaser — é o que torna o pulo testável com Vitest sem precisar de headless browser.

**Tech Stack:** Vite · React 19 · TypeScript (strict) · Phaser 3 · Zustand (+ `persist`) · vite-plugin-pwa · Vitest

**Spec:** [`SPEC.md`](../../../SPEC.md)

## Global Constraints

Valem para **todas** as tasks. Copiados do `SPEC.md` e das regras do projeto:

- **TypeScript `strict: true`. `any` é proibido.** Sem exceções, inclusive em testes.
- **Nenhum arquivo passa de 200 linhas.** Se passar, divida por responsabilidade.
- **Sem backend, sem banco, sem login.** Persistência só em `localStorage`.
- **Separação de arquivos React:** `Component.tsx` / `Component.styles.ts` / `Component.hooks.ts` / `Component.types.ts`. Zero lógica dentro do JSX.
- **Estado global de cliente via Zustand.** Não existe server state neste projeto, então **não** instale TanStack Query.
- **Nunca renderize UI dentro do Phaser.** Texto, botões e menus são React/HTML. O Phaser desenha só o mundo do jogo.
- **Nomes fixos que aparecem na tela:** alunos `Junior` e `Ana`; escola `Escola Euclides da Cunha`; título `Math Runner`; subtítulo `O Resgate dos Números`; ano `2026`.
- **Commits sem trailer de coautoria.** Nada de `Co-Authored-By`, `Generated with` ou assinatura de ferramenta. O trabalho é do Junior e da Ana.
- **Resolução base do jogo:** `960 x 540`, escala `FIT`, orientação `landscape`.
- **Commits pequenos**, um por task no mínimo, em português, prefixo `feat:` / `test:` / `chore:`.

---

## Estrutura de arquivos

Mapa do que existe ao fim da Fase 1. Cada arquivo tem uma responsabilidade só.

```
math-runner/
├─ index.html                       # div#root, <title>, meta viewport
├─ vite.config.ts                   # React + PWA + alias @
├─ tsconfig.json                    # strict
├─ vitest.config.ts                 # ambiente jsdom
├─ public/
│  └─ icons/                        # icon-192.png, icon-512.png, icon-maskable-512.png
├─ src/
│  ├─ main.tsx                      # monta o React
│  ├─ app/
│  │  ├─ App.tsx                    # roteia entre Title e Game (estado da store)
│  │  ├─ Title/
│  │  │  ├─ Title.tsx               # tela de título + CABEÇALHO (alunos/escola)
│  │  │  └─ Title.styles.ts
│  │  └─ GameCanvas/
│  │     ├─ GameCanvas.tsx          # monta/destrói a instância do Phaser
│  │     └─ GameCanvas.hooks.ts     # usePhaserGame()
│  ├─ store/
│  │  ├─ useGameStore.ts            # Zustand + persist
│  │  └─ useGameStore.types.ts
│  └─ game/
│     ├─ config.ts                  # Phaser.Types.Core.GameConfig
│     ├─ constants.ts               # ⚙ botões de calibragem do game feel
│     ├─ scenes/
│     │  └─ LevelScene.ts           # cenário de teste + player
│     └─ systems/
│        ├─ JumpController.ts       # coyote + buffer + pulo variável (puro)
│        ├─ JumpController.types.ts
│        ├─ touchZones.ts           # mapeia toque → ação (puro)
│        └─ InputSystem.ts          # teclado + multi-touch → InputState
└─ tests/
   ├─ store/useGameStore.test.ts
   └─ game/
      ├─ JumpController.test.ts
      └─ touchZones.test.ts
```

**Por que a lógica de pulo fica fora do Phaser:** testar cena de Phaser exige
canvas/WebGL headless, é lento e frágil. `JumpController` é uma classe pura que
recebe `dt`, `grounded` e o estado do input, e devolve um comando. Isso roda em
Vitest em milissegundos e é exatamente onde os bugs de game feel moram. A cena
só traduz o comando em velocidade.

---

### Task 1: Scaffold — Vite + React 19 + TS strict + Vitest

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `src/main.tsx`, `src/app/App.tsx`, `.gitignore`
- Test: `tests/smoke.test.ts`

**Interfaces:**
- Consumes: nada (primeira task)
- Produces: projeto que roda `npm run dev`, `npm run build`, `npm run test`. Alias `@` → `src/`.

- [ ] **Step 1: Criar o projeto e instalar dependências**

```bash
npm create vite@latest . -- --template react-ts
npm install phaser zustand
npm install -D vitest jsdom @vitest/coverage-v8 vite-plugin-pwa
```

- [ ] **Step 2: Ativar strict e o alias no `tsconfig.json`**

Garanta que `compilerOptions` contenha exatamente estes valores (adicione os que faltarem):

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

- [ ] **Step 3: Configurar Vite com o alias**

`vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
```

- [ ] **Step 4: Configurar o Vitest**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
```

Adicione ao `package.json` em `scripts`:

```jsonc
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 5: Escrever o teste de fumaça**

`tests/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

describe('ambiente de testes', () => {
  it('roda TypeScript e tem DOM disponível', () => {
    const div: HTMLDivElement = document.createElement('div');
    div.textContent = 'Math Runner';
    expect(div.textContent).toBe('Math Runner');
  });
});
```

- [ ] **Step 6: Rodar o teste**

Run: `npm run test`
Expected: PASS — 1 teste.

- [ ] **Step 7: Substituir `index.html`**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
    />
    <meta name="theme-color" content="#0b1020" />
    <title>Math Runner: O Resgate dos Números</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`maximum-scale=1.0, user-scalable=no` evita o zoom por duplo-toque no celular, que
atrapalha muito num jogo de plataforma.

- [ ] **Step 8: `src/main.tsx` e `src/app/App.tsx` mínimos**

`src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Elemento #root não encontrado');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`src/app/App.tsx`:

```tsx
export function App() {
  return <h1>Math Runner</h1>;
}
```

Apague `src/App.tsx`, `src/App.css` e `src/assets/react.svg` que vieram do template.
Deixe `src/index.css` com apenas:

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; overflow: hidden; }
body { background: #0b1020; color: #e8ecff; font-family: system-ui, sans-serif; }
```

- [ ] **Step 9: Verificar build e dev**

Run: `npm run build`
Expected: build conclui sem erro de tipo.

Run: `npm run dev`
Expected: abre em `http://localhost:5173` mostrando "Math Runner" em fundo escuro.

- [ ] **Step 10: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + React 19 + TypeScript strict + Vitest"
```

---

### Task 2: Store de progresso (Zustand + localStorage)

**Files:**
- Create: `src/store/useGameStore.types.ts`, `src/store/useGameStore.ts`
- Test: `tests/store/useGameStore.test.ts`

**Interfaces:**
- Consumes: alias `@` da Task 1.
- Produces:
  - `type LevelId = string` (formato `"1-1"`)
  - `type LevelResult = { stars: number; errors: number; timeMs: number }`
  - `type Screen = 'title' | 'game'`
  - `type CharacterId = 'ana' | 'junior'`
  - `type GameMode = 'aventura' | 'explorador'`
  - `useGameStore` com estado `{ screen, currentLevel, progress, character, mode }`
    e ações `goToScreen(screen: Screen): void`, `startLevel(id: LevelId): void`,
    `completeLevel(id: LevelId, result: LevelResult): void`,
    `isUnlocked(id: LevelId): boolean`, `setCharacter(id: CharacterId): void`,
    `setMode(mode: GameMode): void`, `resetProgress(): void`.

`character` e `mode` entram já nesta task mesmo sem serem usados até a Task 7:
eles vão para o `localStorage`, e mexer num schema já persistido depois dá
trabalho de migração à toa.

- [ ] **Step 1: Escrever os tipos**

`src/store/useGameStore.types.ts`:

```ts
export type LevelId = string;

export type Screen = 'title' | 'game';

/** Os personagens jogáveis são os próprios autores do trabalho. */
export type CharacterId = 'ana' | 'junior';

/** 'aventura' tem guardiões e corações; 'explorador' só tem obstáculos. */
export type GameMode = 'aventura' | 'explorador';

export type LevelResult = {
  stars: number;
  errors: number;
  timeMs: number;
};

export type GameState = {
  screen: Screen;
  currentLevel: LevelId | null;
  progress: Record<LevelId, LevelResult>;
  character: CharacterId;
  mode: GameMode;
  goToScreen: (screen: Screen) => void;
  startLevel: (id: LevelId) => void;
  completeLevel: (id: LevelId, result: LevelResult) => void;
  isUnlocked: (id: LevelId) => boolean;
  setCharacter: (id: CharacterId) => void;
  setMode: (mode: GameMode) => void;
  resetProgress: () => void;
};
```

- [ ] **Step 2: Escrever os testes que falham**

`tests/store/useGameStore.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/useGameStore';

const get = () => useGameStore.getState();

describe('useGameStore', () => {
  beforeEach(() => {
    localStorage.clear();
    get().resetProgress();
    get().goToScreen('title');
    get().setCharacter('ana');
    get().setMode('aventura');
  });

  it('começa na tela de título sem fase ativa', () => {
    expect(get().screen).toBe('title');
    expect(get().currentLevel).toBeNull();
  });

  it('startLevel muda para a tela de jogo e marca a fase atual', () => {
    get().startLevel('1-1');
    expect(get().screen).toBe('game');
    expect(get().currentLevel).toBe('1-1');
  });

  it('a fase 1-1 já começa desbloqueada', () => {
    expect(get().isUnlocked('1-1')).toBe(true);
  });

  it('a fase 1-2 só desbloqueia depois de completar a 1-1', () => {
    expect(get().isUnlocked('1-2')).toBe(false);
    get().completeLevel('1-1', { stars: 1, errors: 3, timeMs: 40_000 });
    expect(get().isUnlocked('1-2')).toBe(true);
  });

  it('guarda o melhor resultado, nunca piora o já conquistado', () => {
    get().completeLevel('1-1', { stars: 3, errors: 0, timeMs: 30_000 });
    get().completeLevel('1-1', { stars: 1, errors: 5, timeMs: 90_000 });

    const best = get().progress['1-1'];
    expect(best).toEqual({ stars: 3, errors: 0, timeMs: 30_000 });
  });

  it('melhora o resultado quando o jogador vai melhor', () => {
    get().completeLevel('1-1', { stars: 1, errors: 4, timeMs: 80_000 });
    get().completeLevel('1-1', { stars: 3, errors: 0, timeMs: 25_000 });

    expect(get().progress['1-1']).toEqual({ stars: 3, errors: 0, timeMs: 25_000 });
  });

  it('persiste o progresso em localStorage', () => {
    get().completeLevel('1-1', { stars: 2, errors: 1, timeMs: 50_000 });
    const raw = localStorage.getItem('math-runner-progress');
    expect(raw).toContain('1-1');
  });

  it('troca o personagem escolhido', () => {
    get().setCharacter('junior');
    expect(get().character).toBe('junior');
  });

  it('começa no modo aventura, com guardiões ligados', () => {
    expect(get().mode).toBe('aventura');
  });

  it('troca para o modo explorador, sem guardiões', () => {
    get().setMode('explorador');
    expect(get().mode).toBe('explorador');
  });

  it('persiste personagem e modo em localStorage', () => {
    get().setCharacter('junior');
    get().setMode('explorador');

    const raw = localStorage.getItem('math-runner-progress');
    expect(raw).toContain('junior');
    expect(raw).toContain('explorador');
  });

  it('resetProgress não apaga a escolha de personagem e modo', () => {
    get().setCharacter('junior');
    get().setMode('explorador');
    get().resetProgress();

    expect(get().character).toBe('junior');
    expect(get().mode).toBe('explorador');
  });
});
```

- [ ] **Step 3: Rodar os testes e confirmar que falham**

Run: `npm run test -- useGameStore`
Expected: FAIL — `Failed to resolve import "@/store/useGameStore"`.

- [ ] **Step 4: Implementar a store**

`src/store/useGameStore.ts`:

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameState, LevelId, LevelResult } from './useGameStore.types';


const FIRST_LEVEL: LevelId = '1-1';

function previousLevel(id: LevelId): LevelId | null {
  const [world, index] = id.split('-').map(Number);
  if (world === undefined || index === undefined) return null;
  if (index <= 1) return null;
  return `${world}-${index - 1}`;
}

function isBetter(next: LevelResult, current: LevelResult): boolean {
  if (next.stars !== current.stars) return next.stars > current.stars;
  return next.timeMs < current.timeMs;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'title',
      currentLevel: null,
      progress: {},
      character: 'ana',
      mode: 'aventura',

      goToScreen: (screen) => set({ screen }),

      startLevel: (id) => set({ screen: 'game', currentLevel: id }),

      completeLevel: (id, result) =>
        set((state) => {
          const current = state.progress[id];
          if (current && !isBetter(result, current)) return state;
          return { progress: { ...state.progress, [id]: result } };
        }),

      isUnlocked: (id) => {
        if (id === FIRST_LEVEL) return true;
        const previous = previousLevel(id);
        if (previous === null) return false;
        return get().progress[previous] !== undefined;
      },

      setCharacter: (character) => set({ character }),

      setMode: (mode) => set({ mode }),

      resetProgress: () => set({ progress: {}, currentLevel: null }),
    }),
    {
      name: 'math-runner-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        progress: state.progress,
        character: state.character,
        mode: state.mode,
      }),
    },
  ),
);
```

`partialize` guarda progresso, personagem e modo — e **não** guarda `screen`.
Salvar `screen` faria o jogo reabrir direto numa fase, pulando a tela de título,
e o cabeçalho com os nomes dos alunos precisa aparecer sempre que o jogo abre.

- [ ] **Step 5: Rodar os testes**

Run: `npm run test -- useGameStore`
Expected: PASS — 12 testes.

- [ ] **Step 6: Commit**

```bash
git add src/store tests/store
git commit -m "feat: store de progresso com persistencia em localStorage"
```

---

### Task 3: JumpController — coyote time, jump buffer e pulo variável

**Files:**
- Create: `src/game/constants.ts`, `src/game/systems/JumpController.types.ts`, `src/game/systems/JumpController.ts`
- Test: `tests/game/JumpController.test.ts`

**Interfaces:**
- Consumes: nada além do alias `@`.
- Produces:
  - `type JumpInput = { justPressed: boolean; justReleased: boolean }`
  - `type JumpCommand = { type: 'none' } | { type: 'start' } | { type: 'cut' }`
  - `class JumpController` com `update(dtMs: number, grounded: boolean, input: JumpInput, velocityY: number): JumpCommand` e `reset(): void`
  - `GAME_FEEL` de `constants.ts` com `coyoteMs`, `jumpBufferMs`, `jumpCutMultiplier`, `moveSpeed`, `jumpVelocity`, `gravityY`

**Convenção de eixo:** no Phaser o Y cresce para baixo. Subir é `velocityY < 0`.

- [ ] **Step 1: Escrever as constantes de calibragem**

`src/game/constants.ts`:

```ts
/**
 * ⚙ Botões de calibragem do game feel.
 * Estes números são para SENTIR, não para deduzir: mexa neles com o jogo
 * aberto até o pulo ficar gostoso. Os valores abaixo são o ponto de partida.
 *
 * Com gravityY 1800 e jumpVelocity -700, o pulo chega a ~136px de altura
 * (≈ 4 tiles de 32px) em ~0,39s de subida.
 */
export const GAME_FEEL = {
  /** Janela em que ainda dá para pular depois de sair da beirada. */
  coyoteMs: 100,
  /** Janela em que um pulo apertado cedo demais fica guardado. */
  jumpBufferMs: 120,
  /** Quanto da velocidade de subida sobra ao soltar o botão cedo. */
  jumpCutMultiplier: 0.4,
  moveSpeed: 260,
  jumpVelocity: -700,
  gravityY: 1800,
} as const;

export const GAME_SIZE = { width: 960, height: 540 } as const;
```

- [ ] **Step 2: Escrever os tipos**

`src/game/systems/JumpController.types.ts`:

```ts
export type JumpInput = {
  justPressed: boolean;
  justReleased: boolean;
};

export type JumpCommand =
  | { type: 'none' }
  | { type: 'start' }
  | { type: 'cut' };
```

- [ ] **Step 3: Escrever os testes que falham**

`tests/game/JumpController.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { JumpController } from '@/game/systems/JumpController';
import type { JumpInput } from '@/game/systems/JumpController.types';

const IDLE: JumpInput = { justPressed: false, justReleased: false };
const PRESS: JumpInput = { justPressed: true, justReleased: false };
const RELEASE: JumpInput = { justPressed: false, justReleased: true };

const FRAME = 16;
const FALLING = 200;
const RISING = -400;

describe('JumpController', () => {
  let jump: JumpController;

  beforeEach(() => {
    jump = new JumpController();
  });

  it('pula quando aperta no chão', () => {
    expect(jump.update(FRAME, true, PRESS, 0)).toEqual({ type: 'start' });
  });

  it('não pula sem apertar', () => {
    expect(jump.update(FRAME, true, IDLE, 0)).toEqual({ type: 'none' });
  });

  it('coyote time: pula até 100ms depois de sair da beirada', () => {
    jump.update(FRAME, true, IDLE, 0);
    jump.update(80, false, IDLE, FALLING);
    expect(jump.update(FRAME, false, PRESS, FALLING)).toEqual({ type: 'start' });
  });

  it('coyote time expira depois da janela', () => {
    jump.update(FRAME, true, IDLE, 0);
    jump.update(150, false, IDLE, FALLING);
    expect(jump.update(FRAME, false, PRESS, FALLING)).toEqual({ type: 'none' });
  });

  it('jump buffer: apertou no ar e pula ao encostar no chão', () => {
    jump.update(FRAME, false, PRESS, FALLING);
    expect(jump.update(100, true, IDLE, 0)).toEqual({ type: 'start' });
  });

  it('jump buffer expira depois da janela', () => {
    jump.update(FRAME, false, PRESS, FALLING);
    expect(jump.update(200, true, IDLE, 0)).toEqual({ type: 'none' });
  });

  it('não permite pulo duplo', () => {
    expect(jump.update(FRAME, true, PRESS, 0)).toEqual({ type: 'start' });
    expect(jump.update(FRAME, false, PRESS, RISING)).toEqual({ type: 'none' });
  });

  it('corta o pulo ao soltar o botão durante a subida', () => {
    expect(jump.update(FRAME, false, RELEASE, RISING)).toEqual({ type: 'cut' });
  });

  it('não corta o pulo ao soltar durante a queda', () => {
    expect(jump.update(FRAME, false, RELEASE, FALLING)).toEqual({ type: 'none' });
  });

  it('reset limpa as janelas pendentes', () => {
    jump.update(FRAME, false, PRESS, FALLING);
    jump.reset();
    expect(jump.update(FRAME, true, IDLE, 0)).toEqual({ type: 'none' });
  });
});
```

- [ ] **Step 4: Rodar os testes e confirmar que falham**

Run: `npm run test -- JumpController`
Expected: FAIL — `Failed to resolve import "@/game/systems/JumpController"`.

- [ ] **Step 5: Implementar o controlador**

`src/game/systems/JumpController.ts`:

```ts
import { GAME_FEEL } from '@/game/constants';
import type { JumpCommand, JumpInput } from './JumpController.types';

/**
 * Decide QUANDO pular. Não conhece Phaser, não toca em sprite nem em física —
 * só devolve um comando. É o que torna o game feel testável.
 */
export class JumpController {
  private coyoteMs = 0;
  private bufferMs = 0;

  update(
    dtMs: number,
    grounded: boolean,
    input: JumpInput,
    velocityY: number,
  ): JumpCommand {
    this.coyoteMs = grounded
      ? GAME_FEEL.coyoteMs
      : Math.max(0, this.coyoteMs - dtMs);

    this.bufferMs = input.justPressed
      ? GAME_FEEL.jumpBufferMs
      : Math.max(0, this.bufferMs - dtMs);

    if (this.bufferMs > 0 && this.coyoteMs > 0) {
      this.bufferMs = 0;
      this.coyoteMs = 0;
      return { type: 'start' };
    }

    if (input.justReleased && velocityY < 0) {
      return { type: 'cut' };
    }

    return { type: 'none' };
  }

  reset(): void {
    this.coyoteMs = 0;
    this.bufferMs = 0;
  }
}
```

Zerar as **duas** janelas ao pular é o que impede o pulo duplo: sem zerar o
`coyoteMs`, o buffer ainda válido dispararia um segundo pulo no frame seguinte.

- [ ] **Step 6: Rodar os testes**

Run: `npm run test -- JumpController`
Expected: PASS — 10 testes.

- [ ] **Step 7: Commit**

```bash
git add src/game tests/game
git commit -m "feat: JumpController com coyote time, jump buffer e pulo variavel"
```

---

### Task 4: Zonas de toque (controle no celular)

**Files:**
- Create: `src/game/systems/touchZones.ts`
- Test: `tests/game/touchZones.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `type TouchAction = 'left' | 'right' | 'jump'` e
  `function touchZone(x: number, width: number): TouchAction`

Layout: metade esquerda da tela é o d-pad (primeiro quarto = esquerda, segundo
quarto = direita); metade direita inteira é o pulo — alvo enorme, difícil de errar
com o polegar.

- [ ] **Step 1: Escrever os testes que falham**

`tests/game/touchZones.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { touchZone } from '@/game/systems/touchZones';

const WIDTH = 960;

describe('touchZone', () => {
  it('primeiro quarto da tela move para a esquerda', () => {
    expect(touchZone(10, WIDTH)).toBe('left');
    expect(touchZone(239, WIDTH)).toBe('left');
  });

  it('segundo quarto da tela move para a direita', () => {
    expect(touchZone(240, WIDTH)).toBe('right');
    expect(touchZone(479, WIDTH)).toBe('right');
  });

  it('toda a metade direita pula', () => {
    expect(touchZone(480, WIDTH)).toBe('jump');
    expect(touchZone(959, WIDTH)).toBe('jump');
  });

  it('funciona em qualquer largura de tela', () => {
    expect(touchZone(50, 400)).toBe('left');
    expect(touchZone(150, 400)).toBe('right');
    expect(touchZone(300, 400)).toBe('jump');
  });
});
```

- [ ] **Step 2: Rodar os testes e confirmar que falham**

Run: `npm run test -- touchZones`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar**

`src/game/systems/touchZones.ts`:

```ts
export type TouchAction = 'left' | 'right' | 'jump';

/**
 * Metade esquerda = d-pad (quarto 1 esquerda, quarto 2 direita).
 * Metade direita inteira = pulo.
 */
export function touchZone(x: number, width: number): TouchAction {
  if (x >= width / 2) return 'jump';
  return x < width / 4 ? 'left' : 'right';
}
```

- [ ] **Step 4: Rodar os testes**

Run: `npm run test -- touchZones`
Expected: PASS — 4 testes.

- [ ] **Step 5: Commit**

```bash
git add src/game/systems/touchZones.ts tests/game/touchZones.test.ts
git commit -m "feat: mapeamento de zonas de toque para controle no celular"
```

---

### Task 5: InputSystem — teclado + multi-touch

**Files:**
- Create: `src/game/systems/InputSystem.ts`

**Interfaces:**
- Consumes: `touchZone` (Task 4).
- Produces:
  - `type InputState = { left: boolean; right: boolean; jumpJustPressed: boolean; jumpJustReleased: boolean }`
  - `class InputSystem` com `constructor(scene: Phaser.Scene)`, `read(): InputState`, `endFrame(): void`

⚠️ **O bug clássico é multi-touch.** Se você tratar os toques como um só, apertar
pulo com o polegar direito cancela o movimento do polegar esquerdo. A solução é
rastrear cada `pointer.id` separadamente — é o que o `Map` abaixo faz.

- [ ] **Step 1: Implementar o sistema de input**

`src/game/systems/InputSystem.ts`:

```ts
import Phaser from 'phaser';
import { touchZone, type TouchAction } from './touchZones';

export type InputState = {
  left: boolean;
  right: boolean;
  jumpJustPressed: boolean;
  jumpJustReleased: boolean;
};

export class InputSystem {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keyA: Phaser.Input.Keyboard.Key;
  private readonly keyD: Phaser.Input.Keyboard.Key;
  private readonly keySpace: Phaser.Input.Keyboard.Key;
  /** pointer.id → ação que aquele dedo está segurando. */
  private readonly touches = new Map<number, TouchAction>();
  private touchJumpPressed = false;
  private touchJumpReleased = false;

  constructor(private readonly scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error('Teclado indisponível nesta cena');

    this.cursors = keyboard.createCursorKeys();
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    scene.input.addPointer(3);
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    const action = touchZone(pointer.x, this.scene.scale.width);
    this.touches.set(pointer.id, action);
    if (action === 'jump') this.touchJumpPressed = true;
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.touches.get(pointer.id) === 'jump') this.touchJumpReleased = true;
    this.touches.delete(pointer.id);
  }

  private isTouching(action: TouchAction): boolean {
    for (const held of this.touches.values()) {
      if (held === action) return true;
    }
    return false;
  }

  read(): InputState {
    const jumpKeys = [this.cursors.up, this.cursors.space, this.keySpace];

    return {
      left: this.cursors.left.isDown || this.keyA.isDown || this.isTouching('left'),
      right: this.cursors.right.isDown || this.keyD.isDown || this.isTouching('right'),
      jumpJustPressed:
        jumpKeys.some((key) => Phaser.Input.Keyboard.JustDown(key)) ||
        this.touchJumpPressed,
      jumpJustReleased:
        jumpKeys.some((key) => Phaser.Input.Keyboard.JustUp(key)) ||
        this.touchJumpReleased,
    };
  }

  /** Chame no fim de cada update para limpar os eventos de toque do frame. */
  endFrame(): void {
    this.touchJumpPressed = false;
    this.touchJumpReleased = false;
  }

  destroy(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
    this.touches.clear();
  }
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/game/systems/InputSystem.ts
git commit -m "feat: InputSystem com teclado e multi-touch por pointer id"
```

---

### Task 6: LevelScene — o personagem correndo e pulando

**Files:**
- Create: `src/game/config.ts`, `src/game/scenes/LevelScene.ts`

**Interfaces:**
- Consumes: `GAME_FEEL`, `GAME_SIZE` (Task 3), `JumpController` (Task 3), `InputSystem` (Task 5).
- Produces: `createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig`

Sem assets ainda: o player é um retângulo e o chão são plataformas geradas por
código. Isso mantém a task focada em **game feel**, que é o que precisa ser
sentido. Sprites da Kenney entram na Fase 2.

- [ ] **Step 1: Escrever a cena**

`src/game/scenes/LevelScene.ts`:

```ts
import Phaser from 'phaser';
import { GAME_FEEL, GAME_SIZE } from '@/game/constants';
import { JumpController } from '@/game/systems/JumpController';
import { InputSystem } from '@/game/systems/InputSystem';

const GROUND_Y = GAME_SIZE.height - 40;

export class LevelScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private input!: InputSystem;
  private readonly jump = new JumpController();

  constructor() {
    super('LevelScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0b1020');

    const platforms = this.physics.add.staticGroup();
    this.addPlatform(platforms, 480, GROUND_Y, 700, 40);
    this.addPlatform(platforms, 1250, GROUND_Y, 500, 40);
    this.addPlatform(platforms, 900, GROUND_Y - 150, 160, 24);
    this.addPlatform(platforms, 1150, GROUND_Y - 280, 160, 24);

    this.player = this.physics.add.sprite(120, GROUND_Y - 120, '');
    this.player.setDisplaySize(32, 48);
    this.player.setTintFill(0x6ee7ff);
    this.player.setCollideWorldBounds(false);
    this.physics.add.collider(this.player, platforms);

    this.physics.world.setBounds(0, 0, 1600, GAME_SIZE.height);
    this.cameras.main.setBounds(0, 0, 1600, GAME_SIZE.height);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setFollowOffset(-80, 0);

    this.input = new InputSystem(this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.destroy());
  }

  /** Retângulo estático simples — sem textura, só cor. */
  private addPlatform(
    group: Phaser.Physics.Arcade.StaticGroup,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const rect = this.add.rectangle(x, y, width, height, 0x2b3a67);
    group.add(rect);
  }

  override update(_time: number, delta: number): void {
    const state = this.input.read();
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

    this.input.endFrame();
  }

  private respawn(): void {
    this.player.setPosition(120, GROUND_Y - 120);
    this.player.setVelocity(0, 0);
    this.jump.reset();
  }
}
```

- [ ] **Step 2: Escrever a configuração do Phaser**

`src/game/config.ts`:

```ts
import Phaser from 'phaser';
import { GAME_FEEL, GAME_SIZE } from './constants';
import { LevelScene } from './scenes/LevelScene';

export function createGameConfig(
  parent: HTMLElement,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#0b1020',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_SIZE.width,
      height: GAME_SIZE.height,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: GAME_FEEL.gravityY }, debug: false },
    },
    scene: [LevelScene],
  };
}
```

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/game/config.ts src/game/scenes
git commit -m "feat: LevelScene com player, plataformas e camera com look-ahead"
```

---

### Task 7: Shell React — tela de título com o cabeçalho da escola

**Files:**
- Create: `src/app/Title/Title.tsx`, `src/app/Title/Title.styles.ts`, `src/app/GameCanvas/GameCanvas.hooks.ts`, `src/app/GameCanvas/GameCanvas.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `useGameStore` (Task 2), `createGameConfig` (Task 6).
- Produces: `Title`, `GameCanvas`, e `App` alternando entre os dois via `screen` da store.

⚠️ **React 19 + StrictMode executa os efeitos duas vezes no dev.** Sem o
`destroy` no cleanup, você acaba com dois jogos Phaser rodando ao mesmo tempo,
input duplicado e uma tarde perdida. O hook abaixo já trata isso.

- [ ] **Step 1: Escrever o hook do Phaser**

`src/app/GameCanvas/GameCanvas.hooks.ts`:

```ts
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '@/game/config';

export function usePhaserGame(): React.RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const game = new Phaser.Game(createGameConfig(container));

    // StrictMode roda este efeito duas vezes no dev; sem destroy sobram
    // duas instâncias do jogo disputando o mesmo input.
    return () => {
      game.destroy(true);
    };
  }, []);

  return containerRef;
}
```

- [ ] **Step 2: Escrever o componente do canvas**

`src/app/GameCanvas/GameCanvas.tsx`:

```tsx
import { usePhaserGame } from './GameCanvas.hooks';

export function GameCanvas() {
  const containerRef = usePhaserGame();
  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
```

- [ ] **Step 3: Escrever os estilos da tela de título**

`src/app/Title/Title.styles.ts`:

```ts
import type { CSSProperties } from 'react';

export const styles = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.2rem',
    height: '100%',
    padding: '1.5rem',
    textAlign: 'center',
    overflowY: 'auto',
  },
  title: {
    fontSize: 'clamp(2rem, 8vw, 4rem)',
    letterSpacing: '0.12em',
    color: '#6ee7ff',
  },
  subtitle: {
    fontSize: 'clamp(0.9rem, 3vw, 1.4rem)',
    color: '#a9b6e8',
  },
  divider: {
    width: 'min(320px, 70vw)',
    height: '1px',
    background: '#2b3a67',
  },
  credits: {
    fontSize: 'clamp(0.8rem, 2.4vw, 1rem)',
    color: '#8b98c9',
    lineHeight: 1.7,
  },
  label: {
    fontSize: '0.8rem',
    letterSpacing: '0.18em',
    color: '#6b78a9',
  },
  row: {
    display: 'flex',
    gap: '0.75rem',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.7rem 1.4rem',
    fontSize: '1rem',
    color: '#e8ecff',
    background: 'transparent',
    border: '2px solid #2b3a67',
    borderRadius: '0.75rem',
    cursor: 'pointer',
  },
  cardSelected: {
    borderColor: '#6ee7ff',
    background: '#16224a',
  },
  /** Placeholder do uniforme: corpo branco com faixa marinho na gola. */
  avatar: {
    width: '2.5rem',
    height: '3.25rem',
    borderRadius: '0.3rem',
    background: '#f2f5ff',
    borderTop: '0.6rem solid #1b2a5e',
    borderBottom: '1rem solid #141f42',
  },
  playButton: {
    padding: '0.9rem 3rem',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#0b1020',
    background: '#6ee7ff',
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
  },
} satisfies Record<string, CSSProperties>;
```

O `avatar` aqui é placeholder: já lê como uniforme (branco com gola marinho e
short marinho), mas os retratos desenhados da Ana e do Junior entram na Fase 2,
junto com o resto da arte. Não gaste tempo com arte nesta fase.

- [ ] **Step 4: Escrever a tela de título com cabeçalho, personagem e modo**

`src/app/Title/Title.tsx`:

```tsx
import { useGameStore } from '@/store/useGameStore';
import type { CharacterId, GameMode } from '@/store/useGameStore.types';
import { styles } from './Title.styles';

const CHARACTERS: ReadonlyArray<{ id: CharacterId; label: string }> = [
  { id: 'ana', label: 'Ana' },
  { id: 'junior', label: 'Junior' },
];

const MODES: ReadonlyArray<{ id: GameMode; label: string }> = [
  { id: 'aventura', label: 'Aventura' },
  { id: 'explorador', label: 'Explorador' },
];

export function Title() {
  const startLevel = useGameStore((state) => state.startLevel);
  const character = useGameStore((state) => state.character);
  const setCharacter = useGameStore((state) => state.setCharacter);
  const mode = useGameStore((state) => state.mode);
  const setMode = useGameStore((state) => state.setMode);

  return (
    <main style={styles.screen}>
      <h1 style={styles.title}>MATH RUNNER</h1>
      <p style={styles.subtitle}>O Resgate dos Números</p>

      <div style={styles.divider} />

      <p style={styles.credits}>
        Junior · Ana
        <br />
        Escola Euclides da Cunha — 2026
      </p>

      <div style={styles.divider} />

      <p style={styles.label}>PERSONAGEM</p>
      <div style={styles.row}>
        {CHARACTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={character === option.id}
            style={
              character === option.id
                ? { ...styles.card, ...styles.cardSelected }
                : styles.card
            }
            onClick={() => setCharacter(option.id)}
          >
            <span style={styles.avatar} />
            {option.label}
          </button>
        ))}
      </div>

      <p style={styles.label}>MONSTROS</p>
      <div style={styles.row}>
        {MODES.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={mode === option.id}
            style={
              mode === option.id
                ? { ...styles.card, ...styles.cardSelected }
                : styles.card
            }
            onClick={() => setMode(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        style={styles.playButton}
        onClick={() => startLevel('1-1')}
      >
        Jogar
      </button>
    </main>
  );
}
```

`aria-pressed` não é enfeite: sem ele, quem usa leitor de tela não tem como
saber qual personagem e qual modo estão selecionados.

No modo `explorador` os guardiões não nascem na fase — mas isso só passa a ter
efeito na Fase 5, quando o primeiro guardião existir. Nesta fase o modo é apenas
escolhido e guardado.

- [ ] **Step 5: Ligar tudo no `App.tsx`**

`src/app/App.tsx`:

```tsx
import { useGameStore } from '@/store/useGameStore';
import { Title } from './Title/Title';
import { GameCanvas } from './GameCanvas/GameCanvas';

export function App() {
  const screen = useGameStore((state) => state.screen);
  return screen === 'title' ? <Title /> : <GameCanvas />;
}
```

- [ ] **Step 6: Verificar no navegador**

Run: `npm run dev`

Confira **cada** item:
- A tela de título mostra `Junior · Ana` e `Escola Euclides da Cunha — 2026`.
- Dá para escolher entre Ana e Junior, e o selecionado fica destacado.
- Dá para alternar entre Aventura e Explorador.
- Recarregar a página mantém personagem e modo escolhidos (persistência).
- Clicar em "Jogar" abre o jogo.
- `← →` / `A D` movem; `Espaço` / `↑` pulam.
- Segurar o pulo sobe mais alto que dar um toque rápido.
- Dá para pular logo depois de sair da beirada de uma plataforma (coyote time).
- Apertar pulo um pouco antes de aterrissar faz pular ao encostar (jump buffer).
- Cair no buraco reposiciona no início, sem travar.
- No console **não** aparece aviso de duas instâncias do Phaser.

- [ ] **Step 7: Commit**

```bash
git add src/app
git commit -m "feat: tela de titulo com cabecalho da escola e canvas do Phaser"
```

---

### Task 8: PWA — manifest, ícones e instalação no celular

**Files:**
- Modify: `vite.config.ts`
- Create: `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-maskable-512.png`

**Interfaces:**
- Consumes: build da Task 1.
- Produces: `dist/manifest.webmanifest` e service worker com precache dos assets.

- [ ] **Step 1: Gerar os ícones**

Três PNGs quadrados com o fundo `#0b1020` e um "√" ou "42" em `#6ee7ff`:
`icon-192.png` (192×192), `icon-512.png` (512×512) e `icon-maskable-512.png`
(512×512, com o desenho dentro dos 80% centrais — fora disso o Android corta ao
aplicar a máscara). Ferramenta rápida: <https://realfavicongenerator.net>.

- [ ] **Step 2: Adicionar o plugin PWA ao `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,json,mp3,ogg}'],
        // O bundle do Phaser passa do limite padrão de 2 MB do Workbox.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      manifest: {
        name: 'Math Runner: O Resgate dos Números',
        short_name: 'Math Runner',
        description:
          'Jogo de plataforma 2D onde você resolve contas para destravar o caminho.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#0b1020',
        theme_color: '#0b1020',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
```

- [ ] **Step 3: Verificar o build**

Run: `npm run build`
Expected: `dist/` contém `manifest.webmanifest`, `sw.js` e `workbox-*.js`.

- [ ] **Step 4: Testar a instalação de verdade**

```bash
npm run build
npm run preview -- --host
```

No **celular**, na mesma rede, abra o IP mostrado no terminal:
- O jogo abre e responde aos toques.
- Desligar o wi-fi e recarregar → **continua abrindo** (precache funcionando).

⚠️ O botão "Instalar app" do Chrome **só aparece em HTTPS**. Em `http://` pelo
IP local ele não surge — isso é esperado, não é bug. O teste de instalação real
acontece na Fase 6, depois do deploy na VPS com TLS.

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts public/icons
git commit -m "feat: PWA com manifest, icones e precache offline"
```

---

## Definição de pronto (Fase 0 + 1)

- [ ] `npm run test` passa — 27 testes.
- [ ] `npx tsc --noEmit` sem erros, zero `any` no projeto.
- [ ] `npm run build` gera `dist/` com manifest e service worker.
- [ ] Tela de título mostra `Junior · Ana` e `Escola Euclides da Cunha`.
- [ ] O pulo tem coyote time, buffer e altura variável — e **parece gostoso**.
- [ ] Funciona no toque do celular, inclusive movendo e pulando ao mesmo tempo.
- [ ] Recarrega offline depois do primeiro acesso.

## Calibragem (não pule esta parte)

Os números de `GAME_FEEL` são um ponto de partida, não um resultado. Abra o
jogo e ajuste até o pulo ficar bom — é a única parte deste plano que nenhum
teste consegue julgar por você:

| Sintoma | Ajuste |
|---|---|
| Pulo parece flutuante, lento | ↑ `gravityY` e ↑ o módulo de `jumpVelocity` |
| Pulo curto demais, não alcança | ↑ o módulo de `jumpVelocity` |
| "Apertei e não pulou" na beirada | ↑ `coyoteMs` (até ~150) |
| "Apertei antes de cair e não pulou" | ↑ `jumpBufferMs` (até ~180) |
| Pulinho curto quase não encurta | ↓ `jumpCutMultiplier` (até ~0.2) |
| Personagem escorrega, custa a parar | ↓ `moveSpeed` |

## Próxima fase

Fase 2 do `SPEC.md`: tilemap do Tiled, sprites da Kenney, colisão de tilemap,
parallax e checkpoint.
