import type { LevelSpec } from './reach';
import { LEVEL_1_1 } from './level-1-1';
import { LEVEL_1_2 } from './level-1-2';
import { LEVEL_1_3 } from './level-1-3';
import { LEVEL_1_4 } from './level-1-4';
import { LEVEL_1_5 } from './level-1-5';

/** Ordem em que as fases destravam. Mundo 1: as quatro operações. */
export const LEVEL_ORDER = [LEVEL_1_1, LEVEL_1_2, LEVEL_1_3, LEVEL_1_4, LEVEL_1_5] as const;

export const LEVELS: Readonly<Record<string, LevelSpec>> = Object.fromEntries(
  LEVEL_ORDER.map((level) => [level.id, level]),
);

export function levelById(id: string | null): LevelSpec | null {
  if (id === null) return null;
  return LEVELS[id] ?? null;
}

/** A fase seguinte na ordem, ou null se esta é a última. */
export function nextLevelId(id: string): string | null {
  const index = LEVEL_ORDER.findIndex((level) => level.id === id);
  if (index === -1) return null;
  return LEVEL_ORDER[index + 1]?.id ?? null;
}
