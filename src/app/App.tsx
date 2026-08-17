import { useGameStore } from '@/store/useGameStore';
import { Title } from './Title/Title';
import { LevelSelect } from './LevelSelect/LevelSelect';
import { GameCanvas } from './GameCanvas/GameCanvas';

export function App() {
  const screen = useGameStore((state) => state.screen);

  if (screen === 'title') return <Title />;
  if (screen === 'select') return <LevelSelect />;
  return <GameCanvas />;
}
