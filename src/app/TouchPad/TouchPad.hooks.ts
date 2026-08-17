import { useEffect, type PointerEvent, type MouseEvent } from 'react';
import { useChallengeStore } from '@/store/useChallengeStore';
import { useRunStore } from '@/store/useRunStore';
import { usePadStore } from '@/store/usePadStore';
import type { PadAction } from '@/store/usePadStore.types';
import { useCoarsePointer } from '@/platform/useCoarsePointer';

function press(event: PointerEvent<HTMLButtonElement>, action: PadAction): void {
  event.preventDefault();
  event.currentTarget.setPointerCapture(event.pointerId);
  usePadStore.getState().hold(action);
}

function lift(action: PadAction): void {
  usePadStore.getState().release(action);
}

function blockMenu(event: MouseEvent): void {
  event.preventDefault();
}

export function useTouchPad() {
  const coarsePointer = useCoarsePointer();
  const challengeOpen = useChallengeStore((state) => state.challenge !== null);
  const resultOpen = useRunStore((state) => state.result !== null);
  const visible = coarsePointer && !challengeOpen && !resultOpen;

  useEffect(() => {
    if (!visible) usePadStore.getState().releaseAll();
  }, [visible]);

  useEffect(() => () => usePadStore.getState().releaseAll(), []);

  const bind = (action: PadAction) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => press(event, action),
    onPointerUp: () => lift(action),
    onPointerCancel: () => lift(action),
    onLostPointerCapture: () => lift(action),
    onContextMenu: blockMenu,
  });

  return { visible, bind };
}
