export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '16.0.0-rc.4',
  releaseDate: 1697659661016
};
