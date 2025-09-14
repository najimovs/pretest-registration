import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'assets',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        login: './pages/login.html',
        signup: './pages/signup.html',
        profile: './pages/profile.html',
        schedule: './pages/ofline-schedule.html'
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})