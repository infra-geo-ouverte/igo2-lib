import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  inject
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject, EMPTY, Observable, combineLatest, timer } from 'rxjs';
import { debounce, debounceTime } from 'rxjs/operators';

import type { MapBase } from '../../map/shared/map.abstract';
import { LayerListComponent } from '../layer-list';
import { LayerListToolComponent } from '../layer-list-tool';
import {
  LayerListControlsEnum,
  LayerListControlsOptions
} from '../layer-list-tool/layer-list-tool.interface';
import { LayerUnavailableListComponent } from '../layer-unavailable';
import { LayerViewerBottomActionsComponent } from '../layer-viewer-bottom-actions';
import { LayerController } from '../shared';
import { LayerService } from '../shared/layer.service';
import {
  AnyLayer,
  ImageLayerOptions,
  LayerGroup,
  LayerOptionsBase
} from '../shared/layers';
import {
  isLayerGroup,
  isLayerItem,
  sortLayersByZindex
} from '../utils/layer.utils';
import { LayerToolMode, LayerViewerOptions } from './layer-viewer.interface';

@Component({
  selector: 'igo-layer-viewer',
  templateUrl: './layer-viewer.component.html',
  styleUrls: ['./layer-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatIconModule,
    LayerListComponent,
    LayerUnavailableListComponent,
    LayerViewerBottomActionsComponent,
    IgoLanguageModule,
    LayerListToolComponent
  ]
})
export class LayerViewerComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private layerService = inject(LayerService);

  layers: AnyLayer[];
  baselayers: AnyLayer[];
  keyword$ = new BehaviorSubject<string>(undefined);
  mode: LayerToolMode;
  isDragDropDisabled: boolean;

  @Input({ required: true }) map: MapBase;
  @Input() options: LayerViewerOptions;
  @Input() isDesktop: boolean;
  @Input() excludeBaseLayers: boolean;

  @Output() appliedFilterAndSort = new EventEmitter<LayerListControlsOptions>();

  @ContentChild('customBottomActions', { read: TemplateRef })
  customBottomActions: TemplateRef<unknown> | undefined;

  get layerViewerOptions(): LayerViewerOptions {
    return {
      ...this.options,
      mode: this.mode
    };
  }

  get layerController() {
    return this.map.layerController as LayerController;
  }

  get unavailableLayers(): LayerOptionsBase[] {
    return this.layerService.unavailableLayers;
  }

  isLayerItem = isLayerItem;

  /**
   * Subscribe to the search term stream and trigger researches
   * @internal
   */
  ngOnInit(): void {
    const baseObs$: [Observable<AnyLayer[]>, Observable<string>] = [
      this.layerController.layers$,
      this.keyword$
    ];

    const otherObs$: Observable<AnyLayer[]>[] = [];
    if (!this.excludeBaseLayers) {
      otherObs$.push(this.layerController.baseLayers$);
    }

    combineLatest([...baseObs$, ...otherObs$])
      .pipe(debounceTime(10))
      .subscribe(([layers, keyword, baselayers]) => {
        if (layers) {
          this.layers = this.computeLayers(layers, keyword);
        }

        if (baselayers) {
          const baselayersInViewer = baselayers.filter(
            (layer) => layer.showInLayerList
          );
          this.baselayers = this.computeLayers(baselayersInViewer, keyword);
        }

        this.cdr.markForCheck();
      });
    this.keyword$
      .pipe(
        debounce(() => {
          return this.layers?.length === 0 ? EMPTY : timer(50);
        })
      )
      .subscribe((keyword) => {
        this.isDragDropDisabled = !!keyword;
        this.appliedFilterAndSort.emit({
          keyword
        });
      });
  }

  clearKeyword() {
    this.keyword$.next(undefined);
  }

  onVisibilityOnlyChange(): void {
    this.layers = this.computeLayers(
      [...this.layerController.treeLayers],
      this.keyword$.value
    );
  }

  onLayerChange(): void {
    // Trigger change detection for component using layers
    this.layers = [...this.layers];
  }

  onSearchChange(value: string | undefined): void {
    this.keyword$.next(value);
  }

  toggleSelectionMode(active: boolean): void {
    if (!active) {
      this.layerController.clearSelection();
    }
    this.mode = active ? 'selection' : undefined;
  }

  toggleAllRows() {
    const isAllSelected = this.isAllSelected();
    this.layerController.clearSelection();
    if (isAllSelected) {
      return;
    }
    this.layerController.select(...this.layerController.treeLayers);
  }

  isAllSelected(): boolean {
    const numSelected = this.layerController.selected.length;
    const numRows = this.layerController.treeLayers.length;
    return (
      numSelected >= numRows &&
      this.layerController.treeLayers.every((layer) =>
        this.layerController.isSelected(layer)
      )
    );
  }

  isScrolledIntoView(elemSource, elem) {
    const docViewTop = elemSource.scrollTop;
    const docViewBottom = docViewTop + elemSource.clientHeight;

    const elemTop = elem.offsetTop;
    const elemBottom = elemTop + elem.clientHeight;
    return elemBottom <= docViewBottom && elemTop >= docViewTop;
  }

  createGroup(group: LayerGroup): void {
    this.map.layerController.add(group);
    this.cdr.markForCheck();
  }

  private computeLayers(layers: AnyLayer[], keyword: string): AnyLayer[] {
    const layersOut = this.filterLayers([...layers], keyword);
    return sortLayersByZindex(layersOut, 'desc');
  }

  private filterLayers(layers: AnyLayer[], keyword: string): AnyLayer[] {
    if (
      this.options?.filterAndSortOptions?.showToolbar ===
      LayerListControlsEnum.never
    ) {
      return layers;
    }

    if (keyword) {
      layers = this.filterSearch(keyword, layers);
    }

    return layers;
  }

  /** Recursive */
  private filterSearch(value: string, layers: AnyLayer[]): AnyLayer[] {
    if (!value) {
      return layers;
    }

    return [...layers].reduce((results: AnyLayer[], layer) => {
      const clonedLayer: AnyLayer = layer.clone() as AnyLayer;
      if (isLayerGroup(clonedLayer)) {
        if (this.layerHasTerm(value, clonedLayer)) {
          return results.concat(clonedLayer);
        }

        clonedLayer.children = this.filterSearch(value, [
          ...clonedLayer.children
        ]);
        if (clonedLayer.children.length) {
          return results.concat(clonedLayer);
        }
      }

      if (this.layerHasTerm(value, clonedLayer)) {
        return results.concat(clonedLayer);
      }
      return results;
    }, []);
  }

  private layerHasTerm(term: string, layer: AnyLayer): boolean {
    const metadata = (layer.options as ImageLayerOptions).metadata ?? {};
    const keywords = metadata.keywordList || [];
    const layerKeywords = keywords.map((kw: string) => {
      return kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    });

    const localKeyword = this.normalizeString(term);
    const layerTitle = this.normalizeString(layer.title);
    const dataSourceType = isLayerGroup(layer)
      ? ''
      : layer.dataSource.options.type || '';
    const keywordRegex = new RegExp(localKeyword, 'gi');
    const keywordInList =
      layerKeywords.find((kw: string) => keywordRegex.test(kw)) !== undefined;
    return (
      keywordRegex.test(layerTitle) ||
      term.toLowerCase() === dataSourceType.toLowerCase() ||
      keywordInList
    );
  }

  private normalizeString(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
