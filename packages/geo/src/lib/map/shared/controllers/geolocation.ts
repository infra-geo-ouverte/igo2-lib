import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import OlMap from 'ol/Map';
import olGeolocation from 'ol/Geolocation';
import Geometry from 'ol/geom/Geometry';
import * as olproj from 'ol/proj';
import olFeature from 'ol/Feature';
import { MapController } from './controller';
import { Point, Polygon } from 'ol/geom';
import { fromCircle } from 'ol/geom/Polygon';
import * as olSphere from 'ol/sphere';
import OlCircle from 'ol/geom/Circle';
import * as olstyle from 'ol/style';
import { StorageService, ConfigService } from '@igo2/core';
import { Overlay } from '../../../overlay/shared/overlay';
import { FeatureMotion } from '../../../feature/shared/feature.enums';
import { MapViewOptions } from '../map.interface';
import { MapBase } from '../map.abstract';
import {
  computeOlFeaturesExtent,
  featuresAreOutOfView,
  hideOlFeature,
  moveToOlFeatures
} from '../../../feature/shared/feature.utils';
import {
  GeolocationBuffer,
  GeolocationOverlayType,
  MapGeolocationControllerOptions,
  MapGeolocationState
} from './geolocation.interface';

/**
 * Controller to handle map view interactions
 */
export class MapGeolocationController extends MapController {
  private arrowRotation: number;
  private subscriptions$$: Subscription[] = [];
  private geolocationOverlay: Overlay;
  private positionFeatureStyle: olstyle.Style | olstyle.Style[] =
    new olstyle.Style({
      image: new olstyle.Circle({
        radius: 6,
        fill: new olstyle.Fill({
          color: '#3399CC'
        }),
        stroke: new olstyle.Stroke({
          color: '#fff',
          width: 2
        })
      })
    });
  private accuracyFeatureStyle: olstyle.Style | olstyle.Style[] =
    new olstyle.Style({
      stroke: new olstyle.Stroke({
        color: 'rgba(120, 120, 120, 0.4)',
        width: 1
      }),
      fill: new olstyle.Fill({
        color: 'rgba(120, 120, 120, 0.4)'
      })
    });

  private get bufferStyle(): olstyle.Style {
    return new olstyle.Style({
      stroke: new olstyle.Stroke({ width: 2, color: this.buffer.bufferStroke }),
      fill: new olstyle.Fill({ color: this.buffer.bufferFill }),
      text: new olstyle.Text({
        textAlign: 'left',
        offsetX: 10,
        offsetY: -10,
        font: '12px Calibri,sans-serif',
        text: this.buffer.showBufferRadius
          ? `${this.buffer.bufferRadius}m`
          : '',
        fill: new olstyle.Fill({ color: '#000' }),
        stroke: new olstyle.Stroke({ color: '#fff', width: 3 })
      })
    });
  }

  private get arrowStyle(): olstyle.Style {
    return new olstyle.Style({
      image: new olstyle.RegularShape({
        radius: 5.5,
        fill: new olstyle.Fill({
          color: 'rgba(0, 132, 202)'
        }),
        stroke: new olstyle.Stroke({
          color: '#fff',
          width: 1.5
        }),
        points: 3,
        displacement: [0, 9],
        rotation: this.arrowRotation,
        rotateWithView: true
      })
    });
  }

  private geolocation: olGeolocation;

  /**
   * Observable of the current emission interval of the position. In seconds
   */
  public readonly emissionIntervalSeconds$: BehaviorSubject<number> =
    new BehaviorSubject(5);

  /**
   * Observable of the current position
   */
  public readonly position$ = new BehaviorSubject<MapGeolocationState>(
    undefined
  );
  /**
   * Observable of the tracking state
   */
  public readonly tracking$ = new BehaviorSubject<boolean>(undefined);
  /**
   * Observable of the follow position state
   */
  public readonly followPosition$ = new BehaviorSubject<boolean>(undefined);

  private lastPosition: { coordinates: number[]; dateTime: Date };

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
  private _buffer: GeolocationBuffer;

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
  private _accuracyThreshold;

  get olGeolocation() {
    return this.geolocation;
  }

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
    this.followPosition$.next(value);
    if (this.configService?.getConfig('geolocate.followPosition') === false) {
      this._followPosition = false;
      this.followPosition$.next(false);
    }
    this.handleFeatureCreation(this.position$.value);
    if (this.storageService && value !== undefined) {
      this.storageService.set('geolocation.followPosition', value);
    }
  }

  get followPosition() {
    return this._followPosition;
  }

  private _followPosition;

  constructor(
    private map: MapBase,
    private options?: MapGeolocationControllerOptions,
    private storageService?: StorageService,
    private configService?: ConfigService
  ) {
    super();
    this.geolocationOverlay = new Overlay(this.map);
    this._followPosition =
      this.options && this.options.followPosition
        ? this.options.followPosition
        : false;

    this._buffer =
      this.options && this.options.buffer ? this.options.buffer : undefined;
    this._accuracyThreshold =
      this.options && this.options.accuracyThreshold
        ? this.options.accuracyThreshold
        : 5000;
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
    this.deleteFeatureByType(GeolocationOverlayType.PositionDirection);
    this.deleteFeatureByType(GeolocationOverlayType.Accuracy);
    this.deleteFeatureByType(GeolocationOverlayType.Buffer);
  }

  setupObservers() {
    this.tracking$.subscribe((tracking) => {
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
      projection: this.options.projection
    });
    let tracking = false;
    this.subscriptions$$.push(
      this.emissionIntervalSeconds$
        .pipe(switchMap((value) => interval(value * 1000)))
        .subscribe(() => {
          if (tracking === this.tracking) {
            this.onPositionChange(true);
          } else {
            tracking = this.tracking;
            this.onPositionChange(true, true);
          }
        })
    );

    this.geolocation.on('change', (evt) => {
      this.onPositionChange(false, false);
    });
  }

  updateArrowFeatureOrientation(position: MapGeolocationState) {
    const position4326 = olproj.transform(
      position.position,
      position.projection,
      'EPSG:4326'
    );
    if (!this.lastPosition) {
      this.lastPosition = { coordinates: position4326, dateTime: new Date() };
      return;
    }
    const arrowFeature = this.getFeatureByType(
      GeolocationOverlayType.PositionDirection
    );
    const isMoving =
      position?.speed > 1.25 &&
      this.distanceBetweenPoints(this.lastPosition.coordinates, position4326) >
        0.003;
    if (position.accuracy <= this.accuracyThreshold && isMoving) {
      // Calculate the heading using current position and last recorded
      // because ol heading not returning right value
      var dx = position4326[1] - this.lastPosition.coordinates[1];
      var dy = position4326[0] - this.lastPosition.coordinates[0];
      var theta = Math.atan2(dy, dx);
      if (theta < 0) theta = 2 * Math.PI + theta;
      this.arrowRotation = theta;
      if (arrowFeature) {
        arrowFeature.setStyle(this.arrowStyle);
      }
      this.lastPosition = { coordinates: position4326, dateTime: new Date() };
    } else {
      if (
        arrowFeature &&
        new Date().getTime() - this.lastPosition.dateTime.getTime() > 3000
      )
        hideOlFeature(arrowFeature);
    }
  }

  /**
   * @returns distance in km between coord1 and coord2
   */
  private distanceBetweenPoints(coord1: number[], coord2: number[]): number {
    return olSphere.getDistance(coord1, coord2) / 1000;
  }

  public addOnChangedListener(event: (geo: olGeolocation) => any) {
    let listener = () => {
      event(this.geolocation);
    };
    this.geolocation.on('change', listener);
    return listener;
  }

  public deleteChangedListener(event: () => any) {
    this.geolocation.un('change', event);
  }

  public updateGeolocationOptions(options: MapViewOptions) {
    if (!options) {
      return;
    }
    // todo maybe a dedicated interface for geolocation should be defined instead of putting these inside the mapviewoptions?
    let tracking = options.geolocate;
    let followPosition = options.alwaysTracking;
    if (this.storageService) {
      const storedTracking = this.storageService.get(
        'geolocation.tracking'
      ) as boolean;
      if (storedTracking !== null && storedTracking !== undefined) {
        tracking = storedTracking;
      }

      const storedFollowPosition = this.storageService.get(
        'geolocation.followPosition'
      ) as boolean;
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
      this.subscriptions$$.map((s) => s.unsubscribe());
    }
    super.teardownObservers();
  }

  /**
   * On position change, get the position, show it on the map and record it.
   * @param emitEvent Map event
   */
  private onPositionChange(
    emitEvent: boolean = false,
    zoomTo: boolean = false
  ) {
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
      enableHighAccuracy: geolocateProperties.trackingOptions
        ?.enableHighAccuracy
        ? true
        : false,
      timestamp: new Date()
    };
    this.handleFeatureCreation(position);
    this.handleViewFromFeatures(position, zoomTo);
    if (emitEvent) {
      this.position$.next(position);
    }
  }

  private getFeatureByType(type: GeolocationOverlayType): olFeature<Geometry> {
    return this.geolocationOverlay.dataSource.ol.getFeatureById(type);
  }

  private deleteFeatureByType(type: GeolocationOverlayType) {
    const featureById =
      this.geolocationOverlay?.dataSource.ol.getFeatureById(type);
    if (featureById) {
      this.geolocationOverlay.dataSource.ol.removeFeature(featureById);
    }
  }

  private handleFeatureCreation(position: MapGeolocationState) {
    if (!position || !position.position) {
      return;
    }
    const positionGeometry = new Point(position.position);
    const accuracyGeometry = fromCircle(
      new OlCircle(position.position, position.accuracy || 0)
    );
    let positionFeature = this.getFeatureByType(
      GeolocationOverlayType.Position
    );
    let positionFeatureArrow = this.getFeatureByType(
      GeolocationOverlayType.PositionDirection
    );
    let accuracyFeature = this.getFeatureByType(
      GeolocationOverlayType.Accuracy
    );
    const positionFeatureExists = positionFeature ? true : false;
    const positionFeatureArrowExists = positionFeatureArrow ? true : false;
    const accuracyFeatureExists = accuracyFeature ? true : false;
    if (!positionFeatureArrowExists) {
      positionFeatureArrow = new olFeature<Point>({
        geometry: positionGeometry
      });
      positionFeatureArrow.setId(GeolocationOverlayType.PositionDirection);
      hideOlFeature(positionFeatureArrow);
      }
    if (!positionFeatureExists) {
      positionFeature = new olFeature<Point>({ geometry: positionGeometry });
      positionFeature.setId(GeolocationOverlayType.Position);
      positionFeature.setStyle(this.positionFeatureStyle);
    }
    if (!accuracyFeatureExists) {
      accuracyFeature = new olFeature<Polygon>({ geometry: accuracyGeometry });
        accuracyFeature.setId(GeolocationOverlayType.Accuracy);
        accuracyFeature.setStyle(this.accuracyFeatureStyle);
      }

    if (positionGeometry) {
      positionFeatureExists
        ? positionFeature.setGeometry(positionGeometry)
        : this.geolocationOverlay.addOlFeature(
            positionFeature,
            FeatureMotion.None
          );
      positionFeatureArrowExists
        ? positionFeatureArrow.setGeometry(positionGeometry)
        : this.geolocationOverlay.addOlFeature(
            positionFeatureArrow,
            FeatureMotion.None
          );
      this.updateArrowFeatureOrientation(position);
      accuracyFeatureExists
        ? accuracyFeature.setGeometry(accuracyGeometry)
        : this.geolocationOverlay.addOlFeature(
            accuracyFeature,
            FeatureMotion.None
          );

      if (this.buffer) {
        let bufferFeature = this.getFeatureByType(
          GeolocationOverlayType.Buffer
        );
        const bufferFeatureExists = bufferFeature ? true : false;
        const bufferGeometry = new OlCircle(
          position.position,
          this.buffer.bufferRadius
        );
        if (!bufferFeatureExists) {
          bufferFeature = new olFeature(bufferGeometry);
        bufferFeature.setId(GeolocationOverlayType.Buffer);
          bufferFeature.setStyle(this.positionFeatureStyle);
      }
        bufferFeature.setStyle(this.bufferStyle);
        bufferFeatureExists
          ? bufferFeature.setGeometry(bufferGeometry)
          : this.geolocationOverlay.addOlFeature(
              bufferFeature,
              FeatureMotion.None
            );
      }
    }
  }
  handleViewFromFeatures(
    position: MapGeolocationState,
    zoomTo: boolean = false
  ) {
    let positionFeature = this.getFeatureByType(
      GeolocationOverlayType.Position
    );
    let positionFeatureArrow = this.getFeatureByType(
      GeolocationOverlayType.PositionDirection
    );
    let accuracyFeature = this.getFeatureByType(
      GeolocationOverlayType.Accuracy
    );
    let bufferFeature = this.getFeatureByType(GeolocationOverlayType.Buffer);
    const features = [
      positionFeature,
      positionFeatureArrow,
      accuracyFeature,
      bufferFeature
    ].filter((f) => f);
    if (features.length > 0) {
      const featuresExtent = computeOlFeaturesExtent(
        features,
        this.map.viewProjection
      );
      const edgeRatios =
        position?.speed > 12.5
          ? [0.25, 0.25, 0.25, 0.25]
          : [0.15, 0.1, 0.1, 0.1];
      const areOutOfView = featuresAreOutOfView(
        this.map.getExtent(),
        featuresExtent,
        edgeRatios
      );
      let motion =
        this.followPosition && areOutOfView
          ? FeatureMotion.Move
          : FeatureMotion.None;
      if (zoomTo) {
        motion = FeatureMotion.Zoom;
      }
      motion !== FeatureMotion.None
        ? moveToOlFeatures(this.map.viewController, features, motion)
        : undefined;
    }
  }
}
