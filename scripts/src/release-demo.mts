import { $ } from 'execa';

import { RELEASE_TAGS } from './config/release.interface.mts';
import { executor } from './utils/executor.mts';
import { writeFile2 } from './utils/file-system.utils.mts';
import * as log from './utils/log.mts';

executor('Publish demo on Github', async () => {
  const [_nodePath, _scriptPath, argVersion] = process.argv;
  const version = argVersion ?? process.env.npm_new_version;
  const $$ = $({ stdio: 'inherit' });

  if (!version) {
    throw new Error('No version detected');
  }

  const isTaggedVersion = RELEASE_TAGS.some((tag) => version.includes(tag));
  if (isTaggedVersion) {
    log.info(`We don't publish the demo for tagged version ${version}`);
    return;
  }

  log.info('Prepare each packages with the prestart script');
  await $$`npm run prestart`;

  log.info('Build the demo for Github');
  await $$`npm run build.ghpages -w demo`;

  await writeFile2(
    'dist/ghpages/browser/_config.yml',
    "include: ['_default.json', '_contexts.json', '_base.json']",
    false
  );

  await $$`npx ngh --dir=dist/ghpages/browser --no-silent=false --message=${version}`;
});
