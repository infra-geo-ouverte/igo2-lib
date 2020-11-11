import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EntityStore } from '@igo2/common';
import { SpatialFilterService } from './../../shared/spatial-filter.service';
import { SpatialFilterQueryType } from './../../shared/spatial-filter.enum';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Feature } from '../../../feature';
import { MeasureLengthUnit } from '../../../measure/shared';
import { LanguageService, MessageService } from '@igo2/core';
// import buffer from '@turf/buffer';
// import * as TurfProj from '@turf/projection';
import { Layer } from '../../../layer';
import {
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
} from 'ol/geom';
import LinearRing from 'ol/geom/LinearRing';
import GeoJSON from 'ol/format/GeoJSON';
// import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader';
// import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter';
// import { BufferOp } from 'jsts/org/locationtech/jts/operation/buffer';
// import Parser from 'jsts/org/locationtech/jts/io/OL3Parser';

@Component({
  selector: 'igo-spatial-filter-list',
  templateUrl: './spatial-filter-list.component.html',
  styleUrls: ['./spatial-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpatialFilterListComponent implements OnInit, OnDestroy {

  @Input()
  get store(): EntityStore<Feature> {
    return this._store;
  }
  set store(store: EntityStore<Feature>) {
    this._store = store;
  }
  private _store: EntityStore<Feature>;

  @Input()
  get queryType(): SpatialFilterQueryType {
    return this._queryType;
  }
  set queryType(queryType: SpatialFilterQueryType) {
    this.formControl.setValue('');
    this._queryType = queryType;
  }
  private _queryType: SpatialFilterQueryType;

  @Input()
  get zone() {
    return this._zone;
  }
  set zone(value) {
    this._zone = value;
    if (!value) {
      this.zoneWithBuffer = undefined;
      this.bufferFormControl.setValue(0);
    }
  }
  private _zone;

  @Input() layers: Layer[] = [];

  public zoneWithBuffer;
  public selectedZone: any;

  public measureUnit: MeasureLengthUnit = MeasureLengthUnit.Meters;

  public formControl = new FormControl();

  public bufferFormControl = new FormControl();

  // private reader = new GeoJSONReader();
  // private writer = new GeoJSONWriter();

  /**
   * Available measure units for the measure type given
   * @internal
   */
  get measureUnits(): string[] {
    return [MeasureLengthUnit.Meters, MeasureLengthUnit.Kilometers];
  }

  @Output() zoneChange = new EventEmitter<Feature>();
  @Output() zoneWithBufferChange = new EventEmitter<Feature>();
  @Output() bufferChange = new EventEmitter<number>();
  @Output() measureUnitChange = new EventEmitter<MeasureLengthUnit>();

  formValueChanges$$: Subscription;
  bufferValueChanges$$: Subscription;

  constructor(
    private spatialFilterService: SpatialFilterService,
    private messageService: MessageService,
    private languageService: LanguageService) {}

  ngOnInit() {
    this.formValueChanges$$ = this.formControl.valueChanges.subscribe((value) => {
      if (value.length) {
        this.store.view.filter((feature) => {
          const filterNormalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const featureNameNormalized = feature.properties.nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return featureNameNormalized.includes(filterNormalized);
        });
      }
    });

    this.bufferValueChanges$$ = this.bufferFormControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        if (this.measureUnit === MeasureLengthUnit.Meters && value > 0 && value <= 100000) {
        //   this.bufferChange.emit(value);
        //   // const bufferFeature = {...this.selectedZone};
        //   const format = new GeoJSON();
        //   const bufferFeature = format.readFeature(this.selectedZone, {
        //     featureProjection: 'EPSG:4326',
        //   });
        //   const parser = new Parser();
        //   parser.inject(
        //     Point,
        //     LineString,
        //     LinearRing,
        //     Polygon,
        //     MultiPoint,
        //     MultiLineString,
        //     MultiPolygon
        //   );
        //
        //   // let bufferFeature = TurfProj.toMercator(this.selectedZone);
        //   // console.log(bufferFeature);
        //   // let jstsGeom = this.reader.read(bufferFeature.geometry);
        //   // console.log(jstsGeom);
        //   // console.log(bufferFeature);
        //   // for (let coordinate of bufferFeature.geometry.coordinates[0][0]) {
        //   //   coordinate = olproj.transform(coordinate, 'EPSG:4326', 'EPSG:3857');
        //   // }
        //   // bufferFeature.geometry = OlPolygon.transform('EPSG:4326', 'EPSG:3857');
        //   // bufferFeature = jstsGeom.buffer(this.bufferFormControl.value / 1000);
        //   // for (let coordinate of this.zoneWithBuffer.geometry.coordinates[0][0]) {
        //   //   coordinate = olproj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
        //   // }
        //
        //   // convert the OpenLayers geometry to a JSTS geometry
        //   const jstsGeom = parser.read(bufferFeature.geometry);
        //   // create a buffer of 40 meters around each line
        //   const buffered = jstsGeom.buffer(this.bufferFormControl.value);
        //
        //   this.zoneWithBuffer = {...this.selectedZone};
        //   this.zoneWithBuffer.geometry = parser.write(buffered);
        //   // this.zoneWithBuffer.geometry = this.writer.write(bufferFeature);
        //   // this.zoneWithBuffer = TurfProj.toWgs84(this.zoneWithBuffer);
        //   this.zoneWithBufferChange.emit(this.zoneWithBuffer);
        // } else if (this.measureUnit === MeasureLengthUnit.Kilometers && value > 0 && value <= 100) {
        //   this.bufferChange.emit(value);
        //   this.zoneWithBuffer = buffer(this.selectedZone, this.bufferFormControl.value, {units: 'kilometers'});
          this.zoneWithBufferChange.emit(this.zoneWithBuffer);
        } else if (value === 0 && this.layers.length > 0) {
          this.bufferChange.emit(value);
          this.zoneWithBufferChange.emit(this.selectedZone);
        } else if (
            value < 0 ||
            (this.measureUnit === MeasureLengthUnit.Meters && value > 100000) ||
            (this.measureUnit === MeasureLengthUnit.Kilometers && value > 100)) {
            this.bufferFormControl.setValue(0);
            this.messageService.alert(this.languageService.translate.instant('igo.geo.spatialFilter.bufferAlert'),
              this.languageService.translate.instant('igo.geo.spatialFilter.warning'));
        }
    });
  }

  ngOnDestroy() {
    this.formValueChanges$$.unsubscribe();
  }

  displayFn(feature?: Feature): string | undefined {
    return feature ? feature.properties.nom : undefined;
  }

  onZoneChange(feature) {
    this.bufferFormControl.setValue(0);
    if (feature && this.queryType) {
      this.spatialFilterService.loadItemById(feature, this.queryType)
      .subscribe((featureGeom: Feature) => {
        this.selectedZone = featureGeom;
        this.zoneChange.emit(featureGeom);
      });
    }
  }

  /**
   * Set the measure unit
   * @internal
   */
  onMeasureUnitChange(unit: MeasureLengthUnit) {
    if (unit === this.measureUnit) {
      return;
    } else {
      this.measureUnit = unit;
      this.measureUnitChange.emit(this.measureUnit);
      this.measureUnit === MeasureLengthUnit.Meters ?
        this.bufferFormControl.setValue(this.bufferFormControl.value * 1000) :
        this.bufferFormControl.setValue(this.bufferFormControl.value / 1000);
    }
  }
}
