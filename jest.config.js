module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.(js|jsx|ts|tsx)',
    '**/?(*.)+(spec|test).(js|jsx|ts|tsx)',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@expo/vector-icons))',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'store/**/*.{js,jsx,ts,tsx}',
    '!app/**/+*.{js,jsx,ts,tsx}', // Exclude API routes
    '!**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/store/(.*)$': '<rootDir>/store/$1',
    '^@/constants/(.*)$': '<rootDir>/constants/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.expo/',
    '<rootDir>/.expo-shared/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
  ],
  watchPathIgnorePatterns: [
    '<rootDir>/.expo/',
    '<rootDir>/.expo-shared/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
  ],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Increase timeout for async operations
  testTimeout: 10000,
};
