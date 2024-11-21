export default {
  displayName: 'iam',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        useESM: true,
      },
    ],
    '^.+\\.js$': ['babel-jest', { presets: ['@babel/preset-env'] }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/iam',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@database/(.*)$': '<rootDir>/../../libs/prisma-client-$1/src',
    '^@url-shortener/(.*)$': '<rootDir>/../../libs/$1/src',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@prisma|@database|@url-shortener)/)',
  ],
};
