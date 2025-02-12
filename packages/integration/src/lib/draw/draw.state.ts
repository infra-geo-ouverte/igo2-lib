import { Injectable } from '@angular/core';

import {
  DrawControl,
  FeatureStore,
  FeatureWithDraw,
  VectorLayer
} from '@igo2/geo';

import { MapState } from '../map/map.state';

/**
 * Service that holds the state of the measure module
 */
@Injectable({
  providedIn: 'root'
})
export class DrawState {
  public stores: FeatureStore<FeatureWithDraw>[] = [];
  public layersID: string[] = [];
  public drawControls: [string, DrawControl][] = [];
  public activeDrawingLayer: VectorLayer;

  constructor(private mapState: MapState) {
    this.mapState.map.layerController.all$.subscribe(() => {
      this.layersID.forEach((layerId) => {
        if (!this.mapState.map.layerController.getById(layerId)) {
          const deletedStore = this.stores.find(
            (store) => store.layer.id === layerId
          );
          deletedStore.deleteMany(deletedStore.all());
          this.stores.splice(this.stores.indexOf(deletedStore, 0), 1);
          this.layersID.splice(this.layersID.indexOf(layerId, 0), 1);
          const drawControlIndex = this.drawControls.findIndex(
            (dc) => dc[0] === layerId
          );
          this.drawControls.splice(drawControlIndex, 1);
        }
      });
    });
    for (let store of this.stores) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      store = new FeatureStore<FeatureWithDraw>([], { map: this.mapState.map });
    }
  }
}
