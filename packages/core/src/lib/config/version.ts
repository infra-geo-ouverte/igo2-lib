export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '16.0.0-rc.2',
  releaseDate: 1697030263684
};
