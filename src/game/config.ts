import Phaser from 'phaser';
import { GAME_FEEL, GAME_SIZE } from './constants';
import { LevelScene } from './scenes/LevelScene';

export function createGameConfig(
  parent: HTMLElement,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#0b1020',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_SIZE.width,
      height: GAME_SIZE.height,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: GAME_FEEL.gravityY }, debug: false },
    },
    scene: [LevelScene],
  };
}
