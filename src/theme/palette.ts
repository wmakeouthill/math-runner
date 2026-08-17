/**
 * Fonte única de cor do projeto.
 *
 * O React consome as strings direto no `style`. O Phaser só aceita número,
 * então passe por `toPhaserColor()`. Nunca escreva um hex à mão fora daqui.
 */
export const PALETTE = {
  // Fundo da interface
  night: '#0b1020',
  deep: '#141f42',
  navy: '#1b2a5e',
  steel: '#2b3a67',

  // Texto
  ink: '#e8ecff',
  mute: '#a9b6e8',
  faint: '#6b78a9',

  // Uniforme (SPEC 5b)
  shirt: '#f2f5ff',
  sneaker: '#e8ecff',

  // Destaques
  cyan: '#6ee7ff',
  gold: '#ffd166',
  saci: '#d94f3d',

  // Quintal da Escola (Mundo 1)
  sky: '#7fc8f8',
  skyLow: '#cfe9ff',
  grass: '#4c9a4c',
  grassDark: '#2f6b34',
  wall: '#d9c9a3',
  dirt: '#7a5c3a',

  // Pele e cabelo — a dupla representa melhor a turma (SPEC 5b)
  skinAna: '#8d5524',
  skinJunior: '#e0ac69',
  hairAna: '#2b1b12',
  hairJunior: '#3d2a1c',
} as const;

export type ColorName = keyof typeof PALETTE;

const HEX = /^#?[0-9a-fA-F]{6}$/;

/** `'#6ee7ff'` → `0x6ee7ff`. O Phaser não aceita string de cor. */
export function toPhaserColor(hex: string): number {
  if (!HEX.test(hex)) throw new Error(`Cor inválida: "${hex}"`);
  return Number.parseInt(hex.replace('#', ''), 16);
}
