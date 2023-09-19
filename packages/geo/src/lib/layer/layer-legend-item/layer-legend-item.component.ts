import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

import { MetadataLayerOptions } from '../../metadata/shared/metadata.interface';
import { Layer, TooltipType } from '../shared/layers';
import { NetworkService, ConnectionState } from '@igo2/core';

@Component({
  selector: 'igo-layer-legend-item',
  templateUrl: './layer-legend-item.component.html',
  styleUrls: ['./layer-legend-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerLegendItemComponent implements OnInit, OnDestroy {
  inResolutionRange$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  tooltipText: string;

  state: ConnectionState;

  private resolution$$: Subscription;
  private network$$: Subscription;

  @Input() layer: Layer;

  @Input() updateLegendOnResolutionChange: boolean = false;

  constructor(private networkService: NetworkService) {}

  ngOnInit() {
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
    this.resolution$$.unsubscribe();
    this.network$$.unsubscribe();
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
    this.inResolutionRange$.next(inResolutionRange);
  }
}
