import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'user/assets',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        login: './user/pages/login.html',
        signup: './user/pages/signup.html',
        profile: './user/pages/profile.html',
        schedule: './user/pages/ofline-schedule.html',
        admin: './admin/index.html'
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})