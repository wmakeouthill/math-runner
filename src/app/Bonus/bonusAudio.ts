import { stopBgm } from '@/game/audio/audio';

/** Um MP3 de cada vez — e o chiptune do jogo não toca por cima. */
export function pauseOtherAudio(current: EventTarget | null): void {
  stopBgm();
  if (!(current instanceof HTMLAudioElement)) return;
  document.querySelectorAll('audio').forEach((node) => {
    if (node !== current) node.pause();
  });
}
