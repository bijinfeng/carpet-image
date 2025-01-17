import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      svgLoader(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
