import Phaser from 'phaser';
import type { Point } from '@/game/levels/reach';
import { drawFolk } from '@/game/art/folkloreDraw';
import { BOSS_ROUNDS, type FolkKind } from '@/game/art/folklore';

const REACH_X = 52;
const REACH_Y = 80;

/**
 * Monstro do folclore que cobra uma conta. Não persegue — fica no lugar e
 * pergunta para quem chega perto. Guardião que corre atrás vira jogo de
 * reflexo, e o jogo é de conta.
 */
export class Guardian {
  readonly id: string;
  readonly at: Point;
  readonly kind: FolkKind;
  private readonly scene: Phaser.Scene;
  private readonly body: Phaser.GameObjects.Container;
  private defeated = false;
  private rounds: number;

  constructor(scene: Phaser.Scene, id: string, at: Point, kind: FolkKind) {
    this.scene = scene;
    this.id = id;
    this.at = at;
    this.kind = kind;
    this.rounds = kind === 'curupira' ? BOSS_ROUNDS : 1;

    const { dust, figure } = drawFolk(scene, kind);
    // O chefe é maior que os outros — dá para ver de longe que ele é diferente.
    if (kind === 'curupira') figure.setScale(1.35);

    this.body = scene.add.container(at.x, at.y, [...dust, figure]);
    this.body.setDepth(1);

    scene.tweens.add({
      targets: figure,
      y: -6,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    if (dust[0]) {
      scene.tweens.add({
        targets: dust[0],
        scaleX: 1.3,
        angle: 180,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
    if (dust[1]) {
      scene.tweens.add({
        targets: dust[1],
        scaleX: 0.7,
        duration: 480,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
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

  /** Uma conta certa a menos. Devolve true quando o monstro cai de vez. */
  scoreRound(): boolean {
    this.rounds = Math.max(0, this.rounds - 1);
    return this.rounds === 0;
  }

  /** Quantas contas ainda faltam. O HUD do chefe mostra isso. */
  get roundsLeft(): number {
    return this.rounds;
  }

  /** O jogador errou: o monstro rodopia comemorando. */
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
