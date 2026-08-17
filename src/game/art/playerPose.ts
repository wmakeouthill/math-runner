export type Motion = {
  grounded: boolean;
  vx: number;
  vy: number;
  flying: boolean;
};

export type PlayerAnim = 'idle' | 'walk' | 'jump' | 'fall';

export type PlayerVisual = {
  anim: PlayerAnim;
  wings: boolean;
};

/** Qual pose o sprite mostra. A asa só existe enquanto a ventania segura o pulo. */
export function visualFor(motion: Motion): PlayerVisual {
  if (motion.flying) return { anim: 'jump', wings: true };
  if (!motion.grounded) {
    return { anim: motion.vy < 0 ? 'jump' : 'fall', wings: false };
  }
  if (motion.vx !== 0) return { anim: 'walk', wings: false };
  return { anim: 'idle', wings: false };
}

/** 1 = direita (desenho original), -1 = esquerda. */
export function facingFor(vx: number, previous: 1 | -1): 1 | -1 {
  if (vx > 0) return 1;
  if (vx < 0) return -1;
  return previous;
}
