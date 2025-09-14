import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'assets',
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './src/pages/index.html',
        login: './src/pages/login.html'
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 3001,
    host: true
  }
})