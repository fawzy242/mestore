import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: false,
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  build: {
    sourcemap: true,
    target: 'es2020',
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/unit/**/*.spec.js', 'tests/component/**/*.spec.js'],
  },
})