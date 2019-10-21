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
import { Layer } from '../../../layer';
import { SpatialFilterItemType } from './../../shared/spatial-filter.enum';
import { Feature } from './../../../feature/shared/feature.interfaces';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import OlGeometryType from 'ol/geom/GeometryType';
import { GeoJSONGeometry } from '../../../geometry/shared/geometry.interfaces';
import { Style as OlStyle } from 'ol/style';
import * as olstyle from 'ol/style';
import * as poly from 'ol/geom/Polygon';
import * as geom from 'ol/geom';
import { MatSnackBar } from '@angular/material';
import { createOverlayMarkerStyle } from '../../../overlay/shared/overlay.utils';
import { SpatialFilterService } from '../../shared/spatial-filter.service';

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
    this.clearForm();
    this.clearButton();
    this.selectedThematics.clear();
    this.radius = undefined;
    this.drawGuide$.next(null);
    // if (this.type === SpatialFilterType.Predefined) {
    //   this.ngOnDestroy();
    // }
    if (this.type === SpatialFilterType.Point) {
      this.radius = 1000;
      this.drawGuide$.next(1000);
    }
  }
  private _type: SpatialFilterType;

  @Input() queryType: SpatialFilterQueryType;
  @Input() zone: Feature;
  @Input() loading;

  @Output() toggleSearch = new EventEmitter();
  @Output() itemTypeChange = new EventEmitter<SpatialFilterItemType>();
  @Output() thematicChange = new EventEmitter<string[]>();
  @Output() drawZoneEvent = new EventEmitter<Feature[]>();
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

  value$: BehaviorSubject<GeoJSONGeometry> = new BehaviorSubject(undefined);
  drawGuide$: BehaviorSubject<number> = new BehaviorSubject(null);
  overlayStyle$: BehaviorSubject<OlStyle> = new BehaviorSubject(undefined);

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
  public overlayStyle: OlStyle;
  public drawZone: Feature[];

  public radius: number;
  public radiusFormControl = new FormControl();

  constructor(
    private cdRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private spatialFilterService: SpatialFilterService) {}

  ngOnInit() {
    this.spatialFilterService.loadItemList()
    .subscribe((items: string[]) => {
      this.thematicsList = items;
    });
    this.drawGuide$.next(this.drawGuide);
    this.overlayStyle$.next(this.overlayStyle);
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

  toggleSearchButton() {
    if (this.isPolygon() || (this.isPoint() && this.radius === undefined)) {
      this.drawZone = this.formControl.value as Feature[];
      this.drawZoneEvent.emit(this.drawZone);
    }
    if (this.radius !== undefined) {
      const circle = poly.circular(this.formControl.value.coordinates, this.radius, 50, 3078137).flatCoordinates as any[];
      const coord = [];
      const circleArray = [];
      for (let i = 0; i < circle.length - 1; i += 2) {
        circleArray.push([circle[i], circle[i + 1]]);
      }
      coord.push(circleArray);
      this.formControl.value.coordinates = coord;
      this.formControl.value.type = 'Polygon';
      this.drawZone = this.formControl.value as Feature[];
      this.drawZoneEvent.emit(this.drawZone);
    }
    this.radiusEvent.emit(this.radius);
    this.toggleSearch.emit();
  }

  clearButton() {
    const currentLayers: Layer[] = [];
    this.map.layers.forEach(layer => {
      if (layer.baseLayer === false || layer.baseLayer === undefined) {
        currentLayers.push(layer);
      }
    });
    this.map.removeLayers(currentLayers);
    this.map.overlay.clear();
  }

  clearSearch() {
    this.clearSearchEvent.emit();
  }

  clearForm() {
    this.formControl.reset();
  }

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

  getRadius(radius) {
    if (radius.target.value >= 10000) {
      this.openSnackBar('Le buffer doit être de moins de 10000', 'Fermer');
      this.radius = undefined;
      this.drawGuide$.next(null);
      return;
    }
    if (radius.target.value === 0) {
      this.radius = undefined;
      this.drawGuide$.next(null);
      return;
    }
    this.radius = radius.target.value;
    this.drawGuide$.next(this.radius);
  }
}
