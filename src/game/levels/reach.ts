import { GAME_FEEL } from '@/game/constants';
import type { Op, Tier } from '@/game/math/mathEngine.types';
import type { Difficulty } from '@/game/math/difficulty';

export type PlatformSpec = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Point = { x: number; y: number };

/** O que o mecanismo entrega quando a conta é respondida certo. */
export type MechanismEffect =
  /** Uma ponte levadiça desce e fecha um buraco largo demais para pular. */
  | { kind: 'ponte'; platform: PlatformSpec }
  /** Uma escada de blocos aparece: um bloco por unidade da resposta. */
  | { kind: 'blocos'; origin: Point; steps: number }
  /** A porta da fase abre e a fase termina. */
  | { kind: 'porta' }
  /** Um redemoinho: o jogador voa por alguns segundos. */
  | { kind: 'ventania'; origin: Point };

export type GuardianSpec = {
  id: string;
  /** Onde ele espera. Fica em cima de uma plataforma, como o painel. */
  at: Point;
  op: Op;
  tier: Tier;
  /** A partir de qual dificuldade este monstro aparece. Sem isto, sempre. */
  from?: Difficulty;
};

export type MechanismSpec = MechanismEffect & {
  /** Liga painel, resposta e mecanismo. Único dentro da fase. */
  id: string;
  op: Op;
  tier: Tier;
  /** Onde fica o Painel de Cálculo. */
  panel: Point;
};

export type LevelSpec = {
  id: string;
  name: string;
  spawn: Point;
  worldWidth: number;
  platforms: readonly PlatformSpec[];
  mechanisms: readonly MechanismSpec[];
  /** Números dourados. Pegar todos vale uma estrela. */
  digits: readonly Point[];
  /** Bandeiras: morrer devolve o jogador à última que ele tocou. */
  checkpoints: readonly Point[];
  /** Guardiões do folclore. Só aparecem no modo Aventura. */
  guardians: readonly GuardianSpec[];
};

/** Tamanho e passo dos blocos da escada. */
export const BLOCK = { size: 40, stepX: 44, stepY: 40 } as const;

/** Faixa de degraus que uma escada de blocos pode ter. */
export const BLOCK_STEPS = { min: 2, max: 4 } as const;

/** A escada que `count` blocos formam a partir da origem, degrau a degrau. */
export function blockStair(origin: Point, count: number): PlatformSpec[] {
  const steps: PlatformSpec[] = [];
  for (let i = 0; i < count; i += 1) {
    steps.push({
      x: origin.x + i * BLOCK.stepX,
      y: origin.y - (i + 1) * BLOCK.stepY + BLOCK.size / 2,
      width: BLOCK.size,
      height: BLOCK.size,
    });
  }
  return steps;
}

/** O chão que o mecanismo acrescenta — no pior caso, para os blocos. */
function mechanismPlatforms(mechanism: MechanismSpec): readonly PlatformSpec[] {
  switch (mechanism.kind) {
    case 'ponte':
      return [mechanism.platform];
    case 'blocos':
      return blockStair(mechanism.origin, mechanism.steps);
    case 'porta':
      return [];
    case 'ventania':
      return [];
  }
}

/** Tudo em que dá para pisar depois que os mecanismos foram acionados. */
export function allPlatforms(level: LevelSpec): readonly PlatformSpec[] {
  return [...level.platforms, ...level.mechanisms.flatMap(mechanismPlatforms)];
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

/**
 * A ventania: quanto tempo o redemoinho sustenta o jogador e com que força.
 * Curto de propósito — 2,2 s é "alguns segundos" para quem está jogando e
 * ainda é um número que o level design consegue prever.
 */
export const FLIGHT = { ms: 2200, riseSpeed: 220 } as const;

const flightSeconds = FLIGHT.ms / 1000;

/** Subida máxima usando a ventania, com a mesma margem de 70% do pulo. */
export const FLIGHT_STEP = flightSeconds * FLIGHT.riseSpeed * JUMP_REACH.safety;

/** Avanço horizontal máximo enquanto se voa. */
export const FLIGHT_GAP = flightSeconds * GAME_FEEL.moveSpeed * JUMP_REACH.safety;

export const topOf = (p: PlatformSpec): number => p.y - p.height / 2;
const leftOf = (p: PlatformSpec): number => p.x - p.width / 2;
const rightOf = (p: PlatformSpec): number => p.x + p.width / 2;

/** Distância horizontal entre duas plataformas; 0 se elas se sobrepõem. */
export function horizontalGap(a: PlatformSpec, b: PlatformSpec): number {
  if (rightOf(a) >= leftOf(b) && rightOf(b) >= leftOf(a)) return 0;
  return leftOf(b) > rightOf(a) ? leftOf(b) - rightOf(a) : leftOf(a) - rightOf(b);
}

/** Dá para ir de `from` até `to`? `flying` = saindo de dentro de uma ventania. */
export function canReach(from: PlatformSpec, to: PlatformSpec, flying = false): boolean {
  const rise = topOf(from) - topOf(to);
  if (rise > (flying ? FLIGHT_STEP : SAFE_STEP)) return false;
  return horizontalGap(from, to) <= (flying ? FLIGHT_GAP : SAFE_GAP);
}

/** Índice da plataforma em que o jogador nasce, ou -1 se ele nascer no vácuo. */
export function spawnPlatformIndex(level: LevelSpec): number {
  return allPlatforms(level).findIndex(
    (p) => leftOf(p) <= level.spawn.x && level.spawn.x <= rightOf(p),
  );
}

/** Índices das plataformas que hospedam um redemoinho. */
function flightPlatforms(level: LevelSpec): ReadonlySet<number> {
  const platforms = allPlatforms(level);
  const hosts = new Set<number>();

  for (const mechanism of level.mechanisms) {
    if (mechanism.kind !== 'ventania') continue;
    const index = platforms.findIndex(
      (p) => leftOf(p) <= mechanism.origin.x && mechanism.origin.x <= rightOf(p),
    );
    if (index !== -1) hosts.add(index);
  }

  return hosts;
}

/** Índices de todas as plataformas alcançáveis a partir do nascimento. */
export function reachablePlatforms(level: LevelSpec): ReadonlySet<number> {
  const start = spawnPlatformIndex(level);
  if (start === -1) return new Set();

  const platforms = allPlatforms(level);
  const flying = flightPlatforms(level);
  const reached = new Set([start]);
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.pop();
    if (current === undefined) continue;

    const from = platforms[current];
    if (!from) continue;

    platforms.forEach((to, index) => {
      if (reached.has(index) || !canReach(from, to, flying.has(current))) return;
      reached.add(index);
      queue.push(index);
    });
  }

  return reached;
}

/**
 * Um painel fora de alcance é um jogo travado. Vale para painéis, números
 * dourados e bandeiras: o ponto precisa estar sobre uma plataforma que o
 * jogador consegue pisar, e a poucos pixels acima dela.
 */
export function pointIsReachable(level: LevelSpec, point: Point): boolean {
  const reached = reachablePlatforms(level);

  return allPlatforms(level).some((platform, index) => {
    if (!reached.has(index)) return false;
    if (point.x < leftOf(platform) || point.x > rightOf(platform)) return false;

    const above = topOf(platform) - point.y;
    return above >= 0 && above <= SAFE_STEP;
  });
}

/**
 * Tudo o que a fase pede que o jogador toque e ele não consegue.
 * Lista vazia = fase jogável do começo ao fim.
 */
export function unreachablePoints(level: LevelSpec): readonly Point[] {
  const required = [
    ...level.mechanisms.map((mechanism) => mechanism.panel),
    ...level.guardians.map((guardian) => guardian.at),
    ...level.digits,
    ...level.checkpoints,
  ];
  return required.filter((point) => !pointIsReachable(level, point));
}
