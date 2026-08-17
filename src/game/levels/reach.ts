import { GAME_FEEL } from '@/game/constants';
import type { Op, Tier } from '@/game/math/mathEngine.types';

export type PlatformSpec = {
  x: number;
  y: number;
  width: number;
  height: number;
};

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

const airtimeSeconds =
  (2 * Math.abs(GAME_FEEL.jumpVelocity)) / GAME_FEEL.gravityY;

/**
 * Limites que o level design NÃO pode ultrapassar, derivados do GAME_FEEL.
 * Calibrar o pulo move os limites junto, e o teste de alcance acusa qualquer
 * plataforma que tenha ficado fora — foi assim que a fase 1-1 nasceu com uma
 * plataforma 6px acima do alcance máximo, impossível de pisar.
 */
export const JUMP_REACH = {
  /** Altura máxima do pulo, em px. */
  maxHeight: GAME_FEEL.jumpVelocity ** 2 / (2 * GAME_FEEL.gravityY),
  /** Distância horizontal de um pulo completo, em px. */
  maxDistance: GAME_FEEL.moveSpeed * airtimeSeconds,
  /** Margem: use 70% do máximo, o jogador precisa de folga para errar. */
  safety: 0.7,
} as const;

/** Degrau vertical máximo permitido entre duas plataformas. */
export const SAFE_STEP = JUMP_REACH.maxHeight * JUMP_REACH.safety;

/** Vão horizontal máximo permitido entre duas plataformas. */
export const SAFE_GAP = JUMP_REACH.maxDistance * JUMP_REACH.safety;

export const topOf = (p: PlatformSpec): number => p.y - p.height / 2;
const leftOf = (p: PlatformSpec): number => p.x - p.width / 2;
const rightOf = (p: PlatformSpec): number => p.x + p.width / 2;

/** Distância horizontal entre duas plataformas; 0 se elas se sobrepõem. */
export function horizontalGap(a: PlatformSpec, b: PlatformSpec): number {
  if (rightOf(a) >= leftOf(b) && rightOf(b) >= leftOf(a)) return 0;
  return leftOf(b) > rightOf(a) ? leftOf(b) - rightOf(a) : leftOf(a) - rightOf(b);
}

/** Dá para ir de `from` até `to` num pulo? Descer é sempre possível. */
export function canReach(from: PlatformSpec, to: PlatformSpec): boolean {
  const rise = topOf(from) - topOf(to);
  if (rise > SAFE_STEP) return false;
  return horizontalGap(from, to) <= SAFE_GAP;
}

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
