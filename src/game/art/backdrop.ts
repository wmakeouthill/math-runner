import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import { GAME_SIZE } from '@/game/constants';
import { THEMES, type ThemeName } from '@/game/art/themes';

export type { ThemeName, LevelTheme } from '@/game/art/themes';
export { THEMES } from '@/game/art/themes';

const cor = toPhaserColor;

/**
 * Cenário desenhado em runtime — sem tileset, sem download.
 *
 * Quatro profundidades com `scrollFactor` diferente: o céu não anda, os vultos
 * distantes andam devagar, o enfeite quase acompanha o jogador. É o que dá
 * profundidade sem nenhum asset (SPEC 7).
 */
export function createBackdrop(
  scene: Phaser.Scene,
  worldWidth: number,
  themeName: ThemeName,
): void {
  const { width, height } = GAME_SIZE;
  const theme = THEMES[themeName];

  const sky = scene.add.graphics();
  sky.fillGradientStyle(cor(theme.sky), cor(theme.sky), cor(theme.skyLow), cor(theme.skyLow), 1);
  sky.fillRect(0, 0, width, height);
  sky.setScrollFactor(0).setDepth(-100);

  // Noite de festa junina ganha lua; os outros ganham sol baixo.
  const astro = scene.add.circle(
    width - 90,
    82,
    themeName === 'festa' ? 26 : 34,
    cor(themeName === 'festa' ? PALETTE.ink : PALETTE.festaFlag),
    themeName === 'festa' ? 0.9 : 0.55,
  );
  astro.setScrollFactor(0).setDepth(-95);

  const far = scene.add.graphics();
  far.fillStyle(cor(theme.far), 1);
  for (let x = -200; x < worldWidth; x += 340) {
    if (themeName === 'feira') {
      far.fillTriangle(x - 130, height - 120, x, height - 250, x + 130, height - 120);
      far.fillRect(x - 120, height - 130, 240, 70);
    } else {
      far.fillEllipse(x, height - 80, 540, 260);
    }
  }
  far.setScrollFactor(0.2).setDepth(-90);

  const decor = scene.add.graphics();
  for (let x = 180; x < worldWidth; x += 430) {
    switch (themeName) {
      case 'sertao':
        decor.fillStyle(cor(theme.decor), 1);
        decor.fillRect(x, height - 240, 20, 145);
        decor.fillRect(x - 26, height - 200, 26, 16);
        decor.fillRect(x + 20, height - 220, 26, 16);
        decor.fillRect(x - 26, height - 216, 16, 32);
        decor.fillRect(x + 30, height - 236, 16, 32);
        break;

      case 'festa':
        decor.fillStyle(cor(theme.decorAlt), 1);
        decor.fillRect(x, height - 250, 8, 160);
        for (let i = 0; i < 8; i += 1) {
          decor.fillStyle(cor(i % 2 === 0 ? theme.decor : theme.decorAlt), 1);
          const bx = x + 14 + i * 46;
          decor.fillTriangle(bx, height - 246, bx + 26, height - 246, bx + 13, height - 218);
        }
        break;

      case 'mata':
        decor.fillStyle(cor(theme.decorAlt), 1);
        decor.fillRect(x, height - 300, 22, 165);
        decor.fillStyle(cor(theme.decor), 1);
        decor.fillCircle(x + 11, height - 318, 74);
        decor.fillCircle(x - 46, height - 280, 50);
        decor.fillCircle(x + 68, height - 280, 50);
        break;

      case 'feira':
        decor.fillStyle(cor(theme.decorAlt), 1);
        decor.fillRect(x, height - 150, 54, 54);
        decor.fillRect(x + 58, height - 150, 54, 54);
        decor.fillRect(x + 28, height - 206, 54, 54);
        break;

      case 'quintal':
        decor.fillStyle(cor(theme.decorAlt), 1);
        decor.fillRect(x, height - 230, 16, 95);
        decor.fillStyle(cor(theme.decor), 1);
        decor.fillCircle(x + 8, height - 248, 54);
        decor.fillCircle(x - 30, height - 218, 38);
        decor.fillCircle(x + 46, height - 218, 38);
        break;
    }
  }
  decor.setScrollFactor(0.8).setDepth(-70);

  const chao = scene.add.graphics();
  chao.fillStyle(cor(theme.near), 1);
  chao.fillRect(0, height - 70, worldWidth, 70);
  chao.setDepth(-60);
}
