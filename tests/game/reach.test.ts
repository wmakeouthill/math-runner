import { describe, expect, it } from 'vitest';
import { LEVEL_1_1 } from '@/game/levels/level-1-1';
import {
  canReach,
  horizontalGap,
  reachablePlatforms,
  spawnPlatformIndex,
  topOf,
  JUMP_REACH,
  SAFE_GAP,
  SAFE_STEP,
  type PlatformSpec,
} from '@/game/levels/reach';

const chao: PlatformSpec = { x: 400, y: 500, width: 400, height: 40 };

describe('limites de alcance', () => {
  it('derivam do GAME_FEEL e sobram folga sobre o máximo', () => {
    expect(SAFE_STEP).toBeLessThan(JUMP_REACH.maxHeight);
    expect(SAFE_GAP).toBeLessThan(JUMP_REACH.maxDistance);
  });
});

describe('canReach', () => {
  it('aceita um degrau dentro do alcance', () => {
    const degrau: PlatformSpec = { x: 400, y: 500 - 80, width: 160, height: 24 };
    expect(canReach(chao, degrau)).toBe(true);
  });

  it('recusa um degrau alto demais', () => {
    const altoDemais: PlatformSpec = {
      x: 400,
      y: chao.y - SAFE_STEP - 30,
      width: 160,
      height: 24,
    };
    expect(canReach(chao, altoDemais)).toBe(false);
  });

  it('recusa uma plataforma longe demais na horizontal', () => {
    const longe: PlatformSpec = {
      x: chao.x + chao.width / 2 + SAFE_GAP + 100,
      y: chao.y,
      width: 160,
      height: 24,
    };
    expect(canReach(chao, longe)).toBe(false);
  });

  it('descer é sempre possível, por mais fundo que seja', () => {
    const fundo: PlatformSpec = { x: 420, y: 5000, width: 160, height: 24 };
    expect(canReach(chao, fundo)).toBe(true);
  });
});

describe('horizontalGap', () => {
  it('é zero quando as plataformas se sobrepõem', () => {
    const sobreposta: PlatformSpec = { x: 500, y: 400, width: 400, height: 24 };
    expect(horizontalGap(chao, sobreposta)).toBe(0);
  });

  it('mede o vão independente da ordem dos argumentos', () => {
    const direita: PlatformSpec = { x: 800, y: 500, width: 200, height: 24 };
    expect(horizontalGap(chao, direita)).toBe(100);
    expect(horizontalGap(direita, chao)).toBe(100);
  });
});

describe('fase 1-1', () => {
  it('o jogador nasce em cima de uma plataforma, não no vácuo', () => {
    expect(spawnPlatformIndex(LEVEL_1_1)).toBeGreaterThanOrEqual(0);
  });

  it('toda plataforma da fase é alcançável a partir do nascimento', () => {
    const alcancadas = reachablePlatforms(LEVEL_1_1);
    const perdidas = LEVEL_1_1.platforms
      .map((p, index) => ({ index, topo: topOf(p) }))
      .filter(({ index }) => !alcancadas.has(index));

    expect(perdidas).toEqual([]);
  });
});
