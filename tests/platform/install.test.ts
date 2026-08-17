import { describe, expect, it } from 'vitest';
import {
  dismissInstall,
  INSTALL_DISMISS_KEY,
  installKind,
  isInstallDismissed,
  isIosDevice,
  readIosStandalone,
  type InstallFacts,
} from '@/platform/install';

const MOBILE: InstallFacts = {
  coarsePointer: true,
  standalone: false,
  dismissed: false,
  canPrompt: false,
  ios: false,
  waited: false,
};

describe('isIosDevice', () => {
  it('reconhece iPhone', () => {
    expect(isIosDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 5)).toBe(true);
  });

  it('reconhece iPad que se passa por Macintosh', () => {
    expect(isIosDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5)).toBe(true);
  });

  it('não trata desktop Windows como iOS', () => {
    expect(isIosDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 0)).toBe(false);
  });
});

describe('readIosStandalone', () => {
  it('só o Safari em atalho conta como instalado', () => {
    expect(readIosStandalone({ standalone: true })).toBe(true);
    expect(readIosStandalone({})).toBe(false);
  });
});

describe('installKind', () => {
  it('no computador não oferece instalar', () => {
    expect(installKind({ ...MOBILE, coarsePointer: false, canPrompt: true })).toBe('none');
  });

  it('já instalado não oferece de novo', () => {
    expect(installKind({ ...MOBILE, standalone: true, canPrompt: true })).toBe('none');
  });

  it('quem recusou não vê o banner de novo', () => {
    expect(installKind({ ...MOBILE, dismissed: true, canPrompt: true })).toBe('none');
  });

  it('Android com prompt nativo mostra o botão Instalar', () => {
    expect(installKind({ ...MOBILE, canPrompt: true })).toBe('prompt');
  });

  it('iPhone mostra o passo do Compartilhar', () => {
    expect(installKind({ ...MOBILE, ios: true })).toBe('ios');
  });

  it('no celular sem prompt ainda, espera um pouco', () => {
    expect(installKind(MOBILE)).toBe('none');
  });

  it('se o prompt não veio, ensina o menu do navegador', () => {
    expect(installKind({ ...MOBILE, waited: true })).toBe('manual');
  });
});

describe('dismissão do banner', () => {
  it('grava e lê o recado de agora não', () => {
    const memory: Record<string, string> = {};
    const storage = {
      getItem: (key: string) => memory[key] ?? null,
      setItem: (key: string, value: string) => {
        memory[key] = value;
      },
    };

    expect(isInstallDismissed(storage)).toBe(false);
    dismissInstall(storage);
    expect(memory[INSTALL_DISMISS_KEY]).toBe('1');
    expect(isInstallDismissed(storage)).toBe(true);
  });
});
