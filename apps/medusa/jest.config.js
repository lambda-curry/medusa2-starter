const { loadEnv } = require('@medusajs/utils');
loadEnv('test', process.cwd());

module.exports = {
  transform: {
    '^.+\\.[jt]sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', decorators: true, tsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    ],
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  modulePathIgnorePatterns: ['<rootDir>/.medusa/','dist/'],
};

if (process.env.TEST_TYPE === 'integration:http') {
  module.exports.testMatch = ['**/integration-tests/http/*.spec.[jt]s'];
} else if (process.env.TEST_TYPE === 'integration:modules') {
  module.exports.testMatch = ['**/src/modules/*/__tests__/**/*.[jt]s'];
} else if (process.env.TEST_TYPE === 'unit') {
  module.exports.testMatch = ['**/src/**/__tests__/**/*.unit.spec.[jt]s'];
}
