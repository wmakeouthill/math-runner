import { describe, expect, it } from 'vitest';
import { LEVEL_ORDER } from '@/game/levels';
import { LEVEL_1_1 } from '@/game/levels/level-1-1';
import {
  allPlatforms,
  blockStair,
  canReach,
  horizontalGap,
  pointIsReachable,
  reachablePlatforms,
  spawnPlatformIndex,
  topOf,
  unreachablePoints,
  JUMP_REACH,
  SAFE_GAP,
  SAFE_STEP,
  type LevelSpec,
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

describe('escada de blocos', () => {
  const origem = { x: 500, y: 480 };

  it('empilha um bloco por unidade da resposta', () => {
    expect(blockStair(origem, 3)).toHaveLength(3);
    expect(blockStair(origem, 0)).toHaveLength(0);
  });

  it('o primeiro degrau sai do chão de onde a escada nasce', () => {
    const primeiro = blockStair(origem, 1)[0];
    expect(primeiro).toBeDefined();
    if (!primeiro) return;
    expect(origem.y - topOf(primeiro)).toBeLessThanOrEqual(SAFE_STEP);
  });

  it('cada degrau alcança o seguinte, por mais alta que a escada fique', () => {
    const degraus = blockStair(origem, 12);
    degraus.forEach((degrau, index) => {
      const anterior = degraus[index - 1];
      if (!anterior) return;
      expect(canReach(anterior, degrau)).toBe(true);
    });
  });
});

/**
 * O invariante é "alcançável **com os mecanismos acionados**": a plataforma que
 * a ponte entrega e a escada mais curta que os blocos podem formar entram na
 * conta. É por isso que `allPlatforms` existe.
 */
describe.each(LEVEL_ORDER)('fase $id — $name', (fase: LevelSpec) => {
  it('o jogador nasce em cima de uma plataforma, não no vácuo', () => {
    expect(spawnPlatformIndex(fase)).toBeGreaterThanOrEqual(0);
  });

  it('toda plataforma da fase é alcançável a partir do nascimento', () => {
    const alcancadas = reachablePlatforms(fase);
    const perdidas = allPlatforms(fase)
      .map((platform, index) => ({ index, topo: topOf(platform) }))
      .filter(({ index }) => !alcancadas.has(index));

    expect(perdidas).toEqual([]);
  });

  it('painéis, números dourados e bandeiras dão para alcançar a pé', () => {
    expect(unreachablePoints(fase)).toEqual([]);
  });

  it('tem uma porta de saída', () => {
    expect(fase.mechanisms.some((mechanism) => mechanism.kind === 'porta')).toBe(true);
  });

  it('sem os mecanismos a fase trava — eles não são enfeite', () => {
    const semMecanismos: LevelSpec = { ...fase, mechanisms: [] };
    expect(unreachablePoints(semMecanismos).length).toBeGreaterThan(0);
  });
});

describe('fase 1-1', () => {
  it('sem a ponte, o buraco é largo demais para qualquer pulo', () => {
    const chaoInicial = LEVEL_1_1.platforms[0];
    const chaoDoMeio = LEVEL_1_1.platforms[1];
    expect(chaoInicial).toBeDefined();
    expect(chaoDoMeio).toBeDefined();
    if (!chaoInicial || !chaoDoMeio) return;

    expect(horizontalGap(chaoInicial, chaoDoMeio)).toBeGreaterThan(JUMP_REACH.maxDistance);
  });
});

describe('pointIsReachable', () => {
  it('recusa um ponto pendurado no ar, longe de qualquer plataforma', () => {
    expect(pointIsReachable(LEVEL_1_1, { x: 1000, y: 100 })).toBe(false);
  });
});
