import { describe, expect, it } from 'vitest';
import { notesFor, SFX_NAMES } from '@/game/audio/sfx';
import { playSfx } from '@/game/audio/audio';

describe('catálogo de efeitos', () => {
  it('todo efeito tem pelo menos uma nota', () => {
    for (const name of SFX_NAMES) {
      expect(notesFor(name).length).toBeGreaterThan(0);
    }
  });

  /**
   * O WebAudio usa rampa exponencial, e rampa exponencial para 0 (ou de 0)
   * não faz som nenhum — a frequência precisa ser estritamente positiva.
   */
  it('nenhuma nota tem frequência ou duração zerada', () => {
    for (const name of SFX_NAMES) {
      for (const tone of notesFor(name)) {
        expect(tone.freq).toBeGreaterThan(0);
        expect(tone.to ?? 1).toBeGreaterThan(0);
        expect(tone.duration).toBeGreaterThan(0);
        expect(tone.gain ?? 0.15).toBeLessThanOrEqual(0.3);
      }
    }
  });
});

describe('playSfx', () => {
  it('não explode onde não existe AudioContext — é o caso do teste e do SSR', () => {
    expect(() => playSfx('pulo')).not.toThrow();
  });
});
