import { describe, expect, it } from 'vitest';
import { PALETTE, toPhaserColor } from '@/theme/palette';

describe('toPhaserColor', () => {
  it('converte hex de 6 dígitos em número, com ou sem #', () => {
    expect(toPhaserColor('#6ee7ff')).toBe(0x6ee7ff);
    expect(toPhaserColor('6ee7ff')).toBe(0x6ee7ff);
  });

  it('aceita maiúsculas', () => {
    expect(toPhaserColor('#F2F5FF')).toBe(0xf2f5ff);
  });

  it('recusa cor malformada em vez de devolver NaN', () => {
    expect(() => toPhaserColor('#xyzxyz')).toThrow();
    expect(() => toPhaserColor('#fff')).toThrow();
    expect(() => toPhaserColor('')).toThrow();
  });

  it('toda cor da paleta é convertível', () => {
    for (const hex of Object.values(PALETTE)) {
      expect(() => toPhaserColor(hex)).not.toThrow();
    }
  });

  it('a paleta usa sempre o formato de 6 dígitos com #', () => {
    for (const hex of Object.values(PALETTE)) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
