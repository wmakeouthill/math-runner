import { describe, expect, it } from 'vitest';
import { THEMES } from '@/game/art/themes';
import { TRACKS } from '@/game/audio/music/tracks';
import { trackSteps } from '@/game/audio/music/trackLength';

describe('trilhas chiptune', () => {
  it('cada cenário da fase tem uma trilha', () => {
    for (const name of Object.keys(THEMES)) {
      expect(TRACKS[name]).toBeDefined();
    }
  });

  it('o jingle de vitória não entra em loop', () => {
    expect(TRACKS.victory?.loop).toBe(false);
  });

  it('as fases repetem a música até o fim', () => {
    expect(TRACKS.quintal?.loop).not.toBe(false);
    expect(TRACKS.title?.loop).not.toBe(false);
  });
});

describe('trackSteps', () => {
  it('usa o canal mais longo, em semicolcheias', () => {
    const steps = trackSteps({
      lead: [{ n: 440, d: 4 }],
      bass: [{ n: 110, d: 2 }, { n: 110, d: 2 }],
      drums: ['.', '.', '.', '.', '.', '.', '.', '.'],
    });
    expect(steps).toBe(8);
  });
});
