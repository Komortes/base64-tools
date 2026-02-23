import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    include: ['tests/ui/**/*.test.ts?(x)'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/App.tsx', 'src/pages/OverviewPage.tsx'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
