import {
  Component,
  Input,
  ChangeDetectionStrategy,
  TemplateRef,
  ContentChild,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { FloatLabelType } from '@angular/material';

import { Layer } from '../shared';
import { LayerListControlsEnum } from './layer-list.enum';
import {
  BehaviorSubject,
  ReplaySubject,
  Subscription,
  EMPTY,
  timer
} from 'rxjs';
import { debounce } from 'rxjs/operators';
import {
  MetadataOptions,
  MetadataLayerOptions
} from '../../metadata/shared/metadata.interface';
import { LayerListControlsOptions } from '../layer-list-tool/layer-list-tool.interface';
import { IgoMap } from '../../map/shared/map';

// TODO: This class could use a clean up. Also, some methods could be moved ealsewhere
@Component({
  selector: 'igo-layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerListComponent implements OnInit, OnDestroy {
  orderable = true;
  thresholdToFilterAndSort = 5;

  layers$: BehaviorSubject<Layer[]> = new BehaviorSubject([]);

  change$ = new ReplaySubject<void>(1);

  showToolbar$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public layerTool: boolean;
  activeLayer$: BehaviorSubject<Layer> = new BehaviorSubject(undefined);

  layersChecked: Layer[] = [];
  public selection;

  private change$$: Subscription;

  @ContentChild('igoLayerItemToolbar') templateLayerToolbar: TemplateRef<any>;

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
    this._layers = value;
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
    return this.activeLayer$.getValue().opacity * 100;
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

  get checkOpacity() {
    return this.layersCheckedOpacity() * 100;
  }
  set checkOpacity(opacity: number) {
    for (const layer of this.layersChecked) {
      layer.opacity = opacity / 100;
    }
  }

  public toggleOpacity = false;

  public selectAllCheck$ = new BehaviorSubject<boolean>(false);
  selectAllCheck$$: Subscription;
  public selectAllCheck = false;

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

    this.layers$.subscribe(() => {
      if (this.layers) {
        for (const layer of this.layers) {
          if (layer.options.active) {
            this.activeLayer = layer;
            this.layerTool = true;
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.change$$.unsubscribe();
  }

  clearKeyword() {
    this.keyword = undefined;
  }

  getLowerLayer() {
    return this.layers
      .filter(l => !l.baseLayer)
      .reduce(
        (prev, current) => {
          return prev.zIndex < current.zIndex ? prev : current;
        },
        { zIndex: undefined, id: undefined }
      );
  }

  getUpperLayer() {
    return this.layers
      .filter(l => !l.baseLayer)
      .reduce(
        (prev, current) => {
          return prev.zIndex > current.zIndex ? prev : current;
        },
        { zIndex: undefined, id: undefined }
      );
  }

  raisableLayers(layers: Layer[]) {
    let response = false;
    for (const layer of layers) {
      const mapIndex = this.layers.findIndex(lay => layer.id === lay.id);
      const previousLayer = this.layers[mapIndex - 1];
      if (previousLayer && !previousLayer.baseLayer && !layers.find(lay => previousLayer.id === lay.id)) {
        response = true;
      }
    }
    return response;
  }

  lowerableLayers(layers: Layer[]) {
    let response = false;
    for (const layer of layers) {
      const mapIndex = this.layers.findIndex(lay => layer.id === lay.id);
      const nextLayer = this.layers[mapIndex + 1];
      if (nextLayer && !nextLayer.baseLayer && !layers.find(lay => nextLayer.id === lay.id)) {
        response = true;
      }
    }
    return response;
  }

  lowerLayers(layers: Layer[]) {
    this.map.lowerLayers(layers);
    layers.reverse();
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

      if (this.keyword) {
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
      if (a.title < b.title) {
        return -1;
      }
      if (a.title > b.title) {
        return 1;
      }
      return 0;
    });
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
    return;
  }

  removeLayers(layers?: Layer[]) {
    if (layers && layers.length > 0) {
      for (const layer of layers) {
        layer.map.removeLayer(layer);
      }
      this.layersChecked = [];
    } else if (!layers) {
      this.activeLayer.map.removeLayer(this.activeLayer);
      this.layerTool = false;
    }
    return;
  }

  layersCheck(event: {layer: Layer; check: boolean}) {
    if (event.check === true) {
      const eventMapIndex = this.layers.findIndex(layer => event.layer.id === layer.id);
      for (const layer of this.layersChecked) {
        const mapIndex = this.layers.findIndex(lay => layer.id === lay.id);
        if (eventMapIndex < mapIndex) {
          this.layersChecked.splice(this.layersChecked.findIndex(lay => layer.id === lay.id), 0, event.layer);
          return;
        }
      }
      this.layersChecked.push(event.layer);
    } else {
      const index = this.layersChecked.findIndex(layer => event.layer.id === layer.id);
      this.layersChecked.splice(index, 1);
    }
  }

  toggleSelectionMode(value: boolean) {
    this.selection = value;
    this.activeLayer = undefined;
    if (value === true) {
      this.layerTool = false;
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
        if (!layer.baseLayer) {
          this.layersChecked.push(layer);
        }
      }
      this.selectAllCheck$.next(true);
    } else {
      this.layersChecked = [];
      this.selectAllCheck$.next(false);
    }
  }
}
