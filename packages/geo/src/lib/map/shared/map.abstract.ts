import { Layer } from '../../layer';
import { Projection } from 'ol/proj';
import { Source } from 'ol/source';
import { Layer as OlLayer } from 'ol/layer';
import { Map } from 'ol';
import { BehaviorSubject, Subject } from 'rxjs';
import { ObjectEvent } from 'ol/Object';
import { SubjectStatus } from '@igo2/utils';
import {
  MapControlsOptions,
  MapExtent,
  MapGeolocationController,
  MapViewController,
  MapViewOptions
} from '../shared';
import { FeatureDataSource } from '../../datasource';
import { Overlay } from '../../overlay';

export abstract class MapBase {
  ol: Map;
  forcedOffline$: BehaviorSubject<boolean>;
  layers$: BehaviorSubject<Layer[]>;
  layersAddedByClick$: BehaviorSubject<Layer[]>;
  status$: Subject<SubjectStatus>;
  propertyChange$: Subject<{ event: ObjectEvent; layer: Layer }>;
  overlay: Overlay;
  queryResultsOverlay: Overlay;
  searchResultsOverlay: Overlay;
  viewController: MapViewController;
  geolocationController: MapGeolocationController;
  swipeEnabled$: BehaviorSubject<boolean>;
  mapCenter$: BehaviorSubject<boolean>;
  selectedFeatures$: BehaviorSubject<Layer[]>;
  bufferDataSource: FeatureDataSource;

  // Getter
  layers: Layer[];
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
  abstract getBaseLayers(): Layer[];
  abstract getLayerById(id: string): Layer | undefined;
  abstract getLayerByAlias(alias: string): Layer;
  abstract getLayerByOlUId(olUId: string): Layer;
  abstract getLayerByOlLayer(olLayer: OlLayer<Source>): Layer;
  abstract addLayer(layer: Layer, push: boolean): void;
  abstract addLayers(layers: Layer[], push?: boolean): void;
  abstract removeLayer(layer: Layer): void;
  abstract removeLayers(layers: Layer[]): void;
  abstract removeAllLayers(): void;
  abstract raiseLayer(layer: Layer): void;
  abstract raiseLayers(layers: Layer[]): void;
  abstract lowerLayer(layer: Layer): void;
  abstract lowerLayers(layers: Layer[]): void;
  abstract moveLayer(layer: Layer, from: number, to: number): void;
}