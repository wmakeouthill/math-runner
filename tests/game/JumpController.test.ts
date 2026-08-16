import { beforeEach, describe, expect, it } from 'vitest';
import { JumpController } from '@/game/systems/JumpController';
import type { JumpInput } from '@/game/systems/JumpController.types';

const IDLE: JumpInput = { justPressed: false, justReleased: false };
const PRESS: JumpInput = { justPressed: true, justReleased: false };
const RELEASE: JumpInput = { justPressed: false, justReleased: true };

const FRAME = 16;
const FALLING = 200;
const RISING = -400;

describe('JumpController', () => {
  let jump: JumpController;

  beforeEach(() => {
    jump = new JumpController();
  });

  it('pula quando aperta no chão', () => {
    expect(jump.update(FRAME, true, PRESS, 0)).toEqual({ type: 'start' });
  });

  it('não pula sem apertar', () => {
    expect(jump.update(FRAME, true, IDLE, 0)).toEqual({ type: 'none' });
  });

  it('coyote time: pula até 100ms depois de sair da beirada', () => {
    jump.update(FRAME, true, IDLE, 0);
    jump.update(80, false, IDLE, FALLING);
    expect(jump.update(FRAME, false, PRESS, FALLING)).toEqual({ type: 'start' });
  });

  it('coyote time expira depois da janela', () => {
    jump.update(FRAME, true, IDLE, 0);
    jump.update(150, false, IDLE, FALLING);
    expect(jump.update(FRAME, false, PRESS, FALLING)).toEqual({ type: 'none' });
  });

  it('jump buffer: apertou no ar e pula ao encostar no chão', () => {
    jump.update(FRAME, false, PRESS, FALLING);
    expect(jump.update(100, true, IDLE, 0)).toEqual({ type: 'start' });
  });

  it('jump buffer expira depois da janela', () => {
    jump.update(FRAME, false, PRESS, FALLING);
    expect(jump.update(200, true, IDLE, 0)).toEqual({ type: 'none' });
  });

  it('não permite pulo duplo', () => {
    expect(jump.update(FRAME, true, PRESS, 0)).toEqual({ type: 'start' });
    expect(jump.update(FRAME, false, PRESS, RISING)).toEqual({ type: 'none' });
  });

  it('corta o pulo ao soltar o botão durante a subida', () => {
    expect(jump.update(FRAME, false, RELEASE, RISING)).toEqual({ type: 'cut' });
  });

  it('não corta o pulo ao soltar durante a queda', () => {
    expect(jump.update(FRAME, false, RELEASE, FALLING)).toEqual({ type: 'none' });
  });

  it('reset limpa as janelas pendentes', () => {
    jump.update(FRAME, false, PRESS, FALLING);
    jump.reset();
    expect(jump.update(FRAME, true, IDLE, 0)).toEqual({ type: 'none' });
  });
});
