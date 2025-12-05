import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['jalaali-js']
  },
  base: '/habit-tracker/', // برای GitHub Pages - اگر repository name شما متفاوت است، تغییر دهید
})

