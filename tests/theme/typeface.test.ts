import { describe, expect, it } from 'vitest';
import { FONT_ARCADE, FONT_PIXEL } from '@/theme/typeface';
import { applyCssVars } from '@/theme/cssVars';
import { PALETTE } from '@/theme/palette';

describe('tipografia de fliperama', () => {
  it('títulos usam Press Start 2P', () => {
    expect(FONT_ARCADE).toContain('Press Start 2P');
  });

  it('texto de menu usa Silkscreen, mais legível no corpo', () => {
    expect(FONT_PIXEL).toContain('Silkscreen');
  });
});

describe('applyCssVars', () => {
  it('grava a paleta em custom properties', () => {
    const memory = new Map<string, string>();
    const target = {
      setProperty: (name: string, value: string) => {
        memory.set(name, value);
      },
    };

    applyCssVars(target);

    expect(memory.get('--night')).toBe(PALETTE.night);
    expect(memory.get('--cyan')).toBe(PALETTE.cyan);
    expect(memory.get('--gold')).toBe(PALETTE.gold);
  });
});
