import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import { GAME_SIZE } from '@/game/constants';

/**
 * Quintal da Escola desenhado em runtime — sem tileset, sem download.
 *
 * Quatro profundidades com `scrollFactor` diferente: o céu não anda, os morros
 * andam devagar, o muro e as mangueiras quase acompanham o jogador. É o que dá
 * sensação de profundidade sem nenhum asset (SPEC 7).
 */
export function createBackdrop(scene: Phaser.Scene, worldWidth: number): void {
  const { width, height } = GAME_SIZE;

  // céu — preso na câmera
  const sky = scene.add.graphics();
  sky.fillGradientStyle(
    toPhaserColor(PALETTE.sky),
    toPhaserColor(PALETTE.sky),
    toPhaserColor(PALETTE.skyLow),
    toPhaserColor(PALETTE.skyLow),
    1,
  );
  sky.fillRect(0, 0, width, height);
  sky.setScrollFactor(0).setDepth(-100);

  // morros distantes
  const hills = scene.add.graphics();
  hills.fillStyle(toPhaserColor(PALETTE.grassDark), 1);
  for (let x = -200; x < worldWidth; x += 340) {
    hills.fillEllipse(x, height - 80, 540, 260);
  }
  hills.setScrollFactor(0.2).setDepth(-90);

  // muro da quadra
  const wall = scene.add.graphics();
  wall.fillStyle(toPhaserColor(PALETTE.wall), 1);
  wall.fillRect(0, height - 190, worldWidth, 120);
  wall.lineStyle(2, toPhaserColor(PALETTE.steel), 0.22);
  for (let y = height - 190; y < height - 70; y += 24) {
    wall.lineBetween(0, y, worldWidth, y);
  }
  wall.setScrollFactor(0.6).setDepth(-80);

  // mangueiras
  const trees = scene.add.graphics();
  for (let x = 180; x < worldWidth; x += 430) {
    trees.fillStyle(toPhaserColor(PALETTE.dirt), 1);
    trees.fillRect(x, height - 230, 16, 95);
    trees.fillStyle(toPhaserColor(PALETTE.grass), 1);
    trees.fillCircle(x + 8, height - 248, 54);
    trees.fillCircle(x - 30, height - 218, 38);
    trees.fillCircle(x + 46, height - 218, 38);
  }
  trees.setScrollFactor(0.8).setDepth(-70);

  // faixa de grama rente ao chão
  const grass = scene.add.graphics();
  grass.fillStyle(toPhaserColor(PALETTE.grass), 1);
  grass.fillRect(0, height - 70, worldWidth, 70);
  grass.setDepth(-60);
}
