import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useRunStore } from '@/store/useRunStore';
import { levelById, nextLevelId } from '@/game/levels';
import { formatTime } from '@/app/time';
import { PALETTE } from '@/theme/palette';
import { playBgm } from '@/game/audio/audio';
import { styles } from './Result.styles';

const STAR_SLOTS = [0, 1, 2];

const CONFETTI = Array.from({ length: 26 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 9) * 0.16}s`,
  duration: `${2.2 + (i % 5) * 0.35}s`,
  color: i % 3 === 0 ? PALETTE.gold : i % 3 === 1 ? PALETTE.cyan : PALETTE.shirt,
}));

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

  useEffect(() => {
    if (result !== null) {
      playBgm('victory');
    }
  }, [result]);

  if (result === null) return null;

  const level = levelById(levelId);
  const proxima = levelId === null ? null : nextLevelId(levelId);
  const hint = missingHint(digitsTaken, digitsTotal, result.errors);

  return (
    <div style={styles.backdrop}>
      <div style={styles.confetti} aria-hidden>
        {CONFETTI.map((flake, index) => (
          <span
            key={index}
            style={{
              ...styles.flake,
              left: flake.left,
              background: flake.color,
              animation: `cair ${flake.duration} ${flake.delay} linear both`,
            }}
          />
        ))}
      </div>
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
          <button type="button" className="arcade-press" style={styles.secondary} onClick={() => goToScreen('select')}>
            Fases
          </button>
          {proxima ? (
            <button type="button" className="arcade-press" style={styles.primary} onClick={() => startLevel(proxima)}>
              Próxima
            </button>
          ) : (
            <button
              type="button"
              className="arcade-press"
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
