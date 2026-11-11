import { InjectionToken } from '@angular/core';

import type { AnyLayer } from './layers/any-layer';

export interface LayerPersistence {
  isPersistent(layer: AnyLayer): boolean;
  removePersistedData(layer: AnyLayer): void;
}

export const LAYER_PERSISTENCE = new InjectionToken<LayerPersistence>(
  'LAYER_PERSISTENCE'
);
