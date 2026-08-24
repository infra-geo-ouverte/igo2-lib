import { EnvironmentProviders, Provider } from '@angular/core';

export const OfflineFeatureKind = ['IndexedDb'] as const;
export type OfflineFeatureKind = (typeof OfflineFeatureKind)[number];

export interface OfflineFeature<KindT extends OfflineFeatureKind> {
  kind: KindT;
  providers: (Provider | EnvironmentProviders)[];
}
