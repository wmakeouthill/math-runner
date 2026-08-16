import { GAME_FEEL } from '@/game/constants';

export type PlatformSpec = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LevelSpec = {
  spawn: { x: number; y: number };
  worldWidth: number;
  platforms: readonly PlatformSpec[];
};

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
  return level.platforms.findIndex(
    (p) => leftOf(p) <= level.spawn.x && level.spawn.x <= rightOf(p),
  );
}

/** Índices de todas as plataformas alcançáveis a partir do nascimento. */
export function reachablePlatforms(level: LevelSpec): ReadonlySet<number> {
  const start = spawnPlatformIndex(level);
  if (start === -1) return new Set();

  const reached = new Set([start]);
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.pop();
    if (current === undefined) continue;

    const from = level.platforms[current];
    if (!from) continue;

    level.platforms.forEach((to, index) => {
      if (reached.has(index) || !canReach(from, to)) return;
      reached.add(index);
      queue.push(index);
    });
  }

  return reached;
}
