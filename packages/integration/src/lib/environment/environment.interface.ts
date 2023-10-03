import { AuthEnvironmentOptions } from '@igo2/auth';
import { ContextOptions } from '@igo2/context';
import { CommonOptions } from '@igo2/common';
import { BaseEnvironmentOptions, CoreOptions, Version } from '@igo2/core';
import { GeoOptions } from '@igo2/geo';

export type AllPackageEnvironnementOptions = AuthEnvironmentOptions &
  CommonOptions &
  CoreOptions &
  ContextOptions &
  GeoOptions &
  IntegrationEnvironnementOptions;

export interface EnvironmentOptions extends BaseEnvironmentOptions {
  igo: AllPackageEnvironnementOptions;
}

export interface IntegrationEnvironnementOptions {
  app?: AppOptions;
  hasFeatureEmphasisOnSelection?: boolean;
  saveSearchResultInLayer?: boolean;
}

export interface AppOptions {
  version: Version;
  forceCoordsNA: boolean;
  install: {
    enabled?: boolean;
    promote?: boolean;
    manifestPath?: string;
  };
  pwa?: {
    enabled?: boolean;
    path?: string;
  };
}
