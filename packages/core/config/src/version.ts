export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '20.1.0-next.1',
  releaseDate: 1762962489469
};
