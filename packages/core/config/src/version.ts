export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '18.0.0-next.1',
  releaseDate: 1725378824462
};
