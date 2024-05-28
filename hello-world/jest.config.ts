/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
    // preset: "ts-jest",
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{ts,js}'],
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    setupFiles: ['./jest.env.js'],
    testMatch: ['**/*.test.ts'],
};
