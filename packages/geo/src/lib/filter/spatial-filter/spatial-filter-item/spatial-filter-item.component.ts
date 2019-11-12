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
import { MatTreeNestedDataSource } from '@angular/material';
import { SpatialFilterService } from '../../shared/spatial-filter.service';
import { MeasureLengthUnit } from '../../../measure';
import { EntityStore } from '@igo2/common';
import { Layer } from '../../../layer/shared';
import { NestedTreeControl } from '@angular/cdk/tree';
import { SpatialFilterThematic } from './../../shared/spatial-filter.interface';
import { MessageService, LanguageService } from '@igo2/core';

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
            radius: this.radius / (Math.cos((Math.PI / 180) * coordinates[1])) / resolution, // Latitude correction
            stroke: new olstyle.Stroke({
              width: 2,
              color: 'rgba(0, 153, 255)'
            }),
            fill: new olstyle.Fill({
              color: 'rgba(0, 153, 255, 0.2)'
            })
          })
        });
      };
      this.drawStyle$.next(this.overlayStyle);
    } else {
      // If geometry types is Polygon
      this.overlayStyle = (feature, resolution) => {
        return new olstyle.Style ({
          stroke: new olstyle.Stroke({
            width: 2,
            color: 'rgba(0, 153, 255)'
          }),
          fill: new olstyle.Fill({
            color: 'rgba(0, 153, 255, 0.2)'
          })
        });
      };
    }
    this.overlayStyle$.next(this.overlayStyle);
  }
  private _type: SpatialFilterType;

  @Input() queryType: SpatialFilterQueryType;

  @Input() zone: Feature;

  @Input() loading;

  @Input()
  get store(): EntityStore<Feature> {
    return this._store;
  }
  set store(store: EntityStore<Feature>) {
    this._store = store;
    this._store.entities$.subscribe(() => { this.cdRef.detectChanges(); });
  }
  private _store: EntityStore<Feature>;

  /**
   * Available measure units for the measure type given
   * @internal
   */
  get measureUnits(): string[] {
    return [MeasureLengthUnit.Meters];
  }

  @Input() layers: Layer[];

  @Output() toggleSearch = new EventEmitter();

  @Output() itemTypeChange = new EventEmitter<SpatialFilterItemType>();

  @Output() thematicChange = new EventEmitter<string[]>();

  @Output() drawZoneEvent = new EventEmitter<Feature>();

  @Output() radiusEvent = new EventEmitter<number>();

  @Output() clearButtonEvent = new EventEmitter<Layer[]>();

  @Output() clearSearchEvent = new EventEmitter();

  public itemType: SpatialFilterItemType[] = [SpatialFilterItemType.Address, SpatialFilterItemType.Thematics];
  public selectedItemType: SpatialFilterItemType = SpatialFilterItemType.Address;
  public selectedSourceAddress;

  treeControl = new NestedTreeControl<SpatialFilterThematic>(node => node.children);

  // For thematics and results tables
  public displayedColumns: string[] = ['name', 'select'];
  public childrens: SpatialFilterThematic[] = [];
  public groups: string[] = [];
  public thematics: SpatialFilterThematic[] = [];
  public dataSource = new MatTreeNestedDataSource<SpatialFilterThematic>();
  public selectedThematics = new SelectionModel<SpatialFilterThematic>(true, []);
  public displayedColumnsResults: string[] = ['typeResults', 'nameResults'];

  // For geometry form field input
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
  public drawControlIsActive = true;
  public drawStyle: OlStyle;
  public drawZone: Feature;
  public overlayStyle: OlStyle;

  public radius: number;
  public radiusFormControl = new FormControl();

  public measureUnit: MeasureLengthUnit = MeasureLengthUnit.Meters;

  constructor(
    private cdRef: ChangeDetectorRef,
    private spatialFilterService: SpatialFilterService,
    private messageService: MessageService,
    private languageService: LanguageService) {}

  ngOnInit() {
    this.spatialFilterService.loadThematicsList()
    .subscribe((items: SpatialFilterThematic[]) => {
      for (const item of items) {
        this.childrens.push(item);
      }
      this.childrens.forEach(child => {
        if (child.group && (this.groups.indexOf(child.group) === -1)) {
          this.groups.push(child.group);
          const thematic: SpatialFilterThematic = {
            name: child.group,
            children: []
          };
          this.thematics.push(thematic);
        }
        if (!child.group) {
          const thematic: SpatialFilterThematic = {
            name: child.name,
            children: []
          };
          this.thematics.push(thematic);
        }
      });
      this.thematics.forEach(thematic => {
        for (const child of this.childrens) {
          if (child.group === thematic.name) {
            thematic.children.push(child);
          }
        }
      });
    });

    this.dataSource.data = this.thematics;

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

  hasChild(_: number, node: SpatialFilterThematic) {
    if (node.children) {
      return node.children.length;
    }
    return false;
  }

  onToggleClick(node: SpatialFilterThematic) {
    this.treeControl.isExpanded(node) ? this.treeControl.collapse(node) : this.treeControl.expand(node);
  }

  isAllSelected(node?: SpatialFilterThematic) {
    let numSelected;
    let numNodes = 0;
    if (!node) {
      numSelected = this.selectedThematics.selected.length;
      this.thematics.forEach(thematic => {
        if (this.groups.indexOf(thematic.name) === -1) {
          numNodes++;
        }
      });
      this.childrens.forEach(children => {
        if (!this.thematics.find(thematic => thematic.name === children.name)) {
          numNodes++;
        }
      });
    } else {
      numSelected = node.children.length;
      node.children.forEach(children => {
        if (this.selectedThematics.selected.find(thematic => thematic === children)) {
          numNodes++;
        }
      });
    }

    if (numNodes >= 1) {
      return numSelected === numNodes;
    } else {
      return false;
    }
  }

  hasChildrenSelected(node: SpatialFilterThematic) {
    let bool = false;
    node.children.forEach(child => {
      if (this.selectedThematics.selected.find(thematic => thematic.name === child.name)) {
        bool = true;
      }
    });
    return bool;
  }

  /**
   * Apply header checkbox
   */
  masterToggle() {
    this.isAllSelected() ?
      this.selectedThematics.clear() :
      this.selectAll();

    const selectedThematicsName = [];
    for (const thematic of this.selectedThematics.selected) {
      selectedThematicsName.push(thematic.name);
    }

    this.thematics.forEach(thematic => {
      if (this.hasChild(0, thematic)) {
        this.treeControl.expand(thematic);
      }
    });
    this.thematicChange.emit(selectedThematicsName);
  }

  selectAll(node?: SpatialFilterThematic) {
    if (!node) {
      this.thematics.forEach(thematic => {
        if (this.groups.indexOf(thematic.name) === -1) {
          this.selectedThematics.select(thematic);
        }
      });
      this.childrens.forEach(children => {
        if (!this.selectedThematics.selected.find(thematic => thematic.name === children.name)) {
          this.selectedThematics.select(children);
        }
      });
    } else {
      if (this.hasChild(0, node)) {
        node.children.forEach(children => this.selectedThematics.select(children));
      }
    }
  }

  childrensToggle(node: SpatialFilterThematic) {
    this.isAllSelected(node) ?
    node.children.forEach(child => this.selectedThematics.deselect(child)) :
    this.selectAll(node);

    const selectedThematicsName = [];
    for (const thematic of this.selectedThematics.selected) {
      selectedThematicsName.push(thematic.name);
    }

    this.treeControl.expand(node);
    this.thematicChange.emit(selectedThematicsName);
  }

  /**
   * Apply changes to the thematics selected tree and emit event
   */
  onToggleChange(nodeSelected: SpatialFilterThematic) {
    let selected = false;
    if (this.selectedThematics.selected.find(thematic => thematic.name === nodeSelected.name) !== undefined) {
      selected = true;
    }

    this.childrens.forEach(children => {
      if (children === nodeSelected && selected === false) {
        this.selectedThematics.select(children);
      }
      if (children === nodeSelected && selected === true) {
        this.selectedThematics.deselect(children);
      }
    });
    this.thematics.forEach(thematic => {
      if (thematic === nodeSelected && selected === false) {
        this.selectedThematics.select(thematic);
      }
      if (thematic === nodeSelected && selected === true) {
        this.selectedThematics.deselect(thematic);
      }
    });

    const selectedThematicsName = [];
    for (const thematic of this.selectedThematics.selected) {
      selectedThematicsName.push(thematic.name);
    }
    this.thematicChange.emit(selectedThematicsName);
  }

  onDrawControlChange() {
    this.drawControlIsActive = !this.drawControlIsActive;
  }

  /**
   * Launch search button
   */
  toggleSearchButton() {
    if (this.isPolygon() || this.isPoint()) {
      this.drawZone = this.formControl.value as Feature;
      this.drawZone.meta = {
        id: undefined,
        title: 'Zone'
      };
      this.drawZone.properties = {
        nom: 'Zone'
      };
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
    this.map.removeLayers(this.layers);
    this.loading = false;
    if (this.store) {
      this.store.clear();
    }
    this.clearButtonEvent.emit([]);
  }

  /**
   * Launch clear search (clear field if type is predefined)
   */
  clearSearch() {
    this.selectedThematics.clear();
    this.thematicChange.emit([]);
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

  /**
   * Verify conditions of draw zone defined or draw control actived
   */
  disabledFormButton() {
    if (!this.drawControlIsActive && this.formControl.value === null) {
      return true;
    }
    return false;
  }

  /**
   * Manage radius value at user change
   */
  getRadius(radius) {
    if (radius.target.value >= 10000 || radius.target.value < 0) {
      this.messageService.alert(this.languageService.translate.instant('igo.geo.spatialFilter.alert'),
        this.languageService.translate.instant('igo.geo.spatialFilter.warning'));
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
