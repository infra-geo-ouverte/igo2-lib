import { cleanPackageExports } from '../config/packages.mts';
import { executor } from '../utils/executor.mts';
import * as log from '../utils/log.mts';
import { copyAssets, copyExternalAssets } from './utils/assets.mts';
import {
  compileAllBaseStyle,
  compileBaseStyle,
  prebuiltThemes
} from './utils/core-style.utils.mts';
import { bundleLocalization } from './utils/localization.mts';

executor(`Postbuild @igo2/core`, async () => {
  await cleanPackageExports('core');
  log.success(`✔ Cleaning package.json exports`);

  await prebuiltThemes();

  await compileBaseStyle();

  await compileAllBaseStyle();

  await bundleLocalization();

  await copyExternalAssets();
  await copyAssets();
});
