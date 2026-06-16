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

/**
 * z-index bands (Q7 — distinct layers, documented, no collision with
 * selection overlay which is fixed at 300 throughout the workspace).
 *
 * SELECTION_Z (300) < GHOST_Z (301) < ACTIVE_Z (302)
 */
const Z_GHOST = 301; // faded snapshot — visual reference only, non-interactive
const Z_ACTIVE = 302; // solid working copy — the only target for OlModify

/** Solid style for the draggable working-copy point. */
const activeStyle = new OlStyle.Style({
  stroke: new OlStyle.Stroke({ color: 'rgba(255,255,255,1)', width: 1 }),
  fill: new OlStyle.Fill({ color: 'rgba(0,161,222,1)' }),
  image: new OlStyle.Circle({
    radius: 7,
    stroke: new OlStyle.Stroke({ color: 'rgba(255,255,255,1)', width: 1 }),
    fill: new OlStyle.Fill({ color: 'rgba(0,161,222,1)' })
  })
});

/** Faded style for the ghost (initial-position reference). Non-interactive. */
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
 * Manages the two map overlay layers used during feature editing.
 *
 * - **Ghost layer** (`Z_GHOST = 301`): faded snapshot at the feature's
 *   original position. Non-interactive — `OlModify` is never attached to it.
 * - **Active layer** (`Z_ACTIVE = 302`): solid working copy. Sole target for
 *   `OlModify` drag interaction.
 *
 * Both layers each own ONE `FeatureDataSource` / `OlVectorSource`, fixing the
 * double-source bug in the old `GeometryEditor` where `clearDrawings()` and
 * `addFeatureToMap()` used different sources (Q7).
 */
export class EditionOverlay {
  private readonly ghostLayer: VectorLayer;
  private readonly activeLayer: VectorLayer;
  private drawControl: DrawControl;
  private drawEnd$$?: Subscription;
  private modifyInteraction?: OlModify;

  constructor(
    private map: IgoMap,
    private geometryType: GeometryType
  ) {
    this.ghostLayer = this.createLayer('igo-edition-ghost-layer', Z_GHOST);
    this.activeLayer = this.createLayer('igo-edition-active-layer', Z_ACTIVE);
    this.drawControl = this.createDrawControl();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Renders the snapshot as a faded, non-interactive ghost at the feature's
   * original position (Q3). Call before `enableModify` so the ghost always
   * sits below the active point.
   */
  showGhost(snapshot: Feature): void {
    const projection = this.map.ol.getView().getProjection().getCode();
    const olFeature = featureToOl(snapshot, projection);
    olFeature.setStyle(ghostStyle);
    this.ghostLayer.dataSource.ol.clear();
    this.ghostLayer.dataSource.ol.addFeature(olFeature);
    this.map.layerController.add(this.ghostLayer);
  }

  /**
   * Renders the working copy solid and attaches `OlModify` so the user can
   * drag it. Only the active layer is passed to `OlModify` — the ghost is
   * never interactive (Q3). Falls back to `enableCreate` when the feature
   * has no geometry yet.
   */
  enableModify(working: Feature): void {
    if (!working.geometry) {
      return this.enableCreate(working);
    }
    const projection = this.map.ol.getView().getProjection().getCode();
    const olFeature = featureToOl(working, projection);
    olFeature.setStyle(activeStyle);

    this.activeLayer.dataSource.ol.clear();
    this.activeLayer.dataSource.ol.addFeature(olFeature);
    this.map.layerController.add(this.activeLayer);

    this.attachModify(olFeature, working);
  }

  /**
   * Activates the draw control so the user can place a new point.
   * Used for create mode (no existing geometry). The draw control is wired to
   * the active layer's single source — no second detached source (Q7).
   */
  enableCreate(working: Feature): void {
    this.drawEnd$$ = this.drawControl.end$.subscribe((olGeometry) => {
      this.updateFeatureGeometry(working, olGeometry);
    });
    this.drawControl.setOlMap(this.map.ol, true);
  }

  /**
   * Removes all overlays and detaches interactions.
   * Single teardown path — call on save-success, cancel, or rollback.
   */
  clear(): void {
    this.detachDrawControl();
    this.detachModify();
    this.ghostLayer.dataSource.ol.clear();
    this.activeLayer.dataSource.ol.clear();
    this.map.layerController.remove(this.ghostLayer);
    this.map.layerController.remove(this.activeLayer);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private attachModify(olFeature: OlFeature<Geometry>, working: Feature): void {
    this.detachModify();
    const features = new Collection([olFeature], { unique: true });
    this.modifyInteraction = new OlModify({ features });
    this.map.ol.addInteraction(this.modifyInteraction);
    this.modifyInteraction.on('modifyend', (event) => {
      const modified = event.features.getArray()[0]?.getGeometry();
      if (modified) {
        this.updateFeatureGeometry(working, modified);
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

  private updateFeatureGeometry(feature: Feature, olGeometry: Geometry): void {
    const projection = this.map.ol.getView().getProjection();
    const geometry = new OlGeoJSON().writeGeometryObject(olGeometry, {
      featureProjection: projection,
      dataProjection: 'EPSG:4326'
    }) as unknown as FeatureGeometry;

    feature.projection = 'EPSG:4326';
    feature.geometry = geometry;

    // Re-render the active layer with the updated geometry and re-attach OlModify
    // to the new OlFeature instance (avoids stale references after each drag end).
    this.enableModify(feature);
  }

  private createLayer(id: string, zIndex: number): VectorLayer {
    return new VectorLayer({
      id,
      title: id,
      zIndex,
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
