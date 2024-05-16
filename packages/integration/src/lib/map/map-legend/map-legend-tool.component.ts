import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { ToolComponent } from '@igo2/common/tool';
import { IgoLanguageModule } from '@igo2/core/language';
import {
  IgoMap,
  Layer,
  LayerLegendListBindingDirective,
  LayerLegendListComponent,
  LayerListControlsOptions,
  SearchSourceService,
  sourceCanSearch
} from '@igo2/geo';

import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subscription,
  combineLatest
} from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import { ToolState } from './../../tool/tool.state';
import { MapState } from './../map.state';

@ToolComponent({
  name: 'mapLegend',
  title: 'igo.integration.tools.legend',
  icon: 'format_list_bulleted'
})
@Component({
  selector: 'igo-map-legend-tool',
  templateUrl: './map-legend-tool.component.html',
  styleUrls: ['./map-legend-tool.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    LayerLegendListComponent,
    LayerLegendListBindingDirective,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class MapLegendToolComponent implements OnInit, OnDestroy {
  public delayedShowEmptyMapContent: boolean = false;

  layers$: BehaviorSubject<Layer[]> = new BehaviorSubject([]);
  showAllLegendsValue$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  change$ = new ReplaySubject<void>(1);

  private resolution$$: Subscription;
  private visibleOrInRangeLayers$$: Subscription;

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
      map((layers) =>
        layers.filter(
          (layer) => layer.visible$.value && layer.isInResolutionsRange$.value
        )
      )
    );
  }

  get visibleLayers$(): Observable<Layer[]> {
    return this.layers$.pipe(
      map((layers) => layers.filter((layer) => layer.visible$.value))
    );
  }

  get excludeBaseLayers(): boolean {
    return this.layerListControls.excludeBaseLayers || false;
  }

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
    private mapState: MapState,
    private toolState: ToolState,
    private searchSourceService: SearchSourceService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.resolution$$ = combineLatest([
      this.map.layers$,
      this.map.viewController.resolution$
    ])
      .pipe(debounceTime(10))
      .subscribe((bunch: [Layer[], number]) => {
        this.layers$.next(
          bunch[0].filter(
            (layer) =>
              layer.showInLayerList !== false &&
              (!this.excludeBaseLayers || !layer.baseLayer)
          )
        );
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
    setTimeout(() => {
      this.delayedShowEmptyMapContent = true;
      this.cdRef.detectChanges();
    }, 250);
  }

  onShowAllLegends(event) {
    this.mapState.showAllLegendsValue = event;
    this.showAllLegendsValue$.next(event);
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
          value.length === 0
            ? (visibleOrInRangeLayers = false)
            : (visibleOrInRangeLayers = true);
        }
      );

      if (visibleOrInRangeLayers === false) {
        return false;
      }
    }
    return true;
  }

  ngOnDestroy(): void {
    this.resolution$$.unsubscribe();
    if (this.visibleOrInRangeLayers$$) {
      this.visibleOrInRangeLayers$$.unsubscribe();
    }
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
