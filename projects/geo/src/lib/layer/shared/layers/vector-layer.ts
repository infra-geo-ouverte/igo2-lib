import olLayerVector from 'ol/layer/Vector';
import olSourceVector from 'ol/source/Vector';
import {unByKey} from 'ol/Observable';
import {easeOut} from 'ol/easing';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {asArray as ColorToArray} from 'ol/color';

import { FeatureDataSource } from '../../../datasource/shared/datasources/feature-datasource';
import { WFSDataSource } from '../../../datasource/shared/datasources/wfs-datasource';
import { ArcGISRestDataSource } from '../../../datasource/shared/datasources/arcgisrest-datasource';
import { WebSocketDataSource } from '../../../datasource/shared/datasources/websocket-datasource';

import { Layer } from './layer';
import { VectorLayerOptions } from './vector-layer.interface';

export class VectorLayer extends Layer {
  public dataSource: FeatureDataSource | WFSDataSource | ArcGISRestDataSource | WebSocketDataSource;
  public options: VectorLayerOptions;
  public ol: olLayerVector;

  constructor(options: VectorLayerOptions) {
    super(options);
  }

  protected createOlLayer(): olLayerVector {
    const olOptions = Object.assign({}, this.options, {
      source: this.options.source.ol as olSourceVector
    });

    let olLayer = new olLayerVector(olOptions);

    if(this.options.animation){
      this.dataSource.ol.on('addfeature', function(e) {
         this.flash(e.feature);
       }.bind(this));
    }

    return olLayer;
  }

  public flash(feature) {
    let start = new Date().getTime();
    let listenerKey = this.map.ol.on('postcompose', animate.bind(this));

    function animate(event) {

      let vectorContext = event.vectorContext;
      let frameState = event.frameState;
      let flashGeom = feature.getGeometry().clone();
      let elapsed = frameState.time - start;
      let elapsedRatio = elapsed / this.options.animation.duration;
      // radius will be 5 at start and 30 at end.
      let radius = easeOut(elapsedRatio) * 25 + 5;
      let opacity = easeOut(1 - elapsedRatio);

      let style = this.ol.getStyleFunction().call(this, feature)[0];
      let styleClone = style.clone();

      switch(feature.getGeometry().getType()){
        case 'Point' :
          styleClone.getImage().setRadius(radius);
          styleClone.getImage().setOpacity(opacity);
        break;
        case 'Line':
          // TODO
          break;
        case 'Polygon':
          // TODO
          break;
      }

      vectorContext.setStyle(styleClone);
      vectorContext.drawGeometry(flashGeom);

      if (elapsed > this.options.animation.duration) {
        unByKey(listenerKey);
        // remove last geometry
        // there is a little flash before feature disappear, better solution ?
        this.map.ol.render();
        return;
      }
      // tell OpenLayers to continue postcompose animation
      this.map.ol.render();
    }
  }

}
