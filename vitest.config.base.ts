import { defineConfig } from "vitest/config";

const sharedExclude = ["node_modules", "dist", "**/dist/**", "**/node_modules/**"];

export const nodeBrowserConfig = defineConfig({
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: "node",
          include: ["**/*.spec.ts"],
          exclude: [...sharedExclude, "**/*.browser.spec.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "browser",
          include: ["**/*.spec.ts"],
          exclude: [...sharedExclude, "**/*.node.spec.ts"],
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
          exclude: sharedExclude,
          environment: "jsdom",
        },
      },
    ],
    exclude: sharedExclude,
  },
});
