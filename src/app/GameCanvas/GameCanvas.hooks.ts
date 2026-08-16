import { useEffect, useRef, type RefObject } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '@/game/config';

export function usePhaserGame(): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const game = new Phaser.Game(createGameConfig(container));

    // StrictMode roda este efeito duas vezes no dev; sem destroy sobram
    // duas instâncias do jogo disputando o mesmo input.
    return () => {
      game.destroy(true);
    };
  }, []);

  return containerRef;
}
