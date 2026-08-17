import { describe, expect, it } from 'vitest';
import { touchZone } from '@/game/systems/touchZones';

const VIEW = { width: 960, height: 540 };
const SMALL = { width: 400, height: 300 };

describe('touchZone', () => {
  it('primeiro quarto da tela move para a esquerda', () => {
    expect(touchZone(10, 400, VIEW)).toBe('left');
    expect(touchZone(239, 400, VIEW)).toBe('left');
  });

  it('segundo quarto da tela move para a direita', () => {
    expect(touchZone(240, 400, VIEW)).toBe('right');
    expect(touchZone(479, 400, VIEW)).toBe('right');
  });

  it('a metade direita pula', () => {
    expect(touchZone(480, 400, VIEW)).toBe('jump');
    expect(touchZone(959, 400, VIEW)).toBe('jump');
  });

  it('o canto superior direito é o botão de ação', () => {
    expect(touchZone(900, 20, VIEW)).toBe('action');
    expect(touchZone(730, 170, VIEW)).toBe('action');
  });

  it('o d-pad nunca vira ação, por mais alto que o dedo esteja', () => {
    expect(touchZone(100, 5, VIEW)).toBe('left');
    expect(touchZone(300, 5, VIEW)).toBe('right');
  });

  it('funciona em qualquer tamanho de tela', () => {
    expect(touchZone(50, 200, SMALL)).toBe('left');
    expect(touchZone(150, 200, SMALL)).toBe('right');
    expect(touchZone(300, 200, SMALL)).toBe('jump');
    expect(touchZone(380, 20, SMALL)).toBe('action');
  });
});
