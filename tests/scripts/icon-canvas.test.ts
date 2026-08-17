import { describe, expect, it } from 'vitest';
import { contentBox, knockoutNearBlack, NIGHT, paintContain } from '../../scripts/icon-canvas.mjs';

describe('contentBox', () => {
  it('deixa 12% de margem em cada lado no icone normal', () => {
    expect(contentBox(192, 0.12)).toEqual({ x: 23, y: 23, size: 146 });
  });

  it('deixa 20% de margem no maskable, a zona que o Android recorta', () => {
    expect(contentBox(512, 0.2)).toEqual({ x: 102, y: 102, size: 308 });
  });
});

describe('knockoutNearBlack', () => {
  it('some com o fundo preto do brasao e mantem o ouro', () => {
    const rgba = Uint8Array.from([0, 0, 0, 255, 255, 209, 102, 255]);
    const out = knockoutNearBlack(rgba);
    expect([...out.subarray(0, 4)]).toEqual([0, 0, 0, 0]);
    expect([...out.subarray(4, 8)]).toEqual([255, 209, 102, 255]);
  });
});

describe('paintContain', () => {
  it('pinta a noite nos cantos e o brasao no centro', () => {
    const src = Uint8Array.from([255, 0, 0, 255]);
    const canvas = paintContain(16, src, 1, 1, 0.25);
    expect([...canvas.subarray(0, 4)]).toEqual([...NIGHT]);
    const mid = (8 * 16 + 8) * 4;
    expect(canvas[mid]).toBe(255);
    expect(canvas[mid + 1]).toBe(0);
    expect(canvas[mid + 2]).toBe(0);
    expect(canvas[mid + 3]).toBe(255);
  });
});
