// Configuração ESLint compartilhada (flat config) para os pacotes Node/TS do
// monorepo (packages/shared, packages/validation, apps/api). O apps/web usa
// sua própria configuração via eslint-config-next (apps/web/.eslintrc.json).
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**", "**/*.js", "**/*.mjs"],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);
