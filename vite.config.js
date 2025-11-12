import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,        // 👈 customize your local port
    strictPort: true,  // fails fast if port is busy
    open: true         // auto-launches browser
  }
})
