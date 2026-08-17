import type { CSSProperties } from 'react';
import { PALETTE } from '@/theme/palette';
import { arcadeFace, arcadePanel, arcadeScreen, ghostButton, pixelFace } from '@/theme/arcade';

export const styles = {
  screen: {
    ...arcadeScreen,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.9rem',
    width: '100%',
    height: '100%',
    padding: 'clamp(1rem, 3vw, 2rem)',
    overflowY: 'auto',
  },
  heading: {
    ...arcadeFace,
    fontSize: 'clamp(0.8rem, 2.6vw, 1.1rem)',
    lineHeight: 1.45,
    color: PALETTE.shirt,
    textAlign: 'center',
  },
  hint: {
    ...pixelFace,
    maxWidth: '36rem',
    fontSize: '0.85rem',
    lineHeight: 1.5,
    color: PALETTE.mute,
    textAlign: 'center',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: 'min(34rem, 100%)',
  },
  card: {
    ...arcadePanel,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
    padding: '0.85rem 1rem',
  },
  title: {
    ...arcadeFace,
    fontSize: '0.55rem',
    lineHeight: 1.5,
    color: PALETTE.ink,
  },
  subtitle: {
    ...pixelFace,
    fontSize: '0.78rem',
    color: PALETTE.gold,
  },
  player: {
    width: '100%',
    height: '2.2rem',
  },
  back: {
    ...ghostButton,
    marginTop: '0.4rem',
  },
} satisfies Record<string, CSSProperties>;
