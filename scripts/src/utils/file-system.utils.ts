import { existsSync } from 'fs';
import { copyFile as fsCopyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { normalize } from 'path';

const BUFFER_ENCODING: BufferEncoding = 'utf-8';

export async function readFileContent<T>(path: string): Promise<T> {
  const body = await readFile(path, BUFFER_ENCODING);
  return JSON.parse(body) as T;
}

export async function createFile(
  fileName: string,
  destination: string,
  body: string
): Promise<void> {
  const path = `${destination}/${fileName}`;
  try {
    await writeFile(path, body, BUFFER_ENCODING);
  } catch (err) {
    if (!pathExist(destination)) {
      await createFolder(destination);
      await writeFile(path, body, BUFFER_ENCODING);
    }
  }
}

export async function copyFile(src: string, dest: string): Promise<void> {
  try {
    await fsCopyFile(src, dest);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      await createPreviousFolder(dest);
      await fsCopyFile(src, dest);
    }
  }
}

export async function createFolder(destination: string): Promise<void> {
  try {
    await mkdir(destination);
  } catch (error) {
    await createPreviousFolder(destination);
    await createFolder(destination);
  }
}

async function createPreviousFolder(destination: string) {
  const folders = normalize(destination).split('\\');
  folders.pop();
  await createFolder(folders.join('\\'));
}

export function pathExist(path: string): boolean {
  return existsSync(path);
}
