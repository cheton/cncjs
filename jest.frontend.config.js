module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/app/**/__tests__/**/*.test.[jt]s?(x)'],
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', {
      configFile: false,
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
    }],
  },
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^app/(.*)$': '<rootDir>/src/app/$1',
    '\\.(styl|css)$': '<rootDir>/src/app/test/styleMock.js',
    '\\.(png|jpe?g|gif|svg|woff2?|ttf|eot)$': '<rootDir>/src/app/test/fileMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/app/test/setup.js'],
  clearMocks: true,
  testTimeout: 10000,
};
