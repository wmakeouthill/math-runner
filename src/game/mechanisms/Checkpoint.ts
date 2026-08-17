import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import type { Point } from '@/game/levels/reach';

const TOUCH_RADIUS = 46;

/**
 * Bandeira de checkpoint. Cair no buraco depois dela devolve o jogador aqui, e
 * não ao começo da fase — perder cinco minutos de fase por um pulo errado é o
 * jeito mais rápido de fazer um aluno fechar o jogo.
 */
export class Checkpoint {
  readonly at: Point;
  private readonly scene: Phaser.Scene;
  private readonly flag: Phaser.GameObjects.Triangle;
  private active = false;

  constructor(scene: Phaser.Scene, at: Point) {
    this.scene = scene;
    this.at = at;

    scene.add.rectangle(at.x, at.y + 6, 5, 62, toPhaserColor(PALETTE.faint));

    this.flag = scene.add.triangle(at.x + 2, at.y - 18, 0, 0, 34, 10, 0, 22, toPhaserColor(PALETTE.faint));
    this.flag.setOrigin(0, 0.5);
  }

  /** Devolve true só na primeira vez que o jogador encosta. */
  tryActivate(playerX: number, playerY: number): boolean {
    if (this.active) return false;
    if (Phaser.Math.Distance.Between(playerX, playerY, this.at.x, this.at.y) > TOUCH_RADIUS) {
      return false;
    }

    this.active = true;
    this.flag.setFillStyle(toPhaserColor(PALETTE.cyan));
    this.scene.tweens.add({
      targets: this.flag,
      scaleY: 1.35,
      duration: 180,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
    return true;
  }
}
