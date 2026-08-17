import { useEffect, type SyntheticEvent } from 'react';
import { stopBgm } from '@/game/audio/audio';
import { pauseOtherAudio } from './bonusAudio';

export function useBonusPage() {
  useEffect(() => {
    stopBgm();
  }, []);

  const onPlay = (event: SyntheticEvent<HTMLAudioElement>) => {
    pauseOtherAudio(event.currentTarget);
  };

  return { onPlay };
}
