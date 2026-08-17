import { describe, expect, it } from 'vitest';
import {
  clearInstallDismiss,
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

  it('nesta visita, Agora não esconde o banner', () => {
    expect(installKind({ ...MOBILE, dismissed: true, canPrompt: true })).toBe('none');
  });

  it('sem recado e sem app instalado, o banner volta', () => {
    expect(installKind({ ...MOBILE, canPrompt: true, dismissed: false })).toBe('prompt');
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
  it('apaga o recado antigo — desinstalar o PWA não limpa o localStorage do site', () => {
    const memory: Record<string, string> = { [INSTALL_DISMISS_KEY]: '1' };
    const storage = {
      getItem: (key: string) => memory[key] ?? null,
      removeItem: (key: string) => {
        delete memory[key];
      },
    };

    expect(isInstallDismissed(storage)).toBe(true);
    clearInstallDismiss(storage);
    expect(isInstallDismissed(storage)).toBe(false);
  });
});
