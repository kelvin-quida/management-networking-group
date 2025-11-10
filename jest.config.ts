import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'app/api/**/*.ts',
    '!app/api/**/*.test.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],

  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
    './app/api/intentions/route.ts': {
      branches: 95,
      functions: 100,
      lines: 95,
      statements: 95,
    },
    './app/api/intentions/approve/route.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './app/api/members/route.ts': {
      branches: 90,
      functions: 100,
      lines: 90,
      statements: 90,
    },
    './app/api/meetings/route.ts': {
      branches: 85,
      functions: 100,
      lines: 95,
      statements: 95,
    },
    './app/api/meetings/[id]/check-in/route.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './app/api/dashboard/group/route.ts': {
      branches: 90,
      functions: 100,
      lines: 90,
      statements: 90,
    },
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
};

export default config;
