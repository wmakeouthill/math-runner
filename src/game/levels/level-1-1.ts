import type { LevelSpec } from './reach';

const GROUND_Y = 500;

/**
 * Quintal da Escola, fase de abertura.
 *
 * O buraco entre os dois chãos tem 220 px — mais largo que o pulo mais longo
 * possível (≈202 px). Ele só se atravessa com a ponte, e a ponte só desce com a
 * conta certa. É o loop do jogo inteiro numa fase só.
 *
 * Se você mexer nestes números ou no GAME_FEEL, tests/game/reach.test.ts falha
 * antes de você descobrir jogando.
 */
export const LEVEL_1_1: LevelSpec = {
  spawn: { x: 200, y: GROUND_Y - 140 },
  worldWidth: 1840,
  platforms: [
    // 0: chão inicial — o jogador nasce aqui. 130 … 830
    { x: 480, y: GROUND_Y, width: 700, height: 40 },
    // 1: chão final, do outro lado do buraco. 1050 … 1750
    { x: 1400, y: GROUND_Y, width: 700, height: 40 },
    // degrau
    { x: 1180, y: GROUND_Y - 90, width: 160, height: 24 },
    // ponto alto da fase
    { x: 1440, y: GROUND_Y - 170, width: 160, height: 24 },
  ],
  mechanisms: [
    {
      id: 'ponte-1',
      op: '+',
      tier: 1,
      panel: { x: 760, y: 450 },
      // deitada, fecha exatamente o vão 830 … 1050 no nível do chão
      platform: { x: 940, y: GROUND_Y - 10, width: 220, height: 20 },
    },
  ],
};
