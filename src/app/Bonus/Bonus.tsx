import { useGameStore } from '@/store/useGameStore';
import { BONUS_TRACKS } from './bonusTracks';
import { useBonusPage } from './Bonus.hooks';
import { styles } from './Bonus.styles';

export function Bonus() {
  const goToScreen = useGameStore((state) => state.goToScreen);
  const { onPlay } = useBonusPage();

  return (
    <main style={styles.screen}>
      <h1 style={styles.heading}>TRILHAS BÔNUS</h1>
      <p style={styles.hint}>
        Gravações de estúdio. No jogo toca a trilha chiptune — leve, offline e
        abafada quando a conta abre.
      </p>

      <div style={styles.list}>
        {BONUS_TRACKS.map((track) => (
          <article key={track.id} style={styles.card}>
            <span style={styles.title}>{track.title}</span>
            <span style={styles.subtitle}>{track.subtitle}</span>
            <audio
              style={styles.player}
              controls
              preload="none"
              src={track.src}
              onPlay={onPlay}
              aria-label={`Ouvir ${track.title}`}
            />
          </article>
        ))}
      </div>

      <button type="button" className="arcade-press" style={styles.back} onClick={() => goToScreen('title')}>
        ← Voltar
      </button>
    </main>
  );
}
