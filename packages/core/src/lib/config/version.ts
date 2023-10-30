export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '16.0.0-rc.6',
  releaseDate: 1698673887040
};
