import type { CSSProperties } from 'react';
import { PALETTE } from '@/theme/palette';
import { ghostButton, hardShadow, pixelFace } from '@/theme/arcade';

const pill: CSSProperties = {
  ...pixelFace,
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.28rem 0.55rem',
  fontSize: '0.72rem',
  color: PALETTE.ink,
  background: `${PALETTE.night}cc`,
  border: `2px solid ${PALETTE.steel}`,
  borderRadius: 0,
};

export const styles = {
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.55rem 0.7rem',
    pointerEvents: 'none',
  },
  levelName: {
    ...pill,
    color: PALETTE.cyan,
    maxWidth: '18ch',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  digits: { ...pill, color: PALETTE.gold },
  hearts: { ...pill, letterSpacing: '0.08em' },
  time: { ...pill, marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' },
  errors: pill,
  exit: {
    ...ghostButton,
    padding: '0.45rem 0.55rem',
    fontSize: '0.42rem',
    pointerEvents: 'auto',
    boxShadow: hardShadow(PALETTE.night, 3),
  },
  sound: {
    ...ghostButton,
    padding: '0.4rem 0.5rem',
    fontSize: '0.7rem',
    pointerEvents: 'auto',
    boxShadow: hardShadow(PALETTE.night, 3),
  },
} satisfies Record<string, CSSProperties>;
