export type JumpInput = {
  justPressed: boolean;
  justReleased: boolean;
};

export type JumpCommand =
  | { type: 'none' }
  | { type: 'start' }
  | { type: 'cut' };
