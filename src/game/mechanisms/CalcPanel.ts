import Phaser from 'phaser';
import { PALETTE, toPhaserColor } from '@/theme/palette';

const REACH_X = 64;
const REACH_Y = 90;

/** Painel de parede ou porta da fase — muda o desenho, não o funcionamento. */
export type PanelVariant = 'painel' | 'porta';

/**
 * Painel de Cálculo: o jogador encosta, aperta ação e a conta abre.
 *
 * O painel não sabe qual é a conta nem se ela está certa — só avisa que está ao
 * alcance e mostra o balão da tecla. Quem gera a conta é o mathEngine, quem a
 * desenha é o React.
 */
export class CalcPanel {
  readonly source: string;
  private readonly scene: Phaser.Scene;
  private readonly x: number;
  private readonly y: number;
  private readonly glyph: Phaser.GameObjects.Text;
  private readonly prompt: Phaser.GameObjects.Container;
  /** A folha da porta, que gira ao abrir. Só existe na variante 'porta'. */
  private readonly leaf: Phaser.GameObjects.Rectangle | null;
  private solved = false;

  constructor(
    scene: Phaser.Scene,
    source: string,
    x: number,
    y: number,
    variant: PanelVariant = 'painel',
  ) {
    this.scene = scene;
    this.source = source;
    this.x = x;
    this.y = y;

    this.leaf = variant === 'porta' ? this.drawDoor(scene, x, y) : this.drawBoard(scene, x, y);

    this.glyph = scene.add.text(x, variant === 'porta' ? y - 15 : y, '?', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: variant === 'porta' ? '28px' : '22px',
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

    this.prompt = scene.add.container(x, y - (variant === 'porta' ? 80 : 36), [badge, key]);
    this.prompt.setVisible(false);
  }

  private drawBoard(scene: Phaser.Scene, x: number, y: number): null {
    scene.add.rectangle(x, y + 30, 6, 56, toPhaserColor(PALETTE.dirt));

    const board = scene.add.rectangle(x, y, 46, 38, toPhaserColor(PALETTE.navy));
    board.setStrokeStyle(3, toPhaserColor(PALETTE.cyan));
    return null;
  }

  /** Porta da fase: batente de alvenaria, folha de madeira e um vão escuro. */
  private drawDoor(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Rectangle {
    const frame = scene.add.rectangle(x, y - 15, 72, 98, toPhaserColor(PALETTE.wall));
    frame.setStrokeStyle(3, toPhaserColor(PALETTE.dirt));

    scene.add.rectangle(x, y - 15, 58, 86, toPhaserColor(PALETTE.night));

    const leaf = scene.add.rectangle(x - 29, y - 15, 58, 86, toPhaserColor(PALETTE.dirt));
    leaf.setOrigin(0, 0.5);
    leaf.setStrokeStyle(2, toPhaserColor(PALETTE.gold));
    return leaf;
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
    // Cena já destruída (StrictMode/HMR): o canvas do Text é null e
    // setText explode, travando o subscribe da cena que ainda está viva.
    if (!this.scene.sys.isActive()) return;
    this.glyph.setText('✓');
    this.glyph.setColor(PALETTE.gold);

    if (!this.leaf) return;
    this.glyph.setVisible(false);
    this.scene.tweens.add({
      targets: this.leaf,
      scaleX: 0.12,
      duration: 420,
      ease: 'Quad.easeOut',
    });
  }
}
