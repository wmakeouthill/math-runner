import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import { PWA_LAUNCH } from './src/platform/pwaManifest.js';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,json,mp3,ogg,woff2}'],
        // Gravações de estúdio são bônus sob demanda — não vão no precache.
        globIgnores: ['**/bonus/**'],
        // O bundle do Phaser passa do limite padrão de 2 MB do Workbox.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      manifest: {
        name: 'Math Runner: O Resgate dos Números',
        short_name: 'Math Runner',
        description:
          'Jogo de plataforma 2D onde você resolve contas para destravar o caminho.',
        lang: 'pt-BR',
        ...PWA_LAUNCH,
        background_color: '#0b1020',
        theme_color: '#0b1020',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
