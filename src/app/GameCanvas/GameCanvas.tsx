import { MathCard } from '@/app/MathCard/MathCard';
import { usePhaserGame } from './GameCanvas.hooks';

export function GameCanvas() {
  const containerRef = usePhaserGame();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <MathCard />
    </div>
  );
}
