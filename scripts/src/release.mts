import semanticRelease from 'semantic-release';

import { executor } from './utils/executor.mts';
import * as log from './utils/log.mts';

executor('Library release', async () => {
  try {
    const result = await semanticRelease({
      branches: [
        'release/\\d+(\\.\\d+)?\\.x',
        'master',
        { name: 'next', prerelease: 'next' }
      ],
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        /**
         * @semantic-release/npm
         * Used only for updating the main package.json version. We use our own
         * publishing script to handle many packages thats is not possible with semantic-release
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
            prepareCmd: [
              'npm run pre-release ${nextRelease.version}',
              'npm i --package-lock-only --no-audit' // Regenerate the package-lock.json with the latest version
            ].join(' && '),
            publishCmd: 'npm run publish ${nextRelease.version}'
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
    });

    if (result) {
      const { lastRelease, commits, nextRelease, releases } = result;

      log.info(
        `Published ${nextRelease.type} release version ${nextRelease.version} containing ${commits.length} commits.`
      );

      if (lastRelease.version) {
        log.info(`The last release was "${lastRelease.version}".`);
      }

      for (const release of releases) {
        log.success(
          `The release was published with plugin "${release.pluginName}".`
        );
      }
    } else {
      log.warn('No release published.');
    }
  } catch (err: any) {
    log.error(`The automated release failed with: ${err?.message}`);
    process.exit(1);
  }
});
