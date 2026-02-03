module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'Utils/**/*.js',
        'Modules/**/*.js',
        'Handlers/**/*.js',
        'Database/**/*.js',
        '!**/node_modules/**',
        '!**/*.test.js'
    ],
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    verbose: true,
    testTimeout: 10000
};
