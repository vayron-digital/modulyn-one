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
    rollupOptions: {
      output: {
        // Very conservative chunk splitting to avoid React dependency issues
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // Keep ALL React and React-dependent libraries together
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('react-router-dom') || 
                id.includes('framer-motion') ||
                id.includes('@radix-ui') ||
                id.includes('lucide-react') ||
                id.includes('react-chartjs') ||
                id.includes('react-hot-toast') ||
                id.includes('react-dropzone') ||
                id.includes('react-easy-crop') ||
                id.includes('react-hotkeys-hook') ||
                id.includes('react-icons') ||
                id.includes('react-virtualized') ||
                id.includes('react-window')) {
              return 'react-vendor';
            }
            // Charts (non-React)
            if (id.includes('chart.js')) {
              return 'charts-vendor';
            }
            // Database
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // Everything else goes to vendor
            return 'vendor';
          }
          // Feature chunks
          if (id.includes('/pages/dashboard/')) {
            return 'dashboard';
          }
          if (id.includes('/pages/leads/')) {
            return 'leads';
          }
          if (id.includes('/pages/properties/')) {
            return 'properties';
          }
          if (id.includes('/pages/tasks/')) {
            return 'tasks';
          }
          if (id.includes('/pages/admin/')) {
            return 'admin';
          }
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'date-fns',
      'framer-motion',
      'lucide-react',
    ],
    exclude: [], // No problematic deps to exclude
  },
  // Preload critical assets
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg', '**/*.gif'],
}) 