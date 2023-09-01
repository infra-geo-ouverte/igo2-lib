import { compile } from 'sass';
import { createFile } from './file-system.utils';
import { PATHS } from '../config/paths';

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
