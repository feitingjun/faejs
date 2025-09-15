import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import core from '../core'

export default defineConfig({
  mode: 'development',
  base: '/',
  publicDir: 'public',
  plugins: [
    core(),
    react({
      jsxRuntime: 'automatic'
    })
  ],
  server: {
    host: true,
    port: 8000,
    open: false,
    strictPort: false // 端口被占用时，是否直接退出
  },
  logLevel: 'warn',
  envDir: resolve(process.cwd(), '.env'),
  envPrefix: 'FAE_',
  css: {
    modules: {
      scopeBehaviour: 'local',
      globalModulePaths: [/\.global\.(css|less|sass|scss)$/],
      generateScopedName: '[local]__[hash:base64:5]',
      localsConvention: 'camelCaseOnly'
    },
    postcss: 'postcss.config.ts'
  },
  build: {
    chunkSizeWarningLimit: 500
  }
})
