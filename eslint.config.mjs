// @ts-check
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['packages/**/*'] },
  {
    files: ['**/*.ts'],
    plugins: {
      // @ts-ignore
      '@stylistic': stylistic
    },
    extends: [
      eslint.configs.recommended,
      // @ts-ignore
      ...tseslint.configs.recommended,
      // @ts-ignore
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
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
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
    // @ts-ignore
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
