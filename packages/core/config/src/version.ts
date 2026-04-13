export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '20.1.0-next.21',
  releaseDate: 1776078988324
};
