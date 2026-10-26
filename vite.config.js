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
    format: 'es' 
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
})