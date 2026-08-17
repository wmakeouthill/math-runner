import { describe, expect, it } from 'vitest';
import { facingFor, visualFor } from '@/game/art/playerPose';
import type { Motion } from '@/game/art/playerPose';

const STAND: Motion = { grounded: true, vx: 0, vy: 0, flying: false };

describe('visualFor', () => {
  it('parado no chao fica idle, sem asa', () => {
    expect(visualFor(STAND)).toEqual({ anim: 'idle', wings: false });
  });

  it('andando troca as pernas', () => {
    expect(visualFor({ ...STAND, vx: 260 })).toEqual({ anim: 'walk', wings: false });
    expect(visualFor({ ...STAND, vx: -260 })).toEqual({ anim: 'walk', wings: false });
  });

  it('subindo o pulo encolhe as pernas', () => {
    expect(visualFor({ grounded: false, vx: 0, vy: -400, flying: false })).toEqual({
      anim: 'jump',
      wings: false,
    });
  });

  it('caindo abre as pernas', () => {
    expect(visualFor({ grounded: false, vx: 100, vy: 200, flying: false })).toEqual({
      anim: 'fall',
      wings: false,
    });
  });

  it('ventania com pulo segurado mostra asa e pernas recolhidas', () => {
    expect(visualFor({ grounded: false, vx: 80, vy: -220, flying: true })).toEqual({
      anim: 'jump',
      wings: true,
    });
  });
});

describe('facingFor', () => {
  it('vira para o lado que esta andando e guarda o ultimo', () => {
    expect(facingFor(260, -1)).toBe(1);
    expect(facingFor(-260, 1)).toBe(-1);
    expect(facingFor(0, -1)).toBe(-1);
  });
});
