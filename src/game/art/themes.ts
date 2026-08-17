import { PALETTE } from '@/theme/palette';

export type ThemeName = 'quintal' | 'feira' | 'festa' | 'mata' | 'sertao';

/** O que muda de um cenário para o outro. Tudo desenhado em runtime. */
export type LevelTheme = {
  sky: string;
  skyLow: string;
  /** Vulto distante: morro, barraca, árvore, duna. */
  far: string;
  /** Faixa rente ao chão. */
  near: string;
  /** Cor do enfeite alto (copa, bandeirinha, mandacaru). */
  decor: string;
  decorAlt: string;
};

export const THEMES: Record<ThemeName, LevelTheme> = {
  quintal: {
    sky: PALETTE.sky,
    skyLow: PALETTE.skyLow,
    far: PALETTE.grassDark,
    near: PALETTE.grass,
    decor: PALETTE.grass,
    decorAlt: PALETTE.dirt,
  },
  feira: {
    sky: PALETTE.feiraSky,
    skyLow: PALETTE.feiraSkyLow,
    far: PALETTE.feiraTent,
    near: PALETTE.feiraCrate,
    decor: PALETTE.feiraTent,
    decorAlt: PALETTE.wall,
  },
  festa: {
    sky: PALETTE.festaSky,
    skyLow: PALETTE.festaSkyLow,
    far: PALETTE.steel,
    near: PALETTE.dirt,
    decor: PALETTE.festaFlag,
    decorAlt: PALETTE.festaFire,
  },
  mata: {
    sky: PALETTE.mataSky,
    skyLow: PALETTE.mataSkyLow,
    far: PALETTE.mataLeaf,
    near: PALETTE.grassDark,
    decor: PALETTE.mataLeaf,
    decorAlt: PALETTE.mataTrunk,
  },
  sertao: {
    sky: PALETTE.sertaoSky,
    skyLow: PALETTE.sertaoSkyLow,
    far: PALETTE.dirt,
    near: PALETTE.sertaoGround,
    decor: PALETTE.sertaoCactus,
    decorAlt: PALETTE.dirt,
  },
};
