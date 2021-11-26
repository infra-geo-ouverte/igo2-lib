import olFeature from 'ol/Feature';
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  OnInit
} from '@angular/core';
import { IgoMap } from '../../../map';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import type { default as OlGeometryType } from 'ol/geom/GeometryType';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { GeoJSONGeometry } from '../../../geometry/shared/geometry.interfaces';
import * as olStyle from 'ol/style';
import * as olproj from 'ol/proj';
import OlPoint from 'ol/geom/Point';
import { MeasureLengthUnit } from '../../../measure';
import { MessageService, LanguageService } from '@igo2/core';
import { distinctUntilChanged } from 'rxjs/operators';
import { SpatialType } from '../shared/geometry-predefined-or-draw.enum';
import { FeatureStore } from '../../../feature/shared/store';
import { FeatureForPredefinedOrDrawGeometry } from '../shared/geometry-predefined-or-draw.interface';
import buffer from '@turf/buffer';
import { featureToOl, moveToOlFeatures } from '../../../feature/shared/feature.utils';
import { FEATURE, FeatureMotion } from '../../../feature/shared/feature.enums';
import { Geometry } from 'ol/geom';
import OlGeoJSON from 'ol/format/GeoJSON';
import { FeatureGeometry } from './../../../feature/shared/feature.interfaces';

import { uuid } from '@igo2/utils';
import { createOverlayMarkerStyle } from '../../../overlay/shared/overlay-marker-style.utils';
/**
 * Spatial-Filter-Item (search parameters)
 */
@Component({
  selector: 'igo-geometry-draw',
  templateUrl: './geometry-draw.component.html',
  styleUrls: ['./geometry-draw.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeometryDrawComponent implements OnDestroy, OnInit {

  @Input() minBufferMeters: number = 0;
  @Input() maxBufferMeters: number = 100000;
  @Input() map: IgoMap;
  @Input() currentRegionStore: FeatureStore<FeatureForPredefinedOrDrawGeometry>;
  @Input()
  get activeDrawType(): SpatialType {
    return this._activeDrawType;
  }
  set activeDrawType(type: SpatialType) {
    this._activeDrawType = type;
    this.geometryType = this.geometryTypes[this.geometryTypes.findIndex(geom => geom === this.activeDrawType)];
    this.geometryformControl.reset();
  }
  private _activeDrawType: SpatialType;

  /**
   * Available measure units for the measure type given
   * @internal
   */
  get measureUnits(): string[] {
    return [MeasureLengthUnit.Meters, MeasureLengthUnit.Kilometers];
  }

  // For geometry form field input
  drawGuide$: BehaviorSubject<number> = new BehaviorSubject(null);
  overlayStyle$: BehaviorSubject<olStyle.Style | ((feature, resolution) => olStyle.Style)> = new BehaviorSubject(undefined);
  drawStyle$: BehaviorSubject<olStyle.Style | ((feature, resolution) => olStyle.Style)> = new BehaviorSubject(undefined);

  public spatialType = SpatialType;
  private bufferChanges$$: Subscription;
  private measureUnit$$: Subscription;
  private allValueChanges$$: Subscription;
  private geometryformControlChanges$$: Subscription;
  private metersValidator = [Validators.max(this.maxBufferMeters), Validators.min(this.minBufferMeters), Validators.required];
  private kilometersValidator = [
    Validators.max(this.maxBufferMeters / 1000),
    Validators.min(this.minBufferMeters / 1000), Validators.required];

  public geometryformControl = new FormControl();
  public bufferOrRadiusFormControl = new FormControl(0, this.metersValidator);

  public geometryType: typeof OlGeometryType | string;
  public geometryTypes: string[] = ['Point', 'Line', 'Polygon'];

  public drawControlIsActive = true;
  public freehandDrawIsActive = false;
  public drawStyle: olStyle.Style | ((feature, resolution) => olStyle.Style) = () => {
    return new olStyle.Style({
      image: new olStyle.Circle({
        radius: 8,
        stroke: new olStyle.Stroke({
          width: 2,
          color: 'rgba(0, 153, 255)'
        }),
        fill: new olStyle.Fill({
          color: 'rgba(0, 153, 255, 0.2)'
        })
      }),
      stroke: new olStyle.Stroke({
        color: [0, 153, 255].concat([1]),
        width: 2
      }),
      fill: new olStyle.Fill({
        color: [0, 153, 255].concat([0.2])
      })
    });
  };

  public overlayStyle: olStyle.Style | ((feature, resolution) => olStyle.Style) = (feature: olFeature<OlGeometry>, resolution: number) => {
    const geom = feature.getGeometry() as OlPoint;
    const coordinates = olproj.transform(geom.getCoordinates(), this.map.projection, 'EPSG:4326');
    const factor = this.measureUnit$.value === MeasureLengthUnit.Meters ? 1 : 1000;
    if (this.bufferOrRadiusFormControl.value === 0 && this.activeDrawType === SpatialType.Point) {
      return createOverlayMarkerStyle({markerColor: [0, 153, 255]});
    }
    return new olStyle.Style({
      image: new olStyle.Circle({
        radius: this.bufferOrRadiusFormControl.value * factor / (Math.cos((Math.PI / 180) * coordinates[1])) / resolution, // Latitude correction
        stroke: new olStyle.Stroke({
          width: 2,
          color: 'rgba(0, 153, 255)'
        }),
        fill: new olStyle.Fill({
          color: 'rgba(0, 153, 255, 0.2)'
        })
      }),
      stroke: new olStyle.Stroke({
        color: [0, 153, 255].concat([1]),
        width: 2
      }),
      fill: new olStyle.Fill({
        color: [0, 153, 255].concat([0.2])
      })
    });
  }
  public buffer: number = 0;
  public measureUnit$: BehaviorSubject<MeasureLengthUnit> = new BehaviorSubject(MeasureLengthUnit.Meters);
  public zoneWithBuffer;


  constructor(
    private cdRef: ChangeDetectorRef,
    private messageService: MessageService,
    private languageService: LanguageService) { }

  ngOnInit() {
    this.drawStyle$.next(this.drawStyle);
    this.overlayStyle$.next(this.overlayStyle);

    this.drawGuide$.next(null);
    this.allValueChanges$$ = combineLatest([
      this.geometryformControl.valueChanges,
      this.bufferOrRadiusFormControl.valueChanges,
      this.measureUnit$])
      .subscribe((bunch: [
        geom: GeoJSONGeometry,
        bufferValue: number,
        unit: MeasureLengthUnit
      ]) => {
        console.log(bunch);
        const geometry = bunch[0];
        let bufferValue = bunch[1];
        const unit: MeasureLengthUnit = bunch[2];
        const factor = unit === MeasureLengthUnit.Meters ? 1 : 1000;
        if ((geometry as any)?.radius) {
          this.bufferOrRadiusFormControl.setValue((geometry as any).radius / factor, { emitEvent: false });
          delete (geometry as any).radius;
          this.geometryformControl.setValue(geometry, { emitEvent: true });
          return;
        }
        if (this.bufferOrRadiusFormControl.errors) {
          const deltaMin = Math.abs(this.bufferOrRadiusFormControl.value / factor - this.minBufferMeters);
          const deltaMax = Math.abs(this.bufferOrRadiusFormControl.value / factor - this.maxBufferMeters);
          this.messageService.alert(this.languageService.translate.instant('igo.geo.spatialFilter.bufferAlert'),
            this.languageService.translate.instant('igo.geo.spatialFilter.warning'));
          const bufferToApply = (deltaMax < deltaMin ? this.maxBufferMeters : this.minBufferMeters) / factor;
          this.bufferOrRadiusFormControl.setValue(bufferToApply, { emitEvent: true });
          return;
        }
        const id = uuid();

        this.setDrawGuide();
        if (geometry) {
          const feature: FeatureForPredefinedOrDrawGeometry = {
            type: FEATURE,
            geometry,
            projection: 'EPSG:4326',
            properties: {
              id: id,
              title: id,
              _predefinedType: this.activeDrawType,
              _buffer: this.bufferOrRadiusFormControl.value
            },
            meta: {
              id: id
            },
            ol: undefined
          };
          this.processZone(feature);
        }
      });

    this.monitorUnits();
  }

  setDrawGuide() {
    if (this.isPoint()) {
      this.drawGuide$.next(this.bufferOrRadiusFormControl.value);
    }
    else {
      this.drawGuide$.next(null);
    }
  }
  onDrawTypeChange(spatialType: SpatialType) {
    this.currentRegionStore.clear();
    this.currentRegionStore.clearLayer();
    this.activeDrawType = spatialType;
  }

  private monitorUnits() {
    this.measureUnit$$ = this.measureUnit$
      .pipe(distinctUntilChanged())
      .subscribe((measureUnit) => {
        if (measureUnit === MeasureLengthUnit.Meters) {
          this.bufferOrRadiusFormControl.setValidators(this.metersValidator);
        } else {
          this.bufferOrRadiusFormControl.setValidators(this.kilometersValidator);
        }
        measureUnit === MeasureLengthUnit.Meters ?
          this.bufferOrRadiusFormControl.setValue(this.bufferOrRadiusFormControl.value * 1000) :
          this.bufferOrRadiusFormControl.setValue(this.bufferOrRadiusFormControl.value / 1000);

      });
  }

  /**
   * Unsubscribe to the value stream
   * @internal
   */
  ngOnDestroy() {
    this.cdRef.detach();
    this.measureUnit$$.unsubscribe();
    this.allValueChanges$$.unsubscribe();
  }

  /**
   * Set the measure unit
   * @internal
   */
  onMeasureUnitChange(unit: MeasureLengthUnit) {
    this.measureUnit$.next(unit);
  }

  isPredefined() {
    return this.activeDrawType === SpatialType.Predefined;
  }

  isPolygon() {
    return this.activeDrawType === SpatialType.Polygon;
  }

  isPolyline() {
    return this.activeDrawType === SpatialType.Line;
  }

  isPoint() {
    return this.activeDrawType === SpatialType.Point;
  }

  onDrawControlChange() {
    this.drawControlIsActive = !this.drawControlIsActive;
  }

  onfreehandControlChange() {
    this.freehandDrawIsActive = !this.freehandDrawIsActive;
    //this.freehandControl.emit(this.freehandDrawIsActive);
  }

  clearDrawZone() {
    this.geometryformControl.reset();
    this.bufferOrRadiusFormControl.setValue(0);
    this.buffer = 0;
  }


  private processZone(feature: FeatureForPredefinedOrDrawGeometry) {
    if (feature && this.activeDrawType) {
      this.bufferOrRadiusFormControl.enable({ emitEvent: false });
      feature.properties._buffer = this.bufferOrRadiusFormControl.value;
      let currentZone = feature;
      if (feature.properties._buffer && feature.properties._buffer !== 0) {
        const bufferedZone = buffer(feature.geometry, feature.properties._buffer, { units: this.measureUnit$.value });
        currentZone.geometry = bufferedZone.geometry;
      }
      const myOlFeature: olFeature<Geometry> = featureToOl(currentZone, this.map.projection);

      const geojsonGeom = new OlGeoJSON().writeGeometryObject(myOlFeature.getGeometry(), {
        featureProjection: this.map.projection,
        dataProjection: this.map.projection
      }) as FeatureGeometry;

      const featureId = `${myOlFeature.getId()}.${this.bufferOrRadiusFormControl.value}`;
      const zoneFeature: FeatureForPredefinedOrDrawGeometry = {
        type: FEATURE,
        geometry: geojsonGeom,
        projection: this.map.projection,
        properties: {
          id: featureId,
          title: myOlFeature.get('title'),
          _predefinedType: this.activeDrawType,
          _buffer: this.bufferOrRadiusFormControl.value
        },
        meta: {
          id: featureId
        },
        ol: myOlFeature
      };
      this.currentRegionStore.load([zoneFeature]);
      moveToOlFeatures(this.map, [myOlFeature], FeatureMotion.None);
    }
  }
}
