import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// The browser cannot call http://localhost:11434 directly from http://localhost:5173
// without Ollama being started with OLLAMA_ORIGINS set. Proxying through Vite avoids
// that entirely: the app always talks to same-origin /api/ollama.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/ollama': {
        target: process.env.OLLAMA_HOST ?? 'http://127.0.0.1:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ollama/, ''),
      },
    },
  },
})
