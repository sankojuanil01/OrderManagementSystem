import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
  },
});

// it is the configuration file that tells vitest how to execute your tests, where to find test files, how to handle typescript and how to generate test reports 

// vitest is a testing framework used to test application 

// testing is used to verify that the application works as expected, business logic is correct, and changes to one part of the application do not break existing functionality 