import type { LevelSpec } from './reach';

const GROUND_Y = 500;

/**
 * Quintal da Escola, fase de abertura.
 *
 * O buraco entre os dois primeiros chãos tem 230 px — mais largo que o pulo
 * mais longo possível (≈202 px). Ele só se atravessa com a ponte, e a ponte só
 * desce com a conta certa. É o loop do jogo inteiro numa fase só.
 *
 * Se você mexer nestes números ou no GAME_FEEL, tests/game/reach.test.ts falha
 * antes de você descobrir jogando.
 */
export const LEVEL_1_1: LevelSpec = {
  id: '1-1',
  name: 'Quintal da Escola',
  spawn: { x: 220, y: GROUND_Y - 140 },
  worldWidth: 2700,
  platforms: [
    // chão inicial — o jogador nasce aqui. 130 … 900
    { x: 515, y: GROUND_Y, width: 770, height: 40 },
    // chão do meio, depois da ponte. 1130 … 1800
    { x: 1465, y: GROUND_Y, width: 670, height: 40 },
    // degrau. 1220 … 1380
    { x: 1300, y: GROUND_Y - 90, width: 160, height: 24 },
    // ponto alto da fase. 1480 … 1640
    { x: 1560, y: GROUND_Y - 170, width: 160, height: 24 },
    // chão final. 1930 … 2600
    { x: 2265, y: GROUND_Y, width: 670, height: 40 },
    // degrau do número escondido. 2280 … 2420
    { x: 2350, y: GROUND_Y - 90, width: 140, height: 24 },
  ],
  mechanisms: [
    {
      kind: 'ponte',
      id: 'ponte-1',
      op: '+',
      tier: 1,
      panel: { x: 760, y: 450 },
      // deitada, fecha exatamente o vão 900 … 1130 no nível do chão
      platform: { x: 1015, y: GROUND_Y - 10, width: 230, height: 20 },
    },
    {
      kind: 'porta',
      id: 'porta-1-1',
      op: '+',
      tier: 2,
      panel: { x: 2520, y: 450 },
    },
  ],
  digits: [
    { x: 600, y: 430 },
    { x: 1560, y: 280 },
    { x: 2100, y: 430 },
    { x: 2350, y: 350 },
  ],
  checkpoints: [{ x: 1200, y: 450 }],
};
