import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: __dirname, // asegura que el root es /client
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@assets': path.resolve(__dirname, '../attached_assets'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    hmr: { overlay: false },          // quita el overlay que congela la app
    watch: { usePolling: true, interval: 300 }, // Replit a veces necesita polling
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
})