import { defineConfig } from 'vite';

// Relative base so the build works on GitHub Pages (user.github.io/repo/)
// and on any static host without extra configuration.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
  },
});
