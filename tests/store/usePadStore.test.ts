import { beforeEach, describe, expect, it } from 'vitest';
import { usePadStore } from '@/store/usePadStore';

const get = () => usePadStore.getState();

describe('usePadStore', () => {
  beforeEach(() => {
    get().releaseAll();
  });

  it('começa com todos os botões soltos', () => {
    expect(get().left).toBe(false);
    expect(get().right).toBe(false);
    expect(get().jump).toBe(false);
    expect(get().interact).toBe(false);
  });

  it('segura e solta a seta', () => {
    get().hold('left');
    expect(get().left).toBe(true);
    get().release('left');
    expect(get().left).toBe(false);
  });

  it('dois botões ao mesmo tempo — andar e pular juntos', () => {
    get().hold('right');
    get().hold('jump');
    expect(get().right).toBe(true);
    expect(get().jump).toBe(true);
    get().release('right');
    expect(get().right).toBe(false);
    expect(get().jump).toBe(true);
  });

  it('releaseAll solta tudo de uma vez', () => {
    get().hold('left');
    get().hold('interact');
    get().releaseAll();
    expect(get().left).toBe(false);
    expect(get().interact).toBe(false);
  });
});
