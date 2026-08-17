import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import type { PlatformSpec } from '@/game/levels/reach';

const FALL_MS = 560;

/**
 * Ponte levantada. Nasce em pé na beirada e deita sobre o buraco quando a conta
 * é respondida certo.
 *
 * O corpo de colisão só entra no grupo estático quando a animação termina:
 * corpo estático do Arcade é AABB e não acompanha rotação, então uma ponte
 * girando com corpo ligado teria caixa de colisão errada o caminho inteiro.
 * Meio segundo sem colisão numa ponte que está caindo não incomoda ninguém.
 */
export class Bridge {
  private readonly scene: Phaser.Scene;
  private readonly group: Phaser.Physics.Arcade.StaticGroup;
  private readonly plank: Phaser.GameObjects.Rectangle;
  private lowered = false;

  constructor(
    scene: Phaser.Scene,
    group: Phaser.Physics.Arcade.StaticGroup,
    spec: PlatformSpec,
  ) {
    this.scene = scene;
    this.group = group;

    // Origem na ponta esquerda: é o eixo em que a ponte gira. Com originX = 0 e
    // ângulo 0 no fim, o AABB coincide exatamente com o `spec`.
    this.plank = scene.add.rectangle(
      spec.x - spec.width / 2,
      spec.y,
      spec.width,
      spec.height,
      toPhaserColor(PALETTE.dirt),
    );
    this.plank.setOrigin(0, 0.5);
    this.plank.setStrokeStyle(2, toPhaserColor(PALETTE.deep));
    this.plank.setAngle(-90);
  }

  lower(): void {
    if (this.lowered) return;
    this.lowered = true;

    this.scene.tweens.add({
      targets: this.plank,
      angle: 0,
      duration: FALL_MS,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.group.add(this.plank);
        this.group.refresh();
      },
    });
  }
}
