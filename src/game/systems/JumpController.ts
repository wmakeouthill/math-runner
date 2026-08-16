import { GAME_FEEL } from '@/game/constants';
import type { JumpCommand, JumpInput } from './JumpController.types';

/**
 * Decide QUANDO pular. Não conhece Phaser, não toca em sprite nem em física —
 * só devolve um comando. É o que torna o game feel testável.
 */
export class JumpController {
  private coyoteMs = 0;
  private bufferMs = 0;

  update(
    dtMs: number,
    grounded: boolean,
    input: JumpInput,
    velocityY: number,
  ): JumpCommand {
    this.coyoteMs = grounded
      ? GAME_FEEL.coyoteMs
      : Math.max(0, this.coyoteMs - dtMs);

    this.bufferMs = input.justPressed
      ? GAME_FEEL.jumpBufferMs
      : Math.max(0, this.bufferMs - dtMs);

    if (this.bufferMs > 0 && this.coyoteMs > 0) {
      this.bufferMs = 0;
      this.coyoteMs = 0;
      return { type: 'start' };
    }

    if (input.justReleased && velocityY < 0) {
      return { type: 'cut' };
    }

    return { type: 'none' };
  }

  reset(): void {
    this.coyoteMs = 0;
    this.bufferMs = 0;
  }
}
