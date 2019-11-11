import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';

import { SearchResult } from '../shared/search.interfaces';
import { IgoMap } from '../../map/shared/map';
import { LayerOptions } from '../../layer/shared/layers/layer.interface';
import { LayerService } from '../../layer/shared/layer.service';
import { LAYER } from '../../layer/shared/layer.enums';
import { Subscription, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'igo-search-add-button',
  templateUrl: './search-results-add-button.component.html',
  styleUrls: ['./search-results-add-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultAddButtonComponent implements OnInit, OnDestroy {

  public tooltip$: BehaviorSubject<string> = new BehaviorSubject('igo.geo.catalog.layer.addToMap');

  private resolution$$: Subscription;

  public inRange$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  public isPreview$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Input() layer: SearchResult;

  /**
   * Whether the layer is already added to the map
   */
  @Input() added: boolean;

  /**
   * The map to add the search result layer to
   */
  @Input() map: IgoMap;

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color = 'primary';

  constructor(private layerService: LayerService) {}

  /**
   * @internal
   */
  ngOnInit(): void {
    if (this.layer.meta.dataType === 'Layer') {
      this.added = this.map.layers.findIndex((lay) => lay.id === this.layer.data.sourceOptions.id) !== -1;
    }
    this.resolution$$ = this.map.viewController.resolution$.subscribe((value) => {
      this.isInResolutionsRange(value);
      this.tooltip$.next(this.computeTooltip());
    });
  }

  ngOnDestroy() {
    this.resolution$$.unsubscribe();
  }

  /**
   * On mouse event, mouseenter /mouseleave
   * @internal
   */
  onMouseEvent(event) {
    this.onToggleClick(event);
  }

  /**
   * On toggle button click, emit the added change event
   * @internal
   */
  onToggleClick(event) {
    switch (event.type) {
        case 'click':
            if (!this.isPreview$.value) {
                this.remove();
            }
            this.isPreview$.next(!this.isPreview$.value);
            break;
        case 'mouseenter':
            if (!this.isPreview$.value && !this.added) {
                this.add();
                this.isPreview$.next(true);
            }
            break;
        case 'mouseleave':
            if (this.isPreview$.value) {
                this.remove();
                this.isPreview$.next(false);
            }
            break;
        default:
            break;
    }
  }

  private add() {
    this.added = true;
    this.addLayerToMap();
  }

  private remove() {
    this.added = false;
    this.removeLayerFromMap();
  }

  /**
   * Emit added change event with added = true
   */
  private addLayerToMap() {
    if (this.map === undefined) {
      return;
    }

    if (this.layer.meta.dataType !== LAYER) {
      return undefined;
    }

    const layerOptions = (this.layer as SearchResult<LayerOptions>).data;
    this.layerService
      .createAsyncLayer(layerOptions)
      .subscribe(layer => this.map.addLayer(layer));
  }

  /**
   * Emit added change event with added = false
   */
  private removeLayerFromMap() {
    if (this.map === undefined) {
      return;
    }

    if (this.layer.meta.dataType !== LAYER) {
      return undefined;
    }

    const oLayer = this.map.getLayerById(this.layer.data.sourceOptions.id);
    this.map.removeLayer(oLayer);
  }

  isInResolutionsRange(resolution: number) {
    const minResolution = this.layer.data.minResolution;
    const maxResolution = this.layer.data.maxResolution;
    this.inRange$.next(resolution >= minResolution && resolution <= maxResolution);
  }

  computeTooltip(): string {
    if (this.added) {
      return this.inRange$.value ? 'igo.geo.catalog.layer.removeFromMap' : 'igo.geo.catalog.layer.removeFromMapOutRange';
    } else {
      return this.inRange$.value ? 'igo.geo.catalog.layer.addToMap' : 'igo.geo.catalog.layer.addToMapOutRange';
    }
  }
}
