import { resolve } from 'path'

import vue from '@vitejs/plugin-vue'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

// https://vitejs.dev/config/
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      target: 'node16.17',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electronBody/main.ts')
        }
      },
      outDir: "dist-electron/main",
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      target: 'node16.17',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electronBody/preload.ts')
        }
      },
      outDir: "dist-electron/preload"
    }
  },
  renderer: {
    root: ".",
    build: {
      target: 'chrome108',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        }
      },
      outDir: "dist-electron/render"
    },
    plugins: [vue()]
  }
})
