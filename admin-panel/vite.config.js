import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'assets',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './src/pages/index.html',
        login: './src/pages/login.html'
      }
    }
  },
  server: {
    port: 3001,
    host: true
  }
})