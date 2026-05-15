import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
     // 1. No "any" type - forces you to define interfaces
      "@typescript-eslint/no-explicit-any": "error",
      
      // 2. No unused variables - keeps the code clean
      "no-unused-vars": "off", // Turned off to use the TS version below
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      
      // 3. Force "const" instead of "let" where possible
      "prefer-const": "error",
    },

  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
