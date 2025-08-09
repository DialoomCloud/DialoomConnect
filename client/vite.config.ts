import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:5000',
      '/storage': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
    // Configure HMR for stability
    hmr: {
      overlay: process.env.VITE_HMR_OVERLAY !== 'false',
    },
    fs: {
      strict: false,
    },
  },

  // Build configuration
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, '../shared'),
      '@assets': resolve(__dirname, '../attached_assets'),
    },
  },

  // Optimized dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'wouter',
      'lucide-react',
      '@stripe/stripe-js',
    ],
  },

  // Environment variables prefix
  envPrefix: 'VITE_',

  // Global CSS variables
  css: {
    preprocessorOptions: {
      css: {
        charset: false,
      },
    },
  },
});