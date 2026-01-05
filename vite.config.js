import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    https: false, // ローカルではfalse、デプロイ先で自動的にHTTPSになる
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        qrAdmin: resolve(__dirname, 'qr-admin.html'),
        qrCode: resolve(__dirname, 'qr-code.html'),
      },
      output: {
        manualChunks: undefined,
      },
    },
  },
  assetsInclude: ['**/*.mind'],
});
