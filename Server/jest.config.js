module.exports = {
  testEnvironment: "node",
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  setupFiles: ['<rootDir>/Tests/test-setup.js'],
  clearMocks: true,
};
