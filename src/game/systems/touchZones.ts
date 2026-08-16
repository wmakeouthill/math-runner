export type TouchAction = 'left' | 'right' | 'jump';

/**
 * Metade esquerda = d-pad (quarto 1 esquerda, quarto 2 direita).
 * Metade direita inteira = pulo.
 */
export function touchZone(x: number, width: number): TouchAction {
  if (x >= width / 2) return 'jump';
  return x < width / 4 ? 'left' : 'right';
}
