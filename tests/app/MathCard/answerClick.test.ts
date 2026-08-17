import { describe, expect, it } from 'vitest';
import { isIntentionalAnswerClick } from '@/app/MathCard/MathCard.hooks';

describe('isIntentionalAnswerClick', () => {
  it('ignora o clique fantasma do botão Interagir — não houve pointerdown na resposta', () => {
    expect(isIntentionalAnswerClick(1, false)).toBe(false);
  });

  it('aceita o toque que começou no próprio botão', () => {
    expect(isIntentionalAnswerClick(1, true)).toBe(true);
  });

  it('aceita Enter/espaço no botão focado (detail 0, sem pointerdown)', () => {
    expect(isIntentionalAnswerClick(0, false)).toBe(true);
  });
});
