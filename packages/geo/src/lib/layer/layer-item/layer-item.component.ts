import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';
import { ConnectionState, NetworkService } from '@igo2/core/network';

import { BehaviorSubject, Subscription } from 'rxjs';

import { MetadataLayerOptions } from '../../metadata/shared/metadata.interface';
import { layerIsQueryable } from '../../query/shared/query.utils';
import { LayerLegendComponent } from '../layer-legend/layer-legend.component';
import { AnyLayerOptions } from '../shared';
import { Layer } from '../shared/layers/layer';
import { TooltipType } from '../shared/layers/layer.interface';

@Component({
  selector: 'igo-layer-item',
  templateUrl: './layer-item.component.html',
  styleUrls: ['./layer-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatListModule,
    NgIf,
    MatCheckboxModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    NgClass,
    LayerLegendComponent,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class LayerItemComponent implements OnInit, OnDestroy {
  public focusedCls = 'igo-layer-item-focused';

  @Input()
  get activeLayer() {
    return this._activeLayer;
  }
  set activeLayer(value) {
    if (
      value &&
      this.layer &&
      value.id === this.layer.id &&
      !this.selectionMode
    ) {
      this.layerTool$.next(true);
      this.renderer.addClass(this.elRef.nativeElement, this.focusedCls);
    } else {
      this.renderer.removeClass(this.elRef.nativeElement, this.focusedCls);
    }
  }
  private _activeLayer;

  layerTool$ = new BehaviorSubject<boolean>(false);

  showLegend$ = new BehaviorSubject<boolean>(true);

  inResolutionRange$ = new BehaviorSubject<boolean>(true);

  queryBadgeHidden$ = new BehaviorSubject<boolean>(true);

  tooltipText: string;

  state: ConnectionState;

  @Input()
  get selectAll() {
    return this._selectAll;
  }
  set selectAll(value: boolean) {
    this._selectAll = value;
    if (value === true) {
      this.layerCheck = true;
    }
  }
  private _selectAll = false;

  @Input() layerCheck;

  private resolution$$: Subscription;
  private network$$: Subscription;
  private layers$$: Subscription;

  layers$: BehaviorSubject<Layer> = new BehaviorSubject<Layer>(undefined);

  @Input()
  get layer() {
    return this._layer;
  }
  set layer(value) {
    this._layer = value;
    this.layers$.next(value);
  }
  private _layer;

  @Input() toggleLegendOnVisibilityChange = false;

  @Input() expandLegendIfVisible = false;

  @Input() updateLegendOnResolutionChange = false;

  @Input() orderable = true;

  @Input() lowerDisabled = false;

  @Input() raiseDisabled = false;

  @Input() queryBadge = false;

  @Input() selectionMode;

  @Input() changeDetection;

  @Input() unavailableLayer: AnyLayerOptions;

  get unavailableLayerTitle(): string | undefined {
    if (
      this.unavailableLayer.sourceOptions &&
      'params' in this.unavailableLayer.sourceOptions
    ) {
      return this.unavailableLayer.sourceOptions.params.LAYERS;
    } else if (
      this.unavailableLayer.sourceOptions &&
      'layer' in this.unavailableLayer?.sourceOptions
    ) {
      return this.unavailableLayer.sourceOptions.layer;
    }
  }

  get opacity() {
    return this.layer.opacity * 100;
  }
  set opacity(opacity: number) {
    this.layer.opacity = opacity / 100;
  }

  get eyeTooltip() {
    if (this.inResolutionRange$.getValue() === false) {
      return 'igo.geo.layer.notInResolution';
    } else {
      return this.layer.visible
        ? 'igo.geo.layer.hideLayer'
        : 'igo.geo.layer.showLayer';
    }
  }

  @Output() action: EventEmitter<Layer | AnyLayerOptions> = new EventEmitter<
    Layer | AnyLayerOptions
  >(undefined);
  @Output() checkbox = new EventEmitter<{
    layer: Layer;
    check: boolean;
  }>();

  constructor(
    private networkService: NetworkService,
    private renderer: Renderer2,
    private elRef: ElementRef,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.unavailableLayer) {
      if (
        this.layer.visible &&
        this.expandLegendIfVisible &&
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

      this.layers$$ = this.layers$.subscribe(() => {
        if (this.layer && this.layer.options.active) {
          this.layerTool$.next(true);
          this.renderer.addClass(this.elRef.nativeElement, this.focusedCls);
        }
      });

      if (this.changeDetection) {
        this.changeDetection.subscribe(() => this.cdRef.detectChanges());
      }
    }
  }

  ngOnDestroy() {
    this.resolution$$?.unsubscribe();
    this.network$$?.unsubscribe();
    this.layers$$?.unsubscribe();
  }

  toggleLegend(collapsed: boolean) {
    this.layer.legendCollapsed = collapsed;
    this.showLegend$.next(!collapsed);
  }

  toggleLegendOnClick() {
    this.toggleLegend(this.showLegend$.value);
  }

  toggleVisibility(event: Event) {
    event.stopPropagation();
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

  private onResolutionChange() {
    const inResolutionRange = this.layer.isInResolutionsRange;
    if (
      inResolutionRange === false &&
      this.updateLegendOnResolutionChange === true
    ) {
      this.toggleLegend(true);
    }
    this.inResolutionRange$.next(inResolutionRange);
  }

  private updateQueryBadge() {
    const hidden =
      this.queryBadge === false ||
      this.layer.visible === false ||
      !layerIsQueryable(this.layer);
    this.queryBadgeHidden$.next(hidden);
  }

  toggleLayerTool() {
    this.layerTool$.next(!this.layerTool$.getValue());
    if (this.layerTool$.getValue() === true) {
      this.renderer.addClass(this.elRef.nativeElement, this.focusedCls);
    } else {
      this.renderer.removeClass(this.elRef.nativeElement, this.focusedCls);
    }
    this.action.emit(this.layer);
  }

  public check() {
    this.layerCheck = !this.layerCheck;
    this.checkbox.emit({ layer: this.layer, check: this.layerCheck });
  }

  deleteUnavailableLayer(anyLayerOptions: AnyLayerOptions) {
    this.action.emit(anyLayerOptions);
  }
}
