// @ts-check
const stylistic = require('@stylistic/eslint-plugin');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  { ignores: ['packages/**/*'] },
  {
    files: ['**/*.ts'],
    plugins: {
      // @ts-ignore
      '@stylistic': stylistic
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase'
        }
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case'
        }
      ],
      '@angular-eslint/no-output-native': 'off',
      '@stylistic/semi': ['error', 'always'],
      '@typescript-eslint/array-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowTernary: true }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { args: 'after-used', destructuredArrayIgnorePattern: '^_' }
      ],
      'arrow-spacing': 'error',
      eqeqeq: ['error', 'smart'],
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': 'error',
      'no-trailing-spaces': 'error',
      'no-useless-escape': 'warn',

      'no-unused-vars': 'off',
      semi: 'off',
      'semi-spacing': 'warn'
    }
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility
    ],
    rules: {
      '@angular-eslint/template/alt-text': 'warn',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn'
    }
  }
);
