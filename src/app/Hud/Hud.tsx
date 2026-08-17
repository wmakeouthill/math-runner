import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useRunStore } from '@/store/useRunStore';
import { DIFFICULTY } from '@/game/math/difficulty';
import { levelById } from '@/game/levels';
import { formatTime } from '@/app/time';
import { styles } from './Hud.styles';

/** Relógio da partida. Um tick a cada 250 ms basta e não acorda o React à toa. */
function useElapsed(startedAt: number, running: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running, startedAt]);

  return now - startedAt;
}

export function Hud() {
  const goToScreen = useGameStore((state) => state.goToScreen);
  const muted = useGameStore((state) => state.muted);
  const toggleMuted = useGameStore((state) => state.toggleMuted);
  const mode = useGameStore((state) => state.mode);
  const difficulty = useGameStore((state) => state.difficulty);
  const levelId = useGameStore((state) => state.currentLevel);
  const digitsTaken = useRunStore((state) => state.digitsTaken);
  const digitsTotal = useRunStore((state) => state.digitsTotal);
  const errors = useRunStore((state) => state.errors);
  const hearts = useRunStore((state) => state.hearts);
  const startedAt = useRunStore((state) => state.startedAt);
  const result = useRunStore((state) => state.result);

  const elapsed = useElapsed(startedAt, result === null);
  const level = levelById(levelId);
  // Quantos corações a dificuldade dá. No Difícil são 2, não 3 — desenhar
  // sempre 3 fazia a partida começar com um coração apagado, como se o jogador
  // já tivesse errado.
  const totalHearts = DIFFICULTY[difficulty].hearts;

  return (
    <div style={styles.bar}>
      <button type="button" className="arcade-press" style={styles.exit} onClick={() => goToScreen('select')}>
        ← Fases
      </button>
      <span style={styles.levelName}>{level?.name ?? ''}</span>
      {mode === 'aventura' && (
        <span style={styles.hearts}>
          {'❤'.repeat(hearts)}
          {'🖤'.repeat(Math.max(0, totalHearts - hearts))}
        </span>
      )}
      <span style={styles.digits}>
        ★ {digitsTaken}/{digitsTotal}
      </span>
      {errors > 0 && <span style={styles.errors}>✗ {errors}</span>}
      <span style={styles.time}>{formatTime(result?.timeMs ?? elapsed)}</span>
      <button
        type="button"
        className="arcade-press"
        style={styles.sound}
        aria-label={muted ? 'Ligar o som' : 'Desligar o som'}
        onClick={toggleMuted}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}
