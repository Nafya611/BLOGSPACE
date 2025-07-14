import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: false
  },
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Ensure assets are correctly handled
    assetsDir: 'assets',
    // Force explicit file extensions to avoid MIME type issues
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Ensure proper module format
        generatedCode: {
          constBindings: true
        }
      }
    },
    // Target modern browsers that support ES modules
    target: 'es2015',
    // Ensure proper module resolution
    modulePreload: {
      polyfill: true
    }
  },
  // Ensure proper base path for assets
  base: '/',
  // Ensure proper module resolution
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
})
