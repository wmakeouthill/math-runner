import type { SfxName, Tone } from './sfx.types';

/**
 * Os efeitos do jogo, escritos como notas. Nada de arquivo de áudio: som de
 * plataforma dos anos 90 é onda quadrada com envelope curto, e sintetizar sai
 * mais barato que licenciar, baixar e pôr no precache do PWA.
 */
const NOTES: Record<SfxName, readonly Tone[]> = {
  pulo: [{ freq: 420, to: 720, duration: 0.11, type: 'square', gain: 0.12 }],

  moeda: [
    { freq: 988, duration: 0.06, type: 'square', gain: 0.13 },
    { freq: 1319, duration: 0.12, type: 'square', gain: 0.13, delay: 0.06 },
  ],

  bandeira: [{ freq: 660, to: 990, duration: 0.16, type: 'triangle', gain: 0.13 }],

  certo: [
    { freq: 523, duration: 0.09, type: 'triangle', gain: 0.16 },
    { freq: 659, duration: 0.09, type: 'triangle', gain: 0.16, delay: 0.09 },
    { freq: 784, duration: 0.2, type: 'triangle', gain: 0.16, delay: 0.18 },
  ],

  // Grave e curto. Errar não pode soar como punição — o aluno vai errar muito.
  errado: [{ freq: 220, to: 130, duration: 0.24, type: 'sawtooth', gain: 0.1 }],

  ponte: [{ freq: 150, to: 70, duration: 0.5, type: 'sawtooth', gain: 0.09 }],

  blocos: [
    { freq: 300, duration: 0.08, type: 'square', gain: 0.1 },
    { freq: 400, duration: 0.08, type: 'square', gain: 0.1, delay: 0.09 },
    { freq: 520, duration: 0.1, type: 'square', gain: 0.1, delay: 0.18 },
  ],

  porta: [{ freq: 300, to: 520, duration: 0.42, type: 'sine', gain: 0.12 }],

  fase: [
    { freq: 523, duration: 0.12, type: 'triangle', gain: 0.17 },
    { freq: 659, duration: 0.12, type: 'triangle', gain: 0.17, delay: 0.12 },
    { freq: 784, duration: 0.12, type: 'triangle', gain: 0.17, delay: 0.24 },
    { freq: 1047, duration: 0.34, type: 'triangle', gain: 0.17, delay: 0.36 },
  ],
};

export const SFX_NAMES = Object.keys(NOTES) as readonly SfxName[];

export const notesFor = (name: SfxName): readonly Tone[] => NOTES[name];
