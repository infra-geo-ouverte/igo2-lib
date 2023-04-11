import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
} from '@angular/core';

import { getEntityTitle, getEntityIcon } from '@igo2/common';

import { addedChangeEmitter, CatalogItemLayer } from '../shared';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LayerService } from '../../layer/shared/layer.service';
import { first } from 'rxjs/operators';
import { Layer, TooltipType } from '../../layer/shared/layers';
import { MetadataLayerOptions } from '../../metadata/shared/metadata.interface';
import { IgoMap } from '../../map';

/**
 * Catalog browser layer item
 */
@Component({
  selector: 'igo-catalog-browser-layer',
  templateUrl: './catalog-browser-layer.component.html',
  styleUrls: ['./catalog-browser-layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogBrowserLayerComponent implements OnInit, OnDestroy {
  public inRange$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public isPreview$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isVisible$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isPreview$$: Subscription;
  private resolution$$: Subscription;
  private layers$$: Subscription;
  private lastTimeoutRequest;

  public layerLegendShown$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public igoLayer$ = new BehaviorSubject<Layer>(undefined);

  private mouseInsideAdd: boolean = false;

  @Input() resolution: number;

  @Input() catalogAllowLegend = false;

  /**
   * Catalog layer
   */
  @Input() layer: CatalogItemLayer;

  @Input() map: IgoMap;

  /**
   * Whether the layer is already added to the map
   */
  @Input() added = false;

  /**
   * Event emitted when the add/remove button is clicked
   */
  @Output() addedChange = new EventEmitter<addedChangeEmitter>();

  @Output() addedLayerIsPreview = new EventEmitter<boolean>();

  /**
   * @internal
   */
  get title(): string {
    return getEntityTitle(this.layer);
  }

  /**
   * @internal
   */
  get icon(): string {
    return getEntityIcon(this.layer) || 'layers';
  }

  constructor(private layerService: LayerService ) {}

  ngOnInit(): void {
    this.isPreview$$ = this.isPreview$.subscribe(value => this.addedLayerIsPreview.emit(value));

    this.layers$$ = this.map.layers$.subscribe(() => {
      this.isVisible();
    });

    this.resolution$$ = this.map.viewController.resolution$.subscribe((resolution) => {
      this.isInResolutionsRange(resolution);
      this.isVisible();
    });
  }

  ngOnDestroy() {
    this.isPreview$$.unsubscribe();
    this.resolution$$.unsubscribe();
    this.layers$$.unsubscribe();
  }

  computeTitleTooltip(): string {
      const layerOptions = this.layer.options;
      if (!layerOptions.tooltip) {
        return getEntityTitle(this.layer);
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

  /**
   * On mouse event, mouseenter /mouseleave
   * @internal
   */
  onMouseEvent(event) {
    this.onToggleClick(event);
  }

  askForLegend(event) {
    this.layerLegendShown$.next(!this.layerLegendShown$.value);
    this.layerService.createAsyncLayer(this.layer.options).pipe(first())
    .subscribe(layer => this.igoLayer$.next(layer));
  }

  /**
   * On toggle button click, emit the added change event
   * @internal
   */
  onToggleClick(event) {
    if (typeof this.lastTimeoutRequest !== 'undefined') {
      clearTimeout(this.lastTimeoutRequest);
    }
    if (event.type === 'mouseenter' && this.mouseInsideAdd ) {
      return;
    }
    switch (event.type) {
      case 'click':
        if (!this.isPreview$.value) {
          if (this.added) {
            this.remove(event);
          } else {
            this.add(event);
          }
        }
        this.isPreview$.next(false);
        break;
      case 'mouseenter':
        if (!this.isPreview$.value && !this.added) {
          this.lastTimeoutRequest = setTimeout(() => {
            this.add(event);
            this.isPreview$.next(true);
          }, 500);
        }
        this.mouseInsideAdd = true;
        break;
      case 'mouseleave':
        if (this.isPreview$.value) {
          this.remove(event);
          this.isPreview$.next(false);
        }
        this.mouseInsideAdd = false;
        break;
      default:
        break;
    }
  }

  /**
   * Emit added change event with added = true
   */
  private add(event: Event) {
    if (!this.added) {
      this.added = true;
      this.addedChange.emit({ added: true, layer: this.layer, event: event });
    }
  }

  /**
   * Emit added change event with added = false
   */
  private remove(event: Event) {
    if (this.added) {
      this.added = false;
      this.addedChange.emit({ added: false, layer: this.layer, event: event });
    }
  }

  haveGroup(): boolean {
    return !(!this.layer.address || this.layer.address.split('.').length === 1);
  }

  isInResolutionsRange(resolution: number) {
    const minResolution = (!this.layer.options.minResolution || Number.isNaN(this.layer.options.minResolution))
      ? 0 : this.layer.options.minResolution;
    const maxResolution = (!this.layer.options.maxResolution || Number.isNaN(this.layer.options.maxResolution))
    ? Infinity : this.layer.options.maxResolution;
    this.inRange$.next(
      resolution >= minResolution && resolution <= maxResolution
    );
  }

  isVisible() {
    if (this.layer?.id) {
      const oLayer = this.map.getLayerById(this.layer?.id);
      oLayer ? this.isVisible$.next(oLayer.visible) : this.isVisible$.next(false);
    }
  }

  getBadgeIcon() {
    if (this.inRange$.getValue()) {
      return this.isVisible$.getValue() ? '' : 'eye-off';
    } else {
      return 'eye-off';
    }
  }

  computeTooltip(): string {
    if (this.added) {
      if (this.isPreview$.value) {
        return 'igo.geo.catalog.layer.addToMap';
      } else if (this.inRange$.value) {
        return this.isVisible$.value
        ? 'igo.geo.catalog.layer.removeFromMap'
        : 'igo.geo.catalog.layer.removeFromMapNotVisible';
      } else {
        return 'igo.geo.catalog.layer.removeFromMapOutRange';
      }
    } else {
      return this.inRange$.value
        ? 'igo.geo.catalog.layer.addToMap'
        : 'igo.geo.catalog.layer.addToMapOutRange';
    }
  }
}
