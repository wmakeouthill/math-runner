import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import type { Point } from '@/game/levels/reach';

const REACH_X = 52;
const REACH_Y = 80;

/**
 * Saci-Pererê: gorro vermelho com pompom, uma perna só, redemoinho.
 * Não persegue — cobra a conta de quem chega perto.
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

    const dustA = scene.add.ellipse(0, 20, 52, 16, toPhaserColor(PALETTE.faint), 0.5);
    const dustB = scene.add.ellipse(0, 22, 34, 10, toPhaserColor(PALETTE.dirt), 0.55);

    const foot = scene.add.ellipse(3, 20, 16, 7, toPhaserColor(PALETTE.night));
    const leg = scene.add.rectangle(0, 10, 8, 18, toPhaserColor(PALETTE.night));
    const torso = scene.add.ellipse(0, -6, 26, 30, toPhaserColor(PALETTE.hairJunior));
    const head = scene.add.circle(0, -24, 11, toPhaserColor(PALETTE.skinAna));
    const eyeL = scene.add.rectangle(-4, -26, 3, 3, toPhaserColor(PALETTE.night));
    const eyeR = scene.add.rectangle(4, -26, 3, 3, toPhaserColor(PALETTE.night));
    const smile = scene.add.rectangle(0, -20, 7, 2, toPhaserColor(PALETTE.night));
    const cap = scene.add.triangle(
      1,
      -36,
      0,
      18,
      16,
      -8,
      28,
      18,
      toPhaserColor(PALETTE.saci),
    );
    const pompom = scene.add.circle(16, -46, 5, toPhaserColor(PALETTE.shirt));
    const pipe = scene.add.rectangle(13, -18, 11, 3, toPhaserColor(PALETTE.wall));
    const bowl = scene.add.circle(19, -18, 3, toPhaserColor(PALETTE.steel));

    const figure = scene.add.container(0, 0, [
      leg,
      foot,
      torso,
      head,
      eyeL,
      eyeR,
      smile,
      cap,
      pompom,
      pipe,
      bowl,
    ]);

    this.body = scene.add.container(at.x, at.y, [dustA, dustB, figure]);
    this.body.setDepth(1);

    scene.tweens.add({
      targets: figure,
      y: -6,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    scene.tweens.add({
      targets: dustA,
      scaleX: 1.3,
      angle: 180,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    scene.tweens.add({
      targets: dustB,
      scaleX: 0.7,
      duration: 480,
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
