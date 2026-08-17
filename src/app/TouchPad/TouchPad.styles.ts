import type { CSSProperties } from 'react';
import { PALETTE } from '@/theme/palette';

const face: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 0,
  padding: 0,
  fontWeight: 800,
  lineHeight: 1,
  color: PALETTE.ink,
  background: `${PALETTE.night}cc`,
  border: `2px solid ${PALETTE.cyan}`,
  borderRadius: '999px',
  boxShadow: `0 6px 16px ${PALETTE.night}aa`,
  cursor: 'pointer',
  pointerEvents: 'auto',
  touchAction: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

export const styles = {
  // A tela inteira é o palco; só os botões capturam o dedo.
  root: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 2,
  },
  left: {
    position: 'absolute',
    left: 'clamp(0.5rem, 2vw, 1.1rem)',
    bottom: 'max(0.8rem, env(safe-area-inset-bottom))',
    display: 'flex',
    gap: '0.55rem',
  },
  right: {
    position: 'absolute',
    right: 'clamp(0.5rem, 2vw, 1.1rem)',
    bottom: 'max(0.8rem, env(safe-area-inset-bottom))',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.55rem',
  },
  walk: {
    ...face,
    width: 'clamp(3.2rem, 11vw, 4.4rem)',
    height: 'clamp(3.2rem, 11vw, 4.4rem)',
    fontSize: 'clamp(1.4rem, 4.5vw, 1.9rem)',
  },
  interact: {
    ...face,
    width: 'clamp(2.8rem, 9vw, 3.6rem)',
    height: 'clamp(2.8rem, 9vw, 3.6rem)',
    marginBottom: '1.35rem',
    fontSize: 'clamp(1rem, 3.2vw, 1.25rem)',
    borderColor: PALETTE.gold,
    color: PALETTE.gold,
  },
  jump: {
    ...face,
    width: 'clamp(3.8rem, 13vw, 5.2rem)',
    height: 'clamp(3.8rem, 13vw, 5.2rem)',
    fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
  },
  held: {
    background: PALETTE.navy,
    borderColor: PALETTE.gold,
    transform: 'scale(0.96)',
  },
} satisfies Record<string, CSSProperties>;

export function padFace(base: CSSProperties, held: boolean): CSSProperties {
  return held ? { ...base, ...styles.held } : base;
}
