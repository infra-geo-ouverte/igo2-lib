import { NgIf, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject, EMPTY, combineLatest, timer } from 'rxjs';
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
  BaseLayerOptions,
  ImageLayerOptions,
  LayerGroup
} from '../shared/layers';
import { isLayerGroup, isLayerItem } from '../utils/layer.utils';
import { LayerToolMode, LayerViewerOptions } from './layer-viewer.interface';

@Component({
  selector: 'igo-layer-viewer',
  templateUrl: './layer-viewer.component.html',
  styleUrls: ['./layer-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
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
  ],
  standalone: true
})
export class LayerViewerComponent implements OnInit {
  layers: AnyLayer[];
  keyword$ = new BehaviorSubject<string>(undefined);
  mode: LayerToolMode;

  @Input({ required: true }) map: MapBase;
  @Input() options: LayerViewerOptions;
  @Input() isDesktop: boolean;

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

  get unavailableLayers(): BaseLayerOptions[] {
    return this.layerService.unavailableLayers;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private layerService: LayerService
  ) {}

  isLayerItem = isLayerItem;

  /**
   * Subscribe to the search term stream and trigger researches
   * @internal
   */
  ngOnInit(): void {
    combineLatest([this.layerController.layers$, this.keyword$])
      .pipe(debounceTime(10))
      .subscribe(([layers, keyword]) => {
        if (!layers) {
          return;
        }
        this.layers = this.computeLayers(layers, keyword);
        this.cdr.markForCheck();
      });
    this.keyword$
      .pipe(
        debounce(() => {
          return this.layers?.length === 0 ? EMPTY : timer(50);
        })
      )
      .subscribe((keyword) => {
        this.appliedFilterAndSort.emit({
          keyword
        });
      });
  }

  clearKeyword() {
    this.keyword$.next(undefined);
  }

  private computeLayers(layers: AnyLayer[], keyword: string): AnyLayer[] {
    const layersOut = this.filterLayers([...layers], keyword);
    return this.sortLayersByZindex(layersOut);
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

  private filterSearch(value: string, layers: AnyLayer[]): AnyLayer[] {
    if (!value) {
      return layers;
    }

    return layers.reduce((results: AnyLayer[], layer) => {
      const metadata = (layer.options as ImageLayerOptions).metadata ?? {};
      const keywords = metadata.keywordList || [];
      const layerKeywords = keywords.map((kw: string) => {
        return kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      });

      if (layer.title) {
        const localKeyword = this.normalizeString(value);
        const layerTitle = this.normalizeString(layer.title);
        const dataSourceType = isLayerGroup(layer)
          ? ''
          : layer.dataSource.options.type || '';
        const keywordRegex = new RegExp(localKeyword, 'gi');
        const keywordInList =
          layerKeywords.find((kw: string) => keywordRegex.test(kw)) !==
          undefined;
        if (
          keywordRegex.test(layerTitle) ||
          value.toLowerCase() === dataSourceType.toLowerCase() ||
          keywordInList
        ) {
          return results.concat(layer);
        }
        return results;
      }
    }, []);
  }

  private normalizeString(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /** Recursive */
  private sortLayersByZindex(layers: AnyLayer[]): AnyLayer[] {
    return layers
      .sort((layer1, layer2) => layer2.zIndex - layer1.zIndex)
      .map((layer) => {
        if (isLayerGroup(layer)) {
          this.sortLayersByZindex([...layer.children]);
        }
        return layer;
      });
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
    this.map.addLayer(group);
    this.cdr.markForCheck();
  }
}
