import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ["lucide-react"]
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    }
  },
  resolve: {
    alias: {
      "lucide-react": "lucide-react/dist/cjs/lucide-react.js"
    }
  }
})
