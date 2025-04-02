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
import { AnyLayer } from '../shared/layers/any-layer';
import { isBaseLayer, isLayerItem, sortLayersByZindex } from '../utils';

@Component({
  selector: 'igo-layer-legend-list',
  templateUrl: './layer-legend-list.component.html',
  styleUrls: ['./layer-legend-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  hasVisibleOrInRangeLayers$ = new BehaviorSubject<boolean>(true);
  hasVisibleAndNotInRangeLayers$ = new BehaviorSubject<boolean>(true);
  layersInUi$ = new BehaviorSubject<AnyLayer[]>([]);
  layers$ = new BehaviorSubject<AnyLayer[]>([]);
  showAllLegend = false;

  public change$ = new ReplaySubject<void>(1);
  private change$$: Subscription;

  @Input() layers: AnyLayer[];

  @Input() excludeBaseLayers = false;

  @Input() updateLegendOnResolutionChange = false;

  @Input() allowShowAllLegends = false;

  @Input() showAllLegendsValue = false;

  @Output() allLegendsShown = new EventEmitter<boolean>(false);

  isLayerItem = isLayerItem;

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
            .filter((layer) => !isBaseLayer(layer))
            .filter((layer) => layer.displayed).length > 0
        );
        this.hasVisibleAndNotInRangeLayers$.next(
          this.layers
            .slice(0)
            .filter((layer) => !isBaseLayer(layer))
            .filter((layer) => layer.visible && !layer.isInResolutionsRange)
            .length > 0
        );

        this.layersInUi$.next(
          this.layers
            .slice(0)
            .filter(
              (layer) =>
                layer.showInLayerList !== false &&
                (!this.excludeBaseLayers || !isBaseLayer(layer))
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
  private computeShownLayers(layers: AnyLayer[]) {
    let shownLayers = layers.filter((layer) => layer.displayed);
    if (this.showAllLegendsValue) {
      shownLayers = layers;
    }
    return sortLayersByZindex(shownLayers, 'desc');
  }

  toggleShowAllLegends(toggle: boolean) {
    this.showAllLegendsValue = toggle;
    this.next();
    this.allLegendsShown.emit(toggle);
  }
}
