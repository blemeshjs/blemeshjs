import { defineConfig } from "vitest/config";

const sharedExclude = ["node_modules", "dist", "**/dist/**"];

export const nodeBrowserConfig = defineConfig({
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: "node",
          include: ["**/*.spec.ts"],
          exclude: ["**/*.browser.spec.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "browser",
          include: ["**/*.spec.ts"],
          exclude: ["**/*.node.spec.ts"],
          environment: "jsdom",
        },
      },
    ],
    exclude: sharedExclude,
  },
});

export const browserConfig = defineConfig({
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: "browser",
          include: ["**/*.spec.ts"],
          environment: "jsdom",
        },
      },
    ],
    exclude: sharedExclude,
  },
});
