import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

import { MetadataLayerOptions } from '../../metadata/shared/metadata.interface';
import { layerIsQueryable } from '../../query/shared/query.utils';
import { Layer, TooltipType } from '../shared/layers';

@Component({
  selector: 'igo-layer-item',
  templateUrl: './layer-item.component.html',
  styleUrls: ['./layer-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerItemComponent implements OnInit, OnDestroy {

  showLegend$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  inResolutionRange$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  queryBadgeHidden$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  tooltipText: string;

  private resolution$$: Subscription;

  @Input() layer: Layer;

  @Input() toggleLegendOnVisibilityChange: boolean = false;

  @Input() expandLegendIfVisible: boolean = false;

  @Input() updateLegendOnResolutionChange: boolean = false;

  @Input() orderable: boolean = true;

  @Input() queryBadge: boolean = false;

  get removable(): boolean { return this.layer.options.removable !== false; }

  get opacity() { return this.layer.opacity * 100; }
  set opacity(opacity: number) { this.layer.opacity = opacity / 100; }

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    // Apply expandLegendIfVisible only when first load, at this moment legengCollapsed = showLegend to true.
    if (this.layer.visible && this.expandLegendIfVisible && (this.layer.legendCollapsed === this.showLegend$.value)) {
      this.layer.legendCollapsed = false;
    }
    this.toggleLegend(this.layer.legendCollapsed);
    this.updateQueryBadge();

    const resolution$ = this.layer.map.viewController.resolution$;
    this.resolution$$ = resolution$.subscribe((resolution: number) => {
      this.onResolutionChange(resolution);
    });
    this.tooltipText = this.computeTooltip();
  }

  ngOnDestroy() {
    this.resolution$$.unsubscribe();
  }

  toggleLegend(collapsed: boolean) {
    this.layer.legendCollapsed = collapsed;
    this.showLegend$.next(!collapsed);
  }

  toggleVisibility() {
    this.layer.visible = !this.layer.visible;
    if (this.toggleLegendOnVisibilityChange) {
      this.toggleLegend(!this.layer.visible);
    }
    this.updateQueryBadge();
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

  private onResolutionChange(resolution: number) {
    const inResolutionRange = this.layer.isInResolutionsRange;
    if (inResolutionRange === false && this.updateLegendOnResolutionChange === true) {
      this.toggleLegend(true);
    }
    this.inResolutionRange$.next(inResolutionRange);
  }

  private updateQueryBadge() {
    const hidden = this.queryBadge === false ||
      this.layer.visible === false ||
      !layerIsQueryable(this.layer);
    this.queryBadgeHidden$.next(hidden);
  }
}
