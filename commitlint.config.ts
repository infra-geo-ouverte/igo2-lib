import { RuleConfigSeverity, UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  formatter: '@commitlint/format',
  ignores: [(commit) => commit === ''],
  defaultIgnores: true,
  rules: {
    'body-max-line-length': [RuleConfigSeverity.Warning, 'always', 120]
  },
  helpUrl:
    'https://github.com/conventional-changelog/commitlint/#what-is-commitlint'
};

module.exports = Configuration;
