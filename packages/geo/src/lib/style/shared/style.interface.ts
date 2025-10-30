import { EnvironmentProviders, Provider } from '@angular/core';

export interface StyleFeature<KindT extends StyleFeatureKind> {
  kind: KindT;
  providers: (Provider | EnvironmentProviders)[];
}

export enum StyleFeatureKind {
  Geostyler = 0
}
