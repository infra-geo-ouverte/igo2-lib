import OlGeoJSON from 'ol/format/GeoJSON';
import { Geometry } from 'ol/geom';
import OlVectorSource from 'ol/source/Vector';
import * as OlStyle from 'ol/style';

import { Subject, Subscription } from 'rxjs';

import { FeatureDataSource } from '../../datasource';
import { GeometryType, createInteractionStyle } from '../../draw';
import { Feature, FeatureGeometry, featureToOl } from '../../feature';
import { DrawControl } from '../../geometry';
import { VectorLayer } from '../../layer/shared';
import { IgoMap } from '../../map';

export class GeometryEditor {
  private editionDoneSub = new Subject<FeatureGeometry>();
  get editionDone$() {
    return this.editionDoneSub.asObservable();
  }

  private modifyStyle = new OlStyle.Style({
    stroke: new OlStyle.Stroke({
      color: 'rgba(255,255,255,1)',
      width: 1
    }),
    fill: new OlStyle.Fill({
      color: 'rgba(0,161,222,1)'
    }),
    image: new OlStyle.Circle({
      radius: 7,
      stroke: new OlStyle.Stroke({
        color: 'rgba(255,255,255,1)',
        width: 1
      }),
      fill: new OlStyle.Fill({
        color: 'rgba(0,161,222,1)'
      })
    })
  });

  private drawingLayer = new VectorLayer({
    id: 'igo-draw-layer',
    title: 'edition',
    zIndex: 300,
    source: new FeatureDataSource(),
    showInLayerList: false,
    exportable: false,
    browsable: false,
    workspace: {
      enabled: false
    }
  });
  private drawingLayerSource = new OlVectorSource();
  private drawControl: DrawControl;
  private drawEnd$$: Subscription;

  constructor(
    private map: IgoMap,
    private geometryType: GeometryType
  ) {
    // TODO add modify interaction to after create and edit
    this.drawControl = this.createDrawControl();
  }

  enableEdit() {}

  enableCreate(feature: Feature) {
    this.drawEnd$$ = this.drawControl.end$.subscribe((olGeometry) =>
      this.addFeatureToMap(feature, olGeometry)
    );
    this.drawControl.setOlMap(this.map.ol, true);
  }

  disable() {
    this.disableDrawControl();
    this.clearDrawings();
  }

  private disableDrawControl() {
    this.drawEnd$$?.unsubscribe();
    this.drawEnd$$ = undefined;
    this.drawControl.setOlMap(undefined);
  }

  private addFeatureToMap(feature: Feature, olGeometry: Geometry) {
    const projection = this.map.ol.getView().getProjection();
    const geometry = new OlGeoJSON().writeGeometryObject(olGeometry, {
      featureProjection: projection,
      dataProjection: 'EPSG:4326'
    }) as unknown as FeatureGeometry;

    feature.projection = 'EPSG:4326';
    feature.geometry = geometry;

    const olFeature = featureToOl(feature, projection.getCode());
    olFeature.setStyle(this.modifyStyle);

    this.drawingLayer.dataSource.ol.clear();
    this.drawingLayer.dataSource.ol.addFeature(olFeature);
    this.map.addLayer(this.drawingLayer);

    this.disableDrawControl();

    // TODO Add edit
  }

  private clearDrawings() {
    this.map.removeLayer(this.drawingLayer);
    this.drawingLayerSource.clear();
  }

  private createDrawControl(
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number
  ) {
    const control = new DrawControl({
      geometryType: undefined,
      drawingLayerSource: this.drawingLayerSource,
      drawingLayerStyle: new OlStyle.Style({}),
      interactionStyle: createInteractionStyle(
        fillColor,
        strokeColor,
        strokeWidth
      )
    });
    control.setGeometryType(this.geometryType);
    return control;
  }
}
