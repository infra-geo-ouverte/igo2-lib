import { SubjectStatus } from '@igo2/utils';

import { Layer as OlLayer } from 'ol/layer';
import { Projection } from 'ol/proj';
import { Source } from 'ol/source';

import { Map } from 'ol';
import { BehaviorSubject, Subject } from 'rxjs';

import { FeatureDataSource } from '../../datasource/shared/datasources';
import { LayerController } from '../../layer/shared/layer-controller';
import type { AnyLayer } from '../../layer/shared/layers/any-layer';
import type { Layer } from '../../layer/shared/layers/layer';
import { Overlay } from '../../overlay/shared/overlay';
import {
  MapGeolocationController,
  MapViewController
} from '../shared/controllers';
import {
  MapControlsOptions,
  MapExtent,
  MapViewOptions
} from '../shared/map.interface';
import { LayerWatcher, LayerWatcherChange } from '../utils';

export abstract class MapBase {
  ol: Map;
  forcedOffline$: BehaviorSubject<boolean>;
  layersAddedByClick$: BehaviorSubject<AnyLayer[]>;
  status$: Subject<SubjectStatus>;
  propertyChange$: Subject<LayerWatcherChange>;
  overlay: Overlay;
  queryResultsOverlay: Overlay;
  searchResultsOverlay: Overlay;
  viewController: MapViewController;
  geolocationController: MapGeolocationController;
  swipeEnabled$: BehaviorSubject<boolean>;
  mapCenter$: BehaviorSubject<boolean>;
  selectedFeatures$: BehaviorSubject<Layer[]>;
  bufferDataSource: FeatureDataSource;
  layerWatcher: LayerWatcher;

  // Getter
  layerController: LayerController;
  projection: string;
  viewProjection: Projection;
  projectionCode: string;

  abstract init(): void;
  abstract setTarget(id: string): void;
  abstract updateView(options: MapViewOptions): void;
  abstract setView(options: MapViewOptions): void;
  abstract updateControls(value: MapControlsOptions): void;
  abstract getCenter(projection?: string | Projection): [number, number];
  abstract getExtent(projection?: string | Projection): MapExtent;
  abstract getZoom(): number;
  abstract changeBaseLayer(baseLayer: Layer): void;
  abstract getBaseLayers(): AnyLayer[];
  abstract getLayerById(id: string): AnyLayer | undefined;
  abstract getLayerByAlias(alias: string): AnyLayer;
  abstract getLayerByOlUId(olUId: string): AnyLayer;
  abstract getLayerByOlLayer(olLayer: OlLayer<Source>): AnyLayer;
  /** @deprecated */
  abstract addLayer(...layers: AnyLayer[]): void;
  /** @deprecated */
  abstract removeLayer(...layers: AnyLayer[]): void;
  /** @deprecated */
  abstract removeAllLayers(): void;
}
