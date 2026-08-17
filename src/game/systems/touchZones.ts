export type TouchAction = 'left' | 'right' | 'jump' | 'action';

export type Viewport = { width: number; height: number };

/** Fração da largura e da altura reservada ao botão de ação. */
const ACTION_X = 0.75;
const ACTION_Y = 1 / 3;

/**
 * Metade esquerda = d-pad (quarto 1 esquerda, quarto 2 direita).
 * Metade direita = pulo, menos o canto superior direito, que é a ação.
 *
 * A ação fica no canto alto porque o polegar direito descansa embaixo, em cima
 * do pulo: ninguém aperta ação sem querer no meio de uma corrida.
 */
export function touchZone(x: number, y: number, view: Viewport): TouchAction {
  if (x < view.width / 2) return x < view.width / 4 ? 'left' : 'right';
  return x > view.width * ACTION_X && y < view.height * ACTION_Y ? 'action' : 'jump';
}
