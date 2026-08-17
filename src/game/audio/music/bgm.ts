import { useGameStore } from '@/store/useGameStore';
import { useChallengeStore } from '@/store/useChallengeStore';
import { ChiptuneSynth } from './synth';
import { TRACKS } from './tracks';

export type BgmTrackId =
  | 'title'
  | 'select'
  | 'quintal'
  | 'feira'
  | 'festa'
  | 'sertao'
  | 'mata'
  | 'victory';

if (typeof window !== 'undefined') {
  useGameStore.subscribe((state, prev) => {
    if (state.muted !== prev.muted) {
      ChiptuneSynth.setMuted(state.muted);
    }
  });

  useChallengeStore.subscribe((state, prev) => {
    const isNowOpen = state.challenge !== null;
    const wasOpen = prev.challenge !== null;
    if (isNowOpen !== wasOpen) {
      ChiptuneSynth.setMuffled(isNowOpen);
    }
  });
}

/** Inicia uma trilha pelo id do tema ou da fase. Id desconhecido cai no tema. */
export function playBgm(id: BgmTrackId | string): void {
  ChiptuneSynth.setMuted(useGameStore.getState().muted);
  const trackKey = id in TRACKS ? id : 'title';
  const track = TRACKS[trackKey];
  if (track) ChiptuneSynth.play(track);
}

export function stopBgm(): void {
  ChiptuneSynth.stop();
}
