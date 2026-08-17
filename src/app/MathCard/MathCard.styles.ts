import type { CSSProperties } from 'react';
import { PALETTE } from '@/theme/palette';

export const styles = {
  /** Rodapé, não tela cheia: o cenário continua visível atrás (SPEC 3). */
  card: {
    position: 'absolute',
    left: '50%',
    bottom: 'clamp(0.6rem, 3vh, 1.5rem)',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.6rem',
    width: 'min(560px, 94vw)',
    padding: 'clamp(0.7rem, 2.5vw, 1.1rem)',
    background: `${PALETTE.night}f2`,
    border: `2px solid ${PALETTE.cyan}`,
    borderRadius: '1.1rem',
    boxShadow: `0 12px 40px ${PALETTE.night}cc`,
  },
  question: {
    fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: PALETTE.ink,
  },
  options: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
    width: '100%',
  },
  option: {
    position: 'relative',
    padding: '0.85rem 0.4rem',
    fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
    fontWeight: 700,
    color: PALETTE.ink,
    background: PALETTE.navy,
    border: `2px solid ${PALETTE.steel}`,
    borderRadius: '0.8rem',
    cursor: 'pointer',
  },
  optionKey: {
    position: 'absolute',
    top: '0.25rem',
    left: '0.4rem',
    fontSize: '0.65rem',
    fontWeight: 600,
    color: PALETTE.faint,
  },
  retry: {
    fontSize: '0.85rem',
    color: PALETTE.gold,
  },
  hint: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.35rem 0.9rem',
  },
  hintGroup: {
    display: 'flex',
    gap: '0.25rem',
  },
  dot: {
    width: '0.85rem',
    height: '0.85rem',
    borderRadius: '999px',
  },
} satisfies Record<string, CSSProperties>;
