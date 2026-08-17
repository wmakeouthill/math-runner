import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import { FLIGHT } from '@/game/levels/reach';
import type { Point } from '@/game/levels/reach';

const WIDTH = 84;
const HEIGHT = 150;

/**
 * O redemoinho do Saci. Nasce fechado e só abre quando a conta é acertada;
 * a partir daí fica lá para sempre — entrar de novo renova o tempo de voo.
 */
export class Whirlwind {
  readonly at: Point;
  private readonly scene: Phaser.Scene;
  private readonly funnel: Phaser.GameObjects.Container;
  private open = false;

  constructor(scene: Phaser.Scene, at: Point) {
    this.scene = scene;
    this.at = at;

    const folhas = [0, 1, 2].map((i) =>
      scene.add.ellipse(0, -30 - i * 42, 62 - i * 14, 16, toPhaserColor(PALETTE.dirt), 0.75),
    );
    const base = scene.add.ellipse(0, 4, 74, 20, toPhaserColor(PALETTE.faint), 0.5);

    this.funnel = scene.add.container(at.x, at.y, [base, ...folhas]);
    this.funnel.setAlpha(0);

    for (const [i, folha] of folhas.entries()) {
      scene.tweens.add({
        targets: folha,
        scaleX: 0.45,
        duration: 520 + i * 90,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  /** A conta certa abre o redemoinho. */
  release(): void {
    if (this.open) return;
    this.open = true;
    this.scene.tweens.add({ targets: this.funnel, alpha: 1, duration: 320 });
  }

  /** O jogador está dentro da coluna de vento? */
  holds(playerX: number, playerY: number): boolean {
    return (
      this.open &&
      Math.abs(playerX - this.at.x) < WIDTH / 2 &&
      playerY > this.at.y - HEIGHT &&
      playerY < this.at.y + 40
    );
  }

  static get durationMs(): number {
    return FLIGHT.ms;
  }
}
