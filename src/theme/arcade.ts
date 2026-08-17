import type { CSSProperties } from 'react';
import { PALETTE } from './palette';
import { FONT_ARCADE, FONT_PIXEL } from './typeface';

export const arcadeFace: CSSProperties = {
  fontFamily: FONT_ARCADE,
  fontWeight: 400,
  lineHeight: 1.5,
};

export const pixelFace: CSSProperties = {
  fontFamily: FONT_PIXEL,
  fontWeight: 400,
  lineHeight: 1.5,
};

export function hardShadow(color: string, size = 4): string {
  return `${size}px ${size}px 0 ${color}`;
}

/** Fundo de CRT: vinheta + scanlines. Usado nas telas de menu. */
export const arcadeScreen: CSSProperties = {
  ...pixelFace,
  backgroundColor: PALETTE.night,
  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 3px, ${PALETTE.night}66 3px 4px), radial-gradient(120% 90% at 50% -8%, ${PALETTE.navy} 0%, ${PALETTE.night} 64%)`,
};

export const arcadePanel: CSSProperties = {
  background: PALETTE.deep,
  border: `3px solid ${PALETTE.steel}`,
  borderRadius: 0,
  boxShadow: hardShadow(PALETTE.night, 6),
};

export const primaryButton: CSSProperties = {
  ...arcadeFace,
  fontSize: '0.72rem',
  padding: '0.9rem 1rem',
  color: PALETTE.night,
  background: PALETTE.cyan,
  border: `3px solid ${PALETTE.shirt}`,
  borderRadius: 0,
  boxShadow: hardShadow(PALETTE.navy, 5),
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

export const ghostButton: CSSProperties = {
  ...arcadeFace,
  fontSize: '0.58rem',
  padding: '0.7rem 0.95rem',
  color: PALETTE.cyan,
  background: PALETTE.deep,
  border: `3px solid ${PALETTE.cyan}`,
  borderRadius: 0,
  boxShadow: hardShadow(PALETTE.night, 4),
  cursor: 'pointer',
  textTransform: 'uppercase',
};
