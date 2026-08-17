import type { LevelResult } from './useGameStore.types';

/** O placar da partida em andamento. Some quando a fase fecha. */
export type RunState = {
  levelId: string | null;
  /** Quantos números dourados a fase tem. */
  digitsTotal: number;
  digitsTaken: number;
  /** Contas erradas na fase inteira. */
  errors: number;
  startedAt: number;
  /** Preenchido quando a porta abre; é o que a tela de resultado mostra. */
  result: LevelResult | null;
  /** Corações do modo Aventura. No Explorador ficam parados em MAX_HEARTS. */
  hearts: number;
  /** Tira um coração; devolve true se ainda sobrou algum. */
  loseHeart: () => boolean;
  refillHearts: () => void;
  begin: (levelId: string, digitsTotal: number) => void;
  takeDigit: () => void;
  addError: () => void;
  finish: () => void;
  clear: () => void;
};
