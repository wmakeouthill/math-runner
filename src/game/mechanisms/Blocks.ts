import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';
import { blockStair, type Point } from '@/game/levels/reach';

const POP_MS = 220;
const STAGGER_MS = 90;

/**
 * Escada de blocos: um bloco por unidade da resposta.
 *
 * A conta vira altura — errar não trava a fase, mas responder certo com um
 * número maior dá uma escada mais folgada. O teste de alcance dimensiona a fase
 * pela MENOR resposta possível, então até o pior sorteio chega em cima.
 *
 * O corpo estático entra no grupo já no tamanho final e só depois o desenho
 * cresce: corpo estático do Arcade não acompanha escala, e um bloco com corpo
 * de tamanho zero é um bloco em que não dá para pisar.
 */
export class Blocks {
  private readonly scene: Phaser.Scene;
  private readonly group: Phaser.Physics.Arcade.StaticGroup;
  private readonly origin: Point;
  private raised = false;

  constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.StaticGroup, origin: Point) {
    this.scene = scene;
    this.group = group;
    this.origin = origin;
  }

  raise(count: number): void {
    if (this.raised) return;
    this.raised = true;

    blockStair(this.origin, count).forEach((spec, index) => {
      const block = this.scene.add.rectangle(
        spec.x,
        spec.y,
        spec.width,
        spec.height,
        toPhaserColor(PALETTE.steel),
      );
      block.setStrokeStyle(3, toPhaserColor(PALETTE.cyan));

      this.group.add(block);
      this.group.refresh();

      block.setScale(0);
      this.scene.tweens.add({
        targets: block,
        scale: 1,
        duration: POP_MS,
        delay: index * STAGGER_MS,
        ease: 'Back.easeOut',
      });
    });
  }
}
