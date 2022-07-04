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
      for(const layer of this.mapState.map.layers.filter(layer => layer.id.includes('igo-draw-layer'))){
        if (!this.layersID.includes(layer.id)){
          console.log(layer.id);
          
          // this.stores = this.stores.filter(store => store.layer.id !== layer.id);
          // this.layersID = this.layersID.filter(layerID => layerID !== layer.id);
          // this.drawControls = this.drawControls.filter(dc => dc[0] !== layer.id);
        }
      }
    });

    for (let store of this.stores){
      store = new FeatureStore<FeatureWithDraw>([], {map: this.mapState.map}); 
    }
    
                
  }

}
