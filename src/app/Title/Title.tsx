import { useGameStore } from '@/store/useGameStore';
import type { CharacterId, GameMode } from '@/store/useGameStore.types';
import { Portrait } from '@/app/Portrait/Portrait';
import { Crest } from '@/app/Portrait/Crest';
import { OptionCard } from './OptionCard';
import { styles } from './Title.styles';

const CHARACTERS: ReadonlyArray<{ id: CharacterId; label: string }> = [
  { id: 'ana', label: 'Ana' },
  { id: 'junior', label: 'Junior' },
];

const MODES: ReadonlyArray<{ id: GameMode; label: string; hint: string }> = [
  { id: 'aventura', label: 'Aventura', hint: 'Guardiões do folclore e 3 corações' },
  { id: 'explorador', label: 'Explorador', hint: 'Só obstáculos, sem perder vida' },
];

export function Title() {
  const startLevel = useGameStore((state) => state.startLevel);
  const character = useGameStore((state) => state.character);
  const setCharacter = useGameStore((state) => state.setCharacter);
  const mode = useGameStore((state) => state.mode);
  const setMode = useGameStore((state) => state.setMode);

  return (
    <main style={styles.screen}>
      <section style={styles.brand}>
        <h1 style={styles.title}>MATH RUNNER</h1>
        <p style={styles.subtitle}>O Resgate dos Números</p>

        <div style={styles.schoolBand}>
          <Crest size={34} />
          <span>
            <span style={styles.students}>Junior · Ana</span>
            <br />
            <span style={styles.school}>Escola Euclides da Cunha — 2026</span>
          </span>
        </div>
      </section>

      <section style={styles.choices}>
        <p style={styles.label}>QUEM VAI JOGAR</p>
        <div style={styles.row}>
          {CHARACTERS.map((option) => (
            <OptionCard
              key={option.id}
              selected={character === option.id}
              label={option.label}
              onSelect={() => setCharacter(option.id)}
            >
              <Portrait character={option.id} size={96} />
            </OptionCard>
          ))}
        </div>

        <p style={styles.label}>MONSTROS</p>
        <div style={styles.row}>
          {MODES.map((option) => (
            <OptionCard
              key={option.id}
              selected={mode === option.id}
              label={option.label}
              hint={option.hint}
              onSelect={() => setMode(option.id)}
            />
          ))}
        </div>

        <button type="button" style={styles.playButton} onClick={() => startLevel('1-1')}>
          JOGAR
        </button>
      </section>
    </main>
  );
}
