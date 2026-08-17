import { useGameStore } from '@/store/useGameStore';
import { MathCard } from '@/app/MathCard/MathCard';
import { Hud } from '@/app/Hud/Hud';
import { Result } from '@/app/Result/Result';
import { TouchPad } from '@/app/TouchPad/TouchPad';
import { usePhaserGame } from './GameCanvas.hooks';

function Stage() {
  const containerRef = usePhaserGame();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <Hud />
      <TouchPad />
      <MathCard />
      <Result />
    </div>
  );
}

/**
 * A `key` derruba e recria o jogo inteiro ao trocar de fase. Um `scene.restart`
 * seria mais barato, mas também é onde moram os bugs de estado que sobra: por
 * duas vezes na vida do jogo, recriar sai mais barato de manter.
 */
export function GameCanvas() {
  const levelId = useGameStore((state) => state.currentLevel);
  return <Stage key={levelId ?? 'nenhuma'} />;
}
