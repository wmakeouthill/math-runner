import { usePadStore } from '@/store/usePadStore';
import { padFace, styles } from './TouchPad.styles';
import { useTouchPad } from './TouchPad.hooks';

export function TouchPad() {
  const { visible, bind } = useTouchPad();
  const left = usePadStore((state) => state.left);
  const right = usePadStore((state) => state.right);
  const jump = usePadStore((state) => state.jump);
  const interact = usePadStore((state) => state.interact);

  if (!visible) return null;

  return (
    <div style={styles.root}>
      <div style={styles.left}>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Andar para a esquerda"
          aria-pressed={left}
          style={padFace(styles.walk, left)}
          {...bind('left')}
        >
          ←
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Andar para a direita"
          aria-pressed={right}
          style={padFace(styles.walk, right)}
          {...bind('right')}
        >
          →
        </button>
      </div>
      <div style={styles.right}>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Interagir"
          aria-pressed={interact}
          style={padFace(styles.interact, interact)}
          {...bind('interact')}
        >
          E
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Pular"
          aria-pressed={jump}
          style={padFace(styles.jump, jump)}
          {...bind('jump')}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
