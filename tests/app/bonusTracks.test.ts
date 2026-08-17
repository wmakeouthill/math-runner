import { describe, expect, it } from 'vitest';
import { BONUS_TRACKS } from '@/app/Bonus/bonusTracks';

describe('BONUS_TRACKS', () => {
  it('tem as sete gravações do Mundo 1', () => {
    expect(BONUS_TRACKS).toHaveLength(7);
    expect(BONUS_TRACKS.map((track) => track.id)).toEqual([
      'tema',
      'quintal',
      'feira',
      'festa',
      'sertao',
      'mata',
      'vitoria',
    ]);
  });

  it('aponta para arquivos em /bonus, não para a raiz do repo', () => {
    for (const track of BONUS_TRACKS) {
      expect(track.src.startsWith('/bonus/')).toBe(true);
      expect(track.src.endsWith('.mp3')).toBe(true);
    }
  });
});
