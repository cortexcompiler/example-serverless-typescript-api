/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
import type { JestConfigWithTsJest } from 'ts-jest';

// TODO: look at the commended options to decide what we need
const config: JestConfigWithTsJest = {
    // preset: 'ts-jest',
    // preset: 'ts-jest/presets/default-esm',
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ['**/*.{ts,js}'],
    coverageReporters: ['text', 'json', 'json-summary', 'html', 'lcov'],
    coveragePathIgnorePatterns: ['/node_modules/', 'coverage/', '.eslintrc.js', '.prettierrc.js', 'jest.config.ts'],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 85,
            statements: 85,
        },
    },
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    setupFiles: ['./jest.env.js'],
    testMatch: ['**/*.test.ts'],
    // testEnvironment: 'node',
    transform: {
        '^.+\\.ts?$': ['ts-jest', { useESM: true }],
    },
    extensionsToTreatAsEsm: ['.ts'],
    // resolver: 'ts-jest-resolver',
    verbose: true,
};

export default config;
