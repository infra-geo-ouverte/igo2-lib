import { olFeature } from 'ol/Feature';
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit
} from '@angular/core';
import { SpatialFilterQueryType, SpatialFilterType } from '../../shared/spatial-filter.enum';
import { SelectionModel } from '@angular/cdk/collections';
import { IgoMap } from '../../../map';
import { SpatialFilterItemType } from './../../shared/spatial-filter.enum';
import { Feature } from './../../../feature/shared/feature.interfaces';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import OlGeometryType from 'ol/geom/GeometryType';
import { GeoJSONGeometry } from '../../../geometry/shared/geometry.interfaces';
import { Style as OlStyle } from 'ol/style';
import * as olstyle from 'ol/style';
import * as olproj from 'ol/proj';
import { MatSnackBar } from '@angular/material';
import { SpatialFilterService } from '../../shared/spatial-filter.service';
import { MeasureLengthUnit } from '../../../measure';

/**
 * Spatial-Filter-Item (search parameters)
 */
@Component({
  selector: 'igo-spatial-filter-item',
  templateUrl: './spatial-filter-item.component.html',
  styleUrls: ['./spatial-filter-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpatialFilterItemComponent implements OnDestroy, OnInit {

  @Input() map: IgoMap;

  @Input()
  get type(): SpatialFilterType {
    return this._type;
  }
  set type(type: SpatialFilterType) {
    this._type = type;
    const index = this.geometryTypes.findIndex(geom => geom === this.type);
    this.geometryType = this.geometryTypes[index];
    this.formControl.reset();
    this.clearButton();
    this.selectedThematics.clear();
    this.radius = undefined;
    this.drawGuide$.next(null);
    this.drawStyle$.next(undefined);

    // Necessary to keep reference to the geometry form field input
    if (this.type === SpatialFilterType.Predefined) {
      const geojson: GeoJSONGeometry = {
        type: 'Point',
        coordinates: ''
      };
      this.formControl.setValue(geojson);
    }

    // Necessary to apply the right style when geometry type is Point
    if (this.type === SpatialFilterType.Point) {
      this.radius = 1000; // Base radius
      this.overlayStyle = (feature: olFeature, resolution: number) => {
        const coordinates = olproj.transform(feature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
        return new olstyle.Style ({
          image: new olstyle.Circle ({
            radius: this.radius/(Math.cos((Math.PI/180)*coordinates[1]))/resolution,
            stroke: new olstyle.Stroke({
              width: 2,
              color: 'rgba(0, 153, 255)'
            }),
            fill: new olstyle.Fill({
              color: 'rgba(0, 153, 255, 0.2)'
            })
          })
        })
      }
      this.drawStyle$.next(this.overlayStyle);
    } else {
      this.overlayStyle = (feature, resolution) => {
        return new olstyle.Style ({
          stroke: new olstyle.Stroke({
            width: 2,
            color: 'rgba(0, 153, 255)'
          }),
          fill: new olstyle.Fill({
            color: 'rgba(0, 153, 255, 0.2)'
          })
        })
      }
    }
    this.overlayStyle$.next(this.overlayStyle);
  }
  private _type: SpatialFilterType;

  @Input() queryType: SpatialFilterQueryType;
  @Input() zone: Feature;
  @Input() loading;
  @Input() store;

  /**
   * Available measure units for the measure type given
   * @internal
   */
  get measureUnits(): string[] {
    return [MeasureLengthUnit.Meters];
  }

  @Output() toggleSearch = new EventEmitter();
  @Output() itemTypeChange = new EventEmitter<SpatialFilterItemType>();
  @Output() thematicChange = new EventEmitter<string[]>();
  @Output() drawZoneEvent = new EventEmitter<Feature>();
  @Output() radiusEvent = new EventEmitter<number>();
  @Output() clearSearchEvent = new EventEmitter();

  public itemType: SpatialFilterItemType[] = [SpatialFilterItemType.Address, SpatialFilterItemType.Thematics];
  public selectedItemType: SpatialFilterItemType = SpatialFilterItemType.Address;
  public selectedSourceAddress;

  public displayedColumns: string[] = ['name', 'select'];
  public initialSelection = [];
  public allowMultiSelect = true;
  public thematicsList: string[] = [];
  public selectedThematics = new SelectionModel<string>(this.allowMultiSelect, this.initialSelection);
  public displayedColumnsResults: string[] = ['typeResults', 'nameResults'];

  value$: BehaviorSubject<GeoJSONGeometry> = new BehaviorSubject(undefined);
  drawGuide$: BehaviorSubject<number> = new BehaviorSubject(null);
  overlayStyle$: BehaviorSubject<OlStyle> = new BehaviorSubject(undefined);
  drawStyle$: BehaviorSubject<OlStyle> = new BehaviorSubject(undefined);

  private value$$: Subscription;

  public formControl = new FormControl();
  public geometryType: OlGeometryType;
  public geometryTypeField = false;
  public geometryTypes: string[] = ['Point', 'Polygon'];
  public drawGuideField = false;
  public drawGuide: number = null;
  public drawGuidePlaceholder = '';
  public measure = false;
  public drawStyle: OlStyle;
  public drawZone: Feature;
  public overlayStyle: OlStyle;

  public radius: number;
  public radiusFormControl = new FormControl();

  public measureUnit: MeasureLengthUnit = MeasureLengthUnit.Meters;

  constructor(
    private cdRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private spatialFilterService: SpatialFilterService) {}

  ngOnInit() {
    this.spatialFilterService.loadThematicsList()
    .subscribe((items: string[]) => {
      this.thematicsList = items;
    });

    this.drawGuide$.next(this.drawGuide);
    this.value$.next(this.formControl.value ? this.formControl.value : undefined);
    this.value$$ = this.formControl.valueChanges.subscribe((value: GeoJSONGeometry) => {
      this.value$.next(value ? value : undefined);
    });

    this.value$.subscribe(() => {
      this.cdRef.detectChanges();
    });
  }

  /**
   * Unsubscribe to the value stream
   * @internal
   */
  ngOnDestroy() {
    this.value$$.unsubscribe();
    this.cdRef.detach();
  }

  onItemTypeChange(event) {
    this.selectedItemType = event.value;
    this.itemTypeChange.emit(this.selectedItemType);
  }

  onThematicChange() {
    this.thematicChange.emit(this.selectedThematics.selected);
  }

  onSourceAdressChange(event) {
    this.selectedSourceAddress = event.value;
  }

  /**
   * Set the measure unit
   * @internal
   */
  onMeasureUnitChange(unit: MeasureLengthUnit) {
    this.measureUnit = unit;
  }

  isPredefined() {
    return this.type === SpatialFilterType.Predefined;
  }

  isPolygon() {
    return this.type === SpatialFilterType.Polygon;
  }

  isPoint() {
    return this.type === SpatialFilterType.Point;
  }

  isAllSelected() {
    const numSelected = this.selectedThematics.selected.length;
    const numRows = this.thematicsList.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selectedThematics.clear() :
        this.thematicsList.forEach(row => this.selectedThematics.select(row));

    this.thematicChange.emit(this.selectedThematics.selected);
  }

  /**
   * Apply changes to the thematics selected table and emit event
   */
  onToggleChange(rowSelected) {
    let bool = false;
    if (this.selectedThematics.selected.find(row => row === rowSelected) !== undefined) {
      bool = true;
    }
    this.thematicsList.forEach(row => {
      if (row === rowSelected && bool === false) {
        this.selectedThematics.select(row);
      }
      if (row === rowSelected && bool === true) {
        this.selectedThematics.deselect(row);
      }
    });
    this.thematicChange.emit(this.selectedThematics.selected);
  }

  /**
   * Launch search button
   */
  toggleSearchButton() {
    if (this.isPolygon() || (this.isPoint() && this.radius === undefined)) {
      this.drawZone = this.formControl.value as Feature;
      this.drawZone.meta = {
        id: undefined,
        title: 'Zone'
      }
      this.drawZone.properties = {
        nom: 'Zone'
      }
      this.drawZoneEvent.emit(this.drawZone);
    }

    if (this.radius !== undefined) {
      this.drawZone = this.formControl.value as Feature;
      this.drawZone.meta = {
        id: undefined,
        title: 'Zone'
      }
      this.drawZone.properties = {
        nom: 'Zone'
      }
      this.drawZoneEvent.emit(this.drawZone);
    }

    this.radiusEvent.emit(this.radius);
    this.toggleSearch.emit();
  }

  /**
   * Launch clear button (clear store and map layers)
   */
  clearButton() {
    this.loading = true;
    this.map.overlay.clear();
    this.map.layers.forEach(layer => {
      if (layer.baseLayer === false || layer.baseLayer === undefined) {
        this.map.removeLayer(layer);
      }
    });
    if (this.store) {
      this.store.clear();
    }
    this.loading = false;
  }

  /**
   * Launch clear search (clear field if type is predefined)
   */
  clearSearch() {
    this.selectedThematics.clear();
    this.thematicChange.emit(this.selectedThematics.selected);
    this.clearSearchEvent.emit();
  }

  /**
   * Verify conditions of incomplete fields or busy service
   */
  disableSearchButton(): boolean {
    if (this.type === SpatialFilterType.Predefined) {
      if (this.selectedItemType === SpatialFilterItemType.Address) {
        if (this.queryType !== undefined && this.zone !== undefined) {
          return this.loading;
        }
      }
      if (this.selectedItemType === SpatialFilterItemType.Thematics) {
        if (this.queryType !== undefined && this.zone !== undefined && this.selectedThematics.selected.length > 0) {
          return this.loading;
        }
      }
    }
    if (this.type === SpatialFilterType.Polygon || this.type === SpatialFilterType.Point) {
      if (this.selectedItemType === SpatialFilterItemType.Address && this.formControl.value !== null) {
        return this.loading;
      }
      if (this.selectedItemType === SpatialFilterItemType.Thematics) {
        if (this.selectedThematics.selected.length > 0 && this.formControl.value !== null) {
          return this.loading;
        }
      }
    }
    return true;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000
    });
  }

  /**
   * Manage radius value at user change
   */
  getRadius(radius) {
    if (radius.target.value >= 10000 || radius.target.value < 0) {
      this.openSnackBar('Le buffer doit être compris entre 0 et 10000', 'Fermer');
      this.radius = 1000;
      radius.target.value = 1000;
      this.drawGuide$.next(this.radius);
      return;
    }
    if (radius.target.value === 0) {
      this.radius = 0;
      this.drawGuide$.next(0);
      return;
    }
    this.radius = radius.target.value;
    this.drawGuide$.next(this.radius);
  }
}
