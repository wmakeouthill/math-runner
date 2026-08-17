import type { CSSProperties } from 'react';
import { PALETTE } from '@/theme/palette';
import { arcadeFace, arcadePanel, arcadeScreen, ghostButton, hardShadow, pixelFace, primaryButton } from '@/theme/arcade';

export const styles = {
  screen: {
    ...arcadeScreen,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(1.2rem, 5vw, 3.5rem)',
    width: '100%',
    height: '100%',
    padding: 'clamp(1rem, 3vw, 2rem)',
    overflowY: 'auto',
  },

  brand: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.55rem',
    textAlign: 'center',
  },
  title: {
    ...arcadeFace,
    fontSize: 'clamp(1.15rem, 4.4vw, 2.05rem)',
    lineHeight: 1.35,
    color: PALETTE.shirt,
    textShadow: hardShadow(PALETTE.cyan, 4),
    textWrap: 'balance',
  },
  subtitle: {
    ...arcadeFace,
    fontSize: 'clamp(0.48rem, 1.7vw, 0.68rem)',
    lineHeight: 1.6,
    color: PALETTE.cyan,
  },
  schoolBand: {
    ...arcadePanel,
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    marginTop: '0.6rem',
    padding: '0.55rem 0.9rem',
    borderColor: PALETTE.steel,
  },
  schoolCrest: {
    height: '4rem',
    width: 'auto',
    flexShrink: 0,
    mixBlendMode: 'lighten',
  },
  students: {
    ...arcadeFace,
    fontSize: '0.58rem',
    color: PALETTE.ink,
    lineHeight: 1.5,
  },
  school: {
    ...pixelFace,
    fontSize: '0.78rem',
    color: PALETTE.mute,
    marginTop: '0.25rem',
  },

  choices: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '0.85rem',
    minWidth: 'min(320px, 92vw)',
  },
  label: {
    ...arcadeFace,
    fontSize: '0.52rem',
    letterSpacing: '0.08em',
    color: PALETTE.gold,
  },
  row: {
    display: 'flex',
    gap: '0.7rem',
  },

  card: {
    ...pixelFace,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.7rem 0.7rem 0.8rem',
    color: PALETTE.ink,
    background: PALETTE.deep,
    border: `3px solid ${PALETTE.steel}`,
    borderRadius: 0,
    boxShadow: hardShadow(PALETTE.night, 4),
    cursor: 'pointer',
  },
  cardSelected: {
    border: `3px solid ${PALETTE.cyan}`,
    background: PALETTE.navy,
    boxShadow: hardShadow(PALETTE.cyan, 4),
  },
  cardLabel: {
    ...arcadeFace,
    fontSize: '0.55rem',
    lineHeight: 1.4,
  },
  cardHint: {
    ...pixelFace,
    fontSize: '0.72rem',
    lineHeight: 1.45,
    color: PALETTE.mute,
    textAlign: 'center',
  },

  playButton: {
    ...primaryButton,
    marginTop: '0.35rem',
  },
  bonus: {
    ...ghostButton,
    marginTop: '0.35rem',
    fontSize: '0.48rem',
  },
} satisfies Record<string, CSSProperties>;
