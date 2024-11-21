export default {
  displayName: 'url-shortener',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        useESM: true,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/url-shortener',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@database/(.*)$': '<rootDir>/../../libs/prisma-$1/src',
    '^@url-shortener/(.*)$': '<rootDir>/../../libs/$1/src',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@prisma|@database|@url-shortener)/)',
  ],
};
