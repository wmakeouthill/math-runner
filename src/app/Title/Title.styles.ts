import type { CSSProperties } from 'react';
import { PALETTE } from '@/theme/palette';

export const styles = {
  screen: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(1.2rem, 5vw, 3.5rem)',
    width: '100%',
    height: '100%',
    padding: 'clamp(1rem, 3vw, 2rem)',
    overflowY: 'auto',
    background: `radial-gradient(130% 100% at 15% 0%, ${PALETTE.navy} 0%, ${PALETTE.night} 62%)`,
  },

  // Coluna da esquerda — marca e cabeçalho do trabalho
  brand: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.35rem',
    textAlign: 'center',
  },
  title: {
    fontSize: 'clamp(2.2rem, 7vw, 4.2rem)',
    lineHeight: 1,
    letterSpacing: '0.06em',
    color: PALETTE.shirt,
    textShadow: `0 0 28px ${PALETTE.cyan}66`,
  },
  subtitle: {
    fontSize: 'clamp(0.95rem, 2.6vw, 1.35rem)',
    color: PALETTE.cyan,
    letterSpacing: '0.04em',
  },
  schoolBand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    marginTop: '1.1rem',
    padding: '0.6rem 1.1rem',
    background: `${PALETTE.deep}cc`,
    border: `1px solid ${PALETTE.steel}`,
    borderRadius: '0.9rem',
  },
  schoolCrest: {
    height: '4rem',
    width: 'auto',
    flexShrink: 0,
    // O PNG veio com fundo preto; no fundo marinho da faixa o preto some.
    mixBlendMode: 'lighten',
  },
  students: {
    fontSize: '1rem',
    fontWeight: 700,
    color: PALETTE.ink,
    letterSpacing: '0.03em',
  },
  school: {
    fontSize: '0.78rem',
    color: PALETTE.mute,
  },

  // Coluna da direita — escolhas
  choices: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '1rem',
    minWidth: 'min(320px, 92vw)',
  },
  label: {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.22em',
    color: PALETTE.faint,
  },
  row: {
    display: 'flex',
    gap: '0.7rem',
  },

  card: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.7rem 0.8rem',
    color: PALETTE.ink,
    background: `${PALETTE.deep}99`,
    border: `2px solid ${PALETTE.steel}`,
    borderRadius: '0.9rem',
    cursor: 'pointer',
    transition: 'border-color 120ms, background 120ms',
  },
  cardSelected: {
    border: `2px solid ${PALETTE.cyan}`,
    background: PALETTE.navy,
    boxShadow: `0 0 0 4px ${PALETTE.cyan}22`,
  },
  cardLabel: {
    fontSize: '1rem',
    fontWeight: 700,
  },
  cardHint: {
    fontSize: '0.74rem',
    lineHeight: 1.35,
    color: PALETTE.mute,
    textAlign: 'center',
  },

  playButton: {
    marginTop: '0.4rem',
    padding: '0.95rem 1rem',
    fontSize: '1.2rem',
    fontWeight: 800,
    letterSpacing: '0.1em',
    color: PALETTE.night,
    background: PALETTE.cyan,
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    boxShadow: `0 8px 24px ${PALETTE.cyan}44`,
  },
} satisfies Record<string, CSSProperties>;
