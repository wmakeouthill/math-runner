export const BONUS_TRACKS = [
  {
    id: 'tema',
    title: 'Tema dos Heróis',
    subtitle: 'Menu e seleção',
    src: '/bonus/01-tema-principal.mp3',
  },
  {
    id: 'quintal',
    title: 'Quintal da Escola',
    subtitle: 'Fase 1-1',
    src: '/bonus/02-quintal.mp3',
  },
  {
    id: 'feira',
    title: 'Feira do Bairro',
    subtitle: 'Fase 1-2 · Saci-Pererê',
    src: '/bonus/03-feira.mp3',
  },
  {
    id: 'festa',
    title: 'Festa Junina no Pátio',
    subtitle: 'Fase 1-3 · Boitatá e Boto',
    src: '/bonus/04-festa.mp3',
  },
  {
    id: 'sertao',
    title: 'Travessia do Sertão',
    subtitle: 'Fase 1-4 · Ventania',
    src: '/bonus/05-sertao.mp3',
  },
  {
    id: 'mata',
    title: 'Mata do Curupira',
    subtitle: 'Fase 1-5 · Chefe',
    src: '/bonus/06-mata.mp3',
  },
  {
    id: 'vitoria',
    title: 'Vitória',
    subtitle: 'Fim de fase',
    src: '/bonus/07-vitoria.mp3',
  },
] as const;

export type BonusTrack = (typeof BONUS_TRACKS)[number];
