# Math Runner — Fase 4: som, efeitos, fim de fase e o Guardião

> **Para quem executa:** implemente uma tarefa por vez, na ordem. Cada tarefa
> termina com teste rodando e commit. Pare no fim de cada tarefa para revisão.

**Goal:** dar áudio, partículas e uma comemoração de fim de fase ao jogo, deixar
a dificuldade das contas se adaptar ao aluno e trazer o Guardião Saci-Pererê
para o modo Aventura.

**Architecture:** o áudio é sintetizado em WebAudio na hora (nenhum arquivo de
som no repositório, nada para licenciar, precache do PWA continua leve). As
partículas usam uma textura de 8×8 gerada em runtime. O React continua dono de
toda a UI; o Phaser continua dono só do canvas. Nada de novo entra no bundle.

**Tech Stack:** Vite + React 19 + TypeScript strict + Phaser 3.90 + Zustand 5 +
Vitest. Sem dependências novas — nenhuma.

**Spec:** `SPEC.md`

## Estado do repositório antes desta fase

Já está implementado e commitado (`f81720c` e anteriores) — **não refaça**:

- `src/game/levels/reach.ts` — `LevelSpec`, `MechanismSpec` como união
  discriminada em `kind: 'ponte' | 'blocos' | 'porta'`, `blockStair`, `BLOCK`,
  `pointIsReachable`, `unreachablePoints`.
- `src/game/levels/index.ts` — `LEVEL_ORDER`, `LEVELS`, `levelById`, `nextLevelId`.
- `src/game/levels/level-1-1.ts` (2700 px), `level-1-2.ts` (2600 px), `level-1-3.ts` (3200 px).
- `src/game/mechanisms/` — `CalcPanel` (com variante `'porta'`), `Bridge`, `Blocks`,
  `GoldenDigit`, `Checkpoint`.
- `src/store/useRunStore.ts` — placar da partida, `starsFor`, `finish()`.
- `src/app/Hud/`, `src/app/Result/`, `src/app/LevelSelect/`, `src/app/time.ts`.
- `src/game/math/mathEngine.ts` — `generateQuestion`, `MIN_ANSWER`.

91 testes passando, `npx tsc -b` limpo, `npx oxlint src tests` limpo.

## Global Constraints

Copiadas do SPEC e das regras do trabalho. Valem em **todas** as tarefas:

- **Nenhum trailer de coautoria** em commit, comentário ou README. O trabalho é
  do Junior e da Ana. Nada de `Co-Authored-By`, nada de "Generated with".
- **Sem backend, sem banco, sem login.** Só `localStorage`.
- **Não reproduza o brasão oficial do Governo do Estado do Rio de Janeiro.**
  Use o `Crest` próprio do jogo (`src/app/Portrait/Crest.tsx`) com o nome da
  escola. Isso vale para qualquer imagem: nada de `brasao-rj.png`.
- Comentários e mensagens de commit **em português**, sem acento em mensagem de
  commit (o terminal do Windows embola).
- **`npm run lint` está quebrado neste ambiente.** Use `npx oxlint src tests`.
- **Não mexa em `GAME_FEEL`** sem rodar `npx vitest run tests/game/reach.test.ts`:
  os limites de level design saem dele, e mudar o pulo pode deixar plataforma
  fora de alcance nas três fases.
- TypeScript strict com `noUncheckedIndexedAccess` e `erasableSyntaxOnly`:
  todo acesso por índice pode ser `undefined`, e **não existe** parameter
  property (`constructor(private x: number)` não compila).
- Toda UI é React. O canvas do Phaser desenha só o mundo do jogo. A única
  exceção já aceita é o balão da tecla `E` sobre o painel.

---

### Task 1: Áudio sintetizado e botão de mudo

Nenhum arquivo de som entra no repositório. Cada efeito é uma lista de notas, e
as notas viram osciladores WebAudio na hora de tocar. A lista é dado puro, então
dá para testá-la sem `AudioContext` nenhum — que é justamente o que o jsdom não
tem.

**Files:**
- Create: `src/game/audio/sfx.types.ts`
- Create: `src/game/audio/sfx.ts`
- Create: `src/game/audio/audio.ts`
- Modify: `src/store/useGameStore.types.ts`
- Modify: `src/store/useGameStore.ts`
- Modify: `src/app/Hud/Hud.tsx`, `src/app/Hud/Hud.styles.ts`
- Test: `tests/game/sfx.test.ts`

**Interfaces:**
- Produz: `playSfx(name: SfxName): void`, `notesFor(name: SfxName): readonly Tone[]`,
  `useGameStore().muted`, `useGameStore().toggleMuted()`.
- Consome: `useGameStore` (já existe).

- [ ] **Step 1: Escreva os tipos das notas**

`src/game/audio/sfx.types.ts`:

```ts
/** Uma nota: o que o oscilador faz do começo ao fim dela. */
export type Tone = {
  /** Frequência inicial, em Hz. Sempre > 0. */
  freq: number;
  /** Frequência final; sem ela a nota não desliza. Sempre > 0. */
  to?: number;
  /** Duração em segundos. */
  duration: number;
  type?: OscillatorType;
  /** Volume de pico, de 0 a 1. */
  gain?: number;
  /** Atraso em segundos desde o início do efeito. */
  delay?: number;
};

export type SfxName =
  | 'pulo'
  | 'moeda'
  | 'bandeira'
  | 'certo'
  | 'errado'
  | 'ponte'
  | 'blocos'
  | 'porta'
  | 'fase';
```

- [ ] **Step 2: Escreva o teste que falha**

`tests/game/sfx.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { notesFor, SFX_NAMES } from '@/game/audio/sfx';
import { playSfx } from '@/game/audio/audio';

describe('catálogo de efeitos', () => {
  it('todo efeito tem pelo menos uma nota', () => {
    for (const name of SFX_NAMES) {
      expect(notesFor(name).length).toBeGreaterThan(0);
    }
  });

  /**
   * O WebAudio usa rampa exponencial, e rampa exponencial para 0 (ou de 0)
   * não faz som nenhum — a frequência precisa ser estritamente positiva.
   */
  it('nenhuma nota tem frequência ou duração zerada', () => {
    for (const name of SFX_NAMES) {
      for (const tone of notesFor(name)) {
        expect(tone.freq).toBeGreaterThan(0);
        expect(tone.to ?? 1).toBeGreaterThan(0);
        expect(tone.duration).toBeGreaterThan(0);
        expect(tone.gain ?? 0.15).toBeLessThanOrEqual(0.3);
      }
    }
  });
});

describe('playSfx', () => {
  it('não explode onde não existe AudioContext — é o caso do teste e do SSR', () => {
    expect(() => playSfx('pulo')).not.toThrow();
  });
});
```

- [ ] **Step 3: Rode e veja falhar**

```bash
npx vitest run tests/game/sfx.test.ts
```

Esperado: FAIL, `Cannot find module '@/game/audio/sfx'`.

- [ ] **Step 4: Escreva o catálogo**

`src/game/audio/sfx.ts`:

```ts
import type { SfxName, Tone } from './sfx.types';

/**
 * Os efeitos do jogo, escritos como notas. Nada de arquivo de áudio: som de
 * plataforma dos anos 90 é onda quadrada com envelope curto, e sintetizar sai
 * mais barato que licenciar, baixar e pôr no precache do PWA.
 */
const NOTES: Record<SfxName, readonly Tone[]> = {
  pulo: [{ freq: 420, to: 720, duration: 0.11, type: 'square', gain: 0.12 }],

  moeda: [
    { freq: 988, duration: 0.06, type: 'square', gain: 0.13 },
    { freq: 1319, duration: 0.12, type: 'square', gain: 0.13, delay: 0.06 },
  ],

  bandeira: [{ freq: 660, to: 990, duration: 0.16, type: 'triangle', gain: 0.13 }],

  certo: [
    { freq: 523, duration: 0.09, type: 'triangle', gain: 0.16 },
    { freq: 659, duration: 0.09, type: 'triangle', gain: 0.16, delay: 0.09 },
    { freq: 784, duration: 0.2, type: 'triangle', gain: 0.16, delay: 0.18 },
  ],

  // Grave e curto. Errar não pode soar como punição — o aluno vai errar muito.
  errado: [{ freq: 220, to: 130, duration: 0.24, type: 'sawtooth', gain: 0.1 }],

  ponte: [{ freq: 150, to: 70, duration: 0.5, type: 'sawtooth', gain: 0.09 }],

  blocos: [
    { freq: 300, duration: 0.08, type: 'square', gain: 0.1 },
    { freq: 400, duration: 0.08, type: 'square', gain: 0.1, delay: 0.09 },
    { freq: 520, duration: 0.1, type: 'square', gain: 0.1, delay: 0.18 },
  ],

  porta: [{ freq: 300, to: 520, duration: 0.42, type: 'sine', gain: 0.12 }],

  fase: [
    { freq: 523, duration: 0.12, type: 'triangle', gain: 0.17 },
    { freq: 659, duration: 0.12, type: 'triangle', gain: 0.17, delay: 0.12 },
    { freq: 784, duration: 0.12, type: 'triangle', gain: 0.17, delay: 0.24 },
    { freq: 1047, duration: 0.34, type: 'triangle', gain: 0.17, delay: 0.36 },
  ],
};

export const SFX_NAMES = Object.keys(NOTES) as readonly SfxName[];

export const notesFor = (name: SfxName): readonly Tone[] => NOTES[name];
```

- [ ] **Step 5: Escreva o tocador**

`src/game/audio/audio.ts`:

```ts
import { useGameStore } from '@/store/useGameStore';
import { notesFor } from './sfx';
import type { SfxName, Tone } from './sfx.types';

let shared: AudioContext | null = null;

/**
 * O contexto nasce no primeiro som, nunca antes: navegador de celular recusa
 * AudioContext criado fora de um gesto do usuário, e criar cedo demais deixa
 * o jogo mudo a partida inteira.
 */
function context(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  shared ??= new AudioContext();
  if (shared.state === 'suspended') void shared.resume();
  return shared;
}

function schedule(target: AudioContext, tone: Tone): void {
  const start = target.currentTime + (tone.delay ?? 0);
  const end = start + tone.duration;

  const osc = target.createOscillator();
  osc.type = tone.type ?? 'square';
  osc.frequency.setValueAtTime(tone.freq, start);
  if (tone.to !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(tone.to, end);
  }

  // Ataque de 10 ms e queda até quase zero: sem envelope, o começo e o fim
  // da nota estalam no alto-falante.
  const amp = target.createGain();
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(tone.gain ?? 0.14, start + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(amp);
  amp.connect(target.destination);
  osc.start(start);
  osc.stop(end + 0.02);
}

export function playSfx(name: SfxName): void {
  if (useGameStore.getState().muted) return;
  const target = context();
  if (target === null) return;
  for (const tone of notesFor(name)) schedule(target, tone);
}
```

- [ ] **Step 6: Ligue o mudo no store**

Em `src/store/useGameStore.types.ts`, dentro de `GameState`, acrescente:

```ts
  muted: boolean;
  toggleMuted: () => void;
```

Em `src/store/useGameStore.ts`, dentro do objeto do `create`:

```ts
      muted: false,

      toggleMuted: () => set((state) => ({ muted: !state.muted })),
```

e no `partialize`, acrescente `muted: state.muted,` junto de `progress`,
`character` e `mode`.

- [ ] **Step 7: Botão de som no HUD**

Em `src/app/Hud/Hud.styles.ts`, acrescente ao objeto `styles`:

```ts
  sound: {
    ...pill,
    padding: '0.3rem 0.6rem',
    cursor: 'pointer',
    pointerEvents: 'auto',
  },
```

Em `src/app/Hud/Hud.tsx`, leia o estado e ponha o botão logo depois do relógio:

```tsx
  const muted = useGameStore((state) => state.muted);
  const toggleMuted = useGameStore((state) => state.toggleMuted);
```

```tsx
      <button
        type="button"
        style={styles.sound}
        aria-label={muted ? 'Ligar o som' : 'Desligar o som'}
        onClick={toggleMuted}
      >
        {muted ? '🔇' : '🔊'}
      </button>
```

- [ ] **Step 8: Toque os sons no jogo**

Em `src/game/scenes/LevelScene.ts`, importe `import { playSfx } from '@/game/audio/audio';` e chame:

- em `applyOutcome`, no ramo errado, antes do `shake`: `playSfx('errado');`
- em `applyOutcome`, depois do `if (!outcome.correct)`: `playSfx('certo');`
- no `case 'ponte'`: `playSfx('ponte');`
- no `case 'blocos'`: `playSfx('blocos');`
- no `case 'porta'`: `playSfx('porta');`
- no laço dos dígitos, junto do `takeDigit()`: `playSfx('moeda');`
- no laço das bandeiras, junto do `spawnPoint`: `playSfx('bandeira');`
- em `update`, logo depois de `if (command.type === 'start') {`: `playSfx('pulo');`

- [ ] **Step 9: Rode tudo**

```bash
npx vitest run
```

Esperado: PASS, 94 testes (91 + 3).

- [ ] **Step 10: Commit**

```bash
git add src/game/audio src/store src/app/Hud src/game/scenes/LevelScene.ts tests/game/sfx.test.ts
git commit -m "feat: efeitos sonoros sintetizados e botao de mudo"
```

---

### Task 2: Partículas

Uma textura de 8×8 gerada em runtime serve para tudo: poeira, brilho de moeda,
confete. Nenhum PNG entra no repositório.

**Files:**
- Create: `src/game/art/spark.ts`
- Modify: `src/game/scenes/LevelScene.ts`
- Modify: `src/game/mechanisms/Blocks.ts`

**Interfaces:**
- Produz: `burst(scene, x, y, color, count?)`, `ensureSparkTexture(scene)`.
- Consome: `PALETTE`, `toPhaserColor` de `@/theme/palette`.

- [ ] **Step 1: Escreva o emissor**

`src/game/art/spark.ts`:

```ts
import Phaser from 'phaser';

const KEY = 'faisca';

/** Um ponto branco de 8×8, tingido na hora de emitir. Serve para tudo. */
export function ensureSparkTexture(scene: Phaser.Scene): string {
  if (scene.textures.exists(KEY)) return KEY;

  const pincel = scene.make.graphics({ x: 0, y: 0 }, false);
  pincel.fillStyle(0xffffff, 1);
  pincel.fillCircle(4, 4, 4);
  pincel.generateTexture(KEY, 8, 8);
  pincel.destroy();
  return KEY;
}

/**
 * Estouro de partículas num ponto. O emissor se destrói sozinho: emissor que
 * fica vivo depois da festa é vazamento que só aparece na quinta fase.
 */
export function burst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  count = 14,
): void {
  const emitter = scene.add.particles(x, y, ensureSparkTexture(scene), {
    speed: { min: 70, max: 210 },
    angle: { min: 190, max: 350 },
    scale: { start: 0.9, end: 0 },
    lifespan: 620,
    gravityY: 420,
    tint: color,
    emitting: false,
  });

  emitter.explode(count);
  scene.time.delayedCall(1000, () => emitter.destroy());
}
```

- [ ] **Step 2: Use nos acontecimentos do jogo**

Em `src/game/scenes/LevelScene.ts`, importe
`import { burst } from '@/game/art/spark';` e:

- no laço dos dígitos, junto do `takeDigit()`:
  `burst(this, digitAt.x, digitAt.y, toPhaserColor(PALETTE.gold), 18);`
  (guarde a posição: `GoldenDigit` precisa expor `readonly at: Point`, igual ao
  `Checkpoint` — troque `private readonly at` por `readonly at` na classe.)
- no laço das bandeiras: `burst(this, flag.at.x, flag.at.y - 20, toPhaserColor(PALETTE.cyan), 12);`
- no `case 'ponte'`, dentro de um `this.time.delayedCall(560, ...)` (quando a
  ponte encosta no chão): `burst(this, mechanism.platform.x, mechanism.platform.y, toPhaserColor(PALETTE.dirt), 20);`

Em `src/game/mechanisms/Blocks.ts`, dentro do `forEach`, no `onComplete` do tween:

```ts
        onComplete: () => burst(this.scene, spec.x, spec.y, toPhaserColor(PALETTE.cyan), 8),
```

- [ ] **Step 3: Verifique que nada quebrou**

```bash
npx tsc -b
npx vitest run
```

Esperado: sem erro de tipo, 94 testes passando. As partículas não têm teste
automático — o Vitest não abre canvas. A verificação é a lista manual no fim
deste plano.

- [ ] **Step 4: Commit**

```bash
git add src/game/art/spark.ts src/game/scenes/LevelScene.ts src/game/mechanisms/Blocks.ts src/game/mechanisms/GoldenDigit.ts
git commit -m "feat: particulas ao pegar numero, tocar bandeira e acionar mecanismo"
```

---

### Task 3: Animação de fim de fase

Hoje a porta abre e a tela de resultado sobe. Falta o momento: a câmera fecha na
porta, o personagem entra, o confete estoura, a fanfarra toca — e só então o
card aparece.

**Files:**
- Modify: `src/game/scenes/LevelScene.ts`
- Modify: `src/app/Result/Result.tsx`, `src/app/Result/Result.styles.ts`

- [ ] **Step 1: Trave o update durante a comemoração**

Em `LevelScene`, acrescente o campo:

```ts
  /** Entre a porta abrir e o card subir o jogador não controla mais nada. */
  private finishing = false;
```

e inclua no `create()`, junto dos outros `clear()`: `this.finishing = false;`

Troque a condição de parada do `update()` por:

```ts
    if (
      this.finishing ||
      useChallengeStore.getState().challenge !== null ||
      useRunStore.getState().result !== null
    ) {
```

- [ ] **Step 2: Escreva a comemoração**

Em `LevelScene`, troque o `case 'porta'` do `applyOutcome` por
`this.celebrate(mechanism.panel);` e acrescente o método:

```ts
  /** Câmera fecha na porta, o personagem entra, confete, fanfarra, resultado. */
  private celebrate(door: Point): void {
    this.finishing = true;
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    const camera = this.cameras.main;
    camera.stopFollow();
    camera.pan(door.x, door.y - 30, 420, 'Sine.easeInOut');
    camera.zoomTo(1.3, 620, 'Sine.easeInOut');

    this.tweens.add({
      targets: this.player,
      x: door.x,
      y: door.y - 20,
      alpha: 0,
      duration: 520,
      delay: 160,
      ease: 'Quad.easeIn',
    });

    this.time.delayedCall(DOOR_MS + 200, () => {
      burst(this, door.x, door.y - 50, toPhaserColor(PALETTE.gold), 34);
      burst(this, door.x - 40, door.y - 60, toPhaserColor(PALETTE.cyan), 22);
      playSfx('fase');
      useRunStore.getState().finish();
    });
  }
```

- [ ] **Step 3: Confete no card do resultado**

Em `src/app/Result/Result.styles.ts`, acrescente:

```ts
  confetti: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  flake: {
    position: 'absolute',
    top: '-12px',
    width: '9px',
    height: '14px',
    borderRadius: '2px',
  },
```

e o keyframe em `src/index.css`:

```css
@keyframes cair {
  from { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  to   { transform: translateY(105vh) rotate(540deg); opacity: 0.2; }
}
```

Em `src/app/Result/Result.tsx`, antes do `<div style={styles.card}>`:

```tsx
const CONFETTI = Array.from({ length: 26 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 9) * 0.16}s`,
  duration: `${2.2 + (i % 5) * 0.35}s`,
  color: i % 3 === 0 ? PALETTE.gold : i % 3 === 1 ? PALETTE.cyan : PALETTE.shirt,
}));
```

```tsx
      <div style={styles.confetti} aria-hidden>
        {CONFETTI.map((flake, index) => (
          <span
            key={index}
            style={{
              ...styles.flake,
              left: flake.left,
              background: flake.color,
              animation: `cair ${flake.duration} ${flake.delay} linear both`,
            }}
          />
        ))}
      </div>
```

Importe `PALETTE` de `@/theme/palette`. O array é constante de módulo de
propósito: recalcular a cada render faria o confete recomeçar do zero a cada
clique.

- [ ] **Step 4: Rode**

```bash
npx tsc -b
npx vitest run
```

- [ ] **Step 5: Commit**

```bash
git add src/game/scenes/LevelScene.ts src/app/Result src/index.css
git commit -m "feat: comemoracao de fim de fase com camera, confete e fanfarra"
```

---

### Task 4: Dificuldade que acompanha o aluno

O SPEC 6 pede: três acertos seguidos numa operação sobem o tier, dois erros
seguidos descem. O tier do mecanismo vira o **piso**, não o valor fixo — uma
fase de tier 1 não volta a ser fácil demais para quem já domina.

**Files:**
- Create: `src/game/math/tier.ts`
- Modify: `src/store/useGameStore.types.ts`, `src/store/useGameStore.ts`
- Modify: `src/game/scenes/LevelScene.ts`
- Test: `tests/game/tier.test.ts`

**Interfaces:**
- Produz: `nextTier(tier: Tier, streak: number): Tier`,
  `useGameStore().playerTier: Record<Op, Tier>`,
  `useGameStore().recordAnswer(op: Op, correct: boolean): void`.

- [ ] **Step 1: Escreva o teste que falha**

`tests/game/tier.test.ts`:

```ts
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
```

- [ ] **Step 2: Rode e veja falhar**

```bash
npx vitest run tests/game/tier.test.ts
```

- [ ] **Step 3: Escreva a regra**

`src/game/math/tier.ts`:

```ts
import type { Tier } from './mathEngine.types';

/** SPEC 6: três acertos seguidos sobem o nível. */
export const RIGHT_TO_LEVEL_UP = 3;

/** Dois erros seguidos descem. Descer é mais rápido do que subir de propósito. */
export const WRONG_TO_LEVEL_DOWN = 2;

/**
 * `streak` positivo conta acertos seguidos, negativo conta erros seguidos.
 * Um número só em vez de dois contadores: acertar zera o erro e vice-versa,
 * que é exatamente o que trocar de sinal faz.
 */
export function nextTier(tier: Tier, streak: number): Tier {
  if (streak >= RIGHT_TO_LEVEL_UP && tier < 3) return (tier + 1) as Tier;
  if (streak <= -WRONG_TO_LEVEL_DOWN && tier > 1) return (tier - 1) as Tier;
  return tier;
}
```

- [ ] **Step 4: Guarde o nível do aluno**

Em `src/store/useGameStore.types.ts`:

```ts
import type { Op, Tier } from '@/game/math/mathEngine.types';
```

e dentro de `GameState`:

```ts
  /** Nível atual do aluno em cada operação. Sobe e desce sozinho. */
  playerTier: Record<Op, Tier>;
  /** Acertos seguidos (positivo) ou erros seguidos (negativo) por operação. */
  streak: Record<Op, number>;
  recordAnswer: (op: Op, correct: boolean) => void;
```

Em `src/store/useGameStore.ts`:

```ts
import { nextTier } from '@/game/math/tier';

const START_TIER: Record<Op, Tier> = { '+': 1, '-': 1, '*': 1, '/': 1 };
const NO_STREAK: Record<Op, number> = { '+': 0, '-': 0, '*': 0, '/': 0 };
```

no objeto do `create`:

```ts
      playerTier: { ...START_TIER },
      streak: { ...NO_STREAK },

      recordAnswer: (op, correct) =>
        set((state) => {
          const atual = state.streak[op];
          // Acertar zera a sequência de erros, e vice-versa.
          const streak = correct ? Math.max(1, atual + 1) : Math.min(-1, atual - 1);
          const tier = nextTier(state.playerTier[op], streak);
          // Mudou de nível? A sequência recomeça, senão ele sobe de dois em dois.
          const zera = tier !== state.playerTier[op];

          return {
            playerTier: { ...state.playerTier, [op]: tier },
            streak: { ...state.streak, [op]: zera ? 0 : streak },
          };
        }),
```

e no `partialize`, acrescente `playerTier: state.playerTier,`.
A `streak` **não** é persistida: sequência é de uma sessão.

- [ ] **Step 5: Use o tier efetivo na cena**

Em `LevelScene.openChallenge`:

```ts
    const { playerTier } = useGameStore.getState();
    // O tier da fase é o piso; quem já domina a operação recebe conta maior.
    const tier = Math.max(mechanism.tier, playerTier[mechanism.op]) as Tier;

    useChallengeStore.getState().open(mechanism.id, generateQuestion(mechanism.op, tier));
```

Importe `type Tier` de `@/game/math/mathEngine.types`.

Em `applyOutcome`, a busca do mecanismo hoje mora **depois** do `return` do erro —
e a resposta errada também precisa contar. Suba a busca para a primeira linha.
Este é o corpo completo do método depois das Tarefas 1 a 4; substitua o que está lá:

```ts
  private applyOutcome(outcome: ChallengeOutcome): void {
    // Sobe para o topo: errar também mexe no nível do aluno.
    const mechanism = this.level.mechanisms.find((item) => item.id === outcome.source);
    if (mechanism) useGameStore.getState().recordAnswer(mechanism.op, outcome.correct);

    if (!outcome.correct) {
      playSfx('errado');
      this.cameras.main.shake(140, 0.005);
      useRunStore.getState().addError();
      return;
    }

    playSfx('certo');

    // Mecanismo primeiro: se o setText do painel explodir numa cena
    // destruída, a ponte da cena viva ainda precisa descer.
    switch (mechanism?.kind) {
      case 'ponte':
        playSfx('ponte');
        this.bridges.get(mechanism.id)?.lower();
        this.time.delayedCall(560, () =>
          burst(this, mechanism.platform.x, mechanism.platform.y, toPhaserColor(PALETTE.dirt), 20),
        );
        break;
      case 'blocos':
        playSfx('blocos');
        this.blocks.get(mechanism.id)?.raise(outcome.answer);
        break;
      case 'porta':
        this.celebrate(mechanism.panel);
        break;
    }

    for (const panel of this.panels) {
      if (panel.source === outcome.source) panel.markSolved();
    }
    useChallengeStore.getState().close();
  }
```

- [ ] **Step 6: Rode e comite**

```bash
npx vitest run
git add src/game/math/tier.ts src/store src/game/scenes/LevelScene.ts tests/game/tier.test.ts
git commit -m "feat: dificuldade das contas acompanha o desempenho do aluno"
```

---

### Task 5: Guardião Saci-Pererê

O modo **Aventura** já existe na tela de título e hoje não muda nada. Esta
tarefa dá conteúdo a ele: um guardião no caminho, três corações, e a válvula
anti-frustração do SPEC — perder todos os corações devolve à bandeira com os
corações cheios, nunca ao começo da fase.

**Files:**
- Modify: `src/game/levels/reach.ts`
- Modify: `src/game/levels/level-1-2.ts`, `src/game/levels/level-1-3.ts`
- Create: `src/game/mechanisms/Guardian.ts`
- Modify: `src/store/useRunStore.ts`, `src/store/useRunStore.types.ts`
- Modify: `src/game/scenes/LevelScene.ts`
- Modify: `src/app/Hud/Hud.tsx`
- Test: `tests/game/reach.test.ts` (guardiões entram no invariante de alcance)

**Interfaces:**
- Produz: `GuardianSpec`, `LevelSpec.guardians`, `Guardian`,
  `useRunStore().hearts`, `useRunStore().loseHeart(): boolean`.

- [ ] **Step 1: Guardiões no dado da fase**

Em `src/game/levels/reach.ts`:

```ts
export type GuardianSpec = {
  id: string;
  /** Onde ele espera. Fica em cima de uma plataforma, como o painel. */
  at: Point;
  op: Op;
  tier: Tier;
};
```

acrescente a `LevelSpec`:

```ts
  /** Guardiões do folclore. Só aparecem no modo Aventura. */
  guardians: readonly GuardianSpec[];
```

e inclua as posições em `unreachablePoints`:

```ts
  const required = [
    ...level.mechanisms.map((mechanism) => mechanism.panel),
    ...level.guardians.map((guardian) => guardian.at),
    ...level.digits,
    ...level.checkpoints,
  ];
```

Acrescente `guardians: []` em `level-1-1.ts` (a primeira fase é tutorial, fica
sem guardião), e nas outras duas:

`level-1-2.ts`:

```ts
  guardians: [{ id: 'saci-1-2', at: { x: 1450, y: 300 }, op: '+', tier: 1 }],
```

`level-1-3.ts`:

```ts
  guardians: [
    { id: 'saci-1-3', at: { x: 1300, y: 450 }, op: '+', tier: 2 },
    { id: 'saci-1-3b', at: { x: 2100, y: 300 }, op: '+', tier: 2 },
  ],
```

> O teste de alcance vai reprovar qualquer posição que não esteja sobre uma
> plataforma pisável. Se ele falhar, mova o guardião — não relaxe o teste.
> `at: { x: 1300, y: 450 }` na 1-3 divide o chão com o painel de blocos; se
> ficar apertado no jogo, mova para `x: 1150`.

- [ ] **Step 2: Rode o teste de alcance**

```bash
npx vitest run tests/game/reach.test.ts
```

Esperado: PASS. Se falhar, a posição do guardião está fora de alcance.

- [ ] **Step 3: Corações na partida**

Em `src/store/useRunStore.types.ts`, acrescente a `RunState`:

```ts
  /** Corações do modo Aventura. No Explorador ficam parados em MAX_HEARTS. */
  hearts: number;
  /** Tira um coração; devolve true se ainda sobrou algum. */
  loseHeart: () => boolean;
  refillHearts: () => void;
```

Em `src/store/useRunStore.ts`:

```ts
export const MAX_HEARTS = 3;
```

no estado inicial e no `begin`: `hearts: MAX_HEARTS,`

```ts
  loseHeart: () => {
    const hearts = Math.max(0, get().hearts - 1);
    set({ hearts });
    return hearts > 0;
  },

  refillHearts: () => set({ hearts: MAX_HEARTS }),
```

e em `clear`: `hearts: MAX_HEARTS,`.

- [ ] **Step 4: Escreva o guardião**

`src/game/mechanisms/Guardian.ts`:

```ts
import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import type { Point } from '@/game/levels/reach';

const REACH_X = 52;
const REACH_Y = 80;

/**
 * Saci-Pererê: gorro vermelho, uma perna só, redemoinho. Ele não persegue o
 * jogador — fica rodopiando no lugar e cobra a conta de quem chega perto.
 * Guardião que corre atrás vira jogo de reflexo, e o jogo é de conta.
 */
export class Guardian {
  readonly id: string;
  readonly at: Point;
  private readonly scene: Phaser.Scene;
  private readonly body: Phaser.GameObjects.Container;
  private defeated = false;

  constructor(scene: Phaser.Scene, id: string, at: Point) {
    this.scene = scene;
    this.id = id;
    this.at = at;

    const redemoinho = scene.add.ellipse(0, 16, 44, 14, toPhaserColor(PALETTE.faint), 0.55);
    const corpo = scene.add.ellipse(0, -6, 26, 34, toPhaserColor(PALETTE.night));
    const perna = scene.add.rectangle(0, 14, 7, 16, toPhaserColor(PALETTE.night));
    const gorro = scene.add.triangle(0, -26, 0, 12, 11, -8, 22, 12, 0xd94f3d);
    const cachimbo = scene.add.rectangle(11, -10, 12, 4, toPhaserColor(PALETTE.wall));

    this.body = scene.add.container(at.x, at.y, [
      redemoinho,
      perna,
      corpo,
      gorro,
      cachimbo,
    ]);

    scene.tweens.add({
      targets: redemoinho,
      scaleX: 1.25,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** Está ao alcance e ainda de pé? */
  isBlocking(playerX: number, playerY: number): boolean {
    return (
      !this.defeated &&
      Math.abs(playerX - this.at.x) < REACH_X &&
      Math.abs(playerY - this.at.y) < REACH_Y
    );
  }

  /** Levou o golpe: some num rodopio. */
  defeat(): void {
    if (this.defeated) return;
    this.defeated = true;

    this.scene.tweens.add({
      targets: this.body,
      angle: 720,
      scale: 0,
      alpha: 0,
      duration: 480,
      ease: 'Quad.easeIn',
      onComplete: () => this.body.destroy(),
    });
  }

  /** O jogador errou: o Saci rodopia comemorando. */
  taunt(): void {
    this.scene.tweens.add({
      targets: this.body,
      angle: 360,
      duration: 320,
      ease: 'Quad.easeOut',
      onComplete: () => this.body.setAngle(0),
    });
  }
}
```

- [ ] **Step 5: Ligue na cena**

Em `LevelScene`:

```ts
  private readonly guardians = new Map<string, Guardian>();
```

no `create()`, junto dos outros `clear()`: `this.guardians.clear();` e, depois
das bandeiras:

```ts
    // Guardiões só existem no modo Aventura — é o botão da tela de título.
    if (useGameStore.getState().mode === 'aventura') {
      for (const spec of this.level.guardians) {
        this.guardians.set(spec.id, new Guardian(this, spec.id, spec.at));
      }
    }
```

No `update()`, antes do laço dos painéis:

```ts
    for (const guardian of this.guardians.values()) {
      if (!guardian.isBlocking(this.player.x, this.player.y)) continue;
      const spec = this.level.guardians.find((item) => item.id === guardian.id);
      if (!spec) continue;
      const { playerTier } = useGameStore.getState();
      const tier = Math.max(spec.tier, playerTier[spec.op]) as Tier;
      useChallengeStore.getState().open(spec.id, generateQuestion(spec.op, tier));
      break;
    }
```

O guardião tem que ser tratado **antes** do `if (!outcome.correct)`: quem erra
para o Saci perde coração, não é o mesmo erro de quem erra num painel. Este é o
corpo completo e final de `applyOutcome`; substitua o que está lá:

```ts
  private applyOutcome(outcome: ChallengeOutcome): void {
    const guardian = this.guardians.get(outcome.source);
    if (guardian) {
      const spec = this.level.guardians.find((item) => item.id === outcome.source);
      // A dificuldade adaptativa vale para a conta do guardião também.
      if (spec) useGameStore.getState().recordAnswer(spec.op, outcome.correct);

      if (outcome.correct) {
        playSfx('certo');
        guardian.defeat();
        burst(this, guardian.at.x, guardian.at.y, toPhaserColor(PALETTE.cyan), 24);
        useChallengeStore.getState().close();
        return;
      }

      playSfx('errado');
      guardian.taunt();
      this.cameras.main.shake(140, 0.005);
      useRunStore.getState().addError();

      // Sem corações o jogador volta para a bandeira — e recomeça inteiro.
      if (!useRunStore.getState().loseHeart()) {
        useChallengeStore.getState().close();
        useRunStore.getState().refillHearts();
        this.respawn();
      }
      return;
    }

    const mechanism = this.level.mechanisms.find((item) => item.id === outcome.source);
    if (mechanism) useGameStore.getState().recordAnswer(mechanism.op, outcome.correct);

    if (!outcome.correct) {
      playSfx('errado');
      this.cameras.main.shake(140, 0.005);
      useRunStore.getState().addError();
      return;
    }

    playSfx('certo');

    switch (mechanism?.kind) {
      case 'ponte':
        playSfx('ponte');
        this.bridges.get(mechanism.id)?.lower();
        this.time.delayedCall(560, () =>
          burst(this, mechanism.platform.x, mechanism.platform.y, toPhaserColor(PALETTE.dirt), 20),
        );
        break;
      case 'blocos':
        playSfx('blocos');
        this.blocks.get(mechanism.id)?.raise(outcome.answer);
        break;
      case 'porta':
        this.celebrate(mechanism.panel);
        break;
    }

    for (const panel of this.panels) {
      if (panel.source === outcome.source) panel.markSolved();
    }
    useChallengeStore.getState().close();
  }
```

> O guardião derrotado **não** fecha o painel com `markSolved()` — ele não tem
> painel. Por isso o `return` antes do laço de painéis.

- [ ] **Step 6: Corações no HUD**

Em `src/app/Hud/Hud.tsx`:

```tsx
  const mode = useGameStore((state) => state.mode);
  const hearts = useRunStore((state) => state.hearts);
```

e, depois do nome da fase:

```tsx
      {mode === 'aventura' && (
        <span style={styles.hearts}>{'❤'.repeat(hearts)}{'🖤'.repeat(MAX_HEARTS - hearts)}</span>
      )}
```

com `import { MAX_HEARTS, useRunStore } from '@/store/useRunStore';` e, no
`Hud.styles.ts`:

```ts
  hearts: { ...pill, letterSpacing: '0.1em' },
```

- [ ] **Step 7: Rode e comite**

```bash
npx tsc -b
npx oxlint src tests
npx vitest run
git add src/game src/store src/app/Hud
git commit -m "feat: guardiao saci-perere no modo aventura com coracoes"
```

---

### Task 6: SPEC em dia e verificação manual

**Files:**
- Modify: `SPEC.md`

- [ ] **Step 1: Conserte a tecla de interação**

`SPEC.md` linha 72 ainda diz que o jogador "aperta ↑" no painel. A seção 8 já foi
corrigida: interagir é **`E` ou `Enter`** (e o botão de ação no toque), porque
`↑` já é pulo e a mesma tecla para as duas coisas abria conta no meio de um
pulo. Deixe as duas seções dizendo a mesma coisa.

- [ ] **Step 2: Atualize a ordem de construção (seção 10)**

Marque como feitos os passos 0 a 4, e reescreva os seguintes para o que sobrou:

| # | Entrega | Como saber que terminou |
|---|---------|-------------------------|
| 5 | Áudio, partículas e comemoração de fim de fase | Acertar uma conta faz som e a fase termina com confete |
| 6 | Dificuldade adaptativa + Guardião Saci | A conta fica mais difícil sozinha e dá pra derrotar um guardião |
| 7 | Fases 1-4 e 1-5 + créditos | Mundo 1 fechado — versão entregável |
| 8 | Deploy VPS + HTTPS + instalação no celular | Instala como app no celular do Junior e da Ana |

- [ ] **Step 3: Commit**

```bash
git add SPEC.md
git commit -m "docs: spec alinhada com o jogo (tecla de acao e ordem de construcao)"
```

- [ ] **Step 4: Verificação manual — rode o jogo e confira**

```bash
npm run dev
```

Áudio e efeitos:
- [ ] Pular, pegar número dourado e tocar bandeira fazem sons diferentes
- [ ] Acertar a conta soa subindo; errar soa grave e curto, sem parecer castigo
- [ ] O botão 🔊 no HUD silencia tudo e continua silenciado depois de recarregar
- [ ] Número dourado estoura em partículas douradas; bloco nasce com faísca ciano

Fim de fase:
- [ ] A porta abre, a câmera fecha nela e o personagem entra
- [ ] Confete cai atrás do card de resultado
- [ ] As três estrelas aparecem uma de cada vez
- [ ] "Próxima" leva à fase seguinte; na 1-3 o botão vira "Jogar de novo"

Dificuldade:
- [ ] Acertando três contas de `+` seguidas, a quarta vem visivelmente maior
- [ ] Errando duas seguidas, a seguinte volta a ser fácil
- [ ] Fechar e reabrir o jogo mantém o nível alcançado

Guardião (modo Aventura):
- [ ] Escolhendo **Explorador** na tela de título, nenhum guardião aparece
- [ ] Escolhendo **Aventura**, o Saci aparece na 1-2 e cobra a conta ao chegar perto
- [ ] Errar tira um coração do HUD; acertar faz o Saci sumir rodopiando
- [ ] Perder os três corações devolve à bandeira com os corações cheios — **nunca**
      ao começo da fase

No celular (mesma rede, `npm run dev -- --host`):
- [ ] O botão de som funciona no toque
- [ ] O som toca (o primeiro toque na tela é o que libera o áudio no celular)
- [ ] As partículas não deixam o jogo travado
