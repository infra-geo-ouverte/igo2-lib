import { compile } from 'sass';

import { PATHS } from '../config/paths.mts';
import { createFile } from './file-system.utils.mts';

export async function compileStyle(
  input: string,
  destination: string,
  outputFileName: string
) {
  const result = compile(input, {
    loadPaths: [PATHS.nodeModules],
    silenceDeprecations: [
      'color-functions',
      'global-builtin',
      'import',
      'mixed-decls'
    ]
  });
  await createFile(outputFileName, destination, result.css);
}
