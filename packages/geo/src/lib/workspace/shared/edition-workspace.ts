import {
  EntityRecord,
  EntityTableTemplate,
  getColumnKeyWithoutPropertiesTag
} from '@igo2/common/entity';
import { Workspace, WorkspaceOptions } from '@igo2/common/workspace';
import { ConfigService } from '@igo2/core/config';

import Collection from 'ol/Collection';
import OlFeature from 'ol/Feature';
import OlGeoJSON from 'ol/format/GeoJSON';
import type { default as OlGeometry, Type } from 'ol/geom/Geometry';
import OlModify from 'ol/interaction/Modify';
import OlVectorSource from 'ol/source/Vector';
import * as OlStyle from 'ol/style';

import { Geometry } from 'geojson';
import { BehaviorSubject, Subscription } from 'rxjs';

import { FeatureDataSource } from '../../datasource/shared';
import { GeometryType, createInteractionStyle } from '../../draw/shared';
import { Feature, FeatureGeometry, featureToOl } from '../../feature/shared';
import { DrawControl } from '../../geometry/shared';
import { ImageLayer, VectorLayer } from '../../layer/shared';
import { IgoMap } from '../../map/shared/map';
import { EditionFeature } from './edition-workspace.interface';

interface EditionWorkspaceMeta {
  tableTemplate: EntityTableTemplate;
}

interface EditionWorkspaceOptions extends WorkspaceOptions<EditionWorkspaceMeta> {
  layer: ImageLayer | VectorLayer;
  map: IgoMap;
}

export class EditionWorkspace extends Workspace {
  public readonly inResolutionRange$ = new BehaviorSubject<boolean>(true);

  public fillColor!: string;
  public geometryType = GeometryType; // Reference to the GeometryType enum
  public modify?: OlModify; // Reference to the ol interaction
  public modifyStyle = new OlStyle.Style({
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
  public strokeColor!: string;
  public strokeWidth!: number;

  private drawControl: DrawControl;
  private drawEnd$$!: Subscription;
  private olDrawingLayer: VectorLayer;
  private olDrawingLayerSource = new OlVectorSource();

  constructor(
    private configService: ConfigService,
    private adding$: BehaviorSubject<boolean>,
    protected options: EditionWorkspaceOptions
  ) {
    super(options);
    this.map.viewController.resolution$.subscribe((mapResolution) => {
      if (
        (mapResolution ?? 0) > this.layer.minResolution &&
        (mapResolution ?? 0) < this.layer.maxResolution
      ) {
        this.inResolutionRange$.next(true);
      } else {
        this.inResolutionRange$.next(false);
      }
    });

    this.drawControl = this.createDrawControl();
    this.drawControl.setGeometryType(this.geometryType.Point);

    this.olDrawingLayer = new VectorLayer({
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

    this.map.layerController.remove(this.olDrawingLayer);
  }

  public get layer(): ImageLayer | VectorLayer {
    return this.options.layer;
  }

  public get map(): IgoMap {
    return this.options.map;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore override return type
  public get meta(): EditionWorkspaceMeta | undefined {
    return this.options.meta ?? undefined;
  }

  /**
   * Create a Draw Control
   * @param fillColor the fill color
   * @param strokeColor the stroke color
   * @param strokeWidth the stroke width
   * @returns a Draw Control
   */
  public createDrawControl(
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number
  ) {
    const drawControl = new DrawControl({
      geometryType: undefined as unknown as string,
      drawingLayerSource: this.olDrawingLayerSource,
      drawingLayerStyle: new OlStyle.Style({}),
      interactionStyle: createInteractionStyle(
        fillColor,
        strokeColor,
        strokeWidth
      )
    });

    return drawControl;
  }

  /**
   * Create a modify interaction to allow a geometry change one feature at the time (drag and drop)
   */
  public createModifyInteraction(
    olFeature: OlFeature<OlGeometry>,
    feature: Feature
  ) {
    if (this.modify) {
      this.map.ol.removeInteraction(this.modify);
    }
    const olCollection = new Collection([olFeature], { unique: true });
    this.modify = new OlModify({
      features: olCollection
    });

    this.map.ol.addInteraction(this.modify);
    olCollection.forEach((feature) => {
      feature.setStyle(this.modifyStyle);
    });

    this.modify.on('modifyend', (event) => {
      const olGeometry = event.features.getArray()[0]?.getGeometry();
      if (olGeometry) {
        this.addFeatureToStore(feature, olGeometry);
      }
    });
  }

  /**
   * Deactivate the active draw control
   */
  public deactivateDrawControl() {
    if (!this.drawControl) {
      return;
    }

    if (this.drawEnd$$) {
      this.drawEnd$$.unsubscribe();
    }

    this.drawControl.setOlMap(undefined);
  }

  /**
   * Delete drawings layer and source from the map AND feature from the entity store.
   * Layer refresh will automatically add the new feature into the store.
   */
  public deleteDrawings() {
    this.map.layerController.remove(this.olDrawingLayer);
    this.olDrawingLayerSource.clear();
    if (this.modify) {
      this.map.ol.removeInteraction(this.modify);
    }
  }

  public editFeature(feature: EditionFeature) {
    feature.edition = true;
    const editionOpt = this.layer.dataSource.options.edition;
    const id = this.findFeatureId(feature);
    if (id) {
      feature.original_properties = JSON.parse(
        JSON.stringify(feature.properties)
      );
      feature.original_geometry = feature.geometry;
      feature.idkey = id;
      this.entityStore!.state.updateAll({ edit: false });
      this.entityStore!.stateView.filter(this.editFeaturefilterClauseFunc);
      this.addFeatureToStore(feature);
    } else {
      // Only for edition with it's own geometry
      if (!feature.newFeature && editionOpt?.geomType) {
        feature.newFeature = true;
        this.adding$.next(true);
        this.entityStore!.state.updateAll({ newFeature: false });
        this.entityStore!.stateView.filter(this.newFeaturefilterClauseFunc);
        if (editionOpt?.addWithDraw) {
          const geometryType = editionOpt?.geomType;
          this.onGeometryTypeChange(geometryType, feature);
        } else {
          this.entityStore!.insert(feature);
          this.entityStore!.state.update(feature, { newFeature: true }, true);
        }
      }
    }
  }

  public getDeleteUrl(feature: Feature): string {
    let url: string | undefined;
    const baseUrl = this.layer.dataSource.options.edition?.baseUrl;
    const deleteUrl = this.layer.dataSource.options.edition?.deleteUrl;
    if (baseUrl?.length) {
      url = this.configService.getConfig('edition.url')
        ? this.configService.getConfig('edition.url') +
          baseUrl +
          '?' +
          deleteUrl
        : baseUrl + '?' + deleteUrl;
    } else {
      url = this.configService.getConfig('edition.url')
        ? this.configService.getConfig('edition.url') + deleteUrl
        : deleteUrl;
    }

    const id = this.findFeatureId(feature);
    if (url) {
      url += id;
    }
    return url ?? '';
  }

  /**
   * Called when the user selects a new geometry type
   * @param geometryType the geometry type selected by the user
   */
  public onGeometryTypeChange(geometryType: Type, feature: Feature) {
    this.drawControl.setGeometryType(geometryType);
    this.toggleDrawControl(feature);
  }

  private readonly editFeaturefilterClauseFunc = (
    record: EntityRecord<object>
  ) => {
    return record.state.edit === true;
  };
  private readonly newFeaturefilterClauseFunc = (
    record: EntityRecord<object>
  ) => {
    return record.state.newFeature === true;
  };

  /**
   * Activate a given control
   */
  private activateDrawControl(feature: Feature) {
    this.drawEnd$$ = this.drawControl.end$.subscribe(
      (olGeometry: OlGeometry) => {
        this.addFeatureToStore(feature, olGeometry);
      }
    );

    this.drawControl.setOlMap(this.map.ol, true);
  }

  /**
   * Add a feature to layer. The loading strategy of the layer
   * will trigger and add the feature to the workspace store.
   * @internal
   */
  private addFeatureToStore(feature: Feature, olGeometry?: OlGeometry) {
    const projection = this.map.ol.getView().getProjection();
    let geometry: Geometry;

    // If an olGeometry is passed, it means that it is a new feature
    if (olGeometry) {
      this.entityStore!.insert(feature);
      this.entityStore!.state.update(feature, { newFeature: true }, true);
      geometry = new OlGeoJSON().writeGeometryObject(olGeometry, {
        featureProjection: projection,
        dataProjection: 'EPSG:4326'
      });

      feature.geometry = geometry as FeatureGeometry;
    } else {
      this.entityStore!.state.update(feature, { edit: true }, true);
    }

    feature.projection = 'EPSG:4326';

    const featureOl = featureToOl(feature, projection.getCode());

    this.olDrawingLayer.dataSource.ol.clear();
    this.olDrawingLayer.dataSource.ol.addFeature(featureOl);
    this.map.layerController.add(this.olDrawingLayer);

    this.deactivateDrawControl();

    if (this.layer.dataSource.options.edition?.addWithDraw) {
      this.createModifyInteraction(featureOl, feature);
    }
  }

  private findFeatureId(feature: Feature): string | null {
    const primaryColumn = this.meta?.tableTemplate?.columns
      .filter((column) => column.primary)
      .find((column) => {
        const key = getColumnKeyWithoutPropertiesTag(column.name);
        return feature.properties[key] != null;
      });

    if (!primaryColumn) {
      return null;
    }

    const key = getColumnKeyWithoutPropertiesTag(primaryColumn.name);
    return feature.properties[key] as string | null;
  }

  /**
   * Activate the correct control
   */
  private toggleDrawControl(feature: Feature) {
    this.deactivateDrawControl();
    this.activateDrawControl(feature);
  }
}
