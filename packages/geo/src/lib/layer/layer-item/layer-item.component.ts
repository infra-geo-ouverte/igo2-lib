import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';
import { ConnectionState, NetworkService } from '@igo2/core/network';

import { BehaviorSubject, Subscription } from 'rxjs';

import { MetadataLayerOptions } from '../../metadata/shared/metadata.interface';
import { layerIsQueryable } from '../../query/shared/query.utils';
import { LayerLegendComponent } from '../layer-legend';
import { LayerViewerOptions } from '../layer-viewer/layer-viewer.interface';
import { LayerVisibilityButtonComponent } from '../layer-visibility-button';
import type { Layer } from '../shared/layers/layer';
import { TooltipType } from '../shared/layers/layer.interface';

@Component({
  selector: 'igo-layer-item',
  templateUrl: './layer-item.component.html',
  styleUrls: ['./layer-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatListModule,
    NgIf,
    MatCheckboxModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    LayerLegendComponent,
    AsyncPipe,
    IgoLanguageModule,
    LayerVisibilityButtonComponent
  ]
})
export class LayerItemComponent implements OnInit, OnDestroy {
  showLegend$ = new BehaviorSubject(true);
  inResolutionRange$ = new BehaviorSubject(true);
  queryBadgeHidden$ = new BehaviorSubject(true);
  tooltipText: string;
  state: ConnectionState;

  private resolution$$: Subscription;
  private network$$: Subscription;

  @Input({ required: true }) layer: Layer;

  /** Pass the visibility to trigger change detection */
  @Input({ required: true }) visible: boolean;

  @Input() selected: boolean;
  @Input() selectionDisabled: boolean;

  @Input() viewerOptions: LayerViewerOptions;

  @Output() action = new EventEmitter<Layer>();
  @Output() selectChange = new EventEmitter<boolean>();
  @Output() visibilityChange = new EventEmitter<Event>(undefined);

  @HostBinding('class.disabled') isDisabled: boolean;

  get opacity() {
    return this.layer.opacity * 100;
  }
  set opacity(opacity: number) {
    this.layer.opacity = opacity / 100;
  }

  get visibilityTooltip() {
    if (
      this.viewerOptions.mode !== 'selection' &&
      this.inResolutionRange$.getValue() === false
    ) {
      return 'igo.geo.layer.notInResolution';
    } else {
      return this.layer.visible && this.isDisabled
        ? 'igo.geo.layer.group.hideChildren'
        : this.layer.visible
          ? 'igo.geo.layer.hideLayer'
          : 'igo.geo.layer.showLayer';
    }
  }

  constructor(private networkService: NetworkService) {}

  ngOnInit() {
    this.layer.displayed$.subscribe((displayed) => {
      this.isDisabled = !displayed;
    });
    if (
      this.layer.visible &&
      this.viewerOptions?.legend?.showForVisibleLayers &&
      this.layer.firstLoadComponent === true
    ) {
      this.layer.firstLoadComponent = false;
      this.layer.legendCollapsed = false;
    }

    this.toggleLegend(this.layer.legendCollapsed);
    this.updateQueryBadge();

    const resolution$ = this.layer.map.viewController.resolution$;
    this.resolution$$ = resolution$.subscribe(() => {
      this.onResolutionChange();
    });
    this.tooltipText = this.computeTooltip();

    this.network$$ = this.networkService
      .currentState()
      .subscribe((state: ConnectionState) => {
        this.state = state;
        this.onResolutionChange();
      });
  }

  ngOnDestroy() {
    this.resolution$$?.unsubscribe();
    this.network$$?.unsubscribe();
  }

  toggleLegend(collapsed: boolean) {
    this.layer.legendCollapsed = collapsed;
    this.showLegend$.next(!collapsed);
  }

  toggleLegendOnClick() {
    this.toggleLegend(this.showLegend$.value);
  }

  handleVisibilityChange(event: Event) {
    event.stopPropagation();

    if (this.viewerOptions.legend.showOnVisibilityChange) {
      this.toggleLegend(!this.layer.visible);
    }
    this.updateQueryBadge();

    this.visibilityChange.emit(event);
  }

  computeTooltip(): string {
    const layerOptions = this.layer.options;
    if (!layerOptions.tooltip) {
      return this.layer.title;
    }
    const layerTooltip = layerOptions.tooltip;
    const layerMetadata = (layerOptions as MetadataLayerOptions).metadata;
    switch (layerOptions.tooltip.type) {
      case TooltipType.TITLE:
        return this.layer.title;
      case TooltipType.ABSTRACT:
        if (layerMetadata && layerMetadata.abstract) {
          return layerMetadata.abstract;
        } else {
          return this.layer.title;
        }
      case TooltipType.CUSTOM:
        if (layerTooltip && layerTooltip.text) {
          return layerTooltip.text;
        } else {
          return this.layer.title;
        }
      default:
        return this.layer.title;
    }
  }

  private onResolutionChange() {
    const inResolutionRange = this.layer.isInResolutionsRange;
    if (
      inResolutionRange === false &&
      this.viewerOptions.legend.updateOnResolutionChange === true
    ) {
      this.toggleLegend(true);
    }
    this.inResolutionRange$.next(inResolutionRange);
  }

  private updateQueryBadge() {
    const hidden =
      this.viewerOptions.queryBadge === false ||
      this.layer.visible === false ||
      !layerIsQueryable(this.layer);
    this.queryBadgeHidden$.next(hidden);
  }

  toggleLayerTool() {
    this.action.emit(this.layer);
  }

  handleSelect(event: MatCheckboxChange): void {
    this.selectChange.emit(event.checked);
  }
}
