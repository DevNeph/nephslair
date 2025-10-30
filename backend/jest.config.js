module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};

