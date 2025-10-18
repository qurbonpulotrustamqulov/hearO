import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    cors: true,
    allowedHosts: ['aa55756d5993.ngrok-free.app'],
    host: true,
  },
  preview: {
    host: true,
  },
})
