import { compile } from 'sass';

import { createFile } from './file-system.utils';

export async function compileStyle(
  input: string,
  destination: string,
  outputFileName: string
) {
  const result = compile(input, {
    loadPaths: ['node_modules']
  });
  await createFile(outputFileName, destination, result.css);
}
