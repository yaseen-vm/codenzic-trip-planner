const preset = require('jest-expo/jest-preset');

module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/tests/components/setupEnv.js'],
  testMatch: ['<rootDir>/tests/components/**/*.test.tsx'],
  // The shared utils are .mjs so the plain Node test runner can import them too.
  transform: { '\\.mjs$': preset.transform['\\.[jt]sx?$'] },
  moduleNameMapper: {
    '^lucide-react-native$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
};
