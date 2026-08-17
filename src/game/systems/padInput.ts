import type { PadState } from '@/store/usePadStore.types';

export type PadButtons = Pick<PadState, 'left' | 'right' | 'jump' | 'interact'>;

export type PadWasHeld = {
  jump: boolean;
  interact: boolean;
};

export type PadFrame = {
  left: boolean;
  right: boolean;
  jumpJustPressed: boolean;
  jumpJustReleased: boolean;
  jumpHeld: boolean;
  interactJustPressed: boolean;
};

/**
 * Converte "está apertado agora" em bordas de um frame.
 * Sem isso o pulo dispara todo update enquanto o dedo segura.
 */
export function padFrame(pad: PadButtons, was: PadWasHeld): PadFrame {
  return {
    left: pad.left,
    right: pad.right,
    jumpJustPressed: pad.jump && !was.jump,
    jumpJustReleased: !pad.jump && was.jump,
    jumpHeld: pad.jump,
    interactJustPressed: pad.interact && !was.interact,
  };
}
