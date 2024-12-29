import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  const ENV = { ...process.env, ...loadEnv(mode, process.cwd()) }
  const isDev = ENV.NODE_ENV === 'development'

  return defineConfig({
    base: isDev ? '/' : '/carpet-image/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  })
}
