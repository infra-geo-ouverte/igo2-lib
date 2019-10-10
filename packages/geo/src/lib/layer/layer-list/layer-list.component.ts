import {
  Component,
  Input,
  ChangeDetectionStrategy,
  TemplateRef,
  ContentChild,
  OnInit,
  OnDestroy
} from '@angular/core';
import { FloatLabelType } from '@angular/material';

import { Layer } from '../shared';
import { LayerListControlsEnum } from './layer-list.enum';
import { LayerListService } from './layer-list.service';
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

  private change$$: Subscription;

  @ContentChild('igoLayerItemToolbar') templateLayerToolbar: TemplateRef<any>;

  @Input() layersAreAllVisible: boolean = true;

  @Input() layersAreAllInRange: boolean = true;

  @Input()
  set layers(value: Layer[]) {
    this._layers = value;
    this.next();
  }
  get layers(): Layer[] {
    return this._layers;
  }
  private _layers: Layer[];

  @Input() floatLabel: FloatLabelType = 'auto';

  @Input() layerFilterAndSortOptions: any = {};

  @Input() excludeBaseLayers: boolean = false;

  @Input() toggleLegendOnVisibilityChange: boolean = false;

  @Input() expandLegendOfVisibleLayers: boolean = false;

  @Input() updateLegendOnResolutionChange: boolean = false;

  @Input() queryBadge: boolean = false;

  get keyword(): string {
    return this.layerListService.keyword;
  }
  set keyword(value: string) {
    this.layerListService.keyword = value;
    this.next();
  }

  get keywordInitialized(): boolean {
    return this.layerListService.keywordInitialized;
  }
  set keywordInitialized(value: boolean) {
    this.layerListService.keywordInitialized = value;
  }

  get onlyVisible(): boolean {
    return this.layerListService.onlyVisible;
  }
  set onlyVisible(value: boolean) {
    this.layerListService.onlyVisible = value;
    this.next();
  }

  get onlyVisibleInitialized(): boolean {
    return this.layerListService.onlyVisibleInitialized;
  }
  set onlyVisibleInitialized(value: boolean) {
    this.layerListService.onlyVisibleInitialized = value;
  }

  get onlyInRange(): boolean {
    return this.layerListService.onlyInRange;
  }
  set onlyInRange(value: boolean) {
    this.layerListService.onlyInRange = value;
    this.next();
  }

  get onlyInRangeInitialized(): boolean {
    return this.layerListService.onlyInRangeInitialized;
  }
  set onlyInRangeInitialized(value: boolean) {
    this.layerListService.onlyInRangeInitialized = value;
  }

  get sortedAlpha(): boolean {
    return this.layerListService.sortedAlpha;
  }
  set sortedAlpha(value: boolean) {
    this.layerListService.sortedAlpha = value;
    this.next();
  }

  get sortedAlphaInitialized(): boolean {
    return this.layerListService.sortedAlphaInitialized;
  }
  set sortedAlphaInitialized(value: boolean) {
    this.layerListService.sortedAlphaInitialized = value;
  }

  constructor(private layerListService: LayerListService) {}

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
      });

    this.initLayerFilterAndSortOptions();
  }

  ngOnDestroy() {
    this.change$$.unsubscribe();
  }

  toggleOnlyVisible() {
    this.onlyVisible = !this.onlyVisible;
  }

  toggleOnlyInRange() {
    this.onlyInRange = !this.onlyInRange;
  }

  toggleSort(sortAlpha: boolean) {
    this.sortedAlpha = sortAlpha;
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
    if (this.sortedAlpha) {
      layersOut = this.sortLayersByTitle(layersOut);
    } else {
      layersOut = this.sortLayersByZindex(layersOut);
    }
    return layersOut;
  }

  private filterLayers(layers: Layer[]): Layer[] {
    const keyword = this.keyword;
    if (
      this.layerFilterAndSortOptions.showToolbar === LayerListControlsEnum.never
    ) {
      return layers;
    }
    if (!keyword && !this.onlyInRange && !this.onlyVisible) {
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

      if (keyword) {
        const localKeyword = keyword
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
          !(keyword.toLowerCase() === dataSourceType.toLowerCase()) &&
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

      if (this.onlyInRange && layer.isInResolutionsRange === false) {
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
          this.onlyInRange ||
          this.onlyVisible
        ) {
          return true;
        }
        return false;
    }
  }

  private initLayerFilterAndSortOptions() {
    if (this.layerFilterAndSortOptions.toolbarThreshold) {
      this.thresholdToFilterAndSort = this.layerFilterAndSortOptions.toolbarThreshold;
    }

    if (this.layerFilterAndSortOptions.keyword && !this.keywordInitialized) {
      this.keyword = this.layerFilterAndSortOptions.keyword;
      this.keywordInitialized = true;
    }
    if (
      this.layerFilterAndSortOptions.sortedAlpha &&
      !this.sortedAlphaInitialized
    ) {
      this.sortedAlpha = this.layerFilterAndSortOptions.sortedAlpha;
      this.sortedAlphaInitialized = true;
    }
    if (
      this.layerFilterAndSortOptions.onlyVisible &&
      !this.onlyVisibleInitialized &&
      !this.layersAreAllVisible
    ) {
      this.onlyVisible = this.layerFilterAndSortOptions.onlyVisible;
      this.onlyVisibleInitialized = true;
    }
    if (
      this.layerFilterAndSortOptions.onlyInRange &&
      !this.onlyInRangeInitialized &&
      !this.layersAreAllInRange
    ) {
      this.onlyInRange = this.layerFilterAndSortOptions.onlyInRange;
      this.onlyInRangeInitialized = true;
    }
  }
}
