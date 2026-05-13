import { EnvironmentProviders, Provider } from '@angular/core';

import { StyleEngineKind } from './style.enum';
import { AnyOlStyle } from './style.types';

export type { EngineLayerStyle } from './style.base.interface';

export interface StyleEngineFeature<KindT extends StyleEngineKind> {
  kind: KindT;
  providers: (Provider | EnvironmentProviders)[];
}

export interface ConfigurableStylesOptions {
  // Restricted to OL due to new Overlay(...) is out of injection context and not use LayerService
  base?: AnyOlStyle;
  selection?: AnyOlStyle;
  focus?: AnyOlStyle;
}
