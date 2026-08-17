import type { CSSProperties } from 'react';
import { PALETTE } from '@/theme/palette';
import { arcadeFace, hardShadow, pixelFace } from '@/theme/arcade';

export const styles = {
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
    border: `3px solid ${PALETTE.cyan}`,
    borderRadius: 0,
    boxShadow: hardShadow(PALETTE.navy, 6),
    zIndex: 4,
  },
  question: {
    ...arcadeFace,
    fontSize: 'clamp(0.85rem, 3.4vw, 1.25rem)',
    lineHeight: 1.45,
    color: PALETTE.ink,
    textShadow: hardShadow(PALETTE.navy, 3),
  },
  options: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.55rem',
    width: '100%',
  },
  option: {
    ...arcadeFace,
    position: 'relative',
    padding: '0.9rem 0.35rem 0.7rem',
    fontSize: 'clamp(0.7rem, 2.8vw, 1rem)',
    color: PALETTE.ink,
    background: PALETTE.navy,
    border: `3px solid ${PALETTE.steel}`,
    borderRadius: 0,
    boxShadow: hardShadow(PALETTE.night, 4),
    cursor: 'pointer',
  },
  optionKey: {
    ...pixelFace,
    position: 'absolute',
    top: '0.2rem',
    left: '0.3rem',
    fontSize: '0.65rem',
    color: PALETTE.gold,
  },
  retry: {
    ...pixelFace,
    fontSize: '0.8rem',
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
    borderRadius: 0,
  },
} satisfies Record<string, CSSProperties>;
