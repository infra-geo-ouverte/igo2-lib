import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ListComponent, ListItemDirective } from '@igo2/common/list';
import { IgoLanguageModule } from '@igo2/core/language';

import {
  BehaviorSubject,
  EMPTY,
  ReplaySubject,
  Subscription,
  timer
} from 'rxjs';
import { debounce } from 'rxjs/operators';

import { LayerLegendItemComponent } from '../layer-legend-item/layer-legend-item.component';
import { Layer } from '../shared/layers/layer';

@Component({
  selector: 'igo-layer-legend-list',
  templateUrl: './layer-legend-list.component.html',
  styleUrls: ['./layer-legend-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDividerModule,
    ListComponent,
    NgFor,
    LayerLegendItemComponent,
    ListItemDirective,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class LayerLegendListComponent implements OnInit, OnDestroy {
  orderable = true;

  hasVisibleOrInRangeLayers$: BehaviorSubject<boolean> = new BehaviorSubject(
    true
  );
  hasVisibleAndNotInRangeLayers$: BehaviorSubject<boolean> =
    new BehaviorSubject(true);
  layersInUi$: BehaviorSubject<Layer[]> = new BehaviorSubject([]);
  layers$: BehaviorSubject<Layer[]> = new BehaviorSubject([]);
  showAllLegend: boolean = false;
  public change$ = new ReplaySubject<void>(1);
  private change$$: Subscription;
  @Input()
  set layers(value: Layer[]) {
    this._layers = value;
    this.next();
  }
  get layers(): Layer[] {
    return this._layers;
  }
  private _layers: Layer[];
  @Input() excludeBaseLayers: boolean = false;

  @Input() updateLegendOnResolutionChange: boolean = false;

  @Input() allowShowAllLegends: boolean = false;

  @Input() showAllLegendsValue: boolean = false;

  @Output() allLegendsShown = new EventEmitter<boolean>(false);

  constructor() {}
  ngOnInit(): void {
    this.change$$ = this.change$
      .pipe(
        debounce(() => {
          return this.layers.length === 0 ? EMPTY : timer(50);
        })
      )
      .subscribe(() => {
        const layers = this.computeShownLayers(this.layers.slice(0));
        this.layers$.next(layers);
        this.hasVisibleOrInRangeLayers$.next(
          this.layers
            .slice(0)
            .filter((layer) => layer.baseLayer !== true)
            .filter(
              (layer) =>
                layer.visible$.value && layer.isInResolutionsRange$.value
            ).length > 0
        );
        this.hasVisibleAndNotInRangeLayers$.next(
          this.layers
            .slice(0)
            .filter((layer) => layer.baseLayer !== true)
            .filter(
              (layer) =>
                layer.visible$.value && !layer.isInResolutionsRange$.value
            ).length > 0
        );

        this.layersInUi$.next(
          this.layers
            .slice(0)
            .filter(
              (layer) =>
                layer.showInLayerList !== false &&
                (!this.excludeBaseLayers || !layer.baseLayer)
            )
        );
      });
  }

  ngOnDestroy() {
    this.change$$.unsubscribe();
  }
  private next() {
    this.change$.next();
  }
  private computeShownLayers(layers: Layer[]) {
    let shownLayers = layers.filter(
      (layer: Layer) => layer.visible && layer.isInResolutionsRange
    );
    if (this.showAllLegendsValue) {
      shownLayers = layers;
    }
    return this.sortLayersByZindex(shownLayers);
  }
  private sortLayersByZindex(layers: Layer[]) {
    return layers.sort((layer1, layer2) => layer2.zIndex - layer1.zIndex);
  }

  toggleShowAllLegends(toggle: boolean) {
    this.showAllLegendsValue = toggle;
    this.next();
    this.allLegendsShown.emit(toggle);
  }
}
