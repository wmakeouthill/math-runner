import type { ReactNode } from 'react';
import { styles } from './Title.styles';

type OptionCardProps = {
  selected: boolean;
  label: string;
  /** Linha curta explicando a opção. Opcional. */
  hint?: string;
  onSelect: () => void;
  children?: ReactNode;
};

/** Cartão de escolha única — serve para personagem e para modo de jogo. */
export function OptionCard({ selected, label, hint, onSelect, children }: OptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      style={selected ? { ...styles.card, ...styles.cardSelected } : styles.card}
    >
      {children}
      <span style={styles.cardLabel}>{label}</span>
      {hint === undefined ? null : <span style={styles.cardHint}>{hint}</span>}
    </button>
  );
}
