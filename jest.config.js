module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^lucide-react-native$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    // Thin route re-exports, static data and type declarations carry no logic to cover.
    '!src/app/**',
    '!src/types/**',
    '!src/constants/savedPlaces.ts',
    '!src/constants/mapStyle.ts',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: { lines: 90, statements: 90, functions: 90, branches: 80 },
  },
};
