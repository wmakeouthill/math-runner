import type { CSSProperties } from 'react';
import { PALETTE } from '@/theme/palette';
import { ghostButton, hardShadow, pixelFace, primaryButton } from '@/theme/arcade';

export const styles = {
  bar: {
    position: 'fixed',
    top: 'max(0.45rem, env(safe-area-inset-top))',
    left: '50%',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    width: 'min(34rem, calc(100% - 1rem))',
    padding: '0.55rem 0.7rem',
    transform: 'translateX(-50%)',
    background: `${PALETTE.night}f2`,
    border: `3px solid ${PALETTE.cyan}`,
    borderRadius: 0,
    boxShadow: hardShadow(PALETTE.navy, 5),
  },
  icon: {
    width: '2.2rem',
    height: '2.2rem',
    flexShrink: 0,
    borderRadius: 0,
  },
  text: {
    ...pixelFace,
    flex: 1,
    fontSize: '0.78rem',
    lineHeight: 1.4,
    color: PALETTE.ink,
  },
  actions: {
    display: 'flex',
    flexShrink: 0,
    gap: '0.4rem',
  },
  install: {
    ...primaryButton,
    fontSize: '0.45rem',
    padding: '0.5rem 0.6rem',
  },
  dismiss: {
    ...ghostButton,
    fontSize: '0.42rem',
    padding: '0.5rem 0.55rem',
  },
} satisfies Record<string, CSSProperties>;
