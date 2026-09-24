import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'esnext'
  },
  worker: {
    format: 'es' // Behebt den "Top-level await with iife format" Fehler
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
})