import { afterEach, describe, expect, it } from 'vitest';
import { isIntentionalAnswerClick } from '@/app/MathCard/MathCard.hooks';
import {
  beginInteractGesture,
  resetInteractGesture,
  shouldBlockAnswerPointer,
} from '@/platform/interactGesture';

describe('isIntentionalAnswerClick', () => {
  it('ignora o clique fantasma do botão Interagir — não houve pointerdown na resposta', () => {
    expect(isIntentionalAnswerClick(1, false, false)).toBe(false);
  });

  it('aceita o toque que começou no próprio botão', () => {
    expect(isIntentionalAnswerClick(1, true, false)).toBe(true);
  });

  it('aceita Enter/espaço no botão focado (detail 0, sem pointerdown)', () => {
    expect(isIntentionalAnswerClick(0, false, false)).toBe(true);
  });

  it('ignora o pointerdown que o Android dispara na carta debaixo do dedo do E', () => {
    expect(isIntentionalAnswerClick(1, true, true)).toBe(false);
  });

  it('teclado 1–4 / Enter passam mesmo com o gesto do E ainda vivo', () => {
    expect(isIntentionalAnswerClick(0, false, true)).toBe(true);
  });
});

describe('interactGesture', () => {
  afterEach(() => {
    resetInteractGesture();
  });

  it('bloqueia enquanto o dedo do E não soltou', () => {
    beginInteractGesture(7);
    expect(shouldBlockAnswerPointer()).toBe(true);
  });

  it('ainda bloqueia no clique que vem logo após o pointerup', async () => {
    beginInteractGesture(7);
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, bubbles: true }));
    expect(shouldBlockAnswerPointer()).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(shouldBlockAnswerPointer()).toBe(false);
  });

  it('não solta o bloqueio se outro dedo levantou', () => {
    beginInteractGesture(7);
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 3, bubbles: true }));
    expect(shouldBlockAnswerPointer()).toBe(true);
  });
});
