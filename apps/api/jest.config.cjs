/** @type {import('jest').Config} */
const esmTsJest = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};

module.exports = {
  projects: [
    {
      displayName: "unit",
      ...esmTsJest,
      testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/test/unit/**/*.spec.ts"],
      testPathIgnorePatterns: ["integration", "e2e"],
    },
    {
      displayName: "integration",
      ...esmTsJest,
      testMatch: ["<rootDir>/test/integration/**/*.integration.spec.ts"],
      globalSetup: "<rootDir>/test/setup/db-setup.ts",
      globalTeardown: "<rootDir>/test/setup/db-teardown.ts",
    },
    {
      displayName: "e2e",
      ...esmTsJest,
      testMatch: ["<rootDir>/test/e2e/**/*.e2e.spec.ts"],
    },
  ],
  collectCoverageFrom: ["src/services/**/*.ts"],
  coverageThreshold: {
    "src/services/invoices.service.ts": { lines: 80 },
    "src/services/tax.service.ts": { lines: 90 },
    "src/services/datev.service.ts": { lines: 80 },
  },
};
