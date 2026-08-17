export type PadAction = 'left' | 'right' | 'jump' | 'interact';

export type PadState = {
  left: boolean;
  right: boolean;
  jump: boolean;
  interact: boolean;
  hold: (action: PadAction) => void;
  release: (action: PadAction) => void;
  releaseAll: () => void;
};
