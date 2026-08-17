export type InstallKind = 'none' | 'prompt' | 'ios' | 'manual';

export type InstallFacts = {
  coarsePointer: boolean;
  standalone: boolean;
  dismissed: boolean;
  canPrompt: boolean;
  ios: boolean;
  waited: boolean;
};

export const INSTALL_DISMISS_KEY = 'math-runner-install-dismissed';

/** iPhone/iPod, iPad clássico, e iPadOS que se apresenta como Mac. */
export function isIosDevice(userAgent: string, maxTouchPoints: number): boolean {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return true;
  return /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
}

export function isStandalone(displayMode: boolean, iosStandalone: boolean): boolean {
  return displayMode || iosStandalone;
}

/** Safari iOS marca o atalho da tela inicial com `navigator.standalone`. */
export function readIosStandalone(browser: object): boolean {
  return 'standalone' in browser && (browser as { standalone?: unknown }).standalone === true;
}

/**
 * Quem vê o banner, e qual texto. Computador nunca entra: o Chrome de desktop
 * continua com o ícone nativo da barra de endereço.
 */
export function installKind(facts: InstallFacts): InstallKind {
  if (!facts.coarsePointer || facts.standalone || facts.dismissed) return 'none';
  if (facts.canPrompt) return 'prompt';
  if (facts.ios) return 'ios';
  if (facts.waited) return 'manual';
  return 'none';
}

export function isInstallDismissed(storage: Pick<Storage, 'getItem'>): boolean {
  return storage.getItem(INSTALL_DISMISS_KEY) === '1';
}

/** O PWA desinstalado deixa o localStorage do site intacto — essa chave tem que sair. */
export function clearInstallDismiss(storage: Pick<Storage, 'removeItem'>): void {
  storage.removeItem(INSTALL_DISMISS_KEY);
}
