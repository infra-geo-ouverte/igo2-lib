// @ts-check
import tseslint from 'typescript-eslint';

import rootConfig from '../../eslint.config.mjs';

export default tseslint.config(
  ...rootConfig,
  { ignores: ['!**/*'] },
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'igo',
          style: 'camelCase'
        }
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'igo',
          style: 'kebab-case'
        }
      ]
    }
  },
  {
    files: ['**/*.html'],
    rules: {}
  }
);
