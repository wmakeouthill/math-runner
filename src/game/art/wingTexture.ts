import Phaser from 'phaser';
import { PALETTE } from '@/theme/palette';

export const WING_KEY = 'asas-vento';
const FRAME = 32;

/** Asinha ciano nas costas — dois frames, some quando o voo acaba. */
export function ensureWingTexture(scene: Phaser.Scene): string {
  if (scene.textures.exists(WING_KEY)) return WING_KEY;

  const texture = scene.textures.createCanvas(WING_KEY, FRAME * 2, FRAME);
  if (!texture) return WING_KEY;

  const ctx = texture.getContext();
  ctx.clearRect(0, 0, FRAME * 2, FRAME);
  drawWing(ctx, 0, 'up');
  drawWing(ctx, FRAME, 'down');
  texture.add('up', 0, 0, 0, FRAME, FRAME);
  texture.add('down', 0, FRAME, 0, FRAME, FRAME);
  texture.refresh();
  return WING_KEY;
}

function drawWing(ctx: CanvasRenderingContext2D, ox: number, pose: 'up' | 'down'): void {
  ctx.fillStyle = PALETTE.cyan;
  if (pose === 'up') {
    ctx.fillRect(ox + 4, 4, 10, 3);
    ctx.fillRect(ox + 1, 7, 14, 5);
    ctx.fillRect(ox + 4, 12, 10, 3);
  } else {
    ctx.fillRect(ox + 4, 14, 10, 3);
    ctx.fillRect(ox + 1, 17, 16, 6);
    ctx.fillRect(ox + 6, 23, 12, 4);
  }
  ctx.fillStyle = PALETTE.shirt;
  ctx.fillRect(ox + 6, pose === 'up' ? 6 : 16, 6, 2);
}
