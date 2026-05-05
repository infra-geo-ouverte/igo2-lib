/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'master',
    { name: 'next', prerelease: 'next' }
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    /**
     * @semantic-release/npm
     * Used only for updating the main package.json version. We use our own
     * publishing script to handle many packages thats is not possible with only semantic-release
     */
    [
      '@semantic-release/npm',
      {
        npmPublish: false
      }
    ],
    [
      '@semantic-release/exec',
      {
        // The prepareCmd is important because the files will be included in the commit and
        // we bump the version in all package.json.
        prepareCmd:
          'node --import tsx scripts/src/pre-release.mts ${nextRelease.version}',
        publishCmd:
          'node --import tsx scripts/src/publish.mts ${nextRelease.version}'
      }
    ],
    '@semantic-release/github',
    [
      '@semantic-release/git',
      {
        assets: ['packages/**/*.*', 'package.json', 'package-lock.json']
      }
    ]
  ]
};
