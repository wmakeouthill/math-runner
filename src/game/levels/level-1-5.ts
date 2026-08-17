import type { LevelSpec } from './reach';

const GROUND_Y = 500;

/**
 * Portão da Escola: a última do Mundo 1, e a mais longa.
 *
 * Junta os quatro mecanismos e as quatro operações. O caminho sobe em três
 * degraus grandes — blocos até o terraço, ponte até a laje, ventania até o
 * telhado — e só depois desce para o portão.
 */
export const LEVEL_1_5: LevelSpec = {
  id: '1-5',
  name: 'Portão da Escola',
  spawn: { x: 220, y: GROUND_Y - 140 },
  worldWidth: 4200,
  platforms: [
    // chão inicial. 130 … 800
    { x: 465, y: GROUND_Y, width: 670, height: 40 },
    // terraço. 930 … 1500, 150 px acima
    { x: 1215, y: GROUND_Y - 150, width: 570, height: 40 },
    // laje. 1860 … 2400, mesma altura do terraço
    { x: 2130, y: GROUND_Y - 150, width: 540, height: 40 },
    // telhado. 2500 … 3100, 260 px acima da laje
    { x: 2800, y: GROUND_Y - 410, width: 600, height: 40 },
    // chão do portão. 3200 … 4000
    { x: 3600, y: GROUND_Y, width: 800, height: 40 },
  ],
  mechanisms: [
    {
      kind: 'blocos',
      id: 'blocos-1-5',
      op: '+',
      tier: 2,
      steps: 2,
      panel: { x: 620, y: 450 },
      origin: { x: 840, y: GROUND_Y - 20 },
    },
    {
      kind: 'ponte',
      id: 'ponte-1-5',
      op: '-',
      tier: 2,
      panel: { x: 1100, y: 300 },
      // 1540 … 1780, no nível do terraço
      platform: { x: 1660, y: GROUND_Y - 160, width: 240, height: 20 },
    },
    {
      kind: 'ventania',
      id: 'vento-1-5',
      op: '*',
      tier: 2,
      panel: { x: 1950, y: 300 },
      origin: { x: 2300, y: GROUND_Y - 170 },
    },
    {
      kind: 'porta',
      id: 'porta-1-5',
      op: '/',
      tier: 2,
      panel: { x: 3850, y: 450 },
    },
  ],
  digits: [
    { x: 400, y: 430 },
    { x: 1000, y: 280 },
    { x: 1660, y: 290 },
    { x: 2200, y: 280 },
    { x: 2800, y: 20 },
    { x: 3700, y: 430 },
  ],
  checkpoints: [
    { x: 1400, y: 300 },
    { x: 2550, y: 40 },
  ],
  guardians: [
    { id: 'cuca-1-5', kind: 'cuca', at: { x: 1300, y: 300 }, op: '-', tier: 2 },
    { id: 'boto-1-5', kind: 'boto', at: { x: 2200, y: 300 }, op: '/', tier: 2, from: 'medio' },
    { id: 'boitata-1-5', kind: 'boitata', at: { x: 3400, y: 450 }, op: '*', tier: 2, from: 'medio' },
    { id: 'curupira-1-5', kind: 'curupira', at: { x: 3700, y: 450 }, op: '+', tier: 2 },
  ],
};
