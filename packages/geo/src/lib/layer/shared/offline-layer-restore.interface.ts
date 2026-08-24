import { InjectionToken } from '@angular/core';

import { Observable } from 'rxjs';

import { Layer } from './layers';

export interface OfflineLayerRestore {
  createAsyncLayers(contextUri?: string): Observable<Layer[]>;
}

export const OFFLINE_LAYER_RESTORE = new InjectionToken<OfflineLayerRestore>(
  'OFFLINE_LAYER_RESTORE'
);
