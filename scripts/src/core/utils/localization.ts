import { readdir } from 'fs/promises';
import { merge } from 'lodash';
import { join } from 'path';

import {
  createFile,
  pathExist,
  readFileContent
} from '../../utils/file-system.utils';
import { PATHS } from '../../config/paths';
import * as log from '../../utils/log';
import { getDuration } from '../../utils/performance.utils';

const LANGS: { key: string; definitions: { [key: string]: string } }[] = [
  { key: 'fr', definitions: {} },
  { key: 'en', definitions: {} }
];

export const bundleLocalization = async () => {
  const startTime = performance.now();
  const directories = await readdir(PATHS.packages);
  for (const directory of directories) {
    await handleLocalePackage(directory);
  }

  for (const lang of LANGS) {
    const destination = join(PATHS.dist, 'core', 'locale');
    await createFile(
      `${lang.key}.json`,
      destination,
      JSON.stringify(lang.definitions)
    );
    log.success(`Built locale ${lang.key}.json file`);
  }

  const duration = getDuration(startTime);
  log.info(`All locales built in ${duration}`);
};

async function handleLocalePackage(directory: string) {
  const directoryPath = join(PATHS.packages, directory, 'src/locale');
  if (!pathExist(directoryPath)) {
    return;
  }

  const files = await readdir(directoryPath);
  for (const file of files) {
    await handleLocale(file, directoryPath);
  }
}

async function handleLocale(filePath: string, directoryPath: string) {
  for (const lang of LANGS) {
    if (filePath.startsWith(lang.key)) {
      const path = join(directoryPath, filePath);
      const langDef = await readFileContent(path);
      lang.definitions = merge(lang.definitions, langDef);
    }
  }
}
