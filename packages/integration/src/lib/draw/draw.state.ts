import { Injectable } from '@angular/core';

import { FeatureStore, FeatureWithDraw } from '@igo2/geo';
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

  constructor(private mapState: MapState) {
    this.mapState.map.layers$.subscribe(() => {
      // for(const layer of this.mapState.map.layers){
      //   if (!this.layersID.includes(layer.id)){
      //     this.stores = this.stores.filter(store => store.layer.id !== layer.id);
      //     this.layersID = this.layersID.filter(layerID => layerID !== layer.id);
      //   }
      // }
    });

    for (let store of this.stores){
      store = new FeatureStore<FeatureWithDraw>([], {map: this.mapState.map}); 
    }
    
                
  }

}
