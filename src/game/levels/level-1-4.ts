import type { LevelSpec } from './reach';

const GROUND_Y = 500;

/**
 * Quadra Coberta: a fase da ventania.
 *
 * A plataforma alta está 280 px acima do chão — o pulo alcança 136 e a escada
 * de blocos não chega lá. Só o redemoinho sobe isso.
 */
export const LEVEL_1_4: LevelSpec = {
  id: '1-4',
  name: 'Quadra Coberta',
  spawn: { x: 220, y: GROUND_Y - 140 },
  worldWidth: 3400,
  platforms: [
    // chão inicial. 130 … 900
    { x: 515, y: GROUND_Y, width: 770, height: 40 },
    // chão do meio. 1240 … 1900
    { x: 1570, y: GROUND_Y, width: 660, height: 40 },
    // laje da quadra. 2000 … 2600, 280 px acima — só voando
    { x: 2300, y: GROUND_Y - 280, width: 600, height: 40 },
    // chão final. 2700 … 3300
    { x: 3000, y: GROUND_Y, width: 600, height: 40 },
  ],
  mechanisms: [
    {
      kind: 'ponte',
      id: 'ponte-1-4',
      op: '-',
      tier: 1,
      panel: { x: 700, y: 450 },
      // 940 … 1180, quebra o vão de 340 px em dois saltos curtos
      platform: { x: 1060, y: 490, width: 240, height: 20 },
    },
    {
      kind: 'ventania',
      id: 'vento-1-4',
      op: '*',
      tier: 1,
      panel: { x: 1400, y: 450 },
      origin: { x: 1800, y: GROUND_Y - 20 },
    },
    {
      kind: 'porta',
      id: 'porta-1-4',
      op: '/',
      tier: 1,
      panel: { x: 3200, y: 450 },
    },
  ],
  digits: [
    { x: 400, y: 430 },
    { x: 1060, y: 440 },
    { x: 1700, y: 430 },
    { x: 2300, y: 150 },
    { x: 2900, y: 430 },
  ],
  checkpoints: [
    { x: 1300, y: 450 },
    { x: 2050, y: 170 },
  ],
  guardians: [
    { id: 'cuca-1-4', kind: 'cuca', at: { x: 1500, y: 450 }, op: '-', tier: 1 },
    { id: 'saci-1-4', kind: 'saci', at: { x: 2400, y: 170 }, op: '+', tier: 2, from: 'medio' },
    { id: 'boitata-1-4', kind: 'boitata', at: { x: 2900, y: 450 }, op: '*', tier: 2, from: 'dificil' },
  ],
};
