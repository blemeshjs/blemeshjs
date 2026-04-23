import { defineConfig } from "vitest/config";

const sharedExclude = ["node_modules", "dist", "**/dist/**"];

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "core/node",
          globals: true,
          environment: "node",
          include: ["packages/core/**/*.spec.ts"],
          exclude: ["**/*.browser.spec.ts", ...sharedExclude],
        },
      },
      {
        test: {
          name: "core/browser",
          globals: true,
          environment: "jsdom",
          include: ["packages/core/**/*.spec.ts"],
          exclude: ["**/*.node.spec.ts", ...sharedExclude],
        },
      },
      {
        test: {
          name: "crypto/node",
          globals: true,
          environment: "node",
          include: ["packages/crypto/**/*.spec.ts"],
          exclude: ["**/*.browser.spec.ts", ...sharedExclude],
        },
      },
      {
        test: {
          name: "crypto/browser",
          globals: true,
          environment: "jsdom",
          include: ["packages/crypto/**/*.spec.ts"],
          exclude: ["**/*.node.spec.ts", ...sharedExclude],
        },
      },
      {
        test: {
          name: "sdk-react-native/browser",
          globals: true,
          environment: "jsdom",
          include: ["packages/sdk-react-native/**/*.spec.ts"],
          exclude: sharedExclude,
        },
      },
      {
        test: {
          name: "utils/node",
          globals: true,
          environment: "node",
          include: ["packages/utils/**/*.spec.ts"],
          exclude: ["**/*.browser.spec.ts", ...sharedExclude],
        },
      },
      {
        test: {
          name: "utils/browser",
          globals: true,
          environment: "jsdom",
          include: ["packages/utils/**/*.spec.ts"],
          exclude: ["**/*.node.spec.ts", ...sharedExclude],
        },
      },
    ],
  },
});
