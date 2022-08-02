import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  testEnvironment: "node",
  roots: ["<rootDir>/test", "<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "@mapbox/esbuild-jest",
  },
  coveragePathIgnorePatterns: ["/node_modules/", "__tests__"],
  globalSetup: "<rootDir>/test/testSetup.ts",
  globalTeardown: "<rootDir>/test/testTeardown.ts",
};

export default config;
