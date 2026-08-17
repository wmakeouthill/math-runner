import type { LevelSpec } from './reach';

const GROUND_Y = 500;

/**
 * Festa Junina no Pátio: ponte e blocos na mesma fase, contas até 20, e a
 * porta cobra a conta mais difícil do mundo 1.
 */
export const LEVEL_1_3: LevelSpec = {
  id: '1-3',
  name: 'Festa Junina no Pátio',
  spawn: { x: 220, y: GROUND_Y - 140 },
  worldWidth: 3200,
  platforms: [
    // chão inicial. 130 … 760
    { x: 445, y: GROUND_Y, width: 630, height: 40 },
    // chão do meio, entre a ponte e os blocos. 1000 … 1500
    { x: 1250, y: GROUND_Y, width: 500, height: 40 },
    // terraço da festa. 1630 … 2300, 150 px acima do chão
    { x: 1965, y: GROUND_Y - 150, width: 670, height: 40 },
    // chão final. 2380 … 3100
    { x: 2740, y: GROUND_Y, width: 720, height: 40 },
  ],
  mechanisms: [
    {
      kind: 'ponte',
      id: 'ponte-1-3',
      op: '+',
      tier: 2,
      panel: { x: 650, y: 450 },
      // fecha o vão 760 … 1000
      platform: { x: 880, y: GROUND_Y - 10, width: 240, height: 20 },
    },
    {
      kind: 'blocos',
      id: 'blocos-1-3',
      op: '+',
      tier: 2,
      panel: { x: 1300, y: 450 },
      origin: { x: 1540, y: GROUND_Y - 20 },
    },
    {
      kind: 'porta',
      id: 'porta-1-3',
      op: '+',
      tier: 3,
      panel: { x: 3000, y: 450 },
    },
  ],
  digits: [
    { x: 400, y: 430 },
    { x: 1200, y: 430 },
    { x: 1584, y: 360 },
    { x: 1900, y: 280 },
    { x: 2800, y: 430 },
  ],
  checkpoints: [
    { x: 1100, y: 450 },
    { x: 2500, y: 450 },
  ],
};
