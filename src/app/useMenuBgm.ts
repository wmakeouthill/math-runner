import { useEffect } from 'react';
import { playBgm } from '@/game/audio/audio';

/**
 * Menu e seleção compartilham o tema. O primeiro toque destrava o áudio no
 * celular; se a trilha já estiver soando, o sintetizador ignora o replay.
 */
export function useMenuBgm(): void {
  useEffect(() => {
    playBgm('title');
    const unlock = () => playBgm('title');
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);
}
