import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

import { Layer, TooltipType } from '../shared/layers';
import { MetadataLayerOptions } from '../../metadata/shared/metadata.interface';

@Component({
  selector: 'igo-layer-item',
  templateUrl: './layer-item.component.html',
  styleUrls: ['./layer-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerItemComponent implements OnInit, OnDestroy {

  showLegend$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  inResolutionRange$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  private resolution$$: Subscription;

  @Input() layer: Layer;

  @Input() toggleLegendOnVisibilityChange: boolean = false;

  @Input() expandLegendIfVisible: boolean = false;

  @Input() orderable: boolean = true;

  get removable(): boolean { return this.layer.options.removable !== false; }

  get opacity() { return this.layer.opacity * 100; }
  set opacity(opacity: number) { this.layer.opacity = opacity / 100; }
  public tooltipText;

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    const legend = this.layer.dataSource.options.legend || {};
    let legendCollapsed = legend.collapsed === false ? false : true;
    if (this.layer.visible && this.expandLegendIfVisible) {
      legendCollapsed = false;
    }
    this.showLegend$.next(!legendCollapsed);

    const resolution$ = this.layer.map.viewController.resolution$;
    this.resolution$$ = resolution$.subscribe((resolution: number) => {
      this.onResolutionChange(resolution);
    });
    this.tooltipText = this.computeToolTip();
  }

  ngOnDestroy() {
    this.resolution$$.unsubscribe();
  }

  toggleLegend(collapsed: boolean) {
    this.showLegend$.next(!collapsed);
  }

  toggleVisibility() {
    this.layer.visible = !this.layer.visible;
    if (this.toggleLegendOnVisibilityChange) {
      this.toggleLegend(!this.layer.visible);
    }
  }

  computeToolTip(): string {
    const layerOptions = this.layer.options;
    if (!layerOptions.tooltip) {
      return this.layer.title;
    }
    const layerToolTip = layerOptions.tooltip;
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
        if (layerToolTip && layerToolTip.text) {
          return layerToolTip.text;
        } else {
          return this.layer.title;
        }
      default:
        return this.layer.title;
    }
  }

  private onResolutionChange(resolution: number) {
    this.inResolutionRange$.next(this.layer.isInResolutionsRange);
  }
}
