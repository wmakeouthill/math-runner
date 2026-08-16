import { describe, expect, it } from 'vitest';
import { touchZone } from '@/game/systems/touchZones';

const WIDTH = 960;

describe('touchZone', () => {
  it('primeiro quarto da tela move para a esquerda', () => {
    expect(touchZone(10, WIDTH)).toBe('left');
    expect(touchZone(239, WIDTH)).toBe('left');
  });

  it('segundo quarto da tela move para a direita', () => {
    expect(touchZone(240, WIDTH)).toBe('right');
    expect(touchZone(479, WIDTH)).toBe('right');
  });

  it('toda a metade direita pula', () => {
    expect(touchZone(480, WIDTH)).toBe('jump');
    expect(touchZone(959, WIDTH)).toBe('jump');
  });

  it('funciona em qualquer largura de tela', () => {
    expect(touchZone(50, 400)).toBe('left');
    expect(touchZone(150, 400)).toBe('right');
    expect(touchZone(300, 400)).toBe('jump');
  });
});
