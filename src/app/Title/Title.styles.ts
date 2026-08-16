import type { CSSProperties } from 'react';

export const styles = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.2rem',
    height: '100%',
    padding: '1.5rem',
    textAlign: 'center',
    overflowY: 'auto',
  },
  title: {
    fontSize: 'clamp(2rem, 8vw, 4rem)',
    letterSpacing: '0.12em',
    color: '#6ee7ff',
  },
  subtitle: {
    fontSize: 'clamp(0.9rem, 3vw, 1.4rem)',
    color: '#a9b6e8',
  },
  divider: {
    width: 'min(320px, 70vw)',
    height: '1px',
    background: '#2b3a67',
  },
  credits: {
    fontSize: 'clamp(0.8rem, 2.4vw, 1rem)',
    color: '#8b98c9',
    lineHeight: 1.7,
  },
  label: {
    fontSize: '0.8rem',
    letterSpacing: '0.18em',
    color: '#6b78a9',
  },
  row: {
    display: 'flex',
    gap: '0.75rem',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.7rem 1.4rem',
    fontSize: '1rem',
    color: '#e8ecff',
    background: 'transparent',
    border: '2px solid #2b3a67',
    borderRadius: '0.75rem',
    cursor: 'pointer',
  },
  cardSelected: {
    border: '2px solid #6ee7ff',
    background: '#16224a',
  },
  /** Placeholder do uniforme: corpo branco com faixa marinho na gola. */
  avatar: {
    width: '2.5rem',
    height: '3.25rem',
    borderRadius: '0.3rem',
    background: '#f2f5ff',
    borderTop: '0.6rem solid #1b2a5e',
    borderBottom: '1rem solid #141f42',
  },
  playButton: {
    padding: '0.9rem 3rem',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#0b1020',
    background: '#6ee7ff',
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
  },
} satisfies Record<string, CSSProperties>;
