import type { Config } from 'jest';
const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2022',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          module: 'commonjs',
          moduleResolution: 'node10',
          jsx: 'react-jsx',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          resolveJsonModule: true,
          verbatimModuleSyntax: false,
          allowImportingTsExtensions: false,
          types: ['jest'],
        },
      },
    ],
  },
  collectCoverageFrom: ['src/features/**/*.{ts,tsx}', '!src/features/**/*.test.*'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {},
    './src/features/': {
      statements: 70,
    },
  },
};

export default config;
