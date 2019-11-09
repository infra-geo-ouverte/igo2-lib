import olLayerVector from 'ol/layer/Vector';
import olSourceVector from 'ol/source/Vector';
import { unByKey } from 'ol/Observable';
import { easeOut } from 'ol/easing';
import { asArray as ColorAsArray } from 'ol/color';

import { FeatureDataSource } from '../../../datasource/shared/datasources/feature-datasource';
import { WFSDataSource } from '../../../datasource/shared/datasources/wfs-datasource';
import { ArcGISRestDataSource } from '../../../datasource/shared/datasources/arcgisrest-datasource';
import { WebSocketDataSource } from '../../../datasource/shared/datasources/websocket-datasource';
import { ClusterDataSource } from '../../../datasource/shared/datasources/cluster-datasource';

import { VectorWatcher } from '../../utils';
import { IgoMap } from '../../../map';
import { Layer } from './layer';
import { VectorLayerOptions } from './vector-layer.interface';

export class VectorLayer extends Layer {
  public dataSource:
    | FeatureDataSource
    | WFSDataSource
    | ArcGISRestDataSource
    | WebSocketDataSource
    | ClusterDataSource;
  public options: VectorLayerOptions;
  public ol: olLayerVector;
  private watcher: VectorWatcher;
  private trackFeatureListenerId;

  get browsable(): boolean {
    return this.options.browsable !== false;
  }

  get exportable(): boolean {
    return this.options.exportable !== false;
  }

  constructor(options: VectorLayerOptions) {
    super(options);
    this.watcher = new VectorWatcher(this);
    this.status$ = this.watcher.status$;
  }

  protected createOlLayer(): olLayerVector {
    const olOptions = Object.assign({}, this.options, {
      source: this.options.source.ol as olSourceVector
    });

    if (this.options.animation) {
      this.dataSource.ol.on(
        'addfeature',
        function(e) {
          this.flash(e.feature);
        }.bind(this)
      );
    }

    if (this.options.trackFeature) {
      this.enableTrackFeature(this.options.trackFeature);
    }

    return new olLayerVector(olOptions);
  }

  protected flash(feature) {
    const start = new Date().getTime();
    const listenerKey = this.map.ol.on('postcompose', animate.bind(this));

    function animate(event) {
      const vectorContext = event.vectorContext;
      const frameState = event.frameState;
      const flashGeom = feature.getGeometry().clone();
      const elapsed = frameState.time - start;
      const elapsedRatio = elapsed / this.options.animation.duration;
      const opacity = easeOut(1 - elapsedRatio);
      const newColor = ColorAsArray(this.options.animation.color || 'red');
      newColor[3] = opacity;
      let style = this.ol
        .getStyleFunction()
        .call(this, feature)
        .find(style2 => {
          return style2.getImage();
        });
      if (!style) {
        style = this.ol.getStyleFunction().call(this, feature)[0];
      }
      const styleClone = style.clone();

      switch (feature.getGeometry().getType()) {
        case 'Point':
          const radius =
            easeOut(elapsedRatio) * (styleClone.getImage().getRadius() * 3);
          styleClone.getImage().setRadius(radius);
          styleClone.getImage().setOpacity(opacity);
          break;
        case 'LineString':
          // TODO
          if (styleClone.getImage()) {
            styleClone
              .getImage()
              .getStroke()
              .setColor(newColor);
            styleClone
              .getImage()
              .getStroke()
              .setWidth(
                easeOut(elapsedRatio) *
                  (styleClone
                    .getImage()
                    .getStroke()
                    .getWidth() *
                    3)
              );
          }
          if (styleClone.getStroke()) {
            styleClone.getStroke().setColor(newColor);
            styleClone
              .getStroke()
              .setWidth(
                easeOut(elapsedRatio) * (styleClone.getStroke().getWidth() * 3)
              );
          }
          break;
        case 'Polygon':
          // TODO
          if (styleClone.getImage()) {
            styleClone
              .getImage()
              .getFill()
              .setColor(newColor);
          }
          if (styleClone.getFill()) {
            styleClone.getFill().setColor(newColor);
          }
          break;
      }

      styleClone.setText('');
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

  public setMap(map: IgoMap | undefined) {
    if (map === undefined) {
      this.watcher.unsubscribe();
    } else {
      this.watcher.subscribe(() => {});
    }
    super.setMap(map);
  }

  public onUnwatch() {
    this.dataSource.onUnwatch();
    this.stopAnimation();
  }

  public stopAnimation() {
    this.dataSource.ol.un(
      'addfeature',
      function(e) {
        if (this.visible) {
          this.flash(e.feature);
        }
      }.bind(this)
    );
  }

  public enableTrackFeature(id: string | number) {
    this.trackFeatureListenerId = this.dataSource.ol.on(
      'addfeature',
      this.trackFeature.bind(this, id)
    );
  }
  public centerMapOnFeature(id: string | number) {
    const feat = this.dataSource.ol.getFeatureById(id);
    if (feat) {
      this.map.ol.getView().setCenter(feat.getGeometry().getCoordinates());
    }
  }

  public trackFeature(id, feat) {
    if (feat.feature.getId() === id && this.visible) {
      this.centerMapOnFeature(id);
    }
  }

  public disableTrackFeature(id?: string | number) {
    unByKey(this.trackFeatureListenerId);
  }
}
