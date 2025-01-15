import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig, normalizePath } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isBuild = command === 'build'

  // wasm-imagemagick 依赖的 wasm 文件需要手动 copy 到产物目录下
  const imagemagickBundles = path.resolve(__dirname, 'node_modules/wasm-imagemagick/dist/bundles')
  const imagemagickApiPath = normalizePath(path.resolve(imagemagickBundles, 'magickApi.js'))
  const imagemagickWasmPath = normalizePath(path.resolve(imagemagickBundles, 'magick.wasm'))
  const imagemagickPath = normalizePath(path.resolve(imagemagickBundles, 'magick.js'))
  const devDepsPath = normalizePath(path.resolve(__dirname, 'node_modules/.vite/deps'))
  const prodDistPath = normalizePath(path.resolve(__dirname, 'dist/assets'))

  return {
    plugins: [
      vue(),
      viteStaticCopy({
        targets: [
          {
            src: imagemagickPath,
            dest: isBuild ? prodDistPath : devDepsPath,
          },
          {
            src: imagemagickWasmPath,
            dest: isBuild ? prodDistPath : devDepsPath,
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // wasm-imagemagick 有个 bug, 它在 package,json 中定义的 module 字段是错误的, 没有指向正确的文件
        // 所以这里手动指定一下
        'wasm-imagemagick': imagemagickApiPath,
      },
    },
  }
})
