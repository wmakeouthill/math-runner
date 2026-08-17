import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';

const REACH_X = 64;
const REACH_Y = 90;

/**
 * Painel de Cálculo: o jogador encosta, aperta ação e a conta abre.
 *
 * O painel não sabe qual é a conta nem se ela está certa — só avisa que está ao
 * alcance e mostra o balão da tecla. Quem gera a conta é o mathEngine, quem a
 * desenha é o React.
 */
export class CalcPanel {
  readonly source: string;
  private readonly x: number;
  private readonly y: number;
  private readonly glyph: Phaser.GameObjects.Text;
  private readonly prompt: Phaser.GameObjects.Container;
  private solved = false;

  constructor(scene: Phaser.Scene, source: string, x: number, y: number) {
    this.source = source;
    this.x = x;
    this.y = y;

    scene.add.rectangle(x, y + 30, 6, 56, toPhaserColor(PALETTE.dirt));

    const board = scene.add.rectangle(x, y, 46, 38, toPhaserColor(PALETTE.navy));
    board.setStrokeStyle(3, toPhaserColor(PALETTE.cyan));

    this.glyph = scene.add.text(x, y, '?', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '22px',
      color: PALETTE.cyan,
    });
    this.glyph.setOrigin(0.5);

    const badge = scene.add.rectangle(0, 0, 28, 24, toPhaserColor(PALETTE.night), 0.85);
    badge.setStrokeStyle(2, toPhaserColor(PALETTE.cyan));

    const key = scene.add.text(0, 0, 'E', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '13px',
      color: PALETTE.cyan,
    });
    key.setOrigin(0.5);

    this.prompt = scene.add.container(x, y - 36, [badge, key]);
    this.prompt.setVisible(false);
  }

  /** Mostra ou esconde o balão e devolve se dá para interagir agora. */
  updateProximity(playerX: number, playerY: number): boolean {
    const near =
      !this.solved &&
      Math.abs(playerX - this.x) < REACH_X &&
      Math.abs(playerY - this.y) < REACH_Y;

    this.prompt.setVisible(near);
    return near;
  }

  markSolved(): void {
    this.solved = true;
    this.prompt.setVisible(false);
    this.glyph.setText('✓');
    this.glyph.setColor(PALETTE.gold);
  }
}
