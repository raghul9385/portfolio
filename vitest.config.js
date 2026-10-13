import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    // The website runs in a fake browser; the contact API runs in plain Node.
    projects: [
      {
        extends: true,
        test: {
          name: 'web',
          environment: 'jsdom',
          include: ['src/**/__tests__/**/*.test.{js,jsx}'],
          setupFiles: ['./vitest.setup.js'],
        },
      },
      {
        test: {
          name: 'api',
          environment: 'node',
          include: ['server/**/__tests__/**/*.test.js'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}', 'server/**/*.js'],
      exclude: ['**/__tests__/**', 'src/main.jsx', 'server/index.js'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
