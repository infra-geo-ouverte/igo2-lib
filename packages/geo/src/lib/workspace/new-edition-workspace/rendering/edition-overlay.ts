import Collection from 'ol/Collection';
import OlFeature from 'ol/Feature';
import OlGeoJSON from 'ol/format/GeoJSON';
// todo: use GeometryType or GeoJSON geometry type
import { Geometry } from 'ol/geom';
import type { Type as GeometryType } from 'ol/geom/Geometry';
import OlModify from 'ol/interaction/Modify';
import * as OlStyle from 'ol/style';

import { Subscription } from 'rxjs';

import { FeatureDataSource } from '../../../datasource';
import { createInteractionStyle } from '../../../draw/shared';
import { Feature, FeatureGeometry, featureToOl } from '../../../feature';
import { DrawControl } from '../../../geometry/shared/controls/draw';
import { VectorLayer } from '../../../layer/shared/layers/vector-layer';
import { IgoMap } from '../../../map/shared';

const Z_GHOST = 301; // faded snapshot — visual reference only, non-interactive
const Z_ACTIVE = 499; // solid working copy — the only target for OlModify

const activeStyle = new OlStyle.Style({
  stroke: new OlStyle.Stroke({ color: 'rgba(255,255,255,1)', width: 1 }),
  fill: new OlStyle.Fill({ color: 'rgba(0,161,222,1)' }),
  image: new OlStyle.Circle({
    radius: 7,
    stroke: new OlStyle.Stroke({ color: 'rgba(255,255,255,1)', width: 1 }),
    fill: new OlStyle.Fill({ color: 'rgba(0,161,222,1)' })
  })
});

const ghostStyle = new OlStyle.Style({
  stroke: new OlStyle.Stroke({ color: 'rgba(0,161,222,0.4)', width: 1 }),
  fill: new OlStyle.Fill({ color: 'rgba(0,161,222,0.2)' }),
  image: new OlStyle.Circle({
    radius: 7,
    stroke: new OlStyle.Stroke({ color: 'rgba(0,161,222,0.4)', width: 1 }),
    fill: new OlStyle.Fill({ color: 'rgba(0,161,222,0.2)' })
  })
});

/**
 * Manages two map layers and interactions for editing features.
 *
 * `ghostLayer` displays a faded snapshot of the original feature (non-interactive).
 *
 * `activeLayer` displays a solid working copy of the feature (interactive).
 *
 * The working copy is a clone of the original feature, and any modifications are applied to it.
 * The original feature remains unchanged until the user saves the changes.
 */
export class EditionOverlay {
  private readonly ghostLayer: VectorLayer;
  private readonly activeLayer: VectorLayer;
  private drawControl: DrawControl;
  private drawEnd$$?: Subscription;
  private modifyInteraction?: OlModify;
  private workingCopy: Feature | undefined;

  constructor(
    private map: IgoMap,
    private geometryType: GeometryType
  ) {
    this.ghostLayer = this.createLayer('igo-edition-ghost-layer', Z_GHOST);
    this.activeLayer = this.createLayer('igo-edition-active-layer', Z_ACTIVE);
    this.drawControl = this.createDrawControl();
  }

  /**
   * Renders the original feature as a faded, non-interactive ghost.
   * Call before `enableModify` so the ghost always sits below the active point.
   */
  showGhost(feature: Feature): void {
    const projection = this.map.ol.getView().getProjection().getCode();
    const olFeature = featureToOl(feature, projection);
    olFeature.setStyle(ghostStyle);
    this.ghostLayer.dataSource.ol.clear();
    this.ghostLayer.dataSource.ol.addFeature(olFeature);
    this.map.layerController.add(this.ghostLayer);
  }

  /**
   * Clones the feature into an internal working copy, renders it solid, and
   * attaches `OlModify`. The original feature is never mutated.
   * Falls back to `enableCreate` when the feature has no geometry yet.
   */
  enableModify(feature: Feature): void {
    this.workingCopy = {
      ...feature,
      extent: feature.extent
        ? ([...feature.extent] as [number, number, number, number])
        : undefined,
      properties: structuredClone(feature.properties),
      geometry: structuredClone(feature.geometry),
      ol: undefined
    };

    if (!this.workingCopy.geometry) {
      return this.enableCreate();
    }

    this.renderActive();
  }

  /**
   * Returns the current working copy (contains any geometry the user moved).
   */
  getWorkingCopy(): Feature | undefined {
    return this.workingCopy;
  }

  /**
   * Removes all overlays and detaches interactions.
   * Single teardown path — call on save-success or cancel.
   */
  clear(): void {
    this.detachDrawControl();
    this.detachModify();
    this.ghostLayer.dataSource.ol.clear();
    this.activeLayer.dataSource.ol.clear();
    this.map.layerController.remove(this.ghostLayer);
    this.map.layerController.remove(this.activeLayer);
    this.workingCopy = undefined;
  }

  /**
   * Activates the draw control so the user can place a new point.
   * Used for create mode (no existing geometry on the working copy).
   */
  private enableCreate(): void {
    this.drawEnd$$ = this.drawControl.end$.subscribe((olGeometry) => {
      this.updateWorkingCopyGeometry(olGeometry);
    });
    this.drawControl.setOlMap(this.map.ol, true);
  }

  private renderActive(): void {
    if (!this.workingCopy?.geometry) return;

    const projection = this.map.ol.getView().getProjection().getCode();
    const olFeature = featureToOl(this.workingCopy, projection);
    olFeature.setStyle(activeStyle);

    this.activeLayer.dataSource.ol.clear();
    this.activeLayer.dataSource.ol.addFeature(olFeature);
    this.map.layerController.add(this.activeLayer);

    this.attachModify(olFeature);
  }

  private attachModify(olFeature: OlFeature<Geometry>): void {
    this.detachModify();
    const features = new Collection([olFeature], { unique: true });
    this.modifyInteraction = new OlModify({ features });
    this.map.ol.addInteraction(this.modifyInteraction);
    this.modifyInteraction.on('modifyend', (event) => {
      const modified = event.features.getArray()[0]?.getGeometry();
      if (modified) {
        this.updateWorkingCopyGeometry(modified);
      }
    });
  }

  private detachModify(): void {
    if (this.modifyInteraction) {
      this.map.ol.removeInteraction(this.modifyInteraction);
      this.modifyInteraction = undefined;
    }
  }

  private detachDrawControl(): void {
    this.drawEnd$$?.unsubscribe();
    this.drawEnd$$ = undefined;
    this.drawControl.setOlMap(undefined);
  }

  private updateWorkingCopyGeometry(olGeometry: Geometry): void {
    if (!this.workingCopy) return;

    const projection = this.map.ol.getView().getProjection();
    const geometry = new OlGeoJSON().writeGeometryObject(olGeometry, {
      featureProjection: projection,
      dataProjection: 'EPSG:4326'
    }) as unknown as FeatureGeometry;

    this.workingCopy.projection = 'EPSG:4326';
    this.workingCopy.geometry = geometry;

    this.renderActive();
  }

  private createLayer(id: string, zIndex: number): VectorLayer {
    return new VectorLayer({
      id,
      title: id,
      zIndex,
      isIgoInternalLayer: true,
      source: new FeatureDataSource(),
      showInLayerList: false,
      exportable: false,
      browsable: false,
      workspace: { enabled: false }
    });
  }

  private createDrawControl(): DrawControl {
    return new DrawControl({
      geometryType: this.geometryType,
      drawingLayerSource: this.activeLayer.dataSource.ol,
      drawingLayerStyle: new OlStyle.Style({}),
      interactionStyle: createInteractionStyle()
    });
  }
}
