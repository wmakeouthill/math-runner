import { useGameStore } from '@/store/useGameStore';
import { useRunStore } from '@/store/useRunStore';
import { levelById, nextLevelId } from '@/game/levels';
import { formatTime } from '@/app/time';
import { styles } from './Result.styles';

const STAR_SLOTS = [0, 1, 2];

/** O que faltou para a estrela que não veio — some quando as três vieram. */
function missingHint(digitsTaken: number, digitsTotal: number, errors: number): string | null {
  if (digitsTaken < digitsTotal) {
    const faltam = digitsTotal - digitsTaken;
    return `Faltaram ${faltam} número${faltam > 1 ? 's' : ''} dourado${faltam > 1 ? 's' : ''}.`;
  }
  if (errors > 0) return 'Acerte todas as contas de primeira para a terceira estrela.';
  return null;
}

export function Result() {
  const startLevel = useGameStore((state) => state.startLevel);
  const goToScreen = useGameStore((state) => state.goToScreen);
  const levelId = useGameStore((state) => state.currentLevel);
  const result = useRunStore((state) => state.result);
  const digitsTaken = useRunStore((state) => state.digitsTaken);
  const digitsTotal = useRunStore((state) => state.digitsTotal);

  if (result === null) return null;

  const level = levelById(levelId);
  const proxima = levelId === null ? null : nextLevelId(levelId);
  const hint = missingHint(digitsTaken, digitsTotal, result.errors);

  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        <p style={styles.banner}>FASE COMPLETA!</p>
        <p style={styles.levelName}>{level?.name ?? ''}</p>

        <div style={styles.stars}>
          {STAR_SLOTS.map((slot) => (
            <span
              key={slot}
              style={{
                ...(slot < result.stars ? styles.star : styles.starOff),
                animation: `estourar 420ms ${240 + slot * 220}ms ease-out both`,
              }}
            >
              ★
            </span>
          ))}
        </div>

        <div style={styles.lines}>
          <span>
            Números dourados: {digitsTaken}/{digitsTotal}
          </span>
          <span>Contas erradas: {result.errors}</span>
          <span>Tempo: {formatTime(result.timeMs)}</span>
        </div>
        {hint && <p style={styles.missing}>{hint}</p>}

        <div style={styles.actions}>
          <button type="button" style={styles.secondary} onClick={() => goToScreen('select')}>
            Fases
          </button>
          {proxima ? (
            <button type="button" style={styles.primary} onClick={() => startLevel(proxima)}>
              Próxima
            </button>
          ) : (
            <button
              type="button"
              style={styles.primary}
              onClick={() => levelId && startLevel(levelId)}
            >
              Jogar de novo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
