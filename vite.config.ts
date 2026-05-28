import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    include: [
      'lucide-react',
      'framer-motion',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
    ],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    pool: 'forks',
    maxWorkers: 3,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'src/main.tsx',
        'src/**/*.types.ts',
        'src/types/**',
        'src/styles/**',
        'src/test/**',
      ],
      thresholds: {
        branches: 70,
        functions: 75,
        lines: 75,
        statements: 75,
      },
    },
  },
})
