// TODO: Configuration Vite pour application restaurant
// TODO: Plugin React
// TODO: Port 5176 pour restaurant (différent du client 5173)
// TODO: Proxy API vers backend
// TODO: Variables d'environnement
// TODO: Build optimizations (code splitting)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // TODO: Ajouter plugin React
  plugins: [react()],
  server: {
    // TODO: Port 5176 pour restaurant
    port: 5176,
    open: true,
    proxy: {
      // TODO: Proxy /api vers backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // TODO: Configuration build
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // TODO: Code splitting pour optimiser bundle
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'web3-vendor': ['ethers'],
          'charts-vendor': ['chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
  define: {
    // TODO: Variables d'environnement
    'process.env': {},
  },
  resolve: {
    // TODO: Alias pour imports
    alias: {
      '@': '/src',
    },
  },
})
