/**
 * ⚙ Botões de calibragem do game feel.
 * Estes números são para SENTIR, não para deduzir: mexa neles com o jogo
 * aberto até o pulo ficar gostoso. Os valores abaixo são o ponto de partida.
 *
 * Com gravityY 1800 e jumpVelocity -700, o pulo chega a ~136px de altura
 * (≈ 4 tiles de 32px) em ~0,39s de subida.
 */
export const GAME_FEEL = {
  /** Janela em que ainda dá para pular depois de sair da beirada. */
  coyoteMs: 100,
  /** Janela em que um pulo apertado cedo demais fica guardado. */
  jumpBufferMs: 120,
  /** Quanto da velocidade de subida sobra ao soltar o botão cedo. */
  jumpCutMultiplier: 0.4,
  moveSpeed: 260,
  jumpVelocity: -700,
  gravityY: 1800,
} as const;

export const GAME_SIZE = { width: 960, height: 540 } as const;
