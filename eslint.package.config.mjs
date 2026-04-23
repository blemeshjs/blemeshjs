import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";

export default function createPackageEslintConfig(packageDir) {
  return defineConfig([
    {
      ignores: ["dist/**", "node_modules/**"],
    },
    {
      files: ["src/**/*.ts", "tests/**/*.ts"],
      extends: tseslint.configs.recommendedTypeChecked,
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: packageDir,
        },
      },
      rules: {
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-unused-vars": ["error", {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        }],
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/no-base-to-string": "off",
      },
    },
    eslintConfigPrettier,
  ]);
}


