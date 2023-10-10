import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:1001/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // google auth proxy
      '/auth': {
        target: 'http://localhost:1001/',
        changeOrigin: true,
      },
    }
  },
  build: {
    watch: false,
  }
})
