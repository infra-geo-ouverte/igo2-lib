export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '21.0.0-next.29',
  releaseDate: 1789052168272
};
