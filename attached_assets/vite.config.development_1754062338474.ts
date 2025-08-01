import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Development config that starts backend and proxies to it
export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  server: {
    port: parseInt(process.env.PORT || "3000"),
    host: '0.0.0.0',
    strictPort: false,
    hmr: {
      clientPort: 443,
      protocol: 'wss',
    },
    allowedHosts: [
      'localhost',
      '.replit.dev',
      '.replit.app',
      'f9b76aa8-2bb6-4e1b-ac3c-4f1c9eca8a59-00-o3oyzp6dyb0x.janeway.replit.dev'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});