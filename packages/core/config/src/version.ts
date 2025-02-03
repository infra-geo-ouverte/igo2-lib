export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '18.0.0-next.10',
  releaseDate: 1738606225928
};
