export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '20.1.0-next.28',
  releaseDate: 1776972564062
};
