import { AsyncPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';

import { ToolComponent } from '@igo2/common/tool';
import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';
import { Media, MediaService } from '@igo2/core/media';
import {
  AnyLayer,
  ExportButtonComponent,
  ExportOptions,
  IgoMap,
  Layer,
  LayerLegendListBindingDirective,
  LayerLegendListComponent,
  LayerListControlsEnum,
  LayerListControlsOptions,
  LayerViewerComponent,
  LayerViewerOptions,
  MetadataButtonComponent,
  OgcFilterButtonComponent,
  SearchSourceService,
  StyleModalLayerButtonComponent,
  TimeFilterButtonComponent,
  TrackFeatureButtonComponent,
  VectorLayer,
  sourceCanSearch
} from '@igo2/geo';

import { BehaviorSubject, Observable, Subscription, combineLatest } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import {
  ImportExportMode,
  ImportExportState
} from '../../import-export/import-export.state';
import { ToolState } from '../../tool/tool.state';
import { WorkspaceButtonComponent } from '../../workspace/workspace-button/workspace-button.component';
import { LayerListToolState } from '../layer-list-tool.state';
import { MapState } from '../map.state';

/**
 * Tool to browse a map's layers or to choose a different map
 */
@ToolComponent({
  name: 'mapTools',
  title: 'igo.integration.tools.map',
  icon: 'map'
})
@Component({
  selector: 'igo-map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTabsModule,
    NgIf,
    NgTemplateOutlet,
    LayerViewerComponent,
    StyleModalLayerButtonComponent,
    MetadataButtonComponent,
    TrackFeatureButtonComponent,
    TimeFilterButtonComponent,
    OgcFilterButtonComponent,
    ExportButtonComponent,
    WorkspaceButtonComponent,
    LayerLegendListComponent,
    LayerLegendListBindingDirective,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class MapToolsComponent implements OnInit, OnDestroy {
  isDesktop: boolean;
  layers$ = new BehaviorSubject<AnyLayer[]>([]);
  showAllLegendsValue$ = new BehaviorSubject<boolean>(false);

  private resolution$$: Subscription;
  private visibleOrInRangeLayers$$: Subscription;
  public delayedShowEmptyMapContent = false;

  @Input() allowShowAllLegends = false;

  @Input() showAllLegendsValue = false;

  @Input() toggleLegendOnVisibilityChange = false;

  @Input() expandLegendOfVisibleLayers = false;

  @Input() updateLegendOnResolutionChange = false;

  @Input() selectedTabAtOpening: string;

  @Input() ogcButton = true;

  @Input() timeButton = true;

  @Input() layerAdditionAllowed = true;

  @Input()
  get layerListControls(): LayerListControlsOptions {
    return this._layerListControls;
  }
  set layerListControls(value: LayerListControlsOptions) {
    const stateOptions = this.layerListToolState.getLayerListControls();
    const stateKeyword = stateOptions.keyword;
    const stateOnlyVisible = stateOptions.onlyVisible;
    const stateSortAlpha = stateOptions.sortAlpha;

    value.keyword = stateKeyword !== '' ? stateKeyword : value.keyword;
    value.onlyVisible =
      stateOnlyVisible !== undefined ? stateOnlyVisible : value.onlyVisible;
    value.sortAlpha =
      stateSortAlpha !== undefined ? stateSortAlpha : value.sortAlpha;

    value.onlyVisible =
      value.onlyVisible === undefined ? false : value.onlyVisible;
    value.sortAlpha = value.sortAlpha === undefined ? false : value.sortAlpha;

    this._layerListControls = value;
  }
  private _layerListControls = {};

  get map(): IgoMap {
    return this.mapState.map;
  }

  @Input() queryBadge = false;

  get visibleOrInRangeLayers$(): Observable<AnyLayer[]> {
    return this.layers$.pipe(
      map((layers) => layers.filter((layer) => layer.displayed))
    );
  }

  get visibleLayers$(): Observable<AnyLayer[]> {
    return this.layers$.pipe(
      map((layers) => layers.filter((layer) => layer.visible))
    );
  }

  get excludeBaseLayers(): boolean {
    return this.layerListControls.excludeBaseLayers || false;
  }

  get layerFilterAndSortOptions(): LayerListControlsOptions {
    const filterSortOptions = Object.assign(
      {
        showToolbar: LayerListControlsEnum.default
      },
      this.layerListControls
    );

    switch (this.layerListControls.showToolbar) {
      case LayerListControlsEnum.always:
        filterSortOptions.showToolbar = LayerListControlsEnum.always;
        break;
      case LayerListControlsEnum.never:
        filterSortOptions.showToolbar = LayerListControlsEnum.never;
        break;
      default:
        break;
    }
    return filterSortOptions;
  }

  private _layerViewerOptions: Partial<LayerViewerOptions>;
  get layerViewerOptions(): LayerViewerOptions {
    return {
      filterAndSortOptions: this.layerFilterAndSortOptions,
      legend: {
        showForVisibleLayers: this.expandLegendOfVisibleLayers,
        showOnVisibilityChange: this.toggleLegendOnVisibilityChange,
        updateOnResolutionChange: this.updateLegendOnResolutionChange
      },
      queryBadge: this.queryBadge,
      ...this._layerViewerOptions
    };
  }

  @ViewChild('tabGroup', { static: true }) tabGroup;

  get searchToolInToolbar(): boolean {
    return (
      this.toolState.toolbox.getToolbar().indexOf('searchResults') !== -1 &&
      this.searchSourceService
        .getSources()
        .filter(sourceCanSearch)
        .filter((s) => s.available && s.getType() === 'Layer').length > 0
    );
  }

  get catalogToolInToolbar(): boolean {
    return this.toolState.toolbox.getToolbar().indexOf('catalog') !== -1;
  }

  get contextToolInToolbar(): boolean {
    return this.toolState.toolbox.getToolbar().indexOf('contextManager') !== -1;
  }

  constructor(
    public layerListToolState: LayerListToolState,
    private toolState: ToolState,
    public mapState: MapState,
    private searchSourceService: SearchSourceService,
    private importExportState: ImportExportState,
    private configService: ConfigService,
    public mediaService: MediaService,
    private cdr: ChangeDetectorRef
  ) {
    this._layerViewerOptions = this.configService.getConfig('layer');
  }

  ngOnInit(): void {
    this.handleMedia();
    this.selectedTab();
    this.resolution$$ = combineLatest([
      this.map.layerController.all$,
      this.map.viewController.resolution$
    ])
      .pipe(debounceTime(10))
      .subscribe(([layers]) => {
        this.layers$.next(layers);
      });

    if (this.allowShowAllLegends) {
      this.mapState.showAllLegendsValue =
        this.mapState.showAllLegendsValue !== undefined
          ? this.mapState.showAllLegendsValue
          : this.showAllLegendsValue || false;
      this.showAllLegendsValue$.next(this.mapState.showAllLegendsValue);
    } else {
      this.showAllLegendsValue$.next(false);
    }

    // prevent message to be shown too quickly. Waiting for layers
    setTimeout(() => (this.delayedShowEmptyMapContent = true), 250);
  }

  ngOnDestroy(): void {
    this.resolution$$.unsubscribe();
    if (this.visibleOrInRangeLayers$$) {
      this.visibleOrInRangeLayers$$.unsubscribe();
    }
  }

  onShowAllLegends(event) {
    this.mapState.showAllLegendsValue = event;
    this.showAllLegendsValue$.next(event);
  }

  private selectedTab() {
    const userSelectedTab = this.layerListToolState.selectedTab$.value;
    if (userSelectedTab !== undefined) {
      this.layerListToolState.setSelectedTab(userSelectedTab);
    } else {
      if (this.selectedTabAtOpening === 'legend') {
        this.layerListToolState.setSelectedTab(1);
      } else {
        this.layerListToolState.setSelectedTab(0);
      }
    }
  }

  public tabChanged(tab: MatTabChangeEvent) {
    this.layerListToolState.setSelectedTab(tab.index);
    this.layers$.next(this.map.layerController.all);
  }

  onLayerListChange(appliedFilters: LayerListControlsOptions) {
    this.layerListToolState.setKeyword(appliedFilters.keyword);
    this.layerListToolState.setSortAlpha(appliedFilters.sortAlpha);
    this.layerListToolState.setOnlyVisible(appliedFilters.onlyVisible);
  }

  showAllLegend() {
    if (this.layers$.getValue().length === 0) {
      return false;
    } else if (
      this.layers$.getValue().length !== 0 &&
      this.allowShowAllLegends === false
    ) {
      let visibleOrInRangeLayers;
      this.visibleOrInRangeLayers$$ = this.visibleOrInRangeLayers$.subscribe(
        (value) => {
          visibleOrInRangeLayers = value.length === 0 ? false : true;
        }
      );

      if (visibleOrInRangeLayers === false) {
        return false;
      }
    }
    return true;
  }

  activateExport(layer: Layer) {
    let id = layer.id;
    if (layer.options.workspace?.workspaceId) {
      id =
        layer.options.workspace.workspaceId !== layer.id
          ? layer.options.workspace.workspaceId
          : layer.id;
    }
    this.importExportState.setsExportOptions({ layers: [id] } as ExportOptions);
    this.importExportState.setMode(ImportExportMode.export);
    this.toolState.toolbox.activateTool('importExport');
  }

  activateTimeFilter() {
    this.toolState.toolbox.activateTool('activeTimeFilter');
  }

  activateOgcFilter() {
    this.toolState.toolbox.activateTool('activeOgcFilter');
  }

  searchEmit() {
    this.toolState.toolbox.activateTool('searchResults');
  }

  catalogEmit() {
    this.toolState.toolbox.activateTool('catalog');
  }

  contextEmit() {
    this.toolState.toolbox.activateTool('contextManager');
  }

  isTimeFilterButton(layer): boolean {
    const options = layer.dataSource.options;
    return this.timeButton && options.timeFilterable && options.timeFilter;
  }

  isOGCFilterButton(layer): boolean {
    const options = layer.dataSource.options;
    return (
      this.ogcButton &&
      options.ogcFilters &&
      options.ogcFilters.enabled &&
      (options.ogcFilters.pushButtons ||
        options.ogcFilters.checkboxes ||
        options.ogcFilters.radioButtons ||
        options.ogcFilters.select ||
        options.ogcFilters.autocomplete ||
        options.ogcFilters.editable)
    );
  }

  isExportButton(layer: Layer): boolean {
    if (
      (layer instanceof VectorLayer && layer.exportable === true) ||
      (layer.dataSource.options.download &&
        layer.dataSource.options.download.url) ||
      (layer.options.workspace?.enabled &&
        layer.options.workspace?.workspaceId !== layer.id)
    ) {
      return true;
    }
    return false;
  }

  isStyleEditButton(layer: Layer): boolean {
    if (layer instanceof VectorLayer) {
      if ((layer as VectorLayer).options?.igoStyle?.editable) {
        return true;
      }
    }
    return false;
  }

  private handleMedia(): void {
    this.mediaService.media$.subscribe((result) => {
      this.isDesktop = result === Media.Desktop;
      this.cdr.detectChanges();
    });
  }
}
