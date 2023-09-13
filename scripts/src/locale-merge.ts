import { readdir } from 'fs/promises';
import { merge } from 'lodash';
import { join } from 'path';
import {
  createFile,
  pathExist,
  readFileContent
} from './utils/file-system.utils';

const ROOT_FOLDER = 'packages';

const LANGS: { key: string; definitions: { [key: string]: string } }[] = [
  { key: 'fr', definitions: {} },
  { key: 'en', definitions: {} }
];

(async () => {
  const directories = await readdir(ROOT_FOLDER);
  for (const directory of directories) {
    await handlePackage(directory);
  }

  for (const lang of LANGS) {
    const destination = `dist/core/locale/`;
    await createFile(
      `${lang.key}.json`,
      destination,
      JSON.stringify(lang.definitions)
    );
  }
})();

async function handlePackage(directory: string) {
  const directoryPath = `${ROOT_FOLDER}/${directory}/src/locale`;
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
