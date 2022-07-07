import { Injectable } from '@angular/core';

import { DrawControl, FeatureStore, FeatureWithDraw } from '@igo2/geo';
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

  constructor(private mapState: MapState) {
    this.mapState.map.layers$.subscribe(() => {
      this.layersID.forEach(layerId => {
        if (!this.mapState.map.getLayerById(layerId)){
          let deletedStore = this.stores.find(store => store.layer.id === layerId);
          deletedStore.deleteMany(deletedStore.all());
          this.stores.splice(this.stores.indexOf(deletedStore,0), 1);
          this.layersID.splice(this.layersID.indexOf(layerId,0), 1);
          let drawControlIndex = this.drawControls.findIndex(dc => dc[0] === layerId);
          this.drawControls.splice(drawControlIndex, 1);
        }
      });
    });
    for (let store of this.stores){
      store = new FeatureStore<FeatureWithDraw>([], {map: this.mapState.map});
    }
  }
}
