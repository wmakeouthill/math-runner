import { useEffect, useRef, type RefObject } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '@/game/config';
import type { LevelScene } from '@/game/scenes/LevelScene';

export function usePhaserGame(): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const game = new Phaser.Game(createGameConfig(container));

    // StrictMode roda este efeito duas vezes no dev; sem destroy sobram
    // duas instâncias do jogo disputando o mesmo input.
    // O destroy é no próximo frame: o subscribe da cena antiga sai agora,
    // senão o acerto explode no Text morto e a ponte da cena viva não desce.
    return () => {
      const scene = game.scene.getScene('LevelScene') as LevelScene | undefined;
      scene?.detachChallengeListener();
      game.destroy(true);
    };
  }, []);

  return containerRef;
}
