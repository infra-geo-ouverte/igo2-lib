import { compile } from 'sass';

import { PATHS } from '../core/paths.mts';
import { createFile } from './file-system.utils.mts';

export async function compileStyle(
  input: string,
  destination: string,
  outputFileName: string
) {
  const result = compile(input, {
    loadPaths: [PATHS.nodeModules]
  });
  await createFile(outputFileName, destination, result.css);
}
