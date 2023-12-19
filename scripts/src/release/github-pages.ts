import { writeFile2 } from '../utils/file-system.utils';
import * as log from '../utils/log';
import { getDuration } from '../utils/performance.utils';

const baseCmdName = 'Demo publishing';

const startTime = performance.now();
log.startMsg(baseCmdName);

(async () => {
  try {
    const { $ } = await import('execa');

    const $$ = $({ stdio: 'inherit' });
    log.info('Build the demo for Github');
    await $$`npm run prestart`;
    await $$`npm run build.ghpages -w demo`;
    await writeFile2(
      'dist/ghpages/_config.yml',
      "include: ['_default.json', '_contexts.json', '_base.json']",
      false
    );

    const version =
      process.env.npm_new_version ?? process.env.npm_package_version;
    if (!version) {
      throw new Error('No version detected');
    }
    await $$`npx ngh --dir=dist/ghpages --no-silent=false --message=${version}`;

    const duration = getDuration(startTime);
    log.success(
      `Published the demo version ${version}, excuted in ${duration}.`
    );
  } catch (error: any) {
    log.error(error.message);
    process.exit(1);
  }
})();
