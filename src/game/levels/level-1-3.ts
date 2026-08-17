import type { LevelSpec } from './reach';

const GROUND_Y = 500;

/**
 * Festa Junina no Pátio: ponte e blocos na mesma fase, de noite, com
 * bandeirinhas. Contas até 20, e a porta cobra a conta mais difícil do mundo 1.
 */
export const LEVEL_1_3: LevelSpec = {
  id: '1-3',
  name: 'Festa Junina no Pátio',
  theme: 'festa',
  spawn: { x: 220, y: GROUND_Y - 140 },
  worldWidth: 4200,
  platforms: [
    // chão inicial. 130 … 760
    { x: 445, y: GROUND_Y, width: 630, height: 40 },
    // chão do meio, entre a ponte e os blocos. 1000 … 1500
    { x: 1250, y: GROUND_Y, width: 500, height: 40 },
    // terraço da festa. 1630 … 2300, 150 px acima do chão
    { x: 1965, y: GROUND_Y - 150, width: 670, height: 40 },
    // chão final. 2380 … 3100
    { x: 2740, y: GROUND_Y, width: 720, height: 40 },
    { x: 3300, y: 410, width: 160, height: 40 },
    { x: 3560, y: 320, width: 160, height: 40 },
    { x: 3910, y: 500, width: 380, height: 40 },
  ],
  mechanisms: [
    {
      kind: 'ponte',
      id: 'ponte-1-3',
      op: '-',
      tier: 2,
      panel: { x: 650, y: 450 },
      // fecha o vão 760 … 1000
      platform: { x: 880, y: GROUND_Y - 10, width: 240, height: 20 },
    },
    {
      kind: 'blocos',
      id: 'blocos-1-3',
      op: '/',
      tier: 1,
      steps: 3,
      panel: { x: 1300, y: 450 },
      origin: { x: 1540, y: GROUND_Y - 20 },
    },
    {
      kind: 'porta',
      id: 'porta-1-3',
      op: '*',
      tier: 1,
      panel: { x: 4000, y: 450 },
    },
  ],
  digits: [
    { x: 400, y: 430 },
    { x: 1200, y: 430 },
    { x: 1584, y: 360 },
    { x: 1900, y: 280 },
    { x: 2800, y: 430 },
    { x: 3560, y: 270 },
  ],
  checkpoints: [
    { x: 1100, y: 450 },
    { x: 2500, y: 450 },
    { x: 3790, y: 450 },
  ],
  guardians: [
    // saiu de 1300: lá ele ficava em cima do painel dos blocos, os dois
    // desenhados no mesmo ponto. 1420 ainda está no chão do meio (1000 … 1500).
    { id: 'boitata-1-3', kind: 'boitata', at: { x: 1420, y: 450 }, op: '*', tier: 1 },
    { id: 'boto-1-3', kind: 'boto', at: { x: 2100, y: 300 }, op: '/', tier: 1, from: 'medio' },
  ],
};
