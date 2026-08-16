import { useGameStore } from '@/store/useGameStore';
import type { CharacterId, GameMode } from '@/store/useGameStore.types';
import { styles } from './Title.styles';

const CHARACTERS: ReadonlyArray<{ id: CharacterId; label: string }> = [
  { id: 'ana', label: 'Ana' },
  { id: 'junior', label: 'Junior' },
];

const MODES: ReadonlyArray<{ id: GameMode; label: string }> = [
  { id: 'aventura', label: 'Aventura' },
  { id: 'explorador', label: 'Explorador' },
];

export function Title() {
  const startLevel = useGameStore((state) => state.startLevel);
  const character = useGameStore((state) => state.character);
  const setCharacter = useGameStore((state) => state.setCharacter);
  const mode = useGameStore((state) => state.mode);
  const setMode = useGameStore((state) => state.setMode);

  return (
    <main style={styles.screen}>
      <h1 style={styles.title}>MATH RUNNER</h1>
      <p style={styles.subtitle}>O Resgate dos Números</p>

      <div style={styles.divider} />

      <p style={styles.credits}>
        Junior · Ana
        <br />
        Escola Euclides da Cunha — 2026
      </p>

      <div style={styles.divider} />

      <p style={styles.label}>PERSONAGEM</p>
      <div style={styles.row}>
        {CHARACTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={character === option.id}
            style={
              character === option.id
                ? { ...styles.card, ...styles.cardSelected }
                : styles.card
            }
            onClick={() => setCharacter(option.id)}
          >
            <span style={styles.avatar} />
            {option.label}
          </button>
        ))}
      </div>

      <p style={styles.label}>MONSTROS</p>
      <div style={styles.row}>
        {MODES.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={mode === option.id}
            style={
              mode === option.id
                ? { ...styles.card, ...styles.cardSelected }
                : styles.card
            }
            onClick={() => setMode(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        style={styles.playButton}
        onClick={() => startLevel('1-1')}
      >
        Jogar
      </button>
    </main>
  );
}
