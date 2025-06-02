export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '19.0.0-next.17',
  releaseDate: 1748866086788
};
