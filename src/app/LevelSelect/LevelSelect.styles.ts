import type { CSSProperties } from 'react';
import { PALETTE } from '@/theme/palette';
import { arcadeFace, arcadeScreen, ghostButton, hardShadow, pixelFace } from '@/theme/arcade';

export const styles = {
  screen: {
    ...arcadeScreen,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.1rem',
    width: '100%',
    height: '100%',
    padding: 'clamp(1rem, 3vw, 2rem)',
    overflowY: 'auto',
  },
  heading: {
    ...arcadeFace,
    fontSize: 'clamp(0.85rem, 2.8vw, 1.15rem)',
    lineHeight: 1.45,
    color: PALETTE.shirt,
    textShadow: hardShadow(PALETTE.cyan, 3),
    textAlign: 'center',
    textWrap: 'balance',
  },
  world: {
    ...arcadeFace,
    fontSize: '0.48rem',
    letterSpacing: '0.08em',
    color: PALETTE.gold,
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.85rem',
  },
  card: {
    ...pixelFace,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    width: 'min(190px, 42vw)',
    padding: '0.95rem 0.75rem',
    color: PALETTE.ink,
    textAlign: 'center',
    background: PALETTE.deep,
    border: `3px solid ${PALETTE.steel}`,
    borderRadius: 0,
    boxShadow: hardShadow(PALETTE.night, 5),
    cursor: 'pointer',
  },
  cardLocked: {
    opacity: 0.42,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  number: {
    ...arcadeFace,
    fontSize: '0.95rem',
    color: PALETTE.cyan,
    textShadow: hardShadow(PALETTE.navy, 3),
  },
  name: {
    ...arcadeFace,
    fontSize: '0.48rem',
    lineHeight: 1.5,
  },
  stars: {
    fontSize: '1.05rem',
    letterSpacing: '0.12em',
    color: PALETTE.gold,
  },
  starOff: { color: PALETTE.steel },
  meta: {
    ...pixelFace,
    fontSize: '0.7rem',
    color: PALETTE.mute,
    lineHeight: 1.4,
  },
  back: ghostButton,
} satisfies Record<string, CSSProperties>;
