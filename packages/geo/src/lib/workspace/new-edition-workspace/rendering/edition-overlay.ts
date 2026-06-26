import { MapBase } from '@igo2/geo';

import Collection from 'ol/Collection';
import OlFeature from 'ol/Feature';
import OlGeoJSON from 'ol/format/GeoJSON';
// todo: use GeometryType or GeoJSON geometry type
import { Geometry } from 'ol/geom';
import type { Type as GeometryType } from 'ol/geom/Geometry';
import OlModify from 'ol/interaction/Modify';
import * as OlStyle from 'ol/style';

import { Feature, FeatureGeometry, FeatureMotion } from '../../../feature';

const activeStyle = new OlStyle.Style({
  image: new OlStyle.Circle({
    radius: 7,
    stroke: new OlStyle.Stroke({ color: 'rgba(255,255,255,1)', width: 1 }),
    fill: new OlStyle.Fill({ color: 'rgba(0,161,222,1)' })
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
  private modifyInteraction?: OlModify;
  private workingCopy: Feature | undefined;

  constructor(
    private map: MapBase,
    private geometryType: GeometryType
  ) {}

  /**
   * Renders the original feature as a faded, non-interactive ghost.
   * Call before `enableModify` so the ghost always sits below the active point.
   */

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
    this.detachModify();
    this.map.overlay.clear();
    this.workingCopy = undefined;
  }

  private renderActive(): void {
    if (!this.workingCopy?.geometry) return;

    this.map.overlay.clear();

    this.map.overlay.addFeatures([this.workingCopy], FeatureMotion.None);

    const activeOlFeatures = this.map.overlay.dataSource.ol.getFeatures();
    const olFeature = activeOlFeatures.at(-1);

    if (olFeature) {
      olFeature.setStyle(activeStyle);
      this.attachModify(olFeature);
    }
  }

  private attachModify(olFeature: OlFeature<Geometry>): void {
    this.detachModify();

    const overlaySource = this.map.overlay.dataSource.ol;

    this.modifyInteraction = new OlModify({
      source: overlaySource,
      features: new Collection([olFeature], { unique: true })
    });

    this.map.ol.addInteraction(this.modifyInteraction);

    this.modifyInteraction.on('modifyend', (event) => {
      const modifiedFeature = event.features.getArray()[0];
      const modifiedGeometry = modifiedFeature.getGeometry();

      if (modifiedGeometry) {
        this.updateWorkingCopyGeometry(modifiedGeometry);
      }
    });
  }

  private detachModify(): void {
    if (this.modifyInteraction) {
      this.map.ol.removeInteraction(this.modifyInteraction);
      this.modifyInteraction = undefined;
    }
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
  }
}
