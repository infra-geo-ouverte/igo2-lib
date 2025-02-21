export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '19.0.0-next.1',
  releaseDate: 1740159112907
};
