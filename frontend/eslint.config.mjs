import { defineConfig } from "eslint/config"
import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import stylistic from "@stylistic/eslint-plugin"

export default defineConfig([
  {
    plugins: { stylistic },
  },
  {
    rules: {
      "stylistic/indent": ["error", 2],
      "stylistic/quotes": ["error", "double", { avoidEscape: true }],
      "stylistic/semi": ["error", "never"],
      "stylistic/comma-dangle": ["error", "always-multiline"],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/lib/**",
      "**/out/**",
      "**/node_modules/**",
      "**/.next/**",
      "next.config.js",
    ],
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs["recommended-latest"],
  pluginReact.configs.flat["jsx-runtime"],
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/rules-of-hooks": "error", // For checking rules of hooks
      "react-hooks/exhaustive-deps": "error", // For checking hook dependencies,
    },
  },
])
