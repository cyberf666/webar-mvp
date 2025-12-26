import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    https: false, // ローカルではfalse、デプロイ先で自動的にHTTPSになる
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  assetsInclude: ['**/*.mind'],
});
