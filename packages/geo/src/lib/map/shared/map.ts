import { ConfigService } from '@igo2/core/config';
import { StorageService } from '@igo2/core/storage';
import { SubjectStatus } from '@igo2/utils';

import olMap from 'ol/Map';
import olView, { ViewOptions } from 'ol/View';
import olControlAttribution from 'ol/control/Attribution';
import olControlScaleLine from 'ol/control/ScaleLine';
import * as olinteraction from 'ol/interaction';
import * as olproj from 'ol/proj';
import OlProjection from 'ol/proj/Projection';
import * as olproj4 from 'ol/proj/proj4';
import { getUid } from 'ol/util';

import proj4 from 'proj4';
import { BehaviorSubject, Subject } from 'rxjs';

import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { LayerController } from '../../layer';
import type { AnyLayer, Layer } from '../../layer/shared/layers';
import { Overlay } from '../../overlay/shared/overlay';
import { LayerWatcher, LayerWatcherChange } from '../utils/layer-watcher';
import { MapGeolocationController } from './controllers/geolocation';
import { MapViewController } from './controllers/view';
import type { MapBase } from './map.abstract';
import {
  MapAttributionOptions,
  MapControlsOptions,
  MapExtent,
  MapOptions,
  MapScaleLineOptions,
  MapViewOptions
} from './map.interface';

export class IgoMap implements MapBase {
  public ol: olMap;
  public forcedOffline$ = new BehaviorSubject<boolean>(false);
  public layersAddedByClick$ = new BehaviorSubject<AnyLayer[]>(undefined);
  public status$: Subject<SubjectStatus>;
  public propertyChange$: Subject<LayerWatcherChange>;
  public overlay: Overlay;
  public queryResultsOverlay: Overlay;
  public searchResultsOverlay: Overlay;
  public viewController: MapViewController;
  public layerController: LayerController;
  public geolocationController: MapGeolocationController;
  public swipeEnabled$ = new BehaviorSubject<boolean>(false);
  public mapCenter$ = new BehaviorSubject<boolean>(false);
  public selectedFeatures$ = new BehaviorSubject<Layer[]>(null);

  public bufferDataSource: FeatureDataSource;

  public layerWatcher: LayerWatcher;
  readonly options: MapOptions;
  private mapViewOptions: MapViewOptions;
  private defaultOptions: Partial<MapOptions> = {
    controls: { attribution: false }
  };

  /** @deprecated use projectionCode */
  get projection(): string {
    return this.projectionCode;
  }

  get viewProjection(): olproj.Projection {
    return this.viewController.getOlProjection();
  }

  get projectionCode(): string {
    return this.viewProjection.getCode();
  }

  constructor(
    options?: MapOptions,
    private storageService?: StorageService,
    private configService?: ConfigService
  ) {
    this.options = Object.assign({}, this.defaultOptions, options);
    this.layerController = new LayerController(this, []);
    this.layerWatcher = new LayerWatcher();
    this.status$ = this.layerWatcher.status$;
    this.propertyChange$ = this.layerWatcher.propertyChange$;
    olproj4.register(proj4);
    this.init();
  }

  init() {
    const controls = [];
    if (this.options.controls) {
      if (this.options.controls.attribution) {
        const attributionOpt = (
          this.options.controls.attribution === true
            ? {}
            : this.options.controls.attribution
        ) as MapAttributionOptions;
        controls.push(new olControlAttribution(attributionOpt));
      }
      if (this.options.controls.scaleLine) {
        const scaleLineOpt = (
          this.options.controls.scaleLine === true
            ? {}
            : this.options.controls.scaleLine
        ) as MapScaleLineOptions;
        controls.push(new olControlScaleLine(scaleLineOpt));
      }
    }
    let interactions = {};
    if (this.options.interactions === false) {
      interactions = {
        altShiftDragRotate: false,
        doubleClickZoom: false,
        keyboard: false,
        mouseWheelZoom: false,
        shiftDragZoom: false,
        dragPan: false,
        pinchRotate: false,
        pinchZoom: false
      };
    }

    this.ol = new olMap({
      interactions: olinteraction.defaults(interactions),
      controls
    });

    this.setView(this.options.view || {});
    this.viewController = new MapViewController({
      stateHistory: true
    });
    this.viewController.setOlMap(this.ol);
    this.overlay = new Overlay(this);
    this.queryResultsOverlay = new Overlay(this);
    this.searchResultsOverlay = new Overlay(this);
    this.ol.once('rendercomplete', () => {
      this.geolocationController = new MapGeolocationController(
        this,
        {
          projection: this.viewController.getOlProjection()
        },
        this.storageService,
        this.configService
      );
      this.geolocationController.setOlMap(this.ol);
      if (this.geolocationController) {
        this.geolocationController.updateGeolocationOptions(
          this.mapViewOptions
        );
      }
      this.viewController.monitorRotation();
    });
  }

  setTarget(id: string) {
    this.ol.setTarget(id);
    if (id !== undefined) {
      this.layerWatcher.subscribe(() => void 1, null);
    } else {
      this.layerWatcher.unsubscribe();
    }
  }

  updateView(options: MapViewOptions) {
    const currentView = this.ol.getView();
    const viewOptions: MapViewOptions = {
      ...currentView.getProperties(),
      ...options
    };

    if (options.zoom && options.resolution == null) {
      viewOptions.resolution = undefined;
    }

    this.setView(viewOptions);
    if (options.maxZoomOnExtent) {
      this.viewController.maxZoomOnExtent = options.maxZoomOnExtent;
    }
    this.mapViewOptions = options;
  }

  /**
   * Set the map view
   * @param options Map view options
   */
  setView(options: MapViewOptions) {
    if (this.viewController !== undefined) {
      this.viewController.clearStateHistory();
    }

    const viewOptions: ViewOptions = { constrainResolution: true, ...options };
    if (options.center) {
      viewOptions.center = olproj.fromLonLat(
        options.center,
        options.projection
      );
    }

    this.ol.setView(new olView(viewOptions));

    if (options.maxLayerZoomExtent) {
      this.viewController.maxLayerZoomExtent = options.maxLayerZoomExtent;
    }
  }

  updateControls(value: MapControlsOptions) {
    if (value === undefined) {
      return;
    }

    const controls = [];
    if (value.attribution) {
      const attributionOpt = (
        value.attribution === true ? {} : value.attribution
      ) as MapAttributionOptions;
      controls.push(new olControlAttribution(attributionOpt));
    }
    if (value.scaleLine) {
      const scaleLineOpt = (
        value.scaleLine === true ? {} : value.scaleLine
      ) as MapScaleLineOptions;
      controls.push(new olControlScaleLine(scaleLineOpt));
    }

    const currentControls = Object.assign([], this.ol.getControls().getArray());
    currentControls.forEach((control) => {
      this.ol.removeControl(control);
    });
    controls.forEach((control) => {
      this.ol.addControl(control);
    });
  }

  /**
   * @deprecated
   * TODO: Move to ViewController and update every place it's used
   */
  getCenter(projection?: string | OlProjection): [number, number] {
    return this.viewController.getCenter(projection);
  }

  /**
   * @deprecated
   * TODO: Move to ViewController and update every place it's used
   */
  getExtent(projection?: string | OlProjection): MapExtent {
    return this.viewController.getExtent(projection);
  }
  /**
   * @deprecated
   * TODO: Move to ViewController and update every place it's used
   */
  getZoom(): number {
    return this.viewController.getZoom();
  }

  /** @deprecated find a way to remove this method. For now we discourage to use it until we find the way to remove it */
  getLayerByOlUId(olUId: string): AnyLayer {
    return this.layerController.all.find(
      (layer) => getUid(layer.ol) && getUid(layer.ol) === olUId
    );
  }
}
