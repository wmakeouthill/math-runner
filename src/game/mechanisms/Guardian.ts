import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import type { Point } from '@/game/levels/reach';

const REACH_X = 52;
const REACH_Y = 80;

/**
 * Saci-Pererê: gorro vermelho, uma perna só, redemoinho. Ele não persegue o
 * jogador — fica rodopiando no lugar e cobra a conta de quem chega perto.
 * Guardião que corre atrás vira jogo de reflexo, e o jogo é de conta.
 */
export class Guardian {
  readonly id: string;
  readonly at: Point;
  private readonly scene: Phaser.Scene;
  private readonly body: Phaser.GameObjects.Container;
  private defeated = false;

  constructor(scene: Phaser.Scene, id: string, at: Point) {
    this.scene = scene;
    this.id = id;
    this.at = at;

    const redemoinho = scene.add.ellipse(0, 16, 44, 14, toPhaserColor(PALETTE.faint), 0.55);
    const corpo = scene.add.ellipse(0, -6, 26, 34, toPhaserColor(PALETTE.night));
    const perna = scene.add.rectangle(0, 14, 7, 16, toPhaserColor(PALETTE.night));
    const gorro = scene.add.triangle(0, -26, 0, 12, 11, -8, 22, 12, 0xd94f3d);
    const cachimbo = scene.add.rectangle(11, -10, 12, 4, toPhaserColor(PALETTE.wall));

    this.body = scene.add.container(at.x, at.y, [
      redemoinho,
      perna,
      corpo,
      gorro,
      cachimbo,
    ]);

    scene.tweens.add({
      targets: redemoinho,
      scaleX: 1.25,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** Está ao alcance e ainda de pé? */
  isBlocking(playerX: number, playerY: number): boolean {
    return (
      !this.defeated &&
      Math.abs(playerX - this.at.x) < REACH_X &&
      Math.abs(playerY - this.at.y) < REACH_Y
    );
  }

  /** Levou o golpe: some num rodopio. */
  defeat(): void {
    if (this.defeated) return;
    this.defeated = true;

    this.scene.tweens.add({
      targets: this.body,
      angle: 720,
      scale: 0,
      alpha: 0,
      duration: 480,
      ease: 'Quad.easeIn',
      onComplete: () => this.body.destroy(),
    });
  }

  /** O jogador errou: o Saci rodopia comemorando. */
  taunt(): void {
    this.scene.tweens.add({
      targets: this.body,
      angle: 360,
      duration: 320,
      ease: 'Quad.easeOut',
      onComplete: () => this.body.setAngle(0),
    });
  }
}
