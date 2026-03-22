import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // Pre-bundle icon/animation libraries so dev HMR doesn't re-resolve 1500+ modules
  // See: bundle-barrel-imports rule — lucide-react has ~1,583 re-exports
  optimizeDeps: {
    include: [
      'lucide-react',
      'framer-motion',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
    ],
  },
})
