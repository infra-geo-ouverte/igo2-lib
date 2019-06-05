import { Injectable } from '@angular/core';

import { ActionStore } from '@igo2/common';

import {
  FeatureStore,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy
} from '../../feature';
import { ImageLayer } from '../../layer';
import { IgoMap } from '../../map';

import { WmsWorkspace } from './wms-workspace';

@Injectable({
  providedIn: 'root'
})
export class WmsWorkspaceService {

  constructor() {}

  createWorkspace(layer: ImageLayer, map: IgoMap): WmsWorkspace {
    return new WmsWorkspace({
      id: layer.id,
      title: layer.title,
      layer,
      map,
      actionStore: new ActionStore([])
    });
  }

}
