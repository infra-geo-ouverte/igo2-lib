import { AsyncPipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import type { TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { FloatLabelType } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderChange, MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IconService, IconSvg, MAGNIFY_SCAN_ICON } from '@igo2/common/icon';
import { ListComponent, ListItemDirective } from '@igo2/common/list';
import { PanelComponent } from '@igo2/common/panel';
import { IgoLanguageModule } from '@igo2/core/language';

import * as olextent from 'ol/extent';

import {
  BehaviorSubject,
  EMPTY,
  ReplaySubject,
  Subscription,
  timer
} from 'rxjs';
import { debounce } from 'rxjs/operators';
import scrollIntoView from 'scroll-into-view-if-needed';

import {
  getAllChildLayersByProperty,
  getRootParentByProperty
} from '../../map/shared/linkedLayers.utils';
import { IgoMap } from '../../map/shared/map';
import {
  MetadataLayerOptions,
  MetadataOptions
} from '../../metadata/shared/metadata.interface';
import { LayerItemComponent } from '../layer-item/layer-item.component';
import { LayerListToolComponent } from '../layer-list-tool/layer-list-tool.component';
import { LayerListControlsOptions } from '../layer-list-tool/layer-list-tool.interface';
import { Layer } from '../shared/layers/layer';
import { LinkedProperties } from '../shared/layers/layer.interface';
import {
  LayerListControlsEnum,
  LayerListDisplacement
} from './layer-list.enum';
import { LayerListSelectVisibleEnum } from './layer-list.enum';

// TODO: This class could use a clean up. Also, some methods could be moved ealsewhere
@Component({
  selector: 'igo-layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    LayerListToolComponent,
    MatCheckboxModule,
    MatDividerModule,
    ListComponent,
    NgFor,
    LayerItemComponent,
    ListItemDirective,
    PanelComponent,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatSliderModule,
    NgTemplateOutlet,
    FormsModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class LayerListComponent implements OnInit, OnDestroy {
  orderable = true;
  thresholdToFilterAndSort = 5;

  layers$: BehaviorSubject<Layer[]> = new BehaviorSubject([]);

  change$ = new ReplaySubject<void>(1);

  showToolbar$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public layerTool: boolean;

  public hideSelectedLayers: boolean = true;
  activeLayer$: BehaviorSubject<Layer> = new BehaviorSubject(undefined);

  layersChecked: Layer[] = [];
  public selection: boolean;

  private change$$: Subscription;
  private layers$$: Subscription;
  public layerItemChangeDetection$ = new BehaviorSubject(undefined);

  @ContentChild('igoLayerItemToolbar', /* TODO: add static flag */ {})
  templateLayerToolbar: TemplateRef<any>;

  @Input() layersAreAllVisible: boolean = true;

  @Input() ogcButton: boolean = true;

  @Input() timeButton: boolean = true;

  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  set layers(value: Layer[]) {
    this._layers = this.removeProblemLayerInList(value);
    this.next();
  }
  get layers(): Layer[] {
    return this._layers;
  }
  private _layers: Layer[];

  set activeLayer(value: Layer) {
    this._activeLayer = value;
    this.activeLayer$.next(value);
  }
  get activeLayer(): Layer {
    return this._activeLayer;
  }
  private _activeLayer: Layer;

  @Input() floatLabel: FloatLabelType = 'auto';

  @Input() layerFilterAndSortOptions: LayerListControlsOptions = {};

  @Input() excludeBaseLayers: boolean = false;

  @Input() toggleLegendOnVisibilityChange: boolean = false;

  @Input() expandLegendOfVisibleLayers: boolean = false;

  @Input() updateLegendOnResolutionChange: boolean = false;

  @Input() queryBadge: boolean = false;

  @Output() appliedFilterAndSort = new EventEmitter<LayerListControlsOptions>();

  get keyword(): string {
    return this._keyword;
  }
  set keyword(value: string) {
    this._keyword = value;
    this.next();
  }
  private _keyword = undefined;

  get onlyVisible(): boolean {
    return this._onlyVisible;
  }
  set onlyVisible(value: boolean) {
    this._onlyVisible = value;
    this.next();
  }
  private _onlyVisible = false;

  get sortAlpha(): boolean {
    return this._sortedAlpha;
  }
  set sortAlpha(value: boolean) {
    this._sortedAlpha = value;
    this.next();
  }
  private _sortedAlpha = false;

  get opacity() {
    return Math.round(this.activeLayer$.getValue().opacity * 100);
  }
  set opacity(opacity: number) {
    this.activeLayer$.getValue().opacity = opacity / 100;
  }

  get badgeOpacity() {
    if (this.opacity === 100) {
      return;
    }
    return this.opacity;
  }

  get raiseDisabled(): boolean {
    if (
      !this.orderable ||
      this.activeLayer.baseLayer ||
      this.getUpperLayer().id === this.activeLayer.id ||
      this.isUpperBaselayer(this.activeLayer)
    ) {
      return true;
    }
    return false;
  }

  get lowerDisabled(): boolean {
    if (
      !this.orderable ||
      this.activeLayer.baseLayer ||
      this.getLowerLayer().id === this.activeLayer.id ||
      this.isLowerBaselayer(this.activeLayer)
    ) {
      return true;
    }
    return false;
  }

  get raiseDisabledSelection(): boolean {
    if (
      this.layersChecked.length === 0 ||
      !this.orderable ||
      !this.raisableLayers(this.layersChecked) ||
      this.selectAllCheck === true
    ) {
      return true;
    }
    return false;
  }

  get lowerDisabledSelection(): boolean {
    if (
      this.layersChecked.length === 0 ||
      !this.orderable ||
      !this.lowerableLayers(this.layersChecked) ||
      this.selectAllCheck === true
    ) {
      return true;
    }
    return false;
  }

  get checkOpacity() {
    return this.layersCheckedOpacity() * 100;
  }
  set checkOpacity(opacity: number) {
    for (const layer of this.layersChecked) {
      layer.opacity = opacity / 100;
    }
  }

  get layerListDisplacement(): typeof LayerListDisplacement {
    return LayerListDisplacement;
  }

  public toggleOpacity = false;

  public selectAllCheck: boolean;
  public selectAllCheck$ = new BehaviorSubject<boolean>(undefined);
  private selectAllCheck$$: Subscription;
  magnifyIcon: IconSvg = MAGNIFY_SCAN_ICON;

  constructor(
    private elRef: ElementRef,
    private iconService: IconService
  ) {
    this.iconService.registerSvg(this.magnifyIcon);
  }

  /**
   * Subscribe to the search term stream and trigger researches
   * @internal
   */
  ngOnInit(): void {
    this.change$$ = this.change$
      .pipe(
        debounce(() => {
          return this.layers.length === 0 ? EMPTY : timer(50);
        })
      )
      .subscribe(() => {
        this.showToolbar$.next(this.computeShowToolbar());
        this.layers$.next(this.computeLayers(this.layers.slice(0)));
        this.appliedFilterAndSort.emit({
          keyword: this.keyword,
          sortAlpha: this.sortAlpha,
          onlyVisible: this.onlyVisible
        });
      });

    this.selectAllCheck$$ = this.selectAllCheck$.subscribe((value) => {
      this.selectAllCheck = value;
    });

    this.layers$$ = this.layers$.subscribe(() => {
      if (this.layers) {
        let checks = 0;
        for (const layer of this.layers) {
          layer.status$.subscribe((valStatus) => {
            if (valStatus === 0) {
              this.map.removeLayer(layer);
            }
          });
          if (layer.options.active) {
            this.activeLayer = layer;
            this.layerTool = true;
          }
          if (layer.options.check) {
            checks += 1;
          }
        }
        if (this.excludeBaseLayers) {
          this.selectAllCheck =
            checks ===
            this.layers.filter(
              (lay) => lay.baseLayer !== true && lay.showInLayerList
            ).length
              ? true
              : false;
        } else {
          this.selectAllCheck =
            checks === this.layers.filter((lay) => lay.showInLayerList).length
              ? true
              : false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.change$$.unsubscribe();
    this.selectAllCheck$$.unsubscribe();
    this.layers$$.unsubscribe();
  }

  activeLayerExtentIsValid(layer: Layer): boolean {
    let valid = false;
    if (layer.options.showButtonZoomToExtent === false) {
      return false;
    }
    const layerExtent = layer.options.extent;
    const maxLayerZoomExtent = this.map.viewController.maxLayerZoomExtent;

    if (layerExtent) {
      if (maxLayerZoomExtent) {
        valid = olextent.containsExtent(maxLayerZoomExtent, layerExtent);
      } else {
        valid = true;
      }
    }
    return valid;
  }

  activeLayersExtentAreValid(layers: Layer[]): boolean {
    let valid = false;
    const layersExtent = olextent.createEmpty();
    const maxLayerZoomExtent = this.map.viewController.maxLayerZoomExtent;

    for (const layer of layers) {
      const layerExtent = layer.options.extent;

      if (layerExtent && !layerExtent.includes(Infinity)) {
        olextent.extend(layersExtent, layerExtent);
      }
    }

    if (!olextent.isEmpty(layersExtent)) {
      if (maxLayerZoomExtent) {
        valid = olextent.containsExtent(maxLayerZoomExtent, layersExtent);
      } else {
        valid = true;
      }
    }
    return valid;
  }

  zoomLayerExtents(layer: Layer) {
    this.map.geolocationController.temporaryDisableFollowPosition = true;
    this.map.viewController.zoomToExtent(layer.options.extent);
  }

  zoomLayersExtents(layers: Layer[]) {
    const layersExtent = olextent.createEmpty() as [
      number,
      number,
      number,
      number
    ];

    for (const layer of layers) {
      const layerExtent = layer.options.extent;

      if (layerExtent) {
        olextent.extend(layersExtent, layerExtent);
      }
    }
    this.map.geolocationController.temporaryDisableFollowPosition = true;
    this.map.viewController.zoomToExtent(layersExtent);
  }

  changeOpacity(event: MatSliderChange) {
    this.opacity = event.value;
  }

  clearKeyword() {
    this.keyword = undefined;
  }

  getLowerLayer() {
    return this.layers
      .filter((l) => !l.baseLayer)
      .reduce(
        (prev, current) => {
          return prev.zIndex < current.zIndex ? prev : current;
        },
        { zIndex: undefined, id: undefined }
      );
  }

  isLowerBaselayer(layer) {
    const index = this.layers.findIndex((lay) => layer.id === lay.id);
    if (
      this.layers &&
      this.layers[index + 1] &&
      this.layers[index + 1].baseLayer === true
    ) {
      return true;
    }
    return false;
  }

  getUpperLayer() {
    return this.layers
      .filter((l) => !l.baseLayer)
      .reduce(
        (prev, current) => {
          return prev.zIndex > current.zIndex ? prev : current;
        },
        { zIndex: undefined, id: undefined }
      );
  }

  isUpperBaselayer(layer) {
    const index = this.layers.findIndex((lay) => layer.id === lay.id);
    if (
      this.layers &&
      this.layers[index - 1] &&
      this.layers[index - 1].baseLayer === true
    ) {
      return true;
    }
    return false;
  }

  moveActiveLayer(
    activeLayer: Layer,
    actiontype: LayerListDisplacement,
    fromUi: boolean = false
  ) {
    const sortedLayersToMove = [];
    getRootParentByProperty(this.map, activeLayer, LinkedProperties.ZINDEX);
    let rootParentByProperty = getRootParentByProperty(
      this.map,
      activeLayer,
      LinkedProperties.ZINDEX
    );
    if (!rootParentByProperty) {
      rootParentByProperty = activeLayer;
    }
    const layersToMove = [rootParentByProperty];
    getAllChildLayersByProperty(
      this.map,
      rootParentByProperty,
      layersToMove,
      LinkedProperties.ZINDEX
    );

    this.layers.map((layer) => {
      if (layersToMove.indexOf(layer) !== -1) {
        sortedLayersToMove.push(layer);
      }
    });

    if (actiontype === LayerListDisplacement.Raise) {
      this.raiseLayers(sortedLayersToMove, fromUi);
    } else if (actiontype === LayerListDisplacement.Lower) {
      this.lowerLayers(sortedLayersToMove, fromUi);
    }
  }

  /*
   * For selection mode disabled attribute
   */
  raisableLayers(layers: Layer[]) {
    let response = false;
    let base = 0;
    for (const layer of layers) {
      const mapIndex = this.layers.findIndex((lay) => layer.id === lay.id);
      const currentLayer = this.layers[mapIndex];
      if (currentLayer.baseLayer) {
        base += 1;
      }

      const previousLayer = this.layers[mapIndex - 1];
      if (
        previousLayer &&
        previousLayer.baseLayer !== true &&
        !layers.find((lay) => previousLayer.id === lay.id) &&
        currentLayer.baseLayer !== true
      ) {
        response = true;
      }
    }

    if (
      (this.layersChecked.length === 1 && this.layersChecked[0].baseLayer) ||
      base === this.layersChecked.length
    ) {
      response = false;
    }
    return response;
  }

  /*
   * When multiple layers is selected but some may be allow to move
   */
  raisableLayer(index: number) {
    if (index < 1) {
      return false;
    }

    if (this.layers[index - 1].options.check) {
      return this.raisableLayer(index - 1);
    }
    return true;
  }

  raiseLayers(layers: Layer[], fromUi: boolean = true) {
    const layersToRaise = [];
    for (const layer of layers) {
      const index = this.layers.findIndex((lay) => lay.id === layer.id);
      if (this.raisableLayer(index)) {
        layersToRaise.push(layer);
      }
    }
    this.map.raiseLayers(layersToRaise);
    if (fromUi) {
      setTimeout(() => {
        const checkItems = this.elRef.nativeElement.getElementsByClassName(
          'mat-checkbox-checked'
        );
        const itemFocused = this.elRef.nativeElement.getElementsByClassName(
          'igo-layer-item-focused'
        );
        let targetToScroll;
        if (checkItems.length) {
          targetToScroll = checkItems[0];
        }
        if (itemFocused.length) {
          targetToScroll = itemFocused[0];
        }
        if (targetToScroll) {
          scrollIntoView(targetToScroll, {
            scrollMode: 'if-needed',
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }
  /*
   * For selection mode disabled attribute
   */
  lowerableLayers(layers: Layer[]) {
    let response = false;
    let base = 0;
    for (const layer of layers) {
      const mapIndex = this.layers.findIndex((lay) => layer.id === lay.id);
      const currentLayer = this.layers[mapIndex];
      if (currentLayer.baseLayer) {
        base += 1;
      }

      const nextLayer = this.layers[mapIndex + 1];
      if (
        nextLayer &&
        nextLayer.baseLayer !== true &&
        !layers.find((lay) => nextLayer.id === lay.id)
      ) {
        response = true;
      }
    }

    if (
      (this.layersChecked.length === 1 && this.layersChecked[0].baseLayer) ||
      base === this.layersChecked.length
    ) {
      response = false;
    }
    return response;
  }

  /*
   * When multiple layers is selected but some may be allow to move
   */
  lowerableLayer(index: number) {
    if (
      index >
      this.layers.filter((lay) => lay.baseLayer !== true).length - 2
    ) {
      return false;
    }

    if (this.layers[index + 1].options.check) {
      return this.lowerableLayer(index + 1);
    }
    return true;
  }

  lowerLayers(layers: Layer[], fromUi: boolean = true) {
    const layersToLower = [];
    for (const layer of layers) {
      const index = this.layers.findIndex((lay) => lay.id === layer.id);
      if (this.lowerableLayer(index)) {
        layersToLower.push(layer);
      }
    }
    this.map.lowerLayers(layersToLower);
    if (fromUi) {
      setTimeout(() => {
        const checkItems = this.elRef.nativeElement.getElementsByClassName(
          'mat-checkbox-checked'
        );
        const itemFocused = this.elRef.nativeElement.getElementsByClassName(
          'igo-layer-item-focused'
        );
        let targetToScroll;
        if (checkItems.length) {
          targetToScroll = checkItems[checkItems.length - 1];
        }
        if (itemFocused.length) {
          targetToScroll = itemFocused[0];
        }
        if (targetToScroll) {
          scrollIntoView(targetToScroll, {
            scrollMode: 'if-needed',
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }
  private next() {
    this.change$.next();
  }

  private computeLayers(layers: Layer[]): Layer[] {
    let layersOut = this.filterLayers(layers);
    if (this.sortAlpha) {
      layersOut = this.sortLayersByTitle(layersOut);
    } else {
      layersOut = this.sortLayersByZindex(layersOut);
    }
    return layersOut;
  }

  onKeywordChange(term) {
    this.keyword = term;
  }

  onAppliedFilterAndSortChange(appliedFilter: LayerListControlsOptions) {
    this.keyword = appliedFilter.keyword;
    this.onlyVisible = appliedFilter.onlyVisible;
    this.sortAlpha = appliedFilter.sortAlpha;
  }

  private filterLayers(layers: Layer[]): Layer[] {
    if (
      this.layerFilterAndSortOptions.showToolbar === LayerListControlsEnum.never
    ) {
      return layers;
    }
    if (!this.keyword && !this.onlyVisible) {
      return layers;
    }

    const keepLayerIds = layers.map((layer: Layer) => layer.id);

    layers.forEach((layer: Layer) => {
      const layerOptions = (layer.options as MetadataLayerOptions) || {};
      const dataSourceOptions = layer.dataSource.options || {};
      const metadata = layerOptions.metadata || ({} as MetadataOptions);
      const keywords = metadata.keywordList || [];
      const layerKeywords = keywords.map((kw: string) => {
        return kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      });

      if (this.keyword && layer.title) {
        const localKeyword = this.keyword
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const layerTitle = layer.title
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const dataSourceType = dataSourceOptions.type || '';
        const keywordRegex = new RegExp(localKeyword, 'gi');
        const keywordInList =
          layerKeywords.find((kw: string) => keywordRegex.test(kw)) !==
          undefined;
        if (
          !keywordRegex.test(layerTitle) &&
          !(this.keyword.toLowerCase() === dataSourceType.toLowerCase()) &&
          !keywordInList
        ) {
          const index = keepLayerIds.indexOf(layer.id);
          if (index > -1) {
            keepLayerIds.splice(index, 1);
          }
        }
      }

      if (this.onlyVisible && layer.visible === false) {
        const index = keepLayerIds.indexOf(layer.id);
        if (index > -1) {
          keepLayerIds.splice(index, 1);
        }
      }
    });

    return layers.filter(
      (layer: Layer) => keepLayerIds.indexOf(layer.id) !== -1
    );
  }

  private sortLayersByZindex(layers: Layer[]) {
    return layers.sort((layer1, layer2) => layer2.zIndex - layer1.zIndex);
  }

  private sortLayersByTitle(layers: Layer[]) {
    return layers.sort((a, b) => {
      if (this.normalize(a.title) < this.normalize(b.title)) {
        return -1;
      }
      if (this.normalize(a.title) > this.normalize(b.title)) {
        return 1;
      }
      return 0;
    });
  }

  private normalize(str: string) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private computeShowToolbar(): boolean {
    switch (this.layerFilterAndSortOptions.showToolbar) {
      case LayerListControlsEnum.always:
        return true;
      case LayerListControlsEnum.never:
        return false;
      default:
        if (
          this.layers.length >= this.thresholdToFilterAndSort ||
          this.keyword ||
          this.onlyVisible
        ) {
          return true;
        }
        return false;
    }
  }

  toggleLayerTool(layer) {
    this.toggleOpacity = false;
    if (this.layerTool && layer === this.activeLayer) {
      this.layerTool = false;
    } else {
      this.layerTool = true;
    }

    for (const lay of this.layers) {
      lay.options.active = false;
    }
    layer.options.active = true;
    this.activeLayer = layer;
  }

  removeLayers(layers?: Layer[]) {
    if (layers && layers.length > 0) {
      this.layersChecked = [];
      for (const layer of layers) {
        if (layer.options.removable !== false) {
          layer.map.removeLayer(layer);
        } else {
          this.layersChecked.push(layer);
        }
      }
    } else if (!layers && this.activeLayer.options.removable !== false) {
      this.activeLayer.map.removeLayer(this.activeLayer);
      this.layerTool = false;
    }
  }

  toggleVisibility(layers?: Layer[]) {
    if (layers && layers.length > 0) {
      for (const layer of layers) {
        layer.visible = this.hideSelectedLayers;
      }
    }
    this.layerItemChangeDetection$.next(true);
  }

  isLayerRemovable(layer: Layer): boolean {
    return layer.options.removable !== false;
  }

  isAllLayersRemovable(layers: Layer[]): boolean {
    return layers.every((l) => this.isLayerRemovable(l));
  }

  get statusSelectedLayersCheck(): LayerListSelectVisibleEnum {
    let statusSelectedLayers: LayerListSelectVisibleEnum =
      LayerListSelectVisibleEnum.NULL;
    let findTrue: boolean = false;
    let findFalse: boolean = false;

    if (this.layersChecked.length === 0) {
      statusSelectedLayers = LayerListSelectVisibleEnum.NULL;
    } else {
      statusSelectedLayers = LayerListSelectVisibleEnum.MIXED;
      this.hideSelectedLayers = false;

      for (const layer2 of this.layersChecked) {
        if (layer2.visible === true) {
          findTrue = true;
        }
        if (layer2.visible === false) {
          findFalse = true;
        }
      }

      if (findTrue === true && findFalse === false) {
        statusSelectedLayers = LayerListSelectVisibleEnum.ALL_VISIBLE;
      }
      if (findTrue === false && findFalse === true) {
        statusSelectedLayers = LayerListSelectVisibleEnum.ALL_HIDDEN;
        this.hideSelectedLayers = true;
      }
    }

    return statusSelectedLayers;
  }

  layersCheck(event: { layer: Layer; check: boolean }) {
    event.layer.options.check = event.check;
    if (event.check === true) {
      const eventMapIndex = this.layers.findIndex(
        (layer) => event.layer.id === layer.id
      );
      for (const layer of this.layersChecked) {
        const mapIndex = this.layers.findIndex((lay) => layer.id === lay.id);
        if (eventMapIndex < mapIndex) {
          this.layersChecked.splice(
            this.layersChecked.findIndex((lay) => layer.id === lay.id),
            0,
            event.layer
          );

          if (this.excludeBaseLayers) {
            if (
              this.layersChecked.length ===
              this.layers.filter(
                (lay) => lay.baseLayer !== true && lay.showInLayerList
              ).length
            ) {
              this.selectAllCheck = true;
            } else {
              this.selectAllCheck = false;
            }
          } else if (!this.excludeBaseLayers) {
            if (
              this.layersChecked.length ===
              this.layers.filter((lay) => lay.showInLayerList).length
            ) {
              this.selectAllCheck = true;
            } else {
              this.selectAllCheck = false;
            }
          }
          return;
        }
      }
      this.layersChecked.push(event.layer);
    } else {
      const index = this.layersChecked.findIndex(
        (layer) => event.layer.id === layer.id
      );
      this.layersChecked.splice(index, 1);
    }

    if (this.excludeBaseLayers) {
      if (
        this.layersChecked.length ===
        this.layers.filter(
          (lay) => lay.baseLayer !== true && lay.showInLayerList
        ).length
      ) {
        this.selectAllCheck = true;
      } else {
        this.selectAllCheck = false;
      }
    } else if (!this.excludeBaseLayers) {
      if (
        this.layersChecked.length ===
        this.layers.filter((lay) => lay.showInLayerList).length
      ) {
        this.selectAllCheck = true;
      } else {
        this.selectAllCheck = false;
      }
    }
  }

  toggleSelectionMode(value: boolean) {
    this.selection = value;
    this.activeLayer = undefined;
    if (value === true) {
      this.layerTool = false;
      for (const layer of this.layers) {
        if (layer.options.check) {
          this.layersChecked.push(layer);
        }
      }
    }
  }

  layersCheckedOpacity(): any {
    if (this.layersChecked.length > 1) {
      return 1;
    } else {
      const opacity = [];
      for (const layer of this.layersChecked) {
        opacity.push(layer.opacity);
      }
      return opacity;
    }
  }

  selectAll() {
    if (!this.selectAllCheck) {
      for (const layer of this.layers) {
        if (
          this.excludeBaseLayers &&
          layer.baseLayer !== true &&
          layer.showInLayerList
        ) {
          layer.options.check = true;
          this.layersChecked.push(layer);
        } else if (!this.excludeBaseLayers && layer.showInLayerList) {
          layer.options.check = true;
          this.layersChecked.push(layer);
        }
      }
      this.selectAllCheck$.next(true);
    } else {
      for (const layer of this.layers) {
        layer.options.check = false;
      }
      this.layersChecked = [];
      this.selectAllCheck$.next(false);
    }
  }

  isScrolledIntoView(elemSource, elem) {
    const docViewTop = elemSource.scrollTop;
    const docViewBottom = docViewTop + elemSource.clientHeight;

    const elemTop = elem.offsetTop;
    const elemBottom = elemTop + elem.clientHeight;
    return elemBottom <= docViewBottom && elemTop >= docViewTop;
  }

  removeProblemLayerInList(layersList: Layer[]): Layer[] {
    for (const layer of layersList) {
      if (layer.olLoadingProblem === true) {
        this.map.removeLayer(layer);
      }
    }
    return layersList;
  }
}
