import { defineConfig } from 'vitest/config'

// Tests des règles Firestore, lancés par `npm run test:rules` dans l'émulateur.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/rules/**/*.test.ts'],
    testTimeout: 20000,
  },
})
