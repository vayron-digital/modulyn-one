import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // NOTE: Do not use proxy for production. Use VITE_API_BASE_URL for all API calls.
  },
  build: {
    // Optimize build output
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    // Let Vite handle chunk splitting automatically to avoid React dependency issues
    rollupOptions: {
      output: {
        // No manual chunk splitting - let Vite handle it
      }
    }
  }
}) 