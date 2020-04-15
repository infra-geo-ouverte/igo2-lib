import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, BehaviorSubject, ReplaySubject, EMPTY, timer } from 'rxjs';
import { map, debounce } from 'rxjs/operators';

import { ToolComponent } from '@igo2/common';
import { LayerListControlsEnum, Layer, IgoMap, LayerListControlsOptions, SearchSourceService, sourceCanSearch } from '@igo2/geo';

import { ToolState } from './../../tool/tool.state';
import { MapState } from './../map.state';

@ToolComponent({
  name: 'mapLegend',
  title: 'igo.integration.tools.legend',
  icon: 'format-list-bulleted-type'
})
@Component({
  selector: 'igo-map-legend-tool',
  templateUrl: './map-legend-tool.component.html',
  styleUrls: ['./map-legend-tool.component.scss']
})
export class MapLegendToolComponent implements OnInit, OnDestroy {

  layers$: BehaviorSubject<Layer[]> = new BehaviorSubject([]);
  showAllLegendsValue$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  change$ = new ReplaySubject<void>(1);

  private resolution$$: Subscription;

  @Input() updateLegendOnResolutionChange: boolean = false;

  @Input() layerAdditionAllowed: boolean = true;

  @Input() allowShowAllLegends: boolean = false;

  @Input() showAllLegendsValue: boolean = false;

  @Input() layerListControls: LayerListControlsOptions = {};

  get map(): IgoMap {
    return this.mapState.map;
  }

  get visibleOrInRangeLayers$(): Observable<Layer[]> {
    return this.layers$.pipe(
      map(
        layers => layers
          .filter(layer => layer.visible$.value && layer.isInResolutionsRange$.value)
      ));
  }

  get visibleLayers$(): Observable<Layer[]> {
    return this.layers$.pipe(
      map(
        layers => layers
          .filter(layer => layer.visible$.value)
      ));
  }

  get excludeBaseLayers(): boolean {
    return this.layerListControls.excludeBaseLayers || false;
  }

  get searchToolInToolbar(): boolean {
    return this.toolState.toolbox.getToolbar().indexOf('searchResults') !== -1
      &&
      this.searchSourceService
        .getSources()
        .filter(sourceCanSearch)
        .filter(s => s.available && s.getType() === 'Layer').length > 0;
  }

  get catalogToolInToolbar(): boolean {
    return this.toolState.toolbox.getToolbar().indexOf('catalog') !== -1;
  }

  get contextToolInToolbar(): boolean {
    return this.toolState.toolbox.getToolbar().indexOf('contextManager') !== -1;
  }
  constructor(
    private mapState: MapState,
    private toolState: ToolState,
    private searchSourceService: SearchSourceService ) {}

  ngOnInit(): void {
    this.resolution$$ = this.map.viewController.resolution$.subscribe(r =>
      this.layers$.next(
        this.map.layers.filter(layer => layer.showInLayerList !== false && (!this.excludeBaseLayers || !layer.baseLayer))
      ));

    this.showAllLegendsValue$.next(this.showAllLegendsValue ? this.showAllLegendsValue : this.mapState.showAllLegendsValue);

  }

  onShowAllLegends(event) {
    this.mapState.showAllLegendsValue = event;
    this.showAllLegendsValue$.next(event);
  }

  ngOnDestroy(): void {
    this.resolution$$.unsubscribe();
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
}
