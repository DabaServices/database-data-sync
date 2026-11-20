//  @ts-check

import eslintReact from '@eslint-react/eslint-plugin'
import js from '@eslint/js'
import { tanstackConfig } from '@tanstack/eslint-config'
import tanstackQuery from '@tanstack/eslint-plugin-query'
import pluginRouter from '@tanstack/eslint-plugin-router'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores([
    'eslint.config.js',
    'prettier.config.js',
    'stylelint.config.js',
    'routeTree.gen.ts',
    '.agents',
    'storybook-static',
    'dist',
  ]),
  {
    name: 'app/base',
    extends: [
      tanstackConfig,
      js.configs.recommended,
      tseslint.configs.recommended,
      eslintReact.configs['recommended-typescript'],
      reactHooks.configs.flat['recommended-latest'],
      tanstackQuery.configs['flat/recommended'],
      pluginRouter.configs['flat/recommended'],
    ],
    plugins: {
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      'import/no-cycle': 'off',
      'import/order': 'off',
      'import/consistent-type-specifier-style': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'no-shadow': 'off',
      'no-redeclare': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    name: 'app/typed-typescript',
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'typeParameter',
          format: ['PascalCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
      ],
    },
  },
  {
    name: 'app/routes',
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            {
              from: 'package',
              package: '@tanstack/router-core',
              name: 'Redirect',
            },
            {
              from: 'package',
              package: '@tanstack/router-core',
              name: 'NotFoundError',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'app/context',
    files: ['**/context/**/*.{ts,tsx}', '**/*Context.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    name: 'app/ui-boundary',
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/features/**', '**/features/**'],
              message:
                'components/ui must stay domain-free. Either pass the data in as a prop, or move this component into the relevant feature slice or a sibling components/* group.',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'app/stories',
    files: ['**/*.stories.{ts,tsx}', '.storybook/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      '@eslint-react/rules-of-hooks': 'off',
      '@eslint-react/no-array-index-key': 'off',
    },
  },
  {
    name: 'app/skeletons',
    files: ['**/*.Skeleton.{ts,tsx}'],
    rules: {
      '@eslint-react/no-array-index-key': 'off',
    },
  },
])
