import { describe, expect, it } from 'vitest';
import { PWA_LAUNCH } from '@/platform/pwaManifest';

describe('PWA_LAUNCH', () => {
  it('abre como janela standalone — fullscreen+landscape no Android trava o ícone na splash', () => {
    expect(PWA_LAUNCH.display).toBe('standalone');
    expect(PWA_LAUNCH).not.toHaveProperty('orientation');
  });
});
