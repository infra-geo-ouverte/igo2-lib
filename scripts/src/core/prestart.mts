import { executor } from '../utils/executor.mts';
import { copyAssets, copyExternalAssets } from './utils/assets.mts';
import {
  compileAllBaseStyle,
  compileBaseStyle,
  prebuiltThemes
} from './utils/core-style.utils.mts';
import { bundleLocalization } from './utils/localization.mts';

executor(`Prepare the base for @igo2/core`, async () => {
  await prebuiltThemes();

  await compileBaseStyle();

  await compileAllBaseStyle();

  await bundleLocalization();

  await copyExternalAssets();

  await copyAssets();
});
