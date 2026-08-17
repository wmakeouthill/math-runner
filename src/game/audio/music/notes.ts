/** Frequências das notas musicais temperadas (em Hz) para o sintetizador chiptune. */
export const N = {
  _: 0, // Pausa / Silêncio

  // Oitava 2 (Sub-baixo)
  E2: 82.41,
  F2: 87.31,
  Fs2: 92.5,
  G2: 98.0,
  Gs2: 103.83,
  A2: 110.0,
  As2: 116.54,
  Bb2: 116.54,
  B2: 123.47,

  // Oitava 3 (Baixo / Harmonia grave)
  C3: 130.81,
  Cs3: 138.59,
  D3: 146.83,
  Ds3: 155.56,
  E3: 164.81,
  F3: 174.61,
  Fs3: 185.0,
  G3: 196.0,
  Gs3: 207.65,
  A3: 220.0,
  As3: 233.08,
  Bb3: 233.08,
  B3: 246.94,

  // Oitava 4 (Média / Lead)
  C4: 261.63,
  Cs4: 277.18,
  D4: 293.66,
  Ds4: 311.13,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.0,
  Gs4: 415.3,
  A4: 440.0,
  As4: 466.16,
  Bb4: 466.16,
  B4: 493.88,

  // Oitava 5 (Aguda / Arpejos)
  C5: 523.25,
  Cs5: 554.37,
  D5: 587.33,
  Ds5: 622.25,
  E5: 659.25,
  F5: 698.46,
  Fs5: 739.99,
  G5: 783.99,
  Gs5: 830.61,
  A5: 880.0,
  As5: 932.33,
  Bb5: 932.33,
  B5: 987.77,

  // Oitava 6 (Campainha / Brilho)
  C6: 1046.5,
  Cs6: 1108.73,
  D6: 1174.66,
  E6: 1318.51,
  G6: 1567.98,
} as const;

export type NoteFreq = (typeof N)[keyof typeof N];
