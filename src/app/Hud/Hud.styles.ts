import type { CSSProperties } from 'react';
import { PALETTE } from '@/theme/palette';

const pill: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.3rem 0.7rem',
  fontSize: '0.85rem',
  fontWeight: 700,
  color: PALETTE.ink,
  background: `${PALETTE.night}bb`,
  border: `1px solid ${PALETTE.steel}`,
  borderRadius: '999px',
};

export const styles = {
  // O HUD flutua sobre o canvas e não pode roubar o clique do jogo.
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 0.8rem',
    pointerEvents: 'none',
  },
  levelName: {
    ...pill,
    color: PALETTE.cyan,
    letterSpacing: '0.04em',
  },
  digits: { ...pill, color: PALETTE.gold },
  hearts: { ...pill, letterSpacing: '0.1em' },
  time: { ...pill, marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' },
  errors: pill,
  exit: {
    ...pill,
    padding: '0.3rem 0.6rem',
    color: PALETTE.mute,
    cursor: 'pointer',
    pointerEvents: 'auto',
  },
  sound: {
    ...pill,
    padding: '0.3rem 0.6rem',
    cursor: 'pointer',
    pointerEvents: 'auto',
  },
} satisfies Record<string, CSSProperties>;
