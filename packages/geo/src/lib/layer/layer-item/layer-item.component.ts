import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
  signal
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

import { Subscription } from 'rxjs';

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
  private networkService = inject(NetworkService);

  showLegend = signal(true);
  inResolutionRange = true;
  queryBadgeHidden = signal(true);
  tooltipText: string;
  state: ConnectionState;

  private resolution$$: Subscription;
  private network$$: Subscription;

  readonly layer = input.required<Layer>();

  /** Pass the visibility to trigger change detection */
  readonly visible = input.required<boolean>();

  readonly selected = input<boolean>(undefined);
  readonly selectionDisabled = input<boolean>(undefined);

  readonly viewerOptions = input<LayerViewerOptions>(undefined);

  readonly action = output<Layer>();
  readonly selectChange = output<boolean>();
  readonly visibilityChange = output<Event>();

  @HostBinding('class.disabled') isDisabled: boolean;

  get opacity() {
    return this.layer().opacity * 100;
  }
  set opacity(opacity: number) {
    this.layer().opacity = opacity / 100;
  }

  get visibilityTooltip() {
    if (this.viewerOptions().mode !== 'selection' && !this.inResolutionRange) {
      return this.layer().visible
        ? this.isDisabled
          ? 'igo.geo.layer.notInResolution'
          : 'igo.geo.layer.group.hideChildren'
        : 'igo.geo.layer.showLayer';
    }
    return this.layer().visible
      ? this.isDisabled
        ? 'igo.geo.layer.group.hideChildren'
        : 'igo.geo.layer.hideLayer'
      : 'igo.geo.layer.showLayer';
  }

  ngOnInit() {
    this.layer().displayed$.subscribe((displayed) => {
      this.isDisabled = !displayed;
    });
    const layer = this.layer();
    if (
      layer.visible &&
      this.viewerOptions()?.legend?.showForVisibleLayers &&
      layer.firstLoadComponent === true
    ) {
      layer.firstLoadComponent = false;
      layer.legendCollapsed = false;
    }

    this.toggleLegend(layer.legendCollapsed);
    this.updateQueryBadge();

    const resolution$ = layer.map.viewController.resolution$;
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
    this.layer().legendCollapsed = collapsed;
    this.showLegend.set(!collapsed);
  }

  toggleLegendOnClick() {
    this.toggleLegend(this.showLegend());
  }

  handleVisibilityChange(event: Event) {
    event.stopPropagation();

    if (this.viewerOptions().legend?.showOnVisibilityChange) {
      this.toggleLegend(!this.layer().visible);
    }
    this.updateQueryBadge();

    this.visibilityChange.emit(event);
  }

  computeTooltip(): string {
    const layerOptions = this.layer().options;
    if (!layerOptions.tooltip) {
      return this.layer().title;
    }
    const layerTooltip = layerOptions.tooltip;
    const layerMetadata = (layerOptions as MetadataLayerOptions).metadata;
    switch (layerOptions.tooltip.type) {
      case TooltipType.TITLE:
        return this.layer().title;
      case TooltipType.ABSTRACT:
        if (layerMetadata && layerMetadata.abstract) {
          return layerMetadata.abstract;
        } else {
          return this.layer().title;
        }
      case TooltipType.CUSTOM:
        if (layerTooltip && layerTooltip.text) {
          return layerTooltip.text;
        } else {
          return this.layer().title;
        }
      default:
        return this.layer().title;
    }
  }

  private onResolutionChange() {
    const inResolutionRange = this.layer().isInResolutionsRange;
    if (
      inResolutionRange === false &&
      this.viewerOptions().legend.updateOnResolutionChange === true
    ) {
      this.toggleLegend(true);
    }
    this.inResolutionRange = inResolutionRange;
  }

  private updateQueryBadge() {
    const layer = this.layer();
    const hidden =
      this.viewerOptions().queryBadge === false ||
      layer.visible === false ||
      !layerIsQueryable(layer);
    this.queryBadgeHidden.set(hidden);
  }

  toggleLayerTool() {
    this.action.emit(this.layer());
  }

  handleSelect(event: MatCheckboxChange): void {
    this.selectChange.emit(event.checked);
  }
}
