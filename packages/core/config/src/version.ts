export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '21.0.0-next.24',
  releaseDate: 1787843288820
};
