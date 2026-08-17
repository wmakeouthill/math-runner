import Phaser from 'phaser';

const KEY = 'faisca';

/** Um ponto branco de 8×8, tingido na hora de emitir. Serve para tudo. */
export function ensureSparkTexture(scene: Phaser.Scene): string {
  if (scene.textures.exists(KEY)) return KEY;

  const pincel = scene.make.graphics({ x: 0, y: 0 }, false);
  pincel.fillStyle(0xffffff, 1);
  pincel.fillCircle(4, 4, 4);
  pincel.generateTexture(KEY, 8, 8);
  pincel.destroy();
  return KEY;
}

/**
 * Estouro de partículas num ponto. O emissor se destrói sozinho: emissor que
 * fica vivo depois da festa é vazamento que só aparece na quinta fase.
 */
export function burst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  count = 14,
): void {
  const emitter = scene.add.particles(x, y, ensureSparkTexture(scene), {
    speed: { min: 70, max: 210 },
    angle: { min: 190, max: 350 },
    scale: { start: 0.9, end: 0 },
    lifespan: 620,
    gravityY: 420,
    tint: color,
    emitting: false,
  });

  emitter.explode(count);
  scene.time.delayedCall(1000, () => emitter.destroy());
}
