import { EnvironmentOptions as AuthEnvironmentOptions } from '@igo2/auth';
import { EnvironmentOptions as CommonEnvironmentOptions } from '@igo2/common';
import { EnvironmentOptions as ContextEnvironmentOptions } from '@igo2/context';
import {
  BaseEnvironmentOptions,
  EnvironmentOptions as CoreEnvironmentOptions
} from '@igo2/core';
import { EnvironmentOptions as GeoEnvironmentOptions } from '@igo2/geo';

export type AllEnvironmentOptions = AuthEnvironmentOptions &
  CommonEnvironmentOptions &
  CoreEnvironmentOptions &
  ContextEnvironmentOptions &
  GeoEnvironmentOptions &
  IntegrationEnvironmentOptions;

export interface EnvironmentOptions extends BaseEnvironmentOptions {
  igo: AllEnvironmentOptions;
}

interface IntegrationEnvironmentOptions {
  app?: AppOptions;
  hasFeatureEmphasisOnSelection?: boolean;
  saveSearchResultInLayer?: boolean;
}

export interface AppOptions {
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
