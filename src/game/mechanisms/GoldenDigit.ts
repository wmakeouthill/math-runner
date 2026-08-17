import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import type { Point } from '@/game/levels/reach';

const PICK_RADIUS = 34;

/**
 * Número dourado: o colecionável da fase. Pegar todos vale uma estrela, e é o
 * que dá motivo para explorar os cantos altos em vez de correr reto até a porta.
 */
export class GoldenDigit {
  private readonly scene: Phaser.Scene;
  private readonly at: Point;
  private readonly body: Phaser.GameObjects.Container;
  private taken = false;

  constructor(scene: Phaser.Scene, at: Point, label: string) {
    this.scene = scene;
    this.at = at;

    const coin = scene.add.circle(0, 0, 14, toPhaserColor(PALETTE.gold));
    coin.setStrokeStyle(3, toPhaserColor(PALETTE.night));

    const glyph = scene.add.text(0, 0, label, {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: PALETTE.night,
    });
    glyph.setOrigin(0.5);

    this.body = scene.add.container(at.x, at.y, [coin, glyph]);

    scene.tweens.add({
      targets: this.body,
      y: at.y - 8,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** Devolve true só na primeira vez que o jogador encosta. */
  tryCollect(playerX: number, playerY: number): boolean {
    if (this.taken) return false;
    if (Phaser.Math.Distance.Between(playerX, playerY, this.at.x, this.at.y) > PICK_RADIUS) {
      return false;
    }

    this.taken = true;
    this.scene.tweens.killTweensOf(this.body);
    this.scene.tweens.add({
      targets: this.body,
      y: this.at.y - 46,
      scale: 1.6,
      alpha: 0,
      duration: 320,
      ease: 'Quad.easeOut',
      onComplete: () => this.body.destroy(),
    });
    return true;
  }
}
