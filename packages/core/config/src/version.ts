export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '21.0.0-next.12',
  releaseDate: 1781633487999
};
