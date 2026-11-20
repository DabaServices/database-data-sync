import babel from '@rolldown/plugin-babel'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: { '@': path.resolve(__dirname, './src') },
  },
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  css: { devSourcemap: true },
  server: { port: 5173 },
  preview: { port: 5173 },
  build: { target: 'esnext' },
})

export default config
