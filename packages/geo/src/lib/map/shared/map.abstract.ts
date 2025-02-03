import { SubjectStatus } from '@igo2/utils';

import { Projection } from 'ol/proj';

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
  MapOptions,
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
  readonly options: MapOptions;

  // Getter
  layerController: LayerController;
  projection: string;
  viewProjection: Projection;
  projectionCode: string;

  abstract setTarget(id: string): void;
  abstract updateView(options: MapViewOptions): void;
  abstract setView(options: MapViewOptions): void;
  abstract updateControls(value: MapControlsOptions): void;
  abstract getCenter(projection?: string | Projection): [number, number];
  abstract getExtent(projection?: string | Projection): MapExtent;
  abstract getZoom(): number;
  /** @deprecated find a way to remove this method. For now we discourage to use it until we find the way to remove it */
  abstract getLayerByOlUId(olUId: string): AnyLayer;
}
