export interface Version {
  app?: string;
  lib?: string;
  releaseDateApp?: number;
  releaseDate?: number;
}

export const version: Version = {
  lib: '19.0.0-next.27',
  releaseDate: 1757677959899
};
