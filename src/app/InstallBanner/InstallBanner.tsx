import { styles } from './InstallBanner.styles';
import { useInstallBanner } from './InstallBanner.hooks';
import type { InstallBannerProps } from './InstallBanner.types';

const COPY = {
  prompt: 'Instale o Math Runner e jogue em tela cheia, como um aplicativo.',
  ios: 'Para instalar: toque em Compartilhar e depois em Adicionar à Tela de Início.',
  manual: 'No menu do navegador, toque em Instalar aplicativo.',
} as const;

export function InstallBanner({ allowed }: InstallBannerProps) {
  const { kind, install, dismiss } = useInstallBanner(allowed);

  if (kind === 'none') return null;

  return (
    <aside style={styles.bar} role="status" aria-live="polite">
      <img src="/icons/icon-192.png" alt="" style={styles.icon} />
      <p style={styles.text}>{COPY[kind]}</p>
      <div style={styles.actions}>
        {kind === 'prompt' ? (
          <button type="button" className="arcade-press" style={styles.install} onClick={() => void install()}>
            Instalar
          </button>
        ) : null}
        <button type="button" className="arcade-press" style={styles.dismiss} onClick={dismiss}>
          {kind === 'prompt' ? 'Agora não' : 'Ok'}
        </button>
      </div>
    </aside>
  );
}
