import { useGameStore } from '@/store/useGameStore';
import { Title } from './Title/Title';
import { GameCanvas } from './GameCanvas/GameCanvas';

export function App() {
  const screen = useGameStore((state) => state.screen);
  return screen === 'title' ? <Title /> : <GameCanvas />;
}
