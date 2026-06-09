import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only discover tests under src/ — never in dist/ (compiled output).
    include: ['src/tests/**/*.test.ts'],
    // Exclude compiled output and node_modules explicitly.
    exclude: ['dist/**', 'node_modules/**'],
  },
});
