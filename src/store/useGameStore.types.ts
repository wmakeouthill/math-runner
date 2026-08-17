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
  goToScreen: (screen: Screen) => void;
  startLevel: (id: LevelId) => void;
  completeLevel: (id: LevelId, result: LevelResult) => void;
  isUnlocked: (id: LevelId) => boolean;
  setCharacter: (id: CharacterId) => void;
  setMode: (mode: GameMode) => void;
  resetProgress: () => void;
};
