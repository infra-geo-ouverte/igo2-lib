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

  layerTool = false;
  activeLayer$: BehaviorSubject<Layer> = new BehaviorSubject(undefined);

  private change$$: Subscription;

  @ContentChild('igoLayerItemToolbar') templateLayerToolbar: TemplateRef<any>;

  @Input() layersAreAllVisible: boolean = true;

  @Input()
  set layers(value: Layer[]) {
    this._layers = value;
    this.next();
  }
  get layers(): Layer[] {
    return this._layers;
  }
  private _layers: Layer[];

  @Input()
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

  public toggleOpacity = false;

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
    this.activeLayer = layer;
    return;
  }

  removeLayer() {
    this.activeLayer.map.removeLayer(this.activeLayer);
    this.layerTool = false;
    return;
  }
}
