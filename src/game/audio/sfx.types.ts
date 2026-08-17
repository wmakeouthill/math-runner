/** Uma nota: o que o oscilador faz do começo ao fim dela. */
export type Tone = {
  /** Frequência inicial, em Hz. Sempre > 0. */
  freq: number;
  /** Frequência final; sem ela a nota não desliza. Sempre > 0. */
  to?: number;
  /** Duração em segundos. */
  duration: number;
  type?: OscillatorType;
  /** Volume de pico, de 0 a 1. */
  gain?: number;
  /** Atraso em segundos desde o início do efeito. */
  delay?: number;
};

export type SfxName =
  | 'pulo'
  | 'moeda'
  | 'bandeira'
  | 'certo'
  | 'errado'
  | 'ponte'
  | 'blocos'
  | 'porta'
  | 'fase';
