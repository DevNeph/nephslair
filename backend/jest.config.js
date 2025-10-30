// jest.config.js
'use strict';

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',

  // Test files
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],

  // Increase timeout to avoid flakiness with DB operations in CI
  testTimeout: 30000,

  // Test hygiene before/after each test
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Global setup: we use jest.setup.js to close the Sequelize connection
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Coverage targets (only the folders you specified)
  collectCoverage: true,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',

  // CI-friendly + Codecov-compatible coverage reports
  coverageReporters: ['text-summary', 'lcov', 'json'],

  // More verbose output
  verbose: true,

  // Optional: exclude specific files from coverage if needed
  // coveragePathIgnorePatterns: [
  //   '<rootDir>/app.js',
  //   '<rootDir>/server.js',
  //   '<rootDir>/config/',
  //   '<rootDir>/models/index.js'
  // ],

  // Diagnostics: add these flags in CLI temporarily if you hit flakiness
  // detectOpenHandles: true,
  // forceExit: true,
};
