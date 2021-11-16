import OlFeature from 'ol/Feature';
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  OnInit
} from '@angular/core';
import { IgoMap } from '../../../map';
import { Feature } from './../../../feature/shared/feature.interfaces';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import type { default as OlGeometryType } from 'ol/geom/GeometryType';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { GeoJSONGeometry } from '../../../geometry/shared/geometry.interfaces';
import * as olStyle from 'ol/style';
import * as olproj from 'ol/proj';
import OlPoint from 'ol/geom/Point';
import { MeasureLengthUnit } from '../../../measure';
import { EntityStore } from '@igo2/common';
import { MessageService, LanguageService } from '@igo2/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SpatialType } from '../shared/geometry-predefined-or-draw.enum';

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
  @Input() store: EntityStore<Feature>;
  @Input()
  get type(): SpatialType {
    return this._type;
  }
  set type(type: SpatialType) {
    this._type = type;
    const index = this.geometryTypes.findIndex(geom => geom === this.type);
    this.geometryType = this.geometryTypes[index];
    this.geometryformControl.reset();
    this.radius = undefined;
    this.drawGuide$.next(null);
    this.drawStyle$.next(undefined);

    // Necessary to keep reference to the geometry form field input
    if (this.type === SpatialType.Predefined) {
      const geojson: GeoJSONGeometry = {
        type: 'Point',
        coordinates: ''
      };
      this.geometryformControl.setValue(geojson);
    }
    // Necessary to apply the right style when geometry type is Point
    if (this.type === SpatialType.Point) {
      this.radius = 1000; // Base radius
      this.radiusFormControl.setValue(this.radius);
      this.overlayStyle = this.PointStyle;
      this.drawStyle$.next(this.overlayStyle);
    } else if (this.type === SpatialType.Line) {
      console.log('// todo');
    } else {
      // If geometry types is Polygon
      this.radius = undefined;
      this.overlayStyle = this.PolyStyle;
      this.drawStyle$.next(this.drawStyle);
    }
    this.overlayStyle$.next(this.overlayStyle);
  }
  private _type: SpatialType;

  /**
   * Available measure units for the measure type given
   * @internal
   */
  get measureUnits(): string[] {
    return [MeasureLengthUnit.Meters, MeasureLengthUnit.Kilometers];
  }

  // For geometry form field input
  value$: BehaviorSubject<GeoJSONGeometry> = new BehaviorSubject(undefined);
  drawGuide$: BehaviorSubject<number> = new BehaviorSubject(null);
  overlayStyle$: BehaviorSubject<olStyle.Style | ((feature, resolution) => olStyle.Style)> = new BehaviorSubject(undefined);
  drawStyle$: BehaviorSubject<olStyle.Style | ((feature, resolution) => olStyle.Style)> = new BehaviorSubject(undefined);

  private value$$: Subscription;
  private radiusChanges$$: Subscription;
  private bufferChanges$$: Subscription;
  private measureUnit$$: Subscription;
  private metersValidator = [Validators.max(this.maxBufferMeters), Validators.min(this.minBufferMeters), Validators.required];
  private kilometersValidator = [Validators.max(this.maxBufferMeters/1000), Validators.min(this.minBufferMeters/1000), Validators.required];

  public geometryformControl = new FormControl();
  public radiusFormControl = new FormControl(0, this.metersValidator);
  public bufferFormControl = new FormControl(0, this.metersValidator);

  public geometryType: typeof OlGeometryType | string;
  public geometryTypes: string[] = ['Point', 'Line', 'Polygon'];

  public measure = false;
  public drawControlIsActive = true;
  public freehandDrawIsActive = false;
  public drawZone;
  public overlayStyle: olStyle.Style | ((feature, resolution) => olStyle.Style);
  public drawStyle: olStyle.Style | ((feature, resolution) => olStyle.Style) = () => {
    return new olStyle.Style({
      image: new olStyle.Circle ({
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
      fill:  new olStyle.Fill({
        color: [0, 153, 255].concat([0.2])
      })
    });
  };

  public PointStyle: olStyle.Style | ((feature, resolution) => olStyle.Style) = (feature: OlFeature<OlGeometry>, resolution: number) => {
    const geom = feature.getGeometry() as OlPoint;
    const coordinates = olproj.transform(geom.getCoordinates(), this.map.projection, 'EPSG:4326');
    return new olStyle.Style({
      image: new olStyle.Circle({
        radius: this.radius / (Math.cos((Math.PI / 180) * coordinates[1])) / resolution, // Latitude correction
        stroke: new olStyle.Stroke({
          width: 2,
          color: 'rgba(0, 153, 255)'
        }),
        fill: new olStyle.Fill({
          color: 'rgba(0, 153, 255, 0.2)'
        })
      })
    });
  }
  public PolyStyle: olStyle.Style | ((feature, resolution) => olStyle.Style) = () => {
    return new olStyle.Style ({
      stroke: new olStyle.Stroke({
        width: 2,
        color: 'rgba(0, 153, 255)'
      }),
      fill: new olStyle.Fill({
        color: 'rgba(0, 153, 255, 0.2)'
      })
    });
  };

  public radius: number;
  public buffer: number = 0;

  public measureUnit$: BehaviorSubject<MeasureLengthUnit> = new BehaviorSubject(MeasureLengthUnit.Meters);
  public zoneWithBuffer;


  constructor(
    private cdRef: ChangeDetectorRef,
    private messageService: MessageService,
    private languageService: LanguageService) {}

  ngOnInit() {
    this.store.entities$.subscribe(() => { this.cdRef.detectChanges(); });

    this.drawGuide$.next(null);
    this.value$.next(this.geometryformControl.value ? this.geometryformControl.value : undefined);
    this.value$$ = this.geometryformControl.valueChanges.subscribe((value: GeoJSONGeometry) => {
      console.log('value',value);
      if (value) {
        this.value$.next(value);
        this.drawZone = this.geometryformControl.value as Feature;
        if (this.buffer !== 0) {
         // this.drawZoneEvent.emit(this.drawZone);
          this.bufferFormControl.setValue(this.buffer);
        }
      } else {
        this.value$.next(undefined);
        this.drawZone = undefined;
      }
    });

    this.value$.subscribe(() => {
      this.getRadius();
      this.cdRef.detectChanges();
    });

    this.radiusChanges$$ = this.radiusFormControl.valueChanges.subscribe(() => {
      this.getRadius();
      this.cdRef.detectChanges();
    });

    this.bufferChanges$$ = this.bufferFormControl.valueChanges
      .pipe(debounceTime(500))
      .subscribe((value) => {
        console.log(value);
        // todo
    });

    this.monitorUnits();
  }

  private monitorUnits() {
    this.measureUnit$$ = this.measureUnit$
      .pipe(distinctUntilChanged())
      .subscribe((measureUnit) => {
        if(measureUnit === MeasureLengthUnit.Meters) {
          this.bufferFormControl.setValidators(this.metersValidator);
          this.radiusFormControl.setValidators(this.metersValidator);
        } else {
          this.bufferFormControl.setValidators(this.kilometersValidator);
          this.radiusFormControl.setValidators(this.kilometersValidator);
        }
        if (this.isPolygon()) {
          measureUnit === MeasureLengthUnit.Meters ?
            this.bufferFormControl.setValue(this.bufferFormControl.value * 1000) :
            this.bufferFormControl.setValue(this.bufferFormControl.value / 1000);
        } else if (this.isPoint()) {
          measureUnit === MeasureLengthUnit.Meters ?
            this.radiusFormControl.setValue(this.radiusFormControl.value * 1000) :
            this.radiusFormControl.setValue(this.radiusFormControl.value / 1000);
        }
      });
  }

  /**
   * Unsubscribe to the value stream
   * @internal
   */
  ngOnDestroy() {
    this.value$$.unsubscribe();
    this.radiusChanges$$.unsubscribe();
    this.bufferChanges$$.unsubscribe();
    this.cdRef.detach();
    if (this.radiusChanges$$) {
      this.radiusChanges$$.unsubscribe();
    }
    if (this.value$$) {
      this.value$$.unsubscribe();
    }
    this.measureUnit$$.unsubscribe();
  }

  /**
   * Set the measure unit
   * @internal
   */
  onMeasureUnitChange(unit: MeasureLengthUnit) {
      this.measureUnit$.next(unit);
  }

  isPredefined() {
    return this.type === SpatialType.Predefined;
  }

  isPolygon() {
    return this.type === SpatialType.Polygon;
  }

  isPolyline() {
    return this.type === SpatialType.Line;
  }

  isPoint() {
    return this.type === SpatialType.Point;
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
    this.bufferFormControl.setValue(0);
    this.buffer = 0;
  }

  /**
   * Manage radius value at user change
   */
  getRadius() {
    let formValue;
    if (this.geometryformControl.value !== null) {
      this.measureUnit$.value === MeasureLengthUnit.Meters ?
        formValue = this.geometryformControl.value.radius :
        formValue = this.geometryformControl.value.radius / 1000;
    } else {
      formValue = undefined;
    }

    if (this.type === SpatialType.Point) {
      if (!this.freehandDrawIsActive) {
        if (
          this.radiusFormControl.value < 0 ||
          (this.measureUnit$.value === MeasureLengthUnit.Meters && this.radiusFormControl.value >= 100000) ||
          (this.measureUnit$.value === MeasureLengthUnit.Kilometers && this.radiusFormControl.value >= 100)) {
          this.messageService.alert(this.languageService.translate.instant('igo.geo.spatialFilter.radiusAlert'),
            this.languageService.translate.instant('igo.geo.spatialFilter.warning'));
          this.radius = 1000;
          this.measureUnit$.value === MeasureLengthUnit.Meters ?
            this.radiusFormControl.setValue(this.radius) :
            this.radiusFormControl.setValue(this.radius / 1000);
          this.drawGuide$.next(this.radius);
          return;
        }
      } else {
        if (formValue) {
          if (formValue >= 100000) {
            this.messageService.alert(this.languageService.translate.instant('igo.geo.spatialFilter.radiusAlert'),
              this.languageService.translate.instant('igo.geo.spatialFilter.warning'));
            this.geometryformControl.reset();
            return;
          }
          if (formValue !== this.radiusFormControl.value) {
            this.radiusFormControl.setValue(formValue);
            return;
          }
        }
      }
      if (this.measureUnit$.value === MeasureLengthUnit.Meters) {
        this.radius = this.radiusFormControl.value;
        this.drawGuide$.next(this.radius);
      } else {
        this.radius = this.radiusFormControl.value * 1000;
        this.drawGuide$.next(this.radius * 1000);
      }
      this.overlayStyle$.next(this.PointStyle);
      this.drawStyle$.next(this.PointStyle);
    }
  }
}
