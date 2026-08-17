import type { Op, Tier } from '@/game/math/mathEngine.types';
import type { Difficulty } from '@/game/math/difficulty';

export type LevelId = string;

export type Screen = 'title' | 'select' | 'game';

/** Os personagens jogáveis são os próprios autores do trabalho. */
export type CharacterId = 'ana' | 'junior';

/** 'aventura' tem guardiões e corações; 'explorador' só tem obstáculos. */
export type GameMode = 'aventura' | 'explorador';

export type LevelResult = {
  stars: number;
  errors: number;
  timeMs: number;
};

export type GameState = {
  screen: Screen;
  currentLevel: LevelId | null;
  progress: Record<LevelId, LevelResult>;
  character: CharacterId;
  mode: GameMode;
  difficulty: Difficulty;
  goToScreen: (screen: Screen) => void;
  startLevel: (id: LevelId) => void;
  completeLevel: (id: LevelId, result: LevelResult) => void;
  isUnlocked: (id: LevelId) => boolean;
  setCharacter: (id: CharacterId) => void;
  setMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  resetProgress: () => void;
  muted: boolean;
  toggleMuted: () => void;
  /** Nível atual do aluno em cada operação. Sobe e desce sozinho. */
  playerTier: Record<Op, Tier>;
  /** Acertos seguidos (positivo) ou erros seguidos (negativo) por operação. */
  streak: Record<Op, number>;
  recordAnswer: (op: Op, correct: boolean) => void;
};
