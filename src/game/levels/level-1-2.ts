import type { LevelSpec } from './reach';

const GROUND_Y = 500;

/**
 * Feira do Bairro: aqui entra a escada de blocos.
 *
 * O terraço está 150 px acima do chão e o pulo alcança 136 — não tem como
 * subir sem os blocos. A fase pede dois degraus: eles põem o jogador 80 px
 * acima do chão e o pulo cobre os 70 que faltam. Quem decide o tamanho é a
 * fase, não a resposta: escada derivada do resultado saía desproporcional e
 * prendia o mecanismo à soma.
 */
export const LEVEL_1_2: LevelSpec = {
  id: '1-2',
  name: 'Feira do Bairro',
  theme: 'feira',
  spawn: { x: 220, y: GROUND_Y - 140 },
  worldWidth: 2600,
  platforms: [
    // chão inicial. 130 … 820
    { x: 475, y: GROUND_Y, width: 690, height: 40 },
    // terraço. 950 … 1700, 150 px acima do chão
    { x: 1325, y: GROUND_Y - 150, width: 750, height: 40 },
    // chão final. 1780 … 2500
    { x: 2140, y: GROUND_Y, width: 720, height: 40 },
  ],
  mechanisms: [
    {
      kind: 'blocos',
      id: 'blocos-1',
      op: '*',
      tier: 1,
      steps: 2,
      panel: { x: 700, y: 450 },
      // primeiro bloco encosta na beirada do chão inicial
      origin: { x: 860, y: GROUND_Y - 20 },
    },
    {
      kind: 'porta',
      id: 'porta-1-2',
      op: '-',
      tier: 1,
      panel: { x: 2400, y: 450 },
    },
  ],
  digits: [
    { x: 500, y: 430 },
    { x: 904, y: 360 },
    { x: 1200, y: 280 },
    { x: 2200, y: 430 },
  ],
  checkpoints: [{ x: 1050, y: 300 }],
  guardians: [{ id: 'saci-1-2', kind: 'saci', at: { x: 1450, y: 300 }, op: '+', tier: 1 }],
};
