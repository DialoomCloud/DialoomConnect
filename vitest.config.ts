import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
  test: {
    environmentMatchGlobs: [
      ['client/**', 'jsdom'],
      ['server/**', 'node'],
      ['shared/**', 'node']
    ],
    globals: true,
  },
});
