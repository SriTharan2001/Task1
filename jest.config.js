module.exports = {
  projects: [
    '<rootDir>/Client',
    '<rootDir>/Server',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};
