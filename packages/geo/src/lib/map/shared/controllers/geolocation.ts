import OlMap from 'ol/Map';
import olGeolocation from 'ol/Geolocation';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

import * as olproj from 'ol/proj';
import olFeature from 'ol/Feature';
import { MapController } from './controller';
import { Point, Polygon } from 'ol/geom';
import { fromCircle } from 'ol/geom/Polygon';
import OlCircle from 'ol/geom/Circle';
import { IgoMap } from '../map';
import * as olstyle from 'ol/style';
import { Overlay } from '../../../overlay/shared/overlay';
import { FeatureMotion } from '../../../feature/shared/feature.enums';
import { StorageService } from '@igo2/core';
import { MapViewOptions } from '../map.interface';
import { switchMap } from 'rxjs/operators';
export interface MapGeolocationControllerOptions {
  //  todo keepPositionHistory?: boolean;
  projection: olproj.ProjectionLike
  accuracyThreshold?: number;
  followPosition?: boolean;
  buffer?: GeolocationBuffer;
}
export interface MapGeolocationState {
  position: number[];
  projection: string;
  accuracy: number;
  altitude: number;
  altitudeAccuracy: number;
  heading: number;
  speed: number;
  enableHighAccuracy: boolean;
  timestamp: Date;
}
export interface GeolocationBuffer {
  bufferRadius?: number;
  bufferStroke?: [number, number, number, number];
  bufferFill?: [number, number, number, number];
  showBufferRadius?: boolean;
}


enum GeolocationOverlayType {
  Position = 'position',
  Accuracy = 'accuracy',
  Buffer= 'buffer'
}

/**
 * Controller to handle map view interactions
 */
export class MapGeolocationController extends MapController {

  private subscriptions$$: Subscription[] = [];
  private geolocationOverlay: Overlay;
  private positionFeatureStyle: olstyle.Style | olstyle.Style[] = new olstyle.Style({
    image: new olstyle.Circle({
      radius: 6,
      fill: new olstyle.Fill({
        color: '#3399CC',
      }),
      stroke: new olstyle.Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  })
  private accuracyFeatureStyle: olstyle.Style | olstyle.Style[] = new olstyle.Style({
    stroke: new olstyle.Stroke({
      color: 'rgba(120, 120, 120, 0.4)',
      width: 1,
    }),
    fill: new olstyle.Fill({
      color: 'rgba(120, 120, 120, 0.4)',
    }),
  })

  private geolocation: olGeolocation;

  /**
   * Observable of the current emission interval of the position. In seconds
   */
   public readonly emissionIntervalSeconds$: BehaviorSubject<number> = new BehaviorSubject(5);

  /**
   * Observable of the current position
   */
  public readonly position$ = new BehaviorSubject<MapGeolocationState>(undefined);
  /**
   * Observable of the tracking state
   */
  public readonly tracking$ = new BehaviorSubject<boolean>(undefined);
  /**
   * Observable of the follow position state
   */
  public readonly followPosition$ = new BehaviorSubject<boolean>(undefined);


  /**
   * History of positions
   */
  // private positions: MapGeolocationState[] = [];

  /**
   * Whether the geolocate controller should keep the position history
   */
  /*
  // todo: refine this method
  set keepPositionHistory(value) {
    this._keepPositionHistory = value;
  }
  get keepPositionHistory(): boolean {
    return this._keepPositionHistory;
  }
  private _keepPositionHistory: boolean = this.options && this.options.keepPositionHistory ? this.options.keepPositionHistory : true;
*/
  /**
   * Whether the geolocate should show a buffer around the current position
   */
   set buffer(value: GeolocationBuffer) {
    this._buffer = value;
    this.handleFeatureCreation(this.position$.value);
  }
   get buffer(): GeolocationBuffer {
    return this._buffer;
  }
  private _buffer: GeolocationBuffer = this.options && this.options.buffer ? this.options.buffer : undefined;

  /**
   * Whether the geolocate controller accuracy threshold to store/show the position.
   */
  set accuracyThreshold(value: number) {
    this._accuracyThreshold = value;
    this.handleFeatureCreation(this.position$.value);
  }

  get accuracyThreshold(): number {
    return this._accuracyThreshold;
  }
  private _accuracyThreshold = this.options && this.options.accuracyThreshold ? this.options.accuracyThreshold : 5000;


  /**
   * Whether the activate the geolocation.
   */
  get tracking() {
    return this.geolocation.getTracking();
  }

  set tracking(value: boolean) {
    this.geolocation.setTracking(value || false);
    this.tracking$.next(value);
    if (this.storageService && value !== undefined) {
      this.storageService.set('geolocation.tracking', value);
    }
    if (!value) {
      this.position$.next(undefined);
    }
  }

    /**
   * Whether the activate the view tracking of the current position
   */
  set followPosition(value: boolean) {
    this._followPosition = value;
    this.handleFeatureCreation(this.position$.value);
    this.followPosition$.next(value);
    if (this.storageService && value !== undefined) {
      this.storageService.set('geolocation.followPosition', value);
    }
  }

  get followPosition() {
    return this._followPosition;
  }


  private _followPosition = this.options && this.options.followPosition ? this.options.followPosition : false;


  constructor(
    private map: IgoMap,
    private options?: MapGeolocationControllerOptions,
    private storageService?: StorageService) {
    super();
    this.geolocationOverlay = new Overlay(this.map);
  }

  /**
   * Add or remove this controller to/from a map.
   * @param map OL Map
   */
  setOlMap(olMap: OlMap | undefined) {
    super.setOlMap(olMap);
    this.setupObservers();
  }

  private deleteGeolocationFeatures() {
    this.deleteFeatureByType(GeolocationOverlayType.Position);
    this.deleteFeatureByType(GeolocationOverlayType.Accuracy);
    this.deleteFeatureByType(GeolocationOverlayType.Buffer);
  }

  setupObservers() {
    this.tracking$.subscribe(tracking => {
      if (tracking) {
        this.onPositionChange(true, true);
      } else {
        this.deleteGeolocationFeatures();
      }
    });

    this.geolocation = new olGeolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 600000
      },
      projection: this.options.projection,
    });

    this.subscriptions$$.push(this.emissionIntervalSeconds$
      .pipe(switchMap(value => interval(value * 1000)))
      .subscribe(() => this.onPositionChange(true)));
  }

  public updateGeolocationOptions(options: MapViewOptions) {
    if (!options) { return;}
    // todo maybe a dedicated interface for geolocation should be defined instead of putting these inside the mapviewoptions?
    let tracking = options.geolocate;
    let followPosition = options.alwaysTracking;
    if (this.storageService) {
      const storedTracking = this.storageService.get('geolocation.tracking') as boolean;
      if (storedTracking !== null && storedTracking !== undefined) {
        tracking = storedTracking;
      }

      const storedFollowPosition = this.storageService.get('geolocation.followPosition') as boolean;
      if (storedFollowPosition !== null && storedFollowPosition !== undefined) {
        followPosition = storedFollowPosition;
      }
    }
    this.tracking = tracking;
    this.followPosition = followPosition;
    this.buffer = options.buffer;
  }

  /**
   * Teardown any observers
   */
  teardownObservers() {
    if (this.subscriptions$$.length) {
      this.subscriptions$$.map(s => s.unsubscribe());
    }
    super.teardownObservers();
  }

  /**
   * Clear the position  history
   */
  /*
  // todo
  clearPositionsHistory() {
    this.positions = [];
  }*/

  /**
   * On position change, get the position, show it on the map and record it.
   * @param emitEvent Map event
   */
  private onPositionChange(emitEvent: boolean = false, zoomTo: boolean = false) {
    if (!this.tracking) {
      return;
    }
    const geolocateProperties = this.geolocation.getProperties();

    if (geolocateProperties.accuracy > this.accuracyThreshold) {
      console.warn('Poor geolocation accuracy. No position are stored/shown');
      this.position$.next(undefined);
      return;
    }

    const position: MapGeolocationState = {
      position: geolocateProperties.position,
      projection: this.geolocation.getProjection().getCode(),
      accuracy: geolocateProperties.accuracy,
      altitude: geolocateProperties.altitude,
      altitudeAccuracy: geolocateProperties.altitudeAccuracy,
      heading: geolocateProperties.heading,
      speed: geolocateProperties.speed,
      enableHighAccuracy: geolocateProperties.trackingOptions?.enableHighAccuracy ? true : false,
      timestamp: new Date()
    };
    this.handleFeatureCreation(position, zoomTo);
    if (emitEvent) {
      this.position$.next(position);
      /*if (this.keepPositionHistory === true) {
        // handle position diff to store only true diff;
        this.positions.push(position);
      }*/
    }
  }

  private deleteFeatureByType(type: GeolocationOverlayType) {
    const featureById = this.geolocationOverlay.dataSource.ol.getFeatureById(type);
    if (featureById) {
      this.geolocationOverlay.dataSource.ol.removeFeature(featureById);
    }

  }

  private handleFeatureCreation(position: MapGeolocationState, zoomTo: boolean = false) {
    if (!position || !position.position) {
      return;
    }
    this.deleteGeolocationFeatures();
    const positionGeometry = new Point(position.position);
    const accuracyGeometry = fromCircle(new OlCircle(position.position, position.accuracy || 0));

    const positionFeature = new olFeature<Point>({ geometry: positionGeometry });
    const accuracyFeature = new olFeature<Polygon>({ geometry: accuracyGeometry });

    if (positionGeometry) {
      let motion = this.followPosition ? FeatureMotion.Move : FeatureMotion.None;
      if (zoomTo) {
        motion = FeatureMotion.Zoom;
      }
      positionFeature.setId(GeolocationOverlayType.Position);
      positionFeature.setStyle(this.positionFeatureStyle);
      this.geolocationOverlay.addOlFeature(positionFeature, motion);
      if (accuracyGeometry) {
        accuracyFeature.setId(GeolocationOverlayType.Accuracy);
        accuracyFeature.setStyle(this.accuracyFeatureStyle);
        this.geolocationOverlay.addOlFeature(accuracyFeature, motion);
      }
      if (this.buffer) {
        const bufferFeature = new olFeature(new OlCircle(position.position, this.buffer.bufferRadius));
        const bufferStyle = new olstyle.Style({
          stroke: new olstyle.Stroke({ width: 2, color: this.buffer.bufferStroke }),
          fill: new olstyle.Fill({ color: this.buffer.bufferFill }),
          text: new olstyle.Text({
            textAlign: 'left',
            offsetX: 10,
            offsetY: -10,
            font: '12px Calibri,sans-serif',
            text: this.buffer.showBufferRadius ? `${this.buffer.bufferRadius}m` : '',
            fill: new olstyle.Fill({ color: '#000' }),
            stroke: new olstyle.Stroke({ color: '#fff', width: 3 })
          })
        });
        bufferFeature.setId(GeolocationOverlayType.Buffer);
        bufferFeature.setStyle(bufferStyle);
        this.geolocationOverlay.addOlFeature(bufferFeature, motion);
      }

    }

  }
}
