import { useGameStore } from '@/store/useGameStore';
import { LEVEL_ORDER } from '@/game/levels';
import { formatTime } from '@/app/time';
import { styles } from './LevelSelect.styles';

const STAR_SLOTS = [0, 1, 2];

export function LevelSelect() {
  const startLevel = useGameStore((state) => state.startLevel);
  const goToScreen = useGameStore((state) => state.goToScreen);
  const isUnlocked = useGameStore((state) => state.isUnlocked);
  const progress = useGameStore((state) => state.progress);

  return (
    <main style={styles.screen}>
      <h1 style={styles.heading}>ESCOLHA A FASE</h1>
      <p style={styles.world}>MUNDO 1 · QUINTAL DA ESCOLA</p>

      <div style={styles.row}>
        {LEVEL_ORDER.map((level) => {
          const unlocked = isUnlocked(level.id);
          const result = progress[level.id];

          return (
            <button
              key={level.id}
              type="button"
              disabled={!unlocked}
              style={{ ...styles.card, ...(unlocked ? {} : styles.cardLocked) }}
              onClick={() => startLevel(level.id)}
            >
              <span style={styles.number}>{unlocked ? level.id : '🔒'}</span>
              <span style={styles.name}>{level.name}</span>
              <span style={styles.stars}>
                {STAR_SLOTS.map((slot) => (
                  <span key={slot} style={slot < (result?.stars ?? 0) ? undefined : styles.starOff}>
                    ★
                  </span>
                ))}
              </span>
              <span style={styles.meta}>
                {result ? `melhor tempo ${formatTime(result.timeMs)}` : 'ainda não jogada'}
              </span>
            </button>
          );
        })}
      </div>

      <button type="button" style={styles.back} onClick={() => goToScreen('title')}>
        ← Voltar
      </button>
    </main>
  );
}
