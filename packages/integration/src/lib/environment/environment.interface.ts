import { AuthEnvironmentOptions } from '@igo2/auth';
import { ContextOptions } from '@igo2/context';
import { CommonOptions } from '@igo2/common';
import { BaseEnvironmentOptions, CoreOptions } from '@igo2/core';
import { GeoOptions } from '@igo2/geo';

type AllPackageOptions = AuthEnvironmentOptions &
  CommonOptions &
  CoreOptions &
  ContextOptions &
  GeoOptions &
  IntegrationOptions;

export interface EnvironmentOptions extends BaseEnvironmentOptions {
  igo: AllPackageOptions;
}

export interface IntegrationOptions {
  app?: AppOptions;
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
