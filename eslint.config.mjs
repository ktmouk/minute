import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type import("eslint").Linter.Config[] */
export default defineConfig([
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  importPlugin.flatConfigs.recommended,
  ...nextVitals.map(({ plugins = {}, ...config }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { import: _, ...rest } = plugins;
    return {
      ...config,
      plugins: rest,
      files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
    };
  }),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      next: {
        rootDir: "apps/web/",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "import/order": [
        "error",
        {
          "newlines-between": "never",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.name='z'][callee.property.name='object']",
          message: "Avoid using z.object, use z.strictObject instead.",
        },
      ],
    },
  },
  {
    files: ["**/eslint.config.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ["apps/web/env/*.mjs"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: [
      "**/dist",
      "**/coverage",
      "**/.next",
      "**/node_modules",
      "**/packages/prisma/generated/**",
      "**/next-env.d.ts",
    ],
  },
  eslintConfigPrettier,
]);
