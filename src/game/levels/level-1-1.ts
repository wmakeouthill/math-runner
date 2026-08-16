import type { LevelSpec } from './reach';

const GROUND_Y = 500;

/**
 * Fase de teste da Fase 1 — vira tilemap do Tiled na Fase 2.
 *
 * Todas as plataformas respeitam SAFE_STEP e SAFE_GAP. Se você mexer nestes
 * números ou no GAME_FEEL, tests/game/reach.test.ts falha antes de você
 * descobrir jogando.
 */
export const LEVEL_1_1: LevelSpec = {
  spawn: { x: 200, y: GROUND_Y - 140 },
  worldWidth: 1600,
  platforms: [
    // Chão inicial — o jogador nasce em cima deste.
    { x: 480, y: GROUND_Y, width: 700, height: 40 },
    // Degrau que sobe a partir da ponta do chão inicial.
    { x: 900, y: GROUND_Y - 90, width: 160, height: 24 },
    // Ponto alto da fase.
    { x: 1150, y: GROUND_Y - 170, width: 160, height: 24 },
    // Chão final, do outro lado do buraco.
    { x: 1200, y: GROUND_Y, width: 500, height: 40 },
    // Degrau de saída, alcançável tanto de cima quanto do chão final.
    { x: 1400, y: GROUND_Y - 90, width: 140, height: 24 },
  ],
};
