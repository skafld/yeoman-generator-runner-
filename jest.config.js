module.exports = {
  clearMocks: true,
  preset: 'ts-jest',
  collectCoverage: true,
  moduleFileExtensions: ['js', 'ts'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  coverageDirectory: "<rootDir>/coverage/",
  coverageReporters: ['text-summary', 'html'],
  transformIgnorePatterns: ['^.+\\.js$'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true
}