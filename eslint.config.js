// Flat ESLint config for ESLint v9+ (CommonJS format to work without ESM)
// Docs: https://eslint.org/docs/latest/use/configure/configuration-files-new

const nextPlugin = require('@next/eslint-plugin-next');
const jsxa11y = require('eslint-plugin-jsx-a11y');
const prettier = require('eslint-config-prettier');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: ['.next/**', 'dist/**', 'node_modules/**', '.genkit/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
      'jsx-a11y': jsxa11y,
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parser: tsParser,
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: false,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...jsxa11y.configs.recommended.rules,
      ...prettier.rules,
    },
  },
  // Ignore type declarations from linting (optional)
  {
    ignores: ['**/*.d.ts'],
  },
];
