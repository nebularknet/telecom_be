import globals from "globals";
import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import promisePlugin from "eslint-plugin-promise";
import prettier from "eslint-config-prettier";

export default [
  eslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2022,
      sourceType: "module",
    },
    plugins: {
      import: importPlugin,
      promise: promisePlugin,
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "import/no-unresolved": "off",
    },
  },
  prettier,
]; 