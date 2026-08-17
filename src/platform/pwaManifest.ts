/**
 * Como o Chrome no Android lança o WebAPK. `display: fullscreen` +
 * `orientation: landscape` cria uma Activity que trava na splash (fundo
 * `#0b1020`) ou nem abre — o ícone parece morto. `standalone` esconde o
 * chrome do navegador e de fato inicia. Sem `orientation`: o SO decide, e o
 * Phaser já escala com FIT.
 */
export const PWA_LAUNCH = {
  start_url: '/',
  scope: '/',
  display: 'standalone',
} as const;
