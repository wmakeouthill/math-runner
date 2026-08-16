import { usePhaserGame } from './GameCanvas.hooks';

export function GameCanvas() {
  const containerRef = usePhaserGame();
  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
