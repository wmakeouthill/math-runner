import { describe, expect, it } from 'vitest';
import { padFrame, type PadButtons } from '@/game/systems/padInput';

const SOLTO: PadButtons = { left: false, right: false, jump: false, interact: false };

describe('padFrame', () => {
  it('no primeiro frame do pulo dispara justPressed e segura jumpHeld', () => {
    const frame = padFrame({ ...SOLTO, jump: true }, { jump: false, interact: false });
    expect(frame.jumpJustPressed).toBe(true);
    expect(frame.jumpJustReleased).toBe(false);
    expect(frame.jumpHeld).toBe(true);
  });

  it('segurar o pulo no frame seguinte não dispara de novo', () => {
    const frame = padFrame({ ...SOLTO, jump: true }, { jump: true, interact: false });
    expect(frame.jumpJustPressed).toBe(false);
    expect(frame.jumpHeld).toBe(true);
  });

  it('soltar o pulo dispara justReleased e desliga o voo', () => {
    const frame = padFrame(SOLTO, { jump: true, interact: false });
    expect(frame.jumpJustReleased).toBe(true);
    expect(frame.jumpHeld).toBe(false);
  });

  it('interagir só dispara no frame em que o dedo desce', () => {
    const down = padFrame({ ...SOLTO, interact: true }, { jump: false, interact: false });
    expect(down.interactJustPressed).toBe(true);
    const held = padFrame({ ...SOLTO, interact: true }, { jump: false, interact: true });
    expect(held.interactJustPressed).toBe(false);
  });

  it('andar para os dois lados passa direto', () => {
    const frame = padFrame({ ...SOLTO, left: true, right: true }, { jump: false, interact: false });
    expect(frame.left).toBe(true);
    expect(frame.right).toBe(true);
  });
});
