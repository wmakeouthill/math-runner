import type { CSSProperties } from 'react';
import { PALETTE } from '@/theme/palette';

export const styles = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.1rem',
    width: '100%',
    height: '100%',
    padding: 'clamp(1rem, 3vw, 2rem)',
    overflowY: 'auto',
    background: `radial-gradient(130% 100% at 15% 0%, ${PALETTE.navy} 0%, ${PALETTE.night} 62%)`,
  },
  heading: {
    fontSize: 'clamp(1.4rem, 4vw, 2rem)',
    letterSpacing: '0.06em',
    color: PALETTE.shirt,
  },
  world: {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.22em',
    color: PALETTE.faint,
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.8rem',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.3rem',
    width: 'min(190px, 42vw)',
    padding: '1rem 0.9rem',
    color: PALETTE.ink,
    textAlign: 'center',
    background: `${PALETTE.deep}99`,
    border: `2px solid ${PALETTE.steel}`,
    borderRadius: '1rem',
    cursor: 'pointer',
  },
  cardLocked: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
  number: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: PALETTE.cyan,
  },
  name: {
    fontSize: '0.86rem',
    fontWeight: 700,
  },
  stars: {
    fontSize: '1.1rem',
    letterSpacing: '0.1em',
    color: PALETTE.gold,
  },
  starOff: { color: PALETTE.steel },
  meta: {
    fontSize: '0.72rem',
    color: PALETTE.mute,
  },
  back: {
    padding: '0.6rem 1.4rem',
    fontSize: '0.9rem',
    fontWeight: 700,
    color: PALETTE.ink,
    background: 'transparent',
    border: `2px solid ${PALETTE.steel}`,
    borderRadius: '999px',
    cursor: 'pointer',
  },
} satisfies Record<string, CSSProperties>;
