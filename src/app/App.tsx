import { useGameStore } from '@/store/useGameStore';
import { Title } from './Title/Title';
import { LevelSelect } from './LevelSelect/LevelSelect';
import { GameCanvas } from './GameCanvas/GameCanvas';
import { Bonus } from './Bonus/Bonus';
import { InstallBanner } from './InstallBanner/InstallBanner';

export function App() {
  const screen = useGameStore((state) => state.screen);

  return (
    <>
      {screen === 'title' ? <Title /> : null}
      {screen === 'select' ? <LevelSelect /> : null}
      {screen === 'game' ? <GameCanvas /> : null}
      {screen === 'bonus' ? <Bonus /> : null}
      <InstallBanner allowed={screen !== 'game'} />
    </>
  );
}
