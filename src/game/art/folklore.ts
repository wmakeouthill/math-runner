import type { Op } from '@/game/math/mathEngine.types';

export type FolkKind = 'saci' | 'cuca' | 'boitata' | 'boto' | 'curupira';

export const FOLK_KINDS: readonly FolkKind[] = [
  'saci',
  'cuca',
  'boitata',
  'boto',
  'curupira',
];

/** A conta que cada um cobra (SPEC 4b). O Curupira cobra as quatro. */
export const FOLK_OP: Record<Exclude<FolkKind, 'curupira'>, Op> = {
  saci: '+',
  cuca: '-',
  boitata: '*',
  boto: '/',
};

export const FOLK_NAME: Record<FolkKind, string> = {
  saci: 'Saci-Pererê',
  cuca: 'Cuca',
  boitata: 'Boitatá',
  boto: 'Boto-cor-de-rosa',
  curupira: 'Curupira',
};
